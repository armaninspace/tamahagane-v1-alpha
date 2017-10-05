(function ($) {
  $(document).ready(function() {
	$("body").on("click", '#charts_list_ul li a.pieplot', function(e) {
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
			var tabcont = '<div id="pie_' + $imgid + '" class="tab-pane fade' + $tabdivClass + ' myTab panel panel-default"><div class="panel-heading">' + $title + '<a class="tooltipp" title="' + tooltipTitle + '" target="_blank" href="' + tooltipPath + '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
			tabcont += '<span id="piechart_' + $imgid + '_' + $id + '_' + value['dataset_id'] + '" data-whatever="Pie Chart" class="showForm piechart glyphicon glyphicon-pencil edit"></span><span id="pie_' + $imgid + '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
			tabcont += '</div>';
			tabcont += '<div class="panel-body">';
			tabcont += '<textarea class="form-control json-data" id="pie_img_' + $imgid + '" name="pie_img_' + $imgid + '">' + JSON.stringify(value) + '</textarea></div></div>';
			$('.graphical-area').append(tabcont);
			$.ajax({
			  type: "GET",
			  url: $pathForHTml2,
			  beforeSend: function()
			  {
                $('#pie_' + $imgid + ' .panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
			  },
			  success: function (result) {
                $('.loading_img').remove();
                $('#pie_' + $imgid + ' .panel-body').append(result);
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
	$('body').on('click', '.piechart', function() {
      var chartType = $(this).data("whatever");
	  if($(this).hasClass('edit')) {
		var cek=$(this).attr('id');
		var splitID = cek.split("_");
		var nid = splitID[3];
		$('#dataset_val option[data-id="'+splitID[3]+'"]').prop('selected', true);
		$('#dataset_val').attr('disabled', 'disabled');
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
	  if(chartType == "Pie Chart") {
		$.ajax({
		  url: Drupal.url('tm_piechart/add/form'),
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
                var textJson = $('#pie_img_'+imgID).val();
	            var obj = jQuery.parseJSON(textJson);
				$.each(obj.data , function(key , value ) {  // The contents inside stars
				  $('#pie_title').val(value['chart_title']);
				  $('#pie_xaxis_col option[value="'+value["x_col"]+'"]').prop('selected', true);
				  if(value.filters != '') {
					var filCount = 1;
					  $.each(value.filters , function(k , v ) {
						if(filCount > 1) {
						  var getDom = $("#pie_filter_sel1").html();
						  var newfilterdiv = '<div id="pie_filter'+filCount+'" class="form-group form-inline filterDiv">';
						  var newpie_filter_sel = '<select class="form-control filterColoumSel" id="pie_filter_sel'+filCount+'" name="pie_filter_sel'+filCount+'">';
						  newpie_filter_sel += getDom+'</select>';
						  var newpie_filter_cond_sel = '<select class="form-control" id="pie_filter_cond_sel'+filCount+'" name="pie_filter_cond_sel'+filCount+'">';
						  newpie_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
						  var newIn = '<input type="text" class="form-control" id="pie_filter_cond_val'+filCount+'" name="pie_filter_cond_val'+filCount+'" placeholder="Value">';
						  var newfilterdivEnd = '</div>';
						  var complDiv = newfilterdiv+newpie_filter_sel+newpie_filter_cond_sel+newIn+newfilterdivEnd;
						  var removebtn = '<input type="button" value="-" id="piechart_'+filCount+'" class="btn btn-danger remove-me" />';
						  $( '#pie_form .filterDiv' ).last().after(complDiv);
						  $( '#pie_filter'+filCount ).append(removebtn);
						  $('#pie_filter_count').val(filCount);
						}
						$('#pie_filter_sel'+filCount+' option[value="'+v["colname"]+'"]').prop('selected', true);
						var selectedValType = $('option:selected', '#pie_filter_sel'+filCount).attr("data-type");
						var optionString = '<option value="">--Select Operator--</option>';
						if(selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor") {
						  optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
						}
						else if(selectedValType == "character") {
						  optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
						}
						$('#pie_filter_cond_sel'+filCount).html(optionString);
						$('#pie_filter_cond_sel'+filCount).val(v["operator"]);
						$('#pie_filter_cond_val'+filCount).val(v['required_val']);
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
	$('body').on('submit', 'form#pie_form', function(e) {
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
	  var title = $('input[name="pie_title"]').val();
	  var previs= 0;
	  $('#charts_list_ul li .pieplot').each(function() {  /**************to set charts display order***************/
        var vals = $(this).parents('li').attr('id').split('_');
            if(previs < vals[2]){
                previs = vals[2];
            }
	  });
	  var pieImgNum = previs;
	  var edit_img = "";
	  if (!pieImgNum || pieImgNum==0) {
        var pieImgNum = 1;
	  }
	  else {
		if ($('#edit_input').length != 0) {
		  var pieImgNum = $('#edit_input').val();
		  edit_img = "_ed";
		}
		else {
          pieImgNum++;
		}
	  }
	  var chart_title = $('input[name="pie_title"]',this).val();
	  var x_col 		= $('select[name="pie_xaxis_col"]',this).val();
	  var x_col_type 	= $('select[name="pie_xaxis_col"]',this).find(':selected').attr('data-type');
	  var x_title 	= $('input[name="pie_xtitle"]',this).val();
	  var filersCount = $('input[name="pie_filter_count"]',this).val();
	  var filterJson = "";
	  var imageName = 'piechart_'+sketch_id+'_'+pieImgNum+edit_img+'.html';
	  var img_name = img_dir+imageName;
	  for (i = 1; i <= filersCount; i++) {
		if($('#pie_filter'+i).length == 0) {
		  continue;
		}
		if($('input[name="pie_filter_cond_val'+i+'"]',this).val() == "" ) {
		  continue;
		}
		var colname 	= $('select[name="pie_filter_sel'+i+'"]',this).val();
		var operator	= $('select[name="pie_filter_cond_sel'+i+'"]',this).val();
		var required_val = $('input[name="pie_filter_cond_val'+i+'"]',this).val();
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
	  var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "y_col":"NULL", "x_col_type":"'+x_col_type+'",';
	  GlobaldataJson += '"x_title":"'+x_title+'", "y_title":"NULL", "filters":'+filterJsonwithGlobal+'}';
	  var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "y_col":"NULL", "x_col_type":"'+x_col_type+'",';
	  dataJson += '"x_title":"'+x_title+'", "y_title":"NULL", "filters":'+filterJson+'}';
	  //console.log(GlobaldataJson);
	  //console.log(dataJson);
	  //return false;
	  chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=piechart";
	  tooltipPath = '/wiki/pie-chart';
	  var tooltipTitle = "tooltip";
	  var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="piechart_'+pieImgNum+'_'+sketch_id+'_'+dataid+'"  data-whatever="Pie Chart" class="showForm piechart glyphicon glyphicon-pencil edit"></span>';
	  panelhead   += '<span id="pie_'+pieImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
	  var tabLi_a = title+'<i class="fa fa-arrows"></i>';
	  if($('#edit_input').length != 0) {
		$( '#pie_'+pieImgNum+' div.panel-body').empty();
		$( '#pie_'+pieImgNum+' div.panel-heading').html(panelhead);
		$( '#tabs ul li.active a').html(tabLi_a);
	  }
	  else {
		$( ".graphical-area div.tab-pane" ).removeClass( "in active" );
		$( "#tabs ul li" ).removeClass( "active" );
		var PieimgHTML = '<div id="pie_'+pieImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
		PieimgHTML += '<div class="panel-body">';
		PieimgHTML += '</div></div>';
		$("#tabs ul").prepend('<li id="pie_li_'+pieImgNum+'" class="active"><a class="pieplot" data-toggle="tab" href="#pie_'+pieImgNum+'">'+tabLi_a+'</a></li>');
        $( ".graphical-area" ).append( PieimgHTML );
	  }
	  $.ajax({
		type: "POST",
		url: "/tm_piechart/process/data",
		data: chart_data,
		beforeSend: function()
		{
		  close_analytics_slide();
		  $(".sections_forms").hide(0, on_form_hide);
		  $('#pie_'+pieImgNum+' div.panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
		  $(window).scrollTop(0);
		},
        success: function (result) {
		  var chrtresult = result.chart_html;
		  var splittedresult = chrtresult.split("|||");
		  if (splittedresult[0] == '0') {
			$('.loading_img').remove();
			$('#pie_'+pieImgNum+' div.panel-body').append(splittedresult[1]);
			$('#pie_img_'+pieImgNum).removeClass( "json-data" );
			$('#pie_img_'+pieImgNum).css( "display", "none" );
			var pie_comp_json = '{"ImgType": "piechart", "ImgID": "pie_img_'+pieImgNum+'", "ImgName": "'+imageName2+'", "dataset_id": "'+dataid+'","save_chart": "No", "data":['+dataJson+']}';
			var textAreaJsonField = '<textarea class="form-control json-data" id="pie_img_'+pieImgNum+'" name="pie_img_'+pieImgNum+'">'+pie_comp_json+'</textarea>';
			$('#pie_'+pieImgNum+' div.panel-body').append(textAreaJsonField);
			updateChartsData(pie_comp_json , 'pie_img_'+pieImgNum );
			$('.nav-tabs a[href="#charts"]').tab('show');
			//$('#alertmsg').show();
		    $('#save_report').addClass('alert-red');
		  }
		  else {
			$('.loading_img').remove();
			$('#pie_'+pieImgNum+' div.panel-body').html(result.chart_html);
			var pie_comp_json = '{"ImgType": "piechart", "ImgID": "pie_img_'+pieImgNum+'", "ImgName": "'+imageName2+'", "dataset_id": "'+dataid+'", "data":['+dataJson+']}';
			var textAreaJsonField = '<textarea class="form-control json-data" id="pie_img_'+pieImgNum+'" name="pie_img_'+pieImgNum+'">'+pie_comp_json+'</textarea>';
			$('#pie_' + pieImgNum + ' div.panel-body').append(textAreaJsonField);
			updateChartsData(pie_comp_json , 'pie_img_'+pieImgNum );
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
	  if(btnName == "pie_addmore") {
		var next = $('#pie_filter_count').val();
		next++;
		var getDom = $("#pie_filter_sel1").html();
		var newAnd = '<div id="and_pie_filter'+next+'" class="form-group form-inline andDiv">';
		var Andcont = '<span>And</span>';
		var newAndend = '</div>';
		var newfilterdiv = '<div id="pie_filter'+next+'" class="form-group form-inline filterDiv">';
		var newpie_filter_sel = '<select class="form-control filterColoumSel" id="pie_filter_sel'+next+'" name="pie_filter_sel'+next+'">';
		newpie_filter_sel += getDom+'</select>';
		var newpie_filter_cond_sel = '<select class="form-control" id="pie_filter_cond_sel'+next+'" name="pie_filter_cond_sel'+next+'">';
		newpie_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
		var newIn = '<input type="text" class="form-control" id="pie_filter_cond_val'+next+'" name="pie_filter_cond_val'+next+'" placeholder="Value">';
		var newfilterdivEnd = '</div>';
		var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newpie_filter_sel+newpie_filter_cond_sel+newIn+newfilterdivEnd;
		var removebtn = '<input type="button" value="x" id="piechart_'+next+'" class="btn btn-danger remove-me" />';
		$( '#pie_form .filterDiv' ).last().after(complDiv);
		$( '#pie_filter'+next ).append(removebtn);
		$('#pie_filter_count').val(next);
	  }
	});
	/**** (remFilter) **/
	$('#secForms').on('click', '.remove-me', function() {
	  var rmvbtnID = $(this).attr('id');
	  var splitres = rmvbtnID.split("_");
	  if(splitres[0] == 'piechart' ) {
		$('#and_pie_filter'+splitres[1]).remove();
		$('#pie_filter'+splitres[1]).remove();
	  }
	});
	function on_form_hide() {
	  $('#secForms').find("input[type=text]").val("");
	  $('#pie_form .filterDiv:not(:first)').remove();
	  $('#edit_input').remove();
	}
  });
})(jQuery);