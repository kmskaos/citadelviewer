var app = angular.module("CitadelFueler", []);
var crestRoot="https://crest-tq.eveonline.com/";
var ssoUrl = "https://login.eveonline.com/oauth/authorize";
var ssoClient = "cb1bd2018d924d088655ab54371de5e3";
var ssoRedirect = "https://intranet.loyaltyplus.aero/eve/citadelview.html";
var esiurl = "https://esi.tech.ccp.is/latest/";
var ESIscope ="esi-corporations.read_structures.v1 esi-corporations.read_corporation_membership.v1 esi-universe.read_structures.v1";
app.controller("MainController", [
  "$scope",
  "$http",
  function($scope, $http) {
    var control = this;
    $scope.eveData = null;

    control.fetchData = function(){
      fetch_character($scope.eveData.character_id);
    }

    control.clearData = function(){
      $scope.eveData=null;
    }

    function fetch_character(character_id){
      $http.get( esiurl + 'characters/' + character_id +'/?datasource=tranquility&language=en-us')
      .success(
        function(response) {
          $scope.eveData.character = response;
          fetch_character_corporation($scope.eveData.character.corporation_id);
        }
      )
      .error(function(error) {});
    }

    function fetch_character_corporation(corporation_id){
      $http.get( esiurl +"corporations/" +corporation_id +"/?datasource=tranquility&language=en-us" )
      .success(
        function(response) {
          $scope.eveData.character.corporation = response;
          fetch_corporation_structures(corporation_id);
        }
      )
      .error(function(error) {});
    }

    function fetch_corporation_structures(corporation_id){
      $http.get( esiurl +"corporations/" +corporation_id +"/structures/?datasource=tranquility&language=en-us&page=1" )
      .success(
        function(response) {
          $scope.eveData.character.corporation.structures = response;
          fetch_structure_names();
        }
      )
      .error(function(error) {});
    }

    function days_between(date1, date2) {
      date1 = new Date(date1);
      date2 = new Date(date2);
      var ONE_DAY = 1000 * 60 * 60 * 24
      var date1_ms = date1.getTime()
      var date2_ms = date2.getTime()
      var difference_ms = Math.abs(date1_ms - date2_ms)
      return Math.round(difference_ms/ONE_DAY)
    }

    function fetch_structure_names(){
      angular.forEach($scope.eveData.character.corporation.structures,
      function(structureItem){
        var fuel_left = structureItem.fuel_expires;
        var todayDate  = new Date().toISOString().slice(0,10);
        var difference = days_between(todayDate, fuel_left);
        structureItem.runsout = difference;
        $http.get( esiurl +"universe/structures/"+structureItem.structure_id+"/?datasource=tranquility&language=en-us" )
        .success(
        function(response) { 
        structureItem.name = response.name;
        })
        .error(function(error) {});
      });
    }

    let token = window.location.hash.match(/access_token=(.+?)\&/);
    if (token) {
      $http.defaults.headers.common.Authorization = `Bearer ${token[1]}`;
      $scope.eveData={};
      $http.get(crestRoot)
      .then(r=>$http.get(r.data.decode.href,{headers:{Accept:"application/vnd.ccp.eve.TokenDecode-v1+json"}}))
      .then(r=>$http.get(r.data.character.href,{headers:{Accept:"application/vnd.ccp.eve.Character-v4+json"}}))
      .then(
        function(r) {
          $scope.eveData.character_id = r.data.id_str;
          fetch_character($scope.eveData.character_id);
        },
        function error(error) {}
      );
    } else {
      window.location = `${ssoUrl}?response_type=token&client_id=${ssoClient}&scope=${ESIscope}&redirect_uri=${ssoRedirect}`;
    }
  }
]);