define(["ko", "pubSub", "Vms/Extensions/Search", "Vms/Extensions/Tabs", "Types/FancyDropItem", "Modules/dal"],
    function (ko, pubSub, SearchExtention, TabsExtension, FancyDropItem, dal) {

        function SearchPersonsVm(searchVm, mode) {
            var self = this,
                lastPage = 0;

            // DATA
            self.isPlayerVisible = true;
            self.vmId = mode + "s";
            self.sectionName = "Люди";
            self.searchResultSuffix = mode == "artist" ? "испольнителей" : "слушателей";
            SearchExtention(self);
            TabsExtension(self, "people");


            // BEHAVIOR
            self.searchByStyle = function (style) {
                if (searchVm.styleId() != style.id)
                    self.navigate("/search/artists?styleId=" + style.id);
            };

            self.loadItems = function (cmd) {
                dal.search(mode, {
                    cancellationToken: cmd.cancellationToken,
                    params: cmd.params,
                    onSuccess: function (items, totalCount) {
                        cmd.state("success");

                        if (cmd.type == "search" || cmd.type == "page" && self.items().length == 0) {
                            lastPage = 0;
                            self.items.removeAll();
                            pubSub.pub("scroll.reset");
                        }

                        self.totalCount(totalCount);
                        $.each(items, function () { self.items.push(this); });

                        lastPage++;
                        pubSub.pub("scroll.update");
                    },
                    onFail: function (error) {
                        cmd.state("fail");
                        console.error(error);
                    }
                });
            };

            self.getLoadParams = function (page) {
                var params = searchVm.getParams();
                params.query = $.trim(self.query());
                params.page = page || 1;

                return { // convert to elixir formar
                    query: encodeURIComponent(params.query),
                    genre: params.genreId,
                    style: params.styleId,
                    hq: params.isHighQuality ? 1 : 0,
                    order: params.orderType,
                    timerange: params.timeRange,
                    page: params.page
                };;
            };

            self.getNextPageNmb = function () {
                return lastPage + 1;
            };
        }

        return SearchPersonsVm;
    })