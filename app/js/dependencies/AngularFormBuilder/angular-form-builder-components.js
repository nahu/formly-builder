(function() {

  angular.module('builder.components', ['builder', 'validator.rules']).config([
    '$builderProvider', function($builderProvider) {


     $builderProvider.registerComponent('textInput', {
        group: 'IDP',
        label: 'Text Input',
        description: 'description',
        placeholder: 'placeholder',
        required: false,
        validationOptions: [
          {
            label: 'none',
            rule: '/.*/'
          }, {
            label: 'number',
            rule: '[number]'
          }, {
            label: 'email',
            rule: '[email]'
          }, {
            label: 'url',
            rule: '[url]'
          }
        ],
        template: "<div> " +
                     "<label for=\"0\" class=\"control-label\"> {{label}} {{fb-required ? '*' : ''}} </label>  " +
                     "<input class=\"form-control\" ng-model=\"inputText\" placeholder=\"{{placeholder}}\"> " +
                     "<label for=\"0\" class=\"control-label\"> {{postLabel}} {{fb-required ? '*' : ''}} </label>  " +
                    "</div>",

        popoverTemplate: "<form> " +
                            "<div class=\"form-group\"> " +
                               "<label class='control-label'>Label</label> " +
                               " <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/> " +
                               " <label class='control-label'>Post Label</label>  " +
                               " <input type='text' ng-model=\"customModel.postLabel\" class='form-control'/> " +
                            " </div> " +
                            "<div class=\"form-group\"> " +
                               "<label class='control-label'>Placeholder</label>" +
                               "<input type='text' ng-model=\"placeholder\" class='form-control'/> " +
                            "</div> " +
                            "<div class=\"checkbox\"> " +
                               "<label> " +
                               "  <input type='checkbox' ng-model=\"required\" />Required" +
                               "</label> " +
                            "</div> " +
                            "<div class=\"form-group\" ng-if=\"validationOptions.length > 0\"> " +
                               "<label class='control-label'>Validation</label> " +
                               "<select ng-model=\"$parent.validation\" class='form-control' ng-options=\"option.rule as option.label for option in validationOptions\">" +
                               "</select> " +
                            "</div> " +
                          "</form>"
      });


     $builderProvider.registerComponent('date', {
        group: 'IDP',
        label: 'Date',
        description: 'A Datepicker',
        placeholder: '1/1/2016',
        required: false,
        validationOptions: [
          {
            label: 'none',
            rule: '/.*/'
          }, {
            label: 'number',
            rule: '[number]'
          }, {
            label: 'email',
            rule: '[email]'
          }, {
            label: 'url',
            rule: '[url]'
          }
        ],
        template: "<div> " +
                     "<label for=\"0\" class=\"control-label\">{{label}}  {{fb-required ? '*' : ''}} </label> " +
                     "<input type=\"date\" class=\"form-control\"  ng-model=\"inputText\" placeholder=\"{{placeholder}}\">" +
                  "</div>",

        popoverTemplate: "<form>    " +
                         " <div class=\"form-group\"> " +
                         "   <label class='control-label'>Label</label>   " +
                         "     <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/>  " +
                         "   <label class='control-label'>Post Label</label>   " +
                         "     <input type='text' ng-model=\"customModel.postLabel\" class='form-control'/>  " +
                         "   <label class='control-label'>Date Format</label>   " +
                        "     <input type='text' ng-model=\"customModel.dateFormat\" class='form-control'/>  " +
                         "  </div>        " +
                         " <div class=\"form-group\">        " +
                         "   <label class='control-label'>Placeholder</label>        " +
                         "   <input type='text' ng-model=\"placeholder\" class='form-control'/>    " +
                         " </div>    " +
                         " <div class=\"checkbox\">        " +
                         "  <label>            " +
                         "   <input type='checkbox' ng-model=\"required\" />Required</label>    " +
                         " </div>    " +
                         "  <div class=\"form-group\" ng-if=\"validationOptions.length > 0\">        " +
                         "   <label class='control-label'>Validation</label>        " +
                         "   <select ng-model=\"$parent.validation\" class='form-control' ng-options=\"option.rule as option.label for option in validationOptions\"></select>    " +
                         "  </div>    " +
                         "</form>"
      });



       $builderProvider.registerComponent('radio', {
        group: 'IDP',
        label: 'Radio',
        description: 'description',
        placeholder: 'placeholder',
        required: false,
        options: ['value one', 'value two'],
        template: "<div>" +
                     "<label for=\"0\" class=\"control-label\"> {{label}} {{fb-required ? '*' : ''}} " +
                     "</label>" +
                     "<div class=\"radio\" ng-repeat=\"item in options track by $index\">" +
                        "<label>" +
                           "<input type=\"radio\" ng-model=\"$parent.inputText\" value='{{item}}'/> {{item}} " +
                        "</label>" +
                     "</div>" +
                  "</div>",

         popoverTemplate: "<form> " +
                          "<div class=\"form-group\"> " +
                          "  <label class='control-label'>Label</label> " +
                          "  <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/>\n  " +
                          "  <label class='control-label'>Post Label</label> " +
                          "  <input type='text' ng-model=\"customModel.postLabel\" class='form-control'/>  " +
                          "</div>       " +
                          "<div class=\"form-group\">\n        " +
                          "<label class='control-label'>Options</label>\n        " +
                          "<textarea class=\"form-control\" rows=\"3\" ng-model=\"optionsText\"/>\n    " +
                          "</div>\n\n    " +
                          "</form>"
      });
      
      $builderProvider.registerComponent('select', {
        group: 'IDP',
        label: 'Select',
        description: 'description',
        placeholder: 'placeholder',
        required: false,
        options: ['value one', 'value two'],
        template: "<div>\
                        <label for=\"0\" class=\"control-label\">\
                              {{label}} \
                              {{fb-required ? '*' : ''}} \
                        </label>\
                        <select ng-options=\"value for value in options\" id=\"{{formName+index}}\" class=\"form-control\" ng-model=\"inputText\" ng-init=\"inputText = options[0]\"/>\
                  </div>\
        "
        ,
        popoverTemplate: "<form>\n    " +
                         "<div class=\"form-group\">\n        " +
                         "   <label class='control-label'>Label</label>\n        " +
                         "   <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/>\n    " +
          "   <label class='control-label'>Post Label</label>\n        " +
          "   <input type='text' ng-model=\"customModel.postLabel\" class='form-control'/>\n    " +
                         "</div>\n    <div class=\"form-group\">\n        <label class='control-label'>Options</label>\n        <textarea class=\"form-control\" rows=\"3\" ng-model=\"optionsText\"/>\n    </div>\n\n   <div class=\"checkbox\"><label><input type='checkbox' ng-model=\"required\" />Required</label></div>  </form>"
      });

      $builderProvider.registerComponent('description', {
        group: 'IDP',
        label: '',
        description: 'description',
        placeholder: 'placeholder',
        required: false,
        options: [],
        template: "<div>\
                        <label for=\"0\" class=\"control-label\">\n    {{fb-required ? '*' : ''}}\n  \
                        </label>\
                        <div ng-model=\"customModel.descriptionModel\" ng-init=\"customModel.descriptionModel = 'Textlabel'\">{{customModel.descriptionModel}}</div>    \
                   </div>",

        popoverTemplate: "<form> \
                              <div class=\"form-group\">\
                                    <label class='control-label'>Hier k&ouml;nnte Ihr Text stehen!</label>\
                                    <textarea class=\"form-control\" rows=\"3\" ng-model=\"customModel.descriptionModel\"/>\
                              </div>\
                         </form>"
      });

        $builderProvider.registerComponent('link_description', {
            group: 'IDP',
            label: 'Link: ',
            description: 'description',
            placeholder: 'placeholder',
            required: false,
            options: [],
            template: "<div>\
                <label for=\"0\" class=\"control-label\">\n    {{fb-required ? '*' : ''}}\n  \
            </label>\
                <div ng-model=\"customModel.descriptionModel\" ng-init=\"customModel.descriptionModel = 'http://www.google.de'\">{{label}} <a href='{{customModel.descriptionModel}}'>{{customModel.descriptionModel}}</a></div>    \
            </div>",

            popoverTemplate: "<form> " + 
                "<div class=\"form-group\">" +
                "<label class='control-label'>Label</label>" +
                "<input type='text' ng-model=\"label\"  class='form-control'/>" +


                "<label class='control-label'>Link</label>" + 
                "<textarea class=\"form-control\" rows=\"1\" ng-model=\"customModel.descriptionModel\"/>" + 
            "</div>" +
            "</form>"
        });

        $builderProvider.registerComponent('image_description', {
            group: 'IDP',
            label: 'Image',
            description: 'description',
            placeholder: 'placeholder',
            required: false,
            options: [],
            template: "<div>" +
                        "<label for=\"0\" class=\"control-label\">{{fb-required ? '*' : ''}}</label>" +
                          "<div ng-model=\"customModel.url\"" + 
                               "ng-init=\"customModel.url = 'app/images/thumbs_up.png'\">" +
                                         "{{label}} <img src={{customModel.url}} " +
                                                  "alt='Image Description'/>" +
                         "</div>" +
                      "</div>",
            popoverTemplate: "<form>" +
                               "<div class=\"form-group\">" +
                                  "<label class='control-label'>Label</label>" +
                                  "<input type='text' ng-model=\"label\"  class='form-control'/>" +

                                 "<label class='control-label'>Hier k&ouml;nnte Ihr Text stehen!</label>" +
                                 "<textarea class=\"form-control\" rows=\"3\" ng-model=\"customModel.url\"/>" +
                               "</div>" +
                             "</form>"
        });


        $builderProvider.registerComponent('video_description', {
            group: 'IDP',
            label: 'Video',
            description: 'description',
            placeholder: 'placeholder',
            required: false,
            options: [],
            template: "<div>" +
                        "<label for=\"0\" class=\"control-label\">{{fb-required ? '*' : ''}}</label>" +
                          "<div ng-model=\"customModel.url\"" + 
                "ng-init=\"customModel.url = ''\">" +
                                         "{{label}} " +
                "<video  controls>" +
                "<source src={{customModel.url}} type='video/mp4'>" +
                "Your browser does not support the video tag." +
                "</video>" +                                   
                         "</div>" +
                      "</div>",
            popoverTemplate: "<form>" +
                               "<div class=\"form-group\">" +
                                  "<label class='control-label'>Label</label>" +
                                  "<input type='text' ng-model=\"label\"  class='form-control'/>" +

                                 "<label class='control-label'>Video URL:</label>" +
                                 "<textarea class=\"form-control\" rows=\"1\" ng-model=\"customModel.url\"/>" +
                               "</div>" +
                             "</form>"
        });



        /*
      $builderProvider.registerComponent('checkbox', {
        group: 'IDP',
        label: 'Checkbox',
        description: 'description',
        placeholder: 'placeholder',
        required: false,
        options: [],
        arrayToText: true,
        template: "<div> " +
                     "<label for=\"0\" class=\"control-label\"> {{label}} {{fb-required ? '*' : ''}}  </label>" +
                     "<div class=\"checkbox\" ng-repeat=\"item in options track by $index\">" +
                        "<label><input type=\"checkbox\" ng-model=\"$parent.inputArray[$index]\" value='item'/> {{item}} </label> " +
                     "</div>" +
                  "</div>",

        popoverTemplate: "<form>" +
                         " <div class=\"form-group\">   <label class='control-label'>Label</label>\n        <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/>\n    </div>\n        <div class=\"form-group\">\n        <label class='control-label'>Options</label>\n        <textarea class=\"form-control\" rows=\"3\" ng-model=\"optionsText\"/>\n    </div>\n    <div class=\"checkbox\">\n        <label>\n            <input type='checkbox' ng-model=\"required\" />\n            Required\n        </label>\n    </div>\n\n    </form>"
      });

*/

      $builderProvider.registerComponent('checkbox', {
        group: 'IDP',
        label: 'Checkbox',
        description: 'description',
        required: false,
        options: [],
        arrayToText: true,
        template: "<div> " +
                     "<label for=\"0\" class=\"control-label\"> {{label}} {{fb-required ? '*' : ''}} </label> " +
                     "<label> " +
                        "<input type=\"checkbox\" /> {{item}} " +
                     "</label> " +
                    "<label for=\"0\" class=\"control-label\"> {{customModel.postLabel}} {{fb-required ? '*' : ''}} </label> " +
                  "</div>",

        popoverTemplate: "<form>" +
                            "<div class=\"form-group\">   " +
                               "<label class='control-label'>Label</label> <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/>  " +
                            "</div> " +
                            "<div class=\"form-group\">" +
                               "<label class='control-label'>Post Label</label> " +
                               "<input type='text' ng-model=\"customModel.postLabel\" class='form-control'/>  " +
                            "</div>\n    " +
   
                            "<div class=\"checkbox\">\n        " +
                               "<label> " +
                                 "<input type='checkbox' ng-model=\"required\" />Required" +
                               "</label> " +
                            "</div>" +
                         "</form>"
      });




      $builderProvider.registerComponent('container', {
		      group: 'IDP',
		      label: 'Container',
		   
		      template: "<div class=\"panel panel-default\">\
		                      <div class=\"panel-heading\">\
		                      <h3 class=\"panel-title\">{{label}}<\/h3>\
		                <\/div>\
		                <div class=\"DropableDesign \" fb-builder=\"{{id}}\" \/>\
		                \
		                <\/div>",
		
		      popoverTemplate: "<form>" +
                                       "<div class=\"form-group\">" + 

          "<formly-form model=\"popover.getParrentApp().container\" fields=\"popover.getParrentApp().containerFields\">" + 
          "<button type=\"submit\" class=\"btn btn-default\" ng-click=\"popover.getParrentApp().insertContainerForm(popover.getParrentApp().container.selectedField, popover.getCurrentElementScope())\">insert</button>" +
         "</formly-form>" +

                                          "<label class=\'control-label\'>Label</label>" +
                                          "<input type=\'text\' ng-model=\"label\"  class=\'form-control\' \/>    " +
                                       "<\/div>" +
                                       "<div class=\"form-group\">" +
                                       "<label class=\'control-label\'>Options<\/label>        " +
                                       "<textarea class=\"form-control\" rows=\"3\" ng-model=\"optionsText\" \/>    " +
                                       "<\/div>" +
                                       "<\/form>",
		      isContainer: true
		     
		  });

   return $builderProvider.registerComponent('textArea', {
        group: 'IDP',
        label: 'Textarea',
        description: '',
        placeholder: 'placeholder',
        required: false,

    template: "<div> " +
              " <label for=\"0\" class=\"control-label\">{{label}} {{fb-required ? '*' : ''}}</label>" +
              " <textarea class=\"form-control\" ng-model=\"inputText\" rows='4' cols='50' placeholder=\"{{placeholder}}\">" +
              "</div>",
    popoverTemplate: "<form>" +
                     " <div class=\"form-group\">" +
                     "  <label class='control-label'>Label</label>  " +
                     "   <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/> " +
                     "  <label class='control-label'>Post Label</label>  " +
                     "   <input type='text' ng-model=\"customModel.postLabel\" class='form-control'/> " +
                     " </div>    " +
                     " <div class=\"form-group\">    " +
                     "  <label class='control-label'>Placeholder</label>    " +
                     "  <input type='text' ng-model=\"placeholder\" class='form-control'/>  " +
                     " </div>  " +
                     " <div class=\"checkbox\">    " +
                     " <label>      " +
                     " <input type='checkbox' ng-model=\"required\" /> Required</label>  " +
                     " </div>  " +
                     "<div class=\"form-group\" ng-if=\"validationOptions.length > 0\">    <label class='control-label'>Validation</label>    <select ng-model=\"$parent.validation\" class='form-control' ng-options=\"option.rule as option.label for option in validationOptions\"></select>  </div>  </form>"
   });



      
    }
  ]);

}).call(this);
