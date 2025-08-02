import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

const IntroPage = () => {
    // 페이지 진입 시 장바구니 무조건 초기화
    useEffect(() => {
        localStorage.removeItem("cartItems");
    }, []);

    const navigate = useNavigate();

    const handleClick = (type) => {
        navigate('/kiosk', { state: { orderType: type } });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
            <img
                src="/intro/banner_logo.jpg"
                alt="인트로 배너"
                // className="w-full aspect-video sm:h-[70vh] object-cover rounded-none shadow-none mb-4"
                // className="w-full h-auto max-w-none object-cover"
                className="w-full max-w-5xl h-auto object-contain mb-4"
            />
            <h3 className="text-m font-semibold mb-4">포장은 일회용 용기에 매장에서는 머그잔으로 제공됩니다</h3>
            {/* 선택 버튼 영역 */}
            <div className="flex gap-6">
                <button
                    onClick={() => handleClick('forHere')}
                    className="flex flex-col items-center justify-center px-8 py-4 rounded-2xl bg-blue-100 hover:bg-blue-200 text-lg font-bold shadow-md transition"
                >
                    <span role="img" aria-label="for here" className="text-3xl mb-2"></span>
                    먹고가요
                    <span className="text-sm text-gray-600">For here</span>
                </button>

                <button
                    onClick={() => handleClick('toGo')}
                    className="flex flex-col items-center justify-center px-8 py-4 rounded-2xl bg-pink-100 hover:bg-pink-200 text-lg font-bold shadow-md transition"
                >
                    <span role="img" aria-label="to go" className="text-3xl mb-2"></span>
                    포장해요
                    <span className="text-sm text-gray-600">To go</span>
                </button>
            </div>

        </div>
    );
};

export default IntroPage;