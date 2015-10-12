(function () {
    window.RATCHET.Class.PageManager.settings.pageEntryScriptPath = 'js';

    // Enable mouse support.
    window.RATCHET.Class.PageManager.enableMouseSupport();

    var rachetPageManager = new window.RATCHET.Class.PageManager();
    rachetPageManager.ready(function () {
        console.log('entry point of index page.');

        document.querySelector('#changePage').addEventListener('click', function (e) {
            e.preventDefault();
            rachetPageManager.changePage('choose-theater.html', 'slide-in');
        });

        document.querySelector('#index-slider').addEventListener('slide', function (e) {
            alert('slide! Current Slide Index: ' + e.detail.slideNumber);
        });

        document.querySelector('#settingsModal').addEventListener('modalOpen', function (e) {
            alert('settingsModal opening!');
        });

        document.querySelector('#settingsModal').addEventListener('modalClose', function (e) {
            alert('settingsModal closing!');
        });

        // jQuery is supported by RatchetPro as well.
        /*$('#changePage').on('click', function (e) {
            e.preventDefault();
            rachetPageManager.changePage('choose-theater.html', 'slide-in');
        });*/
    });
})();