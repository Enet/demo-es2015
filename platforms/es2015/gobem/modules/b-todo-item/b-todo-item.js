'use strict';

beat.registerElement('b-todo-item', {
    _onSetAttribute: {
        'bem': {
            'created': function () {
                this._findControls();
            },

            'attached': function () {
                this._assignEvents();
            },

            'detached': function () {
                this._unassignEvents();
            }
        },

        'completed': {
            '*': function (attrName, newVal) {
                this.controls.$input.get(0).checked = typeof newVal === 'string';
            }
        }
    },

    _findControls: function () {
        this.controls = {
            $input: this.shadow.children('input'),
            $button: this.shadow.children('div')
        };
        return this;
    },

    _assignEvents: function () {
        this.controls.$input.on('change', this._onInputChange.bind(this));
        this.controls.$button.on('click', this._onButtonClick.bind(this));
    },

    _unassignEvents: function () {
        this.controls.$input.off();
        this.controls.$button.off();
    },

    _onInputChange: function (e) {
        this.setAttribute('completed', e.currentTarget.checked ? '' : null);
        let event = new $.Event('itemchange');
        event.item = this;
        event.completed = e.currentTarget.checked;
        this.dom.trigger(event);
    },

    _onButtonClick: function (e) {
        let event = new $.Event('itemremove');
        event.item = this;
        this.dom.trigger(event);
    }
});
