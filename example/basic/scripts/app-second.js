(function () {
    var rachetPageManager = new window.RATCHET.Class.PageManager();
    rachetPageManager.ready(function () {
        $('#back-to-first').on('click', function () {
            rachetPageManager.changePage('index.html');
        });
    });
})();