import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function Navbar({ searchTerm, setSearchTerm }) {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const [pendingCount, setPendingCount] = useState(0);

    const ADMIN_EMAIL = "www.sonuali0011@gmail.com";
    const isAdmin = user && user.email === ADMIN_EMAIL;
    const isHome = location.pathname === "/";

    useEffect(() => {
        if (isAdmin) {
            const q = query(collection(db, "orders"), where("status", "==", "Pending"));
            const unsubscribe = onSnapshot(q, (snap) => {
                setPendingCount(snap.size);
            });
            return () => unsubscribe();
        }
    }, [isAdmin]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (location.pathname !== "/") {
            navigate("/");
        }
    };

    return (
        <nav className="sticky top-0 z-[1000] bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-10 h-20 flex items-center justify-between gap-4">

                {/*LOGO SECTION */}
                <Link to="/" className="flex items-center gap-3 shrink-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-100">
                        <span className="text-white font-black text-xl md:text-2xl italic">A</span>
                    </div>
                    <div className="hidden sm:block leading-none">
                        <h1 className="text-lg md:text-xl font-black italic text-slate-900 uppercase tracking-tighter">
                            ASHRAF<span className="text-orange-600">WOODS.</span>
                        </h1>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em]">Handcrafted Luxury</p>
                    </div>
                </Link>

                {/*SEARCH BAR */}
                <div className="relative flex-1 max-w-xs md:max-w-md group hidden sm:block">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600">🔍</span>
                    <input
                        type="text"
                        placeholder="Search furniture..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-100/50 rounded-2xl outline-none font-bold text-xs border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all shadow-inner"
                    />
                </div>

                {/*NAVIGATION & ACTIONS */}
                <div className="flex items-center gap-4 md:gap-6">

                    {/* Home Link */}
                    <Link to="/" className={`text-[11px] font-black uppercase tracking-widest ${isHome ? 'text-orange-600 border-b-2 border-orange-600 pb-1' : 'text-slate-500 hover:text-orange-600'}`}>
                        Home
                    </Link>

                    {/*ADMIN & USER LINKS FIXED */}
                    {user && (
                        isAdmin ? (
                            <div className="flex items-center gap-4">
                                {/* Dashboard Link Wapas Aa Gaya */}
                                <Link to="/admin" className="text-blue-600 font-black text-[11px] uppercase tracking-widest hover:opacity-80 transition-all">
                                    Admin
                                </Link>
                                <Link to="/admin-orders" className="relative text-orange-600 font-black text-[11px] uppercase tracking-widest flex items-center gap-1">
                                    Orders
                                    {pendingCount > 0 && (
                                        <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full animate-bounce">
                                            {pendingCount}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        ) : (
                            <Link to="/my-orders" className="text-slate-500 hover:text-orange-600 font-black text-[11px] uppercase tracking-widest">
                                My Orders
                            </Link>
                        )
                    )}

                    {/*Cart */}
                    <Link to="/checkout" className="relative text-xl hover:scale-110 transition-transform">
                        🛒 {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                                {cart.length}
                            </span>
                        )}
                    </Link>

                    {/*USER PROFILE & LOGOUT */}
                    {user ? (
                        <div className="flex items-center gap-4 border-l pl-4 border-slate-200">
                            <div className="hidden lg:flex flex-col items-end leading-none">
                                <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Welcome</span>
                                <span className="text-sm font-black text-slate-900 truncate max-w-[100px]">
                                    {user.displayName ? user.displayName.split(" ")[0] : "Ashraf User"}
                                </span>
                            </div>
                            <button
                                onClick={() => { logout(); navigate("/login"); }}
                                className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                                title="Logout"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] uppercase font-black hover:bg-orange-600 transition-all shadow-lg">
                            Login
                        </Link>
                    )}
                </div>
            </div>

            {/* MOBILE SEARCH */}
            <div className="px-4 pb-4 sm:hidden">
                <input
                    type="text"
                    placeholder="Search furniture..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-4 pr-4 py-2 bg-slate-100 rounded-xl outline-none font-bold text-xs"
                />
            </div>
        </nav>
    );
}