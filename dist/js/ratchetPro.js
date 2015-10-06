/*!
 * =============================================================
 * RatchetPro v1.0.0 (https://github.com/mazong1123/ratchet-pro)
 * Copyright 2015 mazong1123
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 *
 * v1.0.0 designed by @mazong1123.
 * forked from https://github.com/twbs/ratchet by Connor Sears
 * =============================================================
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
 * Originally from https://github.com/twbs/ratchet by Connor Sears
 * ==================================================================================== */

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

    // Shrim Date.now()
    if (!Date.now) {
        Date.now = function () {
            return new Date().getTime();
        }
    }

    var loadedScripts = [];

    // Load external scripts.
    window.RATCHET.getScript = function (source, successCallback, failCallback) {
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

        // Add timestamp to prevent ajax cache.
        var url = source + '?_=' + Date.now();

        var xhr = new XMLHttpRequest();
        xhr.responseType = 'text';
        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var scriptText = xhr.responseText;

                    // Execute the scripts.
                    globalEval(scriptText);

                    // Indicates the js has been loaded and executed.
                    loadedScripts.push(source);

                    if (typeof successCallback === 'function') {
                        successCallback();
                    }
                }
                else {
                    if (typeof failCallback === 'function') {
                        failCallback(xhr, xhr.statusText);
                    }
                }
            }
        };

        xhr.send();
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

    // From jQuery 2.1.4
    var globalEval = function (code) {
        var script;
        var indirect = eval;

        code = compatibleTrim(code);

        if (code) {
            // If the code includes a valid, prologue position
            // strict mode pragma, execute code by injecting a
            // script tag into the document.
            if (code.indexOf("use strict") === 1) {
                script = document.createElement("script");
                script.text = code;
                document.head.appendChild(script).parentNode.removeChild(script);
            } else {
                // Otherwise, avoid the DOM node creation, insertion
                // and removal by using an indirect global eval
                indirect(code);
            }
        }
    };

    // From jQuery 2.1.4 (original name: trim). Support Android < 4.1
    var compatibleTrim = function (text) {
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        return text == null ? "" : (text + "").replace(rtrim, "");
    };
}());

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
/* ===================================================================================
 * RatchetPro: modal.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * Originally from https://github.com/twbs/ratchet by Connor Sears
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

/* ===================================================================================
 * RatchetPro: popover.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * Originally from https://github.com/twbs/ratchet by Connor Sears
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

/* ===================================================================================
 * RatchetPro: pusher.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * Originally from https://github.com/twbs/ratchet by Connor Sears
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

    var eventDataList = [];

    // Override the addEventListener to store listener references.
    var interfaces = [HTMLAnchorElement,
        HTMLDivElement,
        HTMLImageElement,
        HTMLButtonElement,
        HTMLInputElement,
        HTMLFormElement,
        HTMLLabelElement];
    for (var i = 0; i < interfaces.length; i++) {
        (function(original) {
            interfaces[i].prototype.addEventListener = function(type, listener, useCapture) {

                // Store event data.
                var newEventData = {
                    element: this,
                    type: type,
                    listener: listener
                };

                eventDataList.push(newEventData);

                return original.apply(this, arguments);
            }
        })(interfaces[i].prototype.addEventListener);
    }

    window.RATCHET.Class.Pusher = Class.extend({
        init: function () {
        }
    });

    window.RATCHET.Class.Pusher.settings = {
        pageContentElementSelector: '.content'
    };

    window.RATCHET.Class.Pusher.push = function (options) {
        var key;

        // To unify the behavior of transition, set 'none' as the default transition effect.
        if (options.transition === undefined || options.transition === null) {
            options.transition = 'none';
        }

        options.container = options.container || options.transition ? document.querySelector(window.RATCHET.Class.Pusher.settings.pageContentElementSelector) : document.body;

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
            // Remove all event listeners to prevent duplicate event listeners issue.
            clearEventListeners();

            if (typeof window.jQuery !== 'undefined') {
                // If jQuery used, remove all jQuery event listeners of current page to prevent duplicate event listeners issue.
                jQuery(options.container).find('*').off();
            }

            // Deep clone page data to prevent messing up the cached data.
            var newPageData = deepClonePageData(cachedHtml);

            renderData(newPageData, options);
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

    var clearEventListeners = function () {
        var eventDataListLength = eventDataList.length;
        for (var i = 0; i < eventDataListLength; i++) {
            var ed = eventDataList[i];
            ed.element.removeEventListener(ed.type, ed.listener);
        }

        eventDataList.length = 0;
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
            activeObj = extendWithDom(activeObj, window.RATCHET.Class.Pusher.settings.pageContentElementSelector, activeDom.cloneNode(true));
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
          document.querySelector(window.RATCHET.Class.Pusher.settings.pageContentElementSelector),
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

        // Remove all event listeners to prevent duplicate event listeners issue.
        clearEventListeners();

        if (typeof window.jQuery !== 'undefined') {
            // If jQuery used, remove all jQuery event listeners of current page to prevent duplicate event listeners issue.
            jQuery(options.container).find('*').off();
        }

        var pageData = deepClonePageData(data);

        // Cache the loaded html data.
        htmlCache[options.url] = pageData;

        renderData(data, options);
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
                document.body.insertBefore(swap, document.querySelector(window.RATCHET.Class.Pusher.settings.pageContentElementSelector));
            }
        } else {
            enter = /in$/.test(transition);

            if (transition === 'fade') {
                container.classList.add('in');
                container.classList.add('fade');
                swap.classList.add('fade');
            }
            else if (/slide/.test(transition)) {
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
        else if (/slide/.test(transition)) {
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
        else if (transition === 'none') {
            container.parentNode.removeChild(container);
            if (complete) {
                complete();
            }
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

        data = extendWithDom(data, window.RATCHET.Class.Pusher.settings.pageContentElementSelector, body);

        /*if (options.transition) {
            data = extendWithDom(data, window.RATCHET.Class.Pusher.settings.pageContentElementSelector, body);
        } else {
            data.contents = body;
        }*/

        return data;
    };

    var deepClonePageData = function (data) {
        var newPageData = {};
        newPageData.barfooter = data.barfooter == null ? null : data.barfooter.cloneNode(true);
        newPageData.barheadersecondary = data.barheadersecondary == null ? null : data.barheadersecondary.cloneNode(true);
        newPageData.barnav = data.barnav == null ? null : data.barnav.cloneNode(true);
        newPageData.bartab = data.bartab == null ? null : data.bartab.cloneNode(true);
        newPageData.contents = data.contents == null ? null : data.contents.cloneNode(true);
        newPageData.title = data.title;
        newPageData.url = data.url;

        return newPageData;
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

/* ===================================================================================
 * RatchetPro: pageManager.js v1.0.0
 * https://github.com/mazong1123/ratchet-pro
 * ===================================================================================
 * Copyright 2015 Jim Ma
 * Licensed under MIT (https://github.com/mazong1123/ratchet-pro/blob/master/LICENSE)
 * Originally from https://github.com/twbs/ratchet by Connor Sears
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

            // Find anchor related components. E.G: modal, popover.
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

                var newComponent = null;
                if (component.classList.contains('modal')) {
                    // It's a modal.
                    newComponent = new window.RATCHET.Class.Modal(toggle, component);
                }
                else if (component.classList.contains('popover')) {
                    // It's a popover.
                    newComponent = new window.RATCHET.Class.Popover(toggle, component);
                }

                if (newComponent !== null) {
                    self.components.push(newComponent);
                }
            }

            // Segemented controls.
            var segmentedControls = document.querySelectorAll('.segmented-control');
            var segmentedControlLength = segmentedControls.length;
            for (var i = 0; i < segmentedControlLength; i++) {
                var sc = segmentedControls[i];
                var newSegmentedControlComponent = new window.RATCHET.Class.SegmentedControl(null, sc);

                self.components.push(newSegmentedControlComponent);
            }

            // Toggle controls.
            var toggleControls = document.querySelectorAll('.toggle');
            var toggleControlLength = toggleControls.length;
            for (var i = 0; i < toggleControlLength; i++) {
                var tc = toggleControls[i];
                var newToggleControlComponent = new window.RATCHET.Class.Toggle(null, tc);

                self.components.push(newToggleControlComponent);
            }

            // Slider controls.
            var sliderControls = document.querySelectorAll('.slider');
            var sliderControlLength = sliderControls.length;
            for (var i = 0; i < sliderControlLength; i++) {
                var sliderControl = sliderControls[i];
                var newSliderControlComponent = new window.RATCHET.Class.Slider(null, sliderControl);

                self.components.push(newSliderControlComponent);
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
            }, function (xhr, statusText) {
                console.log(statusText);
            });
        }
    };

    // Inject checkPage() after push event fired.
    window.removeEventListener('push', checkPage);
    window.addEventListener('push', checkPage);
})();

(function () {
})();