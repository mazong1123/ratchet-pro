(function () {
    window.RATCHET.Class.PageManager.settings.pageEntryScriptPath = 'js';

    // Enable mouse support.
    window.RATCHET.Class.PageManager.enableMouseSupport();

    var rachetPageManager = new window.RATCHET.Class.PageManager();
    rachetPageManager.ready(function () {
        console.log('entry point of choose-theater page.');
    });
})();