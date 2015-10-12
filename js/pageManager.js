/* ===================================================================================
 * RatchetPro: pageManager.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * Originally from https://github.com/twbs/ratchet by Connor Sears
 * =================================================================================== */

(function () {
    'use strict';

    var fingerBlastInstance = null;

    /** 
    * @description Page management system. 
    * Encapsulated PUSH system to support multi-page transition as well as page components management.
    */
    window.RATCHET.Class.PageManager = Class.extend({
        /** 
        * @description Initializes a new instance of the window.RATCHET.Class.PageManager class
        */
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

        /** 
        * @description Entry point for each page. The given callback function will be called after page ready.
        * @param {function} callback The callback function after page is ready.
        */
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

        /** 
        * @description Create components based on current dom. Existing components will be disposed and removed.
        */
        populateComponents: function () {
            var self = this;

            // Dispose existing components.
            for (var i = 0; i < self.components.length; i++) {
                var c = self.components[i];
                c.dispose();
            }

            self.components.length = 0;

            // Find anchor related components. E.G: modal, popover.
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

                var newComponent = null;
                if (component.classList.contains('modal')) {
                    // It's a modal.
                    newComponent = new window.RATCHET.Class.Modal(toggle, component);
                }
                else if (component.classList.contains('popover')) {
                    // It's a popover.
                    newComponent = new window.RATCHET.Class.Popover(toggle, component);
                }

                if (newComponent !== null) {
                    self.components.push(newComponent);
                }
            }

            // Segemented controls.
            var segmentedControls = document.querySelectorAll('.segmented-control');
            var segmentedControlLength = segmentedControls.length;
            for (var i = 0; i < segmentedControlLength; i++) {
                var sc = segmentedControls[i];
                var newSegmentedControlComponent = new window.RATCHET.Class.SegmentedControl(null, sc);

                self.components.push(newSegmentedControlComponent);
            }

            // Toggle controls.
            var toggleControls = document.querySelectorAll('.toggle');
            var toggleControlLength = toggleControls.length;
            for (var i = 0; i < toggleControlLength; i++) {
                var tc = toggleControls[i];
                var newToggleControlComponent = new window.RATCHET.Class.Toggle(null, tc);

                self.components.push(newToggleControlComponent);
            }

            // Slider controls.
            var sliderControls = document.querySelectorAll('.slider');
            var sliderControlLength = sliderControls.length;
            for (var i = 0; i < sliderControlLength; i++) {
                var sliderControl = sliderControls[i];
                var newSliderControlComponent = new window.RATCHET.Class.Slider(null, sliderControl);

                self.components.push(newSliderControlComponent);
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
        if (typeof window.FingerBlast !== 'undefined' && fingerBlastInstance === null) {
            fingerBlastInstance = new window.FingerBlast('body');
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
            }, function (xhr, statusText) {
                console.log(statusText);
            });
        }
    };

    // Inject checkPage() after push event fired.
    window.removeEventListener('push', checkPage);
    window.addEventListener('push', checkPage);
})();
