(function ($) {
  $(document).ready(function() {
    $("body").on("click", '#charts_list_ul li a.word_cloud', function(e) {
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
			var tooltipPath = '/wiki/word-cloud';
			var tooltipTitle = "tooltip";
			var $imgid = splitID[2];
			var tabcont = '<div id="wcloud_' + $imgid + '" class="tab-pane fade' + $tabdivClass + ' myTab panel panel-default"><div class="panel-heading">' + $title + '<a class="tooltipp" title="' + tooltipTitle + '" target="_blank" href="' + tooltipPath + '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
			tabcont += '<span id="wcloud_' + $imgid + '_' + $id + '_' + value['dataset_id'] + '" data-whatever="Word Cloud" class="showForm wordcloud glyphicon glyphicon-pencil edit"></span><span id="wcloud_' + $imgid + '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
			tabcont += '</div>';
			tabcont += '<div class="panel-body">';
			tabcont += '<div class="panel-body"><img src="/sites/default/files/projectChartImages/'+ imgname + '">';
			tabcont += '<textarea class="form-control json-data" id="wcloud_img_' + $imgid + '" name="wcloud_img_' + $imgid + '">' + JSON.stringify(value) + '</textarea></div></div>';
			$('.graphical-area').append(tabcont);
			Drupal.attachBehaviors();
          }
        });
      }
    });
    $('body').on('click', '.wordcloud', function() {
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
      if(chartType == "Word Cloud") {
        $.ajax({
          url: Drupal.url('tm_wordcloud/add/form'),
          type: "POST",
          data: "file_path="+file_path,
         // contentType: "application/json; charset=utf-8",
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
              if (cek) {
                var editID = cek;
                var splitID = editID.split("_");
                var chartType = splitID[0];
                var imgID = splitID[1];
                var reportID = splitID[2];
                $('.graphical-area').append('<input class="editInput" type="hidden" name="edit_input" id="edit_input" value="' + imgID + '">');
                var textJson = $('#wcloud_img_' + imgID).val();
                var obj = jQuery.parseJSON(textJson);
                $.each(obj.data, function (key, value) {  // The contents inside stars
				  $('#wcloud_title').val(value['chart_title']);
				  var colNames = value['cols'];
				  var singleColName = colNames.split(",");
				  $('#wcloud_xaxis_col').selectpicker('val', singleColName);
				  var numItems = $('#word_cloud_form .filterDiv').length;
				  if (value.filters != '') {
					var filCount = 1;
					$.each(value.filters, function (k, v) {
					  if (filCount > 1) {
						var getDom = $("#wcloud_filter_sel1").html();
						var newfilterdiv = '<div id="wcloud_filter'+filCount+'" class="form-group form-inline filterDiv">';
						var newwcloud_filter_sel = '<select class="form-control filterColoumSel" id="wcloud_filter_sel'+filCount+'" name="wcloud_filter_sel'+filCount+'">';
						newwcloud_filter_sel += getDom+'</select>';
						var newwcloud_filter_cond_sel = '<select class="form-control" id="wcloud_filter_cond_sel'+filCount+'" name="wcloud_filter_cond_sel'+filCount+'">';
						newwcloud_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
						var newIn = '<input type="text" class="form-control" id="wcloud_filter_cond_val'+filCount+'" name="wcloud_filter_cond_val'+filCount+'" placeholder="Value">';
						var newfilterdivEnd = '</div>';
						var complDiv = newfilterdiv+newwcloud_filter_sel+newwcloud_filter_cond_sel+newIn+newfilterdivEnd;
						var removebtn = '<input type="button" value="-" id="wcloud_'+filCount+'" class="btn btn-danger remove-me" />';
						$( '#word_cloud_form .filterDiv' ).last().after(complDiv);
						$( '#wcloud_filter'+filCount ).append(removebtn);
						$('#wcloud_filter_count').val(filCount);
					  }
					  $('#wcloud_filter_sel'+filCount+' option[value="'+v["colname"]+'"]').prop('selected', true);
					  var selectedValType = $('option:selected', '#wcloud_filter_sel'+filCount).attr("data-type");
					  var optionString = '<option value="">--Select Operator--</option>';
					  if(selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor") {
						optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
					  }
					  else if(selectedValType == "character") {
						optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
					  }
					  $('#wcloud_filter_cond_sel'+filCount).html(optionString);
					  $('#wcloud_filter_cond_sel'+filCount).val(v["operator"]);
					  $('#wcloud_filter_cond_val'+filCount).val(v['required_val']);
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
    * Area Chart Form Submit (SPS)
    */
    $('body').on('submit', 'form#word_cloud_form', function(e) {
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
      var title = $('input[name="wcloud_title"]').val();
      var previs= 0;
      $('#charts_list_ul li .word_cloud').each(function() {  /**************to set charts display order***************/
        var vals = $(this).parents('li').attr('id').split('_');
            if(previs < vals[2]){
                previs = vals[2];
            }
      });
      var wcloudImgNum = previs;
      var edit_img = "";
      if (!wcloudImgNum || wcloudImgNum==0) {
        var wcloudImgNum = 1;
      }
      else {
        if ($('#edit_input').length != 0) {
          var wcloudImgNum = $('#edit_input').val();
          edit_img = "_ed";
        }
        else {
          wcloudImgNum++;
        }
      }
	  var chart_title = $('input[name="wcloud_title"]',this).val();
	  var cols 		= $('select[name="wcloud_xaxis_col"]',this).val();
	  var filersCount = $('input[name="wcloud_filter_count"]',this).val();
	  var filterJson = "";
	  var imageName = 'wcloud_'+sketch_id+'_'+wcloudImgNum+edit_img+'.png';
	  var img_name = img_dir+imageName;
	  for (i = 1; i <= filersCount; i++) {
		if($('#wcloud_filter'+i).length == 0) {
		  continue;
		}
		if($('input[name="wcloud_filter_cond_val'+i+'"]',this).val() == "" ) {
		  continue;
		}
		var colname 	= $('select[name="wcloud_filter_sel'+i+'"]',this).val();
		var operator	= $('select[name="wcloud_filter_cond_sel'+i+'"]',this).val();
		var required_val = $('input[name="wcloud_filter_cond_val'+i+'"]',this).val();
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

	  var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "cols":"'+cols+'",';
	  GlobaldataJson += '"filters":'+filterJsonwithGlobal+'}';

	  var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "cols":"'+cols+'",';
	  dataJson += '"filters":'+filterJson+'}';
	  chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=wcloud";
      var tooltipTitle = 'Get Help';
	  tooltipPath = '/wiki/word-cloud';
	  var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="wcloud_'+wcloudImgNum+'_'+sketch_id+'_'+dataid+'"  data-whatever="Word Cloud" class="showForm wordcloud glyphicon glyphicon-pencil edit"></span>';
	  panelhead   += '<span id="wcloud_'+wcloudImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';

	  var tabLi_a = title+'<i class="fa fa-arrows"></i>';
	  if($('#edit_input').length != 0) {
		$( '#wcloud_'+wcloudImgNum+' div.panel-body').empty();
		$( '#wcloud_'+wcloudImgNum+' div.panel-heading').html(panelhead);
		$( '#tabs ul li.active a').html(tabLi_a);
	  }
      else {
        $( ".graphical-area div.tab-pane" ).removeClass( "in active" );
        $( "#tabs ul li" ).removeClass( "active" );
        var WcloudimgHTML = '<div id="wcloud_'+wcloudImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
		WcloudimgHTML += '<div class="panel-body">';
		WcloudimgHTML += '</div></div>';
	    $("#tabs ul").prepend('<li id="wcloud_li_'+wcloudImgNum+'" class="active"><a class="word_cloud" data-toggle="tab" href="#wcloud_'+wcloudImgNum+'">'+tabLi_a+'</a></li>');
		$( ".graphical-area" ).append( WcloudimgHTML );
      }
      $.ajax({
        type: "POST",
        url: "/tm_wordcloud/process/data",
        data: chart_data,
        beforeSend: function() {
          close_analytics_slide();
          $(".sections_forms").hide(0, on_form_hide);
          $('#wcloud_'+wcloudImgNum+' div.panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
          $(window).scrollTop(0);
          close_analytics_slide();
        },
        success: function (result) {
		  $('.loading_img').remove();
			if( result.chart_html.trim() == '1') {
			  $('#wcloud_'+wcloudImgNum+' div.panel-body').append('<img src="/sites/default/files/projectChartImages/'+imageName+'?'+$.now()+'">');
			}
			else {
			  $('.loading_img').remove();
			  $('#wcloud_'+wcloudImgNum+' div.panel-body').append('RESULT NOT GENERATED. Please review your filters');
			}
			var wcloud_comp_json = '{"ImgType": "wordcloud", "ImgID": "wcloud_img_'+wcloudImgNum+'", "ImgName": "'+imageName2+'","dataset_id": "'+dataid+'", "data":['+dataJson+']}';
			var textAreaJsonField = '<textarea class="form-control json-data" id="wcloud_img_'+wcloudImgNum+'" name="wcloud_img_'+wcloudImgNum+'">'+wcloud_comp_json+'</textarea>';
            $('#wcloud_' + wcloudImgNum + ' div.panel-body').append(textAreaJsonField);
            updateChartsData(wcloud_comp_json , 'wcloud_img_'+wcloudImgNum );
            $('.nav-tabs a[href="#charts"]').tab('show');
            //$('#alertmsg').show();
            $('#save_report').addClass('alert-red');
            setTimeout(function() {
            //  window.HTMLWidgets.staticRender();
              Drupal.attachBehaviors();
            }, 1000);
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
	/**
	 * Addmore filter functionality
	 */
    $('body').on('click', '.add-more', function(e) {
      e.preventDefault();
      var btnName = $( this ).attr('name');
      if (btnName == "wcloud_addmore") {
		var next = $('#wcloud_filter_count').val();
		next++;
		var getDom = $("#wcloud_filter_sel1").html();
		var newAnd = '<div id="and_wcloud_filter'+next+'" class="form-group form-inline andDiv">';
		var Andcont = '<span>And</span>';
		var newAndend = '</div>';
		var newfilterdiv = '<div id="wcloud_filter'+next+'" class="form-group form-inline filterDiv">';
		var newwcloud_filter_sel = '<select class="form-control filterColoumSel" id="wcloud_filter_sel'+next+'" name="wcloud_filter_sel'+next+'">';
		newwcloud_filter_sel += getDom+'</select>';
		var newwcloud_filter_cond_sel = '<select class="form-control" id="wcloud_filter_cond_sel'+next+'" name="wcloud_filter_cond_sel'+next+'">';
		newwcloud_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
		var newIn = '<input type="text" class="form-control" id="wcloud_filter_cond_val'+next+'" name="wcloud_filter_cond_val'+next+'" placeholder="Value">';
		var newfilterdivEnd = '</div>';
		var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newwcloud_filter_sel+newwcloud_filter_cond_sel+newIn+newfilterdivEnd;
		var removebtn = '<input type="button" value="x" id="wcloud_'+next+'" class="btn btn-danger remove-me" />';
		$( '#word_cloud_form .filterDiv' ).last().after(complDiv);
		$( '#wcloud_filter'+next ).append(removebtn);
		$('#wcloud_filter_count').val(next);
      }
    });
    /**
     * (remFilter)
     */
    $('#secForms').on('click', '.remove-me', function() {
      var rmvbtnID = $(this).attr('id');
      var splitres = rmvbtnID.split("_");
      if (splitres[0] == 'wcloud' ) {
        $('#and_wcloud_filter'+splitres[1]).remove();
        $('#wcloud_filter'+splitres[1]).remove();
      }
    });
	function on_form_hide() {
      $('#secForms').find("input[type=text]").val("");
      $('#word_cloud_form .filterDiv:not(:first)').remove();
      $('#edit_input').remove();
    }
  });
})(jQuery);