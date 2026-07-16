(function() {
    'use strict';

    /**
     * Theme Service
     * Manages dark/light theme switching with localStorage persistence
     * Demonstrates: AngularJS service with $rootScope.$broadcast
     */
    angular.module('weatherDashboard')
        .factory('themeService', themeService);

    themeService.$inject = ['$rootScope'];

    function themeService($rootScope) {
        var STORAGE_KEY = 'weather_theme';
        var THEME_CHANGE_EVENT = 'themeChanged';
        var currentTheme = loadTheme();

        var service = {
            getTheme: getTheme,
            setTheme: setTheme,
            toggleTheme: toggleTheme,
            isDarkMode: isDarkMode,
            THEME_CHANGE_EVENT: THEME_CHANGE_EVENT
        };

        // Apply theme on service initialization
        applyTheme(currentTheme);

        return service;

        /**
         * Gets the current theme
         * @returns {string} 'dark' or 'light'
         */
        function getTheme() {
            return currentTheme;
        }

        /**
         * Sets the theme explicitly
         * @param {string} theme - 'dark' or 'light'
         */
        function setTheme(theme) {
            if (theme !== 'dark' && theme !== 'light') {
                return;
            }
            currentTheme = theme;
            saveTheme(theme);
            applyTheme(theme);
            // Broadcast theme change event (AngularJS pattern)
            $rootScope.$broadcast(THEME_CHANGE_EVENT, { theme: theme });
        }

        /**
         * Toggles between dark and light themes
         * @returns {string} The new theme
         */
        function toggleTheme() {
            var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
            return newTheme;
        }

        /**
         * Checks if dark mode is active
         * @returns {boolean}
         */
        function isDarkMode() {
            return currentTheme === 'dark';
        }

        /**
         * Applies theme to the document body
         * @param {string} theme - 'dark' or 'light'
         */
        function applyTheme(theme) {
            var body = document.body;
            if (theme === 'dark') {
                body.classList.add('dark-theme');
                body.classList.remove('light-theme');
            } else {
                body.classList.add('light-theme');
                body.classList.remove('dark-theme');
            }
        }

        /**
         * Loads theme from localStorage
         * @returns {string} Saved theme or 'light' default
         */
        function loadTheme() {
            try {
                var saved = localStorage.getItem(STORAGE_KEY);
                return saved === 'dark' ? 'dark' : 'light';
            } catch (e) {
                return 'light';
            }
        }

        /**
         * Saves theme to localStorage
         * @param {string} theme
         */
        function saveTheme(theme) {
            try {
                localStorage.setItem(STORAGE_KEY, theme);
            } catch (e) {
                console.error('Error saving theme:', e);
            }
        }
    }

})();
