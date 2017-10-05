(function ($) {
  $(document).ready(function() {
    $("body").on("click", '#charts_list_ul li a.ddscatterplot', function(e) {
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
			  var tooltipPath = '/wiki/ddscatter-plot';
			  var tooltipTitle = "tooltip";
			  var $imgid = splitID[2];
			  var tabcont = '<div id="ddscatter_' + $imgid + '" class="tab-pane fade' + $tabdivClass + ' myTab panel panel-default"><div class="panel-heading">' + $title + '<a class="tooltipp" title="' + tooltipTitle + '" target="_blank" href="' + tooltipPath + '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
			  tabcont += '<span id="ddscatterplot_' + $imgid + '_' + $id + '_' + value['dataset_id'] + '" data-whatever="2dScatter Plot" class="showForm ddscatterplot glyphicon glyphicon-pencil edit"></span><span id="ddscatter_' + $imgid + '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
			  tabcont += '</div>';
			  tabcont += '<div class="panel-body">';
			  tabcont += '<textarea class="form-control json-data" id="ddscatter_img_' + $imgid + '" name="ddscatter_img_' + $imgid + '">' + JSON.stringify(value) + '</textarea></div></div>';
			  $('.graphical-area').append(tabcont);
			  $.ajax({
				type: "GET",
				url: $pathForHTml2,
				beforeSend: function()
				  {
					$('#ddscatter_' + $imgid + ' .panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
				  },
				    success: function (result){
					  $('.loading_img').remove();
					  var markup = '<div class="devmode-wrapper">' +
						  '<a class="devmode" href="#" style=""> Code & Analytics <span id="ddscatterplot_' + $imgid + '" class="glyphicon glyphicon-link devmod"></span></a>' + '</div>';
					  var formUrl = '/mc_devmode/load/' + value['dataset_id'] + '/' + $id + '/' + 'ddscatterplot' + '/' + $imgid;
						  $('#ddscatter_' + $imgid + ' .panel-body').append(result);
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
	$('body').on('click', '.ddscatterplot', function() {
	  var chartType = $(this).data("whatever");
        if (chartType == "2dScatter Plot") {
		  if($(this).hasClass('edit')) {
		    var cek=$(this).attr('id');
			var splitID = cek.split("_");
			var nid = splitID[3];
			$('#dataset_val option[data-id="'+splitID[3]+'"]').prop('selected', true);
			$('#dataset_val').attr('disabled', 'disabled');
			var file_path = $('#dataset_val option:selected').val();
			if(file_path == ""){
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
			//alert('please select dataset');
		    $("#dataset-modal").modal('show');
		    $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
		    $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
		    $('body').removeClass("modal-open");
		    $('body').css("padding-right","");
			return false;
		  }

		  $.ajax({
            url: Drupal.url('tm_2dscatterplot/add/form'),
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
			  } else {
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
					var textJson = $('#ddscatter_img_' + imgID).val();
					var obj = jQuery.parseJSON(textJson);
					$.each(obj.data, function (key, value) {  // The contents inside stars
                      $('#ddscatter_title').val(value['chart_title']);
					  $('#ddscatter_xaxis_col option[value="' + value["x_col"] + '"]').prop('selected', true);
					  $('#ddscatter_yaxis_col option[value="' + value["y_col"] + '"]').prop('selected', true);
					  $('#ddscatter_xtitle').val(value['x_title']);
					  $('#ddscatter_ytitle').val(value['y_title']);
					  $('#ddscatter_color_col option[value="' + value["color_col"] + '"]').prop('selected', true);
                        if (value.filters != '') {
						  var filCount = 1;
						  $.each(value.filters, function (k, v) {
							if (filCount > 1) {
							  var getDom = $("#ddscatter_filter_sel1").html();
							  var newfilterdiv = '<div id="ddscatter_filter' + filCount + '" class="form-group form-inline filterDiv">';
							  var newddscatter_filter_sel = '<select class="form-control filterColoumSel" id="ddscatter_filter_sel' + filCount + '" name="ddscatter_filter_sel' + filCount + '">';
							  newddscatter_filter_sel += getDom + '</select>';
							  var newddscatter_filter_cond_sel = '<select class="form-control" id="ddscatter_filter_cond_sel' + filCount + '" name="ddscatter_filter_cond_sel' + filCount + '">';
							  newddscatter_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
							  var newIn = '<input type="text" class="form-control" id="ddscatter_filter_cond_val' + filCount + '" name="ddscatter_filter_cond_val' + filCount + '" placeholder="Value">';
							  var newfilterdivEnd = '</div>';
							  var complDiv = newfilterdiv + newddscatter_filter_sel + newddscatter_filter_cond_sel + newIn + newfilterdivEnd;
							  var removebtn = '<input type="button" value="-" id="ddscatter_' + filCount + '" class="btn btn-danger remove-me" />';
							  $('#ddscatter_plot_form .filterDiv').last().after(complDiv);
							  $('#ddscatter_filter' + filCount).append(removebtn);
							  $('#ddscatter_filter_count').val(filCount);
							}
							$('#ddscatter_filter_sel' + filCount + ' option[value="' + v["colname"] + '"]').prop('selected', true);
							var selectedValType = $('option:selected', '#ddscatter_filter_sel' + filCount).attr("data-type");
							var optionString = '<option value="">--Select Operator--</option>';
							  if (selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor") {
							    optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
							  }
							  else if (selectedValType == "character") {
							    optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
							  }
							$('#ddscatter_filter_cond_sel' + filCount).html(optionString);
							$('#ddscatter_filter_cond_sel' + filCount).val(v["operator"]);
							$('#ddscatter_filter_cond_val' + filCount).val(v['required_val']);
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
	 * ddscatter Plot Form Submit (SPS)
	 */
    $('body').on('submit', 'form#ddscatter_plot_form', function(e) {
	  e.preventDefault();
	  var sketch_id = $(".node--type-sketch.node--view-mode-full").data('history-node-id');
	  //alert(sketch_id);
	  //return false;
	  var globalFilterJson = "";
	  var csv_path = "";
	  var dataid=$('#dataset_val option:selected').attr('data-id');
	  csv_path = $('#dataset_val option:selected').val();
	  //var rid = $('#report_id').val();
	  if(!csv_path || csv_path==""){
		//alert("please select dataset");
	    $("#dataset-modal").modal('show');
	    $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
	    $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
	    $('body').removeClass("modal-open");
	    $('body').css("padding-right","");
		return false;
	  }
	  //var csv_path = $('#csvFilePath').val();
	  var img_dir = $('#imgDir').val();
	  var title = $('input[name="ddscatter_title"]').val();
	  var previs= 0;
	  $('#charts ul li .ddscatterplot').each(function() {  /**************to set charts display order***************/
        var vals = $(this).parents('li').attr('id').split('_');
            if(previs < vals[2]){
                previs = vals[2];
            }
	  });
        var scatter2dImgNum = previs;
		var edit_img = "";
	  if(!scatter2dImgNum || scatter2dImgNum==0){
		var scatter2dImgNum = 1;
		//$('input[name="ddscatter_img_num"]').val(ddscatterImgNum);
	  }
	  else{
		if($('#edit_input').length != 0){
		  var scatter2dImgNum = $('#edit_input').val();
		  edit_img = "_ed";
		}
		else{
		  scatter2dImgNum++;
		  // $('input[name="ddscatter_img_num"]').val(ddscatterImgNum);
		}
	  }
      var chart_title   = $('input[name="ddscatter_title"]',this).val();
	  var x_col 		= $('select[name="ddscatter_xaxis_col"]',this).val();
	  var x_col_type 	= $('select[name="ddscatter_xaxis_col"]',this).find(':selected').attr('data-type');
	  var y_col 		= $('select[name="ddscatter_yaxis_col"]',this).val();
	  var y_col_type 	= $('select[name="ddscatter_yaxis_col"]',this).find(':selected').attr('data-type');
	  if(x_col == y_col) {
		//alert("x and y columns should not be same.");
	    $("#xy-col-modal").modal('show');
	    $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
	    $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
	    $('body').removeClass("modal-open");
	    $('body').css("padding-right","");
		return false;
	  }
	  var x_title 	= $('input[name="ddscatter_xtitle"]',this).val();
	  var y_title 	= $('input[name="ddscatter_ytitle"]',this).val();
      var color_col = $('select[name="ddscatter_color_col"]',this).val();
	  var color_col_type = $('select[name="ddscatter_color_col"]',this).find(':selected').attr('data-type');
	  if (color_col == x_col || color_col == y_col) {
		//alert("Color column should be different from x, y and z columns.");
	    $("#color-col-modal").modal('show');
	    $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
	    $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
	    $('body').removeClass("modal-open");
	    $('body').css("padding-right","");
		return false;
	  }
	  var filersCount = $('input[name="ddscatter_filter_count"]',this).val();
	  var filterJson = "";
	  var imageName = 'ddscatterplot_'+sketch_id+'_'+scatter2dImgNum+edit_img+'.html';
	  var img_name = img_dir+imageName;
	  for (i = 1; i <= filersCount; i++) {
		if($('#ddscatter_filter'+i).length == 0) {
		  continue;
		}
		if($('input[name="ddscatter_filter_cond_val'+i+'"]',this).val() == "" ) {
		  continue;
		}
		var colname 	= $('select[name="ddscatter_filter_sel'+i+'"]',this).val();
		var operator	= $('select[name="ddscatter_filter_cond_sel'+i+'"]',this).val();
		var required_val = $('input[name="ddscatter_filter_cond_val'+i+'"]',this).val();
		if(colname == '' ||  operator == '') {
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
	  if(globalFilterJson == "" || globalFilterJson == null) {
        var filterJsonwithGlobal = filterJson;
	  }
	  else {
        var filterJsonwithGlobal = globalFilterJson+","+filterJson;
      }
	  filterJsonwithGlobal = filterJsonwithGlobal.replace(/,\s*$/, "");
	  var filterJsonwithGlobal = "["+filterJsonwithGlobal+"]";
	  filterJson = "["+filterJson+"]";
      var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "y_col":"'+y_col+'", "x_col_type":"'+x_col_type+'", "y_col_type":"'+y_col_type+'", ';
	  GlobaldataJson += '"x_title":"'+x_title+'", "y_title":"'+y_title+'", "color_col":"'+color_col+'", "color_col_type":"'+color_col_type+'", "filters":'+filterJsonwithGlobal+'}';
      var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "y_col":"'+y_col+'", "x_col_type":"'+x_col_type+'", "y_col_type":"'+y_col_type+'", ';
      dataJson += '"x_title":"'+x_title+'", "y_title":"'+y_title+'", "color_col":"'+color_col+'", "color_col_type":"'+color_col_type+'", "filters":'+filterJson+'}';
	  //console.log(GlobaldataJson);
	  //console.log(dataJson);
	  //return false;
	  chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=ddscatterplot";
	  var tooltipTitle = 'Get Help';
	  var tooltipPath = '/wiki/ddscatter-plot';
	  var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="ddscatterplot_'+scatter2dImgNum+'_'+sketch_id+'_'+dataid+'" data-whatever="2dScatter Plot" class="showForm ddscatterplot glyphicon glyphicon-pencil edit"></span>';
	  panelhead   += '<span id="ddscatter_'+scatter2dImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
	  var tabLi_a = title+'<i class="fa fa-arrows"></i>';
	  if($('#edit_input').length != 0) {
		$( '#ddscatter_'+scatter2dImgNum+' div.panel-body').empty();
		$( '#ddscatter_'+scatter2dImgNum+' div.panel-heading').html(panelhead);
		$( '#tabs ul li.active a').html(tabLi_a);
	  }
	  else {
		$( ".graphical-area div.tab-pane" ).removeClass("in active");
		$( "#tabs ul li" ).removeClass( "active" );
		var scatter2dimgHTML = '<div id="ddscatter_'+scatter2dImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
		scatter2dimgHTML += '<div class="panel-body">';
		scatter2dimgHTML += '</div></div>';
		$("#tabs ul").prepend('<li id="ddscatter_li_'+scatter2dImgNum+'" class="active"><a data-toggle="tab" class="ddscatterplot" href="#ddscatter_'+scatter2dImgNum+'">'+tabLi_a+'</a></li>');
		$( ".graphical-area" ).append( scatter2dimgHTML );
      }
	  $.ajax({
		type: "POST",
		url: "/tm_2dscatterplot/process/data",
		data: chart_data,
		beforeSend: function()
		{
		  close_analytics_slide();
		  $(".sections_forms").hide(0, on_form_hide);
		  $('#ddscatter_'+scatter2dImgNum+' div.panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
		  jQuery(window).scrollTop(0);
        },
        success: function (result) {
		  var chrtresult = result.chart_html;
		  // console.log(result);
		  var splittedresult = chrtresult.split("|||");
		  if (splittedresult[0] == '0') {
			//alert(color_col);
			$('.loading_img').remove();
			$('#ddscatter_'+scatter2dImgNum+' div.panel-body').append(splittedresult[1]);
			$('#ddscatter__img_'+scatter2dImgNum).removeClass( "json-data" );
			$('#ddscatter__img_'+scatter2dImgNum).css( "display", "none" );
			var scatter2d_plot_comp_json = '{"ImgType": "ddscatter", "ImgID": "ddscatter_img_'+scatter2dImgNum+'", "ImgName": "'+imageName2+'","dataset_id": "'+dataid+'", "save_chart": "No","data":['+dataJson+']}';
			var textAreaJsonField = '<textarea class="form-control json-data" id="ddscatter_img_'+scatter2dImgNum+'" name="ddscatter_img_'+scatter2dImgNum+'">'+scatter2d_plot_comp_json+'</textarea>';
			$('#ddscatter_'+scatter2dImgNum+' div.panel-body').append(textAreaJsonField);
			updateChartsData(scatter2d_plot_comp_json , 'ddscatter_img_'+scatter2dImgNum );
			$('.nav-tabs a[href="#charts"]').tab('show');
			//$('#alertmsg').show();
		    $('#save_report').addClass('alert-red');
		  }
		  else {
			$('.loading_img').remove();
			$('#ddscatter_' + scatter2dImgNum + ' div.panel-body').html(result.chart_html);
			var scatter2d_plot_comp_json = '{"ImgType": "ddscatterplot", "ImgID": "ddscatter_img_' + scatter2dImgNum + '", "ImgName": "' + imageName2 + '","dataset_id": "'+dataid+'", "data":[' + dataJson + ']}';
			var textAreaJsonField = '<textarea class="form-control json-data" id="ddscatter_img_' + scatter2dImgNum + '" name="ddscatter_img_' + scatter2dImgNum + '">' + scatter2d_plot_comp_json + '</textarea>';
			$('#ddscatter_' + scatter2dImgNum + ' div.panel-body').append(textAreaJsonField);
			updateChartsData(scatter2d_plot_comp_json , 'ddscatter_img_'+scatter2dImgNum );
			$('.nav-tabs a[href="#charts"]').tab('show');
			//$('#alertmsg').show();
		    $('#save_report').addClass('alert-red');
			setTimeout(function() {
			  window.HTMLWidgets.staticRender();
				//Drupal.attachBehaviors();
			}, 1000);
		  }
		}
	  });
      setTimeout(function() {
      }, 3000);

	  if(imageName.includes("_ed")) {
        imageName2 = imageName.replace("_ed", "");
	  }
	  else {
        imageName2 = imageName;
	  }
      $(this).find("input[type=text]").val("");
	  /* $('#sectionModal').modal('hide');
	   $( "#save_data" ).show();
	   $( "#export_pdf" ).show();*/
	  //save_alert_func();
	  return false;
	});
	/**
	 * Addmore filter functionality
	 */
	$('body').on('click', '.add-more', function(e) {
	  e.preventDefault();
	  var btnName = $( this ).attr('name');
	  if (btnName == "ddscatter_addmore") {
		var next = $('#ddscatter_filter_count').val();
		next++;
		var getDom = $("#ddscatter_filter_sel1").html();
		var newAnd = '<div id="and_ddscatter_filter'+next+'" class="form-group form-inline andDiv">';
		var Andcont = '<span>And</span>';
		var newAndend = '</div>';
		var newfilterdiv = '<div id="ddscatter_filter'+next+'" class="form-group form-inline filterDiv">';
		var newddscatter_filter_sel = '<select class="form-control filterColoumSel" id="ddscatter_filter_sel'+next+'" name="ddscatter_filter_sel'+next+'">';
		newddscatter_filter_sel += getDom+'</select>';
		var newddscatter_filter_cond_sel = '<select class="form-control" id="ddscatter_filter_cond_sel'+next+'" name="ddscatter_filter_cond_sel'+next+'">';
		newddscatter_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
		var newIn = '<input type="text" class="form-control" id="ddscatter_filter_cond_val'+next+'" name="ddscatter_filter_cond_val'+next+'" placeholder="Value">';
		var newfilterdivEnd = '</div>';
		var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newddscatter_filter_sel+newddscatter_filter_cond_sel+newIn+newfilterdivEnd;
		var removebtn = '<input type="button" value="x" id="ddscatter_'+next+'" class="btn btn-danger remove-me" />';
		$( '#ddscatter_plot_form .filterDiv' ).last().after(complDiv);
		$( '#ddscatter_filter'+next ).append(removebtn);
		$('#ddscatter_filter_count').val(next);
       }
	});
	/**
	 * (remFilter)
	 */
	$('#secForms').on('click', '.remove-me', function() {
	  var rmvbtnID = $(this).attr('id');
	  var splitres = rmvbtnID.split("_");
	  if(splitres[0] == 'ddscatter' ) {
		$('#and_ddscatter_filter'+splitres[1]).remove();
		$('#ddscatter_filter'+splitres[1]).remove();
	  }
	});
    function on_form_hide() {
	  $('#secForms').find("input[type=text]").val("");
	  $('#ddscatter_plot_form .filterDiv:not(:first)').remove();
	  $('#edit_input').remove();
    }
  });
})(jQuery);