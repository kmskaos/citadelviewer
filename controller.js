var app = angular.module("CitadelFueler", [

//['ngMaterial', 'ngMdIcons']
  
  ]);

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
      //console.log('fetchData'); 
     
      fetch_character($scope.eveData.character_id);
     
    } 
 
   control.clearData = function(){
      //console.log('cleardata');
      $scope.eveData=null;  
    } 
       
  function fetch_character(character_id){
      $http.get( esiurl + 'characters/' + character_id +'/?datasource=tranquility&language=en-us')
                 .success(
                   function(response) { 
                     //console.log('response');
                     //console.log(response);
                     
                     
                     $scope.eveData.character = response; 
                     //console.log($scope.eveData.character);
                     fetch_character_corporation($scope.eveData.character.corporation_id);
                     
                   })
                 .error(function(error) { 
                 //console.log(error);
               });
    }
    
    
    function fetch_character_corporation(corporation_id){
      $http.get( esiurl +"corporations/" +corporation_id +"/?datasource=tranquility&language=en-us" )
                 .success(
                   function(response) { 
                     //console.log('response');
                     //console.log(response);
                     $scope.eveData.character.corporation = response; 
                     fetch_corporation_structures(corporation_id);
                     
                   })
                 .error(function(error) { 
                 //console.log(error);
               });
    }
    
    
     function fetch_corporation_structures(corporation_id){
      $http.get( esiurl +"corporations/" +corporation_id +"/structures/?datasource=tranquility&language=en-us&page=1" )

                 .success(
                   function(response) { 
                     //console.log('response');
                     //console.log(response);
                      $scope.eveData.character.corporation.structures = response; 
                      fetch_structure_names();
                   })
                 .error(
                   function(error) { 
                      //console.log(error);
                   });
    
     }//end of method
    
    
     function fetch_structure_names(){
       
       angular.forEach($scope.eveData.character.corporation.structures,
         function(structureItem){ 
             //console.log(structureItem);
         
             $http.get( esiurl +"universe/structures/" +structureItem.structure_id +"/?datasource=tranquility&language=en-us" )
                 .success(
                   function(response) { 
                     //console.log('response');
                     //console.log(response);
                     structureItem.name = response.name; 
                   })
                 .error(
                    function(error) { 
                      //console.log(error);
                    });  
         
        });//end of forEach      

    }//end of method

  let token = window.location.hash.match(/access_token=(.+?)\&/);
  if (token) {
      $http.defaults.headers.common.Authorization = `Bearer ${token[1]}`;

      //console.log(token);
      $scope.eveData={};


        $http.get(crestRoot).
                then(r=>$http.get(r.data.decode.href,{headers:{Accept:"application/vnd.ccp.eve.TokenDecode-v1+json"}})).
                then(r=>$http.get(r.data.character.href,{headers:{Accept:"application/vnd.ccp.eve.Character-v4+json"}}))
                .then(
                   function(r) { 
                     //console.log(r);
                      $scope.eveData.character_id = r.data.id_str;
                      //console.log($scope.eveData.character_id);
                            fetch_character($scope.eveData.character_id);
                        },
                      function error(error) { 
                      //console.log(error);
                      });

       // $http.get(crestRoot)
       //           .success(
       //             function(response) { 
       //               console.log('response');
       //               console.log(response);


       //                         $http.get(response.decode.href,{headers:{Accept:"application/vnd.ccp.eve.TokenDecode-v1+json"}})
       //                       .success(
       //                         function(response) { 
       //                           console.log('response');
       //                           console.log(response);

       //                                         $http.get(response.character.href,{headers:{Accept:"application/vnd.ccp.eve.Character-v4+json"}})
       //                                               .success(
       //                                                 function(response) { 
       //                                                   console.log('response');
       //                                                   console.log(response);
       //                                                  $scope.eveData.character_id = response.id_str;
       //                                                  console.log($scope.eveData.character_id);
       //                                                 })
       //                                               .error(
       //                                                  function(error) { 
       //                                                    console.log(error);
       //                                                  });


       //                         })
       //                       .error(
       //                          function(error) { 
       //                            console.log(error);
       //                          });



       //             })
       //           .error(
       //              function(error) { 
       //                console.log(error);
       //              }); 


    } else {
      window.location = `${ssoUrl}?response_type=token&client_id=${ssoClient}&scope=${ESIscope}&redirect_uri=${ssoRedirect}`;
  }
   
  }]); //end of controller
 