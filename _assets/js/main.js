var $ = require('jquery');
require('jquery.visible');

(function() {
    // simplified polyfill for retina.js (modified to make path generation easier)
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
        setVisible: function(visible) {
            return $(this).each(function() {
                $(this).css('visibility', visible ? 'visible' : 'hidden');
            });
        },
        scaleText: function(opts) {
            var compressor = 'compressor' in opts ? opts.compressor : 1.0;
            var maxFontSize = 'maxFontSize' in opts ? opts.maxFontSize : Math.POSITIVE_INFINITY;
            var minFontSize = 'minFontSize' in opts ? opts.minFontSize : Math.NEGATIVE_INFINITY;

            this.each(function() {
                var $this = $(this);

                function resizeText() {
                    var newSize = Math.max(Math.min($this.width() / (compressor * 10), maxFontSize), minFontSize) + 'px';
                    $this.css('font-size', newSize);
                    $this.css('line-height', newSize);
                }

                resizeText();
                $(window).on('resize orientationchange', resizeText);
            });
        }
    });

    $('.project').each(function() {
        var el = $(this);

        el.find('.project-summary').scaleText({
            compressor: 2.0,
            maxFontSize: 18,
            minFontSize: 13
        });

        var imgName = el.attr('data-image-name');
        if (!imgName) return;

        el.addClass('hidden');

        var img = new Image();
        img.src = Retina.retinaPath('/dist/assets/' + imgName);
        img.onload = function() {
            el.find('.screenshot').css('background-image', "url('" + img.src + "')");
            el.removeClass('hidden');

            // Only fade in if actually on-screen (for performance reasons)
            if (el.visible(true)) {
                el.hide().fadeIn(750).css('display', ''); // hack hack hack
            }
        };
    });

    $.bigfoot({
        actionOriginalFN: 'ignore',
        numberResetSelector: 'article'
    });
})();