import { useEffect, useState } from "react";
import api from "../api/axios";

export default function DuplicateTripsModal({ onClose }) {
    const [duplicates, setDuplicates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDuplicates();
    }, []);

    const fetchDuplicates = async () => {
        try {
            const res = await api.get("/trips/duplicates");
            setDuplicates(res.data.duplicates);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const resolveDuplicate = async (tripId) => {
        if (!confirm("Are you sure you want to delete this specific trip record?")) return;

        try {
            await api.delete(`/trips/${tripId}`);

            // Update local state by removing the deleted trip
            const updatedDuplicates = duplicates.map(group => ({
                ...group,
                trips: group.trips.filter(t => t._id !== tripId)
            })).filter(group => group.trips.length > 1); // Only keep groups that still have duplicates (more than 1 trip)

            setDuplicates(updatedDuplicates);
            alert("Trip deleted successfully");
        } catch (err) {
            console.error(err);
            alert("Failed to delete trip");
        }
    };

    if (loading) return <div className="fixed inset-0 bg-white/60 flex items-center justify-center z-50">Loading...</div>;

    return (
        <div className="fixed inset-0 bg-white/60 dark:bg-slate-900/80 backdrop-blur-sm z-50 overflow-y-auto animate-in fade-in duration-200">

            {/* HEADER */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-10">
                <div>
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
                        🔁 Repeating Trips
                    </h2>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Found {duplicates.length} sets of repeating trips</p>
                </div>
                <button onClick={onClose} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    ✕ Close
                </button>
            </div>

            <div className="max-w-2xl mx-auto p-6 space-y-8 bg-white dark:bg-slate-900 min-h-screen">

                {duplicates.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <div className="text-6xl mb-4">✅</div>
                        <p className="text-xl font-bold text-slate-800 dark:text-slate-200">No Duplicates Found</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500">Your data looks clean!</p>
                    </div>
                ) : (
                    duplicates.map((group, idx) => (
                        <div key={idx} className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                <span className="bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-2 py-0.5 rounded text-sm">Group {idx + 1}</span>
                                Repeating Pattern
                            </h3>

                            <div className="space-y-3">
                                {group.trips.map(trip => (
                                    <div key={trip._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-red-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                {trip.route.source} ➝ {trip.route.destination}
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">
                                                📅 {new Date(trip.createdAt).toLocaleString()} <br />
                                                👤 {trip.driverId?.name || "Unknown Driver"} • {trip.customerId?.name || "Unknown Customer"} <br />
                                                💰 Deal: ₹{trip.amounts.customerPaid}
                                            </p>
                                        </div>
                                        <button
                                            className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors shrink-0"
                                            onClick={() => resolveDuplicate(trip._id)}
                                        >
                                            Delete This One
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}

            </div>
        </div>
    );
}
