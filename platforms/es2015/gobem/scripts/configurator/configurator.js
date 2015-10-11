(function (init) {
    history.replaceState(init.client, init.title, init.url);
    beat.getTemplateFor = init.getTemplateFor;
    delete window.init;
})(window.init);
