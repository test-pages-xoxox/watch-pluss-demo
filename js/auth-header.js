(function () {
    "use strict";

    var CACHE_KEY = "watchpluss.authCache";
    var widget = null;
    var resolved = false;

    function writeCache(user) {
        try {
            if (user && (user.email || user.uid)) {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    uid: user.uid || "",
                    email: user.email || "",
                    name: user.name || "",
                }));
            } else {
                localStorage.removeItem(CACHE_KEY);
            }
        } catch (_e) {}
    }

    function createWidget() {
        if (widget) return widget;

        var header = document.querySelector(".tf-header");
        if (!header) return null;

        var iconList = header.querySelector(".nav-icon-list");
        var el = document.createElement("div");
        el.id = "wp-auth-widget";
        el.className = "wp-auth-widget";
        el.innerHTML = '<span class="wp-auth-loading"><span class="wp-auth-spinner"></span></span>';

        if (iconList) {
            var userLi = iconList.querySelector('a[href="account.html"]');
            if (userLi && userLi.parentElement) {
                var li = userLi.parentElement;
                var wrapper = document.createElement("li");
                wrapper.className = "d-none d-md-flex";
                wrapper.appendChild(el);
                li.parentElement.replaceChild(wrapper, li);
            } else {
                var newLi = document.createElement("li");
                newLi.className = "d-none d-md-flex";
                newLi.appendChild(el);
                iconList.insertBefore(newLi, iconList.firstChild);
            }
        } else {
            var row = header.querySelector(".row");
            if (row) {
                var col = document.createElement("div");
                col.className = "col-xl-3 col-md-4 col-3 d-flex align-items-center justify-content-end";
                col.appendChild(el);
                row.appendChild(col);
            }
        }

        widget = el;
        return el;
    }

    function render(user) {
        if (!widget) return;

        resolved = true;
        writeCache(user);

        if (user && (user.email || user.uid)) {
            var initial = user.name
                ? user.name.charAt(0).toUpperCase()
                : user.email
                    ? user.email.charAt(0).toUpperCase()
                    : "U";
            var displayName = user.name || (user.email ? user.email.split("@")[0] : "User");
            widget.innerHTML =
                '<div class="wp-auth-logged-in">' +
                    '<a href="account.html" class="wp-auth-avatar" title="' + displayName + '">' + initial + '</a>' +
                    '<button class="wp-auth-logout" aria-label="Logout" title="Logout">' +
                        '<i class="icon icon-sign-out"></i>' +
                    '</button>' +
                '</div>';

            widget.querySelector(".wp-auth-logout").addEventListener("click", function (e) {
                e.preventDefault();
                if (window.WatchPlussAuth && window.WatchPlussAuth.logout) {
                    window.WatchPlussAuth.logout().catch(function (err) {
                        console.error("Logout failed:", err);
                    });
                }
            });
        } else {
            widget.innerHTML = '<a class="nav-icon-item link position-relative" href="account.html" aria-label="Login"><i class="icon icon-user"></i></a>';
        }
    }

    window.addEventListener("watchpluss-auth-ready", function (e) {
        var detail = e.detail || {};
        render(detail.currentUser);
    });

    function init() {
        createWidget();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
