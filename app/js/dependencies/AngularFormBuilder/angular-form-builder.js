var isInCrossmode = false;
var crossModel = {};

(function () {
    var copyObjectToScope;

    copyObjectToScope = function (object, scope) {

        /*
        Copy object (ng-repeat="object in objects") to scope without `hashKey`.
         */
        var key, value;
        for (key in object) {
            value = object[key];
            if (key !== '$$hashKey') {
                scope[key] = angular.copy(value);
            }
        }
    };

    var appController = angular.module('builder.controller', ['builder.provider']);

    appController.controller('fbFormObjectEditableController', [
      '$scope', '$injector', function ($scope, $injector) {
          var $builder;
          $builder = $injector.get('$builder');

          $scope.setupScope = function (formObject) {

              /*
              1. Copy origin formObject (ng-repeat="object in formObjects") to scope.
              2. Setup optionsText with formObject.options.
              3. Watch scope.label, .description, .placeholder, .required, .options then copy to origin formObject.
              4. Watch scope.optionsText then convert to scope.options.
              5. setup validationOptions
               */
              var component;
              copyObjectToScope(formObject, $scope);
              $scope.optionsText = formObject.options.join('\n');

              $scope.$watch('[key,label, description, placeholder, required, options, templateOptions,expressionProperties,customModel]', function () {
                  formObject.key = $scope.key;
                  formObject.label = $scope.label;
                  formObject.description = $scope.description;
                  formObject.placeholder = $scope.placeholder;
                  formObject.required = $scope.required;
                  formObject.options = $scope.options;
                  formObject.optionsText = $scope.optionsText;
                  formObject.templateOptions = $scope.templateOptions;
                  formObject.expressionProperties = $scope.expressionProperties;
                  formObject.hasValidation = $scope.hasValidation;
                  formObject.validationOptions = $scope.validationOptions;
                  return formObject.customModel = $scope.customModel;
              }, true);

              component = $builder.components[formObject.component];
              return $scope.validationOptions = component.validationOptions;
          };

              $scope.$watch('optionsText', function (text) {
                  var x;
                  $scope.options = (function () {
                      if (text == undefined) return [];
                      var _i, _len, _ref, _results;
                      _ref = text.split('\n');
                      _results = [];
                      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                          x = _ref[_i];
                          if (x.length > 0) {
                              _results.push(x);
                          }
                      }
                      return _results;
                  })();
                  return $scope.inputText = $scope.options[0];
              });

          return $scope.data = {
              model: null,
              backup: function () {

                  /*
                  Backup input value.
                   */
                  return this.model = {
                      label: $scope.label,
                      description: $scope.description,
                      placeholder: $scope.placeholder,
                      optionsText:$scope.optionsText,
                      required: $scope.required,
                      key: $scope.key,
                      templateOptions: $scope.templateOptions,
                      expressionProperties: $scope.expressionProperties,
                      customModel: $scope.customModel,
                      hasValidation: $scope.hasValidation,
                      validationOptions: $scope.validationOptions

                  };
              },
              rollback: function () {
                  /*
                  Rollback input value.
                   */
                  if (!this.model) {
                      return;
                  }
                  $scope.label = this.model.label;
                  $scope.description = this.model.description;
                  $scope.placeholder = this.model.placeholder;
                  $scope.required = this.model.required;
                  $scope.optionsText = this.model.optionsText;
                  $scope.key = this.model.key;
                  $scope.templateOptions = this.model.templateOptions;
                  $scope.expressionProperties = this.model.expressionProperties;
                  $scope.hasValidation = this.model.hasValidation;
                  $scope.validationOptions = this.model.validationOptions;
                  return $scope.customModel = this.model.customModel;
              }
          };
      }
    ]);

    appController.controller('fbComponentsController', [
      '$scope', '$injector', function ($scope, $injector) {
          var $builder;
          $builder = $injector.get('$builder');
          $scope.selectGroup = function ($event, group) {
              var component, name, _ref, _results;
              if ($event != null) {
                  $event.preventDefault();
              }
              $scope.activeGroup = group;
              $scope.components = [];
              _ref = $builder.components;
              _results = [];
              for (name in _ref) {
                  component = _ref[name];
                  if (component.group === group) {
                      _results.push($scope.components.push(component));
                  }
              }
              return _results;
          };
          $scope.groups = $builder.groups;
          $scope.activeGroup = $scope.groups[0];
          $scope.allComponents = $builder.components;
          return $scope.$watch('allComponents', function () {
              return $scope.selectGroup(null, $scope.activeGroup);
          });
      }
    ]);

    appController.controller('fbComponentController', [
      '$scope', function ($scope) {
          return $scope.copyObjectToScope = function (object) {
              return copyObjectToScope(object, $scope);
          };
      }
    ]);

    appController.controller('fbFormController', [
      '$scope', '$injector', function ($scope, $injector) {
          var $builder, $timeout;
          $builder = $injector.get('$builder');
          $timeout = $injector.get('$timeout');
          if ($scope.input == null) {
              $scope.input = [];
          }
          return $scope.$watch('form', function () {
              if ($scope.input.length > $scope.form.length) {
                  $scope.input.splice($scope.form.length);
              }
              return $timeout(function () {
                  return $scope.$broadcast($builder.broadcastChannel.updateInput);
              });
          }, true);
      }
    ]);
    appController.controller('fbFormObjectController', [
      '$scope', '$injector', function ($scope, $injector) {
          var $builder;
          $builder = $injector.get('$builder');
          $scope.copyObjectToScope = function (object) {
              return copyObjectToScope(object, $scope);
          };
          return $scope.updateInput = function (value) {

              /*
              Copy current scope.input[X] to $parent.input.
              @param value: The input value.
               */
              var input;
              input = {
                  id: $scope.formObject.id,
                  label: $scope.formObject.label,
                  templateOptions: $scope.formObject.templateOptions,
                  value: value != null ? value : ''
              };
              return $scope.$parent.input.splice($scope.$index, 1, input);
          };
      }
    ]);

}).call(this);

(function () {
    directives = angular.module('builder.directive', ['builder.provider', 'builder.controller', 'builder.drag', 'validator']);

    directives.directive('fbBuilder', [
      '$injector', function ($injector) {
          var $builder, $drag;
          $builder = $injector.get('$builder');
          $drag = $injector.get('$drag');
          return {
              restrict: 'A',
              scope: {
                  fbBuilder: '@'
              },
              template: "<div class=''>\n    <div class='fb-form-object-editable form-group' ng-repeat=\"object in formObjects\"\n        fb-form-object-editable=\"object\"></div>\n</div>",
              link: function (scope, element, attrs) {
                  var beginMove, _base, _name;
                  //no fbBuilder value, this is the element on the design panel
                  if (!attrs.fbBuilder)
                  {
                      $(element).addClass('fb-builder');
                      return;
                  }
                      
                  scope.formName = attrs.fbBuilder;
                  if ((_base = $builder.forms)[_name = scope.formName] == null) {
                      _base[_name] = [];
                  }
                  scope.formObjects = $builder.forms[scope.formName];
                  beginMove = true;
                  $(element).addClass('fb-builder');
                  return $drag.droppable($(element), {
                      move: function (e) {
                          var $empty, $formObject, $formObjects, height, index, offset, positions, _i, _j, _ref, _ref1;
                          if (beginMove) {
                              $("div.fb-form-object-editable").popover('hide');
                              beginMove = false;
                          }
                          $formObjects = $(element).find('.fb-form-object-editable:not(.empty,.dragging,.fb-form-object-editable .fb-form-object-editable)');
                          if ($formObjects.length === 0) {
                              if ($(element).find('.fb-form-object-editable.empty').length === 0) {
                                  $(element).find('>div:first').append($("<div class='fb-form-object-editable empty'></div>"));
                              }
                              return;
                          }
                          positions = [];
                          positions.push(-1000);
                          for (index = _i = 0, _ref = $formObjects.length; _i < _ref; index = _i += 1) {
                              $formObject = $($formObjects[index]);
                              offset = $formObject.offset();
                              height = $formObject.height();
                              positions.push(offset.top + height);
                          }
                          positions.push(positions[positions.length - 1] + 1000);
                          for (index = _j = 1, _ref1 = positions.length; _j < _ref1; index = _j += 1) {



                              if (e.pageY > positions[index - 1] && e.pageY <= positions[index]) {
                                
                                  
                                  var elementIsContainer = false;
                                  if (index - 1 >= 0)
                                  {
                                      //if hoved over element is container
                                     
                                      elementIsContainer = $($formObjects[index - 1]).find(".fb-builder").length > 0;
                                      
                                      
                                        }
                             
                                 
                                  $(element).find('.empty').remove();
                                  $empty = $("<div class='fb-form-object-editable empty'></div>");
                                  if (!elementIsContainer) {
                                      
                                      //only move pass the element before add the empty element, this is for the nested element

                                      if (index - 1 < $formObjects.length) {

                                          $empty.insertBefore($($formObjects[index - 1]));

                                      } else {

                                          $empty.insertAfter($($formObjects[index - 2]));

                                      }
                                     
                                  }
                                  else
                                  {
                                      containerTop = $($formObjects[index - 1]).offset().top;
                                      if (e.pageY <= containerTop) {
                                          $empty.insertBefore($($formObjects[index - 1]));
                                      }

                                      
                                  }
                                  break;
                              }

                          }
                      },
                      out: function () {
                          if (beginMove) {
                              $("div.fb-form-object-editable").popover('hide');
                              beginMove = false;
                          }
                          return $(element).find('.empty').remove();
                      },
                      up: function (e, isHover, draggable) {
                          var formObject, newIndex, oldIndex;
                          beginMove = true;
                          if (!$drag.isMouseMoved()) {
                              $(element).find('.empty').remove();
                              return;
                          }
                          if (!isHover && draggable.mode === 'drag') {
                              formObject = draggable.object.formObject;
                              if (formObject.editable) {
                                //  $builder.removeFormObject(attrs.fbBuilder, formObject.index);
                              }
                          } else if (isHover) {

                              
                              if (draggable.mode === 'mirror') {
                                  //drag an element from component area
                                //  if ($(draggable.element).find(".DropableDesign").length > 0)
                                 //     app.isMirrorDrop = true;


                                  $builder.insertFormObject(scope.formName, $(element).find('.empty').index(), {
                                      component: draggable.object.componentName
                                  });
                              }

                              if (draggable.mode === 'drag') {
                                  //if it is move 
                                  formObject = draggable.object.formObject;
                                  var newFormObjectID, oldFormObjectID;
                                    var idParts = formObject.id.split("-");
                                    //id alwasy is formname-component name-randon number
                                    //so remove the last two elements will give you the form name
                                    var formNameParts = idParts;
                                    var elementNameParts = formNameParts.splice(-2, 2)
                                    var oldFormName = formNameParts.join("-");
                                    //if (oldFormName === scope.formName) {
                                    //    console.error("origin and destination form are the same as " + oldFormName + ". Abort")
                                    //    return;
                                    //}
                                    newIdParts=[];
                                    newIdParts.push(scope.formName);
                                    newIdParts.push(elementNameParts.join("-"))
                                   
                                   
                                    newFormObjectID = newIdParts.join("-");
                                    oldFormObjectID = formObject.id;
                                    changePropertyName = function (obj,searchString,subString) {
                                        angular.forEach(obj, function (value, key, thisobj) {
                                            if (value.id.indexOf(searchString) > -1)
                                            {
                                                var oldid = value.id;
                                                var newid = value.id.replace(searchString, subString);
                                                value.id = newid;                                              
                                                //if this component is container, loop
                                                if (value.isContainer)
                                                {
                                                    $builder.forms[newid] = $builder.forms[oldid];
                                                    delete $builder.forms[oldid];
                                                    changePropertyName($builder.forms[newid], oldid, newid);
                                                }
                                                
                                            }
                                        });
                                    };
                                    if (newFormObjectID !== oldFormObjectID)
                                        {
                                        formObject.id = newFormObjectID;
                                        var currentElementIsContainer = formObject.isContainer;
                                        if (currentElementIsContainer && $builder.forms[oldFormObjectID]) {
                                            $builder.forms[newFormObjectID] = $builder.forms[oldFormObjectID];
                                            delete $builder.forms[oldFormObjectID];
                                            changePropertyName($builder.forms[newFormObjectID], oldFormObjectID, newFormObjectID);
                                        }
                                    }
                                        

                                    newIndex = $(element).find('.empty').index();
                                    
                                      $builder.removeFormObject(oldFormName, formObject.index);
                                      $builder.insertFormObject(scope.formName, newIndex, formObject);
                                       
                                
                              }
                              return $(element).find('.empty').remove();
                          }
                          
                      }
                  });
              }
          };
      }
    ]);

    directives.directive('fbFormObjectEditable', [
      '$injector', function ($injector) {
          var $builder, $compile, $drag, $validator;
          $builder = $injector.get('$builder');
          $drag = $injector.get('$drag');
          $compile = $injector.get('$compile');
          $validator = $injector.get('$validator');
          return {
              restrict: 'A',
              controller: 'fbFormObjectEditableController',
              scope: {
                  formObject: '=fbFormObjectEditable'
              },
              link: function (scope, element) {
                  var popover;
                  scope.inputArray = [];
                  scope.$component = $builder.components[scope.formObject.component];
                  scope.setupScope(scope.formObject);
                  scope.$watch('$component.template', function (template) {
                      var view;
                      if (!template) {
                          return;
                      }
                      view = $compile(template)(scope);
                      return $(element).html(view);
                  });
                  $(element).on('click', function () {
                      return false;
                  });
                  $drag.draggable($(element), {
                      object: {
                          formObject: scope.formObject
                      }
                  });
                  if (!scope.formObject.editable) {
                      return;
                  }
                  popover = {};
                  scope.$watch('$component.popoverTemplate', function (template) {
                      if (!template) {
                          return;
                      }
                      $(element).removeClass(popover.id);
                      popover = {
                          id: "fb-" + (Math.random().toString().substr(2)),
                          isClickedSave: false,
                          view: null,
                          html: template
                      };
                      popover.html = $(popover.html).addClass(popover.id);
  
                      popover.view = $compile(popover.html)(scope);
                      $(element).addClass(popover.id);
                      return $(element).popover({
                          html: true,
                          title: scope.$component.label,
                          content: popover.view,
                          container: 'body',
                          placement: $builder.config.popoverPlacement
                      });
                  });
                  scope.popover = {
                      save: function ($event) {

                          /*
                          The save event of the popover.
                           */
                          $event.preventDefault();
                          $validator.validate(scope).success(function () {
                              popover.isClickedSave = true;
                              return $(element).popover('hide');
                          });
                      },
                      selectCrossKey:function($event, sourcevm, validatorID){
                          $event.preventDefault();
                          $validator.validate(scope).success(function () {
                              popover.isClickedSave = true;
                              isInCrossmode = true;
                              crossModel = {source: sourcevm , target:undefined, validatorID:validatorID};
                              $builder.parrentApp.displayCrossMode(isInCrossmode, {});

                              return $(element).popover('hide');
                          });
                      },
                      addValidationOption:function($event, sourcevm){

                          var validators = sourcevm.data.model.customModel.validators
                          var validator = {
                              "type":"regex",
                              "validationMessage":"",
                              "validationAction":"",
                              "crossKey":"",
                              "validation": ""
                          }
                          validators.push(validator);
                      },
                      addVideoURL:function($event, sourcevm) {
                          sourcevm.data.model.customModel.videoUrls.push("");
                      },
                      removeValidationOption: function($event, sourcevm, validatorIndex) {
                          sourcevm.data.model.customModel.validators.splice(validatorIndex, 1);
                      },
                      remove: function ($event, sourcevm) {
                          /*
                          The delete event of the popover.
                           */
                          $event.preventDefault();
                          $builder.removeFormObject(scope.$parent.formName, scope.$parent.$index);
                          $(element).popover('hide');
                      },
                      shown: function () {

                          /*
                          The shown event of the popover.
                           */
                          scope.data.backup();
                          return popover.isClickedSave = false;
                      },
                      cancel: function ($event) {

                          /*
                          The cancel event of the popover.
                           */
                          scope.data.rollback();
                          if ($event) {
                              $event.preventDefault();
                              $(element).popover('hide');
                          }
                      },
                    getParrentApp:function() {
                      return $builder.parrentApp;
                      },
                    getCurrentElementScope:function() {
                      $(element).popover('hide');
                      return scope;
                    }

                    };
                  $(element).on('show.bs.popover', function (e) {
                      var $popover, elementOrigin, popoverTop;
                      e.stopPropagation();
                      if ($drag.isMouseMoved()) {
                          return false;
                      }
                      $("div.fb-form-object-editable:not(." + popover.id + ")").popover('hide');
                      $popover = $("form." + popover.id).closest('.popover');
                      if ($popover.length > 0) {
                          elementOrigin = $(element).offset().top + $(element).height() / 2;
                          popoverTop = elementOrigin - $popover.height() / 2;
                          $popover.css({
                              position: 'absolute',
                              top: popoverTop > 0 ? popoverTop : 0
                          });
                          $popover.show();
                          setTimeout(function () {
                              $popover.addClass('in');
                              return $(element).triggerHandler('shown.bs.popover');
                          }, 0);
                          return false;
                      }
                  });
                  $(element).on('shown.bs.popover', function (e) {
                      // e.stopPropagation();
                      if(isInCrossmode)
                      {

                          
                          isInCrossmode = false;

                          var myID = scope.popover.getCurrentElementScope().id;
//                          crossModel.source.customModel = crossModel.source.customModel || {};

                          crossModel.source.customModel.validators[crossModel.validatorID].crossKey = myID

                          scope.popover.getParrentApp().displayCrossMode(isInCrossmode, {});

//                        e.stopPropagation();
                          crossModel = {};

                      }
                      else
                      {
                          $(".popover ." + popover.id + " input:first").select();
                          scope.$apply(function () {
                              return scope.popover.shown();
                          });
                      }
                  });
                  return $(element).on('hide.bs.popover', function () {
                      var $popover;
                      $popover = $("form." + popover.id).closest('.popover');
                      if (!popover.isClickedSave) {
                          if (scope.$$phase || scope.$root.$$phase) {
                              scope.popover.cancel();
                          } else {
                              scope.$apply(function () {
                                  return scope.popover.cancel();
                              });
                          }
                      }
                      $popover.removeClass('in');
                      setTimeout(function () {
                          return $popover.hide();
                      }, 300);
                      return false;
                  });
              }
          };
      }
    ]);

    directives.directive('fbComponents', function () {
        return {
            restrict: 'A',
            template: "<ul ng-if=\"groups.length > 1\" class=\"nav nav-tabs nav-justified\">\n    <li ng-repeat=\"group in groups\" ng-class=\"{active:activeGroup==group}\">\n        <a href='#' ng-click=\"selectGroup($event, group)\">{{group}}</a>\n    </li>\n</ul>\n<div class='form-horizontal'>\n    <div class='fb-component' ng-repeat=\"component in components\"\n        fb-component=\"component\"></div>\n</div>",
            controller: 'fbComponentsController'
        };
    }).directive('fbComponent', [
      '$injector', function ($injector) {
          var $builder, $compile, $drag;
          $builder = $injector.get('$builder');
          $drag = $injector.get('$drag');
          $compile = $injector.get('$compile');
          return {
              restrict: 'A',
              scope: {
                  component: '=fbComponent'
              },
              controller: 'fbComponentController',
              link: function (scope, element) {
                  scope.copyObjectToScope(scope.component);
                  $drag.draggable($(element), {
                      mode: 'mirror',
                      defer: false,
                      object: {
                          componentName: scope.component.name
                      }
                  });
                  return scope.$watch('component.template', function (template) {
                      var view;
                      if (!template) {
                          return;
                      }
                      view = $compile(template)(scope);
                      return $(element).html(view);
                  });
              }
          };
      }
    ]).directive('fbForm', [
      '$injector', function ($injector) {
          return {
              restrict: 'A',
              require: 'ngModel',
              scope: {
                  formName: '@fbForm',
                  input: '=ngModel',
                  "default": '=fbDefault'
              },
              template: "<div class='fb-form-object' ng-repeat=\"object in form\" fb-form-object=\"object\"></div>",
              controller: 'fbFormController',
              link: function (scope, element, attrs) {
                  var $builder, _base, _name;
                  $builder = $injector.get('$builder');
                  if ((_base = $builder.forms)[_name = scope.formName] == null) {
                      _base[_name] = [];
                  }
                  return scope.form = $builder.forms[scope.formName];
              }
          };
      }
    ]);

    directives.directive('fbFormObject', [
    '$injector', function ($injector) {
        var $builder, $compile, $parse;
        $builder = $injector.get('$builder');
        $compile = $injector.get('$compile');
        $parse = $injector.get('$parse');
        return {
            restrict: 'A',
            controller: 'fbFormObjectController',
            link: function (scope, element, attrs) {
                scope.formObject = $parse(attrs.fbFormObject)(scope);
                scope.$component = $builder.components[scope.formObject.component];
                scope.$on($builder.broadcastChannel.updateInput, function () {
                    return scope.updateInput(scope.inputText);
                });
                if (scope.$component.arrayToText) {
                    scope.inputArray = [];
                    scope.$watch('inputArray', function (newValue, oldValue) {
                        var checked, index, _ref;
                        if (newValue === oldValue) {
                            return;
                        }
                        checked = [];
                        for (index in scope.inputArray) {
                            if (scope.inputArray[index]) {
                                checked.push((_ref = scope.options[index]) != null ? _ref : scope.inputArray[index]);
                            }
                        }
                        return scope.inputText = checked.join(', ');
                    }, true);
                }
                scope.$watch('inputText', function () {
                    return scope.updateInput(scope.inputText);
                });
                scope.$watch(attrs.fbFormObject, function () {
                    return scope.copyObjectToScope(scope.formObject);
                }, true);
                scope.$watch('$component.template', function (template) {
                    var $input, $template, view;
                    if (!template) {
                        return;
                    }
                    $template = $(template);
                    $input = $template.find("[ng-model='inputText']");
                    view = $compile($template)(scope);
                    return $(element).html(view);
                });
                if (!scope.$component.arrayToText && scope.formObject.options.length > 0) {
                    scope.inputText = scope.formObject.options[0];
                }
                return scope.$watch("default['" + scope.formObject.id + "']", function (value) {
                    if (!value) {
                        return;
                    }
                    if (scope.$component.arrayToText) {
                        return scope.inputArray = value;
                    } else {
                        return scope.inputText = value;
                    }
                });
            }
        };
    }
    ]);

}).call(this);

(function () {
    angular.module('builder.drag', []).provider('$drag', function () {
        var $injector, $rootScope, delay;
        $injector = null;
        $rootScope = null;
        this.data = {
            draggables: {},
            droppables: {}
        };
        this.mouseMoved = false;
        this.mx = 0;
        this.my = 0;

        this.isMouseMoved = (function (_this) {
            return function () {
                return _this.mouseMoved;
            };
        })(this);
        this.hooks = {
            down: {},
            move: {},
            up: {}
        };
        this.eventMouseMove = function () { };
        this.eventMouseUp = function () { };
        $((function (_this) {
            return function () {
                $(document).on('mousedown', function (e) {
                    var func, key, _ref;
                    _this.mouseMoved = false;
                    _ref = _this.hooks.down;
                    for (key in _ref) {
                        func = _ref[key];
                        func(e);
                    }
                });
                $(document).on('mousemove', function (e) {
                    if (e.pageX == _this.mx && e.pageY == _this.my)
                        return;
                    _this.mx = e.pageX;
                    _this.my = e.pageY;

                    var func, key, _ref;
                    _this.mouseMoved = true;
                    _ref = _this.hooks.move;
                    for (key in _ref) {
                        func = _ref[key];
                        func(e);
                    }
                });
                return $(document).on('mouseup', function (e) {
                    var func, key, _ref;
                    _ref = _this.hooks.up;
                    for (key in _ref) {
                        func = _ref[key];
                        func(e);
                    }
                });
            };
        })(this));
        this.currentId = 0;
        this.getNewId = (function (_this) {
            return function () {
                return "" + (_this.currentId++);
            };
        })(this);
        this.setupEasing = function () {
            return jQuery.extend(jQuery.easing, {
                easeOutQuad: function (x, t, b, c, d) {
                    return -c * (t /= d) * (t - 2) + b;
                }
            });
        };
        this.setupProviders = function (injector) {

            /*
            Setup providers.
             */
            $injector = injector;
            return $rootScope = $injector.get('$rootScope');
        };
        this.checkHover = (function (_this) {
            return function ($elementA, $elementB) {

                /*
                Is element A hover on element B?
                @param $elementA: jQuery object
                @param $elementB: jQuery object
                 */

                /*
                if element B has nested formbuilder, 
                "cave out" that area;
                */


                var isHover, offsetA, offsetB, sizeA, sizeB;
                offsetA = $elementA.offset();
                offsetB = $elementB.offset();
                sizeA = {
                    width: $elementA.width(),
                    height: $elementA.height()
                };
                sizeB = {
                    width: $elementB.width(),
                    height: $elementB.height()
                };
                isHover = {
                    x: false,
                    y: false
                };

                isHover.x = offsetA.left > offsetB.left && offsetA.left < offsetB.left + sizeB.width;
                isHover.x = isHover.x || offsetA.left + sizeA.width > offsetB.left && offsetA.left + sizeA.width < offsetB.left + sizeB.width;



                if (!isHover) {
                    return false;
                }

                isHover.y = offsetA.top > offsetB.top && offsetA.top < offsetB.top + sizeB.height;
                isHover.y = isHover.y || offsetA.top + sizeA.height > offsetB.top && offsetA.top + sizeA.height < offsetB.top + sizeB.height;
                return isHover.x && isHover.y;
            };
        })(this);
        
        this.isHover = (function (_this) {
            return function ($elementA, $elementB) {

                /*
                Is element A hover on element B?
                @param $elementA: jQuery object
                @param $elementB: jQuery object
                 */

                /*
                if element B has nested formbuilder, 
                "cave out" that area;
                */


                //if any of the child container is hovered over, return false
                childContainers = $elementB.find(".fb-builder");
                
                for (i = 0; i < childContainers.length; i++) {
                    childContainer = $(childContainers[i]);
                    targetFormName = childContainer.attr("fb-builder");
                    elementAContainers = $elementA.find(".fb-builder");
                    //if the currnet moving clone has containers, only get the outer most(the first) container
                    if (elementAContainers.length > 0)
                    {
                        dragFormName = elementAContainers.first().attr("fb-builder");
                        //if target and clone match,it is not hover over as it is hover over itself
                        if (dragFormName === targetFormName)
                            continue;
                    }

                    isHoverChildContainer = _this.checkHover($elementA, childContainer);
                    if (isHoverChildContainer)
                        return false;
                }

                
               
                return _this.checkHover($elementA, $elementB);
            };
        })(this);
        delay = function (ms, func) {
            return setTimeout(function () {
                return func();
            }, ms);
        };
        this.autoScroll = {
            up: false,
            down: false,
            scrolling: false,
            scroll: (function (_this) {
                return function () {
                    _this.autoScroll.scrolling = true;
                    if (_this.autoScroll.up) {
                        $('html, body').dequeue().animate({
                            scrollTop: $(window).scrollTop() - 50
                        }, 100, 'easeOutQuad');
                        return delay(100, function () {
                            return _this.autoScroll.scroll();
                        });
                    } else if (_this.autoScroll.down) {
                        $('html, body').dequeue().animate({
                            scrollTop: $(window).scrollTop() + 50
                        }, 100, 'easeOutQuad');
                        return delay(100, function () {
                            return _this.autoScroll.scroll();
                        });
                    } else {
                        return _this.autoScroll.scrolling = false;
                    }
                };
            })(this),
            start: (function (_this) {
                return function (e) {
                    if (e.clientY < 50) {
                        _this.autoScroll.up = true;
                        _this.autoScroll.down = false;
                        if (!_this.autoScroll.scrolling) {
                            return _this.autoScroll.scroll();
                        }
                    } else if (e.clientY > $(window).innerHeight() - 50) {
                        _this.autoScroll.up = false;
                        _this.autoScroll.down = true;
                        if (!_this.autoScroll.scrolling) {
                            return _this.autoScroll.scroll();
                        }
                    } else {
                        _this.autoScroll.up = false;
                        return _this.autoScroll.down = false;
                    }
                };
            })(this),
            stop: (function (_this) {
                return function () {
                    _this.autoScroll.up = false;
                    return _this.autoScroll.down = false;
                };
            })(this)
        };
        this.dragMirrorMode = (function (_this) {
            return function ($element, defer, object) {
                var result;
                if (defer == null) {
                    defer = true;
                }
                result = {
                    id: _this.getNewId(),
                    mode: 'mirror',
                    maternal: $element[0],
                    element: null,
                    object: object
                };
                $element.on('mousedown', function (e) {
                    var $clone;
                    e.preventDefault();
                    $clone = $element.clone();
                    result.element = $clone[0];
                    $clone.addClass("fb-draggable form-horizontal prepare-dragging");
                    _this.hooks.move.drag = function (e, defer) {
                        var droppable, id, _ref, _results;
                        if ($clone.hasClass('prepare-dragging')) {
                            $clone.css({
                                width: $element.width(),
                                height: $element.height()
                            });
                            $clone.removeClass('prepare-dragging');
                            $clone.addClass('dragging');
                            if (defer) {
                                return;
                            }
                        }
                        $clone.offset({
                            left: e.pageX - $clone.width() / 2,
                            top: e.pageY - $clone.height() / 2
                        });
                        _this.autoScroll.start(e);
                        _ref = _this.data.droppables;
                        _results = [];
                        for (id in _ref) {
                            droppable = _ref[id];
                            if (_this.isHover($clone, $(droppable.element))) {
                                _results.push(droppable.move(e, result));
                            } else {
                                _results.push(droppable.out(e, result));
                            }
                        }
                        return _results;
                    };
                    _this.hooks.up.drag = function (e) {
                        var droppable, id, isHover, _ref;
                        _ref = _this.data.droppables;
                        for (id in _ref) {
                            droppable = _ref[id];
                            isHover = _this.isHover($clone, $(droppable.element));
                            droppable.up(e, isHover, result);
                        }
                        delete _this.hooks.move.drag;
                        delete _this.hooks.up.drag;
                        result.element = null;
                        $clone.remove();
                        return _this.autoScroll.stop();
                    };
                    $('body').append($clone);
                    if (!defer) {
                        return _this.hooks.move.drag(e, defer);
                    }
                });
                return result;
            };
        })(this);
        this.dragDragMode = (function (_this) {
            return function ($element, defer, object) {
                var result;
                if (defer == null) {
                    defer = true;
                }
                result = {
                    id: _this.getNewId(),
                    mode: 'drag',
                    maternal: null,
                    element: $element[0],
                    object: object
                };
                $element.addClass('fb-draggable');
                $element.on('mousedown', function (e) {
                    e.preventDefault();
                   //changed so can drag from inside the container
                    if ($element.hasClass('dragging') || $element.find(".prepare-dragging").length) {
                        return;
                    }
                    $element.addClass('prepare-dragging');
                    _this.hooks.move.drag = function (e, defer) {
                        var droppable, id, _ref;
                        if ($element.hasClass('prepare-dragging')) {
                            $element.css({
                                width: $element.width(),
                                height: $element.height()
                            });
                            $element.removeClass('prepare-dragging');
                            $element.addClass('dragging');
                            if (defer) {
                                return;
                            }
                        }
                        $element.offset({
                            left: e.pageX - $element.width() / 2,
                            top: e.pageY - $element.height() / 2
                        });
                        _this.autoScroll.start(e);
                        _ref = _this.data.droppables;
                        for (id in _ref) {
                            droppable = _ref[id];
                            if (_this.isHover($element, $(droppable.element))) {
                                droppable.move(e, result);

                            } else {
                                droppable.out(e, result);
                            }
                        }
                    };
                    _this.hooks.up.drag = function (e) {
                        var droppable, id, isHover, _ref;
                        _ref = _this.data.droppables;
                        for (id in _ref) {
                            droppable = _ref[id];
                            isHover = _this.isHover($element, $(droppable.element));
                            //if move inside the same container, just move
                            //if in or out of the current container, remove from the current, add to the new container
                            droppable.up(e, isHover, result);
                        }
                        delete _this.hooks.move.drag;
                        delete _this.hooks.up.drag;
                        $element.css({
                            width: '',
                            height: '',
                            left: '',
                            top: ''
                        });
                        $element.removeClass('dragging defer-dragging');
                        return _this.autoScroll.stop();
                    };
                    if (!defer) {
                        return _this.hooks.move.drag(e, defer);
                    }
                });
                return result;
            };
        })(this);
        this.dropMode = (function (_this) {
            return function ($element, options) {
                var result;
                result = {
                    id: _this.getNewId(),
                    element: $element[0],
                    move: function (e, draggable) {
                        return $rootScope.$apply(function () {
                            return typeof options.move === "function" ? options.move(e, draggable) : void 0;
                        });
                    },
                    up: function (e, isHover, draggable) {
                        return $rootScope.$apply(function () {
                            return typeof options.up === "function" ? options.up(e, isHover, draggable) : void 0;
                        });
                    },
                    out: function (e, draggable) {
                        return $rootScope.$apply(function () {
                            return typeof options.out === "function" ? options.out(e, draggable) : void 0;
                        });
                    }
                };
                return result;
            };
        })(this);
        this.draggable = (function (_this) {
            return function ($element, options) {
                var draggable, element, result, _i, _j, _len, _len1;
                if (options == null) {
                    options = {};
                }

                /*
                Make the element could be drag.
                @param element: The jQuery element.
                @param options: Options
                    mode: 'drag' [default], 'mirror'
                    defer: yes/no. defer dragging
                    object: custom information
                 */
                result = [];
                if (options.mode === 'mirror') {
                    for (_i = 0, _len = $element.length; _i < _len; _i++) {
                        element = $element[_i];
                        draggable = _this.dragMirrorMode($(element), options.defer, options.object);
                        result.push(draggable.id);
                        _this.data.draggables[draggable.id] = draggable;
                    }
                } else {
                    for (_j = 0, _len1 = $element.length; _j < _len1; _j++) {
                        element = $element[_j];
                        draggable = _this.dragDragMode($(element), options.defer, options.object);
                        result.push(draggable.id);
                        _this.data.draggables[draggable.id] = draggable;
                    }
                }
                return result;
            };
        })(this);
        this.droppable = (function (_this) {
            return function ($element, options) {
                var droppable, element, result, _i, _len;
                if (options == null) {
                    options = {};
                }

                /*
                Make the element coulde be drop.
                @param $element: The jQuery element.
                @param options: The droppable options.
                    move: The custom mouse move callback. (e, draggable)->
                    up: The custom mouse up callback. (e, isHover, draggable)->
                    out: The custom mouse out callback. (e, draggable)->
                 */
                result = [];
                for (_i = 0, _len = $element.length; _i < _len; _i++) {
                    element = $element[_i];

                   // if (!element.classList.contains("DropableDesign") || app.isMirrorDrop) {
                        droppable = _this.dropMode($(element), options);
                        result.push(droppable);
                        _this.data.droppables[droppable.id] = droppable;
                       // app.isMirrorDrop = false;
                   // }
                }
                return result;
            };
        })(this);
        this.get = function ($injector) {
            this.setupEasing();
            this.setupProviders($injector);
            return {
                isMouseMoved: this.isMouseMoved,
                data: this.data,
                draggable: this.draggable,
                droppable: this.droppable
            };
        };
        this.get.$inject = ['$injector'];
        this.$get = this.get;
    });

}).call(this);

(function () {
    angular.module('builder', ['builder.directive']);

}).call(this);


/*
    component:
        It is like a class.
        The base components are textInput, textArea, select, check, radio.
        User can custom the form with components.
    formObject:
        It is like an object (an instance of the component).
        User can custom the label, description, required and validation of the input.
    form:
        This is for end-user. There are form groups int the form.
        They can input the value to the form.
 */

(function () {
    var __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    angular.module('builder.provider', []).provider('$builder', function () {
        var $http, $injector, $templateCache;
        $injector = null;
        $http = null;
        $templateCache = null;
        this.config = {
            popoverPlacement: 'right'
        };
        this.components = {};
        this.groups = [];
        this.broadcastChannel = {
            updateInput: '$updateInput'
        };
        this.forms = {
            "default": []
        };
        this.convertComponent = function (name, component) {
            var result, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9,_ref10,_ref11,_ref12,_ref13,_ref14;
            result = {
                name: name,
                group: (_ref = component.group) != null ? _ref : 'Default',
                label: (_ref1 = component.label) != null ? _ref1 : '',
                description: (_ref2 = component.description) != null ? _ref2 : '',
                placeholder: (_ref3 = component.placeholder) != null ? _ref3 : '',
                editable: (_ref4 = component.editable) != null ? _ref4 : true,
                required: (_ref5 = component.required) != null ? _ref5 : false,
                hasValidation: (_ref6 = component.hasValidation) != null ? _ref6 : false,
                validationOptions: (_ref7 = component.validationOptions) != null ? _ref7 : false,
                options: (_ref8 = component.options) != null ? _ref8 : [],
                arrayToText: (_ref9 = component.arrayToText) != null ? _ref9 : false,
                template: component.template,
                templateUrl: component.templateUrl,
                popoverTemplate: component.popoverTemplate,
                popoverTemplateUrl: component.popoverTemplateUrl,
                isContainer: (_ref10 = component.isContainer) != null ? _ref10 : false,
                templateOptions: (_ref11 = component.templateOptions) != null ? _ref11 : {},
                expressionProperties: (_ref12 = component.expressionProperties) != null ? _ref12 : "",
                noFormControl: (_ref13 = component.noFormControl)!=null?_ref13:true,
                customModel:(_ref14 = component.customModel)!= null ? _ref14 : {}
            };
            if (!result.template && !result.templateUrl) {
                console.error("The template is empty.");
            }
            if (!result.popoverTemplate && !result.popoverTemplateUrl) {
                console.error("The popoverTemplate is empty.");
            }
            return result;
        };
        
        this.convertFormObject = function (name, formObject) {
            var component, result, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12,_ref14;
          
            if (formObject == null) {
                formObject = {};
            }
            /*
            console.log("this.components:")
            console.log(this.components);
             */
            component = this.components[formObject.component];

            if (component == null) {
                throw "The component " + formObject.component + " was not registered.";
            }
            var _newId=name.concat("-" + formObject.component).concat("-" + Math.floor(Math.random() * 9999));
/*
            console.log("generating new id: " + _newId);
            console.log(name);
            console.log(formObject)
            console.log(this.components)
  */          
            result = {
                key: formObject.key,
                component: formObject.component,
                editable: (_ref = formObject.editable) != null ? _ref : component.editable,
                index: (_ref1 = formObject.index) != null ? _ref1 : 0,
                label: (_ref2 = formObject.label) != null ? _ref2 : component.label,
                description: (_ref3 = formObject.description) != null ? _ref3 : component.description,
                placeholder: (_ref4 = formObject.placeholder) != null ? _ref4 : component.placeholder,
                options: (_ref5 = formObject.options) != null ? _ref5 : component.options,
                required: (_ref6 = formObject.required) != null ? _ref6 : component.required,
                hasValidation: (_ref7 = formObject.hasValidation) != null ? _ref7 : component.hasValidation,
                validationOptions: (_ref8 = formObject.validationOptions) != null ? _ref8 : component.validationOptions,
                id: (_ref9 = formObject.id) != null ? _ref9 : _newId,
                isContainer: (_ref8 = formObject.isContainer) != null ? _ref8 : component.isContainer,
                templateOptions: (_ref10 = formObject.templateOptions) != null ? _ref10 : component.templateOptions,
                expressionProperties: (_ref11 = formObject.expressionProperties) != null ? _ref11 : component.expressionProperties,
                noFormControl: (_ref12 = formObject.noFormControl) != null ? _ref12 : component.noFormControl,
                customModel:(_ref14 = formObject.customModel) != null ? _ref14 : component.customModel
            };
            return result;
        };

        this.reindexFormObject = (function (_this) {
            return function (name) {
                var formObjects, index, _i, _ref;
                formObjects = _this.forms[name];
                for (index = _i = 0, _ref = formObjects.length; _i < _ref; index = _i += 1) {
                    //TODO: should be fixed from the source, where those extra components came from
                    if (formObjects[index]) 
                        formObjects[index].index = index;
                    else
                        _this.removeFormObject(name, index);
                    //END TODO
                }
            };
        })(this);

        this.setupProviders = (function (_this) {
            return function (injector) {
                $injector = injector;
                $http = $injector.get('$http');
                return $templateCache = $injector.get('$templateCache');
            };
        })(this);

        this.loadTemplate = function (component) {

            /*
            Load template for components.
            @param component: {object} The component of $builder.
             */
            if (component.template == null) {
                $http.get(component.templateUrl, {
                    cache: $templateCache
                }).success(function (template) {
                     return component.template = template;
                });
            }
            if (component.popoverTemplate == null) {
                 $http.get(component.popoverTemplateUrl, {
                    cache: $templateCache
                }).success(function (template) {
                    component.popoverTemplate = template;
                    //add shared component elements for all components such as the cancel button and 
                    return loadPopoverSharedElements(component);
                });
            }
            else {
                return loadPopoverSharedElements(component);
            }
            
        };


       loadPopoverSharedElements = function (component)
       {
           component.customModel.validators = [];
           component.customModel.videoUrls = component.customModel.videoUrls || [];
           if (component.hasValidation) {
               component.validationOptions=[{label:'show message',action:'message'},{label:'hide element',action:'hide'},{label:'disable element',action:'disable'}];

               component.templateOptions.validatorTypes = [{type:"notEmpty", label:"Not Empty"} , {type:"minLength" , label:"Minimum Length"},{type:"maxLength", label:"Maximum Length"} ,{ type:"minDate", label:"After Date"} ,{type:"maxDate", label:"Before Date"}, {type:"regex", label:"Regular Expression"}]
           }

           var originalHTML = component.popoverTemplate;
           var $originalHTML = $('<div />', { html: originalHTML });
           if (component.noFormControl) {
               $originalHTML.find("form").children().first().prepend("<div class='form-group'><label class='control-label'>id:</label><label />{{id}}</label</div>");
           }


           var validationLoopHTML = 
                   "<div class='form-group' ng-if='hasValidation'>" +
                       "<div ng-repeat=\"validator in customModel.validators\" class='popupValidatorGroup'>" +
                       "<label class='control-label'>Validator Type</label> " +
                   "<select ng-model=\"validator.type\" class='form-control' ng-options=\"option.type as option.label for option in templateOptions.validatorTypes\" ng-init='validator.type = \"regex\"''>" +
                       "</select> " +

                          "<label class='control-label'>Validation Expression</label>" +
                          "<input type='text' ng-model='validator.validation' class='form-control' />" +

                          "<label class='control-label'>Validation action</label> " +
                          "<select ng-model=\"validator.validationAction\" class='form-control' ng-options=\"option.action as option.label for option in validationOptions\" ng-init='validator.validationAction = \"message\"''>" +
                          "</select> " +

                          "<div ng-if='validator.validationAction == \"message\"'>" +
                             "<label class='control-label'>Validation Message</label>" +
                             "<input type='text' ng-model='validator.validationMessage' class='form-control' />" +
                          "</div>" +


                          "<label class='control-label'>Cross Validation</label>" +
                          "<input type='text' ng-model='validator.crossKey' class='form-control' />" +
                          "<input type='button' ng-click='popover.selectCrossKey($event, this, $index)' class='btn btn-default popupValidatorGroupButton' value='select key'/>" + 
                          "<br/>" + 
       
                          "<input type='button' ng-click='popover.removeValidationOption($event, this, $index)' class='btn btn-danger popupValidatorGroupButton' value='remove' />"+
                   "</div> " +
                   "</div>" + 
                   "</div>";

           var validationButtonHTML = "<div id=\"popover_validators\"></div><input type='button' ng-if='hasValidation' ng-click='popover.addValidationOption($event, this)' class='btn btn-default' value='Add validation' />";

           var saveButtonsHTML = "<hr /><div class='form-group'><input type='submit' ng-click='popover.save($event)' class='btn btn-primary' value='Save' /><input type='button' ng-click='popover.cancel($event)' class='btn btn-default' value='Cancel' /><input type='button' ng-click='popover.remove($event, this)' class='btn btn-danger' value='Delete' /></div>"

           $originalHTML.find("form").children(".form-group").last().after(validationLoopHTML);

         $originalHTML.find("form").children(".form-group").last().after(validationButtonHTML);

           $originalHTML.find("form").last().after(saveButtonsHTML);  

           var newHTML = $originalHTML.html();
           return component.popoverTemplate = newHTML;
           
        };


        this.registerComponent = (function (_this) {
            return function (name, component) {
                var newComponent, _ref;
                if (component == null) {
                    component = {};
                }

                /*
                Register the component for form-builder.
                @param name: The component name.
                @param component: The component object.
                    group: {string} The component group.
                    label: {string} The label of the input.
                    description: {string} The description of the input.
                    placeholder: {string} The placeholder of the input.
                    editable: {bool} Is the form object editable?
                    required: {bool} Is the form object required?
                    options: {array} The input options.
                    arrayToText: {bool} checkbox could use this to convert input (default is no)
                    template: {string} html template
                    templateUrl: {string} The url of the template.
                    popoverTemplate: {string} html template
                    popoverTemplateUrl: {string} The url of the popover template.
                 */
                 //console.log("registering component")
                
                if (_this.components[name] == null) {
                    newComponent = _this.convertComponent(name, component);
                    _this.components[name] = newComponent;
                    if ($injector != null) {
                        _this.loadTemplate(newComponent);
                    }
                    if (_ref = newComponent.group, __indexOf.call(_this.groups, _ref) < 0) {
                        _this.groups.push(newComponent.group);
                    }
                } else {
                    console.error("The component " + name + " was registered.");
                }
            };
        })(this);

        this.addFormObject = (function (_this) {
            return function (name, formObject) {
                var _base;
                if (formObject == null) {
                    formObject = {};
                }

                /*
                Insert the form object into the form at last.
                 */
                if ((_base = _this.forms)[name] == null) {
                    _base[name] = [];
                }
                return _this.insertFormObject(name, _this.forms[name].length, formObject);
            };
        })(this);

        this.insertFormObject = (function (_this) {
            return function (name, index, formObject) {
                var _base;
                if (formObject == null) {
                    formObject = {};
                }

                /*
                Insert the form object into the form at {index}.
                @param name: The form name.
                @param index: The form object index.
                @param form: The form object.
                    id: The form object id.
                    component: {string} The component name
                    editable: {bool} Is the form object editable? (default is yes)
                    label: {string} The form object label.
                    description: {string} The form object description.
                    placeholder: {string} The form object placeholder.
                    options: {array} The form object options.
                    required: {bool} Is the form object required? (default is no)
                    [index]: {int} The form object index. It will be updated by $builder.
                @return: The form object.
                 */
                if ((_base = _this.forms)[name] == null) {
                    _base[name] = [];
                }
                if (index > _this.forms[name].length) {
                    index = _this.forms[name].length;
                } else if (index < 0) {
                    index = 0;
                }
                _this.forms[name].splice(index, 0, _this.convertFormObject(name, formObject));
                _this.reindexFormObject(name);
                return _this.forms[name][index];
            };
        })(this);

        this.collectContainerIDs = (function (_this) {
            return function (id) {
                var childIds = [];
                var childrenOfId = _this.forms[id];
                for (var ck in childrenOfId) {
                    var el = childrenOfId[ck]
                    if (el.component == "container") {
                        childIds.push(el.id);
                    }
                }

                var collectedIDs = [];
                for (var k in childIds) {
                    collectedIDs = collectedIDs.concat(_this.collectContainerIDs(childIds[k]));
                }

                return collectedIDs.concat(childIds);
            };
        })(this);

        this.deleteRecursive = (function (_this) {
            return function (containerID) {
                var cids = _this.collectContainerIDs(containerID);
                cids.push(containerID);
                for (var k in cids) {
                    delete _this.forms[cids[k]];
                }
            };
        })(this);

        this.removeFormObject = (function (_this) {
            return function (name, index) {
                /*
                Remove the form object by the index.
                @param name: The form name.
                @param index: The form object index.
                 */
                var formObjects;
                formObjects = _this.forms[name];
                var o = formObjects[0]
                if(o.component == "container") {
                    _this.deleteRecursive(o.id);
                }
                formObjects.splice(index, 1);

                return _this.reindexFormObject(name);
            };
        })(this);
        this.updateFormObjectIndex = (function (_this) {
            return function (name, oldIndex, newIndex) {

                /*
                Update the index of the form object.
                @param name: The form name.
                @param oldIndex: The old index.
                @param newIndex: The new index.
                 */
                var formObject, formObjects;
                if (oldIndex === newIndex) {
                    return;
                }
                formObjects = _this.forms[name];
                formObject = formObjects.splice(oldIndex, 1)[0];
                formObjects.splice(newIndex, 0, formObject);
                return _this.reindexFormObject(name);
            };
        })(this);
        this.$get = [
          '$injector', (function (_this) {
              return function ($injector) {
                  var component, name, _ref;
                  _this.setupProviders($injector);
                  _ref = _this.components;
                  for (name in _ref) {
                      component = _ref[name];
                      _this.loadTemplate(component);
                  }
                  return {
                      config: _this.config,
                      components: _this.components,
                      groups: _this.groups,
                      forms: _this.forms,
                      broadcastChannel: _this.broadcastChannel,
                      registerComponent: _this.registerComponent,
                      addFormObject: _this.addFormObject,
                      insertFormObject: _this.insertFormObject,
                      removeFormObject: _this.removeFormObject,
                      updateFormObjectIndex: _this.updateFormObjectIndex
                  };
              };
          })(this)
        ];
    });

}).call(this);
