(function() {
    'use strict';

    /**
     * errorMessage Directive
     * Displays error messages with appropriate styling and actionable guidance
     */
    angular.module('weatherDashboard')
        .directive('errorMessage', errorMessage);

    errorMessage.$inject = ['ERROR_TYPES'];

    function errorMessage(ERROR_TYPES) {
        return {
            restrict: 'E',
            scope: {
                error: '=',
                onDismiss: '&'
            },
            templateUrl: 'app/directives/errorMessage.html',
            link: function(scope) {
                // Helper function to get error icon based on type
                scope.getErrorIcon = function() {
                    if (!scope.error) return '';
                    
                    switch(scope.error.type) {
                        case ERROR_TYPES.VALIDATION:
                            return '⚠️';
                        case ERROR_TYPES.NOT_FOUND:
                            return '🔍';
                        case ERROR_TYPES.NETWORK:
                            return '📡';
                        case ERROR_TYPES.API:
                            return '⚙️';
                        default:
                            return '❌';
                    }
                };

                // Helper function to get error title based on type
                scope.getErrorTitle = function() {
                    if (!scope.error) return '';
                    
                    switch(scope.error.type) {
                        case ERROR_TYPES.VALIDATION:
                            return 'Invalid Input';
                        case ERROR_TYPES.NOT_FOUND:
                            return 'City Not Found';
                        case ERROR_TYPES.NETWORK:
                            return 'Network Error';
                        case ERROR_TYPES.API:
                            return 'Service Unavailable';
                        default:
                            return 'Error';
                    }
                };

                // Helper function to get actionable guidance based on error type
                scope.getActionableGuidance = function() {
                    if (!scope.error) return '';
                    
                    switch(scope.error.type) {
                        case ERROR_TYPES.VALIDATION:
                            return 'Please correct the input and try again.';
                        case ERROR_TYPES.NOT_FOUND:
                            return 'Please verify the city name spelling and try again. Try including the country code (e.g., "London, UK").';
                        case ERROR_TYPES.NETWORK:
                            return 'Please check your internet connection and try again. If the problem persists, wait a few moments and retry.';
                        case ERROR_TYPES.API:
                            return 'The weather service is temporarily unavailable. Please try again in a few moments.';
                        default:
                            return 'Please try again later.';
                    }
                };

                // Helper function to get CSS class based on error type
                scope.getErrorClass = function() {
                    if (!scope.error) return '';
                    
                    switch(scope.error.type) {
                        case ERROR_TYPES.VALIDATION:
                            return 'error-validation';
                        case ERROR_TYPES.NOT_FOUND:
                            return 'error-not-found';
                        case ERROR_TYPES.NETWORK:
                            return 'error-network';
                        case ERROR_TYPES.API:
                            return 'error-api';
                        default:
                            return 'error-generic';
                    }
                };

                // Dismiss error
                scope.dismiss = function() {
                    if (scope.onDismiss) {
                        scope.onDismiss();
                    }
                };

                // Log error to console when error changes
                scope.$watch('error', function(newError) {
                    if (newError) {
                        logError(newError);
                    }
                });

                /**
                 * Logs error details to console for debugging
                 * @param {Object} error - Error object to log
                 */
                function logError(error) {
                    var logMessage = '[Weather Dashboard Error] ' + error.type;
                    var logDetails = {
                        type: error.type,
                        message: error.message,
                        details: error.details || 'No additional details',
                        timestamp: error.timestamp
                    };

                    // Use appropriate console method based on error type
                    if (error.type === ERROR_TYPES.VALIDATION) {
                        console.warn(logMessage, logDetails);
                    } else {
                        console.error(logMessage, logDetails);
                    }
                }
            }
        };
    }

})();
