/**
 * Checkout: after order create, redirects to pay.html. Razorpay uses target _top internally,
 * which replaces the active document; running it on pay.html keeps checkout.html intact.
 */
(function (window) {
    "use strict";

    var CHECKOUT_FORM_ID = "checkoutForm";
    var PAY_CONTROL_ID = "payBtn";

    function bindSubmitGuards() {
        function killNativeSubmit(event) {
            var t = event.target;
            var form =
                t && t.tagName === "FORM"
                    ? t
                    : null;
            if (!form && typeof SubmitEvent !== "undefined" && event.submitter && event.submitter.form) {
                form = event.submitter.form;
            }
            if (!form || form.id !== CHECKOUT_FORM_ID) {
                return;
            }
            event.preventDefault();
            if (typeof event.stopImmediatePropagation === "function") {
                event.stopImmediatePropagation();
            }
        }

        document.addEventListener("submit", killNativeSubmit, true);
    }

    bindSubmitGuards();

    var store = window.WatchPlussStore;
    if (!store) {
        return;
    }

    var paymentInProgress = false;
    var PAY_SESSION_KEY = "WATCH_PLUSS_PAY_PAYLOAD";

    function $(id) {
        return document.getElementById(id);
    }

    function getFormValuesFixed() {
        var saved = $("savedAddress");
        return {
            id: (saved && saved.value && String(saved.value).trim()) || "addr_" + Date.now(),
            label: ($("addressLabel") && $("addressLabel").value.trim()) || "Saved address",
            name: ($("name") && $("name").value.trim()) || "",
            phone: ($("phone") && $("phone").value.trim()) || "",
            email: ($("email") && $("email").value.trim()) || "",
            address: ($("address") && $("address").value.trim()) || "",
            landmark: ($("landmark") && $("landmark").value.trim()) || "",
            zip: ($("zip") && $("zip").value.trim()) || "",
            paymentMode: ($("payment-mode") && $("payment-mode").value) || "Prepaid",
        };
    }

    function fillForm(address) {
        var sa = $("savedAddress");
        var al = $("addressLabel");
        var nm = $("name");
        var ph = $("phone");
        var em = $("email");
        var ad = $("address");
        var lm = $("landmark");
        var zp = $("zip");
        var pm = $("payment-mode");
        if (!sa) {
            return;
        }

        if (!address) {
            sa.value = "";
            if (al) al.value = "";
            if (nm) nm.value = "";
            if (ph) ph.value = "";
            if (em) em.value = "";
            if (ad) ad.value = "";
            if (lm) lm.value = "";
            if (zp) zp.value = "";
            if (pm) pm.value = "Prepaid";
            return;
        }

        sa.value = address.id || "";
        if (al) al.value = address.label || "";
        if (nm) nm.value = address.name || "";
        if (ph) ph.value = address.phone || "";
        if (em) em.value = address.email || "";
        if (ad) ad.value = address.address || "";
        if (lm) lm.value = address.landmark || "";
        if (zp) zp.value = address.zip || "";
        if (pm) pm.value = address.paymentMode || "Prepaid";
    }

    function renderAddressOptions() {
        var select = $("savedAddress");
        if (!select) {
            return;
        }

        var addresses = store.getAddresses();
        var selectedId = store.getSelectedAddressId();

        select.innerHTML = ["<option value=\"\">Use a new address</option>"]
            .concat(
                addresses.map(function (address) {
                    var sel = address.id === selectedId ? "selected" : "";
                    return "<option value=\"" + address.id + "\" " + sel + ">" + address.label + " - " + address.zip + "</option>";
                })
            )
            .join("");

        var selectedAddress = store.getSelectedAddress();
        if (selectedAddress) {
            fillForm(selectedAddress);
        }
    }

    function renderCart() {
        var items = store.getCartDetailed();
        var list = $("checkoutCartItems");
        var empty = $("checkoutEmpty");
        var layout = $("checkoutLayout");
        var total = $("checkoutTotal");
        var subtotal = $("checkoutSubtotal");

        if (!list || !empty || !layout || !total || !subtotal) {
            return;
        }

        if (!items.length) {
            empty.classList.remove("d-none");
            layout.classList.add("d-none");
            return;
        }

        empty.classList.add("d-none");
        layout.classList.remove("d-none");

        list.innerHTML = items
            .map(function (item) {
                return (
                    "<div class=\"d-flex gap-3 align-items-center border-bottom pb-3 mb-3\" data-cart-item=\"" +
                    item.slug +
                    "\">" +
                    "<img src=\"" +
                    item.product.images.main +
                    "\" alt=\"" +
                    item.product.name +
                    "\" style=\"width:72px;height:72px;object-fit:cover;border-radius:12px;\">" +
                    "<div class=\"flex-grow-1\">" +
                    "<a href=\"product-detail.html?pid=" +
                    item.slug +
                    "\" class=\"h6 d-block mb-1\">" +
                    item.product.name +
                    "</a>" +
                    "<div class=\"text-main mb-2\">" +
                    store.formatINR(item.unitPrice) +
                    " each</div>" +
                    "<div class=\"d-flex align-items-center gap-2\">" +
                    "<button type=\"button\" class=\"tf-btn style-line px-3 py-1 js-cart-qty\" data-slug=\"" +
                    item.slug +
                    "\" data-delta=\"-1\">-</button>" +
                    "<span class=\"h6 mb-0\">" +
                    item.quantity +
                    "</span>" +
                    "<button type=\"button\" class=\"tf-btn style-line px-3 py-1 js-cart-qty\" data-slug=\"" +
                    item.slug +
                    "\" data-delta=\"1\">+</button>" +
                    "<button type=\"button\" class=\"tf-btn-line text-danger js-remove-cart\" data-slug=\"" +
                    item.slug +
                    "\">Remove</button>" +
                    "</div></div>" +
                    "<div class=\"fw-semibold\">" +
                    store.formatINR(item.lineTotal) +
                    "</div></div>"
                );
            })
            .join("");

        var totalAmount = store.getCartTotal();
        subtotal.textContent = store.formatINR(totalAmount);
        total.textContent = store.formatINR(totalAmount);
    }

    function saveAddressFromForm() {
        var values = getFormValuesFixed();
        if (!values.name || !values.phone || !values.address || !values.zip) {
            store.notify("Fill name, phone, address and pin code before saving.", "error");
            return null;
        }

        var address = store.createAddress(values);
        renderAddressOptions();
        fillForm(address);
        store.notify("Address saved locally.");
        return address;
    }

    function resetPaymentButton() {
        paymentInProgress = false;
        var payBtn = $(PAY_CONTROL_ID);
        if (payBtn) {
            payBtn.disabled = false;
            payBtn.classList.remove("disabled");
        }
    }

    function startPaymentFlow() {
        if (paymentInProgress) {
            return Promise.resolve();
        }

        var items = store.getCart();
        if (!items.length) {
            store.notify("Your cart is empty.", "error");
            return Promise.resolve();
        }

        var address = saveAddressFromForm();
        if (!address) {
            return Promise.resolve();
        }

        paymentInProgress = true;
        var payBtn = $(PAY_CONTROL_ID);
        if (payBtn) {
            payBtn.disabled = true;
            payBtn.classList.add("disabled");
        }

        var statusEl = $("checkoutStatus");
        if (statusEl) {
            statusEl.textContent = "Creating your order...";
        }

        var payload = {
            items: items.map(function (item) {
                return { slug: item.slug, quantity: item.quantity };
            }),
            address: address,
            customer: {
                name: address.name,
                phone: address.phone,
                email: address.email,
            },
            paymentMode: address.paymentMode,
        };

        return fetch(store.apiBase + "/orders/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then(function (response) {
                return response.json().then(function (data) {
                    return { response: response, data: data };
                });
            })
            .then(function (pack) {
                var response = pack.response;
                var data = pack.data;
                if (!response.ok) {
                    throw new Error((data && data.error) || "Unable to create order.");
                }
                if (!data.keyId) {
                    throw new Error("Razorpay key missing from backend.");
                }
                if (statusEl) {
                    statusEl.textContent = "Redirecting to secure payment...";
                }

                var amount = Number(data.amount);
                if (!Number.isFinite(amount) || amount <= 0) {
                    throw new Error("Invalid payment amount from server.");
                }

                var orderId = data.orderId;

                var payPayload = {
                    apiBase: store.apiBase,
                    orderId: orderId,
                    keyId: data.keyId,
                    amount: amount,
                    currency: String(data.currency || "INR"),
                    razorpayOrderId: data.razorpayOrderId,
                    name: "Watch Pluss",
                    description: "Order payment",
                    prefill: {
                        name: address.name,
                        contact: address.phone,
                        email: address.email,
                    },
                    notes: {
                        address: address.address + ", " + address.zip,
                    },
                    theme: {
                        color: "#111111",
                    },
                };

                try {
                    sessionStorage.setItem(PAY_SESSION_KEY, JSON.stringify(payPayload));
                } catch (storageErr) {
                    resetPaymentButton();
                    throw new Error(
                        "Cannot start payment (browser storage blocked). Allow cookies/storage for this site."
                    );
                }

                var payUrl = new URL("pay.html", window.location.href).href;
                window.setTimeout(function () {
                    window.location.replace(payUrl);
                }, 0);
            });
    }

    function onPayOrSubmitTriggered(fromEvent) {
        if (fromEvent && typeof fromEvent.preventDefault === "function") {
            fromEvent.preventDefault();
        }
        return startPaymentFlow().catch(function (error) {
            console.error("Payment error:", error);
            resetPaymentButton();
            store.notify((error && error.message) || "Checkout failed.", "error");
            var statusEl = $("checkoutStatus");
            if (statusEl) {
                statusEl.textContent = (error && error.message) || "Checkout failed.";
            }
        });
    }

    function bindDocumentClickForCart() {
        document.addEventListener("click", function (event) {
            var qtyTrigger = event.target && event.target.closest && event.target.closest(".js-cart-qty");
            if (qtyTrigger) {
                var slug = qtyTrigger.getAttribute("data-slug");
                var delta = Number(qtyTrigger.getAttribute("data-delta")) || 0;
                var item = store.getCart().find(function (entry) {
                    return entry.slug === slug;
                });
                if (!item) {
                    return;
                }
                var nextQty = Math.max(1, item.quantity + delta);
                store.updateCartQuantity(slug, nextQty);
                renderCart();
                return;
            }

            var removeTrigger = event.target && event.target.closest && event.target.closest(".js-remove-cart");
            if (removeTrigger) {
                store.removeFromCart(removeTrigger.getAttribute("data-slug"));
                renderCart();
                return;
            }

            if (event.target && event.target.closest && event.target.closest("#saveAddressBtn")) {
                event.preventDefault();
                saveAddressFromForm();
                return;
            }

            if (event.target && event.target.closest && event.target.closest("#clearCartBtn")) {
                event.preventDefault();
                store.clearCart();
                renderCart();
            }
        });
    }

    function bindCheckoutForm() {
        var form = $(CHECKOUT_FORM_ID);
        if (form && form.tagName === "FORM") {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                onPayOrSubmitTriggered(event);
            });
            form.addEventListener(
                "keydown",
                function (event) {
                    var isEnter =
                        event.key === "Enter" ||
                        event.key === "NumpadEnter" ||
                        event.keyCode === 13 ||
                        event.which === 13;
                    if (!isEnter) {
                        return;
                    }
                    var tag = event.target && event.target.tagName;
                    if (tag === "TEXTAREA" || tag === "BUTTON") {
                        return;
                    }
                    event.preventDefault();
                    onPayOrSubmitTriggered(event);
                },
                true
            );
        }

        var payControl = $(PAY_CONTROL_ID);
        if (payControl) {
            payControl.type = "button";
            payControl.addEventListener("click", onPayOrSubmitTriggered, false);
        }
    }

    function init() {
        try {
            var u = new URL(window.location.href);
            if (u.searchParams.get("payment") === "success") {
                window.location.replace(new URL("order-thanks.html", window.location.href).href);
                return;
            }
        } catch (_e) {}

        renderAddressOptions();
        renderCart();
        bindDocumentClickForCart();

        var savedSelect = $("savedAddress");
        if (savedSelect) {
            savedSelect.addEventListener("change", function () {
                store.setSelectedAddress(this.value);
                fillForm(store.getSelectedAddress());
            });
        }

        bindCheckoutForm();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})(window);
