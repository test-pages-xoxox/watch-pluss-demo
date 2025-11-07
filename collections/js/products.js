const watch_tag = new Set(['men', 'women', 'kids', 'luxury', 'smart']);
const products = [
    {
        id: 1,
        name: "Summer two piece set",
        description: "Super soft and comfy fabric, skin-friendly and breathable. Women's tops dressy casual, round neck cute lightweight tops, loose fit basic tees",
        details: "Warm up or cool down with this essential 3/4 sleeve t-shirts, featured in an loose fit and Pleated sleeve design with sew seaming front for a lived-in look.",
        price: {
            old: "$99,99",
            new: "$69,99"
        },
        images: {
            main: "../images/products/product-21.jpg",
            hover: "../images/products/product-22.jpg"
        },
        tags: ["men" , "retro"],
        availability: "In stock",
        brand: "automet",
        badge: "Hot",
        whatsappUrl: "https://wa.me/1234567890?text=Hi!%20I'm%20interested%20in%20Summer%20two%20piece%20set",
        colors: [
            {
                name: "Dark",
                class: "bg-dark-charcoal",
                image: "../images/products/product-21.jpg"
            }
        ]
    },
    {
        id: 2,
        name: "Seamless breathable thong",
        description: "Comfortable and breathable seamless design for everyday wear",
        details: "Made with premium quality fabric for ultimate comfort and fit",
        price: {
            old: "$99,99",
            new: "$69,99"
        },
        tags: ["women"],
        images: {
            main: "../images/products/underwear/product-1.jpg",
            hover: "../images/products/underwear/product-2.jpg"
        },
        availability: "In stock",
        brand: "fisoew",
        badge: "20% OFF",
        whatsappUrl: "https://wa.me/1234567890?text=Hi!%20I'm%20interested%20in%20Seamless%20breathable%20thong",
        colors: [
            {
                name: "Sage Green",
                class: "bg-sage-green",
                image: "../images/products/underwear/product-1.jpg"
            },
            {
                name: "Light Orange",
                class: "bg-tomato",
                image: "../images/products/underwear/product-3.jpg"
            }
        ]
    },
    {
        id: 3,
        name: "G-Shock Casio GM-2100-1A Generic",
        description: "Premium watch with advanced features and durable design",
        details: "Water resistant, shock resistant, and built to last with premium materials",
        price: {
            old: "₹5499",
            new: "₹1499"
        },
        images: {
            main: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/Copper/1761676594529.jpg",
            hover: "../images/products/watch/G-Shock Casio GM-2100-1A Generic - 1499/Copper/1761679137693.jpg"
        },
        tags: ["all"],
        availability: "In stock",
        brand: "casio",
        badge: "Sale",
        whatsappUrl: "https://wa.me/1234567890?text=Hi!%20I'm%20interested%20in%20G-Shock%20Casio%20GM-2100-1A%20Generic",
        colors: [
            {
                name: "Black",
                class: "bg-black",
                image: "../images/products/watch-1.jpg"
            }
        ]
    }
];

