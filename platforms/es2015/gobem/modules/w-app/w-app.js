'use strict';

let resourcesLoadingId = 0,
    pageLoadingId = 0;

beat.registerElement('w-app', {
    navigate: function (url) {
        pageLoadingId++;
        return ajax({
            url: url,
            data: {wrapper: this.tagName},
            dataType: 'json'
        })
            .then(this._onPageLoadingSuccess.bind(this, pageLoadingId))
            .catch(this._onPageLoadingError.bind(this, pageLoadingId));
    },

    signIn: function (data) {
        // zepto.js doesn't return promise, when ajax is called, therefore here is used predefined service
        ajax({
            url: '/api/user/signin',
            type: 'post',
            dataType: 'json',
            data: data,
        })
            .then(this._onSigningInSuccess.bind(this))
            .catch(this._onSigningInError.bind(this));
    },

    signOut: function () {
        ajax({
            url: '/api/user/signout',
            type: 'post',
            dataType: 'json'
        })
            .then(this._onSigningOutSuccess.bind(this))
            .catch(this._onSigningOutError.bind(this));
    },

    _onSetAttribute: {
        'bem': {
            'created': function () {
                this
                    ._findControls()
                    ._updateMenu();
            },

            'attached': function () {
                window.app = this;
                this._assignEvents();
            },

            'detached': function () {
                this._unassignEvents();
            }
        },

        'auth': {
            '*': function (attrName, newVal) {
                this.controls.$menu.call('setAttribute', 'auth', newVal ? 'yes' : 'no');
            }
        }
    },

    _findControls: function () {
        this.controls = {
            $menu: this.shadow.children('s-menu')
        };
        return this;
    },

    _updateMenu: function () {
        this.controls.$menu.get(0).select(location.pathname);
        return this;
    },

    _assignEvents: function () {
        document.addEventListener('click', this._onDocumentClick.bind(this));
        window.addEventListener('popstate', this._onWindowPopState.bind(this));
        this.controls.$menu.on('itemclick', this._onMenuItemClick.bind(this));
        return this;
    },

    _unassignEvents: function () {
        document.removeAllEventListeners('click');
        window.removeAllEventListeners('popstate');
        this.controls.$menu.off();
        return this;
    },

    _onWindowPopState: function (event) {
        this.navigate(location.pathname);
    },

    _onDocumentClick: function (event) {
        for (let element of event.path) {
            if (element.tagName &&
                element.tagName.toLowerCase() === 'a' &&
                !element.hasAttribute('target', '_blank') &&
                !~element.getAttribute('href').indexOf('//')) {
                event.anchorTarget = element;
                return this._onLinkClick(event);
            }
        }
    },

    _onLinkClick: function (event) {
        event.preventDefault();
        app.navigate(event.anchorTarget.getAttribute('href'));
    },

    _onPageLoadingError: function (lastPageLoadingId, error) {
        if (lastPageLoadingId !== pageLoadingId) return;
        blablabla('Error occured due trying to load page!');
    },

    _onPageLoadingSuccess: function (lastPageLoadingId, data) {
        if (lastPageLoadingId !== pageLoadingId) return;

        let promises = [],
            elements = [],
            extensions = ['css', 'html', 'js'];

        for (let p in data.page) {
            for (let extension of extensions) {
                let items = data.page[p][extension];
                items && items.forEach(item => {
                    let path = `/output/${item}`;
                    if (!document.head.querySelector(`[href="${path}"]:not([loaded])`)) {
                        let element = document.createElement('link');
                        element.setAttribute('rel', extension === 'css' ? 'stylesheet' : 'import');
                        element.setAttribute('href', path);
                        element.setAttribute('defer', 'defer');
                        promises.push(new Promise((resolve, reject) => {
                            element.onerror = reject;
                            element.onload = resolve;
                        }));
                        elements.push(element);
                        document.head.appendChild(element);
                    }
                });
            }
        }

        let lastResourcesLoadingId = ++resourcesLoadingId,
            $elements = $(elements);
        Promise.all(promises)
            .then(values => {
                if (lastResourcesLoadingId === resourcesLoadingId) {
                    $elements.attr('loaded', 'loaded');
                    this.innerHTML = data.content;
                    history.pushState(data.client, data.title, data.url);
                    this._onPageUpdate();
                } else {
                    $elements.remove();
                }
            })
            .catch(error => {
                if (lastResourcesLoadingId === resourcesLoadingId) {
                    blablabla('Error occured due trying to load resources!');
                } else {
                    $elements.remove();
                }
            });
    },

    _onPageUpdate: function () {
        this._updateMenu();
        this.setAttribute('auth', history.state.auth.login || '');
    },

    _onSigningInSuccess: function () {
        this.navigate(location.pathname);
    },

    _onSigningInError: function () {
        blablabla('Authentication is failed :(');
    },

    _onSigningOutSuccess: function () {
        this.navigate(location.pathname);
    },

    _onSigningOutError: function () {
        blablabla('Error occured :(');
    },

    _onMenuItemClick: function (event) {
        if (event.url) {
            this.navigate(event.url);
        } else {
            this.signOut();
        }
    }
});
