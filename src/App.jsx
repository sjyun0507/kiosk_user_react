import React, { useState, useEffect } from 'react';
import {Routes, Route } from 'react-router-dom';
import PaymentPage from './pages/PaymentPage';
import CartPanel from "./components/CartPanel.jsx";
import KioskPage from "./pages/KioskPage.jsx";
import {SuccessPage} from "./pages/Success.jsx";
import {FailPage} from "./pages/Fail.jsx";

export const API_SERVER_HOST = 'http://localhost:8080';

function App() {
    const [cartItems, setCartItems] = useState(
        localStorage.getItem("cartItems") ? JSON.parse(localStorage.getItem("cartItems")) : []
    );
    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }, [cartItems]);

    return (
        <Routes>
            <Route path="/" element={<KioskPage cartItems={cartItems} setCartItems={setCartItems} />} />
            <Route path="/cart" element={<CartPanel cartItems={cartItems} setCartItems={setCartItems} />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/success" element={<SuccessPage/>} />
            <Route path="/fail" element={<FailPage/>} />
        </Routes>
    );
}
export default App;