/* ==========================================================================
@author: Thomas Rambaud
@website: https://bonapp.studio
@copyright 2021
========================================================================== */
var MGDPR = (function($){

    var $doc = $(document);

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
        init: function(cfg){
            for (var key in cfg) {
                if (typeof config[key] != 'undefined') {
                    config[key] = cfg[key];
                }
            }
            
            this.setup();

            if(!this.excludedUrl() && !this.hasUserChose()){
                this.showMainPopup();
            }

            this.ifsBlocks();
        },

        setDisplay: function(value){
            config.display = value;
            return this;
        },

        setNullIsEnabled: function(value){
            config.nullIsEnabled = value;
            return this;
        },

        getNullIsEnabled: function(){
            return config.nullIsEnabled;
        },

        ifsBlocks: function(){
            $('.mgdpr-if').each(function(){
                var $this = $(this);
                var cookieName = $this.data('cookie');
                var code = $this.data('code');
                var $text = $this.find('.mgdpr-if-text');

                if(MGDPR.isEnabled(cookieName)){
                    $this.replaceWith(code);
                }else{
                    $text.addClass('shown');
                }
            });
        },

		arrayContains: function(arr, obj){
			var i = arr.length;
			while (i--) {
				if (arr[i] === obj) {
					return true;
				}
			}
			return false;
		},

        excludedUrl: function(){
            return this.arrayContains(config.excludedUrls, window.location.pathname);
        },

        setCookiesList: function(cookies){
            config.cookies = cookies;
            return this;
        },

        getCookiesList: function(){
            return config.cookies;
        },

        setExcludedUrls: function(excludedUrlsParam){
            config.excludedUrls = excludedUrlsParam;
            return this;
        },

        setI18n: function(i18n){
            config.i18n = i18n;
            return this;
        },

        buildPopupHtml: function(id, content){
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

        isAllEnabled: function(){
            for(var categoryIndex in config.cookies){
                var cookieCategory = config.cookies[categoryIndex];
                for(var cookieIndex in cookieCategory.list){
                    var cookie = cookieCategory.list[cookieIndex];
                    if(!this.isEnabled(cookie.name)){
                        return false;
                    }
                }
            }
            return true;
        },

        isAllUnset: function(){
            for(var categoryIndex in config.cookies){
                var cookieCategory = config.cookies[categoryIndex];
                for(var cookieIndex in cookieCategory.list){
                    var cookie = cookieCategory.list[cookieIndex];
                    if(this.cookieExists(cookie.name)){
                        return false;
                    }
                }
            }
            return true;
        },

        isEnabled: function(cookieName){
            var currentValue = this.getCookie('mgdpr_' + cookieName);
            return (this.getNullIsEnabled() && currentValue === null) || currentValue == '1';
        },

        cookieExists: function(cookieName){
            return this.getCookie('mgdpr_' + cookieName) !== null;
        },

        setup: function(){
            var mainPopupHtml = this.buildPopupHtml('mgdpr-mainpopup', '<div class="mgdpr-title">' + config.i18n.title + '</div>' +
            '<div class="mgdpr-text">' + config.i18n.text + '</div>' +
            '<div class="mgdpr-buttons">' + 
                '<a id="mgdpr-preferences" class="mgdpr-button" href="javascript:;">' + config.i18n.managePreferences + '</a>' +
                '<a id="mgdpr-refuseall" class="mgdpr-button" href="javascript:;">' + config.i18n.refuseAll + '</a>' +
                '<a id="mgdpr-acceptall" class="mgdpr-button" href="javascript:;">' + config.i18n.acceptAll + '</a>' +
            '</div>');
            $('body').append(mainPopupHtml);

            var preferencesPopupHtml = '<div class="mgdpr-title">' + config.i18n.managePreferencesTitle + '</div>' +
            '<div class="mgdpr-text">' + config.i18n.managePreferencesText + '</div>' +
            '<div class="mgdpr-hr"></div>' +
            '<div class="mgdpr-cookiescategory">' +
                '<div class="mgdpr-cookiescategory-title">' + config.i18n.acceptAllCookies + '</div>' +
                '<div class="mgdpr-cookie">' +
                    '<div class="mgdpr-cookie-title">' + config.i18n.allCookies + '</div>' +
                    '<button id="mgdpr-toggleall" class="mgdpr-toggle mgdpr-cantoggle' + (this.isAllEnabled() || this.isAllUnset() ? ' active' : '') + '"><span class="mgdpr-hidden">' + config.i18n.acceptAllCookies + '</span></button>' +
                '</div>' +
            '</div>';

            for(var categoryIndex in config.cookies){
                var cookieCategory = config.cookies[categoryIndex];
                preferencesPopupHtml += '<div class="mgdpr-hr"></div><div class="mgdpr-cookiescategory">';

                if(typeof cookieCategory.title != 'undefined'){
                    preferencesPopupHtml += '<div class="mgdpr-cookiescategory-title">' + cookieCategory.title + '</div>';
                }

                if(typeof cookieCategory.text != 'undefined'){
                    preferencesPopupHtml += '<div class="mgdpr-cookiescategory-text">' + cookieCategory.text + '</div>';
                }

                for(var cookieIndex in cookieCategory.list){
                    var cookie = cookieCategory.list[cookieIndex];
                    var isEnabled = this.isEnabled(cookie.name);
                    var cookieExists = this.cookieExists(cookie.name);

                    preferencesPopupHtml += '<div class="mgdpr-cookie" data-name="' + cookie.name + '">';

                    if (typeof cookie.title != 'undefined') {
                        preferencesPopupHtml += '<div class="mgdpr-cookie-title">' + cookie.title + '</div>';
                    }

                    if(typeof cookie.readMoreUrl != 'undefined'){
                        var text = typeof cookie.readMoreText != 'undefined' ? cookie.readMoreText : config.i18n.readMore;
                        preferencesPopupHtml += '<div class="mgdpr-cookie-readmore">' + 
                            '<a href="' + cookie.readMoreUrl + '" target="_blank">' + text + '</a>' +
                        '</div>';
                    }

                    if(typeof cookie.mention != 'undefined'){
                        preferencesPopupHtml += '<div class="mgdpr-cookie-mention">' + 
                            cookie.mention + 
                        '</div>';
                    }
                    
                    preferencesPopupHtml += '<button class="mgdpr-toggle' + ((typeof cookie.canToggle == 'undefined' || cookie.canToggle) ? (' mgdpr-cantoggle' + (isEnabled || !cookieExists ? ' active' : '')) : ' active mgdpr-canttoggle') + '"><span class="mgdpr-hidden">' + config.i18n.accept + '</span></button>';
                    preferencesPopupHtml += '</div>';

                    if(isEnabled && typeof cookie.onEnabled == 'function'){
                        cookie.onEnabled(cookie);
                    }
                }

                preferencesPopupHtml += '</div>';
            }

            preferencesPopupHtml += '<div class="mgdpr-hr"></div>';
            preferencesPopupHtml += '<a id="mgdpr-savepreferences" class="mgdpr-button" href="javascript:;">' + config.i18n.savePreferences + '</a>';
            preferencesPopupHtml = this.buildPopupHtml('mgdpr-preferencespopup', preferencesPopupHtml);
            $('body').append(preferencesPopupHtml);

            $('#mgdpr-preferences').on('click', function(e){
                e.preventDefault();
                MGDPR.hideMainPopup().showPreferencesPopup();
            });

            $('#mgdpr-refuseall').on('click', function(e){
                e.preventDefault();
                MGDPR.refuseAll(true);
            });

            $('#mgdpr-acceptall').on('click', function(e){
                e.preventDefault();
                MGDPR.acceptAll(true);
            });

            $('.mgdpr-cantoggle').on('click', function(e){
                e.preventDefault();
				var $this = $(this);
                $this.toggleClass('active');

				if(!$this.is('#mgdpr-toggleall')){
					if($('.mgdpr-cantoggle').length == $('.mgdpr-cantoggle.active').length){
						$('#mgdpr-toggleall').addClass('active');
					}else{
						$('#mgdpr-toggleall').removeClass('active');
					}
				}
            });

            $('#mgdpr-toggleall').on('click', function(e){
                e.preventDefault();
                var isActive = $(this).hasClass('active');
                var $others = $('.mgdpr-cantoggle:not(#mgdpr-toggleall)');
                if(isActive){
                    $others.addClass('active');
                }else{
                    $others.removeClass('active');
                }
            });

            $('#mgdpr-savepreferences').on('click', function(e){
                e.preventDefault();
                $('.mgdpr-cookie').each(function(){
                    var $this = $(this);
                    var cookieName = $this.data('name');

                    if(typeof cookieName != 'undefined' && cookieName.length > 0){
                        MGDPR.setCookie('mgdpr_' + cookieName, $this.find('.mgdpr-toggle.active').length > 0 ? '1' : '0');
                    }
                });
                MGDPR.setUserChose();
                window.location.reload();
            });

            $doc.on('click', '.mgdpr-manage-preferences', function(e){
                e.preventDefault();
                MGDPR.showPreferencesPopup();
            });

            $('.mgdpr-close').on('click', function(e){
                e.preventDefault();
                $(this).parents('.mgdpr-popup').fadeOut('fast');
            });

            if(this.hasUserChose()){
                $('.mgdpr-popup').on('click', function(e){
                    var $this = $(this);
                    var $target = $(e.target);

                    if(!$target.is('.mgdpr-popup-content') && $target.parents('.mgdpr-popup-content').length === 0){
                        $this.fadeOut('fast');
                    }
                });
            }

            return this;
        },

        refuseAll: function(reloadPage){
            this.setAll('0');
            this.setUserChose();

            if(typeof reloadPage != 'undefined' && reloadPage){
                window.location.reload();
            }

            return this;
        },

        acceptAll: function(reloadPage){
            this.setAll('1');
            this.setUserChose();

            if(typeof reloadPage != 'undefined' && reloadPage){
                window.location.reload();
            }

            return this;
        },

        setAll: function(value){
            for(var categoryIndex in config.cookies){
                for(var cookieIndex in config.cookies[categoryIndex].list){
                    MGDPR.setCookie('mgdpr_' + config.cookies[categoryIndex].list[cookieIndex].name, value);
                }
            }
            return this;
        },

        showMainPopup: function(){
            $('#mgdpr-mainpopup').fadeIn('fast');
            return this;
        },

        hideMainPopup: function(){
            $('#mgdpr-mainpopup').fadeOut('fast');
            return this;
        },

        showPreferencesPopup: function(){
            $('#mgdpr-preferencespopup').fadeIn('fast');
            return this;
        },

        hidePreferencesPopup: function(){
            $('#mgdpr-preferencespopup').fadeOut('fast');
            return this;
        },

        hasUserChose: function(){
            return this.getCookie('mgdpr_uc') == '1';
        },

        setUserChose: function(){
            this.setCookie('mgdpr_uc', '1');
            return this;
        },

        setCookie: function(name, value, days) {
            if (typeof days == 'undefined') {
                days = 6 * 31;
            }

            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = '; expires=' + date.toUTCString();

            document.cookie = name + '=' + (value || '')  + expires + '; path=/';
            return this;
        },

        getCookie: function(name) {
            var nameEQ = name + '=';
            var ca = document.cookie.split(';');

            for(var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' '){
                    c = c.substring(1, c.length);
                }

                if (c.indexOf(nameEQ) == 0){
                    return c.substring(nameEQ.length, c.length);
                }
            }

            return null;
        },

        eraseCookie: function(name) {   
            document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            return this;
        }
    }

})(jQuery);