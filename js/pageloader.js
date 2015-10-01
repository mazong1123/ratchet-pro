/* ===================================================================================
 * RatchetPro: pageLoader.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * =================================================================================== */

!(function () {
    'use strict';

    var pageLoaderSettings = {
        pageContentElementSelector: '.content',
        pageNameElementAttributeName: 'data-page',
        pageEntryScriptPath: 'scripts',
        pageEntryScriptPrefix: 'app-',
        pageContentReadyEventSuffix: 'ContentReady'
    };

    window.RATCHET.Definition.PageLoader = Class.extend({
        init: function (settings) {
            var self = this;

            updateSettings(self, settings);

            // Inject checkPage() after push event fired.
            window.removeEventListener('push', self.checkPage);
            window.addEventListener('push', self.checkPage);
        },

        changePage: function (url, transition) {
            var options = {
                url: url
            };

            if (transition !== undefined && transition !== null) {
                options.transition = transition;
            }

            window.RATCHET.push(options);
        },

        checkPage: function () {
            var pageContentElement = document.querySelector(pageLoaderSettings.pageContentElementSelector);
            var pageName = pageContentElement.getAttribute(pageLoaderSettings.pageNameElementAttributeName);

            if (pageName !== undefined && pageName !== null && pageName.length > 0) {
                // Load page entry script.
                var entryScriptPath = pageLoaderSettings.pageEntryScriptPath + '/' + pageLoaderSettings.pageEntryScriptPrefix + pageName + '.js';
                window.RATCHET.getScript(entryScriptPath, function () {
                    // Fire page content ready event.
                    var eventName = pageName + pageLoaderSettings.pageContentReadyEventSuffix;
                    var pageContentReadyEvent = new CustomEvent(eventName, {
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
        },

        updateSettings: function (settings) {
            var self = this;

            updateSettings(self, settings);
        },

        getSettings: function () {
            return pageLoaderSettings;
        }
    });

    var updateSettings = function (instance, newSettings) {
        if (newSettings === undefined || newSettings === null) {
            return;
        }

        if (newSettings.pageContentElementSelector !== undefined) {
            pageLoaderSettings.pageContentElementSelector = newSettings.pageContentElementSelector;
        }

        if (newSettings.pageNameElementAttributeName !== undefined) {
            pageLoaderSettings.pageNameElementAttributeName = newSettings.pageNameElementAttributeName;
        }

        if (newSettings.pageEntryScriptPath !== undefined) {
            pageLoaderSettings.pageEntryScriptPath = newSettings.pageEntryScriptPath;
        }

        if (newSettings.pageEntryScriptPrefix !== undefined) {
            pageLoaderSettings.pageEntryScriptPrefix = newSettings.pageEntryScriptPrefix;
        }

        if (newSettings.pageContentReadyEventSuffix !== undefined) {
            pageLoaderSettings.pageContentReadyEventSuffix = newSettings.pageContentReadyEventSuffix;
        }
    };
}());
