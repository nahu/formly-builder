
app.constant('deepMerge', (function () {
  var objectPrototype = Object.getPrototypeOf({});
  var arrayPrototype = Object.getPrototypeOf([]);

  return deepMerge;

  function deepMerge() {
    var res = arguments[0];
    angular.forEach(arguments, function (src, index) {
      if (src && (index > 0 || false)) {
        angular.forEach(src, function (val, prop) {
          if (typeof val === "object" && val !== null && isObjectOrArrayLike(val)) {
            var deepRes = res[prop];
            if (!deepRes && Array.isArray(val)) {
              deepRes = [];
            } else if (!deepRes) {
              deepRes = {};
            }
            res[prop] = deepMerge(deepRes, val);
          } else {
            res[prop] = val;
          }
        });
      }
    });
    return res;
  }

  function isObjectOrArrayLike(val) {
    var proto = Object.getPrototypeOf(val);
    return proto === objectPrototype || proto === arrayPrototype;
  }
})());


app.factory('getEditorConfig',["deepMerge", function (deepMerge) {
  function mapIdpSpecToIM(spec,$builder)
  {
    var c = 0;
    var def = [];

    var children = spec.children;
    for(var k in children)
    {
      var container = children[k];
      for(var i in container.children)
      {
        var interactivechild = container.children[i];

        var q = {
          "editable":true,
          "index":c,
          "description":"description",
          "required":false,
          "validation":"/.",
          "isContainer":false,
          "templateOptions":{},
          "expressionProperties":"",
          "noFormControl":true,
          "$$hashKey":"object:33"
        };

        var detail = interactivechild.interactive_details
        q.label = detail.label;
        q.placeholder = detail.placeholder
        q.options = [];
        
        if(interactivechild.interactive_type == "radio")
        {
          q.component = "radio";
          for(var l in detail.options)
          {
            var option = detail.options[l]
            q.options.push(option.label);
          }
          
        }
        else if(interactivechild.interactive_type == "input")
        {
          q.component = "textInput";
        }
        else if(interactivechild.interactive_type == "dropdown")
        {
          q.component = "select";
           for(var l in detail.options)
          {
            var option = detail.options[l]
            q.options.push(option.label);
          }
        }

        q.id = "default-" + q.component + "-" + Math.floor(Math.random() * 9999);
        def.push(q);
        c++;
      }
    }

    var im = { "default":def };                
    return im;
  }

  return {"mapIdpSpecToIM" : mapIdpSpecToIM };
}]);

/*
 * This is where the magic of OIM comes into play, we generate the field
 * config based on the values in the model. You would write this function
 * to generate the config based on the config format of your server's model
 * meta data.
 */
var baseID = 1;

app.factory('getOIMConfig',["deepMerge", function (deepMerge) {

  function getOIMConfig(optionsOrignal, builderForms) {
    baseID = 1;

    optionsCopy=angular.copy(optionsOrignal);
    options = optionsCopy || {}; 
    var form = {};
    var fields = [];
    
    angular.forEach(options, function (field, index, options) {
      
      // var field = angular.copy(fieldOriginal);
      if (!field.noFormControl)
      {
        var content = {                
          template: field.templateOptions.htmlContent == undefined ? " " : field.templateOptions.htmlContent
        };
        fields.push(content);        
      }
      else{
        var key;
        if (field.key)
          key = field.key;
        else if (field.id)
          key = field.id;
        var value = "";
        fields.push(getOptionsFromValue(value, key, field, builderForms));
      }
    });

    form.element_id = "0";
    form.element_type = "form";
    form.metadata = [];
    form.children = fields;
    
    return {
      anSpec:angularFromIDPSpec(form),
      idpSpec:form
    };
  };

  return {
    getOIMConfig: getOIMConfig,
    getFormSpecification: mapToFormSpecification

  }






  function getNestedFields(builderForms, propMetaData) {
    var _fields;
    if (builderForms[propMetaData.id])
      _fields = getOIMConfig(builderForms[propMetaData.id], builderForms);
    else
      _fields = [];
    return _fields;
  }

  function getID() { baseID++; return baseID + ""; }
  
  //Build element
  function getOptionsFromValue(value, key, propMetaData, builderForms) {
    //get label
    var label, placeholder;
    if (propMetaData.label)
      label = propMetaData.label;
    else
      label= makeHumanReadable(key);

    //get placeholder
    if (propMetaData.placeholder!="")
      placeholder = propMetaData.placeholder;

    var commonOptions = {
      //key: key,
      //templateOptions: {},
      element_id:getID(),
      element_type:"container",
      children:[]
      
    };

    if (propMetaData.hasOwnProperty('expressionProperties') && propMetaData.expressionProperties) {
      commonOptions.expressionProperties = angular.fromJson("{"+propMetaData.expressionProperties+"}");
    }
    //         if (propMetaData.hasOwnProperty('templateOptions')) {
    //             commonOptions.templateOptions = propMetaData.templateOptions;
    //         }
    //         if (propMetaData.hasOwnProperty('required')) {
    //             commonOptions.templateOptions.required = propMetaData.required;
    //         }
    
    //         if (!commonOptions.templateOptions.label)
    //             commonOptions.templateOptions.label = label;

    //         commonOptions.templateOptions.placeholder= placeholder;
    

    var typeOf = propMetaData.component || typeof value;
    var typeOptions = {};
    
    switch (typeOf) {
      //case 'htmlContent': {

      //    typeOptions = {
      //        template: propMetaData.templateOptions.htmlContent
      //    };
      //    return typeOptions;
      //    break;
      //}
    case 'textInput': {
      var interactive = {
        element_id : getID(),
        interactive_type: "input",
        mapping_key:"mappingKey-1",
        element_type: "interactive",
        validators:[propMetaData.validation],
        interactive_details:
        {
          label: propMetaData.label,
          placeholder : propMetaData.placeholder
        }
      };
      commonOptions.children.push(interactive);
    }
      break;
    case 'radio':
      {
        var radioOptions = [];
        for (var k in propMetaData.options)
        {
          var value = propMetaData.options[k];
          radioOptions.push(
            {
              label : value
            });
        }
        var interactive = {
          element_id : getID(),
          interactive_type: "radio",
          mapping_key:"mappingKey-1",
          element_type: "interactive",
          validators:[propMetaData.validation],
          interactive_details:
          {
            label: propMetaData.label,
            placeholder : propMetaData.placeholder,
            options : radioOptions
          }
        };
        commonOptions.children.push(interactive);
      }
      break;

    case "select":
      {
        var interactive = {
          element_id : getID(),
          element_type: "interactive",

          interactive_type: "dropdown",
          mapping_key:"mappingKey-1",
          
          validators:[propMetaData.validation],

          interactive_details:
          {
            defaultOption:1,
            label:propMetaData.label,
            options:[]
          }
        };
        var selectOptions = [];
        for (var k in propMetaData.options)
        {
          var value = propMetaData.options[k];
          var so = {

            "element_id"  : getID(),
            "label" : value
          };
          selectOptions.push(so);
        }


        interactive.interactive_details.options = selectOptions;
        commonOptions.children.push(interactive);

      }
      break;
      case "description":
      {
        var descriptionEl = {
          element_id : getID(),
          element_type: "description",
          description_type:"text",
          text:propMetaData.customModel.descriptionModel
        }
        commonOptions.children.push(descriptionEl);

      }
      break;

      /*
       {
       "element_id": "1",
       "element_type": "form",
       "metadata": [],
       "children": [
       {
       "element_id": "11",
       "element_type": "interactive",
       "interactive_type": "dropdown",
       "interactive_details": {
       "defaultOption": 1,
       "label": "Dropdown Test",
       "options": [
       {
       "element_id": "111",
       "label": "First option"
       },
       {
       "element_id": "112",
       "label": "Second option"
       },
       {
       "element_id": "113",
       "label": "Third option"
       }
       ]
       },
       "mapping_key": "k_dropdown",
       "validators": []
       }
       ]
       }
       */


    case 'currentUser': {

      typeOptions = {
        type: 'currentUser'
        

      };

      break;
    }
    case 'repeatSection': {
      
      typeOptions = {
        type: 'repeatSection',
        templateOptions: {
          fields: getNestedFields(builderForms, propMetaData),
          btnText:propMetaData.templateOptions.btnText//'Add another investment'
        }
        
        
      };

      break;
    }
    case 'multiField': {
      
      typeOptions = {
        type: 'multiField',
        templateOptions: {
          fields: getNestedFields(builderForms, propMetaData)
        }
      };

      break;
    }
    case 'radioFlat': {
      typeOptions = {
        type: 'radioFlat',
        'defaultValue':'Yes',
        templateOptions: {
          options: propMetaData.options.map(function (option) {
            return {
              name: makeHumanReadable(option),
              value: option
            };
          }),
          keyProp: name,
          valueProp:value
        }
      };

      break;
    }
    case 'button': {
      typeOptions = {
        type: 'formButton'

      };
      break;
    }
    case 'select':
      {
        typeOptions = {
          type: 'select',
          templateOptions: {
            options: propMetaData.options.map(function (option) {
              return {
                name: makeHumanReadable(option),
                value: option
              };
            })
          }
        };
        break;
      }
      
    case 'enum': {
      var totalOptions = propMetaData.options.length;
      var type = 'radio';
      if (totalOptions > 5) {
        type = 'select';
      }
      typeOptions = {
        type: type,
        templateOptions: {
          options: propMetaData.options.map(function (option) {
            return {
              name: makeHumanReadable(option),
              value: option
            };
          })
        }
      };
      break;
    }
    case 'linkedOptions': {
      typeOptions = {
        type: 'linkedSelect'
      };
      break;

    }
    case 'linkDropDownOptions': {
      typeOptions = {
        type: 'linkDropDown'
      };
      break;

    }
    case 'textareaReadonly': {
      typeOptions = {
        type: 'textareaReadonly'
      };
      break;
    }

    case 'checkbox': {
      typeOptions = {
        type: 'checkBoxList',
        templateOptions:{
          options: propMetaData.options
        }
      };
      break;
    }

    case 'linkDropDown': {
      var parentFieldName = propMetaData.parentFieldName;
      if (parentFieldName) {
        var displayFieldName = propMetaData.displayFieldName;
        var parentFieldModel = propMetaData.parentFieldModel;
        var totalOptions = propMetaData.options.length;
        var type = 'radio';
        if (totalOptions > 5) {
          type = 'select';
        }
        childoptions = [];
        angular.forEach(propMetaData.options, function (option) {
          if (option[parentFieldName] == parentFieldModel) {
            angular.forEach(option[displayFieldName], function (optionvalue) {
              var obj = { name: makeHumanReadable(optionvalue), value: optionvalue };
              childoptions.push(obj);
            }

                           )

          }


        });


        typeOptions = {
          type: type,
          templateOptions: {
            options: childoptions
          }
        };
      }
      else {
        var displayFieldName = propMetaData.displayFieldName;
        var totalOptions = propMetaData.options.length;
        var type = 'radio';
        if (totalOptions > 5) {
          type = 'select';
        }
        typeOptions = {
          type: type,
          templateOptions: {
            options: propMetaData.options.map(function (option) {
              return {
                name: makeHumanReadable(option[displayFieldName]),
                value: option
              };
            })
          }
        };
      }
      break;
    }

    case 'boolean': {
      typeOptions = {
        type: 'checkbox'
      };
      break;
    }
    case 'number': {
      typeOptions = {
        type: 'input',
        templateOptions: { type: 'number' }
      };
      break;
    }

    case 'datePicker': {
      typeOptions = {
        type: 'date'
      };
      break;
    }
    case 'linkText': {
      var parentMode = propMetaData.parentMode;
      var displayField = propMetaData.displayField;

      typeOptions = {
        type: 'linkText',
        /*expressionProperties: {
         'templateOptions.value':'model.'+parentMode
         },*/
        templateOptions: {
          disabled: true
        }

      };


      break;
    }
    case 'textArea':
      {
        typeOptions = {
          type: 'textarea'
        };
        break;
      }
    case 'file':
      {
        typeOptions = {
          type: 'file',
          templateOptions: {

          }
        };
        break;


      }
    case 'string':
    default:
      var type = (value && value.length) > 80 ? 'textarea' : 'input';
      typeOptions = { type: type };
    }
    var o = deepMerge(commonOptions, typeOptions, propMetaData.formlyOptions); 
    
    return o;
  }

  function makeHumanReadable(key) {
    if (key) {
      var words = key.match(/[A-Za-z][a-z]*/g);
      return words.map(capitalize).join(" ");
    }
    else
      return "";
  }

  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.substring(1);
  }
}

        ]);