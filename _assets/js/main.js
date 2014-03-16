var $ = require('jquery');
var FitText = require('FitText');

(function() {
    // polyfill for retina.js which browserify-shim is being stupid about
    var Retina = (function() {
        var root = window;
        function isRetina() {
            var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
                              (min--moz-device-pixel-ratio: 1.5),\
                              (-o-min-device-pixel-ratio: 3/2),\
                              (min-resolution: 1.5dppx)";

            if (root.devicePixelRatio > 1)
              return true;

            if (root.matchMedia && root.matchMedia(mediaQuery).matches)
              return true;

            return false;
        };
        function retinaPath(path) {
            if (isRetina()) {
                return path.replace(/\.\w+$/, function(match) { return "@2x" + match; });
            }
            return path;
        };

        return {retinaPath: retinaPath};
    })();

    $.fn.extend({
        visible: function(visible) {
            return $(this).each(function() {
                $(this).css('visibility', visible ? 'visible' : 'hidden');
            });
        },
        measureTextWidth: function() {
            var $this = this;
            var dom = $this[0];
            if (!dom._measureClone) {
                dom._measureClone = (function() {
                    var $div = $this.clone();
                    $div.css({
                        'display': 'none',
                        'width': 'auto',
                        'white-space': 'nowrap'
                    });
                    $div.addClass('_measureClone');
                    $this.parent().append($div);
                    return $div;
                })();
            }

            return dom._measureClone.width();
        }
    });

    $('.project').each(function(){
        var el = $(this);

        var imgName = el.attr('data-image-name');
        if (!imgName) return;

        el.visible(false);
        var img = new Image();
        img.src = Retina.retinaPath('/dist/assets/' + imgName);
        img.onload = function() {
            el.find('.screenshot').css('background-image', "url('" + img.src + "')");
            el.visible(true).hide().fadeIn(750).css('display', ''); // hack hack hack
        };

        var opts = {
            compressor: 1.2,
            maxFontSize: 18,
            minFontSize: 12
        };

        var summary = el.find('.project-summary').not('._measureClone');
        function updateFontSize() {
            // const padding = 70;
            // var textWidth = summary.measureTextWidth();
            // var parentWidth = summary.closest('.project-content').width() - 2*padding;
            // var maxWidth = Math.min(textWidth, parentWidth);
            // var newSize = Math.max(Math.min(maxWidth / (opts.compressor * 10), opts.maxFontSize), opts.minFontSize);

            const padding = 5;
            var textWidth = summary.measureTextWidth();
            var parentWidth = summary.closest('.project-content').width() - 2*padding;
            var shrinkWidth = Math.max(textWidth - parentWidth, 0);
            var newSize = opts.maxFontSize;
            if (shrinkWidth > 0) {
                var refSize = parseFloat(summary[0]._measureClone.css('font-size'));
                newSize = refSize - (shrinkWidth / 2);
                newSize = Math.max(Math.min(opts.maxFontSize, newSize), opts.minFontSize);
            }

            if (el[0].id === 'abstergo') {
                console.log('textWidth:', textWidth, 'parentWidth:', parentWidth);
            }
            summary.css({
                'font-size': newSize,
                'line-height': newSize + 'px'
            });
        }
        updateFontSize();

        // el.find('.project-summary').fitText(2.0, {
        //     maxFontSize: '100px'
        // });
        $(window).on('resize orientationchange', updateFontSize);
    });
})();