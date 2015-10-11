# demo-es2015

## Summary
This project is just an experiment (don't use the code in production). My goal was to research the opportunities of ECMAScript 2015 and Web Components. So there are some restrictions and details, which you need keep in mind:
+ You can't use javascript inside bem-elements. It means that bem-elements could be used only to combine some nodes inside one tag. You even can't delegate events under the shadow DOM.
+ You can't override some methods in modifiers (modifiers are attributes only). You can't inherit bem-blocks from each other. You can't use mixins.
+ You can't make some bem-block as a bem-element of another bem-block.
+ You can't tunnel <content /> tag, because you can't traverse DOM inside one.
+ You need to define stylesheets inside each shadow DOM or use /deep/ selector everywhere.
+ Libraries still work poorly with new API, it means you can't find elements or delegate events inside the shadow DOM (using zepto.js).
+ Debugging shadow DOM using console is a hell!
+ The order of node's initialization is strange.
+ Sometimes garbage collector removes DOM earler than you stop to use it. Thankfully there is a new class WeakSet.

## How to install
```sh
git clone git@github.com:Enet/demo-es2015.git
cd demo-es2015
sudo sh deploy.sh
node index.js
```
Make sure that you already have generated SSL certificate (read /etc/nginx/nginx-demo-es2015).

## How it works
### [platformer](https://github.com/Enet/demo-es2015)
This is a root application, which watches the root directory for changes. When the platform (the separate application) is detected, platformer try to require index file. If it ends with success, platformer starts to delegate requests to the platform. The name of the platform should be contained into a header <platform>. All events are logged.

Platformer allows several independent applications to be working at the same time and reload server-side files after changes without reloading Node.js.

### [es2015](https://github.com/Enet/demo-es2015)
es2015 is a full-featured demonstrative web-application, which processes requests (coming from platformer) and builds project files (using gobem npm-module). It links each other different modules, stores templates and handlers, try to shape response and handle errors.

This platform shows how to use all modules together to build working and flexible web-application.

### [gobem](https://github.com/Enet/gobem)
This module is a builder for BEM projects. It has a lot of options and does the following:
+ scans a root folder to find files describing dependencies;
+ resolves dependencies and forms the list of modules;
+ forms the list of files for each entry point and loads ones;
+ processes files and writes them to the disk.

Read the documentation or sources to know what options are available and how gobem does processing.

### gobem-proc-*
As it was said above, gobem uses processors to process project files. Some of them (used in this project) are described below:

**[gobem-proc-concat](https://github.com/Enet/gobem-proc-concat)** - is a processor to concatenate several files into one. It has one option - the name of the result file.

**[gobem-proc-filter](https://github.com/Enet/gobem-proc-filter)** - is a processor to filter all unexisting or empty files. It has no options.

**[gobem-proc-stylus](https://github.com/Enet/gobem-proc-stylus)** - is a processor to compile Stylus to CSS. It has one option - the path to the file common.styl, which be included in the beginning of each processing file.

**[gobem-proc-sqwish](https://github.com/Enet/gobem-proc-sqwish)** - is a processor to minify CSS files. It has no options.

**[gobem-proc-prettydiff](https://github.com/Enet/gobem-proc-prettydiff)** - is a processor to minify both CSS and JavaScript files. It has one interesting feature: you can add the line `/* prevent prettydiff */` in any place of a file to prevent the processing by prettydiff.

**gobem-proc-jst** - is a processor to make template-functions from *.jst files and store ones, using method `app.setTemplate(fn)`. It requires application object, passed as a first extra argument.

**gobem-proc-set-handler** - is a processor to require handlers and store ones, using method `app.setHandler(fn)`. It requires application object, passed as a first extra argument.

**gobem-proc-wrap-script** - is a processor, which renames *.js to *.js.html and wraps content into the script tag. It allows to import scripts in the same way as templates. Processor has no options.

**gobem-proc-serve** - is a processor to wrap content into the function. It allows to use services, defined in *.deps.json, in the body of scripts. There are no options.

**gobem-proc-component** - is a processor, making a web-component from several files. It has no options.

### [reqponse](https://github.com/Enet/reqponse)
This module provides the class to combine request and response objects into a single entity - reqponse. On the one hand it parses request and makes access to form data, url components, cookie and headers really easy. On the other hand reqponse contains some methods to make the most often actions with response.

One thing you need know before start using reqponse is that get methods are related to request, set to response.

### [alasym](https://github.com/Enet/alasym)
What is the strange name for npm module? It is a tool for routing a la symfony (PHP framework)! :) Alasym is able to parse your config.yml and match route for URL.

This module is not a copy of symfony routing, just has a similar syntax. It supports methods, parameters (including regular expressions for ones), default values and one option - is current route case sensitive or not.

### [justjst](https://github.com/Enet/justjst)
The easiest template engine to compile javascript templates. The module returns template-function, which could be executed any moment and returns string.

Are there some options? No. All you can use is constructions like `<? echo('9 + 16 = 25') ?>` and `<?= 2 * 2 === 4 ?>`.

### [reddiz](https://github.com/Enet/reddiz)
No one serious web-application can not do without sessions. As you may be already guessed, reddiz provides API to store sessions using redis database. There are only two easy methods: get and set. To process user request properly you need firstly read session, then probably change it and finally save changes.

### [beat](https://github.com/Enet/beat)
Web components give us a lot of new features: custom elements, templates, HTML imports and shadow DOM. But how to map ones over BEM architecture? I tried to make it and created this library.

beat.js uses attributes instead modifiers and provides easy API to register new DOM-elements (blocks) and services. Templates and shadow DOM are used to encapsulate the internal structure of blocks and elements.
