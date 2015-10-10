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
        (function (original) {
            interfaces[i].prototype.addEventListener = function (type, listener, useCapture) {

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
        pageContentElementSelector: '.content',
        omitBars: false // Whether update bars (usually header/footer) during page switching.
    };

    window.RATCHET.Class.Pusher.push = function (options) {
        var key;

        // To unify the behavior of transition, set 'none' as the default transition effect.
        if (options.transition === undefined || options.transition === null) {
            options.transition = 'none';
        }

        options.container = options.container || options.transition ? document.querySelector(window.RATCHET.Class.Pusher.settings.pageContentElementSelector) : document.body;

        var isFileProtocol = /^file:/.test(window.location.protocol);

        if (!window.RATCHET.Class.Pusher.settings.omitBars) {
            for (key in bars) {
                if (bars.hasOwnProperty(key)) {
                    options[key] = options[key] || document.querySelector(bars[key]);
                }
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

            if (!window.RATCHET.Class.Pusher.settings.omitBars) {
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
            if (!window.RATCHET.Class.Pusher.settings.omitBars) {
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

        if (!window.RATCHET.Class.Pusher.settings.omitBars) {
            Object.keys(bars).forEach(function (key) {
                var el = dom.querySelector(bars[key]);
                if (el) {
                    el.parentNode.removeChild(el);
                }
                result[key] = el;
            });
        }

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
