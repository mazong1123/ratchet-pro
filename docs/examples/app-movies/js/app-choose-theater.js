(function () {
    window.RATCHET.pageLoaderSettings.pageEntryScriptPath = 'js';

    var entry = function () {
        console.log('entry point of choose-theater page.');
    };

    document.addEventListener('DOMContentLoaded', entry);

    document.addEventListener('choose-theaterContentReady', entry);
})();