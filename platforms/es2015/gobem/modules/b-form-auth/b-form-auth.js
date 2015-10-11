'use strict';

beat.registerElement('b-form-auth', {
    _onSetAttribute: {
        'bem': {
            'attached': function (attrName, newVal, prevVal) {
                this
                    ._findControls()
                    ._assignEvents();
            },

            'detached': function (attrName, newVal, prevVal) {
                this._unassignEvents();
            }
        }
    },

    _findControls: function () {
        let $form = this.shadow.children('form');
        this.controls = {
            $form: $form,
            $login: $form.children('input[name="login"]'),
            $password: $form.children('input[name="password"]')
        };
        return this;
    },

    _assignEvents: function () {
        // zepto.js can't find into the shadow dom still
        this.controls.$form.on('submit', this._onSubmit.bind(this));
    },

    _unassignEvents: function () {
        this.controls.$form.off();
    },

    _getFormData: function () {
        return {
            login: this.controls.$login.val(),
            password: this.controls.$password.val()
        };
    },

    _onSubmit: function (event) {
        event.preventDefault();
        app.signIn(this._getFormData());
    }
});
