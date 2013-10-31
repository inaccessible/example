define(["ko", "Types/Route"], function (ko, Route) {
    function RoutingExtension(self, name, friendlyName) {
        // Data
        self.name = name;
        self.friendlyName = friendlyName || name;
        self.vms = [];
        self.isVisible = ko.observable();
        self.activeSubVm = ko.observable();
        
        // behavior
        self.addVm = function (vm) {
            self[vm.name] = vm;
            self.vms.push(vm);
        };

        self.navigate = function (sRoute) {
            var route = new Route(sRoute);

            if (route.isAbsolute()) {
                require("Vms/root").navigate(route.toRelative());
                return;
            }

            // show VM (if navigate is invoked and route is not absolute then VM is visible)
            self.show(route.params());

            // if we are at the end of the route, then refresh player visibility
            if (!route.subRoute()) $("#playerContent").toggle(self.isPlayerVisible == true);
            
            // hide inactive subVm
            $.each(self.vms, function (index, subVm) {
                if (route.subVm() != subVm.name) subVm.hide();
            });
            
            // continue routing
            if (route.subRoute()) {
                var activeSubVm = self[route.subVm()];
                if (!activeSubVm) throw "SubView '" + route.subVm() + "' is not added to view '" + self.name + "'";
                self.activeSubVm(activeSubVm);
                activeSubVm.navigate(route.subRoute());
            } 
        };

        // hide vm and all its decendents
        self.hide = function () {
            $.each(self.vms, function () { this.hide(); });

            var isRehidden = !self.isVisible();
            self.isVisible(false);

            if (self.onHide)
                self.onHide(isRehidden);
        };

        self.show = function (params) {
            var isReshown = self.isVisible();
            self.isVisible(true);

            if (self.onShow)
                self.onShow(params, isReshown);
        };
    };    

    return RoutingExtension;
})