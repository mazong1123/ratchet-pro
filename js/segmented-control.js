/* ===================================================================================
 * RatchetPro: segmented-control.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * Originally from https://github.com/twbs/ratchet by Connor Sears
 * =================================================================================== */

(function () {
    'use strict';

    window.RATCHET.Class.SegmentedControl = window.RATCHET.Class.Component.extend({
        init: function (componentToggle, component) {
            var self = this;

            self.componentToggle = componentToggle;
            self.component = component;

            // Find all control items.
            self.controlItems = self.component.querySelectorAll('.control-item');

            self.initEvents();
        },

        initEvents: function(){
            var self = this;

            self.componentToggleTouchEnd = function (event) {
                self.onComponentToggleTouchEnd(event);
            };

            var controlItemLength = self.controlItems.length;

            for (var i = 0; i < controlItemLength; i++) {
                var ci = self.controlItems[i];

                ci.addEventListener('touchend', self.componentToggleTouchEnd);
            }
        },

        onComponentToggleTouchEnd: function (event) {
            var self = this;
            self._super(event);

            var targetTab = event.target;

            if (targetTab && targetTab.classList.contains('control-item')) {
                var activeTab;
                var activeBodies;
                var targetBody;
                var className = 'active';
                var classSelector = '.' + className;

                activeTab = targetTab.parentNode.querySelector(classSelector);

                if (activeTab) {
                    activeTab.classList.remove(className);
                }

                targetTab.classList.add(className);

                if (!targetTab.hash) {
                    return;
                }

                targetBody = document.querySelector(targetTab.hash);

                if (!targetBody) {
                    return;
                }

                activeBodies = targetBody.parentNode.querySelectorAll(classSelector);

                for (var i = 0; i < activeBodies.length; i++) {
                    activeBodies[i].classList.remove(className);
                }

                targetBody.classList.add(className);

                // prevents rewriting url.
                event.preventDefault();
                event.stopPropagation();
            }
        }
    });
})();
