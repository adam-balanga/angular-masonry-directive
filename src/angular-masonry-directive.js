(function() {
    "use strict";

    angular.module('masonry', ['ng']).directive('masonry', ['$parse', '$timeout', function($parse, $timeout) {
        return {
            restrict: 'AC',
            link: function(scope, elem, attrs) {
                var container = elem[0];
                var dirty = false;
                var visible = true;
                var options = angular.extend({
                    itemSelector: '.item'
                }, angular.fromJson(attrs.masonry));

                var masonry = scope.masonry = new Masonry(container, options);
                window.masonryTest = masonry;
                var debounceTimeout = 0;
                scope.update = function() {
                    if (debounceTimeout) {
                        $timeout.cancel(debounceTimeout);
                    }
                    debounceTimeout = $timeout(function() {
                        debounceTimeout = 0;

                        masonry.reloadItems();
                        masonry.layout();

                        elem.children(options.itemSelector).css('visibility', 'visible');
                    }, 120);
                };

                scope.removeBrick = function() {
                    if (!visible) { dirty = true; }
                    $timeout(function() {
                        masonry.reloadItems();
                        masonry.layout();
                    }, 500);
                };

                scope.appendBricks = function(ele) {
                    masonry.appended(ele);
                };

                scope.$on('masonry.layout', function() {
                    masonry.layout();
                });

                attrs.$observe('ngShow', function (expr) {
                    scope.$watch(function () {
                        return $parse(expr)(scope);
                    }, function (value) {
                        if (!visible && value && dirty) {
                            dirty = false;
                            $timeout(function() {
                                masonry.reloadItems();
                                masonry.layout();
                            }, 500);
                        }
                        visible = value;
                    })
                });

                scope.update();
            }
        };
    }]).directive('masonryTile', function() {
        return {
            restrict: 'AC',
            link: function(scope, elem) {
                elem.css('visibility', 'hidden');
                var master = elem.parent('*[masonry]:first').scope(),
                    update = master.update,
                    removeBrick = master.removeBrick,
                    appendBricks = master.appendBricks;
                if (update) {
                    imagesLoaded( elem.get(0), update);
                    elem.ready(update);
                }
                if (appendBricks) {
                    imagesLoaded( elem.get(0), appendBricks(elem));
                }
                scope.$on('$destroy', function() {
                    if (removeBrick) {
                        removeBrick();
                    }
                });
            }
        };
    });
})();
