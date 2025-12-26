import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true
    },

    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
      index: true
    },

    userId: {
      type: String, // Clerk User ID
      required: true,
      index: true
    },

    tripNo: { type: Number, required: true }, // Auto-increment (Scoped to user)

    serviceType: {
      type: String,
      enum: ["cab_with_driver", "driver_only"],
      default: "cab_with_driver"
    },

    tripType: {
      type: String,
      enum: ["single", "multi"],
      default: "single"
    },

    route: {
      source: { type: String, required: true },
      destination: { type: String, required: true },
      fromAddress: String,
      toAddress: String,
      // Enhanced for Multi-Destination with Expenses
      stops: [{
        location: String,
        expenses: [{
          type: String, // Toll, Parking, Food
          amount: Number
        }]
      }]
    },

    distanceKM: Number,

    car: { type: String },

    /* Financials */
    amounts: {
      customerPaid: { type: Number, required: true }, // Total Deal Value
      driverPaid: { type: Number, required: true }    // Total Driver Cost
    },

    advancePayment: {
      amount: { type: Number, default: 0 },
      voucherNo: String,
      date: Date,
      mode: { type: String, enum: ["cash", "online", "check"] }
    },

    /* Journey Details */
    intermediateStays: [{
      location: String,
      durationMin: Number
    }],

    /* Global Trip Expenses (if any not tied to specific stops) */
    closingExpenses: [{
      expenseType: { type: String, default: "Fuel" },
      amount: { type: Number, default: 0 }
    }],

    /* Final Payment (Settlement) */
    paymentDetails: {
      mode: { type: String, enum: ["cash", "online", "check"] },
      voucherNo: String,
      amount: Number, // Final amount collected/paid
      notes: String
    },

    profit: Number,

    status: {
      tripStatus: {
        type: String,
        enum: ["ongoing", "done"],
        default: "ongoing"
      },
      customerPaid: { type: Boolean, default: false },
      driverPaid: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

/* Auto profit calculation */
// tripSchema.pre("save", function (next) {
//   this.profit = this.amounts.customerPaid - this.amounts.driverPaid;
//   next();
// });

export default mongoose.model("Trip", tripSchema);
