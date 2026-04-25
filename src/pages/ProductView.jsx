import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductView() {
    const { id } = useParams();
    const { user } = useAuth();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMainImage, setSelectedMainImage] = useState("");
    const [modalImage, setModalImage] = useState(null);

    // Review States
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [revImage, setRevImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const docSnap = await getDoc(doc(db, "furniture", id));
                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() };
                    setProduct(data);

                    // ✅ Aapka Logic: Sabhi images ko ek list mein merge kiya
                    const allImages = [
                        data.mainImage,
                        ...(data.subImages || (data.images ? data.images : []))
                    ].filter(Boolean);

                    setSelectedMainImage(allImages[0] || "");
                }
            } catch (err) { console.error(err); }
            setLoading(false);
        };

        const q = query(collection(db, "reviews"), where("productId", "==", id));
        const unsub = onSnapshot(q, (snap) => {
            setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        fetchProduct();
        return () => unsub();
    }, [id]);

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET");
        const res = await fetch("https://api.cloudinary.com/v1_1/import.meta.env.VITE_CLOUDINARY_CLOUD_NAME/image/upload", {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        return data.secure_url;
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) return toast.error("Login first!");
        setUploading(true);
        try {
            let imageUrl = "";
            if (revImage) {
                imageUrl = await uploadToCloudinary(revImage);
            }
            await addDoc(collection(db, "reviews"), {
                productId: id, userId: user.uid, userName: user.displayName || "User",
                rating, text: reviewText, reviewImage: imageUrl, createdAt: serverTimestamp()
            });
            toast.success("Review posted!");
            setReviewText(""); setRevImage(null);
        } catch (err) { toast.error("Upload error!"); }
        finally { setUploading(false); }
    };

    if (loading) return <div className="py-20 text-center font-black italic">Loading...</div>;
    if (!product) return <div className="py-20 text-center font-black">Not Found!</div>;

    // ✅ List taiyar karo gallery ke liye
    const displayImages = [
        product.mainImage,
        ...(product.subImages || (Array.isArray(product.images) ? product.images : []))
    ].filter(Boolean);

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

                {/* 🖼️ GALLERY SECTION */}
                <div className="space-y-6">
                    <div className="rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-white aspect-square">
                        <img src={selectedMainImage} className="w-full h-full object-cover" alt="" />
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-2">
                        {displayImages.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedMainImage(img)}
                                className={`w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-4 transition-all ${selectedMainImage === img ? 'border-orange-500 scale-105 shadow-md' : 'border-white opacity-70'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt="thumb" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* 📝 INFO SECTION */}
                <div className="flex flex-col justify-center space-y-8">
                    <div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-4">{product.name}</h1>
                        <p className="text-orange-600 text-5xl font-black italic">₹{Number(product.price).toLocaleString()}</p>
                    </div>
                    <p className="text-slate-500 font-bold leading-relaxed">{product.description}</p>
                    <button onClick={() => addToCart(product)} className="bg-slate-900 text-white py-6 rounded-[2rem] font-black text-2xl hover:bg-orange-600 transition-all shadow-xl active:scale-95">ADD TO BASKET 🛒</button>
                </div>
            </div>

            {/* ⭐ REVIEWS SECTION */}
            <div className="border-t-2 border-dashed border-slate-200 pt-16">
                <h2 className="text-3xl font-black mb-10 uppercase italic">Customer Gallery & Feedback</h2>

                <form onSubmit={handleReviewSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 mb-16 space-y-6">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} type="button" onClick={() => setRating(n)} className={`text-3xl ${n <= rating ? 'text-orange-500' : 'text-slate-200'}`}>★</button>
                        ))}
                    </div>
                    <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Review..." className="w-full p-5 bg-slate-50 rounded-3xl outline-none font-bold h-28 border-2 border-transparent focus:border-orange-500" required />
                    <div className="flex flex-col md:flex-row gap-4">
                        <label className="flex-1 flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50">
                            📷 <span className="font-black text-slate-400 text-xs">{revImage ? revImage.name : "Add Photo"}</span>
                            <input type="file" className="hidden" onChange={(e) => setRevImage(e.target.files[0])} />
                        </label>
                        <button disabled={uploading} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs">{uploading ? "..." : "POST REVIEW"}</button>
                    </div>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map(rev => (
                        <div key={rev.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                            <div className="flex justify-between font-black text-xs uppercase"><p>{rev.userName}</p><p className="text-orange-500">{"★".repeat(rev.rating)}</p></div>
                            {rev.reviewImage && (
                                <img src={rev.reviewImage} onClick={() => setModalImage(rev.reviewImage)} className="w-full h-32 rounded-xl object-cover cursor-pointer border" alt="" />
                            )}
                            <p className="text-slate-500 font-bold text-sm leading-tight">{rev.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 🔍 MODAL */}
            {modalImage && (
                <div className="fixed inset-0 bg-black/95 z-[5000] flex items-center justify-center p-4" onClick={() => setModalImage(null)}>
                    <button className="absolute top-10 right-10 text-white text-5xl" onClick={() => setModalImage(null)}>&times;</button>
                    <img src={modalImage} className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl" alt="" />
                </div>
            )}
        </div>
    );
}