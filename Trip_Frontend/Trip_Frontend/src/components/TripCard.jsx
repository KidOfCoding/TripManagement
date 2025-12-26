import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../api/axios";
import ClosingTripModal from "./ClosingTripModal";

// Icons
const UserIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const PhoneIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>);
const ArrowRight = () => (<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>);
const EditIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);
const ChevronDown = ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>);

export default function TripCard({ trip, refresh, onEdit, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showClosingModal, setShowClosingModal] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const closeMenu = (e) => {
      const menu = document.getElementById(`status-menu-${trip._id}`);
      if (menu && !menu.contains(e.target) && !e.target.closest(`button[onclick*='status-menu-${trip._id}']`)) {
        // Logic handled by button click e.stopPropagation, but for global we can just hide all menus if needed.
        // Simpler: Just rely on onBlur or similar if we used actual focus.
        // For now, let's just make sure clicking existing card collapses it? No.
        // Let's stick to the inline toggle logic.
      }
    };
    window.addEventListener('click', () => {
      const menu = document.getElementById(`status-menu-${trip._id}`);
      if (menu) menu.classList.add("hidden");
    });
    return () => window.removeEventListener('click', null);
  }, []);

  const markDone = async () => {
    setShowClosingModal(true);
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

  /* SWIPE TO DELETE LOGIC */
  const [touchStart, setTouchStart] = useState(null);
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Thresholds
  const PREPARE_DELETE_THRESHOLD = -100; // Ready to delete state
  const FULL_SWIPE_THRESHOLD = -200; // Auto-trigger delete

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsDeleting(false);
  };

  const handleTouchMove = (e) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;

    if (diff < 0) {
      setSwipeDelta(Math.max(diff, -250)); // Allow deeper swipe
    }
  };

  const handleTouchEnd = () => {
    if (swipeDelta < FULL_SWIPE_THRESHOLD) {
      // Full Swipe -> Trigger Delete immediately
      confirmDelete();
    } else if (swipeDelta < PREPARE_DELETE_THRESHOLD) {
      // Partial Swipe -> Snap to peek
      setSwipeDelta(-120);
      setIsDeleting(true);
    } else {
      // Snap back
      setSwipeDelta(0);
      setIsDeleting(false);
    }
    setTouchStart(null);
  };

  const confirmDelete = async () => {
    // Give a small delay to let visual finish if it was a quick flick
    setTimeout(async () => {
      if (confirm("Are you sure you want to delete this trip?")) {
        try {
          await api.delete(`/trips/${trip._id}`);
          refresh();
        } catch (err) {
          alert("Failed to delete trip");
          setSwipeDelta(0);
        }
      } else {
        setSwipeDelta(0); // Cancel
        setIsDeleting(false);
      }
    }, 100);
  };

  const isOngoing = trip.status.tripStatus === "ongoing";

  /* MOUSE SUPPORT */
  const handleMouseDown = (e) => {
    setTouchStart(e.clientX);
    setIsDeleting(false);
  };

  const handleMouseMove = (e) => {
    // Treat mouse move same as touch move if button is held
    if (touchStart === null) return;

    // Safety: If primary button not held, stop drag
    if (e.buttons !== 1) {
      handleMouseUp();
      return;
    }

    const currentX = e.clientX;
    const diff = currentX - touchStart;

    if (diff < 0) {
      setSwipeDelta(Math.max(diff, -250));
    }
  };

  const handleMouseUp = () => {
    handleTouchEnd(); // Reuse logic
  };

  return (
    <div className="relative overflow-hidden mb-4 rounded-2xl select-none">
      {/* DELETE BACKGROUND LAYER */}
      <div className={`absolute inset-y-0 right-0 w-full bg-red-500 flex items-center justify-end pr-6 rounded-2xl transition-opacity duration-200 ${swipeDelta !== 0 ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={confirmDelete} className="flex items-center gap-2 text-white font-bold animate-in zoom-in duration-200">
          <span>Delete Trip</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>

      {/* MAIN CARD CONTENT (Swipeable) */}
      <div
        className={`card overflow-hidden rounded-2xl group transition-transform duration-200 bg-white dark:bg-slate-800 relative z-10 ${expanded ? 'shadow-xl ring-1 ring-slate-900/5 dark:ring-slate-700' : 'hover:shadow-lg'}`}
        style={{ transform: `translateX(${swipeDelta}px)` }}

        /* TOUCH Handlers */
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}

        /* MOUSE Handlers */
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >

        {/* Decorative Top Border */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${isOngoing ? 'from-green-500 to-emerald-500' : 'from-red-500 to-rose-500'}`}></div>

        {/* --- SUMMARY VIEW --- */}
        <div
          className="p-4 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex flex-col gap-3">

            {/* Top Row: Route & Status */}
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-2 py-0.5 rounded-md shadow-sm">
                    #{trip.tripNo || '---'}
                  </span>
                  <span className="text-lg" title={trip.serviceType === 'driver_only' ? 'Driver Only' : 'Cab + Driver'}>
                    {trip.serviceType === 'driver_only' ? '👮' : '🚖'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-slate-100">
                  <span className="truncate max-w-[100px] sm:max-w-xs">{trip.route.source}</span>
                  <ArrowRight />
                  <span className="truncate max-w-[100px] sm:max-w-xs">{trip.route.destination}</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                  {new Date(trip.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Right Side Actions Group */}
              <div className="flex items-center gap-2">
                {/* Edit Button */}
                {isOngoing && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(trip); }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg hover:border-slate-300 dark:hover:border-slate-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm"
                  >
                    <EditIcon />
                    <span>Edit</span>
                  </button>
                )}

                {/* Status Pill & Dropdown */}
                <div className="relative z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const menu = document.getElementById(`status-menu-${trip._id}`);
                      if (menu) menu.classList.toggle("hidden");
                    }}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${isOngoing
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isOngoing ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                    {isOngoing ? "Ongoing" : "Completed"}
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    id={`status-menu-${trip._id}`}
                    className="hidden absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right z-40"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById(`status-menu-${trip._id}`).classList.add("hidden");
                        isOngoing ? markDone() : reopen();
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${isOngoing ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"
                        }`}
                    >
                      {isOngoing ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          Completed
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          Reopen
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Chevron */}
                <div className="p-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                  <ChevronDown className={`w-4 h-4 text-slate-300 dark:text-slate-600 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                </div>

              </div>
            </div>

            {/* Middle Row: People */}
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

            {/* Bottom Row: Financials & Primary Action */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
              {/* Financials Pill */}
              <div className="text-[11px] font-bold bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700 flex flex-wrap gap-x-3 gap-y-1 items-center flex-1 min-w-fit">
                <span className="text-green-700 dark:text-green-400 flex items-center gap-1">
                  <span className="text-slate-400 dark:text-slate-500 font-normal">Deal:</span> ₹{trip.amounts?.customerPaid || 0}
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-red-500 dark:text-red-400 flex items-center gap-1">
                  <span className="text-slate-400 dark:text-slate-500 font-normal">Cost:</span>
                  ₹{(trip.amounts?.driverPaid || 0) +
                    (trip.route.stops || []).reduce((sum, stop) => sum + (stop.expenses || []).reduce((exSum, exp) => exSum + (Number(exp.amount) || 0), 0), 0) +
                    (trip.closingExpenses || []).reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)}
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <span className="text-slate-400 dark:text-slate-500 font-normal">Profit:</span> ₹{trip.profit || 0}
                </span>
                {trip.advancePayment?.amount > 0 && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <span className="text-slate-400 dark:text-slate-500 font-normal">Adv:</span> ₹{trip.advancePayment.amount}
                    </span>
                  </>
                )}
              </div>

              {/* Primary Action Button (Bottom Right) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isOngoing) {
                    markDone();
                  } else {
                    setShowClosingModal(true);
                  }
                }}
                className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-slate-200 transition-all z-20 shrink-0"
              >
                {isOngoing ? "Close Trip" : "Edit Details"}
              </button>
            </div>

          </div>
        </div>

        {/* --- EXPANDED VIEW --- */}
        {expanded && (
          <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-200 fade-in">
            <div className="h-px bg-slate-100 dark:bg-slate-700 mb-6"></div>

            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                📅 {new Date(trip.createdAt).toLocaleString()}
                {isOngoing ? (
                  <span className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Ongoing</span>
                ) : (
                  <span className="ml-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Completed</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Section */}
              <div className="bg-slate-50/50 dark:bg-slate-700/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700 relative">
                <div className="absolute top-0 right-0 p-2 opacity-50">
                  <svg className="w-12 h-12 text-slate-200 dark:text-slate-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-6 4c.22-.72 3.31-2 6-2 2.69 0 5.77 1.28 6 2H6z" /></svg>
                </div>
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest relative z-10">Customer</div>
                <div className="flex items-center gap-2 mb-1 relative z-10">
                  <UserIcon /> <span className="font-medium text-slate-700 dark:text-slate-200">{trip.customerId?.name || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2 mb-3 text-sm text-slate-500 dark:text-slate-400 relative z-10">
                  <PhoneIcon /> <span>{trip.customerId?.contactNo || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-200/50 dark:border-slate-600/50 relative z-10">
                  <span className="text-green-600 dark:text-green-400 font-bold flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal uppercase">Deal</span>
                    ₹{trip.amounts?.customerPaid}
                  </span>
                  <button onClick={() => togglePayment("customerPaid")} className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${trip.status.customerPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {trip.status.customerPaid ? "RECVD" : "PENDING"}
                  </button>
                </div>
              </div>

              {/* Driver Section */}
              <div className="bg-slate-50/50 dark:bg-slate-700/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700 relative">
                <div className="absolute top-0 right-0 p-2 opacity-50">
                  <svg className="w-12 h-12 text-slate-200 dark:text-slate-600" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" /></svg>
                </div>
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest relative z-10">Driving</div>
                <div className="flex items-center gap-2 mb-1 relative z-10">
                  <UserIcon /> <span className="font-medium text-slate-700 dark:text-slate-200">{trip.driverId?.name || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2 mb-3 text-sm text-slate-500 dark:text-slate-400 relative z-10">
                  <PhoneIcon /> <span>{trip.driverId?.contactNo || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-200/50 dark:border-slate-600/50 relative z-10">
                  <span className="text-red-500 dark:text-red-400 font-bold flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal uppercase">Payout</span>
                    ₹{trip.amounts?.driverPaid}
                  </span>
                  <button onClick={() => togglePayment("driverPaid")} className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${trip.status.driverPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {trip.status.driverPaid ? "PAID" : "UNPAID"}
                  </button>
                </div>
              </div>
            </div>

            {/* Detailed Route & Expenses Section */}
            <div className="mt-6">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Route & Expenses</h4>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">

                {/* Source (Updated Style) */}
                <div className="p-4 flex items-start gap-3 relative">
                  <div className="mt-1 flex flex-col items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm z-10 relative"></div>
                    {(trip.route.stops?.length > 0 || trip.route.destination) && (
                      <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-700 absolute top-3 bottom-[-20px] left-[21px]"></div>
                    )}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      {trip.route.source}
                      <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">START</span>
                    </h5>
                  </div>
                </div>

                {/* Stops loop */}
                {trip.route.stops?.map((stop, index) => {
                  const isLast = index === trip.route.stops.length - 1;
                  return (
                    <div key={index} className="p-4 pt-0 flex items-start gap-3 relative">
                      <div className="mt-1 flex flex-col items-center gap-1">
                        <div className={`w-2.5 h-2.5 rounded-full z-10 relative shadow-sm ${isLast ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                        {!isLast && (
                          <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-700 absolute top-3 bottom-[-24px] left-[21px]"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className={`text-sm font-bold ${isLast ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'} flex items-center gap-2`}>
                          {stop.location}
                          {!isLast && <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">#{index + 1}</span>}
                          {isLast && <span className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">END</span>}
                        </h5>

                        {/* Expenses for this stop */}
                        {stop.expenses?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {stop.expenses.map((exp, k) => (
                              <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] border border-rose-100 dark:border-rose-800 rounded-md shadow-sm">
                                <span className="font-medium text-slate-500 dark:text-slate-400">{exp.type}:</span> <span className="font-bold">₹{exp.amount}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Fallback if no stops array (legacy trips) */}
                {(!trip.route.stops || trip.route.stops.length === 0) && (
                  <div className="p-4 pt-0 flex items-start gap-3 relative">
                    <div className="mt-1 flex flex-col items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm z-10 relative"></div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{trip.route.destination}</p>
                      <p className="text-[10px] text-slate-400">Destination</p>
                    </div>
                  </div>
                )}

                {/* Intermediate Stays (if any) */}
                {trip.intermediateStays?.length > 0 && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-50 dark:border-slate-800 mt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Intermediate Stays</p>
                    {trip.intermediateStays.map((stay, i) => (
                      <div key={i} className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                        <span>{stay.location}</span>
                        <span>{stay.durationMin} mins</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Final Settlement Details */}
                {trip.paymentDetails?.amount > 0 && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Settlement</p>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Paid via {trip.paymentDetails.mode}</span>
                      <span className="font-bold">₹{trip.paymentDetails.amount}</span>
                    </div>
                    {trip.paymentDetails.notes && <p className="text-[10px] text-slate-400 mt-1">"{trip.paymentDetails.notes}"</p>}
                  </div>
                )}

              </div>
            </div>

            <div className="mt-6 flex items-center justify-end">
              {isOngoing ? (
                <button onClick={markDone} className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2">
                  <span>Complete Trip</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </button>
              ) : (
                <div className="flex gap-3 w-full sm:w-auto">
                  <button onClick={reopen} className="border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium">Reopen</button>
                  <button onClick={() => setShowClosingModal(true)} className="bg-blue-50 text-blue-600 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
                    <EditIcon /> Edit Expenses
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CLOSING MODAL - PORTAL */}
        {showClosingModal && createPortal(
          <ClosingTripModal
            trip={trip}
            onClose={() => setShowClosingModal(false)}
            refresh={refresh}
          />,
          document.body
        )}
      </div>
    </div>
  );
}
