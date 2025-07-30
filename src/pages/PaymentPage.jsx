import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = "lIUt5JCR8vA3XOlDluVSz";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // location.state에서 cart와 totalPrice를 받아옵니다
  const { cart = [], totalPrice = 0 } = location.state || {};

  // 상태들
  const [phoneNumber, setPhoneNumber] = useState("");
  const [availablePoints, setAvailablePoints] = useState(0);
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

  // 폰 번호 바뀔 때 포인트 조회 (예시: 실제 API 있으면 호출)
  useEffect(() => {
    if (phoneNumber.length === 11) {
      // 실제 포인트 API 있으면 호출 (예시는 고정값)
      setAvailablePoints(2300);
    } else {
      setAvailablePoints(0);
    }
  }, [phoneNumber]);

  // 결제 위젯 초기화
  useEffect(() => {
    async function loadWidgets() {
      if (!window.loadPaymentWidget) {
        console.error("토스 결제 위젯 로드 실패");
        return;
      }
      const widget = await window.loadPaymentWidget(clientKey, customerKey);
      setWidgets(widget);
    }
    loadWidgets();
  }, []);

  // 결제 위젯 렌더링 및 금액 세팅
  useEffect(() => {
    async function render() {
      if (!widgets) return;

      await widgets.setAmount(amount);

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

  // 결제 처리 함수
  const handlePayment = async () => {
    if (!ready) {
      alert("결제 수단이 준비되지 않았습니다.");
      return;
    }

    // 휴대폰 번호는 선택 입력이므로 11자리일 경우에만 사용
    const phoneOrNull = phoneNumber.length === 11 ? phoneNumber : null;

    try {
      // 1. 주문 생성 API 호출
      const finalAmount = amount.value;
      const orderResponse = await axios.post("http://localhost:8080/api/order", {
        phone: phoneOrNull, // null일 수도 있음
        totalAmount: finalAmount,
        usedPoint: usedPoints,
        orderMethod: "kiosk",
        orderTime: new Date().toISOString(),
        orderStatus: "WAITING",
      });

      const orderIdFromServer = orderResponse.data.orderId;
      setOrderId(orderIdFromServer);

      // 2. 토스 결제 위젯 호출
      await widgets.requestPayment({
        orderId: orderIdFromServer, // 백엔드 주문번호
        orderName: "카페 주문",
        successUrl: window.location.origin + "/pay/success",
        failUrl: window.location.origin + "/pay/fail",
        customerEmail: "customer123@gmail.com", // 실제 이메일 적용 가능
        customerName: phoneOrNull || "비회원", // 비회원 기본명
        // 토스 위젯은 customerMobilePhone 필드가 필수일 수 있으므로 빈 문자열도 허용
        customerMobilePhone: phoneOrNull || "",
      });

      setPaymentStatus("성공");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-8 space-y-8">
        <h1 className="text-3xl font-bold mb-6 border-b pb-2 text-gray-800 text-center">
          결제하기
        </h1>

        {/* 주문 내역 */}
        <div>
          <h2 className="text-xl font-semibold mb-3 text-gray-700 text-center">
            주문 내역
          </h2>
          <ul className="border rounded-lg p-4 bg-white shadow-sm divide-y">
            {cart.map((item, i) => (
              <li key={i} className="flex justify-between py-1">
                <span>
                  {item?.name ?? "상품명 없음"} x {item.quantity}
                </span>
                <span>{(item.price * item.quantity).toLocaleString()}원</span>
              </li>
            ))}
            {usedPoints > 0 && (
              <li className="flex justify-between text-sm text-gray-600 pt-2">
                <span>포인트 차감</span>
                <span>-{usedPoints.toLocaleString()}원</span>
              </li>
            )}
            <li className="flex justify-between font-bold mt-2 pt-2 border-t">
              <span>총 결제금액</span>
              <span>{amount.value.toLocaleString()}원</span>
            </li>
          </ul>
        </div>

        {/* 포인트 입력 */}
        <div>
          <label className="block font-semibold mb-1">포인트 적립 및 사용</label>
          <div className="flex gap-2 items-center">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="휴대폰 번호를 입력하세요 예)01012345678"
              className="flex-1 px-4 py-2 border rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500"
              maxLength={11}
            />
            <button
              onClick={() => {
                if (phoneNumber.length === 11) {
                  setAvailablePoints(2300); // 예시
                } else {
                  alert("휴대폰 번호를 정확히 입력하세요");
                }
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold"
            >
              조회
            </button>
          </div>

          {availablePoints > 0 && (
            <div className="mt-4">
              <p className="text-red-500">보유 포인트: {availablePoints}점</p>
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

        {/* 결제 수단 및 약관 */}
        <div id="payment-method" />
        <div id="agreement" />

        {/* 결제/취소 버튼 그룹 */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handlePayment}
            disabled={!ready}
            className="w-1/2 bg-lime-600 hover:bg-lime-700 text-white py-3 rounded-lg font-semibold"
          >
            결제하기
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-1/2 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-lg font-semibold"
          >
            결제 취소
          </button>
        </div>

        {/* 결제 결과 표시 */}
        {paymentStatus && (
          <div
            className={`mt-6 p-4 rounded-lg text-center font-bold ${
              paymentStatus === "성공" ? "text-lime-700" : "text-red-600"
            } bg-white shadow`}
          >
            {paymentStatus === "성공" ? (
              <p>결제가 완료되었습니다. 주문번호: {orderId}</p>
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
