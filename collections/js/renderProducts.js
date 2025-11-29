// Define whitelist of allowed tags


function getCategory() {
    const params = new URLSearchParams(window.location.search);
    let cat = params.get('cat');
    if (!cat) {
        cat = 'all'; // set your default value here
    }
    return cat.toLowerCase().trim();
}

// Function to render products dynamically
function renderProducts(productsArray, containerId, layout = 'grid') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id "${containerId}" not found`);
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    const category = getCategory();

    // Build filtered list
    let filteredProducts;

    if (category !== 'all') {
        filteredProducts = productsArray.filter(p => {
            if (!p.tags) return false; // no tags → do NOT include
            return p.tags
                .split(",")
                .map(t => t.trim().toLowerCase())
                .includes(category.toLowerCase());
        });
    } else {
        filteredProducts = productsArray;
    }

    filteredProducts.forEach(product => {
        const productCard = createProductCard(product, layout);
        container.appendChild(productCard);
    });

    if (typeof lazyload !== 'undefined') {
        lazyload.update();
    }
}

// Function to create a single product card
function createProductCard(product, layout = 'grid') {
    const card = document.createElement('div');
    const layoutClass = layout === 'list' ? 'product-style_list' : 'grid';
    
    // Generate badge HTML
    let badgeHTML = '';
    if (product.badge) {
        const badge = product.badge?.toLowerCase() || "";

        const badgeClass =
            badge.includes("hot") ? "hot" :
                badge.includes("sale") ? "sale" :
                    badge.includes("flash") ? "trend" :
                        badge.includes("trend") ? "flash-sale" :
                            "";

        const thunderIcon = badge.includes("trend")
            ? '<i class="icon icon-thunder"></i> '
            : '';

        badgeHTML = `
        <ul class="product-badge_list">
            <li class="product-badge_item h6 ${badgeClass}">
                ${thunderIcon}${product.badge}
            </li>
        </ul>
    `;
    }

    // Generate color swatches HTML
    let colorSwatchesHTML = '';
    if (product.colors && product.colors.length > 0) {
        colorSwatchesHTML = '<ul class="product-color_list">';
        product.colors.forEach((color, index) => {
            const activeClass = index === 0 ? 'active' : '';
            colorSwatchesHTML += `
                <li class="product-color-item color-swatch hover-tooltip tooltip-bot ${activeClass}">
                    <span class="tooltip color-filter">${color.name}</span>
                    <span class="swatch-value ${color.class}"></span>
                    <img class="lazyload" src="${color.image}" data-src="${color.image}" alt="${product.name}">
                </li>
            `;
        });
        colorSwatchesHTML += '</ul>';
    }

    // Generate description HTML
    let descriptionHTML = '';
    if (product.description || product.details) {
        descriptionHTML = `<div class="product-desc_list d-none d-sm-grid">
            ${product.description ? `<p class="product-desc">
                <span class="headline fw-bold">Contents:</span> ${product.description}
            </p>` : ''}
            ${product.details ? `<p class="product-desc d-none d-md-block">
                <span class="headline fw-bold">Details:</span> ${product.details}
            </p>` : ''}
        </div>`;
    }

    // Generate price HTML
    let priceHTML = '';
    if (product.price) {
        if (product.price.old && product.price.new) {
            priceHTML = `<div class="price-wrap">
                <span class="price-old h6 fw-normal">${product.price.old}</span>
                <span class="price-new h6">${product.price.new}</span>
            </div>`;
        } else if (product.price.new) {
            priceHTML = `<div class="price-wrap">
                <span class="price-new h6">${product.price.new}</span>
            </div>`;
        }
    }

    // Generate WhatsApp buy button
    const whatsappButtonHTML = `
        <a href="${product.whatsappUrl}" target="_blank" class="tf-btn animate-btn" style="margin-top: 10px; display: inline-block;">
            Buy on WhatsApp
            <i class="icon icon-shopping-cart-simple"></i>
        </a>
    `;

    // Card HTML structure
    if (layout === 'list') {
        // List layout
        card.innerHTML = `
            <div class="card-product ${layoutClass}" data-availability="${product.availability}" data-brand="${product.brand}">
                <div class="card-product_wrapper">
                    <a href="../product-detail.html?pid=${product.id}" class="product-img">
                        <img class="lazyload img-product" src="${product.images.main}" data-src="${product.images.main}" alt="${product.name}">
                        ${product.images.hover ? `<img class="lazyload img-hover" src="${product.images.hover}" data-src="${product.images.hover}" alt="${product.name}">` : ''}
                    </a>
                    <ul class="product-action_list">
                        <li>
                            <a href="#quickView" data-bs-toggle="modal" class="hover-tooltip tooltip-left box-icon quick-view-btn" data-product-id="${product.id}">
                                <span class="icon icon-view"></span>
                                <span class="tooltip">Quick view</span>
                            </a>
                        </li>
                    </ul>
                    ${badgeHTML}
                </div>
                <div class="card-product_info">
                    <div class="product-info_list">
                        <a href="../product-detail.html?pid=${product.id}" class="name-product h3 link">${product.name}</a>
                        ${priceHTML}
                        ${colorSwatchesHTML}
                        ${descriptionHTML}
                    </div>
                    <div class="product-action_list">
                        <span class="h6">To buy, click the button below</span>
                        <div class="group-btn">
                            ${whatsappButtonHTML}
                            <a href="#" class="tf-btn style-line btn-add-wishlist2">
                                <span class="text">Add to List</span>
                                <i class="icon icon-heart"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Grid layout
        card.innerHTML = `
            <div class="card-product ${layoutClass}" data-availability="${product.availability}" data-brand="${product.brand}">
                <div class="card-product_wrapper">
                    <a href="../product-detail.html?pid=${product.id}" class="product-img">
                        <img class="lazyload img-product" src="${product.images.main}" data-src="${product.images.main}" alt="${product.name}">
                        ${product.images.hover ? `<img class="lazyload img-hover" src="${product.images.hover}" data-src="${product.images.hover}" alt="${product.name}">` : ''}
                    </a>
                    <ul class="product-action_list">
                        <li>
                            <a href="${product.whatsappUrl}" target="_blank" class="hover-tooltip tooltip-left box-icon">
                                <span class="icon icon-shopping-cart-simple"></span>
                                <span class="tooltip">Buy on WhatsApp</span>
                            </a>
                        </li>
                        <li>
                            <a href="#quickView" data-bs-toggle="modal" class="hover-tooltip tooltip-left box-icon quick-view-btn" data-product-id="${product.id}">
                                <span class="icon icon-view"></span>
                                <span class="tooltip">Quick view</span>
                            </a>
                        </li>
                    </ul>
                    ${badgeHTML}
                </div>
                <div class="card-product_info">
                    <a href="product-detail.html?pid=${product.id}" class="name-product h4 link">${product.name}</a>
                    ${priceHTML}
                    ${colorSwatchesHTML}
                </div>
            </div>
        `;
    }

    return card;
}

// Function to initialize products when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Render products in grid layout
    if (typeof products !== 'undefined' && products.length > 0) {
        const gridContainer = document.getElementById('gridLayout');
        const listContainer = document.getElementById('listLayout');

        
        if (gridContainer) {
            renderProducts(products, 'gridLayout', 'grid');
        }
        
        if (listContainer) {
            renderProducts(products, 'listLayout', 'list');
        }
    }

    // Bind dynamic Quick View population once
    if (!window.__quickViewBound) {
        window.__quickViewBound = true;

        function uniqueImages(product) {
            const imageSet = new Set();
            const add = (src) => { if (src) imageSet.add(src); };
            add(product?.images?.main);
            add(product?.images?.hover);
            if (Array.isArray(product?.colors)) {
                product.colors.forEach(c => add(c.image));
            }
            return Array.from(imageSet);
        }

        function populateQuickView(product) {
            const modal = document.getElementById('quickView');
            if (!modal || !product) return;

            const nameEl = modal.querySelector('.product-info-name');
            if (nameEl) nameEl.textContent = product.name || '';

            const descEl = modal.querySelector('.product-infor-sub');
            if (descEl) descEl.textContent = product.details || product.description || '';

            const newPriceEl = modal.querySelector('.price-new');
            const oldPriceEl = modal.querySelector('.compare-at-price');
            if (newPriceEl) newPriceEl.textContent = product?.price?.new || '';
            if (oldPriceEl) oldPriceEl.textContent = product?.price?.old || '';

            const wrapper = modal.querySelector('.tf-single-slide .swiper-wrapper');
            if (wrapper) {
                const imgs = uniqueImages(product);
                if (imgs.length === 0 && product?.images?.main) imgs.push(product.images.main);
                wrapper.innerHTML = imgs.map((src) => `
                    <div class="swiper-slide">
                        <div class="item">
                            <img class="lazyload" data-src="${src}" src="${src}" alt="${product.name}">
                        </div>
                    </div>
                `).join('');
            }

            const colorWrap = modal.querySelector('.variant-color .variant-picker-values');
            if (colorWrap) {
                if (Array.isArray(product.colors) && product.colors.length) {
                    colorWrap.innerHTML = product.colors.map((c, idx) => `
                        <div class="hover-tooltip tooltip-bot color-btn ${idx === 0 ? 'active' : ''}" data-color="${c.name.toLowerCase()}">
                            <span class="check-color ${c.class}"></span>
                            <span class="tooltip">${c.name}</span>
                        </div>
                    `).join('');
                } else {
                    colorWrap.innerHTML = '';
                }
            }

            // WhatsApp CTA: repurpose the "ADD TO CART" button
            const buyBtn = modal.querySelector('.btn-add-to-cart');
            if (buyBtn) {
                buyBtn.setAttribute('href', product.whatsappUrl || '#');
                buyBtn.setAttribute('target', '_blank');
                buyBtn.innerHTML = `BUY ON WHATSAPP <i class="icon icon-shopping-cart-simple"></i>`;
            }

            // Update product name link to point to specific product
            if (nameEl && nameEl.tagName === 'A') {
                nameEl.setAttribute('href', `product-detail.html?pid=${product.id}`);
            }

            // Update "View full details" link to point to specific product and open in new tab
            const viewDetailsLink = modal.querySelector('a.tf-btn-line');
            if (viewDetailsLink) {
                const spanText = viewDetailsLink.querySelector('span.h5');
                if (spanText && spanText.textContent.trim().toLowerCase().includes('view full details')) {
                    viewDetailsLink.setAttribute('href', `product-detail.html?pid=${product.id}`);
                    viewDetailsLink.setAttribute('target', '_blank');
                }
            }
        }

        document.addEventListener('click', function(e) {
            const trigger = e.target.closest('a.quick-view-btn[data-product-id]');
            if (!trigger) return;
            const id = Number(trigger.getAttribute('data-product-id'));
            const list = (typeof products !== 'undefined' && Array.isArray(products))
                ? products
                : (Array.isArray(window.products) ? window.products : []);
            const product = list.find(p => Number(p.id) === id) || null;
            if (product) {
                populateQuickView(product);
            }
        });
    }
});

// Function to update WhatsApp number (call this with your actual WhatsApp number)
function updateWhatsAppNumber(phoneNumber) {
    if (typeof products !== 'undefined') {
        products.forEach(product => {
            // Extract current message from URL
            const url = new URL(product.whatsappUrl);
            const message = url.searchParams.get('text');
            // Update with new phone number
            product.whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message || `Hi! I'm interested in ${product.name}`)}`;
        });
        // Re-render products
        const gridContainer = document.getElementById('gridLayout');
        const listContainer = document.getElementById('listLayout');
        
        if (gridContainer) {
            renderProducts(products, 'gridLayout', 'grid');
        }
        
        if (listContainer) {
            renderProducts(products, 'listLayout', 'list');
        }
    }
}


// ===== Trending products: pick random 4 and render into .trend-product-inner =====
//
// Matches your coding style: plain functions, DOM APIs, uses `products` (or window.products fallback),
// conditional module.exports at the end, and a simple fade animation + lazyload refresh hook.

function pickUniqueRandom(arr, count) {
    var copy = Array.prototype.slice.call(arr || []);
    var picked = [];
    while (picked.length < count && copy.length > 0) {
        var idx = Math.floor(Math.random() * copy.length);
        picked.push(copy.splice(idx, 1)[0]);
    }
    return picked;
}

function buildTrendHtmlFromProducts(items) {
    var html = '';
    // group into arrays of 2 items for .trend-product-list
    for (var g = 0; g < items.length; g += 2) {
        html += '<div class="trend-product-list">';
        var group = items.slice(g, g + 2);
        for (var i = 0; i < group.length; i++) {
            var p = group[i] || {};
            var name = p.name || '';
            var slug = p.slug || '';
            var img = (p.images && p.images.main) ? p.images.main : 'images/products/product-placeholder.jpg';
            var priceOld = (p.price && p.price.old) ? p.price.old : '';
            var priceNew = (p.price && p.price.new) ? p.price.new : '';
            var firstTag = '';
            if (p.tags) {
                try {
                    firstTag = String(p.tags).split(',').map(function(t) { return t.trim(); }).filter(Boolean)[0] || '';
                } catch (err) { firstTag = ''; }
            }
            var productUrl = 'https://watchpluss.in/product-detail.html?pid=' + p.id;

            // Escape minimal: attributes vs innerHTML — keep simple (match your style)
            html += ''
                + '<div class="trend-product-item">'
                +   '<div class="image">'
                +     '<img class="lazyload" src="' + img + '" data-src="' + img + '" alt="' + (name) + '">'
                +   '</div>'
                +   '<div class="content">'
                +     (firstTag ? '<div class="text-small text-main-2 sub">' + firstTag + '</div>' : '')
                +     '<h6 class="title"><a href="' + productUrl + '" class="link">' + name + '</a></h6>'
                +     '<div class="price-wrap">'
                +       (priceOld ? '<span class="price-old h6 fw-normal">' + priceOld + '</span>' : '')
                +       (priceNew ? '<span class="price-new h6">' + priceNew + '</span>' : '')
                +     '</div>'
                +   '</div>'
                + '</div>';
        }
        html += '</div>';
    }
    return html;
}

function loadTrendingProducts(maxItems) {
    maxItems = typeof maxItems === 'number' ? Math.max(1, maxItems) : 4;

    // Prefer `products` variable (you use `products` in other code). Fallback to window.products.
    var list = (typeof products !== 'undefined' && Array.isArray(products)) ? products :
        (Array.isArray(window.products) ? window.products : []);

    var container = document.querySelector('.trend-product-inner');
    if (!container) {
        // nothing to render into
        return;
    }

    if (!list || list.length === 0) {
        container.innerHTML = '<div class="no-results">No trending products</div>';
        return;
    }

    var selected = pickUniqueRandom(list, Math.min(maxItems, list.length));
    var html = buildTrendHtmlFromProducts(selected);

    // smooth fade-out -> replace -> fade-in
    try {
        // ensure style is set (use CSS opacity)
        container.style.transition = 'opacity 180ms ease';
        container.style.opacity = '0.35';
        // small timeout to allow transition to render
        setTimeout(function () {
            container.innerHTML = html;

            // If you use a lazyload library (e.g. lazysizes), try to update it:
            try {
                if (typeof lazyload !== 'undefined' && typeof lazyload.update === 'function') {
                    lazyload.update();
                } else if (window.lazySizes) {
                    // lazysizes auto-inits; dispatch an event if needed
                    window.lazySizes && window.lazySizes.init && window.lazySizes.init();
                }
            } catch (e) {
                // ignore lazyload refresh errors
            }

            // fade back in
            setTimeout(function () {
                container.style.opacity = '1';
            }, 20);
        }, 160);
    } catch (err) {
        // Fallback: immediate replace if transitions fail
        container.innerHTML = html;
    }
}

// auto-run on DOM ready similar to your pattern
document.addEventListener('DOMContentLoaded', function () {
    // call it once on load
    loadTrendingProducts(4);

    // expose for later manual refresh (consistent with your style)
    window.loadTrendingProducts = loadTrendingProducts;
});

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderProducts, createProductCard, updateWhatsAppNumber };
}

