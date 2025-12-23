import Trip from "../models/Trip.model.js";
import Customer from "../models/Customer.model.js";
import Driver from "../models/Driver.model.js";

/* CREATE TRIP (FROM FULL FORM DATA) */
export const createTrip = async (req, res) => {
  try {
    const {
      driver,
      customer,
      trip
    } = req.body;

    /* 1️⃣ FIND OR CREATE DRIVER */
    let driverDoc = await Driver.findOne({ contactNo: driver.contactNo });

    if (!driverDoc) {
      driverDoc = await Driver.create({
        name: driver.name,
        contactNo: driver.contactNo
      });
    }
    console.log("Driver", driverDoc);

    /* 2️⃣ FIND OR CREATE CUSTOMER */
    let customerDoc = await Customer.findOne({ contactNo: customer.contactNo });
    if (!customerDoc) {
      customerDoc = await Customer.create({
        name: customer.name,
        contactNo: customer.contactNo,
        address: customer.address
      });
    }
    console.log("Customer", customerDoc);

    /* 3️⃣ CHECK EXISTING ONGOING TRIP */
    const existingTrip = await Trip.findOne({
      customerId: customerDoc._id,
      "route.source": trip.source,
      "route.destination": trip.destination,
      "status.tripStatus": "ongoing"
    });

    if (existingTrip) {
      return res.json({
        success: true,
        message: "Existing trip reused",
        trip: existingTrip
      });
    }
    console.log("Existing:", existingTrip);

    /* 4️⃣ CREATE NEW TRIP */
    const newTrip = await Trip.create({
      driverId: driverDoc._id,
      customerId: customerDoc._id,

      route: {
        source: trip.source,
        destination: trip.destination
      },

      car: trip.car,

      amounts: {
        customerPaid: customer.moneyIn,
        driverPaid: driver.moneyOut
      },

      status: {
        tripStatus: trip.status || "ongoing"
      },
      profit: customer.moneyIn - driver.moneyOut
    });
    console.log("NewOne", newTrip);

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

    const filter = {};

    // Apply status filter only if provided
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

    const trip = await Trip.findByIdAndUpdate(
      id,
      {
        "status.tripStatus": "done"
      },
      { new: true }
    )
      .populate("driverId", "name contactNo")
      .populate("customerId", "name contactNo address");

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json({
      success: true,
      message: "Trip marked as completed",
      trip
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const reopenTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findByIdAndUpdate(
      id,
      {
        "status.tripStatus": "ongoing"
      },
      { new: true }
    )
      .populate("driverId", "name contactNo")
      .populate("customerId", "name contactNo address");

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json({
      success: true,
      message: "Trip reopened successfully",
      trip
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerPaid, driverPaid } = req.body;

    const updateData = {};

    if (typeof customerPaid === "boolean") {
      updateData["status.customerPaid"] = customerPaid;
    }

    if (typeof driverPaid === "boolean") {
      updateData["status.driverPaid"] = driverPaid;
    }

    const trip = await Trip.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )
      .populate("driverId", "name contactNo")
      .populate("customerId", "name contactNo address");

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json({
      success: true,
      message: "Payment status updated",
      trip
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { driver, customer, trip } = req.body;

    // update driver
    const driverDoc = await Driver.findOneAndUpdate(
      { contactNo: driver.contactNo },
      { name: driver.name },
      { new: true }
    );

    // update customer
    const customerDoc = await Customer.findOneAndUpdate(
      { contactNo: customer.contactNo },
      { name: customer.name, address: customer.address },
      { new: true }
    );

    const updatedTrip = await Trip.findByIdAndUpdate(
      id,
      {
        driverId: driverDoc._id,
        customerId: customerDoc._id,
        route: {
          source: trip.source,
          destination: trip.destination
        },
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

    res.json({
      success: true,
      message: "Trip updated successfully",
      trip: updatedTrip
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* 🗑️ DELETE TRIP */
export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    await Trip.findByIdAndDelete(id);
    res.json({ success: true, message: "Trip deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* 📊 GET STATS (TODAY, WEEK, MONTH) */
export const getTripStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const getAggregation = (startDate) => [
      { $match: { createdAt: { $gte: startDate }, "status.tripStatus": "done" } },
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

/* 🕵️ GET DUPLICATE TRIPS */
export const getDuplicateTrips = async (req, res) => {
  try {
    const duplicates = await Trip.aggregate([
      {
        $group: {
          _id: {
            source: "$route.source",
            destination: "$route.destination",
            customerId: "$customerId",
            amount: "$amounts.customerPaid"
            // We group by these fields to find potential duplicates
          },
          trips: { $push: "$$ROOT" },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 } // Only return groups with more than 1 trip
        }
      }
    ]);

    // Populate driver and customer details for easier reading
    const populatedDuplicates = await Trip.populate(duplicates, [
      { path: "trips.driverId", select: "name" },
      { path: "trips.customerId", select: "name" }
    ]);

    res.json({
      success: true,
      duplicates: populatedDuplicates
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* 👥 GET PEOPLE DIRECTORY (Drivers & Customers with Stats) */
export const getPeopleStats = async (req, res) => {
  try {
    const drivers = await Driver.aggregate([
      {
        $lookup: {
          from: "trips",
          localField: "_id",
          foreignField: "driverId",
          as: "trips"
        }
      },
      {
        $project: {
          name: 1,
          contactNo: 1,
          totalTrips: { $size: "$trips" },
          totalEarned: { $sum: "$trips.amounts.driverPaid" }
        }
      },
      { $sort: { totalEarned: -1 } }
    ]);

    const customers = await Customer.aggregate([
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
          name: 1,
          contactNo: 1,
          address: 1,
          totalTrips: { $size: "$trips" },
          totalSpent: { $sum: "$trips.amounts.customerPaid" }
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    res.json({
      success: true,
      drivers,
      customers
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* 📋 GET DETAILED TRIP REPORT */
export const getTripReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to today if no dates provided
    let queryStart = new Date();
    queryStart.setHours(0, 0, 0, 0);

    let queryEnd = new Date();
    queryEnd.setHours(23, 59, 59, 999);

    if (startDate) {
      queryStart = new Date(startDate);
      queryStart.setHours(0, 0, 0, 0);
    }

    if (endDate) {
      queryEnd = new Date(endDate);
      queryEnd.setHours(23, 59, 59, 999);
    } else if (startDate) {
      // If only start date is provided, default end date to end of that day
      queryEnd = new Date(startDate);
      queryEnd.setHours(23, 59, 59, 999);
    }

    const trips = await Trip.find({
      createdAt: { $gte: queryStart, $lte: queryEnd },
      "status.tripStatus": "done" // Only completed trips for reports? Or all? User likely wants accounting so 'done' makes sense, but let's include all for now or filters.
      // User request: "track expenses" -> usually implies actual money flow, so 'done' is safer, but let's stick to 'done' for accuracy or maybe all but show status.
      // Let's filter for DONE trips for financial reports to be accurate.
    })
      .populate("driverId", "name")
      .populate("customerId", "name")
      .sort({ createdAt: -1 });

    // Calculate totals
    const totals = trips.reduce((acc, trip) => {
      acc.totalDeals += trip.amounts.customerPaid || 0;
      acc.totalCost += trip.amounts.driverPaid || 0;
      acc.netProfit += trip.profit || 0;
      return acc;
    }, { totalDeals: 0, totalCost: 0, netProfit: 0 });

    res.json({
      success: true,
      trips,
      totals
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};