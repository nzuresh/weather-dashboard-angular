(function() {
    'use strict';

    /**
     * loadingIndicator directive
     * Displays a loading spinner with optional message
     * Shows loading state during API calls and refresh operations
     */
    angular.module('weatherDashboard')
        .directive('loadingIndicator', loadingIndicator);

    function loadingIndicator() {
        return {
            restrict: 'E',
            scope: {
                isLoading: '=',
                message: '@'
            },
            template: [
                '<div class="loading-indicator" ng-if="isLoading">',
                '    <div class="spinner" aria-label="Loading" role="status">',
                '        <div class="spinner-circle"></div>',
                '    </div>',
                '    <p class="loading-message">{{ message || "Loading weather data..." }}</p>',
                '</div>'
            ].join(''),
            link: function(scope, element, attrs) {
                // Ensure loading indicator is visible and accessible
                scope.$watch('isLoading', function(newValue) {
                    if (newValue) {
                        // Announce to screen readers
                        element.attr('aria-live', 'polite');
                        element.attr('aria-busy', 'true');
                    } else {
                        element.attr('aria-busy', 'false');
                    }
                });
            }
        };
    }

})();
