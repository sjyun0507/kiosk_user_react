import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const CartPanel = ({ cartItems, setCartItems }) => {
    const [timeLeft, setTimeLeft] = useState(120); // 120초 = 2분
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
    const sessionId = sessionStorage.getItem("sessionId");

    const handleOrder =  (e) => {
        e.stopPropagation();
        if (!cartItems || cartItems.length === 0) {
            alert("장바구니가 비어 있습니다.");
            return;
        }
        const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        navigate("/payment", {
            state: {
                cart: cartItems,
                totalPrice: totalPrice
            }
        });
    };

    //타이머 설정
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    // 시간 표시 mm:ss 포맷 변환
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };
    //장바구니 수량 변경
    const handleQuantityChange = (id, newQuantity) => {
        if (newQuantity < 1) {
            setCartItems(prev => prev.filter(item => item.id !== id)); // 수량 0이면 삭제
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div
            className={`fixed bottom-0 left-0 w-full bg-white p-6 shadow-2xl border-t border-gray-200 rounded-t-3xl
    transition-all duration-500 ease-in-out transform
    ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-[70%] opacity-80'}
  `}
            style={{ maxHeight: isExpanded ? '90vh' : '15rem', minHeight: '10rem' }}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <h3 className="font-bold mb-2 text-center">장바구니</h3>

            <div className="flex flex-col md:flex-row gap-4">
                {/* 왼쪽: 아이템 리스트 */}
                <div
                    className="flex-1 overflow-y-auto bg-white rounded-lg shadow-inner p-4"
                    style={{ maxHeight: isExpanded ? '70vh' : '15rem', minHeight: '10rem', minWidth: 0 }}
                >
                    {cartItems.map(item => {
                        const filteredOptions = (item.menuOptions || []).filter(opt => {
                            if (typeof opt.value === "boolean") return opt.value;
                            if (
                                opt.value === "" ||
                                opt.value === "선택 안 함" ||
                                opt.value === "없음" ||
                                opt.value === 0
                            )
                                return false;
                            return true;
                        });
                        return (
                            <div
                                key={`${item.id}-${item.name}`}
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm border-b border-gray-200 py-3"
                                style={{ minWidth: 0 }}
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 flex-wrap" style={{ minWidth: 0 }}>
                                    <span className="font-medium">{item.name}</span>
                                    {filteredOptions.length > 0 && (
                                        <span className="text-xs text-gray-600">
                                          ({filteredOptions.map(opt => `${opt.name}: ${opt.value}`).join(', ')})
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                                    <input
                                        type="number"
                                        min="0"
                                        value={item.quantity}
                                        onChange={e =>
                                            handleQuantityChange(item.id, Number(e.target.value))
                                        }
                                        className="w-16 border border-gray-300 rounded text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-600"
                                        onClick={e => e.stopPropagation()}
                                    />
                                    <span className="whitespace-nowrap">
                                        총 {(item.price * item.quantity).toLocaleString()} 원
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 오른쪽: 버튼 및 정보 */}
                <div className="flex flex-col gap-4 w-100 items-center">
                    <div className="flex flex-col items-center bg-gray-100 p-3 rounded-md w-full shadow-sm">
                        <div className="text-md font-semibold text-gray-700 mb-1">
                            총 금액: <span className="text-lg text-black">{totalPrice.toLocaleString()} 원</span>
                        </div>
                        <div className="text-sm font-mono text-red-600">
                            남은 시간: {formatTime(timeLeft)}
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 w-full justify-center">
                        <button
                            className="bg-black text-white px-4 py-2 rounded"
                            onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                    await axios.delete(`http://localhost:8080/api/cart/${sessionId}`);
                                    setCartItems([]);
                                    alert("장바구니를 비웠습니다.");
                                } catch (err) {
                                    alert("장바구니 삭제 실패");
                                    console.error(err);
                                }
                            }}
                        >
                            전체삭제
                        </button>
                        <button onClick={handleOrder}
                            className="bg-lime-700 text-white px-4 py-2 rounded"
                        >
                            주문하기
                        </button>
                    </div>
                </div>
            </div>
            {cartItems.length === 0 && (
                <p className="text-center text-gray-500 mt-6 text-sm">장바구니가 비어 있습니다.</p>
            )}
        </div>
    );
};

export default CartPanel;