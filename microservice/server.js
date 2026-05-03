import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 8787);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
const SERVICE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SERVICE_DIR, "..");
const PRODUCT_FILE = path.join(ROOT_DIR, "collections/js/products.js");
const DATA_DIR = path.join(SERVICE_DIR, "data");
const ORDER_FILE = path.join(DATA_DIR, "orders.json");
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";

console.log("ID:", razorpayKeyId);
const razorpay = razorpayKeyId && razorpayKeySecret
    ? new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
    })
    : null;

app.use(
    cors({
        origin: FRONTEND_ORIGIN === "*" ? true : FRONTEND_ORIGIN,
    })
);
app.use(express.json({ limit: "1mb" }));

ensureStorage();

app.get("/health", (_req, res) => {
    res.json({
        ok: true,
        service: "watch-pluss-payments-service",
        razorpayConfigured: Boolean(razorpay),
        date: new Date().toISOString(),
    });
});

app.post("/api/orders/create", async (req, res) => {
    try {
        if (!razorpay) {
            return res.status(500).json({
                error: "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to microservice/.env.",
            });
        }

        const payload = req.body || {};
        const items = Array.isArray(payload.items) ? payload.items : [];
        const address = normalizeAddress(payload.address || {});
        const customer = normalizeCustomer(payload.customer || {});
        const paymentMode = String(payload.paymentMode || "Prepaid");

        if (!items.length) {
            return res.status(400).json({ error: "Cart is empty." });
        }

        if (!customer.name || !customer.phone || !address.address || !address.zip) {
            return res.status(400).json({ error: "Customer name, phone, address and pin code are required." });
        }

        const catalog = loadCatalog();
        const normalizedItems = buildTrustedItems(items, catalog);

        if (!normalizedItems.length) {
            return res.status(400).json({ error: "No valid items were found in the cart." });
        }

        const amount = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
        if (amount <= 0) {
            return res.status(400).json({ error: "Calculated order amount is invalid." });
        }

        const orderId = `wp_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
        const receipt = `watchpluss_${Date.now()}`;

        const razorpayOrder = await razorpay.orders.create({
            amount,
            currency: "INR",
            receipt,
            notes: {
                localOrderId: orderId,
                customerName: customer.name,
                customerPhone: customer.phone,
            },
        });

        console.log("Razorpay order created:", razorpayOrder);

        const orderRecord = {
            id: orderId,
            receipt,
            status: "created",
            paymentStatus: "pending",
            paymentMode,
            currency: "INR",
            amount,
            createdAt: new Date().toISOString(),
            customer,
            address,
            items: normalizedItems,
            razorpayOrderId: razorpayOrder.id,
            razorpayAmount: razorpayOrder.amount,
            razorpayCurrency: razorpayOrder.currency,
        };

        saveOrder(orderRecord);

        res.json({
            success: true,
            orderId,
            keyId: razorpayKeyId,
            amount,
            currency: "INR",
            razorpayOrderId: razorpayOrder.id,
            customer,
            address,
        });
    } catch (error) {
        console.error("order create failed", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unable to create order.",
        });
    }
});

app.post("/api/payments/verify", (req, res) => {
    try {
        if (!razorpayKeySecret) {
            return res.status(500).json({ error: "Razorpay secret is not configured." });
        }

        const {
            orderId,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
        } = req.body || {};

        if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({ error: "Missing payment verification fields." });
        }

        const expectedSignature = crypto
            .createHmac("sha256", razorpayKeySecret)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ error: "Payment signature verification failed." });
        }

        const orders = readOrders();
        const order = orders.find((entry) => entry.id === orderId);

        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }

        order.status = "paid";
        order.paymentStatus = "verified";
        order.verifiedAt = new Date().toISOString();
        order.razorpayPaymentId = razorpayPaymentId;
        order.razorpaySignature = razorpaySignature;

        writeOrders(orders);

        res.json({
            success: true,
            orderId,
            paymentId: razorpayPaymentId,
        });
    } catch (error) {
        console.error("payment verify failed", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unable to verify payment.",
        });
    }
});

app.get("/api/orders/:id", (req, res) => {
    const orders = readOrders();
    const order = orders.find((entry) => entry.id === req.params.id);

    if (!order) {
        return res.status(404).json({ error: "Order not found." });
    }

    res.json({ success: true, order });
});

app.listen(PORT, () => {
    console.log(`watch-pluss-payments-service listening on http://localhost:${PORT}`);
});

function ensureStorage() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ORDER_FILE)) {
        fs.writeFileSync(ORDER_FILE, "[]\n", "utf8");
    }
}

function loadCatalog() {
    const code = fs.readFileSync(PRODUCT_FILE, "utf8");
    const context = {};
    vm.createContext(context);
    vm.runInContext(`${code}; this.__products = products;`, context);
    return Array.isArray(context.__products) ? context.__products : [];
}

function buildTrustedItems(items, catalog) {
    return items
        .map((item) => {
            const slug = String(item.slug || "").trim();
            const quantity = Math.max(1, Number(item.quantity) || 1);
            const product = catalog.find((entry) => String(entry.slug) === slug);

            if (!product) {
                return null;
            }

            const unitPrice = getPriceInPaise(product?.price?.new || product?.price?.old);

            return {
                slug: product.slug,
                name: product.name,
                quantity,
                unitPrice,
                lineTotal: unitPrice * quantity,
                image: product?.images?.main || "",
            };
        })
        .filter(Boolean);
}

function getPriceInPaise(value) {
    const numeric = Number(String(value || "").replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(numeric)) {
        return 0;
    }
    return Math.round(numeric * 100);
}

function normalizeCustomer(customer) {
    return {
        name: String(customer.name || "").trim(),
        phone: String(customer.phone || "").trim(),
        email: String(customer.email || "").trim(),
    };
}

function normalizeAddress(address) {
    return {
        id: String(address.id || "").trim(),
        label: String(address.label || "").trim(),
        address: String(address.address || "").trim(),
        landmark: String(address.landmark || "").trim(),
        zip: String(address.zip || "").trim(),
    };
}

function readOrders() {
    try {
        return JSON.parse(fs.readFileSync(ORDER_FILE, "utf8"));
    } catch (_error) {
        return [];
    }
}

function writeOrders(orders) {
    fs.writeFileSync(ORDER_FILE, `${JSON.stringify(orders, null, 2)}\n`, "utf8");
}

function saveOrder(order) {
    const orders = readOrders();
    orders.push(order);
    writeOrders(orders);
}
