import { Link, useNavigate } from 'react-router-dom';

export default function Footer({ setSelectedCategory }) {
    const navigate = useNavigate();

    const handleCategoryClick = (cat) => {
        setSelectedCategory(cat);
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'instant' });
    };

    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-10 mt-20 rounded-t-[3rem] md:rounded-t-[6rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px] -z-10"></div>

            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                {/* 🛠️ GRID FIX: 
                   Mobile pe 2 columns (grid-cols-2) 
                   Desktop pe 4 columns (lg:grid-cols-4) 
                */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 mb-16">

                    {/* 1. BRAND (Full Width on Mobile for better look) */}
                    <div className="col-span-2 lg:col-span-1 space-y-4">
                        <h2 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter">
                            Ashraf <span className="text-orange-600">Woods</span>
                        </h2>
                        <p className="text-xs md:text-sm font-bold text-slate-400">Handcrafted furniture for your soul. 🛋️</p>
                    </div>

                    {/* 2. NAVIGATION */}
                    <div className="space-y-5">
                        <h4 className="text-white font-black uppercase text-[10px] tracking-widest border-l-4 border-orange-600 pl-3">Navigation</h4>
                        <ul className="space-y-3 font-bold text-xs md:text-sm">
                            <li>
                                <Link to="/" onClick={() => { setSelectedCategory("All"); window.scrollTo(0, 0); }} className="hover:text-orange-500 flex items-center gap-2">
                                    🏠 Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/checkout" className="hover:text-orange-500 flex items-center gap-2">
                                    🛒 My Cart
                                </Link>
                            </li>
                            <li>
                                <Link to="/my-orders" className="hover:text-orange-500 flex items-center gap-2">
                                    📦 Orders
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* 3. EXPLORE */}
                    <div className="space-y-5">
                        <h4 className="text-white font-black uppercase text-[10px] tracking-widest border-l-4 border-orange-600 pl-3">Explore</h4>
                        <ul className="space-y-3 font-bold text-xs md:text-sm">
                            {[
                                { name: 'Living Room', icon: '🛋️' },
                                { name: 'Bedroom', icon: '🛏️' },
                                { name: 'Dining', icon: '🍽️' },
                                { name: 'Office', icon: '💼' }
                            ].map((item) => (
                                <li
                                    key={item.name}
                                    onClick={() => handleCategoryClick(item.name)}
                                    className="hover:text-orange-500 cursor-pointer flex items-center gap-2 transition-all"
                                >
                                    <span className="text-[10px]">{item.icon}</span> {item.name}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 4. CONTACT */}
                    <div className="col-span-2 lg:col-span-1 space-y-5 mt-4 lg:mt-0">
                        <h4 className="text-white font-black uppercase text-[10px] tracking-widest border-l-4 border-orange-600 pl-3">Contact</h4>
                        <div className="space-y-2 text-xs md:text-sm font-bold">
                            <p>📍 Lucknow, UP</p>
                            <p className="text-orange-500">📞 +91 9936XXXXXX</p>
                        </div>
                    </div>

                </div>

                <div className="border-t border-slate-800 pt-8 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                        © 2026 ASHRAF WOODS. MADE BY ASHRAF ALI.
                    </p>
                </div>
            </div>
        </footer>
    );
}