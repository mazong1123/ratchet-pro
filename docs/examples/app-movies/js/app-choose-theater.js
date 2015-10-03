(function () {
    window.RATCHET.Class.PageManager.settings.pageEntryScriptPath = 'js';

    // Not recommended. Do not use in Production environment at this time.
    //window.RATCHET.Class.PageManager.enableMouseSupport();

    var rachetPageManager = new window.RATCHET.Class.PageManager();
    rachetPageManager.ready(function () {
        console.log('entry point of choose-theater page.');
    });
})();