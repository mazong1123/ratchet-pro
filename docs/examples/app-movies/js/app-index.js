(function () {
    window.RATCHET.Definition.PageManager.settings.pageEntryScriptPath = 'js';

    // Not recommended. Do not use in Production environment at this time.
    window.RATCHET.Definition.PageManager.enableMouseSupport();

    var rachetPageManager = new window.RATCHET.Definition.PageManager();
    rachetPageManager.ready(function () {
        console.log('entry point of index page.');

        $('#changePage').on('click', function (e) {
            e.preventDefault();
            rachetPageManager.changePage('choose-theater.html', 'slide-in');
        });
    });
})();