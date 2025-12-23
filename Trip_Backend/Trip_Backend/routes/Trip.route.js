import express from "express";
import {
  createTrip,
  getTrips,
  completeTrip,
  reopenTrip,
  updatePayment,
  updateTrip,
  getTripStats,
  getDuplicateTrips,
  getPeopleStats,
  deleteTrip
} from "../controllers/Trip.controller.js";

const router = express.Router();

/* Create new trip (from full form data) */
router.post("/", createTrip);

/* 📊 STATS & REPORTS */
router.get("/stats", getTripStats);
router.get("/duplicates", getDuplicateTrips);
router.get("/people", getPeopleStats);

/* Get trips
   - ALL       → GET /api/trips
   - ONGOING   → GET /api/trips?status=ongoing
   - DONE      → GET /api/trips?status=done
*/
router.get("/", getTrips);

/* Mark trip as DONE */
router.patch("/:id/complete", completeTrip);

/* Reopen trip */
router.patch("/:id/reopen", reopenTrip);

/* Update payment status */
router.patch("/:id/payment", updatePayment);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);


export default router;
