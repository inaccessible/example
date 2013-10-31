define([/*"jquery", */"Libs/scroll/jquery.easing.1.3", "Libs/scroll/jquery.mousewheel"], function (/*$*/) {
    var darkGrey = "#B5C2D2";
    var lightGrey = "#CDD6E1";

    //RollBar constructor
    function RollBar(c, s) {
        this.container = c;
        this.settings = s;
        this.timer = 0;
        this.state = {}; //vPcnt, vPxl, vVisiblePxl, vVisiblePcnt, vTotalPxl 
        //hPcnt, hPxl, hVisiblePxl, hVisiblePcnt, hTotalPxl       

        this.touch = {}; //touch point
        this.pressed = 0; //1-vertical, 2-horizontal, 0-off
        this.vslider = $('<div/>', { 'class': 'rollbar-handle' });
        this.vpath = $('<div/>', { 'class': 'rollbar-path-vertical' });
        this.hslider = $('<div/>', { 'class': 'rollbar-handle' });
        this.hpath = $('<div/>', { 'class': 'rollbar-path-horizontal' });
        this.sliders = this.vslider.add(this.hslider);
        this.minThumbSizePcnt = this.settings.minThumbSize && this.settings.minThumbSize.indexOf("%") != -1 ? parseInt(this.settings.minThumbSize) : null;
        this.minThumbSizePxl = this.settings.minThumbSize && this.settings.minThumbSize.indexOf("px") != -1 ? parseInt(this.settings.minThumbSize) : null;

        //wrap content into "rollbar-content" div
        this.container
    	    .css({ 'overflow': 'hidden', 'position': 'relative' })
    	    .contents()
    	    .wrapAll('<div class="rollbar-content"></div>');

        this.content = this.container.children('.rollbar-content').
    	css({ 'top': 0, 'left': 0, 'position': 'relative', 'float': 'left' });

        //create scrollbars
        if (this.settings.scroll == 'horizontal') {
            this.container.prepend(this.hpath.append(this.hslider));
        } else if (this.settings.scroll == 'vertical') {
            this.container.prepend(this.vpath.append(this.vslider));
        } else {
            this.container.prepend(this.vpath.append(this.vslider), this.hpath.append(this.hslider));
        }

        //configure sliders and paths
        this.vpath.add(this.hpath).css({ 'z-index': this.settings.zIndex, 'display': 'none' }); // has to be called before sliders (otherwise '%' value will not be set properly)
        this.vslider.css({ 'height': '100%', /*'opacity': this.settings.sliderOpacity*/ backgroudColor: lightGrey });
        this.hslider.css({ 'width': '100%', /*'opacity': this.settings.sliderOpacity*/ backgroudColor: lightGrey });


        //configure slider mousehover effects
        if (this.settings.sliderOpacity) {
            this.sliders.hover(this.fixFn(function () {
                //this.sliders.stop().fadeTo(this.settings.sliderOpacityTime, 1);
                this.sliders.stop().animate({ backgroundColor: darkGrey }, { duration: this.settings.sliderOpacityTime });
            }), this.fixFn(function () {
                if (!this.pressed) {
                    //this.sliders.stop().fadeTo(this.settings.sliderOpacityTime, this.settings.sliderOpacity);
                    this.sliders.stop().animate({ backgroundColor: lightGrey }, { duration: this.settings.sliderOpacityTime });
                }
            }));
        }

        //init
        this.init();

        //set initial scrollbars size
        this.pathSize();

        //when all images are loaded run 'update' 
        this.bindEvent($(window), 'load', function () {
            setTimeout(this.fixFn(this.update), 10);
        });
    }


    //check if scrollbars are required (second time is called on window.load)
    RollBar.prototype.checkScroll = function () {
        var self = this;

        //show/hide vertical scrollbar
        this.vdiff = this.content.height() - this.container.height();
        if (this.vdiff > 0)
            this.vpath.fadeIn(this.settings.fadeTime);
        else {
            this.vpath.fadeOut(this.settings.fadeTime);
            if (parseInt(this.content.css("top")) != 0)
                this.content.animate({ top: 0 }, "slow", function () {
                    self.update();
                });
        }

        //show/hide horizontal scrollbar
        this.hdiff = this.content.width() - this.container.width();
        if (this.hdiff > 0)
            this.hpath.show(this.settings.fadeTime);
        else {
            this.hpath.hide(this.settings.fadeTime);
            if (parseInt(this.content.css("left")) != 0)
                self.content.animate({ left: 0 }, "slow", function () {
                    self.update();
                });
        }


        //!!! DO FOLLOWING CALCULATIONS ONLY AFTER elements are shown
        //update vertical thumb size
        this.state.vVisiblePxl = this.container.height();
        this.state.vTotalPxl = this.content.height();
        this.state.vVisiblePcnt = Math.round(this.state.vVisiblePxl / this.state.vTotalPxl * 100);
        if (this.minThumbSizePcnt)
            this.state.vVisiblePcnt = Math.max(this.state.vVisiblePcnt, this.minThumbSizePcnt);
        if (this.state.vVisiblePcnt > 0 && this.state.vVisiblePcnt <= 100)
            this.vslider.css('height', this.state.vVisiblePcnt + '%');

        //check if thumb size is not smaller than minThumbSizePxl
        if (this.minThumbSizePxl && this.vslider.height() < this.minThumbSizePxl)
            this.vslider.css('height', this.minThumbSizePxl);

        // update some utility values
        this.vtrack = this.vpath.height() - this.vslider.height();
        this.htrack = this.hpath.width() - this.hslider.width();
    };


    //need to be called after content is added (changes scroll visibility and moves thumb to a proper position)
    RollBar.prototype.update = function () {
        // make sure content's bottom is not higher than container's bottom
        // if it is higher, then correct it with animation and re-check on completion
        var self = this;
        var maxContentTop = Math.max(0, this.content.height() - this.container.height());
        if (parseInt(this.content.css("top")) * (-1) > maxContentTop) {
            this.content.animate({ top: -maxContentTop }, "slow", function () { self.update(); });
            return;
        }

        // check if scrolls need to be shown
        this.checkScroll();

        var isVScrollVisible = this.vdiff > 0;
        if (!isVScrollVisible) return;

        // find current thumb top
        var curTopPxl = parseInt(this.vslider.css("top"));

        // find proper thumb top               
        this.state.vPxl = parseInt(this.content.css('top')) * (-1);
        var properTopCnt = this.state.vPxl / (this.state.vTotalPxl - this.state.vVisiblePxl);
        var properTopPxl = Math.round(this.vtrack * properTopCnt);

        // update if needed
        if (properTopPxl >= 0 && properTopPxl <= this.vtrack && curTopPxl != properTopPxl)
            this.vslider.css("top", properTopPxl);
    };


    // moves fast to [0,0] (without easing)
    // need to be called when content is cleared or fully reloaded
    RollBar.prototype.reset = function () {
        this.container.find('.rollbar-content, .rollbar-handle').css({ top: 0, left: 0 });
    };

    // Moves thumbs to a specific document position
    // v and h are position in document and can be passed in Pixels (default) or in Percents
    // if v and h are less than 1 they are treated as percents
    // otherwise as document position in pixeles
    RollBar.prototype.move = function (v, h, isPcnt) {
        //translate position in document to slider offset 
        //required by easeScroll() function
        v = v || 0;
        h = h || 0;
        if (/^[-\d\.]+$/.test(v)) {
            v = parseFloat(v);
            if (Math.abs(v) <= 1 && isPcnt)
                v *= this.vtrack;
            else
                v = v + v * (this.vtrack / this.vdiff - 1);
        }

        if (/^[-\d\.]+$/.test(h)) {
            h = parseFloat(h);
            if (Math.abs(h) <= 1 && isPcnt)
                h *= this.htrack;
            else
                h = h + h * (this.htrack / this.hdiff - 1);
        }

        //scroll
        this.easeScroll(v, h);
    };


    //adjust path size and paddings
    RollBar.prototype.pathSize = function () {
        var pad = parseInt(this.settings.pathPadding, 10);
        this.vpath.css({ 'top': pad + 'px', 'height': this.container.height() - 2 * pad + 'px' });
        this.hpath.css({ 'left': pad + 'px', 'width': this.container.width() - 2 * pad + 'px' });
    };

    // main scroll method (v,h are absolute slider positions, e is event) 
    RollBar.prototype.scroll = function (v, h, e) {
        var hPcnt = 0; var vPcnt = 0;
        var hPxl = 0; var vPxl = 0;

        //******************
        // VERTICAL SCROLL *
        //******************
        // slider
        if (v < 0) { v = 0; }
        if (v > this.vtrack) { v = this.vtrack; }
        this.vslider.css('top', v + 'px');
        // content
        if (this.vdiff > 0) {
            vPcnt = v / this.vtrack;
            vPxl = Math.round(this.vdiff * vPcnt);

            this.content.animate({ 'top': -vPxl }, { duration: 400, easing: "swing", queue: false });

            //prevent defaults on mouse wheel 
            if (e && (v && v != this.vtrack)) {
                e.stopPropagation();
                e.preventDefault();
            }
        }

        //********************
        // HORIZONTAL SCROLL *
        //********************        
        //slider
        if (h < 0) { h = 0; }
        if (h > this.htrack) { h = this.htrack; }
        this.hslider.css('left', h + 'px');
        //content
        if (this.hdiff > 0) {
            hPcnt = h / this.htrack;
            hPxl = Math.round(this.hdiff * hPcnt);
            this.content.css('left', -hPxl);
            //prevent defaults on mouse wheel 
            if (e && (h && h != this.htrack)) {
                e.stopPropagation();
                e.preventDefault();
            }
        }

        //********************
        // onscroll callback * 
        //********************
        if (this.state.vPcnt != vPcnt || this.state.vPxl != vPxl || this.state.hPcnt != hPcnt || this.state.hPxl != hPxl) {
            this.state.vPcnt = vPcnt; this.state.vPxl = vPxl;
            this.state.hPcnt = hPcnt; this.state.hPxl = hPxl;
            if (typeof this.settings.onScroll == 'function') {
                this.settings.onScroll.call(this.container.get(0), this.state);
            }
        }
    };


    //adds easing to the scroll() method (v,h are offset from current slider position)
    RollBar.prototype.easeScroll = function (v, h) {
        //debugger;
        var n = 0;
        var steps = Math.floor(this.settings.scrollTime / this.settings.scrollInterval);
        var vs = this.vslider.position().top;
        var hs = this.hslider.position().left;
        var easing = $.easing[this.settings.scrollEasing] || $.easing.linear;
        this.sliders.stop().animate({ backgroundColor: darkGrey }, { duration: this.settings.sliderOpacityTime }); //this.sliders.stop().fadeTo(this.settings.sliderOpacityTime, 1);

        window.clearInterval(this.timer);
        //var start = (new Date).getTime();
        this.timer = window.setInterval(this.fixFn(function () {
            this.scroll(vs + easing(n / steps, n, 0, 1, steps) * v, hs + easing(n / steps, n, 0, 1, steps) * h);
            if (++n > steps) {
                //console.log('Time: '+((new Date).getTime()-start)+' / '+this.settings.scrollTime);
                window.clearInterval(this.timer);
                this.sliders.stop().animate({ backgroundColor: lightGrey }, { duration: this.settings.sliderOpacityTime }); //this.sliders.stop().fadeTo(this.settings.sliderOpacityTime, this.settings.sliderOpacity);
            }
        }), this.settings.scrollInterval);
    };


    //replaces 'this' keyword in function to the RollBar object
    RollBar.prototype.fixFn = function (f, s) {
        var scope = this;
        return function () {
            f.apply(s || scope, Array.prototype.slice.call(arguments));
        };
    };


    //wrapper for jQuery .bind() function using fixFn
    RollBar.prototype.bindEvent = function (t, e, f, s) {
        return t.bind(e, this.fixFn(f, s));
    };


    //init event listeners
    RollBar.prototype.init = function () {
        var document = $(window.document);
        //slider drag with mouse
        this.bindEvent(this.sliders, 'mousedown', function (e) {
            this.pressed = (e.target === this.vslider.get(0)) ? 1 : 2;
            var hclick = e.pageX;
            var vclick = e.pageY;
            var vtop = this.vslider.position().top;
            var hleft = this.hslider.position().left;
            this.bindEvent(document, 'mousemove', function (e) {
                if (this.pressed == 1) {
                    this.scroll(vtop + (e.pageY - vclick), hleft);
                } else {
                    this.scroll(vtop, hleft + (e.pageX - hclick));
                }
            });
            //prevent selection while moving slider
            this.bindEvent(document, 'selectstart', function (e) { e.preventDefault() });
        });


        this.bindEvent(document, 'mouseup', function (e) {
            //change opacity of slider only if we released mouse outside of it    		
            if (this.pressed == 1 && e.target !== this.vslider.get(0)) {
                this.vslider.stop().animate({ backgroundColor: lightGrey }, { duration: this.settings.sliderOpacityTime });//this.vslider.fadeTo(this.settings.sliderOpacityTime, this.settings.sliderOpacity);
            } else if (this.pressed == 2 && e.target !== this.hslider.get(0)) {
                this.hslider.stop().animate({ backgroundColor: lightGrey }, { duration: this.settings.sliderOpacityTime }); //this.hslider.fadeTo(this.settings.sliderOpacityTime, this.settings.sliderOpacity);
            }
            this.pressed = 0;
            document.unbind('mousemove');
            document.unbind('selectstart');
        });


        //Android & iOS touch events  	
        this.bindEvent(this.container, 'touchstart', function (e) {
            var event = e.originalEvent;
            var touch = event.changedTouches[0];
            this.touch.sx = touch.pageX;
            this.touch.sy = touch.pageY;
            this.touch.sv = this.vslider.position().top;
            this.touch.sh = this.hslider.position().left;
            this.sliders.stop().animate({ backgroundColor: darkGrey }, { duration: this.settings.sliderOpacityTime }); //this.sliders.stop().fadeTo(this.settings.sliderOpacityTime, 1);            
            if (this.settings.blockGlobalScroll && (this.vdiff || this.hdiff)) {
                event.stopPropagation();
            }
        });

        this.bindEvent(this.container, 'touchmove', function (e) {
            var event = e.originalEvent;
            var touch = event.targetTouches[0];
            this.scroll(this.touch.sv + (this.touch.sy - touch.pageY) * this.settings.touchSpeed,
    					this.touch.sh + (this.touch.sx - touch.pageX) * this.settings.touchSpeed, e);
            if (this.settings.blockGlobalScroll && (this.vdiff || this.hdiff)) {
                event.preventDefault();
                event.stopPropagation();
            }
        });

        this.bindEvent(this.container, 'touchend touchcancel', function (e) {
            var event = e.originalEvent;
            var touch = event.changedTouches[0];
            this.sliders.stop().animate({ backgroundColor: lightGrey }, { duration: this.settings.sliderOpacityTime }); //this.sliders.stop().fadeTo(this.settings.sliderOpacityTime, this.settings.sliderOpacity);
            if (this.settings.blockGlobalScroll && (this.vdiff || this.hdiff)) {
                event.stopPropagation();
            }
        });


        //slider position adjustments during window resize     	
        var vtrack = this.vpath.height(), htrack = this.hpath.width();
        this.bindEvent($(window), 'resize', function () {
            this.pathSize(); //adjust path size first
            this.checkScroll(); //calculate diffs    	   	

            if (this.vdiff <= 0) {
                this.content.css('top', 0);
            }

            if (this.hdiff <= 0) {
                this.content.css('left', 0);
            }

            this.scroll(Math.round(parseInt(this.vslider.css('top'), 10) * this.vpath.height() / vtrack),
    	   				Math.round(parseInt(this.hslider.css('left'), 10) * this.hpath.width() / htrack));

            vtrack = this.vpath.height();
            htrack = this.hpath.width();
        });

        //slider move on mousewheel
        this.bindEvent(this.container, 'mousewheel', function (e, delta, deltaX, deltaY) {
            if (this.content.height() <= this.container.height()) return;

            //********************
            // Move content      * 
            //********************
            var curTop = (-1) * parseInt(this.content.css("top"));
            var maxTop = this.content.height() - this.container.height();

            var stepSize = Math.round(this.container.height() * this.settings.wheelStep) * deltaY;
            var newTop = curTop - stepSize;

            if (newTop < 0) newTop = 0;
            else if (newTop > maxTop) newTop = maxTop;

            this.content.animate({ 'top': -newTop }, { duration: 400, easing: "swing", queue: false });


            //********************
            // Update thumb      * 
            //********************
            var properTopCnt = newTop / (this.state.vTotalPxl - this.state.vVisiblePxl);
            var properTopPxl = Math.round(this.vtrack * properTopCnt);

            var curTopPxl = parseInt(this.vslider.css("top"));
            if (properTopPxl >= 0 && properTopPxl <= this.vtrack && curTopPxl != properTopPxl)
                this.vslider.css("top", properTopPxl);


            //********************
            // onscroll callback * 
            //********************
            //if (this.state.vPcnt != vPcnt || this.state.vPxl != vPxl || this.state.hPcnt != hPcnt || this.state.hPxl != hPxl) {
            this.state.vPcnt = properTopPxl / this.vtrack;
            this.state.vPxl = newTop;

            //this.state.hPcnt = hPcnt;
            //this.state.hPxl = hPxl;
            if (typeof this.settings.onScroll == 'function') {
                this.settings.onScroll.call(this.container.get(0), this.state);
            }
            //}


            //this.scroll(this.vslider.position().top - this.settings.wheelSpeed * deltaY,
            //	   		this.hslider.position().left + this.settings.wheelSpeed * deltaX, e);
            this.sliders.stop().animate({ backgroundColor: darkGrey }, { duration: this.settings.sliderOpacityTime });  //this.sliders.stop().fadeTo(this.settings.sliderOpacityTime, 1);
            window.clearTimeout(this.timer);
            this.timer = window.setTimeout(this.fixFn(function () {
                this.sliders.stop().animate({ backgroundColor: lightGrey }, { duration: this.settings.sliderOpacityTime }); //this.sliders.stop().fadeTo(this.settings.sliderOpacityTime, this.settings.sliderOpacity);
            }), this.settings.sliderOpacityDelay);
            //always prevent global page scroll if we scroll within container
            if (this.settings.blockGlobalScroll && (this.vdiff || this.hdiff)) {
                e.preventDefault();
                e.stopPropagation();
            }
        });


        //keypress scroll with easing
        this.bindEvent(document, 'keydown', function (e) {
            var hkey = 0, vkey = 0;
            //38-key up, 40-key down, 39-key right, 37-key left 		
            vkey = (e.keyCode == 38) ? -this.settings.keyScroll : vkey;
            vkey = (e.keyCode == 40) ? this.settings.keyScroll : vkey;
            hkey = (e.keyCode == 37) ? -this.settings.keyScroll : hkey;
            hkey = (e.keyCode == 39) ? this.settings.keyScroll : hkey;
            if (vkey || hkey) {
                this.easeScroll(vkey, hkey);
            }
        });


        //block "drag" events in FireFox
        this.bindEvent(this.container, "dragstart", function (e) {
            e.preventDefault();
        });
    };

    //jquery plugin
    $.fn.rollbar = function (s) {
        //defaults
        var settings = {
            scroll: 'vertical',			// add 'vertical', 'horizontal' scrolling or 'both'
            fadeTime: 'fast',		    // time to show/hide scrollbars after 'update' method is called
            blockGlobalScroll: true,	// if false: global page scroll gets scroll event when rollbar reaches border position            
            minThumbSize: '10%',        // can be set in '%' or in 'px'
            sliderOpacity: 0.5,			// initial opacity for sliders
            sliderOpacityTime: 200,		// sliders mouse hover time in ms
            sliderOpacityDelay: 1000,	// delay before opacity change during mouse wheel
            wheelStep: 0.4,			// какую часть экрана прокрутить за один раз
            wheelSpeed: 25,				// content scroll speed on mouse wheel (0 to 100)
            touchSpeed: 0.3,			// Android/iOS speed multiplier
            pathPadding: '20px',		// scrollbar path padding 
            keyScroll: 100,				// amount of pixels to scroll when key is pressed
            scrollTime: 500,			// scroll time (keypress, touch, "rollbar" ) in ms
            scrollInterval: 40,			// scroll easing interval in ms (~fps)	
            scrollEasing: 'swing',		// any valid easing (default linear)
            zIndex: 100,				// scrollbars css z-index stacking number            
            onScroll: null 		        // onscroll callback function (vscroll,hscroll) - this = DOM            
        };

        //extend defaults with external settings
        $.extend(settings, s);

        return new RollBar(this, settings);



    }; //end plugin
});

