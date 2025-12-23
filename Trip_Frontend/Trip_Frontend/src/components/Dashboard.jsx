import { useEffect, useState } from "react";
import api from "../api/axios";
import TripCard from "./TripCard";
import AddTripModal from "./AddTripModal";
import EditTripModal from "./EditTripModal";
import StatsModal from "./StatsModal";
import PeopleDirectory from "./PeopleDirectory";
import DuplicateTripsModal from "./DuplicateTripsModal";
import ThemeToggle from "./ThemeToggle";

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export default function Dashboard({ user }) {
  const [trips, setTrips] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editTrip, setEditTrip] = useState(null);

  const [showStats, setShowStats] = useState(false);
  const [showPeople, setShowPeople] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);

  const fetchTrips = async () => {
    const url = filter === "all" ? "/trips" : `/trips?status=${filter}`;
    const res = await api.get(url);

    // Sort: Ongoing first, then by date (newer first) which is default from backend
    const sortedTrips = res.data.trips.sort((a, b) => {
      if (a.status.tripStatus === "ongoing" && b.status.tripStatus !== "ongoing") return -1;
      if (a.status.tripStatus !== "ongoing" && b.status.tripStatus === "ongoing") return 1;
      return 0; // keep original date sort order
    });

    setTrips(sortedTrips);
  };

  useEffect(() => {
    fetchTrips();
  }, [filter]);

  // 🔥 ADD NEW TRIP
  const handleAddTrip = () => {
    setEditTrip(null);
    setShowModal(true);
  };

  // 🔥 EDIT TRIP
  const handleEditTrip = (trip) => {
    setEditTrip(trip);
  };

  // 🔥 CLOSE MODAL
  const closeModal = () => {
    setShowModal(false);
    setEditTrip(null);
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              DriveSync
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trip Manager</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold border border-white dark:border-slate-700 shadow-sm ring-2 ring-blue-50 dark:ring-slate-800">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-6">

        {/* ADMIN TOOLS */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button onClick={() => setShowStats(true)} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all text-center h-full justify-center">
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">Track Expenses</span>
          </button>

          <button onClick={() => setShowPeople(true)} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all text-center h-full justify-center">
            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">Customers & Drivers</span>
          </button>

          <button onClick={() => setShowDuplicates(true)} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all text-center h-full justify-center">
            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">Repeating Trips</span>
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {["all", "ongoing", "done"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === s
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* TRIP LIST */}
        <div className="space-y-5 mt-2">
          {trips.length === 0 ? (
            <div className="text-center py-20 opacity-50 flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-4xl">
                🛣️
              </div>
              <p className="text-lg font-medium text-slate-600">No trips found here</p>
              <p className="text-sm text-slate-400 mb-6">Add a new trip to get started</p>
              <button
                onClick={handleAddTrip}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
              >
                Create First Trip
              </button>
            </div>
          ) : (
            trips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                refresh={fetchTrips}
                onEdit={handleEditTrip}
              />
            ))
          )}
        </div>
      </div>

      {/* FAB (Floating Action Button) - EXTENDED FOR CLARITY */}
      <button
        onClick={handleAddTrip}
        className="fixed bottom-6 right-6 bg-slate-900 dark:bg-blue-600 text-white px-6 py-4 rounded-full shadow-xl shadow-slate-900/30 dark:shadow-blue-900/30 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all z-20"
      >
        <PlusIcon />
        <span className="font-bold text-lg">New Trip</span>
      </button>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <AddTripModal
          onClose={closeModal}
          refresh={fetchTrips}
        />
      )}
      {editTrip && (
        <EditTripModal
          trip={editTrip}
          onClose={closeModal}
          refresh={fetchTrips}
        />
      )}

      {/* NEW MODALS */}
      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
      {showPeople && <PeopleDirectory onClose={() => setShowPeople(false)} />}
      {showDuplicates && <DuplicateTripsModal onClose={() => setShowDuplicates(false)} />}
    </div>
  );
}
