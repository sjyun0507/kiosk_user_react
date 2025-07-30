import CartPanel from "../components/CartPanel";
import Header from "../components/Header";
import CategoryTab from "../components/CategoryTab";
import MenuItem from "../components/MenuItem";
import {useEffect, useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import axios from "axios";


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
    const navigate = useNavigate();
    const location = useLocation();
    const [allMenuItems, setAllMenuItems] = useState([]);
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
        // console.log(`http://localhost:8080/api/menus?category=${encodeURIComponent(selectedCategory)}`)
        axios
            .get(`http://localhost:8080/api/menus/all`)
            .then((res) => {
                // console.log("전체메뉴",res.data);
                setAllMenuItems(res.data); // 서버에서 받은 메뉴 데이터 저장
            })
            .catch((err) => {
                console.error("메뉴 가져오기 실패:", err);
            });
    }, []); // 카테고리가 바뀔 때마다 새로 불러옴

    // 카테고리 변경 함수
    const onCategoryChange = (categoryName) => {
        setSelectedCategory(categoryName);
        // 필요 시, 카테고리에 맞는 메뉴를 필터링해서 setMenuItems 하거나 useEffect로 처리
    };

    //filter 에 따라 카테고리 별로 메뉴 불러오기
    useEffect(() => {
        const filtered = allMenuItems.filter(item =>
            item.category?.name === selectedCategory
        );
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

    //장바구니 담기
    const handleAddToCart = (item) => {
        setCartItems(prevItems => {
            const updatedCart = [...prevItems, item];
            localStorage.setItem("cartItems", JSON.stringify(updatedCart));
            return updatedCart;
        });
    };

    return (
        // UI를 브라우저 전체 화면으로 설정
        <div className="bg-yellow-500 w-screen h-screen p-6 mx-auto overflow-hidden">
            <Header/>
            <CategoryTab onCategoryChange={onCategoryChange}/>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 my-4">
                {/*카테고리별 필터링 적용*/}
                {menuItems.map((item) => (
                    <MenuItem key={item.menuId} item={item} onClick={() => setSelectedProduct(item)}/>
                    //아이템의 key가 **유일(unique)**해야 한다. 식별가능한 고유 아이디 menuId로 사용
                ))}


            </div>
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                        {/* Product Image */}
                        <img src={selectedProduct.imageUrl} alt={selectedProduct.name}
                             className="w-60 h-40 object-contain mx-auto rounded mb-4"/>
                        <h2 className="text-xl font-bold mb-2">{selectedProduct.name}</h2>
                        <p className="mb-4 text-gray-600">{selectedProduct?.price ? selectedProduct.price.toLocaleString() + "원" : "가격 정보 없음"}
                        </p>

                        {!isDessert && (
                            <>
                                {/* 모든 메뉴에 사이즈 선택*/}

                                <div className="mb-4">
                                    <div className="mb-4 flex items-center gap-2">
                                        <p className="font-semibold w-24">사이즈 선택</p>
                                        <div className="flex gap-2 justify-center">
                                            {["S", "L(+500)"].map((option) => (
                                                <button
                                                    key={option} value={sizeOption}
                                                    onClick={() => setSizeOption(option)}
                                                    className={`px-4 py-2 border rounded ${
                                                        sizeOption === option ? "bg-amber-500 text-white" : "bg-white"
                                                    }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>


                                {/* HOT/ICE 옵션은 에이드, 주스,스무디 카테고리에서는 숨김 */}
                                {!selectedProduct.category.name?.includes("에이드") && !selectedProduct.category.name?.includes("주스") && !selectedProduct.category.name?.includes("스무디") && (
                                    <div className="mb-4">
                                        <div className="mb-4 flex items-center gap-2">
                                            <p className="font-semibold w-24">옵션 선택</p>
                                            <div className="flex gap-2 justify-center">
                                                {["HOT", "ICE"].map((option) => (
                                                    <button
                                                        key={option} value={tempOption}
                                                        onClick={() => setTempOption(option)}
                                                        className={`px-4 py-2 border rounded ${
                                                            tempOption === option ? "bg-amber-500 text-white" : "bg-white"
                                                        }`}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 커피 옵션 */}
                                {selectedProduct.category.name?.includes("커피") && (
                                    <>
                                        <div className="mb-4 flex items-center gap-2">
                                            <p className="font-semibold w-24">샷 추가(+500)</p>
                                            <select
                                                className="flex-1 border px-3 py-2 rounded"
                                                value={extraShot}
                                                onChange={(e) => setExtraShot(Number(e.target.value))}
                                            >
                                                {[0 ,1, 2, 3, 4, 5].map((count) => (
                                                    <option key={count} value={count}>{count}샷</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-4 flex items-center gap-2">
                                            <p className="font-semibold w-24">시럽 추가(+500)</p>
                                            <select
                                                className="flex-1 border px-3 py-2 rounded"
                                                value={syrup}
                                                onChange={(e) => setSyrup(e.target.value)}
                                            >
                                                <option value="">선택 안 함</option>
                                                <option value="바닐라">바닐라 시럽</option>
                                                <option value="초코">초코 시럽</option>
                                                <option value="카라멜">카라멜 시럽</option>
                                                <option value="돌체">돌체 시럽</option>
                                                <option value="헤이즐넛">헤이즐넛 시럽</option>fl
                                                <option value="연유">연유</option>
                                            </select>
                                        </div>
                                        <div className="mb-4 flex items-center gap-2">
                                            <p className="font-semibold w-24">토핑 추가(+500)</p>
                                            <select
                                                className="flex-1 border px-3 py-2 rounded"
                                                value={topping}
                                                onChange={(e) => setTopping(e.target.value)}
                                            >
                                                <option value="">선택 안 함</option>
                                                <option value="Caramel">Caramel Drizzle</option>
                                                <option value="Cinnamon">Cinnamon powder</option>
                                                <option value="Cream">Whipped Cream</option>
                                            </select>
                                        </div>

                                    </>
                                )}

                                {/* 버블티 옵션 */}
                                {selectedProduct.category.name?.includes("버블티") && (
                                    <>
                                    <div className="mb-4 flex items-center gap-2">
                                        <p className="font-semibold w-24">펄 추가</p>
                                        <select
                                            className="flex-1 border px-3 py-2 rounded"
                                            value={addPearl}
                                            onChange={(e) => setAddPearl(e.target.value)}
                                        >
                                            <option value="없음">없음</option>
                                            <option value="추가">추가(+500)</option>
                                        </select>
                                    </div>
                                    <div className="mb-4 flex items-center gap-2">
                                        <p className="font-semibold w-24">당도 선택</p>
                                        <select
                                            className="flex-1 border px-3 py-2 rounded"
                                            value={sweetness}
                                            onChange={(e) => setSweetness(e.target.value)}
                                        >
                                            <option value="기본">기본</option>
                                            <option value="달게">달게</option>
                                            <option value="조금만">조금만</option>
                                        </select>
                                    </div>
                                    </>
                                )}

                                {/* 에이드 옵션 */}
                                {selectedProduct.category.name?.includes("에이드") && (
                                    <div className="mb-4 flex items-center gap-2">
                                        <p className="font-semibold w-24">탄산 조절</p>
                                        <select
                                            className="flex-1 border px-3 py-2 rounded"
                                            value={sparkleLevel}
                                            onChange={(e) => setSparkleLevel(e.target.value)}
                                        >
                                            <option value="보통">보통</option>
                                            <option value="강하게">강하게</option>
                                            <option value="약하게">약하게</option>
                                        </select>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-center gap-2">
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
                                    className="px-4 py-2 border rounded"
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
                                    className="px-4 py-2 bg-lime-700 text-white rounded"
                                >
                                    장바구니 담기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <CartPanel cartItems={cartItems} setCartItems={setCartItems}/>
        </div>
    );
};

export default KioskPage;