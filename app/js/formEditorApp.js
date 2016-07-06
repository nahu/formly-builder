'use strict';

var Settings = {

    siteAssetURL: "Scripts/",
    siteRelativeRoot: "",
    siteURL: "app/"
  //,PublicScriptURL: "https://spengineeringltd-public.sharepoint.com/SiteAsset/Scripts/"
};

var app = angular.module('formlyExample', ['formly', 'formlyBootstrap', 'builder', 'builder.components', 'validator.rules', 'ngRoute']);

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


    formlyConfigProvider.setWrapper({
        name: 'panel',
        template: '<div class=\'panel panel-default\'>\
            <div class=\"panel-heading px-nested-panel-heading clearfix">\
            <strong class="control-label" ng-if="options.templateOptions.label">\
        {{options.templateOptions.label}}\
        </strong>\
        </div>\
            <div class="panel-body px-nested-panel-body">\
            <formly-transclude></formly-transclude>\
        </div>\
        </div>'
    });

    formlyConfigProvider.setType({
              name: 'mui',
              template: '<div class=\"form-inline\">\
                          <div ng-repeat=\"(key, option) in to.options\" class=\"form-inline form-mui\">\
                              <label>\
                                  <input type=\"radio\" id=\"{{id + \'_\'+ $index}}\" tabindex=\"0\" ng-value=\"option[to.valueProp || \'value\']\" ng-model=\"model[options.key]\">\
                                    {{option[to.labelProp || \'name\']}}\
                                  </input>\
                              </label>\
                          </div>\
                        </div>\
                        <div class=\"form-block\"></div>',
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


