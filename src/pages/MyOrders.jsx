import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function MyOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "orders"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snap) => {
            setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user]);

    const handleCancelOrder = async (orderId) => {
        if (window.confirm("Bhai, order cancel karna hai?")) {
            try {
                await updateDoc(doc(db, "orders", orderId), {
                    status: "Cancelled",
                    deliveryDate: "Cancelled by User"
                });
                toast.success("Order Cancelled!");
            } catch (err) { toast.error("Error!"); }
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h2 className="text-3xl font-black mb-8 italic">My Orders</h2>
            <div className="space-y-6">
                {orders.map(order => (
                    <div key={order.id} className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${order.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                }`}>{order.status}</span>

                            {/* ❌ Sirf User ko Cancel ka option */}
                            {order.status === "Pending" && (
                                <button onClick={() => handleCancelOrder(order.id)} className="text-red-500 text-xs font-bold underline">Cancel Order</button>
                            )}
                        </div>
                        {/* Items List */}
                        {order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 mb-2">
                                <img src={item.mainImage} className="w-10 h-10 rounded-lg object-cover" alt="" />
                                <span className="font-bold text-sm">{item.name}</span>
                            </div>
                        ))}
                        <div className="mt-4 pt-4 border-t border-dashed border-slate-100">
                            <p className="text-sm font-bold">Status: <span className="text-orange-600">{order.deliveryDate}</span></p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}