import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart((prev) => [...prev, product]);
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    // 🔥 Ye function missing tha, isliye white screen aayi
    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("cart");
    };

    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, total, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);