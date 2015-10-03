/* ===================================================================================
 * RatchetPro: component.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * Originally from https://github.com/twbs/ratchet
 * =================================================================================== */

(function () {
    'use strict';

    window.RATCHET.Class.Component = Class.extend({
        init: function (componentToggle, component) {
            var self = this;

            self.componentToggle = componentToggle;
            self.component = component;

            self.componentToggleTouchEnd = function (event) {
                self.onComponentToggleTouchEnd(event);
            };

            self.componentToggle.addEventListener('touchend', self.componentToggleTouchEnd);
        },

        dispose: function () {
            var self = this;
            self.componentToggle.removeEventListener('touchend', self.componentToggleTouchEnd);
        },

        onComponentToggleTouchEnd: function (event) {
            // To be overrided by the inherited class.
        }
    });
})();