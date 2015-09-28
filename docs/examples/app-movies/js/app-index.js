(function () {
    window.RATCHET.pageLoaderSettings.pageEntryScriptPath = 'js';

    var entry = function () {
        console.log('entry point of index page.');
    };

    document.addEventListener('DOMContentLoaded', function () {
        entry();
    });

    document.addEventListener('indexContentReady', function () {
        entry();
    });
})();