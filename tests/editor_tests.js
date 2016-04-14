
console.log(app);

var injector = angular.injector(["ng","formlyExample"]);
var OIMConfigMapper = injector.get("getOIMConfig");
var EditorConfig = injector.get("getEditorConfig");

function getTests()
{


  function writeResult(results) {
    for(var k in results)
    {
      var result = results[k];
      if(result.success)
      {
        $(".tests").append("<p style='background-color:lightgreen'>" + result.info+ ": OK</p>");
      }
      else
      {
        $(".tests").append("<p style='background-color:red'>"
                           + result.info+ ": FAIL, <br/><br/>given:"
                           + JSON.stringify(result.given)
                           + "<br/><br/>expected:"
                           + JSON.stringify(result.expected)
                           + "</p>");
      };
    };


  };


  var tests = [
    function(){
      var resultOIM = OIMConfigMapper.getOIMConfig([], {default:[]});

//angular
      var resAnSpec = resultOIM.anSpec;
      var expectedAnSpec = [];

//idp
      var resIdpSpec = resultOIM.idpSpec;
      var expectedIdpSpec = {"element_id":"0","element_type":"form","metadata":[],"children":[]};


      return [
        {
          success:angular.equals(resAnSpec, expectedAnSpec),
          info:"empty form Angular",
          expected:expectedAnSpec,
          given:resAnSpec
        },
        {
          success:angular.equals(resIdpSpec,expectedIdpSpec),
          info:"empty idp spec",
          expected:expectedIdpSpec,
          given:resIdpSpec
        }
      ];
    }


    /*
     function() {
     var expected = {"id":0,"type":"form","metadata":[],"description":[],"children":[]};
     var res = mapToFormSpecification([],null,null);
     return {success:angular.equals(res, expected), info:"map empty form", expected:expected,given:res};
     },

     function(){

     var expected =
     {
     "id": 0,
     "type": "form",
     "metadata": [],
     "description": [],
     "children": [
     {
     "elementId": "1",
     "elementType": "question",
     "description": [],
     "interactives": [
     {
     "elementType": "textfield",
     "mappingKey": "testKey1",
     "validators": [],
     "interactiveDetails": {
     "length": 256,
     "label": "Input Test",
     "placeholder": "placeholder",
     "textfieldType": "text"
     }
     }
     ]
     }
     ]
     }

     var res = mapToFormSpecification([
     {
     "key": "testKey1",
     "templateOptions": {
     "required": false,
     "label": "Text Input",
     "placeholder": "placeholder"
     },
     "type": "input"
     }
     ],
     null,
     null);

     return {success:angular.equals(res, expected), info:"map one textfield", expected:expected,given:res};


     }
     */
  ];



  return {
    run : function(){
      angular.forEach(tests,function(test){
        var result = test();
        writeResult(result);
      });
    }
  };



};
