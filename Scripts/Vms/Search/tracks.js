define(["ko", "pubSub", "Vms/Extensions/Search", "Vms/Extensions/Tabs", "Types/FancyDropItem", "Modules/dal"],
    function (ko, pubSub, SearchExtention, TabsExtension, FancyDropItem, dal) {

        var searchModes = [
               new FancyDropItem("all", "по всему"),
               new FancyDropItem("artist_name", "по исполнителю"),
               new FancyDropItem("track_name", "по треку")
        ];


        function SearchTracksVm(searchVm) {
            var self = this, i,
                loadedPageItems = []; // ex: value 48 at 2nd index means that page1 + page2 + page3 together have 48 items

            self.vmId = "tracks";
            self.sectionName = "Музыка";
            SearchExtention(self, searchModes);
            TabsExtension(self, "music");

            // DATA
            self.isPlayerVisible = true;
            self.pageNmb = ko.observable();

            // BEHAVIOR
            self.loadItems = function (cmd) {
                dal.searchTracks({
                    cancellationToken: cmd.cancellationToken,
                    params: cmd.params,
                    onSuccess: function (items, totalCount) {
                        cmd.state("success");

                        if (cmd.type == "search" || cmd.type == "page" && self.items().length == 0) {
                            loadedPageItems = [];
                            self.pageNmb(1);
                            self.items.removeAll();
                            pubSub.pub("scroll.reset");
                        }

                        self.totalCount(totalCount);
                        $.each(items, function () { self.items.push(this); });

                        // update page info (!!! only after items are added)
                        var lastLoadedItemAmount = loadedPageItems.length == 0 ? 0 : loadedPageItems[loadedPageItems.length - 1];
                        loadedPageItems.push(lastLoadedItemAmount + items.length);
                        pubSub.pub("scroll.update");
                    },
                    onFail: function (error) {
                        cmd.state("fail");
                        // show warning dialog
                        console.error(error);
                    }
                });
            };

            self.getLoadParams = function (page) {
                var params = searchVm.getParams();
                params.query = $.trim(self.query());
                params.searchMode = self.searchMode();
                params.page = page || 1;

                return { // convert to elixir formar
                    query: encodeURIComponent(params.query),
                    by: params.searchMode,
                    genre: params.genreId,
                    style: params.styleId,
                    hq: params.isHighQuality ? 1 : 0,
                    order: params.orderType,
                    timerange: params.timeRange,
                    artist: params.artist,
                    user: params.user,
                    page: params.page
                };;
            };

            self.getNextPageNmb = function () {
                return loadedPageItems.length + 1;
            };
            
            self.addPageToPlayer = function () {
                var curPageIndex = self.pageNmb() - 1;
                var prevPageIndex = curPageIndex - 1;
                var indexOfFirstTrack = prevPageIndex < 0 ? 0 : loadedPageItems[prevPageIndex];
                var indexOfLastTrack = loadedPageItems[curPageIndex] - 1;

                var tracksOnPage = [];
                for (i = indexOfFirstTrack; i <= indexOfLastTrack; i++) {
                    tracksOnPage.push(self.items()[i]);
                }
                pubSub.pub("player.addToStart", tracksOnPage);
            };
            
            // on scroll refresh page number 
            self.onScroll = function (scrollState) {
                var indexOfMiddleItem = (scrollState.vPxl + scrollState.vVisiblePxl / 2 - global.tracks.topSpaceBeforeFirstItem) / global.tracks.itemHeight;
                var pageNmb = null;
                if (loadedPageItems.length == 0) {
                    pageNmb = 0;
                } else {
                    for (i = 0; i < loadedPageItems.length; i++) {
                        if (indexOfMiddleItem < loadedPageItems[i]) {
                            pageNmb = i + 1;
                            break;
                        }
                    }
                }

                if (pageNmb == null) throw "Check the logic: pageNmb should be always resolved";
                self.pageNmb(pageNmb);
            };            
        }

        return SearchTracksVm;
    })