app.controller('FormCtrl', ['$http','formlyVersion', 'getOIMConfig', '$scope', '$builder', '$validator', '$timeout','$location', 'constantData', 
function MainCtrl($http, formlyVersion, getOIMConfig, $scope,  $builder, $validator, $timeout, $location, constantData) 
{
    var listName = constantData.appFormDesignListName;

    var vm = this;

    vm.exampleTitle = 'Formly Form Live!'; // add this
  $scope.isFormlyShowScope = true;
    vm.RawFieldCode = function () {

       $scope.rawFieldCode = getOIMConfig.getOIMConfig($scope.forms["default"], $builder.forms).anSpec;
      $scope.formSpecification = getOIMConfig.getOIMConfig($scope.forms["default"], $builder.forms).idpSpec
      //getOIMConfig.getFormSpecification($scope.rawFieldCode, $scope.forms["default"], $builder.forms);
    }
    vm.StartScratch = function () {
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
    var backendURL = 'http://localhost:8080/IDPBackend/rest/form';
        $http({
		 	method: 'POST',
		 	url: backendURL,
		 	data:vm.idpSpec
		}).then(function (response, status) {
			console.log("form spec saved");
			console.log(response.data);
			console.log("");
			alert("saved spec, id:" + response.data);
		},function (error){
			console.log("Error saving form spec: ");
			console.log(error);
			console.log("");
			alert("error: " + error);
		});

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
        var forms;
       
            //no design found, load default form design
             forms = constantData.defaultFormDesign;
        
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
      
        itemData = new Array();
//      loadFormData(itemData);
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

