
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

    function getValidation(o)
    {
        if(o.validators.length > 0)
        {
            return o.validators[0].expression;
        }
        else
        {
            return "";
        };
    };

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
            var m = { "radio":"radio",
                      "input":"textInput",
                      "dropdown":"select" };
            return (this.getElementType() == "container")? "container" : m[this.getInteractiveType()];
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
        return mapForm(spec, $builder, rootNode);
    }

    function mapElement(node, im) {
        var key = node.getParent().getFullID();
        im[key] = im[key] || [];

        var interactive = node.getElement();
        var q = {
            "editable":true,
            "index":node.id,
            "required":false,
            "isContainer":true,
            "templateOptions":{},
            "expressionProperties":"",
            "noFormControl":true,
        };

        var id = node.getFullID();
        q.id = id;
        q.customModel = {};
        q.options = [];

        if(node.getElementType() != "container")
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
            q.isContainer = false;

            var interactiveType = node.getInteractiveType();
            
            if(interactiveType == "radio")  {
                q.component = "radio";
                for(var l in detail.options)     {
                    var option = detail.options[l]
                    q.options.push(option.label);
                }
            }
            else if(interactiveType == "input") {
                q.component = "textInput";

            }
            else if(interactiveType == "dropdown") {
                q.component = "select";
                for(var l in detail.options) {
                    var option = detail.options[l]
                    q.options.push(option.label);
                }
            }

            im[key].push(q);
        }
        else
        {
            q.label = interactive.label;
            q.validation = "";
            q.placeholder = "";
            q.component = "container";

            im[key].push(q);
            var childNodes = node.getChildren();
            for(var k in childNodes) {
                mapElement(childNodes[k], im); 
            };
        };
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

    function idpAndAngSpec(optionsOrignal, builderForms, recursive) {
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
                    //          idpSpecFromIM(value, key, field, builderForms,fields)
                    newIdpSpecFromIM(value, key, field, builderForms, fields)
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
                    "textInput" : "input" };
        return map[IMElement.component];
    };

    function isDropdown(IMElement)  {
        return interactiveType(IMElement) == "dropdown";
    };
    function isRadio(IMElement)  {
        return interactiveType(IMElement) == "radio";
    };
    function isInput(IMElement)  {
        return interactiveType(IMElement) == "input";
    };
    function isContainer(IMElement)  {
        return IMElement.component == "container";
    };

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
    
    function interactiveDetails(IMElement)
    {
        var o = {
            label:IMElement.label
        }; 

        var postLabel = getPostLabel(IMElement);
        if(postLabel != undefined) {
            o.post_label = postLabel;
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
            o.placeholder = IMElement.placeholder
        };

        return o;
    };

    function elementType(IMElement)
    {
        return isContainer(IMElement)? "container" : "interactive";
    }

    function newIdpSpecFromIM(value, key, IMElement, builderForms, formSoFar) {
        var id = getID();
        var el = 
                {
                    "element_id":id,
                    "element_type":elementType(IMElement),
                };
        if(isContainer(IMElement))
        {

            el.label = IMElement.label;
            el.repeatable = false;
            el.children = idpAndAngSpec(builderForms[IMElement.id], builderForms, true);
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