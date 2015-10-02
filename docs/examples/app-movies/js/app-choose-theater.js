(function () {
    window.RATCHET.Definition.PageManager.settings.pageEntryScriptPath = 'js';

    var rachetPageManager = new window.RATCHET.Definition.PageManager();
    rachetPageManager.ready(function () {
        console.log('entry point of choose-theater page.');
    });
})();