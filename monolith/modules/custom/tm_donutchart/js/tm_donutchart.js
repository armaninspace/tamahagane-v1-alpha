(function ($) {
  $(document).ready(function() {
	$("body").on("click", '#charts_list_ul li a.donut_chart', function(e) {
	  var id = $(this).parent().attr('id');
	  var splitID = id.split("_");
	  var img_id = splitID[0] + '_img_' + splitID[2];
	  var divid = splitID[0] + '_' + splitID[2];
	  var already = "";
	  close_analytics_slide();
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
			var tooltipPath = '/wiki/donut-chart';
			var tooltipTitle = "tooltip";
			var $imgid = splitID[2];
			var tabcont = '<div id="donutchart_' + $imgid + '" class="tab-pane fade' + $tabdivClass + ' myTab panel panel-default"><div class="panel-heading">' + $title + '<a class="tooltipp" title="' + tooltipTitle + '" target="_blank" href="' + tooltipPath + '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
			tabcont += '<span id="donutchart_' + $imgid + '_' + $id + '_' + value['dataset_id'] + '" data-whatever="Donut Chart" class="showForm donutchart glyphicon glyphicon-pencil edit"></span><span id="donutchart_' + $imgid + '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
			tabcont += '</div>';
			tabcont += '<div class="panel-body">';
			tabcont += '<textarea class="form-control json-data" id="donutchart_img_' + $imgid + '" name="donutchart_img_' + $imgid + '">' + JSON.stringify(value) + '</textarea></div></div>';
			$('.graphical-area').append(tabcont);
			$.ajax({
			  type: "GET",
			  url: $pathForHTml2,
			  beforeSend: function()
			  {
			    $('#donutchart_' + $imgid + ' .panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
			  },
			  success: function (result) {
				$('.loading_img').remove();
				$('#donutchart_' + $imgid + ' .panel-body').append(result);
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
	$('body').on('click', '.donutchart', function() {
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
      if(chartType == "Donut Chart") {
		$.ajax({
		  url: Drupal.url('tm_donutchart/add/form'),
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
				var textJson = $('#donutchart_img_'+imgID).val();
				var obj = jQuery.parseJSON(textJson);
				$.each(obj.data , function(key , value ) {  // The contents inside stars
				  $('#donutchart_title').val(value['chart_title']);
				  $('#donutchart_xaxis_col option[value="'+value["x_col"]+'"]').prop('selected', true);
				  if(value.filters != '') {
					var filCount = 1;
					$.each(value.filters , function(k , v ) {
					  if(filCount > 1) {
						var getDom = $("#donutchart_filter_sel1").html();
						var newfilterdiv = '<div id="donutchart_filter'+filCount+'" class="form-group form-inline filterDiv">';
						var newdonutchart_filter_sel = '<select class="form-control filterColoumSel" id="donutchart_filter_sel'+filCount+'" name="donutchart_filter_sel'+filCount+'">';
						newdonutchart_filter_sel += getDom+'</select>';
						var newdonutchart_filter_cond_sel = '<select class="form-control" id="donutchart_filter_cond_sel'+filCount+'" name="donutchart_filter_cond_sel'+filCount+'">';
						newdonutchart_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
						var newIn = '<input type="text" class="form-control" id="donutchart_filter_cond_val'+filCount+'" name="donutchart_filter_cond_val'+filCount+'" placeholder="Value">';
						var newfilterdivEnd = '</div>';
						var complDiv = newfilterdiv+newdonutchart_filter_sel+newdonutchart_filter_cond_sel+newIn+newfilterdivEnd;
						var removebtn = '<input type="button" value="-" id="donutchart_'+filCount+'" class="btn btn-danger remove-me" />';
						$( '#donutchart_form .filterDiv' ).last().after(complDiv);
						$( '#donutchart_filter'+filCount ).append(removebtn);
						$('#donutchart_filter_count').val(filCount);
					  }
					  $('#donutchart_filter_sel'+filCount+' option[value="'+v["colname"]+'"]').prop('selected', true);
					  var selectedValType = $('option:selected', '#donutchart_filter_sel'+filCount).attr("data-type");
					  var optionString = '<option value="">--Select Operator--</option>';
					  if(selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor") {
					    optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
					  }
					  else if(selectedValType == "character") {
					    optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
					  }
					  $('#donutchart_filter_cond_sel'+filCount).html(optionString);
					  $('#donutchart_filter_cond_sel'+filCount).val(v["operator"]);
					  $('#donutchart_filter_cond_val'+filCount).val(v['required_val']);
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
	/****** /. Scatter Plot Form Submit ****/
	$('body').on('submit', 'form#donutchart_form', function(e) {
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
	  var title = $('input[name="donutchart_title"]').val();
	  var img_dir = $('#imgDir').val();
	  var previs= 0;
	  $('#charts_list_ul li .donut_chart').each(function() {
        var vals = $(this).parents('li').attr('id').split('_');
            if (previs < vals[2]) {
                previs = vals[2];
            }
	  });
	  var donutchartImgNum = previs;
	  var edit_img = "";
	  if (!donutchartImgNum || donutchartImgNum==0) {
        var donutchartImgNum = 1;
	  }
	  else {
		if ($('#edit_input').length != 0) {
		  var donutchartImgNum = $('#edit_input').val();
		  edit_img = "_ed";
		}
		else {
		  donutchartImgNum++;
		}
	  }
	  var chart_title = $('input[name="donutchart_title"]',this).val();
	  var x_col 		= $('select[name="donutchart_xaxis_col"]',this).val();
	  var x_col_type 	= $('select[name="donutchart_xaxis_col"]',this).find(':selected').attr('data-type');
	  var filersCount = $('input[name="donutchart_filter_count"]',this).val();
	  var filterJson = "";
	  var imageName = 'donutchart_'+sketch_id+'_'+donutchartImgNum+edit_img+'.html';	
	  var img_name = img_dir+imageName;
	  for (i = 1; i <= filersCount; i++) {
		if($('#donutchart_filter'+i).length == 0) {
		  continue;
		}
		if($('input[name="donutchart_filter_cond_val'+i+'"]',this).val() == "" ) {
		  continue;
		}
		var colname 	= $('select[name="donutchart_filter_sel'+i+'"]',this).val();
		var operator	= $('select[name="donutchart_filter_cond_sel'+i+'"]',this).val();
		var required_val = $('input[name="donutchart_filter_cond_val'+i+'"]',this).val();
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
  
	  var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "x_col_type":"'+x_col_type+'", ';
	  GlobaldataJson += '"filters":'+filterJsonwithGlobal+'}';
  
	  var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "x_col_type":"'+x_col_type+'", ';
	  dataJson += '"filters":'+filterJson+'}';
  
	  chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=donutchart";
  
	  tooltipPath = '/wiki/donut-chart';
	  var tooltipTitle = "tooltip";
	
	  var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="donutchart_'+donutchartImgNum+'_'+sketch_id+'_'+dataid+'"  data-whatever="Donut Chart" class="showForm donutchart glyphicon glyphicon-pencil edit"></span>';
	  panelhead   += '<span id="donutchart_'+donutchartImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
	  var tabLi_a = title+'<i class="fa fa-arrows"></i>';
	  if($('#edit_input').length != 0) {
		$( '#donutchart_'+donutchartImgNum+' div.panel-body').empty();
		$( '#donutchart_'+donutchartImgNum+' div.panel-heading').html(panelhead);
		$( '#tabs ul li.active a').html(tabLi_a);
	  }
	  else {
		$( ".graphical-area div.tab-pane" ).removeClass( "in active" );
		$( "#tabs ul li" ).removeClass( "active" );
		var donutchartimgHTML = '<div id="donutchart_'+donutchartImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
		donutchartimgHTML += '<div class="panel-body">';
		donutchartimgHTML += '</div></div>';
		$("#tabs ul").prepend('<li id="donutchart_li_'+donutchartImgNum+'" class="active"><a class="donut_chart" data-toggle="tab" href="#donutchart_'+donutchartImgNum+'">'+tabLi_a+'</a></li>');
		$( ".graphical-area" ).append( donutchartimgHTML );
	  }
	  $.ajax({
		type: "POST",
		url: "/tm_donutchart/process/data",
		data: chart_data,
		beforeSend: function()
		{
		  close_analytics_slide();
		  $(".sections_forms").hide(0, on_form_hide);
		  $('#donutchart_'+donutchartImgNum+' div.panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
		  $(window).scrollTop(0);
		},
		success: function (result) {
		  var chrtresult = result.chart_html;
		  var splittedresult = chrtresult.split("|||");
		  if( splittedresult[0] == '0') {
			$('.loading_img').remove();
			$('#donutchart_'+donutchartImgNum+' div.panel-body').append(splittedresult[1]);
			$('#donutchar_img_'+donutchartImgNum).removeClass( "json-data" );
			$('#donutchar_img_'+donutchartImgNum).css( "display", "none" );
			var donutchart_plot_comp_json = '{"ImgType": "donutchart", "ImgID": "donutchart_img_'+donutchartImgNum+'", "ImgName": "'+imageName2+'", "dataset_id": "' +dataid+'", "save_chart": "No", "data":['+dataJson+']}';
			var textAreaJsonField = '<textarea class="form-control json-data" id="donutchart_img_'+donutchartImgNum+'" name="donutchart_img_'+donutchartImgNum+'">'+donutchart_plot_comp_json+'</textarea>';
			$('#donutchart_'+donutchartImgNum+' div.panel-body').append(textAreaJsonField);
			updateChartsData(donutchart_plot_comp_json , 'donutchart_img_'+donutchartImgNum );
			$('.nav-tabs a[href="#charts"]').tab('show');
			//$('#alertmsg').show();
		    $('#save_report').addClass('alert-red');
		  }
		  else {
			$('.loading_img').remove();
			$('#donutchart_'+donutchartImgNum+' div.panel-body').html(result.chart_html);
			var donutchart_plot_comp_json = '{"ImgType": "donutchart", "ImgID": "donutchart_img_'+donutchartImgNum+'", "ImgName": "'+imageName2+'", "dataset_id": "' +dataid+'", "data":['+dataJson+']}';
			var textAreaJsonField = '<textarea class="form-control json-data" id="donutchart_img_'+donutchartImgNum+'" name="donutchart_img_'+donutchartImgNum+'">'+donutchart_plot_comp_json+'</textarea>';
			$('#donutchart_'+donutchartImgNum+' div.panel-body').append(textAreaJsonField);
			updateChartsData(donutchart_plot_comp_json , 'donutchart_img_'+donutchartImgNum );
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
	  if(imageName.includes("_ed")) {
		imageName2 = imageName.replace("_ed", "");
	  }
	  else {
	    imageName2 = imageName;
	  }
	  $(this).find("input[type=text]").val("");
	  return false;
	});

	/****** Addmore filter functionality ****/
	$('body').on('click', '.add-more', function(e) {
	  e.preventDefault();
	  var btnName = $( this ).attr('name');
	  if(btnName == "donutchart_addmore") {
		var next = $('#donutchart_filter_count').val();
		next++;
		var getDom = $("#donutchart_filter_sel1").html();
		var newAnd = '<div id="and_donutchart_filter'+next+'" class="form-group form-inline andDiv">';
		var Andcont = '<span>And</span>';
		var newAndend = '</div>';
		var newfilterdiv = '<div id="donutchart_filter'+next+'" class="form-group form-inline filterDiv">';
		var newdonutchart_filter_sel = '<select class="form-control filterColoumSel" id="donutchart_filter_sel'+next+'" name="donutchart_filter_sel'+next+'">';
		newdonutchart_filter_sel += getDom+'</select>';
		var newdonutchart_filter_cond_sel = '<select class="form-control" id="donutchart_filter_cond_sel'+next+'" name="donutchart_filter_cond_sel'+next+'">';
		newdonutchart_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
		var newIn = '<input type="text" class="form-control" id="donutchart_filter_cond_val'+next+'" name="donutchart_filter_cond_val'+next+'" placeholder="Value">';
		var newfilterdivEnd = '</div>';
		var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newdonutchart_filter_sel+newdonutchart_filter_cond_sel+newIn+newfilterdivEnd;
		var removebtn = '<input type="button" value="x" id="donutchart_'+next+'" class="btn btn-danger remove-me" />';
		$( '#donutchart_form .filterDiv' ).last().after(complDiv);
		$( '#donutchart_filter'+next ).append(removebtn);
		$('#donutchart_filter_count').val(next);
	  }
	});
	/**** (remFilter) **/
	$('#secForms').on('click', '.remove-me', function() {
	  var rmvbtnID = $(this).attr('id');
	  var splitres = rmvbtnID.split("_");
	  if(splitres[0] == 'donutchart' ) {
		$('#and_donutchart_filter'+splitres[1]).remove();
		$('#donutchart_filter'+splitres[1]).remove();
	  }
	});
	function on_form_hide() {
	  $('#secForms').find("input[type=text]").val("");
	  $('#donutchart_form .filterDiv:not(:first)').remove();
	  $('#edit_input').remove();
	}
  });
})(jQuery);