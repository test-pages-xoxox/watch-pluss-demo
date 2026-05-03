/**
 * Creates a real Razorpay order (valid order_* id) + a matching local row in data/orders.json.
 * Use this to test whether checkout issues are tied to order_id / amount vs UI.
 *
 * Run from repo root:  node microservice/scripts/create-dummy-order.mjs
 * Or:                 cd microservice && node scripts/create-dummy-order.mjs
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import Razorpay from "razorpay";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICE_DIR = path.dirname(__dirname);
const ORDER_FILE = path.join(SERVICE_DIR, "data", "orders.json");

dotenv.config({ path: path.join(SERVICE_DIR, ".env") });

const keyId = process.env.RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

if (!keyId || !keySecret) {
    console.error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in microservice/.env");
    process.exit(1);
}

const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
});

/** 100 paise = ₹1 — small test amount Razorpay usually accepts */
const AMOUNT_PAISE = 100;

const localOrderId = "wp_DUMMY_" + Date.now() + "_" + crypto.randomBytes(4).toString("hex");
const receipt = "watchpluss_dummy_" + Date.now();

const razorpayOrder = await razorpay.orders.create({
    amount: AMOUNT_PAISE,
    currency: "INR",
    receipt,
    notes: {
        localOrderId: localOrderId,
        source: "create-dummy-order.mjs",
    },
});

const orderRecord = {
    id: localOrderId,
    receipt,
    status: "created",
    paymentStatus: "pending",
    paymentMode: "Prepaid",
    currency: "INR",
    amount: AMOUNT_PAISE,
    createdAt: new Date().toISOString(),
    customer: {
        name: "Dummy Customer",
        phone: "9999999999",
        email: "dummy@example.test",
    },
    address: {
        id: "addr_dummy",
        label: "Test",
        address: "123 Dummy Street",
        landmark: "",
        zip: "400001",
    },
    items: [
        {
            slug: "dummy-razorpay-test",
            name: "Dummy ₹1 test line (script)",
            quantity: 1,
            unitPrice: AMOUNT_PAISE,
            lineTotal: AMOUNT_PAISE,
            image: "",
        },
    ],
    razorpayOrderId: razorpayOrder.id,
    razorpayAmount: razorpayOrder.amount,
    razorpayCurrency: razorpayOrder.currency,
};

let orders = [];
try {
    orders = JSON.parse(fs.readFileSync(ORDER_FILE, "utf8"));
    if (!Array.isArray(orders)) {
        orders = [];
    }
} catch {
    orders = [];
}

orders.push(orderRecord);
fs.writeFileSync(ORDER_FILE, JSON.stringify(orders, null, 2) + "\n", "utf8");

const apiShape = {
    success: true,
    orderId: localOrderId,
    keyId,
    amount: AMOUNT_PAISE,
    currency: "INR",
    razorpayOrderId: razorpayOrder.id,
};

console.log("");
console.log("Dummy order created and appended to", ORDER_FILE);
console.log("  local orderId:     ", localOrderId);
console.log("  razorpayOrderId:   ", razorpayOrder.id);
console.log("  amount (paise):    ", AMOUNT_PAISE, "(₹1)");
console.log("");
console.log("Same shape as POST /api/orders/create response (for comparing with checkout):");
console.log(JSON.stringify(apiShape, null, 2));
console.log("");
