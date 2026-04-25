import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Checkout() {
    const { cart, total, clearCart, removeFromCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    // 💾 User ke purane details load karna
    useEffect(() => {
        if (user?.uid) {
            const savedPhone = localStorage.getItem(`phone_${user.uid}`);
            const savedAddress = localStorage.getItem(`address_${user.uid}`);
            if (savedPhone) setPhone(savedPhone);
            if (savedAddress) setAddress(savedAddress);
        }
    }, [user]);

    const handleOrder = async (e) => {
        e.preventDefault();

        // 🚨 CHECKPOINT: Agar user logged in nahi hai
        if (!user) {
            toast.error("Order confirm karne ke liye pehle Login kariye! 😊");
            navigate('/login'); // Seedha login page pe bhej diya
            return;
        }

        if (cart.length === 0) return toast.error("Cart khali hai!");

        setLoading(true);
        const toastId = toast.loading("Placing order...");

        try {
            const orderData = {
                userId: user.uid,
                userName: user.displayName || "User",
                userEmail: user.email,
                customerDetails: { fullName: user.displayName, phone, address },
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    mainImage: item.mainImage || (item.images && item.images[0]) || ""
                })),
                totalAmount: total,
                status: "Pending",
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, "orders"), orderData);

            // Details save karna next time ke liye
            localStorage.setItem(`phone_${user.uid}`, phone);
            localStorage.setItem(`address_${user.uid}`, address);

            if (clearCart) clearCart();
            toast.success("Order Placed! 🚀", { id: toastId });
            navigate('/my-orders');
        } catch (err) {
            toast.error("Order Failed!", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    // 🛒 Empty Cart State
    if (cart.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
                <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl text-center max-w-md w-full border border-slate-100">
                    <div className="text-8xl mb-6 animate-bounce">🛒</div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2 italic uppercase tracking-tighter">Cart Khali Hai</h2>
                    <p className="text-slate-500 font-bold mb-10">Kuch item toh add karo bhai! 😊</p>
                    <Link to="/" className="inline-flex items-center justify-center px-8 py-4 font-black text-white bg-slate-900 rounded-2xl hover:bg-orange-600 shadow-xl transition-all">
                        SHOP NOW 🛍️
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 mb-10 border-l-8 border-orange-600 pl-4">
                Review <span className="text-orange-600">& Checkout</span>
            </h2>

            <div className="flex flex-col lg:flex-row gap-12 items-start">

                {/* 🛒 SECTION 1: PRODUCT SUMMARY */}
                <div className="w-full lg:w-5/12 order-1">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2">Items in your cart</h4>
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 md:p-6 shadow-xl">
                        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-hide">
                            {cart.map((item, i) => (
                                <div key={i} className="flex items-center gap-4 bg-slate-50 p-3 md:p-4 rounded-[2rem] border border-slate-100 relative transition-all hover:bg-white hover:shadow-md">
                                    <div onClick={() => navigate(`/product/${item.id}`)} className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-white cursor-pointer shadow-sm border-2 border-white">
                                        <img src={item.mainImage || (item.images && item.images[0])} className="w-full h-full object-cover" alt={item.name} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 onClick={() => navigate(`/product/${item.id}`)} className="font-black text-slate-800 leading-tight text-sm md:text-base uppercase italic truncate cursor-pointer hover:text-orange-600 transition-colors">{item.name}</h5>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{item.category}</p>
                                        <p className="text-orange-600 font-black text-lg mt-1">₹{Number(item.price).toLocaleString()}</p>
                                    </div>
                                    <button type="button" onClick={() => { removeFromCart(item.id); toast.success("Item Removed! 🗑️"); }} className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center transition-all hover:bg-red-500 hover:text-white active:scale-90 flex-shrink-0 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-100 px-2">
                            <div className="flex justify-between items-center">
                                <span className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Grand Total</span>
                                <span className="text-3xl font-black text-slate-900 italic tracking-tighter">₹{total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📋 SECTION 2: SHIPPING FORM */}
                <div className="w-full lg:w-7/12 order-2">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2">Shipping Details</h4>
                    <form onSubmit={handleOrder} className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] shadow-2xl text-white space-y-6">
                        <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Customer</p>
                            <p className="text-xl font-black text-white italic">
                                {user ? user.displayName : "Login required to confirm order"}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Phone Number</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="10 Digit Number"
                                required
                                maxLength="10"
                                className="w-full p-5 bg-slate-800 rounded-3xl outline-none font-bold text-white border-2 border-transparent focus:border-orange-500 transition-all placeholder:text-slate-600 shadow-inner"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Full Address</label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="House no, Area, City..."
                                required
                                className="w-full p-5 bg-slate-800 rounded-3xl outline-none font-bold text-white border-2 border-transparent focus:border-orange-500 transition-all h-32 resize-none placeholder:text-slate-600 shadow-inner"
                            />
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white py-6 rounded-[2.5rem] font-black text-2xl hover:shadow-orange-900/20 hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50 uppercase italic"
                        >
                            {loading ? "PROCESSING..." : user ? "CONFIRM ORDER 🚀" : "LOGIN TO ORDER 🔒"}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}