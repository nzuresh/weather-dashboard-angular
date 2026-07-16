(function() {
    'use strict';

    /**
     * weatherForecast Directive
     * Displays 5-day weather forecast for a city
     * 
     * Usage:
     * <weather-forecast forecast-data="vm.forecastData" temperature-unit="vm.temperatureUnit"></weather-forecast>
     */
    angular.module('weatherDashboard')
        .directive('weatherForecast', weatherForecast);

    function weatherForecast() {
        return {
            restrict: 'E',
            scope: {
                forecastData: '=',
                temperatureUnit: '='
            },
            templateUrl: 'app/directives/weatherForecast.html',
            link: link
        };

        function link(scope) {
            // Watch for changes in forecast data or temperature unit
            scope.$watchGroup(['forecastData', 'temperatureUnit'], function() {
                if (scope.forecastData && scope.forecastData.dailyForecasts) {
                    scope.formattedForecasts = scope.forecastData.dailyForecasts.map(function(day) {
                        return {
                            date: day.date,
                            dayOfWeek: day.dayOfWeek,
                            formattedDate: formatDate(day.date, day.dayOfWeek),
                            tempHigh: formatTemperature(day.tempHigh),
                            tempLow: formatTemperature(day.tempLow),
                            condition: day.condition,
                            description: day.description,
                            icon: day.icon,
                            humidity: day.humidity,
                            windSpeed: day.windSpeed
                        };
                    });
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
             * Formats date in user-friendly format (e.g., "Mon, Jan 3")
             * @param {string} isoDate - ISO date string
             * @param {string} dayOfWeek - Day of week name
             * @returns {string} - Formatted date string
             */
            function formatDate(isoDate, dayOfWeek) {
                // Parse YYYY-MM-DD manually to avoid UTC timezone shift
                var parts = isoDate.split('-');
                var year = parseInt(parts[0], 10);
                var monthIndex = parseInt(parts[1], 10) - 1;
                var dayNum = parseInt(parts[2], 10);
                var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                var dayAbbrev = dayOfWeek.substring(0, 3); // Get first 3 letters
                var month = monthNames[monthIndex];
                
                return dayAbbrev + ', ' + month + ' ' + dayNum;
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
