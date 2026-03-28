/* eslint-disable no-console */
(function () {
    function getProductList() {
        if (typeof products !== "undefined" && Array.isArray(products)) {
            return products;
        }
        if (Array.isArray(window.products)) {
            return window.products;
        }
        return [];
    }

    function pickProduct(productList) {
        const params = new URLSearchParams(window.location.search);
        const pidParam = params.get("pid");
        if (pidParam) {
            const byId = productList.find((item) => String(item.slug) === String(pidParam));
            if (byId) {
                return byId;
            }
        }
        return productList[0] || null;
    }

    function uniqueImages(product) {
        const seen = new Set();
        const items = [];

        const add = (src, meta = {}) => {
            if (!src || seen.has(src)) return;
            seen.add(src);
            items.push({ src, ...meta });
        };

        if (product?.images?.main) add(product.images.main);
        if (product?.images?.hover) add(product.images.hover);
        const otherImages = Array.isArray(product?.otherImages)
            ? product.otherImages
            : Array.isArray(product?.images?.others)
                ? product.images.others
                : [];
        if (otherImages) {
            otherImages.forEach((img) => {
                add(img)
            });
        }

        if (Array.isArray(product?.colors)) {
            product.colors.forEach((color) => {
                add(color.image, { colorName: color.name, colorClass: color.class });
            });
        }

        return items;
    }

    function setTextContent(element, value, fallback = "") {
        if (!element) return;
        element.textContent = value || fallback;
    }

    function parsePrice(value) {
        if (!value) return null;
        const numeric = String(value).replace(/[^0-9.,-]/g, "").replace(/,/g, "");
        const parsed = parseFloat(numeric);
        return Number.isFinite(parsed) ? parsed : null;
    }

    function updateDiscountBadge(container, newPriceStr, oldPriceStr) {
        if (!container) return;
        const badge = container.querySelector(".number-sale");
        if (!badge) return;

        const newPrice = parsePrice(newPriceStr);
        const oldPrice = parsePrice(oldPriceStr);

        if (newPrice === null || oldPrice === null || oldPrice <= newPrice) {
            badge.textContent = "";
            badge.parentElement?.classList.add("d-none");
            return;
        }

        const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
        badge.textContent = `-${discount}%`;
        badge.parentElement?.classList.remove("d-none");
    }

    function renderGallery(images, product) {
        const thumbs = document.getElementById("productThumbsWrapper");
        const gallery = document.getElementById("productGalleryWrapper");

        if (thumbs) {
            thumbs.innerHTML = images
                .map((item, index) => {
                    const color = (item.colorName || "").toLowerCase();
                    return `
                <div class="swiper-slide stagger-item" data-color="${color}" data-index="${index}">
                    <div class="item">
                        <img class="lazyload" data-src="${item.src}" src="${item.src}" alt="${product.name}">
                    </div>
                </div>`;
                })
                .join("");
        }

        if (gallery) {
            gallery.innerHTML = images
                .map((item) => {
                    const color = (item.colorName || "").toLowerCase();
                    return `
                <div class="swiper-slide" data-color="${color}">
                    <a href="${item.src}" target="_blank" class="item" data-pswp-width="860" data-pswp-height="1146">
                        <img class="tf-image-zoom lazyload" data-zoom="${item.src}" data-src="${item.src}" src="${item.src}" alt="${product.name}">
                    </a>
                </div>`;
                })
                .join("");
        }
    }

    function updateSticky(product, priceDisplay) {
        const sticky = document.querySelector(".tf-sticky-atc-product");
        if (!sticky) return;

        const img = sticky.querySelector(".tf-mini-cart-image img");
        if (img) {
            img.src = product?.images?.main || img.src;
            img.dataset.src = product?.images?.main || img.dataset.src;
            img.alt = product.name;
        }

        const name = sticky.querySelector(".tf-mini-cart-info .link");
        setTextContent(name, product.name);

        const price = sticky.querySelector(".tf-mini-cart-info .fw-semibold");
        setTextContent(price, priceDisplay || "");

        const dot = sticky.querySelector(".tf-mini-cart-info .dot-color");
        if (dot && Array.isArray(product.colors) && product.colors[0]?.class) {
            dot.className = `dot-color ${product.colors[0].class}`;
        }

        const stickyBtn = document.querySelector(".tf-sticky-atc-btns .btn-add-to-cart");
        if (stickyBtn) {
            stickyBtn.href = "#shoppingCart";
            stickyBtn.target = "_blank";
            stickyBtn.rel = "noopener";
            stickyBtn.innerHTML = 'Buy on WhatsApp <i class="icon icon-shopping-cart-simple"></i>';
        }
    }

    function shareAnyTag(current, candidate) {
        if (typeof current?.tags !== "string" || typeof candidate?.tags !== "string") {
            return false;
        }

        // Convert "tag1,tag2" → ["tag1", "tag2"]
        const currentList = current.tags.split(",").map(t => t.trim().toLowerCase());
        const candidateList = candidate.tags.split(",").map(t => t.trim().toLowerCase());

        const currentSet = new Set(currentList);

        return candidateList.some(tag => currentSet.has(tag));
    }

    function buildSlides(wrapper, items) {
        if (!wrapper) return;
        wrapper.innerHTML = "";

        items.forEach((item) => {
            const slide = document.createElement("div");
            slide.className = "swiper-slide";

            if (typeof createProductCard === "function") {
                const card = createProductCard(item, "grid");
                slide.appendChild(card);
            } else {
                slide.innerHTML = `
                    <div class="card-product">
                        <div class="card-product_info">
                            <a href="../product-detail.html?pid=${item.id}" class="name-product h4 link">${
                    item.name
                }</a>
                        </div>
                    </div>`;
            }

            wrapper.appendChild(slide);
        });

        if (typeof lazyload !== "undefined" && typeof lazyload.update === "function") {
            lazyload.update();
        }
    }

    function selectRecommendations(product, productList) {
        const others = productList.filter((item) => item.id !== product.id);
        const usedIds = new Set();

        const alsoLike = others
            .filter((item) => shareAnyTag(product, item))
            .slice(0, 4);

        alsoLike.forEach((item) => usedIds.add(item.id));

        let related = others.filter((item) => item.brand && item.brand === product.brand && !usedIds.has(item.id));
        related = related.slice(0, 4);
        related.forEach((item) => usedIds.add(item.id));

        if (alsoLike.length < 4) {
            const filler = others.filter((item) => !usedIds.has(item.id)).slice(0, 4 - alsoLike.length);
            alsoLike.push(...filler);
            filler.forEach((item) => usedIds.add(item.id));
        }

        if (related.length < 4) {
            const filler = others.filter((item) => !usedIds.has(item.id)).slice(0, 4 - related.length);
            related.push(...filler);
            filler.forEach((item) => usedIds.add(item.id));
        }

        return { alsoLike, related };
    }

    function updateMeta(product) {
        document.title = `${product.name} | Watch Pluss`;
        const description = product.details || product.description;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && description) {
            metaDesc.setAttribute("content", description);
        }
    }

    function setupAddressForm() {

        const whatsappNumber = "918097949357";
        const form = document.getElementById("addressForm");

        const nameInput = document.getElementById("name");
        const phoneInput = document.getElementById("phone");
        const addressInput = document.getElementById("address");
        const landmarkInput = document.getElementById("landmark");
        const zipInput = document.getElementById("zip");
        const paymentModeInput = document.getElementById("payment-mode");

        // ✅ Load saved address from localStorage
        const savedAddress = JSON.parse(localStorage.getItem("userAddress"));
        if (savedAddress) {
            nameInput.value = savedAddress.name || "";
            phoneInput.value = savedAddress.phone || "";
            addressInput.value = savedAddress.address || "";
            landmarkInput.value = savedAddress.landmark || "";
            zipInput.value = savedAddress.zip || "";
        }

        // ✅ Save address when form changes
        function saveAddress() {
            const addressData = {
                name: nameInput.value,
                address: addressInput.value,
                zip: zipInput.value,
                landmark: landmarkInput.value,
                phone: phoneInput.value
            };
            localStorage.setItem("userAddress", JSON.stringify(addressData));
        }

        form.addEventListener("input", saveAddress);

        // ✅ On form submit
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();
            const address = addressInput.value.trim();
            const landmark = landmarkInput.value.trim();
            const zip = zipInput.value.trim();
            const payment_mode = paymentModeInput.value.trim();

            if (!name || !phone || !address || !zip) {
                alert("Please fill all required fields.");
                return;
            }

            // Save latest address
            saveAddress();

            const productURL = window.location.href;

            const message =
                `Hello,
Name: ${name}
Phone: ${phone}
Address: ${address}, - ${zip}
Landmark: ${landmark}
Payment Mode: ${payment_mode}
Product: ${productURL}

Thank you`;

            const encodedMessage = encodeURIComponent(message);

            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

            window.open(whatsappURL, "_blank");
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        const productList = getProductList();
        const product = pickProduct(productList);

        if (!product) {
            console.warn("No product data available for product detail page");
            return;
        }

        updateMeta(product);

        const pageTitle = document.querySelector(".s-page-title .title-page");
        setTextContent(pageTitle, product.name);

        const breadcrumb = document.querySelector(".breadcrumbs-page .current-page");
        setTextContent(breadcrumb, product.name);

        const mainName = document.querySelector(".flat-single-product .product-info-name");
        setTextContent(mainName, product.name);

        const priceNewEl = document.querySelector(
            ".tf-product-info-list .product-info-price .price-new"
        );
        const priceOldEl = document.querySelector(
            ".tf-product-info-list .product-info-price .price-old"
        );

        if (priceNewEl) priceNewEl.textContent = product?.price?.new || product?.price?.old || "";
        if (priceOldEl) {
            if (product?.price?.old) {
                priceOldEl.textContent = product.price.old;
                priceOldEl.classList.remove("d-none");
            } else {
                priceOldEl.textContent = "";
                priceOldEl.classList.add("d-none");
            }
        }

        setTimeout(() => {
            const priceOldElem = document.querySelector(
                ".tf-product-info-list .product-info-price .price-old"
            );
            if (priceOldElem) {
                if (product?.price?.old) {
                    priceOldElem.textContent = product.price.old;
                    priceOldElem.classList.remove("d-none");
                } else {
                    priceOldElem.textContent = "";
                    priceOldElem.classList.add("d-none");
                }
            }
        }, 200);

        const priceWrap = document.querySelector(".tf-product-info-list .product-info-price");
        updateDiscountBadge(priceWrap, product?.price?.new, product?.price?.old);

        const summaryContainer = document.querySelector(".tf-product-info-list");
        if (summaryContainer) {
            let summary = summaryContainer.querySelector(".product-summary");
            if (!summary) {
                summary = document.createElement("p");
                summary.className = "product-summary text-main h6";
                const reference = summaryContainer.querySelector(".tf-product-info-liveview");
                summaryContainer.insertBefore(summary, reference || summaryContainer.children[summaryContainer.children.length - 1]);
            }
            summary.textContent = product.description || "";
        }

        const descParagraph = document.querySelector("#descriptions .tab-descriptions .h6.desc");
        if (descParagraph) {
            descParagraph.textContent = product.details || product.description || "";
        }

        const listInfor = document.querySelector("#descriptions .tab-descriptions .list-infor");
        if (listInfor) {
            if (product.details) {
                listInfor.innerHTML = `
                    <div class="infor-item">
                        <div class="h4 heading">Details</div>
                        <p class="h6">${product.details}</p>
                    </div>`;
            } else {
                listInfor.innerHTML = "";
            }
        }

        const skuValue = document.querySelector(
            ".tf-product-cate-sku .item-cate-sku:first-child .value"
        );
        if (skuValue) {
            skuValue.textContent = `WP-${product.id}`;
        }

        const categoriesValue = document.querySelector(
            ".tf-product-cate-sku .item-cate-sku:nth-child(2) .value"
        );
        if (categoriesValue) {
            const tags = Array.isArray(product.tags) ? product.tags.map((tag) => tag.replace(/_/g, " ")) : [];
            categoriesValue.textContent = tags.length ? tags.join(", ") : "General";
        }

        const images = uniqueImages(product);
        renderGallery(images.length ? images : [{ src: product?.images?.main }], product);

        const buyBtn = document.querySelector(
            ".tf-product-total-quantity .btn-add-to-cart"
        );
        if (buyBtn) {
            buyBtn.href = "#shoppingCart";
            buyBtn.rel = "noopener";
            buyBtn.setAttribute("data-bs-toggle", "offcanvas");
            buyBtn.innerHTML = 'Buy on WhatsApp <i class="icon icon-shopping-cart-simple"></i>';
        }

        const buyNowBtn = document.querySelector(
            ".tf-product-total-quantity .btn-primary"
        );
        if (buyNowBtn && product.whatsappUrl) {
            buyNowBtn.href = "#shoppingCart";
            buyNowBtn.rel = "noopener";
            buyNowBtn.setAttribute("data-bs-toggle", "offcanvas");
        }

        const shareText = document.getElementById("coppyText");
        if (shareText) {
            shareText.textContent = window.location.href;
        }

        updateSticky(product, product?.price?.new || product?.price?.old || "");

        const { alsoLike, related } = selectRecommendations(product, productList);
        buildSlides(document.getElementById("alsoLikeWrapper"), alsoLike);
        buildSlides(document.getElementById("relatedProductsWrapper"), related);

        // Scroll to top gallery image update - ensure lazyload refresh
        if (typeof lazyload !== "undefined" && typeof lazyload.update === "function") {
            lazyload.update();
        }

        setupAddressForm();
    });
})();

