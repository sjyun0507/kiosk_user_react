// const categories = ['신메뉴', '커피', '라떼', '버블티', '스무디', '에이드', '주스', '티', '디저트'];

import {useEffect, useState} from "react";
import axios from "axios";

const CategoryTab = ({ onCategoryChange }) => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8080/api/menus/")
            .then((res) => {
                // console.log("받은 메뉴 데이터:", res.data);
                // 필요한 구조로 가공
                const uniqueCategories = Array.from(
                    new Map(res.data.map((item) => [item.categoryId, {
                        id: item.categoryId,
                        name: item.name
                    }])).values()
                );
                setCategories(uniqueCategories);
            })
            .catch((err) => {
                console.error("메뉴 가져오기 실패:", err);
            });
    }, []);

    return (
        <div className="flex flex-wrap justify-center gap-3 mt-6 px-4">
            {categories.map((cat) => (
                <button
                    key={`${cat.id}-${cat.name}`}  // 고유한 key 보장
                    onClick={() => onCategoryChange(cat.name)}
                    className="bg-[#f9f5f0] text-[#5C4033] px-4 py-2 rounded-full text-sm font-semibold
           shadow-md hover:bg-[#d4a373] hover:text-white transition-colors duration-200"
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
};

export default CategoryTab;