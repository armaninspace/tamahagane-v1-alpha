(function ($) {
    $(document).ready(function(){
        /**
         *  3D Scatter Plot operator click
          */
        paper.on('cell:pointerclick', function (cellView, evt, x, y) {
            var opTypeVal = cellView.model.attributes.operatorType;
            if(opTypeVal == '3D Scatter Plot') {
                //$('#paraFilePath, #dTreeDiv, #AreachartDiv-container, #mutateAttrbs, #knnDiv, #SplitDiv, #predictDiv, #performanceDiv, #MappingDiv, #paraAttrName, #CatDiv, #OutputDiv, #SummarizeDiv, #filterDiv, #decisionTreeDiv, #joinDiv, #classifierDiv, #DistinctDiv, #sliceDiv, #SelectDiv, #SampleDiv, #GroupbyDiv').hide();
                $('.param_link, #AreachartDiv-container, #BubblechartDiv-container, #linechartDiv-container, #histogramchartdiv-container, #txtclusterDiv-container').hide();
                $("#3dScatterDiv-container, .chart_link, .sections_forms h3").show();
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
                    url: Drupal.url('tm_scatterplot/add/form'),
                    type: "POST",
                    data: file,
                    beforeSend: function() {
                        $('#3dScatterchartDiv').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
                    },
                    success: function (response) {
                        $('.loading_img').remove();
                        $('#edit_input').remove();
                        var $wrapper = $('#3dScatterchartDiv');
                        $wrapper.html(response.form_html);
                    }
                });
            }
        });

        /**
         * Scatter plot operator form submit
         */
        $('body').on('submit', 'form#scatter_plot_form', function(e) {
          e.preventDefault();
          var container_id = $(this).parent().attr('id');
          var sketch_id = $(".node--type-sketch.node--view-mode-full").data('history-node-id');
          var dataid = $("#chartcellid").val();
          var globalFilterJson = "";
          var csv_path = "";
          var scter3dfileP = $("#3dscatterfile").val();
          if (scter3dfileP) {
            csv_path = scter3dfileP;
          } else {
            csv_path = $("#chartfile").val();
          }

          var img_dir = $('#imgDir').val();
          var title = $('input[name="scatter_title"]').val();
          var scatterImgNum = $('input[name="scatter_img_num"]').val();
          var previs= 0;
          $('#charts_list_ul li .scatterplot').each(function() {  /**************to set charts display order***************/
          var vals = $(this).parents('li').attr('id').split('_');
            if(previs < vals[2]){
              previs = vals[2];
            }
          });
          var scatterImgNum = previs;
          var edit_img = "";
          if(!scatterImgNum || scatterImgNum==0) {
            var scatterImgNum = 1;
            //$('input[name="scatter_img_num"]').val(scatterImgNum);
          }
          else{
            if($('#edit_input').length != 0) {
              var scatterImgNum = $('#edit_input').val();
              edit_img = "_ed";
            }
            else{
              scatterImgNum++;
            }
          }
          var chart_title   = $('input[name="scatter_title"]',this).val();
          var x_col 		= $('select[name="scatter_xaxis_col"]',this).val();
          var x_col_type 	= $('select[name="scatter_xaxis_col"]',this).find(':selected').attr('data-type');
          var y_col 		= $('select[name="scatter_yaxis_col"]',this).val();
          var y_col_type 	= $('select[name="scatter_yaxis_col"]',this).find(':selected').attr('data-type');
          var z_col 		= $('select[name="scatter_zaxis_col"]',this).val();
          var z_col_type 	= $('select[name="scatter_zaxis_col"]',this).find(':selected').attr('data-type');
          if(x_col == y_col || x_col == z_col || y_col == z_col) {
            if ($('.alert-danger').length == 0) {
              $(this).parent().prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Alert! Columns should not be same. </div>');
            } else {
              $('.alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Alert! Columns should not be same. ');
            }
            $('.tab-content, #chart-div .op-spec-div').animate({ scrollTop: 0 }, 'slow');
            $(window).scrollTop(0);
            return false;
          }
          var x_title 	= $('input[name="scatter_xtitle"]',this).val();
          var y_title 	= $('input[name="scatter_ytitle"]',this).val();
          var z_title 	= $('input[name="scatter_ztitle"]',this).val();
          var color_col 	= $('select[name="scatter_color_col"]',this).val();
          var color_col_type 	= $('select[name="scatter_color_col"]',this).find(':selected').attr('data-type');
          if (color_col == x_col || color_col == y_col || color_col == z_col) {
            if ($('.alert-danger').length == 0) {
              $(this).parent().prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Alert! Color column should be different from x, y and z columns. </div>');
            } else {
              $('.alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Alert! Color column should be different from x, y and z columns. ');
            }
            $('.tab-content, #chart-div .op-spec-div').animate({ scrollTop: 0 }, 'slow');
            $(window).scrollTop(0);
            return false;
          }
          var filersCount = $('input[name="scatter_filter_count"]',this).val();
          var filterJson = "";
          var imageName = 'scatterplot_'+sketch_id+'_'+scatterImgNum+edit_img+'.html';
          var img_name = img_dir+imageName;
          var prnt = $(this).parent();
          for (i = 1; i <= filersCount; i++) {
            if($('#scatter_filter'+i).length == 0){
              continue;
            }
            if($.trim($('input[name="scatter_filter_cond_val'+i+'"]',this).val()) == "" ){
              continue;
            }
            var colname 	= $('select[name="scatter_filter_sel'+i+'"]',this).val();
            var operator	= $('select[name="scatter_filter_cond_sel'+i+'"]',this).val();
            var required_val = $('input[name="scatter_filter_cond_val'+i+'"]',this).val();
            if(colname == '' ||  operator == '') {
              if ($('.alert-danger').length == 0) {
                $(this).parent().prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Alert! Column name & operators are required to apply filter. </div>');
              } else {
                $('.alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Alert! Column name & operators are required to apply filter. ');
              }
              $('.tab-content, #chart-div .op-spec-div').animate({ scrollTop: 0 }, 'slow');
              $(window).scrollTop(0);
              return false;
            }
            filterJson += '{"colname":"'+colname+'", "operator":"'+operator+'", "required_val":"'+required_val+'"},';
          }
          filterJson = filterJson.replace(/,\s*$/, "");
          if(globalFilterJson == "" || globalFilterJson == null){
            var filterJsonwithGlobal = filterJson;
          }
          else {
            var filterJsonwithGlobal = globalFilterJson+","+filterJson;
          }
          filterJsonwithGlobal = filterJsonwithGlobal.replace(/,\s*$/, "");
          var filterJsonwithGlobal = "["+filterJsonwithGlobal+"]";
          filterJson = "["+filterJson+"]";

          var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "y_col":"'+y_col+'", "z_col":"'+z_col+'", "x_col_type":"'+x_col_type+'", "y_col_type":"'+y_col_type+'", "z_col_type":"'+z_col_type+'", ';
          GlobaldataJson += '"x_title":"'+x_title+'", "y_title":"'+y_title+'", "z_title":"'+z_title+'", "color_col":"'+color_col+'", "color_col_type":"'+color_col_type+'", "filters":'+filterJsonwithGlobal+'}';

          var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "x_col":"'+x_col+'", "y_col":"'+y_col+'", "z_col":"'+z_col+'", "x_col_type":"'+x_col_type+'", "y_col_type":"'+y_col_type+'", "z_col_type":"'+z_col_type+'",';
          dataJson += '"x_title":"'+x_title+'", "y_title":"'+y_title+'", "z_title":"'+z_title+'", "color_col":"'+color_col+'", "color_col_type":"'+color_col_type+'", "filters":'+filterJson+'}';

          //console.log(GlobaldataJson);
          //console.log(dataJson);
          //return false;
          chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=scatterplot";
          var tooltipTitle = 'Get Help';
          var tooltipPath = '/wiki/scatter-plot';
          var panelhead = title;
          panelhead   += '<span id="scatter_'+scatterImgNum+'_rem" class="glyphicon glyphicon-remove-sign rem-chart" title="Remove"></span><span id="scatterplot_'+scatterImgNum+'_'+sketch_id+'_'+dataid+'" data-whatever="Scatter Plot" class="showForm scatterplot glyphicon glyphicon-edit edit" title="Edit"></span><span id="txt-minus-plus" class="glyphicon glyphicon-minus-sign" title="Minimize"></span><span class="glyphicon glyphicon-move" title="Move"></span>';
          var tabLi_a = title+'<i class="fa fa-arrows"></i>';
          if($('#edit_input').length != 0) {
            $( '#scatter_'+scatterImgNum+' div.panel-body').empty();
            $( '#scatter_'+scatterImgNum+' div.panel-heading').html(panelhead);
            $( '#tabs ul li.active a').html(tabLi_a);
          }
          else {
            var ScatterimgHTML = '<div id="scatter_'+scatterImgNum+'" class="myTab panel panel-default draggable-element"><div class="panel-heading">'+panelhead+'</div>';
            ScatterimgHTML += '<div class="panel-body">';
            ScatterimgHTML += '</div></div>';
            //$("#tabs ul").prepend('<li id="scatter_li_'+scatterImgNum+'" class=""><a data-toggle="tab" class="scatterplot" href="#scatter_'+scatterImgNum+'">'+tabLi_a+'</a></li>');
            $( ".graphical-area" ).prepend( ScatterimgHTML );
            $("#tabs ul#charts_list_ul").prepend('<li id="scatter_li_'+scatterImgNum+'" class=""><a class="scatterplot" href="#scatter_'+scatterImgNum+'">'+tabLi_a+'</a></li>');
          }
          $.ajax({
            type: "POST",
            url: "/tm_scatterplot/process/data",
            data: chart_data,
            beforeSend: function()
            {
              $('#scatter_'+scatterImgNum+' div.panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
              $(window).scrollTop(0);
              $('.alert-danger').remove();
            },
            success: function (result) {
              var chrtresult = result.chart_html;
              $(".classifier-modify").css('visibility', 'hidden');
              var splittedresult = chrtresult.split("|||");
              if (splittedresult[0] == '0') {
               /* $(prnt).prepend(splittedresult[1]);
                $('.tab-content').animate({ scrollTop: 0 }, 'slow');
                $("#chartsMsg-modal #msg").html('<h6>Chart not generated</h6>');
                $("#chartsMsg-modal .modal-title").text('Error!');
                if (container_id == 'secForms') {*/
                var scatter_plot_comp_json = '{"ImgType": "scatterplot", "ImgID": "scatter_img_'+scatterImgNum+'", "ImgName": "'+imageName2+'","dataset_id": "'+dataid+'","save_chart": "No", "data":['+dataJson+']}';
                updateChartsData(scatter_plot_comp_json , 'scatter_img_'+scatterImgNum );
                  $('.loading_img').remove();
                  $('#scatter_'+scatterImgNum+' div.panel-body').append(splittedresult[1]);
                  $('#scatter_img_'+scatterImgNum).removeClass( "json-data" );
                  $('#scatter_img_'+scatterImgNum).css( "display", "none" );
                  var textAreaJsonField = '<textarea class="form-control json-data" id="scatter_img_'+scatterImgNum+'" name="scatter_img_'+scatterImgNum+'">'+scatter_plot_comp_json+'</textarea>';
                  $('#scatter_'+scatterImgNum+' div.panel-body').append(textAreaJsonField);
                  $('.nav-tabs a[href="#charts"]').tab('show');
                  //$('#alertmsg').show();
                  //$('#save_report').addClass('alert-red');
                  $('#btn-save').addClass('alert-red');
                /*} else {
                  $('#scatter_li_'+scatterImgNum).remove();
                }*/
              }
              else {
                $(".sections_forms").hide(0, on_form_hide);
                var scatter_plot_comp_json = '{"ImgType": "scatterplot", "ImgID": "scatter_img_' + scatterImgNum + '", "ImgName": "' + imageName2 + '","dataset_id": "'+ dataid+'", "data":[' + dataJson + ']}';
                updateChartsData(scatter_plot_comp_json , 'scatter_img_'+scatterImgNum );
                $("#chartsMsg-modal #msg").html('<h6>Chart generated successfully and listed in charts list, click on "Save" to permanently save.</h6>');
                //if (container_id == 'secForms') {
                $('.loading_img').remove();
                $('#scatter_' + scatterImgNum + ' div.panel-body').html(result.chart_html);
                var textAreaJsonField = '<textarea class="form-control json-data" id="scatter_img_' + scatterImgNum + '" name="scatter_img_' + scatterImgNum + '">' + scatter_plot_comp_json + '</textarea>';
                $('#scatter_' + scatterImgNum + ' div.panel-body').append(textAreaJsonField);
                $('.nav-tabs a[href="#charts"]').tab('show');
                setTimeout(function() {
                  window.HTMLWidgets.staticRender();
                  $('.svg-container').height('275');
                  $('.nav-tabs a[href="#tm_grid"]').tab('show');
                  Drupal.attachBehaviors();
                }, 1000);
                //} else{
                //$('#parameter-area-modal').modal('hide');
                $(this).find("input[type=text]").val("");
                $('#3dScatterchartDiv').empty();
                /*setTimeout(function(){
                 $("#chartsMsg-modal").modal('show');
                 setModalBackdrop();
                 }, 1000);*/
                // }
                //$('#save_report').addClass('alert-red');
                $('#btn-save').addClass('alert-red');
              }
              $('.draggable-element').arrangeable({dragSelector: '.glyphicon-move'});
            }

          });
          //$("#chart-edit-modal").modal('hide');
          close_form_slide();
          setTimeout(function() {

          }, 3000);
          if(imageName.includes("_ed")) {
            imageName2 = imageName.replace("_ed", "");
          }
          else {
            imageName2 = imageName;
          }
          return false;
        });/****** /. Scatter Plot Form Submit ****/

        /**
         * 3d Scatter Plot list click
         */
        $("body").on("click", '#charts_list_ul li a.scatterplot', function(e) {
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
                        var tooltipPath = '/wiki/scatter-plot';
                        var tooltipTitle = "tooltip";
                        var $imgid = splitID[2];
                        var tabcont = '<div id="scatter_' + $imgid + '" class="tab-pane fade' + $tabdivClass + ' myTab panel panel-default"><div class="panel-heading">' + $title + '<a class="tooltipp" title="' + tooltipTitle + '" target="_blank" href="' + tooltipPath + '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
                        tabcont += '<span id="scatterplot_' + $imgid + '_' + $id + '_' + value['dataset_id'] + '" data-whatever="Scatter Plot" class="showForm scatterplot glyphicon glyphicon-pencil edit"></span><span id="scatter_' + $imgid + '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
                        tabcont += '</div>';
                        tabcont += '<div class="panel-body">';
                        tabcont += '<textarea class="form-control json-data" id="scatter_img_' + $imgid + '" name="scatter_img_' + $imgid + '">' + JSON.stringify(value) + '</textarea></div></div>';
                        $('.graphical-area').append(tabcont);
                        $.ajax({
                            type: "GET",
                            url: $pathForHTml2,
                            beforeSend: function()
                            {
                                $('#scatter_' + $imgid + ' .panel-body').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
                            },
                            success: function (result) {
                                $('.loading_img').remove();
                                $('#scatter_' + $imgid + ' .panel-body').append(result);
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

        /**
         * Chart editing
         */
        $('body').on('click', '.scatterplot.edit', function() {
            $('#df1, #df2, #exTab1 .nav-tabs, #result-div, .op-area-note').hide();
            $('#AreachartDiv-container, #BubblechartDiv-container, #linechartDiv-container, #histogramchartdiv-container, #txtclusterDiv-container').hide();
            $('#chart-edit-title').html('Edit Scatter 3D Chart');
            $("#3dScatterDiv-container, #chart-edit-title").show();
            $('.nav-tabs a[href="#chart-div"]').tab('show');
           // open_form_slide();
            var cek=$(this).attr('id');
            var editID = cek;
            var file_path;
            var splitID = editID.split("_");
            var chartType = splitID[0];
            var imgID = splitID[1];
            var reportID = splitID[2];
            //file_path = $("#chartfile").val();
            var textJson = $('#scatter_img_' + imgID).val();
            var obj = jQuery.parseJSON(textJson);
            $.each(obj.data, function (key, value) {
                file_path = value['csv_path'];
            });
            $.ajax ({
                url: Drupal.url('tm_scatterplot/add/form'),
                type: "POST",
                data: "file_path="+file_path,
                beforeSend: function()
                {
                    $('#3dScatterchartDiv').append('<img class="loading_img" src="/sites/default/files/loading.gif">');
                },
                success: function (response) {
                    $('.loading_img').remove();
                    var $wrapper = $('#3dScatterchartDiv');
                    if(response.form_empty) {
                        $wrapper.html(response.form_empty);
                    }
                    else {
                        $wrapper.html(response.form_html);
                        $('.selectpicker').selectpicker('refresh');
                        $('#edit_input').remove();
                        $('form.sections_forms h3').hide();
                        $('.graphical-area').append('<input class="editInput" type="hidden" name="edit_input" id="edit_input" value="' + imgID + '">');
                        $.each(obj.data, function (key, value) {  // The contents inside stars
                            //alert(value['chart_title']);
                            $('#scatter_title').val(value['chart_title']);
                            $('#scatter_xaxis_col option[value="' + value["x_col"] + '"]').prop('selected', true);
                            $('#scatter_yaxis_col option[value="' + value["y_col"] + '"]').prop('selected', true);
                            $('#scatter_zaxis_col option[value="' + value["z_col"] + '"]').prop('selected', true);
                            $('#scatter_xtitle').val(value['x_title']);
                            $('#scatter_ytitle').val(value['y_title']);
                            $('#scatter_ztitle').val(value['z_title']);
                            $('#scatter_color_col option[value="' + value["color_col"] + '"]').prop('selected', true);
                            if (value.filters != '') {
                                var filCount = 1;
                                $.each(value.filters, function (k, v) {
                                    if (filCount > 1) {
                                        var getDom = $("#scatter_filter_sel1").html();
                                        var newfilterdiv = '<div id="scatter_filter' + filCount + '" class="form-group form-inline filterDiv">';
                                        var newscatter_filter_sel = '<select class="form-control filterColoumSel" id="scatter_filter_sel' + filCount + '" name="scatter_filter_sel' + filCount + '">';
                                        newscatter_filter_sel += getDom + '</select>';
                                        var newscatter_filter_cond_sel = '<select class="form-control" id="scatter_filter_cond_sel' + filCount + '" name="scatter_filter_cond_sel' + filCount + '">';
                                        newscatter_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
                                        var newIn = '<input type="text" class="form-control" id="scatter_filter_cond_val' + filCount + '" name="scatter_filter_cond_val' + filCount + '" placeholder="Value">';
                                        var newfilterdivEnd = '</div>';
                                        var complDiv = newfilterdiv + newscatter_filter_sel + newscatter_filter_cond_sel + newIn + newfilterdivEnd;
                                        var removebtn = '<input type="button" value="-" id="scatter_' + filCount + '" class="btn btn-danger remove-me" />';
                                        $('#scatter_plot_form .filterDiv').last().after(complDiv);
                                        $('#scatter_filter' + filCount).append(removebtn);
                                        $('#scatter_filter_count').val(filCount);
                                    }
                                    $('#scatter_filter_sel' + filCount + ' option[value="' + v["colname"] + '"]').prop('selected', true);
                                    var selectedValType = $('option:selected', '#scatter_filter_sel' + filCount).attr("data-type");
                                    var optionString = '<option value="">--Select Operator--</option>';
                                    if (selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor") {
                                        optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
                                    }
                                    else if (selectedValType == "character") {
                                        optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
                                    }
                                    $('#scatter_filter_cond_sel' + filCount).html(optionString);
                                    $('#scatter_filter_cond_sel' + filCount).val(v["operator"]);
                                    $('#scatter_filter_cond_val' + filCount).val(v['required_val']);
                                    filCount++;
                                });
                            }
                        });
                        Drupal.attachBehaviors($wrapper[0]);
                    }
                    $("#3dscatterfile").val(file_path);
                }
            });
            $('.nav-tabs a[href="#design"]').tab('show');
            //open_analytics_slide();
        });

        /**
         * add more filter
         */
        $('body').on('click', '.add-more', function(e) {
            e.preventDefault();
            var btnName = $( this ).attr('name');
            if(btnName == "scatter_addmore") {
                var next = $('#scatter_filter_count').val();
                next++;
                var getDom = $("#scatter_filter_sel1").html();
                var newAnd = '<div id="and_scatter_filter'+next+'" class="form-group form-inline andDiv">';
                var Andcont = '<span>And</span>';
                var newAndend = '</div>';
                var newfilterdiv = '<div id="scatter_filter'+next+'" class="form-group form-inline filterDiv">';
                var newscatter_filter_sel = '<select class="form-control filterColoumSel" id="scatter_filter_sel'+next+'" name="scatter_filter_sel'+next+'">';
                newscatter_filter_sel += getDom+'</select>';
                var newscatter_filter_cond_sel = '<select class="form-control" id="scatter_filter_cond_sel'+next+'" name="scatter_filter_cond_sel'+next+'">';
                newscatter_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
                var newIn = '<input type="text" class="form-control" id="scatter_filter_cond_val'+next+'" name="scatter_filter_cond_val'+next+'" placeholder="Value">';
                var newfilterdivEnd = '</div>';
                var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newscatter_filter_sel+newscatter_filter_cond_sel+newIn+newfilterdivEnd;
                var removebtn = '<input type="button" value="x" id="scatter_'+next+'" class="btn btn-danger remove-me" />';
                $( '#scatter_plot_form .filterDiv' ).last().after(complDiv);
                $( '#scatter_filter'+next ).append(removebtn);
                $('#scatter_filter_count').val(next);
            }
        });

        /**
         * remove filter
         */
        $('#3dScatterchartDiv, .op-spec-div').on('click', '.remove-me', function() {
            var rmvbtnID = $(this).attr('id');
            var splitres = rmvbtnID.split("_");
            if(splitres[0] == 'scatter' ) {
                $('#and_scatter_filter'+splitres[1]).remove();
                $('#scatter_filter'+splitres[1]).remove();
            }
        });

        /**
         *
         */
        function on_form_hide() {
            $('#3dScatterchartDiv').find("input[type=text]").val("");
            $('#scatter_plot_form .filterDiv:not(:first)').remove();
            $('#edit_input').remove();
            $('.op-area-note').show();
            $('#exTab1 .nav-tabs, #chart-edit-title').hide();

        }





    });
})(jQuery);