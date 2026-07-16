(function() {
    'use strict';

    /**
     * Weather Dashboard Application
     * Angular 1.4.7 application for displaying weather information
     */
    angular.module('weatherDashboard', [])
        .constant('API_CONFIG', {
            BASE_URL: 'https://api.openweathermap.org/data/2.5',
            API_KEY: (typeof WEATHER_CONFIG !== 'undefined' && WEATHER_CONFIG.API_KEY) || '',
            ENDPOINTS: {
                CURRENT_WEATHER: '/weather',
                FORECAST: '/forecast'
            },
            CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
            REFRESH_COOLDOWN: 4 * 1000,    // 4 seconds (15 requests per minute)
            REQUEST_TIMEOUT: 10000          // 10 seconds
        })
        .constant('STORAGE_KEYS', {
            FAVORITES: 'weather_favorites',
            TEMPERATURE_UNIT: 'weather_temp_unit'
        })
        .constant('TEMPERATURE_UNITS', {
            CELSIUS: 'celsius',
            FAHRENHEIT: 'fahrenheit'
        })
        .constant('ERROR_TYPES', {
            VALIDATION: 'VALIDATION_ERROR',
            NOT_FOUND: 'NOT_FOUND',
            NETWORK: 'NETWORK_ERROR',
            API: 'API_ERROR'
        });

})();
