// Define whitelist of allowed tags
const whitelist = new Set(['men', 'women', 'kids', 'luxury', 'smart']);

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

    if (category && whitelist.has(category)) {
        // Filter efficiently using Set + Array.some
        filteredProducts = productsArray.filter(p => p.tags.some(tag => tag.toLowerCase() === category)
        );
    } else {
        // If no valid keyword, show all
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
        const badgeClass = product.badge.toLowerCase().includes('hot') ? 'hot' : 
                          product.badge.toLowerCase().includes('sale') ? 'sale' : 
                          product.badge.toLowerCase().includes('flash') ? 'flash-sale' : '';
        badgeHTML = `<ul class="product-badge_list">
            <li class="product-badge_item h6 ${badgeClass}">${product.badge}</li>
        </ul>`;
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
                    <a href="product-detail.html" class="product-img">
                        <img class="lazyload img-product" src="${product.images.main}" data-src="${product.images.main}" alt="${product.name}">
                        ${product.images.hover ? `<img class="lazyload img-hover" src="${product.images.hover}" data-src="${product.images.hover}" alt="${product.name}">` : ''}
                    </a>
                    <ul class="product-action_list">
                        <li>
                            <a href="#compare" data-bs-toggle="offcanvas" class="hover-tooltip tooltip-left box-icon">
                                <span class="icon icon-compare"></span>
                                <span class="tooltip">Compare</span>
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
                    <div class="product-info_list">
                        <a href="product-detail.html" class="name-product h3 link">${product.name}</a>
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
                    <a href="product-detail.html" class="product-img">
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
                        <li class="wishlist">
                            <a href="javascript:void(0);" class="hover-tooltip tooltip-left box-icon">
                                <span class="icon icon-heart"></span>
                                <span class="tooltip">Add to Wishlist</span>
                            </a>
                        </li>
                        <li>
                            <a href="#compare" data-bs-toggle="offcanvas" class="hover-tooltip tooltip-left box-icon">
                                <span class="icon icon-compare"></span>
                                <span class="tooltip">Compare</span>
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
                    <a href="product-detail.html" class="name-product h4 link">${product.name}</a>
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

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderProducts, createProductCard, updateWhatsAppNumber };
}

