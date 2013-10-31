define(function () {
    (function ($) {
        function getElementSelection(that) {
            var position = {}; if (that.selectionStart === undefined) { that.focus(); var select = document.selection.createRange(); position.length = select.text.length; select.moveStart('character', -that.value.length); position.end = select.text.length; position.start = position.end - position.length; } else { position.start = that.selectionStart; position.end = that.selectionEnd; position.length = position.end - position.start; }
            return position;
        }
        function setElementSelection(that, start, end) { if (that.selectionStart === undefined) { that.focus(); var r = that.createTextRange(); r.collapse(true); r.moveEnd('character', end); r.moveStart('character', start); r.select(); } else { that.selectionStart = start; that.selectionEnd = end; } }
        function runCallbacks($this, io) { $.each(io, function (k, val) { if (typeof (val) === 'function') { io[k] = val($this, io, k); } else if (typeof (val) === 'string') { var kind = val.substr(0, 4); if (kind === 'fun:') { var fun = $.autoNumeric[val.substr(4)]; if (typeof (fun) === 'function') { io[k] = $.autoNumeric[val.substr(4)]($this, io, k); } else { io[k] = null; } } else if (kind === 'css:') { io[k] = $(val.substr(4)).val(); } } }); }
        function convertKeyToNumber(io, key) { if (typeof (io[key]) === 'string') { io[key] *= 1; } }
        function autoCode($this, options) {
            var io = $.extend({}, $.fn.autoNumeric.defaults, options); if ($.metadata) { io = $.extend(io, $this.metadata()); }
            runCallbacks($this, io); var vmax = io.vMax.toString().split('.'); var vmin = (!io.vMin && io.vMin !== 0) ? [] : io.vMin.toString().split('.'); convertKeyToNumber(io, 'vMax'); convertKeyToNumber(io, 'vMin'); convertKeyToNumber(io, 'mDec'); io.aNeg = io.vMin < 0 ? '-' : ''; if (typeof (io.mDec) !== 'number') { io.mDec = Math.max((vmax[1] ? vmax[1] : '').length, (vmin[1] ? vmin[1] : '').length); }
            if (io.altDec === null && io.mDec > 0) { if (io.aDec === '.' && io.aSep !== ',') { io.altDec = ','; } else if (io.aDec === ',' && io.aSep !== '.') { io.altDec = '.'; } }
            var aNegReg = io.aNeg ? '([-\\' + io.aNeg + ']?)' : '(-?)'; io._aNegReg = aNegReg; io._skipFirst = new RegExp(aNegReg + '[^-' + (io.aNeg ? '\\' + io.aNeg : '') + '\\' + io.aDec + '\\d]' + '.*?(\\d|\\' + io.aDec + '\\d)'); io._skipLast = new RegExp('(\\d\\' + io.aDec + '?)[^\\' + io.aDec + '\\d]\\D*$'); var allowed = (io.aNeg ? io.aNeg : '-') + io.aNum + '\\' + io.aDec; if (io.altDec && io.altDec !== io.aSep) { allowed += io.altDec; }
            io._allowed = new RegExp('[^' + allowed + ']', 'gi'); io._numReg = new RegExp(aNegReg + '(?:\\' + io.aDec + '?(\\d+\\' + io.aDec + '\\d+)|(\\d*(?:\\' + io.aDec + '\\d*)?))'); return io;
        }
        function autoStrip(s, io, strip_zero) {
            if (io.aSign) { while (s.indexOf(io.aSign) > -1) { s = s.replace(io.aSign, ''); } }
            s = s.replace(io._skipFirst, '$1$2'); s = s.replace(io._skipLast, '$1'); s = s.replace(io._allowed, ''); if (io.altDec) { s = s.replace(io.altDec, io.aDec); }
            var m = s.match(io._numReg); s = m ? [m[1], m[2], m[3]].join('') : ''; if (strip_zero) { var strip_reg = '^' + io._aNegReg + '0*(\\d' + (strip_zero === 'leading' ? ')' : '|$)'); strip_reg = new RegExp(strip_reg); s = s.replace(strip_reg, '$1$2'); }
            return s;
        }
        function truncateDecimal(s, aDec, mDec) {
            if (aDec && mDec) { var parts = s.split(aDec); if (parts[1] && parts[1].length > mDec) { if (mDec > 0) { parts[1] = parts[1].substring(0, mDec); s = parts.join(aDec); } else { s = parts[0]; } } }
            return s;
        }
        function fixNumber(s, aDec, aNeg) {
            if (aDec && aDec !== '.') { s = s.replace(aDec, '.'); }
            if (aNeg && aNeg !== '-') { s = s.replace(aNeg, '-'); }
            if (!s.match(/\d/)) { s += '0'; }
            return s;
        }
        function presentNumber(s, aDec, aNeg) {
            if (aNeg && aNeg !== '-') { s = s.replace('-', aNeg); }
            if (aDec && aDec !== '.') { s = s.replace('.', aDec); }
            return s;
        }
        function autoCheck(s, io) { s = autoStrip(s, io); s = truncateDecimal(s, io.aDec, io.mDec); s = fixNumber(s, io.aDec, io.aNeg); var value = +s; return value >= io.vMin && value <= io.vMax; }
        function checkEmpty(iv, io, signOnEmpty) {
            if (iv === '' || iv === io.aNeg) { if (io.wEmpty === 'zero') { return iv + '0'; } else if (io.wEmpty === 'sign' || signOnEmpty) { return iv + io.aSign; } else { return iv; } }
            return null;
        }
        function autoGroup(iv, io) {
            iv = autoStrip(iv, io); var empty = checkEmpty(iv, io, true); if (empty !== null) { return empty; }
            var digitalGroup = ''; if (io.dGroup === 2) { digitalGroup = /(\d)((\d)(\d{2}?)+)$/; } else if (io.dGroup === 4) { digitalGroup = /(\d)((\d{4}?)+)$/; } else { digitalGroup = /(\d)((\d{3}?)+)$/; }
            var ivSplit = iv.split(io.aDec); if (io.altDec && ivSplit.length === 1) { ivSplit = iv.split(io.altDec); }
            var s = ivSplit[0]; if (io.aSep) { while (digitalGroup.test(s)) { s = s.replace(digitalGroup, '$1' + io.aSep + '$2'); } }
            if (io.mDec !== 0 && ivSplit.length > 1) {
                if (ivSplit[1].length > io.mDec) { ivSplit[1] = ivSplit[1].substring(0, io.mDec); }
                iv = s + io.aDec + ivSplit[1];
            } else { iv = s; }
            if (io.aSign) { var has_aNeg = iv.indexOf(io.aNeg) !== -1; iv = iv.replace(io.aNeg, ''); iv = io.pSign === 'p' ? io.aSign + iv : iv + io.aSign; if (has_aNeg) { iv = io.aNeg + iv; } }
            return iv;
        }
        function autoRound(iv, mDec, mRound, aPad) {
            iv = (iv === '') ? '0' : iv.toString(); var ivRounded = ''; var i = 0; var nSign = ''; var rDec = (typeof (aPad) === 'boolean' || aPad === null) ? (aPad ? mDec : 0) : +aPad; var truncateZeros = function (ivRounded) {
                var regex = rDec === 0 ? (/(\.[1-9]*)0*$/) : rDec === 1 ? (/(\.\d[1-9]*)0*$/) : new RegExp('(\\.\\d{' + rDec + '}[1-9]*)0*$'); ivRounded = ivRounded.replace(regex, '$1'); if (rDec === 0) { ivRounded = ivRounded.replace(/\.$/, ''); }
                return ivRounded;
            }; if (iv.charAt(0) === '-') { nSign = '-'; iv = iv.replace('-', ''); }
            if (!iv.match(/^\d/)) { iv = '0' + iv; }
            if (nSign === '-' && +iv === 0) { nSign = ''; }
            if ((+iv) > 0) { iv = iv.replace(/^0*(\d)/, '$1'); }
            var dPos = iv.lastIndexOf('.'); var vdPos = dPos === -1 ? iv.length - 1 : dPos; var cDec = (iv.length - 1) - vdPos; if (cDec <= mDec) {
                ivRounded = iv; if (cDec < rDec) {
                    if (dPos === -1) { ivRounded += '.'; }
                    while (cDec < rDec) { var zeros = '000000'.substring(0, rDec - cDec); ivRounded += zeros; cDec += zeros.length; }
                } else if (cDec > rDec) { ivRounded = truncateZeros(ivRounded); } else if (cDec === 0 && rDec === 0) { ivRounded = ivRounded.replace(/\.$/, ''); }
                return nSign + ivRounded;
            }
            var rLength = dPos + mDec; var tRound = +iv.charAt(rLength + 1); var ivArray = iv.substring(0, rLength + 1).split(''); var odd = (iv.charAt(rLength) === '.') ? (iv.charAt(rLength - 1) % 2) : (iv.charAt(rLength) % 2); if ((tRound > 4 && mRound === 'S') || (tRound > 4 && mRound === 'A' && nSign === '') || (tRound > 5 && mRound === 'A' && nSign === '-') || (tRound > 5 && mRound === 's') || (tRound > 5 && mRound === 'a' && nSign === '') || (tRound > 4 && mRound === 'a' && nSign === '-') || (tRound > 5 && mRound === 'B') || (tRound === 5 && mRound === 'B' && odd === 1) || (tRound > 0 && mRound === 'C' && nSign === '') || (tRound > 0 && mRound === 'F' && nSign === '-') || (tRound > 0 && mRound === 'U')) { for (i = (ivArray.length - 1); i >= 0; i -= 1) { if (ivArray[i] !== '.') { ivArray[i] = +ivArray[i] + 1; if (ivArray[i] < 10) { break; } else if (i > 0) { ivArray[i] = '0'; } } } }
            ivArray = ivArray.slice(0, rLength + 1); ivRounded = truncateZeros(ivArray.join('')); return nSign + ivRounded;
        }
        function autoNumericHolder(that, options) { this.options = options; this.that = that; this.$that = $(that); this.formatted = false; this.io = autoCode(this.$that, this.options); this.value = that.value; }
        autoNumericHolder.prototype = { init: function (e) {
            this.value = this.that.value; this.io = autoCode(this.$that, this.options); this.cmdKey = e.metaKey; this.shiftKey = e.shiftKey; this.selection = getElementSelection(this.that); if (e.type === 'keydown' || e.type === 'keyup') { this.kdCode = e.keyCode; }
            this.which = e.which; this.processed = false; this.formatted = false;
        }, setSelection: function (start, end, setReal) { start = Math.max(start, 0); end = Math.min(end, this.that.value.length); this.selection = { start: start, end: end, length: end - start }; if (setReal === undefined || setReal) { setElementSelection(this.that, start, end); } }, setPosition: function (pos, setReal) { this.setSelection(pos, pos, setReal); }, getBeforeAfter: function () { var value = this.value; var left = value.substring(0, this.selection.start); var right = value.substring(this.selection.end, value.length); return [left, right]; }, getBeforeAfterStriped: function () { var parts = this.getBeforeAfter(); parts[0] = autoStrip(parts[0], this.io); parts[1] = autoStrip(parts[1], this.io); return parts; }, normalizeParts: function (left, right) {
            var io = this.io; right = autoStrip(right, io); var strip = right.match(/^\d/) ? true : 'leading'; left = autoStrip(left, io, strip); if ((left === '' || left === io.aNeg)) { if (right > '') { right = right.replace(/^0*(\d)/, '$1'); } }
            var new_value = left + right; if (io.aDec) { var m = new_value.match(new RegExp('^' + io._aNegReg + '\\' + io.aDec)); if (m) { left = left.replace(m[1], m[1] + '0'); new_value = left + right; } }
            if (io.wEmpty === 'zero' && (new_value === io.aNeg || new_value === '')) { left += '0'; }
            return [left, right];
        }, setValueParts: function (left, right) {
            var io = this.io; var parts = this.normalizeParts(left, right); var new_value = parts.join(''); var position = parts[0].length; if (autoCheck(new_value, io)) {
                new_value = truncateDecimal(new_value, io.aDec, io.mDec); if (position > new_value.length) { position = new_value.length; }
                this.value = new_value; this.setPosition(position, false); return true;
            }
            return false;
        }, signPosition: function () { var io = this.io, aSign = io.aSign, that = this.that; if (aSign) { var aSignLen = aSign.length; if (io.pSign === 'p') { var hasNeg = io.aNeg && that.value && that.value.charAt(0) === io.aNeg; return hasNeg ? [1, aSignLen + 1] : [0, aSignLen]; } else { var valueLen = that.value.length; return [valueLen - aSignLen, valueLen]; } } else { return [1000, -1]; } }, expandSelectionOnSign: function (setReal) { var sign_position = this.signPosition(); var selection = this.selection; if (selection.start < sign_position[1] && selection.end > sign_position[0]) { if ((selection.start < sign_position[0] || selection.end > sign_position[1]) && this.value.substring(Math.max(selection.start, sign_position[0]), Math.min(selection.end, sign_position[1])).match(/^\s*$/)) { if (selection.start < sign_position[0]) { this.setSelection(selection.start, sign_position[0], setReal); } else { this.setSelection(sign_position[1], selection.end, setReal); } } else { this.setSelection(Math.min(selection.start, sign_position[0]), Math.max(selection.end, sign_position[1]), setReal); } } }, checkPaste: function () { if (this.valuePartsBeforePaste !== undefined) { var parts = this.getBeforeAfter(); var oldParts = this.valuePartsBeforePaste; delete this.valuePartsBeforePaste; parts[0] = parts[0].substr(0, oldParts[0].length) + autoStrip(parts[0].substr(oldParts[0].length), this.io); if (!this.setValueParts(parts[0], parts[1])) { this.value = oldParts.join(''); this.setPosition(oldParts[0].length, false); } } }, skipAllways: function (e) {
            var kdCode = this.kdCode, which = this.which, cmdKey = this.cmdKey; if (kdCode === 17 && e.type === 'keyup' && this.valuePartsBeforePaste !== undefined) { this.checkPaste(); return false; }
            if ((kdCode >= 112 && kdCode <= 123) || (kdCode >= 91 && kdCode <= 93) || (kdCode >= 9 && kdCode <= 31) || (kdCode < 8 && (which === 0 || which === kdCode)) || kdCode === 144 || kdCode === 145 || kdCode === 45) { return true; }
            if (cmdKey && kdCode === 65) { return true; }
            if (cmdKey && (kdCode === 67 || kdCode === 86 || kdCode === 88)) {
                if (e.type === 'keydown') { this.expandSelectionOnSign(); }
                if (kdCode === 86) { if (e.type === 'keydown' || e.type === 'keypress') { if (this.valuePartsBeforePaste === undefined) { this.valuePartsBeforePaste = this.getBeforeAfter(); } } else { this.checkPaste(); } }
                return e.type === 'keydown' || e.type === 'keypress' || kdCode === 67;
            }
            if (cmdKey) { return true; }
            if (kdCode === 37 || kdCode === 39) {
                var aSep = this.io.aSep, start = this.selection.start, value = this.that.value; if (e.type === 'keydown' && aSep && !this.shiftKey) { if (kdCode === 37 && value.charAt(start - 2) === aSep) { this.setPosition(start - 1); } else if (kdCode === 39 && value.charAt(start) === aSep) { this.setPosition(start + 1); } }
                return true;
            }
            if (kdCode >= 34 && kdCode <= 40) { return true; }
            return false;
        }, processAllways: function () {
            var parts; if (this.kdCode === 8 || this.kdCode === 46) {
                if (!this.selection.length) {
                    parts = this.getBeforeAfterStriped(); if (this.kdCode === 8) { parts[0] = parts[0].substring(0, parts[0].length - 1); } else { parts[1] = parts[1].substring(1, parts[1].length); }
                    this.setValueParts(parts[0], parts[1]);
                } else { this.expandSelectionOnSign(false); parts = this.getBeforeAfterStriped(); this.setValueParts(parts[0], parts[1]); }
                return true;
            }
            return false;
        }, processKeypress: function () {
            var io = this.io; var cCode = String.fromCharCode(this.which); var parts = this.getBeforeAfterStriped(); var left = parts[0], right = parts[1]; if (cCode === io.aDec || (io.altDec && cCode === io.altDec) || ((cCode === '.' || cCode === ',') && this.kdCode === 110)) {
                if (!io.mDec || !io.aDec) { return true; }
                if (io.aNeg && right.indexOf(io.aNeg) > -1) { return true; }
                if (left.indexOf(io.aDec) > -1) { return true; }
                if (right.indexOf(io.aDec) > 0) { return true; }
                if (right.indexOf(io.aDec) === 0) { right = right.substr(1); }
                this.setValueParts(left + io.aDec, right); return true;
            }
            if (cCode === '-' || cCode === '+') {
                if (!io.aNeg) { return true; }
                if (left === '' && right.indexOf(io.aNeg) > -1) { left = io.aNeg; right = right.substring(1, right.length); }
                if (left.charAt(0) === io.aNeg) { left = left.substring(1, left.length); } else { left = (cCode === '-') ? io.aNeg + left : left; }
                this.setValueParts(left, right); return true;
            }
            if (cCode >= '0' && cCode <= '9') {
                if (io.aNeg && left === '' && right.indexOf(io.aNeg) > -1) { left = io.aNeg; right = right.substring(1, right.length); }
                this.setValueParts(left + cCode, right); return true;
            }
            return true;
        }, formatQuick: function () {
            var io = this.io; var parts = this.getBeforeAfterStriped(); var value = autoGroup(this.value, this.io); var position = value.length; if (value) {
                var left_ar = parts[0].split(''); var i; for (i = 0; i < left_ar.length; i += 1) { if (!left_ar[i].match('\\d')) { left_ar[i] = '\\' + left_ar[i]; } }
                var leftReg = new RegExp('^.*?' + left_ar.join('.*?')); var newLeft = value.match(leftReg); if (newLeft) { position = newLeft[0].length; if (((position === 0 && value.charAt(0) !== io.aNeg) || (position === 1 && value.charAt(0) === io.aNeg)) && io.aSign && io.pSign === 'p') { position = this.io.aSign.length + (value.charAt(0) === '-' ? 1 : 0); } } else if (io.aSign && io.pSign === 's') { position -= io.aSign.length; }
            }
            this.that.value = value; this.setPosition(position); this.formatted = true;
        }
        }; function getData($that) {
            var data = $that.data('autoNumeric'); if (!data) { data = {}; $that.data('autoNumeric', data); }
            return data;
        }
        function getHolder($that, options) {
            var data = getData($that); var holder = data.holder; if (holder === undefined && options) { holder = new autoNumericHolder($that.get(0), options); data.holder = holder; }
            return holder;
        }
        function getOptions($that) {
            var data = $that.data('autoNumeric'); if (data && data.holder) { return data.holder.options; }
            return {};
        }
        function onInit(options) { options = options || {}; var iv = $(this), holder = getHolder(iv, options); if (holder.io.aForm && (this.value || holder.io.wEmpty !== 'empty')) { iv.autoNumericSet(iv.autoNumericGet(options), options); } }
        function onKeyDown(e) {
            var iv = $(e.target), holder = getHolder(iv); holder.init(e); if (holder.skipAllways(e)) { holder.processed = true; return true; }
            if (holder.processAllways()) { holder.processed = true; holder.formatQuick(); e.preventDefault(); return false; } else { holder.formatted = false; }
            return true;
        }
        function onKeyPress(e) {
            var iv = $(e.target), holder = getHolder(iv); var processed = holder.processed; holder.init(e); if (holder.skipAllways(e)) { return true; }
            if (processed) { e.preventDefault(); return false; }
            if (holder.processAllways() || holder.processKeypress()) { holder.formatQuick(); e.preventDefault(); return false; } else { holder.formatted = false; }
        }
        function onKeyUp(e) {
            var iv = $(e.target), holder = getHolder(iv); holder.init(e); var skip = holder.skipAllways(e); holder.kdCode = 0; delete holder.valuePartsBeforePaste; if (skip) { return true; }
            if (this.value === '') { return true; }
            if (!holder.formatted) { holder.formatQuick(); }
        }
        function onFocusIn(e) { var iv = $(e.target), holder = getHolder(iv); holder.inVal = iv.val(); var onempty = checkEmpty(holder.inVal, holder.io, true); if (onempty !== null) { iv.val(onempty); } }
        function onFocusOut(e) {
            var iv = $(e.target), holder = getHolder(iv); var io = holder.io, value = iv.val(), origValue = value; if (value !== '') { value = autoStrip(value, io); if (checkEmpty(value, io) === null && autoCheck(value, io)) { value = fixNumber(value, io.aDec, io.aNeg); value = autoRound(value, io.mDec, io.mRound, io.aPad); value = presentNumber(value, io.aDec, io.aNeg); } else { value = ''; } }
            var groupedValue = checkEmpty(value, io, false); if (groupedValue === null) { groupedValue = autoGroup(value, io); }
            if (groupedValue !== origValue) { iv.val(groupedValue); }
            if (groupedValue !== holder.inVal) { iv.change(); delete holder.inVal; }
        }
        $.fn.autoNumeric = function (options) { return this.each(function () { onInit.call(this, options); }).unbind('.autoNumeric').bind({ 'keydown.autoNumeric': onKeyDown, 'keypress.autoNumeric': onKeyPress, 'keyup.autoNumeric': onKeyUp, 'focusin.autoNumeric': onFocusIn, 'focusout.autoNumeric': onFocusOut }); }; function autoGet(obj) {
            if (typeof (obj) === 'string') { obj = obj.replace(/\[/g, "\\[").replace(/\]/g, "\\]"); obj = '#' + obj.replace(/(:|\.)/g, '\\$1'); }
            return $(obj);
        }
        $.autoNumeric = {}; $.autoNumeric.Strip = function (ii) {
            var $that = autoGet(ii); var options = getOptions($that); if (arguments[1] && typeof (arguments[1]) === 'object') { options = $.extend({}, options, arguments[1]); }
            var io = autoCode($that, options); var iv = autoGet(ii).val(); iv = autoStrip(iv, io); iv = fixNumber(iv, io.aDec, io.aNeg); if (+iv === 0) { iv = '0'; }
            return iv;
        }; $.autoNumeric.Format = function (ii, iv) {
            var $that = autoGet(ii); var options = getOptions($that); if (arguments[2] && typeof (arguments[2]) === 'object') { options = $.extend({}, options, arguments[2]); }
            iv.toString(); var io = autoCode($that, options); iv = autoRound(iv, io.mDec, io.mRound, io.aPad); iv = presentNumber(iv, io.aDec, io.aNeg); if (!autoCheck(iv, io)) { iv = autoRound('', io.mDec, io.mRound, io.aPad); }
            return autoGroup(iv, io);
        }; $.fn.autoNumericGet = function () {
            if (arguments[0]) { return $.autoNumeric.Strip(this, arguments[0]); }
            return $.autoNumeric.Strip(this);
        }; $.fn.autoNumericSet = function (iv) {
            if (arguments[1]) { return this.val($.autoNumeric.Format(this, iv, arguments[1])); }
            return this.val($.fn.autoNumeric.Format(this, iv));
        }; $.autoNumeric.defaults = { aNum: '0123456789', aSep: ',', dGroup: '3', aDec: '.', altDec: null, aSign: '', pSign: 'p', vMax: '999999999.99', vMin: '0.00', mDec: null, mRound: 'S', aPad: true, wEmpty: 'empty', aForm: false }; $.fn.autoNumeric.defaults = $.autoNumeric.defaults; $.fn.autoNumeric.Strip = $.autoNumeric.Strip; $.fn.autoNumeric.Format = $.autoNumeric.Format;
    })(jQuery);
})