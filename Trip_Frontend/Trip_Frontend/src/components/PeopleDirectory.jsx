import { useEffect, useState } from "react";
import api from "../api/axios";

// Icons
const UserIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const PhoneIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>);
const SearchIcon = () => (<svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);

export default function PeopleDirectory({ onClose }) {
    const [activeTab, setActiveTab] = useState("drivers"); // drivers, customers
    const [data, setData] = useState({ drivers: [], customers: [] });
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPeople();
    }, []);

    const fetchPeople = async () => {
        try {
            const res = await api.get("/trips/people");
            setData({ drivers: res.data.drivers, customers: res.data.customers });
            setLoading(false);
        } catch (err) {
            alert("Failed to load people directory");
            onClose();
        }
    };

    if (loading) return <div className="fixed inset-0 bg-white/60 flex items-center justify-center z-50">Loading...</div>;

    const people = activeTab === "drivers" ? data.drivers : data.customers;

    const filteredPeople = people.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contactNo.includes(searchTerm)
    );

    return (
        <div className="fixed inset-0 bg-white/60 dark:bg-slate-900/80 backdrop-blur-sm z-50 overflow-y-auto animate-in fade-in duration-200">

            {/* HEADER */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-10">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Customers and Drivers</h2>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Directory of all profiles</p>
                </div>
                <button onClick={onClose} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    ✕ Close
                </button>
            </div>

            <div className="max-w-md mx-auto p-6 space-y-6 bg-white dark:bg-slate-900 min-h-screen">

                {/* TABS */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => { setActiveTab("drivers"); setSearchTerm(""); }}
                        className={`flex-1 py-2 text-sm font-bold capitalize rounded-lg transition-all ${activeTab === "drivers"
                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                            }`}
                    >
                        Drivers
                        <span className="ml-2 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs px-1.5 py-0.5 rounded-full">{data.drivers.length}</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab("customers"); setSearchTerm(""); }}
                        className={`flex-1 py-2 text-sm font-bold capitalize rounded-lg transition-all ${activeTab === "customers"
                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                            }`}
                    >
                        Customers
                        <span className="ml-2 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs px-1.5 py-0.5 rounded-full">{data.customers.length}</span>
                    </button>
                </div>

                {/* SEARCH INPUT */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white transition-all placeholder-slate-400 dark:placeholder-slate-500"
                    />
                </div>

                {/* LIST */}
                <div className="space-y-3">
                    {filteredPeople.map((person) => (
                        <div key={person._id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">

                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${activeTab === 'drivers' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                                    <UserIcon />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{person.name}</h3>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                                        <PhoneIcon /> {person.contactNo}
                                    </p>
                                    {person.address && (
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{person.address}</p>
                                    )}
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase mb-0.5">
                                    {activeTab === 'drivers' ? 'Earned' : 'Paid'}
                                </p>
                                <p className={`font-bold ${activeTab === 'drivers' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    ₹{activeTab === 'drivers' ? person.totalEarned : person.totalSpent}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{person.totalTrips} Trips</p>
                            </div>

                        </div>
                    ))}

                    {filteredPeople.length === 0 && (
                        <div className="text-center py-10 opacity-50">
                            <p className="text-slate-500 dark:text-slate-400">No {activeTab} found</p>
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}
