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

    //  In-line Error States
    const [emailError, setEmailError] = useState("");
    const [passError, setPassError] = useState("");

    const { login, signup, resetPassword } = useAuth();
    const navigate = useNavigate();

    const clearInputs = () => {
        setName("");
        setEmail("");
        setPass("");
        setEmailError("");
        setPassError("");
    };

    //  Validation Logic (Client Side)
    const validate = () => {
        let isValid = true;
        if (!email) {
            setEmailError("Email likhna zaroori hai! ");
            isValid = false;
        }
        if (!pass) {
            setPassError("Password toh dalo bhai! ");
            isValid = false;
        } else if (pass.length < 6) {
            setPassError("Kam se kam 6 characters zaroori hain! ");
            isValid = false;
        }
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        //  Reset errors on every click so UI updates every time
        setEmailError("");
        setPassError("");

        if (!validate()) return;

        const loadToast = toast.loading(isLogin ? "Signing in..." : "Creating account...");

        try {
            if (isLogin) {
                await login(email, pass);
                toast.success("Welcome Back! ", { id: loadToast });
            } else {
                const userCredential = await signup(email, pass);
                await updateProfile(userCredential.user, { displayName: name });
                toast.success(`Welcome, ${name}! `, { id: loadToast });
            }
            navigate("/");
        } catch (err) {
            console.error("Auth Error Code:", err.code);
            toast.dismiss(loadToast);

            //  In-line Error Handling (Firebase Errors)
            if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
                setPassError("Password galat hai! Dubara check karo. ");
            } else if (err.code === "auth/user-not-found") {
                setEmailError("Ye Email register nahi hai! ");
            } else if (err.code === "auth/email-already-in-use") {
                setEmailError("Ye email pehle se register hai! ");
            } else if (err.code === "auth/invalid-email") {
                setEmailError("Email format galat hai! ");
            } else if (err.code === "auth/too-many-requests") {
                toast.error("Bohot baar try kiya, thodi der baad aao! ");
            } else {
                toast.error(err.message);
            }
        }
    };

    const handleForgot = async () => {
        if (!email) return setEmailError("Pehle Email toh dalo reset ke liye! ");
        const resetToast = toast.loading("Link bhej rahe hain...");
        try {
            await resetPassword(email);
            toast.success("Reset link bhej diya! Check your inbox. ", { id: resetToast });
        } catch (err) {
            toast.error(err.message, { id: resetToast });
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
                        Ashraf Woods Community
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {!isLogin && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Full Name</label>
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-5 bg-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-orange-500 transition-all text-white shadow-inner"
                                required
                            />
                        </div>
                    )}

                    {/* Email Input Group */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Email Address</label>
                        <input
                            type="email"
                            placeholder="@gmail.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                            className={`w-full p-5 bg-slate-800 rounded-2xl outline-none font-bold text-sm transition-all text-white shadow-inner border-2 ${emailError ? "border-orange-500 ring-2 ring-orange-500/20" : "border-transparent focus:ring-2 ring-orange-500"}`}
                        />
                        {emailError && <p className="text-orange-500 text-[10px] font-black ml-4 mt-1 italic tracking-wider animate-pulse">{emailError}</p>}
                    </div>

                    {/* Password Input Group */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Password</label>
                        <input
                            type="password"
                            placeholder="********"
                            value={pass}
                            onChange={(e) => { setPass(e.target.value); setPassError(""); }}
                            className={`w-full p-5 bg-slate-800 rounded-2xl outline-none font-bold text-sm transition-all text-white shadow-inner border-2 ${passError ? "border-orange-500 ring-2 ring-orange-500/20" : "border-transparent focus:ring-2 ring-orange-500"}`}
                        />
                        {passError && <p className="text-orange-500 text-[10px] font-black ml-4 mt-1 italic tracking-wider animate-pulse">{passError}</p>}
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
                        {isLogin ? "SIGN IN " : "CREATE ACCOUNT "}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-800 text-center">
                    <p className="font-bold text-slate-500 text-sm">
                        {isLogin ? "New Here?" : "already have account?"}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                clearInputs();
                            }}
                            className="text-orange-500 ml-2 underline decoration-2 underline-offset-4 hover:text-white transition-colors font-black"
                        >
                            {isLogin ? "Create Account" : "Login Now"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}