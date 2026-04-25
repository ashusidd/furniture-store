import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Admin() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [desc, setDesc] = useState("");
    const [category, setCategory] = useState("Living Room"); // 👈 Default category

    // 📸 Image States
    const [mainImageFile, setMainImageFile] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [existingMain, setExistingMain] = useState("");
    const [existingGallery, setExistingGallery] = useState([]);
    const [loading, setLoading] = useState(false);

    const editMode = state && state.product;

    useEffect(() => {
        if (editMode) {
            const p = state.product;
            setName(p.name || "");
            setPrice(p.price || "");
            setDesc(p.description || "");
            setCategory(p.category || "Living Room");
            setExistingMain(p.mainImage || "");
            setExistingGallery(p.subImages || []);
        }
    }, [editMode, state]);

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET");
        const res = await fetch("https://api.cloudinary.com/v1_1/import.meta.env.VITE_CLOUDINARY_CLOUD_NAME/image/upload", {
            method: "POST", body: formData
        });
        const data = await res.json();
        return data.secure_url;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading("Processing images...");

        try {
            let finalMainImage = existingMain;
            let finalGallery = [...existingGallery];

            if (mainImageFile) {
                finalMainImage = await uploadToCloudinary(mainImageFile);
            }

            if (galleryFiles.length > 0) {
                const newGalleryUrls = await Promise.all(
                    [...galleryFiles].map(file => uploadToCloudinary(file))
                );
                finalGallery = [...finalGallery, ...newGalleryUrls];
            }

            const productData = {
                name,
                price: Number(price),
                description: desc,
                category, // 👈 Category save ho rahi hai
                mainImage: finalMainImage,
                subImages: finalGallery,
                updatedAt: serverTimestamp()
            };

            if (editMode) {
                await updateDoc(doc(db, "furniture", state.product.id), productData);
                toast.success("Updated Successfully! 🔄", { id: toastId });
            } else {
                if (!mainImageFile) throw new Error("Main Image is required!");
                productData.createdAt = serverTimestamp();
                await addDoc(collection(db, "furniture"), productData);
                toast.success("Product Added! 🚀", { id: toastId });
            }
            navigate('/');
        } catch (err) {
            toast.error(err.message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-[3rem] shadow-2xl mt-10">
            <h2 className="text-3xl font-black mb-8 border-l-8 border-orange-500 pl-4 italic">
                {editMode ? "Refine Product" : "Launch New Product"}
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Product Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Price (₹)</label>
                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="9999" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" required />
                    </div>
                </div>

                {/* 🏷️ CATEGORY DROPDOWN (Restored) */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Select Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 cursor-pointer border-r-[16px] border-transparent"
                        required
                    >
                        <option value="Living Room">Living Room 🛋️</option>
                        <option value="Bedroom">Bedroom 🛏️</option>
                        <option value="Dining">Dining 🍽️</option>
                        <option value="Office">Office 💼</option>
                        <option value="Best Selling">Best Selling 🔥</option>
                    </select>
                </div>

                {/* 🖼️ Main Profile Image Section */}
                <div className="p-6 bg-blue-50 border-2 border-dashed border-blue-200 rounded-[2rem]">
                    <label className="block text-xs font-black uppercase text-blue-600 mb-2 tracking-tighter">Main Profile Photo (Display on Card)</label>
                    <input type="file" onChange={(e) => setMainImageFile(e.target.files[0])} className="text-sm font-bold" />
                    {existingMain && <img src={existingMain} className="w-20 h-20 mt-2 rounded-xl object-cover border-2 border-white shadow-sm" alt="Current Main" />}
                </div>

                {/* 📸 Gallery Section */}
                <div className="p-6 bg-orange-50 border-2 border-dashed border-orange-200 rounded-[2rem]">
                    <label className="block text-xs font-black uppercase text-orange-600 mb-2 tracking-tighter">Gallery Images (Product Views)</label>
                    <input type="file" multiple onChange={(e) => setGalleryFiles(e.target.files)} className="text-sm font-bold" />
                    <div className="flex gap-2 mt-2 overflow-x-auto">
                        {existingGallery.map((img, i) => (
                            <img key={i} src={img} className="w-12 h-12 rounded-lg object-cover border border-white shadow-sm" />
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Full Description</label>
                    <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Full Description" className="w-full p-4 bg-slate-50 rounded-2xl outline-none h-32 font-bold resize-none" required />
                </div>

                <button disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-orange-600 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                    {loading ? "SAVING..." : (editMode ? "UPDATE PRODUCT 🔄" : "LAUNCH PRODUCT 🚀")}
                </button>
            </form>
        </div>
    );
}