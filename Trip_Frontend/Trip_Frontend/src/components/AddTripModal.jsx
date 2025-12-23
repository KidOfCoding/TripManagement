import { useState } from "react";
import api from "../api/axios";

// Icons
const CarIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>);
const UserIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const CashIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);

export default function AddTripModal({ onClose, refresh }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    driver: { name: "", contactNo: "", moneyOut: "" },
    customer: { name: "", contactNo: "", address: "", moneyIn: "" },
    trip: { source: "", destination: "", car: "", status: "ongoing" }
  });

  const updateForm = (section, field, value) => {
    setForm(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const submit = async () => {
    try {
      await api.post("/trips", form);
      refresh();
      onClose();
    } catch (err) {
      alert("Error adding trip");
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="fixed inset-0 bg-white/60 dark:bg-slate-900/80 backdrop-blur-sm flex justify-center items-end sm:items-center z-50 p-0 sm:p-4 h-[100dvh]">
      <div className="bg-white dark:bg-slate-900 w-full sm:w-[500px] h-full sm:h-auto max-h-[100dvh] sm:rounded-2xl shadow-2xl flex flex-col sm:border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom duration-300">

        {/* HEADER */}
        <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">New Trip</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
            ✕
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="h-1 bg-slate-50 dark:bg-slate-800 w-full shrink-0">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <CarIcon /> Trip Details
              </h3>

              <div>
                <label className="label-text dark:text-slate-400">Source Location</label>
                <input
                  className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-500"
                  autoFocus
                  placeholder="e.g. Airport"
                  value={form.trip.source}
                  onChange={(e) => updateForm('trip', 'source', e.target.value)}
                />
              </div>

              <div>
                <label className="label-text dark:text-slate-400">Destination</label>
                <input
                  className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-500"
                  placeholder="e.g. Hotel Grand"
                  value={form.trip.destination}
                  onChange={(e) => updateForm('trip', 'destination', e.target.value)}
                />
              </div>

              <div>
                <label className="label-text dark:text-slate-400">Car Number / Model (Optional)</label>
                <input
                  className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-500"
                  placeholder="e.g. Toyota Innova"
                  value={form.trip.car}
                  onChange={(e) => updateForm('trip', 'car', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <CashIcon /> Customer Info
              </h3>

              <div>
                <label className="label-text dark:text-slate-400">Customer Name</label>
                <input
                  className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-500"
                  autoFocus
                  placeholder="Name"
                  value={form.customer.name}
                  onChange={(e) => updateForm('customer', 'name', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text dark:text-slate-400">Contact</label>
                  <input
                    className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-500"
                    type="tel"
                    placeholder="Mobile"
                    value={form.customer.contactNo}
                    onChange={(e) => updateForm('customer', 'contactNo', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-text text-green-600 dark:text-green-400">Deal with Customer</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400">₹</span>
                    <input
                      className="input-field pl-8 border-green-100 focus:border-green-400 focus:ring-green-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:border-green-500 dark:focus:ring-green-900/30"
                      placeholder="0.00"
                      type="number"
                      value={form.customer.moneyIn}
                      onChange={(e) => updateForm('customer', 'moneyIn', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="label-text dark:text-slate-400">Address</label>
                <textarea
                  className="input-field min-h-[80px] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-500"
                  placeholder="Full Address"
                  value={form.customer.address}
                  onChange={(e) => updateForm('customer', 'address', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <UserIcon /> Driver Details
              </h3>

              <div>
                <label className="label-text dark:text-slate-400">Driver Name</label>
                <input
                  className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-500"
                  autoFocus
                  placeholder="Name"
                  value={form.driver.name}
                  onChange={(e) => updateForm('driver', 'name', e.target.value)}
                />
              </div>

              <div>
                <label className="label-text dark:text-slate-400">Contact Number</label>
                <input
                  className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-500"
                  type="tel"
                  placeholder="10-digit number"
                  value={form.driver.contactNo}
                  onChange={(e) => updateForm('driver', 'contactNo', e.target.value)}
                />
              </div>

              <div>
                <label className="label-text text-red-500 dark:text-red-400">Payment to Driver</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400">₹</span>
                  <input
                    className="input-field pl-8 border-red-100 focus:border-red-400 focus:ring-red-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:border-red-500 dark:focus:ring-red-900/30"
                    placeholder="0.00"
                    type="number"
                    value={form.driver.moneyOut}
                    onChange={(e) => updateForm('driver', 'moneyOut', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between bg-slate-50/50 dark:bg-slate-800/50 sm:rounded-b-2xl shrink-0 pb-safe">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="text-slate-500 dark:text-slate-400 font-medium px-4 py-3 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Back
            </button>
          ) : (
            <div></div> // Spacer
          )}

          {step < 3 ? (
            <button
              onClick={nextStep}
              className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-slate-900/20 dark:shadow-blue-600/20 active:scale-95 transition-all"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={submit}
              className="bg-blue-600 dark:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
            >
              Create Trip
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
