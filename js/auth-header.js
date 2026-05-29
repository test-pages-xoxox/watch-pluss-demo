(function () {
    "use strict";

    var widget = null;
    var initialized = false;

    function createWidget() {
        var header = document.querySelector(".tf-header");
        if (!header) return null;

        var iconList = header.querySelector(".nav-icon-list");
        var el = document.createElement("div");
        el.id = "wp-auth-widget";
        el.className = "wp-auth-widget";
        el.innerHTML = '<a class="wp-auth-link" href="account.html" aria-label="Login"><i class="icon icon-user"></i><span class="wp-auth-label">Login</span></a>';

        if (iconList) {
            var userLi = iconList.querySelector('a[href="account.html"]');
            if (userLi && userLi.parentElement) {
                var li = userLi.parentElement;
                var wrapper = document.createElement("li");
                wrapper.className = "d-none d-md-flex";
                wrapper.appendChild(el);
                li.parentElement.replaceChild(wrapper, li);
            } else {
                var li = document.createElement("li");
                li.className = "d-none d-md-flex";
                li.appendChild(el);
                iconList.insertBefore(li, iconList.firstChild);
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

        return el;
    }

    function render(user) {
        if (!widget) return;

        if (user && user.email) {
            var initial = (user.name || user.email).charAt(0).toUpperCase();
            var displayName = user.name || user.email.split("@")[0];
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
            widget.innerHTML = '<a class="wp-auth-link" href="account.html" aria-label="Login"><i class="icon icon-user"></i><span class="wp-auth-label">Login</span></a>';
        }
    }

    function init() {
        if (initialized) return;
        initialized = true;

        widget = createWidget();
        if (!widget) return;

        var auth = window.WatchPlussAuth;
        if (auth) {
            render(auth.getCurrentUser());
        }

        window.addEventListener("watchpluss-auth-ready", function (e) {
            var detail = e.detail || {};
            render(detail.currentUser);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
