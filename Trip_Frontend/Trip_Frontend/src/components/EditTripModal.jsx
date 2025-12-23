import { useEffect, useState } from "react";
import api from "../api/axios";

// Icons
const CarIcon = () => (<svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>);
const UserIcon = () => (<svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);

export default function EditTripModal({ trip, onClose, refresh }) {
  const [form, setForm] = useState({
    driver: { name: "", contactNo: "", moneyOut: "" },
    customer: { name: "", contactNo: "", address: "", moneyIn: "" },
    trip: { source: "", destination: "", car: "", status: "ongoing" }
  });

  // 🔥 PREFILL DATA
  useEffect(() => {
    if (trip) {
      setForm({
        driver: {
          name: trip.driverId?.name || "",
          contactNo: trip.driverId?.contactNo || "",
          moneyOut: trip.amounts?.driverPaid || ""
        },
        customer: {
          name: trip.customerId?.name || "",
          contactNo: trip.customerId?.contactNo || "",
          address: trip.customerId?.address || "",
          moneyIn: trip.amounts?.customerPaid || ""
        },
        trip: {
          source: trip.route?.source || "",
          destination: trip.route?.destination || "",
          car: trip.car || "",
          status: trip.status?.tripStatus || "ongoing"
        }
      });
    }
  }, [trip]);

  // 🔥 SUBMIT EDIT
  const submit = async () => {
    try {
      await api.put(`/trips/${trip._id}`, form);
      refresh();
      onClose();
    } catch (err) {
      alert("Failed to update trip");
    }
  };

  const updateForm = (section, field, value) => {
    setForm(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  return (
    <div className="fixed inset-0 bg-white/60 dark:bg-slate-900/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl shrink-0">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Edit Trip Details</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            ✕
          </button>
        </div>

        {/* BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* TRIP SECTION */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CarIcon /> Route & Vehicle
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-text dark:text-slate-400">Source</label>
                <input className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" value={form.trip.source} onChange={(e) => updateForm('trip', 'source', e.target.value)} />
              </div>
              <div>
                <label className="label-text dark:text-slate-400">Destination</label>
                <input className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" value={form.trip.destination} onChange={(e) => updateForm('trip', 'destination', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="label-text dark:text-slate-400">Vehicle</label>
                <input className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" value={form.trip.car} onChange={(e) => updateForm('trip', 'car', e.target.value)} />
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

          {/* CUSTOMER SECTION */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <UserIcon /> Customer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" placeholder="Name" value={form.customer.name} onChange={(e) => updateForm('customer', 'name', e.target.value)} />
              <input className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" placeholder="Contact" value={form.customer.contactNo} onChange={(e) => updateForm('customer', 'contactNo', e.target.value)} />
              <div className="md:col-span-2">
                <input className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" placeholder="Address" value={form.customer.address} onChange={(e) => updateForm('customer', 'address', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="label-text text-green-600 dark:text-green-400">Deal with Customer</label>
                <input type="number" className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" value={form.customer.moneyIn} onChange={(e) => updateForm('customer', 'moneyIn', e.target.value)} />
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

          {/* DRIVER SECTION */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <UserIcon /> Driver
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" placeholder="Name" value={form.driver.name} onChange={(e) => updateForm('driver', 'name', e.target.value)} />
              <input className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" placeholder="Contact" value={form.driver.contactNo} onChange={(e) => updateForm('driver', 'contactNo', e.target.value)} />
              <div className="md:col-span-2">
                <label className="label-text text-red-500 dark:text-red-400">Payment to Driver</label>
                <input type="number" className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" value={form.driver.moneyOut} onChange={(e) => updateForm('driver', 'moneyOut', e.target.value)} />
              </div>
            </div>
          </section>

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-2xl shrink-0">
          <button onClick={onClose} className="btn-secondary dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">
            Cancel
          </button>
          <button onClick={submit} className="btn-primary dark:bg-blue-600 dark:hover:bg-blue-500">
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
