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
           this.removeTpId = function(event){
               event.preventDefault();
               swal({title: "Are you sure?",
                     text: "You will not be able to recover this TpId!",
                     type: "warning",   showCancelButton: true,
                     confirmButtonColor: "#DD6B55",
                     confirmButtonText: "Yes, delete it!" },  function(){
                         var idx = ctrl.tpids.indexOf(ctrl.tpid);
                         if (ctrl.tpid && idx !== -1){
                             resFactory.call('RemTP', {}).success(function(data){
                                 resFactory.addAlert(data);
                                 ctrl.tpids.splice(idx, 1);
                                 if(ctrl.tpids.length > 0){
                                     ctrl.setTpId(ctrl.tpids[0]);
                                 }
                             });
                         }
                     });
           };
       })
       .controller('MenuCtrl', function(menuFactory){
           var ctrl = this;
           menuFactory.registerObserverCallback(function(){
               ctrl.menu = menuFactory.getMenu();
           });
       })
       .controller('AlertCtrl', function(resFactory){
           this.alerts = resFactory.alerts;
           this.closeAlert = function(index) {
               this.alerts.splice(index, 1);
           };
       })
       .controller('PanelCtrl', function(){
           var ctrl = this;
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
           }
           this.remove = function(resources, i, event){
               event.preventDefault();
               swal({title: "Are you sure?",
                     text: "You will not be able to recover this resource!",
                     type: "warning",   showCancelButton: true,
                     confirmButtonColor: "#DD6B55",
                     confirmButtonText: "Yes, delete it!" },  function(){
                         resources.splice(i,1);
                         if (ctrl.index >= i) {
                             ctrl.index -= 1;
                         }
                     });
           }
           this.isActive = function(i){
               return this.index === i;
           }
       })
       .controller('ResourcesCtrl', function($routeParams, resFactory, idMethods, hasActivateArray, menuFactory){
           menuFactory.setMenu('two');
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
               if(typeof(page)==='undefined') {
                   page = 0;
                   ctrl.page = 0;
               }
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
               swal({title: "Are you sure?",
                     text: "This resource will be used immediately in running engine!",
                     type: "warning",   showCancelButton: true,
                     confirmButtonColor: "#DD6B55",
                     confirmButtonText: "Yes, activate it!" },  function(){
                         for (var index = 0; index < ctrl.selectedResources.length; index++) {
                             var param = {};
                             param[ctrl.res + 'Id'] = ctrl.selectedResources[index];
                             resFactory.call('Load' + ctrl.res, param).success(function(data){resFactory.addAlert(data);});
                         }
                         ctrl.selectedResources = [];
                     });
           };
           this.deleteSelected = function(){
               swal({title: "Are you sure?",
                     text: "You will not be able to recover this resource!",
                     type: "warning",   showCancelButton: true,
                     confirmButtonColor: "#DD6B55",
                     confirmButtonText: "Yes, delete it!" },  function(){
                         for (var index = 0; index < ctrl.selectedResources.length; index++) {
                             ctrl.deleteResource(ctrl.selectedResources[index]);
                         }
                         ctrl.selectedResources = [];
                     });
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
           var ctrl = this;
           this.activate = function(){
               swal({title: "Are you sure?",
                     text: "This resource will be used immediately in running engine!",
                     type: "warning",   showCancelButton: true,
                     confirmButtonColor: "#DD6B55",
                     confirmButtonText: "Yes, activate it!" },  function(){
                         var param = {};
                         param[ctrl.res + 'Id'] = ctrl.resId;
                         resFactory.call('Load' + ctrl.res, param).success(function(data){resFactory.addAlert(data);});
                         history.back();
                     });
           };
           this.delete = function(){
               swal({title: "Are you sure?",
                     text: "You will not be able to recover this resource!",
                     type: "warning",   showCancelButton: true,
                     confirmButtonColor: "#DD6B55",
                     confirmButtonText: "Yes, delete it!" },  function(){
                         var param = {};
                         param[ctrl.res + 'Id'] = ctrl.resId;
                         resFactory.call('RemTP' + ctrl.res, param).success(function(data){resFactory.addAlert(data);});
                         history.back();
                     });
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
       .controller('ResourceCtrl', function($routeParams, resFactory) {
           this.resId = $routeParams.res_id;
           this.init = function(res, name, idName){
               this.page = 0;
               this.itemsPerPage = 30;
               this.searchTerm = '';
               this.res = res;
               this.name = name;
               if(typeof(idName)==='undefined') {
                   idName = this.name;
               }
               this.idName = idName;
               var ctrl = this;

               if(this.resId){
                   var param = {};
                   param[this.idName + 'Id'] = this.resId;
                   param['Page'] = ctrl.page
                   param['ItemsPerPage'] = ctrl.itemsPerPage
                   param['SearchTerm'] = ctrl.searchTerm
                   resFactory.call('GetTP' + this.name, param).success(function(data) {ctrl.res = data;});
               } else {
                   this.showId = true;
               }
           }

           this.getPage = function(func, page){
               if(typeof(page)==='undefined') {
                   ctrl.resources = [];
                   ctrl.page = 0;
                   page = 0;
                   ctrl.searchTerm = '';
               }
               ctrl.page += page;
               var param = {};
               param[this.idName + 'Id'] = this.resId;
               param['Page'] = ctrl.page
               param['ItemsPerPage'] = ctrl.itemsPerPage
               param['SearchTerm'] = ctrl.searchTerm
               resFactory.call('GetTP' + ctrl.name, param).success(function(data) {ctrl.res = data;});
               resFactory.call(func, {}).success(function(data){
                   ctrl.resources = data;
               });

           };

           this.validate = function(){ // used for destinations only (TODO: find a better solution)
               if(angular.isString(this.res.Prefixes)) {
                   this.res.Prefixes = this.res.Prefixes.split(",");
               }
           }

           this.saveResource = function(){
               this.validate()
                   resFactory.call('SetTP' + this.name, this.res).success(function(data){resFactory.addAlert(data);});
               history.back();
           };
       })
       .controller('ImportCtrl', function($routeParams, $location, resFactory, root_url){
           if ($routeParams.message) {
               $location.path('/import');
               resFactory.addAlert(atob($routeParams.message));
           }
           this.getPostUrl = function(){
               return root_url+'import/';
           }
       })
       .controller('ExportCdrsCtrl', function($routeParams, $location, resFactory, root_url){
           if ($routeParams.message) {
               $location.path('/exportcdrs');
               resFactory.addAlert(atob($routeParams.message));
           }
           this.getPostUrl = function(){
               return root_url+'exportcdrs/';
           }
       })
       .controller('ExportTpCsvCtrl', function($routeParams, $location, resFactory, root_url){
           if ($routeParams.message) {
               $location.path('/exporttpcsv');
               resFactory.addAlert(atob($routeParams.message));
           }
           this.getPostUrl = function(){
               return root_url+'exporttpcsv/';
           }
       })
       .controller('ActivationCtrl', function($routeParams, resFactory){
           swal({title: "Are you sure?",
                 text: "This resource will be used immediately in running engine!",
                 type: "warning",   showCancelButton: true,
                 confirmButtonColor: "#DD6B55",
                 confirmButtonText: "Yes, activate it!" },  function(){
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
                             resFactory.call('LoadDestination', {DestinationId:EMPTY}).success(function(data){
                                 resFactory.addAlert(data, 'Destinations');
                                 if(data !== 'OK') return;
                                 resFactory.call('LoadRatingPlan', {RatingPlanId:EMPTY}).success(function(data){
                                     resFactory.addAlert(data, 'RatingPlans');
                                     if(data !== 'OK') return;
                                     resFactory.call('LoadRatingProfile', {RatingProfileId:EMPTY}).success(function(data){                                        
                                         resFactory.addAlert(data, 'RatingProfiles');
                                         if(data !== 'OK') return;
                                         resFactory.call('LoadAccountActions', {AccountActionsId: EMPTY}).success(function(data){
                                             resFactory.addAlert(data, 'AccountActions');
                                             if(data !== 'OK') return;
                                             resFactory.call('LoadDerivedChargers', {DerivedChargersId: EMPTY}).success(function(data){
                                                 resFactory.addAlert(data, 'DerivedChargers');
                                                 if(data !== 'OK') return;
                                                 resFactory.call('LoadSharedGroup', {SharedGroupId:EMPTY}).success(function(data){
                                                     resFactory.addAlert(data, 'SharedGroups');
                                                     if(data !== 'OK') return;
                                                     resFactory.call('LoadCdrStats', {CdrStatsId:EMPTY}).success(function(data){
                                                         resFactory.addAlert(data, 'CdrStats');
                                                     });
                                                 });
                                             });
                                         });
                                     });
                                 });
                             });
                             break;
                     }
                     history.back();
                 });
       })
       .controller('DashboardCtrl', function($interval, resFactory, menuFactory){
           menuFactory.setMenu('one');
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
               var reset = false;
               if(typeof(page)==='undefined') {
                   ctrl.resources = [];
                   ctrl.page = 0;
                   page = 0;
                   reset = true;
               }
               ctrl.page += page;
               resFactory.call(func, {Page:ctrl.page, ItemsPerPage:ctrl.itemsPerPage, SearchTerm: ctrl.searchTerm}).success(function(data){
                   ctrl.resources = data;
               });
               if(reset) {
                   ctrl.searchTerm = '';
               }
           };

           ctrl.keydown = function(event, method){
               if(event.which === 13){
                   ctrl.getPage(method);
               }
           }

           ctrl.reloadCache = function(){
               resFactory.call('ReloadCache', {}).success(function(data){resFactory.addAlert(data, 'CacheReload')});
           };
           ctrl.reloadScheduler = function(){
               resFactory.call('ReloadScheduler', '').success(function(data){resFactory.addAlert(data, 'SchedulerReload')});
           };
       });
