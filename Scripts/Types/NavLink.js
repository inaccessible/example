define(["ko"], function (ko) {

    function NavLink(searchVm) {
        var self = this;

        self.text = ko.computed(function () {
            if (searchVm.artist())
                return searchVm.artist().name;

            if (searchVm.user())
                return searchVm.user().name;

            return "Главная";
        });

        self.onClick = function () {
            if (searchVm.artist())
                searchVm.navigate("/artist?clean=true&id=" + searchVm.artist().id);
            else if (searchVm.user())
                searchVm.navigate("/user?clean=true&id=" + searchVm.user().id);
            else
                searchVm.navigate("/welcome");
        };
    }

    return NavLink;
})