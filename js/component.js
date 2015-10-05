/* ===================================================================================
 * RatchetPro: component.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * Originally from https://github.com/twbs/ratchet by Connor Sears
 * =================================================================================== */

(function () {
    'use strict';

    window.RATCHET.Class.Component = Class.extend({
        init: function (componentToggle, component) {
            var self = this;

            self.componentToggle = componentToggle;
            self.component = component;

            self.initEvents();
        },

        initEvents: function () {
            var self = this;

            self.componentToggleTouchEnd = function (event) {
                self.onComponentToggleTouchEnd(event);
            };

            self.componentToggle.addEventListener('touchend', self.componentToggleTouchEnd);
        },

        dispose: function () {
            // To be overrided by the inherited class.
        },

        onComponentToggleTouchEnd: function (event) {
            // To be overrided by the inherited class.
        }
    });
})();