define(["ko"], function(ko) {
    function LoadManager() {
        var self = this;

        // Data
        self.command = ko.observable();

        self.isSearching = ko.computed(function () {
            return self.command() && self.command().type == "search" && self.command().isAlive();
        });

        self.isLoadingPage = ko.computed(function () {
            return self.command() && self.command().type == "page" && self.command().isAlive();
        });

        // Behavior
        self.queueCommand = function (cmd) {
            switch (cmd.type) {
                case "search":
                    // save current command state since we need it after we override it with "canceled"
                    var state = self.command() && self.command().state();

                    // Have any command?
                    // New search request has higher priority over page loading and privious search
                    if (self.command()) self.command().cancel();

                    // set current command
                    self.command(cmd);

                    // schedule search
                    if (state == "scheduled") return;
                    setTimeout(function () { self.command().execute(self); }, global.searchDelay);
                    self.command().state("scheduled");
                    break;
                case "page":
                    // disregard any page reqeuest when we have pending search request            
                    if (self.command() && self.command().isAlive()) return;

                    self.command(cmd);
                    cmd.execute(self);
                    break;
            }
        };
    }

    return LoadManager;
})