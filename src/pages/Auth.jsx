import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import toast from "react-hot-toast";

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");

    const { login, signup, resetPassword } = useAuth();
    const navigate = useNavigate();

    // 🧹 Fields ko khali karne ka function
    const clearInputs = () => {
        setName("");
        setEmail("");
        setPass("");
    };

    // 🔥 Forgot Password Logic
    const handleForgot = async (e) => {
        if (e) e.preventDefault();

        if (!email) {
            return toast.error("Bhai, pehle Email box mein apni email toh dalo! 📧");
        }

        console.log("Resetting password for:", email);
        const resetToast = toast.loading("Reset link bhej rahe hain...");

        try {
            await resetPassword(email);
            toast.success("Link bhej diya! Apna Inbox ya Spam folder dekho. 🚀", { id: resetToast });
        } catch (err) {
            console.error("Firebase Error:", err.code);
            if (err.code === "auth/too-many-requests") {
                toast.error("Bahut zyada requests! Thoda wait karo bhai. ⏳", { id: resetToast });
            } else if (err.code === "auth/user-not-found") {
                toast.error("Ye email register nahi hai! 🤔", { id: resetToast });
            } else {
                toast.error("Galti: " + err.message, { id: resetToast });
            }
        }
    };

    // 📝 Submit Logic with Professional Error Handling
    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading(isLogin ? "Signing in..." : "Creating account...");

        try {
            if (isLogin) {
                await login(email, pass);
                toast.success("Welcome Back! 😊", { id: loadToast });
            } else {
                const userCredential = await signup(email, pass);
                await updateProfile(userCredential.user, { displayName: name });
                toast.success(`Welcome, ${name}! 🚀`, { id: loadToast });
            }
            navigate("/");
        } catch (err) {
            console.error("Auth Error Code:", err.code);
            let errorMessage = "Kuch galti hui, phir se try karo!";

            // 🚨 Custom Error Messages (Wrong Password Fix)
            if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
                errorMessage = "Bhai, Password galat hai! ❌";
            } else if (err.code === "auth/user-not-found") {
                errorMessage = "Ye Email register nahi hai! 🤔";
            } else if (err.code === "auth/invalid-email") {
                errorMessage = "Email ka format sahi nahi hai! 📧";
            } else if (err.code === "auth/too-many-requests") {
                errorMessage = "Bahut zyada koshish kar li, thoda wait karo! ⏳";
            } else if (err.code === "auth/weak-password") {
                errorMessage = "Password kam se kam 6 characters ka rakho! 🔐";
            } else if (err.code === "auth/email-already-in-use") {
                errorMessage = "Ye Email pehle se register hai! 🛑";
            }

            toast.error(errorMessage, { id: loadToast });
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
            <div className="max-w-md w-full p-8 md:p-12 bg-slate-900 rounded-[3rem] text-white shadow-2xl border border-slate-800">

                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black text-orange-500 italic uppercase">
                        {isLogin ? "Login" : "Sign Up"}
                    </h2>
                    <p className="text-slate-400 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">
                        Ashraf Woods Community 🛋️
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {!isLogin && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Full Name</label>
                            <input
                                type="text"
                                placeholder="Ashraf Ali"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-5 bg-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-orange-500 transition-all text-white shadow-inner"
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Email Address</label>
                        <input
                            type="email"
                            placeholder="example@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-5 bg-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-orange-500 transition-all text-white shadow-inner"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Password</label>
                        <input
                            type="password"
                            placeholder="********"
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            className="w-full p-5 bg-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-orange-500 transition-all text-white shadow-inner"
                            required
                        />
                    </div>

                    {isLogin && (
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={handleForgot}
                                className="text-[10px] font-black uppercase text-orange-400 hover:text-white transition-colors tracking-widest cursor-pointer px-2 py-1"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="bg-gradient-to-r from-orange-600 to-amber-500 py-5 rounded-2xl font-black text-xl mt-4 hover:shadow-orange-900/20 hover:shadow-2xl transition-all active:scale-95 text-white uppercase italic shadow-xl"
                    >
                        {isLogin ? "SIGN IN 🔓" : "CREATE ACCOUNT ✨"}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-800 text-center">
                    <p className="font-bold text-slate-500 text-sm">
                        {isLogin ? "Naye ho yahan?" : "Pehle se account hai?"}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                clearInputs(); // 👈 Switch hote hi inputs saaf!
                            }}
                            className="text-orange-500 ml-2 underline decoration-2 underline-offset-4 hover:text-white transition-colors"
                        >
                            {isLogin ? "Create Account" : "Login Now"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}