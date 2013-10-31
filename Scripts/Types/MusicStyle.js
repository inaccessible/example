define(["ko"], function (ko) {
    function MusicStyle(data, genre, searchParams) {
        var self = this;

        // Data
        self.id = data.id;
        self.name = data.name;
        self.genre = genre;

        self.isVisible = ko.computed(function () {
            return searchParams.genreId() == self.genre.id;
        });

        self.isActive = ko.computed(function () {
            return searchParams.styleId() == self.id;
        });

        // Behavior
        self.onClick = function (style) {
            searchParams.genreSelector.onStyleClick(style);
        };


    }

    return MusicStyle;
})