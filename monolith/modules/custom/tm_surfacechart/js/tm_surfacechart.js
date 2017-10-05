(function ($) {
  $(document).ready(function() {
	$("body").on("click", '#charts_list_ul li a.surfaceplot', function(e) {
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
			var tooltipPath = '/wiki/surface-chart';
			var tooltipTitle = "tooltip";
			var $imgid = splitID[2];
			var tabcont = '<div id="surface_' + $imgid + '" class="tab-pane fade' + $tabdivClass + ' myTab panel panel-default"><div class="panel-heading">' + $title + '<a class="tooltipp" title="' + tooltipTitle + '" target="_blank" href="' + tooltipPath + '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
			tabcont += '<span id="surfacechart_' + $imgid + '_' + $id + '_' + value['dataset_id'] + '" data-whatever="Surface Chart" class="showForm surfacechart glyphicon glyphicon-pencil edit"></span><span id="surface_' + $imgid + '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
			tabcont += '</div>';
			tabcont += '<div class="panel-body">';
			tabcont += '<textarea class="form-control json-data" id="surface_img_' + $imgid + '" name="surface_img_' + $imgid + '">' + JSON.stringify(value) + '</textarea></div></div>';
			$('.graphical-area').append(tabcont);
			$.ajax({
			  type: "GET",
			  url: $pathForHTml2,
			  beforeSend: function()
			  {
			    $('#surface_' + $imgid + ' .panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
			  },
			  success: function (result) {
				$('.loading_img').remove();
				var markup = '<div class="devmode-wrapper">' +
					'<a class="devmode" href="#" style=""> Code & Analytics <span id="surfacechart_' + $imgid + '" class="glyphicon glyphicon-link devmod"></span></a>' +
					'</div>';
				var formUrl = '/mc_devmode/load/' + value['dataset_id'] + '/' + $id + '/' + 'surfacechart' + '/' + $imgid;
			   // $('#surface_' + $imgid + ' .panel-body').append(markup);
				$('#surface_' + $imgid + ' .panel-body').append(result);
				//$('#surface_' + $imgid + ' .panel-body textarea').wrap("<form id='form_" + 'surfacechart_'+ $imgid + "'  action='" + formUrl + "' method='post'></form>");
				setTimeout(function() {
				  window.HTMLWidgets.staticRender();
				  Drupal.attachBehaviors();
				}, 1000);
			  }
			});
		  }
		});
	  }
	});
    $('body').on('click', '.surfacechart', function() {
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
	  if(file_path == ""){
		//alert('please select dataset');
	    $("#dataset-modal").modal('show');
	    $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
	    $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
	    $('body').removeClass("modal-open");
	    $('body').css("padding-right","");
		return false;
	  }
	  if(chartType == "Surface Chart") {
		$.ajax({
		  url: Drupal.url('tm_surfacechart/add/form'),
		  type: "POST",
		  data: "file_path="+file_path,
		  // contentType: "application/json; charset=utf-8",
		 // dataType: "json",
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
			  if (cek) {
				var editID = cek;
				var splitID = editID.split("_");
				var chartType = splitID[0];
				var imgID = splitID[1];
				var reportID = splitID[2];
				$('.graphical-area').append('<input class="editInput" type="hidden" name="edit_input" id="edit_input" value="' + imgID + '">');
				var textJson = $('#surface_img_' + imgID).val();
				var obj = jQuery.parseJSON(textJson);
				$.each(obj.data, function (key, value) {  // The contents inside stars
				  $('#surface_title').val(value['chart_title']);
				  $('#surface_xaxis_col option[value="' + value["x_col"] + '"]').prop('selected', true);
				  $('#surface_yaxis_col option[value="' + value["y_col"] + '"]').prop('selected', true);
				  $('#surface_xtitle').val(value['x_title']);
				  $('#surface_ytitle').val(value['y_title']);
				  if (value.filters != '') {
					var filCount = 1;
					$.each(value.filters, function (k, v) {
					  if (filCount > 1) {
						var getDom = $("#surface_filter_sel1").html();
						var newfilterdiv = '<div id="surface_filter' + filCount + '" class="form-group form-inline filterDiv">';
						var newsurfacechart_filter_sel = '<select class="form-control filterColoumSel" id="surface_filter_sel' + filCount + '" name="surface_filter_sel' + filCount + '">';
						newsurfacechart_filter_sel += getDom + '</select>';
						var newsurfacechart_filter_cond_sel = '<select class="form-control" id="surface_filter_cond_sel' + filCount + '" name="surface_filter_cond_sel' + filCount + '">';
						newsurfacechart_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
						var newIn = '<input type="text" class="form-control" id="surface_filter_cond_val' + filCount + '" name="surface_filter_cond_val' + filCount + '" placeholder="Value">';
						var newfilterdivEnd = '</div>';
						var complDiv = newfilterdiv + newsurfacechart_filter_sel + newsurfacechart_filter_cond_sel + newIn + newfilterdivEnd;
						var removebtn = '<input type="button" value="-" id="surface_' + filCount + '" class="btn btn-danger remove-me" />';
						$('#surface_chart_form .filterDiv').last().after(complDiv);
						$('#surface_filter' + filCount).append(removebtn);
						$('#surface_filter_count').val(filCount);
					  }
					  $('#surface_filter_sel' + filCount + ' option[value="' + v["colname"] + '"]').prop('selected', true);
					  var selectedValType = $('option:selected', '#surface_filter_sel' + filCount).attr("data-type");
					  var optionString = '<option value="">--Select Operator--</option>';
					  if (selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor") {
						optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
					  }
					  else if (selectedValType == "character") {
						optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
					  }
					  $('#surface_filter_cond_sel' + filCount).html(optionString);
					  $('#surface_filter_cond_sel' + filCount).val(v["operator"]);
					  $('#surface_filter_cond_val' + filCount).val(v['required_val']);
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
	/****** Surface Chart Form Submit  ****/
	$('body').on('submit', 'form#surface_chart_form', function(e) {
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
	  var title = $('input[name="surface_title"]').val();
	  var previs= 0;
	  $('#charts_list_ul li .surfaceplot').each(function() {
        var vals = $(this).parents('li').attr('id').split('_');
            if(previs < vals[2]){
                previs = vals[2];
            }
        });
	  var surfaceImgNum = previs;
	  var edit_img = "";
	  if (!surfaceImgNum || surfaceImgNum==0) {
		var surfaceImgNum = 1;
	  }
	  else {
		if ($('#edit_input').length != 0) {
		  var surfaceImgNum = $('#edit_input').val();
		  edit_img = "_ed";
		}
		else {
		  surfaceImgNum++;
		  // $('input[name="surface_img_num"]').val(surfaceImgNum);
		}
	  }
	  var chart_title = $('input[name="surface_title"]',this).val();
	  var x_col 		= $('select[name="surface_xaxis_col"]',this).val();
	  var x_col_type 	= $('select[name="surface_xaxis_col"]',this).find(':selected').attr('data-type');
	  var y_col 		= $('select[name="surface_yaxis_col"]',this).val();
	  var y_col_type 	= $('select[name="surface_yaxis_col"]',this).find(':selected').attr('data-type');
	  if (x_col == y_col) {
		//alert("x and y columns should not be same.");
	    $("#xy-col-modal").modal('show');
	    $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
	    $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
	    $('body').removeClass("modal-open");
	    $('body').css("padding-right","");
		return false;
	  }
	  var x_title 	= $('input[name="surface_xtitle"]',this).val();
	  var y_title 	= $('input[name="surface_ytitle"]',this).val();
	  var filersCount = $('input[name="surface_filter_count"]',this).val();
	  var filterJson = "";
	  var imageName = 'surfaceplot_'+sketch_id+'_'+surfaceImgNum+edit_img+'.html';
	  var img_name = img_dir+imageName;
	  for (i = 1; i <= filersCount; i++) {
		if ($('#surface_filter'+i).length == 0) {
		  continue;
		}
		if ($.trim($('input[name="surface_filter_cond_val'+i+'"]',this).val()) == "" ) {
		  continue;
		}
		var colname 	= $('select[name="surface_filter_sel'+i+'"]',this).val();
		var operator	= $('select[name="surface_filter_cond_sel'+i+'"]',this).val();
		var required_val = $('input[name="surface_filter_cond_val'+i+'"]',this).val();
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

	  var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "y_col":"'+y_col+'", "x_col_type":"'+x_col_type+'", "y_col_type":"'+y_col_type+'", ';
	  GlobaldataJson += '"x_title":"'+x_title+'", "y_title":"'+y_title+'", "filters":'+filterJsonwithGlobal+'}';

	  var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "y_col":"'+y_col+'", "x_col_type":"'+x_col_type+'", "y_col_type":"'+y_col_type+'", ';
	  dataJson += '"x_title":"'+x_title+'", "y_title":"'+y_title+'", "filters":'+filterJson+'}';

	  chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=surfacechart";
	  var tooltipTitle = 'Get Help';
	  var tooltipPath = '/wiki/surface-plot';
	  var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="surfacechart_'+surfaceImgNum+'_'+sketch_id+'_'+dataid+'" data-whatever="Surface Chart" class="showForm surfacechart glyphicon glyphicon-pencil edit"></span>';
	  panelhead   += '<span id="surface_'+surfaceImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
	  var tabLi_a = title+'<i class="fa fa-arrows"></i>';
	  if ($('#edit_input').length != 0) {
		$( '#surface_'+surfaceImgNum+' div.panel-body').empty();
		$( '#surface_'+surfaceImgNum+' div.panel-heading').html(panelhead);
		$( '#tabs ul li.active a').html(tabLi_a);
	  }
	  else {
		$( ".graphical-area div.tab-pane" ).removeClass( "in active" );
		$( "#tabs ul li" ).removeClass( "active" );
		var surfaceimgHTML = '<div id="surface_'+surfaceImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
		surfaceimgHTML += '<div class="panel-body">';
		surfaceimgHTML += '</div></div>';
		$("#tabs ul").prepend('<li id="surface_li_'+surfaceImgNum+'" class="active"><a data-toggle="tab" class="surfaceplot" href="#surface_'+surfaceImgNum+'">'+tabLi_a+'</a></li>');
		$( ".graphical-area" ).append( surfaceimgHTML );
	  }
	  $.ajax({
		type: "POST",
		url: "/tm_surfacechart/process/data",
		data: chart_data,
		beforeSend: function() {
          close_analytics_slide();
		  $(".sections_forms").hide(0, on_form_hide);
		  $('#surface_'+surfaceImgNum+' div.panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
		  $(window).scrollTop(0);
		},
		success: function (result) {
		  var chrtresult = result.chart_html;
		  var splittedresult = chrtresult.split("|||");
		  if (splittedresult[0] == '0') {
			$('.loading_img').remove();
			$('#surface_'+surfaceImgNum+' div.panel-body').append(splittedresult[1]);
			$('#surface_img_'+surfaceImgNum).removeClass( "json-data" );
			$('#surface_img_'+surfaceImgNum).css( "display", "none" );
			var surface_plot_comp_json = '{"ImgType": "surfaceplot", "ImgID": "surface_img_'+surfaceImgNum+'", "ImgName": "'+imageName2+'","dataset_id": "'+dataid+'","save_chart": "No", "data":['+dataJson+']}';
			var textAreaJsonField = '<textarea class="form-control json-data" id="surface_img_'+surfaceImgNum+'" name="surface_img_'+surfaceImgNum+'">'+surface_plot_comp_json+'</textarea>';
			$('#surface_'+surfaceImgNum+' div.panel-body').append(textAreaJsonField);
			updateChartsData(surface_plot_comp_json , 'surface_img_'+surfaceImgNum );
			$('.nav-tabs a[href="#charts"]').tab('show');
			//$('#alertmsg').show();
		    $('#save_report').addClass('alert-red');
		  }
		  else {
			$('.loading_img').remove();
			$('#surface_' + surfaceImgNum + ' div.panel-body').html(result.chart_html);
			var surface_plot_comp_json = '{"ImgType": "surfaceplot", "ImgID": "surface_img_' + surfaceImgNum + '", "ImgName": "' + imageName2 + '","dataset_id": "'+dataid+'", "data":[' + dataJson + ']}';
			var textAreaJsonField = '<textarea class="form-control json-data" id="surface_img_' + surfaceImgNum + '" name="surface_img_' + surfaceImgNum + '">' + surface_plot_comp_json + '</textarea>';
			$('#surface_' + surfaceImgNum + ' div.panel-body').append(textAreaJsonField);
			updateChartsData(surface_plot_comp_json , 'surface_img_'+surfaceImgNum );
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
	});/****** /. Surface Chart Form Submit ****/
	/****** Addmore filter functionality ****/
	$('body').on('click', '.add-more', function(e) {
      e.preventDefault();
	  var btnName = $( this ).attr('name');
	  if(btnName == "surface_addmore") {
		var next = $('#surface_filter_count').val();
		next++;
		var getDom = $("#surface_filter_sel1").html();
		var newAnd = '<div id="and_surface_filter'+next+'" class="form-group form-inline andDiv">';
		var Andcont = '<span>And</span>';
		var newAndend = '</div>';
		var newfilterdiv = '<div id="surface_filter'+next+'" class="form-group form-inline filterDiv">';
		var newsurface_filter_sel = '<select class="form-control filterColoumSel" id="surface_filter_sel'+next+'" name="surface_filter_sel'+next+'">';
		newsurface_filter_sel += getDom+'</select>';
		var newsurface_filter_cond_sel = '<select class="form-control" id="surface_filter_cond_sel'+next+'" name="surface_filter_cond_sel'+next+'">';
		newsurface_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
		var newIn = '<input type="text" class="form-control" id="surface_filter_cond_val'+next+'" name="surface_filter_cond_val'+next+'" placeholder="Value">';
		var newfilterdivEnd = '</div>';
		var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newsurface_filter_sel+newsurface_filter_cond_sel+newIn+newfilterdivEnd;
		var removebtn = '<input type="button" value="x" id="surface_'+next+'" class="btn btn-danger remove-me" />';
		$( '#surface_chart_form .filterDiv' ).last().after(complDiv);
		$( '#surface_filter'+next ).append(removebtn);
		$('#surface_filter_count').val(next);
	  }
	});
	/**** (remFilter) **/
	$('#secForms').on('click', '.remove-me', function() {
	  var rmvbtnID = $(this).attr('id');
	  var splitres = rmvbtnID.split("_");
	  if(splitres[0] == 'surface' ) {
		$('#and_surface_filter'+splitres[1]).remove();
		$('#surface_filter'+splitres[1]).remove();
	  }
	});
	function on_form_hide() {
	  $('#secForms').find("input[type=text]").val("");
	  $('#surface_plot_form .filterDiv:not(:first)').remove();
	  $('#edit_input').remove();
	}
  });
})(jQuery);