define([], function() {
    function Route(sRoute) {
        var self = this,
            isAbsolute = sRoute.indexOf("/") == 0,
            parsed = {};

        if (isAbsolute) sRoute = sRoute.substring(1);

        self.isAbsolute = function () {
            return isAbsolute;
        };

        self.vm = function () {
            return (typeof parsed.vm == "undefined")
                ? parsed.vm = getLeftPart(sRoute)
                : parsed.vm;
        };

        self.vm = function () {
            return (typeof parsed.vm == "undefined")
                ? parsed.vm = getLeftPart(sRoute)
                : parsed.vm;
        };

        self.subVm = function () {
            return (typeof parsed.subVm == "undefined")
                ? parsed.subVm = getLeftPart(self.subRoute())
                : parsed.subVm;
        };

        self.params = function () {
            return (typeof parsed.params == "undefined")
                ? parsed.params = getParams(sRoute)
                : parsed.params;
        };

        self.subRoute = function () {
            return (typeof parsed.subRoute == "undefined")
                ? parsed.subRoute = getRightPart(sRoute)
                : parsed.subRoute;
        };

        self.toRelative = function () {
            return "root/" + sRoute;
        };

        function getLeftPart(str) {
            if (!str) return "";
            var index = str.indexOf("/");
            if (index == -1) index = str.indexOf("?");
            return index == -1 ? str : str.substring(0, index);
        }

        function getRightPart(str) {
            if (!str) return "";
            var index = str.indexOf("/");
            return index == -1 ? "" : str.substring(index + 1);
        }

        function getParams(str) {
            if (str.indexOf("/") != -1 || str.indexOf("?") == -1)
                return null;

            var params = {};
            var sParams = str.substring(str.indexOf("?") + 1);
            var pairs = sParams.split("&");
            for (var i = 0; i < pairs.length; i++) {
                var parts = pairs[i].split("=");
                var argName = parts[0];
                var argValue = decodeURIComponent(parts[1].replace(/\+/g, " "));
                params[argName] = argValue;
            }

            return params;
        }
    }

    return Route;
})