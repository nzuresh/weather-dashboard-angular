(function() {
    'use strict';

    /**
     * WeatherController
     * Main controller for the Weather Dashboard application
     * Coordinates user interactions for city search, favorites management, and weather display
     */
    angular.module('weatherDashboard')
        .controller('WeatherController', WeatherController);

    WeatherController.$inject = ['weatherService', 'storageService', 'validationService', 'searchHistoryService', 'themeService', 'TEMPERATURE_UNITS', 'ERROR_TYPES', '$timeout', '$scope'];

    function WeatherController(weatherService, storageService, validationService, searchHistoryService, themeService, TEMPERATURE_UNITS, ERROR_TYPES, $timeout, $scope) {
        var vm = this;

        // View model properties
        vm.searchInput = '';
        vm.favorites = [];
        vm.selectedCity = null;
        vm.currentWeather = null;
        vm.forecast = null;
        vm.temperatureUnit = TEMPERATURE_UNITS.CELSIUS;
        vm.isLoading = false;
        vm.error = null;
        vm.loadingCityId = null;
        
        // Search history
        vm.searchHistory = [];
        vm.showSearchHistory = false;
        
        // Theme
        vm.isDarkMode = false;
        
        // Guard to prevent multiple simultaneous selections
        var isSelecting = false;

        // Public methods
        vm.searchCity = searchCity;
        vm.addToFavorites = addToFavorites;
        vm.removeFavorite = removeFavorite;
        vm.selectCity = selectCity;
        vm.refreshWeather = refreshWeather;
        vm.toggleTemperatureUnit = toggleTemperatureUnit;
        vm.toggleDarkMode = toggleDarkMode;
        vm.selectFromHistory = selectFromHistory;
        vm.onSearchFocus = onSearchFocus;
        vm.onSearchBlur = onSearchBlur;
        vm.onSearchKeyDown = onSearchKeyDown;
        vm.dismissError = dismissError;

        // Initialize controller
        initialize();

        /**
         * Initializes the controller by loading favorites and temperature preference
         */
        function initialize() {
            // Load temperature unit preference
            vm.temperatureUnit = storageService.getTemperatureUnit();
            
            // Load favorites from storage
            vm.favorites = storageService.getFavorites();
            
            // Load search history
            vm.searchHistory = searchHistoryService.getHistory();
            
            // Load theme preference
            vm.isDarkMode = themeService.isDarkMode();
            
            // Listen for theme changes
            $scope.$on(themeService.THEME_CHANGE_EVENT, function(event, data) {
                vm.isDarkMode = data.theme === 'dark';
            });
            
            // Listen for search history changes
            $scope.$on(searchHistoryService.HISTORY_CHANGE_EVENT, function(event, data) {
                vm.searchHistory = data.history;
            });
        }

        /**
         * Searches for a city and displays its weather
         * Validates input and makes API call
         */
        function searchCity() {
            // Clear any previous errors
            vm.error = null;

            // Validate city name
            var validationResult = validationService.validateCityName(vm.searchInput);
            
            if (!validationResult.isValid) {
                vm.error = {
                    type: ERROR_TYPES.VALIDATION,
                    message: validationResult.errors.join(', '),
                    timestamp: new Date().toISOString()
                };
                return;
            }

            // Set loading state
            vm.isLoading = true;

            var searchedCity = vm.searchInput;

            // Clear selected city so "Add to Favorites" button shows
            vm.selectedCity = null;

            // Get current weather
            weatherService.getCurrentWeather(searchedCity)
                .then(function(weatherData) {
                    vm.currentWeather = weatherData;
                    
                    // Add to search history
                    searchHistoryService.addToHistory({
                        name: weatherData.cityName,
                        country: weatherData.country
                    });
                    
                    // Clear search input on successful search
                    vm.searchInput = '';
                    
                    // Clear any errors
                    vm.error = null;
                    
                    // Load forecast immediately after successful search
                    return weatherService.getForecast(searchedCity);
                })
                .then(function(forecastData) {
                    vm.forecast = forecastData;
                    
                    // Manage focus - announce to screen readers
                    $timeout(function() {
                        var weatherHeading = document.getElementById('currentWeatherHeading');
                        if (weatherHeading) {
                            weatherHeading.setAttribute('tabindex', '-1');
                            weatherHeading.focus();
                        }
                    }, 100);
                })
                .catch(function(error) {
                    // Display error
                    vm.error = error;
                    
                    // Log error for debugging
                    console.error('Error searching for city:', error);
                })
                .finally(function() {
                    vm.isLoading = false;
                });
        }

        /**
         * Adds the currently displayed city to favorites
         * @param {Object} weatherData - Weather data for the city to add
         */
        function addToFavorites(weatherData) {
            if (!weatherData || !weatherData.cityId) {
                return;
            }

            // Check if city is already in favorites (prevent duplicates)
            var isDuplicate = vm.favorites.some(function(city) {
                return city.id === weatherData.cityId;
            });

            if (isDuplicate) {
                vm.error = {
                    type: ERROR_TYPES.VALIDATION,
                    message: 'This city is already in your favorites',
                    timestamp: new Date().toISOString()
                };
                return;
            }

            // Create city data object
            var cityData = {
                id: weatherData.cityId,
                name: weatherData.cityName,
                country: weatherData.country,
                lastUpdated: weatherData.timestamp
            };

            // Add to favorites array
            vm.favorites.push(cityData);

            // Persist to storage
            storageService.saveFavorites(vm.favorites);

            // Clear any errors
            vm.error = null;
        }

        /**
         * Removes a city from the favorites list
         * @param {string} cityId - ID of the city to remove
         */
        function removeFavorite(cityId) {
            if (!cityId) {
                return;
            }

            // Remove from favorites array
            vm.favorites = vm.favorites.filter(function(city) {
                return city.id !== cityId;
            });

            // Persist to storage
            storageService.saveFavorites(vm.favorites);

            // Clear detail view if the removed city was selected
            if (vm.selectedCity && vm.selectedCity.id === cityId) {
                vm.selectedCity = null;
                vm.currentWeather = null;
                vm.forecast = null;
            }

            // Clear any errors
            vm.error = null;
        }

        /**
         * Selects a city from favorites and displays its detailed weather
         * @param {Object} city - City object from favorites
         */
        function selectCity(city) {
            if (!city || !city.name) {
                return;
            }
            
            // Prevent multiple simultaneous selections
            if (isSelecting) {
                return;
            }

            isSelecting = true;

            // Set selected city immediately
            vm.selectedCity = city;

            // Clear any previous errors
            vm.error = null;

            // Set loading state
            vm.isLoading = true;

            // Get current weather
            weatherService.getCurrentWeather(city.name)
                .then(function(weatherData) {
                    // Force new object reference to trigger Angular change detection
                    vm.currentWeather = angular.copy(weatherData);
                    
                    // Force digest cycle
                    $scope.$applyAsync();
                    
                    // Lazy-load forecast data only when city is selected
                    return weatherService.getForecast(city.name);
                })
                .then(function(forecastData) {
                    // Force new object reference to trigger Angular change detection
                    vm.forecast = angular.copy(forecastData);
                    
                    // Force digest cycle
                    $scope.$applyAsync();
                    
                    // Update last updated timestamp in favorites
                    var favoriteIndex = vm.favorites.findIndex(function(fav) {
                        return fav.id === city.id;
                    });
                    
                    if (favoriteIndex !== -1) {
                        vm.favorites[favoriteIndex].lastUpdated = vm.currentWeather.timestamp;
                        storageService.saveFavorites(vm.favorites);
                    }
                    
                    // Clear any errors
                    vm.error = null;
                    
                    // Manage focus for accessibility
                    $timeout(function() {
                        var weatherHeading = document.getElementById('currentWeatherHeading');
                        if (weatherHeading) {
                            weatherHeading.setAttribute('tabindex', '-1');
                            weatherHeading.focus();
                        }
                    }, 100);
                })
                .catch(function(error) {
                    // Display error
                    vm.error = error;
                })
                .finally(function() {
                    vm.isLoading = false;
                    isSelecting = false;
                });
        }

        /**
         * Refreshes weather data for a specific city
         * @param {string} cityId - ID of the city to refresh
         */
        function refreshWeather(cityId) {
            if (!cityId) {
                return;
            }

            // Find the city in favorites
            var city = vm.favorites.find(function(fav) {
                return fav.id === cityId;
            });

            if (!city) {
                return;
            }

            // Select the city being refreshed so user sees the update
            vm.selectedCity = city;

            // Clear any previous errors
            vm.error = null;

            // Set loading state for this specific city
            vm.loadingCityId = cityId;

            // Store previous data in case refresh fails
            var previousWeather = vm.currentWeather;
            var previousForecast = vm.forecast;

            // Clear cache for this city to force fresh data
            weatherService.clearCityCache(city.name);

            // Get current weather
            weatherService.getCurrentWeather(city.name)
                .then(function(weatherData) {
                    vm.currentWeather = angular.copy(weatherData);
                    $scope.$applyAsync();
                    
                    // Always load forecast when refreshing (since we selected the city)
                    return weatherService.getForecast(city.name);
                })
                .then(function(forecastData) {
                    if (forecastData) {
                        vm.forecast = angular.copy(forecastData);
                        $scope.$applyAsync();
                    }
                    
                    // Update last updated timestamp in favorites
                    var favoriteIndex = vm.favorites.findIndex(function(fav) {
                        return fav.id === cityId;
                    });
                    
                    if (favoriteIndex !== -1) {
                        vm.favorites[favoriteIndex].lastUpdated = vm.currentWeather.timestamp;
                        storageService.saveFavorites(vm.favorites);
                    }
                    
                    // Clear any errors
                    vm.error = null;
                })
                .catch(function(error) {
                    // Preserve previous data on failure
                    if (previousWeather) {
                        vm.currentWeather = previousWeather;
                    }
                    if (previousForecast) {
                        vm.forecast = previousForecast;
                    }
                    
                    // Display error
                    vm.error = error;
                })
                .finally(function() {
                    vm.loadingCityId = null;
                });
        }

        /**
         * Toggles between Celsius and Fahrenheit temperature units
         */
        function toggleTemperatureUnit() {
            // Toggle between celsius and fahrenheit
            if (vm.temperatureUnit === TEMPERATURE_UNITS.CELSIUS) {
                vm.temperatureUnit = TEMPERATURE_UNITS.FAHRENHEIT;
            } else {
                vm.temperatureUnit = TEMPERATURE_UNITS.CELSIUS;
            }

            // Persist preference to storage
            storageService.saveTemperatureUnit(vm.temperatureUnit);
        }

        /**
         * Toggles dark/light mode
         * Demonstrates: AngularJS service call + $broadcast
         */
        function toggleDarkMode() {
            themeService.toggleTheme();
            vm.isDarkMode = themeService.isDarkMode();
        }

        /**
         * Selects a city from search history
         * @param {string} cityName - City name to search
         */
        function selectFromHistory(city) {
            vm.searchInput = city;
            vm.showSearchHistory = false;
            vm.searchCity();
        }

        /**
         * Handles search input focus - shows history dropdown
         * Demonstrates: AngularJS $broadcast for sibling communication
         */
        function onSearchFocus() {
            $scope.$broadcast('searchInputFocused');
        }

        /**
         * Handles search input blur - hides history dropdown
         */
        function onSearchBlur() {
            $scope.$broadcast('searchInputBlurred');
        }

        /**
         * Handles keyboard events on search input
         * @param {Event} event - Keyboard event
         */
        function onSearchKeyDown(event) {
            $scope.$broadcast('searchKeyDown', event);
        }

        /**
         * Dismisses the current error message
         */
        function dismissError() {
            vm.error = null;
        }
    }

})();
