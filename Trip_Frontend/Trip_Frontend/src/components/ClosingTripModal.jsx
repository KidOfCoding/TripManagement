import { useState } from "react";
import api from "../api/axios";

export default function ClosingTripModal({ trip, onClose, refresh }) {
    const [loading, setLoading] = useState(false);

    // Initial State
    const [form, setForm] = useState({
        stops: trip.route.stops && trip.route.stops.length > 0 ? trip.route.stops : [
            { location: trip.route.destination, expenses: [] }
        ],
        intermediateStays: trip.intermediateStays || [],

        // General Expenses (Fuel, etc.)
        closingExpenses: trip.closingExpenses || [],

        // Final Payment
        finalCustomerPaid: trip.amounts?.customerPaid || "",
        finalDriverPaid: trip.amounts?.driverPaid || "",

        // Optional Driver Pay Toggle
        // Initialize based on whether there was a driver payout previously
        isDriverPayEnabled: Boolean(trip.amounts?.driverPaid && trip.amounts?.driverPaid > 0),

        paymentDetails: trip.paymentDetails || {
            amount: "",
            voucherNo: "",
            mode: "cash",
            notes: ""
        }
    });

    const [newStay, setNewStay] = useState({ location: "", durationMin: "" });

    // --- HELPERS: Stops ---
    const addStop = () => {
        setForm(prev => ({ ...prev, stops: [...prev.stops, { location: "", expenses: [] }] }));
    };
    const updateStopLocation = (index, val) => {
        const newStops = [...form.stops];
        newStops[index].location = val;
        setForm(prev => ({ ...prev, stops: newStops }));
    };
    const removeStop = (index) => {
        if (form.stops.length > 1) {
            setForm(prev => ({ ...prev, stops: prev.stops.filter((_, i) => i !== index) }));
        }
    };

    // --- HELPERS: Stop Expenses (Tolls, etc.) ---
    const addExpenseToStop = (stopIndex) => {
        const newStops = [...form.stops];
        newStops[stopIndex].expenses.push({ type: "Toll", amount: "" });
        setForm(prev => ({ ...prev, stops: newStops }));
    };
    const updateExpense = (stopIndex, expIndex, field, val) => {
        const newStops = [...form.stops];
        newStops[stopIndex].expenses[expIndex][field] = val;
        setForm(prev => ({ ...prev, stops: newStops }));
    };
    const removeExpense = (stopIndex, expIndex) => {
        const newStops = [...form.stops];
        newStops[stopIndex].expenses = newStops[stopIndex].expenses.filter((_, i) => i !== expIndex);
        setForm(prev => ({ ...prev, stops: newStops }));
    };

    // --- HELPERS: My Expenses (Fuel) ---
    const addClosingExpense = () => {
        setForm(prev => ({
            ...prev,
            closingExpenses: [...prev.closingExpenses, { expenseType: "Fuel", amount: "" }]
        }));
    };
    const updateClosingExpense = (index, field, val) => {
        const newExps = [...form.closingExpenses];
        newExps[index][field] = val;
        setForm(prev => ({ ...prev, closingExpenses: newExps }));
    };
    const removeClosingExpense = (index) => {
        setForm(prev => ({ ...prev, closingExpenses: prev.closingExpenses.filter((_, i) => i !== index) }));
    };


    // --- HELPERS: Stays ---
    const addStay = () => {
        if (newStay.location && newStay.durationMin) {
            setForm(prev => ({
                ...prev,
                intermediateStays: [...prev.intermediateStays, { ...newStay, durationMin: Number(newStay.durationMin) }]
            }));
            setNewStay({ location: "", durationMin: "" });
        }
    };
    const removeStay = (index) => {
        setForm(prev => ({ ...prev, intermediateStays: prev.intermediateStays.filter((_, i) => i !== index) }));
    };

    // --- CALCULATIONS ---
    const stopExpensesTotal = form.stops.reduce((total, stop) => {
        return total + stop.expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    }, 0);

    const closingExpensesTotal = form.closingExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

    const totalExpenses = stopExpensesTotal + closingExpensesTotal;

    const driverCost = form.isDriverPayEnabled ? (Number(form.finalDriverPaid) || 0) : 0;
    const netProfit = (Number(form.finalCustomerPaid) || 0) - driverCost - totalExpenses;

    // --- SUBMIT ---
    const submit = async () => {
        setLoading(true);
        try {
            // CAST & SANITIZE
            const sanitizedStops = form.stops.map(({ _id, ...stop }) => ({
                ...stop,
                expenses: stop.expenses?.map(({ _id, ...exp }) => ({
                    ...exp,
                    amount: Number(exp.amount) || 0 // Force Number
                })) || []
            }));

            const sanitizedClosingExpenses = form.closingExpenses.map(({ _id, ...exp }) => ({
                ...exp,
                expenseType: exp.expenseType || "Fuel", // Default
                amount: Number(exp.amount) || 0 // Force Number
            }));

            await api.put(`/trips/${trip._id}`, {
                trip: {
                    source: trip.route.source,
                    destination: form.stops[form.stops.length - 1]?.location || trip.route.destination,
                    status: "done",
                    stops: sanitizedStops,
                    intermediateStays: form.intermediateStays,
                    closingExpenses: sanitizedClosingExpenses, // New Field
                    paymentDetails: form.paymentDetails
                },
                driver: {
                    name: trip.driverId?.name || "Unknown Driver",
                    contactNo: trip.driverId?.contactNo || "9999999999",
                    moneyOut: driverCost // Use calculated cost based on toggle
                },
                customer: {
                    name: trip.customerId?.name || "Unknown Customer",
                    contactNo: trip.customerId?.contactNo || "9999999999",
                    address: trip.customerId?.address || "",
                    moneyIn: Number(form.finalCustomerPaid)
                }
            });

            refresh();
            onClose();
        } catch (err) {
            console.error("Closing Trip Error:", err);
            alert("Failed to complete trip: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-end sm:items-center z-[9999] sm:p-4">
            <div className="bg-white dark:bg-slate-900 w-full sm:w-[650px] max-h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 sm:zoom-in-95">

                {/* HEADER */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 sm:rounded-t-2xl shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Complete Trip</h2>
                        <p className="text-xs text-slate-500">Trip #{trip.tripNo} • Finalizing Details</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">✕</button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* 1. MY EXPENSES (Global) */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                ⛽ My Expenses (Fuel, etc.)
                            </h3>
                            <button
                                onClick={addClosingExpense}
                                className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded transition-colors"
                            >
                                + Add Expense
                            </button>
                        </div>

                        {form.closingExpenses.length === 0 && (
                            <div className="text-center py-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-400">
                                No expenses added. Click above to add Fuel, Food, etc.
                            </div>
                        )}

                        <div className="space-y-2">
                            {form.closingExpenses.map((exp, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <select
                                        className="input-field py-1 text-sm w-32 dark:bg-slate-800"
                                        value={exp.expenseType}
                                        onChange={e => updateClosingExpense(i, 'expenseType', e.target.value)}
                                    >
                                        <option>Fuel</option>
                                        <option>Food</option>
                                        <option>Maintenance</option>
                                        <option>Other</option>
                                    </select>
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1.5 text-slate-400 text-sm">₹</span>
                                        <input
                                            type="number"
                                            className="input-field py-1 pl-6 text-sm font-bold w-full dark:bg-slate-800"
                                            placeholder="Amount"
                                            value={exp.amount}
                                            onChange={e => updateClosingExpense(i, 'amount', e.target.value)}
                                        />
                                    </div>
                                    <button onClick={() => removeClosingExpense(i)} className="text-slate-400 hover:text-red-500">✕</button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

                    {/* 2. ROUTE & STOPS (Simplified) */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            📍 Route & Stop Expenses
                        </h3>
                        {/* Source */}
                        <div className="flex items-center gap-3 mb-4 pl-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{trip.route.source}</span>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-500">START</span>
                        </div>

                        {/* Stops */}
                        <div className="space-y-4 pl-2 border-l border-slate-100 dark:border-slate-700 ml-3">
                            {form.stops.map((stop, sIndex) => (
                                <div key={sIndex} className="pl-4 relative">
                                    <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900"></div>

                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-3">
                                        <div className="flex gap-2">
                                            <input
                                                className="bg-transparent font-bold text-sm text-slate-700 dark:text-slate-200 flex-1 outline-none"
                                                placeholder="Destination Name"
                                                value={stop.location}
                                                onChange={(e) => updateStopLocation(sIndex, e.target.value)}
                                            />
                                            <button onClick={() => removeStop(sIndex)} className="text-slate-300 hover:text-red-400 text-xs">remove</button>
                                        </div>

                                        {/* Stop Expenses */}
                                        {stop.expenses.map((exp, eIndex) => (
                                            <div key={eIndex} className="flex gap-2 items-center text-xs">
                                                <span className="text-slate-400">↳</span>
                                                <select className="bg-transparent font-medium text-slate-600 dark:text-slate-400 outline-none" value={exp.type} onChange={e => updateExpense(sIndex, eIndex, 'type', e.target.value)}>
                                                    <option>Toll</option>
                                                    <option>Parking</option>
                                                    <option>Food</option>
                                                </select>
                                                <input type="number" className="w-16 bg-white dark:bg-slate-800 rounded px-1 border border-slate-200 dark:border-slate-700" placeholder="0" value={exp.amount} onChange={e => updateExpense(sIndex, eIndex, 'amount', e.target.value)} />
                                                <button onClick={() => removeExpense(sIndex, eIndex)} className="text-red-400 text-[10px]">✕</button>
                                            </div>
                                        ))}
                                        <button onClick={() => addExpenseToStop(sIndex)} className="text-[10px] text-blue-500 hover:underline">+ Add Stop Expense (Toll/Parking)</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={addStop} className="mt-4 ml-6 text-xs font-bold text-blue-600 hover:underline">+ Add Next Destination</button>
                    </section>

                    <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

                    {/* 3. CUSTOMER PAY & DRIVER OPTION */}
                    <section>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Customer Pay */}
                            <div>
                                <label className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2 block">Customer Payment</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-slate-400 text-lg">₹</span>
                                    <input
                                        type="number"
                                        className="input-field pl-8 py-3 text-xl font-bold w-full bg-green-50/50 border-green-200 focus:border-green-500 dark:bg-green-900/10 dark:border-green-900"
                                        placeholder="0"
                                        value={form.finalCustomerPaid}
                                        onChange={e => setForm({ ...form, finalCustomerPaid: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Driver Pay (Optional) */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-red-500 uppercase tracking-wider">Driver Payment</label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={form.isDriverPayEnabled} onChange={e => setForm({ ...form, isDriverPayEnabled: e.target.checked })} />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                                        <span className="ml-2 text-[10px] text-slate-500 font-medium">Enable</span>
                                    </label>
                                </div>

                                {form.isDriverPayEnabled ? (
                                    <div className="relative animate-in slide-in-from-top-2 fade-in">
                                        <span className="absolute left-3 top-3 text-slate-400 text-lg">₹</span>
                                        <input
                                            type="number"
                                            className="input-field pl-8 py-3 text-xl font-bold w-full bg-red-50/50 border-red-200 focus:border-red-500 dark:bg-red-900/10 dark:border-red-900"
                                            placeholder="0"
                                            value={form.finalDriverPaid}
                                            onChange={e => setForm({ ...form, finalDriverPaid: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-400 italic py-4 border border-dashed border-slate-200 rounded-lg text-center">
                                        No driver payment recorded.
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* 4. NET PROFIT SUMMARY */}
                    <div className="bg-slate-900 dark:bg-black rounded-xl p-4 flex justify-between items-center text-white shadow-lg">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Net Profit</span>
                            <span className={`text-2xl font-black ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>₹{netProfit}</span>
                        </div>
                        <div className="text-right text-[10px] text-slate-400">
                            <p>Income: ₹{Number(form.finalCustomerPaid) || 0}</p>
                            <p className="text-red-400">- Driver Cost: ₹{driverCost}</p>
                            <p className="text-red-400">- Expenses: ₹{totalExpenses}</p>
                        </div>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50 sm:rounded-b-2xl shrink-0">
                    <button onClick={onClose} className="btn-secondary dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">Cancel</button>
                    <button
                        onClick={submit}
                        disabled={loading}
                        className="btn-primary bg-blue-600 hover:bg-blue-500 text-white min-w-[140px]"
                    >
                        {loading ? "Closing..." : "Close Trip"}
                    </button>
                </div>

            </div>
        </div>
    );
}
