/* ===================================================================================
 * RatchetPro: pageManager.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * Originally from https://github.com/twbs/ratchet
 * =================================================================================== */

(function () {
    'use strict';

    window.RATCHET.Class.PageManager = Class.extend({
        init: function () {
            var self = this;

            self.entryCallback = undefined;

            self.components = [];

            self.domContentLoadedCallback = function () {
                self.populateComponents();

                // Dom is ready, call entryCallback().
                if (typeof self.entryCallback === 'function') {
                    self.entryCallback();
                }
            };

            self.pageContentReadyCallback = function () {
                self.populateComponents();

                // Page changing end, page content is ready, call entryCallback();
                if (typeof self.entryCallback === 'function') {
                    self.entryCallback();
                }
            };
        },

        ready: function (callback) {
            var self = this;
            self.entryCallback = callback;

            document.removeEventListener('DOMContentLoaded', self.domContentLoadedCallback);
            document.addEventListener('DOMContentLoaded', self.domContentLoadedCallback);

            var settings = window.RATCHET.Class.PageManager.settings;

            // Bind page changing event handler.
            var pageName = getPageName();
            if (pageName !== undefined && pageName !== null && pageName.length > 0) {
                var pageContentReadyEventName = pageName + settings.pageContentReadyEventSuffix;
                document.removeEventListener(pageContentReadyEventName, self.pageContentReadyCallback);
                document.addEventListener(pageContentReadyEventName, self.pageContentReadyCallback);
            }
        },

        populateComponents: function () {
            var self = this;

            // Dispose existing components.
            for (var i = 0; i < self.components.length; i++) {
                var c = self.components[i];
                c.dispose();
            }

            self.components.length = 0;

            var componentToggles = document.querySelectorAll('a');
            var length = componentToggles.length;
            for (var i = 0; i < length; i++) {
                var toggle = componentToggles[i];
                if (toggle.hash === undefined || toggle.hash === null || toggle.hash.length <= 0) {
                    continue;
                }

                var component = document.querySelector(toggle.hash);
                if (component === undefined || component === null) {
                    continue;
                }

                if (component.classList.contains('modal')) {
                    // It's a modal.
                    var newModel = new window.RATCHET.Class.Modal(toggle, component);
                    self.components.push(newModel);
                }
            }
        },

        changePage: function (url, transition) {
            var options = {
                url: url
            };

            if (transition !== undefined && transition !== null) {
                options.transition = transition;
            }

            window.RATCHET.Class.Pusher.push(options);
        }
    });

    window.RATCHET.Class.PageManager.settings = {
        pageContentElementSelector: '.content',
        pageNameElementAttributeName: 'data-page',
        pageEntryScriptPath: 'scripts',
        pageEntryScriptPrefix: 'app-',
        pageContentReadyEventSuffix: 'ContentReady'
    };

    window.RATCHET.Class.PageManager.enableMouseSupport = function () {
        if (typeof window.FingerBlast !== 'undefined') {
            new window.FingerBlast('body');
        }
    };

    var getPageName = function () {
        var settings = window.RATCHET.Class.PageManager.settings;

        var pageContentElement = document.querySelector(settings.pageContentElementSelector);
        var pageName = pageContentElement.getAttribute(settings.pageNameElementAttributeName);

        return pageName;
    };

    var checkPage = function () {
        var settings = window.RATCHET.Class.PageManager.settings;

        var pageName = getPageName();
        if (pageName !== undefined && pageName !== null && pageName.length > 0) {
            // Load page entry script.
            var entryScriptPath = settings.pageEntryScriptPath + '/' + settings.pageEntryScriptPrefix + pageName + '.js';
            window.RATCHET.getScript(entryScriptPath, function () {
                // Fire page content ready event.
                var pageContentReadyEventName = pageName + settings.pageContentReadyEventSuffix;
                var pageContentReadyEvent = new CustomEvent(pageContentReadyEventName, {
                    detail: {},
                    bubbles: true,
                    cancelable: true
                });

                document.dispatchEvent(pageContentReadyEvent);
            }, function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
                console.log(errorThrown);
            });
        }
    };

    // Inject checkPage() after push event fired.
    window.removeEventListener('push', checkPage);
    window.addEventListener('push', checkPage);
})();
