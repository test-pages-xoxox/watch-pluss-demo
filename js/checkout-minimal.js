/**
 * Isolation checkout: same payment API as checkout.js, no theme DOM/CSS/JS.
 * Field/container ids use the "m-" prefix only.
 */
(function (window) {
    "use strict";

    var FORM_ID = "m-checkoutForm";
    var PAY_ID = "m-payBtn";

    document.addEventListener(
        "submit",
        function (event) {
            var t = event.target;
            var formEl = t && t.tagName === "FORM" ? t : null;
            if (!formEl && typeof SubmitEvent !== "undefined" && event.submitter && event.submitter.form) {
                formEl = event.submitter.form;
            }
            if (!formEl || formEl.id !== FORM_ID) {
                return;
            }
            event.preventDefault();
            if (typeof event.stopImmediatePropagation === "function") {
                event.stopImmediatePropagation();
            }
        },
        true
    );

    var store = window.WatchPlussStore;
    if (!store) {
        return;
    }

    var paymentInProgress = false;
    var PAY_SESSION_KEY = "WATCH_PLUSS_PAY_PAYLOAD";

    function $(id) {
        return document.getElementById(id);
    }

    function getValues() {
        var saved = $("m-savedAddress");
        return {
            id: (saved && saved.value && String(saved.value).trim()) || "addr_" + Date.now(),
            label: ($("m-addressLabel") && $("m-addressLabel").value.trim()) || "Saved address",
            name: ($("m-name") && $("m-name").value.trim()) || "",
            phone: ($("m-phone") && $("m-phone").value.trim()) || "",
            email: ($("m-email") && $("m-email").value.trim()) || "",
            address: ($("m-address") && $("m-address").value.trim()) || "",
            landmark: ($("m-landmark") && $("m-landmark").value.trim()) || "",
            zip: ($("m-zip") && $("m-zip").value.trim()) || "",
            paymentMode: ($("m-payment-mode") && $("m-payment-mode").value) || "Prepaid",
        };
    }

    function fillForm(address) {
        var sa = $("m-savedAddress");
        if (!sa) {
            return;
        }
        if (!address) {
            sa.value = "";
            if ($("m-addressLabel")) $("m-addressLabel").value = "";
            if ($("m-name")) $("m-name").value = "";
            if ($("m-phone")) $("m-phone").value = "";
            if ($("m-email")) $("m-email").value = "";
            if ($("m-address")) $("m-address").value = "";
            if ($("m-landmark")) $("m-landmark").value = "";
            if ($("m-zip")) $("m-zip").value = "";
            if ($("m-payment-mode")) $("m-payment-mode").value = "Prepaid";
            return;
        }
        sa.value = address.id || "";
        if ($("m-addressLabel")) $("m-addressLabel").value = address.label || "";
        if ($("m-name")) $("m-name").value = address.name || "";
        if ($("m-phone")) $("m-phone").value = address.phone || "";
        if ($("m-email")) $("m-email").value = address.email || "";
        if ($("m-address")) $("m-address").value = address.address || "";
        if ($("m-landmark")) $("m-landmark").value = address.landmark || "";
        if ($("m-zip")) $("m-zip").value = address.zip || "";
        if ($("m-payment-mode")) $("m-payment-mode").value = address.paymentMode || "Prepaid";
    }

    function renderAddressOptions() {
        var select = $("m-savedAddress");
        if (!select) {
            return;
        }
        var addresses = store.getAddresses();
        var selectedId = store.getSelectedAddressId();
        select.innerHTML = ["<option value=\"\">Use a new address</option>"]
            .concat(
                addresses.map(function (address) {
                    var sel = address.id === selectedId ? "selected" : "";
                    return (
                        "<option value=\"" +
                        address.id +
                        "\" " +
                        sel +
                        ">" +
                        address.label +
                        " - " +
                        address.zip +
                        "</option>"
                    );
                })
            )
            .join("");
        var selectedAddress = store.getSelectedAddress();
        if (selectedAddress) {
            fillForm(selectedAddress);
        }
    }

    function renderCartSummary() {
        var box = $("m-cartList");
        if (!box) {
            return;
        }
        var items = store.getCartDetailed();
        if (!items.length) {
            box.textContent =
                "Cart is empty. Add products from the shop, then open this page again.";
            return;
        }
        var lines = items.map(function (item) {
            return (
                item.product.name +
                " × " +
                item.quantity +
                " — " +
                store.formatINR(item.lineTotal)
            );
        });
        lines.push("Total: " + store.formatINR(store.getCartTotal()));
        box.innerHTML = lines.join("<br>");
    }

    function saveAddressFromForm() {
        var values = getValues();
        if (!values.name || !values.phone || !values.address || !values.zip) {
            statusMsg("Fill name, phone, address and PIN before paying.", true);
            return null;
        }
        var address = store.createAddress(values);
        renderAddressOptions();
        fillForm(address);
        statusMsg("Address saved locally.");
        store.notify("Address saved locally.");
        return address;
    }

    function statusMsg(text, isError) {
        var el = $("m-status");
        if (el) {
            el.textContent = text || "";
            el.style.color = isError ? "#a00" : "#333";
        }
        if (isError) {
            store.notify(text, "error");
        }
    }

    function resetPaymentButton() {
        paymentInProgress = false;
        var payBtn = $(PAY_ID);
        if (payBtn) {
            payBtn.disabled = false;
        }
    }

    function startPayment() {
        if (paymentInProgress) {
            return Promise.resolve();
        }
        var items = store.getCart();
        if (!items.length) {
            statusMsg("Cart is empty.", true);
            return Promise.resolve();
        }
        var address = saveAddressFromForm();
        if (!address) {
            return Promise.resolve();
        }

        paymentInProgress = true;
        var payBtn = $(PAY_ID);
        if (payBtn) {
            payBtn.disabled = true;
        }
        statusMsg("Creating your order…");

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
                statusMsg("Redirecting to secure payment…");
                var amount = Number(data.amount);
                if (!Number.isFinite(amount) || amount <= 0) {
                    throw new Error("Invalid amount from server.");
                }

                var orderId = data.orderId;

                var payPayload = {
                    apiBase: store.apiBase,
                    orderId: orderId,
                    keyId: data.keyId,
                    amount: amount,
                    currency: String(data.currency || "INR"),
                    razorpayOrderId: data.razorpayOrderId,
                    name: "Watch Pluss (minimal test)",
                    description: "Order payment",
                    prefill: {
                        name: address.name,
                        contact: address.phone,
                        email: address.email,
                    },
                    notes: { address: address.address + ", " + address.zip },
                    theme: { color: "#111111" },
                };

                try {
                    sessionStorage.setItem(PAY_SESSION_KEY, JSON.stringify(payPayload));
                } catch (storageErr) {
                    resetPaymentButton();
                    throw new Error(
                        "Cannot start payment (browser storage blocked). Allow storage for this site."
                    );
                }

                var payUrl = new URL("pay.html", window.location.href).href;
                window.setTimeout(function () {
                    window.location.replace(payUrl);
                }, 0);
            });
    }

    function onPayOrSubmit(ev) {
        if (ev && typeof ev.preventDefault === "function") {
            ev.preventDefault();
        }
        return startPayment().catch(function (err) {
            console.error(err);
            resetPaymentButton();
            statusMsg((err && err.message) || "Checkout failed.", true);
            store.notify((err && err.message) || "Checkout failed.", "error");
        });
    }

    function init() {
        renderCartSummary();
        renderAddressOptions();

        var form = $(FORM_ID);
        if (form) {
            form.addEventListener("submit", onPayOrSubmit);
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
                    onPayOrSubmit(event);
                },
                true
            );
        }

        var pay = $(PAY_ID);
        if (pay) {
            pay.type = "button";
            pay.addEventListener("click", onPayOrSubmit);
        }

        var save = $("m-saveBtn");
        if (save) {
            save.addEventListener("click", function () {
                saveAddressFromForm();
            });
        }

        var sel = $("m-savedAddress");
        if (sel) {
            sel.addEventListener("change", function () {
                store.setSelectedAddress(this.value);
                fillForm(store.getSelectedAddress());
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})(window);
