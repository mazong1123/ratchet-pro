(function () {
    window.RATCHET.PageLoader.updateSettings({
        pageEntryScriptPath: 'js'
    });
    window.RATCHET.enableMouseSupport();

    var entry = function () {
        console.log('entry point of index page.');

        $('#changePage').on('click', function (e) {
            e.preventDefault();
            window.RATCHET.PageLoader.changePage('choose-theater.html', 'slide-in');
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        entry();
    });

    document.addEventListener('indexContentReady', function () {
        entry();
    });
})();