(function ($) {
  $(document).ready(function() {
    $("body").on("click", '#charts_list_ul li a.narrative_text', function(e){
	  close_analytics_slide();
	});
	$('body').on('click', '.narrativetext', function() {
      var chartType = $(this).data("whatever");
	  if($(this).hasClass('edit')) {
		var cek=$(this).attr('id');
		var splitID = cek.split("_");
	  }
	  if(chartType == "Narrative Text") {
		$.ajax({
		  url: Drupal.url('tm_narrativetext/add/form'),
		  type: "POST",
		  beforeSend: function()
		  {
			$('#secForms .loadimg').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
		  },
		  success: function (response) {
			$('.loading_img').remove();
			tinyMCE.remove();
			var $wrapper = $('#secForms');
			if(response.form_empty) {
			  $wrapper.html(response.form_empty);
			}
			else {
			  $wrapper.html(response.form_html);
			  tinyMCE.init({
				mode : "textareas",
				theme : "modern",
				force_br_newlines : false,
				//force_p_newlines : false,
				forced_root_block : '',
				selector : "#shtml_html",
			  });
			  $('.selectpicker').selectpicker('refresh');
			  $('#edit_input').remove();
			  if(cek){
				var editID = cek;
				var splitID = editID.split("_");
				var chartType = splitID[0];
				var imgID = splitID[1];
				$('.graphical-area').append('<input class="editInput" type="hidden" name="edit_input" id="edit_input" value="' + imgID + '">');
				var textJson = $('#shtml_img_'+imgID).val();
				var obj = jQuery.parseJSON(textJson);
				$.each(obj.data , function(key , value ){  // The contents inside stars
				  $('#shtml_title').val(value['chart_title']);
				  //alert(value['htmlData']);
				  setTimeout(function() {
					tinyMCE.get('shtml_html').setContent(value['htmlData']);
				  }, 1000);
				});
			  }
			  Drupal.attachBehaviors($wrapper[0]);
			}
		  }
		});
	    $('.nav-tabs a[href="#design"]').tab('show');
	    open_analytics_slide();
        Drupal.attachBehaviors();
	  } //end if
    });
	/****** Scatter Plot Form Submit (SPS) ****/
	/****** /. Scatter Plot Form Submit ****/
    $('body').on('submit', 'form#static_html_form', function(e) {
	  var sketch_id = $(".node--type-sketch.node--view-mode-full").data('history-node-id');
	  var title = $('input[name="shtml_title"]').val();
	  var previs= 0;
	  $('#charts_list_ul li .narrative_text').each(function() {  /**************to set charts display order***************/
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
		//alert("Must provide with an HTML content to proceed.");
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
		$( ".graphical-area div.tab-pane" ).removeClass( "in active" );
		$( "#tabs ul li" ).removeClass( "active" );
		var ShtmlimgHTML = '<div id="shtml_'+shtmlImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
		ShtmlimgHTML += '<div class="panel-body">';
		ShtmlimgHTML += '</div></div>';
		$("#tabs ul").prepend('<li id="shtml_li_'+shtmlImgNum+'" class="active"><a class="narrative_text" data-toggle="tab" href="#shtml_'+shtmlImgNum+'">'+tabLi_a+'</a></li>');
		$( ".graphical-area" ).append( ShtmlimgHTML );
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
	  //$('#alertmsg').show();
	  $('#save_report').addClass('alert-red');
	  return false;
    });/****** /. Cross tabs Form Submit ****/
	function on_form_hide() {
	  $('#secForms').find("input[type=text]").val("");
      tinymce.get('shtml_html').setContent('');
	  $('#edit_input').remove();
	}
  });
})(jQuery);