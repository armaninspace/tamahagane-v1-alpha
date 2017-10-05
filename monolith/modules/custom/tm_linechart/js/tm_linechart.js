(function ($) {
  $(document).ready(function() {
	$("body").on("click", '#charts_list_ul li a.lineplot', function(e) {
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
			var tooltipPath = '/wiki/line-plot';
			var tooltipTitle = "tooltip";
			var $imgid = splitID[2];
			var tabcont = '<div id="line_' + $imgid + '" class="tab-pane fade' + $tabdivClass + ' myTab panel panel-default"><div class="panel-heading">' + $title + '<a class="tooltipp" title="' + tooltipTitle + '" target="_blank" href="' + tooltipPath + '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
			tabcont += '<span id="lineplot_' + $imgid + '_' + $id + '_' + value['dataset_id'] + '" data-whatever="Line Chart" class="showForm linechart glyphicon glyphicon-pencil edit"></span><span id="line_' + $imgid + '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
			tabcont += '</div>';
			tabcont += '<div class="panel-body">';
			tabcont += '<textarea class="form-control json-data" id="line_img_' + $imgid + '" name="line_img_' + $imgid + '">' + JSON.stringify(value) + '</textarea></div></div>';
			$('.graphical-area').append(tabcont);
			$.ajax({
			  type: "GET",
			  url: $pathForHTml2,
			  beforeSend: function()
			  {
			    $('#line_' + $imgid + ' .panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
			  },
			  success: function (result){
				$('.loading_img').remove();
				var markup = '<div class="devmode-wrapper">' +
					'<a class="devmode" href="#" style=""> Code & Analytics <span id="lineplot_' + $imgid + '" class="glyphicon glyphicon-link devmod"></span></a>' +
					'</div>';
				var formUrl = '/mc_devmode/load/' + value['dataset_id'] + '/' + $id + '/' + 'lineplot' + '/' + $imgid;
			    // $('#line_' + $imgid + ' .panel-body').append(markup);
				$('#line_' + $imgid + ' .panel-body').append(result);
			    // $('#line_' + $imgid + ' .panel-body textarea').wrap("<form id='form_" + 'lineplot_'+ $imgid + "'  action='" + formUrl + "' method='post'></form>");
                setTimeout(function(){
				  window.HTMLWidgets.staticRender();
				  Drupal.attachBehaviors();
				}, 1000);
              }
            });
			/*$.post($pathForHTml2, function (data) {
			  $('#line_' + $imgid + ' .panel-body').append(data);
			  $('#line_' + $imgid + ' .panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
			});
			setTimeout(function () {
			  window.HTMLWidgets.staticRender();
			  $('.loading_img').remove();
			}, 1000);*/

		  }
		});
	  }
    });
    $('body').on('click', '.linechart', function() {
      var chartType = $(this).data("whatever");
	  if($(this).hasClass('edit')) {
		var cek=$(this).attr('id');
		var splitID = cek.split("_");
		var nid = splitID[3];
		$('#dataset_val option[data-id="'+splitID[3]+'"]').prop('selected', true);
		$('#dataset_val').attr('disabled', 'disabled');
		var file_path = $('#dataset_val option:selected').val();
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
      if(chartType == "Line Chart") {
		$.ajax({
		  url: Drupal.url('tm_linechart/add/form'),
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
			if(response.form_empty) {
			  $wrapper.html(response.form_empty);
			}
			else {
              $wrapper.html(response.form_html);
			  $('.selectpicker').selectpicker('refresh');
			  $('#edit_input').remove();
			  if(cek) {
				var editID = cek;
				var splitID = editID.split("_");
				var chartType = splitID[0];
                var imgID = splitID[1];
				var reportID = splitID[2];
                $('.graphical-area').append('<input class="editInput" type="hidden" name="edit_input" id="edit_input" value="'+imgID+'">');
				var textJson = $('#line_img_'+imgID).val();
                var obj = jQuery.parseJSON(textJson);
				$.each(obj.data , function(key , value ) {  // The contents inside stars
				  $('#line_title').val(value['chart_title']);
				  $('#line_xaxis_col option[value="'+value["x_col"]+'"]').prop('selected', true);
				  $('#line_yaxis_col option[value="'+value["y_col"]+'"]').prop('selected', true);
				  $('#line_zaxis_col option[value="'+value["z_col"]+'"]').prop('selected', true);
				  $('#line_xtitle').val(value['x_title']);
				  $('#line_ytitle').val(value['y_title']);
				  $('#line_ztitle').val(value['z_title']);
				  $('#line_color_col option[value="'+value["color_col"]+'"]').prop('selected', true);
				  $('#line_text_col option[value="'+value["text_col"]+'"]').prop('selected', true);
                  if(value.filters != '') {
					var filCount = 1;
					$.each(value.filters , function(k , v ) {
					  if(filCount > 1) {
						var getDom = $("#line_filter_sel1").html();
						var newfilterdiv = '<div id="line_filter'+filCount+'" class="form-group form-inline filterDiv">';
						var newline_filter_sel = '<select class="form-control filterColoumSel" id="line_filter_sel'+filCount+'" name="line_filter_sel'+filCount+'">';
						newline_filter_sel += getDom+'</select>';
						var newline_filter_cond_sel = '<select class="form-control" id="line_filter_cond_sel'+filCount+'" name="line_filter_cond_sel'+filCount+'">';
						newline_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
						var newIn = '<input type="text" class="form-control" id="line_filter_cond_val'+filCount+'" name="line_filter_cond_val'+filCount+'" placeholder="Value">';
						var newfilterdivEnd = '</div>';
						var complDiv = newfilterdiv+newline_filter_sel+newline_filter_cond_sel+newIn+newfilterdivEnd;
						var removebtn = '<input type="button" value="-" id="line_'+filCount+'" class="btn btn-danger remove-me" />';
						$( '#line_chart_form .filterDiv' ).last().after(complDiv);
						$( '#line_filter'+filCount ).append(removebtn);
						$('#line_filter_count').val(filCount);
					  }
					  $('#line_filter_sel'+filCount+' option[value="'+v["colname"]+'"]').prop('selected', true);
					  var selectedValType = $('option:selected', '#line_filter_sel'+filCount).attr("data-type");
					  var optionString = '<option value="">--Select Operator--</option>';
					  if(selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor") {
						optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
					  }
					  else if(selectedValType == "character") {
						optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
					  }
					  $('#line_filter_cond_sel'+filCount).html(optionString);
					  $('#line_filter_cond_sel'+filCount).val(v["operator"]);
					  $('#line_filter_cond_val'+filCount).val(v['required_val']);
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
	/****** Scatter Plot Form Submit (SPS) ****/
	$('body').on('submit', 'form#line_chart_form', function(e) {
	  e.preventDefault();
	  var sketch_id = $(".node--type-sketch.node--view-mode-full").data('history-node-id');
	  var globalFilterJson = "";
	  var dataid=$('#dataset_val option:selected').attr('data-id');
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
	  var title = $('input[name="line_title"]').val();
	  var previs= 0;
	  $('#charts_list_ul li .lineplot').each(function() {  /**************to set charts display order***************/
	      var vals = $(this).parents('li').attr('id').split('_');
            if (previs < vals[2]) {
                previs = vals[2];
            }
	  });
	  var lineImgNum = previs;
	  var edit_img = "";
	  if (!lineImgNum || lineImgNum==0) {
		var lineImgNum = 1;
	  }
	  else {
		if ($('#edit_input').length != 0) {
		  var lineImgNum = $('#edit_input').val();
		  edit_img = "_ed";
		}
		else {
		  lineImgNum++;
		}
	  }
	  var chart_title = $('input[name="line_title"]',this).val();
	  var x_col = $('select[name="line_xaxis_col"]',this).val();
	  var x_col_type = $('select[name="line_xaxis_col"]',this).find(':selected').attr('data-type');
	  var y_col = $('select[name="line_yaxis_col"]',this).val();
	  var y_col_type = $('select[name="line_yaxis_col"]',this).find(':selected').attr('data-type');
	  var z_col = $('select[name="line_zaxis_col"]',this).val();
	  var z_col_type = $('select[name="line_zaxis_col"]',this).find(':selected').attr('data-type');
	  if (x_col == y_col || x_col == z_col || y_col == z_col) {
		//alert("Columns should not be same.");
	    $("#not-same-col-modal").modal('show');
	    $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
	    $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
	    $('body').removeClass("modal-open");
	    $('body').css("padding-right","");
		return false;
	  }
	  var x_title = $('input[name="line_xtitle"]',this).val();
	  var y_title = $('input[name="line_ytitle"]',this).val();
	  var z_title = $('input[name="line_ztitle"]',this).val();
	  var color_col	= $('select[name="line_color_col"]',this).val();
	  var color_col_type = $('select[name="line_color_col"]',this).find(':selected').attr('data-type');
	  if (color_col == x_col || color_col == y_col || color_col == z_col) {
		//alert("Color column should be different from x, y and z columns.");
	    $("#color-col-modal").modal('show');
	    $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
	    $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
	    $('body').removeClass("modal-open");
	    $('body').css("padding-right","");
		return false;
	  }
	  var text_col = $('select[name="line_text_col"]',this).val();
	  var text_col_type = $('select[name="line_text_col"]',this).find(':selected').attr('data-type');
	  var filersCount = $('input[name="line_filter_count"]',this).val();
	  var filterJson = "";
	  var imageName = 'linechart_'+sketch_id+'_'+lineImgNum+edit_img+'.html';
	  var img_name = img_dir+imageName;
	  for (i = 1; i <= filersCount; i++) {
		if ($('#line_filter'+i).length == 0) {
		  continue;
		}
		if ($.trim($('input[name="line_filter_cond_val'+i+'"]',this).val()) == "" ) {
		  continue;
		}
		var colname = $('select[name="line_filter_sel'+i+'"]',this).val();
		var operator = $('select[name="line_filter_cond_sel'+i+'"]',this).val();
		var required_val = $('input[name="line_filter_cond_val'+i+'"]',this).val();
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
	  GlobaldataJson += '"x_title":"'+x_title+'", "y_title":"'+y_title+'", "z_title":"'+z_title+'", "color_col":"'+color_col+'", "color_col_type":"'+color_col_type+'", "text_col":"'+text_col+'", "text_col_type":"'+text_col_type+'", "filters":'+filterJsonwithGlobal+'}';
	  var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "y_col":"'+y_col+'", "z_col":"'+z_col+'", "x_col_type":"'+x_col_type+'", "y_col_type":"'+y_col_type+'", "z_col_type":"'+z_col_type+'",';
	  dataJson += '"x_title":"'+x_title+'", "y_title":"'+y_title+'", "z_title":"'+z_title+'", "color_col":"'+color_col+'", "color_col_type":"'+color_col_type+'", "text_col":"'+text_col+'", "text_col_type":"'+text_col_type+'", "filters":'+filterJson+'}';
	  chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=linechart";
	  var tooltipTitle = 'Get Help';
	  var tooltipPath = '/wiki/line-plot';
	  var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="lineplot_'+lineImgNum+'_'+sketch_id+'_'+dataid+'" data-whatever="Line Chart" class="showForm linechart glyphicon glyphicon-pencil edit"></span>';
	  panelhead   += '<span id="line_'+lineImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
	  var tabLi_a = title+'<i class="fa fa-arrows"></i>';
	  if ($('#edit_input').length != 0) {
		$( '#line_'+lineImgNum+' div.panel-body').empty();
		$( '#line_'+lineImgNum+' div.panel-heading').html(panelhead);
		$( '#tabs ul li.active a').html(tabLi_a);
	  }
	  else {
		$( ".graphical-area div.tab-pane" ).removeClass( "in active" );
		$( "#tabs ul li" ).removeClass( "active" );
		var lineimgHTML = '<div id="line_'+lineImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
		lineimgHTML += '<div class="panel-body">';
		lineimgHTML += '</div></div>';
		$("#tabs ul").prepend('<li id="line_li_'+lineImgNum+'" class="active"><a data-toggle="tab" class="lineplot" href="#line_'+lineImgNum+'">'+tabLi_a+'</a></li>');
		$( ".graphical-area" ).append( lineimgHTML );
	  }
	  $.ajax({
		type: "POST",
		url: "/tm_linechart/process/data",
		data: chart_data,
		beforeSend: function() {
		  close_analytics_slide();
		  $(".sections_forms").hide(0, on_form_hide);
		  $('#line_'+lineImgNum+' div.panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
		  $(window).scrollTop(0);
		},
		success: function (result) {
		  var chrtresult = result.chart_html;
		  var splittedresult = chrtresult.split("|||");
		  if (splittedresult[0] == '0') {
			$('.loading_img').remove();
			$('#line_'+lineImgNum+' div.panel-body').append(splittedresult[1]);
			$('#line_img_'+lineImgNum).removeClass( "json-data" );
			$('#line_img_'+lineImgNum).css( "display", "none" );
			var line_plot_comp_json = '{"ImgType": "lineplot", "ImgID": "line_img_'+lineImgNum+'", "ImgName": "'+imageName2+'","dataset_id": "'+dataid+'","save_chart": "No", "data":['+dataJson+']}';
			var textAreaJsonField = '<textarea class="form-control json-data" id="line_img_'+lineImgNum+'" name="line_img_'+lineImgNum+'">'+line_plot_comp_json+'</textarea>';
			$('#line_'+lineImgNum+' div.panel-body').append(textAreaJsonField);
			updateChartsData(line_plot_comp_json , 'line_img_'+lineImgNum );
			$('.nav-tabs a[href="#charts"]').tab('show');
			//$('#alertmsg').show();
		    $('#save_report').addClass('alert-red');
		  }
		  else {
			$('.loading_img').remove();
			$('#line_' + lineImgNum + ' div.panel-body').html(result.chart_html);
			var line_plot_comp_json = '{"ImgType": "lineplot", "ImgID": "line_img_' + lineImgNum + '", "ImgName": "' + imageName2 + '","dataset_id": "'+dataid+'", "data":[' + dataJson + ']}';
			var textAreaJsonField = '<textarea class="form-control json-data" id="line_img_' + lineImgNum + '" name="line_img_' + lineImgNum + '">' + line_plot_comp_json + '</textarea>';
			$('#line_' + lineImgNum + ' div.panel-body').append(textAreaJsonField);
			updateChartsData(line_plot_comp_json , 'line_img_'+lineImgNum );
			$('.nav-tabs a[href="#charts"]').tab('show');
			//$('#alertmsg').show();
		    $('#save_report').addClass('alert-red');
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
	/****** /. Scatter Plot Form Submit ****/

	/****** Addmore filter functionality ****/
	$('body').on('click', '.add-more', function(e) {
      e.preventDefault();
	  var btnName = $( this ).attr('name');
	  if(btnName == "line_addmore"){
		var next = $('#line_filter_count').val();
		next++; 
		var getDom = $("#line_filter_sel1").html();
		var newAnd = '<div id="and_line_filter'+next+'" class="form-group form-inline andDiv">';
		var Andcont = '<span>And</span>';
		var newAndend = '</div>';
		var newfilterdiv = '<div id="line_filter'+next+'" class="form-group form-inline filterDiv">';
		var newline_filter_sel = '<select class="form-control filterColoumSel" id="line_filter_sel'+next+'" name="line_filter_sel'+next+'">';
		newline_filter_sel += getDom+'</select>';
		var newline_filter_cond_sel = '<select class="form-control" id="line_filter_cond_sel'+next+'" name="line_filter_cond_sel'+next+'">';
		newline_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
		var newIn = '<input type="text" class="form-control" id="line_filter_cond_val'+next+'" name="line_filter_cond_val'+next+'" placeholder="Value">';
		var newfilterdivEnd = '</div>';
		var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newline_filter_sel+newline_filter_cond_sel+newIn+newfilterdivEnd;
		var removebtn = '<input type="button" value="x" id="line_'+next+'" class="btn btn-danger remove-me" />';
		$( '#line_chart_form .filterDiv' ).last().after(complDiv);
		$( '#line_filter'+next ).append(removebtn);
		$('#line_filter_count').val(next);
      }
	});
	/**** (remFilter) **/
	$('#secForms').on('click', '.remove-me', function() {
	  var rmvbtnID = $(this).attr('id');
	  var splitres = rmvbtnID.split("_");
	  if(splitres[0] == 'line' ) {
		$('#and_line_filter'+splitres[1]).remove();
		$('#line_filter'+splitres[1]).remove();
	  }
	});
	function on_form_hide() {
	  $('#secForms').find("input[type=text]").val("");
	  $('#line_chart_form .filterDiv:not(:first)').remove();
	  $('#edit_input').remove();
    }
  });
})(jQuery);