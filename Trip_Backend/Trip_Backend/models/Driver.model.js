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
      required: true,
      unique: true
    },

    vehicleNo: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Driver", driverSchema);
