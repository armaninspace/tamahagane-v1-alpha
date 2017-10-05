(function ($) {
  $(document).ready(function() {
    $("body").on("click", '#charts_list_ul li a.narrative_text', function(e){
	  close_analytics_slide();
	});
    /**
    * Histogram chart operator click
    */
    paper.on('cell:pointerclick', function (cellView, evt, x, y) {
      var opTypeVal = cellView.model.attributes.operatorType;
	  if(opTypeVal == 'Narrative Text') {
	    $('.param_link, #surfacechartdiv-container, #crosstabsDiv-container, #2dscatterDiv-container, #AreachartDiv-container, #3dScatterDiv-container, #histogramchartdiv-container, #linechartDiv-container, #PiechartDiv-container, #BubblechartDiv-container,#BoxplotDiv-container').hide();
	    $("#narrativetxtdiv-container , .chart_link").show();
	    $('.nav-tabs a[href="#chart-div"]').tab('show');
	    var hiddenId = document.getElementById("param-id").value;
	    var getCellById = graph.getCell(hiddenId);
	    var currFilter = paper.findViewByModel(getCellById);
	    var sourceJsonData = currFilter.model.attributes.inputData;
	    var droot_host = window.location.hostname;
	    var droot = '/var/www/' + droot_host;
	    var filePath = "file_path=" + droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
	    var csvfile = droot + "/htdocs/sites/default/files/operator_files/" + sourceJsonData;
	    var file = filePath.toString();
	    $("#chartfile").val(csvfile);
	    $("#chartcellid").val(hiddenId);
	    $.ajax({
	      url: Drupal.url('tm_narrativetext/add/form'),
	      type: "POST",
          beforeSend: function() {
		      $('#secForms .loadimg').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
		    },
		    success: function (response) {
			  $('.loading_img').remove();
                                            $('#edit_input').remove();
			  tinyMCE.remove();
			  var $wrapper = $('#narrativetxtdiv');
			  $wrapper.html(response.form_html);
			  tinyMCE.init({
		        mode : "textareas",
			    theme : "modern",
			    force_br_newlines : false,
			    forced_root_block : '',
			    selector : "#shtml_html",
			  });
			  $('.selectpicker').selectpicker('refresh');
		    }
		  });
	    }
	  });

	  $('body').on('click', '.narrativetext.edit', function () {
		  /*$("#chart-edit-modal").modal('show');
		  $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
		  $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
		  $('body').removeClass("modal-open");
		  $('body').css("padding-right", "");*/
		  open_form_slide();
		  var cek = $(this).attr('id');
		  var editID = cek;
		  var file_path;
		  var splitID = editID.split("_");
		  var chartType = splitID[0];
		  var imgID = splitID[1];
		  var reportID = splitID[2];

		  $.ajax({
			  url: Drupal.url('tm_narrativetext/add/form'),
			  type: "POST",
			  beforeSend: function () {
				  $('#secForms .loadimg').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
			  },
			  success: function (response) {
				  $('.loading_img').remove();
				  tinyMCE.remove();
				  var $wrapper = $('#secForms');
				  if (response.form_empty) {
					  $wrapper.html(response.form_empty);
				  }
				  else {
					  $wrapper.html(response.form_html);
					  tinyMCE.init({
						  mode: "textareas",
						  theme: "modern",
						  force_br_newlines: false,
						  forced_root_block: '',
						  selector: "#shtml_html",
					  });

					  $('.selectpicker').selectpicker('refresh');
					  $('#edit_input').remove();
					  if (cek) {
						  var editID = cek;
						  var splitID = editID.split("_");
						  var chartType = splitID[0];
						  var imgID = splitID[1];
						  var reportID = splitID[2];
						  $('.graphical-area').append('<input class="editInput" type="hidden" name="edit_input" id="edit_input" value="' + imgID + '">');
						  var textJson = $('#shtml_img_' + imgID).val();
						  var obj = jQuery.parseJSON(textJson);
						  $.each(obj.data, function (key, value) {
							  $('#shtml_title').val(value['chart_title']);
							  //alert(value['htmlData']);
							  setTimeout(function () {
								  tinyMCE.get('shtml_html').setContent(value['htmlData']);
							  }, 1000);
						  });
					  }
					  Drupal.attachBehaviors($wrapper[0]);
				  }
			  }
		  });
		  $('.nav-tabs a[href="#design"]').tab('show');
		  //open_analytics_slide();
	  });

	$('body').on('submit', 'form#static_html_form', function(e) {
	  var container_id = $(this).parent().attr('id');
	  var sketch_id = $(".node--type-sketch.node--view-mode-full").data('history-node-id');
	  var dataid = $("#chartcellid").val();
	  var title = $('input[name="shtml_title"]').val();
	  var previs= 0;
	  $('#charts_list_ul li .narrative_text').each(function() {
        var vals = $(this).parents('li').attr('id').split('_');
          if (previs < vals[2]) {
            previs = vals[2];
          }
	  });
	  var shtmlImgNum = previs.length;
	  if(!shtmlImgNum || shtmlImgNum==0) {
        var shtmlImgNum = 1;
	  }
	  else {
		if($('#edit_input').length != 0){
		  var shtmlImgNum = $('#edit_input').val();
		}
		else {
		  shtmlImgNum++;
		}
	  }
	  var htmlContent = tinyMCE.get('shtml_html').getContent()
	  if (htmlContent == '') {
	    $("#html-cont-modal").modal('show');
	    $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
	    $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
	    $('body').removeClass("modal-open");
	    $('body').css("padding-right","");
		return false;
	  }
	  var resHTML = htmlContent.replace(/"/g, "'");
	  resHTML = resHTML.replace(/(?:\r\n|\r|\n)/g, '<br />');
	  var dataJson = '{"chart_title":"'+title+'", "htmlData":"'+resHTML+'"}';
	  tooltipPath = '/wiki/narrative-text';
	  var tooltipTitle = 'tooltip';
	  var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="shtml_'+shtmlImgNum+'_'+sketch_id+'"  data-whatever="Narrative Text" class="showForm narrativetext glyphicon glyphicon-pencil edit"></span>';
	  panelhead   += '<span id="shtml_'+shtmlImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
	  var tabLi_a = title+'<i class="fa fa-arrows"></i>';
	  if($('#edit_input').length != 0) {
		$( '#shtml_'+shtmlImgNum+' div.panel-body').empty();
		$( '#shtml_'+shtmlImgNum+' div.panel-heading').html(panelhead);
		$( '#tabs ul li.active a').html(tabLi_a);
	  }
	  else {
	    $("#chartsMsg-modal #msg").html('<h6>Text generated successfully and listed in charts List.</h6>');
	    $( "#tabs ul li" ).removeClass( "active" );
		var ShtmlimgHTML = '<div id="shtml_'+shtmlImgNum+'" class="tab-pane fade myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
		ShtmlimgHTML += '<div class="panel-body">';
		ShtmlimgHTML += '</div></div>';
		$("#tabs ul").prepend('<li id="shtml_li_'+shtmlImgNum+'" class=""><a class="narrative_text" data-toggle="tab" href="#shtml_'+shtmlImgNum+'">'+tabLi_a+'</a></li>');
		$( ".graphical-area" ).append( ShtmlimgHTML );
	    $('#parameter-area-modal').modal('hide');
		$('#narrativetxtdiv').empty();
		  $('#save_report').addClass('alert-red');
		  setTimeout(function() {
		    $("#chartsMsg-modal").modal('show');
		    setModalBackdrop();
		  }, 1000);
	  }
	  close_analytics_slide();
	  var shtml_comp_json = '{"ImgType": "shtml", "ImgID": "shtml_img_'+shtmlImgNum+'", "data":['+dataJson+']}';
	  var textAreaJsonField = '<textarea class="form-control json-data" id="shtml_img_'+shtmlImgNum+'" name="shtml_img_'+shtmlImgNum+'">'+shtml_comp_json+'</textarea>';
	  updateChartsData(shtml_comp_json , 'shtml_img_'+shtmlImgNum );
	  $(".sections_forms").hide(0, on_form_hide);
	  $('#shtml_'+shtmlImgNum+' div.panel-body').append(htmlContent);
	  $('#shtml_'+shtmlImgNum+' div.panel-body').append(textAreaJsonField);
	  $(this).find("input[type=text], textarea").val("");
	  $(window).scrollTop(0);
	  $('.nav-tabs a[href="#charts"]').tab('show');
	  $('#save_report').addClass('alert-red');
	  close_form_slide();
	  return false;
    });
	function on_form_hide() {
	  $('#narrativetxtdiv').find("input[type=text]").val("");
      tinymce.get('shtml_html').setContent('');
	  $('#edit_input').remove();
	}
  });
})(jQuery);