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
