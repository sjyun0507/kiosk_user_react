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

  // 폰 번호 바뀔 때 포인트 조회
  useEffect(() => {
    const fetchPoints = async () => {
      if (phoneNumber.length === 11) {
        try {
          const response = await axios.get(`http://localhost:8080/api/user/points?phone=${phoneNumber}`);
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

  const [availablePoints, setAvailablePoints] = useState(0);

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

      const orderResponse = await axios.post("http://localhost:8080/api/order", {
        phone: phoneOrNull,
        totalAmount: finalAmount || 0,
        usedPoint: usedPoints || 0,
        orderMethod: "kiosk",
        orderTime: new Date().toISOString(),
        orderStatus: "waiting",
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
            <h2 className="text-xl font-semibold mb-2 text-gray-700 text-center">
              주문 내역
            </h2>
            <ul className="space-y-2">
              {cart.map((item, i) => (
                <li key={i} className="flex justify-between p-3 bg-gray-50 rounded-md shadow-sm">
                  <span className="font-medium">{item?.name ?? "상품명 없음"} x {item.quantity}</span>
                  <span className="font-bold text-black">{(item.price * item.quantity).toLocaleString()}원</span>
                </li>
              ))}
              {usedPoints > 0 && (
                <li className="flex justify-between p-3 bg-amber-50 rounded-md text-sm border border-amber-200">
                  <span>포인트 차감</span>
                  <span className="text-amber-700">-{usedPoints.toLocaleString()}원</span>
                </li>
              )}
              <li className="flex justify-between p-3 bg-amber-50 rounded-md font-semibold">
                <span>총 결제금액</span>
                <span className="text-amber-700">{amount.value.toLocaleString()}원</span>
              </li>
            </ul>
          </div>

          {/* 포인트 입력 */}
          <div className="bg-amber-50 p-4 rounded-lg shadow-inner border border-amber-200">
            <label className="block font-semibold mb-1">포인트 적립 및 사용</label>
            <div className="flex gap-2 items-center">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="휴대폰 번호를 입력하세요"
                className="flex-1 px-4 py-2 border rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500"
                maxLength={11}
              />
              <button
                  onClick={() => {
                    if (phoneNumber.length !== 11) {
                      alert("휴대폰 번호를 정확히 입력하세요");
                    }
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold"
              >
                입력
              </button>
            </div>

            {availablePoints > 0 && (
              <div className="mt-4">
                <p className="text-amber-700">보유 포인트: {availablePoints.toLocaleString()}점</p>
                <label className="text-gray-500">(100원 단위로 사용 가능)</label>
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
                  className="w-full px-4 py-2 border rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500 mt-1"
                />
              </div>
            )}
          </div>
        </div>

        {/* 결제 수단 및 약관 */}
        <div id="payment-method" />
        <div id="agreement" />

        {/* 결제/취소 버튼 그룹 */}
        <div className=" flex gap-4 text-center justify-center">
          <button
            onClick={handlePayment}
            disabled={!ready}
            className="w-1/2 bg-teal-600 hover:bg-teal-700   text-white py-3 rounded-xl shadow-md"
          >
            결제하기
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-1/2 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-xl shadow-md"
          >
            결제 취소
          </button>
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
