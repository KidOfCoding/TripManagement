import Trip from "../models/Trip.model.js";
import Customer from "../models/Customer.model.js";
import Driver from "../models/Driver.model.js";

/* Helper to get User Filter */
const getUserFilter = (req) => {
  const { userId } = req.auth || {};
  if (!userId) throw new Error("Unauthorized");
  return { userId };
};

/* CREATE TRIP (FROM FULL FORM DATA) */
export const createTrip = async (req, res) => {
  try {
    const { driver, customer, trip } = req.body;
    const { userId } = req.auth;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    /* 1️⃣ FIND OR CREATE DRIVER (Scoped to User) */
    let driverDoc = await Driver.findOne({ contactNo: driver.contactNo, userId });
    if (!driverDoc) {
      driverDoc = await Driver.create({
        name: driver.name,
        contactNo: driver.contactNo,
        userId
      });
    }

    /* 2️⃣ FIND OR CREATE CUSTOMER (Scoped to User) */
    let customerDoc = await Customer.findOne({ contactNo: customer.contactNo, userId });
    if (!customerDoc) {
      customerDoc = await Customer.create({
        name: customer.name,
        contactNo: customer.contactNo,
        address: customer.address,
        userId
      });
    }

    /* 3️⃣ CHECK EXISTING ONGOING TRIP */
    const existingTrip = await Trip.findOne({
      customerId: customerDoc._id,
      "route.source": trip.source,
      "route.destination": trip.destination,
      "status.tripStatus": "ongoing",
      userId
    });

    if (existingTrip) {
      return res.json({
        success: true,
        message: "Existing trip reused",
        trip: existingTrip
      });
    }

    /* 4️⃣ CREATE NEW TRIP */
    const newTrip = await Trip.create({
      driverId: driverDoc._id,
      customerId: customerDoc._id,
      userId,
      route: {
        source: trip.source,
        destination: trip.destination
      },
      car: trip.car,
      amounts: {
        customerPaid: customer.moneyIn,
        driverPaid: driver.moneyOut
      },
      status: { tripStatus: trip.status || "ongoing" },
      profit: customer.moneyIn - driver.moneyOut
    });

    res.status(201).json({
      success: true,
      message: "Trip created successfully",
      trip: newTrip
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET TRIPS (ALL | ONGOING | DONE) */
export const getTrips = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = getUserFilter(req);

    if (status && ["ongoing", "done"].includes(status)) {
      filter["status.tripStatus"] = status;
    }

    const trips = await Trip.find(filter)
      .populate("driverId", "name contactNo")
      .populate("customerId", "name contactNo address")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: trips.length,
      trips
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const completeTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = { _id: id, ...getUserFilter(req) };

    const trip = await Trip.findOneAndUpdate(
      filter,
      { "status.tripStatus": "done" },
      { new: true }
    )
      .populate("driverId", "name contactNo")
      .populate("customerId", "name contactNo address");

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    res.json({ success: true, message: "Trip completed", trip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const reopenTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = { _id: id, ...getUserFilter(req) };

    const trip = await Trip.findOneAndUpdate(
      filter,
      { "status.tripStatus": "ongoing" },
      { new: true }
    )
      .populate("driverId", "name contactNo")
      .populate("customerId", "name contactNo address");

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    res.json({ success: true, message: "Trip reopened", trip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerPaid, driverPaid } = req.body;
    const filter = { _id: id, ...getUserFilter(req) };

    const updateData = {};
    if (typeof customerPaid === "boolean") updateData["status.customerPaid"] = customerPaid;
    if (typeof driverPaid === "boolean") updateData["status.driverPaid"] = driverPaid;

    const trip = await Trip.findOneAndUpdate(filter, { $set: updateData }, { new: true })
      .populate("driverId", "name contactNo")
      .populate("customerId", "name contactNo address");

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    res.json({ success: true, message: "Payment updated", trip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { driver, customer, trip } = req.body;
    const { userId } = req.auth; // bypass not supported for edit logic yet to keep strict

    // Ensure trip exists and belongs to user
    const existingTrip = await Trip.findOne({ _id: id, userId });
    if (!existingTrip) return res.status(404).json({ message: "Trip not found" });

    // Update Driver (find by ID or contact)
    const driverDoc = await Driver.findOneAndUpdate(
      { contactNo: driver.contactNo, userId },
      { name: driver.name },
      { new: true, upsert: true } // Upsert just in case
    );

    // Update Customer
    const customerDoc = await Customer.findOneAndUpdate(
      { contactNo: customer.contactNo, userId },
      { name: customer.name, address: customer.address },
      { new: true, upsert: true }
    );

    const updatedTrip = await Trip.findByIdAndUpdate(
      id,
      {
        driverId: driverDoc._id,
        customerId: customerDoc._id,
        "route.source": trip.source,
        "route.destination": trip.destination,
        car: trip.car,
        amounts: {
          customerPaid: customer.moneyIn,
          driverPaid: driver.moneyOut
        },
        profit: customer.moneyIn - driver.moneyOut
      },
      { new: true }
    )
      .populate("driverId", "name contactNo")
      .populate("customerId", "name contactNo address");

    res.json({ success: true, message: "Trip updated", trip: updatedTrip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = { _id: id, ...getUserFilter(req) };
    const trip = await Trip.findOneAndDelete(filter);

    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json({ success: true, message: "Trip deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* 📊 GET STATS */
export const getTripStats = async (req, res) => {
  try {
    const userFilter = getUserFilter(req);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const getAggregation = (startDate) => [
      { $match: { ...userFilter, createdAt: { $gte: startDate }, "status.tripStatus": "done" } },
      {
        $group: {
          _id: null,
          totalProfit: { $sum: "$profit" },
          totalDriverPay: { $sum: "$amounts.driverPaid" },
          totalCustomerPay: { $sum: "$amounts.customerPaid" },
          count: { $sum: 1 }
        }
      }
    ];

    const [daily, weekly, monthly] = await Promise.all([
      Trip.aggregate(getAggregation(today)),
      Trip.aggregate(getAggregation(startOfWeek)),
      Trip.aggregate(getAggregation(startOfMonth))
    ]);

    res.json({
      success: true,
      stats: {
        today: daily[0] || { totalProfit: 0, totalDriverPay: 0, totalCustomerPay: 0, count: 0 },
        week: weekly[0] || { totalProfit: 0, totalDriverPay: 0, totalCustomerPay: 0, count: 0 },
        month: monthly[0] || { totalProfit: 0, totalDriverPay: 0, totalCustomerPay: 0, count: 0 }
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* 🕵️ DUPLICATES */
export const getDuplicateTrips = async (req, res) => {
  try {
    const userFilter = getUserFilter(req);
    const duplicates = await Trip.aggregate([
      { $match: userFilter }, // Filter first
      {
        $group: {
          _id: {
            source: "$route.source",
            destination: "$route.destination",
            customerId: "$customerId",
            amount: "$amounts.customerPaid"
          },
          trips: { $push: "$$ROOT" },
          count: { $sum: 1 }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]);

    const populatedDuplicates = await Trip.populate(duplicates, [
      { path: "trips.driverId", select: "name" },
      { path: "trips.customerId", select: "name" }
    ]);

    res.json({ success: true, duplicates: populatedDuplicates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* 👥 PEOPLE STATS */
export const getPeopleStats = async (req, res) => {
  try {
    const userFilter = getUserFilter(req); // { userId: "..." } or {}

    // Drivers
    const drivers = await Driver.aggregate([
      { $match: userFilter },
      {
        $lookup: {
          from: "trips",
          let: { driverId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$driverId", "$$driverId"] }
                // implicitly trips should also match userId if strict, but driver match implies it mostly. 
                // Better to be safe? 
              }
            }
          ],
          as: "trips"
        }
      },
      {
        $project: {
          name: 1, contactNo: 1,
          totalTrips: { $size: "$trips" },
          totalEarned: { $sum: "$trips.amounts.driverPaid" }
        }
      },
      { $sort: { totalEarned: -1 } }
    ]);

    // Customers
    const customers = await Customer.aggregate([
      { $match: userFilter },
      {
        $lookup: {
          from: "trips",
          localField: "_id",
          foreignField: "customerId",
          as: "trips"
        }
      },
      {
        $project: {
          name: 1, contactNo: 1, address: 1,
          totalTrips: { $size: "$trips" },
          totalSpent: { $sum: "$trips.amounts.customerPaid" }
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    res.json({ success: true, drivers, customers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* 📋 TRIP REPORT */
export const getTripReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = getUserFilter(req);

    let queryStart = new Date(); queryStart.setHours(0, 0, 0, 0);
    let queryEnd = new Date(); queryEnd.setHours(23, 59, 59, 999);

    if (startDate) { queryStart = new Date(startDate); queryStart.setHours(0, 0, 0, 0); }
    if (endDate) { queryEnd = new Date(endDate); queryEnd.setHours(23, 59, 59, 999); }
    else if (startDate) { queryEnd = new Date(startDate); queryEnd.setHours(23, 59, 59, 999); }

    filter.createdAt = { $gte: queryStart, $lte: queryEnd };
    filter["status.tripStatus"] = "done";

    const trips = await Trip.find(filter)
      .populate("driverId", "name")
      .populate("customerId", "name")
      .sort({ createdAt: -1 });

    const totals = trips.reduce((acc, trip) => {
      acc.totalDeals += trip.amounts.customerPaid || 0;
      acc.totalCost += trip.amounts.driverPaid || 0;
      acc.netProfit += trip.profit || 0;
      return acc;
    }, { totalDeals: 0, totalCost: 0, netProfit: 0 });

    res.json({ success: true, trips, totals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};