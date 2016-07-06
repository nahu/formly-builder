
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


// ---------------------------------------------------------------------
//   IDP --> IM 
//build IM here!
app.factory('getEditorConfig',["deepMerge", function (deepMerge) {
    //ast 
    function ASTNode(el) {
        this.parrent = undefined;
        this.element = el;
        this.children = [];
        this.id = -1;
        this.maxID = -1;

        this.getElement = function(){ return this.element};
        this.getParent = function(){ return this.parent;  };
        this.getChildren = function()  { return this.children;  };    
        this.getID = function(){ return this.id };
        this.getMaxID = function(){ return this.maxID; };
        
        this.addNode = function(n) {
            n.parent = this;
            this.children.push(n);
        };

        this.setMaxID = function(maxID) {  this.maxID = maxID; };
        this.setID = function(mid) { this.id = mid  };        
        this.getElementType = function() {  return this.element.element_type;   };
        this.getInteractiveType = function(){ return this.element.interactive_type;  };
        this.isRoot = function(){ return this.parent == undefined};
        this.getFullID = function() { return this.isRoot() ? "default" : this.parent.getFullID() + "-" + this.getMappedName() + "-"+ this.element.element_id };
        this.getMappedName = function(){
            if(this.getElementType() == "container") {
                return "container";
            }
            else if(this.getElementType() == "description")
            {
                return "description";
            }
            else 
            {
                var m = { "radio":"radio",
                          "input":"textInput",
                          "textarea":"textArea",
                          "date":"date",
                          "dropdown":"select",
                        "checkbox":"checkbox"};
                return  m[this.getInteractiveType()];
            }

        };

        this.print = function(indent){
            if(indent == undefined){ indent = 0; };
            console.log("   ".repeat(indent) + "i'm " + this.element.element_type + " id: " + this.element.element_id);
            if(this.children.length > 0) {
                console.log("   ".repeat(indent) + "children:");
                for(var k in this.children) {
                    this.children[k].print(indent+1);
                };
            };
        };        

    };
    
    function buildAst(idp, id)  {
        var currentNode = new ASTNode(idp);
        currentNode.setID(id);
        currentNode.setMaxID(id);
        if(idp.children && idp.children.length > 0)  {  //n has children

            for(var k in idp.children)  {
                
                var childIDP = idp.children[k]
                var childNode = buildAst(childIDP, currentNode.getMaxID() + 1)

                currentNode.setMaxID(childNode.getMaxID());
                currentNode.addNode(childNode);
            };
        };
        return currentNode;
    };


    function mapIdpSpecToIM(spec,$builder)  {
        var rootNode = buildAst(spec, -1);
        //        console.log("\n\n");
        //        rootNode.print();
        return {metadata:spec.metadata ,im:mapForm(spec, $builder, rootNode)};
    }


    function mapForm(spec, $builder, node) {
        var im = {"default":[]};
        var childNodes = node.getChildren();

        for(var k in childNodes)
        {
            mapElement(childNodes[k], im); //container must not recurse, or it needs to create another top entry
        };
        
        return im;
    };

    function mapElement(node, im) {
        var key = node.getParent().getFullID();
        im[key] = im[key] || [];

        var interactive = node.getElement();
        var q = {
            "editable":true,
            "index":node.id,
            "required":false,
            "isContainer":false,
            "templateOptions":{},
            "expressionProperties":"",
            "noFormControl":true,
        };

        var id = node.getFullID();
        q.id = id;
        q.customModel = {};
        q.options = [];
        q.component = node.getMappedName();
        if(node.getElementType() == "container")
        {
            q.isContainer = true;

            q.label = interactive.label;
            q.validation = "";
            q.placeholder = "";

            im[key].push(q);
            var childNodes = node.getChildren();
            for(var k in childNodes) {
                mapElement(childNodes[k], im); 
            };
        }
        else if (node.getElementType() == "description" )        
        {
            if(node.getElement().description_type == "image" ||
               node.getElement().description_type == "video" )
            {
                q.customModel.url = interactive.url;
            } 
            else 
            {
                q.customModel.descriptionModel = interactive.text;
            }

            q.customModel.type = interactive.description_type
            q.label = "";
            q.validation = "";
            q.placeholder = "";
            im[key].push(q);
        }
        else
        {

            q.validation = getValidation(interactive)
            var detail = interactive.interactive_details
            q.label = detail.label;
            
            if(detail.placeholder) {
                q.placeholder = detail.placeholder;
            };
            
            if(interactive.interactive_details.post_label != undefined) {
                q.customModel.postLabel = interactive.interactive_details.post_label
            };

            var interactiveType = node.getInteractiveType();
            
            if(interactiveType == "radio")  {
                for(var l in detail.options)     {
                    var option = detail.options[l]
                    q.options.push(option.label);
                }
            }
            else if(interactiveType == "date") {
                q.customModel.dateFormat = interactive.interactive_details.date_format;
            }
            else if(interactiveType == "dropdown") {
                for(var l in detail.options) {
                    var option = detail.options[l]
                    q.options.push(option.label);
                }
            }

            im[key].push(q);

        };
    }
   

    function getValidation(o)
    {
        if(o.validators == undefined)
        {
            debugger;
        };
        if(o.validators.length > 0)
        {
            return o.validators[0].expression;
        }
        else
        {
            return "";
        };
    };


    return {"mapIdpSpecToIM" : mapIdpSpecToIM };
}]);




// ---------------------------------------------------------------------
//   IM --> IDP 
//build IDP here!
var baseID = 1;
app.factory('getOIMConfig',["deepMerge", function (deepMerge) {


    function idpAndAngSpec(optionsOrignal, builderForms, recursive) {
//        debugger
        if(recursive == undefined)
        {
            recursive = false;
        }

        if(recursive == false)
        {
            baseID = 0;   
        }

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


    function getNestedFields(builderForms, propMetaData, recursive) {
        if(recursive == undefined)
        {
            recursive = false;
        };

        var _fields;
        if (builderForms[propMetaData.id])
            _fields = getNestedFields(builderForms[propMetaData.id], builderForms, recursive);
        else
            _fields = [];
        return _fields;
    }


    function getID() { baseID++; return baseID + ""; }



    //start new mapping
    function validators(IMElement)
    {
        var validators = [];
        if(IMElement.validation != "")
        {

            var id = getID();
            validators.push({
                "element_id": id,
                "validator_name": id,
                "validator_type": "regex",
                "message": "",
                "expression": IMElement.validation
            });
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
    function isDescription(IMElement) { return IMElement.component == "description"; };
    function isImageDescription(IMElement) { return IMElement.customModel.type == "image"; };
    function isVideoDescription(IMElement) { return IMElement.customModel.type == "video"; };
    function isTextDescription(IMElement) { return IMElement.customModel.type == "text"; };
    function isLinkDescription(IMElement) { return IMElement.customModel.type == "link"; };

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
                    "element_id": getID(),
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

    function newIdpSpecFromIM(value, key, IMElement, builderForms, formSoFar) {
        var id = getID();
        var el = {
                    "element_id":id,
                    "element_type":elementType(IMElement),
                 };
        if(isContainer(IMElement))
        {

            el.label = IMElement.label;
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