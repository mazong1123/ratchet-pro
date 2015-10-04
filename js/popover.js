/* ===================================================================================
 * RatchetPro: popover.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * Originally from https://github.com/twbs/ratchet
 * =================================================================================== */
!(function () {
    'use strict';

    window.RATCHET.Class.Popover = window.RATCHET.Class.Component.extend({
        init: function (componentToggle, component) {
            var self = this;
            self._super(componentToggle, component);

            self.onPopoverHidden = function () {
                self.component.style.display = 'none';
                self.component.removeEventListener(window.RATCHET.getTransitionEnd, self.onPopoverHidden);
            };

            self.onBackDropElementTouchEnd = function () {
                self.component.addEventListener(window.RATCHET.getTransitionEnd, self.onPopoverHidden);
                self.component.classList.remove('visible');
                self.backDropElement.style.display = 'none';
            }

            self.backDropElement = undefined;
        },

        onComponentToggleTouchEnd: function (event) {
            var self = this;
            self._super(event);

            if (self.component && self.component.classList.contains('popover')) {
                self.component.style.display = 'block';
                self.component.classList.add('visible');

                showBackDrop(self);

                // prevents rewriting url.
                event.preventDefault();
                event.stopPropagation();
            }
        },

        dispose: function () {
            var self = this;
            self._super();

            // Remove back drop element event listener.
            if (self.backDropElement !== undefined) {
                self.backDropElement.removeEventListener('touchend', self.onBackDropElementTouchEnd);
            }
        }
    });

    var showBackDrop = function (instance) {
        // If back drop element already exists, show it.
        if (instance.backDropElement !== undefined) {
            instance.backDropElement.style.display = 'block';

            return;
        }

        // Create a new back drop element.
        var backDropElement = document.createElement('div');

        backDropElement.classList.add('backdrop');
        backDropElement.addEventListener('touchend', instance.onBackDropElementTouchEnd);
        instance.component.parentNode.appendChild(backDropElement);

        instance.backDropElement = backDropElement;
    };
}());
