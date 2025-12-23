import { useEffect, useState } from "react";
import api from "../api/axios";

export default function StatsModal({ onClose }) {
    const [activeTab, setActiveTab] = useState("today"); // today, week, month
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get("/trips/stats");
            setStats(res.data.stats);
            setLoading(false);
        } catch (err) {
            alert("Failed to load stats");
            onClose();
        }
    };

    if (loading) return <div className="fixed inset-0 bg-white/60 flex items-center justify-center z-50">Loading...</div>;

    const currentStats = stats ? stats[activeTab] : {};

    return (
        <div className="fixed inset-0 bg-white/60 dark:bg-slate-900/80 backdrop-blur-sm z-50 overflow-y-auto animate-in fade-in duration-200">

            {/* HEADER */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-10">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Track Expenses</h2>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Overview of earnings and costs</p>
                </div>
                <button onClick={onClose} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    ✕
                </button>
            </div>

            <div className="max-w-md mx-auto p-6 space-y-8 bg-white dark:bg-slate-900 min-h-screen">

                {/* TABS */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {["today", "week", "month"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 text-sm font-bold capitalize rounded-lg transition-all ${activeTab === tab
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* MAIN STATS CARDS */}
                <div className="grid grid-cols-2 gap-4">

                    {/* PROFIT (Full Width) */}
                    <div className="col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-slate-900/20 dark:shadow-black/40 border border-slate-800 dark:border-slate-700">
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Net Profit</p>
                        <h3 className="text-4xl font-bold">₹{currentStats.totalProfit || 0}</h3>
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                            <span className="bg-white/10 px-2 py-0.5 rounded text-white font-bold">{currentStats.count || 0} Trips</span>
                            <span>completed this {activeTab}</span>
                        </div>
                    </div>

                    {/* INCOME */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                        <p className="text-emerald-600/70 dark:text-emerald-400/70 text-xs font-bold uppercase tracking-wider mb-1">Total Income</p>
                        <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">₹{currentStats.totalCustomerPay || 0}</h3>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-1">From Customers</p>
                    </div>

                    {/* EXPENSE */}
                    <div className="bg-rose-50 dark:bg-rose-900/20 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                        <p className="text-rose-600/70 dark:text-rose-400/70 text-xs font-bold uppercase tracking-wider mb-1">Total Expense</p>
                        <h3 className="text-2xl font-bold text-rose-700 dark:text-rose-400">₹{currentStats.totalDriverPay || 0}</h3>
                        <p className="text-[10px] text-rose-600 dark:text-rose-500 mt-1">Paid to Drivers</p>
                    </div>

                </div>

                {/* INSIGHTS (Placeholder for future) */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        You have completed <strong className="text-slate-900 dark:text-slate-200">{currentStats.count || 0} trips</strong> in this period.
                    </p>
                </div>

            </div>

        </div>
    );
}
