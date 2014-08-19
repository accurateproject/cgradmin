'use strict';


// Declare app level module which depends on filters, and services
angular.module('cgradminApp', [
  'ngRoute',
  'ngCookies',
  'ngAnimate',
  'cgradminApp.filters',
  'cgradminApp.services',
  'cgradminApp.directives',
  'cgradminApp.controllers'
])
       .config(['$routeProvider', function($routeProvider) {
         $routeProvider.when('/resource/:partial', {templateUrl: 'partials/resources.html', controller: 'ResourcesCtrl', controllerAs: 'resCtrl'});
         $routeProvider.when('/timing/:res_id?', {templateUrl: 'partials/timing.html', controller: 'TimingsCtrl', controllerAs: 'resCtrl'});
         $routeProvider.when('/destination/:res_id?', {templateUrl: 'partials/destination.html', controller: 'DestinationsCtrl', controllerAs: 'resCtrl'});
         $routeProvider.when('/rate/:res_id?', {templateUrl: 'partials/rate.html', controller: 'RatesCtrl', controllerAs: 'resCtrl'});
         $routeProvider.when('/destinationrate/:res_id?', {templateUrl: 'partials/destination_rate.html', controller: 'DestinationRatesCtrl', controllerAs: 'resCtrl'});
         $routeProvider.when('/ratingplan/:res_id?', {templateUrl: 'partials/rating_plan.html', controller: 'RatingPlansCtrl', controllerAs: 'resCtrl'});
         $routeProvider.when('/ratingprofile/:res_id?', {templateUrl: 'partials/rating_profile.html', controller: 'RatingProfilesCtrl', controllerAs: 'resCtrl'});
         $routeProvider.when('/rpalias/:res_id?', {templateUrl: 'partials/rp_alias.html', controller: 'RatingProfileAliasesCtrl', controllerAs: 'resCrl'});
         $routeProvider.when('/catalias/:res_id?', {templateUrl: 'partials/category_alias.html', controller: 'CategoryAliasesCtrl', controllerAs: 'resCtrl'});
         $routeProvider.when('/action/:res_id?', {templateUrl: 'partials/action.html', controller: 'ActionsCtrl', controllerAs: 'resCtrl'});
         $routeProvider.when('/actionplan/:res_id?', {templateUrl: 'partials/action_plan.html', controller: 'ActionPlansCtrl', controllerAs: 'resCtrl'});
         $routeProvider.when('/actiontrigger/:res_id?', {templateUrl: 'partials/action_trigger.html', controller: 'ActionTriggersCtrl', controllerAs: 'resCtrl'});
         $routeProvider.when('/sharedgroup/:res_id?', {templateUrl: 'partials/shared_group.html', controller: 'SharedGroupsCtrl', controllerAs: 'resCtrl'});
         $routeProvider.when('/accountaction/:res_id?', {templateUrl: 'partials/account_action.html', controller: 'AccountActionsCtrl', controllerAs: 'resCtrl'});
         $routeProvider.when('/lcrrule/:res_id?', {templateUrl: 'partials/lcr_rule.html', controller: 'LcrRulesCtrl', controllerAs: 'resCtrl'});
         $routeProvider.when('/derivedcharge/:res_id?', {templateUrl: 'partials/desrived_charge.html', controller: 'DerivedChargesCtrl', controllerAs: 'resCtrl'});
         $routeProvider.when('/cdrstat/:res_id?', {templateUrl: 'partials/cdr_stat.html', controller: 'CdrStatsCtrl', controllerAs: 'resCtrl'});
         $routeProvider.otherwise({redirectTo: '/resource/Timing'});
       }]);
