'use strict';

beat.registerElement('s-menu', {
    select: function (url) {
        this.getElems('item[selected]').call('removeAttribute', 'selected');
        this.getElems('item[href="' + url + '"]').call('setAttribute', 'selected', '');
    },

    _onSetAttribute: {
        'bem': {
            'attached': function () {
                this._assignEvents();
            },

            'detached': function () {
                this._unassignEvents();
            }
        },

        'auth': {
            '*': function (attrName, newVal) {
                this.getElems('item')
                    .call('removeAttribute', 'disabled')
                    .filter(newVal ? `[disable-when-auth=${newVal}]` : `*`)
                    .call('setAttribute', 'disabled', '');
            }
        }
    },

    _assignEvents: function () {
        this.dom.on('click', 's-menu__item', this._onItemClick.bind(this));
    },

    _unassignEvents: function () {
        this.dom.off();
    },

    _onItemClick: function (e) {
        if (e.currentTarget.hasAttribute('disabled')) return;

        let event = new $.Event('itemclick');
        event.id = e.currentTarget.getAttribute('id');
        event.url = e.currentTarget.getAttribute('href');
        this.dom.trigger(event);
    }
});
