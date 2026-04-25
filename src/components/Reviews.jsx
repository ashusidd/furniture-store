import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function Reviews({ productId }) {
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState("");

    // 📝 Reviews Load Karo
    useEffect(() => {
        const q = query(collection(db, "reviews"), where("productId", "==", productId));
        return onSnapshot(q, (snap) => {
            setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    }, [productId]);

    // 🚀 Review Submit Karo
    const submitReview = async (e) => {
        e.preventDefault();
        if (!userReview.trim()) return;

        try {
            await addDoc(collection(db, "reviews"), {
                productId,
                text: userReview,
                createdAt: serverTimestamp()
            });
            setUserReview("");
            toast.success("Review added! ⭐");
        } catch (err) {
            toast.error("Review save nahi hua!");
        }
    };

    return (
        <div className="mt-12">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Customer Reviews ({reviews.length})</h3>

            {/* Form */}
            <form onSubmit={submitReview} className="mb-8 flex gap-2">
                <input
                    type="text" value={userReview} onChange={(e) => setUserReview(e.target.value)}
                    placeholder="Share your experience..."
                    className="flex-1 p-4 bg-white rounded-2xl outline-none border border-slate-100 font-medium focus:border-orange-500 transition-all"
                />
                <button className="bg-orange-600 text-white px-6 rounded-2xl font-black hover:bg-slate-900 transition-all">Post</button>
            </form>

            {/* List */}
            <div className="space-y-4">
                {reviews.length === 0 ? <p className="text-slate-400 italic">No reviews yet. Be the first!</p> : (
                    reviews.map(r => (
                        <div key={r.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50 animate-in fade-in slide-in-from-bottom-2">
                            <p className="text-slate-700 font-medium italic">"{r.text}"</p>
                            <p className="text-[10px] text-slate-300 font-black uppercase mt-2">Verified Customer</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}