'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('cgradminApp.services', [])
       .value('version', '0.1')
       .value('idMethods', {
         "Timing": "GetTPTimingIds",
         "Destination": "GetTPDestinationIds",
         "Rate": "GetTPRateIds",
         "DestinationRate": "GetTPDestinationRateIds",
         "RatingPlan": "GetTPRatingPlanIds",
         "RatingProfile": "GetTPRatingProfileIds",
         "CdrStats": "GetTPCdrStatsIds",
         "Action": "GetTPActionIds",
         "ActionTrigger": "GetTPActionTriggerIds",
         "ActionPlan": "GetTPActionPlanIds",
         "AccountAction": "GetTPAccountActionIds",
         "SharedGroup": "GetTPSharedGroupIds",
         "DerivedCharger": "GetTPDerivedChargerIds",
       })
       .value('hasActivateArray',
              ["Destination", "RatingPlan", "RatingProfile", "CdrStats",
               "ActionPlan", "AccountActions", "SharedGroup", "DerivedChargers"]
       )
       .factory('breadcrumbsFactory', function(){
         var factory = {};
         factory.crumbs = [];
         factory.add = function(crumb){
           crumb = JSON.stringify(crumb);
           var index = factory.crumbs.indexOf(crumb);
           if(index > -1){
             factory.crumbs.splice(index + 1, factory.crumbs.length - index);
           } else {
             factory.crumbs.push(crumb);
           }
         };
         factory.reset = function(){
           factory.crumbs = [];
         }
         return factory;
       })
       .factory('resFactory', function($http, $cookieStore, $timeout, $location, $window) {
         var factory = {};
         factory.alerts = [];
         var param = {TPid : $cookieStore.get('tpid')};
         factory.call = function(func, finalParam){
           angular.extend(finalParam, param);
           var promise = $http.post('/call/ApierV2.' + func, finalParam);
           promise.error(function(data, status, headers, config) {
             if (data.error === 'not_autenticated') {               
               $window.location = '/accounts/login/?next=/static/app/index.html' + $window.location.hash;
             }
           });
           return promise;
         };
         factory.addAlert = function(message, prefix) {
           if(typeof(prefix)==='undefined') prefix = '';
           factory.alerts.push({
             type: message.indexOf('ERROR') > -1 ? 'danger' : 'success',
             msg: prefix + ': ' + JSON.parse(message)
           });
           $timeout(function(){
             factory.alerts.splice(0, 1);
           }, 7000);
         };
         return factory;
       });
