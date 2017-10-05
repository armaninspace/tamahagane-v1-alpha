(function ($) {
  $(document).ready(function () {
    webshim.activeLang('en');
    webshims.polyfill('forms es5');
    webshims.cfg.no$Switch = true;
   /* $('body').on('submit', 'form', function(e) {
      var error = false;
     // $("form [required]").each(function(index) {
      $( 'form' ).find( 'select, textarea, input' ).each(function(){

        if($( this ).prop( 'required' )){
          if (!$(this).val()) {
            error = true;
            //e.preventDefault();
          }
        }
      });
      if(error == true){
        e.stopImmediatePropagation();
        alert("Please fill all required fields.");
        return false;
      }
      //return false;
    });*/
   //alert(navigator.userAgent);
    /*if(navigator.userAgent=="Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:56.0) Gecko/20100101 Firefox/56.0") {
      //$("#wrapper").prepend('HERE');
    }*/
    /**
     * append cancel icon to nav tabs
     */
    $("#exTab1 ul.nav-tabs").append('<span class="glyphicon glyphicon-remove-circle close-nav-tabs"></span>');
        //$('.page-node-type-sketch .tabs.primary').prepend('<li style="display:block"><a href='+$('.page-node-type-sketch .tabs.primary li a:eq(1)').attr('href')+'>Doc</a></li>');
    $('#deleted_datasets_area').val('');
    empty_temp();
    $("body").on("click", '.operator-coloumn .nav-tabs a', function () {
      $(this).tab('show');
    });
    $("body").on("click", '#parameters-box .btn-submit', function () {
      $('.alert-success').remove();
      $('.alert-danger').remove();
    });
    $('input[type=radio][name=source-selector]').change(function () {
      if (this.value == 'external') {
        $('#external_source').show();
        $('#selectedFilename').hide();
      }
      else if (this.value == 'internal') {
        $('#external_source').hide();
        $('#selectedFilename').show();
      }
    });
    $('#groupby_col_div2').hide();
    $('input[type=radio][name=group-selector]').change(function () {
      if (this.value == 'simple') {
        $('#groupby_col_div1').show();
        $('#groupby_col_div2').hide();
      }
      else if (this.value == 'summarized') {
        $('#groupby_col_div2').show();
      }
    });
    $("body").on("keyup", '#sample_value, #rowForm, #rowTo', function () {
      $(this).val($(this).val().replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'));
    });
    $("body").on("keyup", '#newcolumn', function () {
      var specialchars = /[^a-z0-9\s.]/gi;
      if (specialchars.test($(this).val())) {
        $(this).val($(this).val().replace(/[^a-z0-9\s.]/gi, ''));
        if ($('#mutateAttrbs .alert-danger').length == 0) {
          $('#mutateAttrbs').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Special character not allowed.</div>');
        }
        else {
          $('#mutateAttrbs .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Special character not allowed.');
        }
      }
    });
    $("body").on("change", '#op_distinct_type', function () {
      if (this.value == 'all' || this.value == "") {
        $('#distinct_col_div').hide();
      }
      else if (this.value == 'column') {
        $('#distinct_col_div').show();
      }
    });
    if ($("#paper").length) {
      $('input[name="searchOperator"]').on('keyup', function () {
        var searchVal = $(this).val();
        var main_array = $("#mainArrayData").val();
        var mainArray = $.parseJSON(main_array);
        var myNewArray = [];
        var MyObj = {
          filter: function () {
            var tmpPalltets = [];
            var pallet = {};
            var operator = {};
            for (var i = 0; i < this.pallets.length; i++) {
              pallet = this.pallets[i];
              for (var j = 0; j < pallet.operators.length; j++) {
                operator = pallet.operators[j];
                if (operator.title.search(new RegExp(searchVal, "i")) != -1) {
                  if (tmpPalltets.length === 0) {
                    tmpPalltets.push({
                      "title": pallet.title,
                      "operators": [{
                        "op_nid": operator.op_nid,
                        "pallet": operator.pallet,
                        "title": operator.title,
                        "op_img": operator.op_img
                      }]
                    });
                  }
                  else {
                    tmpPalltets.map(function (tmpPlt) {
                      if (tmpPlt.title == pallet.title) {
                        var options = {
                          'op_nid': operator.op_nid,
                          'pallet': operator.pallet,
                          'title': operator.title,
                          "op_img": operator.op_img
                        };
                        tmpPlt.operators.push(options);
                      }
                      else {
                        tmpPalltets.push({
                          "title": pallet.title,
                          "operators": [{
                            "op_nid": operator.op_nid,
                            "pallet": operator.pallet,
                            "title": operator.title,
                            "op_img": operator.op_img
                          }]
                        });
                      }
                    });
                  }
                }
              }
            }
            this.pallets = tmpPalltets;
            return this;
          },
          pallets: mainArray
        };
        MyObj.filter();
        var resultHtml = '';
        for (var i = 0; i < 2; i++) {
          resultHtml += '<div id="pallet"><div class="panel-group"><div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title"><a data-toggle="collapse" href="#' + MyObj.pallets[i].title + '" class="bootstrap-collapse-processed" aria-expanded="true">' + MyObj.pallets[i].title + '</a></h4></div><div id="' + MyObj.pallets[i].title + '" class="panel-collapse collapse" aria-expanded="false"><ul class="list-group-selected"></ul><ul class="list-group">';
          for (var j = 0; j < MyObj.pallets[i].operators.length; j++) {
            resultHtml += '<li class="list-group-item" id="' + MyObj.pallets[i].operators[j].op_nid + '" value="' + MyObj.pallets[i].operators[j].op_nid + '"><!--span class="glyphicon glyphicon-pushpin"></span--><img class="op_img" src="/sites/default/files/' + MyObj.pallets[i].operators[j].op_img + '" alt="">&nbsp;' + MyObj.pallets[i].operators[j].title + '<i class="fa fa-arrows" title="Drag"></i></li>';
          }
          resultHtml += '</ul></div></div></div></div>';
        }
        $('#stencil').html(resultHtml);
      });
      var cntrlIsPressed = false;
      $(document).keydown(function (event) {
        if (event.which == "17")
          cntrlIsPressed = true;
      });
      $(document).keyup(function () {
        cntrlIsPressed = false;
      });
      var selectedCells = [];
      // Define Custom Model with background image and ports, Canvas where shape are dropped
      graph = new joint.dia.Graph,
        paper = new joint.dia.Paper({
          model: graph,
          width: 2000,
          height: 2000,
          gridSize: 8,
          drawGrid: true,
          linkPinning: false,
          defaultLink: new joint.dia.Link({
            router: {name: 'manhattan'},
            connector: {name: 'rounded'},
            attrs: {
              '.connection': {
                stroke: '#b9c0c0',
                'stroke-width': 2
              },
            },
          }),
          validateConnection: function (cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
            // Prevent linking from input ports.
            if (magnetS && magnetS.getAttribute('port-group') === 'in') return false;
            // Prevent linking from output ports to input ports within one element.
            if (cellViewS === cellViewT) return false;
            // Prevent linking to input ports.
            return magnetT && magnetT.getAttribute('port-group') === 'in';
          },
          validateMagnet: function (cellView, magnet) {
            // Disable linking interaction for magnets marked as passive (see below `.inPorts circle`).
            //return magnet.getAttribute('magnet') !== 'passive';
            return true;
          },
          //Prevent adding vertex by clicking on link
          interactive: function (cellView) {
            if (cellView.model instanceof joint.dia.Link) {
              // Disable the default vertex add functionality on pointerdown.
              return {vertexAdd: false};
            }
            return true;
          },
          snapLinks: {radius: 75},
          // Enable marking available cells & magnets
          markAvailable: true
        });
      // Paper scroller
      var paperScroller = new joint.ui.PaperScroller({
        paper: paper
        //cursor:'grab'
      });
      $('#paper').append(paperScroller.render().el);
      //paper.on('blank:pointerdown', paperScroller.startPanning);
      // Navigator object passing  property to the navigator constructor.
      var nav = new joint.ui.Navigator({
        paperScroller: paperScroller,
        width: 300,
        height: 200,
        padding: 10,
        zoomOptions: {max: 2, min: 0.2}
      });
      nav.$el.appendTo('#navigator');
      nav.render();
      //Selecting Area with mouse through Selectionview
      var selection = new joint.ui.SelectionView({paper: paper});
      paper.on('blank:pointerdown', selection.startSelecting);
      paper.on('element:pointerup', function (elementView, evt) {
        if (evt.ctrlKey || evt.metaKey) {
          selection.collection.add(elementView.model);
        }
      });
      selection.on('selection-box:pointerdown', function (elementView, evt) {
        if (evt.ctrlKey || evt.metaKey) {
          selection.collection.remove(elementView.model);
        }
      });
      // graph output operator
      joint.shapes.devs.MyImageModel = joint.shapes.devs.Model.extend({
        //markup: '<g class="rotatable"><g class="scalable"><rect/><image/></g><text/></g>',
        markup: '<g class="rotatable"><g class="scalable"><rect/><image/></g><text/></g><g class="element-tools"><g class="element-tool-remove"><circle cx="72" fill="red" r="8"/><path transform="scale(.6) translate(104, -16)" d="M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z"/><title>Remove</title></g></g>',
        defaults: joint.util.deepSupplement({
          type: 'devs.MyImageModel',
          size: {width: 90, height: 40},
          attrs: {
            rect: {fill: '#fff', stroke: '#b7b7b7', width: 90, height: 40},
            image: {width: 50, height: 18}
          }
        }, joint.shapes.devs.Model.prototype.defaults)
      });
      joint.shapes.devs.MyImageModelView = joint.shapes.devs.ModelView;
      // Canvas from which you take shapes
      $('#stencil').on('mousedown', 'i', function (e) {
        $('#stencil').on('mousemove', 'i', function (e) {
          //if (e.offsetX > 100) {
          drawShape(e, $(this).parent().attr("id"));
          $('#stencil').off('mousemove', 'i');
          $("#operator-area").hide('medium');
          $("#operator-rel").addClass("closed");
          $("#operator-btn span").removeClass("glyphicon-minus").addClass("glyphicon-plus");
          $(".sketch-coloumn .container-fluid").append('<div class="drop-note">Drop here.</div>');
          $(".analytics-column").css('-webkit-user-select', 'none');
          //}
        });
      });
      paper.on('blank:pointerdown', function (cellView, evt) {
        $('.op-area-note').show();
        $('#exTab1 .nav-tabs, #exTab1 .tab-content').hide();
        if ($("#operator-checkbox").is(':checked')) {
          $(".user-nav-slide").trigger("click");
        }
      });
      paper.on('cell:mouseover', function (cellView, evt) {
        var parentId = cellView.model.id;
        $("g[model-id='"+parentId+"'] > g:nth-child(2)").show();
      });
      paper.on('cell:mouseout', function (cellView, evt) {
        var parentId = cellView.model.id;
        $("g[model-id='" + parentId + "'] > g:nth-child(2)").hide();
        $(".analytics-column").css('user-select', 'inherit');
      });
      var cellmv;
      paper.on('cell:pointerdown', function (cellView, evt, x, y) {
        cellmv = true;
        if (cellView.model.isLink()) {
          nav_slide_right_close();
        }
      });
      paper.on('cell:pointermove', function (cellView, evt, x, y) {
        cellmv = false;
      });
      paper.on('cell:pointerup', function (cellView, evt, x, y) {

      });
      paper.on('cell:pointerclick', function (cellView, evt, x, y) {
        nav_slide_right_close();
        $('#AreachartDiv, #3dScatterchartDiv, #BubblechartDiv, #linechartDiv, #histogramchartdiv, #txtclusterDiv').empty();

        $('.operator-coloumn .alert-danger').remove();
        $('.operator-coloumn .alert-success').remove();

        $('.fa-trash-o').attr('id', cellView.model.id);
        var className = evt.target.parentNode.getAttribute('class');
        if (className == 'element-tool-remove') {
          var graphCell = graph.getCell(cellView.model.id);
          graphCell.remove();
          return false;
        }
        if (cntrlIsPressed) {
          var select_el = cellView.el;
          V(select_el).toggleClass('selected');
          var ew = select_el.getAttribute("class");
          if (~ew.indexOf("selected")) {
            selectedCells.push(graph.getCell(cellView.model.id));
          }
          else {
            selectedCells = selectedCells.filter(function (el) {
              return el.id !== cellView.model.id;
            });
          }
        }
        else {
          // Change parameters
          var currOpId = cellView.model.id;
          var filePathVal = cellView.model.attributes.inputData;
          var opTypeVal = cellView.model.attributes.operatorType;
          var currTitle = cellView.model.attr('text/text');
          var currFillColor = cellView.model.attr('rect/fill');
          var currNotes = cellView.model.attr('notes/notes');
          $('#exTab1 .nav-tabs , #exTab1 .tab-content, .nav-tabs a[href="#result-div"], .param_link').show();
          $('#parameterss-area').addClass('in active');
          $("#parameters-box").show('medium');
          $('#styles-div #titleOperator').val(currTitle);
          $("#parameterss-area #param-title").html(currTitle);
          $('#styles-div #fillColor').val(currFillColor);
          $('#parameters-box #param-id').val(currOpId);
          $('#parameters-box #selectedFilename').val(filePathVal);
          $('#notes-div #notes').val('').val(currNotes);
          $('#result-div').show();
          $(".classifier-modify").css('visibility', 'hidden');
          $(".graphLoader-modify").css('visibility', 'hidden');
          $('.df1_link, .df2_link, #df1, #df2, .chart_link,.op-area-note, #chart-edit-title').hide();
          $('.nav-tabs a[href="#parameterss-area"]').tab('show');
          $('#styles-div input[name="titleOperator"]').on('keyup', function () {
            var paramHiddenId = document.getElementById("param-id").value;
            if (paramHiddenId == currOpId) {
              var rel1 = document.getElementById("titleOperator").value;
              cellView.model.attr('text/text', rel1);
            }
          });
          $('input[name="fillColor"]').on('focus', function () {
            var paramHiddenId = document.getElementById("param-id").value;
            if (paramHiddenId == currOpId) {
              var rel2 = document.getElementById("fillColor").value;
              cellView.model.attr('rect/fill', rel2);
            }
          });
          $('textarea[name="notes"]').on('keyup', function () {
            var paramHiddenId = document.getElementById("param-id").value;
            if (paramHiddenId == currOpId) {
              var rel3 = document.getElementById("notes").value;
              cellView.model.attr('notes/notes', rel3);
              $('#btn-save').addClass('alert-red');
            }
          });
          if (opTypeVal == 'Output' || opTypeVal == 'Model Output') {
            $('#OutputDiv').show();
            $('#paraAttrName, #MappingDiv, #AreachartDiv-container, #dTreeDiv, #predictDiv, #performanceDiv, #SplitDiv, #knnDiv, #SummarizeDiv, #CatDiv, #filterDiv, #decisionTreeDiv, #DistinctDiv, #joinDiv, #paraFilePath, #classifierDiv, #SampleDiv, #sliceDiv, #SelectDiv, #mutateAttrbs, #GroupbyDiv').hide();
          }
          else if (opTypeVal == 'Split') {
            $('#SplitDiv').show();
            $('#paraAttrName, #OutputDiv, #AreachartDiv-container, #dTreeDiv, #predictDiv, #performanceDiv, #MappingDiv, #knnDiv, #filterDiv,#SummarizeDiv, #CatDiv, #decisionTreeDiv, #DistinctDiv, #joinDiv, #paraFilePath, #classifierDiv, #SampleDiv, #sliceDiv, #SelectDiv, #mutateAttrbs, #GroupbyDiv').hide();
            $('.df1_link, .df2_link').show();
            $('.result_link').hide();
            var hiddenId = document.getElementById("param-id").value;
            var getCellById = graph.getCell(hiddenId);
            var currFilter = paper.findViewByModel(getCellById);
            var parameters = currFilter.model.attributes.settings.parameters;
            var parametersLength = Object.keys(parameters).length;
            if (parametersLength > 0) {
              var percent_val = currFilter.model.attributes.settings.parameters.selectedVals;
              $('#splitPercnt-select option[value="' + percent_val + '"]').prop('selected', true);
            }
            else {
              $('#splitPercnt-select option[value=""]').prop('selected', true);
            }
          }
          else if (opTypeVal == 'Source') {
            var hiddenId = document.getElementById("param-id").value;
            var getCellById = graph.getCell(hiddenId);
            var currFilter = paper.findViewByModel(getCellById);
            var external_link = currFilter.model.attributes.settings.parameters.externalurl;
            if (external_link == "" || external_link == undefined) {
              $('#paraFilePath').show();
              $('#selectedFilename').show();
              $('#external_source').hide().val('');
              $("input[name=source-selector][value='internal']").prop("checked", true);
            }
            else {
              $('#paraFilePath').show();
              $('#selectedFilename').hide();
              $('#external_source').val(external_link);
              $('#parameter-area-modal #parameters-box #selectedFilename').val('');
              $('#external_source').show();
              $("input[name=source-selector][value='external']").prop("checked", true);
            }
            $('#paraAttrName, #SplitDiv, #AreachartDiv-container, #dTreeDiv, #predictDiv, #performanceDiv, #MappingDiv, #knnDiv, #OutputDiv, #filterDiv, #CatDiv, #SummarizeDiv, #decisionTreeDiv, #DistinctDiv, #joinDiv, #classifierDiv, #sliceDiv, #SelectDiv, #SampleDiv, #mutateAttrbs, #GroupbyDiv').hide();
          }
          else if (opTypeVal == 'Mutate') {
            $('#mutateAttrbs').show();
            $('#paraFilePath, #SplitDiv, #AreachartDiv-container, #dTreeDiv, #predictDiv, #performanceDiv, #MappingDiv, #knnDiv, #filterDiv, #OutputDiv, #CatDiv, #SummarizeDiv, #decisionTreeDiv, #joinDiv, #DistinctDiv, #classifierDiv, #sliceDiv, #SelectDiv, #SampleDiv, #paraAttrName, #GroupbyDiv').hide();
            var hiddenId = document.getElementById("param-id").value;
            var getCellById = graph.getCell(hiddenId);
            var currSelect = paper.findViewByModel(getCellById);
            var sourceJsonData = currSelect.model.attributes.inputData;
            var sourceJsonDataLength = Object.keys(sourceJsonData).length;
            var parameters = currSelect.model.attributes.settings.parameters;
            var parametersLength = Object.keys(parameters).length;
            if (parametersLength == 0) {
              currSelect.model.attributes.settings.parameters.selectedMutateVals = '';
            }
            var selectedMutateVars = currSelect.model.attributes.settings.parameters.selectedMutateVals;
            if (sourceJsonDataLength > 0) {
              update_attr_mutate(sourceJsonData, selectedMutateVars);
            }
            else {
              $('#op_mutate_col1').html("<option value=''>--Select Column--</option>");
              $('#op_mutate_col2').html("<option value=''>--Select Operation--</option><option value='plus'>+</option><option value='minus'>-</option><option value='multiply'>*</option><option value='divide'>/</option>");
              $('#op_mutate_col3').html("<option value=''>--Select Column--</option>");
              $('#newcolumn').val('');
              $('input[name=mutate-selector][value="mutate"]').prop('checked', true);
            }
          }
          else if (opTypeVal == "Summarize") {
            $('#SummarizeDiv').show();
            $('#paraFilePath, #paraAttrName, #AreachartDiv-container, #dTreeDiv, #predictDiv, #performanceDiv, #MappingDiv, #knnDiv, #SplitDiv,#OutputDiv, #CatDiv, #filterDiv, #decisionTreeDiv, #joinDiv, #DistinctDiv, #classifierDiv, #sliceDiv, #SelectDiv, #SampleDiv, #mutateAttrbs, #GroupbyDiv').hide();
            var hiddenId = document.getElementById("param-id").value;
            var getCellById = graph.getCell(hiddenId);
            var currSummraize = paper.findViewByModel(getCellById);
            var sourceJsonData = currSummraize.model.attributes.inputData;
            var sourceJsonDataLength = Object.keys(sourceJsonData).length;
            var parameters = currSummraize.model.attributes.settings.parameters;
            var parametersLength = Object.keys(parameters).length;
            if (parametersLength == 0) {
              currSummraize.model.attributes.settings.parameters.selectedSummarizeVals = '';
            }
            var selectedSummarizeVals = currSummraize.model.attributes.settings.parameters.selectedSummarizeVals;
            if (sourceJsonDataLength > 0) {
              update_summarize_attr(sourceJsonData, selectedSummarizeVals);
            }
            else {
              $('#op_summarize_col').html("<option value=''>--Select Column--</option>");
            }
          }
          else if (opTypeVal == 'Sort') {
            $('#paraAttrName').show();
            $('#paraFilePath, #SplitDiv, #AreachartDiv-container, #dTreeDiv, #predictDiv, #performanceDiv, #filterDiv, #knnDiv, #MappingDiv, #OutputDiv, #CatDiv, #SummarizeDiv, #decisionTreeDiv, #joinDiv, #DistinctDiv, #classifierDiv, #sliceDiv, #SelectDiv, #SampleDiv, #mutateAttrbs, #GroupbyDiv').hide();
            var hiddenId = document.getElementById("param-id").value;
            var getCellById = graph.getCell(hiddenId);
            var currSort = paper.findViewByModel(getCellById);
            var sourceJsonData = currSort.model.attributes.inputData;
            var sourceJsonDataLength = Object.keys(sourceJsonData).length;
            var parameters = currSort.model.attributes.settings.parameters;
            var parametersLength = Object.keys(parameters).length;
            if (parametersLength == 0) {
              var selectedSorts = {"selectedSorts": {}};
              currSort.model.attributes.settings.parameters = selectedSorts;
            }
            var selectedSortVar = currSort.model.attributes.settings.parameters.selectedSorts;
            if (sourceJsonDataLength > 0) {
              update_sort_attr(sourceJsonData, selectedSortVar);
            }
            else {
              var sortCounter = $('#sort_col_count').val();
              for (i = 2; i <= sortCounter; i++) {
                $('#sort_col_' + i).remove();
              }
              $('#sortAttributes').empty();
              $('#sortAttributes_1').html("<option value=''>--Select Column--</option>");
              $('select[name="sortType"]').find('option[value="ASC"]').attr("selected", true);
            }
          }
          else if (opTypeVal == 'Select') {
            $('#SelectDiv').show();
            $('#paraFilePath, #SplitDiv, #AreachartDiv-container, #dTreeDiv, #predictDiv, #performanceDiv, #paraAttrName, #knnDiv, #MappingDiv, #OutputDiv, #CatDiv, #SummarizeDiv, #decisionTreeDiv, #joinDiv, #DistinctDiv, #classifierDiv, #sliceDiv, #filterDiv, #SampleDiv, #mutateAttrbs, #GroupbyDiv').hide();
            $('#operaor-select-div').css({
              "border": "",
              "background": ""
            });
            var hiddenId = document.getElementById("param-id").value;
            var getCellById = graph.getCell(hiddenId);
            var currSelect = paper.findViewByModel(getCellById);
            var sourceJsonData = currSelect.model.attributes.inputData;
            var sourceJsonDataLength = Object.keys(sourceJsonData).length;
            var parameters = currSelect.model.attributes.settings.parameters;
            var parametersLength = Object.keys(parameters).length;
            if (parametersLength == 0) {
              currSelect.model.attributes.settings.parameters.selectedSelectVals = '';
            }
            var selectedSelectVars = currSelect.model.attributes.settings.parameters.selectedSelectVals;
            if (sourceJsonDataLength > 0) {
              update_select_attr(sourceJsonData, selectedSelectVars);
            }
            else {
              var slectHtml = '<select class="selectpicker multiselect" id="op_select_col" name="op_select_col" multiple required ></select>';
              $('#operaor-select-div').empty('').append(slectHtml);
              $('.selectpicker').selectpicker('refresh');
            }
          }
          else if (opTypeVal == 'Sample') {
            $('#SampleDiv').show();
            $('#paraFilePath,#SplitDiv, #AreachartDiv-container, #knnDiv, #dTreeDiv, #predictDiv, #performanceDiv, #paraAttrName, #MappingDiv, #OutputDiv, #CatDiv, #SummarizeDiv, #decisionTreeDiv, #joinDiv, #DistinctDiv, #classifierDiv, #sliceDiv, #filterDiv,#SelectDiv, #mutateAttrbs, #GroupbyDiv').hide();
            var hiddenId = document.getElementById("param-id").value;
            var getCellById = graph.getCell(hiddenId);
            var currSample = paper.findViewByModel(getCellById);
            var sourceJsonData = currSample.model.attributes.inputData;
            var sourceJsonDataLength = Object.keys(sourceJsonData).length;
            var parameters = currSample.model.attributes.settings.parameters;
            var parametersLength = Object.keys(parameters).length;
            if (parametersLength > 0) {
              var selectedSampleVars = currSample.model.attributes.settings.parameters.selectedSampleVals;
              var array = selectedSampleVars.split(",");
              $('#op_sample_type').val(array[0]);
              $('#sample_value').val(array[1]);
              $('op_sample_rep').val(array[2]);
            }
            else {
              $('#op_sample_type option[value=""]').prop('selected', true);
              $('#op_sample_rep option[value="true"]').prop('selected', true);
              $('#sample_value').val('');
            }
          }
          else if (opTypeVal == 'Distinct') {
            $('#DistinctDiv').show();
            $('#distinct_col_div').hide();
            $('#paraFilePath, #SplitDiv, #AreachartDiv-container, #knnDiv, #predictDiv, #performanceDiv, #dTreeDiv, #MappingDiv, #paraAttrName, #OutputDiv, #CatDiv, #SummarizeDiv, #decisionTreeDiv, #joinDiv, #classifierDiv, #sliceDiv, #SelectDiv, #SampleDiv, #filterDiv, #mutateAttrbs, #GroupbyDiv').hide();
            var hiddenId = document.getElementById("param-id").value;
            var getCellById = graph.getCell(hiddenId);
            var currDistinct = paper.findViewByModel(getCellById);
            var sourceJsonData = currDistinct.model.attributes.inputData;
            var sourceJsonDataLength = Object.keys(sourceJsonData).length;
            var parameters = currDistinct.model.attributes.settings.parameters;
            var parametersLength = Object.keys(parameters).length;
            if (parametersLength == 0) {
              currDistinct.model.attributes.settings.parameters.selectedDistinctVals = '';
            }
            var selectedSelectVars = currDistinct.model.attributes.settings.parameters.selectedDistinctVals;
            if (sourceJsonDataLength > 0) {
              var jsonData = read_json_file(sourceJsonData);
              var parametersLength = Object.keys(selectedSelectVars).length;
              var parseData = jsonData[0];
              $('#op_distinct_col').empty('').append("<option value=''>--Select Column--</option>");
              var sortAttributes = document.getElementById("op_distinct_col");
              for (var key in parseData) {
                var option = document.createElement("option");
                option.setAttribute("value", key);
                option.text = key;
                sortAttributes.appendChild(option);
              }
              $('#op_distinct_type').val("");
              $('#op_distinct_col').val("");
              $('#op_distinct_keep').val("true");
              if (parametersLength > 0) {
                var array = selectedSelectVars.split(",");
                $('#op_distinct_type').val(array[0]);
                $('#op_distinct_col').val(array[1]);
                $('#op_distinct_keep').val(array[2]);
                if (array[0] == "all") {
                  $('#distinct_col_div').hide();
                }
                else if (array[0] == "column") {
                  $('#distinct_col_div').show();
                }
              }
            }
          }
          else if (opTypeVal == 'Mapping') {
            $('#MappingDiv').show();
            $('#paraFilePath, #filterDiv, #AreachartDiv-container, #dTreeDiv, #predictDiv, #performanceDiv, #knnDiv, #SplitDiv, #paraAttrName, #OutputDiv, #CatDiv, #SummarizeDiv, #decisionTreeDiv, #joinDiv,#DistinctDiv, #classifierDiv, #sliceDiv, #SelectDiv, #SampleDiv, #mutateAttrbs, #GroupbyDiv').hide();
            var hiddenId = document.getElementById("param-id").value;
            var getCellById = graph.getCell(hiddenId);
            var currFilter = paper.findViewByModel(getCellById);
            var sourceJsonData = currFilter.model.attributes.inputData;
            var sourceJsonDataLength = Object.keys(sourceJsonData).length;
            var parameters = currFilter.model.attributes.settings.parameters;
            var parametersLength = Object.keys(parameters).length;
            if (parametersLength == 0) {
              var selectedFilters = {"selectedFilters": {}};
              currFilter.model.attributes.settings.parameters = selectedFilters;
            }
            var selectedFiltersVar = currFilter.model.attributes.settings.parameters.selectedFilters;
            if (sourceJsonDataLength > 0) {
              var newColName = currFilter.model.attributes.settings.parameters.newColName;
              update_mapping_attr(sourceJsonData, selectedFiltersVar, newColName);
            }
            else {
              var filterCounter = $('#mapping_div_count').val();
              for (i = 2; i <= filterCounter; i++) {
                $('#mapping_filter' + i).remove();
              }
              $('#mapping_filter_sel1').html("<option value=''>--Select Operator--</option>");
              $('#mapping_filter_cond_sel1').html("<option value=''>--Select Operator--</option>");
              $('#mapping_filter_cond_val1').val('');
              $('#mapping_new_val1').val('');
              $('#mapping_new_column').val('');
            }
          }
          else if (opTypeVal == 'Filter') {
            $('#filterDiv').show();
            $('#paraFilePath, #SplitDiv, #AreachartDiv-container, #dTreeDiv, #predictDiv, #performanceDiv, #knnDiv, #MappingDiv, #paraAttrName, #OutputDiv, #CatDiv, #SummarizeDiv, #decisionTreeDiv, #joinDiv,#DistinctDiv, #classifierDiv, #sliceDiv, #SelectDiv, #SampleDiv, #mutateAttrbs, #GroupbyDiv').hide();
            var hiddenId = document.getElementById("param-id").value;
            var getCellById = graph.getCell(hiddenId);
            var currFilter = paper.findViewByModel(getCellById);
            var sourceJsonData = currFilter.model.attributes.inputData;
            var sourceJsonDataLength = Object.keys(sourceJsonData).length;
            var parameters = currFilter.model.attributes.settings.parameters;
            var parametersLength = Object.keys(parameters).length;
            if (parametersLength == 0) {
              var selectedFilters = {"selectedFilters": {}};
              currFilter.model.attributes.settings.parameters = selectedFilters;
            }
            var selectedFiltersVar = currFilter.model.attributes.settings.parameters.selectedFilters;
            if (sourceJsonDataLength > 0) {
              update_filter_attr(sourceJsonData, selectedFiltersVar);
            }
            else {
              var filterCounter = $('#global_filter_count').val();
              for (i = 2; i <= filterCounter; i++) {
                $('#global_filter' + i).remove();
              }
              $('#global_filter_sel1').html("<option value=''>--Select Attribute--</option>");
              $('#global_filter_cond_sel1').html("<option value=''>--Select Operator--</option>");
              $('#global_filter_cond_val1').val('');
            }
          }
          else if (opTypeVal == 'Cat') {
            $('#CatDiv').show();
            $('#paraFilePath, #SplitDiv, #AreachartDiv-container, #dTreeDiv, #predictDiv, #performanceDiv, #knnDiv, #MappingDiv, #decisionTreeDiv, #OutputDiv, #paraAttrName, #SummarizeDiv, #filterDiv, #joinDiv, #DistinctDiv, #classifierDiv, #sliceDiv, #SelectDiv, #SampleDiv, #mutateAttrbs, #GroupbyDiv').hide();
          }
          else if (opTypeVal == 'Group by') {
            var hiddenId = document.getElementById("param-id").value;
            var getCellById = graph.getCell(hiddenId);
            var currFilter = paper.findViewByModel(getCellById);
            var sourceJsonData = currFilter.model.attributes.inputData;
            var sourceJsonDataLength = Object.keys(sourceJsonData).length;
            var parameters = currFilter.model.attributes.settings.parameters;
            var parametersLength = Object.keys(parameters).length;
            if (parametersLength == 0) {
              currFilter.model.attributes.settings.parameters.selectedGroupbyVals = '';
            }
            var selectedGroupbyVals = currFilter.model.attributes.settings.parameters.selectedGroupbyVals;
            if (sourceJsonDataLength > 0) {
              update_groupby_attr(sourceJsonData, selectedGroupbyVals);
            }
            else {
              var slectHtml = '<select class="selectpicker multiselect" id="op_groupby_col" name="op_groupby_col" multiple required ></select>';
              $('#groupby_col_div1').empty('').append(slectHtml);
              $('.selectpicker').selectpicker('refresh');
              $('#gb_summ_col option[value=""]').prop('selected', true);
              $('#op_groupby_func').selectpicker('deselectAll');
            }
            $('#GroupbyDiv').show();
            $('#paraFilePath, #SplitDiv, #AreachartDiv-container, #dTreeDiv, #predictDiv, #performanceDiv, #knnDiv, #MappingDiv, #decisionTreeDiv, #OutputDiv, #paraAttrName, #SummarizeDiv, #filterDiv, #joinDiv, #DistinctDiv, #classifierDiv, #sliceDiv, #SelectDiv, #SampleDiv, #mutateAttrbs, #CatDiv').hide();
          }
          else if (opTypeVal == 'Predict') {
            $('#predictDiv').show();
            $('#paraFilePath, #SplitDiv, #AreachartDiv-container, #CatDiv, #dTreeDiv, #performanceDiv, #knnDiv, #MappingDiv, #decisionTreeDiv, #OutputDiv, #paraAttrName, #SummarizeDiv, #filterDiv, #joinDiv, #DistinctDiv, #classifierDiv, #sliceDiv, #SelectDiv, #SampleDiv, #mutateAttrbs, #GroupbyDiv').hide();
          }
          else if (opTypeVal == 'Evaluation') {
            $('#performanceDiv').show();
            $('#paraFilePath, #SplitDiv, #AreachartDiv-container, #CatDiv, #dTreeDiv, #predictDiv, #knnDiv, #MappingDiv, #decisionTreeDiv, #OutputDiv, #paraAttrName, #SummarizeDiv, #filterDiv, #joinDiv, #DistinctDiv, #classifierDiv, #sliceDiv, #SelectDiv, #SampleDiv, #mutateAttrbs, #GroupbyDiv').hide();
          }
          else if (opTypeVal == 'Joins') {
            $('#joinDiv').show();
            var hiddenId = $("#parameters-box #param-id").val();
            var getJoinCellById = graph.getCell(hiddenId);
            var joinCellView = paper.findViewByModel(getJoinCellById);
            var joinType = joinCellView.model.attributes.settings.parameters.joinType;
            if (joinType == "undefined" || joinType == undefined || joinType == "") {
              $('#joinTypeId option[value="inner"]').prop('selected', true);
            }
            else {
              $('#joinTypeId option[value="' + joinType + '"]').prop('selected', true);
            }
            $('#paraFilePath, #SplitDiv, #AreachartDiv-container, #dTreeDiv, #predictDiv, #performanceDiv, #knnDiv, #MappingDiv, #paraAttrName, #OutputDiv, #CatDiv, #SummarizeDiv, #filterDiv, #decisionTreeDiv, #classifierDiv, #DistinctDiv, #sliceDiv, #SelectDiv, #SampleDiv, #mutateAttrbs, #GroupbyDiv').hide();
          }
          else if (opTypeVal == 'Slice') {
            var hiddenId = document.getElementById("param-id").value;
            var getCellById = graph.getCell(hiddenId);
            var currFilter = paper.findViewByModel(getCellById);
            var selectedFiltersVar = currFilter.model.attributes.settings.parameters.selectedFilters;
            if (selectedFiltersVar || selectedFiltersVar != undefined) {
              var array = selectedFiltersVar.split(",");
              $('#rowForm').val(array[0]);
              $('#rowTo').val(array[1]);
            } else {
              $('#rowForm').val('');
              $('#rowTo').val('');
            }
            $('#sliceDiv').show();
            $('#paraFilePath, #SplitDiv, #AreachartDiv-container, #dTreeDiv, #predictDiv, #performanceDiv, #knnDiv, #MappingDiv, #paraAttrName, #OutputDiv, #CatDiv, #SummarizeDiv, #filterDiv, #decisionTreeDiv, #classifierDiv, #DistinctDiv, #joinDiv, #SelectDiv, #SampleDiv, #mutateAttrbs, #GroupbyDiv').hide();
          }
          else if (opTypeVal == 'Cross Validation') {
            var hiddenId = document.getElementById("param-id").value;
            var getCellById = graph.getCell(hiddenId);
            var currFilter = paper.findViewByModel(getCellById);
            var selectedFiltersVar = currFilter.model.attributes.settings.parameters.selectedFilters;
            var col_name = $('#classifierOp-select option:selected').val();
            var sourceJsonData = currFilter.model.attributes.inputData;
            var sourceJsonDataLength = Object.keys(sourceJsonData).length;
            if (sourceJsonDataLength > 0) {
              if (col_name == "") {
                var sourceJsonData = currFilter.model.attributes.inputData;
                var droot_host = window.location.hostname;
                var droot = '/var/www/' + droot_host;
                var filePath = "file_path=" + droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
                //var file = "file_path= D://wamp/www/beta06-26-4-17/htdocs/sites/default/files/operator_files/" + sourceJsonData;
                var file = filePath.toString();
                var options = '';
                options += '<option value="">--Select Column--</option>';
                jQuery.ajax({
                  url: Drupal.url('tm-sketch-readcols'),
                  type: "POST",
                  data: file,
                  beforeSend: function () {
                    $(".graphLoader-modify").css('visibility', 'visible');
                  },
                  success: function (response) {
                    var count = 0;
                    for (key in response) {
                      var splitID = response [key].split("=");
                      var option = '<option value="' + splitID[0] + '" data-type="' + splitID[1] + '" data-id="' + count + '">' + splitID[0] + '</option>';
                      options += option;
                      count++;
                    }
                    $("#classifierOp-select").html(options);
                    $(".graphLoader-modify").css('visibility', 'hidden');
                    if (selectedFiltersVar == undefined || selectedFiltersVar == "") {
                      $('#classifierOp-select option[value=""]').prop('selected', true);
                    }
                    else {
                      $('#classifierOp-select option[value="' + selectedFiltersVar + '"]').prop('selected', true);
                    }
                  }
                });
              }
            } else {
              $('#classifierOp-select').html("<option value=''>--Select Column--</option>");
            }
            $('#classifierDiv').show();
            $('#paraFilePath, #SplitDiv, #AreachartDiv-container, #dTreeDiv, #predictDiv, #performanceDiv, #knnDiv, #MappingDiv, #paraAttrName, #OutputDiv, #CatDiv, #SummarizeDiv, #filterDiv, #joinDiv,#decisionTreeDiv, #sliceDiv, #SelectDiv, #DistinctDiv, #SampleDiv, #mutateAttrbs, #GroupbyDiv').hide();
          }
          else if (opTypeVal == 'KNN Classifier') {
            var hiddenId = document.getElementById("param-id").value;
            var getCellById = graph.getCell(hiddenId);
            var currFilter = paper.findViewByModel(getCellById);
            var sourceJsonData = currFilter.model.attributes.inputData;
            var sourceJsonDataLength = Object.keys(sourceJsonData).length;
            if (sourceJsonDataLength > 0) {
              var col_name = $('#knnOp-select option:selected').val();
              var droot_host = window.location.hostname;
              var droot = '/var/www/' + droot_host;
              var filePath = "file_path=" + droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
              var file = filePath.toString();
              var options = '';
              options += '<option value="">--Select Column--</option>';
              jQuery.ajax({
                url: Drupal.url('tm-sketch-readcols'),
                type: "POST",
                data: file,
                beforeSend: function () {
                  $(".graphLoader-modify").css('visibility', 'visible');
                  $("#knnOp-select").html(options);
                },
                success: function (response) {
                  var selectedFiltersVar = currFilter.model.attributes.settings.parameters.selectedVals;
                  var count = 0;
                  for (key in response) {
                    var splitID = response [key].split("=");
                    var option = '<option value="' + splitID[0] + '" data-type="' + splitID[1] + '" data-id="' + count + '">' + splitID[0] + '</option>';
                    /// if(splitID[1] == 'factor'){
                    options += option;
                    //}
                    count++;
                  }
                  $("#knnOp-select").html(options);
                  $(".graphLoader-modify").css('visibility', 'hidden');
                  if (selectedFiltersVar == undefined || selectedFiltersVar == "") {
                    $('#knnOp-select option[value=""]').prop('selected', true);
                  }
                  else {
                    $('#knnOp-select option[value="' + selectedFiltersVar + '"]').prop('selected', true);
                  }
                }
              });
            }
            else {
              $('#knnOp-select').html("<option value=''>--Select Column--</option>");
              $('#knnPercnt-select option[value=""]').prop('selected', true);
            }
            $('#knnDiv').show();
            $('#paraFilePath, #dTreeDiv, #AreachartDiv-container, #classifierDiv, #predictDiv, #performanceDiv, #SplitDiv, #MappingDiv, #paraAttrName, #OutputDiv, #CatDiv, #SummarizeDiv, #filterDiv, #joinDiv,#decisionTreeDiv, #sliceDiv, #SelectDiv, #DistinctDiv, #SampleDiv, #mutateAttrbs, #GroupbyDiv').hide();
          }
          else if (opTypeVal == 'Decision Tree') {
            var hiddenId = document.getElementById("param-id").value;
            var getCellById = graph.getCell(hiddenId);
            var currFilter = paper.findViewByModel(getCellById);
            var sourceJsonData = currFilter.model.attributes.inputData;
            var sourceJsonDataLength = Object.keys(sourceJsonData).length;
            if (sourceJsonDataLength > 0) {
              var col_name = $('#dtreeOp-select option:selected').val();
              if (col_name == "") {
                var droot_host = window.location.hostname;
                var droot = '/var/www/' + droot_host;
                var filePath = "file_path=" + droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
                var file = filePath.toString();
                var options = '';
                options += '<option value="">--Select Column--</option>';
                jQuery.ajax({
                  url: Drupal.url('tm-sketch-readcols'),
                  type: "POST",
                  data: file,
                  beforeSend: function () {
                    $(".graphLoader-modify").css('visibility', 'visible');
                  },
                  success: function (response) {
                    var selectedFiltersVar = currFilter.model.attributes.settings.parameters.selectedVals;
                    var count = 0;
                    for (key in response) {
                      var splitID = response [key].split("=");
                      var option = '<option value="' + splitID[0] + '" data-type="' + splitID[1] + '" data-id="' + count + '">' + splitID[0] + '</option>';
                      options += option;
                      count++;
                    }
                    $("#dtreeOp-select").html(options);
                    $(".graphLoader-modify").css('visibility', 'hidden');
                    if (selectedFiltersVar == undefined || selectedFiltersVar == "") {
                      $('#dtreeOp-select option[value=""]').prop('selected', true);
                    }
                    else {
                      $('#dtreeOp-select option[value="' + selectedFiltersVar + '"]').prop('selected', true);
                    }
                  }
                });
              }
            }
            else {
              $('#dtreeOp-select').html("<option value=''>--Select Column--</option>");
            }
            $('#dTreeDiv').show();
            $('#paraFilePath, #knnDiv, #AreachartDiv-container, #classifierDiv, #predictDiv, #performanceDiv, #SplitDiv, #MappingDiv, #paraAttrName, #OutputDiv, #CatDiv, #SummarizeDiv, #filterDiv, #joinDiv,#decisionTreeDiv, #sliceDiv, #SelectDiv, #DistinctDiv, #SampleDiv, #mutateAttrbs, #GroupbyDiv').hide();
          }
          else if (cellView.model.isLink()) {
            return false;
          }
          else {
            $('.nav-tabs a[href="#result-div"]').hide();
            $('#paraFilePath, #dTreeDiv, #AreachartDiv-container, #knnDiv, #SplitDiv, #predictDiv, #performanceDiv, #MappingDiv, #paraAttrName, #CatDiv, #OutputDiv, #SummarizeDiv, #filterDiv, #decisionTreeDiv, #joinDiv, #classifierDiv, #DistinctDiv, #sliceDiv, #SelectDiv, #SampleDiv, #mutateAttrbs, #GroupbyDiv').hide();
          }
          $("#curr-op-result").hide();
          $('.nav-tabs a[href="#parameterss-area"]').tab('show');
        }
      });
      $(document).keydown(function (event) {
        // Delete cell
        if (event.which == "46") {
          $('.selection-box').each(function (index, value) {
            var cellId = $(this).attr('data-model');
            var graphCell = graph.getCell(cellId);
            graphCell.remove();
          });
        }
        // copy cell
        if (event.which == "67")
          _.each(selectedCells, function (selectedCell) {
            var clone = selectedCell.clone();
            graph.addCell(clone);
          })
      });
      // clear grpah
      $('#btn-clear').on('click', _.bind(graph.clear, graph));
      // Grouping / Ungrouping
      var rect = joint.shapes.basic.Rect;
      $('#btn-group').click(function () {
        if ($(".selection-box").length == 0) {
          console.log("Nothing selected.");
          return;
        }
        var parent = element(rect);
        $('.selection-box').each(function (index, value) {
          var cellId = $(this).attr('data-model');
          cellids = graph.getCell(cellId);
          console.log(cellids);
          parent.embed(cellids);
          parent.fitEmbeds({
            deep: true,
            padding: 10
          });
          parent.toFront({deep: true});
          $(".joint-theme-default, .joint-selection, .selected div").remove(".selection-wrapper,.selection-box");
          $('#btn-save').addClass('alert-red');
        });
      });
      /**
       * KNN Classifier
       */
      $("#btn-knn-form").click(function () {
        var hiddenId = document.getElementById("param-id").value;
        var getCellById = graph.getCell(hiddenId);
        var currJoins = paper.findViewByModel(getCellById);
        var sourceJsonData = currJoins.model.attributes.inputData;
        var droot_host = window.location.hostname;
        var droot = '/var/www/' + droot_host;
        var train_data = droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
        var result_file = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_out.txt";
        var rds_file = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_out.rds";
        var col_name = $('#knnOp-select option:selected').val();
        if (col_name == "") {
          //alert('Please select prediction column.');
          if ($('#knnDiv .alert-danger').length == 0) {
            $('#knnDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Please select prediction column.</div>');
          }
          else {
            $('#knnDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Please select prediction column. ');
          }
          return false;
        }
        var formData = '{"train_data":"' + train_data + '", "rds_file":"' + rds_file + '", "resultFile":"' + result_file + '","col_name":"' + col_name + '"}';
        var knn_data = "knn_json=" + formData;
        jQuery.ajax({
          url: Drupal.url('tm-sketch-knn-operator'),
          type: "POST",
          data: knn_data,
          beforeSend: function () {
            $(".classifier-modify").css('visibility', 'visible');
          },
          success: function (response) {
            $(".classifier-modify").css('visibility', 'hidden');
            if (response == 'file created') {
              response = hiddenId + "_out.txt";
              currJoins.model.attributes.outputData = response;
              currJoins.model.attributes.settings.parameters.selectedVals = col_name;
              currJoins.model.attributes.settings.parameters.rdsFile = hiddenId + "_out.rds";
              var sourceJsonUpData = currJoins.model.attributes.outputData;
              var outboundLinks = graph.getConnectedLinks(getCellById, {
                outbound: true,
                deep: true
              });
              if (outboundLinks.length > 0) {
                removeConnectedLinks(outboundLinks);
              }
              /*add file to temp area*/
              var preVal = $.trim($('#temp_files_area').val());
              var newVal = preVal + ',' + response;
              newVal = (newVal[0] == ',') ? newVal.substr(1) : newVal;
              $('#temp_files_area').val(newVal);
              //end temp insetion
              if ($('#knnDiv .alert-success').length == 0) {
                $('#knnDiv').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
              } else {
                $('#knnDiv .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
              }
            }
            else if (response == 'Invalid Csv') {
              if ($('#knnDiv .alert-danger').length == 0) {
                $('#knnDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Invalid CSV.</div>');
              }
              else {
                $('#knnDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Invalid CSV.');
              }
            }
            else {
              if ($('#knnDiv .alert-danger').length == 0) {
                $('#knnDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd.</div>');
              }
              else {
                $('#knnDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd.');
              }
            }
            $('#btn-save').addClass('alert-red');
          },
          error: function (xhr, status, error) {
            if (xhr.status > 0)
              var html_knn = $('' +
                '<div class="modal fade"  role="dialog" id="knn-error-modal">' +
                '   <div class="modal-dialog">' +
                '     <div class="modal-content">' +
                '       <div class="modal-header">' +
                '         <button type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"  data-dismiss="modal"><span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>&nbsp;</button>' +
                '         <h4 class="modal-title">Error!</h4>' +
                '       </div>' +
                '       <div class="modal-body"> ' +
                '         <div id="msg">' +
                '           <h6>Got ' + status + '</h6>' +
                '         </div>' +
                '       </div>' +
                '   </div>' +
                '</div>');
            if ($('#knnDiv .alert-danger').length == 0) {
              $('#knnDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got ' + status + '</div>');
            }
            else {
              $('#knnDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '.');
            }
          }
        });
      });
      /**
       * Predict Operator
       */
      $("#btn-predict-submit").click(function () {
        var hiddenId = document.getElementById("param-id").value;
        var getCellById = graph.getCell(hiddenId);
        var currJoins = paper.findViewByModel(getCellById);
        var fileData1 = currJoins.model.attributes.settings.parameters.leftSource;
        var fileData2 = currJoins.model.attributes.settings.parameters.rightSource;
        if (fileData1 == undefined || fileData2 == undefined) {
          if ($('#predictDiv .alert-danger').length == 0) {
            $('#predictDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Please attach data to both ports.</div>');
          }
          else {
            $('#predictDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Please attach data to both ports.');
          }
          return false;
        }
        else {
        }
        var droot_host = window.location.hostname;
        var droot = '/var/www/' + droot_host;
        var rdsFile = droot + "/htdocs/sites/default/files/operator_files/" + fileData1;
        var tstData = droot + "/htdocs/sites/default/files/operator_files/" + fileData2;
        var rds_file_out = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_out.rds";
        var result_file = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_out.txt";
        var col_name = currJoins.model.attributes.settings.parameters.colName;
        var formData = '{"rdsFile":"' + rdsFile + '", "rds_file_out":"' + rds_file_out + '", "tstData":"' + tstData + '", "result_file":"' + result_file + '"}';
        var predict_data = "predict_json=" + formData;
        jQuery.ajax({
          url: Drupal.url('tm-sketch-predict-operator'),
          type: "POST",
          data: predict_data,
          beforeSend: function () {
            $(".classifier-modify").css('visibility', 'visible');
          },
          success: function (response) {
            console.log(response);
            $(".classifier-modify").css('visibility', 'hidden');
            if (response == 'file created') {
              response = hiddenId + "_out.txt";
              currJoins.model.attributes.outputData = response;
              currJoins.model.attributes.settings.parameters.colName = col_name;
              currJoins.model.attributes.settings.parameters.tstData = fileData2;
              currJoins.model.attributes.settings.parameters.rdsFile = hiddenId + "_out.rds";
              var sourceJsonUpData = currJoins.model.attributes.outputData;
              var outboundLinks = graph.getConnectedLinks(getCellById, {
                outbound: true,
                deep: true
              });
              if (outboundLinks.length > 0) {
                removeConnectedLinks(outboundLinks);
              }
              /*add file to temp area*/
              var preVal = $.trim($('#temp_files_area').val());
              var newVal = preVal + ',' + hiddenId + "_out.rds";
              newVal = (newVal[0] == ',') ? newVal.substr(1) : newVal;
              $('#temp_files_area').val(newVal);
              //end temp insetion
              if ($('#predictDiv .alert-success').length == 0) {
                $('#predictDiv').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
              } else {
                $('#predictDiv .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
              }
            }
            else {
              if ($('#predictDiv .alert-danger').length == 0) {
                $('#predictDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Factor levels mismatch or CSV contains more than 1 factor column.</div>');
              }
              else {
                $('#predictDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Factor levels mismatch or CSV contains more than 1 factor column.');
              }
            }
          },
          error: function (xhr, status, error) {
            if (xhr.status > 0)
              if ($('#predictDiv .alert-danger').length == 0) {
                $('#predictDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Got error, ' + status + '</div>');
              }
              else {
                $('#predictDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '.');
              }
          }
        });
      });
      /**
       * Performance operator
       */
      $("#btn-prfrmnc-submit").click(function () {
        var hiddenId = document.getElementById("param-id").value;
        var getCellById = graph.getCell(hiddenId);
        var currJoins = paper.findViewByModel(getCellById);
        var tstFile = currJoins.model.attributes.settings.parameters.tstData;
        var inputData = currJoins.model.attributes.settings.parameters.rdsFile;
        var droot_host = window.location.hostname;
        var droot = '/var/www/' + droot_host;
        var rdsFile = droot + "/htdocs/sites/default/files/operator_files/" + inputData;
        var tstData = droot + "/htdocs/sites/default/files/operator_files/" + tstFile;
        var result_file = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_out.csv";
        var col_name = currJoins.model.attributes.settings.parameters.colName;
        var formData = '{"rdsFile":"' + rdsFile + '", "tstData":"' + tstData + '", "col_name":"' + col_name + '", "result_file":"' + result_file + '"}';
        var performance_data = "performance_json=" + formData;
        jQuery.ajax({
          url: Drupal.url('tm-sketch-performance-operator'),
          type: "POST",
          data: performance_data,
          beforeSend: function () {
            $(".classifier-modify").css('visibility', 'visible');
          },
          success: function (response) {
            console.log(response);
            $(".classifier-modify").css('visibility', 'hidden');
            if (response == 'file created') {
              response = hiddenId + "_out.csv";
              currJoins.model.attributes.outputData = response;
              var sourceJsonUpData = currJoins.model.attributes.outputData;
              var outboundLinks = graph.getConnectedLinks(getCellById, {
                outbound: true,
                deep: true
              });
              if (outboundLinks.length > 0) {
                recursion_source(outboundLinks, sourceJsonUpData);
              }
              /*add file to temp area*/
              var preVal = $.trim($('#temp_files_area').val());
              var newVal = preVal + ',' + hiddenId + "_out.csv";
              newVal = (newVal[0] == ',') ? newVal.substr(1) : newVal;
              $('#temp_files_area').val(newVal);
              //end temp insetion
              if ($('#performanceDiv .alert-success').length == 0) {
                $('#performanceDiv').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
              } else {
                $('#performanceDiv .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
              }
            }
            else {
              if ($('#performanceDiv .alert-danger').length == 0) {
                $('#performanceDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd.</div>');
              }
              else {
                $('#performanceDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd.');
              }
            }
          },
          error: function (xhr, status, error) {
            if (xhr.status > 0)
              if ($('#performanceDiv .alert-danger').length == 0) {
                $('#performanceDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Got error, ' + status + '</div>');
              }
              else {
                $('#performanceDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '.');
              }
          }
        });
      });
      /**
       * Decision Tree
       */
      $("#btn-dtree-submit").click(function () {
        var hiddenId = document.getElementById("param-id").value;
        var getCellById = graph.getCell(hiddenId);
        var currJoins = paper.findViewByModel(getCellById);
        var leftSource = currJoins.model.attributes.settings.parameters.leftSource;
        var rightSource = currJoins.model.attributes.settings.parameters.rightSource;
        var droot_host = window.location.hostname;
        var droot = '/var/www/' + droot_host;
        var train_data = droot + "/htdocs/sites/default/files/operator_files/" + leftSource;
        var test_data = droot + "/htdocs/sites/default/files/operator_files/" + rightSource;
        var result_file = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_out.csv";
        var col_name = $('#dtreeOp-select option:selected').val();
        if (col_name == "") {
          if ($('#dTreeDiv .alert-danger').length == 0) {
            $('#dTreeDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Please select prediction column.</div>');
          }
          else {
            $('#dTreeDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Please select prediction column.');
          }
          return false;
        }
        var formData = '{"train_data":"' + train_data + '", "resultFile":"' + result_file + '","col_name":"' + col_name + '","test_data":"' + test_data + '"}';
        var dtree_data = "dtree_json=" + formData;
        jQuery.ajax({
          url: Drupal.url('tm-sketch-dtree-operator'),
          type: "POST",
          data: dtree_data,
          beforeSend: function () {
            $(".classifier-modify").css('visibility', 'visible');
          },
          success: function (response) {
            console.log(response);
            $(".classifier-modify").css('visibility', 'hidden');
            if (response == 'file created') {
              response = hiddenId + "_out.csv";
              currJoins.model.attributes.outputData = response;
              currJoins.model.attributes.settings.parameters.selectedVals = col_name;
              var sourceJsonUpData = currJoins.model.attributes.outputData;
              var outboundLinks = graph.getConnectedLinks(getCellById, {
                outbound: true,
                deep: true
              });
              if (outboundLinks.length > 0) {
                recursion_source(outboundLinks, sourceJsonUpData);
              }
              /*add file to temp area*/
              var preVal = $.trim($('#temp_files_area').val());
              var newVal = preVal + ',' + hiddenId + "_out.csv";
              newVal = (newVal[0] == ',') ? newVal.substr(1) : newVal;
              $('#temp_files_area').val(newVal);
              //end temp insetion
              if ($('#dTreeDiv .alert-success').length == 0) {
                $('#dTreeDiv').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
              } else {
                $('#dTreeDiv .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
              }
            } else if (response == 'Invalid Csv') {
              if ($('#dTreeDiv .alert-danger').length == 0) {
                $('#dTreeDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Invalid CSV</div>');
              }
              else {
                $('#dTreeDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Invalid CSV.');
              }
            }
            else {
              if ($('#dTreeDiv .alert-danger').length == 0) {
                $('#dTreeDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd</div>');
              }
              else {
                $('#dTreeDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd.');
              }
            }
            $('#btn-save').addClass('alert-red');
          },
          error: function (xhr, status, error) {
            if (xhr.status > 0)
              if ($('#dTreeDiv .alert-danger').length == 0) {
                $('#dTreeDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '</div>');
              }
              else {
                $('#dTreeDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '.');
              }
          }
        });
      });
      /**
       * sample op
       */
      $("#btn-sample-form").on('click', function () {
        var hiddenId = document.getElementById("param-id").value;
        var getCellById = graph.getCell(hiddenId);
        var currFilter = paper.findViewByModel(getCellById);
        var sourceJsonData = currFilter.model.attributes.inputData;
        var sampleBy = $('#op_sample_type').val();
        var sampleVal = $('#sample_value').val();
        var sampleRep = $('#op_sample_rep').val();
        var droot_host = window.location.hostname;
        var droot = '/var/www/' + droot_host;
        var data_set = droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
        var result_file = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_out.csv";
        var formData = '{"dataset":"' + data_set + '", "resultFile":"' + result_file + '","sampleBy":"' + sampleBy + '", "sampleRep":"' + sampleRep + '","sampleVal":"' + sampleVal + '"}';
        var sample_data = "sample_json=" + formData;
        if (sampleBy == 'precentage' && (sampleVal % 1 == 0 || sampleVal >= 1)) {
          if ($('#SampleDiv .alert-danger').length == 0) {
            $('#SampleDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Value should be in decimal less than 1. </div>');
          } else {
            $('#SampleDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Value should be in decimal less than 1.');
          }
          return false;
        }
        else if (sampleBy == 'rows-num' && sampleVal % 1 != 0) {
          if ($('#SampleDiv .alert-danger').length == 0) {
            $('#SampleDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Value should not be in decimal. </div>');
          } else {
            $('#SampleDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Value should not be in decimal.');
          }
          return false;
        }
        else {
          jQuery.ajax({
            url: Drupal.url('tm-sketch-sample'),
            type: "POST",
            data: sample_data,
            beforeSend: function () {
              $(".classifier-modify").css('visibility', 'visible');
            },
            success: function (response) {
              $(".classifier-modify").css('visibility', 'hidden');
              if (response == 'file created') {
                response = hiddenId + "_out.csv";
                var getCellFilterById = graph.getCell(hiddenId);
                var filterCellView = paper.findViewByModel(getCellFilterById);
                filterCellView.model.attributes.outputData = response;
                filterCellView.model.attributes.settings.parameters.selectedSampleVals = sampleBy + ',' + sampleVal + ',' + sampleRep;
                var sourceJsonUpData = filterCellView.model.attributes.outputData;
                var outboundLinks = graph.getConnectedLinks(getCellFilterById, {
                  outbound: true,
                  deep: true
                });
                if (outboundLinks.length > 0) {
                  recursion_source(outboundLinks, sourceJsonUpData);
                }
                /*add file to temp area*/
                var preVal = $.trim($('#temp_files_area').val());
                var newVal = preVal + ',' + hiddenId + "_out.csv";
                newVal = (newVal[0] == ',') ? newVal.substr(1) : newVal;
                $('#temp_files_area').val(newVal);
                //end temp insetion
                $('#btn-save').addClass('alert-red');
                if ($('#SampleDiv .alert-success').length == 0) {
                  $('#SampleDiv').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
                } else {
                  $('#SampleDiv .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
                }
              } else if (response == 'Rows To greater') {
                if ($('#SampleDiv .alert-danger').length == 0) {
                  $('#SampleDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Error! Result not updatedd. <br>Entered value is greater than available number of rows.</div>');
                } else {
                  $('#SampleDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Error! Result not updatedd. <br>Entered value is greater than available number of rows.');
                }
              }
              else {
                if ($('#SampleDiv .alert-danger').length == 0) {
                  $('#SampleDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd.</div>');
                }
                else {
                  $('#SampleDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd.');
                }
              }
            },
            error: function (xhr, status, error) {
              if (xhr.status > 0)
                var html_sample = $('' +
                  '<div class="modal fade"  role="dialog" id="sample-error-modal">' +
                  '   <div class="modal-dialog">' +
                  '     <div class="modal-content">' +
                  '       <div class="modal-header">' +
                  '         <button type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"  data-dismiss="modal"><span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>&nbsp;</button>' +
                  '         <h4 class="modal-title">Error!</h4>' +
                  '       </div>' +
                  '       <div class="modal-body"> ' +
                  '         <div id="msg">' +
                  '           <h6>Got ' + status + '</h6>' +
                  '         </div>' +
                  '       </div>' +
                  '   </div>' +
                  '</div>');
              if ($('#SampleDiv .alert-danger').length == 0) {
                $('#SampleDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '</div>');
              }
              else {
                $('#SampleDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '.');
              }
            }
          });
        }
      });
      /**
       * btn summarize submit
       */
      $("#btn-summarize-submit").on('click', function () {
        var hiddenId = document.getElementById("param-id").value;
        var getCellById = graph.getCell(hiddenId);
        var currFilter = paper.findViewByModel(getCellById);
        var sourceJsonData = currFilter.model.attributes.inputData;
        var selectedCol = $('#op_summarize_col option:selected').val();
        var droot_host = window.location.hostname;
        var droot = '/var/www/' + droot_host;
        var data_set = droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
        var result_file = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_out.csv";
        var formData = '{"dataset":"' + data_set + '", "resultFile":"' + result_file + '","columName":"' + selectedCol + '"}';
        var summarize_data = "summarize_json=" + formData;
        jQuery.ajax({
          url: Drupal.url('tm-sketch-summarize'),
          type: "POST",
          data: summarize_data,
          beforeSend: function () {
            $(".classifier-modify").css('visibility', 'visible');
          },
          success: function (response) {
            console.log(response);
            console.log("classifier operator applied");
            $(".classifier-modify").css('visibility', 'hidden');
            if (response == 'file created') {
              var getCellFilterById = graph.getCell(hiddenId);
              var filterCellView = paper.findViewByModel(getCellFilterById);
              filterCellView.model.attributes.outputData = hiddenId + "_out.csv";
              var sourceJsonUpData = filterCellView.model.attributes.outputData;
              filterCellView.model.attributes.settings.parameters.selectedSummarizeVals = selectedCol;
              var outboundLinks = graph.getConnectedLinks(getCellFilterById, {
                outbound: true,
                deep: true
              });
              if (outboundLinks.length > 0) {
                recursion_source(outboundLinks, sourceJsonUpData);
              }
              /*add file to temp area*/
              var preVal = $.trim($('#temp_files_area').val());
              var newVal = preVal + ',' + hiddenId + "_out.csv";
              newVal = (newVal[0] == ',') ? newVal.substr(1) : newVal;
              $('#temp_files_area').val(newVal);
              $('#btn-save').addClass('alert-red');
              if ($('#SummarizeDiv .alert-success').length == 0) {
                $('#SummarizeDiv').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
              } else {
                $('#SummarizeDiv .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
              }
            }
            else {
              if ($('#SummarizeDiv .alert-danger').length == 0) {
                $('#SummarizeDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd.</div>');
              }
              else {
                $('#SummarizeDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd.');
              }
            }
          },
          error: function (xhr, status, error) {
            if (xhr.status > 0)
              var html_summer = $('' +
                '<div class="modal fade"  role="dialog" id="summer-error-modal">' +
                '   <div class="modal-dialog">' +
                '     <div class="modal-content">' +
                '       <div class="modal-header">' +
                '         <button type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"  data-dismiss="modal"><span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>&nbsp;</button>' +
                '         <h4 class="modal-title">Error!</h4>' +
                '       </div>' +
                '       <div class="modal-body"> ' +
                '         <div id="msg">' +
                '           <h6>Got ' + status + '</h6>' +
                '         </div>' +
                '       </div>' +
                '   </div>' +
                '</div>');
            if ($('#SummarizeDiv .alert-danger').length == 0) {
              $('#SummarizeDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Got error,  ' + status + '</div>');
            }
            else {
              $('#SummarizeDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '.');
            }
          }
        });
      });
      /**
       * split op
       */
      $("#btn-split-submit").on('click', function () {
        var hiddenId = document.getElementById("param-id").value;
        var getCellById = graph.getCell(hiddenId);
        var currFilter = paper.findViewByModel(getCellById);
        var sourceJsonData = currFilter.model.attributes.inputData;
        var droot_host = window.location.hostname;
        var droot = '/var/www/' + droot_host;
        var data_set = droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
        var result_file1 = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_1_out.csv";
        var result_file2 = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_2_out.csv";
        var splitPercent = $('#splitPercnt-select option:selected').val();
        var formData = '{"dataset":"' + data_set + '", "splitPercent":"' + splitPercent + '", "resultFile1":"' + result_file1 + '","resultFile2":"' + result_file2 + '"}';
        var split_data = "split_json=" + formData;
        jQuery.ajax({
          url: Drupal.url('tm-sketch-split'),
          type: "POST",
          data: split_data,
          beforeSend: function () {
            $(".classifier-modify").css('visibility', 'visible');
          },
          success: function (response) {
            console.log(response);
            console.log("classifier operator applied");
            $(".classifier-modify").css('visibility', 'hidden');
            if (response == 'file created') {
              var getCellFilterById = graph.getCell(hiddenId);
              var filterCellView = paper.findViewByModel(getCellFilterById);
              filterCellView.model.attributes.leftOutputData = hiddenId + "_1_out.csv";
              filterCellView.model.attributes.rightOutputData = hiddenId + "_2_out.csv";
              filterCellView.model.attributes.settings.parameters.selectedVals = splitPercent;
              var outboundLinks = graph.getConnectedLinks(getCellFilterById, {
                outbound: true,
                deep: true
              });
              if (outboundLinks.length > 0) {
                removeConnectedLinks(outboundLinks);
              }
              /*add file to temp area*/
              var preVal = $.trim($('#temp_files_area').val());
              var newVal = preVal + ',' + hiddenId + "_1_out.csv" + ',' + hiddenId + "_2_out.csv";
              newVal = (newVal[0] == ',') ? newVal.substr(1) : newVal;
              $('#temp_files_area').val(newVal);
              //end temp insetion
              $('#btn-save').addClass('alert-red');
              if ($('#SplitDiv .alert-success').length == 0) {
                $('#SplitDiv').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
              } else {
                $('#SplitDiv .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
              }
            }
            else {
              if ($('#SplitDiv .alert-danger').length == 0) {
                $('#SplitDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Result not updatedd.</div>');
              }
              else {
                $('#SplitDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd.');
              }
            }
          },
          error: function (xhr, status, error) {
            if (xhr.status > 0)
            // alert('got error: ' + status);
              var html_split = $('' +
                '<div class="modal fade"  role="dialog" id="split-error-modal">' +
                '   <div class="modal-dialog">' +
                '     <div class="modal-content">' +
                '       <div class="modal-header">' +
                '         <button type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"  data-dismiss="modal"><span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>&nbsp;</button>' +
                '         <h4 class="modal-title">Error!</h4>' +
                '       </div>' +
                '       <div class="modal-body"> ' +
                '         <div id="msg">' +
                '           <h6>Got ' + status + '</h6>' +
                '         </div>' +
                '       </div>' +
                '   </div>' +
                '</div>');
            if ($('#SplitDiv .alert-danger').length == 0) {
              $('#SplitDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Got error,  ' + status + '</div>');
            }
            else {
              $('#SplitDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '.');
            }
          }
        });
      });
      $("#btn-distinct-form").on('click', function () {
        var hiddenId = document.getElementById("param-id").value;
        var getCellById = graph.getCell(hiddenId);
        var currFilter = paper.findViewByModel(getCellById);
        var sourceJsonData = currFilter.model.attributes.inputData;
        var distBy = $('#op_distinct_type').val();
        var distCol = $('#op_distinct_col').val();
        var distKeep = $('#op_distinct_keep').val();
        var droot_host = window.location.hostname;
        var droot = '/var/www/' + droot_host;
        var data_set = droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
        var result_file = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_out.csv";
        var formData = '{"dataset":"' + data_set + '", "resultFile":"' + result_file + '","distBy":"' + distBy + '", "distCol":"' + distCol + '","distKeep":"' + distKeep + '"}';
        var sample_data = "distinct_json=" + formData;
        jQuery.ajax({
          url: Drupal.url('tm-sketch-distinct'),
          type: "POST",
          data: sample_data,
          beforeSend: function () {
            $(".classifier-modify").css('visibility', 'visible');
          },
          success: function (response) {
            console.log(response);
            console.log("classifier operator applied");
            $(".classifier-modify").css('visibility', 'hidden');
            if (response == 'file created') {
              response = hiddenId + "_out.csv";
              var getCellFilterById = graph.getCell(hiddenId);
              var filterCellView = paper.findViewByModel(getCellFilterById);
              filterCellView.model.attributes.outputData = response;
              filterCellView.model.attributes.settings.parameters.selectedDistinctVals = distBy + ',' + distCol + ',' + distKeep;
              var sourceJsonUpData = filterCellView.model.attributes.outputData;
              var outboundLinks = graph.getConnectedLinks(getCellFilterById, {
                outbound: true,
                deep: true
              });
              if (outboundLinks.length > 0) {
                recursion_source(outboundLinks, sourceJsonUpData);
              }
              /*add file to temp area*/
              var preVal = $.trim($('#temp_files_area').val());
              var newVal = preVal + ',' + response;
              newVal = (newVal[0] == ',') ? newVal.substr(1) : newVal;
              $('#temp_files_area').val(newVal);
              //end temp insetion
              //$('#parameter-area-modal').modal('hide');
              $('#btn-save').addClass('alert-red');
              if ($('#DistinctDiv .alert-success').length == 0) {
                $('#DistinctDiv').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
              } else {
                $('#DistinctDiv .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
              }
            }
            else {
              if ($('#DistinctDiv .alert-danger').length == 0) {
                $('#DistinctDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd.</div>');
              }
              else {
                $('#DistinctDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd.');
              }
            }
          },
          error: function (xhr, status, error) {
            if (xhr.status > 0)
              var html_distinct = $('' +
                '<div class="modal fade"  role="dialog" id="distinct-error-modal">' +
                '   <div class="modal-dialog">' +
                '     <div class="modal-content">' +
                '       <div class="modal-header">' +
                '         <button type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"  data-dismiss="modal"><span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>&nbsp;</button>' +
                '         <h4 class="modal-title">Error!</h4>' +
                '       </div>' +
                '       <div class="modal-body"> ' +
                '         <div id="msg">' +
                '           <h6>Got ' + status + '</h6>' +
                '         </div>' +
                '       </div>' +
                '   </div>' +
                '</div>');
            if ($('#DistinctDiv .alert-danger').length == 0) {
              ('#DistinctDiv').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Got ' + status + '</div>');
            }
            else {
              $('#DistinctDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '.');
            }
          }
        });
      });
      /**
       * slice operator submit
       */
      $("#btn-slice-form").on('click', function () {
        var hiddenId = document.getElementById("param-id").value;
        var getCellById = graph.getCell(hiddenId);
        var currFilter = paper.findViewByModel(getCellById);
        var sourceJsonData = currFilter.model.attributes.inputData;
        var fromRow = Number($('#rowForm').val());
        var fromTo = Number($('#rowTo').val());
        var droot_host = window.location.hostname;
        var droot = '/var/www/' + droot_host;
        var data_set = droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
        var result_file = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_out.csv";
        var formData = '{"dataset":"' + data_set + '", "resultFile":"' + result_file + '","from":"' + fromRow + '", "to":' + fromTo + '}';
        var slice_data = "slice_json=" + formData;
        if (fromRow % 1 != 0 || fromTo % 1 != 0) {
          if ($('.alert-danger').length == 0) {
            $('#sliceDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Row from or row to can not be in decimal.</div>');
          }
          else {
            $('.alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Row from or row to can not be in decimal. ');
          }
          return false;
        }
        else if (fromRow > fromTo) {
          if ($('.alert-danger').length == 0) {
            $('#sliceDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Row from can not be greater than row to.</div>');
          }
          else {
            $('.alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Row from can not be greater than row to. ');
          }
          return false;
        }
        jQuery.ajax({
          url: Drupal.url('tm-sketch-slice-operator'),
          type: "POST",
          data: slice_data,
          beforeSend: function () {
            $(".classifier-modify").css('visibility', 'visible');
          },
          success: function (response) {
            console.log(response);
            console.log("classifier operator applied");
            $(".classifier-modify").css('visibility', 'hidden');
            if (response == 'file created') {
              response = hiddenId + "_out.csv";
              var getCellFilterById = graph.getCell(hiddenId);
              var filterCellView = paper.findViewByModel(getCellFilterById);
              filterCellView.model.attributes.outputData = response;
              filterCellView.model.attributes.settings.parameters.selectedFilters = fromRow + ',' + fromTo;
              var sourceJsonUpData = filterCellView.model.attributes.outputData;
              var outboundLinks = graph.getConnectedLinks(getCellFilterById, {
                outbound: true,
                deep: true
              });
              if (outboundLinks.length > 0) {
                recursion_source(outboundLinks, sourceJsonUpData);
              }
              /*add file to temp area*/
              var preVal = $.trim($('#temp_files_area').val());
              var newVal = preVal + ',' + response;
              newVal = (newVal[0] == ',') ? newVal.substr(1) : newVal;
              $('#temp_files_area').val(newVal);
              //$('#parameter-area-modal').modal('hide');
              $('#btn-save').addClass('alert-red');
              if ($('#sliceDiv .alert-success').length == 0) {
                $('#sliceDiv').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
              } else {
                $('#sliceDiv .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
              }
            }
            else if (response == 'Rows To greater') {
              if ($('#sliceDiv .alert-danger').length == 0) {
                $('#sliceDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Rows To is greater than number to records of input source.</div>');
              }
              else {
                $('#sliceDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Rows To is greater than number to records of input source. ');
              }
            }
            else {
              setTimeout(function () {
                $('#parameter-area-modal').modal('hide');
                $("#file-warn-modal").modal('show');
                ;
                setModalBackdrop();
              }, 1000);
            }
          },
          error: function (xhr, status, error) {
            if (xhr.status > 0)
              var html = $('' +
                '<div class="modal fade"  role="dialog" id="slice-error-modal">' +
                '   <div class="modal-dialog">' +
                '     <div class="modal-content">' +
                '       <div class="modal-header">' +
                '         <button type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"  data-dismiss="modal"><span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>&nbsp;</button>' +
                '         <h4 class="modal-title">Error!</h4>' +
                '       </div>' +
                '       <div class="modal-body"> ' +
                '         <div id="msg">' +
                '           <h6>Got ' + status + '</h6>' +
                '         </div>' +
                '       </div>' +
                '   </div>' +
                '</div>');
            if ($('#sliceDiv .alert-danger').length == 0) {
              $('#sliceDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Got error,  ' + status + '</div>');
            }
            else {
              $('#sliceDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '.');
            }
          }
        });
      });
      /**
       * classifier operator submit
       */
      $("#btn-classifier-form").on('click', function () {
        var hiddenId = document.getElementById("param-id").value;
        var getCellById = graph.getCell(hiddenId);
        var currFilter = paper.findViewByModel(getCellById);
        var sourceJsonData = currFilter.model.attributes.inputData;
        var col_name = $('#classifierOp-select option:selected').val();
        var col_id = $('#classifierOp-select option:selected').attr('data-id');
        if (col_name != "" && col_id != "") {
          form_data = "file_path=" + sourceJsonData + "&col_name=" + col_name + "&col_id=" + col_id + "&hiddenId=" + hiddenId;
          jQuery.ajax({
            url: Drupal.url('tm-sketch-classifier-operator'),
            type: "POST",
            data: form_data,
            beforeSend: function () {
              $(".classifier-modify").css('visibility', 'visible');
            },
            success: function (response) {
              console.log(response);
              console.log("classifier operator applied");
              $(".classifier-modify").css('visibility', 'hidden');
              var getCellFilterById = graph.getCell(hiddenId);
              var filterCellView = paper.findViewByModel(getCellFilterById);
              filterCellView.model.attributes.outputData = response;
              filterCellView.model.attributes.settings.parameters.selectedFilters = col_name;
              var sourceJsonUpData = filterCellView.model.attributes.outputData;
              var outboundLinks = graph.getConnectedLinks(getCellFilterById, {
                outbound: true,
                deep: true
              });
              if (outboundLinks.length > 0) {
                recursion_source(outboundLinks, sourceJsonUpData);
              }
              //$('#parameter-area-modal').modal('hide');
              $('#btn-save').addClass('alert-red');
              if ($('#classifierDiv .alert-success').length == 0) {
                $('#classifierDiv').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
              } else {
                $('#classifierDiv .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
              }
            },
            error: function (xhr, status, error) {
              if (xhr.status > 0)
                var html_classifier = $('' +
                  '<div class="modal fade"  role="dialog" id="classify-error-modal">' +
                  '   <div class="modal-dialog">' +
                  '     <div class="modal-content">' +
                  '       <div class="modal-header">' +
                  '         <button type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"  data-dismiss="modal"><span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>&nbsp;</button>' +
                  '         <h4 class="modal-title">Error!</h4>' +
                  '       </div>' +
                  '       <div class="modal-body"> ' +
                  '         <div id="msg">' +
                  '           <h6>Got ' + status + '</h6>' +
                  '         </div>' +
                  '       </div>' +
                  '   </div>' +
                  '</div>');
              if ($('#classifierDiv .alert-danger').length == 0) {
                $('#classifierDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Got error,  ' + status + '</div>');
              }
              else {
                $('#classifierDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '.');
              }
            }
          });
        }
        else {
          if ($('#classifierDiv .alert-danger').length == 0) {
            $('#classifierDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Please select predict column to submit.</div>');
          }
          else {
            $('#classifierDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>  Please select predict column to submit.');
          }
        }
      });
      //ungrouping
      $('#btn-ungroup').click(function () {
        if ($(".selection-box").length == 0) {
          console.log("Nothing selected for UnGrouping");
          return;
        }
        $('.selection-box').each(function (index, value) {
          var cellId = $(this).attr('data-model');
          cellids = graph.getCell(cellId);
          var numberOfChilds = cellids.getEmbeddedCells({deep: true});
          if (numberOfChilds.length > 0) {
            _.each(numberOfChilds, function (children) {
              cellids.unembed(children);
            });
            cellids.remove();
          }
          $('#btn-save').addClass('alert-red');
        });
      });
      //Export
      $('#btn-export').click(function () {
        $("#expModal").modal("show");
        setModalBackdrop();
        var jsonOut = JSON.stringify(graph);
        $('#expTxt').empty();
        $('#expTxt').append(jsonOut);
      });
      $('#copyToClip').click(function () {
        $("#expTxt").select();
        document.execCommand('copy');
      });
      $('#expTxt').focus(function () {
        var $this = $(this);
        $this.select();
        $this.mouseup(function () {
          $this.unbind("mouseup");
          return false;
        });
      });
      $('#btn-import').click(function () {
        $("#impModal").modal("show");
        setModalBackdrop();
      });
      $('#btn-import-json').click(function () {
        var rel = document.getElementById("impTxt").value;
        graph.fromJSON(JSON.parse(rel));
        $("#impModal").modal("hide");
        var graphelements = graph.getElements();
        _.each(graphelements, function (el) {
          var elOpType = el.attributes.operatorType;
          if (elOpType == 'Output') {
            paper.findViewByModel(graph.getCell(el.id)).options.interactive = false;
          }
        });
        $('#btn-save').addClass('alert-red');
      });
      //modify path
      $("#btn-modify").click(function () {
        var hiddenId = document.getElementById("param-id").value;
        var getCellById = graph.getCell(hiddenId);
        var source_type = "";
        var filename = "";
        var cellView = paper.findViewByModel(getCellById);
        var updateFilename = $('#selectedFilename option:selected').val();
        var radio_value = $('input[name=source-selector]:checked').val();
        var externalUrl = $('#external_source').val();
        if (externalUrl && radio_value == 'external') {
          source_type = 'external';
          filename = externalUrl;
        }
        else if (updateFilename && radio_value == 'internal') {
          source_type = 'internal';
          filename = updateFilename;
        }
        if (filename == "" || filename == undefined) {
          if ($('#paraFilePath .alert-danger').length == 0) {
            $('#paraFilePath').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Please select or enter csv file path to modify. </div>');
          }
          else {
            $('#paraFilePath .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>  Please select or enter csv file path to modify.');
          }
          return false;
        }
        else {
          read_source_file(filename, hiddenId, source_type);
        }
        $('#btn-save').addClass('alert-red');
      });
      //output submit
      $("#btn-output-submit").click(function () {
        $('#parameter-area-modal').modal('hide');
        $('#btn-save').addClass('alert-red');
      });
      // cat submit
      $("#btn-cat-submit").click(function () {
        var hiddenId = document.getElementById("param-id").value;
        var getCellById = graph.getCell(hiddenId);
        var currJoins = paper.findViewByModel(getCellById);
        var fileData1 = currJoins.model.attributes.settings.parameters.leftSource;
        var fileData2 = currJoins.model.attributes.settings.parameters.rightSource;
        if (fileData1 && fileData2) {
          var droot_host = window.location.hostname;
          var droot = '/var/www/' + droot_host;
          var result_file = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_out.csv";
          var fileData1 = droot + "/htdocs/sites/default/files/operator_files/" + fileData1;
          var fileData2 = droot + "/htdocs/sites/default/files/operator_files/" + fileData2;
          var formData = '{"x":"' + fileData1 + '", "resultFile":"' + result_file + '","y":"' + fileData2 + '"}';
          var cat_data = "cat_json=" + formData;
          jQuery.ajax({
            url: Drupal.url('tm-sketch-cat'),
            type: "POST",
            data: cat_data,
            beforeSend: function () {
              $(".classifier-modify").css('visibility', 'visible');
            },
            success: function (response) {
              console.log(response);
              //$('#parameter-area-modal').modal('hide');
              $(".classifier-modify").css('visibility', 'hidden');
              if (response == 'file created') {
                response = hiddenId + "_out.csv";
                var getCellFilterById = graph.getCell(hiddenId);
                var filterCellView = paper.findViewByModel(getCellFilterById);
                filterCellView.model.attributes.outputData = response;
                var sourceJsonUpData = filterCellView.model.attributes.outputData;
                var outboundLinks = graph.getConnectedLinks(getCellFilterById, {
                  outbound: true,
                  deep: true
                });
                if (outboundLinks.length > 0) {
                  recursion_source(outboundLinks, sourceJsonUpData);
                }
                /*add file to temp area*/
                var preVal = $.trim($('#temp_files_area').val());
                var newVal = preVal + ',' + response;
                newVal = (newVal[0] == ',') ? newVal.substr(1) : newVal;
                $('#temp_files_area').val(newVal);
                $('#btn-save').addClass('alert-red');
                if ($('#CatDiv .alert-success').length == 0) {
                  $('#CatDiv').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
                } else {
                  $('#CatDiv .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
                }
              }
              else if (response == 'csvs not matched') {
                if ($('#CatDiv .alert-danger').length == 0) {
                  $('#CatDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> CSV not matched. </div>');
                }
                else {
                  $('#CatDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> CSV not matched.');
                }
              }
              else {
                if ($('#CatDiv .alert-danger').length == 0) {
                  $('#CatDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd. </div>');
                }
                else {
                  $('#CatDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd.');
                }

              }
            },
            error: function (xhr, status, error) {
              if (xhr.status > 0)
              //alert('got error: ' + status);
                var html_cat = $('' +
                  '<div class="modal fade"  role="dialog" id="knn-error-modal">' +
                  '   <div class="modal-dialog">' +
                  '     <div class="modal-content">' +
                  '       <div class="modal-header">' +
                  '         <button type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"  data-dismiss="modal"><span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>&nbsp;</button>' +
                  '         <h4 class="modal-title">Error!</h4>' +
                  '       </div>' +
                  '       <div class="modal-body"> ' +
                  '         <div id="msg">' +
                  '           <h6>Got ' + status + '</h6>' +
                  '         </div>' +
                  '       </div>' +
                  '   </div>' +
                  '</div>');
              if ($('#CatDiv .alert-danger').length == 0) {
                $('#CatDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got ' + status + '</div>');
              }
              else {
                $('#CatDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error' + status + '.');
              }
            }
          });
        }
        else {
          if ($('#CatDiv .alert-danger').length == 0) {
            $('#CatDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Please attach data to both ports.</div>');
          }
          else {
            $('#CatDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Please attach data to both ports.');
          }
          return false;
        }
      });
      // groupby submit
      $("#btn-groupby-submit").click(function () {
        var hiddenId = document.getElementById("param-id").value;
        var getCellById = graph.getCell(hiddenId);
        var currFilter = paper.findViewByModel(getCellById);
        var sourceJsonData = currFilter.model.attributes.inputData;
        var groupbyCol = $('select[name="op_groupby_col"]').val();
        var funcType = $('select[name="op_groupby_func"]').val();
        var groupType = $('input[name=group-selector]:checked').val();
        var summarizeCol = $('#gb_summ_col option:selected').val();
        var droot_host = window.location.hostname;
        var droot = '/var/www/' + droot_host;
        var data_set = droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
        var result_file = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_out.csv";
        var formData = '{"dataset":"' + data_set + '", "resultFile":"' + result_file + '","funcType":"' + funcType + '","groupType":"' + groupType + '","summarizeCol":"' + summarizeCol + '","groupbyCol":"' + groupbyCol + '"}';
        var groupby_data = "groupby_json=" + formData;
        jQuery.ajax({
          url: Drupal.url('tm-sketch-groupby'),
          type: "POST",
          data: groupby_data,
          beforeSend: function () {
            $(".classifier-modify").css('visibility', 'visible');
          },
          success: function (response) {
            $(".classifier-modify").css('visibility', 'hidden');
            if (response == 'file created') {
              response = hiddenId + "_out.csv";
              var getCellFilterById = graph.getCell(hiddenId);
              var filterCellView = paper.findViewByModel(getCellFilterById);
              filterCellView.model.attributes.outputData = response;
              filterCellView.model.attributes.settings.parameters.selectedGroupbyVals = groupType + '-' + groupbyCol + '-' + summarizeCol + '-' + funcType;
              var sourceJsonUpData = filterCellView.model.attributes.outputData;
              var outboundLinks = graph.getConnectedLinks(getCellFilterById, {
                outbound: true,
                deep: true
              });
              if (outboundLinks.length > 0) {
                recursion_source(outboundLinks, sourceJsonUpData);
              }
              /*add file to temp area*/
              var preVal = $.trim($('#temp_files_area').val());
              var newVal = preVal + ',' + response;
              newVal = (newVal[0] == ',') ? newVal.substr(1) : newVal;
              $('#temp_files_area').val(newVal);
              //alert(newVal);
              $('#btn-save').addClass('alert-red');
              if ($('#GroupbyDiv .alert-success').length == 0) {
                $('#GroupbyDiv').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
              } else {
                $('#GroupbyDiv .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
              }
            }
            else {
              if ($('#GroupbyDiv .alert-danger').length == 0) {
                $('#GroupbyDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd. </div>');
              }
              else {
                $('#GroupbyDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd.');
              }
            }
          },
          error: function (xhr, status, error) {
            if (xhr.status > 0)
            //alert('got error: ' + status);
              var html_groupby = $('' +
                '<div class="modal fade"  role="dialog" id="groupby-error-modal">' +
                '   <div class="modal-dialog">' +
                '     <div class="modal-content">' +
                '       <div class="modal-header">' +
                '         <button type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"  data-dismiss="modal"><span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>&nbsp;</button>' +
                '         <h4 class="modal-title">Error!</h4>' +
                '       </div>' +
                '       <div class="modal-body"> ' +
                '         <div id="msg">' +
                '           <h6>Got ' + status + '</h6>' +
                '         </div>' +
                '       </div>' +
                '   </div>' +
                '</div>');
            if ($('#GroupbyDiv .alert-danger').length == 0) {
              $('#GroupbyDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got ' + status + '</div>');
            }
            else {
              $('#GroupbyDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '.');
            }
          }
        });
      });
      // Joins modify
      $("#joinModify").click(function () {
        var hiddenId = document.getElementById("param-id").value;
        var getCellById = graph.getCell(hiddenId);
        var currJoins = paper.findViewByModel(getCellById);
        var joinType = $('#joinTypeId option:selected').val();
        var fileData1 = currJoins.model.attributes.settings.parameters.leftSource;
        var fileData2 = currJoins.model.attributes.settings.parameters.rightSource;
        currentJoinType = joinType;
        currJoins.model.attributes.settings.parameters.joinType = currentJoinType;
        if ((fileData1.length > 0) && (fileData2.length > 0)) {
          var sourceJsonData1 = fileData1;
          var sourceJsonData2 = fileData2;
          applied_joins(sourceJsonData1, sourceJsonData2, joinType, getCellById, hiddenId);
        }
        else {
          if ($('#joinDiv .alert-danger').length == 0) {
            $('#joinDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Please attach data to both ports.</div>');
          }
          else {
            $('#joinDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Please attache data to oth ports.');
          }
          return false;
        }
      });
      // mutate submit
      $('body').on('submit', 'form#mutate_op_form', function (e) {
        var hiddenId = document.getElementById("param-id").value;
        var getCellById = graph.getCell(hiddenId);
        var currFilter = paper.findViewByModel(getCellById);
        var sourceJsonData = currFilter.model.attributes.inputData;
        var mType = $('input[name=mutate-selector]:checked').val();
        var col1 = $('#op_mutate_col1').val();
        var op = $('#op_mutate_col2').val();
        var col2 = $('#op_mutate_col3').val();
        var newCol = $('#newcolumn').val();
        var droot_host = window.location.hostname;
        var droot = '/var/www/' + droot_host;
        var data_set = droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
        var result_file = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_out.csv";
        var formData = '{"mType":"' + mType + '","dataset":"' + data_set + '", "resultFile":"' + result_file + '","col1":"' + col1 + '", "operator":"' + op + '","col2":"' + col2 + '","newCol":"' + newCol + '"}';
        var mutate_data = "mutate_json=" + formData;
        jQuery.ajax({
          url: Drupal.url('tm-sketch-mutate'),
          type: "POST",
          data: mutate_data,
          beforeSend: function () {
            $(".classifier-modify").css('visibility', 'visible');
          },
          success: function (response) {
            console.log(response);
            console.log("classifier operator applied");
            $(".classifier-modify").css('visibility', 'hidden');
            if (response == 'file created') {
              response = hiddenId + "_out.csv";
              var getCellFilterById = graph.getCell(hiddenId);
              var filterCellView = paper.findViewByModel(getCellFilterById);
              filterCellView.model.attributes.outputData = response;
              filterCellView.model.attributes.settings.parameters.selectedMutateVals = col1 + ',' + op + ',' + col2 + ',' + newCol + ',' + mType;
              var sourceJsonUpData = filterCellView.model.attributes.outputData;
              var outboundLinks = graph.getConnectedLinks(getCellFilterById, {
                outbound: true,
                deep: true
              });
              if (outboundLinks.length > 0) {
                recursion_source(outboundLinks, sourceJsonUpData);
              }
              var preVal = $.trim($('#temp_files_area').val());
              var newVal = preVal + ',' + response;
              newVal = (newVal[0] == ',') ? newVal.substr(1) : newVal;
              $('#temp_files_area').val(newVal);
              $('#btn-save').addClass('alert-red');
              if ($('#mutateAttrbs .alert-success').length == 0) {
                $('#mutateAttrbs').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
              } else {
                $('#mutateAttrbs .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
              }
            }
            else {
              if ($('#mutateAttrbs .alert-danger').length == 0) {
                $('#mutateAttrbs').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd.</div>');
              }
              else {
                $('#mutateAttrbs .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updatedd.');
              }
            }
          },
          error: function (xhr, status, error) {
            if (xhr.status > 0)
              if ($('#mutateAttrbs .alert-danger').length == 0) {
                $('#mutateAttrbs').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got ' + status + '</div>');
              }
              else {
                $('#mutateAttrbs .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '.');
              }
          }
        });
        return false;
      });
      //current data
      $("#contextTabularData").click(function () {
        var hiddenId = $('#contextTabularData').attr("contextOperatorId");
        var getCellById = graph.getCell(hiddenId);
        var currContextData = paper.findViewByModel(getCellById);
        current_data_func(currContextData);
      });
      $("#contextChartData").click(function () {
        var hiddenId = $('#contextChartData').attr("contextOperatorId");
        var getCellById = graph.getCell(hiddenId);
        var currContextData = paper.findViewByModel(getCellById);
        //  alert(JSON.stringify(graph));
        current_data_charts(currContextData);
      });
      $(".result_link").click(function (e) {
        e.preventDefault();
        $(".txtFilesRslt, .rows-found").remove();
        var hiddenId = jQuery('#param-id').val();
        var getCellById = graph.getCell(hiddenId);
        var currContextData = paper.findViewByModel(getCellById);
        var opType = currContextData.model.attributes.operatorType;
        var inputData = currContextData.model.attributes.inputData;
        if (inputData == '') {
          $("#curr-op-result").show();
          $("#no-result").html('<div >No operator data available</div>');
          $("#no-result").show();
          $("#currentResultTable").hide();
        }
        else if ((opType == "Cat" || opType == "Joins" || opType == "KNN Classifier" || opType == "Predict") && currContextData.model.attributes.outputData == "") {
          $("#curr-op-result").show();
          $("#no-result").html('<div >Please submit the operator to view result.</div>');
          $("#no-result").show();
          $("#currentResultTable").hide();
        }
        else {
          $('#result-div').append('<div class="loading-div full-width"><img class="loading_img" src="/sites/default/files/loading-result.gif"></div>');
          current_data_func(currContextData);
          $("#currentResultTable").show();
          jQuery("#no-result").hide();
          $('#result-div .loading-div').remove();
        }
        $('#df1 .loading-div').remove();
        $('#df2 .loading-div').remove();
      });
      $(".df1_link").click(function (e) {
        e.preventDefault();
        $('#result-div').hide();
        $(".rows-found-df1").remove();
        $('#df1').show();
        $('#df2').hide();
        $('#df2 .loading-div').remove();
        var hiddenId = jQuery('#param-id').val();
        var getCellById = graph.getCell(hiddenId);
        var currContextData1 = paper.findViewByModel(getCellById);
        var opType = currContextData1.model.attributes.operatorType;
        var inputData = currContextData1.model.attributes.inputData;
        if (inputData == '') {
          $("#curr-op-result-df1").show();
          $("#no-result-df1").html('<div >No operator data available</div>');
          $("#no-result-df1").show();
          $("#currentResultTable-df1").hide();
        }
        else if (opType == "Split" && currContextData1.model.attributes.leftOutputData == undefined) {
          $("#curr-op-result").hide();
          $("#no-result-df1").html('<div >Please submit the operator to view result.</div>');
          $("#no-result-df1").show();
          $("#currentResultTable").hide();
          $("#currentResultTable-df1").hide();
        }
        else {
          $("#no-result-df1").hide();
          $('#df1').append('<div class="loading-div full-width"><img class="loading_img" src="/sites/default/files/loading-result.gif"></div>');
          $("#curr-op-result-df1").show();
          $("#currentResultTable-df1").show();
          current_data_func1(currContextData1);
          $('#df1 .loading-div').remove();
        }
      });
      $(".df2_link").click(function (e) {
        e.preventDefault();
        $('#result-div').hide();
        $(".rows-found-df2").remove();
        $('#df2').show();
        $('#df1').hide();
        $('#df1 .loading-div').remove();
        var hiddenId = jQuery('#param-id').val();
        var getCellById = graph.getCell(hiddenId);
        var currContextData1 = paper.findViewByModel(getCellById);
        var opType = currContextData1.model.attributes.operatorType;
        var inputData = currContextData1.model.attributes.inputData;
        if (inputData == '') {
          $("#curr-op-result-df2").show();
          $("#no-result-df2").html('<div >No operator data available</div>');
          $("#no-result-df2").show();
          $("#currentResultTable-df2").hide();
        }
        else if (opType == "Split" && currContextData1.model.attributes.rightOutputData == undefined) {
          $("#curr-op-result").hide();
          $("#no-result-df2").html('<div >Please submit the operator to view result.</div>');
          $("#no-result-df2").show();
          $("#currentResultTable").hide();
          $("#currentResultTable-df2").hide();
        }
        else {
          $("#no-result-df2").hide();
          $('#df2').append('<div class="loading-div full-width"><img class="loading_img" src="/sites/default/files/loading-result.gif"></div>');
          $("#curr-op-result-df2").show();
          $("#currentResultTable-df2").show();
          current_data_func1(currContextData1);
          $('#df2 .loading-div').remove();
        }
      });
      graph.on('change:source change:target', function (link) {
        var sourceId = link.get('source').id;
        var targetId = link.get('target').id;
        var getSourceCell = graph.getCell(sourceId);
        getSourceCell.prop('ports/groups/out/attrs/.port-body/fill', 'yellow');
        if (targetId) {
          var getTargetCell = graph.getCell(targetId);
          var getSourceCellType = getSourceCell.attributes.operatorType;
          var getTargetCellType = getTargetCell.attributes.operatorType;
          getSourceCell.prop('ports/groups/out/attrs/.port-body/fill', '#ccd6d6');
          //update target operator by connecting to source operator
          if (getSourceCellType == 'Split') {
            var sourceJsonData = "";
            if (link.get('source').port == 'df1') {
              sourceJsonData = getSourceCell.attributes.leftOutputData;
            }
            if (link.get('source').port == 'df2') {
              sourceJsonData = getSourceCell.attributes.rightOutputData;
            }
            if (sourceJsonData == "" || sourceJsonData == undefined) {
              sourceJsonData = getSourceCell.attributes.outputData;
            }
            getTargetCell.attributes.inputData = sourceJsonData;
            getTargetCell.attributes.outputData = sourceJsonData;
            var outboundLinks = graph.getConnectedLinks(getTargetCell, {
              outbound: true,
              deep: true
            });
            recursion_source(outboundLinks, sourceJsonData);
          } else {
            var sourceJsonData = getSourceCell.attributes.outputData;
            getTargetCell.attributes.inputData = sourceJsonData;
            getTargetCell.attributes.outputData = sourceJsonData;
            var sourceJsonUpData = getTargetCell.attributes.outputData;
            var outboundLinks = graph.getConnectedLinks(getTargetCell, {
              outbound: true,
              deep: true
            });
            recursion_source(outboundLinks, sourceJsonUpData);
          }
          if (getTargetCellType == 'Predict' || getTargetCellType == 'Evaluation') {
            if (link.get('target').port == 'mdl' && link.get('source').port != 'rds') {
              link.remove();
              $("#predicterror-modal #msg").html('<h6>Error! Predict source operator can only be KNN Classifier.</h6>');
               $("#predicterror-modal").modal('show');
               setModalBackdrop();
            }
            if (link.get('target').port == 'pdt' && getSourceCellType != "Predict") {
              link.remove();
              $("#predicterror-modal #msg").html('<h6>Error! Evaluation source operator can only be Predict.</h6>');
               $("#predicterror-modal").modal('show');
               setModalBackdrop();
            }
          }
          if (getTargetCellType == 'Joins' || getTargetCellType == 'Cat' || getTargetCellType == 'Predict' || getTargetCellType == 'Decision Tree') {
            // var links = graph.getConnectedLinks(cellView.model, { outbound: true });
            if (link.get('target').port == 'lef' || link.get('target').port == 'df1' || link.get('target').port == 'trn') {
              var leftSource = getSourceCell.attributes.outputData;
              if (getSourceCellType == 'Split') {
                leftSource = getSourceCell.attributes.leftOutputData;
              }
              getTargetCell.attributes.settings.parameters.leftSource = leftSource;
            }
            if (link.get('target').port == 'rig' || link.get('target').port == 'df2' || link.get('target').port == 'tst') {
              var rightSource = getSourceCell.attributes.outputData;
              if (getSourceCellType == 'Split') {
                rightSource = getSourceCell.attributes.rightOutputData;
              }
              getTargetCell.attributes.settings.parameters.rightSource = rightSource;
            }
            if (link.get('target').port == 'mdl') {
              var leftSource = getSourceCell.attributes.settings.parameters.rdsFile;
              var colName = getSourceCell.attributes.settings.parameters.selectedVals;
              getTargetCell.attributes.settings.parameters.leftSource = leftSource;
              getTargetCell.attributes.settings.parameters.colName = colName;
            }
            getTargetCell.attributes.outputData = "";
          }
          if (getTargetCellType == 'Evaluation') {
            var colName = getSourceCell.attributes.settings.parameters.colName;
            var tstData = getSourceCell.attributes.settings.parameters.tstData;
            var rdsFile = getSourceCell.attributes.settings.parameters.rdsFile;
            getTargetCell.attributes.settings.parameters.colName = colName;
            getTargetCell.attributes.settings.parameters.tstData = tstData;
            getTargetCell.attributes.settings.parameters.rdsFile = rdsFile;
            getTargetCell.attributes.outputData = "";
          }
          if (getSourceCellType == 'Joins') {
            if (getSourceCell.attributes.settings.parameters.joinType == undefined) {
              console.log('Plz select join type');
              var joinType = "inner";
              var hiddenId = document.getElementById("param-id").value;
              var currJoins = paper.findViewByModel(getSourceCell);
              var fileData1 = currJoins.model.attributes.settings.parameters.leftSource;
              var fileData2 = currJoins.model.attributes.settings.parameters.rightSource;
              currJoins.model.attributes.settings.parameters.joinType = joinType;
              if ((fileData1.length > 0) && (fileData2.length > 0)) {
                console.log('filedata1 and 2');
                var sourceJsonData1 = fileData1;
                var sourceJsonData2 = fileData2;
                var getCellById = getSourceCell;
                applied_joins(sourceJsonData1, sourceJsonData2, joinType, getCellById, hiddenId);
              }
              else {
                if ($('#joinDiv .alert-danger').length == 0) {
                  $('#joinDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Please attach data to both ports.</div>');
                }
                else {
                  $('#joinDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Please attach data to both ports.');
                }
              }
            }
          }
          $('#btn-save').addClass('alert-red');
        }
      });
      // link removed
      graph.on('remove', function (cell, collection, opt) {
        if (cell.isLink()) {
          // a link was removed  (cell.id contains the ID of the removed link)
          var removedSourceId = cell.get('source').id;
          var removedTargetId = cell.get('target').id;
          var getRemovedSourceCell = graph.getCell(removedSourceId);
          // if source link removed its port is active again
          getRemovedSourceCell.prop('ports/groups/out/attrs/.port-body/magnet', 'active');
          // code for link removed between operators
          var removedTargetCell = graph.getCell(removedTargetId);
          var removedTargetCellView = paper.findViewByModel(removedTargetCell);
          removedTargetCellView.model.attributes.inputData = '';
          removedTargetCellView.model.attributes.outputData = '';
          if (removedTargetCellView.model.attributes.operatorType == 'Joins' || removedTargetCellView.model.attributes.operatorType == 'Cat' || removedTargetCellView.model.attributes.operatorType == 'Predict' || removedTargetCellView.model.attributes.operatorType == 'Decision Tree') {
            if (cell.get('target').port == 'lef' || cell.get('target').port == 'df1' || cell.get('target').port == 'trn' || cell.get('target').port == 'mdl') {
              removedTargetCellView.model.attributes.settings.parameters.leftSource = '';
            }
            if (cell.get('target').port == 'rig' || cell.get('target').port == 'df2' || cell.get('target').port == 'tst') {
              removedTargetCellView.model.attributes.settings.parameters.rightSource = '';
            }
          }
          else {
            removedTargetCellView.model.attributes.settings.parameters = {};
          }
          if (removedTargetCellView.model.attributes.operatorType == 'Evaluation' || removedTargetCellView.model.attributes.operatorType == 'Predict') {
            removedTargetCellView.model.attributes.settings.parameters.colName = "";
            removedTargetCellView.model.attributes.settings.parameters.tstData = "";
          }
          // if removed link target element has outbound links
          var removedTargetCellOutLinks = graph.getConnectedLinks(removedTargetCell, {outbound: true});
          // recursive function for removing data from target connected operators
          recursion_target(removedTargetCellOutLinks);
        }
        if (!cell.isLink()) {
          var filename = cell.id + "_out.csv";
          var preVal = $.trim($('#deleted_datasets_area').val());
          var newVal = preVal + ',' + filename;
          newVal = (newVal[0] == ',') ? newVal.substr(1) : newVal;
          $('#deleted_datasets_area').val(newVal);
        }
        $('#btn-save').addClass('alert-red');
      });
      // restricting child elements in group
      graph.on('change:position', function (cell) {
        var parentId = cell.get('parent');
        if (!parentId) return;
        var parent = graph.getCell(parentId);
        var parentBbox = parent.getBBox();
        var cellBbox = cell.getBBox();
        $('#btn-save').addClass('alert-red');
        if (parentBbox.containsPoint(cellBbox.origin()) &&
          parentBbox.containsPoint(cellBbox.topRight()) &&
          parentBbox.containsPoint(cellBbox.corner()) &&
          parentBbox.containsPoint(cellBbox.bottomLeft())) {
          return;
        }
        // Revert the child position.
        cell.set('position', cell.previous('position'));
      });
      // Save graph
      $('#btn-save').click(function () {
        $('#parameter-area-modal').modal('hide');
        jsonSave = JSON.stringify(graph);
        var sketch_nid = $("#graphNid").val();
        var filenames = $('#deleted_datasets_area').val();
        $("#chartsMsg-modal").modal("hide");
        if (filenames != "") {
          $.ajax({
            type: 'POST',
            data: {
              filenames: filenames,
              sketch_id: sketch_nid,
            },
            url: Drupal.url('delete-dataset')
          });
          $('#deleted_datasets_area').val('');
        }
        $('#temp_files_area').val('');
        save_sketch(sketch_nid, jsonSave);
        $('#btn-save').removeClass('alert-red');
      });
      // Process run
      $('#btn-run').click(function () {
        var graphelements = graph.getElements();
        // check all elements type
        _.each(graphelements, function (el) {
          var elOpType = el.attributes.operatorType;
          if (elOpType == 'Output') {
            var outputElementCell = graph.getCell(el.id);
            var outputInboundLink = graph.getConnectedLinks(outputElementCell, {inbound: true});
            if (outputInboundLink.length > 0) {
              _.each(outputInboundLink, function (outputInboundLink) {
                var OutputElement = outputInboundLink.getTargetElement();
                var getOutput = graph.getCell(OutputElement);
                var sourceJsonData = getOutput.attributes.inputData;
                var sourceJsonDataLength = Object.keys(sourceJsonData).length;
                if (sourceJsonDataLength > 0) {
                  result_data(sourceJsonData);
                }
                else {
                  $("#sourceConnectedFileAttachModal").modal("show");
                }
              });
            }
            else {
              $("#outNotConnectedModal").modal("show");
            }
          }
          if (elOpType == 'Source') {
            var outputElementCell = graph.getCell(el.id);
            var outputInboundLink = graph.getConnectedLinks(outputElementCell, {outbound: true});
            if (outputInboundLink.length == 0) {
              $("#sourceNotConnectedModal").modal("show");
            }
          }
        });
      });
      // current graph data from database
      var current_data = $("#currentGraphData").val();
      var current_graph_data = current_data; //$.parseJSON(current_data);
      if (current_graph_data) {
        $('#savedgraph').val(current_graph_data);
        var graphelements = graph.getElements();
        var graphrel = document.getElementById("savedgraph").value;
        graph.fromJSON(JSON.parse(graphrel));
      }
      // Add more button
      $(document).on("click", ".add-more", function (e) {
        e.preventDefault();
        var btnName = $(this).attr('name');
        if (btnName == "global_addmore") {
          var next = $('#global_filter_count').val();
          next++;
          var getDom = $("#global_filter_sel1").html();
          var getDom1 = $("#global_filter_cond_sel1").html();
          var newAnd = '<div id="and_global_filter' + next + '" class="form-group form-inline andDiv">';
          var Andcont = '<span>And</span>';
          var newAndend = '</div>';
          var newfilterdiv = '<div id="global_filter' + next + '" class="form-group form-inline filterDiv">';
          var newglobal_filter_sel = '<select class="form-control filterColoumSel" required="" id="global_filter_sel' + next + '" name="global_filter_sel' + next + '">';
          newglobal_filter_sel += getDom + '</select>';
          var newglobal_filter_cond_sel = '<select class="form-control filterColoumSel2" required="" id="global_filter_cond_sel' + next + '" name="global_filter_cond_sel' + next + '">';
          newglobal_filter_cond_sel += '<option>--Select Operator--</option></select>';
          var newIn = '<input type="text" class="form-control" required="" id="global_filter_cond_val' + next + '" name="global_filter_cond_val' + next + '" placeholder="Value">';
          var newfilterdivEnd = '</div>';
          var complDiv = newAnd + Andcont + newAndend + newfilterdiv + newglobal_filter_sel + newglobal_filter_cond_sel + newIn + newfilterdivEnd;
          var removebtn = '<input type="button" value="x" id="global_' + next + '" class="btn btn-danger remove-me" />';
          $('#data-view-filters .filterDiv').last().after(complDiv);
          $('#global_filter' + next).find("select option").removeAttr("selected");
          $('#global_filter' + next).find("select:first").focus();
          $('#global_filter' + next).append(removebtn);
          $('#global_filter_count').val(next);
        }
        else if (btnName == "sort_addmore") {
          var next = $('#sort_col_count').val();
          next++;
          var getDom = $("#sortAttributes_1").html();
          var getDom1 = $("#sortType_1").html();
          var newsortdiv = '<div id="sort_col_' + next + '" class="form-group form-inline sortDiv">';
          var newSortAttributes = '<select class="form-control sortColoumAttr" id="sortAttributes_' + next + '" name="sortAttributes_' + next + '">';
          newSortAttributes += getDom + '</select>';
          var newSortType = '<select class="form-control sortColoumType" id="sortType_' + next + '" name="sortType_' + next + '">';
          newSortType += getDom1 + '</select>';
          var newsortdivEnd = '</div>';
          var complDiv = newsortdiv + newSortAttributes + newSortType + newsortdivEnd;
          var removebtn = '<input type="button" value="x" id="sort_remove_' + next + '" class="btn btn-danger remove-me" />';
          $('#sortForm .sortDiv').last().after(complDiv);
          $('#sort_col_' + next).find("select option").removeAttr("selected");
          $('#sort_col_' + next).find("select:first").focus();
          $('#sort_col_' + next).append(removebtn);
          $('#sort_col_count').val(next);
        }
        else if (btnName == "mapping_addmore") {
          var next = $('#mapping_div_count').val();
          next++;
          var getDom = $("#mapping_filter_sel1").html();
          var getDom1 = $("#mapping_filter_cond_sel1").html();
          var newfilterdiv = '<div id="mapping_filter' + next + '" class="mappingDiv"><div class="mapping-div-inner">';
          var newValue = '<input type="text" class="form-control" id="mapping_new_val' + next + '" name="mapping_new_val' + next + '" placeholder="New value" required="" ><label>Condition: <span class="form-required" title="These fields are required."></span></label>';
          var inLineDiv = '<div class="form-group form-inline mapdiv">';
          var newmap_filter_sel = '<select class="form-control filterColoumSel" id="mapping_filter_sel' + next + '" name="mapping_filter_sel' + next + '" required="">';
          newmap_filter_sel += getDom + '</select>';
          var newglobal_filter_cond_sel = '<select class="form-control filterColoumSel2" required="" id="mapping_filter_cond_sel' + next + '" name="mapping_filter_cond_sel' + next + '">';
          newglobal_filter_cond_sel += '<option value="" selected="selected">--Select Operator--</option></select>';
          var newIn = '<input type="text" class="form-control" id="mapping_filter_cond_val' + next + '" name="mapping_filter_cond_val' + next + '" placeholder="Value" required="" >';
          var inlinedivEnd = '</div></div>';
          var newfilterdivEnd = '</div>';
          var complDiv = newfilterdiv + newValue + inLineDiv + newmap_filter_sel + newglobal_filter_cond_sel + newIn + inlinedivEnd + newfilterdivEnd;
          var removebtn = '<input type="button" value="x" id="mapping_remove_' + next + '" class="btn btn-danger remove-me" />';
          $('#mapping-filters .mappingDiv').last().after(complDiv);
          $('#mapping_filter' + next).find("select option").removeAttr("selected");
          $('#mapping_filter' + next).find("select:first").focus();
          $('#mapping_filter' + next).append(removebtn);
          $('#mapping_div_count').val(next);
        }
      });
      // remove more button
      $(document).on('click', '.remove-me', function () {
        var rmvbtnID = $(this).attr('id');
        var splitres = rmvbtnID.split("_");
        if (splitres[0] == 'global') {
          $('#and_global_filter' + splitres[1]).remove();
          $('#global_filter' + splitres[1]).remove();
        }
        else if (splitres[0] == 'sort') {
          $('#sort_col_' + splitres[2]).remove();
        }
        else if (splitres[0] == 'mapping') {
          $('#mapping_filter' + splitres[2]).remove();
        }
        $('#btn-save').addClass('alert-red');
      });
      // Getting values of filter form
      $('body').on('submit', 'form#filters_op_form', function (e) {
        var count = 1;
        var input_type = true;
        var arr = [];
        var error = 0;
        $('#data-view-filters .filterDiv').each(function () {
          var option = $(this).find('option:selected', 'select').attr('data-type');
          var option_val = $(this).find('option:selected', 'select').val();
          var op_value = $(this).find('select').next().val();
          var theValue = $(this).find('input').val();
          var val_type = isNaN(theValue);
          if (op_value == "contains") {
            theValue = theValue.toLowerCase()
          }
          var total = option_val + '-' + op_value + '-' + theValue;
          if (theValue && (option_val == "" || op_value == "" )) {
            error = 3;
          }
          if (option == "integer" && val_type == input_type && op_value != "regEx") {
            error = 2;
          }
          if (option == "numeric" && val_type == input_type && op_value != "regEx") {
            error = 2;
          }
          count++;
        });
        if (error == 2) {
          if ($('#filterDiv .alert-danger').length == 0) {
            $('#filterDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filter Error!! Please enter numeric value for numeric filter.</div>');
          }
          else {
            $('#filterDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filter Error!! Please enter numeric value for numeric filter.');
          }
          return false
        }
        var arr_len = arr.length;
        var sor = arr.sort();
        var arr_uniq = jQuery.unique(sor);
        var uniq_len = arr_uniq.length;
        if (arr_len != uniq_len) {
          if ($('#filterDiv .alert-danger').length == 0) {
            $('#filterDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filter Error!! filters must be unique.</div>');
          }
          else {
            $('#filterDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filter Error!! filters must be unique.');
          }
          return false;
        }
        var hiddenId = $("#parameters-box #param-id").val();
        var operatorsArr = [];
        var colnamesArr = [];
        var requiredValuesArr = [];
        var globalfilersCount = $('#global_filter_count').val();
        var filters = '';
        var globalFilterJson = '';
        var filterJson = "";
        for (var i = 1; i <= globalfilersCount; i++) {
          if ($('#global_filter' + i).length == 0) {
            continue;
          }
          if ($('input[name="global_filter_cond_val' + i + '"]').val() == "") {
            continue;
          }
          var colname = $('select[name="global_filter_sel' + i + '"]').val();
          var operator = $('select[name="global_filter_cond_sel' + i + '"]').val();
          var requiredVal = $('input[name="global_filter_cond_val' + i + '"]').val();
          if (operator == 'isIn') {
            var array = requiredVal.split(",");
            var pattern = "";
            for (var j = 0; j < array.length; j++) {
              pattern += '\\"' + (array[j]) + '\\",';
            }
            pattern = pattern.substring(0, pattern.length - 1);
            requiredVal = pattern;
          }
          filterJson += '{"colname":"' + colname + '", "operator":"' + operator + '", "required_val":"' + requiredVal + '"},';
          if (i > 1) {
            operatorsArr.push(operator);
            colnamesArr.push(colname);
            requiredValuesArr.push(requiredVal);
          }
          else {
            operatorsArr.push(operator);
            colnamesArr.push(colname);
            requiredValuesArr.push(requiredVal);
          }
        }
        filterJson = filterJson.replace(/,\s*$/, "");
        filterJson = "[" + filterJson + "]";
        if (filterJson != "[]") {
          var operators = JSON.stringify(operatorsArr);
          var colnames = JSON.stringify(colnamesArr);
          var requiredValues = JSON.stringify(requiredValuesArr);
          var getCellFilterById = graph.getCell(hiddenId);
          var filterCellView = paper.findViewByModel(getCellFilterById);
          var sourceJsonDataArr = filterCellView.model.attributes.inputData;
          filterCellView.model.attributes.settings.parameters.selectedFilters = [colnamesArr, operatorsArr, requiredValuesArr];
          console.log(filterCellView.model.attributes.settings.parameters);
          var sourceJsonData = sourceJsonDataArr;
          applied_filter(sourceJsonData, filterJson, filterCellView, getCellFilterById, hiddenId);
          $('#btn-save').addClass('alert-red');
          return false;
        }
      });
      $('body').on('submit', 'form#mapping_op_form', function (e) {
        var count = 1;
        var input_type = true;
        var arr = [];
        var error = 0;
        $('#mapping-filters .mappingDiv').each(function () {
          var option = $(this).find('option:selected', 'select').attr('data-type');
          var option_val = $(this).find('option:selected', 'select').val();
          var op_value = $(this).find('select').next().val();
          var theValue = $(this).find('select').next().next().val();
          var val_type = isNaN(theValue);
          var total = option_val + '-' + op_value + '-' + theValue;
          if (option_val && op_value && theValue) {
            arr.push(total);
          }
          if (option == "integer" && val_type == input_type) {
            error = 2;
          }
          if (option == "numeric" && val_type == input_type) {
            error = 2;
          }
          count++;
        });
        if (error == 2) {
          if ($('.alert-danger').length == 0) {
            $(this).parent().parent().parent().prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filters Error! Please enter numeric value for numeric filter. </div>');
          } else {
            $('.alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filters Error! Please enter numeric value for numeric filter. ');
          }
          $('.tab-content').animate({scrollTop: 0}, 'slow');
          return false;
        }
        var arr_len = arr.length;
        var sor = arr.sort();
        var arr_uniq = jQuery.unique(sor);
        var uniq_len = arr_uniq.length;
        if (arr_len != uniq_len) {
          if ($('.alert-danger').length == 0) {
            $(this).parent().parent().parent().prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filters Error! filters must be unique. </div>');
          } else {
            $('.alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filters Error! filters must be unique. ');
          }
          $('.tab-content').animate({scrollTop: 0}, 'slow');
          return false;
        }
        var hiddenId = $("#parameters-box #param-id").val();
        var operatorsArr = [];
        var colnamesArr = [];
        var requiredValuesArr = [];
        var newValuesArr = [];
        var globalfilersCount = $('#mapping_div_count').val();
        var newColName = $('#mapping_new_column').val();
        var filters = '';
        var globalFilterJson = '';
        var filterJson = "";
        for (var i = 1; i <= globalfilersCount; i++) {
          if ($('#mapping_filter' + i).length == 0) {
            continue;
          }
          if ($('input[name="mapping_filter_cond_val' + i + '"]').val() == "") {
            continue;
          }
          var colname = $('select[name="mapping_filter_sel' + i + '"]').val();
          var operator = $('select[name="mapping_filter_cond_sel' + i + '"]').val();
          var requiredVal = $('input[name="mapping_filter_cond_val' + i + '"]').val();
          var newVal = $('input[name="mapping_new_val' + i + '"]').val();
          filterJson += '{"newval":"' + newVal + '","colname":"' + colname + '", "operator":"' + operator + '", "condition_val":"' + requiredVal + '"},';
          filters += newVal + ' ' + colname + ' ' + operator + ' ' + requiredVal + '||';
          if (i > 1) {
            operatorsArr.push(operator);
            colnamesArr.push(colname);
            requiredValuesArr.push(requiredVal);
            newValuesArr.push(newVal);
          }
          else {
            operatorsArr.push(operator);
            colnamesArr.push(colname);
            requiredValuesArr.push(requiredVal);
            newValuesArr.push(newVal);
          }
        }
        filterJson = filterJson.replace(/,\s*$/, "");
        filterJson = "[" + filterJson + "]";
        var getCellFilterById = graph.getCell(hiddenId);
        var filterCellView = paper.findViewByModel(getCellFilterById);
        var sourceJsonDataArr = filterCellView.model.attributes.inputData;
        filterCellView.model.attributes.settings.parameters.selectedFilters = [colnamesArr, operatorsArr, requiredValuesArr, newValuesArr];
        filterCellView.model.attributes.settings.parameters.newColName = newColName;
        console.log(filterCellView.model.attributes.settings.parameters);
        filterCellView.model.attributes.outputData = {};
        var sourceJsonData = sourceJsonDataArr;
        applied_mapping(newColName, sourceJsonData, filterJson, filterCellView, getCellFilterById, hiddenId);
        return false;
      });
      // Getting values of sort form
      $("#submitSorting").on('click', function () {
        var hiddenId = $("#parameters-box #param-id").val();
        var colNamesVal = $('#sortAttributes option:selected').val();
        var attrValueVal = $('#sortType option:selected').val();
        if (colNamesVal == "" || colNamesVal == "No Records Found!") {
          //alert('Sort column required to submit.');
          if ($('#paraAttrName .alert-danger').length == 0) {
            $('#paraAttrName').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Sort column required to submit.</div>');
          }
          else {
            $('#paraAttrName .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Sort column required to submit.');
          }
        }
        else {
          var sortColsCount = $('#sort_col_count').val();
          var sortAttributesArr = [];
          var sortTypesArr = [];
          var sortJson = '';
          for (var i = 1; i <= sortColsCount; i++) {
            if ($('#sort_col_' + i).length == 0) {
              continue;
            }
            if ($('select[name="sortAttributes_' + i + '"]').val() == "") {
              if ($('#paraAttrName .alert-danger').length == 0) {
                $('#paraAttrName').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Column names required to apply sort.</div>');
              }
              else {
                $('#paraAttrName .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Column names required to apply sort.');
              }
              return false;
            }
            var sortAttr = $('select[name="sortAttributes_' + i + '"]').val();
            var sortType = $('select[name="sortType_' + i + '"]').val();
            if (jQuery.inArray(sortAttr, sortAttributesArr) != -1) {
              if ($('#paraAttrName .alert-danger').length == 0) {
                $('#paraAttrName').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Same column cannot be selected twice.</div>');
              }
              else {
                $('#paraAttrName .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Same column cannot be selected twice.');
              }
              return false;
            }
            if (sortType == 'DESC') {
              sortJson += ',desc(' + sortAttr + ')';
            } else {
              sortJson += ',' + sortAttr;
            }
            if (i > 1) {
              sortAttributesArr.push(sortAttr);
              sortTypesArr.push(sortType);
            }
            else {
              sortAttributesArr.push(sortAttr);
              sortTypesArr.push(sortType);
            }
          }
          sortJson = sortJson.substring(1);
          var getSortCellById = graph.getCell(hiddenId);
          var sortCellView = paper.findViewByModel(getSortCellById);
          var sourceJsonDataArr = sortCellView.model.attributes.inputData;
          sortCellView.model.attributes.settings.parameters.selectedSorts = [sortAttributesArr, sortTypesArr];
          //sortCellView.model.attributes.settings.parameters = [colNamesVal, attrValueVal];
          sortCellView.model.attributes.outputData = '';
          applied_sort(sourceJsonDataArr, sortJson, sortCellView, getSortCellById, hiddenId);
        }
        $('#btn-save').addClass('alert-red');
      });
      // Getting values of select form
      $("#btn-selectOp-submit").on('click', function () {
        var hiddenId = $("#parameters-box #param-id").val();
        var colNamesVal = $('select[name="op_select_col"]').val();
        if (colNamesVal) {
          var getSortCellById = graph.getCell(hiddenId);
          var sortCellView = paper.findViewByModel(getSortCellById);
          var sourceJsonDataArr = sortCellView.model.attributes.inputData;
          sortCellView.model.attributes.settings.parameters.selectedSelectVals = colNamesVal;
          sortCellView.model.attributes.outputData = '';
          applied_select(sourceJsonDataArr, colNamesVal, sortCellView, getSortCellById, hiddenId);
        } else {
        }
      });
      $(".user-nav-slide").click(function () {
        if ($("#operator-rel").hasClass("closed")) {
          $("#operator-area").show('medium');
          $("#operator-rel").removeClass("closed");
          $("#operator-btn span").removeClass("glyphicon-plus").addClass("glyphicon-minus");
          $(this).removeClass('closed');
        }
        else {
          $("#operator-area").hide('medium');
          $("#operator-rel").addClass("closed");
          $("#operator-btn span").removeClass("glyphicon-minus").addClass("glyphicon-plus");
          $(this).addClass('closed');
        }
        $("#curr-op-result").hide();
        $("#operator-main-div").removeClass("operator-main-div-class");
        $("#operator-main-div .container").removeClass("operator-main-div-container-class");
      });
      $("#operator-btn2").click(function () {
        if ($("div#charts").hasClass("active")) {
          $("div#charts").removeClass("in");
          $("div#charts").removeClass("active");
          $("#operator-area2").hide('medium');
          $("#operator-rel2").addClass("closed");
          $("#operator-btn2 span").removeClass("glyphicon-minus").addClass("glyphicon-plus");
        }
        else {
          $("div#charts").addClass("in");
          $("div#charts").addClass("active");
          $("#operator-btn2 span").removeClass("glyphicon-plus").addClass("glyphicon-minus");
          $("#operator-area2").show('medium');
          $("#operator-rel2").removeClass("closed");
        }
        $('#secForms').empty();
        close_form_slide();
      });
      $(".charts-text").click(function () {
        if ($("div#charts").hasClass("active")) {
          $(".charts-text span").removeClass("glyphicon-minus").addClass("glyphicon-plus");
          $("div#charts").removeClass("in");
          $("div#charts").removeClass("active");
          $(".charts-text .caret").addClass("closed");
          $("#operator-area2").hide('medium');
          $("#operator-rel2").addClass("closed");
        }
        else {
          $(".charts-text span").removeClass("glyphicon-plus").addClass("glyphicon-minus");
          $("div#charts").addClass("in");
          $("div#charts").addClass("active");
          $(".charts-text .caret").removeClass("closed");
          $("#operator-area2").show('medium');
          $("#operator-rel2").removeClass("closed");
        }
        $('#secForms').empty();
        close_form_slide();
      });
      $(".param_link").click(function (e) {
        e.preventDefault();
        if ($("#parameter-rel").hasClass("closed")) {
          nav_slide_right_open();
          $("#parameters").show('medium');
        }
        else {
          nav_slide_right_close();
        }
        $("#curr-op-result").hide();
        $("#operator-main-div").removeClass("operator-main-div-class");
        $("#operator-main-div .container").removeClass("operator-main-div-container-class");
        $("#result-div .loading-div").remove();
        $('#df1 .loading-div').remove();
        $('#df2 .loading-div').remove();
      });
      $(".style_link").click(function (e) {
        e.preventDefault();
        $("#curr-op-result").hide();
        $("#result-div .loading-div").remove();
        $('#df1 .loading-div').remove();
        $('#df2 .loading-div').remove();
      });
      $(".feed_back_link").click(function (e) {
        e.preventDefault();
        $("#curr-op-result").hide();
        $("#result-div .loading-div").remove();
        $('#df1 .loading-div').remove();
        $('#df2 .loading-div').remove();
      });
      $(".notes_link").click(function (e) {
        e.preventDefault();
        $("#curr-op-result").hide();
        $("#result-div .loading-div").remove();
        $('#df1 .loading-div').remove();
        $('#df2 .loading-div').remove();
      });
      /**
       * for load datasets in charts area
       */
      $('#navigator').css("visibility", "hidden");
      $("body").on("click", '.navigator-slide', function () {
        if ($(this).hasClass('closed')) {
          $('#navigator').css("visibility", "visible");
          $('.navigator-slide').removeClass('closed').addClass('open');
          $('#navigator-container').css('margin-top', '5px');
        }
        else if ($(this).hasClass('open')) {
          $('#navigator').css("visibility", "hidden");
          $('.navigator-slide').removeClass('open').addClass('closed');
          $('#navigator-container').css('margin-top', '175px');
        }
      });
    }
    $('#operator-checkbox').change(function () {
      var checked = (this.checked) ? true : false;
      if (checked == false) {
        $("#operator-area").hide('medium');
        $("#operator-rel").addClass("closed");
        $("#operator-btn span").removeClass("glyphicon-minus").addClass("glyphicon-plus");
      }
    });
    $('.modal-views .modal').on('hidden.bs.modal', function () {
      if ($('#parameter-area-modal').hasClass('in')) {
      }
      else {
        $('div.modal-backdrop').remove();
        $('.df1_link,.df2_link, #df1, #df2').hide();
        $('#result-div').attr('style', '');
        $('#df1 .loading-div').remove();
        $('#df2 .loading-div').remove();
        $('#result-div .loading-div').remove();
        $('div#parameters-box .filterForm .filterDiv').removeClass('found-rec');
      }
    });
    $('.joint-viewport .joint-link path').on('click', function (e) {
      e.stopPropagation();
    });
    /**
     * to remove special chars in maping op input fields.
     */
    $(document).on("keyup", "#mapping_op_form input:text", function () {
      var specialchars = /[^a-z0-9\s.]/gi;
      if (specialchars.test($(this).val())) {
        $(this).val($(this).val().replace(/[^a-z0-9\s.]/gi, ''));
        if ($('#MappingDiv .alert-danger').length == 0) {
          $('#MappingDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Special character not allowed.</div>');
        }
        else {
          $('#MappingDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Special character not allowed.');
        }
        $('.tab-content').animate({scrollTop: 0}, 'slow');
      }
    });



    var hash = '#';
    $('#fillColor').colorpicker().on('changeColor', function () {
      $('#fillColor').focus();
      $('#btn-save').addClass('alert-red');
    });
    $('#fillColor').colorpicker().on('hidePicker', function () {
      $('.colorpicker').removeClass('colorpicker-visible').addClass('colorpicker-hidden');
    });
    $(".joint-paper-scroller").scroll(function () {
      $(".tool-container").hide();
    });

  });
  function openParameterArea() {
    $("#operator-area3").show('medium');
    $("#operator-rel3").removeClass("closed");
  }
  function closeParameterArea() {
    $("#operator-area3").hide('medium');
    $("#operator-rel3").addClass("closed");
    if ($('.colorpicker').hasClass("colorpicker-visible")) {
      $('.colorpicker').removeClass('colorpicker-visible').addClass('colorpicker-hidden');
    }
  }
  function drawShape(ev, id) {
    dInPorts = new Array();
    dOutPorts = new Array();
    jsArray = new Array();
    jsIndexArray = new Array();
    var dLabel, dInPorts, dOutPorts, imagePath, fillClr, notesVal;
    var js_index_array = $("#opIdData").val();
    var jsIndexArray = $.parseJSON(js_index_array);
    var index = jsIndexArray.indexOf(id);
    var operatorId = jsIndexArray[index];
    var op_array = $("#opArrayData").val();
    var jsArray = $.parseJSON(op_array);
    var dLabel = jsArray[id].dLabel;
    var inPortsArray = jsArray[id].dInPorts;
    var fillClr = jsArray[id].fillClr;
    var notesVal = jsArray[id].notesVal;
    var imagePath = jsArray[id].imagePath;
    if (inPortsArray) {
      var dInPorts = inPortsArray[0]['value'].split(',');
    }
    var outPortsArray = jsArray[id].dOutPorts;
    if (outPortsArray) {
      var dOutPorts = outPortsArray[0]['value'].split(',');
    }
    if (imagePath == 'default.png') {
      imgPath = '/sites/default/files/default_images/default.png';
    }
    else {
      imgPath = '/sites/default/files/' + imagePath;
    }
    $('body').append('<div id="flyPaper" style="background-color: transparent;position:fixed;z-index:100;opacity:.7;pointer-event:none;max-width: 80px;max-height: 65px;"></div>');
    var flyGraph = new joint.dia.Graph,
      flyPaper = new joint.dia.Paper({
        el: $('#flyPaper'),
        model: flyGraph,
        interactive: false
      }),
      flyShape = new joint.shapes.devs.MyImageModel({
        position: {x: 10, y: 10},
        size: {width: 70, height: 40},
        inPorts: dInPorts,
        outPorts: dOutPorts,
        inputData: '',
        outputData: '',
        operatorType: dLabel,
        settings: {parameters: {}},
        ports: {
          groups: {
            'in': {
              position: 'top',
              label: {
                position: 'outside'
              },
              attrs: {
                '.port-body': {
                  fill: '#ccd6d6',
                  magnet: 'passive',
                  r: 5,
                  stroke: '#a2a8a8'
                },
                '.port-label': {
                  'font-size': 9
                }
              }
            },
            'out': {
              position: 'bottom',
              label: {
                position: 'outside'
              },
              attrs: {
                '.port-body': {
                  fill: '#ccd6d6',
                  r: 5,
                  magnet: 'active',
                  stroke: '#a2a8a8'
                },
                '.port-label': {
                  'font-size': 9,
                },
                require: true,
              }
            },
          }
        },
        attrs: {
          '.label': {text: dLabel, 'ref-x': .5, 'ref-y': .2},
          text: {text: dLabel, fill: '#000000', 'ref-y': -30, 'font-size': 9},
          rect: {fill: '#fff', stroke: '#b7b7b7', width: 70, height: 40},
          image: {
            'xlink:href': imgPath,
            'ref-x': 19,
            'ref-y': 12,
            ref: 'rect',
            width: 32,
            height: 16
          },
          notes: {'notes': notesVal}
        }
      }),
      pos = {x: ev.pageX, y: ev.pageY},
      offset = {
        x: ev.offsetX,
        y: ev.offsetY
      };
    flyShape.position(0, 0);
    flyGraph.addCell(flyShape);
    $('#btn-save').addClass('alert-red');
    $("#flyPaper").offset({
      left: ev.pageX - offset.x,
      top: ev.pageY - offset.y
    });
    $('body').on('mousemove.fly', function (e) {
      $("#flyPaper").offset({
        left: e.pageX - offset.x,
        top: e.pageY - offset.y
      });
    });
    $('body').on('mouseup.fly', function (e) {
      var x = e.pageX,
        y = e.pageY,
        target = paper.$el.offset();
      // Dropped over paper ?
      if (x > target.left && x < target.left + paper.$el.width() && y > target.top && y < target.top + paper.$el.height()) {
        var s = flyShape.clone();
        s.position(x - target.left - offset.x, y - target.top - offset.y);
        graph.addCell(s);
        //patch

      }
      $('body').off('mousemove.fly').off('mouseup.fly');
      flyShape.remove();
      $('#flyPaper').remove();
      $("div.drop-note").remove();
      //$(".sketch-coloumn .container-fluid").append('<div class="dropped-note">Dropped Successfully !</div>');
      setTimeout(function () {
        $("div.dropped-note").remove();
      }, 1000);
    });
  }

  var contextMenu = $('' +
    '<div class="context-menu">' +
    '   <ul>' +
    '       <li id = "contextJsonData" contextOperatorId= "">Json Data' +
    '       </li>' +
    '       <li id = "contextTabularData" contextOperatorId= "">Tabular Data' +
    '       </li>' +
    '       <li id = "contextChartData" contextOperatorId= "">Charts' +
    '       </li>' +
    '       <li id = "cancel">Cancel</li>' +
    '   </ul>' +
    '</div>');
  $('#paper').append(contextMenu);
  contextMenu.jqxMenu({
    width: '200px',
    autoOpenPopup: false,
    animationShowDuration: 0,
    animationHideDuration: 0,
    mode: 'popup'
  });
  function showContextMenu(evt, cellView) {
    var contextOperatorId = cellView.model.id;
    $(".jqx-item").attr('contextOperatorId', contextOperatorId);
    contextMenu.jqxMenu('open', evt.pageX, evt.pageY);
  }
  //parent element for grouping
  var element = function (elm, x, y, label) {
    var cell = new elm({
      position: {x: x, y: y},
      size: {width: 90, height: 40},
      name: 'parentCellClass',
      attrs: {
        text: {
          style: {fill: 'black', 'font-weight': 'bold'},
          text: 'Group',
          'ref-y': -10,
          'font-size': 10
        },
        rect: {
          'stroke-width': '2',
          'stroke-opacity': .7,
          stroke: 'grey',
          rx: 2,
          ry: 2,
          fill: 'transparent',
          'fill-opacity': .5
        },
        notes: {notes: 'test'}
      }
    });
    graph.addCell(cell);
    return cell;
  };
  //Ajax request for node save
  function save_sketch(sketch_nid, jsonSave) {
    $.ajax({
      url: '/tm-sketch-save',
      data: {
        sketch_nid: sketch_nid,
        jsonSave: jsonSave
      },
      beforeSend: function () {
        //$(".sketch-coloumn .graphLoader-save").css('visibility', 'visible');
        $('.top-header .node-ops #btn-save').append('<img class="loading_img" src="/sites/default/files/default_images/throbber-active.gif">');
      },
      type: 'post',
      success: function (data) {
        //$(".sketch-coloumn .graphLoader-save").css('visibility', 'hidden');
        $('.loading_img').remove();
        $('#save_report').trigger('click');
        $("#msgModal").modal("show");
        //setModalBackdrop();
      },
      error: function (xhr, status, error) {
        // executed if something went wrong during call
        if (xhr.status > 0)
          var html_save = $('' +
            '<div class="modal fade"  role="dialog" id="save-error-modal">' +
            '   <div class="modal-dialog">' +
            '     <div class="modal-content">' +
            '       <div class="modal-header">' +
            '         <button type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"  data-dismiss="modal"><span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>&nbsp;</button>' +
            '         <h4 class="modal-title">Error!</h4>' +
            '       </div>' +
            '       <div class="modal-body"> ' +
            '         <div id="msg">' +
            '           <h6>Got ' + status + '</h6>' +
            '         </div>' +
            '       </div>' +
            '   </div>' +
            '</div>');
        $(html_save).appendTo('.sketch-coloumn');
        $(html_save).modal('show');
        setModalBackdrop()
        //alert('got error: ' + status);
      }
    });
  };
  /**
   *
   * to set modal backdrop
   *
   */
  //Ajax request for reading Source
  function read_source_file(filename, hiddenId, sourceType) {
    $.ajax({
      url: '/tm-sketch-readsource',
      data: {
        filename: filename,
        hiddenId: hiddenId,
        sourceType: sourceType
      },
      beforeSend: function () {
        $(".graphLoader-modify").css('visibility', 'visible');
        $("#btn-run").addClass("disabled");
      },
      type: 'post',
      success: function (data) {
        $('#btn-save').addClass('alert-red');
        $("#btn-run").removeClass("disabled");
        $(".graphLoader-modify").css('visibility', 'hidden');
        if (data == 'File is not created') {
          if ($('#parameterss-area .alert-danger').length == 0) {
            $('#parameterss-area').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Incorrect CSV format or URL !</div>');
          } else {
            $('#parameterss-area .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Incorrect CSV format or URL !.');
          }
          return false;
        }
        else if (data == 'Failed to copy.') {
          if ($('#parameterss-area .alert-danger').length == 0) {
            $('#parameterss-area').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Failed to copy csv file !!</div>');
          } else {
            $('#parameterss-area .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Failed to copy csv file !!.');
          }
          return false;
        }
        else {
          var sourceElement = graph.getCell(hiddenId);
          var sourceCellView = paper.findViewByModel(sourceElement);
          sourceCellView.model.attributes.inputData = filename;
          sourceCellView.model.attributes.outputData = data;
          if (sourceType == 'external') {
            sourceCellView.model.attributes.settings.parameters.externalurl = filename;
          } else if (sourceType == 'internal') {
            sourceCellView.model.attributes.settings.parameters.externalurl = '';
          }
          var outboundLinks = graph.getConnectedLinks(sourceElement, {
            outbound: true,
            deep: true
          });
          var sourceJsonUpData = sourceCellView.model.attributes.outputData;
          recursion_source(outboundLinks, sourceJsonUpData);
          if ($('#parameters-box .alert-success').length == 0) {
            $('#parameters-box').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
          } else {
            $('#parameters-box .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
          }
        }
      },
      error: function (xhr, status, error) {
        // executed if something went wrong during call
        if (xhr.status > 0)
          var html_read = $('' +
            '<div class="modal fade"  role="dialog" id="read-src-modal">' +
            '   <div class="modal-dialog">' +
            '     <div class="modal-content">' +
            '       <div class="modal-header">' +
            '         <button type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"  data-dismiss="modal"><span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>&nbsp;</button>' +
            '         <h4 class="modal-title">Error!</h4>' +
            '       </div>' +
            '       <div class="modal-body"> ' +
            '         <div id="msg">' +
            '           <h6>Got ' + status + '</h6>' +
            '         </div>' +
            '       </div>' +
            '   </div>' +
            '</div>');
        $(html_read).appendTo('.sketch-coloumn');
        $(html_read).modal('show');
        setModalBackdrop()
      }
    });
  };
  //Function for showing source read data
  function result_data(sourceJsonData) {
    if (sourceJsonData[0] == "No Records Found!") {
      $("#noRecodFoundModal").modal("show");
    }
    else {
      var headVar = sourceJsonData[0];
      var thData = "";
      for (var keys in headVar) {
        thData += "<th>" + keys + "</th>";
      }
      var trthData = "<tr>" + thData + "</tr>";
      $("#csvTableId thead").html(trthData);
      var trData = "";
      for (var key in sourceJsonData) {
        var parseDataValue = sourceJsonData[key];
        var tdData = "";
        for (var key2 in parseDataValue) {
          var tdbody = parseDataValue[key2];
          tdData += "<td>" + tdbody + "</td>";
        }
        trData += "<tr>" + tdData + "</tr>";
      }
      $("#csvTableId tbody").html(trData);
      $("#csvModal").modal("show");
    }
  };
  //Function for showing current read data
  function current_data_func(currContextData) {
    var sourceJsonFile = currContextData.model.attributes.outputData;
    var sourceJsonData = read_json_file(sourceJsonFile);
    var opType = currContextData.model.attributes.operatorType;
    console.log(sourceJsonData);
    if (Object.keys(sourceJsonData).length == 0) {
      console.log('currently no data available');
    }
    else if (opType == "KNN Classifier" || opType == "Predict" || opType == "Model Output") {
      jQuery.get("/sites/default/files/operator_files/" + sourceJsonFile, function (data) {
        $('#result-op-data').prepend('<div class="txtFilesRslt" style="white-space : pre;">' + data + '</div>');
        $("#curr-op-result").show();
        $("#currentResultTable").hide();
      });
    }
    else {
      if (sourceJsonData[0] == "No Records Found!") {
        $("#noRecodFoundModal").modal("show");
      }
      else {
        var headVar = sourceJsonData[0];
        var thData = "";
        thData += "<th class='sr-no'><span class='serial'>Sr#</span></th>";
        $("#result-div").prepend('<div class="rows-found pull-left"></div>');
        for (var keys in headVar) {
          if (keys == 'No Records Found') {
            thData = ""
            $(".rows-found").remove();
            $('#currentResultTable').addClass('no-data');
            thData += "<th><div class='no-record'>" + keys + "</div></th>";
          }
          else {
            $('#currentResultTable').removeClass('no-data');
            thData += "<th>" + keys + "</th>";
          }
        }
        var trthData = "<tr>" + thData + "</tr>";
        $("#currentResultTable thead").html(trthData);
        var trData = "";
        var count = 0;
        for (var key in sourceJsonData) {
          var parseDataValue = sourceJsonData[key];
          var tdData = "";
          for (var key2 in parseDataValue) {
            var tdbody = parseDataValue[key2];
            tdData += "<td>" + tdbody + "</td>";
          }
          count++;
          trData += "<tr><td>" + count + "</td>" + tdData + "</tr>";
        }
        $('#txtFilesRslt').remove();
        $('.rows-found').html(count + ' records found');
        $("#currentResultTable").show();
        $("#currentResultTable tbody").html(trData);
        $("#curr-op-result").show();
      }
    }
  };
  function current_data_func1(currContextData1) {
    var sourceFile1 = currContextData1.model.attributes.leftOutputData;
    var sourceJsonData1 = read_json_file(sourceFile1);
    var sourceFile2 = currContextData1.model.attributes.rightOutputData;
    var sourceJsonData2 = read_json_file(sourceFile2);
    console.log(sourceJsonData1);
    console.log(sourceJsonData2);
    if (Object.keys(sourceJsonData1).length == 0) {
      console.log('currently no data available for df1');
    }
    else if (Object.keys(sourceJsonData2).length == 0) {
      console.log('currently no data available for df2');
    }
    else {
      if (sourceJsonData1[0] == "No Records Found!") {
        $("#noRecodFoundModal").modal("show");
      }
      else if (sourceJsonData2[0] == "No Records Found!") {
        $("#noRecodFoundModal").modal("show");
      }
      else {
        var headVar1 = sourceJsonData1[0];
        var headVar2 = sourceJsonData2[0];
        var thData1 = "";
        var thData2 = "";
        $("#result-op-data-df1").prepend('<div class="rows-found-df1 pull-left"></div>');
        $("#result-op-data-df2").prepend('<div class="rows-found-df2 pull-left"></div>');
        for (var keys in headVar1) {
          thData1 += "<th>" + keys + "</th>";
        }
        for (var keys in headVar2) {
          thData2 += "<th>" + keys + "</th>";
        }
        var trthData1 = "<tr>" + thData1 + "</tr>";
        var trthData2 = "<tr>" + thData2 + "</tr>";
        $("#currentResultTable-df1 thead").html(trthData1);
        $("#currentResultTable-df2 thead").html(trthData2);
        var trData1 = "";
        var trData2 = "";
        var count1 = 0;
        var count2 = 0;
        for (var key in sourceJsonData1) {
          var parseDataValue1 = sourceJsonData1[key];
          var tdData1 = "";
          for (var key2 in parseDataValue1) {
            var tdbody1 = parseDataValue1[key2];
            tdData1 += "<td>" + tdbody1 + "</td>";
          }
          trData1 += "<tr>" + tdData1 + "</tr>";
          count1++;
        }
        for (var key in sourceJsonData2) {
          var parseDataValue2 = sourceJsonData2[key];
          var tdData2 = "";
          for (var key2 in parseDataValue2) {
            var tdbody2 = parseDataValue2[key2];
            tdData2 += "<td>" + tdbody2 + "</td>";
          }
          trData2 += "<tr>" + tdData2 + "</tr>";
          count2++;
        }
        $("#currentResultTable-df1 tbody").html(trData1);
        $("#currentResultTable-df2 tbody").html(trData2);
        $('.rows-found-df1').html(count1 + ' records found');
        $('.rows-found-df2').html(count2 + ' records found');
        $("#curr-op-result-df1").show();
        $("#curr-op-result-df2").show();
      }
    }
  }
  //Function for showing current read data
  function current_data_charts(currContextData) {
    var sourceJsonData = currContextData.model.attributes.outputData;
    console.log(sourceJsonData);
    if (Object.keys(sourceJsonData).length == 0) {
      console.log('currently no data available');
    }
    else {
      if (sourceJsonData[0] == "No Records Found!") {
        $("#noRecodFoundModal").modal("show");
      }
      else {
        var chrt = "";
        $("#chartsModal").modal("show");
      }
    }
  };
  function update_summarize_attr(sourceJsonData, parameters) {
    var droot_host = window.location.hostname;
    var droot = '/var/www/' + droot_host;
    var file = "file_path=" + droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
    file = file.toString();
    var dataArray = [];
    jQuery.ajax({
      url: Drupal.url('tm-sketch-readcols'),
      type: "POST",
      data: file,
      success: function (response) {
        var selectedFiltersVarLength = Object.keys(parameters).length;
        $('#op_summarize_col').empty('');
        var options = '';
        options += '<option value="">--Select Column--</option>';
        for (key in response) {
          var splitID = response [key].split("=");
          var option = '<option value="' + splitID[0] + '" data-type="' + splitID[1] + '">' + splitID[0] + '</option>';
          if (splitID[1] == "integer" || splitID[1] == "numeric") {
            options += option;
          }
        }
        $('#op_summarize_col').html(options);
        if (selectedFiltersVarLength > 0) {
          var colNames = parameters;
          $('#op_summarize_col option[value="' + colNames + '"]').prop('selected', true);
        }
      }
    });
  }
  function update_mapping_attr(sourceJsonData, selectedFiltersVar, newColName) {
    var droot_host = window.location.hostname;
    var droot = '/var/www/' + droot_host;
    var filePath = "file_path=" + droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
    var file = filePath.toString();
    var dataArray = [];
    jQuery.ajax({
      url: Drupal.url('tm-sketch-readcols'),
      type: "POST",
      data: file,
      success: function (response) {
        var selectedFiltersVarLength = Object.keys(selectedFiltersVar).length;
        if (selectedFiltersVarLength > 0) {
          var colAttributes = selectedFiltersVar[0];
          var colOperators = selectedFiltersVar[1];
          var colRequiredValues = selectedFiltersVar[2];
          var colNewValues = selectedFiltersVar[3];
          if ((colAttributes.length > 0) && (colOperators.length > 0) && (colRequiredValues.length > 0)) {
            console.log('operators has the values');
            var globalfilersCount = $('#mapping_div_count').val(colAttributes.length);
            $("#mapping_new_column").val(newColName);
            $("#mapping-filters").empty();
            var options = '';
            options += '<option value="">--Select attribute--</option>';
            for (key in response) {
              var splitID = response [key].split("=");
              var option = '<option value="' + splitID[0] + '" data-type="' + splitID[1] + '">' + splitID[0] + '</option>';
              if (splitID[1] == 'integer' || splitID[1] == 'numeric') {
                options += option;
              }
            }
            for (var i = colAttributes.length; i >= 1; i--) {
              var j = i - 1;
              var remBtn = '';
              if (i > 1) {
                remBtn = '<input id="mapping_remove_' + i + '" class="btn btn-danger remove-me exist" value="x" type="button">';
              }
              var operatorsHtml = '<option value="">--Select Operator--</option>';
              var dynamicSelect = '<div id="mapping_filter' + i + '" class="mappingDiv"><div class="mapping-div-inner"><input type="text" class="form-control" id="mapping_new_val' + i + '" name="mapping_new_val' + i + '" placeholder="New value" required="" value="' + colNewValues[j].replace(/\\"/g, "") + '"><label>Condition:<span class="form-required" title="These fields are required."></span></label><div class="form-group form-inline mapdiv filtered"><select class="form-control filterColoumSel" required="" id="mapping_filter_sel' + i + '" name="mapping_filter_sel' + i + '">' + options + '</select><select class="form-control filterColoumSel2" required="" id="mapping_filter_cond_sel' + i + '" name="mapping_filter_cond_sel' + i + '"></select><input type="text" class="form-control" required="" id="mapping_filter_cond_val' + i + '" name="mapping_filter_cond_val' + i + '" placeholder="Value" value="' + colRequiredValues[j].replace(/\\"/g, "") + '"></div></div>' + remBtn + '</div>';
              $("#mapping-filters").prepend(dynamicSelect);
              $('select[name="mapping_filter_sel' + i + '"]').find('option[value="' + colAttributes[j] + '"]').attr("selected", true);
              var selectedValType = $('select[name="mapping_filter_sel' + i + '"]').find('option[value="' + colAttributes[j] + '"]').attr("selected", true).attr("data-type");
              if (selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "logical") {
                operatorsHtml += '<option value="==">is equal to</option> <option value="!=">is not equal to</option> <option value="<">is less than</option> <option value=">">is greater than</option> <option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option><option value="regEx">regular expression</option>';
              } else if (selectedValType == "factor") {
                operatorsHtml += '<option value="==">is equal to</option> <option value="!=">is not equal to</option> <option value="startWith">start with</option> <option value="endWith">end with</option><option value="isIn">in</option><option value="regEx">regular expression</option>';
              }
              else if (selectedValType == "character") {
                operatorsHtml += '<option value="==">is equal to</option><option value="contains">Contains</option><option value="startWith">start with</option> <option value="endWith">end with</option><option value="isIn">in</option><option value="regEx">regular expression</option>';
              }
              $('select[name="mapping_filter_cond_sel' + i + '"]').html(operatorsHtml);
              $('select[name="mapping_filter_cond_sel' + i + '"]').find('option[value="' + colOperators[j] + '"]').attr("selected", true);
            }
          }
          else {
            console.log('Filter has no value');
          }
        }
        else if (selectedFiltersVarLength == 0) {
          var filterCounter = $('#mapping_div_count').val();
          if (filterCounter > 1) {
            for (i = 2; i <= filterCounter; i++) {
              $('#mapping_filter' + i).remove();
            }
          }
          $('#mapping_filter_sel1').empty('');
          $('#mapping_filter_cond_sel1, #mapping_new_column, #mapping_new_val1, #mapping_filter_cond_val1').val('');
          var selectfilter = document.getElementById("mapping_filter_sel1");
          for (key in response) {
            var splitID = response [key].split("=");
            var option = document.createElement("option");
            option.setAttribute("value", splitID[0]);
            option.setAttribute("data-type", splitID[1]);
            option.text = splitID[0];
            if (splitID[1] == 'integer' || splitID[1] == 'numeric') {
              selectfilter.appendChild(option);
            }
          }
          $("#mapping_filter_sel1").prepend("<option value='' selected='selected'>--Select attribute--</option>");
          $('#mapping_filter_cond_sel1').html("<option value='' selected='selected'>--Select Operator--</option>");
        }
      }
    });
  };
  //Ajax request for reading headers
  function update_filter_attr(sourceJsonData, selectedFiltersVar) {
    var filterCounter = $('#global_filter_count').val();
    if (filterCounter > 1) {
      for (i = 2; i <= filterCounter; i++) {
        $('#global_filter' + i).remove();
        $('#and_global_filter' + i).remove();
      }
    }
    var droot_host = window.location.hostname;
    var droot = '/var/www/' + droot_host;
    var file = "file_path=" + droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
    file = file.toString();
    var dataArray = [];
    jQuery.ajax({
      url: Drupal.url('tm-sketch-readcols'),
      type: "POST",
      data: file,
      beforeSend: function () {
        $(".classifier-modify").css('visibility', 'visible');
      },
      success: function (response) {
        var selectedFiltersVarLength = Object.keys(selectedFiltersVar).length;
        if (selectedFiltersVarLength > 0) {
          var colAttributes = selectedFiltersVar[0];
          var colOperators = selectedFiltersVar[1];
          var colRequiredValues = selectedFiltersVar[2];
          if ((colAttributes.length > 0) && (colOperators.length > 0) && (colRequiredValues.length > 0)) {
            console.log('operators has the values');
            var globalfilersCount = $('#global_filter_count').val(colAttributes.length);
            $("#data-view-filters").empty();
            var options = '';
            options += '<option value="">--Select attribute--</option>';
            for (key in response) {
              var splitID = response [key].split("=");
              var option = '<option value="' + splitID[0] + '" data-type="' + splitID[1] + '">' + splitID[0] + '</option>';
              options += option;
            }
            for (var i = colAttributes.length; i >= 1; i--) {
              var j = i - 1;
              var remBtn = '';
              if (i > 1) {
                remBtn = '<input id="global_' + i + '" class="btn btn-danger remove-me exist" value="x" type="button">';
              }
              var operatorsHtml = '<option value="">--Select Operator--</option>';
              var dynamicSelect = '<div id="global_filter' + i + '" class="form-group form-inline filterDiv"><select class="form-control filterColoumSel" required="" id="global_filter_sel' + i + '" name="global_filter_sel' + i + '">' + options + '</select><select class="form-control filterColoumSel2" id="global_filter_cond_sel' + i + '" required="" name="global_filter_cond_sel' + i + '"></select><input type="text" required="" class="form-control" id="global_filter_cond_val' + i + '" name="global_filter_cond_val' + i + '" placeholder="Value" value="' + colRequiredValues[j].replace(/\\"/g, "") + '">' + remBtn + '</div>';
              $("#data-view-filters").prepend(dynamicSelect);
              $('select[name="global_filter_sel' + i + '"]').find('option[value="' + colAttributes[j] + '"]').attr("selected", true);
              var selectedValType = $('select[name="global_filter_sel' + i + '"]').find('option[value="' + colAttributes[j] + '"]').attr("selected", true).attr("data-type");
              if (selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "logical") {
                operatorsHtml += '<option value="==">is equal to</option> <option value="!=">is not equal to</option> <option value="<">is less than</option> <option value=">">is greater than</option> <option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option><option value="regEx">regular expression</option>';
              } else if (selectedValType == "factor") {
                operatorsHtml += '<option value="==">is equal to</option> <option value="!=">is not equal to</option> <option value="isIn">in</option><option value="regEx">regular expression</option>';
              }
              else if (selectedValType == "character") {
                operatorsHtml += '<option value="==">is equal to</option><option value="contains">Contains</option><option value="isIn">in</option><option value="regEx">regular expression</option>';
              }
              $('select[name="global_filter_cond_sel' + i + '"]').html(operatorsHtml);
              $('select[name="global_filter_cond_sel' + i + '"]').find('option[value="' + colOperators[j] + '"]').attr("selected", true);
            }
          }
          else {
            console.log('Filter has no value');
          }
        }
        else if (selectedFiltersVarLength == 0) {
          $('#global_filter_sel1').empty('');
          $('#global_filter_cond_val1').val('');
          var selectfilter = document.getElementById("global_filter_sel1");
          for (key in response) {
            var splitID = response [key].split("=");
            var option = document.createElement("option");
            option.setAttribute("value", splitID[0]);
            option.setAttribute("data-type", splitID[1]);
            option.text = splitID[0];
            selectfilter.appendChild(option);
          }
          $("#global_filter_sel1").prepend("<option value='' selected='selected'>--Select Attribute--</option>");
          $('#global_filter_cond_sel1').html("<option value='' selected='selected'>--Select Operator--</option>");
        }
        $(".classifier-modify").css('visibility', 'hidden');
      }
    });
  };
  /**
   * (OperatorChangeFunc)
   */
  $("body").on("change", '#data-view-filters .filterColoumSel', function () {
    var selectID = this.id;
    var splittedID = selectID.split("_");
    var condselectID = '#' + splittedID[0] + '_' + splittedID[1] + '_cond_' + splittedID[2];
    var selectedValType = $('option:selected', this).attr("data-type");
    var optionString = '<option value="">--Select Operator--</option>';
    if (selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "logical") {
      optionString += '<option value="==">is equal to</option> <option value="!=">is not equal to</option> <option value="<">is less than</option> <option value=">">is greater than</option> <option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option><option value="regEx">regular expression</option>';
    } else if (selectedValType == "factor") {
      optionString += '<option value="==">is equal to</option> <option value="!=">is not equal to</option> <option value="isIn">in</option><option value="regEx">regular expression</option>';
    }
    else if (selectedValType == "character") {
      optionString += '<option value="==">is equal to</option><option value="contains">Contains</option><option value="isIn">in</option><option value="regEx">regular expression</option>';
    }
    $(condselectID).html(optionString);
  });
  $("body").on("change", '#mapping-filters .filterColoumSel', function () {
    var selectID = this.id;
    var splittedID = selectID.split("_");
    var condselectID = '#' + splittedID[0] + '_' + splittedID[1] + '_cond_' + splittedID[2];
    var optionString = '<option value="">--Select Operator--</option>';
    optionString += '<option value="==">is equal to</option> <option value="!=">is not equal to</option> <option value="<">is less than</option> <option value=">">is greater than</option> <option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
    $(condselectID).html(optionString);
  });
  $("#data-view-filters").on("change", '.filterColoumSel2', function () {
    var selectID = $(this).parent().attr('id');
    var selectedValType = $('option:selected', this).val();
    if (selectedValType == "isIn") {
      if ($('#' + selectID + ' .filter_msg').length == 0) {
        $('#' + selectID).append('<div class="filter_msg">Please enter comma separated values without spaces for this filter.</div>');
      }
    } else {
      $('#' + selectID + ' div.filter_msg').remove();
    }
    $(this).next().val('');
  });
  // Read Json file
  function read_json_file(jsonFile) {
    var json = null;
    jQuery.ajax({
      'async': false,
      'global': false,
      'url': "/sites/default/files/operator_files/" + jsonFile,
      'dataType': "text",
      'success': function (data) {
        $('#parameter-area-modal #result-div #source-missing-msg').remove();
        json = processData(data);
      },
      'error': function (xhr, status, error) {
        if ($('#parameter-area-modal #result-div #source-missing-msg').length == 0) {
          $('#parameter-area-modal #result-div').prepend('<div id="source-missing-msg">Source CSV file missing, please attach source again.</div>');
        }
        $('.loading-div').hide();
      }
    });
    return json;
  }
  // Process CSV Data
  function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = [];
    for (var i = 1; i < allTextLines.length; i++) {
      var data = allTextLines[i].split(',');
      if (data.length == headers.length) {
        var tarr = {};
        for (var j = 0; j < headers.length; j++) {
          tarr[headers[j]] = data[j]; //.push(headers[j]+":"+data[j]);
        }
        lines.push(tarr);
      }
    }
    return lines;
  }
  //update sort attributes
  function update_sort_attr(sourceJsonData, parameters) {
    var jsonData = read_json_file(sourceJsonData);
    var parametersLength = Object.keys(parameters).length;
    if (parametersLength > 0) {
      var SortAttributes = parameters[0];
      var Sorttype = parameters[1];
      if ((SortAttributes.length > 0) && (Sorttype.length > 0)) {
        var sortsCount = $('#sort_col_count').val(SortAttributes.length);
        $('#sortAttributes_1').empty();
        var sort1Html = $('#sort_col_1').html();
        $('#sortForm').empty();
        $('#sortForm').html('<div id="sort_col_1" class="form-group form-inline sortDiv">' + sort1Html + '</div>');
        var parseData = jsonData[0];
        var sortAttributes = document.getElementById("sortAttributes_1");
        for (var key in parseData) {
          var option = document.createElement("option");
          option.setAttribute("value", key);
          option.text = key;
          sortAttributes.appendChild(option);
        }
        $("#sortAttributes_1").prepend("<option value=''>--Select Column--</option>");
        var sortCount = $('#sort_col_count').val();
        for (var i = 1; i <= sortCount; i++) {
          var j = i - 1;
          if (i > 1) {
            var getDom = $("#sortAttributes_1").html();
            var getDom1 = $("#sortType_1").html();
            var newsortdiv = '<div id="sort_col_' + i + '" class="form-group form-inline sortDiv">';
            var newSortAttributes = '<select class="form-control sortColoumAttr" id="sortAttributes_' + i + '" name="sortAttributes_' + i + '">';
            newSortAttributes += getDom + '</select>';
            var newSortType = '<select class="form-control sortColoumType" id="sortType_' + i + '" name="sortType_' + i + '">';
            newSortType += getDom1 + '</select>';
            var newsortdivEnd = '</div>';
            var complDiv = newsortdiv + newSortAttributes + newSortType + newsortdivEnd;
            var removebtn = '<input type="button" value="x" id="sort_remove_' + i + '" class="btn btn-danger remove-me" />';
            $('#sortForm .sortDiv').last().after(complDiv);
            $('#sort_col_' + i).append(removebtn);
          }
          $('select[name="sortAttributes_' + i + '"').find('option[value="' + SortAttributes[j] + '"]').attr("selected", true);
          $('select[name="sortType_' + i + '"').find('option[value="' + Sorttype[j] + '"]').attr("selected", true);
        }
      }
      else {
        //alert('Sort has no value');
        if ($('#paraAttrName .alert-danger').length == 0) {
          $('#paraAttrName').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Sort has no value.</div>');
        }
        else {
          $('#paraAttrName .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Sort has no value.');
        }
        /*$("#no-sortval-modal").modal('show');
         setModalBackdrop();*/
      }
    }
    else {
      var parseData = jsonData[0];
      $('#sortAttributes_1').empty('');
      var sort1Html = $('#sort_col_1').html();
      $('#sortForm').empty();
      $('#sortForm').html('<div id="sort_col_1" class="form-group form-inline sortDiv">' + sort1Html + '</div>');
      var sortAttributes = document.getElementById("sortAttributes_1");
      for (var key in parseData) {
        var option = document.createElement("option");
        option.setAttribute("value", key);
        option.text = key;
        sortAttributes.appendChild(option);
      }
      $("#sortAttributes_1").prepend("<option value='' selected='selected'>--Select Column--</option>");
    }
  }
  // update select attributes
  function update_select_attr(sourceJsonData, parameters) {
    var jsonData = read_json_file(sourceJsonData);
    var parseData = jsonData[0];
    $('#operaor-select-div').empty('');
    var options = '';
    for (var key in parseData) {
      var option = '<option value="' + key + '" >' + key + '</option>';
      options += option;
    }
    var slectHtml = '<select class="selectpicker multiselect" id="op_select_col" name="op_select_col" multiple required >';
    slectHtml += options;
    slectHtml += '</select>';
    $('#operaor-select-div').append(slectHtml);
    $('.selectpicker').selectpicker('refresh');
    if (parameters) {
      var colNames = parameters;
      colNames = colNames.toString();
      var singleColName = colNames.split(",");
      $('#op_select_col').selectpicker('val', singleColName);
    }
  }
  // update groupby attributes
  function update_groupby_attr(sourceJsonData, parameters) {
    var jsonData = read_json_file(sourceJsonData);
    var parametersLength = Object.keys(parameters).length;
    var parseData = jsonData[0];
    $('#groupby_col_div1').empty('');
    var options = '';
    // options += '<option value="" >Select Column</option>';
    for (var key in parseData) {
      var option = '<option value="' + key + '" >' + key + '</option>';
      options += option;
    }
    var slectHtml = '<select class="selectpicker multiselect" id="op_groupby_col" name="op_groupby_col" multiple required >';
    slectHtml += options;
    slectHtml += '</select>';
    $('#groupby_col_div1').append(slectHtml);
    $('#gb_summ_col').html(options);
    $('.selectpicker').selectpicker('refresh');
    if (parametersLength > 0) {
      var array = parameters.split("-");
      $('input[name=group-selector][value="' + array[0] + '"]').prop("checked", true);
      var groupbyCol = array[1];
      var singleColName = groupbyCol.split(",");
      $('#op_groupby_col').selectpicker('val', singleColName);
      if (array[0] == "simple") {
        $('#gb_summ_col option[value=""]').prop('selected', true);
        $('#op_groupby_func').selectpicker('deselectAll');
        $('#groupby_col_div2').hide();
      } else if (array[0] == "summarized") {
        $('#gb_summ_col option[value="' + array[2] + '"]').prop('selected', true);
        var groupbyFunc = array[3];
        var singleColName2 = groupbyFunc.split(",");
        $('#op_groupby_func').selectpicker('val', singleColName2);
        $('#groupby_col_div2').show();
      }
    } else {
      $('input[name=group-selector][value="simple"]').prop("checked", true);
      $('#gb_summ_col option[value=""]').prop('selected', true);
      $('#op_groupby_func').selectpicker('deselectAll');
      $('#op_groupby_col').selectpicker('deselectAll');
      $('#groupby_col_div2').hide();
    }
  }
  // update mutate attributes
  function update_attr_mutate(sourceJsonData, parameters) {
    var droot_host = window.location.hostname;
    var droot = '/var/www/' + droot_host;
    var file = "file_path=" + droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
    file = file.toString();
    jQuery.ajax({
      url: Drupal.url('tm-sketch-readcols'),
      type: "POST",
      data: file,
      success: function (response) {
        var selectedFiltersVarLength = Object.keys(parameters).length;
        $('#op_mutate_col2').val('');
        $('#newcolumn').val('');
        $('input[name=mutate-selector][value="mutate"]').prop('checked', true);
        var options = '';
        options += '<option value="">--Select Column--</option>';
        for (key in response) {
          var splitID = response [key].split("=");
          var option = '<option value="' + splitID[0] + '" data-type="' + splitID[1] + '">' + splitID[0] + '</option>';
          if (splitID[1] == "integer" || splitID[1] == 'numeric') {
            options += option;
          }
        }
        $("#op_mutate_col1").html(options);
        $("#op_mutate_col3").html(options);
        if (selectedFiltersVarLength > 0) {
          var array = parameters.split(",");
          $('#op_mutate_col1').val(array[0]);
          $('#op_mutate_col2').val(array[1]);
          $('#op_mutate_col3').val(array[2]);
          $('#newcolumn').val(array[3]);
          $('input[name=mutate-selector][value="' + array[4] + '"]').prop('checked', true);
        }
      }
    });
  }
  function applied_mapping(newColName, sourceJsonData, filterJson, sortCellView, getSortCellById, hiddenId) {
    var droot_host = window.location.hostname;
    var droot = '/var/www/' + droot_host;
    var data_set = droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
    var result_file = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_out.csv";
    var GlobaldataJson = '{"dataset":"' + data_set + '", "resultFile":"' + result_file + '","newColName":"' + newColName + '", "filters":' + filterJson + '}';
    var filters_data = "map_json=" + GlobaldataJson;
    $.ajax({
      url: '/tm-sketch-mapping',
      data: filters_data,
      beforeSend: function () {
        $(".graphLoader-modify").css('visibility', 'visible');
        $("#btn-run").addClass("disabled");
      },
      type: 'post',
      success: function (data) {
        console.log(data);
        $(".graphLoader-modify").css('visibility', 'hidden');
        console.log("filter applied");
        if (data == 'file created') {
          data = hiddenId + "_out.csv";
          //var parseData =  JSON.parse(data);
          sortCellView.model.attributes.outputData = data;
          var sourceJsonUpData = sortCellView.model.attributes.outputData;
          var outboundLinks = graph.getConnectedLinks(getSortCellById, {
            outbound: true,
            deep: true
          });
          if (outboundLinks.length > 0) {
            recursion_source(outboundLinks, sourceJsonUpData);
          }
          var preVal = $.trim($('#temp_files_area').val());
          var newVal = preVal + ',' + data;
          newVal = (newVal[0] == ',') ? newVal.substr(1) : newVal;
          $('#temp_files_area').val(newVal);
          $("#btn-run").removeClass("disabled");
          if ($('#parameterss-area .alert-success').length == 0) {
            $('#parameterss-area').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
          } else {
            $('#parameterss-area .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
          }
        } else if (data == 'File is not created.') {
          if ($('#MappingDiv .alert-danger').length == 0) {
            $('#MappingDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updated.</div>');
          }
          else {
            $('#MappingDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updated.');
          }
        }
        $('.tab-content').animate({scrollTop: 0}, 'slow');
        $('#btn-save').addClass('alert-red');
      },
      error: function (xhr, status, error) {
        // executed if something went wrong during call
        if (xhr.status > 0)
          var html_mapping = $('' +
            '<div class="modal fade"  role="dialog" id="mapping-error-modal">' +
            '   <div class="modal-dialog">' +
            '     <div class="modal-content">' +
            '       <div class="modal-header">' +
            '         <button type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"  data-dismiss="modal"><span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>&nbsp;</button>' +
            '         <h4 class="modal-title">Error!</h4>' +
            '       </div>' +
            '       <div class="modal-body"> ' +
            '         <div id="msg">' +
            '           <h6>Got ' + status + '</h6>' +
            '         </div>' +
            '       </div>' +
            '   </div>' +
            '</div>');
        if ($('#MappingDiv .alert-danger').length == 0) {
          $('#MappingDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '</div>');
        }
        else {
          $('#MappingDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '.');
        }
      }
    });
  };
  //Ajax request for applying filter
  function applied_filter(sourceJsonData, filterJson, filterCellView, getCellFilterById, hiddenId) {
    var droot_host = window.location.hostname;
    var droot = '/var/www/' + droot_host;
    var data_set = droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
    var result_file = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_out.csv";
    var GlobaldataJson = '{"dataset":"' + data_set + '", "resultFile":"' + result_file + '", "filters":' + filterJson + '}';
    var filters_data = "fiters_json=" + GlobaldataJson;
    $.ajax({
      url: '/tm-sketch-multifilter',
      data: filters_data,
      beforeSend: function () {
        $(".graphLoader-modify").css('visibility', 'visible');
        $("#btn-run").addClass("disabled");
      },
      type: 'post',
      success: function (data) {
        console.log(data);
        $(".graphLoader-modify").css('visibility', 'hidden');
        if (data == 'file created') {
          data = hiddenId + "_out.csv";
          console.log("filter applied");
          filterCellView.model.attributes.outputData = data;
          var sourceJsonUpData = filterCellView.model.attributes.outputData;
          var outboundLinks = graph.getConnectedLinks(getCellFilterById, {
            outbound: true,
            deep: true
          });
          if (outboundLinks.length > 0) {
            recursion_source(outboundLinks, sourceJsonUpData);
          }
          $("#btn-run").removeClass("disabled");
          if ($('#filterDiv .alert-success').length == 0) {
            $('#filterDiv').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
          } else {
            $('#filterDiv .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
          }
        }
        else if (data == 'File is not created.') {
          var html_data = $('' +
            '<div class="modal fade"  role="dialog" id="filter-data-modal">' +
            '   <div class="modal-dialog">' +
            '     <div class="modal-content">' +
            '       <div class="modal-header">' +
            '         <button type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"  data-dismiss="modal"><span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>&nbsp;</button>' +
            '         <h4 class="modal-title">Error!</h4>' +
            '       </div>' +
            '       <div class="modal-body"> ' +
            '         <div id="msg">' +
            '           <h6>Got error, ' + data + '</h6>' +
            '         </div>' +
            '       </div>' +
            '   </div>' +
            '</div>');
          if ($('#filterDiv .alert-danger').length == 0) {
            $('#filterDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, Result not updated.</div>');
          }
          else {
            $('#filterDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, Result not updated.');
          }
        }
      },
      error: function (xhr, status, error) {
        // executed if something went wrong during call
        if (xhr.status > 0)
          var html_filter = $('' +
            '<div class="modal fade"  role="dialog" id="app-filter-modal">' +
            '   <div class="modal-dialog">' +
            '     <div class="modal-content">' +
            '       <div class="modal-header">' +
            '         <button type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"  data-dismiss="modal"><span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>&nbsp;</button>' +
            '         <h4 class="modal-title">Error!</h4>' +
            '       </div>' +
            '       <div class="modal-body"> ' +
            '         <div id="msg">' +
            '           <h6>Got ' + status + '</h6>' +
            '         </div>' +
            '       </div>' +
            '   </div>' +
            '</div>');
        if ($('#filterDiv .alert-danger').length == 0) {
          $('#filterDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '</div>');
        }
        else {
          $('#filterDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '.');
        }
      }
    });
  };
  //Ajax request for sorting data.
  function applied_sort(sourceJsonData, sortJson, sortCellView, getSortCellById, hiddenId) {
    var droot_host = window.location.hostname;
    var droot = '/var/www/' + droot_host;
    var data_set = droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
    var result_file = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_out.csv";
    var GlobaldataJson = '{"dataset":"' + data_set + '", "resultFile":"' + result_file + '", "columNames":"' + sortJson + '"}';
    var filters_data = "sort_json=" + GlobaldataJson;
    //console.log(sourceJsonData);
    $.ajax({
      url: '/tm-sketch-sorting',
      data: filters_data,
      beforeSend: function () {
        $(".graphLoader-modify").css('visibility', 'visible');
        $("#btn-run").addClass("disabled");
      },
      type: 'post',
      success: function (data) {
        console.log(data);
        $(".graphLoader-modify").css('visibility', 'hidden');
        console.log("filter applied");
        if (data == '["Date Format is not Correct"]') {
          console.log("Date format is not correct");
          $("#dateFormat").modal("show");
          return;
        } else if (data == 'File Created') {
          data = hiddenId + "_out.csv";
          sortCellView.model.attributes.outputData = data;
          var sourceJsonUpData = sortCellView.model.attributes.outputData;
          var outboundLinks = graph.getConnectedLinks(getSortCellById, {
            outbound: true,
            deep: true
          });
          if (outboundLinks.length > 0) {
            recursion_source(outboundLinks, sourceJsonUpData);
          }
          $("#btn-run").removeClass("disabled");
          if ($('#paraAttrName .alert-success').length == 0) {
            $('#paraAttrName').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
          } else {
            $('#paraAttrName .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
          }
        } else if (data == 'File is not created.') {
          //alert('File is not created');
          if ($('#paraAttrName .alert-danger').length == 0) {
            $('#paraAttrName').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Result not updated.</div>');
          }
          else {
            $('#paraAttrName .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updated.');
          }
        }
      },
      error: function (xhr, status, error) {
        // executed if something went wrong during call
        if (xhr.status > 0)
          var html_sort = $('' +
            '<div class="modal fade"  role="dialog" id="sort-error-modal">' +
            '   <div class="modal-dialog">' +
            '     <div class="modal-content">' +
            '       <div class="modal-header">' +
            '         <button type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"  data-dismiss="modal"><span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>&nbsp;</button>' +
            '         <h4 class="modal-title">Error!</h4>' +
            '       </div>' +
            '       <div class="modal-body"> ' +
            '         <div id="msg">' +
            '           <h6>Got ' + status + '</h6>' +
            '         </div>' +
            '       </div>' +
            '   </div>' +
            '</div>');
        if ($('#paraAttrName .alert-danger').length == 0) {
          $('#paraAttrName').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '</div>');
        }
        else {
          $('#paraAttrName .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '.');
        }
      }
    });
  };
  //Ajax request for select data.
  function applied_select(sourceJsonData, colNmaes, sortCellView, getSortCellById, hiddenId) {
    var droot_host = window.location.hostname;
    var droot = '/var/www/' + droot_host;
    var data_set = droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
    var result_file = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_out.csv";
    var GlobaldataJson = '{"dataset":"' + data_set + '", "resultFile":"' + result_file + '", "columNames":"' + colNmaes + '"}';
    var select_data = "select_json=" + GlobaldataJson;
    $.ajax({
      url: '/tm-sketch-select',
      data: select_data,
      beforeSend: function () {
        $(".classifier-modify").css('visibility', 'visible');
        $("#btn-run").addClass("disabled");
      },
      type: 'post',
      success: function (data) {
        console.log(data);
        $(".classifier-modify").css('visibility', 'hidden');
        console.log("filter applied");
        if (data == '["Date Format is not Correct"]') {
          console.log("Date format is not correct");
          $("#dateFormat").modal("show");
          return;
        }
        else if (data == 'file created') {
          data = hiddenId + "_out.csv";
          sortCellView.model.attributes.outputData = data;
          var sourceJsonUpData = sortCellView.model.attributes.outputData;
          var outboundLinks = graph.getConnectedLinks(getSortCellById, {
            outbound: true,
            deep: true
          });
          if (outboundLinks.length > 0) {
            recursion_source(outboundLinks, sourceJsonUpData);
          }
          var preVal = $.trim($('#temp_files_area').val());
          var newVal = preVal + ',' + hiddenId + "_out.csv";
          newVal = (newVal[0] == ',') ? newVal.substr(1) : newVal;
          $('#temp_files_area').val(newVal);
          $("#btn-run").removeClass("disabled");
          $('#btn-save').addClass('alert-red');
          if ($('#SelectDiv .alert-success').length == 0) {
            $('#SelectDiv').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
          } else {
            $('#SelectDiv .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
          }
        }
        else if (data == 'File is not created.') {
          if ($('#SelectDiv .alert-danger').length == 0) {
            $('#SelectDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updated.</div>');
          }
          else {
            $('#SelectDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Result not updated.');
          }
        }
      },
      error: function (xhr, status, error) {
        // executed if something went wrong during call
        if (xhr.status > 0)
          var html_app_sel = $('' +
            '<div class="modal fade"  role="dialog" id="app-sel-modal">' +
            '   <div class="modal-dialog">' +
            '     <div class="modal-content">' +
            '       <div class="modal-header">' +
            '         <button type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"  data-dismiss="modal"><span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>&nbsp;</button>' +
            '         <h4 class="modal-title">Error!</h4>' +
            '       </div>' +
            '       <div class="modal-body"> ' +
            '         <div id="msg">' +
            '           <h6>Got ' + status + '</h6>' +
            '         </div>' +
            '       </div>' +
            '   </div>' +
            '</div>');
        if ($('#SelectDiv .alert-danger').length == 0) {
          $('#SelectDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '</div>');
        }
        else {
          $('#SelectDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '.');
        }
      }
    });
  };
  //Ajax request for joins data.
  function applied_joins(sourceJsonData1, sourceJsonData2, joinType, getCellById, hiddenId) {
    var droot_host = window.location.hostname;
    var droot = '/var/www/' + droot_host;
    var data_set1 = droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData1;
    var data_set2 = droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData2;
    var join_type = joinType;
    var result_file = droot + "/htdocs/sites/default/files/operator_files/" + hiddenId + "_out.csv";
    var GlobaldataJson = '{"xDataset":"' + data_set1 + '", "yDataset":"' + data_set2 + '", "resultFile":"' + result_file + '", "joinType":"' + join_type + '"}';
    var joins_data = "join_json=" + GlobaldataJson;
    //console.log(sourceJsonData);
    $.ajax({
      url: '/joins-data',
      data: joins_data,
      beforeSend: function () {
        $(".graphLoader-modify").css('visibility', 'visible');
        $("#btn-run").addClass("disabled");
      },
      type: 'post',
      success: function (data) {
        console.log(data);
        if (data == 'file created') {
          data = hiddenId + "_out.csv";
          getCellById.attributes.outputData = '';
          getCellById.attributes.inputData = '';
          getCellById.attributes.inputData = data;
          getCellById.attributes.outputData = data;
          var sourceJsonUpData = getCellById.attributes.outputData;
          var outboundLinks = graph.getConnectedLinks(getCellById, {
            outbound: true,
            deep: true
          });
          if (outboundLinks.length > 0) {
            recursion_source(outboundLinks, sourceJsonUpData);
          }
          /*add file to temp area*/
          var preVal = $.trim($('#temp_files_area').val());
          var newVal = preVal + ',' + hiddenId + "_out.csv";
          newVal = (newVal[0] == ',') ? newVal.substr(1) : newVal;
          $('#temp_files_area').val(newVal);
          //end temp insetion
          if ($('#joinDiv .alert-success').length == 0) {
            $('#joinDiv').prepend('<div class="alert alert-success alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.</div>');
          } else {
            $('#joinDiv .alert-success').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Success! Click "Result" to view results. <br>Click on "Save" for permanently saving.');
          }
        } else {
          setTimeout(function () {
            $('#parameter-area-modal').modal('hide');
            $('#joins-err-modal').modal('show');
            setModalBackdrop();
          }, 1000);
        }
        $(".graphLoader-modify").css('visibility', 'hidden');
        $("#btn-run").removeClass("disabled");
        $('#btn-save').addClass('alert-red');
      },
      error: function (xhr, status, error) {
        // executed if something went wrong during call
        if (xhr.status > 0)
          var html_join = $('' +
            '<div class="modal fade"  role="dialog" id="join-error-modal">' +
            '   <div class="modal-dialog">' +
            '     <div class="modal-content">' +
            '       <div class="modal-header">' +
            '         <button type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"  data-dismiss="modal"><span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>&nbsp;</button>' +
            '         <h4 class="modal-title">Error!</h4>' +
            '       </div>' +
            '       <div class="modal-body"> ' +
            '         <div id="msg">' +
            '           <h6>Got ' + status + '</h6>' +
            '         </div>' +
            '       </div>' +
            '   </div>' +
            '</div>');
        if ($('#joinDiv .alert-danger').length == 0) {
          $('#joinDiv').prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '</div>');
        }
        else {
          $('#joinDiv .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Got error, ' + status + '.');
        }
      }
    });
  };
  ////////////////Multiple Filters/////////////////////////
  function recursion_find(outboundLinks) {
    _.each(outboundLinks, function (outboundLink) {
      var outboundTargetElement = outboundLink.getTargetElement();
      var outboundTargetCell = graph.getCell(outboundTargetElement);
      var attribs = outboundTargetCell.attributes;
      var html_recur = $('' +
        '<div class="modal fade"  role="dialog" id="recursion-modal">' +
        '   <div class="modal-dialog">' +
        '     <div class="modal-content">' +
        '       <div class="modal-header">' +
        '         <button type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"  data-dismiss="modal"><span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>&nbsp;</button>' +
        '         <h4 class="modal-title">Error!</h4>' +
        '       </div>' +
        '       <div class="modal-body"> ' +
        '         <div id="msg">' +
        '           <h6>' + JSON.stringify(attribs) + '</h6>' +
        '         </div>' +
        '       </div>' +
        '   </div>' +
        '</div>');
      $(html_recur).appendTo('.sketch-coloumn');
      $(html_recur).modal('show');
      setModalBackdrop()
      //alert(JSON.stringify(attribs));
      var outboundNewLinks = graph.getConnectedLinks(outboundTargetElement, {outbound: true});
      recursion_find(outboundNewLinks);
    });
  }

  //function to close right panel
  function nav_slide_right_close() {
    //$(".user-nav-slide-right").animate({"top": "0px"});
    $("#parameter-area").hide('medium');
    $("#parameter-rel").addClass("closed");
    $("#operator-area2").hide('medium');
    $("#operator-rel2").addClass("closed");
    $("div#charts").removeClass("in");
    $("div#charts").removeClass("active");
    $("div#design").removeClass("in");
    $("div#design").removeClass("active");
    $(".charts-text .caret").addClass("closed");
    $("#operator-btn2 span").removeClass("glyphicon-minus").addClass("glyphicon-plus");
  }

  //function to open right panel
  function nav_slide_right_open() {
    $("#parameters-box").hide();
    $("#parameter-area").show('medium');
    $("#parameter-rel").removeClass("closed");
  }

  //All connected operators will read sourcejson data
  function recursion_source(outboundLinks, sourceJsonUpData) {
    _.each(outboundLinks, function (outboundLink) {
      var outboundTargetElement = outboundLink.getTargetElement();
      var outboundTargetCell = graph.getCell(outboundTargetElement);
      outboundTargetCell.attributes.inputData = '';
      outboundTargetCell.attributes.outputData = '';
      console.log(outboundLink);
      if (outboundTargetCell.attributes.operatorType == 'Joins' || outboundTargetCell.attributes.operatorType == 'Cat' || outboundTargetCell.attributes.operatorType == 'Predict' || outboundTargetCell.attributes.operatorType == 'Decision Tree') {
        if (outboundLink.get('target').port == 'lef') {
          outboundTargetCell.attributes.settings.parameters.leftSource = '';
          outboundTargetCell.attributes.settings.parameters.leftSource = sourceJsonUpData;
          var joinType = $('#joinTypeId option:selected').val();
          outboundTargetCell.attributes.settings.parameters.joinType = '';
          outboundTargetCell.attributes.settings.parameters.joinType = joinType;
        }
        if (outboundLink.get('target').port == 'rig') {
          outboundTargetCell.attributes.settings.parameters.rightSource = '';
          outboundTargetCell.attributes.settings.parameters.rightSource = sourceJsonUpData;
          var joinType = $('#joinTypeId option:selected').val();
          outboundTargetCell.attributes.settings.parameters.joinType = '';
          outboundTargetCell.attributes.settings.parameters.joinType = joinType;
        }
        if (outboundLink.get('target').port == 'df1' || outboundLink.get('target').port == 'trn') {
          outboundTargetCell.attributes.settings.parameters.leftSource = '';
          outboundTargetCell.attributes.settings.parameters.leftSource = sourceJsonUpData;
        }
        if (outboundLink.get('target').port == 'df2' || outboundLink.get('target').port == 'tst') {
          outboundTargetCell.attributes.settings.parameters.rightSource = '';
          outboundTargetCell.attributes.settings.parameters.rightSource = sourceJsonUpData;
        }
      }
      else {
        outboundTargetCell.attributes.settings.parameters = {};
      }
      outboundTargetCell.attributes.inputData = sourceJsonUpData;
      outboundTargetCell.attributes.outputData = sourceJsonUpData;
      if (outboundTargetCell.attributes.operatorType == 'Cat') {
        outboundTargetCell.attributes.outputData = "";
      }
      var outboundNewLinks = graph.getConnectedLinks(outboundTargetElement, {outbound: true});
      if (Object.keys(outboundNewLinks).length > 0) {
        recursion_source(outboundNewLinks, sourceJsonUpData);
      }
      else {
        return true;
      }
    });
  }

  //if link is remved and target operators is connected to other operators
  //All connected operators will be updated
  function recursion_target(removedTargetCellOutLinks) {
    _.each(removedTargetCellOutLinks, function (remTargetOutLink) {
      var outboundTargetElement = remTargetOutLink.getTargetElement();
      var outboundTargetCell = graph.getCell(outboundTargetElement);
      outboundTargetCell.attributes.inputData = '';
      outboundTargetCell.attributes.outputData = '';
      outboundTargetCell.attributes.settings.parameters = {};
      var outboundNewLinks = graph.getConnectedLinks(outboundTargetElement, {outbound: true});
      if (Object.keys(outboundNewLinks).length > 0) {
        recursion_target(outboundNewLinks);
      }
      else {
        return true;
      }
    });
  }

  function removeConnectedLinks(removedTargetCellOutLinks) {
    _.each(removedTargetCellOutLinks, function (link) {
      var outboundTargetElement = link.getTargetElement();
      var outboundNewLinks = graph.getConnectedLinks(outboundTargetElement, {outbound: true});
      link.remove();
      if (Object.keys(outboundNewLinks).length > 0) {
        removeConnectedLinks(outboundNewLinks);
      }
      else {
        return true;
      }
    });
  }

  function empty_temp() {
    var sketch_nid = $("#graphNid").val();
    var file_names = $('#temp_files_area').val();
    if (file_names != "") {
      $.ajax({
        type: 'POST',
        data: {
          filenames: file_names,
          sketch_id: sketch_nid,
        },
        url: Drupal.url('delete-dataset')
      });
      $('#temp_files_area').val('');
    }
  }

  $('#stencil .list-group li.filterdrag').append('<i class="fa fa-arrows" title="Drag"></i>');
  $('#stencil').on('click', 'li span.glyphicon', function (e) {
    e.stopPropagation();
    $(this).toggleClass("selected-li");
    if ($(this).parents(".list-group-selected").length) {
      var value = $(this).parents("li").attr("value");
      var id = $(this).parents("li").attr("id");
      var allline = $(this).parents("li").html()
      $(this).parents("li").remove();
      var ullilenght = $("ul.list-group-selected li").length;
      if (ullilenght < 1) {
        $("#stencil ul.list-group-selected").removeClass("block");
      }
      $("#stencil ul.list-group").append('<li unselectable="on" class="list-group-item filterdrag" id="' + id + '" value="' + value + '">' + allline + '</li>');
    }
    if ($(this).parents(".list-group").length) {
      var getclass = $(this).parents("li").attr("class");
      var value = $(this).parents("li").attr("value");
      var id = $(this).parents("li").attr("id");
      var allline = $(this).parents("li").html();
      $(this).parents("li").remove();
      var ullilenght = $("ul.list-group-selected li").length;
      if (ullilenght == 1) {
        $("#stencil ul.list-group-selected").addClass("block");
      }
      $("#stencil ul.list-group-selected").append('<li unselectable="on" class="list-group-item filterdrag" id="' + id + '" value="' + value + '">' + allline + '</li>');
      $("#stencil ul.list-group-selected").show();
    }
    //sortList();
  });
  function sortList() {
    $("li", "#stencil ul.list-group").sort(function (a, b) {
      return $(a).text().localeCompare($(b).text());
    }).appendTo("#stencil ul.list-group");
  }

  $.fn.outside = function (ename, cb) {
    return this.each(function () {
      var $this = $(this),
        self = this;
      $(document).bind(ename, function tempo(e) {
        if (e.target !== self && !$.contains(self, e.target)) {
          cb.apply(self, [e]);
          if (!self.parentNode) $(document.body).unbind(ename, tempo);
        }
      });
    });
  };
})(jQuery);
function setModalBackdrop() {
  jQuery(".sketch-coloumn .container-fluid").addClass("after_modal_appended");
  if (jQuery('.analytics-column .modal-backdrop').length == 0) {
    jQuery('.modal-backdrop').appendTo('.sketch-coloumn .container-fluid');
  } else {
    jQuery('.modal-backdrop:eq(1)').appendTo('.sketch-coloumn .container-fluid');
  }
  jQuery('body').removeClass("modal-open");
  jQuery('body').css("padding-right", "");
}