'use strict';

/* Controllers */

angular.module('cgradminApp.controllers', [])
    .controller('TpIdsCtrl', function($scope, $cookieStore, tpidsFactory) {
        $scope.tpid = $cookieStore.get('tpid');
        tpidsFactory.GetTpIds().success(function(data) {
            $scope.tpids = data;
            if(!$scope.tpid){
                $scope.tpid = data[0];
                $cookieStore.put('tpid', $scope.tpid);
            }
        });
        $scope.SetTpId = function(tpid){
             $cookieStore.put('tpid', tpid);
        };
    })
    .controller('TimingsCtrl', function($scope, statusFactory) {
        statusFactory.GetStatus().success(function(data) {$scope.status = data;});
    })
    .controller('DestinationsCtrl', function($scope, destinationsFactory) {
        destinationsFactory.GetDestinationIds().success(function(data) {$scope.destinations = data;});
    })
    .controller('DestinationDetailCtrl', function($scope, $routeParams, destinationsFactory) {
        if($routeParams.destId){
            destinationsFactory.GetDestination($routeParams.destId).success(function(data) {$scope.dest = data;});
        } else {
            $scope.showId = true;
        }
        $scope.saveDestination=function(){
            if(angular.isString($scope.dest.Prefixes)) {
                $scope.dest.Prefixes = $scope.dest.Prefixes.split(",");
            }
            destinationsFactory.SetDestination($scope.dest).success(function(data){$scope.result = data;});
        };
    })
    .controller('RatesCtrl', function($scope) {
    })
    .controller('DestinationRatesCtrl', function($scope) {
    })
    .controller('RatingPlansCtrl', function($scope) {
    })
    .controller('RatingProfilesCtrl', function($scope) {
    })
    .controller('RatingProfileAliasesCtrl', function($scope) {
    })
    .controller('CategoryAliasesCtrl', function($scope) {
    })
    .controller('LcrRulesCtrl', function($scope) {
    })
    .controller('CdrStatsCtrl', function($scope, metricsFactory) {
        metricsFactory.GetMetrics({StatsQueueId: 'CDRST1'}).success(function(data) {$scope.metrics = data;});
    })
    .controller('ActionsCtrl', function($scope) {
    })
    .controller('ActionPlansCtrl', function($scope) {
    })
    .controller('ActionTriggersCtrl', function($scope) {
    })
    .controller('AccountActionsCtrl', function($scope) {
    })
    .controller('SharedGroupsCtrl', function($scope) {
    })
    .controller('DerivedChargesCtrl', function($scope) {
    });
