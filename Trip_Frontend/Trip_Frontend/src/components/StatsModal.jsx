import { useEffect, useState } from "react";
import api from "../api/axios";
import TripCard from "./TripCard";
import EditTripModal from "./EditTripModal";

export default function StatsModal({ onClose }) {
    const [activeTab, setActiveTab] = useState("today"); // today, week, month, custom
    const [customDate, setCustomDate] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    // View Details State
    const [selectedTrip, setSelectedTrip] = useState(null);
    // Edit State (passed to TripCard)
    const [editingTrip, setEditingTrip] = useState(null);

    useEffect(() => {
        fetchReport();
    }, [activeTab, customDate]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            let startDate = new Date();
            let endDate = new Date();

            if (activeTab === "today") {
                // defaults are fine
            } else if (activeTab === "week") {
                startDate.setDate(startDate.getDate() - 7);
            } else if (activeTab === "month") {
                startDate.setMonth(startDate.getMonth() - 1);
            } else if (activeTab === "custom") {
                if (!customDate) { setLoading(false); return; }
                startDate = new Date(customDate);
                endDate = new Date(customDate);
            }

            const res = await api.get(`/trips/report?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/60 dark:bg-slate-900/80 backdrop-blur-sm z-30 overflow-y-auto animate-in fade-in duration-200">
            {/* HEADER */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-10 w-full max-w-4xl mx-auto shadow-sm">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Detailed Expense Report</h2>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Breakdown of deals, costs, and profits</p>
                </div>
                <button onClick={onClose} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    ✕
                </button>
            </div>

            <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-slate-900 min-h-screen">

                {/* FILTERS */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {["today", "week", "month"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setCustomDate(""); }}
                            className={`px-4 py-2 text-sm font-bold capitalize rounded-lg transition-all border ${activeTab === tab
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                                : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Date:</span>
                        <input
                            type="date"
                            value={customDate}
                            onChange={(e) => { setActiveTab("custom"); setCustomDate(e.target.value); }}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading report...</div>
                ) : (
                    <>
                        {/* SUMMARY CARDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Total Deals</p>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">₹{data?.totals?.totalDeals || 0}</p>
                            </div>
                            <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl border border-rose-100 dark:border-rose-800">
                                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase">Total Expenses</p>
                                <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">₹{data?.totals?.totalCost || 0}</p>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Net Profit</p>
                                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">₹{data?.totals?.netProfit || 0}</p>
                            </div>
                        </div>

                        {/* DETAILED TABLE */}
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Route</th>
                                        <th className="px-4 py-3">Parties</th>
                                        <th className="px-4 py-3 text-right">Deal</th>
                                        <th className="px-4 py-3 text-right">Cost</th>
                                        <th className="px-4 py-3 text-right">Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 cursor-pointer">
                                    {data?.trips?.length > 0 ? (
                                        data.trips.map((trip) => (
                                            <tr
                                                key={trip._id}
                                                onClick={() => setSelectedTrip(trip)}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors active:bg-slate-100 dark:active:bg-slate-800"
                                            >
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    {new Date(trip.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                                                    {trip.route.source} ➝ {trip.route.destination}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                                                    <div className="flex flex-col">
                                                        <span>👤 {trip.customerId?.name}</span>
                                                        <span>🚗 {trip.driverId?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-200">
                                                    ₹{trip.amounts.customerPaid}
                                                </td>
                                                <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400">
                                                    ₹{trip.amounts.driverPaid}
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                    ₹{trip.profit}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-10 text-center text-slate-400">
                                                No trips found for this period
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <td colSpan="3" className="px-4 py-3 text-right uppercase text-xs tracking-wider text-slate-500">Totals</td>
                                        <td className="px-4 py-3 text-right">₹{data?.totals?.totalDeals || 0}</td>
                                        <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400">₹{data?.totals?.totalCost || 0}</td>
                                        <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">₹{data?.totals?.netProfit || 0}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* TRIP DETAIL POPUP */}
            {selectedTrip && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedTrip(null)}>
                    <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg dark:text-white">Trip Details</h3>
                            <button onClick={() => setSelectedTrip(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">✕</button>
                        </div>
                        <div className="p-4 max-h-[80vh] overflow-y-auto">
                            <TripCard
                                trip={selectedTrip}
                                defaultExpanded={true}
                                refresh={() => { fetchReport(); setSelectedTrip(null); }}
                                onEdit={(t) => {
                                    setEditingTrip(t);
                                    // Don't close selectedTrip yet, let EditModal handle it
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL OVERLAY */}
            {editingTrip && (
                <EditTripModal
                    trip={editingTrip}
                    onClose={() => setEditingTrip(null)}
                    refresh={() => {
                        fetchReport();
                        setEditingTrip(null);
                        setSelectedTrip(null); // Close detail view after edit to avoid stale data
                    }}
                />
            )}
        </div>
    );
}
