import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [dates, setDates] = useState({});

    useEffect(() => {
        // Latest orders upar dikhane ke liye
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snap) => {
            setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    // Order Confirm Logic (Pending -> Confirmed)
    const handleConfirm = async (orderId) => {
        const dateValue = dates[orderId];
        if (!dateValue) return toast.error("Bhai, date toh daal do!");

        try {
            await updateDoc(doc(db, "orders", orderId), {
                deliveryDate: dateValue,
                status: "Confirmed"
            });
            toast.success("Order Confirm ho gaya!");
        } catch (err) { toast.error("Fail ho gaya!"); }
    };

    //Order Delivered Logic (Confirmed -> Delivered)
    const handleDelivered = async (orderId) => {
        try {
            await updateDoc(doc(db, "orders", orderId), {
                status: "Delivered",
                deliveryDate: "Successfully Delivered!"
            });
            toast.success("Mubarak ho! Order deliver ho gaya.");
        } catch (err) { toast.error("Update fail hua!"); }
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 min-h-screen bg-slate-50">
            <h2 className="text-4xl font-black italic border-l-8 border-orange-600 pl-6 uppercase mb-12">
                Admin <span className="text-orange-600">Order Center</span>
            </h2>

            <div className="grid gap-10">
                {orders.map(order => (
                    <div key={order.id} className={`bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border-2 transition-all ${order.status === "Pending" ? "border-orange-500 scale-100" :
                        order.status === "Delivered" ? "border-green-500 opacity-90 scale-[0.98]" : "border-transparent"
                        }`}>

                        {/*Customer Details Header */}
                        <div className={`p-8 flex flex-col md:flex-row justify-between gap-6 ${order.status === 'Pending' ? 'bg-orange-50' :
                            order.status === 'Delivered' ? 'bg-green-50' : 'bg-blue-50'
                            }`}>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'Pending' ? 'bg-orange-600 text-white animate-pulse' :
                                        order.status === 'Delivered' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                                        }`}>
                                        {order.status}
                                    </span>
                                    <p className="text-[10px] font-bold text-slate-400">#ORD-{order.id.slice(-6).toUpperCase()}</p>
                                </div>
                                <h3 className="text-3xl font-black text-slate-900">{order.customerDetails?.fullName}</h3>
                                <p className="text-slate-500 font-bold">
                                    📞 {order.customerDetails?.phone} <span className="mx-2">|</span> 📍 {order.customerDetails?.address}
                                </p>
                            </div>
                            <div className="md:text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase">Grand Total</p>
                                <p className="text-4xl font-black text-slate-900 italic">₹{order.totalAmount?.toLocaleString()}</p>
                            </div>
                        </div>

                        {/*Order Items List */}
                        <div className="p-8 border-t border-slate-50">
                            <div className="flex gap-4 flex-wrap">
                                {order.items?.map((item, idx) => (
                                    <Link key={idx} to={`/product/${item.id}`} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 hover:border-orange-500 transition-all">
                                        <img src={item.mainImage} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                                        <span className="font-black text-slate-700 text-xs">{item.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Action Panel (Yahi logic hai Delivered ka) */}
                        <div className="p-8 bg-slate-900 text-white">
                            {order.status === "Pending" ? (
                                /* Mode 1: Confirming the Order */
                                <div className="flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-1 w-full">
                                        <p className="text-[10px] font-black text-slate-500 uppercase mb-2 ml-2 tracking-widest">Set Delivery Date</p>
                                        <input
                                            type="text"
                                            placeholder="e.g. Arriving this Sunday"
                                            className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-orange-500"
                                            onChange={(e) => setDates({ ...dates, [order.id]: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleConfirm(order.id)}
                                        className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-orange-900/40 w-full md:w-auto"
                                    >
                                        CONFIRM & SCHEDULE
                                    </button>
                                </div>
                            ) : order.status === "Confirmed" ? (
                                /* Mode 2: Marking as Delivered */
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                                        <p className="text-blue-400 font-black italic">On its way: {order.deliveryDate}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelivered(order.id)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-green-900/40 transition-all active:scale-95"
                                    >
                                        MARK AS DELIVERED
                                    </button>
                                </div>
                            ) : (
                                /* Mode 3: Order Completed or Cancelled */
                                <div className={`p-4 rounded-2xl border text-center w-full ${order.status === 'Cancelled' ? 'bg-red-900/20 border-red-800' : 'bg-green-900/20 border-green-800'}`}>
                                    <p className={`font-black tracking-widest uppercase ${order.status === 'Cancelled' ? 'text-red-400' : 'text-green-400'}`}>
                                        {order.status === 'Cancelled' ? 'Order Cancelled' : 'Order Successfully Delivered'}
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}