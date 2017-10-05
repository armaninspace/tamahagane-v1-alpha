(function ($) {
  $(document).ready(function() {
	$("body").on("click", '#charts_list_ul li a.crossplot', function(e) {
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
                  $('#cross_' + $imgid + ' .panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
				},
				success: function (result) {
				  $('.loading_img').remove();
                  $('#cross_' + $imgid + ' .panel-body').append(result);
	              setTimeout(function() {
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
    $('body').on('click', '.crosstabs', function() {
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
	  if(chartType == "Cross Tabs") {
		$.ajax({
		  url: Drupal.url('tm_crosstabs/add/form'),
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
			  if(cek){
				var editID = cek;
				var splitID = editID.split("_");
				var chartType = splitID[0];
	  
				var imgID = splitID[1];
				var reportID = splitID[2];
	  
				$('.graphical-area').append('<input class="editInput" type="hidden" name="edit_input" id="edit_input" value="'+imgID+'">');
			   // var textJson = $('#line_img_'+imgID).val();
				var textJson = $('#cross_img_'+imgID).val();
				var obj = jQuery.parseJSON(textJson);
				$.each(obj.data , function(key , value ) {  // The contents inside stars
				  $('#cross_title').val(value['chart_title']);
				  $('#cross_xaxis_col option[value="'+value["x_col"]+'"]').prop('selected', true);
				  $('#cross_yaxis_col option[value="'+value["y_col"]+'"]').prop('selected', true);
				  if(value.filters != '') {
				    var filCount = 1;
				    $.each(value.filters , function(k , v ) {
					  if(filCount > 1) {
						var getDom = $("#cross_filter_sel1").html();
						var newfilterdiv = '<div id="cross_filter'+filCount+'" class="form-group form-inline filterDiv">';
						var newcross_filter_sel = '<select class="form-control filterColoumSel" id="cross_filter_sel'+filCount+'" name="cross_filter_sel'+filCount+'">';
						newcross_filter_sel += getDom+'</select>';
						var newcross_filter_cond_sel = '<select class="form-control" id="cross_filter_cond_sel'+filCount+'" name="cross_filter_cond_sel'+filCount+'">';
						newcross_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
						var newIn = '<input type="text" class="form-control" id="cross_filter_cond_val'+filCount+'" name="cross_filter_cond_val'+filCount+'" placeholder="Value">';
						var newfilterdivEnd = '</div>';
						var complDiv = newfilterdiv+newcross_filter_sel+newcross_filter_cond_sel+newIn+newfilterdivEnd;
						var removebtn = '<input type="button" value="-" id="crosstabs_'+filCount+'" class="btn btn-danger remove-me" />';
						$( '#cross_tabs_form .filterDiv' ).last().after(complDiv);
						$( '#cross_filter'+filCount ).append(removebtn);
						$('#cross_filter_count').val(filCount);
					  }
					  $('#cross_filter_sel'+filCount+' option[value="'+v["colname"]+'"]').prop('selected', true);
					  var selectedValType = $('option:selected', '#cross_filter_sel'+filCount).attr("data-type");
					  var optionString = '<option value="">--Select Operator--</option>';
					  if(selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor") {
						optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
					  }
					  else if(selectedValType == "character"){
						optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
					  }
					  $('#cross_filter_cond_sel'+filCount).html(optionString);
					  $('#cross_filter_cond_sel'+filCount).val(v["operator"]);
					  $('#cross_filter_cond_val'+filCount).val(v['required_val']);
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
	$('body').on('submit', 'form#cross_tabs_form', function(e) {
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
	  var title = $('input[name="cross_title"]').val();
	  var previs= 0;
	  $('#charts_list_ul li .crossplot').each(function() {  /**************to set charts display order***************/
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
		    $("#factor-col-modal").modal('show');
		    $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
		    $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
		    $('body').removeClass("modal-open");
		    $('body').css("padding-right","");
			return false;
	  }
	  if(x_col == y_col) {
		//alert("Both columns should not be same.");
	    $("#not-same-col-modal").modal('show');
	    $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
	    $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
	    $('body').removeClass("modal-open");
	    $('body').css("padding-right","");
		return false;
	  }
	  var filersCount = $('input[name="cross_filter_count"]',this).val();
	  var filterJson = "";
	  var imageName = 'cross_tabs_'+sketch_id+'_'+crossImgNum+edit_img+'.json';
	  var img_name = img_dir+imageName;
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
		if (colname == '' || operator == '') {
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
	  var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "x_col_type":"'+x_col_type+'", "y_col":"'+y_col+'", "y_col_type":"'+y_col_type+'",';
	  GlobaldataJson += '"x_title":"NULL", "y_title":"NULL", "filters":'+filterJsonwithGlobal+'}';
  
	  img_name = img_name.replace(".json", ".html");
	  var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "x_col_type":"'+x_col_type+'", "y_col":"'+y_col+'", "y_col_type":"'+y_col_type+'",';
	  dataJson += '"x_title":"NULL", "y_title":"NULL", "filters":'+filterJson+'}';
	  //console.log(GlobaldataJson);
	  //console.log(dataJson);
	  //return false;
	  chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=crosstabs";
  
	  tooltipPath = '/wiki/cross-tabs';
	  var tooltipTitle = "tooltip";
	  var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="crosstabs_'+crossImgNum+'_'+sketch_id+'_'+dataid+'"  data-whatever="Cross Tabs" class="showForm crosstabs glyphicon glyphicon-pencil edit"></span>';
	  panelhead   += '<span id="cross_'+crossImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
	  var tabLi_a = title+'<i class="fa fa-arrows"></i>';
	  if($('#edit_input').length != 0) {
		$( '#cross_'+crossImgNum+' div.panel-body').empty();
		$( '#cross_'+crossImgNum+' div.panel-heading').html(panelhead);
		$( '#tabs ul li.active a').html(tabLi_a);
	  }
	  else {
		$( ".graphical-area div.tab-pane" ).removeClass( "in active" );
		$( "#tabs ul li" ).removeClass( "active" );
		var CrossimgHTML = '<div id="cross_'+crossImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
		CrossimgHTML += '<div class="panel-body">';
		CrossimgHTML += '</div></div>';
		$("#tabs ul").prepend('<li id="cross_li_'+crossImgNum+'" class="active"><a data-toggle="tab" class="crossplot" href="#cross_'+crossImgNum+'">'+tabLi_a+'</a></li>');
		$( ".graphical-area" ).append( CrossimgHTML );
      }
	  $.ajax({
		type: "POST",
		url: "/tm_crosstabs/process/data",
		data: chart_data,
		beforeSend: function()
		{
		  close_analytics_slide();
		  $(".sections_forms").hide(0, on_form_hide);
		  $('#cross_'+crossImgNum+' div.panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
		  $(window).scrollTop(0);
        },
		success: function (result ) {
		  var chrtresult = result.chart_html;
		  var splittedresult = chrtresult.split("|||");
		  if (splittedresult[0] == '0') {
			$('.loading_img').remove();
			$('#cross_'+crossImgNum+' div.panel-body').append(splittedresult[1]);
			$('#cross_img_'+crossImgNum).removeClass( "json-data" );
			$('#cross_img_'+crossImgNum).css( "display", "none" );
			var cross_plot_comp_json = '{"ImgType": "crosstabs", "ImgID": "cross_img_'+crossImgNum+'", "ImgName": "'+imageName2+'", "dataset_id": "'+dataid+'","save_chart": "No","data":['+dataJson+']}';
			var textAreaJsonField = '<textarea class="form-control json-data" id="cross_img_'+crossImgNum+'" name="cross_img_'+crossImgNum+'">'+cross_plot_comp_json+'</textarea>';
			$('#cross_'+crossImgNum+' div.panel-body').append(textAreaJsonField);
			  updateChartsData(cross_plot_comp_json , 'cross_img_'+crossImgNum );
			$('.nav-tabs a[href="#charts"]').tab('show');
			//$('#alertmsg').show();
		    $('#save_report').addClass('alert-red');
		  }
		  else {
			$('.loading_img').remove();
			$('#cross_'+crossImgNum+' div.panel-body').html(result.chart_html);
			var cross_plot_comp_json = '{"ImgType": "crosstabs", "ImgID": "cross_img_'+crossImgNum+'", "ImgName": "'+imageName2+'", "dataset_id": "'+dataid+'","data":['+dataJson+']}';
			var textAreaJsonField = '<textarea class="form-control json-data" id="cross_img_'+crossImgNum+'" name="cross_img_'+crossImgNum+'">'+cross_plot_comp_json+'</textarea>';
			$('#cross_' + crossImgNum + ' div.panel-body').append(textAreaJsonField);
			updateChartsData(cross_plot_comp_json , 'cross_img_'+crossImgNum );
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
	  if (imageName.includes("_ed")) {
		  imageName2 = imageName.replace("_ed", "");
		  imageName2 = imageName.replace("json", "html");
	  }
	  else {
		  imageName2 = imageName;
		  imageName2 = imageName.replace("json", "html");
	  }
      $(this).find("input[type=text]").val("");
      return false;
	});/****** /. Cross tabs Form Submit ****/
	/****** Addmore filter functionality ****/
	$('body').on('click', '.add-more', function(e) {
	  e.preventDefault();
	  var btnName = $( this ).attr('name');
	  if(btnName == "cross_addmore"){
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
		$( '#cross_tabs_form .filterDiv' ).last().after(complDiv);
		$( '#cross_filter'+next ).append(removebtn);
		$('#cross_filter_count').val(next);
	  }
	});
	/**** (remFilter) **/
	$('#secForms').on('click', '.remove-me', function() {
	  var rmvbtnID = $(this).attr('id');
	  var splitres = rmvbtnID.split("_");
	  if(splitres[0] == 'crosstabs' ) {
		$('#and_cross_filter'+splitres[1]).remove();
		$('#cross_filter'+splitres[1]).remove();
	  }
	});
	function on_form_hide() {
	  $('#secForms').find("input[type=text]").val("");
	  $('#cross_tabs_form .filterDiv:not(:first)').remove();
	  $('#edit_input').remove();
	}
  });
})(jQuery);