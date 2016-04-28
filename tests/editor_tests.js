
function getMissing(obj1, obj2) {

  function getClass(obj) {
    if (typeof obj === "undefined")
      return "undefined";
    if (obj === null)
      return "null";
    return Object.prototype.toString.call(obj)
      .match(/^\[object\s(.*)\]$/)[1];
  }

  function rec(o1, o2, acc, mis) {
    for (var k in o1) {
      if(o2.hasOwnProperty(k)) {
        var c = getClass(o1[k]);
        if(c === "Object" || c === "Array") {
          acc[k] = (c === "Object")? {} : [];
          var r = rec(o1[k],o2[k],acc[k], false);
          if(r.m == false) {
            delete acc[k];
          } else {
            mis = true
          };
        };
      } else {
        acc[k] = "--missing--";
        mis = true;
      }
    };
    return {a:acc,m:mis};
  };
  return rec(obj1, obj2,{}, false).a;
};

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
                           + result.info+ ": FAIL, <br/><br/>given----:"
                           + JSON.stringify(result.given)
                           + "<br/><br/>expected:"
                           + JSON.stringify(result.expected)
                           + "<br/><br/>missing in actual:"
                           + JSON.stringify(getMissing(result.expected,result.given))
                           + "<br/><br/>missing in expected:"
                           + JSON.stringify(getMissing(result.given,result.expected))
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
    },

    function(){ //one textfield
      var optionsOriginal = [{"component":"textInput",
                              "editable":true,
                              "index":0,
                              "label":"Text Input",
                              "description":"description",
                              "placeholder":"placeholder",
                              "options":[],
                              "required":false,
                              "validation":"/.*/",
                              "id":"default-textInput-1188",
                              "isContainer":false,
                              "templateOptions":{},
                              "expressionProperties":"",
                              "noFormControl":true,
                              "customModel":{},
                              "$$hashKey":"object:50"}];

      var builderForms = {"default":[optionsOriginal[0]]};

      var resultOIM = OIMConfigMapper.getOIMConfig(optionsOriginal, builderForms);

      //angular
      var resAnSpec = resultOIM.anSpec;
      var expectedAnSpec = [{"type":"input",
                             "key":"mappingKey-1",
                             "templateOptions": {
                               "label":"Text Input",
                               "placeholder":"placeholder"
                             },
                             "validators":{},
                             "expressionProperties":{}
                            }];

      //idp
      var resIdpSpec = resultOIM.idpSpec;
      var expectedIdpSpec = {"element_id":"0",
                             "element_type":"form",
                             "metadata":[],
                             "children":[
                               {
                                 "element_id":"2",
                                 "mapping_key":"mappingKey-1",
                                 "element_type":"interactive",
                                 "validators":["/.*/"],
                                 "interactive_details": {
                                   "label":"Text Input",
                                   "placeholder":"placeholder"
                                 },
                                 "interactive_type":"input"
                               }]
                            };
      return [
        {
          success:angular.equals(resAnSpec, expectedAnSpec),
          info:"single textfield Angular",
          expected:expectedAnSpec,
          given:resAnSpec
        },
        {
          success:angular.equals(resIdpSpec,expectedIdpSpec),
          info:"single textfield idp spec",
          expected:expectedIdpSpec,
          given:resIdpSpec
        }
      ];
    },



    function (){ // single textfield from IDP to IM
      var idpSpec = {
        "element_id":"5",
        "element_type":"form",
        "metadata":[],
        "children":[
          {
            "element_id":"11",
            "element_type":"interactive",
            "interactive_type":"input",
            "interactive_details":{
              "input_type":"text",
              "label":"Input Test 1",
              "length":256,
              "placeholder":"Placeholder 1"
            },
            "mapping_key":"k_input1",
            "validators":[]
          }
        ]
      };
      var builder = {};
      var resultIM = EditorConfig.mapIdpSpecToIM(idpSpec,builder);

      var expectedModel = {"default": [
        {
          "component":"textInput",
          "editable":true,
          "index":0,
          "label":"Input Test 1",
          "description":"description",
          "placeholder":"Placeholder 1",
          "options":[],
          "required":false,
          "validation":"/.*/",
          "id":"11",
          "isContainer":false,
          "templateOptions":{},
          "expressionProperties":"",
          "noFormControl":true,
          "customModel":{},
        }]
                          };

      return [
        {
          success:angular.equals(resultIM, expectedModel),
          info:"single textfield IDP to IM",
          expected:expectedModel,
          given:resultIM
        }
      ];
    },
    function(){//a textfield and a textfield in a container

      var idpSpec = {
        "element_id":"5",
        "element_type":"form",
        "metadata":[],
        "children":[
          {
            "element_id":"11",
            "element_type":"interactive",
            "interactive_type":"input",
            "interactive_details":{
              "input_type":"text",
              "label":"Input Test 1",
              "length":256,
              "placeholder":"Placeholder 1"
            },
            "mapping_key":"k_input1",
            "validators":[]
          },
          {
            "element_id":"12",
            "element_type":"container",
            "repeatable": false,
            "children":[
              {
                "element_id":"13",
                "element_type":"interactive",
                "interactive_type":"input",
                "interactive_details":{
                  "input_type":"text",
                  "label":"Input Test 2",
                  "length":256,
                  "placeholder":"Placeholder 2"
                },
                "mapping_key":"k_input2",
                "validators":[]
              }
            ]
          },

        ]
      };
      var builder = {};
      var resultIM = EditorConfig.mapIdpSpecToIM(idpSpec,builder);

      var expectedModel = {
        "default": [
          {
            "component":"textInput",
            "editable":true,
            "index":0,
            "label":"Input Test 1",
            "description":"description",
            "placeholder":"Placeholder 1",
            "options":[],
            "required":false,
            "validation":"/.*/",
            "id":"11",
            "isContainer":false,
            "templateOptions":{},
            "expressionProperties":"",
            "noFormControl":true,
            "customModel":{},
          }]
      };

      return [
        {
          success:angular.equals(resultIM, expectedModel),
          info:"single textfield IDP to IM",
          expected:expectedModel,
          given:resultIM
        }
      ];

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
