import mongoose from "mongoose";
import "dotenv/config";
import Driver from "../models/Driver.model.js";
import Customer from "../models/Customer.model.js";

const fixIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        // 1. Fix Driver Indexes
        const driverIndexes = await Driver.collection.indexes();
        console.log("Current Driver Indexes:", driverIndexes);

        // Look for the old unique index on contactNo (usually named contactNo_1)
        const oldDriverIndex = driverIndexes.find(idx => idx.key.contactNo === 1 && idx.unique === true && !idx.key.userId);

        if (oldDriverIndex) {
            console.log(`Dropping old Driver index: ${oldDriverIndex.name}`);
            await Driver.collection.dropIndex(oldDriverIndex.name);
            console.log("Dropped!");
        } else {
            console.log("No conflict found for Drivers.");
        }

        // 2. Fix Customer Indexes
        const customerIndexes = await Customer.collection.indexes();
        console.log("Current Customer Indexes:", customerIndexes);

        const oldCustomerIndex = customerIndexes.find(idx => idx.key.contactNo === 1 && idx.unique === true && !idx.key.userId);

        if (oldCustomerIndex) {
            console.log(`Dropping old Customer index: ${oldCustomerIndex.name}`);
            await Customer.collection.dropIndex(oldCustomerIndex.name);
            console.log("Dropped!");
        } else {
            console.log("No conflict found for Customers.");
        }

        // 3. Ensure new indexes are created
        await Driver.syncIndexes();
        await Customer.syncIndexes();
        console.log("Synced new indexes.");

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

fixIndexes();
