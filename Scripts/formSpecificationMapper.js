
function mapToFormSpecification(formlySpec , optionsOrignal, builderForms)
{
  var getInteractives = function(anFormlyChild) {
    var interactives = [];
    if(anFormlyChild.type == "input")
    {
      //1input field
      var interactive =   {
        "elementType":"textfield",
        "mappingKey":"k_textfield",
        "validators":[],
        "interactiveDetails": {
          "length":256,
          "label":"Input Test",
          "placeholder": anFormlyChild["templateOptions"]["placeholder"],
          "textfieldType":"text"
        }
      };

      interactives.push(interactive);

    }
    else
    {
      angular.forEach(anFormlyChild, function(anInteractive){
        console.log(anInteractive);

        var interactive =
              {
                "elementType":"textfield",
                "mappingKey":"k_textfield",
                "validators":[],
                "interactiveDetails": {
                  "length":256,
                  "label":"Input Test",
                  "placeholder":"Placeholder",
                  "textfieldType":"text"
                }
              };

        interactives.push(interactive);
      });


    }
    return interactives;

  };

  function getChildren(anFormly)
  {
    var children = [];
    angular.forEach(anFormly,function(anInputObject) {
      var child = {
        "elementId":"10",
        "elementType":"question",
        "description":[],
        "interactives": getInteractives(anInputObject)

      };
      children.push(child);
    });
    return children;
  };

  function getForm(anFormly)
  {
    return {
      "id":0,
      "type":"form",
      "metadata":[],
      "description":[],
      "children": getChildren(anFormly)
    };
  };

  /*
   Form: {
   "id":#ID#,
   "type":"form",
   "metadata":[],//Zusatzinfos wie submit URLs, etc
   "description":[Description,Description,...],
   "children":[Group/Question,Group/Question,...]
   }
   */

  return getForm(formlySpec);

};