(function ($) {
  $(document).ready(function() {
    $("body").on("click", '#charts_list_ul li a.histoplot', function(e) {
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
            var tooltipPath = '/wiki/histogram';
            var tooltipTitle = "tooltip";
            var $imgid = splitID[2];
            var tabcont = '<div id="histo_' + $imgid + '" class="tab-pane fade' + $tabdivClass + ' myTab panel panel-default"><div class="panel-heading">' + $title + '<a class="tooltipp" title="' + tooltipTitle + '" target="_blank" href="' + tooltipPath + '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
            tabcont += '<span id="histogram_' + $imgid + '_' + $id + '_' + value['dataset_id'] + '" data-whatever="Histogram" class="showForm histogram glyphicon glyphicon-pencil edit"></span><span id="histo_' + $imgid + '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
            tabcont += '</div>';
            tabcont += '<div class="panel-body">';
            tabcont += '<textarea class="form-control json-data" id="histo_img_' + $imgid + '" name="histo_img_' + $imgid + '">' + JSON.stringify(value) + '</textarea></div></div>';
            $('.graphical-area').append(tabcont);
            $.ajax({
              type: "GET",
              url: $pathForHTml2,
              beforeSend: function()
              {
				close_analytics_slide();
				$('#histo_' + $imgid + ' .panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
              },
              success: function (result) {
                $('.loading_img').remove();
                var markup = '<div class="devmode-wrapper">' +
                    '<a class="devmode" href="#" style=""> Code & Analytics <span id="histogram_' + $imgid + '" class="glyphicon glyphicon-link devmod"></span></a>' +
                    '</div>';
                var formUrl = '/mc_devmode/load/' + value['dataset_id'] + '/' + $id + '/' + 'histogram' + '/' + $imgid;
                $('#histo_' + $imgid + ' .panel-body').append(result);
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
    $('body').on('click', '.histogram', function() {
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
      if(chartType == "Histogram") {
        $.ajax({
          url: Drupal.url('tm_histogram/add/form'),
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
            if(response.form_empty){
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
                var textJson = $('#histo_img_' + imgID).val();
                var obj = jQuery.parseJSON(textJson);
                $.each(obj.data, function (key, value) {  // The contents inside stars
                  $('#histo_title').val(value['chart_title']);
                  var colNames = value['x_col'];
                  var singleColName = colNames.split(",");
                  $('#histo_xaxis_col').selectpicker('val', singleColName);
                  $('#histo_xtitle').val(value['x_title']);
                  if (value.filters != '') {
                    var filCount = 1;
                    $.each(value.filters, function (k, v) {
                      if (filCount > 1) {
                        var getDom = $("#histo_filter_sel1").html();
                        var newfilterdiv = '<div id="histo_filter' + filCount + '" class="form-group form-inline filterDiv">';
                        var newhistogram_filter_sel = '<select class="form-control filterColoumSel" id="histo_filter_sel' + filCount + '" name="histo_filter_sel' + filCount + '">';
                        newhistogram_filter_sel += getDom + '</select>';
                        var newhistogram_filter_cond_sel = '<select class="form-control" id="histo_filter_cond_sel' + filCount + '" name="histo_filter_cond_sel' + filCount + '">';
                        newhistogram_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
                        var newIn = '<input type="text" class="form-control" id="histo_filter_cond_val' + filCount + '" name="histo_filter_cond_val' + filCount + '" placeholder="Value">';
                        var newfilterdivEnd = '</div>';
                        var complDiv = newfilterdiv + newhistogram_filter_sel + newhistogram_filter_cond_sel + newIn + newfilterdivEnd;
                        var removebtn = '<input type="button" value="-" id="histo_' + filCount + '" class="btn btn-danger remove-me" />';
                        $('#histogram_form .filterDiv').last().after(complDiv);
                        $('#histo_filter' + filCount).append(removebtn);
                        $('#histo_filter_count').val(filCount);
                      }
                      $('#histo_filter_sel' + filCount + ' option[value="' + v["colname"] + '"]').prop('selected', true);
                      var selectedValType = $('option:selected', '#histo_filter_sel' + filCount).attr("data-type");
                      var optionString = '<option value="">--Select Operator--</option>';
                      if (selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor") {
                        optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
                      }
                      else if (selectedValType == "character") {
                        optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
                      }
                      $('#histo_filter_cond_sel' + filCount).html(optionString);
                      $('#histo_filter_cond_sel' + filCount).val(v["operator"]);
                      $('#histo_filter_cond_val' + filCount).val(v['required_val']);
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
     * Histogram Form Submit (SPS)
     */
    $('body').on('submit', 'form#histogram_form', function(e) {
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
      var title = $('input[name="histo_title"]').val();
      var previs= 0;
      $('#charts_list_ul li .histoplot').each(function() {  /**************to set charts display order***************/
        var vals = $(this).parents('li').attr('id').split('_');
            if(previs < vals[2]){
                previs = vals[2];
            }
      });
      var histoImgNum = previs;
      var edit_img = "";
      if (!histoImgNum || histoImgNum==0) {
        var histoImgNum = 1;
      }
      else {
        if ($('#edit_input').length != 0) {
          var histoImgNum = $('#edit_input').val();
          edit_img = "_ed";
        }
        else {
          histoImgNum++;
        }
      }
      var chart_title = $('input[name="histo_title"]',this).val();
      var x_cols 		= $('select[name="histo_xaxis_col"]',this).val();
      var x_col_types = "";
      $('#histo_xaxis_col option:selected').each(function(){
        x_col_types +=$(this).attr('data-type')+",";
      });
      x_col_types = x_col_types.replace(/,\s*$/, ""); /**** Removing Last Comma *****/
      var x_title 		= $('input[name="histo_xtitle"]',this).val();
      var filersCount = $('input[name="histo_filter_count"]',this).val();
      var filterJson = "";
      var imageName = 'histogram_'+sketch_id+'_'+histoImgNum+edit_img+'.html';
      var img_name = img_dir+imageName;
      for (i = 1; i <= filersCount; i++) {
        if ($('#histo_filter'+i).length == 0) {
          continue;
        }
        if ($.trim($('input[name="histo_filter_cond_val'+i+'"]',this).val()) == "" ) {
          continue;
        }
        var colname = $('select[name="histo_filter_sel'+i+'"]',this).val();
        var operator = $('select[name="histo_filter_cond_sel'+i+'"]',this).val();
        var required_val = $('input[name="histo_filter_cond_val'+i+'"]',this).val();
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
      var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_cols+'", "x_col_type":"'+x_col_types+'",';
      GlobaldataJson += '"x_title":"'+x_title+'", "filters":'+filterJsonwithGlobal+'}';
      var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_cols+'", "x_col_type":"'+x_col_types+'", ';
      dataJson += '"x_title":"'+x_title+'", "filters":'+filterJson+'}';
      chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=histogram";
      var tooltipTitle = 'Get Help';
      var tooltipPath = '/wiki/histogram';
      var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="histogram_'+histoImgNum+'_'+sketch_id+'_'+dataid+'" data-whatever="Histogram" class="showForm histogram glyphicon glyphicon-pencil edit"></span>';
      panelhead   += '<span id="histo_'+histoImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
      var tabLi_a = title+'<i class="fa fa-arrows"></i>';
      if ($('#edit_input').length != 0) {
        $( '#histo_'+histoImgNum+' div.panel-body').empty();
        $( '#histo_'+histoImgNum+' div.panel-heading').html(panelhead);
        $( '#tabs ul li.active a').html(tabLi_a);
      }
      else {
        $( ".graphical-area div.tab-pane" ).removeClass( "in active" );
        $( "#tabs ul li" ).removeClass( "active" );
        var histoimgHTML = '<div id="histo_'+histoImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
        histoimgHTML += '<div class="panel-body">';
        histoimgHTML += '</div></div>';
        $("#tabs ul").prepend('<li id="histo_li_'+histoImgNum+'" class="active"><a data-toggle="tab" class="histoplot" href="#histo_'+histoImgNum+'">'+tabLi_a+'</a></li>');
        $( ".graphical-area" ).append( histoimgHTML );
      }
      $.ajax({
        type: "POST",
        url: "/tm_histogram/process/data",
        data: chart_data,
        beforeSend: function() {
            close_analytics_slide();
          $(".sections_forms").hide(0, on_form_hide);
          $('#histo_'+histoImgNum+' div.panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
          $(window).scrollTop(0);
          close_analytics_slide();
        },
        success: function (result) {
          var chrtresult = result.chart_html;
          var splittedresult = chrtresult.split("|||");
          if (splittedresult[0] == '0') {
            $('.loading_img').remove();
            $('#histo_'+histoImgNum+' div.panel-body').append(splittedresult[1]);
            $('#histo_img_'+histoImgNum).removeClass( "json-data" );
            $('#histo_img_'+histoImgNum).css( "display", "none" );
            var histogram_comp_json = '{"ImgType": "histgram", "ImgID": "histo_img_'+histoImgNum+'", "ImgName": "'+imageName2+'","dataset_id": "'+dataid+'","save_chart": "No", "data":['+dataJson+']}';
            var texthistoJsonField = '<textarea class="form-control json-data" id="histo_img_'+histoImgNum+'" name="histo_img_'+histoImgNum+'">'+histogram_comp_json+'</textarea>';
            $('#histo_'+histoImgNum+' div.panel-body').append(texthistoJsonField);
            updateChartsData(histogram_comp_json , 'histo_img_'+histoImgNum );
            $('.nav-tabs a[href="#charts"]').tab('show');
            //$('#alertmsg').show();
            $('#save_report').addClass('alert-red');
          }
          else {
            $('.loading_img').remove();
            $('#histo_' + histoImgNum + ' div.panel-body').html(result.chart_html);
            var histogram_comp_json = '{"ImgType": "histogram", "ImgID": "histo_img_' + histoImgNum + '", "ImgName": "' + imageName2 + '","dataset_id": "' +dataid+'", "data":[' + dataJson + ']}';
            var texthistoJsonField = '<textarea class="form-control json-data" id="histo_img_' + histoImgNum + '" name="histo_img_' + histoImgNum + '">' + histogram_comp_json + '</textarea>';
            $('#histo_' + histoImgNum + ' div.panel-body').append(texthistoJsonField);
            updateChartsData(histogram_comp_json , 'histo_img_'+histoImgNum );
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
      if (btnName == "histo_addmore") {
        var next = $('#histo_filter_count').val();
        next++;
        var getDom = $("#histo_filter_sel1").html();
        var newAnd = '<div id="and_histo_filter'+next+'" class="form-group form-inline andDiv">';
        var Andcont = '<span>And</span>';
        var newAndend = '</div>';
        var newfilterdiv = '<div id="histo_filter'+next+'" class="form-group form-inline filterDiv">';
        var newhisto_filter_sel = '<select class="form-control filterColoumSel" id="histo_filter_sel'+next+'" name="histo_filter_sel'+next+'">';
        newhisto_filter_sel += getDom+'</select>';
        var newhisto_filter_cond_sel = '<select class="form-control" id="histo_filter_cond_sel'+next+'" name="histo_filter_cond_sel'+next+'">';
        newhisto_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
        var newIn = '<input type="text" class="form-control" id="histo_filter_cond_val'+next+'" name="histo_filter_cond_val'+next+'" placeholder="Value">';
        var newfilterdivEnd = '</div>';
        var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newhisto_filter_sel+newhisto_filter_cond_sel+newIn+newfilterdivEnd;
        var removebtn = '<input type="button" value="x" id="histo_'+next+'" class="btn btn-danger remove-me" />';
        $( '#histogram_form .filterDiv' ).last().after(complDiv);
        $( '#histo_filter'+next ).append(removebtn);
        $('#histo_filter_count').val(next);
      }
    });
    /**
     * (remFilter)
     */
    $('#secForms').on('click', '.remove-me', function() {
      var rmvbtnID = $(this).attr('id');
      var splitres = rmvbtnID.split("_");
      if (splitres[0] == 'histo' ) {
        $('#and_histo_filter'+splitres[1]).remove();
        $('#histo_filter'+splitres[1]).remove();
      }
    });
    function on_form_hide() {
      $('#secForms').find("input[type=text]").val("");
      $('#histogram_form .filterDiv:not(:first)').remove();
      $('#edit_input').remove();
    }
  });
})(jQuery);