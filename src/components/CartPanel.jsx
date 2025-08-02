import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

/*
장바구니 패널
1. 장바구니에 아이템을 추가, 수량변경, 삭제기능
2. 장바구니 아이템이 변경될 대마다 local storage 저장 : 새로고침하거나 다른 페이지에 갔다가 돌아와도 내용 보존
3. 총 가격 계산 -> payment 페이지로 이동하면서 아이템과 금액 넘김
4. 타이머 설정 : 2분뒤 모달창으로 주문의사 확인
5. 장바구니 비우기
6. 주문하기
 */

const CartPanel = ({ cartItems, setCartItems, setSelectedProduct }) => {
    const [timeLeft, setTimeLeft] = useState(120); // 120초 = 2분
    const [showModal, setShowModal] = useState(false);
    const [modalCountdown, setModalCountdown] = useState(6);
    const navigate = useNavigate();
    const sessionId = sessionStorage.getItem("sessionId");

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

    //장바구니에 아이템이 변경될 때마다 local storage에 저장됨
    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }, [cartItems]);

    //주문하기 클릭 시 실행
    const handleOrder =  (e) => {
        e.stopPropagation();
        if (!cartItems || cartItems.length === 0) {
            alert("장바구니가 비어 있습니다. 메뉴를 추가해주세요");
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
        if (timeLeft <= 0) {
            setShowModal(true);
            setModalCountdown(6);

            const countdownInterval = setInterval(() => {
                setModalCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        setShowModal(false);
                        setCartItems([]);
                        localStorage.removeItem("cartItems");
                        sessionStorage.removeItem("sessionId");
                        if (setSelectedProduct) setSelectedProduct(null);
                        setTimeLeft(120);
                        navigate("/");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(countdownInterval);
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);


    // 시간 표시 mm:ss 포맷 변환
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <>
        <div
            className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-2xl border-t
            border-gray-200 rounded-t-3xl opacity-100 h-[35vh] "
        >
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-bold text-l">장바구니</h1>
              <span className="text-sm font-mono text-red-600">남은 시간: {formatTime(timeLeft)}</span>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                {/* 왼쪽: 아이템 리스트 */}
                <div className="flex-1 flex flex-col w-full">
                  <div
                    id="cart-scroll-container"
                    className="flex-1 bg-white rounded-lg shadow-inner p-4 overflow-y-auto"
                    style={{ maxHeight: '30vh', minHeight: '10rem', minWidth: 0 }}
                  >
                    {cartItems.length > 0 ? (
                      cartItems.map(item => {
                        const filteredOptions = (item.menuOptions || []).filter(opt => {
                          if (typeof opt.value === "boolean") return opt.value;
                          if (
                            opt.value === "" ||
                            opt.value === "선택 안 함" ||
                            opt.value === "없음" ||
                            opt.value === "보통" ||
                            opt.value === "기본" ||
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
                      })
                    ) : (
                      <div className="flex justify-center items-center h-full text-gray-400 text-sm">
                        장바구니가 비어 있습니다. 메뉴를 선택해주세요
                      </div>
                    )}
                  </div>
                </div>

                {/* 오른쪽: 버튼 및 정보 */}
                <div className="flex flex-col gap-2 w-[180px] min-w-[150px] items-center">
                    <div className="flex flex-col items-center bg-gray-100 p-3 rounded-md w-full shadow-sm">
                        <div className="flex flex-col items-center text-center mb-1">
                            <span className="text-md font-semibold text-gray-700">총 금액</span>
                            <span className="text-xl text-black font-bold">{totalPrice.toLocaleString()} 원</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full justify-center pt-1">
                        <button
                            className="bg-black text-white px-4 py-2 rounded"
                            onClick={async (e) => {
                                e.stopPropagation();
                                const confirmClear = window.confirm("장바구니를 비우시겠습니까?");
                                if (!confirmClear) return;
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
                            장바구니 비우기
                        </button>
                        <button onClick={handleOrder}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded"
                        >
                            주문하기
                        </button>

                    </div>
                </div>
            </div>
        </div>
        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white rounded-xl p-6 w-[35vw] h-[30vh] text-center shadow-xl flex flex-col justify-center">
                <h2 className="text-xl font-bold mb-2">주문을 계속할까요?</h2>
                <p className="text-l text-gray-600 mb-4">
                  {modalCountdown}초 뒤에 자동으로 주문이 종료돼요
                </p>
                <div className="flex justify-between gap-4">
                  <button
                    className="flex-1 bg-gray-300 text-black py-2 rounded"
                    onClick={() => {
                      setShowModal(false);
                      setCartItems([]);
                      localStorage.removeItem("cartItems");
                      sessionStorage.removeItem("sessionId");
                      setTimeLeft(120);
                      if (setSelectedProduct) setSelectedProduct(null);
                      navigate("/");
                    }}
                  >
                    지금 끝내기
                  </button>
                  <button
                      className="flex-1 bg-teal-600 hover:bg-teal-700  text-white py-2 rounded"
                    onClick={() => {
                      setShowModal(false);
                      setTimeLeft(120);
                    }}
                  >
                    주문 계속하기
                  </button>
                </div>
              </div>
            </div>
        )}
        </>
    );
};

export default CartPanel;