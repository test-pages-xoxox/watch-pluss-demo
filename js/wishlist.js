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
            <div class="col-6 col-lg-3">
                <div class="border rounded-4 p-3 h-100 d-flex flex-column">
                    <a href="product-detail.html?pid=${item.product.slug}" class="mb-3 d-block">
                        <img src="${item.product.images.main}" alt="${item.product.name}" style="width:100%;height:220px;object-fit:cover;border-radius:18px;">
                    </a>
                    <div class="flex-grow-1">
                        <a href="product-detail.html?pid=${item.product.slug}" class="h5 d-block mb-2">${item.product.name}</a>
                        <p class="text-main mb-3">${store.formatINR(Number(String(item.product?.price?.new || item.product?.price?.old || "").replace(/[^0-9.]/g, "")))}</p>
                    </div>
                    <div class="d-flex flex-column flex-md-row gap-2">
                        <button type="button" data-product-slug="${item.product.slug}" class="tf-btn animate-btn flex-grow-1 js-add-to-cart">Add to Cart</button>
                        <button type="button" data-slug="${item.product.slug}" class="tf-btn style-line flex-grow-1 js-remove-wishlist">Remove</button>
                    </div>
                </div>
            </div>
        `).join("");
    }

    document.addEventListener("DOMContentLoaded", function () {
        renderWishlist();

        document.addEventListener("click", function (event) {
            const cartTrigger = event.target.closest(".js-add-to-cart");
            if (cartTrigger) {
                event.preventDefault();
                const slug = cartTrigger.getAttribute("data-product-slug");
                store.addToCart(slug);
                store.toggleWishlist(slug);
                store.notify("Moved to cart.");
                renderWishlist();
                return;
            }

            const removeTrigger = event.target.closest(".js-remove-wishlist");
            if (removeTrigger) {
                event.preventDefault();
                store.toggleWishlist(removeTrigger.getAttribute("data-slug"));
                renderWishlist();
            }
        });
    });
})(window);
