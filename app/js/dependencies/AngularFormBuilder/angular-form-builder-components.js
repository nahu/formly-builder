(function() {

  angular.module('builder.components', ['builder', 'validator.rules']).config([
    '$builderProvider', function($builderProvider) {


     $builderProvider.registerComponent('textInput', {
         group: 'Interactive',
         label: 'Text Input',
         description: 'description',
         placeholder: 'placeholder',
         hasValidation:true,
        template: "<div> " +
                     "<label for=\"0\" class=\"control-label\"> {{label}} {{fb-required ? '*' : ''}} </label>  " +
                     "<input class=\"form-control\" ng-model=\"inputText\" placeholder=\"{{placeholder}}\"> " +
                     "<label for=\"0\" class=\"control-label\"> {{customModel.postLabel}}</label>  " +
                    "</div>",

        popoverTemplate: "<form> " +
                            "<div class=\"form-group\"> " +
                               "<label class='control-label'>Label</label> " +
                               " <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/> " +
                               " <label class='control-label'>Post Label</label>  " +
                               " <input type='text' ng-model=\"customModel.postLabel\" class='form-control'/> " +
                            " </div> " +
                            "<div class=\"form-group\"> " +
                               "<label class='control-label'>Placeholders</label>" +
                               "<input type='text' ng-model=\"placeholder\" class='form-control'/> " +
                            "</div> " + 
                          "</form>"
      });


     $builderProvider.registerComponent('date', {
        group: 'Interactive',
        label: 'Date',
        description: 'A Datepicker',
        placeholder: '1/1/2016',
         hasValidation:true,
        template: "<div> " +
                     "<label for=\"0\" class=\"control-label\">{{label}}  {{fb-required ? '*' : ''}} </label> " +
                     "<input type=\"date\" class=\"form-control\"  ng-model=\"inputText\" placeholder=\"{{placeholder}}\">" +
             "<label>{{customModel.postLabel}}</label>" + 
                  "</div>",

        popoverTemplate: "<form>    " +
                         " <div class=\"form-group\"> " +
                         "   <label class='control-label'>Label</label>   " +
                         "     <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/>  " +
                         "   <label class='control-label'>Post Label</label>   " +
                         "     <input type='text' ng-model=\"customModel.postLabel\" class='form-control'/>  " +
                         "   <label class='control-label'>Date Format</label>   " +
                        "     <input type='text' ng-model=\"customModel.dateFormat\" class='form-control' ng-init='customModel.dateFormat = \"DD/MM/YYYY\"'/>  " +
                         "  </div>        " +
                         " <div class=\"form-group\">        " +
                         "   <label class='control-label'>Placeholder</label>        " +
                         "   <input type='text' ng-model=\"placeholder\" class='form-control'/>    " +
                         " </div>    " +

                         "</form>"
      });


       $builderProvider.registerComponent('radio', {
        group: 'Interactive',
        label: 'Radio',
        description: 'description',
        placeholder: 'placeholder',
        required: false,
        hasValidation:true,
        options: ['value one', 'value two'],
        template: "<div>" +
                     "<label for=\"0\" class=\"control-label\"> {{label}}" +
                     "</label>" +
                     "<div class=\"radio\" ng-repeat=\"item in options track by $index\">" +
                        "<label>" +
                           "<input type=\"radio\" ng-model=\"$parent.inputText\" value='{{item}}'/> {{item}} " +
                        "</label>" +
                     "</div>" +
               "<label>{{customModel.postLabel}}</label>" + 
                  "</div>",

         popoverTemplate: "<form> " +
                          "<div class=\"form-group\"> " +
                          "  <label class='control-label'>Label</label> " +
                          "  <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/>  " +
                          "  <label class='control-label'>Post Label</label> " +
                          "  <input type='text' ng-model=\"customModel.postLabel\" class='form-control'/> " +
                          "</div>" +
                          "<div class=\"form-group\">" +
                          "    <label class='control-label'>Options</label>        " +
                          "    <textarea class=\"form-control\" rows=\"3\" ng-model=\"optionsText\"/>" +
                          "</div>  " +
                          "</form>"
      });
      
      $builderProvider.registerComponent('select', {
        group: 'Interactive',
        label: 'Select',
        description: 'description',
        placeholder: 'placeholder',
        options: ['value one', 'value two'],
        template: "<div>\
                        <label for=\"0\" class=\"control-label\">{{label}} </label>\
                        <select ng-options=\"value for value in options\" id=\"{{formName+index}}\" class=\"form-control\" ng-model=\"inputText\" ng-init=\"inputText = 'value one'\"/>\
                  </div>" + 
              "<label>{{customModel.postLabel}}</label>"
        ,
        popoverTemplate: "<form>    " +
                         "<div class=\"form-group\">" +
                         "   <label class='control-label'>Label</label>" +
                         "   <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/>" +
                         "   <label class='control-label'>Post Label</label>" +
                         "   <input type='text' ng-model=\"customModel.postLabel\" class='form-control'/>" +
                         "</div>" +
                         "<div class=\"form-group\">" +
                         "    <label class='control-label'>Options</label>" +
                         "    <textarea class=\"form-control\" rows=\"3\" ng-model=\"optionsText\"/>" +
                         "</div>  " +
                         "</form>"
      });

      $builderProvider.registerComponent('description', {
        group: 'description',
        label: '',
        description: 'description',
        placeholder: 'placeholder',
        required: false,
        options: [],
        template: "<div>\
                        <label for=\"0\" class=\"control-label\">    {{fb-required ? '*' : ''}}  \
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
            group: 'description',
            label: 'Link: ',
            description: 'description',
            placeholder: 'placeholder',
            required: false,
            options: [],
            template: "<div>\
                <label for=\"0\" class=\"control-label\">    {{fb-required ? '*' : ''}}  \
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
            group: 'description',
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
            group: 'description',
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


      $builderProvider.registerComponent('checkbox', {
        group: 'Interactive',
        label: 'Checkbox',
        description: 'description',
        hasValidation: true,
        options: [],
        arrayToText: true,
        template: "<div> " +
                     "<label for=\"0\" class=\"control-label\"> {{label}} </label> " +
                     "<label> " +
                        "<input type=\"checkbox\" /> {{item}} " +
                     "</label> " +
                    "<label for=\"0\" class=\"control-label\"> {{customModel.postLabel}}</label> " +
                  "</div>",

        popoverTemplate: "<form>" +
                            "<div class=\"form-group\">   " +
                               "<label class='control-label'>Label</label> <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/>  " +
                            "</div> " +
                            "<div class=\"form-group\">" +
                               "<label class='control-label'>Post Label</label> " +
                               "<input type='text' ng-model=\"customModel.postLabel\" class='form-control'/>  " +
                            "</div>    " +
                         "</form>"
      });




      $builderProvider.registerComponent('container', {
	group: 'layout',
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
              "<input type=\'text\' ng-model=\"label\"  class=\'form-control\' \/>" +

          "<label><input type='checkbox' ng-model=\"customModel.inline\"> Display Inline</label>" + 

              "<label class=\'control-label\'>Containertype</label>" +
              "<select ng-model=\"customModel.type\" class='form-control' ng-options=\"option as option for option in ['normal','tab', 'repeating']\" ng-init=\"customModel.type='normal'\">" +
             "</select>"+

              "<\/div>" +
              "<div class=\"form-group\">" +
              "<label class=\'control-label\'>Options<\/label>" +
              "<textarea class=\"form-control\" rows=\"3\" ng-model=\"optionsText\" \/>" +
              "<\/div>" +
              "<\/form>",
	  isContainer: true
	  
      });

   return $builderProvider.registerComponent('textArea', {
        group: 'Interactive',
        label: 'Textarea',
        description: '',
        placeholder: 'placeholder',
        required: false,
       hasValidation:true,
    template: "<div> " +
              " <label for=\"0\" class=\"control-label\">{{label}} {{fb-required ? '*' : ''}}</label>" +
              " <textarea class=\"form-control\" ng-model=\"inputText\" rows='4' cols='50' placeholder=\"{{placeholder}}\" />" +
              "<label>{{customModel.postLabel}}</label> " +
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
                     "</form>"
   });



      
    }
  ]);

}).call(this);
