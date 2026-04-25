import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProductCard({ item }) {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
    const isAdmin = user && user.email === ADMIN_EMAIL;

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm("Bhai, delete kar dein?")) {
            await deleteDoc(doc(db, "furniture", item.id));
            toast.success("Deleted!");
        }
    };

    const displayImage = item.mainImage || (item.images && item.images[0]) || "https://via.placeholder.com/300";

    return (
        <div
            onClick={() => navigate(`/product/${item.id}`)}
            className="bg-white p-2 md:p-5 rounded-[1.5rem] md:rounded-[3rem] shadow-sm border border-slate-100 group hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden flex flex-col w-full h-full"
        >
            {/* 🖼️ Image Container - W-Full ensure karta hai gap na rahe */}
            <div className="w-full h-44 md:h-72 overflow-hidden rounded-[1.2rem] md:rounded-[2.5rem] mb-3 relative bg-slate-50">
                <img
                    src={displayImage}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Admin Controls */}
                {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button onClick={(e) => { e.stopPropagation(); navigate('/admin', { state: { product: item } }); }} className="bg-white p-1.5 rounded-full text-blue-500 shadow-md">✏️</button>
                        <button onClick={handleDelete} className="bg-white p-1.5 rounded-full text-red-500 shadow-md">🗑️</button>
                    </div>
                )}
            </div>

            {/* 📝 Content Area */}
            <div className="flex flex-col flex-grow px-1">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] md:text-[10px] font-black uppercase text-orange-600 tracking-tighter bg-orange-50 px-2 py-0.5 rounded-md">
                        {item.category}
                    </span>
                </div>

                <h3 className="text-sm md:text-xl font-black text-slate-800 line-clamp-1 italic uppercase tracking-tighter">
                    {item.name}
                </h3>

                <div className="mt-auto pt-3 flex flex-col gap-2">
                    <p className="text-lg md:text-2xl font-black text-slate-900 leading-none">
                        ₹{Number(item.price).toLocaleString()}
                    </p>
                    <button
                        onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                        className="w-full bg-slate-900 text-white py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm hover:bg-orange-600 transition-all active:scale-95 shadow-md uppercase tracking-widest"
                    >
                        Add 🛒
                    </button>
                </div>
            </div>
        </div>
    );
}