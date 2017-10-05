(function ($) {
  $(document).ready(function(){
    /**
     * Area chart operator click
    */
    paper.on('cell:pointerclick', function (cellView, evt, x, y) {
      var opTypeVal = cellView.model.attributes.operatorType;
      if(opTypeVal == 'Cross Tabs') {
        $('.param_link, #paraFilePath, #dTreeDiv, #crosstabsDiv-container, #linechartDiv-container, #histogramchartdiv-container, #surfacechartdiv-container, #2dscatterDiv-container, #3dScatterDiv-container, #AreachartDiv-container, #PiechartDiv-container, #BubblechartDiv-container,#BoxplotDiv-container, #mutateAttrbs, #knnDiv, #SplitDiv, #predictDiv, #performanceDiv, #MappingDiv, #paraAttrName, #CatDiv, #OutputDiv, #SummarizeDiv, #filterDiv, #decisionTreeDiv, #joinDiv, #classifierDiv, #DistinctDiv, #sliceDiv, #SelectDiv, #SampleDiv, #GroupbyDiv').hide();
        $("#crosstabsDiv-container , .chart_link").show();
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
          url: Drupal.url('tm_crosstabs/add/form'),
          type: "POST",
          data: file,
          beforeSend: function() {
            $('#secForms .loadimg').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
          },
          success: function (response) {
            $('.loading_img').remove();
            $('#edit_input').remove();
            var $wrapper = $('#crosstabsDiv');
            $wrapper.html(response.form_html);
            $('.selectpicker').selectpicker('refresh');
          }
        });
      }
    });

    /**
     * Area chart operator form submit
    */
    $('body').on('submit', 'form#cross_tabs_form', function(e) {
      e.preventDefault();
      var container_id = $(this).parent().attr('id');
      var sketch_id = $(".node--type-sketch.node--view-mode-full").data('history-node-id');
      var dataid = $("#chartcellid").val();
      var globalFilterJson = "";
      var csv_path = "";
	  
      if (container_id == 'secForms') {
        csv_path = $("#crosstabsfile").val();
      } else {
        csv_path = $("#chartfile").val();
      }

      var img_dir = $('#imgDir').val();
      var title = $('input[name="cross_title"]').val();

      var previs= 0;
      $('#charts_list_ul li .crossplot').each(function() {
      var vals = $(this).parents('li').attr('id').split('_');
        if(previs < vals[2]){
          previs = vals[2];
        }
      });
      var crossImgNum = previs;
      var edit_img = "";
      if (!crossImgNum || crossImgNum==0) {
        var crossImgNum = 1;
      }
      else {
        if ($('#edit_input').length != 0) {
          var crossImgNum = $('#edit_input').val();
          edit_img = "_ed";
        }
        else {
          crossImgNum++;
        }
      }
      var chart_title = $('input[name="cross_title"]',this).val();
      var x_col 		= $('select[name="cross_xaxis_col"]',this).val();
      var x_col_type 	= $('select[name="cross_xaxis_col"]',this).find(':selected').attr('data-type');
      var y_col 		= $('select[name="cross_yaxis_col"]',this).val();
      var y_col_type 	= $('select[name="cross_yaxis_col"]',this).find(':selected').attr('data-type');
      if( (x_col_type == "numeric" && y_col_type == "numeric") ||
          (x_col_type == "integer" && y_col_type == "integer") ||
          (x_col_type == "numeric" && y_col_type == "integer") ||
          (x_col_type == "integer" && y_col_type == "numeric")) {
        //alert("Atleast one factor column required to proceed");
        $(this).focus();
        if ($('.op-spec-div .alert-danger').length == 0) {
          $(this).parent().prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Atleast one factor column required to proceed. </div>');
        }
        $('.tab-content').animate({ scrollTop: 0 }, 'slow');
        /*$("#factor-col-modal").modal('show');
        $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
        $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
        $('body').removeClass("modal-open");
        $('body').css("padding-right","");*/
        return false;
      }
      if(x_col == y_col) {
        //alert("Both columns should not be same.");
        $(this).focus();
        if ($('.op-spec-div .alert-danger').length == 0) {
          $(this).parent().prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Both columns should not be same. </div>');
        }
        $('.tab-content').animate({ scrollTop: 0 }, 'slow');
        /*$("#not-same-col-modal").modal('show');
        $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
        $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
        $('body').removeClass("modal-open");
        $('body').css("padding-right","");*/
        return false;
      }
      var filersCount = $('input[name="cross_filter_count"]',this).val();
      var filterJson = "";
      var imageName = 'cross_tabs_'+sketch_id+'_'+crossImgNum+edit_img+'.json';
      var img_name = img_dir+imageName;
      //patch
      var prnt = $(this).parent();
      //end patch
      for (i = 1; i <= filersCount; i++) {
        if($('#cross_filter'+i).length == 0) {
          continue;
        }
        if($('input[name="cross_filter_cond_val'+i+'"]',this).val() == "" ) {
          continue;
        }
        var colname 	= $('select[name="cross_filter_sel'+i+'"]',this).val();
        var operator	= $('select[name="cross_filter_cond_sel'+i+'"]',this).val();
        var required_val = $('input[name="cross_filter_cond_val'+i+'"]',this).val();
        if (colname == '' ||  operator == '') {
          //alert('Column name & operators are required to apply filter');
          $(this).focus();
          if ($('.op-spec-div .alert-danger').length == 0) {
            $(this).parent().prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Column name & operators are required to apply filter. </div>');
          }
          $('.tab-content').animate({ scrollTop: 0 }, 'slow');
          /*$("#col-op-modal").modal('show');
          $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
          $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
          $('body').removeClass("modal-open");
          $('body').css("padding-right","");*/
          return false;
        }
        filterJson += '{"colname":"'+colname+'", "operator":"'+operator+'", "required_val":"'+required_val+'"},';
      }
      filterJson = filterJson.replace(/,\s*$/, "");
      if(globalFilterJson == "" || globalFilterJson == null) {
        var filterJsonwithGlobal = filterJson;
      }
      else {
        var filterJsonwithGlobal = globalFilterJson+","+filterJson;
      }
      filterJsonwithGlobal = filterJsonwithGlobal.replace(/,\s*$/, "");
      var filterJsonwithGlobal = "["+filterJsonwithGlobal+"]";
      filterJson = "["+filterJson+"]";
      var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "x_col_type":"'+x_col_type+'", "y_col":"'+y_col+'", "y_col_type":"'+y_col_type+'",';
      GlobaldataJson += '"x_title":"NULL", "y_title":"NULL", "filters":'+filterJsonwithGlobal+'}';
      img_name = img_name.replace(".json", ".html");
      var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "x_col_type":"'+x_col_type+'", "y_col":"'+y_col+'", "y_col_type":"'+y_col_type+'",';
      dataJson += '"x_title":"NULL", "y_title":"NULL", "filters":'+filterJson+'}';
      chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=crosstabs";
      var tooltipTitle = 'Get Help';
      var tooltipPath = '/wiki/cross-tabs';
      var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="crosstabs_'+crossImgNum+'_'+sketch_id+'_'+dataid+'"  data-whatever="Cross Tabs" class="showForm crosstabs glyphicon glyphicon-pencil edit"></span>';
      panelhead   += '<span id="cross_'+crossImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
      var tabLi_a = title+'<i class="fa fa-arrows"></i>';
      if($('#edit_input').length != 0) {
        $( '#cross_'+crossImgNum+' div.panel-body').empty();
        $( '#cross_'+crossImgNum+' div.panel-heading').html(panelhead);
        $( '#tabs ul li.active a').html(tabLi_a);
      }
      else {
        //$( ".graphical-area div.tab-pane" ).removeClass( "in active" );
        //$( "#tabs ul li" ).removeClass( "active" );
        //var CrossimgHTML = '<div id="cross_'+crossImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
        //CrossimgHTML += '<div class="panel-body">';
        //CrossimgHTML += '</div></div>';
        $("#tabs ul").prepend('<li id="cross_li_'+crossImgNum+'" class=""><a data-toggle="tab" class="crossplot" href="#cross_'+crossImgNum+'">'+tabLi_a+'</a></li>');
        //$( ".graphical-area" ).append( CrossimgHTML );
      }
      $.ajax({
        type: "POST",
        url: "/tm_crosstabs/process/data",
        data: chart_data,
        beforeSend: function() {
          if (container_id == 'secForms') {
            $('#cross_'+crossImgNum+' div.panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');  
            close_analytics_slide();
            $(".sections_forms").hide(0, on_form_hide);
            $(window).scrollTop(0);
          }
          $(".classifier-modify").css('visibility','visible');
          //patch
          $('.alert-danger').remove();
          //end patch
        },
        success: function (result) {
          var chrtresult = result.chart_html;
          $(".classifier-modify").css('visibility', 'hidden');
          var splittedresult = chrtresult.split("|||");
          if (splittedresult[0] == '0') {
            //patch
            $(prnt).prepend(splittedresult[1]);
            $('.tab-content').animate({ scrollTop: 0 }, 'slow');
            //endpatch
            var cross_plot_comp_json = '{"ImgType": "crosstabs", "ImgID": "cross_img_'+crossImgNum+'", "ImgName": "'+imageName2+'", "dataset_id": "'+dataid+'","save_chart": "No","data":['+dataJson+']}';
            updateChartsData(cross_plot_comp_json , 'cross_img_'+crossImgNum );
            $("#chartsMsg-modal #msg").html('<h6>Chart not Generated</h6>');
            if (container_id == 'secForms') {
              $('.loading_img').remove();
              $('#cross_'+crossImgNum+' div.panel-body').append(splittedresult[1]);
              $('#cross_img_'+crossImgNum).removeClass( "json-data" );
              $('#cross_img_'+crossImgNum).css( "display", "none" );
              var textAreaJsonField = '<textarea class="form-control json-data" id="cross_img_'+crossImgNum+'" name="cross_img_'+crossImgNum+'">'+cross_plot_comp_json+'</textarea>';
              $('#cross_'+crossImgNum+' div.panel-body').append(textAreaJsonField);
              $('.nav-tabs a[href="#charts"]').tab('show');
            }
            else {
              $('#cross_li_'+crossImgNum).remove();
            }
            //$('#save_report').addClass('alert-red');
            $('#btn-save').addClass('alert-red');
          }
          else {
            var cross_plot_comp_json = '{"ImgType": "crosstabs", "ImgID": "cross_img_'+crossImgNum+'", "ImgName": "'+imageName2+'", "dataset_id": "'+dataid+'","data":['+dataJson+']}';
            updateChartsData(cross_plot_comp_json , 'cross_img_'+crossImgNum );
            $("#chartsMsg-modal #msg").html('<h6>Chart generated successfully and listed in charts area.</h6>');
            //$('#save_report').addClass('alert-red');
            $('#btn-save').addClass('alert-red');
            if (container_id == 'secForms') {
              $('.loading_img').remove();
              $('#cross_'+crossImgNum+' div.panel-body').html(result.chart_html);
              var textAreaJsonField = '<textarea class="form-control json-data" id="cross_img_'+crossImgNum+'" name="cross_img_'+crossImgNum+'">'+cross_plot_comp_json+'</textarea>';
              $('#cross_' + crossImgNum + ' div.panel-body').append(textAreaJsonField);
              $('.nav-tabs a[href="#charts"]').tab('show');
			  setTimeout(function(){
                window.HTMLWidgets.staticRender();
                Drupal.attachBehaviors();
              }, 1000);
            }
            else {
              //$('#parameter-area-modal').modal('hide');
              close_form_slide();
              $(this).find("input[type=text]").val("");
              $('#crosstabsDiv').empty();
              setTimeout(function () {
                $("#chartsMsg-modal").modal('show');
                setModalBackdrop();
              }, 1000);
            }
          }
        }
      });
      $("#chart-edit-modal").modal('hide');
      setTimeout(function(){

      }, 3000);
      if (imageName.includes("_ed")) {
        imageName2 = imageName.replace("_ed", "");
        imageName2 = imageName.replace("json", "html");
      }
      else {
        imageName2 = imageName;
        imageName2 = imageName.replace("json", "html");
      }
      return false;
    });

    /**
     * Area chart list click
    */
    $("body").on("click", '#charts_list_ul li a.crossplot', function(e) {
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
            var tooltipPath = '/wiki/cross-tabs';
            var tooltipTitle = "tooltip";
            var $imgid = splitID[2];
            var tabcont = '<div id="cross_' + $imgid + '" class="tab-pane fade' + $tabdivClass + ' myTab panel panel-default"><div class="panel-heading">' + $title + '<a class="tooltipp" title="' + tooltipTitle + '" target="_blank" href="' + tooltipPath + '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
            tabcont += '<span id="crosstabs_' + $imgid + '_' + $id + '_' + value['dataset_id'] + '" data-whatever="Cross Tabs" class="showForm crosstabs glyphicon glyphicon-pencil edit"></span><span id="cross_' + $imgid + '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
            tabcont += '</div>';
            tabcont += '<div class="panel-body">';
            tabcont += '<textarea class="form-control json-data" id="cross_img_' + $imgid + '" name="cross_img_' + $imgid + '">' + JSON.stringify(value) + '</textarea></div></div>';
            $('.graphical-area').append(tabcont);
            $.ajax({
              type: "GET",
              url: $pathForHTml2,
              beforeSend: function()
              {
                close_analytics_slide();
                $('#cross_' + $imgid + ' .panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
              },
              success: function (result){
                $('.loading_img').remove();
               /* var markup = '<div class="devmode-wrapper">' +
                    '<a class="devmode" href="#" style=""> Code & Analytics <span id="areachart_' + $imgid + '" class="glyphicon glyphicon-link devmod"></span></a>' +
                    '</div>';
                var formUrl = '/mc_devmode/load/' + value['dataset_id'] + '/' + $id + '/' + 'areachart' + '/' + $imgid;*/
                $('#cross_' + $imgid + ' .panel-body').append(result);
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
    $('body').on('click', '.op-spec-div .add-more', function(e) {
      e.preventDefault();
      var btnName = $( this ).attr('name');
      if(btnName == "cross_addmore") {
        var next = $('#cross_filter_count').val();
        next++;
        var getDom = $("#cross_filter_sel1").html();
        var newAnd = '<div id="and_cross_filter'+next+'" class="form-group form-inline andDiv">';
        var Andcont = '<span>And</span>';
        var newAndend = '</div>';
        var newfilterdiv = '<div id="cross_filter'+next+'" class="form-group form-inline filterDiv">';
        var newcross_filter_sel = '<select class="form-control filterColoumSel" id="cross_filter_sel'+next+'" name="cross_filter_sel'+next+'">';
        newcross_filter_sel += getDom+'</select>';
        var newcross_filter_cond_sel = '<select class="form-control" id="cross_filter_cond_sel'+next+'" name="cross_filter_cond_sel'+next+'">';
        newcross_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
        var newIn = '<input type="text" class="form-control" id="cross_filter_cond_val'+next+'" name="cross_filter_cond_val'+next+'" placeholder="Value">';
        var newfilterdivEnd = '</div>';
        var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newcross_filter_sel+newcross_filter_cond_sel+newIn+newfilterdivEnd;
        var removebtn = '<input type="button" value="x" id="crosstabs_'+next+'" class="btn btn-danger remove-me" />';
        $( '.op-spec-div #cross_tabs_form .filterDiv' ).last().after(complDiv);
        $( '#cross_filter'+next ).append(removebtn);
        $('#cross_filter_count').val(next);
      }
    });

    $('body').on('click', '#form-cont .add-more', function(e) {
      e.preventDefault();
      var btnName = $( this ).attr('name');
      if(btnName == "cross_addmore") {
        var next = $('#cross_filter_count').val();
        next++;
        var getDom = $("#cross_filter_sel1").html();
        var newAnd = '<div id="and_cross_filter'+next+'" class="form-group form-inline andDiv">';
        var Andcont = '<span>And</span>';
        var newAndend = '</div>';
        var newfilterdiv = '<div id="cross_filter'+next+'" class="form-group form-inline filterDiv">';
        var newcross_filter_sel = '<select class="form-control filterColoumSel" id="cross_filter_sel'+next+'" name="cross_filter_sel'+next+'">';
        newcross_filter_sel += getDom+'</select>';
        var newcross_filter_cond_sel = '<select class="form-control" id="cross_filter_cond_sel'+next+'" name="cross_filter_cond_sel'+next+'">';
        newcross_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
        var newIn = '<input type="text" class="form-control" id="cross_filter_cond_val'+next+'" name="cross_filter_cond_val'+next+'" placeholder="Value">';
        var newfilterdivEnd = '</div>';
        var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newcross_filter_sel+newcross_filter_cond_sel+newIn+newfilterdivEnd;
        var removebtn = '<input type="button" value="x" id="crosstabs_'+next+'" class="btn btn-danger remove-me" />';
        $( '#form-cont #cross_tabs_form .filterDiv' ).last().after(complDiv);
        $( '#cross_filter'+next ).append(removebtn);
        $('#cross_filter_count').val(next);
      }
    });

    /**
     * Chart editing
    */
    $('body').on('click', '.crosstabs.edit', function() {
      /*$("#chart-edit-modal").modal('show');
      $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
      $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
      $('body').removeClass("modal-open");
      $('body').css("padding-right","");*/
      open_form_slide();
      var cek=$(this).attr('id');
      var editID = cek;
      var file_path;
      var splitID = editID.split("_");
      var chartType = splitID[0];
      var imgID = splitID[1];
      var reportID = splitID[2];
      file_path = $("#chartfile").val();
      var textJson = $('#cross_img_' + imgID).val();
      var obj = jQuery.parseJSON(textJson);
      $.each(obj.data, function (key, value) {
        file_path = value['csv_path'];
      });
      /*if(file_path == ""){
        //$("#dataset-modal").modal('show');
        $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
        $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
        $('body').removeClass("modal-open");
        $('body').css("padding-right","");
        return false;
      }*/
        $.ajax({
          url: Drupal.url('tm_crosstabs/add/form'),
          type: "POST",
          data: "file_path="+file_path,
          beforeSend: function()
          {
            $('#secForms .loadimg').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
          },
          success: function (response) {
            $('.loading_img').remove();
            var $wrapper = $('#secForms');
            if(response.form_empty) {
              $wrapper.html(response.form_empty);
            }
            else {
              $wrapper.html(response.form_html);
              $('.selectpicker').selectpicker('refresh');
              $('#edit_input').remove();
                $('.graphical-area').append('<input class="editInput" type="hidden" name="edit_input" id="edit_input" value="' + imgID + '">');
                $.each(obj.data, function (key, value) {  // The contents inside stars
                  $('#secForms #cross_title').val(value['chart_title']);
                  $('#secForms #cross_xaxis_col option[value="'+value["x_col"]+'"]').prop('selected', true);
                  $('#secForms #cross_yaxis_col option[value="'+value["y_col"]+'"]').prop('selected', true);
                  if (value.filters != '') {
                    var filCount = 1;
                    $.each(value.filters, function (k, v) {
                      if (filCount > 1) {
                        var getDom = $("#secForms #cross_filter_sel1").html();
                        var newfilterdiv = '<div id="cross_filter'+filCount+'" class="form-group form-inline filterDiv">';
                        var newcross_filter_sel = '<select class="form-control filterColoumSel" id="cross_filter_sel'+filCount+'" name="cross_filter_sel'+filCount+'">';
                        newcross_filter_sel += getDom+'</select>';
                        var newcross_filter_cond_sel = '<select class="form-control" id="cross_filter_cond_sel'+filCount+'" name="cross_filter_cond_sel'+filCount+'">';
                        newcross_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
                        var newIn = '<input type="text" class="form-control" id="cross_filter_cond_val'+filCount+'" name="cross_filter_cond_val'+filCount+'" placeholder="Value">';
                        var newfilterdivEnd = '</div>';
                        var complDiv = newfilterdiv+newcross_filter_sel+newcross_filter_cond_sel+newIn+newfilterdivEnd;
                        var removebtn = '<input type="button" value="-" id="crosstabs_'+filCount+'" class="btn btn-danger remove-me" />';
                        $('#secForms #cross_tabs_form .filterDiv' ).last().after(complDiv);
                        $('#secForms #cross_filter'+filCount ).append(removebtn);
                        $('#secForms #cross_filter_count').val(filCount);
                      }
                      $('#secForms #cross_filter_sel'+filCount+' option[value="'+v["colname"]+'"]').prop('selected', true);
                      var selectedValType = $('option:selected', '#cross_filter_sel'+filCount).attr("data-type");
                      var optionString = '<option value="">--Select Operator--</option>';
                      if(selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor") {
                        optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
                      }
                      else if(selectedValType == "character"){
                        optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
                      }
                      $('#secForms #cross_filter_cond_sel'+filCount).html(optionString);
                      $('#secForms #cross_filter_cond_sel'+filCount).val(v["operator"]);
                      $('#secForms #cross_filter_cond_val'+filCount).val(v['required_val']);
                      filCount++;
                    });
                  }
                });
              Drupal.attachBehaviors($wrapper[0]);
            }
			$("#crosstabsfile").val(file_path);
          }
        });
        $('.nav-tabs a[href="#design"]').tab('show');
        //open_analytics_slide();
    });

    /**
     * Remove filter
    */
    $('#secForms').on('click', '.remove-me', function() {
      var rmvbtnID = $(this).attr('id');
      var splitres = rmvbtnID.split("_");
      if(splitres[0] == 'crosstabs' ) {
        $('#and_cross_filter'+splitres[1]).remove();
        $('#cross_filter'+splitres[1]).remove();
      }
    });
    $('body').on('click', '.sections_forms .remove-me', function() {
      var rmvbtnID1 = $(this).attr('id');
      var splitres1 = rmvbtnID1.split("_");
      if(splitres1[0] == 'crosstabs' ) {
        $('#and_cross_filter'+splitres1[1]).remove();
        $('#cross_filter'+splitres1[1]).remove();
      }
    });

    function on_form_hide() {
      $('#crosstabsDiv').find("input[type=text]").val("");
      $('#cross_tabs_form .filterDiv:not(:first)').remove();
      $('#edit_input').remove();
    }
  });
})(jQuery);
