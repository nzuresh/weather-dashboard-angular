(function() {
    'use strict';

    /**
     * themeToggle Directive
     * Dark/Light mode toggle button with animated icon
     * Demonstrates: AngularJS directive with $scope.$on event listener
     * 
     * Usage:
     * <theme-toggle></theme-toggle>
     */
    angular.module('weatherDashboard')
        .directive('themeToggle', themeToggle);

    themeToggle.$inject = ['themeService'];

    function themeToggle(themeService) {
        return {
            restrict: 'E',
            scope: {},
            template: [
                '<button class="theme-toggle-btn" ',
                '        ng-click="toggle()" ',
                '        ng-class="{\'dark-active\': isDark}" ',
                '        aria-label="{{isDark ? \'Switch to light mode\' : \'Switch to dark mode\'}}" ',
                '        aria-pressed="{{isDark}}" ',
                '        title="{{isDark ? \'Switch to light mode\' : \'Switch to dark mode\'}}">',
                '    <span class="theme-icon" aria-hidden="true">{{isDark ? \'☀️\' : \'🌙\'}}</span>',
                '    <span class="theme-label">{{isDark ? \'Light Mode\' : \'Dark Mode\'}}</span>',
                '</button>'
            ].join(''),
            link: link
        };

        function link(scope) {
            // Initialize state from service
            scope.isDark = themeService.isDarkMode();

            // Toggle handler
            scope.toggle = function() {
                themeService.toggleTheme();
                scope.isDark = themeService.isDarkMode();
            };

            // Listen for external theme changes via $broadcast
            scope.$on(themeService.THEME_CHANGE_EVENT, function(event, data) {
                scope.isDark = data.theme === 'dark';
            });
        }
    }

})();
