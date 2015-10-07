# RatchetPro

A lightweight mobile framework. Re-wrote from ratchetjs (https://github.com/twbs/ratchet). 
RatchetPro helps you to seperate app logic to multiple pages with single simple entry point (just like what you did in native android/iOS app development) to avoid BIG html/js files.

###How to use

####Reference the ratchetPro css and js in your html:
```html
<link rel="stylesheet" href="dist/css/ratchetPro.min.css" />
<script src="dist/js/ratchetPro.min.js"></script>
```

####Setup page:
RatchetPro will load page script according to page name set in data-page attribute. For example, in the html, you got:
```html
<body>
    <div class="content" data-page="index">
    Put page content here.
    </div>
    <script src="scripts/app-index.js"></script>
</body>
```
Note "content" class is required to indicate this div a "page". We have a "index" value in data-page attribute, and we refer scripts/app-index.js as our page script. Page script file name must be consist of {pageEntryScriptPath}/{pageEntryScriptPrefix}/{pageName}.js. {pageEntryScriptPath} and {pageEntryScriptPrefix} can be changed:
```javascript
// Default value: 'scripts'
window.RATCHET.Class.PageManager.settings.pageEntryScriptPath = 'scripts'

// Default value: 'app-'
window.RATCHET.Class.PageManager.settings.pageEntryScriptPrefix = 'app-' 
```

Next, in the scripts/app-index.js , we have following standard setup script:
```javascript
(function () {
    // Change the settings here if you want.
    //window.RATCHET.Class.PageManager.settings.pageEntryScriptPath = 'scripts'
    //window.RATCHET.Class.PageManager.settings.pageEntryScriptPrefix = 'app-' 

    var rachetPageManager = new window.RATCHET.Class.PageManager();
    rachetPageManager.ready(function () {
      // Put your code here.
    });
})();
```
That's it. Just repeat aforementioned steps for each page. Don't worry about performance, RatchetPro will cache html/js for each page once loaded.

####Build-in components:
RatchetPro didn't change any CSS part of RatchetJs as so far. Please check css components at http://goratchet.com/components

## License

RatchetPro is licensed under the [MIT License](http://opensource.org/licenses/MIT).
