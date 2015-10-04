/* ===================================================================================
 * RatchetPro: modal.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * Originally from https://github.com/twbs/ratchet
 * =================================================================================== */

(function () {
    'use strict';

    var eventModalOpen = new CustomEvent('modalOpen', {
        bubbles: true,
        cancelable: true
    });

    var eventModalClose = new CustomEvent('modalClose', {
        bubbles: true,
        cancelable: true
    });

    window.RATCHET.Class.Modal = window.RATCHET.Class.Component.extend({
        init: function (componentToggle, component) {
            var self = this;

            self._super(componentToggle, component);
        },

        onComponentToggleTouchEnd: function (event) {
            var self = this;
            self._super(event);

            if (self.component && self.component.classList.contains('modal')) {
                var eventToDispatch = eventModalOpen;
                if (self.component.classList.contains('active')) {
                    eventToDispatch = eventModalClose;
                }
                self.component.dispatchEvent(eventToDispatch);
                self.component.classList.toggle('active');

                // prevents rewriting url.
                event.preventDefault();
                event.stopPropagation();
            }
        }
    });
})();
