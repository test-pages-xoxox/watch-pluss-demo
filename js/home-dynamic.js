(function () {
    function getList() {
        if (typeof products !== 'undefined' && Array.isArray(products)) return products;
        if (Array.isArray(window.products)) return window.products;
        return [];
    }

    function hasTag(item, tag) {
        if (!Array.isArray(item?.tags)) return false;
        const t = String(tag).toLowerCase();
        return item.tags.some((x) => String(x).toLowerCase() === t);
    }

    function byIdDesc(a, b) {
        const ai = Number(a.id) || 0;
        const bi = Number(b.id) || 0;
        return bi - ai;
    }

    function buildSlides(wrapper, items) {
        if (!wrapper) return;
        wrapper.innerHTML = '';
        items.forEach((item) => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            const card = typeof createProductCard === 'function' ? createProductCard(item, 'grid') : null;
            if (card) slide.appendChild(card);
            else {
                slide.innerHTML = `
                    <div class="card-product">
                        <div class="card-product_info">
                            <a href="product-detail.html?pid=${item.id}" class="name-product h4 link">${item.name}</a>
                        </div>
                    </div>`;
            }
            wrapper.appendChild(slide);
        });
        if (typeof lazyload !== 'undefined' && typeof lazyload.update === 'function') {
            lazyload.update();
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        const list = getList();
        if (!list.length) return;

        // Popular: tag == 'popular', sort by id desc, take 4
        const popular = list.filter((p) => hasTag(p, 'popular')).sort(byIdDesc).slice(0, 4);
        buildSlides(document.getElementById('popularWrapper'), popular);

        // Best Sellers: top 4 by id desc (as requested)
        const best = list.slice().sort(byIdDesc).slice(0, 4);
        buildSlides(document.getElementById('bestSellersWrapper'), best);
    });
})();


