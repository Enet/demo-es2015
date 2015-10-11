beat.registerService('ajax', function () {
    return options => {
        return new Promise((resolve, reject) => {
            options.success = resolve;
            options.error = reject;
            $.ajax(options);
        });
    };
});
