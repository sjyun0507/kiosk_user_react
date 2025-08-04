const MenuItemCard = ({item, isNew, onClick}) => {
    if (!item) return null; // item 자체가 null이면 아예 렌더링 안 함

    const isOutOfStock = item.isSoldOut || item.stock === 0;

    return (
        <div
            onClick={!isOutOfStock ? onClick : undefined}
            className={`relative rounded-xl p-2 shadow-md text-center cursor-pointer ${isOutOfStock ? 'bg-gray-100' : 'bg-white'}`}
        >
            {isNew && (
                <span className="absolute top-1 right-1 bg-gradient-to-r from-pink-500 to-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-lg tracking-wide">
                    NEW
                </span>
            )}
            <div className={`p-2 rounded-xl ${isOutOfStock ? 'bg-gray-200' : ''}`}>
                <div className="h-32 bg-gray-200 mb-2 flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className={`h-full object-cover ${isOutOfStock ? 'grayscale' : ''}`}
                        />
                    ) : (
                        <span className="text-sm text-gray-500">이미지 없음</span>
                    )}
                </div>
                <div className="text-sm">{item.name}</div>
                <div className="text-red-600 font-semibold mt-1">
                    {isOutOfStock ? "재고없음" : item.price != null
                        ? `${item.price.toLocaleString()}원`
                        : "가격 없음"}
                </div>
            </div>
        </div>
    );
};
export default MenuItemCard;