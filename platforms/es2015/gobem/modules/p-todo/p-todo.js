'use strict';

beat.registerElement('p-todo', {
    _onSetAttribute: {
        'bem': {
            'attached': function () {
                this
                    ._findControls()
                    ._assignEvents();
            },

            'detached': function () {
                this._unassignEvents();
            }
        }
    },

    _findControls: function () {
        this.controls = {
            $input: $(this.shadow.get(0).querySelector('input')),
            $button: $(this.shadow.get(0).querySelector('button')),
            $todo: this.dom.children('b-todo-list')
        };
        return this;
    },

    _assignEvents: function () {
        this.controls.$button.on('click', this._onButtonClick.bind(this));
        this.controls.$todo
            .on('todoadd', this._onAddTodoItem.bind(this))
            .on('todoremove', this._onRemoveTodoItem.bind(this))
            .on('todochange', this._onChangeTodoItem.bind(this));
        return this;
    },

    _unassignEvents: function () {
        this.controls.$button.off('click');
        this.controls.$todo.off();
        return this;
    },

    _onButtonClick: function () {
        let text = this.controls.$input.val();
        if (!text) return;

        this.controls.$todo.get(0).add(text);
        this.controls.$input.val('');
    },

    _onAddTodoItem: function (event) {
        ajax({
            url: '/api/item/add',
            type: 'post',
            data: {
                id: event.id,
                completed: +event.completed,
                text: event.text
            }
        });
    },

    _onRemoveTodoItem: function (event) {
        ajax({
            url: '/api/item/remove',
            type: 'post',
            data: {
                id: event.id
            }
        });
    },

    _onChangeTodoItem: function (event) {
        ajax({
            url: '/api/item/change',
            type: 'post',
            data: {
                id: event.id,
                completed: +event.completed
            }
        });
    }
});
