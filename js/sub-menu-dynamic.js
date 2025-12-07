// ----- DATA OBJECTS -----
const Mens = [
    {label: "Formal Watches", cat: "formal"},
    {label: "Digital Watches", cat: "digital"},
    {label: "Analog Watches", cat: "analog"},
    {label: "Chain Belt Watches", cat: "chain"},
    {label: "Leather Belt Watches", cat: "leather"},
];

const Womens = [
    {label: "Formal Watches", cat: "women-formal"},
    {label: "Digital Watches", cat: "women-digital"},
    {label: "Analog Watches", cat: "women-analog"},
    {label: "Chain Belt Watches", cat: "women-chain"},
    {label: "Leather Belt Watches", cat: "women-leather"},
];

const Brands = [
    {label: "Casio - Generic", cat: "casio"},
    {label: "Armani - Generic", cat: "armani"},
    {label: "Tissot - Generic", cat: "tissot"},
    {label: "Patek Philippe", cat: "patek"},
    {label: "Fossil - Generic", cat: "fossil"},
    {label: "Rolex - Generic", cat: "rolex"},
    {label: "Omega - Generic", cat: "omega"},
    {label: "Breitling - Generic", cat: "breitling"},
    {label: "Hublot - Generic", cat: "hublot"},
];

// ----- RENDER FUNCTION -----
function renderMenu(ulId, items) {
    const ul = document.getElementById(ulId);
    if (!ul) return;

    ul.innerHTML = ""; // clear existing items if any

    items.forEach(item => {
        const li = document.createElement("li");
        const a = document.createElement("a");

        a.href = "latest-collection.html?cat=" + encodeURIComponent(item.cat);
        a.className = "sub-menu_link";
        a.textContent = item.label;

        li.appendChild(a);
        ul.appendChild(li);
    });
}

function getRandomItems(arr, count) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function renderFooterBrands() {
    const ul = document.getElementById("footer-brand-menu");
    if (!ul) return;

    const randomBrands = getRandomItems(Brands, 6);

    ul.innerHTML = "";

    randomBrands.forEach(brand => {
        const li = document.createElement("li");
        const a = document.createElement("a");

        a.href = "latest-collection.html?cat=" + encodeURIComponent(brand.cat);
        a.className = "link h6";
        a.textContent = brand.label;

        li.appendChild(a);
        ul.appendChild(li);
    });
}

// ----- INITIALIZE MENUS -----
document.addEventListener("DOMContentLoaded", function () {
    renderMenu("mens-menu", Mens);
    renderMenu("womens-menu", Womens);
    renderMenu("brands-menu", Brands);
    renderFooterBrands();
});
