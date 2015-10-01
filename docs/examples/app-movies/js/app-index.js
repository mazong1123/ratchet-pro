(function () {
    window.RATCHET.pageLoaderSettings.pageEntryScriptPath = 'js';
    window.RATCHET.enableMouseSupport();

    var entry = function () {
        console.log('entry point of index page.');

        $('#changePage').off('click');
        $('#changePage').on('click', function (e) {
            e.preventDefault();
            window.RATCHET.changePage('choose-theater.html', 'slide-in');
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        entry();
    });

    document.addEventListener('indexContentReady', function () {
        entry();
    });
})();