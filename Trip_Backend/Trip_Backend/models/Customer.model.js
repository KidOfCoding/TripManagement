import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
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

    address: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
