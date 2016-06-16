"use strict";
//var EditorConfig = injector.get("getEditorConfig");

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
          }
        } else {
          if(o2[k] != o1[k]) {
            acc[k] = "is: ->" + o2[k] + "<- value should be: ->" + o1[k]+"<-";
            mis = true;
          }
        }
      } else {
        acc[k] = "key ->" + k + "<- is missing, value should be: ->" + o1[k]+"<-";
        mis = true;
      }
    }
    return {a:acc,m:mis};
  };

  return rec(obj1, obj2,{}, false).a;
};



function logMissing(ob1,ob2, fullLog)
{
    console.log('actual: ' + JSON.stringify(getMissing(ob1,ob2),null, '\t'));
    console.log('expected' + JSON.stringify(getMissing(ob2,ob1),null, '\t'));
    if(fullLog)
    {
        console.log('full actual: '+ JSON.stringify(ob1, null, '\t'));
        console.log('full expected: '+ JSON.stringify(ob2, null, '\t'));
    };

};



describe('IM from IDP', function () {
    var inputFsJson, outputJson, expectedOutputJson;
    function testJsonMapping_idp_to_im(idpPath, imPath, log = false)
    {
        var input = getJSONFixture(idpPath);
        var result = toIMMapper.mapIdpSpecToIM(input);
        var expected = getJSONFixture(imPath);

        if(angular.equals(expected, result) == false)
        {
            logMissing(result, expected, log);
        };
        expect(result).toEqual(expected);
    }

    beforeEach(module("formlyExample"));

    beforeEach(function () {
        jasmine.getJSONFixtures().fixturesPath='base/idp-editor/tests/testcases/editor';

        inputFsJson = {};
        expectedOutputJson = {};
        outputJson = {};
    });


    var toIMMapper;
    beforeEach(inject(function(_getEditorConfig_) {
        toIMMapper = _getEditorConfig_ ;
    }));


    it("maps empty form ",function(){
        var emptyIdp = {"element_id":"0","element_type":"form","metadata":[],"children":[]};
        var mapped = toIMMapper.mapIdpSpecToIM(emptyIdp);
        expect(mapped).toEqual({default:[]});
    });

    it("maps single textfield from idp to im",function(){
        testJsonMapping_idp_to_im("idp-one_textfield.json",'im-one_textfield.json');
    });


    it("maps two textfield from idp to im",function(){
        testJsonMapping_idp_to_im("idp-two_textfields.json",'im-two_textfields.json');
    });

    it("maps one radio from idp to im",function(){
        testJsonMapping_idp_to_im("idp-one_radio.json",'im-one_radio.json');
    });

    it("maps two radios from idp to im",function(){
        testJsonMapping_idp_to_im("idp-two_radios.json",'im-two_radios.json');
    });

    it("maps single dropdown from idp to im",function(){
        testJsonMapping_idp_to_im("idp-one_select.json","im-one_select.json");
    });

    it("maps two dropdowns from idp to im",function(){
        testJsonMapping_idp_to_im("idp-two_selects.json","im-two_selects.json");
    });

    it("maps a textfield inside a container from idp to im", function(){
        testJsonMapping_idp_to_im("idp-one_input_in_container.json","im-one_input_in_container.json");
    });

    it("maps a textfield inside a container inside a container from idp to im", function(){
        testJsonMapping_idp_to_im("idp-textfield_in_container_in_container.json","im-textfield_in_container_in_container.json");
    });



});




describe('IDP from IM', function () {
  var inputFsJson, outputJson, expectedOutputJson;
    function testJsonMapping(result, expectedpath, log = false)
    {
        var expected = getJSONFixture(expectedpath);

        if(angular.equals(expected, result) == false)
        {
            logMissing(result, expected, log);
        };
        expect(result).toEqual(expected);
    }


  beforeEach(module("formlyExample"));
  var OIMConfigMapper;
  beforeEach(inject(function(_getOIMConfig_) {
    OIMConfigMapper = _getOIMConfig_;
  }));

  beforeEach(function () {
    jasmine.getJSONFixtures().fixturesPath='base/idp-editor/tests/testcases/editor';
    inputFsJson = {};
    expectedOutputJson = {};
    outputJson = {};
  });


    it("maps empty form from IM to IDP",function(){
        var resultIM = OIMConfigMapper.getOIMConfig([], {default:[]});
        var resIdpSpec = resultIM.idpSpec;
        var expectedIdpSpec = {"element_id":"0","element_type":"form","metadata":[],"children":[]};
        expect(resIdpSpec).toEqual(expectedIdpSpec);
    });

    function resultIDPSpecFromBuilderForm(imPath)
    {
        var builderForms = getJSONFixture(imPath)
        var defaultElements = builderForms["default"];
        var resultOIM = OIMConfigMapper.getOIMConfig(defaultElements, builderForms);

        var resIdpSpec = resultOIM.idpSpec;
        return resIdpSpec;
    }

    function resultIDPSpec(imPath)
    {
        return resultIDPSpecFromBuilderForm(imPath);

        var optionsOriginal = getJSONFixture(imPath)
        var resultOIM = OIMConfigMapper.getOIMConfig(optionsOriginal["default"], optionsOriginal);

        var resIdpSpec = resultOIM.idpSpec;

        return resIdpSpec;
    };

  it("maps one textfield",function(){
    var resIdpSpec = resultIDPSpec('im-one_textfield.json');
    testJsonMapping(resIdpSpec, "idp-one_textfield.json");
  });

  it("maps two textfields", function(){
    var resIdpSpec = resultIDPSpec('im-two_textfields.json');
    testJsonMapping(resIdpSpec, "idp-two_textfields.json");
  })

  it("maps one radio with two options",function(){
    var resIdpSpec = resultIDPSpec('im-one_radio.json');
    testJsonMapping(resIdpSpec, "idp-one_radio.json");
  });

  it("maps two radios with two options",function(){
    var resIdpSpec = resultIDPSpec('im-two_radios.json');
    testJsonMapping(resIdpSpec, "idp-two_radios.json");
  });

  it("maps single dropdown with three options",function(){
    var resIdpSpec = resultIDPSpec('im-one_select.json');
    testJsonMapping(resIdpSpec, "idp-one_select.json");
  });

  it("maps two dropdowns with one post_label",function(){
    var resIdpSpec = resultIDPSpec('im-two_selects.json');
    testJsonMapping(resIdpSpec, "idp-two_selects.json", true);
  });

  it("maps a textfield inside a container", function(){
    var resIdpSpec = resultIDPSpecFromBuilderForm('im-one_input_in_container.json');
    testJsonMapping(resIdpSpec, "idp-one_input_in_container.json");
  });

  it("maps a textfields in a container inside a container", function(){
    var resIdpSpec = resultIDPSpecFromBuilderForm('im-textfield_in_container_in_container.json');
    testJsonMapping(resIdpSpec, "idp-textfield_in_container_in_container.json");
  });

});


