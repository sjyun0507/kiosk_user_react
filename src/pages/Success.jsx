import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/* 결제 성공페이지 */

export function SuccessPage() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId") || "";

    const [dbOrderId, setDbOrderId] = useState(null);  // 새로 저장할 DB의 order_id

    //orderId, amount, paymentKey → URL 파라미터에서 가져옴
    useEffect(() => {
        const requestData = {
            orderId: searchParams.get("orderId"),
            amount: searchParams.get("amount"),
            paymentKey: searchParams.get("paymentKey"),
        };

        if (!requestData.orderId || !requestData.amount || !requestData.paymentKey) {
            console.error("누락된 결제 요청 정보:", requestData);
            navigate(`/fail?message=${encodeURIComponent("잘못된 결제 정보입니다.")}&code=INVALID_REQUEST`);
            return;
        }

        async function confirmPayment() {
            try {
                const response = await fetch("http://localhost:8080/api/pay/confirm", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestData),
                });
                const json = await response.json();

                if (!response.ok) {
                    navigate(`/fail?message=${encodeURIComponent(json.message)}&code=${json.code}`);
                    return;
                }
                // DB에서 생성된 order_id 저장
                setDbOrderId(json.orderId);

            } catch (error) {
                console.error("결제 확인 중 오류 발생:", error);
                navigate(`/fail?message=${encodeURIComponent("서버 오류입니다.")}&code=SERVER_ERROR`);
            }
        }
        confirmPayment();
    }, []);

    useEffect(() => {
        const storedCart = localStorage.getItem("cartItems");
        if (storedCart) {
            try {
                setCartItems(JSON.parse(storedCart));
            } catch (e) {
                console.error("Invalid cart data");
            }
        }
    }, []);

        //결제완료 후 메인으로 돌아가기
       const handleBackToMain = () => {
           localStorage.removeItem("cartItems");
           navigate("/", { replace: true });
       }

    return (
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center py-8 px-2">
            <div className="w-full max-w-md p-8 font-sans receipt-container relative bg-white shadow-lg rounded-lg border border-gray-300">
                <h2 className="text-3xl font-bold mb-8 border-b pb-4 text-gray-800 text-center">영수증</h2>
                <div className="space-y-2 mb-8 text-sm text-gray-700">
                    <p><strong>업체명 :</strong> BEANS COFFEE</p>
                    <p><strong>주문일자 :</strong> {new Date().toLocaleString()}</p>
                    <p><strong>결제번호 :</strong> {orderId}</p>
                    <p><strong>결제 금액 :</strong> {Number(searchParams.get("amount")).toLocaleString()}원</p>
                </div>
                <div className="mb-8">
                    <h2 className="text-lg font-bold mb-3 text-gray-700 text-center border-b pb-2">주문 내역</h2>
                    <ul className="border rounded-lg p-4 bg-gray-50 shadow-sm divide-y">
                        {cartItems.length > 0 ? (
                            cartItems.map((item, index) => (
                                <li key={index} className="flex justify-between py-2 font-medium">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>{(item.price * item.quantity).toLocaleString()}원</span>
                                </li>
                            ))
                        ) : (
                            <li className="text-gray-400 py-2">주문 항목이 없습니다.</li>
                        )}
                    </ul>
                </div>
                {/*<p><strong>주문번호 :</strong> {dbOrderId ? dbOrderId : "로딩 중..."}</p>*/}
                <div className="flex justify-center">
                    <button
                        onClick={handleBackToMain}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition duration-200"
                    >
                        메인화면으로 이동
                    </button>
                </div>
            </div>
        </div>
    );
}