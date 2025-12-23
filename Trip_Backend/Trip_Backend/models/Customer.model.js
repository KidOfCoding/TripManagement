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
      required: true
    },

    userId: {
      type: String,
      required: true,
      index: true
    },

    address: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// Ensure contactNo is unique per user
customerSchema.index({ contactNo: 1, userId: 1 }, { unique: true });

export default mongoose.model("Customer", customerSchema);
