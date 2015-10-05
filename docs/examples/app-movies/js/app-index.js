(function () {
    window.RATCHET.Class.PageManager.settings.pageEntryScriptPath = 'js';

    // Not recommended. Do not use in Production environment at this time.
    //window.RATCHET.Class.PageManager.enableMouseSupport();

    var rachetPageManager = new window.RATCHET.Class.PageManager();
    rachetPageManager.ready(function () {
        console.log('entry point of index page.');

        document.querySelector('#changePage').addEventListener('click', function (e) {
            e.preventDefault();
            rachetPageManager.changePage('choose-theater.html', 'slide-in');
        });

        // jQuery is supported by RatchetPro as well.
        /*$('#changePage').on('click', function (e) {
            e.preventDefault();
            rachetPageManager.changePage('choose-theater.html', 'slide-in');
        });*/
    });
})();