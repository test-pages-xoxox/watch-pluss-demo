import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    createUserWithEmailAndPassword,
    fetchSignInMethodsForEmail,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInAnonymously,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    getFirestore,
    serverTimestamp,
    setDoc,
    writeBatch,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const config = window.WATCH_PLUSS_FIREBASE || {};
const hasConfig = Boolean(config.apiKey && config.projectId && config.appId);
const store = window.WatchPlussStore || null;

let app = null;
let auth = null;
let db = null;
let currentUser = null;
let bootstrapped = false;

if (hasConfig) {
    app = getApps()[0] || initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
}

function emitState() {
    window.dispatchEvent(new CustomEvent("watchpluss-auth-ready", {
        detail: {
            hasConfig,
            currentUser: serializeUser(currentUser),
        },
    }));
}

function serializeUser(user) {
    if (!user) return null;
    return {
        uid: user.uid,
        email: user.email || "",
        name: user.displayName || "",
        isAnonymous: Boolean(user.isAnonymous),
    };
}

function getUserCollections(uid, key) {
    return collection(db, "users", uid, key);
}

async function replaceCollection(items, key, idField) {
    if (!db || !currentUser) return;

    const colRef = getUserCollections(currentUser.uid, key);
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);

    snapshot.forEach((entry) => {
        batch.delete(entry.ref);
    });

    items.forEach((item) => {
        const id = String(item[idField]);
        batch.set(doc(db, "users", currentUser.uid, key, id), {
            ...item,
            updatedAt: serverTimestamp(),
        });
    });

    await batch.commit();
}

async function loadCollection(key) {
    if (!db || !currentUser) return [];
    const snapshot = await getDocs(getUserCollections(currentUser.uid, key));
    return snapshot.docs.map((entry) => entry.data());
}

function mergeCart(localItems, cloudItems) {
    const merged = new Map();

    [...cloudItems, ...localItems].forEach((item) => {
        const existing = merged.get(item.slug);
        if (existing) {
            existing.quantity = Math.max(existing.quantity, item.quantity || 1);
        } else {
            merged.set(item.slug, {
                slug: item.slug,
                quantity: Math.max(1, Number(item.quantity) || 1),
                name: item.name || "",
                image: item.image || "",
                price: item.price || "",
            });
        }
    });

    return Array.from(merged.values());
}

function mergeWishlist(localItems, cloudItems) {
    const merged = new Map();
    [...cloudItems, ...localItems].forEach((item) => {
        if (!merged.has(item.slug)) {
            merged.set(item.slug, {
                slug: item.slug,
                name: item.name || "",
                image: item.image || "",
                price: item.price || "",
            });
        }
    });
    return Array.from(merged.values());
}

function mergeAddresses(localItems, cloudItems) {
    const merged = new Map();
    [...cloudItems, ...localItems].forEach((item) => {
        merged.set(item.id, {
            id: item.id,
            label: item.label || "",
            name: item.name || "",
            phone: item.phone || "",
            email: item.email || "",
            address: item.address || "",
            landmark: item.landmark || "",
            zip: item.zip || "",
        });
    });
    return Array.from(merged.values());
}

async function syncLocalIntoCloud() {
    if (!store || !currentUser || !db) return;

    const localCart = store.getCart();
    const localWishlist = store.getWishlist();
    const localAddresses = store.getAddresses();
    const cloudCart = await loadCollection("cartItems");
    const cloudWishlist = await loadCollection("wishlistItems");
    const cloudAddresses = await loadCollection("addresses");

    const mergedCart = mergeCart(localCart, cloudCart);
    const mergedWishlist = mergeWishlist(localWishlist, cloudWishlist);
    const mergedAddresses = mergeAddresses(localAddresses, cloudAddresses);

    store.replaceCart(mergedCart, { silent: true });
    store.replaceWishlist(mergedWishlist, { silent: true });
    store.replaceAddresses(mergedAddresses, { silent: true });

    await Promise.all([
        replaceCollection(mergedCart, "cartItems", "slug"),
        replaceCollection(mergedWishlist, "wishlistItems", "slug"),
        replaceCollection(mergedAddresses, "addresses", "id"),
        setDoc(doc(db, "users", currentUser.uid), {
            email: currentUser.email || "",
            name: currentUser.displayName || "",
            updatedAt: serverTimestamp(),
        }, { merge: true }),
    ]);
}

async function handleLocalChange(type, payload) {
    if (!currentUser || !db) return;
    if (type === "cart") {
        await replaceCollection(payload || [], "cartItems", "slug");
    }
    if (type === "wishlist") {
        await replaceCollection(payload || [], "wishlistItems", "slug");
    }
    if (type === "addresses") {
        await replaceCollection(payload || [], "addresses", "id");
    }
}

async function register(email, password) {
    if (!auth) throw new Error("Firebase Auth is not configured yet.");
    return createUserWithEmailAndPassword(auth, email, password);
}

async function login(email, password) {
    if (!auth) throw new Error("Firebase Auth is not configured yet.");
    return signInWithEmailAndPassword(auth, email, password);
}

async function loginWithGoogle() {
    if (!auth) throw new Error("Firebase Auth is not configured yet.");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return signInWithPopup(auth, provider);
}

async function logout() {
    if (!auth) throw new Error("Firebase Auth is not configured yet.");
    return signOut(auth);
}

async function getIdToken() {
    if (!auth || !auth.currentUser) return "";
    return auth.currentUser.getIdToken();
}

function initializeAuthState() {
    if (!auth || bootstrapped) {
        emitState();
        return;
    }

    bootstrapped = true;
    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        emitState();

        try {
            if (currentUser) {
                await syncLocalIntoCloud();
                emitState();
            }
        } catch (error) {
            console.error("auth sync failed", error);
        }
    });
}

async function loginAnonymously() {
    if (!auth) throw new Error("Firebase Auth is not configured yet.");
    return signInAnonymously(auth);
}

async function checkEmailExists(email) {
    if (!auth) return false;
    try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        return methods.length > 0;
    } catch (_e) {
        return false;
    }
}

window.WatchPlussAuth = {
    hasConfig,
    register,
    login,
    loginWithGoogle,
    loginAnonymously,
    checkEmailExists,
    logout,
    getIdToken,
    getCurrentUser: () => serializeUser(currentUser),
    handleLocalChange,
    loadUserCollections: async () => ({
        cart: await loadCollection("cartItems"),
        wishlist: await loadCollection("wishlistItems"),
        addresses: await loadCollection("addresses"),
    }),
};

initializeAuthState();
