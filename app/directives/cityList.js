(function() {
    'use strict';

    /**
     * cityList Directive
     * Displays a list of favorite cities with action buttons
     * 
     * Usage:
     * <city-list 
     *     cities="vm.favorites" 
     *     on-select="vm.selectCity(city)" 
     *     on-remove="vm.removeFavorite(cityId)" 
     *     on-refresh="vm.refreshWeather(cityId)"
     *     selected-city="vm.selectedCity"
     *     loading-city-id="vm.loadingCityId">
     * </city-list>
     */
    angular.module('weatherDashboard')
        .directive('cityList', cityList);

    function cityList() {
        return {
            restrict: 'E',
            scope: {
                cities: '=',
                onSelect: '&',
                onRemove: '&',
                onRefresh: '&',
                selectedCity: '=',
                loadingCityId: '='
            },
            template: [
                '<div class="city-list-container">',
                '    <!-- Empty State -->',
                '    <div class="empty-state" ng-if="cities.length === 0" role="status" aria-live="polite">',
                '        <p class="empty-icon" aria-hidden="true">📍</p>',
                '        <p class="empty-message">No favorite cities yet</p>',
                '        <p class="empty-hint">Search for a city and add it to your favorites!</p>',
                '    </div>',
                '',
                '    <!-- City List -->',
                '    <div class="city-list" ng-if="cities.length > 0" role="list" aria-label="Favorite cities list">',
                '        <div ',
                '            class="city-item" ',
                '            ng-repeat="city in cities track by city.id"',
                '            ng-class="{\'selected\': selectedCity && selectedCity.id === city.id}"',
                '            role="listitem"',
                '            tabindex="0"',
                '            ng-keydown="handleKeyDown($event, city)"',
                '            aria-label="{{::city.name}}, {{::city.country}}. Last updated {{city.lastUpdated | date:\'short\'}}"',
                '        >',
                '            <div class="city-info" ng-click="handleSelect(city)" role="button" tabindex="-1" aria-label="View weather for {{::city.name}}">',
                '                <h3 class="city-name">{{ ::city.name }}, {{ ::city.country }}</h3>',
                '                <p class="city-updated">Last updated: {{ city.lastUpdated | date:\'short\' }}</p>',
                '            </div>',
                '            <div class="city-actions" role="group" aria-label="Actions for {{::city.name}}">',
                '                <button ',
                '                    ng-click="handleRefresh(city.id)" ',
                '                    class="action-button refresh-button"',
                '                    ng-disabled="loadingCityId === city.id"',
                '                    aria-label="Refresh weather for {{ ::city.name }}"',
                '                    aria-busy="{{loadingCityId === city.id}}"',
                '                    tabindex="0"',
                '                >',
                '                    <span ng-if="loadingCityId !== city.id" aria-hidden="true">🔄</span>',
                '                    <span ng-if="loadingCityId !== city.id" class="visually-hidden">Refresh</span>',
                '                    <loading-spinner ng-if="loadingCityId === city.id" size="small"></loading-spinner>',
                '                </button>',
                '                <button ',
                '                    ng-click="handleRemove(city.id)" ',
                '                    class="action-button remove-button"',
                '                    aria-label="Remove {{ ::city.name }} from favorites"',
                '                    tabindex="0"',
                '                >',
                '                    <span aria-hidden="true">✕</span>',
                '                    <span class="visually-hidden">Remove</span>',
                '                </button>',
                '            </div>',
                '        </div>',
                '    </div>',
                '</div>'
            ].join('\n'),
            link: link
        };

        function link(scope) {
            /**
             * Handles city selection
             * @param {Object} city - City object to select
             */
            scope.handleSelect = function(city) {
                scope.onSelect({ city: city });
            };

            /**
             * Handles city removal
             * @param {string} cityId - ID of city to remove
             */
            scope.handleRemove = function(cityId) {
                scope.onRemove({ cityId: cityId });
            };

            /**
             * Handles weather refresh for a city
             * @param {string} cityId - ID of city to refresh
             */
            scope.handleRefresh = function(cityId) {
                scope.onRefresh({ cityId: cityId });
            };

            /**
             * Handles keyboard navigation for city items
             * @param {Event} event - Keyboard event
             * @param {Object} city - City object
             */
            scope.handleKeyDown = function(event, city) {
                // Enter or Space key to select city
                if (event.keyCode === 13 || event.keyCode === 32) {
                    event.preventDefault();
                    scope.handleSelect(city);
                }
            };
        }
    }

})();
