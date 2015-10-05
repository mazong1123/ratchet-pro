/* ===================================================================================
 * RatchetPro: common.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * Originally from https://github.com/twbs/ratchet by Connor Sears
 * ==================================================================================== */

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

    if (typeof window.RATCHET.Class === 'undefined') {
        window.RATCHET.Class = {};
    }

    // Shrim Date.now()
    if (!Date.now) {
        Date.now = function () {
            return new Date().getTime();
        }
    }

    var loadedScripts = [];

    // Load external scripts.
    window.RATCHET.getScript = function (source, successCallback, failCallback) {
        if (loadedScripts.indexOf(source) >= 0) {
            // If the script has already been loaded, don't load it again, just call the success callback.
            if (successCallback !== undefined && successCallback !== null && typeof successCallback === 'function') {
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

                if (successCallback !== undefined && successCallback !== null && typeof successCallback === 'function') {
                    successCallback(null, null, null);
                }

                return;
            }
        }

        // Add timestamp to prevent ajax cache.
        var url = source + '?_=' + Date.now();

        var xhr = new XMLHttpRequest();
        xhr.responseType = 'text';
        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var scriptText = xhr.responseText;

                    // Execute the scripts.
                    globalEval(scriptText);

                    // Indicates the js has been loaded and executed.
                    loadedScripts.push(source);

                    if (typeof successCallback === 'function') {
                        successCallback();
                    }
                }
                else {
                    if (typeof failCallback === 'function') {
                        failCallback(xhr, xhr.statusText);
                    }
                }
            }
        };

        xhr.send();

        /*jQuery.ajax(getScriptOptions).done(function (data, textStatus, jqXHR) {
            // Indicates the js has been loaded and executed.
            loadedScripts.push(source);

            if (successCallback !== undefined && successCallback !== null && typeof successCallback === 'function') {
                successCallback(data, textStatus, jqXHR);
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            if (failCallback !== undefined && successCallback !== null && typeof failCallback === 'function') {
                failCallback(jqXHR, textStatus, errorThrown);
            }
        });*/
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

    // From jQuery 2.1.4
    var globalEval = function (code) {
        var script;
        var indirect = eval;

        code = compatibleTrim(code);

        if (code) {
            // If the code includes a valid, prologue position
            // strict mode pragma, execute code by injecting a
            // script tag into the document.
            if (code.indexOf("use strict") === 1) {
                script = document.createElement("script");
                script.text = code;
                document.head.appendChild(script).parentNode.removeChild(script);
            } else {
                // Otherwise, avoid the DOM node creation, insertion
                // and removal by using an indirect global eval
                indirect(code);
            }
        }
    };

    // From jQuery 2.1.4 (original name: trim). Support Android < 4.1
    var compatibleTrim = function (text) {
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        return text == null ? "" : (text + "").replace(rtrim, "");
    };
}());
