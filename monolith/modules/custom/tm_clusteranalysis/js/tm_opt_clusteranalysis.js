(function ($) {
  $(document).ready(function(){
    /**
     * Text cluster operator click
    */
    paper.on('cell:pointerclick', function (cellView, evt, x, y) {
      var opTypeVal = cellView.model.attributes.operatorType;
      if(opTypeVal == 'Text Cluster') {
        $('.param_link, #AreachartDiv-container, #3dScatterDiv-container, #BubblechartDiv-container, #linechartDiv-container, #histogramchartdiv-container').hide();
        $("#txtclusterDiv-container , .chart_link, .sections_forms h3").show();
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
          url: Drupal.url('tm_clusteranalysis/add/form'),
          type: "POST",
          data: file,
          beforeSend: function() {
            $('#txtclusterDiv').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
          },
          success: function (response) {
            $('.loading_img').remove();
            $('#edit_input').remove();
            var $wrapper = $('#txtclusterDiv');
            $wrapper.html(response.form_html);
            $('.selectpicker').selectpicker('refresh');
        }
      });
    }
  });

    /**
     * Text cluster operator form submit
    */
    $('body').on('submit', 'form#text_cluster_form', function(e) {
      e.preventDefault();
      var container_id = $(this).parent().attr('id');
      var sketch_id = $(".node--type-sketch.node--view-mode-full").data('history-node-id');
      var dataid = $("#chartcellid").val();
      var globalFilterJson = "";
      var csv_path = "";
      var txtclusterFileP = $("#txtclusterfile").val();
      if (txtclusterFileP) {
        csv_path = txtclusterFileP;
      } else {
        csv_path = $("#chartfile").val();
      }
      var img_dir = $('#imgDir').val();
      var title = $('input[name="tcluster_title"]').val();
      var previs= 0;
      $('#charts_list_ul li .cluster_analysis').each(function() {
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
     /* if (cols.length < 2) {
        //alert("Select atleast two variables");
        $("#two-var-modal").modal('show');
        $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
        $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
        $('body').removeClass("modal-open");
        $('body').css("padding-right","");
        return false;
      }*/
      var filersCount = $('input[name="tcluster_filter_count"]',this).val();
      var filterJson = "";
      //var imageName = 'tcluster_'+sketch_id+'_'+tclusterImgNum+edit_img+'.html';
      var imageName = 'tcluster_'+sketch_id+'_'+tclusterImgNum+'.txt';

      var img_name = img_dir+imageName;
      var prnt = $(this).parent();
      for (i = 1; i <= filersCount; i++) {
        if ($('#tcluster_filter'+i).length == 0) {
          continue;
        }
        if ($.trim($('input[name="tcluster_filter_cond_val'+i+'"]',this).val()) == "" ) {
          continue;
        }
        var colname = $('select[name="tcluster_filter_sel'+i+'"]',this).val();
        var operator = $('select[name="tcluster_filter_cond_sel'+i+'"]',this).val();
        var required_val = $('input[name="tcluster_filter_cond_val'+i+'"]',this).val();
        if (colname == '' ||  operator == '') {
          if ($('.alert-danger').length == 0) {
            $(this).parent().prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filters Error! Column name & operators are required to apply filter. </div>');
          } else {
            $('.alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filters Error! Column name & operators are required to apply filter. ');
          }
          $('.tab-content, #chart-div .op-spec-div').animate({ scrollTop: 0 }, 'slow');
          $(window).scrollTop(0);
          //alert('Column name & operators are required to apply filter');
          //$("#col-op-modal").modal('show');
          //$(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
          //$('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
          //$('body').removeClass("modal-open");
          //$('body').css("padding-right","").css;
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
      var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "cols":"'+cols+'",';
      GlobaldataJson += '"filters":'+filterJsonwithGlobal+'}';
      var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "cols":"'+cols+'",';
      dataJson += '"filters":'+filterJson+'}';
      chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=tcluster";
      var tooltipTitle = 'Get Help';
      var tooltipPath = '/wiki/topic-based-text-clustering';
      var panelhead = title;
      panelhead   += '<span id="tcluster_'+tclusterImgNum+'_rem" class="glyphicon glyphicon-remove-sign rem-chart" title="Remove"></span><span id="tcluster_'+tclusterImgNum+'_'+sketch_id+'_'+dataid+'"  data-whatever="Text Cluster" class="showForm clusteranalysis glyphicon glyphicon-edit edit" title="Edit"></span><span id="txt-minus-plus" class="glyphicon glyphicon-minus-sign" title="Minimize"></span><span class="glyphicon glyphicon-move" title="Move"></span>';
      var tabLi_a = title+'<i class="fa fa-arrows"></i>';
      if ($('#edit_input').length != 0) {
        $( '#tcluster_pbody_'+tclusterImgNum).empty();
        $( '#tcluster_pbody_'+tclusterImgNum).removeAttr("style data-foamtree");
        $( '#tcluster_'+tclusterImgNum+' div.refinedResults').empty();
        $( '#tcluster_'+tclusterImgNum+' div.refinedResults_table').empty();
        $( '#tcluster_'+tclusterImgNum+' div.cluster-json').empty();
        $( '#tcluster_'+tclusterImgNum+' div.panel-heading').html(panelhead);
        $( '#tabs ul li.active a').html(tabLi_a);
      }
      else {
        //$( "div.tab-pane" ).removeClass( "in active" );
        //$( "#tabs ul li" ).removeClass( "active" );
        //var areaimgHTML = '<div id="area_'+areaImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
        var TclusterimgHTML = '<div id="tcluster_'+tclusterImgNum+'" class="tab-pane fade in active myTab panel panel-default draggable-element"><div class="panel-heading">'+panelhead+'</div>';
        TclusterimgHTML += '<div class="panel-body"><div id="tcluster_pbody_'+tclusterImgNum+'"></div><div id="refinedResults_'+tclusterImgNum+'" class="refinedResults_table"></div><div class="cluster-json"></div>';
        TclusterimgHTML += '</div></div>';
       // $("#tabs ul").prepend('<li id="area_li_'+areaImgNum+'" class="active"><a data-toggle="tab" class="areaplot" href="#area_'+areaImgNum+'">'+tabLi_a+'</a></li>');
       // $("#tabs ul").prepend('<li id="area_li_'+areaImgNum+'" class=""><a class="areaplot" href="#area_'+areaImgNum+'">'+tabLi_a+'</a></li>');
        $("#tabs ul#charts_list_ul").prepend('<li id="tcluster_li_'+tclusterImgNum+'" class="active"><a class="cluster_analysis" data-toggle="tab" href="#tcluster_'+tclusterImgNum+'">'+tabLi_a+'</a></li>');
        $( ".graphical-area" ).prepend( TclusterimgHTML );
      }
      var $pathForchart = '/modules/custom/tm_clusteranalysis/includes/rcodes_plotly/carrot/cluster.php';
      $.ajax({
        type: "POST",
        url: $pathForchart,
        data: chart_data,
        beforeSend: function() {
          $('.graphical-area #no_chart_msg').hide();
          $('#tcluster_'+tclusterImgNum+' div.panel-body').prepend('<img class="loading_img" src="/sites/default/files/loading.gif">');
          $(window).scrollTop(0);
          $('.alert-danger').remove();
        },
        success: function (result) {
          var obtain = result.trim();
          if(obtain != "fail" && obtain != "empty") {
            $(".sections_forms").hide(0, on_form_hide);
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
            $('#btn-save').addClass('alert-red');
            $('#txtclusterDiv').empty();

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
            $('#btn-save').addClass('alert-red');
          }
          $('.draggable-element').arrangeable({dragSelector: '.glyphicon-move'});
        }
      });
      //$("#chart-edit-modal").modal('hide');
      close_form_slide();
      setTimeout(function(){

      }, 3000);
      if (imageName.includes("_ed")) {
        imageName2 = imageName.replace("_ed", "");
      }
      else {
        imageName2 = imageName;
      }
      return false;
    });

    /**
     * Addmore filter functionality
    */
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

    /**
     * Chart editing
    */
    $('body').on('click', '.clusteranalysis.edit', function() {
      $('#df1, #df2, #exTab1 .nav-tabs, #result-div, .op-area-note').hide();
      $('#3dScatterDiv-container, #AreachartDiv-container, #BubblechartDiv-container, #linechartDiv-container, #histogramchartdiv-container').hide();
      $('#chart-edit-title').html('Edit Text Cluster');
      $("#txtclusterDiv-container, #chart-edit-title").show();
      $('.nav-tabs a[href="#chart-div"]').tab('show');
      // open_form_slide();
      var cek=$(this).attr('id');
      var editID = cek;
      var file_path;
      var splitID = editID.split("_");
      var chartType = splitID[0];
      var imgID = splitID[1];
      var reportID = splitID[2];
      var textJson = $('#tcluster_img_' + imgID).val();
      var obj = jQuery.parseJSON(textJson);
      $.each(obj.data, function (key, value) {
        file_path = value['csv_path'];
      });
      $.ajax({
          url: Drupal.url('tm_clusteranalysis/add/form'),
          type: "POST",
          data: "file_path="+file_path,
          beforeSend: function()
          {
            //$('#txtclusterDiv').prepend('<img class="loading_img" src="/sites/default/files/loading.gif">');
          },
          success: function (response) {
            $('.loading_img').remove();
            var $wrapper = $('#txtclusterDiv');
            if(response.form_empty) {
              $wrapper.html(response.form_empty);
            }
            else {
              $wrapper.html(response.form_html);
              $('.selectpicker').selectpicker('refresh');
              $('form.sections_forms h3').hide();
              $('#edit_input').remove();
                $('.graphical-area').append('<input class="editInput" type="hidden" name="edit_input" id="edit_input" value="' + imgID + '">');
                $.each(obj.data, function (key, value) {  // The contents inside stars
                  $('#txtclusterDiv #tcluster_title').val(value['chart_title']);
                  var colNames = value['cols'];
                  var singleColName = colNames.split(",");
                  $('#tcluster_xaxis_col').selectpicker('val', singleColName);
                  if (value.filters != '') {
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
              Drupal.attachBehaviors($wrapper[0]);
            }
            $("#txtclusterfile").val(file_path);
          }
        });

    });

    /**
     * Remove filter
    */
    $('#txtclusterDiv, .op-spec-div').on('click', '.remove-me', function() {
      var rmvbtnID = $(this).attr('id');
      var splitres = rmvbtnID.split("_");
      if (splitres[0] == 'area' ) {
        $('#and_tcluster_filter'+splitres[1]).remove();
        $('#tcluster_filter'+splitres[1]).remove();
      }
    });

    function on_form_hide() {
      $('#txtclusterDiv').find("input[type=text]").val("");
      $('#text_cluster_form .filterDiv:not(:first)').remove();
      $('#edit_input').remove();
      ////m area patch
      $('.op-area-note').show();
      $('#exTab1 .nav-tabs, #chart-edit-title').hide();
    }
    
  });
})(jQuery);
