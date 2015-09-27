/* ===================================================================================
 * RatchetPro: pageloader.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * =================================================================================== */

!(function () {
    'use strict';

    var checkPage = function () {
        var pageLoaderSettings = window.RATCHET.pageLoaderSettings;

        var pageContentElement = $(pageLoaderSettings.pageContentElementSelector);
        var pageName = pageContentElement.attr(pageLoaderSettings.pageNameElementAttributeName);

        if (pageName) {
            // Load page entry script.
            var entryScriptPath = pageLoaderSettings.pageEntryScriptPath + '/' + pageEntryScriptPrefix + pageName + '.js';
            $.getScript(entryScriptPath)
            .done(function (script, textStatus) {
                // Fire page content ready event.
                $(document).trigger(pageName + pageLoaderSettings.pageContentReadyEventSuffix);
            })
            .fail(function (jqxhr, statusText, errorThrown) {
                console.log(statusText);
                console.log(jqxhr);
            });
        }
    };

    // Inject checkPage() after push event fired.
    window.addEventListener('push', checkPage);
}());
