/*!
 * =====================================================
 * RatchetPro v1.0.0 (https://github.com/mazong1123/ratchet-pro)
 * Copyright 2015 mazong1123
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 *
 * v1.0.0 designed by @mazong1123.
 * forked from https://github.com/twbs/ratchet 
 * =====================================================
 */
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();
// FINGERBLAST.js
// --------------
// Adapted from phantom limb by Brian Cartensen

/* jshint bitwise: false */
/* global GLOBAL: true */

(function () {

    'use strict';

    function FingerBlast(element) {
        this.element = typeof element === 'string' ? document.querySelector(element) : element;

        if (this.element) {
            this.listen();
        }
    }

    FingerBlast.prototype = {
        x: NaN,
        y: NaN,

        startDistance: NaN,
        startAngle: NaN,

        mouseIsDown: false,

        listen: function () {
            var activate = this.activate.bind(this);
            var deactivate = this.deactivate.bind(this);

            function contains(element, ancestor) {
                var descendants;
                var index;
                var descendant;

                if (!element) {
                    return;
                }

                if ('compareDocumentPosition' in ancestor) {
                    return !!(ancestor.compareDocumentPosition(element) & 16);
                } else if ('contains' in ancestor) {
                    return ancestor !== element && ancestor.contains(element);
                } else {
                    for ((descendants = ancestor.getElementsByTagName('*')), index = 0; (descendant = descendants[index++]) ;) {
                        if (descendant === element) {
                            return true;
                        }
                    }
                    return false;
                }
            }

            this.element.addEventListener('mouseover', function (e) {
                var target = e.relatedTarget;
                if (target !== this && !contains(target, this)) {
                    activate();
                }
            });

            this.element.addEventListener('mouseout', function (e) {
                var target = e.relatedTarget;
                if (target !== this && !contains(target, this)) {
                    deactivate(e);
                }
            });
        },

        activate: function () {
            if (this.active) {
                return;
            }
            this.element.addEventListener('mousedown', (this.touchStart = this.touchStart.bind(this)), true);
            this.element.addEventListener('mousemove', (this.touchMove = this.touchMove.bind(this)), true);
            this.element.addEventListener('mouseup', (this.touchEnd = this.touchEnd.bind(this)), true);
            this.element.addEventListener('click', (this.click = this.click.bind(this)), true);
            this.active = true;
        },

        deactivate: function (e) {
            this.active = false;
            if (this.mouseIsDown) {
                this.touchEnd(e);
            }
            this.element.removeEventListener('mousedown', this.touchStart, true);
            this.element.removeEventListener('mousemove', this.touchMove, true);
            this.element.removeEventListener('mouseup', this.touchEnd, true);
            this.element.removeEventListener('click', this.click, true);
        },

        click: function (e) {
            /*if (e.synthetic) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();*/
        },

        touchStart: function (e) {
            if (e.synthetic || /input|textarea/.test(e.target.tagName.toLowerCase())) {
                return;
            }

            this.mouseIsDown = true;

            e.preventDefault();
            e.stopPropagation();

            this.fireTouchEvents('touchstart', e);
        },

        touchMove: function (e) {
            if (e.synthetic) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            this.move(e.clientX, e.clientY);

            if (this.mouseIsDown) {
                this.fireTouchEvents('touchmove', e);
            }
        },

        touchEnd: function (e) {
            if (e.synthetic) {
                return;
            }

            this.mouseIsDown = false;

            e.preventDefault();
            e.stopPropagation();

            this.fireTouchEvents('touchend', e);

            if (!this.target) {
                return;
            }

            // Mobile Safari moves all the mouse events to fire after the touchend event.
            this.target.dispatchEvent(this.createMouseEvent('mouseover', e));
            this.target.dispatchEvent(this.createMouseEvent('mousemove', e));
            this.target.dispatchEvent(this.createMouseEvent('mousedown', e));
        },

        fireTouchEvents: function (eventName, originalEvent) {
            var events = [];
            var gestures = [];

            if (!this.target) {
                return;
            }

            // Convert 'ontouch*' properties and attributes to listeners.
            var onEventName = 'on' + eventName;

            if (onEventName in this.target) {
                console.warn('Converting `' + onEventName + '` property to event listener.', this.target);
                this.target.addEventListener(eventName, this.target[onEventName], false);
                delete this.target[onEventName];
            }

            if (this.target.hasAttribute(onEventName)) {
                console.warn('Converting `' + onEventName + '` attribute to event listener.', this.target);
                var handler = new GLOBAL.Function('event', this.target.getAttribute(onEventName));
                this.target.addEventListener(eventName, handler, false);
                this.target.removeAttribute(onEventName);
            }

            // Set up a new event with the coordinates of the finger.
            var touch = this.createMouseEvent(eventName, originalEvent);

            events.push(touch);

            // Figure out scale and rotation.
            if (events.length > 1) {
                var x = events[0].pageX - events[1].pageX;
                var y = events[0].pageY - events[1].pageY;

                var distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
                var angle = Math.atan2(x, y) * (180 / Math.PI);

                var gestureName = 'gesturechange';

                if (eventName === 'touchstart') {
                    gestureName = 'gesturestart';
                    this.startDistance = distance;
                    this.startAngle = angle;
                }

                if (eventName === 'touchend') {
                    gestureName = 'gestureend';
                }

                events.forEach(function (event) {
                    var gesture = this.createMouseEvent.call(event._finger, gestureName, event);
                    gestures.push(gesture);
                }.bind(this));

                events.concat(gestures).forEach(function (event) {
                    event.scale = distance / this.startDistance;
                    event.rotation = this.startAngle - angle;
                });
            }

            // Loop through the events array and fill in each touch array.
            events.forEach(function (touch) {
                touch.touches = events.filter(function (e) {
                    return ~e.type.indexOf('touch') && e.type !== 'touchend';
                });

                touch.changedTouches = events.filter(function (e) {
                    return ~e.type.indexOf('touch') && e._finger.target === touch._finger.target;
                });

                touch.targetTouches = touch.changedTouches.filter(function (e) {
                    return ~e.type.indexOf('touch') && e.type !== 'touchend';
                });
            });

            // Then fire the events.
            events.concat(gestures).forEach(function (event, i) {
                event.identifier = i;
                event._finger.target.dispatchEvent(event);
            });
        },

        createMouseEvent: function (eventName, originalEvent) {
            var e = new MouseEvent(eventName, {
                view: window,
                detail: originalEvent.detail,
                bubbles: true,
                cancelable: true,
                target: this.target || originalEvent.relatedTarget,
                clientX: this.x || originalEvent.clientX,
                clientY: this.y || originalEvent.clientY,
                screenX: this.x || originalEvent.screenX,
                screenY: this.y || originalEvent.screenY,
                ctrlKey: originalEvent.ctrlKey,
                shiftKey: originalEvent.shiftKey,
                altKey: originalEvent.altKey,
                metaKey: originalEvent.metaKey,
                button: originalEvent.button
            });

            e.synthetic = true;
            e._finger = this;

            return e;
        },

        move: function (x, y) {
            if (isNaN(x) || isNaN(y)) {
                this.target = null;
            } else {
                this.x = x;
                this.y = y;

                if (!this.mouseIsDown) {
                    this.target = document.elementFromPoint(x, y);
                }
            }
        }
    };

    window.FingerBlast = FingerBlast;

}());

/* ===================================================================================
 * RatchetPro: common.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * Originally from https://github.com/twbs/ratchet
 * ======================================= ============================================ */

!(function () {
    'use strict';

    // Compatible With CustomEvent
    if (!window.CustomEvent) {
        window.CustomEvent = function (type, config) {
            var e = document.createEvent('CustomEvent');
            e.initCustomEvent(type, config.bubbles, config.cancelable, config.detail);

            return e;
        };
    }

    // Create Ratchet namespace
    if (typeof window.RATCHET === 'undefined') {
        window.RATCHET = {};
    }

    if (typeof window.RATCHET.Class === 'undefined') {
        window.RATCHET.Class = {};
    }

    var loadedScripts = [];

    // Using JQuery to load external scripts. Need help to get rid of JQuery.
    window.RATCHET.getScript = function (source, successCallback, failCallback) {
        if (typeof window.jQuery === 'undefined') {
            console.log('JQuery not found. Cannot load and execute page scripts.');

            return;
        }

        if (loadedScripts.indexOf(source) >= 0) {
            // If the script has already been loaded, don't load it again, just call the success callback.
            if (successCallback !== undefined && successCallback !== null && typeof successCallback === 'function') {
                successCallback(null, null, null);
            }

            return;
        }

        // Check if the script already been loaded to the page dom.
        var scriptElements = document.getElementsByTagName('script');
        for (var i = 0; i < scriptElements.length; i++) {
            var scriptSource = scriptElements[i].getAttribute('src');
            if (scriptSource === source) {
                // The script has already been loaded to dom, don't load it again, store to the loadedScripts array and
                // call the success callback.
                loadedScripts.push(scriptSource);

                if (successCallback !== undefined && successCallback !== null && typeof successCallback === 'function') {
                    successCallback(null, null, null);
                }

                return;
            }
        }

        var getScriptOptions = {
            url: source,
            dataType: 'script'
        };

        jQuery.ajax(getScriptOptions).done(function (data, textStatus, jqXHR) {
            // Indicates the js has been loaded and executed.
            loadedScripts.push(source);

            if (successCallback !== undefined && successCallback !== null && typeof successCallback === 'function') {
                successCallback(data, textStatus, jqXHR);
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            if (failCallback !== undefined && successCallback !== null && typeof failCallback === 'function') {
                failCallback(jqXHR, textStatus, errorThrown);
            }
        });
    };

    // Original script from http://davidwalsh.name/vendor-prefix
    window.RATCHET.getBrowserCapabilities = (function () {
        var styles = window.getComputedStyle(document.documentElement, '');
        var pre = (Array.prototype.slice
            .call(styles)
            .join('')
            .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
          )[1];
        return {
            prefix: '-' + pre + '-',
            transform: pre[0].toUpperCase() + pre.substr(1) + 'Transform'
        };
    })();

    window.RATCHET.getTransitionEnd = (function () {
        var el = document.createElement('ratchet');
        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return transEndEventNames[name];
            }
        }

        return transEndEventNames.transition;
    })();
}());

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

                event.preventDefault(); // prevents rewriting url (apps can still use hash values in url)
            }
        }
    });
})();

/* ========================================================================
 * Ratchet: popovers.js v2.0.2
 * http://goratchet.com/components#popovers
 * ========================================================================
 * Copyright 2015 Connor Sears
 * Licensed under MIT (https://github.com/twbs/ratchet/blob/master/LICENSE)
 * ======================================================================== */

!(function () {
    'use strict';

    var popover;

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

    window.addEventListener('touchend', showHidePopover);

}());

/* ===================================================================================
 * RatchetPro: pusher.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * Originally from https://github.com/twbs/ratchet
 * =================================================================================== */

/* global _gaq: true */

(function () {
    'use strict';

    var isScrolling;
    var maxCacheLength = 20;
    var cacheMapping = sessionStorage;
    var domCache = {};
    var htmlCache = [];
    var pushId = undefined;

    var transitionMap = {
        'slide-in': 'slide-out',
        'slide-out': 'slide-in',
        fade: 'fade'
    };

    var bars = {
        bartab: '.bar-tab',
        barnav: '.bar-nav',
        barfooter: '.bar-footer',
        barheadersecondary: '.bar-header-secondary'
    };

    window.RATCHET.Class.Pusher = Class.extend({
        init: function () {
        }
    });

    window.RATCHET.Class.Pusher.push = function (options) {
        var key;

        options.container = options.container || options.transition ? document.querySelector('.content') : document.body;

        var isFileProtocol = /^file:/.test(window.location.protocol);

        for (key in bars) {
            if (bars.hasOwnProperty(key)) {
                options[key] = options[key] || document.querySelector(bars[key]);
            }
        }

        if (!pushId) {
            cacheReplace({
                id: +new Date(),
                url: window.location.href,
                title: document.title,
                timeout: options.timeout,
                transition: options.transition
            });
        }

        cacheCurrentContent();

        // Load from cache at first.
        var cachedHtml = htmlCache[options.url];
        if (cachedHtml !== undefined) {
            if (typeof window.jQuery !== 'undefined') {
                // If jQuery used, remove all jQuery event listeners of current page to prevent duplicate event listeners issue.
                jQuery(options.container).find('*').off();
            }

            renderData(cachedHtml, options);
            cachePush();

            return;
        }

        var xhr = new XMLHttpRequest();
        if (isFileProtocol) {
            xhr.open('GET', options.url, false);
        } else {
            xhr.open('GET', options.url, true);
            xhr.setRequestHeader('X-PUSH', 'true');

            xhr.onreadystatechange = function () {
                if (options._timeout) {
                    clearTimeout(options._timeout);
                }
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        success(xhr, options);
                    } else {
                        failure(options.url);
                    }
                }
            };
        }

        if (options.timeout) {
            options._timeout = setTimeout(function () { xhr.abort('timeout'); }, options.timeout);
        }

        xhr.send();

        if (isFileProtocol) {
            if (xhr.status === 0 || xhr.status === 200) {
                success(xhr, options);
            } else {
                failure(options.url);
            }
        }

        if (xhr.readyState && !options.ignorePush) {
            cachePush();
        }
    };

    // Pushstate caching
    // ==================

    var cacheReplace = function (data, updates) {
        pushId = data.id;
        if (updates) {
            data = getCached(data.id);
        }

        cacheMapping[data.id] = JSON.stringify(data);
        window.history.replaceState(data.id, data.title, data.url);
    };

    var cachePush = function () {
        var id = pushId;

        var cacheForwardStack = JSON.parse(cacheMapping.cacheForwardStack || '[]');
        var cacheBackStack = JSON.parse(cacheMapping.cacheBackStack || '[]');

        cacheBackStack.push(id);

        while (cacheForwardStack.length) {
            delete cacheMapping[cacheForwardStack.shift()];
        }
        while (cacheBackStack.length > maxCacheLength) {
            delete cacheMapping[cacheBackStack.shift()];
        }

        if (getCached(pushId).url) {
            window.history.pushState(null, '', getCached(pushId).url);
        }

        cacheMapping.cacheForwardStack = JSON.stringify(cacheForwardStack);
        cacheMapping.cacheBackStack = JSON.stringify(cacheBackStack);
    };

    var cachePop = function (id, direction) {
        var forward = direction === 'forward';
        var cacheForwardStack = JSON.parse(cacheMapping.cacheForwardStack || '[]');
        var cacheBackStack = JSON.parse(cacheMapping.cacheBackStack || '[]');
        var pushStack = forward ? cacheBackStack : cacheForwardStack;
        var popStack = forward ? cacheForwardStack : cacheBackStack;

        if (pushId) {
            pushStack.push(pushId);
        }
        popStack.pop();

        cacheMapping.cacheForwardStack = JSON.stringify(cacheForwardStack);
        cacheMapping.cacheBackStack = JSON.stringify(cacheBackStack);
    };

    var getCached = function (id) {
        return JSON.parse(cacheMapping[id] || null) || {};
    };

    var getTarget = function (e) {
        var target = findTarget(e.target);

        if (!target ||
            e.which > 1 ||
            e.metaKey ||
            e.ctrlKey ||
            isScrolling ||
            location.protocol !== target.protocol ||
            location.host !== target.host ||
            !target.hash && /#/.test(target.href) ||
            target.hash && target.href.replace(target.hash, '') === location.href.replace(location.hash, '') ||
            target.getAttribute('data-ignore') === 'push') { return; }

        return target;
    };

    // Main event handlers (touchend, popstate)
    // ==========================================

    var touchend = function (e) {
        var target = getTarget(e);

        if (!target) {
            return;
        }

        e.preventDefault();

        window.RATCHET.Class.Pusher.push({
            url: target.href,
            hash: target.hash,
            timeout: target.getAttribute('data-timeout'),
            transition: target.getAttribute('data-transition')
        });
    };

    var popstate = function (e) {
        var key;
        var barElement;
        var activeObj;
        var activeDom;
        var direction;
        var transition;
        var transitionFrom;
        var transitionFromObj;
        var id = e.state;

        if (!id || !cacheMapping[id]) {
            return;
        }

        direction = pushId < id ? 'forward' : 'back';

        cachePop(id, direction);

        activeObj = getCached(id);
        activeDom = domCache[id];

        if (activeObj.title) {
            document.title = activeObj.title;
        }

        if (direction === 'back') {
            transitionFrom = JSON.parse(direction === 'back' ? cacheMapping.cacheForwardStack : cacheMapping.cacheBackStack);
            transitionFromObj = getCached(transitionFrom[transitionFrom.length - 1]);
        } else {
            transitionFromObj = activeObj;
        }

        if (direction === 'back' && !transitionFromObj.id) {
            return (pushId = id);
        }

        transition = direction === 'back' ? transitionMap[transitionFromObj.transition] : transitionFromObj.transition;

        if (!activeDom) {
            return window.RATCHET.Class.Pusher.push({
                id: activeObj.id,
                url: activeObj.url,
                title: activeObj.title,
                timeout: activeObj.timeout,
                transition: transition,
                ignorePush: true
            });
        }

        if (transitionFromObj.transition) {
            activeObj = extendWithDom(activeObj, '.content', activeDom.cloneNode(true));
            for (key in bars) {
                if (bars.hasOwnProperty(key)) {
                    barElement = document.querySelector(bars[key]);
                    if (activeObj[key]) {
                        swapContent(activeObj[key], barElement);
                    } else if (barElement) {
                        barElement.parentNode.removeChild(barElement);
                    }
                }
            }
        }

        swapContent(
          (activeObj.contents || activeDom).cloneNode(true),
          document.querySelector('.content'),
          transition, function () {
              triggerStateChange();
          }
        );

        pushId = id;

        document.body.offsetHeight; // force reflow to prevent scroll
    };

    // Core PUSH functionality
    // =======================

    var cacheCurrentContent = function () {
        domCache[pushId] = document.body.cloneNode(true);
    };

    // Main XHR handlers
    // =================

    var success = function (xhr, options) {
        var data = parseXHR(xhr, options);

        if (typeof window.jQuery !== 'undefined') {
            // If jQuery used, remove all jQuery event listeners of current page to prevent duplicate event listeners issue.
            jQuery(options.container).find('*').off();
        }

        renderData(data, options);

        // Cache the loaded html data.
        htmlCache[options.url] = data;
    };

    var failure = function (url) {
        throw new Error('Could not get: ' + url);
    };


    // PUSH helpers
    // ============
    var renderData = function (data, options) {
        var key;
        var barElement;

        if (!data.contents) {
            return locationReplace(options.url);
        }

        if (data.title) {
            document.title = data.title;
        }

        if (options.transition) {
            for (key in bars) {
                if (bars.hasOwnProperty(key)) {
                    barElement = document.querySelector(bars[key]);
                    if (data[key]) {
                        swapContent(data[key], barElement);
                    } else if (barElement) {
                        barElement.parentNode.removeChild(barElement);
                    }
                }
            }
        }

        swapContent(data.contents, options.container, options.transition, function () {
            cacheReplace({
                id: options.id || +new Date(),
                url: data.url,
                title: data.title,
                timeout: options.timeout,
                transition: options.transition
            }, options.id);
            triggerStateChange();
        });

        if (!options.ignorePush && window._gaq) {
            _gaq.push(['_trackPageview']); // google analytics
        }

        if (!options.hash) {
            return;
        }
    };

    var swapContent = function (swap, container, transition, complete) {
        var enter;
        var containerDirection;
        var swapDirection;

        if (!transition) {
            if (container) {
                container.innerHTML = swap.innerHTML;
            } else if (swap.classList.contains('content')) {
                document.body.appendChild(swap);
            } else {
                document.body.insertBefore(swap, document.querySelector('.content'));
            }
        } else {
            enter = /in$/.test(transition);

            if (transition === 'fade') {
                container.classList.add('in');
                container.classList.add('fade');
                swap.classList.add('fade');
            }

            if (/slide/.test(transition)) {
                swap.classList.add('sliding-in', enter ? 'right' : 'left');
                swap.classList.add('sliding');
                container.classList.add('sliding');
            }

            container.parentNode.insertBefore(swap, container);
        }

        if (!transition) {
            if (complete) {
                complete();
            }
        }

        if (transition === 'fade') {
            container.offsetWidth; // force reflow
            container.classList.remove('in');
            var fadeContainerEnd = function () {
                container.removeEventListener(window.RATCHET.getTransitionEnd, fadeContainerEnd);
                swap.classList.add('in');
                swap.addEventListener(window.RATCHET.getTransitionEnd, fadeSwapEnd);
            };
            var fadeSwapEnd = function () {
                swap.removeEventListener(window.RATCHET.getTransitionEnd, fadeSwapEnd);
                container.parentNode.removeChild(container);
                swap.classList.remove('fade');
                swap.classList.remove('in');
                if (complete) {
                    complete();
                }
            };
            container.addEventListener(window.RATCHET.getTransitionEnd, fadeContainerEnd);

        }

        if (/slide/.test(transition)) {
            var slideEnd = function () {
                swap.removeEventListener(window.RATCHET.getTransitionEnd, slideEnd);
                swap.classList.remove('sliding', 'sliding-in');
                swap.classList.remove(swapDirection);
                container.parentNode.removeChild(container);
                if (complete) {
                    complete();
                }
            };

            container.offsetWidth; // force reflow
            swapDirection = enter ? 'right' : 'left';
            containerDirection = enter ? 'left' : 'right';
            container.classList.add(containerDirection);
            swap.classList.remove(swapDirection);
            swap.addEventListener(window.RATCHET.getTransitionEnd, slideEnd);
        }
    };

    var triggerStateChange = function () {
        var e = new CustomEvent('push', {
            detail: { state: getCached(pushId) },
            bubbles: true,
            cancelable: true
        });

        window.dispatchEvent(e);
    };

    var findTarget = function (target) {
        var i;
        var toggles = document.querySelectorAll('a');

        for (; target && target !== document; target = target.parentNode) {
            for (i = toggles.length; i--;) {
                if (toggles[i] === target) {
                    return target;
                }
            }
        }
    };

    var locationReplace = function (url) {
        window.history.replaceState(null, '', '#');
        window.location.replace(url);
    };

    var extendWithDom = function (obj, fragment, dom) {
        var i;
        var result = {};

        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                result[i] = obj[i];
            }
        }

        Object.keys(bars).forEach(function (key) {
            var el = dom.querySelector(bars[key]);
            if (el) {
                el.parentNode.removeChild(el);
            }
            result[key] = el;
        });

        result.contents = dom.querySelector(fragment);

        return result;
    };

    var parseXHR = function (xhr, options) {
        var head;
        var body;
        var data = {};
        var responseText = xhr.responseText;

        data.url = options.url;

        if (!responseText) {
            return data;
        }

        if (/<html/i.test(responseText)) {
            head = document.createElement('div');
            body = document.createElement('div');
            head.innerHTML = responseText.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0];
            body.innerHTML = responseText.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0];
        } else {
            head = body = document.createElement('div');
            head.innerHTML = responseText;
        }

        data.title = head.querySelector('title') || document.querySelector('title');
        var text = 'innerText' in data.title ? 'innerText' : 'textContent';
        data.title = data.title && data.title[text].trim();

        if (options.transition) {
            data = extendWithDom(data, '.content', body);
        } else {
            data.contents = body;
        }

        return data;
    };

    // Attach PUSH event handlers
    // ==========================

    window.addEventListener('touchstart', function () { isScrolling = false; });
    window.addEventListener('touchmove', function () { isScrolling = true; });
    window.addEventListener('touchend', touchend);
    window.addEventListener('click', function (e) {
        if (getTarget(e)) {
            e.preventDefault();
        }
    });
    window.addEventListener('popstate', popstate);
})();

/* ========================================================================
 * Ratchet: segmented-controllers.js v2.0.2
 * http://goratchet.com/components#segmentedControls
 * ========================================================================
 * Copyright 2015 Connor Sears
 * Licensed under MIT (https://github.com/twbs/ratchet/blob/master/LICENSE)
 * ======================================================================== */

!(function () {
    'use strict';

    var getTarget = function (target) {
        var i;
        var segmentedControls = document.querySelectorAll('.segmented-control .control-item');

        for (; target && target !== document; target = target.parentNode) {
            for (i = segmentedControls.length; i--;) {
                if (segmentedControls[i] === target) {
                    return target;
                }
            }
        }
    };

    window.addEventListener('touchend', function (e) {
        var activeTab;
        var activeBodies;
        var targetBody;
        var targetTab = getTarget(e.target);
        var className = 'active';
        var classSelector = '.' + className;

        if (!targetTab) {
            return;
        }

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
    });

    window.addEventListener('click', function (e) {
        if (getTarget(e.target)) {
            e.preventDefault();
        }
    });

}());

/* ========================================================================
 * Ratchet: sliders.js v2.0.2
 * http://goratchet.com/components#sliders
 * ========================================================================
   Adapted from Brad Birdsall's swipe
 * Copyright 2015 Connor Sears
 * Licensed under MIT (https://github.com/twbs/ratchet/blob/master/LICENSE)
 * ======================================================================== */

!(function () {
    'use strict';

    var pageX;
    var pageY;
    var slider;
    var deltaX;
    var deltaY;
    var offsetX;
    var lastSlide;
    var startTime;
    var resistance;
    var sliderWidth;
    var slideNumber;
    var isScrolling;
    var scrollableArea;
    var startedMoving;

    var transformPrefix = window.RATCHET.getBrowserCapabilities.prefix;
    var transformProperty = window.RATCHET.getBrowserCapabilities.transform;

    var getSlider = function (target) {
        var i;
        var sliders = document.querySelectorAll('.slider > .slide-group');

        for (; target && target !== document; target = target.parentNode) {
            for (i = sliders.length; i--;) {
                if (sliders[i] === target) {
                    return target;
                }
            }
        }
    };

    var getScroll = function () {
        var translate3d = slider.style[transformProperty].match(/translate3d\(([^,]*)/);
        var ret = translate3d ? translate3d[1] : 0;
        return parseInt(ret, 10);
    };

    var setSlideNumber = function (offset) {
        var round = offset ? (deltaX < 0 ? 'ceil' : 'floor') : 'round';
        slideNumber = Math[round](getScroll() / (scrollableArea / slider.children.length));
        slideNumber += offset;
        slideNumber = Math.min(slideNumber, 0);
        slideNumber = Math.max(-(slider.children.length - 1), slideNumber);
    };

    var onTouchStart = function (e) {
        slider = getSlider(e.target);

        if (!slider) {
            return;
        }

        var firstItem = slider.querySelector('.slide');

        scrollableArea = firstItem.offsetWidth * slider.children.length;
        isScrolling = undefined;
        sliderWidth = slider.offsetWidth;
        resistance = 1;
        lastSlide = -(slider.children.length - 1);
        startTime = +new Date();
        pageX = e.touches[0].pageX;
        pageY = e.touches[0].pageY;
        deltaX = 0;
        deltaY = 0;

        setSlideNumber(0);

        slider.style[transformPrefix + 'transition-duration'] = 0;
    };

    var onTouchMove = function (e) {
        if (e.touches.length > 1 || !slider) {
            return; // Exit if a pinch || no slider
        }

        // adjust the starting position if we just started to avoid jumpage
        if (!startedMoving) {
            pageX += (e.touches[0].pageX - pageX) - 1;
        }

        deltaX = e.touches[0].pageX - pageX;
        deltaY = e.touches[0].pageY - pageY;
        pageX = e.touches[0].pageX;
        pageY = e.touches[0].pageY;

        if (typeof isScrolling === 'undefined' && startedMoving) {
            isScrolling = Math.abs(deltaY) > Math.abs(deltaX);
        }

        if (isScrolling) {
            return;
        }

        offsetX = (deltaX / resistance) + getScroll();

        e.preventDefault();

        resistance = slideNumber === 0 && deltaX > 0 ? (pageX / sliderWidth) + 1.25 :
                     slideNumber === lastSlide && deltaX < 0 ? (Math.abs(pageX) / sliderWidth) + 1.25 : 1;

        slider.style[transformProperty] = 'translate3d(' + offsetX + 'px,0,0)';

        // started moving
        startedMoving = true;
    };

    var onTouchEnd = function (e) {
        if (!slider || isScrolling) {
            return;
        }

        // we're done moving
        startedMoving = false;

        setSlideNumber((+new Date()) - startTime < 1000 && Math.abs(deltaX) > 15 ? (deltaX < 0 ? -1 : 1) : 0);

        offsetX = slideNumber * sliderWidth;

        slider.style[transformPrefix + 'transition-duration'] = '.2s';
        slider.style[transformProperty] = 'translate3d(' + offsetX + 'px,0,0)';

        e = new CustomEvent('slide', {
            detail: { slideNumber: Math.abs(slideNumber) },
            bubbles: true,
            cancelable: true
        });

        slider.parentNode.dispatchEvent(e);
    };

    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

}());

/* ========================================================================
 * Ratchet: toggles.js v2.0.2
 * http://goratchet.com/components#toggles
 * ========================================================================
   Adapted from Brad Birdsall's swipe
 * Copyright 2015 Connor Sears
 * Licensed under MIT (https://github.com/twbs/ratchet/blob/master/LICENSE)
 * ======================================================================== */

!(function () {
    'use strict';

    var start = {};
    var touchMove = false;
    var distanceX = false;
    var toggle = false;
    var transformProperty = window.RATCHET.getBrowserCapabilities.transform;

    var findToggle = function (target) {
        var i;
        var toggles = document.querySelectorAll('.toggle');

        for (; target && target !== document; target = target.parentNode) {
            for (i = toggles.length; i--;) {
                if (toggles[i] === target) {
                    return target;
                }
            }
        }
    };

    window.addEventListener('touchstart', function (e) {
        e = e.originalEvent || e;

        toggle = findToggle(e.target);

        if (!toggle) {
            return;
        }

        var handle = toggle.querySelector('.toggle-handle');
        var toggleWidth = toggle.clientWidth;
        var handleWidth = handle.clientWidth;
        var offset = toggle.classList.contains('active') ? (toggleWidth - handleWidth) : 0;

        start = { pageX: e.touches[0].pageX - offset, pageY: e.touches[0].pageY };
        touchMove = false;
    });

    window.addEventListener('touchmove', function (e) {
        e = e.originalEvent || e;

        if (e.touches.length > 1) {
            return; // Exit if a pinch
        }

        if (!toggle) {
            return;
        }

        var handle = toggle.querySelector('.toggle-handle');
        var current = e.touches[0];
        var toggleWidth = toggle.clientWidth;
        var handleWidth = handle.clientWidth;
        var offset = toggleWidth - handleWidth;

        touchMove = true;
        distanceX = current.pageX - start.pageX;

        if (Math.abs(distanceX) < Math.abs(current.pageY - start.pageY)) {
            return;
        }

        e.preventDefault();

        if (distanceX < 0) {
            return (handle.style[transformProperty] = 'translate3d(0,0,0)');
        }
        if (distanceX > offset) {
            return (handle.style[transformProperty] = 'translate3d(' + offset + 'px,0,0)');
        }

        handle.style[transformProperty] = 'translate3d(' + distanceX + 'px,0,0)';

        toggle.classList[(distanceX > (toggleWidth / 2 - handleWidth / 2)) ? 'add' : 'remove']('active');
    });

    window.addEventListener('touchend', function (e) {
        if (!toggle) {
            return;
        }

        var handle = toggle.querySelector('.toggle-handle');
        var toggleWidth = toggle.clientWidth;
        var handleWidth = handle.clientWidth;
        var offset = (toggleWidth - handleWidth);
        var slideOn = (!touchMove && !toggle.classList.contains('active')) || (touchMove && (distanceX > (toggleWidth / 2 - handleWidth / 2)));

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

        touchMove = false;
        toggle = false;
    });

}());

/* ===================================================================================
 * RatchetPro: pageManager.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * Originally from https://github.com/twbs/ratchet
 * =================================================================================== */

(function () {
    'use strict';

    window.RATCHET.Class.PageManager = Class.extend({
        init: function () {
            var self = this;

            self.entryCallback = undefined;

            self.components = [];

            self.domContentLoadedCallback = function () {
                self.populateComponents();

                // Dom is ready, call entryCallback().
                if (typeof self.entryCallback === 'function') {
                    self.entryCallback();
                }
            };

            self.pageContentReadyCallback = function () {
                self.populateComponents();

                // Page changing end, page content is ready, call entryCallback();
                if (typeof self.entryCallback === 'function') {
                    self.entryCallback();
                }
            };
        },

        ready: function (callback) {
            var self = this;
            self.entryCallback = callback;

            document.removeEventListener('DOMContentLoaded', self.domContentLoadedCallback);
            document.addEventListener('DOMContentLoaded', self.domContentLoadedCallback);

            var settings = window.RATCHET.Class.PageManager.settings;

            // Bind page changing event handler.
            var pageName = getPageName();
            if (pageName !== undefined && pageName !== null && pageName.length > 0) {
                var pageContentReadyEventName = pageName + settings.pageContentReadyEventSuffix;
                document.removeEventListener(pageContentReadyEventName, self.pageContentReadyCallback);
                document.addEventListener(pageContentReadyEventName, self.pageContentReadyCallback);
            }
        },

        populateComponents: function () {
            var self = this;

            // Dispose existing components.
            for (var i = 0; i < self.components.length; i++) {
                var c = self.components[i];
                c.dispose();
            }

            self.components.length = 0;

            var componentToggles = document.querySelectorAll('a');
            var length = componentToggles.length;
            for (var i = 0; i < length; i++) {
                var toggle = componentToggles[i];
                if (toggle.hash === undefined || toggle.hash === null || toggle.hash.length <= 0) {
                    continue;
                }

                var component = document.querySelector(toggle.hash);
                if (component === undefined || component === null) {
                    continue;
                }

                if (component.classList.contains('modal')) {
                    // It's a modal.
                    var newModel = new window.RATCHET.Class.Modal(toggle, component);
                    self.components.push(newModel);
                }
            }
        },

        changePage: function (url, transition) {
            var options = {
                url: url
            };

            if (transition !== undefined && transition !== null) {
                options.transition = transition;
            }

            window.RATCHET.Class.Pusher.push(options);
        }
    });

    window.RATCHET.Class.PageManager.settings = {
        pageContentElementSelector: '.content',
        pageNameElementAttributeName: 'data-page',
        pageEntryScriptPath: 'scripts',
        pageEntryScriptPrefix: 'app-',
        pageContentReadyEventSuffix: 'ContentReady'
    };

    window.RATCHET.Class.PageManager.enableMouseSupport = function () {
        if (typeof window.FingerBlast !== 'undefined') {
            new window.FingerBlast('body');
        }
    };

    var getPageName = function () {
        var settings = window.RATCHET.Class.PageManager.settings;

        var pageContentElement = document.querySelector(settings.pageContentElementSelector);
        var pageName = pageContentElement.getAttribute(settings.pageNameElementAttributeName);

        return pageName;
    };

    var checkPage = function () {
        var settings = window.RATCHET.Class.PageManager.settings;

        var pageName = getPageName();
        if (pageName !== undefined && pageName !== null && pageName.length > 0) {
            // Load page entry script.
            var entryScriptPath = settings.pageEntryScriptPath + '/' + settings.pageEntryScriptPrefix + pageName + '.js';
            window.RATCHET.getScript(entryScriptPath, function () {
                // Fire page content ready event.
                var pageContentReadyEventName = pageName + settings.pageContentReadyEventSuffix;
                var pageContentReadyEvent = new CustomEvent(pageContentReadyEventName, {
                    detail: {},
                    bubbles: true,
                    cancelable: true
                });

                document.dispatchEvent(pageContentReadyEvent);
            }, function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
                console.log(errorThrown);
            });
        }
    };

    // Inject checkPage() after push event fired.
    window.removeEventListener('push', checkPage);
    window.addEventListener('push', checkPage);
})();

(function () {
})();