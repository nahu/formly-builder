// ---------------------------------------------------------------------
//   IM --> IDP
//build IDP here!
var baseID = 1;
var idMapping = {};
var queuedElements = [];
app.factory('getOIMConfig',["deepMerge", function (deepMerge) {
    function idpAndAngSpec(optionsOrignal, builderForms, recursive) {
        if(recursive == undefined)  {  recursive = false; }
        if(recursive == false) {
            baseID = 0;
            idMapping = {};
            queuedElements = [];
        }
        //debugger;
        var optionsCopy=angular.copy(optionsOrignal);
        var options = optionsCopy || {};
        var form = {};
        var fields = [];

        angular.forEach(options, function (field, index, options) {
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
                    newIdpSpecFromIM(value, key, field, builderForms, fields)
                );
            }
        });
        if(recursive == false)
        {
            //wrap in form
            form.element_id = "0";
            form.element_type = "form";
            form.metadata = {};
            form.children = fields;

            updateIDReferences(fields);
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
        getOIMConfig: idpAndAngSpec,
        getFormSpecification: mapToFormSpecification
    }

    function updateIDReferences(fields)
    {
        for(var k in queuedElements)
        {
            for (var i in idMapping)
            {
                if(idMapping[i] == queuedElements[k].cross_key)
                {
                    queuedElements[k].cross_key = i;
                    break;
                };
            }
        }
    };

    function getNestedFields(builderForms, propMetaData, recursive) {
        if(recursive == undefined) {
            recursive = false;
        };

        var _fields;
        if (builderForms[propMetaData.id])
            _fields = getNestedFields(builderForms[propMetaData.id], builderForms, recursive);
        else
            _fields = [];
        return _fields;
    }


    function getID(IMElement, isInteractive) {
        if(isInteractive == undefined) isInteractive = false;
        baseID++;
        var k = baseID + ""

        if(elementType(IMElement) == "interactive" && isInteractive) {
            for(var i in idMapping)
            {
                if(idMapping[i] == IMElement.id)
                {
                    console.log("registering " + IMElement.id + " twice!");
                }
            }

           idMapping[k] = IMElement.id;
        };
        return k;
    }

    function crosskeyForElement(IMElement) {
        if( IMElement.customModel.crossValidationKey == undefined || IMElement.customModel.crossValidationKey == "") { return "";  }
        else {  return IMElement.customModel.crossValidationKey  }
    }

    function enqueueValidator(validator) {
        if(validator.cross_key.length > 0)
        {
            queuedElements.push(validator);
        };
    }

    //start new mapping
    function validators(IMElement)
    {
        var validators = [];
        if(IMElement.validation != "")
        {
            var id = getID(IMElement, false);
            var msg = IMElement.customModel.validationMessage;
            var v = {
                "element_id": id,
                "validator_name": id,
                "validator_type": "regex",
                "message":  msg? msg : "",
                "expression": IMElement.validation,
                "cross_key": crosskeyForElement(IMElement)
            }
            enqueueValidator(v);
            validators.push(v);
        };
        return validators;
    };

    function interactiveType(IMElement)
    {
        var map = { "radio" : "radio",
                    "select" : "dropdown",
                    "textInput" : "input",
                    "textArea":"textarea",
                    "checkbox":"checkbox",
                    "date":"date"
                  };
        return map[IMElement.component];
    };


    function isDropdown(IMElement) { return interactiveType(IMElement) == "dropdown"; };
    function isRadio(IMElement) { return interactiveType(IMElement) == "radio"; };
    function isInput(IMElement) { return interactiveType(IMElement) == "input"; };
    function isContainer(IMElement) { return IMElement.component == "container"; };
    function isDate(IMElement) { return IMElement.component == "date"; };

    function isDescription(IMElement) {
        return IMElement.component == "description" || isVideoDescription(IMElement)|| isLinkDescription(IMElement) ;
    };

    function isImageDescription(IMElement) { return IMElement.customModel.type == "image"; };
    function isVideoDescription(IMElement) { return IMElement.component == "video_description"; };
    function isTextDescription(IMElement) { return IMElement.component == "description"; };
    function isLinkDescription(IMElement) { return IMElement.component == "link_description"; };

    function interactiveDetailsOptions(IMElement)
    {
        var po = {match:false};

        if(isRadio(IMElement) || isDropdown(IMElement))
        {
            po.match = true;
            po.value = [];
            for (var o in IMElement.options)
            {
                var s = IMElement.options[o];
                po.value.push({
                    "element_id": getID(IMElement),
                    "label": s
                });
            }
        }

        return po;
    };

    function getPostLabel(IMElement) {  return IMElement.customModel.postLabel; }
    function getPlaceholder(IMElement) {
        if(IMElement.component == "checkbox") {
            return undefined
        }
        return IMElement.placeholder;
    }

    function interactiveDetails(IMElement)
    {
        var o = {
            label:IMElement.label
        };

        var postLabel = getPostLabel(IMElement);
        if(postLabel != undefined) {
            o.post_label = postLabel;
        }

        if(isDate(IMElement)) {
            o.date_format = IMElement.customModel.dateFormat;
        }

        var parsedOptions = interactiveDetailsOptions(IMElement);
        if(parsedOptions.match != false)
        {
            o.options = parsedOptions.value;

            if(isDropdown(IMElement))
            {
                o.default_option = 1;
            };
        }
        else
        {
            var ph = getPlaceholder(IMElement);
            if (ph != undefined)
            {
                o.placeholder = ph;
            }

        };

        return o;
    };

    function elementType(IMElement)
    {
        if(isContainer(IMElement))
        {
            return "container";
        }
        else if(isDescription(IMElement))
        {
            return "description";
        }
        else
        {
            return "interactive";
        };
    }

    function displayInline(IMElement)
    {
        if(IMElement.customModel.inline)
        {
            return true;
        }
        return false;
    };

    function containerType(IMElement)
    {
        if(IMElement.customModel.type && IMElement.customModel.type == "tab")
        {
            return "tab"
        } return "normal";
    };

    function newIdpSpecFromIM(value, key, IMElement, builderForms, formSoFar) {
        var id = getID(IMElement, true);
        var el = {
                    "element_id":id,
                    "element_type":elementType(IMElement),
                 };
        if(isContainer(IMElement))
        {
            el.container_type = containerType(IMElement);
            el.label = IMElement.label;
            el.display_inline = displayInline(IMElement);
            el.repeatable = false;
            el.children = idpAndAngSpec(builderForms[IMElement.id], builderForms, true);
        }
        else if(isDescription(IMElement))
        {
            if(isImageDescription(IMElement))
            {
                el.url = IMElement.customModel.url;
                el.description_type = "image";
            }
            else if (isTextDescription(IMElement))
            {
                el.text = IMElement.customModel.descriptionModel;
                el.description_type = "text";
            }
            else if (isVideoDescription(IMElement))
            {
                el.url = IMElement.customModel.url;
                el.description_type = "video";
            }
            else if (isLinkDescription(IMElement))
            {
                el.text = IMElement.customModel.descriptionModel;
                el.description_type = "link";
            }
        }
        else
        {
            el.validators = validators(IMElement);
            el.interactive_details = interactiveDetails(IMElement);
            el.interactive_type = interactiveType(IMElement);
            el.mapping_key = "mappingKey-"+id;
        }

        return el;
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