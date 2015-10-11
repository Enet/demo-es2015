'use strict';

beat.registerElement('b-todo-list', {
    add: function (text, completed) {
        if (!text) throw 'Text for new item is not defined!';
        let id = Math.random() + Date.now(),
            event = new $.Event('todoadd');

        completed = !!completed;
        this.dom.append(`<b-todo-item id="${id}" ${completed ? 'completed' : ''}>${text}</b-todo-item>`);

        event.id = id;
        event.completed = completed;
        event.text = text;
        this.dom.trigger(event);

        return this.update();
    },

    remove: function (item) {
        let $item = $(item),
            event = new $.Event('todoremove');

        $item.remove();
        event.id = $item.attr('id');
        this.dom.trigger(event);

        return this.update();
    },

    update: function () {
        let $items = this.dom.find('b-todo-item'),
            $completed = $items.filter('[completed]');
        this.setAttribute('completed', $completed.length);
        this.setAttribute('remained', $items.length - $completed.length);
        $items.forEach(item => {
            item.setAttribute('hidden', item.matches(this._selector) ? null : '');
        });
        return this;
    },

    filter: function (selector) {
        this._selector = selector || '*';
        this.update();
    },

    _selector: '*',

    _onSetAttribute: {
        'bem': {
            'created': function () {
                // browser initializes b-todo-item later than executes this code :(
                setImmediate(this.update.bind(this));
            },

            'attached': function () {
                this._assignEvents();
            },

            'detached': function () {
                this._unassignEvents();
            }
        },

        'remained': {
            '*': function (attrName, newVal) {
                this.shadow.children('b-todo-list__counter').html(newVal);
            }
        }
    },

    _assignEvents: function () {
        this.shadow.children('a').on('click', this._onButtonClick.bind(this));
        this.shadow.children('b-tabulator').on('tabchange', this._onTabChange.bind(this));
        this.dom
            .on('itemremove', 'b-todo-item', this._onItemRemove.bind(this))
            .on('itemchange', 'b-todo-item', this._onItemChange.bind(this));
        return this;
    },

    _unassignEvents: function () {
        this.shadow.children('a').off();
        this.shadow.children('b-tabulator').off();
        this.dom.off();
        return this;
    },

    _onItemRemove: function (event) {
        this.remove(event.item);
    },

    _onItemChange: function (e) {
        let event = new $.Event('todochange');
        event.id = e.currentTarget.getAttribute('id');
        event.completed = e.completed;
        this.dom.trigger(event);
        this.update();
    },

    _onButtonClick: function (event) {
        this.dom.find('b-todo-item[completed]').forEach(this.remove, this);
    },

    _onTabChange: function (event) {
        let filters = {
                all: undefined,
                remained: ':not([completed])',
                completed: '[completed]'
            };
        this.filter(filters[event.id]);
    }
});
