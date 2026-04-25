import { useState, useEffect } from 'react';

const banners = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop",
        title: "Living Room",
        category: "Living Room",
        desc: "Luxurious Comfort for Your Home 🛋️"
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070&auto=format&fit=crop",
        title: "Bedroom",
        category: "Bedroom",
        desc: "Dreamy Spaces for Better Sleep 🛏️"
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070&auto=format&fit=crop",
        title: "Office",
        category: "Office",
        desc: "Work in Style & Focus 💼"
    },
    {
        id: 4,
        // ✅ Nayi Dining Image (Working Link)
        image: "https://s3.ap-south-1.amazonaws.com/images.woodenstreet.de/image/data/blog-images/dining-room-decor-ideas/dining-room-decor-ideas.png?q=80&w=2070&auto=format&fit=crop",
        title: "Dining",
        category: "Dining",
        desc: "Elegant Dining Experience 🍽️"
    }
];

export default function BannerSlider({ onCategorySelect }) {
    const [current, setCurrent] = useState(0);
    const [touchStart, setTouchStart] = useState(null);

    // ⚡ Fast Slide: 2 seconds for quick look
    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 2000);
        return () => clearInterval(timer);
    }, [current]);

    const nextSlide = () => {
        setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    // 🖐️ Swipe Logic
    const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
    const handleTouchEnd = (e) => {
        if (!touchStart) return;
        const touchEnd = e.changedTouches[0].clientX;
        if (touchStart - touchEnd > 50) nextSlide();
        if (touchStart - touchEnd < -50) prevSlide();
        setTouchStart(null);
    };

    const handleBannerClick = () => {
        onCategorySelect(banners[current].category);
        // Scroll adjustment for new small height
        window.scrollTo({ top: 350, behavior: 'smooth' });
    };

    return (
        <div
            className="relative w-full h-[280px] md:h-[450px] overflow-hidden bg-slate-900 group touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    onClick={handleBannerClick}
                    className={`absolute inset-0 transition-all duration-700 ease-out cursor-pointer ${index === current ? "opacity-100 scale-100 z-10" : "opacity-0 z-0 pointer-events-none"
                        }`}
                >
                    <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover opacity-60"
                    />

                    <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-24 text-white">
                        <h2 className="text-4xl md:text-8xl font-black italic uppercase tracking-tighter drop-shadow-2xl leading-[0.9]">
                            {banner.title}
                        </h2>
                        <p className="text-sm md:text-2xl font-bold mt-2 md:mt-4 text-orange-400 max-w-[250px] md:max-w-lg">
                            {banner.desc}
                        </p>
                        <button className="mt-5 md:mt-10 bg-white text-black font-black px-6 md:px-12 py-2.5 md:py-5 rounded-xl md:rounded-2xl w-fit hover:bg-orange-600 hover:text-white transition-all uppercase tracking-widest text-[10px] md:text-xs active:scale-95 shadow-2xl">
                            Shop Now 🛍️
                        </button>
                    </div>
                </div>
            ))}

            {/* Manual Controls (Hidden on mobile) */}
            <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/40 p-4 rounded-full backdrop-blur-md transition-all text-white">
                ❮
            </button>
            <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/40 p-4 rounded-full backdrop-blur-md transition-all text-white">
                ❯
            </button>

            {/* Dots UI */}
            <div className="absolute bottom-5 md:bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {banners.map((_, i) => (
                    <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                        className={`h-1 md:h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-10 md:w-16 bg-orange-500" : "w-2 md:w-3 bg-white/40"}`}
                    />
                ))}
            </div>
        </div>
    );
}