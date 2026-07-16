(function() {
    'use strict';

    /**
     * Search History Service
     * Manages search history with localStorage persistence and filtering
     * Demonstrates: AngularJS service with state management
     */
    angular.module('weatherDashboard')
        .factory('searchHistoryService', searchHistoryService);

    searchHistoryService.$inject = ['$rootScope'];

    function searchHistoryService($rootScope) {
        var STORAGE_KEY = 'weather_search_history';
        var MAX_HISTORY = 10;
        var HISTORY_CHANGE_EVENT = 'searchHistoryChanged';

        var service = {
            getHistory: getHistory,
            addToHistory: addToHistory,
            removeFromHistory: removeFromHistory,
            clearHistory: clearHistory,
            filterHistory: filterHistory,
            HISTORY_CHANGE_EVENT: HISTORY_CHANGE_EVENT
        };

        return service;

        /**
         * Gets the full search history
         * @returns {Array<Object>} Array of search history items
         */
        function getHistory() {
            try {
                var historyJson = localStorage.getItem(STORAGE_KEY);
                if (!historyJson) {
                    return [];
                }
                return JSON.parse(historyJson);
            } catch (e) {
                console.error('Error loading search history:', e);
                return [];
            }
        }

        /**
         * Adds a city to search history
         * @param {Object} cityData - City data object { name, country, timestamp }
         */
        function addToHistory(cityData) {
            if (!cityData || !cityData.name) {
                return;
            }

            var history = getHistory();

            // Remove duplicate if exists (case-insensitive)
            history = history.filter(function(item) {
                return item.name.toLowerCase() !== cityData.name.toLowerCase();
            });

            // Add new entry at the beginning
            history.unshift({
                name: cityData.name,
                country: cityData.country || '',
                timestamp: new Date().toISOString()
            });

            // Trim to max history size
            if (history.length > MAX_HISTORY) {
                history = history.slice(0, MAX_HISTORY);
            }

            saveHistory(history);

            // Broadcast change event (AngularJS pattern)
            $rootScope.$broadcast(HISTORY_CHANGE_EVENT, { history: history });
        }

        /**
         * Removes a specific item from history
         * @param {string} cityName - Name of city to remove
         */
        function removeFromHistory(cityName) {
            var history = getHistory();
            history = history.filter(function(item) {
                return item.name.toLowerCase() !== cityName.toLowerCase();
            });
            saveHistory(history);
            $rootScope.$broadcast(HISTORY_CHANGE_EVENT, { history: history });
        }

        /**
         * Clears all search history
         */
        function clearHistory() {
            saveHistory([]);
            $rootScope.$broadcast(HISTORY_CHANGE_EVENT, { history: [] });
        }

        /**
         * Filters history by search term (for autocomplete)
         * @param {string} query - Search query
         * @returns {Array<Object>} Filtered history items
         */
        function filterHistory(query) {
            if (!query || query.length < 1) {
                return getHistory();
            }

            var history = getHistory();
            var lowerQuery = query.toLowerCase();

            return history.filter(function(item) {
                return item.name.toLowerCase().indexOf(lowerQuery) !== -1;
            });
        }

        /**
         * Saves history to localStorage
         * @param {Array} history
         */
        function saveHistory(history) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
            } catch (e) {
                console.error('Error saving search history:', e);
            }
        }
    }

})();
