
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


//build IM here!
app.factory('getEditorConfig',["deepMerge", function (deepMerge) {
  function mapIdpSpecToIM(spec,$builder)
  {
    var c = 0;
    var def = [];

    var children = spec.children;
    for(var k in children)
    {
      var interactive = children[k];

        var interactivechild = interactive;

        var q = {
          "editable":true,
          "index":c,
          "description":"description",
          "required":false,
          "validation":"/.*/",
          "isContainer":false,
          "templateOptions":{},
          "expressionProperties":"",
          "noFormControl":true,
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
          q.customModel = {};
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

      if(interactive.element_id)
      {
        q.id = interactive.element_id;
      }
      else
      {
        q.id = "default-" + q.component + "-" + Math.floor(Math.random() * 9999);
      };
        
        def.push(q);
        c++;
      
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

  function idpAndAngSpec(optionsOrignal, builderForms, recursive = false) {
    baseID = 0;
    //debugger;
    var optionsCopy=angular.copy(optionsOrignal);
    var options = optionsCopy || {}; 
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
        fields.push(
//          idpSpecFromIM(value, key, field, builderForms,fields)
          newIdpSpecFromIM(value, key, field, builderForms,fields)
        );
      }
    });
    if(recursive == false)
    {
      //wrap in form
      form.element_id = "0";
      form.element_type = "form";
      form.metadata = [];
      form.children = fields;
      
      return {
        anSpec:angularFromIDPSpec(form),
        idpSpec:form
      };
    }
    else
    {
      return fields;
    };
  };

  return {
    getOIMConfig:idpAndAngSpec,
    getFormSpecification: mapToFormSpecification

  }


  function getNestedFields(builderForms, propMetaData, recursive = false) {
    var _fields;
    if (builderForms[propMetaData.id])
      _fields = getNestedFields(builderForms[propMetaData.id], builderForms, recursive);
    else
      _fields = [];
    return _fields;
  }


  function getID() { baseID++; return baseID + ""; }


  function validators(IMElement)
  {
    var validators = [];
    if(IMElement.validation != "")
    {
      validators.push(IMElement.validation);
    };
    return validators;
  };

  function interactiveType(IMElement)
  {
    if(IMElement.component == "radio")
    {
      return "radio";
    }
    else
    {
      return "input"
    };
  };

  function interactiveDetailsOptions(IMElement)
  {
    var po = {match:false};
    if(interactiveType(IMElement) == "radio")
    {
      po.match = true;
      po.value = [];
      for (var o in IMElement.options)
      {
        var s = IMElement.options[o];
        po.value.push({
          "element_id": getID(),
          "label": s
        });
      };
    };
    return po;
  };

  function interactiveDetails(IMElement)
  {

    var o = {
      label:IMElement.label,
    }; 

    var parsedOptions = interactiveDetailsOptions(IMElement);
    if(parsedOptions.match != false)
    {
      o.options = parsedOptions.value; 
    }
    else
    {
      o.placeholder = IMElement.placeholder
    };


    return o;
  };

  function newIdpSpecFromIM(value, key, IMElement, builderForms, formSoFar) {
    var id = getID();
    
    
    var el = 
    {
      "element_id":id,
      "mapping_key":"mappingKey-"+id,
      "element_type":"interactive",
      "validators": validators(IMElement),
      "interactive_details": interactiveDetails(IMElement),
      "interactive_type": interactiveType(IMElement)
    };


    
    return el;
  }


  //Build IM Element
  function idpSpecFromIM(value, key, propMetaData, builderForms, formSoFar) {
    //get label
    var label, placeholder;
    if (propMetaData.label)
      label = propMetaData.label;
    else
      label= makeHumanReadable(key);

    //get placeholder
    if (propMetaData.placeholder!="")
      placeholder = propMetaData.placeholder;

    var element = {};
  var commonOptions = {};

    if (propMetaData.hasOwnProperty('expressionProperties') && propMetaData.expressionProperties) {
      commonOptions.expressionProperties = angular.fromJson("{"+propMetaData.expressionProperties+"}");
    }

    var typeOf = propMetaData.component || typeof value;
    var typeOptions = {};
   
    commonOptions.customModel = {};
    commonOptions.customModel.foobar = function(){alert('ere');};
    commonOptions.element_id = getID();
    commonOptions.mapping_id = propMetaData.id;
    if(propMetaData.isContainer)
    {
      //recursive
      commonOptions.element_type = "container";
      commonOptions.children = [];
      commonOptions.repeatable = false;
      console.log("here");
      var foo = getNestedFields(builderForms, propMetaData, true);
      commonOptions.children = foo;
      console.log(foo);
      //debugger;
    }
    else
    {
      debugger

      commonOptions.mapping_key="mappingKey-1";
      commonOptions.element_type = "interactive";
      commonOptions.validators = [
        {
          element_id:"?",
          validator_name:"test",
          validator_type:"custom",
          test:{ 
            message: "",
            expression:""
          },        
          expression:propMetaData.validation
        }
      ];//= [propMetaData.validation];
      commonOptions.interactive_details =  { 
        label: propMetaData.label, 
        postLabel:propMetaData.postLabel,
        placeholder : propMetaData.placeholder
      }


      switch (typeOf) 
      {
      case 'textInput': {
        commonOptions.interactive_type = "input";
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
          commonOptions.interactive_type = "radio";
          commonOptions.interactive_details.options = radioOptions;
        }
        break;

      case "select":
        {


          commonOptions.interactive_type = "dropdown";
          commonOptions.interactive_details.options=[];
          commonOptions.interactive_details.defaultOption=1;
          
          
          var selectOptions = [];
          for (var k in propMetaData.options)
          {
            var value = propMetaData.options[k];
            var so = {

              "element_id"  : getID(),
              "label" : value
            };
            commonOptions.interactive_details.options.push(so);
          }


        }
        break;
      case "description":
        {
          commonOptions.interactive_type = "description";
          commonOptions.description_type = "text";
          commonOptions.text =customModel.descriptionModel; 
          
        }
        break;

      case "container":
        {
          commonOptions.interactive_type = "container";
          
          
        }
        break;
        
        /*
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
    */
//     case 'multiField': {
      
//       typeOptions = {
//         type: 'multiField',
//         templateOptions: {
//           fields: getNestedFields(builderForms, propMetaData)
//         }
//       };

//       break;
//     }
//     case 'radioFlat': {
//       typeOptions = {
//         type: 'radioFlat',
//         'defaultValue':'Yes',
//         templateOptions: {
//           options: propMetaData.options.map(function (option) {
//             return {
//               name: makeHumanReadable(option),
//               value: option
//             };
//           }),
//           keyProp: name,
//           valueProp:value
//         }
//       };

//       break;
//     }
   
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
    }
      
  }


    
    var o = deepMerge(commonOptions, typeOptions, propMetaData.formlyOptions); 
    //debugger;
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