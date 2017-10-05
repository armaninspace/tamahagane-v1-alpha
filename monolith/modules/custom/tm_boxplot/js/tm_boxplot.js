(function ($) {
  $(document).ready(function(){
    $("body").on("click", '#charts_list_ul li a.boxplot', function(e){
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
            var tooltipPath = '/wiki/box-plot';
            var tooltipTitle = "tooltip";
            var $imgid = splitID[2];
            var tabcont = '<div id="box_' + $imgid + '" class="tab-pane fade' + $tabdivClass + ' myTab panel panel-default"><div class="panel-heading">' + $title + '<a class="tooltipp" title="' + tooltipTitle + '" target="_blank" href="' + tooltipPath + '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
            tabcont += '<span id="boxplot_' + $imgid + '_' + $id + '_' + value['dataset_id'] + '" data-whatever="Boxplot" class="showForm boxplot glyphicon glyphicon-pencil edit"></span><span id="box_' + $imgid + '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
            tabcont += '</div>';
            tabcont += '<div class="panel-body">';
            tabcont += '<textarea class="form-control json-data" id="box_img_' + $imgid + '" name="box_img_' + $imgid + '">' + JSON.stringify(value) + '</textarea></div></div>';
            $('.graphical-area').append(tabcont);
            $.ajax({
              type: "GET",
              url: $pathForHTml2,
              beforeSend: function()
              {
				close_analytics_slide();
				$('#box_' + $imgid + ' .panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
              },
              success: function (result){
                $('.loading_img').remove();
                $('#box_' + $imgid + ' .panel-body').append(result);
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
    $('body').on('click', '.boxplot', function() {

      var chartType = $(this).data("whatever");
      if (chartType == "Boxplot") {
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
		if(file_path == ""){
		  //alert('Please select dataset');
          $("#dataset-modal").modal('show');
          $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
          $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
          $('body').removeClass("modal-open");
          $('body').css("padding-right","");
		  return false;
		}
        $.ajax({
          url: Drupal.url('tm_boxplot/add/form'),
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
                var textJson = $('#box_img_' + imgID).val();
                var obj = jQuery.parseJSON(textJson);
                $.each(obj.data, function (key, value) {  // The contents inside stars
				  $('#box_title').val(value['chart_title']);
                  $('#box_xaxis_col option[value="' + value["x_col"] + '"]').prop('selected', true);
                  $('#box_yaxis_col option[value="' + value["y_col"] + '"]').prop('selected', true);
                  $('#box_xtitle').val(value['x_title']);
                  $('#box_color_col option[value="' + value["color_col"] + '"]').prop('selected', true);
                  if (value.filters != '') {
					var filCount = 1;
					$.each(value.filters, function (k, v) {
					  if (filCount > 1) {
						var getDom = $("#box_filter_sel1").html();
						var newfilterdiv = '<div id="box_filter' + filCount + '" class="form-group form-inline filterDiv">';
						var newbox_filter_sel = '<select class="form-control filterColoumSel" id="box_filter_sel' + filCount + '" name="box_filter_sel' + filCount + '">';
						newbox_filter_sel += getDom + '</select>';
						var newbox_filter_cond_sel = '<select class="form-control" id="box_filter_cond_sel' + filCount + '" name="box_filter_cond_sel' + filCount + '">';
						newbox_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
						var newIn = '<input type="text" class="form-control" id="box_filter_cond_val' + filCount + '" name="box_filter_cond_val' + filCount + '" placeholder="Value">';
						var newfilterdivEnd = '</div>';
						var complDiv = newfilterdiv + newbox_filter_sel + newbox_filter_cond_sel + newIn + newfilterdivEnd;
						var removebtn = '<input type="button" value="-" id="box_' + filCount + '" class="btn btn-danger remove-me" />';
						$('#box_plot_form .filterDiv').last().after(complDiv);
						$('#box_filter' + filCount).append(removebtn);
						$('#box_filter_count').val(filCount);
					  }
					  $('#box_filter_sel' + filCount + ' option[value="' + v["colname"] + '"]').prop('selected', true);
					  var selectedValType = $('option:selected', '#box_filter_sel' + filCount).attr("data-type");
					  var optionString = '<option value="">--Select Operator--</option>';
					  if (selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor") {
						optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
					  }
					  else if (selectedValType == "character") {
						optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
					  }
					  $('#box_filter_cond_sel' + filCount).html(optionString);
					  $('#box_filter_cond_sel' + filCount).val(v["operator"]);
					  $('#box_filter_cond_val' + filCount).val(v['required_val']);
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
     * Box Plot Form Submit (BPS)
     */
    $('body').on('submit', 'form#box_plot_form', function(e) {
      e.preventDefault();
      var sketch_id = $(".node--type-sketch.node--view-mode-full").data('history-node-id');
      var globalFilterJson = "";
      var csv_path = "";
      var dataid=$('#dataset_val option:selected').attr('data-id');
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
      var title = $('input[name="box_title"]').val();
      var boxImgNum = $('#charts ul li .boxplot').length;
      var edit_img = "";
      if (!boxImgNum || boxImgNum==0) {
        var boxImgNum = 1;
      }
      else {
        if ($('#edit_input').length != 0) {
          var boxImgNum = $('#edit_input').val();
          edit_img = "_ed";
        }
        else {
          boxImgNum++;
        }
      }
      var chart_title = $('input[name="box_title"]',this).val();
      var x_col = $('select[name="box_xaxis_col"]',this).val();
      var x_col_type = $('select[name="box_xaxis_col"]',this).find(':selected').attr('data-type');
      var x_title = $('input[name="box_xtitle"]',this).val();
      var color_col = $('select[name="box_color_col"]',this).val();
      var color_col_type = $('select[name="box_color_col"]',this).find(':selected').attr('data-type');
      if (color_col == x_col) {
        //alert("Color column should be different from x, y and z columns.");
        $("#color-col-modal").modal('show');
        $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
        $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
        $('body').removeClass("modal-open");
        $('body').css("padding-right","");
        return false;
      }
      var filersCount = $('input[name="box_filter_count"]',this).val();
      var filterJson = "";
      var imageName = 'boxplot_'+sketch_id+'_'+boxImgNum+edit_img+'.html';
      var img_name = img_dir+imageName;
      for (i = 1; i <= filersCount; i++) {
        if ($('#box_filter'+i).length == 0) {
          continue;
        }
        if ($('input[name="box_filter_cond_val'+i+'"]',this).val() == "" ) {
          continue;
        }
        var colname = $('select[name="box_filter_sel'+i+'"]',this).val();
        var operator = $('select[name="box_filter_cond_sel'+i+'"]',this).val();
        var required_val = $('input[name="box_filter_cond_val'+i+'"]',this).val();
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
      var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "x_col_type":"'+x_col_type+'", ';
      GlobaldataJson += '"x_title":"'+x_title+'", "color_col":"'+color_col+'", "color_col_type":"'+color_col_type+'", "filters":'+filterJsonwithGlobal+'}';
      var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "x_col_type":"'+x_col_type+'", ';
      dataJson += '"x_title":"'+x_title+'", "color_col":"'+color_col+'", "color_col_type":"'+color_col_type+'", "filters":'+filterJson+'}';
      chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=boxplot";
      var tooltipTitle = 'Get Help';
      var tooltipPath = '/wiki/box-plot';
      var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="boxplot_'+boxImgNum+'_'+sketch_id+'_'+dataid+'" data-whatever="Boxplot" class="showForm boxplot glyphicon glyphicon-pencil edit"></span>';
      panelhead   += '<span id="box_'+boxImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
      var tabLi_a = title+'<i class="fa fa-arrows"></i>';
      if ($('#edit_input').length != 0) {
        $( '#box_'+boxImgNum+' div.panel-body').empty();
        $( '#box_'+boxImgNum+' div.panel-heading').html(panelhead);
        $( '#tabs ul li.active a').html(tabLi_a);
      }
      else {
        $( ".graphical-area div.tab-pane" ).removeClass( "in active" );
        $( "#tabs ul li" ).removeClass( "active" );
        var boximgHTML = '<div id="box_'+boxImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
        boximgHTML += '<div class="panel-body">';
        boximgHTML += '</div></div>';
        $("#tabs ul").prepend('<li id="box_li_'+boxImgNum+'" class="active"><a data-toggle="tab" class="boxplot" href="#box_'+boxImgNum+'">'+tabLi_a+'</a></li>');
        $( ".graphical-area" ).append( boximgHTML );
      }
      $.ajax({
        type: "POST",
        url: "/tm_boxplot/process/data",
        data: chart_data,
        beforeSend: function() {
          $(".sections_forms").hide(0, on_form_hide);
          $('#box_'+boxImgNum+' div.panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
          jQuery(window).scrollTop(0);
         close_analytics_slide();
        },
        success: function (result) {
          var chrtresult = result.chart_html;
          var splittedresult = chrtresult.split("|||");
          if (splittedresult[0] == '0') {
            $('.loading_img').remove();
            $('#box_'+boxImgNum+' div.panel-body').append(splittedresult[1]);
            $('#box__img_'+boxImgNum).removeClass( "json-data" );
            $('#box__img_'+boxImgNum).css( "display", "none" );
            var box_plot_comp_json = '{"ImgType": "box", "ImgID": "box_img_'+boxImgNum+'", "ImgName": "'+imageName2+'","dataset_id": "'+dataid+'", "save_chart": "No","data":['+dataJson+']}';
            var textAreaJsonField = '<textarea class="form-control json-data" id="box_img_'+boxImgNum+'" name="box_img_'+boxImgNum+'">'+box_plot_comp_json+'</textarea>';
            $('#box_'+boxImgNum+' div.panel-body').append(textAreaJsonField);
            updateChartsData(box_plot_comp_json , 'box_img_'+boxImgNum );
            $('.nav-tabs a[href="#charts"]').tab('show');
            //$('#alertmsg').show();
            $('#save_report').addClass('alert-red');
          }
          else {
            $('.loading_img').remove();
            $('#box_' + boxImgNum + ' div.panel-body').html(result.chart_html);
            var box_plot_comp_json = '{"ImgType": "boxplot", "ImgID": "box_img_' + boxImgNum + '", "ImgName": "' + imageName2 + '","dataset_id": "'+dataid+'", "data":[' + dataJson + ']}';
            var textAreaJsonField = '<textarea class="form-control json-data" id="box_img_' + boxImgNum + '" name="box_img_' + boxImgNum + '">' + box_plot_comp_json + '</textarea>';
            $('#box_' + boxImgNum + ' div.panel-body').append(textAreaJsonField);
            updateChartsData(box_plot_comp_json , 'box_img_'+boxImgNum );
            $('.nav-tabs a[href="#charts"]').tab('show');
            //$('#alertmsg').show();
            $('#save_report').addClass('alert-red');
            setTimeout(function(){
              window.HTMLWidgets.staticRender();
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
      if (btnName == "box_addmore") {
        var next = $('#box_filter_count').val();
        next++;
        var getDom = $("#box_filter_sel1").html();
        var newAnd = '<div id="and_box_filter'+next+'" class="form-group form-inline andDiv">';
        var Andcont = '<span>And</span>';
        var newAndend = '</div>';
        var newfilterdiv = '<div id="box_filter'+next+'" class="form-group form-inline filterDiv">';
        var newbox_filter_sel = '<select class="form-control filterColoumSel" id="box_filter_sel'+next+'" name="box_filter_sel'+next+'">';
        newbox_filter_sel += getDom+'</select>';
        var newbox_filter_cond_sel = '<select class="form-control" id="box_filter_cond_sel'+next+'" name="box_filter_cond_sel'+next+'">';
        newbox_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
        var newIn = '<input type="text" class="form-control" id="box_filter_cond_val'+next+'" name="box_filter_cond_val'+next+'" placeholder="Value">';
        var newfilterdivEnd = '</div>';
        var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newbox_filter_sel+newbox_filter_cond_sel+newIn+newfilterdivEnd;
        var removebtn = '<input type="button" value="x" id="box_'+next+'" class="btn btn-danger remove-me" />';
        $( '#box_plot_form .filterDiv' ).last().after(complDiv);
        $( '#box_filter'+next ).append(removebtn);
        $('#box_filter_count').val(next);
      }
    });
    /**
     * (Remove filter functionality)
     */
    $('#secForms').on('click', '.remove-me', function() {
      var rmvbtnID = $(this).attr('id');
      var splitres = rmvbtnID.split("_");
      if(splitres[0] == 'box' ){
        $('#and_box_filter'+splitres[1]).remove();
        $('#box_filter'+splitres[1]).remove();
      }
    });
    function on_form_hide() {
      $('#secForms').find("input[type=text]").val("");
      $('#box_plot_form .filterDiv:not(:first)').remove();
      $('#edit_input').remove();
    }
  });
})(jQuery);