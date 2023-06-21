/* ==========================================================================
@author: Thomas Rambaud
@website: https://bonapp.studio
@copyright 2021
========================================================================== */
var MGDPR = (function () {

    new MutationObserver(mutations => {
        mutations.forEach(({ addedNodes }) => {
            addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.tagName === 'SCRIPT') {
                    if (MGDPR && MGDPR.preventScriptAdding(node.src || '', node.type)) {
                        node.type = 'javascript/blocked';
                        node.addEventListener('beforescriptexecute', function (e) {
                            e.preventDefault();
                        });
                    }
                }
            })
        })
    }).observe(document.documentElement,
        {
            childList: true,
            subtree: true
        }
    );

    const createElementBackup = document.createElement
    document.createElement = function (...args) {
        if (args[0].toLowerCase() !== 'script') {
            return createElementBackup.bind(document)(...args);
        }

        const scriptElt = createElementBackup.bind(document)(...args);
        const originalSetAttribute = scriptElt.setAttribute.bind(scriptElt);

        try {
            Object.defineProperties(scriptElt, {
                'src': {
                    get() {
                        return scriptElt.getAttribute('src');
                    },
                    set(value) {
                        if (MGDPR && MGDPR.preventScriptAdding(value, scriptElt.type)) {
                            originalSetAttribute('type', 'javascript/blocked');
                        }
                        originalSetAttribute('src', value);
                        return true
                    }
                },
                'type': {
                    set(value) {
                        const typeValue = MGDPR && MGDPR.preventScriptAdding(scriptElt.src, scriptElt.type) ? 'javascript/blocked' : value;
                        originalSetAttribute('type', typeValue);
                        return true
                    }
                }
            });

            scriptElt.setAttribute = function (name, value) {
                if (name === 'type' || name === 'src')
                    scriptElt[name] = value;
                else
                    HTMLScriptElement.protytope.setAttribute.call(scriptElt, name, value);
            }
        } catch (error) {

        }

        return scriptElt
    }

    var config = {
        excludedUrls: [],
        display: 'overlay',
        i18n: {
            title: 'Dear visitors,',
            text: 'Our website www.domain.tld uses cookies to enhance your experience and provide usage statistics. You can accept all cookies, or manage your preferences as you wish.<br>' +
                '<a href="/legals" target="_blank">Read more</a>',
            managePreferences: 'Manage preferences',
            managePreferencesTitle: 'Cookie Policy',
            managePreferencesText: 'This site uses cookies deposited by the website, or by third parties.<br>' +
                'This page allows you to determine your cookie preferences. For information, technical cookies are cookies necessary for the proper functioning of our site, used by the host for the technical management of the network. They allow you to use the main features of the site. They are essential to use the main functionalities of the site and therefore cannot be deactivated.',
            savePreferences: 'Save my preferences',
            refuseAll: 'Refuse all, but technical cookies',
            acceptAll: 'Accept all',
            acceptAllCookies: 'Accept all cookies',
            accept: 'Accept',
            allCookies: 'All cookies',
            readMore: 'Read more',
        },
        cookies: [],
        nullIsEnabled: true
    };

    return {
        init: function (cfg) {
            for (var key in cfg) {
                if (typeof config[key] != 'undefined') {
                    config[key] = cfg[key];
                }
            }

            document.addEventListener('DOMContentLoaded', function (event) {
                MGDPR.setup();

                if (!MGDPR.excludedUrl() && !MGDPR.hasUserChose()) {
                    MGDPR.showMainPopup();
                }

                MGDPR.ifsBlocks();
            });
        },

        preventScriptAdding: function (src, type) {
            if (!src) {
                return;
            }

            src = src.toString();

            for (var category of config.cookies) {
                for (var cookie of category.list) {
                    if (typeof cookie.matchScripts != 'undefined') {
                        for (var matchScript of cookie.matchScripts) {
                            if (src.indexOf(matchScript) > -1 && !this.isEnabled(cookie.name)) {
                                return true;
                            }
                        }
                    }
                }
            }

            return false;
        },

        setDisplay: function (value) {
            config.display = value;
            return this;
        },

        setNullIsEnabled: function (value) {
            config.nullIsEnabled = value;
            return this;
        },

        getNullIsEnabled: function () {
            return config.nullIsEnabled;
        },

        ifsBlocks: function () {
            document.querySelectorAll('.mgdpr-if').forEach(function ($this) {
                var cookieName = $this.getAttribute('data-cookie');
                var code = $this.getAttribute('data-code');
                var $text = $this.querySelector('.mgdpr-if-text');

                if (MGDPR.isEnabled(cookieName)) {
                    $this.replaceWith(code);
                } else {
                    $text.classList.add('shown');
                }
            });
        },

        arrayContains: function (arr, obj) {
            var i = arr.length;
            while (i--) {
                if (arr[i] === obj) {
                    return true;
                }
            }
            return false;
        },

        excludedUrl: function () {
            return this.arrayContains(config.excludedUrls, window.location.pathname);
        },

        setCookiesList: function (cookies) {
            config.cookies = cookies;
            return this;
        },

        getCookiesList: function () {
            return config.cookies;
        },

        setExcludedUrls: function (excludedUrlsParam) {
            config.excludedUrls = excludedUrlsParam;
            return this;
        },

        setI18n: function (i18n) {
            config.i18n = i18n;
            return this;
        },

        buildPopupHtml: function (id, content) {
            var close = this.hasUserChose() ? '<span class="mgdpr-close">X</span>' : '';
            return '<div class="mgdpr-popup ' + config.display + '" id="' + id + '">' +
                '<div class="mgdpr-valign1">' +
                '<div class="mgdpr-valign2">' +
                '<div class="mgdpr-valign3">' +
                '<div class="mgdpr-popup-content">' +
                close +
                content +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
        },

        isAllEnabled: function () {
            for (var categoryIndex in config.cookies) {
                var cookieCategory = config.cookies[categoryIndex];
                for (var cookieIndex in cookieCategory.list) {
                    var cookie = cookieCategory.list[cookieIndex];
                    if (!this.isEnabled(cookie.name)) {
                        return false;
                    }
                }
            }
            return true;
        },

        isEnabled: function (cookieName) {
            var currentValue = this.getCookie('mgdpr_' + cookieName);
            return (this.getNullIsEnabled() && currentValue === null) || currentValue == '1';
        },

        setup: function () {
            var mainPopupHtml = this.buildPopupHtml('mgdpr-mainpopup', '<div class="mgdpr-title">' + config.i18n.title + '</div>' +
                '<div class="mgdpr-text">' + config.i18n.text + '</div>' +
                '<div class="mgdpr-buttons">' +
                '<a id="mgdpr-preferences" class="mgdpr-button" href="javascript:;">' + config.i18n.managePreferences + '</a>' +
                '<a id="mgdpr-refuseall" class="mgdpr-button" href="javascript:;">' + config.i18n.refuseAll + '</a>' +
                '<a id="mgdpr-acceptall" class="mgdpr-button" href="javascript:;">' + config.i18n.acceptAll + '</a>' +
                '</div>');

            document.body.innerHTML += mainPopupHtml;

            var preferencesPopupHtml = '<div class="mgdpr-title">' + config.i18n.managePreferencesTitle + '</div>' +
                '<div class="mgdpr-text">' + config.i18n.managePreferencesText + '</div>' +
                '<div class="mgdpr-hr"></div>' +
                '<div class="mgdpr-cookiescategory">' +
                '<div class="mgdpr-cookiescategory-title">' + config.i18n.acceptAllCookies + '</div>' +
                '<div class="mgdpr-cookie">' +
                '<div class="mgdpr-cookie-title">' + config.i18n.allCookies + '</div>' +
                '<button id="mgdpr-toggleall" class="mgdpr-toggle mgdpr-cantoggle' + (this.isAllEnabled() ? ' active' : '') + '"><span class="mgdpr-hidden">' + config.i18n.acceptAllCookies + '</span></button>' +
                '</div>' +
                '</div>';

            for (var categoryIndex in config.cookies) {
                var cookieCategory = config.cookies[categoryIndex];
                preferencesPopupHtml += '<div class="mgdpr-hr"></div><div class="mgdpr-cookiescategory">';

                if (typeof cookieCategory.title != 'undefined') {
                    preferencesPopupHtml += '<div class="mgdpr-cookiescategory-title">' + cookieCategory.title + '</div>';
                }

                if (typeof cookieCategory.text != 'undefined') {
                    preferencesPopupHtml += '<div class="mgdpr-cookiescategory-text">' + cookieCategory.text + '</div>';
                }

                for (var cookieIndex in cookieCategory.list) {
                    var cookie = cookieCategory.list[cookieIndex];
                    var isEnabled = this.isEnabled(cookie.name);

                    preferencesPopupHtml += '<div class="mgdpr-cookie" data-name="' + cookie.name + '">';

                    if (typeof cookie.title != 'undefined') {
                        preferencesPopupHtml += '<div class="mgdpr-cookie-title">' + cookie.title + '</div>';
                    }

                    if (typeof cookie.readMoreUrl != 'undefined') {
                        var text = typeof cookie.readMoreText != 'undefined' ? cookie.readMoreText : config.i18n.readMore;
                        preferencesPopupHtml += '<div class="mgdpr-cookie-readmore">' +
                            '<a href="' + cookie.readMoreUrl + '" target="_blank">' + text + '</a>' +
                            '</div>';
                    }

                    if (typeof cookie.mention != 'undefined') {
                        preferencesPopupHtml += '<div class="mgdpr-cookie-mention">' +
                            cookie.mention +
                            '</div>';
                    }

                    preferencesPopupHtml += '<button class="mgdpr-toggle' + ((typeof cookie.canToggle == 'undefined' || cookie.canToggle) ? (' mgdpr-cantoggle' + (isEnabled ? ' active' : '')) : ' active mgdpr-canttoggle') + '"><span class="mgdpr-hidden">' + config.i18n.accept + '</span></button>';
                    preferencesPopupHtml += '</div>';

                    if (isEnabled && typeof cookie.onEnabled == 'function') {
                        cookie.onEnabled(cookie);
                    }
                }

                preferencesPopupHtml += '</div>';
            }

            preferencesPopupHtml += '<div class="mgdpr-hr"></div>';
            preferencesPopupHtml += '<a id="mgdpr-savepreferences" class="mgdpr-button" href="javascript:;">' + config.i18n.savePreferences + '</a>';
            preferencesPopupHtml = this.buildPopupHtml('mgdpr-preferencespopup', preferencesPopupHtml);

            document.body.innerHTML += preferencesPopupHtml;

            document.querySelector('#mgdpr-preferences').addEventListener('click', function (e) {
                e.preventDefault();
                MGDPR.hideMainPopup().showPreferencesPopup();
            });

            document.querySelector('#mgdpr-refuseall').addEventListener('click', function (e) {
                e.preventDefault();
                MGDPR.refuseAll(true);
            });

            document.querySelector('#mgdpr-acceptall').addEventListener('click', function (e) {
                e.preventDefault();
                MGDPR.acceptAll(true);
            });

            document.querySelectorAll('.mgdpr-cantoggle').forEach(function ($this) {
                $this.addEventListener('click', function (e) {
                    e.preventDefault();
                    this.classList.toggle('active');

                    if (!this.getAttribute('id') === '#mgdpr-toggleall') {
                        if (document.querySelectorAll('.mgdpr-cantoggle').length == document.querySelectorAll('.mgdpr-cantoggle.active').length) {
                            document.querySelector('#mgdpr-toggleall').classList.add('active');
                        } else {
                            document.querySelector('#mgdpr-toggleall').classList.remove('active');
                        }
                    }
                });
            });

            document.querySelector('#mgdpr-toggleall').addEventListener('click', function (e) {
                e.preventDefault();
                var isActive = this.classList.contains('active');
                var $others = document.querySelectorAll('.mgdpr-cantoggle:not(#mgdpr-toggleall)');
                if (isActive) {
                    $others.forEach(function ($this) {
                        $this.classList.add('active');
                    });
                } else {
                    $others.forEach(function ($this) {
                        $this.classList.remove('active');
                    });
                }
            });

            document.querySelector('#mgdpr-savepreferences').addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelectorAll('.mgdpr-cookie').forEach(function ($this) {
                    var cookieName = $this.getAttribute('data-name');
                    if (cookieName && cookieName.length > 0) {
                        MGDPR.setCookie('mgdpr_' + cookieName, $this.querySelectorAll('.mgdpr-toggle.active').length > 0 ? '1' : '0');
                    }
                });
                MGDPR.setUserChose();
                window.location.reload();
            });

            document.addEventListener('click', function (e) {
                if (event.target.matches('.mgdpr-manage-preferences')) {
                    e.preventDefault();
                    MGDPR.showPreferencesPopup();
                }
            });

            document.querySelectorAll('.mgdpr-close').forEach(function ($this) {
                $this.addEventListener('click', function (e) {
                    e.preventDefault();
                    MGDPR.fade('out', this.closest('.mgdpr-popup'), 400);
                });
            });

            if (this.hasUserChose()) {
                document.querySelectorAll('.mgdpr-popup').forEach(function ($this) {
                    $this.addEventListener('click', function (e) {
                        if (!e.target.matches('.mgdpr-popup-content') && e.target.closest('.mgdpr-popup-content').length === 0) {
                            MGDPR.fade('out', $this, 400);
                        }
                    });
                });
            }

            return this;
        },

        fade: function (type, elem, ms) {
            var isIn = type === 'in',
                opacity = isIn ? 0 : 1,
                interval = 10,
                duration = ms,
                gap = interval / duration;

            if (isIn) {
                elem.style.display = 'block';
                elem.style.opacity = opacity;
            }

            function func() {
                opacity = isIn ? opacity + gap : opacity - gap;
                elem.style.opacity = opacity;

                if (opacity <= 0) elem.style.display = 'none'
                if (opacity <= 0 || opacity >= 1) window.clearInterval(fading);
            }

            var fading = window.setInterval(func, interval);
        },

        refuseAll: function (reloadPage) {
            this.setAll('0');
            this.setUserChose();

            if (typeof reloadPage != 'undefined' && reloadPage) {
                window.location.reload();
            }

            return this;
        },

        acceptAll: function (reloadPage) {
            this.setAll('1');
            this.setUserChose();

            if (typeof reloadPage != 'undefined' && reloadPage) {
                window.location.reload();
            }

            return this;
        },

        setAll: function (value) {
            for (var categoryIndex in config.cookies) {
                for (var cookieIndex in config.cookies[categoryIndex].list) {
                    MGDPR.setCookie('mgdpr_' + config.cookies[categoryIndex].list[cookieIndex].name, value);
                }
            }
            return this;
        },

        showMainPopup: function () {
            this.fade('in', document.querySelector('#mgdpr-mainpopup'), 400);
            return this;
        },

        hideMainPopup: function () {
            this.fade('out', document.querySelector('#mgdpr-mainpopup'), 400);
            return this;
        },

        showPreferencesPopup: function () {
            this.fade('in', document.querySelector('#mgdpr-preferencespopup'), 400);
            return this;
        },

        hidePreferencesPopup: function () {
            this.fade('out', document.querySelector('#mgdpr-preferencespopup'), 400);
            return this;
        },

        hasUserChose: function () {
            return this.getCookie('mgdpr_uc') == '1';
        },

        setUserChose: function () {
            this.setCookie('mgdpr_uc', '1');
            return this;
        },

        setCookie: function (name, value, days) {
            if (typeof days == 'undefined') {
                days = 6 * 31;
            }

            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = '; expires=' + date.toUTCString();

            document.cookie = name + '=' + (value || '') + expires + '; path=/';
            return this;
        },

        getCookie: function (name) {
            var nameEQ = name + '=';
            var ca = document.cookie.split(';');

            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1, c.length);
                }

                if (c.indexOf(nameEQ) == 0) {
                    return c.substring(nameEQ.length, c.length);
                }
            }

            return null;
        },

        eraseCookie: function (name) {
            document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            return this;
        }
    }

})();