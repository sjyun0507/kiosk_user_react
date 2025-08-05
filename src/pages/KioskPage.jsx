import CartPanel from "../components/CartPanel";
import Header from "../components/Header";
import CategoryTab from "../components/CategoryTab";
import MenuItem from "../components/MenuItem";
import { useEffect, useState } from "react";
import axios from "axios";

/*
키오스크 페이지(메인화면)
1. 카테고리, 아이템 조회기능
2. 장바구니 초기화: 메인화면에 들어오면 장바구니 비움
*/

const KioskPage = ({ cartItems, setCartItems }) => {
    const [selectedCategory, setSelectedCategory] = useState("커피"); //카테고리 메인조회 기본값
    const [selectedProduct, setSelectedProduct] = useState();

    // 옵션 선택 state
    const [sizeOption, setSizeOption] = useState(null); //사이즈
    const [tempOption, setTempOption] = useState(null); //온도
    const [sweetness, setSweetness] = useState("기본"); //당도
    const [extraShot, setExtraShot] = useState(""); //샷
    const [syrup, setSyrup] = useState(""); //시럽
    const [topping, setTopping] = useState(""); //토핑
    const [addPearl, setAddPearl] = useState("없음"); //펄
    const [sparkleLevel, setSparkleLevel] = useState("없음"); //탄산

    const isDessert = selectedProduct?.category.name?.includes("디저트") ?? false;

    const [allMenuItems, setAllMenuItems] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [allOptionsRaw, setAllOptionsRaw] = useState([]); // 서버에서 받은 원본 옵션 데이터

    // 서버에서 메뉴와 옵션 데이터 받아오기
    useEffect(() => {
        axios
            .get("http://localhost:8080/api/menus/all")
            .then((res) => {
                setAllMenuItems(res.data.menus);
                setAllOptionsRaw(res.data.options); // 원본 옵션 데이터 저장
            })
            .catch((err) => console.error("메뉴 가져오기 실패:", err));
    }, []);

    // 선택한 카테고리에 맞춰 메뉴 필터링
    useEffect(() => {
        const filtered = allMenuItems.filter(
            (item) => item.category?.name === selectedCategory
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

    // 장바구니 초기화
    useEffect(() => {
        const storedItems = localStorage.getItem("cartItems");
        if (!storedItems) {
            setCartItems([]);
        }
    }, []);

    // 옵션 타입 정규화 함수
    const normalizeOptionType = (type) => {
        if (type.includes("사이즈")) return "SIZE";
        if (type.includes("온도")) return "TEMP";
        if (type === "커피옵션") return "COFFEE";
        if (type === "버블티 옵션") return "BUBBLE";
        if (type === "에이드 옵션") return "SPARKLE";
        return type.toUpperCase();
    };

    // 옵션들을 type별로 그룹화 (렌더링용)
    const groupOptionsByType = (type) => {
        const filtered = allOptionsRaw
            .filter((opt) => {
                const normType = normalizeOptionType(opt.optionType);
                const name = opt.optionName.toUpperCase();
                if (type === "SIZE") {
                    return name === "S" || name === "L" || name.includes("사이즈");
                }
                if (type === "TEMP") {
                    return name === "HOT" || name === "ICE" || name.includes("온도");
                }
                if (type === "SHOT")
                    return normType === "COFFEE" && name.includes("샷");
                if (type === "SYRUP")
                    return normType === "COFFEE" && name.includes("시럽");
                if (type === "TOPPING")
                    return (
                        normType === "COFFEE" &&
                        (name.includes("DRIZZLE") ||
                            name.includes("WHIPPED") ||
                            name.includes("CINNAMON"))
                    );
                if (type === "PEARL") return normType === "BUBBLE" && name.includes("펄");
                if (type === "SWEETNESS")
                    return normType === "BUBBLE" && (name.includes("달") || name.includes("기본"));
                if (type === "SPARKLE") return normType === "SPARKLE";
                return normType === type;
            })
            // 중복 이름 제거
            .reduce((unique, item) => {
                if (!unique.some((i) => i.optionName === item.optionName)) unique.push(item);
                return unique;
            }, []);

        return filtered;
    };

    // 옵션 그룹 UI 렌더링 함수
    const renderOptionGroup = (label, type, selected, setSelected, required = false) => {
        const options = groupOptionsByType(type);
        if (!options.length) return null;

        return (
            <div className="mb-4">
                <p className="font-medium mb-2">
                    {label}
                    {required && <span className="text-red-600 text-sm"> *필수</span>}
                </p>
                <div className="flex gap-2 flex-wrap mt-2 ">
                    {options.map((opt) => (
                        <button
                            key={opt.optionId}
                            className={`px-3 py-1.5 border rounded cursor-pointer text-sm ${
                                selected === opt.optionName
                                    ? "bg-gray-600 text-white"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                            onClick={() => setSelected(opt.optionName)}
                        >
                            {opt.optionName}
                            {opt.optionPrice ? ` (+${opt.optionPrice.toLocaleString()}원)` : ""}
                        </button>
                    ))}
                </div>
                <hr className="my-4 border-gray-300" />
            </div>
        );
    };

    // 가격 계산 헬퍼
    const getPrice = (type, name) => {
        const opt = groupOptionsByType(type).find((o) => o.optionName === name);
        return opt?.optionPrice ?? 0;
    };

    // 신메뉴 판단용 (필요시)
    const toValidDate = (rawDate) => {
        if (!rawDate) return null;
        const isoFormat = rawDate.includes("T") ? rawDate : rawDate.replace(" ", "T");
        const date = new Date(isoFormat);
        return isNaN(date.getTime()) ? null : date;
    };

    const isNewMenu = (createdAt) => {
        const date = toValidDate(createdAt);
        if (!date) return false;
        const now = new Date();
        const diffInDays = (now - date) / (1000 * 60 * 60 * 24);
        return diffInDays <= 30;
    };
    // 선택된 카테고리에 따라 메뉴 필터링
    useEffect(() => {

        const filtered = allMenuItems.filter((item) => {
            const categoryName = item.category?.name || "";
            const createdAt = item.createdAt || item.created_at;

            // "신메뉴" 카테고리 선택 시 최근 한달 이내 메뉴만
            if (selectedCategory === "신메뉴") {
                return isNewMenu(createdAt);
            }

            // 일반 카테고리 필터링
            return categoryName === selectedCategory;
        });

        setMenuItems(filtered);
    }, [selectedCategory, allMenuItems]);

    return (
        <div className="bg-yellow-500 w-screen h-screen p-6 mx-auto overflow-y-auto">
            <div
                id="cart-scroll-container"
                className="flex-1 rounded-lg p-4 overflow-y-auto"
                style={{ maxHeight: "60vh", minHeight: "10rem", minWidth: 0 }}
            >
                <Header />
                <CategoryTab onCategoryChange={setSelectedCategory} />
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 my-4">
                    {menuItems.map((item) => {
                        const createdAt = item.createdAt || item.created_at;
                        const isNew = isNewMenu(createdAt);
                        return (
                            <MenuItem
                                key={item.menuId}
                                item={item}
                                isNew={isNew}
                                onClick={() => setSelectedProduct(item)}
                            />
                        );
                    })}
                </div>

                {selectedProduct && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                        <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-auto max-h-[90vh] p-6">
                            <div className="flex justify-center items-center gap-4 mb-6">
                                <img
                                    src={selectedProduct.imageUrl}
                                    alt={selectedProduct.name}
                                    className="w-24 h-24 object-contain rounded-md"
                                />
                                <div className="flex flex-col justify-center">
                                    <h2 className="text-lg font-medium text-gray-800 mb-1">
                                        {selectedProduct.name}
                                    </h2>
                                    <p className="text-sm text-amber-600 font-medium">
                                        {selectedProduct.price
                                            ? selectedProduct.price.toLocaleString() + "원"
                                            : "가격 정보 없음"}
                                    </p>
                                </div>
                            </div>

                            {!isDessert && (
                                <>
                                    {renderOptionGroup("컵사이즈 선택", "SIZE", sizeOption, setSizeOption, true)}

                                    {!["에이드", "주스", "스무디"].some((c) =>
                                        selectedProduct.category.name.includes(c)
                                    ) && renderOptionGroup("온도 선택", "TEMP", tempOption, setTempOption, true)}

                                    {selectedProduct.category.name?.includes("커피") && (
                                        <>
                                            {renderOptionGroup("샷 추가", "SHOT", extraShot, setExtraShot)}
                                            {renderOptionGroup("시럽 추가", "SYRUP", syrup, setSyrup)}
                                            {renderOptionGroup("토핑 추가", "TOPPING", topping, setTopping)}
                                        </>
                                    )}

                                    {selectedProduct.category.name?.includes("버블티") && (
                                        <>
                                            {renderOptionGroup("펄 추가", "PEARL", addPearl, setAddPearl)}
                                            {renderOptionGroup("당도 선택", "SWEETNESS", sweetness, setSweetness)}
                                        </>
                                    )}

                                    {selectedProduct.category.name?.includes("에이드") &&
                                        renderOptionGroup("탄산 조절", "SPARKLE", sparkleLevel, setSparkleLevel)}
                                </>
                            )}

                            <div className="flex justify-center gap-4 mt-6">
                                <button
                                    onClick={() => {
                                        setSelectedProduct(null);
                                        setSizeOption(null);
                                        setTempOption(null);
                                        setSweetness("기본");
                                        setExtraShot("");
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

                                        if (!isDessert && !sizeOption) {
                                            alert("사이즈를 선택해주세요.");
                                            return;
                                        }
                                        if (
                                            !isDessert &&
                                            !["에이드", "주스", "스무디"].some((c) =>
                                                categoryName.includes(c)
                                            ) &&
                                            !tempOption
                                        ) {
                                            alert("온도를 선택해주세요.");
                                            return;
                                        }

                                        let finalPrice = selectedProduct.price;
                                        finalPrice += getPrice("SIZE", sizeOption);
                                        finalPrice += getPrice("SHOT", extraShot);
                                        finalPrice += getPrice("SYRUP", syrup);
                                        finalPrice += getPrice("TOPPING", topping);
                                        finalPrice += getPrice("PEARL", addPearl);

                                        // menuOptions 배열 생성 (옵션명 + 값)
                                        const menuOptions = [
                                            ...(sizeOption ? [{ name: "사이즈", value: sizeOption }] : []),
                                            ...(tempOption ? [{ name: "온도", value: tempOption }] : []),
                                            ...(extraShot ? [{ name: "샷 추가", value: extraShot }] : []),
                                            ...(syrup ? [{ name: "시럽 추가", value: syrup }] : []),
                                            ...(topping ? [{ name: "토핑 추가", value: topping }] : []),
                                            ...(addPearl ? [{ name: "펄 추가", value: addPearl }] : []),
                                            ...(selectedProduct &&
                                            selectedProduct.category.name?.includes("버블티") &&
                                            sweetness
                                                ? [{ name: "당도 조절", value: sweetness }]
                                                : []),
                                            ...(selectedProduct &&
                                            selectedProduct.category.name?.includes("에이드") &&
                                            sparkleLevel
                                                ? [{ name: "탄산 조절", value: sparkleLevel }]
                                                : []),
                                        ];

                                        // options 배열에는 선택한 옵션들의 optionId만 넣음
                                        // allOptionsRaw에서 선택된 옵션 이름과 일치하는 optionId 추출
                                        const selectedValues = menuOptions.map((opt) =>
                                            opt.value?.trim()
                                        );
                                        const categoryId = selectedProduct.category.categoryId;

                                        const optionIds = Array.from(
                                            new Set(
                                                allOptionsRaw
                                                    .filter(opt =>
                                                        selectedValues.includes(opt.optionName?.trim()) &&
                                                        opt.category?.categoryId === categoryId
                                                    )
                                                    .map(opt => opt.optionId)
                                            )
                                        );

                                        console.log("선택된 옵션 이름들:", selectedValues);
                                        console.log("매칭된 optionIds:", optionIds);

                                        const newItem = {
                                            id: `${selectedProduct.menuId}-${Date.now()}`,
                                            itemId: `${selectedProduct.menuId}-${Date.now()}`,
                                            menuId: selectedProduct.menuId,
                                            name: selectedProduct.name,
                                            price: finalPrice,
                                            quantity: 1,
                                            menuOptions: menuOptions,
                                            options: optionIds, // 여기 옵션 id 배열로 변경
                                            sessionId: sessionStorage.getItem("sessionId"),
                                        };

                                        setCartItems((prev) => [...prev, newItem]);

                                        axios
                                            .post("http://localhost:8080/api/cart/add", newItem)
                                            .then(() => console.log("장바구니 서버 저장 완료"))
                                            .catch((err) => console.error("서버 저장 오류:", err));

                                        // 옵션 초기화
                                        setSelectedProduct(null);
                                        setSizeOption(null);
                                        setTempOption(null);
                                        setSweetness("기본");
                                        setExtraShot("");
                                        setSyrup("");
                                        setTopping("");
                                        setAddPearl("없음");
                                        setSparkleLevel("없음");
                                    }}
                                    className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition"
                                >
                                    장바구니 담기
                                </button>
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

