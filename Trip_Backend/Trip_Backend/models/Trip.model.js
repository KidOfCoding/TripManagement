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

    route: {
      source: { type: String, required: true },
      destination: { type: String, required: true }
    },

    car: {
      type: String
    },

    amounts: {
      customerPaid: { type: Number, required: true },
      driverPaid: { type: Number, required: true }
    },

    profit: Number,

    status: {
      tripStatus: {
        type: String,
        enum: ["ongoing", "done"],
        default: "ongoing"
      },
      customerPaid: { type: Boolean, default: false },
      driverPaid: { type: Boolean, default: false },
      profit: {
        type: Number,
        require: true
      }
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
