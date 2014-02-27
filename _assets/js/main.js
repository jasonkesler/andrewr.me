var $ = require('jquery');

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
    });
})();