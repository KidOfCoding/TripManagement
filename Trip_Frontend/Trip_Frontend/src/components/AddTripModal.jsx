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
    customer: {
      name: "",
      contactNo: "",
      address: "",
      moneyIn: "",
      advancePayment: { amount: "", voucherNo: "", mode: "cash" }
    },
    trip: {
      source: "",
      destination: "",
      fromAddress: "",
      toAddress: "",
      car: "",
      status: "ongoing",
      serviceType: "cab_with_driver",
      tripType: "single",
      distanceKM: ""
    }
  });

  const [errors, setErrors] = useState({});

  const updateForm = (section, field, value) => {
    setForm(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
    // Clear error for this field
    if (errors[`${section}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const handleBlur = (section, field, value) => {
    const newErrors = { ...errors };
    let error = "";

    if (field === "contactNo") {
      if (!/^\d{10}$/.test(value)) error = "Must be exactly 10 digits";
    } else if (["source", "destination", "name"].includes(field)) {
      if (!value) error = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }

    if (error) {
      newErrors[`${section}.${field}`] = error;
    } else {
      delete newErrors[`${section}.${field}`];
    }
    setErrors(newErrors);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.trip.source) newErrors['trip.source'] = "Source is required";
    if (!form.trip.destination) newErrors['trip.destination'] = "Destination is required";
    if (!form.customer.name) newErrors['customer.name'] = "Customer name is required";
    if (!form.driver.name) newErrors['driver.name'] = "Driver name is required";

    // Phone Validation
    if (!/^\d{10}$/.test(form.customer.contactNo)) {
      newErrors['customer.contactNo'] = "Must be exactly 10 digits";
    }
    if (!/^\d{10}$/.test(form.driver.contactNo)) {
      newErrors['driver.contactNo'] = "Must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [stops, setStops] = useState([]);

  // ... (keep existing methods)

  const submit = async () => {
    if (!validate()) return;
    try {
      // Prepare stops for backend: Intermediates + Final Destination
      const formattedStops = [
        ...stops.map(s => ({ location: s, expenses: [] })),
        { location: form.trip.destination, expenses: [] }
      ];

      const payload = {
        ...form,
        trip: {
          ...form.trip,
          stops: formattedStops
        }
      };

      await api.post("/trips", payload);
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
              {/* SERVICE TYPE */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateForm('trip', 'serviceType', 'cab_with_driver')}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-1 ${form.trip.serviceType === 'cab_with_driver'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <span className="text-xl">🚖</span>
                  Cab + Driver
                </button>
                <button
                  onClick={() => updateForm('trip', 'serviceType', 'driver_only')}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-1 ${form.trip.serviceType === 'driver_only'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <span className="text-xl">👮</span>
                  Driver Only
                </button>
              </div>

              {/* LOCATIONS */}
              <div className="space-y-3">

                {/* Source */}
                <div>
                  <label className="label-text dark:text-slate-400">Source <span className="text-red-500">*</span></label>
                  <input
                    className={`input-field w-full dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 ${errors['trip.source'] ? 'border-red-500 focus:border-red-500 dark:border-red-500' : ''}`}
                    placeholder="e.g. Airport"
                    value={form.trip.source}
                    onChange={(e) => updateForm('trip', 'source', e.target.value)}
                    onBlur={(e) => handleBlur('trip', 'source', e.target.value)}
                  />
                  {errors['trip.source'] && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors['trip.source']}</p>}
                </div>

                {/* Intermediate Stops */}
                {stops.map((stop, index) => (
                  <div key={index} className="flex gap-2 items-end animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex-1">
                      <label className="label-text text-xs text-slate-400 dark:text-slate-500 mb-1">Stop {index + 1}</label>
                      <input
                        className="input-field w-full dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        placeholder={`Stop ${index + 1} location`}
                        value={stop}
                        onChange={(e) => {
                          const newStops = [...stops];
                          newStops[index] = e.target.value;
                          setStops(newStops);
                        }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        setStops(stops.filter((_, i) => i !== index));
                      }}
                      className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-transparent hover:border-red-200 transition-all"
                      title="Remove Stop"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Add Stop Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setStops([...stops, ""])}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 py-1 px-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all"
                  >
                    <span>+</span> Add Stop
                  </button>
                </div>

                {/* Destination */}
                <div>
                  <label className="label-text dark:text-slate-400">Destination <span className="text-red-500">*</span></label>
                  <input
                    className={`input-field w-full dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 ${errors['trip.destination'] ? 'border-red-500 focus:border-red-500 dark:border-red-500' : ''}`}
                    placeholder="e.g. Hotel Grand"
                    value={form.trip.destination}
                    onChange={(e) => updateForm('trip', 'destination', e.target.value)}
                    onBlur={(e) => handleBlur('trip', 'destination', e.target.value)}
                  />
                  {errors['trip.destination'] && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors['trip.destination']}</p>}
                </div>

                {/* Detailed Addresses */}
                <div className="flex gap-2">
                  <textarea
                    className="input-field min-h-[60px] text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                    placeholder="From Address (Detailed)"
                    value={form.trip.fromAddress}
                    onChange={(e) => updateForm('trip', 'fromAddress', e.target.value)}
                  />
                  <textarea
                    className="input-field min-h-[60px] text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                    placeholder="To Address (Detailed)"
                    value={form.trip.toAddress}
                    onChange={(e) => updateForm('trip', 'toAddress', e.target.value)}
                  />
                </div>
              </div>

              {/* DISTANCE & CAR */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text dark:text-slate-400">Distance (KM)</label>
                  <input
                    type="number"
                    className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                    placeholder="0"
                    value={form.trip.distanceKM}
                    onChange={(e) => updateForm('trip', 'distanceKM', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-text dark:text-slate-400">Car Model</label>
                  <input
                    className="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                    placeholder="e.g. Toyota"
                    value={form.trip.car}
                    onChange={(e) => updateForm('trip', 'car', e.target.value)}
                  />
                </div>
              </div>
            </div>

          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <CashIcon /> Customer Info
              </h3>

              <div>
                <label className="label-text dark:text-slate-400">Customer Name <span className="text-red-500">*</span></label>
                <input
                  className={`input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-500 ${errors['customer.name'] ? 'border-red-500 focus:border-red-500 dark:border-red-500' : ''
                    }`}
                  autoFocus
                  placeholder="Name"
                  value={form.customer.name}
                  onChange={(e) => updateForm('customer', 'name', e.target.value)}
                  onBlur={(e) => handleBlur('customer', 'name', e.target.value)}
                />
                {errors['customer.name'] && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors['customer.name']}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text dark:text-slate-400">Contact (10 digits)</label>
                  <input
                    className={`input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-500 ${errors['customer.contactNo'] ? 'border-red-500 focus:border-red-500 dark:border-red-500' : ''
                      }`}
                    type="tel"
                    placeholder="Mobile"
                    value={form.customer.contactNo}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d{0,10}$/.test(val)) updateForm('customer', 'contactNo', val);
                    }}
                    onBlur={(e) => handleBlur('customer', 'contactNo', e.target.value)}
                  />
                  {errors['customer.contactNo'] && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors['customer.contactNo']}</p>}
                </div>
                {/* Deal with Customer REMOVED as per request to move to closing */}
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

              {/* ADVANCE PAYMENT */}
              {/* ADVANCE PAYMENT REMOVED as per request to move to closing */}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <UserIcon /> Driver Details
              </h3>

              <div>
                <label className="label-text dark:text-slate-400">Driver Name <span className="text-red-500">*</span></label>
                <input
                  className={`input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-500 ${errors['driver.name'] ? 'border-red-500 focus:border-red-500 dark:border-red-500' : ''
                    }`}
                  autoFocus
                  placeholder="Name"
                  value={form.driver.name}
                  onChange={(e) => updateForm('driver', 'name', e.target.value)}
                  onBlur={(e) => handleBlur('driver', 'name', e.target.value)}
                />
                {errors['driver.name'] && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors['driver.name']}</p>}
              </div>

              <div>
                <label className="label-text dark:text-slate-400">Contact Number (10 digits)</label>
                <input
                  className={`input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-500 ${errors['driver.contactNo'] ? 'border-red-500 focus:border-red-500 dark:border-red-500' : ''
                    }`}
                  type="tel"
                  placeholder="10-digit number"
                  value={form.driver.contactNo}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d{0,10}$/.test(val)) updateForm('driver', 'contactNo', val);
                  }}
                  onBlur={(e) => handleBlur('driver', 'contactNo', e.target.value)}
                />
                {errors['driver.contactNo'] && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors['driver.contactNo']}</p>}
              </div>

              {/* Payment to Driver REMOVED as per request to move to closing */}
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

      </div >
    </div >
  );
}
