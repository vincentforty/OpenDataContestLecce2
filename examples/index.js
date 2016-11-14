var app = angular.module('index',  ['ngRoute']);

app.run(function($rootScope) {
    $rootScope.lat = 40.355514;
	$rootScope.lng = 18.179512;
});

app.config(function($routeProvider){
	$routeProvider
	.when('/', {
		templateUrl: 'login.html'
	})
	.when('/dashboard', {
		templateUrl: 'dashboard.html',
        controller : "RouteController"
	})
	//.when('/error')
	.otherwise({
		redirectTo: '/'
	});
});

app.factory('mainInfo', function($http) { 
    return {
        get:  function(){
            return $http.get('https://kitelinux.ssl.altervista.org/opendataLecce/examples/dataset_wifi.json'); 
			}
        }
});

app.controller('RouteController', function($scope, $location, $rootScope, $sce, $http, mainInfo) {

	var map = L.map('map').setView([40.353102, 18.172853],16);//44.907852, 7.673789],16);

	L.control.zoom({
     position:'bottomleft'
    }).addTo(map);

	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors for LECCE Open Data Contest'
	}).addTo(map);

	var lon1=[];
	var lat1=[];
	var message1=[];
	var message2=[];
	
	var distanze = [];
    var copy_distanze = [];
    var coord;

    mainInfo.get().then(function(response) { 
    $scope.foo = response.data[0].features[0].geometry.coordinates[0];
		for (i = 0; i < 79; i++) {
		lon1[i]=response.data[0].features[i].geometry.coordinates[0];	
	    lat1[i]=response.data[0].features[i].geometry.coordinates[1];
		message1[i]=response.data[0].features[i].properties.SEDE;
		message2[i]=response.data[0].features[i].properties.LUOGO;
	}



    var percorso = [];
    var temp_p = [];

	
    for (i = 0; i < 79; i++) {
       percorso[i] = L.Routing.control({				
	     waypoints: [
			L.latLng($rootScope.lat, $rootScope.lng),
		    L.latLng(lat1[i], lon1[i])
		  ],				
		  language: 'it',
		  geocoder: L.Control.Geocoder.nominatim(),
		  reverseWaypoints: true,
		  showAlternatives: true,
		  altLineOptions: {
			styles: [
            {color: 'black', opacity: 0.15, weight: 9},
            {color: 'white', opacity: 0.8, weight: 6},
            {color: 'blue', opacity: 0.5, weight: 2}
			]
		  }
       }).addTo(map);



    var temp_dist;
    var count=i;

   (function(y){
      percorso[y].on('routesfound', function (e) {
      coord = e.routes[0].coordinates;
      var firstRoute = e.routes[0];
      console.log(JSON.stringify(firstRoute.coordinates));
      var distance = e.routes[0].summary.totalDistance;
      var time = e.routes[0].summary.totalTime;
      temp_dist=distance;   
      distanze[y]=temp_dist;
      copy_distanze[y]=temp_dist;
      distanze.sort(function(a,b) { return a - b;});
      if(distance==distanze[0]){
            mes1=message1[y];
            mes2=message2[y];
	        console.log('->'+coord[0].lat+'  ->'+coord[0].lng);	
		    popup = L.popup()
		    .setLatLng([coord[0].lat, coord[0].lng])
		    .setContent("Da qui andiamo in direzione "+mes1+" ("+mes2+")")
		    .openOn(map)
            var total=temp_p.push(percorso[y]);
      }else{
            percorso[y].spliceWaypoints(0, 2);
      }

     for (ii = 0; ii < temp_p.length-1; ii++) {
        temp_p[ii].spliceWaypoints(0, 2);
      }
    })
   })(i);
  }//for
 });//mainInfo.get()
});//app.controller


app.controller('loginCtrl',function($scope, $location, $rootScope, $sce, $http){

 if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } 
	function showPosition(position) {
		$rootScope.lat=position.coords.latitude;
	    $rootScope.lng=position.coords.longitude;
    }

	$scope.submit = function() {
		var uname = $scope.username;
		var password = $scope.password;
		if($scope.username == 'admin' && $scope.password == 'admin'){
			$location.path('/dashboard');
		}
	}
})