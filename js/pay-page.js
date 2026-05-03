/**
 * Dedicated payment tab: Razorpay defaults to target _top / full navigation.
 * Running checkout here avoids wiping checkout.html mid-flow.
 */
(function (window) {
    "use strict";

    var SESSION_KEY = "WATCH_PLUSS_PAY_PAYLOAD";

    function $(id) {
        return document.getElementById(id);
    }

    function setStatus(text) {
        var el = $("pay-status");
        if (el) {
            el.textContent = text;
        }
    }

    function goCheckout() {
        window.location.replace(new URL("checkout.html", window.location.href).href);
    }

    function goOrderThanks(confirmedOrderId) {
        var url = new URL("order-thanks.html", window.location.href);
        if (confirmedOrderId) {
            url.searchParams.set("order", String(confirmedOrderId));
        }
        window.location.replace(url.href);
    }

    var store = window.WatchPlussStore;
    var raw = null;
    try {
        raw = sessionStorage.getItem(SESSION_KEY);
    } catch (_e) {
        setStatus("Could not read session storage.");
        return;
    }

    if (!raw) {
        setStatus("No payment session. Use “Pay with Razorpay” on checkout first.");
        return;
    }

    var p;
    try {
        p = JSON.parse(raw);
    } catch (_e2) {
        sessionStorage.removeItem(SESSION_KEY);
        setStatus("Invalid payment session.");
        return;
    }

    if (!p.keyId || !p.razorpayOrderId || !p.orderId || !p.apiBase) {
        sessionStorage.removeItem(SESSION_KEY);
        setStatus("Incomplete payment session.");
        return;
    }

    if (typeof window.Razorpay !== "function") {
        setStatus("Razorpay script failed to load.");
        return;
    }

    var amount = Number(p.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
        sessionStorage.removeItem(SESSION_KEY);
        setStatus("Invalid amount in session.");
        return;
    }

    setStatus("Opening Razorpay…");

    var options = {
        key: p.keyId,
        amount: amount,
        currency: String(p.currency || "INR"),
        name: p.name || "Watch Pluss",
        description: p.description || "Order payment",
        order_id: p.razorpayOrderId,
        target: "_self",
        handler: function (paymentResponse) {
            setStatus("Verifying payment…");
            fetch(p.apiBase + "/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    Object.assign({ orderId: p.orderId }, paymentResponse)
                ),
            })
                .then(function (res) {
                    return res.json().then(function (body) {
                        return { ok: res.ok, body: body };
                    });
                })
                .then(function (ref) {
                    if (!ref.ok) {
                        throw new Error((ref.body && ref.body.error) || "Verification failed.");
                    }
                    try {
                        sessionStorage.removeItem(SESSION_KEY);
                    } catch (_e3) {}
                    if (store && typeof store.clearCart === "function") {
                        store.clearCart();
                    }
                    goOrderThanks(ref.body.orderId || p.orderId);
                })
                .catch(function (err) {
                    console.error(err);
                    try {
                        sessionStorage.removeItem(SESSION_KEY);
                    } catch (_e4) {}
                    setStatus((err && err.message) || "Verification failed. Contact support with your bank SMS.");
                    if (store && typeof store.notify === "function") {
                        store.notify("Payment may have gone through but verification failed.", "error");
                    }
                });
        },
        modal: {
            escape: false,
            ondismiss: function () {
                try {
                    sessionStorage.removeItem(SESSION_KEY);
                } catch (_e) {}
                goCheckout();
            },
        },
        prefill: p.prefill || {},
        notes: p.notes || {},
        theme: p.theme || { color: "#111111" },
    };

    var rzp;
    try {
        rzp = new window.Razorpay(options);
    } catch (err) {
        sessionStorage.removeItem(SESSION_KEY);
        setStatus((err && err.message) || "Could not start Razorpay.");
        return;
    }

    rzp.on("payment.failed", function (event) {
        try {
            sessionStorage.removeItem(SESSION_KEY);
        } catch (_e) {}
        setStatus((event.error && event.error.description) || "Payment failed.");
        if (store && typeof store.notify === "function") {
            store.notify("Payment failed.", "error");
        }
    });

    window.setTimeout(function () {
        try {
            rzp.open();
        } catch (openErr) {
            console.error(openErr);
            setStatus((openErr && openErr.message) || "Could not open Razorpay.");
        }
    }, 0);
})(window);
