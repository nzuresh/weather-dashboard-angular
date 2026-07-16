(function() {
    'use strict';

    /**
     * searchHistory Directive
     * Displays search history as autocomplete dropdown with keyboard navigation
     * Demonstrates: AngularJS directive with two-way binding, $watch, ng-repeat filters
     * 
     * Usage:
     * <search-history 
     *     search-input="vm.searchInput" 
     *     on-select="vm.selectFromHistory(city)">
     * </search-history>
     */
    angular.module('weatherDashboard')
        .directive('searchHistory', searchHistory);

    searchHistory.$inject = ['searchHistoryService'];

    function searchHistory(searchHistoryService) {
        return {
            restrict: 'E',
            scope: {
                searchInput: '=',
                onSelect: '&'
            },
            template: [
                '<div class="search-history-container" ng-if="showDropdown && filteredHistory.length > 0">',
                '    <div class="search-history-header">',
                '        <span class="history-title">Recent Searches</span>',
                '        <button class="clear-history-btn" ng-click="clearAll($event)" aria-label="Clear search history">',
                '            Clear All',
                '        </button>',
                '    </div>',
                '    <ul class="search-history-list" role="listbox" aria-label="Search history suggestions">',
                '        <li ng-repeat="item in filteredHistory track by item.name" ',
                '            class="search-history-item" ',
                '            ng-class="{\'active\': $index === activeIndex}" ',
                '            ng-click="selectItem(item)" ',
                '            ng-mouseenter="activeIndex = $index" ',
                '            role="option" ',
                '            aria-selected="{{$index === activeIndex}}">',
                '            <span class="history-icon" aria-hidden="true">🕐</span>',
                '            <span class="history-city-name">{{item.name}}</span>',
                '            <span class="history-country" ng-if="item.country">{{item.country}}</span>',
                '            <button class="remove-history-btn" ng-click="removeItem(item.name, $event)" aria-label="Remove {{item.name}} from history">',
                '                ✕',
                '            </button>',
                '        </li>',
                '    </ul>',
                '</div>'
            ].join(''),
            link: link
        };

        function link(scope) {
            scope.showDropdown = false;
            scope.filteredHistory = [];
            scope.activeIndex = -1;

            // Watch search input for changes            scope.$watch('searchInput', function(newVal) {
                if (newVal && newVal.length > 0) {
                    scope.filteredHistory = searchHistoryService.filterHistory(newVal);
                    scope.showDropdown = scope.filteredHistory.length > 0;
                } else {
                    scope.filteredHistory = searchHistoryService.getHistory();
                    scope.showDropdown = false;
                }
                scope.activeIndex = -1;
            });

            // Listen for history changes via $broadcast
            scope.$on(searchHistoryService.HISTORY_CHANGE_EVENT, function(event, data) {
                scope.filteredHistory = data.history;
            });

            // Show dropdown on focus
            scope.$on('searchInputFocused', function() {
                var history = searchHistoryService.getHistory();
                if (history.length > 0) {
                    scope.filteredHistory = history;
                    scope.showDropdown = true;
                }
            });

            // Hide dropdown on blur (with delay for click handling)
            scope.$on('searchInputBlurred', function() {
                setTimeout(function() {
                    scope.$apply(function() {
                        scope.showDropdown = false;
                    });
                }, 200);
            });

            // Select item from history
            scope.selectItem = function(item) {
                scope.searchInput = item.name;
                scope.showDropdown = false;
                scope.onSelect({ city: item.name });
            };

            // Remove single item
            scope.removeItem = function(cityName, event) {
                event.stopPropagation();
                searchHistoryService.removeFromHistory(cityName);
                scope.filteredHistory = searchHistoryService.getHistory();
                if (scope.filteredHistory.length === 0) {
                    scope.showDropdown = false;
                }
            };

            // Clear all history
            scope.clearAll = function(event) {
                event.stopPropagation();
                searchHistoryService.clearHistory();
                scope.filteredHistory = [];
                scope.showDropdown = false;
            };

            // Keyboard navigation
            scope.$on('searchKeyDown', function(event, keyEvent) {
                if (!scope.showDropdown) return;

                switch (keyEvent.keyCode) {
                    case 40: // Arrow Down
                        keyEvent.preventDefault();
                        scope.activeIndex = Math.min(scope.activeIndex + 1, scope.filteredHistory.length - 1);
                        break;
                    case 38: // Arrow Up
                        keyEvent.preventDefault();
                        scope.activeIndex = Math.max(scope.activeIndex - 1, -1);
                        break;
                    case 13: // Enter
                        if (scope.activeIndex >= 0 && scope.activeIndex < scope.filteredHistory.length) {
                            keyEvent.preventDefault();
                            scope.selectItem(scope.filteredHistory[scope.activeIndex]);
                        }
                        break;
                    case 27: // Escape
                        scope.showDropdown = false;
                        scope.activeIndex = -1;
                        break;
                }
            });
        }
    }

})();
