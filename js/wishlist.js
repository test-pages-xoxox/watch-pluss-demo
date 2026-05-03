(function (window) {
    const store = window.WatchPlussStore;

    if (!store) {
        return;
    }

    function renderWishlist() {
        const wrapper = document.getElementById("wishlistItems");
        const empty = document.getElementById("wishlistEmpty");
        const count = document.getElementById("wishlistCount");

        if (!wrapper || !empty || !count) {
            return;
        }

        const items = store.getWishlist()
            .map((item) => {
                const product = store.findProduct(item.slug);
                return product ? { ...item, product } : null;
            })
            .filter(Boolean);

        count.textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;

        if (!items.length) {
            wrapper.innerHTML = "";
            empty.classList.remove("d-none");
            return;
        }

        empty.classList.add("d-none");
        wrapper.innerHTML = items.map((item) => `
            <div class="col-md-6 col-xl-4">
                <div class="border rounded-4 p-3 h-100 d-flex flex-column">
                    <a href="product-detail.html?pid=${item.product.slug}" class="mb-3 d-block">
                        <img src="${item.product.images.main}" alt="${item.product.name}" style="width:100%;height:320px;object-fit:cover;border-radius:18px;">
                    </a>
                    <div class="flex-grow-1">
                        <a href="product-detail.html?pid=${item.product.slug}" class="h5 d-block mb-2">${item.product.name}</a>
                        <p class="text-main mb-3">${store.formatINR(Number(String(item.product?.price?.new || item.product?.price?.old || "").replace(/[^0-9.]/g, "")))}</p>
                    </div>
                    <div class="d-flex gap-2">
                        <a href="checkout.html" data-product-slug="${item.product.slug}" class="tf-btn animate-btn flex-grow-1 js-add-to-cart">Add to Cart</a>
                        <button type="button" data-slug="${item.product.slug}" class="tf-btn style-line flex-grow-1 js-remove-wishlist">Remove</button>
                    </div>
                </div>
            </div>
        `).join("");
    }

    document.addEventListener("DOMContentLoaded", function () {
        renderWishlist();

        document.addEventListener("click", function (event) {
            const removeTrigger = event.target.closest(".js-remove-wishlist");
            if (!removeTrigger) {
                return;
            }

            event.preventDefault();
            store.toggleWishlist(removeTrigger.getAttribute("data-slug"));
            renderWishlist();
        });
    });
})(window);
