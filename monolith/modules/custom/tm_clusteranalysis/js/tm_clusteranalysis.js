(function ($) {
  $(document).ready(function() {
    $("body").on("click", '#charts_list_ul li a.cluster_analysis', function(e) {
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
            var ppp = 'htdocs/sites/default/files/projectChartImages/tcluster_120_1.txt';
            var $imgid = splitID[2];
            var divid = "tcluster_pbody_"+$imgid;
            var tabcont = '<div id="tcluster_' + $imgid + '" class="tab-pane fade' + $tabdivClass + ' myTab panel panel-default"><div class="panel-heading">' + $title + '<a class="tooltipp" title="' + tooltipTitle + '" target="_blank" href="' + tooltipPath + '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
            tabcont += '<span id="tcluster_' + $imgid + '_' + $id + '_' + value['dataset_id'] + '" data-whatever="Topic Based Text Clustering" class="showForm clusteranalysis glyphicon glyphicon-pencil edit"></span><span id="tcluster_' + $imgid + '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
            tabcont += '</div>';
            tabcont += '<div class="panel-body"><div id="tcluster_pbody_' + $imgid + '" style="height:480px; min-width:100%;"></div>';
            tabcont += '<div class="refined-topscroll"><div class="scroll-div">&nbsp;</div></div>';
            tabcont += '<div id="refinedResults_' + $imgid + '" class="refinedResults"></div><div class="cluster-json">';
            tabcont += '<textarea class="form-control json-data" id="tcluster_img_' + $imgid + '" name="tcluster_img_' + $imgid + '">' + JSON.stringify(value) + '</textarea></div></div>';
            $('.graphical-area').append(tabcont);
            $.ajax({
              type: "POST",
              url: $pathForHTml2,
              beforeSend: function()
              {
                $('#tcluster_' + $imgid + ' .panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
              },
              success: function (result) {
                var jsonData = jQuery.parseJSON(result);
                var dataAr = JSON.stringify(jsonData.dataArr);
                var clusterJson = jsonData.cluster_json_Arr;
                var txtarea = '<textarea style="display:none;" id="listingsclusterJson_' + $imgid + '" class="form-control" name="listingsclusterJson_' + $imgid + '">' + dataAr + '</textarea></div>';
                $('#tcluster_'+$imgid).append(txtarea);
                $('.loading_img').remove();
                tclustermake(clusterJson , divid, $imgid);
              }
            });
          }
        });
      }
    });
    $('body').on('click', '.clusteranalysis', function() {
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
      if(chartType == "Topic Based Text Clustering") {
        $.ajax({
          url: Drupal.url('tm_clusteranalysis/add/form'),
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
                var textJson = $('#tcluster_img_'+imgID).val();
                var obj = jQuery.parseJSON(textJson);
                $.each(obj.data , function(key , value ) {  // The contents inside stars
                  $('#tcluster_title').val(value['chart_title']);
                  var colNames = value['cols'];
                  var singleColName = colNames.split(",");
                  $('#tcluster_xaxis_col').selectpicker('val', singleColName);
                  if(value.filters != '') {
                    var filCount = 1;
                    $.each(value.filters , function(k , v ) {
                      var extrafilterlength = $( "#tcluster_filter"+filCount ).length;
                      if(filCount > 1 && extrafilterlength == 0) {
                      var getDom = $("#tcluster_filter_sel1").html();
                      var newfilterdiv = '<div id="tcluster_filter'+filCount+'" class="form-group form-inline filterDiv">';
                      var newtcluster_filter_sel = '<select class="form-control filterColoumSel" id="tcluster_filter_sel'+filCount+'" name="tcluster_filter_sel'+filCount+'">';
                      newtcluster_filter_sel += getDom+'</select>';
                      var newtcluster_filter_cond_sel = '<select class="form-control" id="tcluster_filter_cond_sel'+filCount+'" name="tcluster_filter_cond_sel'+filCount+'">';
                      newtcluster_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
                      var newIn = '<input type="text" class="form-control" id="tcluster_filter_cond_val'+filCount+'" name="tcluster_filter_cond_val'+filCount+'" placeholder="Value">';
                      var newfilterdivEnd = '</div>';
                      var complDiv = newfilterdiv+newtcluster_filter_sel+newtcluster_filter_cond_sel+newIn+newfilterdivEnd;
                      var removebtn = '<input type="button" value="-" id="tcluster_'+filCount+'" class="btn btn-danger remove-me" />';
                      $( '#text_cluster_form .filterDiv' ).last().after(complDiv);
                      $( '#tcluster_filter'+filCount ).append(removebtn);
                      $('#tcluster_filter_count').val(filCount);
                      }
                      $('#tcluster_filter_sel'+filCount+' option[value="'+v["colname"]+'"]').prop('selected', true);
                      var selectedValType = $('option:selected', '#tcluster_filter_sel'+filCount).attr("data-type");
                      var optionString = '<option value="">--Select Operator--</option>';
                      if(selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor"  || selectedValType == "logical") {
                        optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
                      }
                      else if(selectedValType == "character") {
                        optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
                      }
                      $('#tcluster_filter_cond_sel'+filCount).html(optionString);
                      $('#tcluster_filter_cond_sel'+filCount).val(v["operator"]);
                      $('#tcluster_filter_cond_val'+filCount).val(v['required_val']);
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
    $('body').on('submit', 'form#text_cluster_form', function(e) {
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
      var title = $('input[name="tcluster_title"]').val();
      var previs= 0;
      $('#charts_list_ul li .cluster_analysis').each(function() {  /**************to set charts display order***************/
        var vals = $(this).parents('li').attr('id').split('_');
            if(previs < vals[2]){
                previs = vals[2];
            }
      });
      var tclusterImgNum = previs;
      var edit_img = "";
      if (!tclusterImgNum || tclusterImgNum==0) {
        var tclusterImgNum = 1;
      }
      else {
        if ($('#edit_input').length != 0) {
          var tclusterImgNum = $('#edit_input').val();
          edit_img = "_ed";
        }
        else {
          tclusterImgNum++;
        }
      }
      var chart_title = $('input[name="tcluster_title"]',this).val();
      var cols = $('select[name="tcluster_xaxis_col"]',this).val();
      if (cols.length < 2) {
        //alert("Select atleast two variables");
        $("#two-var-modal").modal('show');
        $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
        $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
        $('body').removeClass("modal-open");
        $('body').css("padding-right","");
        return false;
     }
      var filersCount = $('input[name="tcluster_filter_count"]',this).val();
      var filterJson = "";
      var imageName = 'tcluster_'+sketch_id+'_'+tclusterImgNum+'.txt';
      var img_name = img_dir+imageName;
      for (i = 1; i <= filersCount; i++) {
        if($('#tcluster_filter'+i).length == 0) {
          continue;
        }
        if($('input[name="tcluster_filter_cond_val'+i+'"]',this).val() == "" ) {
          continue;
        }
        var colname 	= $('select[name="tcluster_filter_sel'+i+'"]',this).val();
        var operator	= $('select[name="tcluster_filter_cond_sel'+i+'"]',this).val();
        var required_val = $('input[name="tcluster_filter_cond_val'+i+'"]',this).val();
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
      var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "cols":"'+cols+'",';
      GlobaldataJson += '"filters":'+filterJsonwithGlobal+'}';
      var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "cols":"'+cols+'",';
      dataJson += '"filters":'+filterJson+'}';
      chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=tcluster";
      tooltipPath = '/wiki/topic-based-text-clustering';
      var tooltipTitle = "tooltip";
      var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="tcluster_'+tclusterImgNum+'_'+sketch_id+'_'+dataid+'"  data-whatever="Topic Based Text Clustering" class="showForm clusteranalysis glyphicon glyphicon-pencil edit"></span>';
      panelhead   += '<span id="tcluster_'+tclusterImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
      var tabLi_a = title+'<i class="fa fa-arrows"></i>';
      if($('#edit_input').length != 0){
        $( '#tcluster_pbody_'+tclusterImgNum).empty();
        $( '#tcluster_pbody_'+tclusterImgNum).removeAttr("style data-foamtree");
        $( '#tcluster_'+tclusterImgNum+' div.refinedResults').empty();
        $( '#tcluster_'+tclusterImgNum+' div.refinedResults_table').empty();
        $( '#tcluster_'+tclusterImgNum+' div.cluster-json').empty();
        $( '#tcluster_'+tclusterImgNum+' div.panel-heading').html(panelhead);
        $( '#danger_alert_msg_tc').remove();
        $( '#tabs ul li.active a').html(tabLi_a);
      }
      else{
        $( ".graphical-area div.tab-pane" ).removeClass( "in active" );
        $( "#tabs ul li" ).removeClass( "active" );
        var TclusterimgHTML = '<div id="tcluster_'+tclusterImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
        TclusterimgHTML += '<div class="panel-body"><div id="tcluster_pbody_'+tclusterImgNum+'"></div><div id="refinedResults_'+tclusterImgNum+'" class="refinedResults_table"></div><div class="cluster-json"></div>';
        TclusterimgHTML += '</div></div>';
        $("#tabs ul").prepend('<li id="tcluster_li_'+tclusterImgNum+'" class="active"><a class="cluster_analysis" data-toggle="tab" href="#tcluster_'+tclusterImgNum+'">'+tabLi_a+'</a></li>');
        $( ".graphical-area" ).append( TclusterimgHTML );
      }
      var $pathForchart = '/modules/custom/tm_clusteranalysis/includes/rcodes_plotly/carrot/cluster.php';
      $.ajax({
        type: "POST",
        url: $pathForchart,
        data: chart_data,
        beforeSend: function()
        {
          close_analytics_slide();
          $(".sections_forms").hide(0, on_form_hide);
          $('#tcluster_'+tclusterImgNum+' div.panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
          $(window).scrollTop(0);
        },
        success: function (result) {
          var obtain = result.trim();
          if(obtain != "fail" && obtain != "empty"){
            $('.loading_img').remove();
            $( "#tcluster_pbody_"+tclusterImgNum ).css( "height","480px" );
            var divID = "tcluster_pbody_"+tclusterImgNum;
            var jsonData = jQuery.parseJSON(obtain);
            var dataAr = JSON.stringify(jsonData.dataArr);
            var clusterJson = jsonData.cluster_json_Arr;
            tclustermake(clusterJson, divID, tclusterImgNum);
            var listingsclusterJson = '<textarea style="display:none;" id="listingsclusterJson_'+tclusterImgNum+'" class="form-control" name="listingsclusterJson_'+tclusterImgNum+'">'+dataAr+'</textarea>';
            $('#tcluster_'+tclusterImgNum+' div.panel-body').append(listingsclusterJson);
            var tcluster_comp_json = '{"ImgType": "textcluster", "ImgID": "tcluster_img_'+tclusterImgNum+'", "ImgName": "'+imageName+'", "dataset_id": "'+dataid+'", "data":['+dataJson+']}';
            var textAreaJsonField = '<textarea class="form-control json-data" id="tcluster_img_'+tclusterImgNum+'" name="tcluster_img_'+tclusterImgNum+'">'+tcluster_comp_json+'</textarea>';
            $('#tcluster_'+tclusterImgNum+' div.panel-body div.cluster-json').append(textAreaJsonField);
            updateChartsData(tcluster_comp_json , 'tcluster_img_'+tclusterImgNum );
            $('.nav-tabs a[href="#charts"]').tab('show');
            //$('#alertmsg').show();
            $('#save_report').addClass('alert-red');
          }
          else {
            $('.loading_img').remove();
            var textClusterError = '<div id="danger_alert_msg_tc" style="text-align:left;" class="alert alert-danger alert-dismissible" role="alert">';
            if(obtain == "fail") {
              textClusterError += "<strong>Topic based cluster can't be created on unique dataset.</strong></div>";
            }
            else if(obtain == "empty") {
              textClusterError += "<strong>Topic based cluster can't be created on this filter.</strong></div>";
            }
            $('#tcluster_'+tclusterImgNum+' div.panel-body').append(textClusterError);
            $('#tcluster_img_'+tclusterImgNum).removeClass( "json-data" );
            $('#tcluster_img_'+tclusterImgNum).css( "display", "none" );
            var tcluster_comp_json = '{"ImgType": "textcluster", "ImgID": "tcluster_img_'+tclusterImgNum+'", "ImgName": "'+imageName+'", "dataset_id": "'+dataid+'","save_chart": "No", "data":['+dataJson+']}';
            var textAreaJsonField = '<textarea class="form-control json-data" id="tcluster_img_'+tclusterImgNum+'" name="tcluster_img_'+tclusterImgNum+'">'+tcluster_comp_json+'</textarea>';
            $('#tcluster_'+tclusterImgNum+' div.panel-body div.cluster-json').append(textAreaJsonField);
            updateChartsData(tcluster_comp_json , 'tcluster_img_'+tclusterImgNum );
            $('.nav-tabs a[href="#charts"]').tab('show');
            //$('#alertmsg').show();
            $('#save_report').addClass('alert-red');
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
      if(btnName == "tcluster_addmore") {
        var next = $('#tcluster_filter_count').val();
        next++;
        var getDom = $("#tcluster_filter_sel1").html();
        var newAnd = '<div id="and_tcluster_filter'+next+'" class="form-group form-inline andDiv">';
        var Andcont = '<span>And</span>';
        var newAndend = '</div>';
        var newfilterdiv = '<div id="tcluster_filter'+next+'" class="form-group form-inline filterDiv">';
        var newtcluster_filter_sel = '<select class="form-control filterColoumSel" id="tcluster_filter_sel'+next+'" name="tcluster_filter_sel'+next+'">';
        newtcluster_filter_sel += getDom+'</select>';
        var newtcluster_filter_cond_sel = '<select class="form-control" id="tcluster_filter_cond_sel'+next+'" name="tcluster_filter_cond_sel'+next+'">';
        newtcluster_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
        var newIn = '<input type="text" class="form-control" id="tcluster_filter_cond_val'+next+'" name="tcluster_filter_cond_val'+next+'" placeholder="Value">';
        var newfilterdivEnd = '</div>';
        var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newtcluster_filter_sel+newtcluster_filter_cond_sel+newIn+newfilterdivEnd;
        var removebtn = '<input type="button" value="x" id="tcluster_'+next+'" class="btn btn-danger remove-me" />';
        $( '#text_cluster_form .filterDiv' ).last().after(complDiv);
        $( '#tcluster_filter'+next ).append(removebtn);
        $('#tcluster_filter_count').val(next);
      }
    });
    /**** (remFilter) **/
    $('#secForms').on('click', '.remove-me', function() {
      var rmvbtnID = $(this).attr('id');
      var splitres = rmvbtnID.split("_");
      if(splitres[0] == 'tcluster' ) {
        $('#and_tcluster_filter'+splitres[1]).remove();
        $('#tcluster_filter'+splitres[1]).remove();
      }
    });
    function on_form_hide() {
      $('#secForms').find("input[type=text]").val("");
      $('#text_cluster_form .filterDiv:not(:first)').remove();
      $('#edit_input').remove();
    }
  });
})(jQuery);

