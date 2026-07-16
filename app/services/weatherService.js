(function() {
    'use strict';

    angular.module('weatherDashboard')
        .factory('weatherService', weatherService);

    weatherService.$inject = ['$http', '$q', 'API_CONFIG', 'ERROR_TYPES'];

    function weatherService($http, $q, API_CONFIG, ERROR_TYPES) {
        // Cache for API responses
        var cache = {};

        var service = {
            getCurrentWeather: getCurrentWeather,
            getForecast: getForecast,
            parseWeatherResponse: parseWeatherResponse,
            parseForecastResponse: parseForecastResponse,
            handleApiError: handleApiError,
            clearCityCache: clearCityCache
        };

        return service;

        /**
         * Retrieves current weather for a city
         * @param {string} cityName - Name of the city
         * @returns {Promise<WeatherData>} Promise resolving to weather data
         */
        function getCurrentWeather(cityName) {
            var cacheKey = 'current_' + cityName.toLowerCase();
            
            // Check cache first
            if (isCacheValid(cacheKey)) {
                return $q.resolve(cache[cacheKey].data);
            }

            var url = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CURRENT_WEATHER;
            var params = {
                q: cityName,
                appid: API_CONFIG.API_KEY
            };

            return makeRequestWithRetry(url, params)
                .then(function(response) {
                    var weatherData = parseWeatherResponse(response.data);
                    
                    // Update cache
                    cache[cacheKey] = {
                        data: weatherData,
                        timestamp: Date.now()
                    };
                    
                    return weatherData;
                })
                .catch(function(error) {
                    throw handleApiError(error);
                });
        }

        /**
         * Retrieves 5-day forecast for a city
         * @param {string} cityName - Name of the city
         * @returns {Promise<ForecastData>} Promise resolving to forecast data
         */
        function getForecast(cityName) {
            var cacheKey = 'forecast_' + cityName.toLowerCase();
            
            // Check cache first
            if (isCacheValid(cacheKey)) {
                return $q.resolve(cache[cacheKey].data);
            }

            var url = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.FORECAST;
            var params = {
                q: cityName,
                appid: API_CONFIG.API_KEY
            };

            return makeRequestWithRetry(url, params)
                .then(function(response) {
                    var forecastData = parseForecastResponse(response.data);
                    
                    // Update cache
                    cache[cacheKey] = {
                        data: forecastData,
                        timestamp: Date.now()
                    };
                    
                    return forecastData;
                })
                .catch(function(error) {
                    throw handleApiError(error);
                });
        }

        /**
         * Makes HTTP request with retry logic and exponential backoff
         * @param {string} url - API endpoint URL
         * @param {Object} params - Request parameters
         * @param {number} retryCount - Current retry attempt (default 0)
         * @returns {Promise} Promise resolving to HTTP response
         */
        function makeRequestWithRetry(url, params, retryCount) {
            retryCount = retryCount || 0;
            var maxRetries = 3;

            return $http({
                method: 'GET',
                url: url,
                params: params,
                timeout: API_CONFIG.REQUEST_TIMEOUT
            }).catch(function(error) {
                // Check if error is transient and we should retry
                var isTransient = isTransientError(error);
                
                if (isTransient && retryCount < maxRetries) {
                    // Calculate exponential backoff delay: 1s, 2s, 4s
                    var delay = Math.pow(2, retryCount) * 1000;
                    
                    // Wait and retry
                    return $q(function(resolve, reject) {
                        setTimeout(function() {
                            makeRequestWithRetry(url, params, retryCount + 1)
                                .then(resolve)
                                .catch(reject);
                        }, delay);
                    });
                }
                
                // No more retries or non-transient error
                throw error;
            });
        }

        /**
         * Checks if an error is transient and should be retried
         * @param {Object} error - HTTP error object
         * @returns {boolean} True if error is transient
         */
        function isTransientError(error) {
            // Network errors (no status code)
            if (!error.status || error.status === -1) {
                return true;
            }
            
            // Server errors (5xx)
            if (error.status >= 500 && error.status < 600) {
                return true;
            }
            
            // Timeout errors
            if (error.status === 408 || error.xhrStatus === 'timeout') {
                return true;
            }
            
            // Rate limiting (429) - but don't retry immediately
            if (error.status === 429) {
                return false;
            }
            
            return false;
        }

        /**
         * Parses OpenWeatherMap API response into WeatherData model
         * @param {Object} apiResponse - Raw API response
         * @returns {Object} WeatherData object
         */
        function parseWeatherResponse(apiResponse) {
            if (!apiResponse) {
                return null;
            }

            return {
                cityId: apiResponse.id ? apiResponse.id.toString() : '',
                cityName: apiResponse.name || '',
                country: apiResponse.sys && apiResponse.sys.country ? apiResponse.sys.country : '',
                temperature: apiResponse.main && apiResponse.main.temp ? apiResponse.main.temp : 0,
                feelsLike: apiResponse.main && apiResponse.main.feels_like ? apiResponse.main.feels_like : 0,
                condition: apiResponse.weather && apiResponse.weather[0] ? apiResponse.weather[0].main : '',
                description: apiResponse.weather && apiResponse.weather[0] ? apiResponse.weather[0].description : '',
                humidity: apiResponse.main && apiResponse.main.humidity ? apiResponse.main.humidity : 0,
                pressure: apiResponse.main && apiResponse.main.pressure ? apiResponse.main.pressure : 0,
                windSpeed: apiResponse.wind && apiResponse.wind.speed ? apiResponse.wind.speed : 0,
                windDirection: apiResponse.wind && apiResponse.wind.deg ? apiResponse.wind.deg : 0,
                icon: apiResponse.weather && apiResponse.weather[0] ? apiResponse.weather[0].icon : '',
                timestamp: new Date().toISOString(),
                sunrise: apiResponse.sys && apiResponse.sys.sunrise ? new Date(apiResponse.sys.sunrise * 1000).toISOString() : '',
                sunset: apiResponse.sys && apiResponse.sys.sunset ? new Date(apiResponse.sys.sunset * 1000).toISOString() : ''
            };
        }

        /**
         * Parses OpenWeatherMap forecast API response into ForecastData model
         * @param {Object} apiResponse - Raw API forecast response
         * @returns {Object} ForecastData object
         */
        function parseForecastResponse(apiResponse) {
            if (!apiResponse || !apiResponse.list) {
                return null;
            }

            // Group forecast data by day
            var dailyData = {};
            
            apiResponse.list.forEach(function(item) {
                var date = new Date(item.dt * 1000);
                var dateKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0'); // YYYY-MM-DD in local time
                
                if (!dailyData[dateKey]) {
                    dailyData[dateKey] = {
                        date: dateKey,
                        temps: [],
                        conditions: [],
                        descriptions: [],
                        icons: [],
                        humidity: [],
                        windSpeed: []
                    };
                }
                
                dailyData[dateKey].temps.push(item.main.temp);
                if (item.weather && item.weather[0]) {
                    dailyData[dateKey].conditions.push(item.weather[0].main);
                    dailyData[dateKey].descriptions.push(item.weather[0].description);
                    dailyData[dateKey].icons.push(item.weather[0].icon);
                }
                dailyData[dateKey].humidity.push(item.main.humidity);
                dailyData[dateKey].windSpeed.push(item.wind.speed);
            });

            // Convert to array, filter out past dates, and take first 5 days
            var now = new Date();
            var today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
            var dailyForecasts = Object.keys(dailyData)
                .sort()
                .filter(function(dateKey) { return dateKey >= today; })
                .slice(0, 5)
                .map(function(dateKey) {
                    var day = dailyData[dateKey];
                    var parts = dateKey.split('-');
                    var date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                    
                    return {
                        date: dateKey,
                        dayOfWeek: getDayOfWeek(date),
                        tempHigh: Math.max.apply(null, day.temps),
                        tempLow: Math.min.apply(null, day.temps),
                        condition: getMostCommon(day.conditions),
                        description: getMostCommon(day.descriptions),
                        icon: getMostCommon(day.icons),
                        humidity: average(day.humidity),
                        windSpeed: average(day.windSpeed)
                    };
                });

            return {
                cityId: apiResponse.city && apiResponse.city.id ? apiResponse.city.id.toString() : '',
                cityName: apiResponse.city && apiResponse.city.name ? apiResponse.city.name : '',
                country: apiResponse.city && apiResponse.city.country ? apiResponse.city.country : '',
                dailyForecasts: dailyForecasts,
                timestamp: new Date().toISOString()
            };
        }

        /**
         * Handles API errors and categorizes them
         * @param {Object} error - HTTP error object
         * @returns {Object} ErrorInfo object
         */
        function handleApiError(error) {
            var errorInfo = {
                type: ERROR_TYPES.API,
                message: 'An error occurred while retrieving weather data',
                details: '',
                timestamp: new Date().toISOString()
            };

            // Network errors
            if (!error.status || error.status === -1 || error.xhrStatus === 'timeout') {
                errorInfo.type = ERROR_TYPES.NETWORK;
                errorInfo.message = 'Network error. Please check your internet connection and try again.';
                errorInfo.details = 'Connection failed or timed out';
                
                // Log network error
                console.error('[Weather Service] Network Error:', {
                    type: errorInfo.type,
                    message: errorInfo.message,
                    details: errorInfo.details,
                    timestamp: errorInfo.timestamp
                });
                
                return errorInfo;
            }

            // City not found
            if (error.status === 404) {
                errorInfo.type = ERROR_TYPES.NOT_FOUND;
                errorInfo.message = 'City not found. Please check the spelling and try again.';
                errorInfo.details = error.data && error.data.message ? error.data.message : 'City not found';
                
                // Log not found error
                console.warn('[Weather Service] City Not Found:', {
                    type: errorInfo.type,
                    message: errorInfo.message,
                    details: errorInfo.details,
                    timestamp: errorInfo.timestamp
                });
                
                return errorInfo;
            }

            // Rate limiting
            if (error.status === 429) {
                errorInfo.type = ERROR_TYPES.API;
                errorInfo.message = error.data && error.data.message ? error.data.message : 'Too many requests. Please wait before trying again.';
                errorInfo.details = 'Rate limit exceeded';
                
                // Log rate limit error
                console.warn('[Weather Service] Rate Limit Exceeded:', {
                    type: errorInfo.type,
                    message: errorInfo.message,
                    details: errorInfo.details,
                    timestamp: errorInfo.timestamp
                });
                
                return errorInfo;
            }

            // Authentication errors
            if (error.status === 401) {
                errorInfo.type = ERROR_TYPES.API;
                errorInfo.message = 'API authentication failed. Please check the API key configuration.';
                errorInfo.details = error.data && error.data.message ? error.data.message : 'Invalid API key';
                
                // Log authentication error
                console.error('[Weather Service] Authentication Error:', {
                    type: errorInfo.type,
                    message: errorInfo.message,
                    details: errorInfo.details,
                    timestamp: errorInfo.timestamp
                });
                
                return errorInfo;
            }

            // Server errors
            if (error.status >= 500) {
                errorInfo.type = ERROR_TYPES.API;
                errorInfo.message = 'Weather service is temporarily unavailable. Please try again later.';
                errorInfo.details = error.data && error.data.message ? error.data.message : 'Server error';
                
                // Log server error
                console.error('[Weather Service] Server Error:', {
                    type: errorInfo.type,
                    message: errorInfo.message,
                    details: errorInfo.details,
                    status: error.status,
                    timestamp: errorInfo.timestamp
                });
                
                return errorInfo;
            }

            // Generic API error
            errorInfo.details = error.data && error.data.message ? error.data.message : error.statusText || 'Unknown error';
            
            // Log generic error
            console.error('[Weather Service] API Error:', {
                type: errorInfo.type,
                message: errorInfo.message,
                details: errorInfo.details,
                status: error.status,
                timestamp: errorInfo.timestamp
            });
            
            return errorInfo;
        }

        /**
         * Clears cache for a specific city
         * @param {string} cityName - Name of the city
         */
        function clearCityCache(cityName) {
            var key = cityName.toLowerCase();
            delete cache['current_' + key];
            delete cache['forecast_' + key];
        }

        /**
         * Checks if cached data is still valid
         * @param {string} cacheKey - Cache key to check
         * @returns {boolean} True if cache is valid
         */
        function isCacheValid(cacheKey) {
            if (!cache[cacheKey]) {
                return false;
            }
            
            var age = Date.now() - cache[cacheKey].timestamp;
            return age < API_CONFIG.CACHE_DURATION;
        }

        /**
         * Gets day of week name from date
         * @param {Date} date - Date object
         * @returns {string} Day name (e.g., "Monday")
         */
        function getDayOfWeek(date) {
            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[date.getDay()];
        }

        /**
         * Gets most common element in array
         * @param {Array} arr - Array of elements
         * @returns {*} Most common element
         */
        function getMostCommon(arr) {
            if (!arr || arr.length === 0) {
                return '';
            }
            
            var counts = {};
            var maxCount = 0;
            var mostCommon = arr[0];
            
            arr.forEach(function(item) {
                counts[item] = (counts[item] || 0) + 1;
                if (counts[item] > maxCount) {
                    maxCount = counts[item];
                    mostCommon = item;
                }
            });
            
            return mostCommon;
        }

        /**
         * Calculates average of array of numbers
         * @param {Array<number>} arr - Array of numbers
         * @returns {number} Average value
         */
        function average(arr) {
            if (!arr || arr.length === 0) {
                return 0;
            }
            
            var sum = arr.reduce(function(acc, val) {
                return acc + val;
            }, 0);
            
            return Math.round(sum / arr.length);
        }
    }

})();
