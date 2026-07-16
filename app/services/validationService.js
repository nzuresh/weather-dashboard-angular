(function() {
    'use strict';

    /**
     * ValidationService
     * Handles validation of user inputs, particularly city names
     */
    angular.module('weatherDashboard')
        .factory('validationService', validationService);

    function validationService() {
        var service = {
            validateCityName: validateCityName,
            isValidCityFormat: isValidCityFormat
        };

        return service;

        /**
         * Validates a city name and returns a ValidationResult
         * @param {string} cityName - The city name to validate
         * @returns {Object} ValidationResult with isValid boolean and errors array
         */
        function validateCityName(cityName) {
            var errors = [];

            // Check if city name is empty or null
            if (!cityName || cityName.trim() === '') {
                errors.push('City name is required');
                return {
                    isValid: false,
                    errors: errors
                };
            }

            // Check format using isValidCityFormat
            if (!isValidCityFormat(cityName)) {
                errors.push('City name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes');
            }

            return {
                isValid: errors.length === 0,
                errors: errors
            };
        }

        /**
         * Checks if a city name matches the valid format
         * @param {string} cityName - The city name to check
         * @returns {boolean} True if format is valid, false otherwise
         */
        function isValidCityFormat(cityName) {
            if (!cityName) {
                return false;
            }

            var trimmedName = cityName.trim();

            // Check length: must be between 2 and 50 characters
            if (trimmedName.length < 2 || trimmedName.length > 50) {
                return false;
            }

            // Check characters: only letters, spaces, hyphens, and apostrophes
            // Pattern: ^[a-zA-Z\s\-']+$
            var validPattern = /^[a-zA-Z\s\-']+$/;
            return validPattern.test(trimmedName);
        }
    }

})();
