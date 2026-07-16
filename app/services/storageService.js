(function() {
    'use strict';

    /**
     * StorageService
     * Manages persistence of favorite cities and user preferences in browser localStorage
     */
    angular.module('weatherDashboard')
        .factory('storageService', ['STORAGE_KEYS', 'TEMPERATURE_UNITS', storageService]);

    function storageService(STORAGE_KEYS, TEMPERATURE_UNITS) {
        var service = {
            saveFavorites: saveFavorites,
            getFavorites: getFavorites,
            removeFavorite: removeFavorite,
            saveTemperatureUnit: saveTemperatureUnit,
            getTemperatureUnit: getTemperatureUnit,
            clearAll: clearAll
        };

        return service;

        /**
         * Saves the favorites list to localStorage
         * @param {Array<Object>} cities - Array of city objects to save
         */
        function saveFavorites(cities) {
            try {
                var citiesJson = JSON.stringify(cities || []);
                localStorage.setItem(STORAGE_KEYS.FAVORITES, citiesJson);
            } catch (error) {
                console.error('Error saving favorites to localStorage:', error);
                throw error;
            }
        }

        /**
         * Retrieves the favorites list from localStorage
         * @returns {Array<Object>} Array of favorite city objects, or empty array if none exist
         */
        function getFavorites() {
            try {
                var citiesJson = localStorage.getItem(STORAGE_KEYS.FAVORITES);
                if (!citiesJson) {
                    return [];
                }
                return JSON.parse(citiesJson);
            } catch (error) {
                console.error('Error retrieving favorites from localStorage:', error);
                return [];
            }
        }

        /**
         * Removes a specific city from the favorites list
         * @param {string} cityId - The ID of the city to remove
         */
        function removeFavorite(cityId) {
            try {
                var favorites = getFavorites();
                var updatedFavorites = favorites.filter(function(city) {
                    return city.id !== cityId;
                });
                saveFavorites(updatedFavorites);
            } catch (error) {
                console.error('Error removing favorite from localStorage:', error);
                throw error;
            }
        }

        /**
         * Saves the temperature unit preference to localStorage
         * @param {string} unit - The temperature unit ('celsius' or 'fahrenheit')
         */
        function saveTemperatureUnit(unit) {
            try {
                // Validate that the unit is one of the allowed values
                if (unit !== TEMPERATURE_UNITS.CELSIUS && unit !== TEMPERATURE_UNITS.FAHRENHEIT) {
                    console.warn('Invalid temperature unit:', unit, '- defaulting to celsius');
                    unit = TEMPERATURE_UNITS.CELSIUS;
                }
                localStorage.setItem(STORAGE_KEYS.TEMPERATURE_UNIT, unit);
            } catch (error) {
                console.error('Error saving temperature unit to localStorage:', error);
                throw error;
            }
        }

        /**
         * Retrieves the temperature unit preference from localStorage
         * @returns {string} The temperature unit ('celsius' or 'fahrenheit'), defaults to 'celsius'
         */
        function getTemperatureUnit() {
            try {
                var unit = localStorage.getItem(STORAGE_KEYS.TEMPERATURE_UNIT);
                // Default to celsius if no preference is saved
                if (!unit) {
                    return TEMPERATURE_UNITS.CELSIUS;
                }
                // Validate the retrieved unit
                if (unit !== TEMPERATURE_UNITS.CELSIUS && unit !== TEMPERATURE_UNITS.FAHRENHEIT) {
                    return TEMPERATURE_UNITS.CELSIUS;
                }
                return unit;
            } catch (error) {
                console.error('Error retrieving temperature unit from localStorage:', error);
                return TEMPERATURE_UNITS.CELSIUS;
            }
        }

        /**
         * Clears all weather dashboard data from localStorage
         */
        function clearAll() {
            try {
                localStorage.removeItem(STORAGE_KEYS.FAVORITES);
                localStorage.removeItem(STORAGE_KEYS.TEMPERATURE_UNIT);
            } catch (error) {
                console.error('Error clearing localStorage:', error);
                throw error;
            }
        }
    }

})();
