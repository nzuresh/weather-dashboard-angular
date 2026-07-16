(function() {
    'use strict';

    /**
     * currentWeather Directive
     * Displays current weather conditions for a city
     * 
     * Usage:
     * <current-weather weather-data="vm.currentWeather" temperature-unit="vm.temperatureUnit"></current-weather>
     */
    angular.module('weatherDashboard')
        .directive('currentWeather', currentWeather);

    function currentWeather() {
        return {
            restrict: 'E',
            scope: {
                weatherData: '=',
                temperatureUnit: '='
            },
            templateUrl: 'app/directives/currentWeather.html',
            link: link
        };

        function link(scope) {
            // Watch for changes in weather data or temperature unit
            scope.$watchGroup(['weatherData', 'temperatureUnit'], function() {
                if (scope.weatherData) {
                    scope.displayTemperature = formatTemperature(scope.weatherData.temperature);
                    scope.displayFeelsLike = formatTemperature(scope.weatherData.feelsLike);
                }
            });

            /**
             * Formats temperature based on selected unit
             * @param {number} kelvinTemp - Temperature in Kelvin
             * @returns {number} - Formatted temperature
             */
            function formatTemperature(kelvinTemp) {
                if (kelvinTemp === null || kelvinTemp === undefined) {
                    return 0;
                }

                if (scope.temperatureUnit === 'celsius') {
                    // Convert Kelvin to Celsius
                    return kelvinTemp - 273.15;
                } else {
                    // Convert Kelvin to Fahrenheit
                    return (kelvinTemp - 273.15) * 9/5 + 32;
                }
            }

            /**
             * Gets the temperature unit symbol
             * @returns {string} - Unit symbol (°C or °F)
             */
            scope.getUnitSymbol = function() {
                return scope.temperatureUnit === 'celsius' ? '°C' : '°F';
            };
        }
    }

})();
