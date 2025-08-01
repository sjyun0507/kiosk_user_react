import CartPanel from "../components/CartPanel";
import Header from "../components/Header";
import CategoryTab from "../components/CategoryTab";
import MenuItem from "../components/MenuItem";
import {useEffect, useState} from "react";
import axios from "axios";
/*
키오스크 페이지(메인화면)
1. 카테고리, 아이템 조회기능
2. 장바구니 초기화: 메인화면에 들어오면 장바구니 비움
 */

const KioskPage = ({cartItems, setCartItems}) => {
    const [selectedCategory, setSelectedCategory] = useState("커피"); //카테고리 메인조회 기본값
    const [selectedProduct, setSelectedProduct] = useState();
    // 옵션 선택 state
    const [sizeOption, setSizeOption] = useState(null); //사이즈
    const [tempOption, setTempOption] = useState(null); //온도
    const [sweetness, setSweetness] = useState("기본"); //당도
    const [extraShot, setExtraShot] = useState(0); //샷
    const [syrup, setSyrup] = useState(""); //시럽
    const [topping, setTopping] = useState(""); //토핑
    const [addPearl, setAddPearl] = useState("없음"); //펄
    const [sparkleLevel, setSparkleLevel] = useState("없음"); //탄산
    const isDessert = selectedProduct?.category.name?.includes("디저트") ?? false;
    const [allMenuItems, setAllMenuItems] = useState([]);
    const [menuItems, setMenuItems] = useState([]);

    //모든 메뉴 가져오기
    useEffect(() => {
        axios
            .get(`http://localhost:8080/api/menus/all`)
            .then((res) => {
                setAllMenuItems(res.data); // 서버에서 받은 메뉴 데이터 저장
            })
            .catch((err) => {
                console.error("메뉴 가져오기 실패:", err);
            });
    }, []); // 카테고리가 바뀔 때마다 새로 불러옴

    // 카테고리 변경 함수
    const onCategoryChange = (categoryName) => {
        setSelectedCategory(categoryName);
    };


    const toValidDate = (rawDate) => {
        if (!rawDate) return null;
        const isoFormat = rawDate.replace(" ", "T"); // "2025-08-01T11:17:06.000000"
        return new Date(isoFormat);
    };


    //filter 에 따라 카테고리 별로 메뉴 불러오기 (신메뉴: 최근 한달 이내 생성된 메뉴)
    useEffect(() => {
        const isNewMenu = (createdAt) => {
            const createdDate = toValidDate(createdAt);
            if (!createdDate || isNaN(createdDate.getTime())) return false;

            const now = new Date();
            const diffInDays = (now - createdDate) / (1000 * 60 * 60 * 24);
            return diffInDays <= 30;
        };

        const filtered = allMenuItems.filter(item => {
            const categoryName = item.category?.name || "";
            const createdAt = item.createdAt || item.created_at
            // const createdAt = item.createdAt || item.createdDate || new Date().toISOString(); //테스트용

            if (selectedCategory === "신메뉴" ) {
                const isNew = isNewMenu(createdAt);
                console.log("메뉴명:", item.name);
                console.log("createdAt 원본:", createdAt);
                console.log("신메뉴 여부:", isNew);

                return isNew;
            }

            return categoryName === selectedCategory;
        });

        setMenuItems(filtered);
    }, [selectedCategory, allMenuItems]);

    // 세션 ID 생성 및 저장
    useEffect(() => {
        let sessionId = sessionStorage.getItem("sessionId");
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem("sessionId", sessionId);
        }
    }, []);

    //장바구니 초기화
    useEffect(() => {
        const storedItems = localStorage.getItem("cartItems");
        if (!storedItems) {
            setCartItems([]); // 장바구니 비움
        }
    }, []);


    return (
        // UI를 브라우저 전체 화면으로 설정
        <div className="bg-yellow-500 w-screen h-screen p-6 mx-auto overflow-y-auto">
            <div
                id="cart-scroll-container"
                className="flex-1 rounded-lg p-4 overflow-y-auto"
                style={{ maxHeight: '60vh', minHeight: '10rem', minWidth: 0 }}
            >
            <Header/>
            <CategoryTab onCategoryChange={onCategoryChange}/>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 my-4">
                {/*카테고리별 필터링 적용*/}
                {menuItems.map((item) => {
                    const createdAt = item.createdAt || item.created_at;
                    const isNew = (() => {
                      if (!createdAt) return false;
                      const createdDate = new Date(createdAt.replace(" ", "T"));
                      const now = new Date();
                      const diffInDays = (now - createdDate) / (1000 * 60 * 60 * 24);
                      return diffInDays <= 30;
                    })();
                    return (
                      <div key={item.menuId} className="relative">
                        {isNew && (
                          <span className="absolute top-1 right-1 bg-teal-600 text-white text-xs font-bold px-2 py-0.5 rounded-full ">
                            New
                          </span>
                        )}
                        <MenuItem item={item} onClick={() => setSelectedProduct(item)} />
                      </div>
                    );
                    //아이템의 key가 **유일(unique)**해야 한다. 식별가능한 고유 아이디 menuId로 사용
                })}

            </div>
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-auto max-h-[90vh] p-6">
                        <div className="flex justify-center items-center gap-4 mb-6">
                          <img
                            src={selectedProduct.imageUrl}
                            alt={selectedProduct.name}
                            className="w-24 h-24 object-contain rounded-md "
                          />
                          <div className="flex flex-col justify-center">
                            <h2 className="text-lg font-medium text-gray-800 mb-1">{selectedProduct.name}</h2>
                            <p className="text-sm text-amber-600 font-medium">
                              {selectedProduct?.price ? selectedProduct.price.toLocaleString() + "원" : "가격 정보 없음"}
                            </p>
                          </div>
                        </div>

                        {!isDessert && (
                            <>
                                {/* 모든 메뉴에 사이즈 선택*/}
                                <div className="mb-4">
                                    <p className="font-medium  mb-2">컵사이즈 선택<span className="text-red-600 text-sm"> *필수</span></p>
                                    <div className="flex gap-2 flex-wrap mt-2">
                                        {["S", "L(+500)"].map((option) => (
                                            <button
                                                key={option}
                                                value={sizeOption}
                                                onClick={() => setSizeOption(option)}
                                                className={`px-3 py-1.5 border rounded cursor-pointer ${
                                                    sizeOption === option
                                                        ? "bg-gray-700 text-white"
                                                        : "bg-gray-200 text-gray-900"
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                    <hr className="my-4 border-gray-300" />
                                </div>


                                {/* HOT/ICE 옵션은 에이드, 주스,스무디 카테고리에서는 숨김 */}
                                {!selectedProduct.category.name?.includes("에이드") && !selectedProduct.category.name?.includes("주스") && !selectedProduct.category.name?.includes("스무디") && (
                                    <div className="mb-4">
                                        <p className="font-medium mb-2">온도 선택<span className="text-red-600 text-sm"> *필수</span></p>
                                        <div className="flex gap-2 flex-wrap mt-2">
                                            {["HOT", "ICE"].map((option) => (
                                                <button
                                                    key={option}
                                                    value={tempOption}
                                                    onClick={() => setTempOption(option)}
                                                    className={`px-3 py-1.5 border rounded cursor-pointer ${
                                                        tempOption === option
                                                            ? "bg-gray-700 text-white"
                                                            : "bg-gray-200 text-gray-900"
                                                    }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                        <hr className="my-4 border-gray-300" />
                                    </div>
                                )}

                                {/* 커피 옵션 */}
                                {selectedProduct.category.name?.includes("커피") && (
                                    <>
                                        {/* 샷 추가 */}
                                        <div className="mb-4">
                                            <p className="font-medium  mb-2">샷 추가<span className="text-gray-700 text-sm"> (+500)</span></p>
                                            <div className="flex gap-2 flex-wrap mt-2">
                                                {[0, 1, 2, 3, 4].map(count => (
                                                    <button
                                                        key={count}
                                                        className={`px-3 py-2 border rounded cursor-pointer ${
                                                            extraShot === count ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900"
                                                        }`}
                                                        onClick={() => setExtraShot(count)}
                                                    >
                                                        {count}샷
                                                    </button>
                                                ))}
                                            </div>
                                            <hr className="my-4 border-gray-300" />
                                        </div>
                                        {/* 시럽 추가 */}
                                        <div className="mb-4">
                                            <p className="font-medium  mb-2">시럽 추가<span className="text-gray-700 text-sm"> (+500)</span></p>
                                            <div className="flex gap-2 flex-wrap mt-2 overflow-x-auto">
                                                {["선택안함", "바닐라", "카라멜", "헤이즐넛", "연유"].map(option => (
                                                    <button
                                                        key={option}
                                                        className={`px-3 py-1.5 border rounded cursor-pointer whitespace-nowrap ${
                                                            syrup === option ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900"
                                                        }`}
                                                        onClick={() => setSyrup(option)}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                            <hr className="my-4 border-gray-300" />
                                        </div>
                                        {/* 토핑 추가 */}
                                        <div className="mb-4">
                                            <p className="font-medium mb-2">토핑 추가<span className="text-gray-700 text-sm"> (+500)</span></p>
                                            <div className="flex gap-2 flex-wrap mt-2 overflow-x-auto">
                                                {["선택안함", "Caramel", "Cinnamon", "Cream"].map(option => (
                                                    <button
                                                        key={option}
                                                        className={`px-3 py-1.5 border rounded cursor-pointer whitespace-nowrap ${
                                                            topping === option ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900"
                                                        }`}
                                                        onClick={() => setTopping(option)}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                            <hr className="my-4 border-gray-300" />
                                        </div>
                                    </>
                                )}

                                {/* 버블티 옵션 */}
                                {selectedProduct.category.name?.includes("버블티") && (
                                    <>
                                        {/* 펄 추가 */}
                                        <div className="mb-4">
                                            <p className="font-semibold mb-2">펄 추가</p>
                                            <div className="flex gap-2 flex-wrap mt-2">
                                                {["없음", "추가"].map(option => (
                                                    <button
                                                        key={option}
                                                        className={`px-3 py-1.5 border rounded cursor-pointer ${
                                                            addPearl === option ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900"
                                                        }`}
                                                        onClick={() => setAddPearl(option)}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                            <hr className="my-4 border-gray-300" />
                                        </div>
                                        {/* 당도 선택 */}
                                        <div className="mb-4">
                                            <p className="font-semibold mb-2">당도 선택</p>
                                            <div className="flex gap-2 flex-wrap mt-2">
                                                {["기본", "달게", "조금만"].map(option => (
                                                    <button
                                                        key={option}
                                                        className={`px-3 py-1.5 border rounded cursor-pointer ${
                                                            sweetness === option ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900"
                                                        }`}
                                                        onClick={() => setSweetness(option)}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                            <hr className="my-4 border-gray-300" />
                                        </div>
                                    </>
                                )}

                                {/* 에이드 옵션 */}
                                {selectedProduct.category.name?.includes("에이드") && (
                                    <div className="mb-4">
                                        <p className="font-semibold mb-2">탄산 조절</p>
                                        <div className="flex gap-2 flex-wrap mt-2">
                                            {["보통", "강하게", "약하게"].map(option => (
                                                <button
                                                    key={option}
                                                    className={`px-3 py-1.5 border rounded cursor-pointer ${
                                                        sparkleLevel === option ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900"
                                                    }`}
                                                    onClick={() => setSparkleLevel(option)}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                        <hr className="my-4 border-gray-300" />
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-center gap-4 mt-6">
                                <button
                                    onClick={() => {
                                        setSelectedProduct(null);
                                        setSizeOption(false);
                                        setTempOption(false);
                                        setSweetness("기본");
                                        setExtraShot(0);
                                        setSyrup("");
                                        setTopping("");
                                        setAddPearl("없음");
                                        setSparkleLevel("없음");
                                    }}
                                    className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={() => {
                                        const categoryName = selectedProduct.category.name;

                                        // 디저트가 아니면 사이즈는 필수
                                        if (!isDessert && !sizeOption) {
                                            alert("사이즈를 선택해주세요.");
                                            return;
                                        }

                                        // 에이드/주스/스무디/디저트를 제외한 음료는 온도도 필수
                                        const requiresTempOption = !isDessert &&
                                            !categoryName.includes("에이드") &&
                                            !categoryName.includes("주스") &&
                                            !categoryName.includes("스무디");

                                        if (requiresTempOption && !tempOption) {
                                            alert("온도(HOT 또는 ICE)를 선택해주세요.");
                                            return;
                                        }
                                        // 가격 계산 로직 추가
                                        let finalPrice = selectedProduct.price;
                                        if (sizeOption === "L(+500)") finalPrice += 500;
                                        if (extraShot > 0) finalPrice += extraShot * 500;
                                        if (syrup) finalPrice += 500;
                                        if (topping) finalPrice += 500;
                                        if (selectedProduct.category.name?.includes("버블티") && addPearl === "추가") finalPrice += 500;

                                        const newItem = {
                                            id: `${selectedProduct.menuId}-${Date.now()}`, // 프론트 전용 고유 ID (React key 용)
                                            menuId: selectedProduct.menuId, //백앤드 DB 저장용
                                            name: selectedProduct.name,
                                            price: finalPrice,
                                            quantity: 1,
                                            menuOptions: isDessert
                                                ? []
                                                : [
                                                    ...(sizeOption ? [{name: "사이즈", value: sizeOption}] : []),
                                                    ...(tempOption ? [{name: "온도", value: tempOption}] : []),
                                                    ...(extraShot > 0 ? [{name: "샷 추가", value: extraShot}] : []),
                                                    ...(syrup ? [{name: "시럽 추가", value: syrup}] : []),
                                                    ...(topping ? [{name: "토핑 추가", value: topping}] : []),
                                                    ...(selectedProduct.category.name?.includes("버블티") ? [{
                                                        name: "펄 추가",
                                                        value: addPearl
                                                    }, {name: "당도 조절", value: sweetness}] : []),
                                                    ...(selectedProduct.category.name?.includes("에이드") ? [{
                                                        name: "탄산 조절",
                                                        value: sparkleLevel
                                                    }] : []),
                                                ],
                                            options: isDessert
                                                ? []
                                                : [
                                                    ...(sizeOption ? [`사이즈:${sizeOption}`] : []),
                                                    ...(tempOption ? [`온도:${tempOption}`] : []),
                                                    ...(extraShot > 0 ? [`샷 추가:${extraShot}`] : []),
                                                    ...(syrup ? [`시럽 추가:${syrup}`] : []),
                                                    ...(topping ? [`토핑 추가:${topping}`] : []),
                                                    ...(selectedProduct?.category?.name?.includes("버블티")
                                                        ? [`펄 추가:${addPearl}`, `당도 조절:${sweetness}`]
                                                        : []),
                                                    ...(selectedProduct?.category?.name?.includes("에이드")
                                                        ? [`탄산 조절:${sparkleLevel}`]
                                                        : [])
                                                ],
                                            sessionId: sessionStorage.getItem("sessionId"),
                                        };
                                        //로컬 상태 업데이트
                                        setCartItems(prev => [...prev, newItem]);
                                        //서버에 전송
                                        axios.post("http://localhost:8080/api/cart/", newItem)
                                            .then(res => console.log("장바구니 서버 저장 완료"))
                                            .catch(err => console.error("서버 저장 오류:", err));

                                        //상태 초기화
                                        setSizeOption(false);
                                        setTempOption(false);
                                        setSelectedProduct(null);
                                        setSweetness("기본");
                                        setExtraShot(0);
                                        setSyrup("");
                                        setTopping("");
                                        setAddPearl("없음");
                                        setSparkleLevel("없음");
                                    }}
                                    className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md hover:bg-lime-800transition"
                                >
                                    장바구니 담기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

                <CartPanel cartItems={cartItems} setCartItems={setCartItems} noOuterPanel />

        </div>
        </div>
    );
};

export default KioskPage;