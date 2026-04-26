import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';
import BannerSlider from '../components/BannerSlider';

export default function Home({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory }) {
    const [furniture, setFurniture] = useState([]);
    const productsRef = useRef(null);

    // Firestore se data lana
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "furniture"), (snap) => {
            setFurniture(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    //  Auto-scroll Logic: Jab user search kare ya category badle
    useEffect(() => {
        if (searchTerm !== "" || selectedCategory !== "All") {
            // setTimeout isliye taki DOM update hone ka time mile
            setTimeout(() => {
                productsRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    }, [searchTerm, selectedCategory]);

    // Filter Logic
    const filtered = furniture.filter(item => {
        const matchesSearch = (item.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
        return matchesSearch && matchesCat;
    });

    // Sab Reset karne ka function
    const handleReset = () => {
        setSelectedCategory("All");
        setSearchTerm("");
    };

    return (
        <div className="pb-20 bg-[#FDFBF7]">
            {/* Slider */}
            <BannerSlider onCategorySelect={setSelectedCategory} />

            <div className="max-w-7xl mx-auto">
                {/* Categories Bar */}
                <div className="flex flex-wrap justify-center gap-3 py-12 overflow-x-auto pb-4 scrollbar-hide px-4">
                    {["All", "Living Room", "Bedroom", "Office", "Dining"].map(cat => (
                        <button
                            key={cat}
                            onClick={() => cat === "All" ? handleReset() : setSelectedCategory(cat)}
                            className={`px-10 py-3 rounded-full font-black text-sm transition-all shadow-sm whitespace-nowrap ${(selectedCategory === cat && searchTerm === "")
                                ? 'bg-orange-600 text-white shadow-xl shadow-orange-200 scale-110'
                                : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div ref={productsRef} className="scroll-mt-32">
                    {(selectedCategory !== "All" || searchTerm !== "") && (
                        <div className="px-6 mb-8 text-center md:text-left">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                {searchTerm ? `Search: ${searchTerm}` : `Collection / ${selectedCategory}`}
                            </p>
                        </div>
                    )}

                    {/* Grid */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="text-8xl mb-6 grayscale opacity-30">🛋️</div>
                            <p className="text-slate-400 font-black text-2xl italic uppercase tracking-tighter">
                                No items found!
                            </p>
                            <button onClick={handleReset} className="mt-4 text-orange-600 font-bold underline">
                                See All Products?
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-12 px-6">
                            {filtered.map(item => (
                                <ProductCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}