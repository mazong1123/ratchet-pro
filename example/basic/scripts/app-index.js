(function () {
    var rachetPageManager = new window.RATCHET.Class.PageManager();
    rachetPageManager.ready(function () {
        $('#go-to-second').on('click', function () {
            rachetPageManager.changePage('second.html');
        });
    });
})();