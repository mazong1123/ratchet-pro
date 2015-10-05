/* ===================================================================================
 * RatchetPro: toggle.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * Originally from https://github.com/twbs/ratchet by Connor Sears
 * =================================================================================== */

(function () {
    'use strict';

    var transformProperty = window.RATCHET.getBrowserCapabilities.transform;

    window.RATCHET.Class.Toggle = window.RATCHET.Class.Component.extend({
        init: function (componentToggle, component) {
            var self = this;
            self.start = {};
            self.touchMove = false;
            self.distanceX = false;

            self._super(componentToggle, component);
        },

        initEvents: function () {
            var self = this;

            self.componentTouchStart = function (e) {
                e = e.originalEvent || e;

                var toggle = self.component;

                var handle = toggle.querySelector('.toggle-handle');
                var toggleWidth = toggle.clientWidth;
                var handleWidth = handle.clientWidth;
                var offset = toggle.classList.contains('active') ? (toggleWidth - handleWidth) : 0;

                self.start = { pageX: e.touches[0].pageX - offset, pageY: e.touches[0].pageY };
                self.touchMove = false;
            };

            self.componentTouchMove = function (e) {
                e = e.originalEvent || e;

                if (e.touches.length > 1) {
                    return; // Exit if a pinch
                }

                var toggle = self.component;

                var handle = toggle.querySelector('.toggle-handle');
                var current = e.touches[0];
                var toggleWidth = toggle.clientWidth;
                var handleWidth = handle.clientWidth;
                var offset = toggleWidth - handleWidth;

                self.touchMove = true;
                self.distanceX = current.pageX - self.start.pageX;

                if (Math.abs(self.distanceX) < Math.abs(current.pageY - self.start.pageY)) {
                    return;
                }

                e.preventDefault();

                if (self.distanceX < 0) {
                    return (handle.style[transformProperty] = 'translate3d(0,0,0)');
                }
                if (self.distanceX > offset) {
                    return (handle.style[transformProperty] = 'translate3d(' + offset + 'px,0,0)');
                }

                handle.style[transformProperty] = 'translate3d(' + self.distanceX + 'px,0,0)';

                toggle.classList[(self.distanceX > (toggleWidth / 2 - handleWidth / 2)) ? 'add' : 'remove']('active');
            };

            self.componentTouchEnd = function (e) {
                var toggle = self.component;

                var handle = toggle.querySelector('.toggle-handle');
                var toggleWidth = toggle.clientWidth;
                var handleWidth = handle.clientWidth;
                var offset = (toggleWidth - handleWidth);
                var slideOn = (!self.touchMove && !toggle.classList.contains('active')) || (self.touchMove && (self.distanceX > (toggleWidth / 2 - handleWidth / 2)));

                if (slideOn) {
                    handle.style[transformProperty] = 'translate3d(' + offset + 'px,0,0)';
                } else {
                    handle.style[transformProperty] = 'translate3d(0,0,0)';
                }

                toggle.classList[slideOn ? 'add' : 'remove']('active');

                e = new CustomEvent('toggle', {
                    detail: {
                        isActive: slideOn
                    },
                    bubbles: true,
                    cancelable: true
                });

                toggle.dispatchEvent(e);

                self.touchMove = false;
            };

            self.component.addEventListener('touchstart', self.componentTouchStart);
            self.component.addEventListener('touchmove', self.componentTouchMove);
            self.component.addEventListener('touchend', self.componentTouchEnd);
        }
    });
})();
