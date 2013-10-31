define(["ko", "Vms/Extensions/Routing", "dialog"], function (ko, RoutingExtension, dialog) {

    function newsVm() {
        var self = this;

        self.isPlayerVisible = true;
        self.about = function () {
            dialog.open({
                type: 'help'
            });

            $('.aboutTab').trigger('click');
        };


        self.goToArtists = function () {
            global.router.navigate("/search/artists");
        };

        self.goToUsers = function () {
            global.router.navigate("/search/users");
        };

        RoutingExtension(self, "news");

    };

    return new newsVm();
})
