const watch_tag = new Set(['men', 'women', 'kids', 'luxury', 'smart', 'best-seller', 'casio']);

function getWhatsAppUrl(message) {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/918097949357?text=${encodedMessage}`;
}

const products = [
    {
        id: 1,
        name: "G-Shock Casio GM 2110D-2ADR Generic - Silver Blue",
        description: "Shine in silver and blue — elegance redefined. Now at just ₹1,499! Click to buy on WhatsApp — pay ₹100 now, rest on delivery.",
        details: "Where elegance meets value. The GM 2110D-2ADR (Silver Blue) brings timeless design and modern charm together — now at a special price of ₹1,499 only! Order easily on WhatsApp — just pay ₹100 now, and the rest via Cash on Delivery.",
        price: {
            old: "₹2999",
            new: "₹1699"
        },
        images: {
            main: "../images/products/watch/GM 2110D-2ADR/silver blue/1761903742884.jpg",
            hover: "../images/products/watch/GM 2110D-2ADR/silver blue/1761904319881.jpg"
        },
        otherImages: [
            '../images/products/watch/GM 2110D-2ADR/silver blue/1761906371651.jpg',
            '../images/products/watch/GM 2110D-2ADR/silver blue/1761916480614.jpg'
        ],
        tags: ["men" , "casio", "popular"],
        availability: "In stock",
        brand: "casio",
        badge: "Hot",
        whatsappUrl: getWhatsAppUrl("Hi! GM 2110D-2ADR – Silver Blue Edition"),
        colors: [
            {
                name: "Silver Blue",
                class: "bg-blue",
                image: "../images/products/watch/GM 2110D-2ADR/silver blue/1761904319881.jpg"
            }
        ]
    },
    {
        id: 2,
        name: "G-Shock Casio GM-2100-1A Generic",
        description: "Bold, rugged, and built to impress — the G-Shock GM-2100-1A. Now at just ₹1,499! Click to buy on WhatsApp — pay ₹100 now, rest on delivery.",
        details: "Unleash your style with the G-Shock Casio GM-2100-1A, a watch that blends strength, durability, and bold aesthetics. Designed for those who live life on the edge, this timepiece features G-Shock’s signature shock resistance and a sleek, modern profile that commands attention. Now available at an exclusive price of ₹1,499 only — an unbeatable deal for true watch enthusiasts. Order directly via WhatsApp — pay ₹100 now to confirm your order and the rest on delivery.",
        price: {
            old: "₹2499",
            new: "₹1499"
        },
        tags: ["men", "popular", "casio", "g-shock"],
        images: {
            main: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/Copper/1761676594529.jpg",
            hover: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/Copper/1761680124603.jpg"
        },
        otherImages: [
            '../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/Copper/1761677454253.jpg',
            '../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/Copper/1761679137693.jpg',
        ],
        availability: "In stock",
        brand: "casio",
        badge: "50% OFF",
        whatsappUrl: getWhatsAppUrl("Hi! G-Shock Casio GM-2100-1A – Copper Edition"),
        colors: [
            {
                name: "Copper",
                class: "bg-copper",
                image: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/Copper/1761680124603.jpg"
            }
        ]
    },
    {
        id: 3,
        name: "G-Shock Casio GM-2100-1A Generic - Full Black",
        description: "Premium watch with advanced features and durable design",
        details: "Water resistant, shock resistant, and built to last with premium materials",
        price: {
            old: "₹2499",
            new: "₹1499"
        },
        images: {
            main: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/full black/1760900947186.jpg",
            hover: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/full black/1760901170829.jpg"
        },
        otherImages: [
            '../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/full black/1760901293700.jpg',
            '../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/full black/1760901406873.jpg',
        ],
        tags: ["all"],
        availability: "In stock",
        brand: "casio",
        badge: "Sale",
        whatsappUrl:  getWhatsAppUrl("Hi! G-Shock Casio GM-2100-1A – Full Black Edition"),
        colors: [
            {
                name: "Black",
                class: "bg-black",
                image: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/full black/1760901406873.jpg"
            }
        ]
    },
    
    {
        id: 4,
        name: "G-Shock Casio GM-2100-1A Generic - Silver Blue",
        description: "Premium watch with advanced features and durable design",
        details: "Day/Date/Digital Time/ analog time/ all chronograph working. Trust issue live video calling option available. Provide customer's Feedback pdf. Provide live packaging video order dispatch time",
        price: {
            old: "₹2499",
            new: "₹1499"
        },
        images: {
            main: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver blue/1761852837371.jpg",
            hover: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver blue/1761853220380.jpg"
        },
        otherImages: [
            '../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver blue/1761853626398.jpg',
            '../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver blue/1761854009633.jpg',
        ],
        tags: ["all", "men", "casio", "formal"],
        availability: "In stock",
        brand: "casio",
        badge: "Sale",
        whatsappUrl:  getWhatsAppUrl("Hi! G-Shock Casio GM-2100-1A – silver blue Edition"),
        colors: [
            {
                name: "silver blue",
                class: "bg-black",
                image: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver blue/1761852837371.jpg"
            }
        ]
    },
    {
        id: 5,
        name: "G-Shock Casio GM-2100-1A Generic - Silver Grey",
        description: "Premium watch with advanced features and durable design",
        details: "Day/Date/Digital Time/ analog time/ all chronograph working. Trust issue live video calling option available. Provide customer's Feedback pdf. Provide live packaging video order dispatch time",
        price: {
            old: "₹2499",
            new: "₹1499"
        },
        images: {
            main: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver grey/gshockvietnam-20250914-0005.jpg",
            hover: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver grey/gshockvietnam-20250914-0006.jpg"
        },
        otherImages: [
            '../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver grey/gshockvietnam-20250914-0007.jpg',
            '../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver grey/gwatch_sincere-20250914-0001.jpg',
        ],
        tags: ["all", "men", "casio", "formal"],
        availability: "In stock",
        brand: "casio",
        badge: "Trending",
        whatsappUrl:  getWhatsAppUrl("Hi! G-Shock Casio GM-2100-1A – silver Grey Edition"),
        colors: [
            {
                name: "silver Grey",
                class: "bg-black",
                image: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver grey/gshockvietnam-20250914-0005.jpg"
            }
        ]
    },
    {
        id: 6,
        name: "G-Shock Casio GM-2100-1A Generic - Silver Green",
        description: "Premium watch with advanced features and durable design",
        details: "Day/Date/Digital Time/ analog time/ all chronograph working. Trust issue live video calling option available. Provide customer's Feedback pdf. Provide live packaging video order dispatch time",
        price: {
            old: "₹2499",
            new: "₹1499"
        },
        images: {
            main: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver green/1761595137325.jpg",
            hover: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver green/1761595519769.jpg"
        },
        otherImages: [
            '../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver green/1761633449387.jpg',
            '../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver green/1761635984319.jpg',
        ],
        tags: ["all", "men", "casio", "formal"],
        availability: "In stock",
        brand: "casio",
        badge: "Trending",
        whatsappUrl:  getWhatsAppUrl("Hi! G-Shock Casio GM-2100-1A – silver Green Edition"),
        colors: [
            {
                name: "silver Green",
                class: "bg-black",
                image: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver green/1761595137325.jpg"
            }
        ]
    },
    {
        id: 7,
        name: "G-Shock Casio GM-2100-1A Generic - Silver Black",
        description: "Premium watch with advanced features and durable design",
        details: "Day/Date/Digital Time/ analog time/ all chronograph working. Trust issue live video calling option available. Provide customer's Feedback pdf. Provide live packaging video order dispatch time",
        price: {
            old: "₹2499",
            new: "₹1499"
        },
        images: {
            main: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver black/1761467253895.jpg",
            hover: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver black/1761467676047.jpg"
        },
        otherImages: [
            '../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver green/1761468239476.jpg',
            '../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver green/1761476834937.jpg',
        ],
        tags: ["all", "men", "casio", "formal"],
        availability: "In stock",
        brand: "casio",
        badge: "Trending",
        whatsappUrl:  getWhatsAppUrl("Hi! G-Shock Casio GM-2100-1A – silver black Edition"),
        colors: [
            {
                name: "silver black",
                class: "bg-black",
                image: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/silver black/1761467253895.jpg"
            },
            {
        id: 8,
        name: "G-Shock Casio GM-2100-1A Generic - Green",
        description: "Premium watch with advanced features and durable design",
        details: "Day/Date/Digital Time/ analog time/ all chronograph working. Trust issue live video calling option available. Provide customer's Feedback pdf. Provide live packaging video order dispatch time",
        price: {
            old: "₹2499",
            new: "₹1499"
        },
        images: {
            main: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/green/1761655357053.jpg",
            hover: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/green/1761658655987.jpg"
        },
        otherImages: [
            '../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/green/1761662283099.jpg',
            '../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/green/1761666324380.jpg',
        ],
        tags: ["all", "men", "casio", "formal"],
        availability: "In stock",
        brand: "casio",
        badge: "Trending",
        whatsappUrl:  getWhatsAppUrl("Hi! G-Shock Casio GM-2100-1A – green Edition"),
        colors: [
            {
                name: "green",
                class: "bg-black",
                image: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/green/1761655357053.jpg"
            },
            {
        id: 9,
        name: "G-Shock Casio GM-2100-1A Generic - Gold Black",
        description: "Premium watch with advanced features and durable design",
        details: "Day/Date/Digital Time/ analog time/ all chronograph working. Trust issue live video calling option available. Provide customer's Feedback pdf. Provide live packaging video order dispatch time",
        price: {
            old: "₹2499",
            new: "₹1499"
        },
        images: {
            main: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/gold black/1760901803069.jpg",
            hover: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/gold black/1760901966386.jpg"
        },
        otherImages: [
            '../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/gold black/1760902132336.jpg',
            '../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/gold black/1760902279371.jpg',
        ],
        tags: ["all", "men", "casio", "formal"],
        availability: "In stock",
        brand: "casio",
        badge: "Trending",
        whatsappUrl:  getWhatsAppUrl("Hi! G-Shock Casio GM-2100-1A – gold black Edition"),
        colors: [
            {
                name: "gold black",
                class: "bg-black",
                image: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/gold black/1760901803069.jpg"
            },
            {
        id: 10,
        name: "G-Shock Casio GM-2100-1A Generic - Black",
        description: "Premium watch with advanced features and durable design",
        details: "Day/Date/Digital Time/ analog time/ all chronograph working. Trust issue live video calling option available. Provide customer's Feedback pdf. Provide live packaging video order dispatch time",
        price: {
            old: "₹2499",
            new: "₹1499"
        },
        images: {
            main: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/full black/1760900947186.jpg",
            hover: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/full black/1760901170829.jpg"
        },
        otherImages: [
            '../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/full black/1760901293700.jpg',
            '../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/full black/1760901406873.jpg',
        ],
        tags: ["all", "men", "casio", "formal"],
        availability: "In stock",
        brand: "casio",
        badge: "Trending",
        whatsappUrl:  getWhatsAppUrl("Hi! G-Shock Casio GM-2100-1A – black Edition"),
        colors: [
            {
                name: "black",
                class: "bg-black",
                image: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/full black/1760900947186.jpg"
            },
            {
        id: 11,
        name: "G-Shock Casio GM 2110D-2ADR Generic - Silver Green",
        description: "Premium watch with advanced features and durable design",
        details: "Day/Date/Digital Time/ analog time/ all chronograph working. Trust issue live video calling option available. Provide customer's Feedback pdf. Provide live packaging video order dispatch time",
        price: {
            old: "₹2999",
            new: "₹1699"
        },
        images: {
            main: "../images/products/watch/GM 2110D-2ADR/silver green/dealer_time-20250920-0002.jpg",
            hover: "../images/products/watch/GM 2110D-2ADR/silver green/dealer_time-20250920-0005.jpg"
        },
        otherImages: [
            '../images/products/watch/GM 2110D-2ADR/silver green/dealer_time-20250920-0008.jpg',
            '../images/products/watch/GM 2110D-2ADR/silver green/dealer_time-20250920-0010.jpg',
        ],
        tags: ["all", "men", "casio", "formal"],
        availability: "In stock",
        brand: "casio",
        badge: "Best",
        whatsappUrl:  getWhatsAppUrl("Hi! G-Shock Casio GM 2110D-2ADR – silver green Edition"),
        colors: [
            {
                name: "silver green",
                class: "bg-black",
                image: "../images/products/watch/GM 2110D-2ADR/silver green/dealer_time-20250920-0002.jpg"
            },
             {
        id: 12,
        name: "G-Shock Casio GM 2110D-2ADR Generic - Silver Orange",
        description: "Premium watch with advanced features and durable design",
        details: "Day/Date/Digital Time/ analog time/ all chronograph working. Trust issue live video calling option available. Provide customer's Feedback pdf. Provide live packaging video order dispatch time",
        price: {
            old: "₹2999",
            new: "₹1699"
        },
        images: {
            main: "../images/products/watch/GM 2110D-2ADR/silver orange/dealer_time-20250920-0012.jpg",
            hover: "../images/products/watch/GM 2110D-2ADR/silver orange/dealer_time-20250920-0013.jpg"
        },
        otherImages: [
            '../images/products/watch/GM 2110D-2ADR/silver orange/dealer_time-20250920-0015.jpg',
            '../images/products/watch/GM 2110D-2ADR/silver orange/dealer_time-20250920-0017.jpg',
        ],
        tags: ["all", "men", "casio", "formal"],
        availability: "In stock",
        brand: "casio",
        badge: "Best",
        whatsappUrl:  getWhatsAppUrl("Hi! G-Shock Casio GM 2110D-2ADR – silver orange Edition"),
        colors: [
            {
                name: "silver orange",
                class: "bg-black",
                image: "../images/products/watch/GM 2110D-2ADR/silver orange/dealer_time-20250920-0012.jpg"
            },
             {
        id: 13,
        name: "G-Shock Casio GM 2110D-2ADR Generic - Silver Black",
        description: "Premium watch with advanced features and durable design",
        details: "Day/Date/Digital Time/ analog time/ all chronograph working. Trust issue live video calling option available. Provide customer's Feedback pdf. Provide live packaging video order dispatch time",
        price: {
            old: "₹2999",
            new: "₹1699"
        },
        images: {
            main: "../images/products/watch/GM 2110D-2ADR/Silver black/Screenshot_2025-11-08-22-49-24-12_17bb6c9ae7824da93d210753acf444e6~2.jpg",
            hover: "../images/products/watch/GM 2110D-2ADR/Silver black/Screenshot_2025-11-08-22-49-32-48_17bb6c9ae7824da93d210753acf444e6~2.jpg"
        },
        otherImages: [
            '../images/products/watch/GM 2110D-2ADR/Silver black/Screenshot_2025-11-08-22-49-40-94_17bb6c9ae7824da93d210753acf444e6~2.jpg',
            '../images/products/watch/GM 2110D-2ADR/Silver black/Screenshot_2025-11-08-22-49-49-38_17bb6c9ae7824da93d210753acf444e6~2.jpg',
        ],
        tags: ["all", "men", "casio", "formal"],
        availability: "In stock",
        brand: "casio",
        badge: "Best",
        whatsappUrl:  getWhatsAppUrl("Hi! G-Shock Casio GM 2110D-2ADR – silver black Edition"),
        colors: [
            {
                name: "silver black",
                class: "bg-black",
                image: "../images/products/watch/GM 2110D-2ADR/Silver black/Screenshot_2025-11-08-22-49-24-12_17bb6c9ae7824da93d210753acf444e6~2.jpg"
            }
        ]
    }

];

