// ---------------------------------------------------------------------
//   IDP --> IM
//build IM here!
var imsToUpdate = [];
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
        this.isInline = function(){ return this.element.display_inline;};
        this.getInteractiveType = function(){ return this.element.interactive_type;  };
        this.isRoot = function(){ return this.parent == undefined};
        this.containerType = function(){ return this.element.container_type; };
        this.getFullID = function() { return this.isRoot() ? "default" : this.parent.getFullID() + "-" + this.getMappedName() + "-"+ this.element.element_id };
        this.getMappedName = function(){
            if(this.getElementType() == "container") {
                return "container";
            }
            else if(this.getElementType() == "description")
            {
                if(this.element.description_type == "video")
                {
                    return "video_description";
                }
                else if(this.element.description_type == "link")
                {
                    return "link_description";
                }

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
                    this.children[k].print(indent + 1);
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
            }
        }
        return currentNode;
    }


    function mapIdpSpecToIM(spec,$builder)  {
       imsToUpdate = [];
        var rootNode = buildAst(spec, -1);
        //        console.log("\n\n");
        //        rootNode.print();
        return { metadata:spec.metadata, im:mapForm(spec, $builder, rootNode) };
    }


    function mapForm(spec, $builder, node) {

        var im = {"default":[]};
        var childNodes = node.getChildren();

        for(var k in childNodes)
        {
            mapElement(childNodes[k], im); //container must not recurse, or it needs to create another top entry
        };
        updateReferences(node, im);
        return im;
    };

    function findIMKeyForIDPKey(node, key)
    {
        if(node.element.element_id == key)
        {
            return node.getFullID();
        }
        else
        {

            var id;
            var children = node.getChildren();
            for(var c in children)
            {
                id = findIMKeyForIDPKey(children[c], key);
                if(id != "")
                {
                    return id;
                };
            }
        };
        return "";
    }

    function updateReferences(rootNode, im)
    {
        for(var k in imsToUpdate)
        {
            var o = imsToUpdate[k];
            var idpKey = o.ckey;
            var imKey = findIMKeyForIDPKey(rootNode, idpKey)
            if(imKey == "") {
                console.log(o);
                throw new Error("IM key for idpkey ->" + idpKey + "<- not found");
            }

            var found = false;
            for(var topKey in im)
            {
                for (var imElKey in im[topKey])
                {
                    var imO = im[topKey][imElKey];
                    if(imO.customModel && imO.customModel.validators)
                    {
                        for (var k in imO.customModel.validators) {
                            var imValidator = imO.customModel.validators[k];
                            if(imValidator.crossKey == idpKey) {
                                imValidator.crossKey = imKey;
                                found = true;
                                break;
                            }
                        }


                    }
                    if(found) { break; }
                }
                if(found) { break; };
            }
            if(!found)
            {
                throw new Error("IMKey for IDPKey: " + idpKey + " not found");
            }
        }
    }




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
            q.customModel.inline = node.isInline();
            q.customModel.type = node.containerType();
            q.label = interactive.label;
            q.placeholder = "";

            im[key].push(q);
            var childNodes = node.getChildren();
            for(var k in childNodes) {
                mapElement(childNodes[k], im);
            };
        }
        else if (node.getElementType() == "description" )
        {
            if(node.getElement().description_type == "image")
            {
                q.customModel.url = interactive.url;
            }
            else if(node.getElement().description_type == "video" )
            {
                if(interactive.urls && interactive.urls.length > 0)
                {
                    q.customModel.url = interactive.urls[0];
                }
                else
                {
                    q.customModel.url = [];
                }


            }
            else
            {
                q.customModel.descriptionModel = interactive.text;
            }

            q.label = "";
            q.validation = "";
            q.placeholder = "";
            im[key].push(q);
        }
        else
        {

            q.customModel.validators = getValidators(interactive);


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

    function getValidators(interactive) {
        var validators = [];
        for (var k in interactive.validators) {
            var val = interactive.validators[k];
            validators.push(getValidator(val));
        }
        return validators;
    }

    function getValidator(idpValidator) {
        var validator = {};
        validator.validationMessage = idpValidator.message;
        validator.validationAction = idpValidator.validator_action;

        if (idpValidator.cross_key != undefined) {
            validator.crossKey = getCrossKey(idpValidator);
        }
        validator.validation = idpValidator.expression;

        return validator;
    }

    function getCrossKey(idpValidator) {
        if(idpValidator.cross_key != "") {
            imsToUpdate.push({ckey:idpValidator.cross_key});
        }
        return idpValidator.cross_key
    }

    return {"mapIdpSpecToIM" : mapIdpSpecToIM };
}]);



