(function (window) {
    const STORAGE_KEYS = {
        cart: "watchpluss.cart",
        wishlist: "watchpluss.wishlist",
        addresses: "watchpluss.addresses",
        selectedAddressId: "watchpluss.selectedAddressId",
    };

    const API_BASE = String(window.WATCH_PLUSS_API_BASE || "http://localhost:8787/api").replace(/\/$/, "");

    function read(key, fallback) {
        try {
            const raw = window.localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (_error) {
            return fallback;
        }
    }

    function write(key, value) {
        window.localStorage.setItem(key, JSON.stringify(value));
    }

    function getProducts() {
        if (Array.isArray(window.products)) {
            return window.products;
        }
        if (typeof products !== "undefined" && Array.isArray(products)) {
            return products;
        }
        return [];
    }

    function findProduct(slug) {
        return getProducts().find((item) => String(item.slug) === String(slug)) || null;
    }

    function parsePrice(value) {
        const amount = Number(String(value || "").replace(/[^0-9.]/g, ""));
        return Number.isFinite(amount) ? amount : 0;
    }

    function getCart() {
        return read(STORAGE_KEYS.cart, []);
    }

    function saveCart(cart) {
        write(STORAGE_KEYS.cart, cart);
        syncBadges();
        syncCloud("cart", cart);
    }

    function getWishlist() {
        return read(STORAGE_KEYS.wishlist, []);
    }

    function saveWishlist(items) {
        write(STORAGE_KEYS.wishlist, items);
        syncBadges();
        syncWishlistButtons();
        syncCloud("wishlist", items);
    }

    function getAddresses() {
        return read(STORAGE_KEYS.addresses, []);
    }

    function saveAddresses(addresses) {
        write(STORAGE_KEYS.addresses, addresses);
    }

    function replaceCart(cart, options) {
        write(STORAGE_KEYS.cart, cart);
        syncBadges();
        if (!(options && options.silent)) {
            syncCloud("cart", cart);
        }
    }

    function replaceWishlist(items, options) {
        write(STORAGE_KEYS.wishlist, items);
        syncBadges();
        syncWishlistButtons();
        if (!(options && options.silent)) {
            syncCloud("wishlist", items);
        }
    }

    function addToCart(slug, options) {
        const settings = options || {};
        const quantity = Math.max(1, Number(settings.quantity) || 1);
        const product = findProduct(slug);

        if (!product) {
            notify("This product is not available in the local catalog.", "error");
            return null;
        }

        let cart = getCart();

        if (settings.replace) {
            cart = [];
        }

        const existing = cart.find((item) => item.slug === product.slug);
        if (existing) {
            existing.quantity = settings.replace ? quantity : existing.quantity + quantity;
        } else {
            cart.push({
                slug: product.slug,
                quantity,
                name: product.name,
                image: product?.images?.main || "",
                price: product?.price?.new || product?.price?.old || "",
            });
        }

        saveCart(cart);
        notify(settings.message || "Added to cart.");

        if (settings.redirectToCheckout) {
            window.location.href = "checkout.html";
        }

        return cart;
    }

    function updateCartQuantity(slug, quantity) {
        const cart = getCart()
            .map((item) => item.slug === slug ? { ...item, quantity: Math.max(1, Number(quantity) || 1) } : item);
        saveCart(cart);
        return cart;
    }

    function removeFromCart(slug) {
        const cart = getCart().filter((item) => item.slug !== slug);
        saveCart(cart);
        return cart;
    }

    function clearCart() {
        saveCart([]);
    }

    function toggleWishlist(slug) {
        const product = findProduct(slug);
        if (!product) {
            notify("This product is not available in the local catalog.", "error");
            return false;
        }

        const wishlist = getWishlist();
        const index = wishlist.findIndex((item) => item.slug === slug);

        if (index >= 0) {
            wishlist.splice(index, 1);
            saveWishlist(wishlist);
            notify("Removed from wishlist.");
            return false;
        }

        wishlist.push({
            slug: product.slug,
            name: product.name,
            image: product?.images?.main || "",
            price: product?.price?.new || product?.price?.old || "",
        });
        saveWishlist(wishlist);
        notify("Saved to wishlist.");
        return true;
    }

    function isWishlisted(slug) {
        return getWishlist().some((item) => item.slug === slug);
    }

    function createAddress(address) {
        const addresses = getAddresses();
        const next = {
            id: address.id || `addr_${Date.now()}`,
            label: address.label || "Saved address",
            name: String(address.name || "").trim(),
            phone: String(address.phone || "").trim(),
            email: String(address.email || "").trim(),
            address: String(address.address || "").trim(),
            landmark: String(address.landmark || "").trim(),
            zip: String(address.zip || "").trim(),
            paymentMode: String(address.paymentMode || "Prepaid").trim(),
        };

        const existingIndex = addresses.findIndex((item) => item.id === next.id);
        if (existingIndex >= 0) {
            addresses[existingIndex] = next;
        } else {
            addresses.push(next);
        }

        saveAddresses(addresses);
        setSelectedAddress(next.id);
        return next;
    }

    function setSelectedAddress(addressId) {
        window.localStorage.setItem(STORAGE_KEYS.selectedAddressId, String(addressId || ""));
    }

    function getSelectedAddressId() {
        return window.localStorage.getItem(STORAGE_KEYS.selectedAddressId) || "";
    }

    function getSelectedAddress() {
        const selectedId = getSelectedAddressId();
        return getAddresses().find((item) => item.id === selectedId) || null;
    }

    function getCartDetailed() {
        return getCart()
            .map((item) => {
                const product = findProduct(item.slug);
                if (!product) return null;
                const unitPrice = parsePrice(product?.price?.new || product?.price?.old);
                return {
                    ...item,
                    product,
                    unitPrice,
                    lineTotal: unitPrice * item.quantity,
                };
            })
            .filter(Boolean);
    }

    function getCartTotal() {
        return getCartDetailed().reduce((sum, item) => sum + item.lineTotal, 0);
    }

    function formatINR(value) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(Number(value) || 0);
    }

    function syncBadges() {
        const cartCount = getCart().reduce((sum, item) => sum + item.quantity, 0);
        const wishlistCount = getWishlist().length;

        document.querySelectorAll("[data-cart-count]").forEach((node) => {
            node.textContent = String(cartCount);
            node.style.display = cartCount > 0 ? "flex" : "none";
        });

        document.querySelectorAll("[data-wishlist-count]").forEach((node) => {
            node.textContent = String(wishlistCount);
            node.style.display = wishlistCount > 0 ? "flex" : "none";
        });
    }

    function syncWishlistButtons() {
        document.querySelectorAll("[data-wishlist-slug]").forEach((node) => {
            const active = isWishlisted(node.getAttribute("data-wishlist-slug"));
            node.classList.toggle("addwishlist", active);

            const tooltip = node.querySelector(".tooltip");
            if (tooltip) {
                tooltip.textContent = active ? "Remove Wishlist" : "Add to Wishlist";
            }

            const icon = node.querySelector(".icon");
            if (icon) {
                icon.classList.toggle("icon-trash", active);
                icon.classList.toggle("icon-heart", !active);
            }

            const text = node.querySelector(".text");
            if (text) {
                text.textContent = active ? "Remove List" : "Add to List";
            }
        });
    }

    function notify(message, type) {
        const existing = document.querySelector(".wp-toast");
        if (existing) {
            existing.remove();
        }

        const toast = document.createElement("div");
        toast.className = `wp-toast ${type === "error" ? "is-error" : ""}`;
        toast.textContent = message;
        toast.style.position = "fixed";
        toast.style.right = "20px";
        toast.style.bottom = "20px";
        toast.style.zIndex = "9999";
        toast.style.padding = "12px 16px";
        toast.style.borderRadius = "12px";
        toast.style.background = type === "error" ? "#7d1f1f" : "#111111";
        toast.style.color = "#ffffff";
        toast.style.boxShadow = "0 10px 30px rgba(0,0,0,0.18)";
        document.body.appendChild(toast);

        window.setTimeout(() => {
            toast.remove();
        }, 2200);
    }

    function syncCloud(type, payload) {
        if (window.WatchPlussAuth && typeof window.WatchPlussAuth.handleLocalChange === "function") {
            window.WatchPlussAuth.handleLocalChange(type, payload).catch((error) => {
                console.error(`Failed to sync ${type}`, error);
            });
        }
    }

    function bindStoreActions() {
        document.addEventListener("click", function (event) {
            const cartTrigger = event.target.closest("[data-product-slug].js-add-to-cart");
            if (cartTrigger) {
                event.preventDefault();
                addToCart(cartTrigger.getAttribute("data-product-slug"), {
                    redirectToCheckout: cartTrigger.getAttribute("data-buy-now") === "true",
                    replace: cartTrigger.getAttribute("data-buy-now") === "true",
                });
                return;
            }

            const wishlistTrigger = event.target.closest("[data-wishlist-slug].js-toggle-wishlist");
            if (wishlistTrigger) {
                event.preventDefault();
                toggleWishlist(wishlistTrigger.getAttribute("data-wishlist-slug"));
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        bindStoreActions();
        syncBadges();
        syncWishlistButtons();
    });

    window.WatchPlussStore = {
        apiBase: API_BASE,
        formatINR,
        findProduct,
        getCart,
        getCartDetailed,
        getCartTotal,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        replaceCart,
        getWishlist,
        toggleWishlist,
        isWishlisted,
        replaceWishlist,
        getAddresses,
        createAddress,
        setSelectedAddress,
        getSelectedAddress,
        getSelectedAddressId,
        notify,
        syncBadges,
        syncWishlistButtons,
    };
})(window);
