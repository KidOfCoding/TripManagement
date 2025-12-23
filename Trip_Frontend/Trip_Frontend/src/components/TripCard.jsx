import { useState } from "react";
import api from "../api/axios";

// Icons
const UserIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const PhoneIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>);
const ArrowRight = () => (<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>);
const EditIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);
const ChevronDown = ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>);

export default function TripCard({ trip, refresh, onEdit }) {
  const [expanded, setExpanded] = useState(false);

  const markDone = async () => {
    await api.patch(`/trips/${trip._id}/complete`);
    refresh();
  };

  const reopen = async () => {
    await api.patch(`/trips/${trip._id}/reopen`);
    refresh();
  };

  const togglePayment = async (type) => {
    await api.patch(`/trips/${trip._id}/payment`, {
      [type]: !trip.status[type] // toggle
    });
    refresh();
  };

  const isOngoing = trip.status.tripStatus === "ongoing";

  return (
    <div className={`card overflow-hidden group transition-all duration-300 bg-white dark:bg-slate-800 ${expanded ? 'shadow-xl ring-1 ring-slate-900/5 dark:ring-slate-700' : 'hover:shadow-lg'}`}>

      {/* Decorative Top Border: Green for Ongoing, Red for Done */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${isOngoing ? 'from-green-500 to-emerald-500' : 'from-red-500 to-rose-500'}`}></div>

      {/* --- SUMMARY VIEW (ALWAYS VISIBLE) --- */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col gap-3">

          {/* Top Row: Route & Status */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-slate-100">
                <span className="truncate max-w-[100px] sm:max-w-xs">{trip.route.source}</span>
                <ArrowRight />
                <span className="truncate max-w-[100px] sm:max-w-xs">{trip.route.destination}</span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                {new Date(trip.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isOngoing ? (
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Ongoing</span>
              ) : (
                <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Done</span>
              )}
              <ChevronDown className={`w-4 h-4 text-slate-300 dark:text-slate-600 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {/* Middle Row: Names */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold tracking-wide uppercase border border-blue-100 dark:border-blue-800">Customer</span>
              <span className="font-medium">{trip.customerId?.name || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold tracking-wide uppercase border border-amber-100 dark:border-amber-800">Driver</span>
              <span className="font-medium">{trip.driverId?.name || "Unknown"}</span>
            </div>
          </div>

          {/* Bottom Row: Detailed Financials (Desktop: Single line, Mobile: Wrapped if needed but distinct) */}
          <div className="text-[11px] font-bold bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700 flex flex-wrap gap-x-3 gap-y-1 items-center">
            <span className="text-green-700 dark:text-green-400 flex items-center gap-1">
              <span className="text-slate-400 dark:text-slate-500 font-normal">Deal:</span> ₹{trip.amounts?.customerPaid || 0}
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-red-500 dark:text-red-400 flex items-center gap-1">
              <span className="text-slate-400 dark:text-slate-500 font-normal">Cost:</span> ₹{trip.amounts?.driverPaid || 0}
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <span className="text-slate-400 dark:text-slate-500 font-normal">Profit:</span> ₹{trip.profit || 0}
            </span>
          </div>

        </div>
      </div>

      {/* --- EXPANDED DETAILS --- */}
      {expanded && (
        <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-200 fade-in">

          <div className="h-px bg-slate-100 dark:bg-slate-700 mb-6"></div>

          {/* Full Header Actions */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              📅 {new Date(trip.createdAt).toLocaleString()}
              {isOngoing ? (
                <span className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Ongoing</span>
              ) : (
                <span className="ml-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Done</span>
              )}
            </p>

            {isOngoing && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(trip); }}
                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer flex items-center gap-1"
              >
                <EditIcon /> Edit
              </button>
            )}
          </div>

          {/* BODY: People & Money (Swapped: Customer First) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* CUSTOMER SECTION */}
            <div className="bg-slate-50/50 dark:bg-slate-700/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700 relative">
              <div className="absolute top-0 right-0 p-2 opacity-50">
                <svg className="w-12 h-12 text-slate-200 dark:text-slate-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-6 4c.22-.72 3.31-2 6-2 2.69 0 5.77 1.28 6 2H6z" /></svg>
              </div>
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest relative z-10">
                Customer
              </div>
              <div className="flex items-center gap-2 mb-1 relative z-10">
                <UserIcon /> <span className="font-medium text-slate-700 dark:text-slate-200">{trip.customerId?.name || "Unknown"}</span>
              </div>
              <div className="flex items-center gap-2 mb-3 text-sm text-slate-500 dark:text-slate-400 relative z-10">
                <PhoneIcon /> <span>{trip.customerId?.contactNo || "N/A"}</span>
              </div>

              <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-200/50 dark:border-slate-600/50 relative z-10">
                <span className="text-green-600 dark:text-green-400 font-bold flex flex-col">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal uppercase">Deal with Customer</span>
                  ₹{trip.amounts?.customerPaid}
                </span>
                <button
                  onClick={() => togglePayment("customerPaid")}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${trip.status.customerPaid
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                    }`}
                >
                  {trip.status.customerPaid ? "RECVD" : "PENDING"}
                </button>
              </div>
            </div>

            {/* DRIVER SECTION */}
            <div className="bg-slate-50/50 dark:bg-slate-700/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700 relative">
              <div className="absolute top-0 right-0 p-2 opacity-50">
                <svg className="w-12 h-12 text-slate-200 dark:text-slate-600" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" /></svg>
              </div>
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest relative z-10">
                Driving
              </div>
              <div className="flex items-center gap-2 mb-1 relative z-10">
                <UserIcon /> <span className="font-medium text-slate-700 dark:text-slate-200">{trip.driverId?.name || "Unknown"}</span>
              </div>
              <div className="flex items-center gap-2 mb-3 text-sm text-slate-500 dark:text-slate-400 relative z-10">
                <PhoneIcon /> <span>{trip.driverId?.contactNo || "N/A"}</span>
              </div>

              <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-200/50 dark:border-slate-600/50 relative z-10">
                <span className="text-red-500 dark:text-red-400 font-bold flex flex-col">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal uppercase">Payment to Driver</span>
                  ₹{trip.amounts?.driverPaid}
                </span>
                <button
                  onClick={() => togglePayment("driverPaid")}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${trip.status.driverPaid
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                    }`}
                >
                  {trip.status.driverPaid ? "PAID" : "UNPAID"}
                </button>
              </div>
            </div>

          </div>

          {/* FOOTER: Actions */}
          <div className="mt-6 flex items-center justify-end">
            {isOngoing ? (
              <button
                onClick={markDone}
                className="bg-slate-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-slate-900/20 dark:shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer w-full justify-center sm:w-auto"
              >
                <span>Complete Trip</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </button>
            ) : (
              <button
                onClick={reopen}
                className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 cursor-pointer w-full justify-center sm:w-auto"
              >
                Reopen Trip
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
