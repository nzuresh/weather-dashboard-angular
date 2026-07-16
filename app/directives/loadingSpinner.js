(function() {
    'use strict';

    /**
     * loadingSpinner directive
     * Small inline loading spinner for buttons and inline elements
     * Used for refresh operations on individual cities
     */
    angular.module('weatherDashboard')
        .directive('loadingSpinner', loadingSpinner);

    function loadingSpinner() {
        return {
            restrict: 'E',
            scope: {
                size: '@'
            },
            template: [
                '<span class="loading-spinner" ng-class="spinnerClass">',
                '    <span class="spinner-dot"></span>',
                '    <span class="spinner-dot"></span>',
                '    <span class="spinner-dot"></span>',
                '</span>'
            ].join(''),
            link: function(scope, element, attrs) {
                // Set size class based on attribute
                scope.spinnerClass = 'spinner-' + (scope.size || 'small');
            }
        };
    }

})();
