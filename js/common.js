/* ===================================================================================
 * RatchetPro: common.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * Originally from https://github.com/twbs/ratchet
 * =================================================================================== */

!(function () {
    'use strict';

    // Compatible With CustomEvent
    if (!window.CustomEvent) {
        window.CustomEvent = function (type, config) {
            var e = document.createEvent('CustomEvent');
            e.initCustomEvent(type, config.bubbles, config.cancelable, config.detail);
            return e;
        };
    }

    // Create Ratchet namespace
    if (typeof window.RATCHET === 'undefined') {
        window.RATCHET = {};
    }

    // Enable mouse support. Mouse support is disabled by default.
    window.RATCHET.enableMouseSupport = function () {
        if (typeof window.FingerBlast != 'undefined') {
            new FingerBlast('body');
        }
    };

    var loadedScripts = new Array();

    // Using JQuery to load external scripts. Need help to get rid of JQuery.
    window.RATCHET.getScript = function (source, successCallback, failCallback) {
        if (typeof $ === 'undefined') {
            console.log('JQuery not found. Cannot load and execute page scripts.');
            return;
        };

        if (loadedScripts.indexOf(source) >= 0) {
            // If the script has already been loaded, don't load it again, just call the success callback.
            if (successCallback != undefined && typeof successCallback === 'function') {
                successCallback(null, null, null);
            }

            return;
        }

        // Check if the script already been loaded to the page dom.
        var scriptElements = document.getElementsByTagName('script');
        for (var i = 0; i < scriptElements.length; i++) {
            var scriptSource = scriptElements[i].getAttribute('src');
            if (scriptSource === source) {
                // The script has already been loaded to dom, don't load it again, store to the loadedScripts array and
                // call the success callback.
                loadedScripts.push(scriptSource);

                if (successCallback != undefined && typeof successCallback === 'function') {
                    successCallback(null, null, null);
                }

                return;
            }
        }

        var getScriptOptions = {
            url: source,
            dataType: 'script'
        };

        $.ajax(getScriptOptions).done(function (data, textStatus, jqXHR) {
            // Indicates the js has been loaded and executed.
            loadedScripts.push(source);

            if (successCallback != undefined && typeof successCallback === 'function') {
                successCallback(data, textStatus, jqXHR);
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            if (failCallback != undefined && typeof failCallback === 'function') {
                failCallback(jqXHR, textStatus, errorThrown);
            }
        });
    };

    // Original script from http://davidwalsh.name/vendor-prefix
    window.RATCHET.getBrowserCapabilities = (function () {
        var styles = window.getComputedStyle(document.documentElement, '');
        var pre = (Array.prototype.slice
            .call(styles)
            .join('')
            .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
          )[1];
        return {
            prefix: '-' + pre + '-',
            transform: pre[0].toUpperCase() + pre.substr(1) + 'Transform'
        };
    })();

    window.RATCHET.getTransitionEnd = (function () {
        var el = document.createElement('ratchet');
        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return transEndEventNames[name];
            }
        }

        return transEndEventNames.transition;
    })();

    // Default page loader settings. Used by pageloader.js.
    window.RATCHET.pageLoaderSettings = {
        pageContentElementSelector: '.content',
        pageNameElementAttributeName: 'data-page',
        pageEntryScriptPath: 'scripts',
        pageEntryScriptPrefix: 'app-',
        pageContentReadyEventSuffix: 'ContentReady'
    };
}());
