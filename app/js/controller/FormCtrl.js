


app.controller('FormCtrl', ['$http','formlyVersion', 'getOIMConfig', 'getEditorConfig',
'$scope', '$builder', '$validator', '$timeout','$location', 'constantData', 'editorconnector',
function MainCtrl($http, formlyVersion, getOIMConfig,getEditorConfig, $scope,  $builder, $validator, $timeout, $location, constantData, editorconnector) 
{
	var backendURL = 'http://localhost:8080/IDPBackend/rest/form';
    var vm = this;
    vm.editor = vm.editor || {};
	vm.editor.selectedField = -1;

    vm.editorFields = [{
  				key: "selectedField",
  				type: "select",
  				templateOptions: {
    				label: "Load Form",
    				options: []}}
				];


	editorconnector.loadIDs(function(response, status){

			var ids = response.formList;
			var fields = [];
			for(var k in ids)
			{
				fields.push({
					//"name":"Formular " + ids[k].label,
					"name":ids[k].label,
					"value":ids[k].id
					});
			}
			vm.editorFields[0].templateOptions.options = fields;
	
	});

	vm.loadForm = function(idToLoad) {
		vm.editor.loaded = idToLoad;
		editorconnector.loadForm(idToLoad, function(result){
			var imSpec = getEditorConfig.mapIdpSpecToIM(result, $builder);
			loadFormData(imSpec);
		});
		};

    	
    vm.exampleTitle = 'Formly Form Live!'; // add this
  	$scope.isFormlyShowScope = true;
    vm.RawFieldCode = function () {
       
       $scope.rawFieldCode = getOIMConfig.getOIMConfig($scope.forms["default"], $builder.forms).anSpec;
      $scope.formSpecification = getOIMConfig.getOIMConfig($scope.forms["default"], $builder.forms).idpSpec
      //getOIMConfig.getFormSpecification($scope.rawFieldCode, $scope.forms["default"], $builder.forms);
    }
    vm.StartScratch = function () {
    	vm.editor.selectedField = -1;
        clearForms($scope.forms);

    }
    vm.CopyForm = function () {
       var mapping = getOIMConfig.getOIMConfig($scope.forms["default"], $builder.forms); 

        vm.fields = mapping.anSpec;
        vm.model = getModel($scope.forms["default"]);
        vm.idpSpec = mapping.idpSpec
    };
    saveForm = function (FormsValuePairs,successFunc)
    {
       
    }
    vm.PublishForm = function () {
        
          
    }
    vm.SaveForm = function () {

    }




	

	
    function getModel(form) {
        var obj_model = {};
        var modelName;
        
        angular.forEach(form, function (field) {
            //check if it is not field 
            if (field.noFormControl)
            {

            if (field.key)
                modelName = field.key;
            else 
                modelName = field.id;
            if (field.hasOwnProperty("isContainer") && field["isContainer"])
                //this is an container field
            {
                if (field.hasOwnProperty("component") && field["component"] === "multiField")
                    //this is layout container
                {
                    var containerId = field.id;                 
                   // obj_model[modelName]=getModel($scope.forms[containerId]);
                }
                else
                    {
                var containerId = field.id;
                obj_model[modelName] = [];
                obj_model[modelName].push(getModel($scope.forms[containerId]));
                }
            }
            else if (field.component === "checkbox") {
                obj_model[modelName] = [];
            }
            else {
                obj_model[modelName] = '';
            }
            }
        });
        return obj_model;

    }
   
   
    vm.upload = function() {
        //alert("uploading");
        console.log(vm.idpSpec);
    	if(vm.editor.selectedField == -1)
    	{
    		$http({
		 	method: 'POST',
		 	url: backendURL+"/foobar",
		 	data:vm.idpSpec
		}).then(function (response, status) {
			console.log("form spec saved");
			console.log(response.data);
			console.log("");
			vm.editor.selectedField = parseInt(response.data.identifier);
			alert("saved spec, id:" + response.data.identifier);
		},function (error){
debugger;
			console.log("Error saving form spec: ");
			console.log(error);
			console.log("");
			alert("error: uploading");
		});
    	}
    	else
    	{
    		$http({
			 	method: 'PUT',
			 	url: backendURL + "/" + vm.editor.selectedField,
		 		data:vm.idpSpec
			}).then(function (response, status) {
				console.log(response.data);
				console.log("");
				//alert("updated spec, id:" + vm.editor.selectedField);
			},function (error){
				console.log("Error updating form spec: ");
				console.log(error);
				console.log("");
				alert("error: " + error);
			});
    	}
    
    	

    }

   
    getDesignForm=function()
    {
      
       
    }

    function clearForms(forms) {
        angular.forEach(forms, function (form, formName, obj) {
            //clear out existing form components
            clearForm(formName);          
        });
    }
    loadFormData = function (itemData) {
        var forms = itemData;
       
            //no design found, load default form design
        //     forms = constantData.defaultFormDesign;
        
        angular.forEach(forms, function (form, formName, obj) {
            //clear out existing form components
            clearForm(formName);
                angular.forEach(form, function (component) {
                    $builder.insertFormObject(formName, component.index, component);
                });
            });
       
    }



    clearForm = function (formName) {
        if ($builder.forms[formName])
        $builder.forms[formName].length=0;
       // existForm.length = 0;
        //angular.forEach(existForm, function (component) {
        //    $builder.removeFormObject(formName, 0);
        //});
      
    };




    var inProcess = false;
    init = function () {
        //clear all forms first for back navigation button
        //$builder.forms = {};
        $scope.forms = $builder.forms;
      

      $scope.$watch('forms', function (newValue, oldValue) {

        if (!inProcess) {
          inProcess = true;
          $timeout(function () {
            try {
              vm.CopyForm();
              vm.RawFieldCode();
            }
            catch (e) {
              console.log(e);
            }
            inProcess = false;
          }, 1000);
        }

      }, true);
      
    }

    init();

}]);

