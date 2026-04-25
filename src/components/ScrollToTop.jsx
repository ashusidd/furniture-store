import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Ye line browser ko force karegi ki page top pe jaye
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant' // 'smooth' ki jagah 'instant' rakha hai taaki turant upar jaye
        });
    }, [pathname]);

    return null;
}