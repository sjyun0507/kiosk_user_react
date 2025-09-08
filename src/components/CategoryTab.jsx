import {useEffect, useState} from "react";
import api from "/src/api/axiosInstance";

const CategoryTab = ({ onCategoryChange }) => {
    const [categories, setCategories] = useState([]);

    //카테고리 가져오기
    useEffect(() => {
        api.get(`/menus/category`)
            .then((res) => {
                const uniqueCategories = Array.from(
                    new Map(res.data.map((item) => [item.categoryId, {
                        id: item.categoryId,
                        name: item.name, //카테고리 이름 가져오기
                    }])).values()
                );
                setCategories(uniqueCategories);
            })
            .catch((err) => {
                console.error("카테고리 가져오기 실패:", err);
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