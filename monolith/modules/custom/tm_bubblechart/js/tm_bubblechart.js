(function ($) {
  $(document).ready(function() {
    $("body").on("click", '#charts_list_ul li a.bubbleplot', function(e) {
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
            var tooltipPath = '/wiki/bubble-chart';
            var tooltipTitle = "tooltip";
            var $imgid = splitID[2];
            var tabcont = '<div id="bubble_' + $imgid + '" class="tab-pane fade' + $tabdivClass + ' myTab panel panel-default"><div class="panel-heading">' + $title + '<a class="tooltipp" title="' + tooltipTitle + '" target="_blank" href="' + tooltipPath + '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
			tabcont += '<span id="bubblechart_' + $imgid + '_' + $id + '_' + value['dataset_id'] + '" data-whatever="Bubble Chart" class="showForm bubblechart glyphicon glyphicon-pencil edit"></span><span id="bubble_' + $imgid + '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
			tabcont += '</div>';
			tabcont += '<div class="panel-body">';
			tabcont += '<textarea class="form-control json-data" id="bubble_img_' + $imgid + '" name="bubble_img_' + $imgid + '">' + JSON.stringify(value) + '</textarea></div></div>';
            $('.graphical-area').append(tabcont);
            $.ajax({
                type: "GET",
                url: $pathForHTml2,
                beforeSend: function()
                {
                  $('#bubble_' + $imgid + ' .panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
                },
                success: function (result) {
                  $('.loading_img').remove();
                  var markup = '<div class="devmode-wrapper">' +
                      '<a class="devmode" href="#" style=""> Code & Analytics <span id="bubblechart_' + $imgid + '" class="glyphicon glyphicon-link devmod"></span></a>' +
                      '</div>';
                  var formUrl = '/mc_devmode/load/' + value['dataset_id'] + '/' + $id + '/' + 'bubblechart' + '/' + $imgid;
                  $('#bubble_' + $imgid + ' .panel-body').append(result);
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
    $('body').on('click', '.bubblechart', function() {
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
      if(chartType == "Bubble Chart") {
        $.ajax({
          url: Drupal.url('tm_bubblechart/add/form'),
          type: "POST",
          data: "file_path="+file_path,
          //contentType: "application/json; charset=utf-8",
          //dataType: "json",
          beforeSend: function()
          {
            $('#secForms .loadimg').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
          },
          success: function (response) {
            $('.loading_img').remove();
            var $wrapper = $('#secForms');
            if (response.form_empty) {
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
                var textJson = $('#bubble_img_' + imgID).val();
                var obj = jQuery.parseJSON(textJson);
                $.each(obj.data, function (key, value) {
                  $('#bubble_title').val(value['chart_title']);
                  $('#bubblechart_xaxis_col option[value="' + value["x_col"] + '"]').prop('selected', true);
                  $('#bubblechart_yaxis_col option[value="' + value["y_col"] + '"]').prop('selected', true);
                  $('#bubblechart_zaxis_col option[value="' + value["z_col"] + '"]').prop('selected', true);
                  $('#bubblechart_text_col option[value="' + value["text_col"] + '"]').prop('selected', true);
                  $('#bubble_color_col option[value="' + value["color_col"] + '"]').prop('selected', true);
                  $('#bubble_col option[value="' + value["bubble_col"] + '"]').prop('selected', true);
                  $('#bubble_size option[value="' + value["bubble_size"] + '"]').prop('selected', true);
                  $('#bubble_xtitle').val(value['x_title']);
                  $('#bubble_ytitle').val(value['y_title']);
                  $('#bubble_ztitle').val(value['z_title']);
                  if (value.filters != '') {
                    var filCount = 1;
                    $.each(value.filters, function (k, v) {
                      var extrafilterlength = $("#bubble_filter" + filCount).length;
                      if (filCount > 1 && extrafilterlength == 0) {
                        var getDom = $("#bubble_filter_sel1").html();
                        var newfilterdiv = '<div id="bubble_filter' + filCount + '" class="form-group form-inline filterDiv">';
                        var newbubblechart_filter_sel = '<select class="form-control filterColoumSel" id="bubble_filter_sel' + filCount + '" name="bubble_filter_sel' + filCount + '">';
                        newbubblechart_filter_sel += getDom + '</select>';
                        var newbubblechart_filter_cond_sel = '<select class="form-control" id="bubble_filter_cond_sel' + filCount + '" name="bubble_filter_cond_sel' + filCount + '">';
                        newbubblechart_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
                        var newIn = '<input type="text" class="form-control" id="bubble_filter_cond_val' + filCount + '" name="bubble_filter_cond_val' + filCount + '" placeholder="Value">';
                        var newfilterdivEnd = '</div>';
                        var complDiv = newfilterdiv + newbubblechart_filter_sel + newbubblechart_filter_cond_sel + newIn + newfilterdivEnd;
                        var removebtn = '<input type="button" value="-" id="bubble_' + filCount + '" class="btn btn-danger remove-me" />';
                        $('#bubble_chart_form .filterDiv').last().after(complDiv);
                        $('#bubble_filter' + filCount).append(removebtn);
                        $('#bubble_filter_count').val(filCount);
                        }
                        $('#bubble_filter_sel' + filCount + ' option[value="' + v["colname"] + '"]').prop('selected', true);
                        var selectedValType = $('option:selected', '#bubble_filter_sel' + filCount).attr("data-type");
                        var optionString = '<option value="">--Select Operator--</option>';
                        if (selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor" || selectedValType == "logical") {
                           optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
                        }
                        else if (selectedValType == "character") {
                          optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
                        }
                        $('#bubble_filter_cond_sel' + filCount).html(optionString);
                        $('#bubble_filter_cond_sel' + filCount).val(v["operator"]);
                        $('#bubble_filter_cond_val' + filCount).val(v['required_val']);
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
      }
    });
    /**
     * Bubble Chart Form Submit (SPS)
     */
    $('body').on('submit', 'form#bubble_chart_form', function(e) {
      e.preventDefault();
      var sketch_id = $(".node--type-sketch.node--view-mode-full").data('history-node-id');
      var dataid=$('#dataset_val option:selected').attr('data-id');
      var globalFilterJson = "";
      var csv_path = "";
      csv_path = $('#dataset_val option:selected').val();
      if (!csv_path || csv_path=="") {
        //alert("please select dataset");
        $("#dataset-modal").modal('show');
        $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
        $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
        $('body').removeClass("modal-open");
        $('body').css("padding-right","");
        return false;
      }
      var img_dir = $('#imgDir').val();
      var title = $('input[name="bubble_title"]').val();
      var previs= 0;
      $('#charts_list_ul li .bubbleplot').each(function() {  /**************to set charts display order***************/
        var vals = $(this).parents('li').attr('id').split('_');
            if(previs < vals[2]){
                previs = vals[2];
            }
      });
      var bubbleImgNum = previs;
      var edit_img = "";
      if (!bubbleImgNum || bubbleImgNum==0) {
        var bubbleImgNum = 1;
      }
      else {
        if ($('#edit_input').length != 0) {
          var bubbleImgNum = $('#edit_input').val();
          edit_img = "_ed";
        }
        else {
          bubbleImgNum++;
        }
      }
      var chart_title = $('input[name="bubble_title"]',this).val();
      var x_col 		= $('select[name="bubblechart_xaxis_col"]',this).val();
      var x_col_type 	= $('select[name="bubblechart_xaxis_col"]',this).find(':selected').attr('data-type');
      var y_col 		= $('select[name="bubblechart_yaxis_col"]',this).val();
      var y_col_type 	= $('select[name="bubblechart_yaxis_col"]',this).find(':selected').attr('data-type');
      var z_col 		= $('select[name="bubblechart_zaxis_col"]',this).val();
      var z_col_type 	= $('select[name="bubblechart_zaxis_col"]',this).find(':selected').attr('data-type');
      if (x_col == y_col || x_col == z_col || y_col == z_col) {
        //alert("Columns should not be same.");
        $("#not-same-col-modal").modal('show');
        $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
        $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
        $('body').removeClass("modal-open");
        $('body').css("padding-right","");
        return false;
      }
      var x_title 	= $('input[name="bubble_xtitle"]',this).val();
      var y_title 	= $('input[name="bubble_ytitle"]',this).val();
      var z_title 	= $('input[name="bubble_ztitle"]',this).val();
      var color_col 	= $('select[name="bubble_color_col"]',this).val();
      var color_col_type 	= $('select[name="bubble_color_col"]',this).find(':selected').attr('data-type');
      if (color_col == x_col || color_col == y_col || color_col == z_col) {
        //alert("Color column should be different from x, y and z columns.");
        $("#color-col-modal").modal('show');
        $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
        $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
        $('body').removeClass("modal-open");
        $('body').css("padding-right","");
        return false;
      }
      var bubble_size= $('select[name="bubble_size"]',this).val();
      var text_col 	= $('select[name="bubblechart_text_col"]',this).val();
      var text_col_type 	= $('select[name="bubblechart_text_col"]',this).find(':selected').attr('data-type');
      var bubble_col= $('select[name="bubble_col"]',this).val();
      var bubble_col_type= $('select[name="bubble_col"]',this).find(':selected').attr('data-type');
      var filersCount = $('input[name="bubble_filter_count"]',this).val();
      var filterJson = "";
      var imageName = 'bubbleplot_'+sketch_id+'_'+bubbleImgNum+edit_img+'.html';
      var img_name = img_dir+imageName;
      for (i = 1; i <= filersCount; i++) {
        if ($('#bubble_filter'+i).length == 0) {
          continue;
        }
        if ($.trim($('input[name="bubble_filter_cond_val'+i+'"]',this).val()) == "" ) {
          continue;
        }
        var colname 	= $('select[name="bubble_filter_sel'+i+'"]',this).val();
        var operator	= $('select[name="bubble_filter_cond_sel'+i+'"]',this).val();
        var required_val = $('input[name="bubble_filter_cond_val'+i+'"]',this).val();
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
      var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "y_col":"'+y_col+'", "z_col":"'+z_col+'", "x_col_type":"'+x_col_type+'", "y_col_type":"'+y_col_type+'", "z_col_type":"'+z_col_type+'", ';
      GlobaldataJson += '"x_title":"'+x_title+'", "y_title":"'+y_title+'", "z_title":"'+z_title+'", "color_col":"'+color_col+'", "color_col_type":"'+color_col_type+'", "text_col":"'+text_col+'", "text_col_type":"'+text_col_type+'", "bubble_col":"'+bubble_col+'", "bubble_col_type":"'+bubble_col_type+'", "bubble_size":"'+bubble_size+'", "filters":'+filterJsonwithGlobal+'}';
      var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "y_col":"'+y_col+'", "z_col":"'+z_col+'", "x_col_type":"'+x_col_type+'", "y_col_type":"'+y_col_type+'", "z_col_type":"'+z_col_type+'",';
      dataJson += '"x_title":"'+x_title+'", "y_title":"'+y_title+'", "z_title":"'+z_title+'", "color_col":"'+color_col+'", "color_col_type":"'+color_col_type+'", "text_col":"'+text_col+'", "text_col_type":"'+text_col_type+'", "bubble_col":"'+bubble_col+'", "bubble_col_type":"'+bubble_col_type+'", "bubble_size":"'+bubble_size+'", "filters":'+filterJson+'}';
	  chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=bubblechart";
      var tooltipTitle = 'Get Help';
      var tooltipPath = '/wiki/bubble-plot';
      var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="bubblechart_'+bubbleImgNum+'_'+sketch_id+'_'+dataid+'" data-whatever="Bubble Chart" class="showForm bubblechart glyphicon glyphicon-pencil edit"></span>';
      panelhead   += '<span id="bubble_'+bubbleImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
      var tabLi_a = title+'<i class="fa fa-arrows"></i>';
      if ($('#edit_input').length != 0) {
        $( '#bubble_'+bubbleImgNum+' div.panel-body').empty();
        $( '#bubble_'+bubbleImgNum+' div.panel-heading').html(panelhead);
        $( '#tabs ul li.active a').html(tabLi_a);
      }
      else {
        $( ".graphical-area div.tab-pane" ).removeClass( "in active" );
        $( "#tabs ul li" ).removeClass( "active" );
        var bubbleimgHTML = '<div id="bubble_'+bubbleImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
        bubbleimgHTML += '<div class="panel-body">';
        bubbleimgHTML += '</div></div>';
        $("#tabs ul").prepend('<li id="bubble_li_'+bubbleImgNum+'" class="active"><a data-toggle="tab" class="bubbleplot" href="#bubble_'+bubbleImgNum+'">'+tabLi_a+'</a></li>');
        $( ".graphical-area" ).append( bubbleimgHTML );
      }
      $.ajax({
        type: "POST",
        url: "/tm_bubblechart/process/data",
        data: chart_data,
        beforeSend: function() {
          close_analytics_slide();
          $(".sections_forms").hide(0, on_form_hide);
          $('#bubble_'+bubbleImgNum+' div.panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
          $(window).scrollTop(0);
        },
        success: function (result) {
          var chrtresult = result.chart_html;
          var splittedresult = chrtresult.split("|||");
          if (splittedresult[0] == '0') {
            $('.loading_img').remove();
            $('#bubble_'+bubbleImgNum+' div.panel-body').append(splittedresult[1]);
            $('#bubble_img_'+bubbleImgNum).removeClass( "json-data" );
            $('#bubble_img_'+bubbleImgNum).css( "display", "none" );
            var bubble_plot_comp_json = '{"ImgType": "bubbleplot", "ImgID": "bubble_img_'+bubbleImgNum+'", "ImgName": "'+imageName2+'","dataset_id": "'+dataid+'","save_chart": "No", "data":['+dataJson+']}';
            var textAreaJsonField = '<textarea class="form-control json-data" id="bubble_img_'+bubbleImgNum+'" name="bubble_img_'+bubbleImgNum+'">'+bubble_plot_comp_json+'</textarea>';
            $('#bubble_'+bubbleImgNum+' div.panel-body').append(textAreaJsonField);
            updateChartsData(bubble_plot_comp_json , 'bubble_img_'+bubbleImgNum );
            $('.nav-tabs a[href="#charts"]').tab('show');
            //$('#alertmsg').show();
            $('#save_report').addClass('alert-red');
          }
          else {
            $('.loading_img').remove();
            $('#bubble_' + bubbleImgNum + ' div.panel-body').html(result.chart_html);
            var bubble_plot_comp_json = '{"ImgType": "bubbleplot", "ImgID": "bubble_img_' + bubbleImgNum + '", "ImgName": "' + imageName2 + '","dataset_id": "'+dataid+'", "data":[' + dataJson + ']}';
            var textAreaJsonField = '<textarea class="form-control json-data" id="bubble_img_' + bubbleImgNum + '" name="bubble_img_' + bubbleImgNum + '">' + bubble_plot_comp_json + '</textarea>';
            $('#bubble_' + bubbleImgNum + ' div.panel-body').append(textAreaJsonField);
            updateChartsData(bubble_plot_comp_json , 'bubble_img_'+bubbleImgNum );
            $('.nav-tabs a[href="#charts"]').tab('show');
            //$('#alertmsg').show();
            $('#save_report').addClass('alert-red');
            setTimeout(function(){
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
      if(btnName == "bubble_addmore") {
        var next = $('#bubble_filter_count').val();
        next++;
        var getDom = $("#bubble_filter_sel1").html();
        var newAnd = '<div id="and_bubble_filter'+next+'" class="form-group form-inline andDiv">';
        var Andcont = '<span>And</span>';
        var newAndend = '</div>';
        var newfilterdiv = '<div id="bubble_filter'+next+'" class="form-group form-inline filterDiv">';
        var newbubble_filter_sel = '<select class="form-control filterColoumSel" id="bubble_filter_sel'+next+'" name="bubble_filter_sel'+next+'">';
            newbubble_filter_sel += getDom+'</select>';
        var newbubble_filter_cond_sel = '<select class="form-control" id="bubble_filter_cond_sel'+next+'" name="bubble_filter_cond_sel'+next+'">';
            newbubble_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
        var newIn = '<input type="text" class="form-control" id="bubble_filter_cond_val'+next+'" name="bubble_filter_cond_val'+next+'" placeholder="Value">';
        var newfilterdivEnd = '</div>';
        var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newbubble_filter_sel+newbubble_filter_cond_sel+newIn+newfilterdivEnd;
        var removebtn = '<input type="button" value="x" id="bubble_'+next+'" class="btn btn-danger remove-me" />';
        $( '#bubble_chart_form .filterDiv' ).last().after(complDiv);
        $( '#bubble_filter'+next ).append(removebtn);
        $('#bubble_filter_count').val(next);
      }
    });
   /**
     * (remFilter)
     */
    $('#secForms').on('click', '.remove-me', function() {
	  var rmvbtnID = $(this).attr('id');
	  var splitres = rmvbtnID.split("_");
	  if (splitres[0] == 'bubble' ) {
		$('#and_bubble_filter'+splitres[1]).remove();
		$('#bubble_filter'+splitres[1]).remove();
	  }
    });
    function on_form_hide() {
      $('#secForms').find("input[type=text]").val("");
      $('#bubble_plot_form .filterDiv:not(:first)').remove();
      $('#edit_input').remove();
    }
  });
})(jQuery);