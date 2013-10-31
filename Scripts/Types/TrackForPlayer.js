define(["ko", "pubSub", "Types/GenreSelector"], function (ko, pubSub, GenreSelector) {
    function TrackForPlayer(track) {
        var self = this,
            i;               
               
        // Data               
        var props = ["id", "url", "title", "artists", "duration", "time", "genres", "styles"];
        $.copyProps(self, track, props);
        
        self.data = track;
        self.likes = ko.observable(track.stats.likes);
               
        self.isCurrent = ko.computed(function () {            
            return self == window.player.track();
        });

        // behavior
        self.onDeleteClick = function (deletedTrack) {
            pubSub.pub("trackForPlayer.onDeleteClick", deletedTrack);
        };

        self.onTrackClick = function(clickedTrack) {
            pubSub.pub("trackForPlayer.onClick", clickedTrack);
        };        
    }

    return TrackForPlayer;
})