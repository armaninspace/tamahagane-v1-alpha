(function ($) {
  $(document).ready(function(){
    /**
     * Area chart operator click
    */
    paper.on('cell:pointerclick', function (cellView, evt, x, y) {
      var opTypeVal = cellView.model.attributes.operatorType;
      if(opTypeVal == 'Area Chart') {
        $('.param_link, #3dScatterDiv-container, #BubblechartDiv-container, #linechartDiv-container, #histogramchartdiv-container, #txtclusterDiv-container').hide();
        $("#AreachartDiv-container , .chart_link, .sections_forms h3").show();
        $('.nav-tabs a[href="#chart-div"]').tab('show');
        var hiddenId = document.getElementById("param-id").value;
        var getCellById = graph.getCell(hiddenId);
        var currFilter = paper.findViewByModel(getCellById);
        var sourceJsonData = currFilter.model.attributes.inputData;
        var droot_host = window.location.hostname;
        var droot = '/var/www/' + droot_host;
        var filePath = "file_path=" + droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
        var csvfile = droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
        var file = filePath.toString();
        $("#chartfile").val(csvfile);
        $("#chartcellid").val(hiddenId);

        $.ajax({
          url: Drupal.url('tm_areachart/add/form'),
          type: "POST",
          data: file,
          beforeSend: function() {
            $('#AreachartDiv').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
          },
          success: function (response) {
            $('.loading_img').remove();
            $('#edit_input').remove();
            var $wrapper = $('#AreachartDiv');
            $wrapper.html(response.form_html);
            $('.selectpicker').selectpicker('refresh');
        }
      });
    }
  });

    /**
     * Area chart operator form submit
    */
    $('body').on('submit', 'form#area_chart_form', function(e) {
      e.preventDefault();
      var container_id = $(this).parent().attr('id');
      var sketch_id = $(".node--type-sketch.node--view-mode-full").data('history-node-id');
      var dataid = $("#chartcellid").val();
      var globalFilterJson = "";
      var csv_path = "";
      var areaFileP = $("#areachartfile").val();
      ///area patch
      if (areaFileP) {
        csv_path = areaFileP;
      } else {
        csv_path = $("#chartfile").val();
      }
      var img_dir = $('#imgDir').val();
      var title = $('input[name="area_title"]').val();
      var previs= 0;
      $('#charts_list_ul li .areaplot').each(function() {
      var vals = $(this).parents('li').attr('id').split('_');
        if(previs < vals[2]){
          previs = vals[2];
        }
      });
      var areaImgNum = previs;
      var edit_img = "";
      if (!areaImgNum || areaImgNum==0) {
        var areaImgNum = 1;
      }
      else {
        if ($('#edit_input').length != 0) {
          var areaImgNum = $('#edit_input').val();
          edit_img = "_ed";
        }
        else {
          areaImgNum++;
        }
      }
      var chart_title = $('input[name="area_title"]',this).val();
      var x_cols 		= $('select[name="area_xaxis_col"]',this).val();
      var x_col_types = "";
      $('#area_xaxis_col option:selected').each(function(){
        x_col_types +=$(this).attr('data-type')+",";
      });
      x_col_types = x_col_types.replace(/,\s*$/, ""); /**** Removing Last Comma *****/
      var x_title 		= $('input[name="area_xtitle"]',this).val();
      var filersCount = $('input[name="area_filter_count"]',this).val();
      var filterJson = "";
      var imageName = 'areaplot_'+sketch_id+'_'+areaImgNum+edit_img+'.html';
      var img_name = img_dir+imageName;
      var prnt = $(this).parent();
      for (i = 1; i <= filersCount; i++) {
        if ($('#area_filter'+i).length == 0) {
          continue;
        }
        if ($.trim($('input[name="area_filter_cond_val'+i+'"]',this).val()) == "" ) {
          continue;
        }
        var colname = $('select[name="area_filter_sel'+i+'"]',this).val();
        var operator = $('select[name="area_filter_cond_sel'+i+'"]',this).val();
        var required_val = $('input[name="area_filter_cond_val'+i+'"]',this).val();
        if (colname == '' ||  operator == '') {
          if ($('.alert-danger').length == 0) {
            $(this).parent().prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filters Error! Column name & operators are required to apply filter. </div>');
          } else {
            $('.alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filters Error! Column name & operators are required to apply filter. ');
          }
          $('.tab-content, #chart-div .op-spec-div').animate({ scrollTop: 0 }, 'slow');
          $(window).scrollTop(0);
          //alert('Column name & operators are required to apply filter');
          //$("#col-op-modal").modal('show');
          //$(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
          //$('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
          //$('body').removeClass("modal-open");
          //$('body').css("padding-right","").css;
          return false;
        }
        filterJson += '{"colname":"'+colname+'", "operator":"'+operator+'", "required_val":"'+required_val+'"},';
      }
      filterJson = filterJson.replace(/,\s*$/, "");
      if (globalFilterJson == "" || globalFilterJson == null) {
        var filterJsonwithGlobal = filterJson;
      }
      else {
        var filterJsonwithGlobal = globalFilterJson+","+filterJson;
      }
      filterJsonwithGlobal = filterJsonwithGlobal.replace(/,\s*$/, "");
      var filterJsonwithGlobal = "["+filterJsonwithGlobal+"]";
      filterJson = "["+filterJson+"]";
      var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_cols+'", "x_col_type":"'+x_col_types+'",';
      GlobaldataJson += '"x_title":"'+x_title+'", "filters":'+filterJsonwithGlobal+'}';
      var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_cols+'", "x_col_type":"'+x_col_types+'", ';
      dataJson += '"x_title":"'+x_title+'", "filters":'+filterJson+'}';
      chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=areachart";
      var tooltipTitle = 'Get Help';
      var tooltipPath = '/wiki/area-plot';
      //var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="areachart_'+areaImgNum+'_'+sketch_id+'_'+dataid+'" data-whatever="Area Chart" class="showForm areachart glyphicon glyphicon-pencil edit"></span>';
      var panelhead = title;
      //panelhead   += '<span id="area_'+areaImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
      panelhead   += '<span id="area_'+areaImgNum+'_rem" class="glyphicon glyphicon-remove-sign rem-chart" title="Remove"></span><span id="areachart_'+areaImgNum+'_'+sketch_id+'_'+dataid+'" data-whatever="Area Chart" class="showForm areachart glyphicon glyphicon-edit edit" title="Edit"></span><span id="txt-minus-plus" class="glyphicon glyphicon-minus-sign" title="Minimize"></span><span class="glyphicon glyphicon-move" title="Move"></span>';
      var tabLi_a = title+'<i class="fa fa-arrows"></i>';
      if ($('#edit_input').length != 0) {
        $( '#area_'+areaImgNum+' div.panel-body').empty();
        $( '#area_'+areaImgNum+' div.panel-heading').html(panelhead);
        $( '#tabs ul li.active a').html(tabLi_a);
      }
      else {
        //$( "div.tab-pane" ).removeClass( "in active" );
        //$( "#tabs ul li" ).removeClass( "active" );
        //var areaimgHTML = '<div id="area_'+areaImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
        var areaimgHTML = '<div id="area_'+areaImgNum+'" class="myTab panel panel-default draggable-element"><div class="panel-heading">'+panelhead+'</div>';
        areaimgHTML += '<div class="panel-body">';
        areaimgHTML += '</div></div>';
       // $("#tabs ul").prepend('<li id="area_li_'+areaImgNum+'" class="active"><a data-toggle="tab" class="areaplot" href="#area_'+areaImgNum+'">'+tabLi_a+'</a></li>');
       // $("#tabs ul").prepend('<li id="area_li_'+areaImgNum+'" class=""><a class="areaplot" href="#area_'+areaImgNum+'">'+tabLi_a+'</a></li>');
        $("#tabs ul#charts_list_ul").prepend('<li id="area_li_'+areaImgNum+'" class=""><a data-toggle="tab" class="areaplot" href="#area_'+areaImgNum+'">'+tabLi_a+'</a></li>');
        $( ".graphical-area" ).prepend( areaimgHTML );
      }
      var imageName2 = "";
      if (imageName.includes("_ed")) {
        imageName2 = imageName.replace("_ed", "");
      }
      else {
        imageName2 = imageName;
      }
      $.ajax({
        type: "POST",
        url: "/tm_areachart/process/data",
        data: chart_data,
        beforeSend: function() {
          $('#area_'+areaImgNum+' div.panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
          $(window).scrollTop(0);
          $('.alert-danger').remove();
        },
        success: function (result) {
          var chrtresult = result.chart_html;
          var splittedresult = chrtresult.split("|||");
          if (splittedresult[0] == '0') {
           /* $(prnt).prepend(splittedresult[1]);
            $('.tab-content').animate({ scrollTop: 0 }, 'slow');
            $("#chartsMsg-modal #msg").html('<h6>Chart not generated</h6>');
            $("#chartsMsg-modal .modal-title").text('Error!');*/
            //if ($areaFileP) {
            var area_plot_comp_json = '{"ImgType": "areaplot", "ImgID": "area_img_'+areaImgNum+'", "ImgName": "'+imageName2+'","dataset_id": "'+dataid+'","save_chart": "No", "data":['+dataJson+']}';
            updateChartsData(area_plot_comp_json , 'area_img_'+areaImgNum );
              $('.loading_img').remove();
              $('#area_'+areaImgNum+' div.panel-body').append(splittedresult[1]);
              $('#area_img_'+areaImgNum).removeClass( "json-data" );
              $('#area_img_'+areaImgNum).css( "display", "none" );
              var textAreaJsonField = '<textarea class="form-control json-data" id="area_img_'+areaImgNum+'" name="area_img_'+areaImgNum+'">'+area_plot_comp_json+'</textarea>';
              $('#area_'+areaImgNum+' div.panel-body').append(textAreaJsonField);
              $('.nav-tabs a[href="#charts"]').tab('show');
           /* } else {
              $('#area_li_'+areaImgNum).remove();
            }*/
          }
          else {
            $(".sections_forms").hide(0, on_form_hide);
            var area_plot_comp_json = '{"ImgType": "areaplot", "ImgID": "area_img_' + areaImgNum + '", "ImgName": "' + imageName2 + '","dataset_id": "' +dataid+'", "data":[' + dataJson + ']}';
            updateChartsData(area_plot_comp_json , 'area_img_'+areaImgNum );
            //$("#chartsMsg-modal #msg").html('<h6>Chart generated successfully and listed in charts list, click on "Save" to permanently save.</h6>');
            $('#btn-save').addClass('alert-red');
            //if (container_id == 'secForms') {
              $('.loading_img').remove();
              $('#area_' + areaImgNum + ' div.panel-body').html(result.chart_html);
              var textAreaJsonField = '<textarea class="form-control json-data" id="area_img_' + areaImgNum + '" name="area_img_' + areaImgNum + '">' + area_plot_comp_json + '</textarea>';
              $('#area_' + areaImgNum + ' div.panel-body').append(textAreaJsonField);
              $('.nav-tabs a[href="#charts"]').tab('show');
              setTimeout(function(){
                window.HTMLWidgets.staticRender();
                $('.svg-container').height('275');
                $('.nav-tabs a[href="#tm_grid"]').tab('show');
                Drupal.attachBehaviors();
              }, 1000);
            //}// else {
             // $('#parameter-area-modal').modal('hide');
              $(this).find("input[type=text]").val("");
              $('#AreachartDiv').empty();
             /* setTimeout(function () {
                $("#chartsMsg-modal").modal('show');
                setModalBackdrop();
              }, 1000);*/
            //}
          }
          $('.draggable-element').arrangeable({dragSelector: '.glyphicon-move'});
        }
      });
      //$("#chart-edit-modal").modal('hide');
     // close_form_slide();
      setTimeout(function(){

      }, 3000);

      return false;
    });

    /**
     * Area chart list click
    */
    $("body").on("click", '#charts_list_ul li a.areaplot', function(e) {
      var id = $(this).parent().attr('id');
      var splitID = id.split("_");
      var img_id = splitID[0] + '_img_' + splitID[2];
      var divid = splitID[0] + '_' + splitID[2];
      var already = "";
      $('.graphical-area .myTab').each(function () {
        if ($(this).attr('id') == divid) {
          already = "exist";
          return false;
        }
      });
      close_analytics_slide();
      if (already) {
        return false;
      }
      else {
        var textJson = $('#chartsdata #datacharts').val();
        var obj = jQuery.parseJSON(textJson);
        $.each(obj, function (key, value) {
          if (value['ImgID'] == img_id) {
            var imgname = value['ImgName'];
            var $pathForHTml2 = '/sites/default/files/projectChartImages/' + imgname;
            var $title = value['data'][0]['chart_title'];
            var $liclass = 'class="active"';
            var $tabdivClass = "";
            var $id = $(".node--type-sketch.node--view-mode-full").data('history-node-id');
            var tooltipPath = '/wiki/area-chart';
            var tooltipTitle = "tooltip";
            var $imgid = splitID[2];
            var tabcont = '<div id="area_' + $imgid + '" class="tab-pane fade' + $tabdivClass + ' myTab panel panel-default"><div class="panel-heading">' + $title + '<a class="tooltipp" title="' + tooltipTitle + '" target="_blank" href="' + tooltipPath + '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
            tabcont += '<span id="area_' + $imgid + '_' + $id + '_' + value['dataset_id'] + '" data-whatever="Area Chart" class="showForm areachart glyphicon glyphicon-pencil edit"></span><span id="area_' + $imgid + '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
            tabcont += '</div>';
            tabcont += '<div class="panel-body">';
            tabcont += '<textarea class="form-control json-data" id="area_img_' + $imgid + '" name="area_img_' + $imgid + '">' + JSON.stringify(value) + '</textarea></div></div>';
            $('.graphical-area').append(tabcont);
            $.ajax({
              type: "GET",
              url: $pathForHTml2,
              beforeSend: function()
              {
                close_analytics_slide();
                $('#area_' + $imgid + ' .panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
              },
              success: function (result){
                $('.loading_img').remove();
               /* var markup = '<div class="devmode-wrapper">' +
                    '<a class="devmode" href="#" style=""> Code & Analytics <span id="areachart_' + $imgid + '" class="glyphicon glyphicon-link devmod"></span></a>' +
                    '</div>';
                var formUrl = '/mc_devmode/load/' + value['dataset_id'] + '/' + $id + '/' + 'areachart' + '/' + $imgid;*/
                $('#area_' + $imgid + ' .panel-body').append(result);
                setTimeout(function(){
                  window.HTMLWidgets.staticRender();
                  Drupal.attachBehaviors();
                }, 1000);
              }
            });
          }
        });
      }
    });

    /**
     * Addmore filter functionality
    */
    $('body').on('click', '.add-more', function(e) {
      e.preventDefault();
      var btnName = $( this ).attr('name');
      if (btnName == "area_addmore") {
        var next = $('#area_filter_count').val();
        next++;
        var getDom = $("#area_filter_sel1").html();
        var newAnd = '<div id="and_area_filter'+next+'" class="form-group form-inline andDiv">';
        var Andcont = '<span>And</span>';
        var newAndend = '</div>';
        var newfilterdiv = '<div id="area_filter'+next+'" class="form-group form-inline filterDiv">';
        var newarea_filter_sel = '<select class="form-control filterColoumSel" id="area_filter_sel'+next+'" name="area_filter_sel'+next+'">';
        newarea_filter_sel += getDom+'</select>';
        var newarea_filter_cond_sel = '<select class="form-control" id="area_filter_cond_sel'+next+'" name="area_filter_cond_sel'+next+'">';
        newarea_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
        var newIn = '<input type="text" class="form-control" id="area_filter_cond_val'+next+'" name="area_filter_cond_val'+next+'" placeholder="Value">';
        var newfilterdivEnd = '</div>';
        var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newarea_filter_sel+newarea_filter_cond_sel+newIn+newfilterdivEnd;
        var removebtn = '<input type="button" value="x" id="area_'+next+'" class="btn btn-danger remove-me" />';
        $( '#area_chart_form .filterDiv' ).last().after(complDiv);
        $( '#area_filter'+next ).append(removebtn);
        $('#area_filter_count').val(next);
      }
    });

    /**
     * Chart editing
    */
    $('body').on('click', '.areachart.edit', function() {

      ///area-patch
      $('#df1, #df2, #exTab1 .nav-tabs, #result-div, .op-area-note').hide();
      $('#3dScatterDiv-container, #BubblechartDiv-container, #linechartDiv-container, #histogramchartdiv-container, #txtclusterDiv-container').hide();
      $('#chart-edit-title').html('Edit Area Chart');
      $("#AreachartDiv-container, #chart-edit-title").show();
      $('.nav-tabs a[href="#chart-div"]').tab('show');
      // open_form_slide();
      var cek=$(this).attr('id');
      var editID = cek;
      var file_path;
      var splitID = editID.split("_");
      var chartType = splitID[0];
      var imgID = splitID[1];
      var reportID = splitID[2];
      var textJson = $('#area_img_' + imgID).val();
      var obj = jQuery.parseJSON(textJson);
      $.each(obj.data, function (key, value) {
        file_path = value['csv_path'];
      });
      $.ajax({
          url: Drupal.url('tm_areachart/add/form'),
          type: "POST",
          data: "file_path="+file_path,
          beforeSend: function()
          {
            $('#AreachartDiv').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
          },
          success: function (response) {
            $('.loading_img').remove();
            var $wrapper = $('#AreachartDiv');
            if(response.form_empty) {
              $wrapper.html(response.form_empty);
            }
            else {
              $wrapper.html(response.form_html);
              $('.selectpicker').selectpicker('refresh');
              $('form.sections_forms h3').hide();
              $('#edit_input').remove();
                $('.graphical-area').append('<input class="editInput" type="hidden" name="edit_input" id="edit_input" value="' + imgID + '">');
                $.each(obj.data, function (key, value) {  // The contents inside stars
                  $('#AreachartDiv #area_title').val(value['chart_title']);
                  var colNames = value['x_col'];
                  var singleColName = colNames.split(",");
                  $('#AreachartDiv #area_xaxis_col').selectpicker('val', singleColName);
                  $('#AreachartDiv #area_xtitle').val(value['x_title']);
                  if (value.filters != '') {
                    var filCount = 1;
                    $.each(value.filters, function (k, v) {
                      if (filCount > 1) {
                        var getDom = $("#AreachartDiv #area_filter_sel1").html();
                        var newfilterdiv = '<div id="area_filter' + filCount + '" class="form-group form-inline filterDiv">';
                        var newareachart_filter_sel = '<select class="form-control filterColoumSel" id="area_filter_sel' + filCount + '" name="area_filter_sel' + filCount + '">';
                        newareachart_filter_sel += getDom + '</select>';
                        var newareachart_filter_cond_sel = '<select class="form-control" id="area_filter_cond_sel' + filCount + '" name="area_filter_cond_sel' + filCount + '">';
                        newareachart_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
                        var newIn = '<input type="text" class="form-control" id="area_filter_cond_val' + filCount + '" name="area_filter_cond_val' + filCount + '" placeholder="Value">';
                        var newfilterdivEnd = '</div>';
                        var complDiv = newfilterdiv + newareachart_filter_sel + newareachart_filter_cond_sel + newIn + newfilterdivEnd;
                        var removebtn = '<input type="button" value="-" id="area_' + filCount + '" class="btn btn-danger remove-me" />';
                        $('#AreachartDiv #area_chart_form .filterDiv').last().after(complDiv);
                        $('#AreachartDiv #area_filter' + filCount).append(removebtn);
                        $('#AreachartDiv #area_filter_count').val(filCount);
                      }
                      $('#area_filter_sel' + filCount + ' option[value="' + v["colname"] + '"]').prop('selected', true);
                      var selectedValType = $('option:selected', '#area_filter_sel' + filCount).attr("data-type");
                      var optionString = '<option value="">--Select Operator--</option>';
                      if (selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor") {
                        optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
                      }
                      else if (selectedValType == "character") {
                        optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
                      }
                      $('#AreachartDiv #area_filter_cond_sel' + filCount).html(optionString);
                      $('#AreachartDiv #area_filter_cond_sel' + filCount).val(v["operator"]);
                      $('#AreachartDiv #area_filter_cond_val' + filCount).val(v['required_val']);
                      filCount++;
                    });
                  }
                });
              Drupal.attachBehaviors($wrapper[0]);
            }
            $("#areachartfile").val(file_path);
          }
        });

    });

    /**
     * Remove filter
    */
    $('#AreachartDiv, .op-spec-div').on('click', '.remove-me', function() {
      var rmvbtnID = $(this).attr('id');
      var splitres = rmvbtnID.split("_");
      if (splitres[0] == 'area' ) {
        $('#and_area_filter'+splitres[1]).remove();
        $('#area_filter'+splitres[1]).remove();
      }
    });

    function on_form_hide() {
      $('#AreachartDiv').find("input[type=text]").val("");
      $('#area_plot_form .filterDiv:not(:first)').remove();
      $('#edit_input').remove();
      ////m area patch
      $('.op-area-note').show();
      $('#exTab1 .nav-tabs, #chart-edit-title').hide();
    }
    
  });
})(jQuery);
