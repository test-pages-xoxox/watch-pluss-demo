import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import Razorpay from "razorpay";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 8787);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
const SERVICE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SERVICE_DIR, "..");
const PRODUCT_FILE = path.join(ROOT_DIR, "collections/js/products.js");
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";
const firestoreProjectId = process.env.FIREBASE_PROJECT_ID || "";
const firestoreClientEmail = process.env.FIREBASE_CLIENT_EMAIL || "";
const firestorePrivateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY || "");
const firestoreOrdersCollection = process.env.FIRESTORE_COLLECTION_ORDERS || "orders";
const authService = firestore ? admin.auth() : null;

const razorpay = razorpayKeyId && razorpayKeySecret
    ? new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
    })
    : null;

const firestore = initializeFirestore();

app.use(
    cors({
        origin: FRONTEND_ORIGIN === "*" ? true : FRONTEND_ORIGIN,
    })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
    res.json({
        ok: true,
        service: "watch-pluss-payments-service",
        razorpayConfigured: Boolean(razorpay),
        firestoreConfigured: Boolean(firestore),
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

        if (!firestore) {
            return res.status(500).json({
                error: "Firestore is not configured. Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
            });
        }

        const payload = req.body || {};
        const decodedUser = await getOptionalUser(req);
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

        const orderRecord = {
            id: orderId,
            receipt,
            userId: decodedUser?.uid || "",
            userEmail: decodedUser?.email || customer.email || "",
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

        await saveOrder(orderRecord);

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

app.post("/api/payments/verify", async (req, res) => {
    try {
        if (!razorpayKeySecret) {
            return res.status(500).json({ error: "Razorpay secret is not configured." });
        }

        if (!firestore) {
            return res.status(500).json({
                error: "Firestore is not configured. Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
            });
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

        const order = await readOrder(orderId);

        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }

        const updates = {
            status: "paid",
            paymentStatus: "verified",
            verifiedAt: new Date().toISOString(),
            razorpayPaymentId: razorpayPaymentId,
            razorpaySignature: razorpaySignature,
        };

        await updateOrder(orderId, updates);

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

app.get("/api/orders/me", async (req, res) => {
    try {
        if (!firestore) {
            return res.status(500).json({
                error: "Firestore is not configured. Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
            });
        }

        const decodedUser = await getRequiredUser(req);
        const snapshot = await firestore
            .collection(firestoreOrdersCollection)
            .where("userId", "==", decodedUser.uid)
            .get();

        const orders = snapshot.docs
            .map((entry) => entry.data())
            .filter((entry) => entry.paymentStatus === "verified")
            .sort((a, b) => new Date(b.verifiedAt || b.createdAt).getTime() - new Date(a.verifiedAt || a.createdAt).getTime());

        res.json({ success: true, orders });
    } catch (error) {
        console.error("orders me failed", error);
        res.status(error?.statusCode || 500).json({
            error: error instanceof Error ? error.message : "Unable to fetch user orders.",
        });
    }
});

app.get("/api/orders/:id", async (req, res) => {
    try {
        if (!firestore) {
            return res.status(500).json({
                error: "Firestore is not configured. Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
            });
        }

        const order = await readOrder(req.params.id);

        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error("order read failed", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unable to fetch order.",
        });
    }
});

app.listen(PORT, () => {
    console.log(`watch-pluss-payments-service listening on http://localhost:${PORT}`);
});

function initializeFirestore() {
    if (!firestoreProjectId || !firestoreClientEmail || !firestorePrivateKey) {
        return null;
    }

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: firestoreProjectId,
                clientEmail: firestoreClientEmail,
                privateKey: firestorePrivateKey,
            }),
        });
    }

    return admin.firestore();
}

async function getOptionalUser(req) {
    const idToken = getBearerToken(req);
    if (!idToken || !authService) {
        return null;
    }

    try {
        return await authService.verifyIdToken(idToken);
    } catch (_error) {
        return null;
    }
}

async function getRequiredUser(req) {
    const idToken = getBearerToken(req);
    if (!idToken || !authService) {
        const error = new Error("Authentication required.");
        error.statusCode = 401;
        throw error;
    }

    try {
        return await authService.verifyIdToken(idToken);
    } catch (_error) {
        const error = new Error("Invalid authentication token.");
        error.statusCode = 401;
        throw error;
    }
}

function getBearerToken(req) {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
        return "";
    }
    return header.slice("Bearer ".length).trim();
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
        name: String(address.name || "").trim(),
        phone: String(address.phone || "").trim(),
        email: String(address.email || "").trim(),
        label: String(address.label || "").trim(),
        address: String(address.address || "").trim(),
        landmark: String(address.landmark || "").trim(),
        zip: String(address.zip || "").trim(),
    };
}

async function saveOrder(order) {
    if (!firestore) {
        throw new Error("Firestore is not initialized.");
    }

    await firestore.collection(firestoreOrdersCollection).doc(order.id).set(order);
}

async function readOrder(orderId) {
    if (!firestore) {
        throw new Error("Firestore is not initialized.");
    }

    const snapshot = await firestore.collection(firestoreOrdersCollection).doc(orderId).get();
    if (!snapshot.exists) {
        return null;
    }

    return snapshot.data();
}

async function updateOrder(orderId, updates) {
    if (!firestore) {
        throw new Error("Firestore is not initialized.");
    }

    await firestore.collection(firestoreOrdersCollection).doc(orderId).set(updates, { merge: true });
}

function normalizePrivateKey(value) {
    return String(value || "").replace(/\\n/g, "\n");
}
