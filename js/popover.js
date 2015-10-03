/* ========================================================================
 * Ratchet: popover.js v2.0.2
 * http://goratchet.com/components#popovers
 * ========================================================================
 * Copyright 2015 Connor Sears
 * Licensed under MIT (https://github.com/twbs/ratchet/blob/master/LICENSE)
 * ======================================================================== */

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

                event.preventDefault(); // prevents rewriting url (apps can still use hash values in url)
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

    /*var popover;

    var findPopovers = function (target) {
        var i;
        var popovers = document.querySelectorAll('a');

        for (; target && target !== document; target = target.parentNode) {
            for (i = popovers.length; i--;) {
                if (popovers[i] === target) {
                    return target;
                }
            }
        }
    };

    var onPopoverHidden = function () {
        popover.style.display = 'none';
        popover.removeEventListener(window.RATCHET.getTransitionEnd, onPopoverHidden);
    };

    var backdrop = (function () {
        var element = document.createElement('div');

        element.classList.add('backdrop');

        element.addEventListener('touchend', function () {
            popover.addEventListener(window.RATCHET.getTransitionEnd, onPopoverHidden);
            popover.classList.remove('visible');
            popover.parentNode.removeChild(backdrop);
        });

        return element;
    }());

    var getPopover = function (e) {
        var anchor = findPopovers(e.target);

        if (!anchor || !anchor.hash || (anchor.hash.indexOf('/') > 0)) {
            return;
        }

        try {
            popover = document.querySelector(anchor.hash);
        } catch (error) {
            popover = null;
        }

        if (popover === null) {
            return;
        }

        if (!popover || !popover.classList.contains('popover')) {
            return;
        }

        return popover;
    };

    var showHidePopover = function (e) {
        var popover = getPopover(e);

        if (!popover) {
            return;
        }

        popover.style.display = 'block';
        popover.offsetHeight;
        popover.classList.add('visible');

        popover.parentNode.appendChild(backdrop);
    };

    window.addEventListener('touchend', showHidePopover);*/

}());
