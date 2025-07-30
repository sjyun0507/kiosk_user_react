const MenuItemCard = ({item, onClick}) => {
    if (!item) return null; // item 자체가 null이면 아예 렌더링 안 함

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl p-2 shadow-md text-center cursor-pointer ${item.soldOut ? 'opacity-50' : ''}`}
        >
            <div className="h-32 bg-gray-200 mb-2 flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full object-cover"/>
                ) : (
                    <span className="text-sm text-gray-500">이미지 없음</span>
                )}
            </div>
            <div className="text-sm">{item.name}</div>
            <div className="text-red-600 font-semibold mt-1">
                {item.soldOut ? "일시품절" : item.price != null
                    ? `${item.price.toLocaleString()}원`
                    : "가격 없음"}
            </div>
        </div>
    );
};
export default MenuItemCard;