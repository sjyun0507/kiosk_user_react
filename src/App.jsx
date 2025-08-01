import React, { useState, useEffect } from 'react';
import {Routes, Route, useLocation} from 'react-router-dom';
import PaymentPage from './pages/PaymentPage';
import CartPanel from "./components/CartPanel.jsx";
import KioskPage from "./pages/KioskPage.jsx";
import {SuccessPage} from "./pages/Success.jsx";
import {FailPage} from "./pages/Fail.jsx";
import IntroPage from "./pages/IntroPage.jsx";

export const API_SERVER_HOST = 'http://localhost:8080';

function App() {
    const location = useLocation();

    const [cartItems, setCartItems] = useState(
        localStorage.getItem("cartItems") ? JSON.parse(localStorage.getItem("cartItems")) : []
    );

    useEffect(() => {
        if (location.pathname === "/success") {
            setCartItems([]);
            localStorage.removeItem("cartItems");
        }
    }, [location.pathname]);
    return (
        <Routes>
            <Route path="/" element={<IntroPage />} />
            <Route path="/kiosk" element={<KioskPage cartItems={cartItems} setCartItems={setCartItems} />} />
            <Route path="/cart" element={<CartPanel cartItems={cartItems} setCartItems={setCartItems} />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/success" element={<SuccessPage/>} />
            <Route path="/fail" element={<FailPage/>} />
        </Routes>
    );
}
export default App;