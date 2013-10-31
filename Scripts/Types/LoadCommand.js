define(["ko"], function (ko) {
    function LoadCommand(executeLogic, params, type) {
        var self = this;

        // data contract
        if (!executeLogic) throw "executeLogic is a mandatory parameter";
        if (!params) throw "params is a mandatory parameter";
        if (type != "search" && type != "page") throw "type value can only be 'search' or 'page'";

        // input
        self.params = params;
        self.executeLogic = executeLogic;
        self.type = type;
        self.cancellationToken = { isCanceled: false };

        // output
        self.state = ko.observable("idle");
        self.data = null;

        // methods
        self.execute = function () {
            self.state("working");
            executeLogic(self);
        };

        self.cancel = function () {
            self.state("canceled");
            self.cancellationToken.isCanceled = true;
        };

        self.isAlive = function () {
            return self.state() == "scheduled" || self.state() == "working";
        };
    }

    return LoadCommand;
})