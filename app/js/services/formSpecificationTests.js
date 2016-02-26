


function getTests()
{


  function writeResult(result) {
    console.log("here");
    if(result.success)
    {
      $(".tests").append("<p style='background-color:lightgreen'>" + result.info+ ": OK</p>");
    }
    else
    {
      $(".tests").append("<p style='background-color:red'>" + result.info+ ": FAIL, <br/><br/>given:"+ JSON.stringify(result.given) + "<br/><br/>expected:"+ JSON.stringify(result.expected)+"</p>");
    };

  };


  var tests = [

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