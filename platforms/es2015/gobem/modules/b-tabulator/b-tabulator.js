'use strict';

beat.registerElement('b-tabulator', {
    _beforeSetAttribute: {
        'active': {
            '*': function (attrName, newVal) {
                let tab = this.getElem(`tab[id="${newVal}"]`).get(0);
                if (!tab) return false;
            }
        }
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

        'active': {
            '*': function (attrName, newVal) {
                let tab = this.getElem(`tab[id="${newVal}"]`).get(0),
                    event = new $.Event('tabchange');

                this.getElems('tab[active]').call('removeAttribute', 'active');
                tab.setAttribute('active', '');

                event.id = newVal;
                this.dom.trigger(event);
            }
        }
    },

    _assignEvents: function () {
        this.dom.on('click', 'b-tabulator__tab[id]', this._onTabClick.bind(this));
    },

    _unassignEvents: function () {
        this.dom.off();
        return this;
    },

    _onTabClick: function (event) {
        this.setAttribute('active', event.currentTarget.getAttribute('id'));
    }
});
