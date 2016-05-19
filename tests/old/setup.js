var app = angular.module('formlyExample', ['formly', 'formlyBootstrap', 'angularFileUpload', 'builder', 'builder.components', 'validator.rules', 'ngRoute']);

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

