(function ($) {
  $(document).ready(function() {
    $("body").on("click", '#charts_list_ul li a.spmatrixplot', function(e) {
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
			var tooltipPath = '/wiki/spmatrix-chart';
			var tooltipTitle = "tooltip";
			var $imgid = splitID[2];
			var tabcont = '<div id="spmatrix_' + $imgid + '" class="tab-pane fade' + $tabdivClass + ' myTab panel panel-default"><div class="panel-heading">' + $title + '<a class="tooltipp" title="' + tooltipTitle + '" target="_blank" href="' + tooltipPath + '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
			tabcont += '<span id="spmatrix_' + $imgid + '_' + $id + '_' + value['dataset_id'] + '" data-whatever="Spmatrix" class="showForm spmatrixchart glyphicon glyphicon-pencil edit"></span><span id="spmatrix_' + $imgid + '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
			tabcont += '</div>';
			tabcont += '<div class="panel-body">';
			tabcont += '<textarea class="form-control json-data" id="spmatrix_img_' + $imgid + '" name="spmatrix_img_' + $imgid + '">' + JSON.stringify(value) + '</textarea></div></div>';
			$('.graphical-area').append(tabcont);
			$.ajax({
			  type: "GET",
			  url: $pathForHTml2,
			  beforeSend: function()
			  {
				close_analytics_slide();
				$('#spmatrix_' + $imgid + ' .panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
			  },
			  success: function (result) {
			    $('.loading_img').remove();
				var markup = '<div class="devmode-wrapper">' +
					'<a class="devmode" href="#" style=""> Code & Analytics <span id="spmatrixchart_' + $imgid + '" class="glyphicon glyphicon-link devmod"></span></a>' +
					'</div>';
				var formUrl = '/mc_devmode/load/' + value['dataset_id'] + '/' + $id + '/' + 'spmatrixchart' + '/' + $imgid;
				$('#spmatrix_' + $imgid + ' .panel-body').append(result);
				setTimeout(function() {
				  window.HTMLWidgets.staticRender();
				  Drupal.attachBehaviors();
			    }, 1000);
			   }
			 });
      setTimeout(function() {

      }, 3000);

		   }
         });
       }
    });
    $('body').on('click', '.spmatrixchart', function() {
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
      if(chartType == "Spmatrix") {
        $.ajax({
          url: Drupal.url('tm_spmatrix/add/form'),
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
                var textJson = $('#spmatrix_img_' + imgID).val();
                var obj = jQuery.parseJSON(textJson);
                $.each(obj.data, function (key, value) {  // The contents inside stars
                  $('#spmatrix_title').val(value['chart_title']);
                  var colNames = value['x_col'];
                  var singleColName = colNames.split(",");
                  $('#spmatrix_xaxis_col').selectpicker('val', singleColName);
                  $('#spmatrix_xtitle').val(value['x_title']);
                  if (value.filters != '') {
                    var filCount = 1;
                    $.each(value.filters, function (k, v) {
                      if (filCount > 1) {
                        var getDom = $("#spmatrix_filter_sel1").html();
                        var newfilterdiv = '<div id="spmatrix_filter' + filCount + '" class="form-group form-inline filterDiv">';
                        var newspmatrixchart_filter_sel = '<select class="form-control filterColoumSel" id="spmatrix_filter_sel' + filCount + '" name="spmatrix_filter_sel' + filCount + '">';
                        newspmatrixchart_filter_sel += getDom + '</select>';
                        var newspmatrixchart_filter_cond_sel = '<select class="form-control" id="spmatrix_filter_cond_sel' + filCount + '" name="spmatrix_filter_cond_sel' + filCount + '">';
                        newspmatrixchart_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
                        var newIn = '<input type="text" class="form-control" id="spmatrix_filter_cond_val' + filCount + '" name="spmatrix_filter_cond_val' + filCount + '" placeholder="Value">';
                        var newfilterdivEnd = '</div>';
                        var complDiv = newfilterdiv + newspmatrixchart_filter_sel + newspmatrixchart_filter_cond_sel + newIn + newfilterdivEnd;
                        var removebtn = '<input type="button" value="-" id="spmatrix_' + filCount + '" class="btn btn-danger remove-me" />';
                        $('#spmatrix_chart_form .filterDiv').last().after(complDiv);
                        $('#spmatrix_filter' + filCount).append(removebtn);
                        $('#spmatrix_filter_count').val(filCount);
                      }
                      $('#spmatrix_filter_sel' + filCount + ' option[value="' + v["colname"] + '"]').prop('selected', true);
                      var selectedValType = $('option:selected', '#spmatrix_filter_sel' + filCount).attr("data-type");
                      var optionString = '<option value="">--Select Operator--</option>';
                      if (selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor") {
                        optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
                      }
                      else if (selectedValType == "character") {
                        optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
                      }
                      $('#spmatrix_filter_cond_sel' + filCount).html(optionString);
                      $('#spmatrix_filter_cond_sel' + filCount).val(v["operator"]);
                      $('#spmatrix_filter_cond_val' + filCount).val(v['required_val']);
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
     * Scatter plot matrix Form Submit (SPS)
     */
    $('body').on('submit', 'form#spmatrix_chart_form', function(e) {
      e.preventDefault();
      var sketch_id = $(".node--type-sketch.node--view-mode-full").data('history-node-id');
      var dataid=$('#dataset_val option:selected').attr('data-id');
      var globalFilterJson = "";
      var csv_path = "";
      csv_path = $('#dataset_val option:selected').val();
      if (!csv_path || csv_path=="") {
        //alert("Please select dataset");
        $("#dataset-modal").modal('show');
        $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
        $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
        $('body').removeClass("modal-open");
        $('body').css("padding-right","");
        return false;
      }
      var img_dir = $('#imgDir').val();
      var title = $('input[name="spmatrix_title"]').val();
      var previs= 0;
      $('#charts_list_ul li .spmatrixplot').each(function() {  /**************to set charts display order***************/
        var vals = $(this).parents('li').attr('id').split('_');
            if(previs < vals[2]){
                previs = vals[2];
            }
      });
      var spmatrixImgNum = previs;
      var edit_img = "";
      if (!spmatrixImgNum || spmatrixImgNum==0) {
        var spmatrixImgNum = 1;
      }
      else {
        if ($('#edit_input').length != 0) {
          var spmatrixImgNum = $('#edit_input').val();
          edit_img = "_ed";
        }
        else {
          spmatrixImgNum++;
        }
      }
      var chart_title = $('input[name="spmatrix_title"]',this).val();
      var x_cols 	  = $('select[name="spmatrix_xaxis_col"]',this).val();
      var x_col_types = "";
      var count = $("#spmatrix_xaxis_col :selected").length;
      //alert(count);
      if (count <= 10) {

      }
      else {
        //alert("You can't select more than 10 inputs");
        $("#inputs-modal").modal('show');
        $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
        $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
        $('body').removeClass("modal-open");
        $('body').css("padding-right","");
        return false;
      }
      $('#spmatrix_xaxis_col option:selected').each(function() {
        x_col_types +=$(this).attr('data-type')+",";
      });
      x_col_types = x_col_types.replace(/,\s*$/, ""); /**** Removing Last Comma *****/
      var x_title 		= $('input[name="spmatrix_xtitle"]',this).val();
      var filersCount = $('input[name="spmatrix_filter_count"]',this).val();
      var filterJson = "";
      var imageName = 'spmatrixplot_'+sketch_id+'_'+spmatrixImgNum+edit_img+'.html';
      var img_name = img_dir+imageName;
      for (i = 1; i <= filersCount; i++) {
        if ($('#spmatrix_filter'+i).length == 0) {
          continue;
        }
        if ($.trim($('input[name="spmatrix_filter_cond_val'+i+'"]',this).val()) == "" ) {
          continue;
        }
        var colname = $('select[name="spmatrix_filter_sel'+i+'"]',this).val();
        var operator = $('select[name="spmatrix_filter_cond_sel'+i+'"]',this).val();
        var required_val = $('input[name="spmatrix_filter_cond_val'+i+'"]',this).val();
        if (colname == '' ||  operator == '') {
          //alert('Column name & operators are required to apply filter');
          $("#inputs-modal").modal('show');
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
      var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_cols+'", "x_col_type":"'+x_col_types+'",';
      GlobaldataJson += '"x_title":"'+x_title+'", "filters":'+filterJsonwithGlobal+'}';
      var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_cols+'", "x_col_type":"'+x_col_types+'", ';
      dataJson += '"x_title":"'+x_title+'", "filters":'+filterJson+'}';
      chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=spmatrixchart";
      var tooltipTitle = 'Get Help';
      var tooltipPath = '/wiki/spmatrix-plot';
      var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="spmatrixchart_'+spmatrixImgNum+'_'+sketch_id+'_'+dataid+'" data-whatever="Spmatrix" class="showForm spmatrixchart glyphicon glyphicon-pencil edit"></span>';
      panelhead   += '<span id="spmatrix_'+spmatrixImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
      var tabLi_a = title+'<i class="fa fa-arrows"></i>';
      if ($('#edit_input').length != 0) {
        $( '#spmatrix_'+spmatrixImgNum+' div.panel-body').empty();
        $( '#spmatrix_'+spmatrixImgNum+' div.panel-heading').html(panelhead);
        $( '#tabs ul li.active a').html(tabLi_a);
      }
      else {
        $( ".graphical-area div.tab-pane" ).removeClass( "in active" );
        $( "#tabs ul li" ).removeClass( "active" );
        var spmatriximgHTML = '<div id="spmatrix_'+spmatrixImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
        spmatriximgHTML += '<div class="panel-body">';
        spmatriximgHTML += '</div></div>';
        $("#tabs ul").prepend('<li id="spmatrix_li_'+spmatrixImgNum+'" class="active"><a data-toggle="tab" class="spmatrixplot" href="#spmatrix_'+spmatrixImgNum+'">'+tabLi_a+'</a></li>');
        $( ".graphical-area" ).append( spmatriximgHTML );
      }
      $.ajax({
        type: "POST",
        url: "/tm_spmatrix/process/data",
        data: chart_data,
        beforeSend: function() {
          $(".sections_forms").hide(0, on_form_hide);
          $('#spmatrix_'+spmatrixImgNum+' div.panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
          $(window).scrollTop(0);
          close_analytics_slide();
        },
        success: function (result) {
          var chrtresult = result.chart_html;
          var splittedresult = chrtresult.split("|||");
          if (splittedresult[0] == '0') {
            $('.loading_img').remove();
            $('#spmatrix_'+spmatrixImgNum+' div.panel-body').append(splittedresult[1]);
            $('#spmatrix_img_'+spmatrixImgNum).removeClass( "json-data" );
            $('#spmatrix_img_'+spmatrixImgNum).css( "display", "none" );
            var spmatrix_plot_comp_json = '{"ImgType": "spmatrixplot", "ImgID": "spmatrix_img_'+spmatrixImgNum+'", "ImgName": "'+imageName2+'","dataset_id": "'+dataid+'","save_chart": "No", "data":['+dataJson+']}';
            var textspmatrixJsonField = '<textarea class="form-control json-data" id="spmatrix_img_'+spmatrixImgNum+'" name="spmatrix_img_'+spmatrixImgNum+'">'+spmatrix_plot_comp_json+'</textarea>';
            $('#spmatrix_'+spmatrixImgNum+' div.panel-body').append(textspmatrixJsonField);
            updateChartsData(spmatrix_plot_comp_json , 'spmatrix_img_'+spmatrixImgNum );
            $('.nav-tabs a[href="#charts"]').tab('show');
            //$('#alertmsg').show();
            $('#save_report').addClass('alert-red');
          }
          else {
            $('.loading_img').remove();
            $('#spmatrix_' + spmatrixImgNum + ' div.panel-body').html(result.chart_html);
            var spmatrix_plot_comp_json = '{"ImgType": "spmatrixplot", "ImgID": "spmatrix_img_' + spmatrixImgNum + '", "ImgName": "' + imageName2 + '","dataset_id": "' +dataid+'", "data":[' + dataJson + ']}';
            var textspmatrixJsonField = '<textarea class="form-control json-data" id="spmatrix_img_' + spmatrixImgNum + '" name="spmatrix_img_' + spmatrixImgNum + '">' + spmatrix_plot_comp_json + '</textarea>';
            $('#spmatrix_' + spmatrixImgNum + ' div.panel-body').append(textspmatrixJsonField);
            updateChartsData(spmatrix_plot_comp_json , 'spmatrix_img_'+spmatrixImgNum );
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
    });
	/**
	 * Addmore filter functionality
	 */
    $('body').on('click', '.add-more', function(e) {
      e.preventDefault();
      var btnName = $( this ).attr('name');
      if (btnName == "spmatrix_addmore") {
        var next = $('#spmatrix_filter_count').val();
        next++;
        var getDom = $("#spmatrix_filter_sel1").html();
        var newAnd = '<div id="and_spmatrix_filter'+next+'" class="form-group form-inline andDiv">';
        var Andcont = '<span>And</span>';
        var newAndend = '</div>';
        var newfilterdiv = '<div id="spmatrix_filter'+next+'" class="form-group form-inline filterDiv">';
        var newspmatrix_filter_sel = '<select class="form-control filterColoumSel" id="spmatrix_filter_sel'+next+'" name="spmatrix_filter_sel'+next+'">';
        newspmatrix_filter_sel += getDom+'</select>';
        var newspmatrix_filter_cond_sel = '<select class="form-control" id="spmatrix_filter_cond_sel'+next+'" name="spmatrix_filter_cond_sel'+next+'">';
        newspmatrix_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
        var newIn = '<input type="text" class="form-control" id="spmatrix_filter_cond_val'+next+'" name="spmatrix_filter_cond_val'+next+'" placeholder="Value">';
        var newfilterdivEnd = '</div>';
        var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newspmatrix_filter_sel+newspmatrix_filter_cond_sel+newIn+newfilterdivEnd;
        var removebtn = '<input type="button" value="x" id="spmatrix_'+next+'" class="btn btn-danger remove-me" />';
        $( '#spmatrix_chart_form .filterDiv' ).last().after(complDiv);
        $( '#spmatrix_filter'+next ).append(removebtn);
        $('#spmatrix_filter_count').val(next);
      }
    });
    /**
     * (remFilter)
     */
    $('#secForms').on('click', '.remove-me', function() {
      var rmvbtnID = $(this).attr('id');
      var splitres = rmvbtnID.split("_");
      if (splitres[0] == 'spmatrix' ) {
        $('#and_spmatrix_filter'+splitres[1]).remove();
        $('#spmatrix_filter'+splitres[1]).remove();
      }
    });
    function on_form_hide() {
      $('#secForms').find("input[type=text]").val("");
      $('#spmatrix_plot_form .filterDiv:not(:first)').remove();
      $('#edit_input').remove();
    }
  });
})(jQuery);