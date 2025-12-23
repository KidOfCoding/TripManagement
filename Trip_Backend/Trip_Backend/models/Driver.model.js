import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    contactNo: {
      type: String,
      required: true
    },

    userId: {
      type: String,
      required: true,
      index: true
    },

    vehicleNo: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// Ensure contactNo is unique per user
driverSchema.index({ contactNo: 1, userId: 1 }, { unique: true });

export default mongoose.model("Driver", driverSchema);
