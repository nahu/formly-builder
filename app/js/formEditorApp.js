'use strict';

var Settings = {

    siteAssetURL: "Scripts/",
    siteRelativeRoot: "",
    siteURL: "app/"
  //,PublicScriptURL: "https://spengineeringltd-public.sharepoint.com/SiteAsset/Scripts/"
};

var app = angular.module('formlyExample', ['formly', 'formlyBootstrap', 'angularFileUpload', 'builder', 'builder.components', 'validator.rules', 'ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
       when('/FormDesign', {
           templateUrl: Settings.siteURL + 'view/FormDesign.html',
           controller: 'FormCtrl',
           controllerAs: 'vm'

       }).
       otherwise({
           redirectTo: '/FormDesign'
       });
}]);



app.config(['formlyConfigProvider', function(formlyConfigProvider) 
{
    formlyConfigProvider.setType({
      name: 'datepicker',
      template: '<input type="date" class="form-control" ng-model="model[options.key]" />',
      wrapper: ['bootstrapLabel', 'bootstrapHasError']
    });
    formlyConfigProvider.setType({
      name: 'image',
      template: '<img ng-src="{{to.urls[0]}}" alt="{{to.urls[0]}}" width="200" />',
      wrapper: ['bootstrapHasError']
    });
    formlyConfigProvider.setType({
      name: 'video',
      template: '<video controls width="400"><source src="{{to.urls[0]}}" /></video>',
      wrapper: ['bootstrapHasError']
    });
    formlyConfigProvider.setType({
      name: 'textlabel',
      template: '<p></p>{{to.label}}',
      wrapper: ['bootstrapHasError']
    });
}])



app.filter('to_trusted', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}]);


app.filter('getByKey', function () {
    return function (input, key) {
        var i = 0, len = input.length;
        for (; i < len; i++) {
            if (input[i].key == key) {
                var returnObj = input[i];
                var j = i + 1;
                return { obj: returnObj, index: j };
            }
        }
        return null;
    }
});

app.filter('getByProperty', function () {
    return function (input, propertyName, propertyValue) {
        var i = 0, len = input.length;
        for (; i < len; i++) {
            if (input[i].hasOwnProperty(propertyName) && input[i][propertyName] == propertyValue) {
                var returnObj = input[i];

                return { obj: returnObj, index: i };
            }
        }
        return null;
    }
});
app.filter('getByHasProperty', function () {
    return function (input, propertyName) {
        var foundObjs = new Array();
        var i = 0, len = input.length;
        for (; i < len; i++) {
            if (input[i].hasOwnProperty(propertyName)) {
                foundObjs.push(input[i]);
            }
        }
        return foundObjs;
    }
});


