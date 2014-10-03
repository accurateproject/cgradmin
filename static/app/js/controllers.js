'use strict';

/* Controllers */

angular.module('cgradminApp.controllers', [])
    .controller('TpIdsCtrl', function($cookieStore, $window, resFactory) {
        this.tpid = $cookieStore.get('tpid');
        var ctrl = this;
        ctrl.tpids = [];
        resFactory.call('GetTPIds', {}).success(function(data) {
            ctrl.tpids = data;
            if (ctrl.tpid && ctrl.tpids.indexOf(ctrl.tpid) === -1){
                ctrl.tpids.push(ctrl.tpid);
            }
            if((!ctrl.tpid || ctrl.tpid==='"') && angular.isArray(data)){ // TODO: find from where does single quote comes from
                ctrl.tpid = data[0];
                $cookieStore.put('tpid', ctrl.tpid);
                $window.location.reload();
            }
        });
        this.setTpId = function(tpid){
            this.tpid = tpid;
            $cookieStore.put('tpid', tpid);
            $window.location.reload();
        };
    })
    .controller('AlertCtrl', function(resFactory){
        this.alerts = resFactory.alerts;
        this.closeAlert = function(index) {
            this.alerts.splice(index, 1);
        };
    })
    .controller('PanelCtrl', function(){
        this.init = function(){
            this.index = 0;
        }
        this.init();
        this.select = function(i){
            this.index = i;
        }
        this.add = function(resources){
            resources.push({});
            this.index = resources.length-1;
            n}
        this.remove = function(resources, i, event){
            event.preventDefault();
            if (!confirm("Are you sure you want to delete this resource?")) {
                return;
            }
            resources.splice(i,1);
            if (this.index >= i) {
                this.index -= 1;
            }
        }
        this.isActive = function(i){
            return this.index === i;
        }
    })
    .controller('ResourcesCtrl', function($routeParams, resFactory, idMethods, hasActivateArray){
        var ctrl = this;
        ctrl.res = $routeParams.res;
        ctrl.resources = [];
        ctrl.selectedResources = [];
        ctrl.page = 0;
        ctrl.searchTerm = "";
        if ($routeParams.page){
            var p = Number($routeParams.page);
            if (p > 0){
                p -= 1;
            } else {
                p = 1;
            }
            ctrl.page =  p;
        }
        ctrl.itemsPerPage = 30;
        resFactory.call(idMethods[ctrl.res], {Page:ctrl.page, ItemsPerPage:ctrl.itemsPerPage, SearchTerm:ctrl.searchTerm}).success(function(data) {
            if (angular.isArray(data)){
                ctrl.resources = data;
            }
        });
        this.deleteResource = function(resId){
            var param = {};
            param[ctrl.res + 'Id'] = resId;
            resFactory.call('RemTP' + ctrl.res, param).success(function(data){resFactory.addAlert(data);});
            var index = this.resources.indexOf(resId);
            if (index > -1){
                this.resources.splice(index, 1);
            }
        };
        this.getPage = function(page){
            if(typeof(page)==='undefined') page = 0;
            ctrl.page += page;
            resFactory.call(idMethods[ctrl.res], {Page:ctrl.page, ItemsPerPage:ctrl.itemsPerPage, SearchTerm:ctrl.searchTerm}).success(function(data) {
                ctrl.resources = angular.isArray(data) ? data : [];
            });
        };
        this.toggleSelectedState = function(resId){
            var index = this.selectedResources.indexOf(resId);
            if (index > -1) {
                this.selectedResources.splice(index, 1);
            } else {
                this.selectedResources.push(resId);
            }
        };
        this.activateSelected = function(){
            if (!confirm("Are you sure you want to activate this resource(s)?")) {
                return;
            }
            for (var index = 0; index < this.selectedResources.length; index++) {
                var param = {};
                param[this.res + 'Id'] = this.selectedResources[index];
                resFactory.call('Load' + this.res, param).success(function(data){resFactory.addAlert(data);});
            }
            this.selectedResources = [];
        };
        this.deleteSelected = function(){
            if (!confirm("Are you sure you want to delete this resource(s)?")) {
                return;
            }
            for (var index = 0; index < this.selectedResources.length; index++) {
                this.deleteResource(this.selectedResources[index]);
            }
            this.selectedResources = [];
        };
        this.hasActivate = function(){
            return hasActivateArray.indexOf(this.res) > -1;
        };
    })
    .controller('ResActCtrl', function(resFactory, hasActivateArray){
        this.init = function(res, resId){
            this.res = res;
            this.resId = resId;
        }
        this.activate = function(){
            if (!confirm("Are you sure you want to activate this resource?")) {
                return;
            }
            var param = {};
            param[this.res + 'Id'] = this.resId;
            resFactory.call('Load' + this.res, param).success(function(data){resFactory.addAlert(data);});
            history.back();
        };
        this.delete = function(){
            if (!confirm("Are you sure you want to delete this resource?")) {
                return;
            }
            var param = {};
            param[this.res + 'Id'] = this.resId;
            resFactory.call('RemTP' + this.res, param).success(function(data){resFactory.addAlert(data);});
            history.back();
        };
        this.hasActivate = function(){
            return hasActivateArray.indexOf(this.res) > -1;
        };
    })
    .controller('TypeaheadCtrl', function(idMethods, resFactory){
        this.getIds = function(res, term){
            return resFactory.call(idMethods[res], {Page:0, ItemsPerPage:30, SearchTerm:term}).then(function(res) {
                return angular.isArray(res.data) ? res.data : [];
            });
        };
    })
    .controller('TimingsCtrl', function($routeParams, resFactory) {
        this.res = {};
        this.resId = $routeParams.res_id;
        var ctrl = this;

        if(this.resId){
            resFactory.call('GetTPTiming', {TimingId: this.resId}).success(function(data) {ctrl.res = data;});
        } else {
            this.showId = true;
        }

        this.saveResource = function(){
            resFactory.call('SetTPTiming', this.res).success(function(data){resFactory.addAlert(data);});
            history.back();
        };
    })
    .controller('DestinationsCtrl', function($routeParams, resFactory) {
        this.res = {};
        this.resId = $routeParams.res_id;
        var ctrl = this;

        if(this.resId){
            resFactory.call('GetTPDestination', {DestinationId: this.resId}).success(function(data) {ctrl.res = data;});
        } else {
            this.showId = true;
        }

        this.saveResource = function(){
            if(angular.isString(this.res.Prefixes)) {
                this.res.Prefixes = this.res.Prefixes.split(",");
            }
            resFactory.call('SetTPDestination', this.res).success(function(data){resFactory.addAlert(data);});
            history.back();
        };
    })
    .controller('RatesCtrl', function($routeParams, resFactory) {
        this.res = {RateSlots:[{}]};
        this.resId = $routeParams.res_id;
        var ctrl = this;

        if(this.resId){
            resFactory.call('GetTPRate', {RateId: this.resId}).success(function(data) {ctrl.res = data;});
        } else {
            this.showId = true;
        }

        this.saveResource = function(){
            resFactory.call('SetTPRate', this.res).success(function(data){resFactory.addAlert(data);});
            history.back();
        };
    })
    .controller('DestinationRatesCtrl', function($routeParams, resFactory) {
        this.res = {DestinationRates:[{}]};
        this.resId = $routeParams.res_id;
        var ctrl = this;
        if(this.resId){
            resFactory.call('GetTPDestinationRate', {DestinationRateId: this.resId}).success(function(data) {ctrl.res = data;});
        } else {
            this.showId = true;
        }

        this.saveResource = function(){
            resFactory.call('SetTPDestinationRate', this.res).success(function(data){resFactory.addAlert(data);});
            history.back();
        };
    })
    .controller('RatingPlansCtrl', function($routeParams, resFactory) {
        this.res = {RatingPlanBindings: [{}]};
        this.resId = $routeParams.res_id;
        var ctrl = this;
        if(this.resId){
            resFactory.call('GetTPRatingPlan', {RatingPlanId: this.resId}).success(function(data) {ctrl.res = data;});
        } else {
            this.showId = true;
        }

        this.saveResource = function(){
            resFactory.call('SetTPRatingPlan', this.res).success(function(data){resFactory.addAlert(data);});
            history.back();
        };
    })
    .controller('RatingProfilesCtrl', function($routeParams, resFactory) {
        this.res = {RatingPlanActivations:[{}]};
        this.resId = $routeParams.res_id;
        var ctrl = this;

        if(this.resId){
            resFactory.call('GetTPRatingProfile', {RatingProfileId: this.resId}).success(function(data) {ctrl.res = data;});
        } else {
            this.showId = true;
        }

        this.saveResource = function(){
            resFactory.call('SetTPRatingProfile', this.res).success(function(data){resFactory.addAlert(data);});
            history.back();
        };
    })
    .controller('RatingProfileAliasesCtrl', function($routeParams, resFactory) {
    })
    .controller('LcrRulesCtrl', function($routeParams, resFactory) {
    })
    .controller('CdrStatsCtrl', function($routeParams, resFactory) {
        this.res = {CdrStats:[{}]};
        this.resId = $routeParams.res_id;
        var ctrl = this;

        if(this.resId){
            resFactory.call('GetTPCdrStats', {CdrStatsId: this.resId}).success(function(data) {ctrl.res = data;});
        } else {
            this.showId = true;
        }

        this.saveResource = function(){
            resFactory.call('SetTPCdrStats', this.res).success(function(data){resFactory.addAlert(data);});
            history.back();
        };
    })
    .controller('ActionsCtrl', function($routeParams, resFactory) {
        this.res = {Actions:[{}]};
        this.resId = $routeParams.res_id;
        this.destIds = ['*any'];
        var ctrl = this;

        if(this.resId){
            resFactory.call('GetTPActions', {ActionsId: this.resId}).success(function(data) {ctrl.res = data;});
        } else {
            this.showId = true;
        }

        this.saveResource = function(){
            resFactory.call('SetTPActions', this.res).success(function(data){resFactory.addAlert(data);});
            history.back();
        };
    })
    .controller('ActionPlansCtrl', function($routeParams, resFactory) {
        this.res = {ActionPlan:[{}]};
        this.resId = $routeParams.res_id;
        var ctrl = this;

        if(this.resId){
            resFactory.call('GetTPActionPlan', {Id: this.resId}).success(function(data) {ctrl.res = data;});
        } else {
            this.showId = true;
        }

        this.saveResource = function(){
            resFactory.call('SetTPActionPlan', this.res).success(function(data){resFactory.addAlert(data);});
            history.back();
        };
    })
    .controller('ActionTriggersCtrl', function($routeParams, resFactory) {
        this.res = {ActionTriggers:[{}]};
        this.resId = $routeParams.res_id;
        var ctrl = this;

        if(this.resId){
            resFactory.call('GetTPActionTriggers', {ActionTriggersId: this.resId}).success(function(data) {ctrl.res = data;});
        } else {
            this.showId = true;
        }

        this.saveResource = function(){
            resFactory.call('SetTPActionTriggers', this.res).success(function(data){resFactory.addAlert(data);});
            history.back();
        };
    })
    .controller('AccountActionsCtrl', function($routeParams, resFactory) {
        this.res = {};
        this.resId = $routeParams.res_id;
        var ctrl = this;

        if(this.resId){
            resFactory.call('GetTPAccountActions', {AccountActionsId: this.resId}).success(function(data) {ctrl.res = data;});
        } else {
            this.showId = true;
        }

        this.saveResource = function(){
            resFactory.call('SetTPAccountActions', this.res).success(function(data){resFactory.addAlert(data);});
            history.back();
        };
    })
    .controller('SharedGroupsCtrl', function($routeParams, resFactory) {
        this.res = {SharedGroups:[{}]};
        this.resId = $routeParams.res_id;
        var ctrl = this;

        if(this.resId){
            resFactory.call('GetTPSharedGroups', {SharedGroupsId: this.resId}).success(function(data) {ctrl.res = data;});
        } else {
            this.showId = true;
        }

        this.saveResource = function(){
            resFactory.call('SetTPSharedGroups', this.res).success(function(data){resFactory.addAlert(data);});
            history.back();
        };
    })
    .controller('DerivedChargersCtrl', function($routeParams, resFactory) {
        this.res = {DerivedChargers:[{}]};
        this.resId = $routeParams.res_id;
        var ctrl = this;

        if(this.resId){
            resFactory.call('GetTPDerivedChargers', {DerivedChargersId: this.resId}).success(function(data) {ctrl.res = data;});
        } else {
            this.showId = true;
        }

        this.saveResource = function(){
            resFactory.call('SetTPDerivedChargers', this.res).success(function(data){resFactory.addAlert(data);});
            history.back();
        };
    })
    .controller('ImportCtrl', function($routeParams, $location, resFactory){
        if ($routeParams.message) {
            $location.path('/import');
            resFactory.addAlert(atob($routeParams.message));
        }
    })
    .controller('ExportCtrl', function($routeParams, $location, resFactory){
        if ($routeParams.message) {
            $location.path('/export');
            resFactory.addAlert(atob($routeParams.message));
        }
    })
    .controller('ActivationCtrl', function($routeParams, resFactory){
        this.res = $routeParams.res;
        this.resId = $routeParams.res_id;
        var EMPTY = "_empty_";
        if (!this.resId){}
        switch (this.res) {
        case "dt":
            resFactory.call('LoadDestination', {DestinationId:EMPTY}).success(function(data){resFactory.addAlert(data);});
            break;
        case "rp":
            resFactory.call('LoadRatingPlan', {RatingPlanId:EMPTY}).success(function(data){resFactory.addAlert(data);});
            break;
        case "rpf":
            resFactory.call('LoadRatingProfile', {RatingProfileId:EMPTY}).success(function(data){resFactory.addAlert(data);});
            break;
        case "aa":
            resFactory.call('LoadAccountActions', {AccountActionsId: EMPTY}).success(function(data){resFactory.addAlert(data);});
            break;
        case "dc":
            resFactory.call('LoadDerivedChargers', {DerivedChargersId: EMPTY}).success(function(data){resFactory.addAlert(data);});
            break
        case "sg":
            resFactory.call('LoadSharedGroup', {SharedGroupId:EMPTY}).success(function(data){resFactory.addAlert(data);});
            break;
        case "cs":
            resFactory.call('LoadCdrStats', {CdrStatsId:EMPTY}).success(function(data){resFactory.addAlert(data);});
            break;
        case "all":
            resFactory.call('LoadDestination', {DestinationId:EMPTY}).success(function(data){resFactory.addAlert(data, 'Destinations');});
            resFactory.call('LoadRatingPlan', {RatingPlanId:EMPTY}).success(function(data){resFactory.addAlert(data, 'RatingPlans');});
            resFactory.call('LoadRatingProfile', {RatingProfileId:EMPTY}).success(function(data){resFactory.addAlert(data, 'RatingProfiles');});
            resFactory.call('LoadAccountActions', {AccountActionsId: EMPTY}).success(function(data){resFactory.addAlert(data, 'AccountActions');});
            resFactory.call('LoadDerivedChargers', {DerivedChargersId: EMPTY}).success(function(data){resFactory.addAlert(data, 'DerivedChargers');});
            resFactory.call('LoadSharedGroup', {SharedGroupId:EMPTY}).success(function(data){resFactory.addAlert(data, 'SharedGroups');});
            resFactory.call('LoadCdrStats', {CdrStatsId:EMPTY}).success(function(data){resFactory.addAlert(data, 'CdrStats');});
            break;
        }
        history.back();
    })
    .controller('DashboardCtrl', function($interval, resFactory){
        var ctrl = this;
        ctrl.memstats = {};
        ctrl.statscache = {};
        ctrl.resources = [];
        ctrl.page = 0;
        ctrl.itemsPerPage = 30;
        ctrl.searchTerm = '';
        var memStatData = [];
        var memFootprintData = [];
        var memPlot = $.plot("#memChart", [
            {
                data: memStatData,
                lines: {show: true,  fill: true},
                color: "rgb(255, 100, 123)"
            },
            {
                data: memFootprintData,
                lines: {show: true},
                color: "#ADD8E6"
            }
        ],
                             {
                                 series: {
                                     shadowSize: 0   // Drawing is faster without shadows
                                 },
                                 yaxis: {
                                     min: 0,
                                 },
                                 xaxis: {
                                     show: false
                                 }
                             });

        var cacheData =  [];
        var cachePlot = $.plot("#cacheChart", [cacheData],{
            series: {
                bars: {
                    show: true,
                    barWidth: 0.6,
                    align: "center"
                }
            },
            xaxis: {
                mode: "categories",
                tickLength: 0,
            }
        });


        var x = 0;
        $interval(function() {
            resFactory.call('Status', '', 'Responder').success(function(data){
                ctrl.memstats = data;
                if (memStatData.length > 100) {
                    memStatData = memStatData.slice(1);
                    memFootprintData = memFootprintData.slice(1);
                }
                memStatData.push([x, data.memstat]);
                memFootprintData.push([x, data.footprint]);
                memPlot.setData([memStatData, memFootprintData]);
                memPlot.setupGrid();
                memPlot.draw();
            });
            x += 1;
        }, 5000);

        resFactory.call('GetCacheStats', {}).success(function(data){
            ctrl.cachestats = data;
            cacheData = [
                ["Actions",  data.Actions],
                ["AccountActions",  data.AccountAliases],
                ["DerivedChargers",  data.DerivedChargers],
                ["Destinations",  data.Destinations],
                ["RatingAliases",  data.RatingAliases],
                ["RatingPlans",  data.RatingPlans],
                ["RatingProfiles",  data.RatingProfiles],
                ["SharedGroups",  data.SharedGroups]
            ];
            cachePlot.setData([cacheData]);
            cachePlot.setupGrid();
            cachePlot.draw();
        });

        ctrl.getPage = function(func, page){
            if(typeof(page)==='undefined') {
                ctrl.resources = [];
                ctrl.page = 0;
                ctrl.searchTerm = '';
                page = 0;
            }
            ctrl.page += page;
            resFactory.call(func, {Page:ctrl.page, ItemsPerPage:ctrl.itemsPerPage, SearchTerm: ctrl.searchTerm}).success(function(data){
                ctrl.resources = data;
            });
        };

        ctrl.reloadCache = function(){
            resFactory.call('ReloadCache', {}).success(function(data){resFactory.addAlert(data, 'CacheReload')});
        };
        ctrl.reloadScheduler = function(){
            resFactory.call('ReloadScheduler', {}).success(function(data){resFactory.addAlert(data, 'SchedulerReload')});
        };
    });
