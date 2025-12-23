import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import "dotenv/config";

// 🔹 IMPORT ROUTES

import tripRoutes from "./routes/Trip.route.js";

// app configurations
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(express.json()); // parse JSON
app.use(
  cors({
    origin: "*"
  })
);

// DB Connection
connectDB();

// health check
app.get("/", (req, res) => {
  res.send("API Working");
});

// 🔥 API ROUTES

app.use("/api/trips", tripRoutes);

// server start
app.listen(port, () => {
  console.log(`Server Running on http://localhost:${port}`);
});

export default app;
