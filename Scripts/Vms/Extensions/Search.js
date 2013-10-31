define(["ko", "pubSub", "json", "Vms/Extensions/Routing", "Vms/Extensions/Tabs", "Types/LoadCommand", "Types/LoadManager"],
    function (ko, pubSub, JSON, RoutingExtension, TabsExtension, LoadCommand, LoadManager) {
        
        function SearchExtension(self, searchModes) {
            // Init
            RoutingExtension(self, self.vmId, self.sectionName);
            TabsExtension(self, "music");
            self.loadMgr = new LoadManager(self.processLoadRequest);

            // Data            
            self.query = ko.observable("");
            self.hasQuery = ko.computed(function () {
                return self.query() && $.trim(self.query()).length > 0;
            });
            
            if (searchModes) {
                self.searchMode = ko.observable("all");
                self.searchModes = ko.observableArray(searchModes);
            }

            self.items = ko.observableArray();
            self.totalCount = ko.observable();

            // Behaviour
            self.clearQuery = function () {
                self.query("");
            };

            self.doSearch = function () {
                var params = self.getLoadParams();
                var command = new LoadCommand(self.loadItems, params, "search");
                self.loadMgr.queueCommand(command);
            };

            self.doPageLoad = function (page) {
                var params = self.getLoadParams(page);
                var command = new LoadCommand(self.loadItems, params, "page");
                self.loadMgr.queueCommand(command);
            };
            
            // Search triggers
            pubSub.sub("search.changed", function (propName) {
                if (!self.isVisible()) return;
                if (self.query() && (propName == "orderType" || propName == "timeRange")) return;
                self.doSearch();
            });

            self.query.subscribe(function () {
                self.doSearch();
            });

            if (self.searchMode) {
                self.searchMode.subscribe(function() {
                    if (self.query()) self.doSearch();
                });
            }

            // clear on ESC
            self.onQueryKeyUp = function (data, event) {
                if (event.keyCode == 27) {
                    self.clearQuery();
                }
            };

            // Events                      
            pubSub.sub("scroll.moved", function (scrollState) {
                if (!self.isVisible()) return;

                if (self.onScroll) self.onScroll(scrollState);

                // check if we need to load next page
                if (scrollState.vPcnt == 1) {
                    var nextPage = self.getNextPageNmb();
                    var lastPage = parseInt(self.totalCount() / 30) + 1;
                    if (nextPage <= lastPage) {
                        self.doPageLoad(nextPage);
                        console.log("page #" + nextPage + " is requested");
                    }                    
                }
            });

            var lastLoadParams;
            self.onHide = function (isRehidden) {
                if (self.items().length > 0 && !isRehidden)
                    lastLoadParams = JSON.stringify(self.getLoadParams(1));
            };

            self.onShow = function (args) {
                pubSub.pub("scroll.reset");
                pubSub.pub("scroll.update");

                if (args && args.genreId) {
                    self.isVisible(false);  // to prevent search initiation
                    var genre = global.genreSelector.getGenre(args.genreId);
                    global.genreSelector.onGenreClick(genre);
                    self.isVisible(true);  // restore visibility                    
                }
                
                if (args && args.styleId) {
                    self.isVisible(false);  // to prevent search initiation
                    var style = global.genreSelector.getStyle(args.styleId);
                    global.genreSelector.onStyleClick(style);
                    self.isVisible(true);  // restore visibility
                }

                // if params are changed since last time then reload data
                //if (lastLoadParams != JSON.stringify(self.getLoadParams(1))) {
                    self.items.removeAll();
                    self.doPageLoad(1);                    
                //}
            };
        }

        return SearchExtension;
    })