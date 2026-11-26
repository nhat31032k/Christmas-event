export type GiftIconKind = "food" | "hug" | "wish";

export interface GiftTicket {
    id: string;
    badge: string;
    title: string;
    subtitle: string;
    icon: GiftIconKind;
    accentColor: string;
}

export interface ChristmasCardConfig {
    recipientName: string;
    senderName: string;
    coverTitle: string;
    chibiQuotes: string[];
    letterPages: string[];
    shootingStarWishes: string[];
    giftTickets: GiftTicket[];
}

export const christmasCardConfig: ChristmasCardConfig = {
    recipientName: "",
    senderName: "[Tên của bạn]",
    coverTitle: "Giáng Sinh An Lành",
    chibiQuotes: [
        "Lạnh quá, lại đây ôm một cái thật chặt nào!",
        "Noel năm nay có em ở bên là ấm áp nhất!",
        "Tay em lạnh rồi nè, để anh nắm giữ cả mùa đông nhé!",
    ],
    letterPages: [
        "Gửi em giữa đêm Noel se lạnh, cảm ơn em vì suốt những ngày tháng qua đã luôn dịu dàng, kiên nhẫn và mang thật nhiều ánh nắng vào những ngày bình thường nhất của anh.",
        "Ngoài kia gió đông có thể lạnh, nhưng chỉ cần nghĩ đến nụ cười và những câu chuyện nhỏ xíu của tụi mình, lòng anh lúc nào cũng thấy ấm như cầm một ly cacao nóng.",
        "Chúc em một mùa Giáng Sinh thật bình yên, ngủ ngon mỗi tối, ăn thật nhiều món em thích và luôn cảm nhận được rằng em được thương rất nhiều.",
        "Mong rằng không chỉ Noel này mà thật nhiều mùa đông sau nữa, tụi mình vẫn sẽ cùng nhau đi dưới đèn đường vàng ấm và đón những điều ngọt ngào nhất.",
    ],
    shootingStarWishes: [
        "Ước cho mọi muộn phiền của em đều tan nhẹ như bông tuyết đêm nay.",
        "Hứa sẽ luôn lắng nghe em kể chuyện, dù là chuyện to hay nhỏ xíu.",
        "Chúc em luôn rạng rỡ, mạnh khỏe và bình an trong từng khoảnh khắc.",
        "Hứa sẽ dẫn em đi ăn thật nhiều món ngon mỗi khi em thèm nhé!",
        "Ước tụi mình sẽ cùng nhau viết thêm thật nhiều kỷ niệm đẹp năm tới.",
    ],
    giftTickets: [
        {
            id: "ticket-food",
            badge: "TICKET 01",
            title: "1 Chầu Ăn Ngon Tùy Chọn",
            subtitle: "Em chỉ cần chọn quán, mọi thứ còn lại để anh lo hết!",
            icon: "food",
            accentColor: "#fde047",
        },
        {
            id: "ticket-hug",
            badge: "TICKET 02",
            title: "1 Cái Ôm Siêu Chặt",
            subtitle: "Sạc đầy pin ấm áp, dùng không giới hạn thời gian.",
            icon: "hug",
            accentColor: "#fb7185",
        },
        {
            id: "ticket-wish",
            badge: "TICKET 03",
            title: "1 Điều Ước Bất Kỳ",
            subtitle: "Thẻ đặc quyền — em muốn gì anh cũng cố gắng chiều!",
            icon: "wish",
            accentColor: "#38bdf8",
        },
    ],
};
