import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth(); // Check karo aapke context mein ye function hai ya nahi
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) return toast.error("Bhai, email toh daalo! 📧");

        setLoading(true);
        const toastId = toast.loading("Sending reset link...");

        try {
            await resetPassword(email);
            toast.success("Password reset link aapke email pe bhej diya hai! 📩", { id: toastId });

            // Link bhejne ke baad user ko login pe wapas bhej do
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            console.error(error);
            // Common Errors: user-not-found ya invalid-email
            toast.error("Galti: " + error.message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
            <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg shadow-orange-50">
                        🔐
                    </div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
                        Forgot <span className="text-orange-600">Password?</span>
                    </h2>
                    <p className="text-slate-400 font-bold mt-2 text-sm">
                        Koi baat nahi bhai, email daalo link aa jayega!
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Email Address</label>
                        <input
                            type="email"
                            placeholder="example@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 border-2 border-transparent focus:border-orange-500 transition-all shadow-inner"
                        />
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-orange-600 transition-all shadow-xl active:scale-95 uppercase tracking-widest disabled:opacity-50"
                    >
                        {loading ? "SENDING..." : "RESET PASSWORD 🚀"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-sm font-black text-slate-400 hover:text-orange-600 transition-colors uppercase">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}