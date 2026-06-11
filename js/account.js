(function (window) {
    const store = window.WatchPlussStore;

    function $(id) {
        return document.getElementById(id);
    }

    function renderAuthState(detail) {
        const user = detail?.currentUser || (window.WatchPlussAuth && window.WatchPlussAuth.getCurrentUser());
        const loading = $("accountLoading");
        const guest = $("accountGuest");
        const member = $("accountMember");
        const disabled = $("accountDisabled");
        const name = $("accountUserName");
        const email = $("accountUserEmail");

        if (loading) loading.classList.add("d-none");

        if (!window.WatchPlussAuth || !window.WatchPlussAuth.hasConfig) {
            disabled?.classList.remove("d-none");
            guest?.classList.add("d-none");
            member?.classList.add("d-none");
            return;
        }

        disabled?.classList.add("d-none");

        if (!user) {
            guest?.classList.remove("d-none");
            member?.classList.add("d-none");
            renderLocalSummaries();
            return;
        }

        guest?.classList.add("d-none");
        member?.classList.remove("d-none");
        if (name) name.textContent = user.name || "Watch Pluss Member";
        if (email) email.textContent = user.email || "";
        renderLocalSummaries();
        loadOrders();
    }

    function renderLocalSummaries() {
        const cartItems = store.getCartDetailed();
        const wishlistItems = store.getWishlist();

        const cartList = $("accountCartItems");
        const wishlistList = $("accountWishlistItems");
        const cartCount = $("accountCartCount");
        const wishlistCount = $("accountWishlistCount");

        if (cartCount) cartCount.textContent = `${cartItems.length} items`;
        if (wishlistCount) wishlistCount.textContent = `${wishlistItems.length} items`;

        if (cartList) {
            cartList.innerHTML = cartItems.length ? cartItems.map((item) => `
                <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                    <a href="product-detail.html?pid=${item.slug}" class="link">${item.product.name}</a>
                    <span>${item.quantity} x ${store.formatINR(item.unitPrice)}</span>
                </div>
            `).join("") : '<p class="text-main mb-0">No items in cart.</p>';
        }

        if (wishlistList) {
            wishlistList.innerHTML = wishlistItems.length ? wishlistItems.map((item) => `
                <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                    <a href="product-detail.html?pid=${item.slug}" class="link">${item.name}</a>
                    <button type="button" class="tf-btn-line js-account-remove-wishlist" data-slug="${item.slug}">Remove</button>
                </div>
            `).join("") : '<p class="text-main mb-0">No items in wishlist.</p>';
        }
    }

    async function loadOrders() {
        const auth = window.WatchPlussAuth;
        const list = $("accountOrders");
        if (!auth || !list) return;

        const token = await auth.getIdToken();
        if (!token) {
            list.innerHTML = '<p class="text-main mb-0">Sign in to see your completed orders.</p>';
            return;
        }

        list.innerHTML = '<p class="text-main mb-0">Loading orders...</p>';

        const response = await fetch(`${window.WatchPlussStore.apiBase}/orders/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            list.innerHTML = `<p class="text-main mb-0">${data.error || "Unable to load orders."}</p>`;
            return;
        }

        const orders = Array.isArray(data.orders) ? data.orders : [];
        list.innerHTML = orders.length ? orders.map((order) => {
            const isCod = order.paymentMode === "COD";
            const badge = isCod ? '<span class="badge bg-warning text-dark ms-2">COD</span>' : '<span class="badge bg-success ms-2">Paid</span>';
            const dateStr = new Date(order.verifiedAt || order.createdAt).toLocaleDateString("en-IN");
            return `
            <div class="border rounded-4 p-3 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <strong>${order.id}</strong>
                    <span>${store.formatINR((order.amount || 0) / 100)}${badge}</span>
                </div>
                <div class="text-main mb-2">${dateStr}</div>
                <div>${(order.items || []).map((item) => `<div>${item.name} x ${item.quantity}</div>`).join("")}</div>
            </div>`;
        }).join("") : '<p class="text-main mb-0">No completed orders yet.</p>';
    }

    async function handleAuthSubmit() {
        const auth = window.WatchPlussAuth;
        const email = $("authEmail")?.value.trim();
        const password = $("authPassword")?.value;

        if (!auth) return;
        if (!email || !password) {
            store.notify("Enter email and password.", "error");
            return;
        }

        try {
            await auth.login(email, password);
            store.notify("Logged in.");
        } catch (error) {
            const code = error?.code || "";
            if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
                await auth.register(email, password);
                store.notify("Welcome! Account created.");
            } else {
                throw error;
            }
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        renderLocalSummaries();

        document.addEventListener("click", function (event) {
            if (event.target.closest("#loginBtn")) {
                event.preventDefault();
                handleAuthSubmit().catch((error) => store.notify(error.message || "Unable to log in.", "error"));
                return;
            }

            if (event.target.closest("#googleLoginBtn")) {
                event.preventDefault();
                window.WatchPlussAuth?.loginWithGoogle().catch((error) => store.notify(error.message || "Google sign in failed.", "error"));
                return;
            }

            if (event.target.closest("#logoutBtn")) {
                event.preventDefault();
                window.WatchPlussAuth?.logout().catch((error) => store.notify(error.message || "Logout failed.", "error"));
                return;
            }

            const removeWish = event.target.closest(".js-account-remove-wishlist");
            if (removeWish) {
                event.preventDefault();
                store.toggleWishlist(removeWish.getAttribute("data-slug"));
                renderLocalSummaries();
            }
        });
    });

    window.addEventListener("watchpluss-auth-ready", function (event) {
        renderAuthState(event.detail);
    });
})(window);
