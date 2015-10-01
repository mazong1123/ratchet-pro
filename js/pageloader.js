/* ===================================================================================
 * RatchetPro: pageLoader.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * =================================================================================== */

!(function () {
    'use strict';

    var checkPage = function () {
        var pageLoaderSettings = window.RATCHET.pageLoaderSettings;

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
    };

    // Inject checkPage() after push event fired.
    window.addEventListener('push', checkPage);

    window.RATCHET.changePage = function (url, transition) {
        var options = {
            url: url
        };

        if (transition !== undefined && transition !== null) {
            options.transition = transition;
        }

        window.RATCHET.push(options);
    };
}());
