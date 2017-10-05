(function ($) {
  $(document).ready(function() {
    $("body").on("click", '#charts_list_ul li a.dtree', function(e) {
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
            var tooltipPath = '/wiki/dtree-plot';
            var tooltipTitle = "tooltip";
            var $imgid = splitID[2];
            var tabcont = '<div id="dt_' + $imgid + '" class="tab-pane fade' + $tabdivClass + ' myTab panel panel-default"><div class="panel-heading">' + $title + '<a class="tooltipp" title="' + tooltipTitle + '" target="_blank" href="' + tooltipPath + '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
            tabcont += '<span id="dtree_' + $imgid + '_' + $id + '_' + value['dataset_id'] + '" data-whatever="dtree" class="showForm dtree glyphicon glyphicon-pencil edit"></span><span id="dt_' + $imgid + '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
            tabcont += '</div>';
            tabcont += '<div class="panel-body">';
            tabcont += '<div class="panel-body"><img src="/sites/default/files/projectChartImages/'+ imgname + '">';
            tabcont += '<textarea class="form-control json-data" id="dt_img_' + $imgid + '" name="dt_img_' + $imgid + '">' + JSON.stringify(value) + '</textarea></div></div>';
            $('.graphical-area').append(tabcont);
          }
        });
      }
    });
    $('body').on('click', '.dtree', function() {
	  var chartType = $(this).data("whatever");
	  if (chartType == "dtree") {
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
		  //alert('Please select dataset');
          $("#dataset-modal").modal('show');
          $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
          $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
          $('body').removeClass("modal-open");
          $('body').css("padding-right","");
		  return false;
		}
		$.ajax({
		  url: Drupal.url('tm_dtree/add/form'),
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
                var textJson = $('#dt_img_' + imgID).val();
                var obj = jQuery.parseJSON(textJson);
                $.each(obj.data, function (key, value) {  // The contents inside stars
                  $('#dt_title').val(value['chart_title']);
                  var colNames = value['predictors'];
                  var singleColName = colNames.split(",");
                  $('#dt_pred_col').selectpicker('val', singleColName);
                  $('#dt_outcome_col option[value="' + value["outcome"] + '"]').prop('selected', true);
                  if (value.filters != '') {
					var filCount = 1;
					$.each(value.filters, function (k, v) {
					  if (filCount > 1) {
						var getDom = $("#dt_filter_sel1").html();
						var newfilterdiv = '<div id="dt_filter' + filCount + '" class="form-group form-inline filterDiv">';
						var newdt_filter_sel = '<select class="form-control filterColoumSel" id="dt_filter_sel' + filCount + '" name="dt_filter_sel' + filCount + '">';
						newdt_filter_sel += getDom + '</select>';
						var newdt_filter_cond_sel = '<select class="form-control" id="dt_filter_cond_sel' + filCount + '" name="dt_filter_cond_sel' + filCount + '">';
						newdt_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
						var newIn = '<input type="text" class="form-control" id="dt_filter_cond_val' + filCount + '" name="dt_filter_cond_val' + filCount + '" placeholder="Value">';
						var newfilterdivEnd = '</div>';
						var complDiv = newfilterdiv + newdt_filter_sel + newdt_filter_cond_sel + newIn + newfilterdivEnd;
						var removebtn = '<input type="button" value="-" id="dt_' + filCount + '" class="btn btn-danger remove-me" />';
						$('#dtree_form .filterDiv').last().after(complDiv);
						$('#dt_filter' + filCount).append(removebtn);
						$('#dt_filter_count').val(filCount);
					  }
					  $('#dt_filter_sel' + filCount + ' option[value="' + v["colname"] + '"]').prop('selected', true);
					  var selectedValType = $('option:selected', '#dt_filter_sel' + filCount).attr("data-type");
					  var optionString = '<option value="">--Select Operator--</option>';
					  if (selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor") {
						optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
					  }
					  else if (selectedValType == "character") {
						optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
					  }
					  $('#dt_filter_cond_sel' + filCount).html(optionString);
					  $('#dt_filter_cond_sel' + filCount).val(v["operator"]);
					  $('#dt_filter_cond_val' + filCount).val(v['required_val']);
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
     * dtree Form Submit (BPS)
    */
    $('body').on('submit', 'form#dtree_form', function(e) {
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
      var title = $('input[name="dt_title"]').val();
      var previs= 0;
      $('#charts_list_ul li .dtree').each(function() {  /**************to set charts display order***************/
        var vals = $(this).parents('li').attr('id').split('_');
            if(previs < vals[2]){
                previs = vals[2];
            }
      });
      var dtreeImgNum = previs;
      var edit_img = "";
      if (!dtreeImgNum || dtreeImgNum==0) {
        var dtreeImgNum = 1;
      }
      else {
        if ($('#edit_input').length != 0) {
          var dtreeImgNum = $('#edit_input').val();
          edit_img = "_ed";
        }
        else {
          dtreeImgNum++;
        }
      }
      var chart_title = $('input[name="dt_title"]',this).val();
      var outcome = $('select[name="dt_outcome_col"]',this).val();
      var outcome_type = $('select[name="dt_outcome_col"]',this).find(':selected').attr('data-type');
      var predictors = $('select[name="dt_pred_col"]',this).val();
      var col_types = "";
      var error = 'false';
      var count = $("#dt_pred_col :selected").length;
      //alert(count);
      if (count <= 4) {

      }
      else {
        //alert("You can't select more than 4 inputs");
        $("#inputs-modal2").modal('show');
        $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
        $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
        $('body').removeClass("modal-open");
        $('body').css("padding-right","");
        return false;
      }
      $('#dt_pred_col option:selected').each(function() {
        col_types +=$(this).attr('data-type')+",";
        if ($(this).val() == outcome) {
            error = 'true';
        }
      });
      if (error == 'true') {
        //alert('Outcome and predictors columns should not be same.');
        $("#predict-modal").modal('show');
        $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
        $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
        $('body').removeClass("modal-open");
        $('body').css("padding-right","");
        return false;
      }
      $('#dt_pred_col option:selected').each(function() {
        col_types +=$(this).attr('data-type')+",";
      });
      col_types = col_types.replace(/,\s*$/, "");

      /*if (outcome == x_col) {
        alert("Color column should be different from x, y and z columns.")
        return false;
      }*/
      var filersCount = $('input[name="dt_filter_count"]',this).val();
      var filterJson = "";
      var imageName = 'dtree_'+sketch_id+'_'+dtreeImgNum+edit_img+'.png';
      var img_name = img_dir+imageName;
      for (i = 1; i <= filersCount; i++) {
        if ($('#dt_filter'+i).length == 0) {
          continue;
        }
        if ($('input[name="dt_filter_cond_val'+i+'"]',this).val() == "" ) {
          continue;
        }
        var colname = $('select[name="dt_filter_sel'+i+'"]',this).val();
        var operator = $('select[name="dt_filter_cond_sel'+i+'"]',this).val();
        var required_val = $('input[name="dt_filter_cond_val'+i+'"]',this).val();
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
      var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "predictors":"'+predictors+'", "cols_types":"'+col_types+'", ';
      GlobaldataJson += '"outcome":"'+outcome+'", "outcome_type":"'+outcome_type+'", "filters":'+filterJsonwithGlobal+'}';
      var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "predictors":"'+predictors+'", "cols_types":"'+col_types+'", ';
      dataJson += '"outcome":"'+outcome+'", "outcome_type":"'+outcome_type+'", "filters":'+filterJson+'}';
      chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=dtree";
      var tooltipTitle = 'Get Help';
      var tooltipPath = '/wiki/dtree-plot';
      var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="dtree_'+dtreeImgNum+'_'+sketch_id+'_'+dataid+'" data-whatever="dtree" class="showForm dtree glyphicon glyphicon-pencil edit"></span>';
      panelhead   += '<span id="dt_'+dtreeImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
      var tabLi_a = title+'<i class="fa fa-arrows"></i>';
      if ($('#edit_input').length != 0) {
        $( '#dt_'+dtreeImgNum+' div.panel-body').empty();
        $( '#dt_'+dtreeImgNum+' div.panel-heading').html(panelhead);
        $( '#tabs ul li.active a').html(tabLi_a);
      }
      else {
        $( ".graphical-area div.tab-pane" ).removeClass( "in active" );
        $( "#tabs ul li" ).removeClass( "active" );
        var dtreeimgHTML = '<div id="dt_'+dtreeImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
        dtreeimgHTML += '<div class="panel-body">';
        dtreeimgHTML += '</div></div>';
        $("#tabs ul").prepend('<li id="dt_li_'+dtreeImgNum+'" class="active"><a data-toggle="tab" class="dtree" href="#dt_'+dtreeImgNum+'">'+tabLi_a+'</a></li>');
        $( ".graphical-area" ).append( dtreeimgHTML );
      }
      $.ajax({
        type: "POST",
        url: "/tm_dtree/process/data",
        data: chart_data,
        beforeSend: function() {
          $(".sections_forms").hide(0, on_form_hide);
          $('#dt_'+dtreeImgNum+' div.panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
          jQuery(window).scrollTop(0);
          close_analytics_slide();
        },
        success: function (result) {
          if( result.chart_html.trim() == '1') {
            $('#dt_'+dtreeImgNum+' div.panel-body').append('<img src="/sites/default/files/projectChartImages/'+imageName+'?'+$.now()+'">');
          }
          else {
            $('.loading_img').remove();
            $('#dt_'+dtreeImgNum+' div.panel-body').append('RESULT NOT GENERATED. Please review your filters');
          }
		  $('.loading_img').remove();
		  //$('#dt_' + dtreeImgNum + ' div.panel-body').html(result.chart_html);
		  var dt_plot_comp_json = '{"ImgType": "dtree", "ImgID": "dt_img_' + dtreeImgNum + '", "ImgName": "' + imageName2 + '","dataset_id": "'+dataid+'", "data":[' + dataJson + ']}';
		  var textAreaJsonField = '<textarea class="form-control json-data" id="dt_img_' + dtreeImgNum + '" name="dt_img_' + dtreeImgNum + '">' + dt_plot_comp_json + '</textarea>';
		  $('#dt_' + dtreeImgNum + ' div.panel-body').append(textAreaJsonField);
		  updateChartsData(dt_plot_comp_json , 'dt_img_'+dtreeImgNum );
		  $('.nav-tabs a[href="#charts"]').tab('show');
		  //$('#alertmsg').show();
          $('#save_report').addClass('alert-red');
        }
      });
      setTimeout(function() {

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
      if (btnName == "dt_addmore") {
        var next = $('#dt_filter_count').val();
        next++;
        var getDom = $("#dt_filter_sel1").html();
        var newAnd = '<div id="and_dt_filter'+next+'" class="form-group form-inline andDiv">';
        var Andcont = '<span>And</span>';
        var newAndend = '</div>';
        var newfilterdiv = '<div id="dt_filter'+next+'" class="form-group form-inline filterDiv">';
        var newdt_filter_sel = '<select class="form-control filterColoumSel" id="dt_filter_sel'+next+'" name="dt_filter_sel'+next+'">';
        newdt_filter_sel += getDom+'</select>';
        var newdt_filter_cond_sel = '<select class="form-control" id="dt_filter_cond_sel'+next+'" name="dt_filter_cond_sel'+next+'">';
        newdt_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
        var newIn = '<input type="text" class="form-control" id="dt_filter_cond_val'+next+'" name="dt_filter_cond_val'+next+'" placeholder="Value">';
        var newfilterdivEnd = '</div>';
        var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newdt_filter_sel+newdt_filter_cond_sel+newIn+newfilterdivEnd;
        var removebtn = '<input type="button" value="x" id="dt_'+next+'" class="btn btn-danger remove-me" />';
        $( '#dtree_form .filterDiv' ).last().after(complDiv);
        $( '#dt_filter'+next ).append(removebtn);
        $('#dt_filter_count').val(next);
      }
    });
    /**
     * (Remove filter functionality)
     */
    $('#secForms').on('click', '.remove-me', function() {
      var rmvbtnID = $(this).attr('id');
      var splitres = rmvbtnID.split("_");
      if(splitres[0] == 'dt' ) {
        $('#and_dt_filter'+splitres[1]).remove();
        $('#dt_filter'+splitres[1]).remove();
      }
    });
    function on_form_hide() {
      $('#secForms').find("input[type=text]").val("");
      $('#dtree_form .filterDiv:not(:first)').remove();
      $('#edit_input').remove();
    }
  });
})(jQuery);