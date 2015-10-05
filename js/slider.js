/* ========================================================================
 * Ratchet: slider.js v2.0.2
 * http://goratchet.com/components#sliders
 * ========================================================================
   Adapted from Brad Birdsall's swipe
 * Copyright 2015 Connor Sears
 * Licensed under MIT (https://github.com/twbs/ratchet/blob/master/LICENSE)
 * ======================================================================== */

(function () {
    'use strict';

    var transformPrefix = window.RATCHET.getBrowserCapabilities.prefix;
    var transformProperty = window.RATCHET.getBrowserCapabilities.transform;

    window.RATCHET.Class.Slider = window.RATCHET.Class.Component.extend({
        init: function (componentToggle, component) {
            var self = this;
            self.pageX = undefined;
            self.pageY = undefined;
            self.deltaX = undefined;
            self.deltaY = undefined;
            self.offsetX = undefined;
            self.lastSlide = undefined;
            self.startTime = undefined;
            self.resistance = undefined;
            self.sliderWidth = undefined;
            self.slideNumber = undefined;
            self.isScrolling = undefined;
            self.scrollableArea = undefined;
            self.startedMoving = undefined;
            self.slider = undefined;

            self.componentToggle = componentToggle;
            self.component = component;

            self.slider = self.component.querySelector('.slide-group');
            self.slideItems = self.component.querySelectorAll('.slide');
            self.slideLength = self.slideItems.length;

            self.initEvents();
        },

        initEvents: function () {
            var self = this;

            self.componentTouchStart = function (e) {
                if (self.slideLength <= 0) {
                    return;
                }

                var firstItem = self.slideItems[0];

                self.scrollableArea = firstItem.offsetWidth * self.slideLength;
                self.isScrolling = undefined;
                self.sliderWidth = self.slider.offsetWidth;
                self.resistance = 1;
                self.lastSlide = -(self.slideLength - 1);
                self.startTime = +new Date();
                self.pageX = e.touches[0].pageX;
                self.pageY = e.touches[0].pageY;
                self.deltaX = 0;
                self.deltaY = 0;

                setSlideNumber(self, 0);

                self.slider.style[transformPrefix + 'transition-duration'] = 0;
            };

            self.componentTouchMove = function (e) {
                if (e.touches.length > 1 || !self.slider) {
                    return; // Exit if a pinch || no slider
                }

                // adjust the starting position if we just started to avoid jumpage
                if (!self.startedMoving) {
                    self.pageX += (e.touches[0].pageX - self.pageX) - 1;
                }

                self.deltaX = e.touches[0].pageX - self.pageX;
                self.deltaY = e.touches[0].pageY - self.pageY;
                self.pageX = e.touches[0].pageX;
                self.pageY = e.touches[0].pageY;

                if (typeof self.isScrolling === 'undefined' && self.startedMoving) {
                    self.isScrolling = Math.abs(self.deltaY) > Math.abs(self.deltaX);
                }

                if (self.isScrolling) {
                    return;
                }

                self.offsetX = (self.deltaX / self.resistance) + getScroll(self);

                e.preventDefault();

                self.resistance = self.slideNumber === 0 && self.deltaX > 0 ? (self.pageX / self.sliderWidth) + 1.25 :
                             self.slideNumber === self.lastSlide && self.deltaX < 0 ? (Math.abs(self.pageX) / self.sliderWidth) + 1.25 : 1;

                self.slider.style[transformProperty] = 'translate3d(' + self.offsetX + 'px,0,0)';

                // started moving
                self.startedMoving = true;
            };

            self.componentTouchEnd = function (e) {
                if (!self.slider || self.isScrolling) {
                    return;
                }

                // we're done moving
                self.startedMoving = false;

                setSlideNumber(self, (+new Date()) - self.startTime < 1000 && Math.abs(self.deltaX) > 15 ? (self.deltaX < 0 ? -1 : 1) : 0);

                self.offsetX = self.slideNumber * self.sliderWidth;

                self.slider.style[transformPrefix + 'transition-duration'] = '.2s';
                self.slider.style[transformProperty] = 'translate3d(' + self.offsetX + 'px,0,0)';

                e = new CustomEvent('slide', {
                    detail: { slideNumber: Math.abs(self.slideNumber) },
                    bubbles: true,
                    cancelable: true
                });

                self.component.dispatchEvent(e);
            };

            self.component.addEventListener('touchstart', self.componentTouchStart);
            self.component.addEventListener('touchmove', self.componentTouchMove);
            self.component.addEventListener('touchend', self.componentTouchEnd);
        }
    });

    var getScroll = function (instance) {
        var translate3d = instance.slider.style[transformProperty].match(/translate3d\(([^,]*)/);
        var ret = translate3d ? translate3d[1] : 0;

        return parseInt(ret, 10);
    };

    var setSlideNumber = function (instance, offset) {
        var round = offset ? (instance.deltaX < 0 ? 'ceil' : 'floor') : 'round';
        instance.slideNumber = Math[round](getScroll(instance) / (instance.scrollableArea / instance.slideLength));
        instance.slideNumber += offset;
        instance.slideNumber = Math.min(instance.slideNumber, 0);
        instance.slideNumber = Math.max(-(instance.slideLength - 1), instance.slideNumber);
    };
})();
