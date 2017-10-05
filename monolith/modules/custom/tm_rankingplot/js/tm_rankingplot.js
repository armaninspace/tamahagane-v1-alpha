(function ($) {
  $(document).ready(function() {
	$("body").on("click", '#charts_list_ul li a.rankingchart', function(e) {
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
			var tabcont = '<div id="rankingplot_' + $imgid + '" class="tab-pane fade' + $tabdivClass + ' myTab panel panel-default"><div class="panel-heading">' + $title + '<a class="tooltipp" title="' + tooltipTitle + '" target="_blank" href="' + tooltipPath + '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
			tabcont += '<span id="rankingplot_' + $imgid + '_' + $id + '_' + value['dataset_id'] + '" data-whatever="Ranking Plot" class="showForm rankingplot glyphicon glyphicon-pencil edit"></span><span id="rankingplot_' + $imgid + '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
			tabcont += '</div>';
			tabcont += '<div class="panel-body">';
			tabcont += '<textarea class="form-control json-data" id="rankingplot_img_' + $imgid + '" name="rankingplot_img_' + $imgid + '">' + JSON.stringify(value) + '</textarea></div></div>';
			$('.graphical-area').append(tabcont);
			$.ajax({
			  type: "GET",
			  url: $pathForHTml2,
			  beforeSend: function()
			  {
			    $('#rankingplot_' + $imgid + ' .panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
			  },
			  success: function (result) {
				$('.loading_img').remove();
				$('#rankingplot_' + $imgid + ' .panel-body').append(result);
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
	$('body').on('click', '.rankingplot', function() {
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
	  if(chartType == "Ranking Plot") {
		$.ajax({
		  url: Drupal.url('tm_rankingplot/add/form'),
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
				var textJson = $('#rankingplot_img_'+imgID).val();
				var obj = jQuery.parseJSON(textJson);
				$.each(obj.data , function(key , value ) {  // The contents inside stars
				  $('#rankingplot_title').val(value['chart_title']);
				  $('#rankingplot_xaxis_col option[value="'+value["x_col"]+'"]').prop('selected', true);
				  $('#rankingplot_xtitle').val(value['x_title']);
				  if(value.filters != '') {
					var filCount = 1;
					$.each(value.filters , function(k , v ) {
					  var extrafilterlength = $( "#rankingplot_filter"+filCount ).length;
					  if(filCount > 1 && extrafilterlength == 0) {
						var getDom = $("#rankingplot_filter_sel1").html();
						var newfilterdiv = '<div id="rankingplot_filter'+filCount+'" class="form-group form-inline filterDiv">';
						var newrankingplot_filter_sel = '<select class="form-control filterColoumSel" id="rankingplot_filter_sel'+filCount+'" name="rankingplot_filter_sel'+filCount+'">';
						newrankingplot_filter_sel += getDom+'</select>';
						var newrankingplot_filter_cond_sel = '<select class="form-control" id="rankingplot_filter_cond_sel'+filCount+'" name="rankingplot_filter_cond_sel'+filCount+'">';
						newrankingplot_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
						var newIn = '<input type="text" class="form-control" id="rankingplot_filter_cond_val'+filCount+'" name="rankingplot_filter_cond_val'+filCount+'" placeholder="Value">';
						var newfilterdivEnd = '</div>';
						var complDiv = newfilterdiv+newrankingplot_filter_sel+newrankingplot_filter_cond_sel+newIn+newfilterdivEnd;
						var removebtn = '<input type="button" value="-" id="rankingplot_'+filCount+'" class="btn btn-danger remove-me" />';
						$( '#rankingplot_form .filterDiv' ).last().after(complDiv);
						$( '#rankingplot_filter'+filCount ).append(removebtn);
						$('#rankingplot_filter_count').val(filCount);
					  }
					  $('#rankingplot_filter_sel'+filCount+' option[value="'+v["colname"]+'"]').prop('selected', true);
					  var selectedValType = $('option:selected', '#rankingplot_filter_sel'+filCount).attr("data-type");
					  var optionString = '<option value="">--Select Operator--</option>';
					  if(selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor"  || selectedValType == "logical") {
					    optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
					  }
					  else if(selectedValType == "character") {
					    optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
					  }
					  $('#rankingplot_filter_cond_sel'+filCount).html(optionString);
					  $('#rankingplot_filter_cond_sel'+filCount).val(v["operator"]);
					  $('#rankingplot_filter_cond_val'+filCount).val(v['required_val']);
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
	$('body').on('submit', 'form#rankingplot_form', function(e) {
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
	  var title = $('input[name="rankingplot_title"]').val();
	  var previs= 0;
	  $('#charts_list_ul li .rankingchart').each(function() {
        var vals = $(this).parents('li').attr('id').split('_');
            if(previs < vals[2]){
                previs = vals[2];
            }
	  });
	  var rankingplotImgNum = previs.length;
	  var edit_img = "";
	  if (!rankingplotImgNum || rankingplotImgNum==0) {
	    var rankingplotImgNum = 1;
	  }
	  else {
		if ($('#edit_input').length != 0) {
		  var rankingplotImgNum = $('#edit_input').val();
		  edit_img = "_ed";
		}
		else {
	      rankingplotImgNum++;
		}
	  }
	  var chart_title = $('input[name="rankingplot_title"]',this).val();
	  var x_col 		= $('select[name="rankingplot_xaxis_col"]',this).val();
	  var x_col_type 	= $('select[name="rankingplot_xaxis_col"]',this).find(':selected').attr('data-type');
	  var x_title 	= $('input[name="rankingplot_xtitle"]',this).val();
	  var filersCount = $('input[name="rankingplot_filter_count"]',this).val();
	  var filterJson = "";
	  var imageName = 'rankingplot_'+sketch_id+'_'+rankingplotImgNum+edit_img+'.html';
	  var img_name = img_dir+imageName;
	  for (i = 1; i <= filersCount; i++) {
		if($('#rankingplot_filter'+i).length == 0) {
		  continue;
		}
		if($('input[name="rankingplot_filter_cond_val'+i+'"]',this).val() == "" ) {
		  continue;
		}
		var colname 	= $('select[name="rankingplot_filter_sel'+i+'"]',this).val();
		var operator	= $('select[name="rankingplot_filter_cond_sel'+i+'"]',this).val();
		var required_val = $('input[name="rankingplot_filter_cond_val'+i+'"]',this).val();
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
  
	  var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "x_col_type":"'+x_col_type+'",';
	  GlobaldataJson += '"x_title":"'+x_title+'", "filters":'+filterJsonwithGlobal+'}';
  
	  var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "x_col_type":"'+x_col_type+'", ';
	  dataJson += '"x_title":"'+x_title+'", "filters":'+filterJson+'}';
  
	  chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=rankingplot";
	  tooltipPath = '/wiki/ranking-plot';
	  var tooltipTitle = "tooltip";
	  var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="rankingplot_'+rankingplotImgNum+'_'+sketch_id+'_'+dataid+'"  data-whatever="Ranking Plot" class="showForm rankingplot glyphicon glyphicon-pencil edit"></span>';
	  panelhead   += '<span id="rankingplot_'+rankingplotImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
	  var tabLi_a = title+'<i class="fa fa-arrows"></i>';
	  if($('#edit_input').length != 0) {
		$( '#rankingplot_'+rankingplotImgNum+' div.panel-body').empty();
		$( '#rankingplot_'+rankingplotImgNum+' div.panel-heading').html(panelhead);
		$( '#tabs ul li.active a').html(tabLi_a);
	  }
	  else {
		$( ".graphical-area div.tab-pane" ).removeClass( "in active" );
		$( "#tabs ul li" ).removeClass( "active" );
		var rankingplotimgHTML = '<div id="rankingplot_'+rankingplotImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
		rankingplotimgHTML += '<div class="panel-body">';
		rankingplotimgHTML += '</div></div>';
		$("#tabs ul").prepend('<li id="rankingplot_li_'+rankingplotImgNum+'" class="active"><a class="rankingchart" data-toggle="tab" href="#rankingplot_'+rankingplotImgNum+'">'+tabLi_a+'</a></li>');
		$( ".graphical-area" ).append( rankingplotimgHTML );
	  }
	  $.ajax({
		type: "POST",
		url: "/tm_rankingplot/process/data",
		data: chart_data,
		beforeSend: function()
		{
		  close_analytics_slide();
		  $(".sections_forms").hide(0, on_form_hide);
		  $('#rankingplot_'+rankingplotImgNum+' div.panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
		  $(window).scrollTop(0);
		},
		success: function (result) {
		  var chrtresult = result.chart_html;
		  var splittedresult = chrtresult.split("|||");
		  if (splittedresult[0] == '0') {
			$('.loading_img').remove();
			$('#rankingplot_'+rankingplotImgNum+' div.panel-body').append(splittedresult[1]);
			$('#rankingplot_img_'+rankingplotImgNum).removeClass( "json-data" );
			$('#rankingplot_img_'+rankingplotImgNum).css( "display", "none" );
			var rankingplot_plot_comp_json = '{"ImgType": "rankingplot", "ImgID": "rankingplot_img_'+rankingplotImgNum+'", "ImgName": "'+imageName2+'", "dataset_id": "'+dataid+'","save_chart": "No", "data":['+dataJson+']}';
			var textAreaJsonField = '<textarea class="form-control json-data" id="rankingplot_img_'+rankingplotImgNum+'" name="rankingplot_img_'+rankingplotImgNum+'">'+rankingplot_plot_comp_json+'</textarea>';
			$('#rankingplot_'+rankingplotImgNum+' div.panel-body').append(textAreaJsonField);
			updateChartsData(rankingplot_plot_comp_json , 'rankingplot_img_'+rankingplotImgNum );
			$('.nav-tabs a[href="#charts"]').tab('show');
			//$('#alertmsg').show();
		    $('#save_report').addClass('alert-red');
		  }
		  else {
			$('.loading_img').remove();
			$('#rankingplot_'+rankingplotImgNum+' div.panel-body').html(result.chart_html);
			var rankingplot_plot_comp_json = '{"ImgType": "rankingplot", "ImgID": "rankingplot_img_'+rankingplotImgNum+'", "ImgName": "'+imageName2+'", "dataset_id": "'+dataid+'", "data":['+dataJson+']}';
			var textAreaJsonField = '<textarea class="form-control json-data" id="rankingplot_img_'+rankingplotImgNum+'" name="rankingplot_img_'+rankingplotImgNum+'">'+rankingplot_plot_comp_json+'</textarea>';
			$('#rankingplot_'+rankingplotImgNum+' div.panel-body').append(textAreaJsonField);
			updateChartsData(rankingplot_plot_comp_json , 'rankingplot_img_'+rankingplotImgNum );
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
	  if(btnName == "rankingplot_addmore") {
		var next = $('#rankingplot_filter_count').val();
		next++;
		var getDom = $("#rankingplot_filter_sel1").html();
		var newAnd = '<div id="and_rankingplot_filter'+next+'" class="form-group form-inline andDiv">';
		var Andcont = '<span>And</span>';
		var newAndend = '</div>';
		var newfilterdiv = '<div id="rankingplot_filter'+next+'" class="form-group form-inline filterDiv">';
		var newrankingplot_filter_sel = '<select class="form-control filterColoumSel" id="rankingplot_filter_sel'+next+'" name="rankingplot_filter_sel'+next+'">';
		newrankingplot_filter_sel += getDom+'</select>';
		var newrankingplot_filter_cond_sel = '<select class="form-control" id="rankingplot_filter_cond_sel'+next+'" name="rankingplot_filter_cond_sel'+next+'">';
		newrankingplot_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
		var newIn = '<input type="text" class="form-control" id="rankingplot_filter_cond_val'+next+'" name="rankingplot_filter_cond_val'+next+'" placeholder="Value">';
		var newfilterdivEnd = '</div>';
		var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newrankingplot_filter_sel+newrankingplot_filter_cond_sel+newIn+newfilterdivEnd;
		var removebtn = '<input type="button" value="x" id="rankingplot_'+next+'" class="btn btn-danger remove-me" />';
		$( '#rankingplot_form .filterDiv' ).last().after(complDiv);
		$( '#rankingplot_filter'+next ).append(removebtn);
		$('#rankingplot_filter_count').val(next);
	  }
	});
	/**** (remFilter) ****/
	$('#secForms').on('click', '.remove-me', function() {
	  var rmvbtnID = $(this).attr('id');
	  var splitres = rmvbtnID.split("_");
	  if(splitres[0] == 'rankingplot' ) {
		$('#and_rankingplot_filter'+splitres[1]).remove();
		$('#rankingplot_filter'+splitres[1]).remove();
	  }
	});
	function on_form_hide() {
	  $('#secForms').find("input[type=text]").val("");
	  $('#rankingplot_form .filterDiv:not(:first)').remove();
	  $('#edit_input').remove();
	}
  });
})(jQuery);