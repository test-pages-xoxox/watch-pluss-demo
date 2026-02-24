document.addEventListener("DOMContentLoaded", initApp);


// 2️⃣ Main Init Function
function initApp() {
    renderCategories();
}


// 3️⃣ Feature Functions (Modular)

function renderCategories() {
    const categories = [
        { name: "Casio", slug: "casio" },
        { name: "Fossil", slug: "fossil" },
        { name: "Shoes", slug: "shoes" },
        { name: "Emporio Armani Generic", slug: "armani" },
        { name: "Patek Philippe", slug: "patek" },
        { name: "Micheal Kors", slug: "micheal" }
    ];

    const listContainer = document.getElementsByClassName("quick-link-list")[0];
    if (!listContainer) return;

    categories.forEach(cat => {
        const li = document.createElement("li");
        li.innerHTML = `
            <a href="latest-collection.html?cat=${cat.slug}" 
               class="link-item text-main h6 link"
               data-category="${cat.slug}">
               ${cat.name}
            </a>
        `;
        listContainer.appendChild(li);
    });
}
