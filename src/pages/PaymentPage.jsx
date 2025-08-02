import React, { useState, useEffect } from "react";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";

/*
결제 페이지
1. 주문내역 조회
2. 휴대폰 번호를 이용한 포인트 조회
3. 토스 결제
 */
const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = "lIUt5JCR8vA3XOlDluVSz";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart = [], totalPrice = 0 } = location.state || {};
  // 상태들
  const [phoneNumber, setPhoneNumber] = useState("");
  const [usedPoints, setUsedPoints] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderId, setOrderId] = useState(null);
  // 토스 결제 위젯 상태
  const [widgets, setWidgets] = useState(null);
  const [amount, setAmount] = useState({
    currency: "KRW",
    value: totalPrice,
  });
  const [ready, setReady] = useState(false);
  //포인트 조회 숫자패드창
  const [showNumberPad, setShowNumberPad] = useState(false);
  const [availablePoints, setAvailablePoints] = useState(0);

  // 폰 번호 바뀔 때 포인트 조회
  useEffect(() => {
    const fetchPoints = async () => {
      if (phoneNumber.length === 11) {
        try {
          const response = await axios.get(`http://localhost:8080/api/order/points?phone=${phoneNumber}`);
          setAvailablePoints(response.data.points);
        } catch (error) {
          console.error("포인트 자동 조회 실패:", error);
          setAvailablePoints(0);
        }
      } else {
        setAvailablePoints(0);
      }
    };
    fetchPoints();
  }, [phoneNumber]);


  // 결제 위젯 초기화
  useEffect(() => {
    async function loadWidgets() {
      const tossPayments = await loadTossPayments(clientKey);
      const widgets = tossPayments.widgets({ customerKey });
      setWidgets(widgets);
    }
    loadWidgets();
  }, []);

  // 결제 위젯 렌더링 및 금액 세팅
  useEffect(() => {
    async function render() {
      if (!widgets) return;

      await widgets.setAmount({ currency: "KRW", value: amount.value });

      await Promise.all([
        widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        }),
        widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        }),
      ]);
      setReady(true);
    }
    render();
  }, [widgets, amount]);

  // 포인트 사용 변경 시 금액 업데이트
  useEffect(() => {
    const couponDiscount = 0; // 쿠폰 적용 상태를 별도 상태로 관리하면 더 좋음
    const newAmountValue = totalPrice - usedPoints - couponDiscount;
    setAmount({
      currency: "KRW",
      value: newAmountValue > 0 ? newAmountValue : 0,
    });
  }, [usedPoints, totalPrice]);

    //결제취소 후 메인으로 돌아가기
    const handleBack = () => {
        localStorage.removeItem("cartItems");
        sessionStorage.removeItem("sessionId");
        window.location.replace("/");
    }
  // 결제 처리 함수
  const handlePayment = async () => {
    if (!ready) {
      alert("결제 수단이 준비되지 않았습니다.");
      return;
    }
    if (phoneNumber.length !== 11) {
      alert("결제를 진행하려면 휴대폰 번호를 정확히 입력하세요.");
      return;
    }
    // 휴대폰 번호는 선택 입력이므로 11자리일 경우에만 사용
    const phoneOrNull = phoneNumber.length === 11 ? phoneNumber : "";


    try {
      // 1. 주문 생성 API 호출
      const finalAmount = amount.value;

      //로컬스토리지에 저장
      localStorage.setItem("cartItems", JSON.stringify(cart));

      const orderResponse = await axios.post("http://localhost:8080/api/order/", {
        phone: phoneOrNull,
        totalAmount: finalAmount || 0,
        usedPoint: usedPoints || 0,
        orderMethod: "kiosk",
        orderTime: new Date().toISOString(),
        status: "waiting",
        earnedPoint: finalAmount * 0.05,
      });

      const orderIdFromServer = orderResponse.data.orderId || uuidv4();
      setOrderId(orderIdFromServer);

      await widgets.setAmount({ currency: "KRW", value: amount.value });

      // 2. 토스 결제 위젯 호출
      await widgets.requestPayment({
        orderId: orderIdFromServer, // 백엔드 주문번호
        orderName: "BEANS 카페 주문",
        successUrl: window.location.origin + "/success",
        failUrl: window.location.origin + "/fail",
        customerEmail: "customer123@gmail.com", // 실제 이메일 적용 가능
        customerName: phoneOrNull || "비회원", // 비회원 기본명
        // 토스 위젯은 customerMobilePhone 필드가 필수일 수 있으므로 빈 문자열도 허용
        customerMobilePhone: phoneOrNull,
      });

      setPaymentStatus("성공");
      localStorage.removeItem("cartItems"); //장바구지 삭제

    } catch (error) {
      console.error("결제 처리 실패:", error);
      setPaymentStatus("실패");
    }
  };

  if (!cart.length) {
    return (
      <div className="text-center mt-20 text-lg">
        장바구니가 비어있습니다. <br />
        <button onClick={() => navigate("/")}>메인으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-3xl p-10 space-y-10">
        {/* 주문 내역 및 포인트 조회 섹션을 감싸는 컨테이너 */}
        <div className="max-w-xl mx-auto space-y-8">
          {/* 주문 내역 */}
          <div>
            <h2 className="text-2xl text-center font-bold mb-6 text-gray-700">
              주문 및 결제
            </h2>
            <div className="justify-between items-start border border-gray-100 rounded-md px-4 py-2 mb-2 shadow-sm"
            >
            <ul>
              {cart.map((item, i) => {
                const filteredOptions = (item.menuOptions || []).filter(opt => {
                  if (typeof opt.value === 'boolean') return opt.value;
                  if (
                    opt.value === '' ||
                    opt.value === '선택 안 함' ||
                    opt.value === '없음' ||
                    opt.value === '기본' ||
                    opt.value === '보통' ||
                    opt.value === 0
                  ) return false;
                  return true;
                });
                return (
                  <li
                    key={i}
                    className="flex justify-between items-center border-b border-gray-100 py-1"
                  >
                    <div>
                      <span className="text-sm font-medium tracking-wide">
                        {item?.name ?? "상품명 없음"} x {item.quantity}
                      </span>
                      {filteredOptions.length > 0 && (
                        <div className="text-xs text-gray-500 tracking-wide leading-relaxed">
                          ({filteredOptions.map(opt => `${opt.name}: ${opt.value}`).join(', ')})
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">
                      {(item.price * item.quantity).toLocaleString()}원
                    </span>
                  </li>
                );
              })}
              {usedPoints > 0 && (
                <li className="flex justify-between items-center border-b border-gray-300 py-1 text-amber-700 text-sm">
                  <span>포인트 차감</span>
                  <span className="text-gray-700">-{usedPoints.toLocaleString()}원</span>
                </li>
              )}
              <li className="flex justify-between items-center py-1 font-semibold text-[16px]">
                <span>총 결제금액</span>
                <span className="text-gray-900">{amount.value.toLocaleString()}원</span>
              </li>
            </ul>
            </div>
          </div>

          {/* 포인트 입력 */}
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-800 text-sm font-semibold">포인트 적립 및 사용</span>
              <button
                onClick={() => setShowNumberPad(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white text-sm px-4 py-1.5 rounded-md shadow"
              >
                번호 조회
              </button>
            </div>
            <div className="bg-gray-50 px-3 py-2 rounded-lg w-full md:w-auto">
              <div className="flex flex-wrap md:flex-nowrap gap-3 items-center">
                {availablePoints > 0 && (
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 flex-1">
                    <p className="text-amber-700 whitespace-nowrap">보유: {availablePoints.toLocaleString()}점</p>
                    <label className="text-gray-500 text-sm">(100원 단위 사용)</label>
                    <input
                      type="number"
                      value={usedPoints}
                      min={0}
                      max={Math.min(availablePoints, amount.value)}
                      step={100}
                      onChange={(e) => {
                        let val = Math.floor(Number(e.target.value) / 100) * 100;
                        if (val > availablePoints) val = availablePoints;
                        if (val > amount.value) val = amount.value;
                        setUsedPoints(val);
                      }}
                      className="w-full md:w-40 px-4 py-2 border rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

              {showNumberPad && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl space-y-4 shadow-2xl w-80">
      <p className="text-center text-gray-700">적립할 번호를 입력해주세요</p>
      <div className="text-center text-2xl font-bold tracking-widest">{phoneNumber}</div>

      <div className="grid grid-cols-3 gap-4 text-xl">
        {[1,2,3,4,5,6,7,8,9].map((num) => (
          <button
            key={num}
            onClick={() => {
              if (phoneNumber.length < 11) {
                const newPhone = phoneNumber + num;
                setPhoneNumber(newPhone);
              }
            }}
            className="p-4 bg-gray-100 rounded-lg shadow hover:bg-gray-200"
          >
            {num}
          </button>
        ))}
        <div /> {/* empty cell for spacing */}
        <button
          onClick={() => {
            if (phoneNumber.length < 11) {
              setPhoneNumber(phoneNumber + "0");
            }
          }}
          className="p-4 bg-gray-100 rounded-lg shadow hover:bg-gray-200"
        >
          0
        </button>
        <button
          onClick={() => setPhoneNumber(prev => (prev.length > 3 ? prev.slice(0, -1) : prev))}
          className="p-4 bg-gray-100 rounded-lg shadow hover:bg-gray-200"
        >
          ←
        </button>
      </div>
        <div className="flex justify-between gap-4">
    <button
      onClick={() => setShowNumberPad(false)}
      className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
    >
      닫기
    </button>
    <button
      onClick={async () => {
        if (phoneNumber.length === 11) {
          try {
            const response = await axios.get(`http://localhost:8080/api/order/points?phone=${phoneNumber}`);
            setAvailablePoints(response.data.points);
            setShowNumberPad(false);
          } catch (error) {
            alert("포인트 조회에 실패했습니다.");
            console.error(error);
          }
        } else {
          alert("전화번호를 정확히 입력해주세요.");
        }
      }}
      className="flex-1 bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600"
    >
      확인
    </button>
  </div>

    </div>
  </div>
)}
        </div>

        {/* 결제 수단, 약관, 결제/취소 버튼 그룹을 주문 내역과 동일한 max-w-xl 컨테이너로 감싸 alignment 유지 */}
        <div className="max-w-xl mx-auto space-y-6">
          <div id="payment-method" />
          <div id="agreement" />
          <div className="flex gap-4 text-center justify-center">
            <button
              onClick={handlePayment}
              disabled={!ready}
              className="w-1/2 bg-teal-600 hover:bg-teal-700   text-white py-3 rounded-xl shadow-md"
            >
              결제하기
            </button>
            <button
              onClick={handleBack}
              className="w-1/2 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-xl shadow-md"
            >
              결제 취소
            </button>
          </div>
        </div>

        {/* 결제 결과 표시 */}
        {paymentStatus && (
          <div
            className={`mt-6 py-4 px-6 rounded-xl text-center font-bold text-lg ${
              paymentStatus === "성공" ? "text-amber-700 bg-amber-100" : "text-gray-600 bg-gray-100"
            }`}
          >
            {paymentStatus === "성공" ? (
              <p>결제가 완료되었습니다.<br />주문번호: {orderId}</p>
            ) : (
              <p>결제에 실패하였습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>

  );
};

export default PaymentPage;
