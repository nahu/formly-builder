

app.factory('editorconnector', ["$http",function($http) {
    
    var connector = {};
    var backendURL = 'http://localhost:8080/IDPBackend/';

    connector.loadIDs = function(callback)
    {
        $http({
		 	method: 'GET',
		 	url: backendURL +"rest/form/ids"
		 	
		}).then(function (response, status) {
			callback(response.data);
			

		},function (error){
			
				console.log(error);
		});
    
    };

    connector.loadForm = function(idToLoad, callback)
    {
        $http({
		 	method: 'GET',
		 	url: backendURL +"rest/form/" + idToLoad
		 	
		}).then(function (response, status) {
			callback(response.data);
			

		},function (error){
				console.log(error);
		});
    
    }
    
	

    return connector;
}]);