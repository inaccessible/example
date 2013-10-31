define(["ko", "Types/MusicStyle"], function (ko, MusicStyle) {
    function Genre(data, searchParams) {
        var self = this,
            i;

        // Data               
        self.id = data.id;
        self.name = data.name;
        
        self.styles = [];
        var styles = $.getNamedArray(data, "styles");
        $.each(styles, function() {
            var style = new MusicStyle(this, self, searchParams);
            self.styles.push(style);
        });
        
        // Props
        self.isVisible = ko.computed(function () {
            return self.id == 0 || self.id == searchParams.genreId() || searchParams.genreId() == 0;
        });
        self.isSelected = ko.computed(function () {
            return self.id == searchParams.genreId();
        });
        self.isActive = ko.computed(function () {
            return searchParams.styleId() == 0 && self.isSelected();
        });

        // Behavior
        self.onClick = function (genre) {
            searchParams.genreSelector.onGenreClick(genre);
        };        
    }

    return Genre;
})