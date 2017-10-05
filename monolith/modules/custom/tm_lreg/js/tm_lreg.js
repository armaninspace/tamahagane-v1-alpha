(function ($) {
  $(document).ready(function(){
    $("body").on("click", '#charts_list_ul li a.lregplot', function(e){
      var id = $(this).parent().attr('id');
      var splitID = id.split("_");
      var img_id = splitID[0] + '_img_' + splitID[2];
      var divid = splitID[0] + '_' + splitID[2];
      var already = "";
      $('.graphical-area .tab-pane').each(function () {
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
            var tooltipPath = '/wiki/lreg-chart';
            var tooltipTitle = "tooltip";
            var $imgid = splitID[2];
            var tabcont = '<div id="lreg_' + $imgid + '" class="tab-pane fade' + $tabdivClass + ' myTab panel panel-default"><div class="panel-heading">' + $title + '<a class="tooltipp" title="' + tooltipTitle + '" target="_blank" href="' + tooltipPath + '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
            tabcont += '<span id="lreg_' + $imgid + '_' + $id + '_' + value['dataset_id'] + '" data-whatever="lreg" class="showForm lregchart glyphicon glyphicon-pencil edit"></span><span id="lreg_' + $imgid + '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
            tabcont += '</div>';
            tabcont += '<div class="panel-body">';
            tabcont += '<textarea class="form-control json-data" id="lreg_img_' + $imgid + '" name="lreg_img_' + $imgid + '">' + JSON.stringify(value) + '</textarea></div></div>';
            $('.graphical-area').append(tabcont);
            $.ajax({
              type: "GET",
              url: $pathForHTml2,
              beforeSend: function()
              {
                close_analytics_slide();
                $('#lreg_' + $imgid + ' .panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
              },
              success: function (result) {
                $('.loading_img').remove();
                var markup = '<div class="devmode-wrapper">' +
                  '<a class="devmode" href="#" style=""> Code & Analytics <span id="lregchart_' + $imgid + '" class="glyphicon glyphicon-link devmod"></span></a>' +
                  '</div>';
                var formUrl = '/mc_devmode/load/' + value['dataset_id'] + '/' + $id + '/' + 'lregchart' + '/' + $imgid;
                $('#lreg_' + $imgid + ' .panel-body').append(result);
                setTimeout(function() {
                  window.HTMLWidgets.staticRender();
                  Drupal.attachBehaviors();
                }, 1000);
                setTimeout(function() {
                  window.HTMLWidgets.staticRender();
                  Drupal.attachBehaviors();
                }, 1000);
                setTimeout(function(){
                  window.HTMLWidgets.staticRender();
                  Drupal.attachBehaviors();
                }, 1000);
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
    $('body').on('click', '.lregchart', function() {
      var chartType = $(this).data("whatever");
      if($(this).hasClass('edit')) {
        var cek=$(this).attr('id');
        var splitID = cek.split("_");
        var nid = splitID[3];
        $('#dataset_val option[data-id="'+splitID[3]+'"]').prop('selected', true);
        $('#dataset_val').attr('disabled', 'disabled');
          var file_path = $('#dataset_val option:selected').val();
          if (file_path == "") {
              //alert('Error!! related dataset not found');
            $("#error-modal").modal('show');
            $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
            $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
            $('body').removeClass("modal-open");
            $('body').css("padding-right","");
            return false;
          }
      }
      var file_path = $('#dataset_val option:selected').val();
      if(file_path == "") {
        //alert('please select dataset');
        $("#dataset-modal").modal('show');
        $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
        $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
        $('body').removeClass("modal-open");
        $('body').css("padding-right","");
        return false;
      }
      if(chartType == "lreg") {
        $.ajax({
          url: Drupal.url('tm_lreg/add/form'),
          type: "POST",
          data: "file_path="+file_path,
         // contentType: "application/json; charset=utf-8",
          //dataType: "json",
          beforeSend: function()
          {
            $('#secForms .loadimg').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
          },
          success: function (response) {
            $('.loading_img').remove();
            var $wrapper = $('#secForms');
            if(response.form_empty){
              $wrapper.html(response.form_empty);
            }
            else {
              $wrapper.html(response.form_html);
              $('.selectpicker').selectpicker('refresh');
              $('#edit_input').remove();
              if (cek) {
                var editID = cek;
                var splitID = editID.split("_");
                var chartType = splitID[0];
                var imgID = splitID[1];
                var reportID = splitID[2];
                $('.graphical-area').append('<input class="editInput" type="hidden" name="edit_input" id="edit_input" value="' + imgID + '">');
                var textJson = $('#lreg_img_' + imgID).val();
                var obj = jQuery.parseJSON(textJson);
                $.each(obj.data, function (key, value) {  // The contents inside stars
                  $('#lreg_title').val(value['chart_title']);
                  var colNames = value['predictors'];
                  var singleColName = colNames.split(",");
                  $('#lreg_predictors_col').selectpicker('val', singleColName);
                  $('#lreg_xtitle').val(value['x_title']);
                  $('#lreg_outcome_col option[value="' + value["outcome"] + '"]').prop('selected', true);
                  if (value.filters != '') {
                    var filCount = 1;
                    $.each(value.filters, function (k, v) {
                      if (filCount > 1) {
                        var getDom = $("#lreg_filter_sel1").html();
                        var newfilterdiv = '<div id="lreg_filter' + filCount + '" class="form-group form-inline filterDiv">';
                        var newlregchart_filter_sel = '<select class="form-control filterColoumSel" id="lreg_filter_sel' + filCount + '" name="lreg_filter_sel' + filCount + '">';
                        newlregchart_filter_sel += getDom + '</select>';
                        var newlregchart_filter_cond_sel = '<select class="form-control" id="lreg_filter_cond_sel' + filCount + '" name="lreg_filter_cond_sel' + filCount + '">';
                        newlregchart_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
                        var newIn = '<input type="text" class="form-control" id="lreg_filter_cond_val' + filCount + '" name="lreg_filter_cond_val' + filCount + '" placeholder="Value">';
                        var newfilterdivEnd = '</div>';
                        var complDiv = newfilterdiv + newlregchart_filter_sel + newlregchart_filter_cond_sel + newIn + newfilterdivEnd;
                        var removebtn = '<input type="button" value="-" id="lreg_' + filCount + '" class="btn btn-danger remove-me" />';
                        $('#lreg_chart_form .filterDiv').last().after(complDiv);
                        $('#lreg_filter' + filCount).append(removebtn);
                        $('#lreg_filter_count').val(filCount);
                      }
                      $('#lreg_filter_sel' + filCount + ' option[value="' + v["colname"] + '"]').prop('selected', true);
                      var selectedValType = $('option:selected', '#lreg_filter_sel' + filCount).attr("data-type");
                      var optionString = '<option value="">--Select Operator--</option>';
                      if (selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor") {
                        optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
                      }
                      else if (selectedValType == "character") {
                        optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
                      }
                      $('#lreg_filter_cond_sel' + filCount).html(optionString);
                      $('#lreg_filter_cond_sel' + filCount).val(v["operator"]);
                      $('#lreg_filter_cond_val' + filCount).val(v['required_val']);
                      filCount++;
                    });
                  }
                });
              }
              Drupal.attachBehaviors($wrapper[0]);
            }
          }
        });
        $('.nav-tabs a[href="#design"]').tab('show');
        open_analytics_slide();
      } //end if
    });
    /**
     * Scatter plot matrix Form Submit (SPS)
     */
    $('body').on('submit', 'form#lreg_chart_form', function(e) {
      e.preventDefault();
      var sketch_id = $(".node--type-sketch.node--view-mode-full").data('history-node-id');
      var dataid=$('#dataset_val option:selected').attr('data-id');
      var globalFilterJson = "";
      var csv_path = "";
      csv_path = $('#dataset_val option:selected').val();
      if (!csv_path || csv_path=="") {
        //alert("Please select dataset");
        $("#dataset-modal").modal('show');
        $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
        $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
        $('body').removeClass("modal-open");
        $('body').css("padding-right","");
        return false;
      }
      var img_dir = $('#imgDir').val();
      var title = $('input[name="lreg_title"]').val();
      var previs= 0;
      $('#charts_list_ul li .lregplot').each(function() {  /**************to set charts display order***************/
        var vals = $(this).parents('li').attr('id').split('_');
            if (previs < vals[2]) {
                previs = vals[2];
            }
      });
      var lregImgNum = previs.length;
      var edit_img = "";
      if (!lregImgNum || lregImgNum==0) {
        var lregImgNum = 1;
      }
      else {
        if ($('#edit_input').length != 0) {
          var lregImgNum = $('#edit_input').val();
          edit_img = "_ed";
        }
        else {
          lregImgNum++;
        }
      }
      var error = 'false';
      var chart_title = $('input[name="lreg_title"]',this).val();
      var predictors 		= $('select[name="lreg_predictors_col"]',this).val();
      var outcome = $('select[name="lreg_outcome_col"]',this).val();
      $('#lreg_predictors_col option:selected').each(function(){
          if ($(this).val() == outcome) {
                error = 'true';
            }
      });
      if (error == 'true') {
        //alert('Both column should not be same.');
        $("#not-same-col-modal").modal('show');
        $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
        $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
        $('body').removeClass("modal-open");
        $('body').css("padding-right","");
        return false;
      }

      var predictors_cols_types = "";
      $('#lreg_predictors_col option:selected').each(function(){
        predictors_cols_types +=$(this).attr('data-type')+",";
      });
      predictors_cols_types = predictors_cols_types.replace(/,\s*$/, "");
      var outcome_type = $('select[name="lreg_outcome_col"]',this).find(':selected').attr('data-type');
      var x_title 		= $('input[name="lreg_xtitle"]',this).val();
      var filersCount = $('input[name="lreg_filter_count"]',this).val();
      var filterJson = "";
      var imageName = 'lregplot_'+sketch_id+'_'+lregImgNum+edit_img+'.html';
      var imageName1 = 'lregplot_'+sketch_id+'_'+lregImgNum+'_1.html';
      var imageName2 = 'lregplot_'+sketch_id+'_'+lregImgNum+'_2.html';
      var imageName3 = 'lregplot_'+sketch_id+'_'+lregImgNum+'_3.html';
      var imageName4 = 'lregplot_'+sketch_id+'_'+lregImgNum+'_4.html';
      var img_name = img_dir+imageName;
      var img_name1 = img_dir+imageName1;
      var img_name2 = img_dir+imageName2;
      var img_name3 = img_dir+imageName3;
      var img_name4 = img_dir+imageName4;

      for (i = 1; i <= filersCount; i++) {
        if ($('#lreg_filter'+i).length == 0) {
          continue;
        }
        if ($.trim($('input[name="lreg_filter_cond_val'+i+'"]',this).val()) == "" ) {
          continue;
        }
        var colname = $('select[name="lreg_filter_sel'+i+'"]',this).val();
        var operator = $('select[name="lreg_filter_cond_sel'+i+'"]',this).val();
        var required_val = $('input[name="lreg_filter_cond_val'+i+'"]',this).val();
        if (colname == '' ||  operator == '') {
          //alert('Column name & operators are required to apply filter');
          $("#col-op-modal").modal('show');
          $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
          $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
          $('body').removeClass("modal-open");
          $('body').css("padding-right","");
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
      var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "plot_path1":"'+img_name1+'", "plot_path2":"'+img_name2+'", "plot_path3":"'+img_name3+'", "plot_path4":"'+img_name4+'", "chart_title":"'+chart_title+'", "predictors":"'+predictors+'", "predictors_cols_types":"'+predictors_cols_types+'",';
      GlobaldataJson += '"outcome":"'+outcome+'", "outcome_type":"'+outcome_type+'", "x_title":"'+x_title+'", "filters":'+filterJsonwithGlobal+'}';
      var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "predictors":"'+predictors+'", "predictors_cols_types":"'+predictors_cols_types+'", ';
      dataJson += '"outcome":"'+outcome+'", "outcome_type":"'+outcome_type+'", "x_title":"'+x_title+'", "filters":'+filterJson+'}';
      chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=lregchart";
      var tooltipTitle = 'Get Help';
      var tooltipPath = '/wiki/lreg-plot';
      var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="lreg_'+lregImgNum+'_'+sketch_id+'_'+dataid+'" data-whatever="lreg" class="showForm lregchart glyphicon glyphicon-pencil edit"></span>';
      panelhead   += '<span id="lreg_'+lregImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
      var tabLi_a = title+'<i class="fa fa-arrows"></i>';
      if ($('#edit_input').length != 0) {
        $( '#lreg_'+lregImgNum+' div.panel-body').empty();
        $( '#lreg_'+lregImgNum+' div.panel-heading').html(panelhead);
        $( '#tabs ul li.active a').html(tabLi_a);
      }
      else {
        $( ".graphical-area div.tab-pane" ).removeClass( "in active" );
        $( "#tabs ul li" ).removeClass( "active" );
        var lregimgHTML = '<div id="lreg_'+lregImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
        lregimgHTML += '<div class="panel-body">';
        lregimgHTML += '</div></div>';
        $("#tabs ul").prepend('<li id="lreg_li_'+lregImgNum+'" class="active"><a data-toggle="tab" class="lregplot" href="#lreg_'+lregImgNum+'">'+tabLi_a+'</a></li>');
        $( ".graphical-area" ).append( lregimgHTML );
      }
      $.ajax({
        type: "POST",
        url: "/tm_lreg/process/data",
        data: chart_data,
        beforeSend: function() {
          $(".sections_forms").hide(0, on_form_hide);
          $('#lreg_'+lregImgNum+' div.panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
          $(window).scrollTop(0);
         close_analytics_slide();
        },
        success: function (result) {
          var chrtresult = result.chart_html;
          var splittedresult = chrtresult.split("|||");
          if (splittedresult[0] == '0') {
            $('.loading_img').remove();
            $('#lreg_'+lregImgNum+' div.panel-body').append(splittedresult[1]);
            $('#lreg_img_'+lregImgNum).removeClass( "json-data" );
            $('#lreg_img_'+lregImgNum).css( "display", "none" );
            var lreg_plot_comp_json = '{"ImgType": "lregplot", "ImgID": "lreg_img_'+lregImgNum+'", "ImgName": "'+imageName2+'","dataset_id": "'+dataid+'","save_chart": "No", "data":['+dataJson+']}';
            var textlregJsonField = '<textarea class="form-control json-data" id="lreg_img_'+lregImgNum+'" name="lreg_img_'+lregImgNum+'">'+lreg_plot_comp_json+'</textarea>';
            $('#lreg_'+lregImgNum+' div.panel-body').append(textlregJsonField);
            updateChartsData(lreg_plot_comp_json , 'lreg_img_'+lregImgNum );
            $('.nav-tabs a[href="#charts"]').tab('show');
            //$('#alertmsg').show();
            $('#save_report').addClass('alert-red');
          }
          else {
            $('.loading_img').remove();
            $('#lreg_' + lregImgNum + ' div.panel-body').html(result.chart_html);
            var lreg_plot_comp_json = '{"ImgType": "lregplot", "ImgID": "lreg_img_' + lregImgNum + '", "ImgName": "' + imageName2 + '","dataset_id": "' +dataid+'", "data":[' + dataJson + ']}';
            var textlregJsonField = '<textarea class="form-control json-data" id="lreg_img_' + lregImgNum + '" name="lreg_img_' + lregImgNum + '">' + lreg_plot_comp_json + '</textarea>';
            $('#lreg_' + lregImgNum + ' div.panel-body').append(textlregJsonField);
            updateChartsData(lreg_plot_comp_json , 'lreg_img_'+lregImgNum );
            $('.nav-tabs a[href="#charts"]').tab('show');
            //$('#alertmsg').show();
            $('#save_report').addClass('alert-red');
            setTimeout(function() {
              window.HTMLWidgets.staticRender();              
              Drupal.attachBehaviors();
            }, 1000);
            setTimeout(function() {
              window.HTMLWidgets.staticRender();              
              Drupal.attachBehaviors();
            }, 1000);
            setTimeout(function() {
              window.HTMLWidgets.staticRender();              
              Drupal.attachBehaviors();
            }, 1000);
            setTimeout(function() {
              window.HTMLWidgets.staticRender();              
              Drupal.attachBehaviors();
            }, 1000);

          }
        }
      });
      setTimeout(function(){

      }, 3000);
      if (imageName.includes("_ed")) {
        imageName2 = imageName.replace("_ed", "");
      }
      else {
        imageName2 = imageName;
      }
      $(this).find("input[type=text]").val("");
      return false;
    });
    /**
     * Addmore filter functionality
     */
    $('body').on('click', '.add-more', function(e) {
      e.preventDefault();
      var btnName = $( this ).attr('name');
      if (btnName == "lreg_addmore") {
        var next = $('#lreg_filter_count').val();
        next++;
        var getDom = $("#lreg_filter_sel1").html();
        var newAnd = '<div id="and_lreg_filter'+next+'" class="form-group form-inline andDiv">';
        var Andcont = '<span>And</span>';
        var newAndend = '</div>';
        var newfilterdiv = '<div id="lreg_filter'+next+'" class="form-group form-inline filterDiv">';
        var newlreg_filter_sel = '<select class="form-control filterColoumSel" id="lreg_filter_sel'+next+'" name="lreg_filter_sel'+next+'">';
        newlreg_filter_sel += getDom+'</select>';
        var newlreg_filter_cond_sel = '<select class="form-control" id="lreg_filter_cond_sel'+next+'" name="lreg_filter_cond_sel'+next+'">';
        newlreg_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
        var newIn = '<input type="text" class="form-control" id="lreg_filter_cond_val'+next+'" name="lreg_filter_cond_val'+next+'" placeholder="Value">';
        var newfilterdivEnd = '</div>';
        var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newlreg_filter_sel+newlreg_filter_cond_sel+newIn+newfilterdivEnd;
        var removebtn = '<input type="button" value="x" id="lreg_'+next+'" class="btn btn-danger remove-me" />';
        $( '#lreg_chart_form .filterDiv' ).last().after(complDiv);
        $( '#lreg_filter'+next ).append(removebtn);
        $('#lreg_filter_count').val(next);
      }
    });
    /**
     * (remFilter)
     */
    $('#secForms').on('click', '.remove-me', function() {
      var rmvbtnID = $(this).attr('id');
      var splitres = rmvbtnID.split("_");
      if (splitres[0] == 'lreg' ) {
        $('#and_lreg_filter'+splitres[1]).remove();
        $('#lreg_filter'+splitres[1]).remove();
      }
    });
    function on_form_hide() {
      $('#secForms').find("input[type=text]").val("");
      $('#lreg_plot_form .filterDiv:not(:first)').remove();
      $('#edit_input').remove();
    }
  });
})(jQuery);