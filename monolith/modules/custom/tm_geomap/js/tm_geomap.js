(function ($) {
  $(document).ready(function() {
    $("body").on("click", '#charts_list_ul li a.geo_map', function(e) {
      close_analytics_slide();
      return false;
      /* var id = $(this).parent().attr('id');
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
      if (already) {
        return false;
      }*/
 /*   else {
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
            var tabcont = '<div id="geomap_' + $imgid + '" class="tab-pane fade' + $tabdivClass + ' myTab panel panel-default"><div class="panel-heading">' + $title + '<a class="tooltipp" title="' + tooltipTitle + '" target="_blank" href="' + tooltipPath + '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
            tabcont += '<span id="tcluster_' + $imgid + '_' + $id + '_' + value['dataset_id'] + '" data-whatever="Geo Map" class="showForm geomap glyphicon glyphicon-pencil edit"></span><span id="geomap_' + $imgid + '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
            tabcont += '</div>';
            tabcont += '<div class="panel-body" style="height: 700px; margin:0; padding:0;"><div id="map_' + $imgid + '" style="height:97%; width:97%; margin:5px auto 5px auto;"></div>';
            tabcont += '<textarea class="form-control json-data" id="geomap_img_' + $imgid + '" name="geomap_img_' + $imgid + '">' + JSON.stringify(value) + '</textarea></div></div>';
            $('.graphical-area').append(tabcont);
            var map_id = "map_"+$imgid;
            markers = value['markers'];
            var srcURL = init_map(map_id, markers);
          }
        });
      }*/
    });
    $('body').on('click', '.geomap', function() {
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
      if(chartType == "Geo Map") {
        $.ajax({
          url: Drupal.url('tm_geomap/add/form'),
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
                var textJson = $('#geomap_img_'+imgID).val();
                var obj = jQuery.parseJSON(textJson);
                $.each(obj.data , function(key , value ) {  // The contents inside stars
                  $('#geomap_title').val(value['chart_title']);
                  $('#geomap_lat option[value="'+value["geomap_lat"]+'"]').prop('selected', true);
                  $('#geomap_long option[value="'+value["geomap_long"]+'"]').prop('selected', true);
                  $('#geomap_city').val(value['geomap_city']);
                  $('#geomap_miles_sel option[value="'+value["geomap_miles"]+'"]').prop('selected', true);
                  if(value.filters != '') {
                    var filCount = 1;
                    $.each(value.filters , function(k , v ) {
                      var extrafilterlength = $( "#geomap_filter"+filCount ).length;
                      if(filCount > 1 && extrafilterlength == 0) {
                      var getDom = $("#geomap_filter_sel1").html();
                      var newfilterdiv = '<div id="geomap_filter'+filCount+'" class="form-group form-inline filterDiv">';
                      var newgeomap_filter_sel = '<select class="form-control filterColoumSel" id="geomap_filter_sel'+filCount+'" name="geomap_filter_sel'+filCount+'">';
                      newgeomap_filter_sel += getDom+'</select>';
                      var newgeomap_filter_cond_sel = '<select class="form-control" id="geomap_filter_cond_sel'+filCount+'" name="geomap_filter_cond_sel'+filCount+'">';
                      newgeomap_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
                      var newIn = '<input type="text" class="form-control" id="geomap_filter_cond_val'+filCount+'" name="geomap_filter_cond_val'+filCount+'" placeholder="Value">';
                      var newfilterdivEnd = '</div>';
                      var complDiv = newfilterdiv+newgeomap_filter_sel+newgeomap_filter_cond_sel+newIn+newfilterdivEnd;
                      var removebtn = '<input type="button" value="-" id="geomap_'+filCount+'" class="btn btn-danger remove-me" />';
                      $( '#geomap_form .filterDiv' ).last().after(complDiv);
                      $( '#geomap_filter'+filCount ).append(removebtn);
                      $('#geomap_filter_count').val(filCount);
                    }
                      $('#geomap_filter_sel'+filCount+' option[value="'+v["colname"]+'"]').prop('selected', true);
                      var selectedValType = $('option:selected', '#geomap_filter_sel'+filCount).attr("data-type");
                      var optionString = '<option value="">--Select Operator--</option>';
                      if(selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor"  || selectedValType == "logical") {
                      optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
                      }
                      else if(selectedValType == "character") {
                        optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
                      }
                      $('#geomap_filter_cond_sel'+filCount).html(optionString);
                      $('#geomap_filter_cond_sel'+filCount).val(v["operator"]);
                      $('#geomap_filter_cond_val'+filCount).val(v['required_val']);
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
    $('body').on('submit', 'form#geomap_form', function(e) {
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
      var title = $('input[name="geomap_title"]').val();
      var previs= 0;
      $('#charts_list_ul li .geo_map').each(function() {  /**************to set charts display order***************/
        var vals = $(this).parents('li').attr('id').split('_');
            if(previs < vals[2]){
                previs = vals[2];
            }
      });
      var GeoMapImgNum = previs;
      var edit_img = "";
      if (!GeoMapImgNum || GeoMapImgNum==0) {
        var GeoMapImgNum = 1;
      }
      else {
        if ($('#edit_input').length != 0) {
          var GeoMapImgNum = $('#edit_input').val();
          edit_img = "_ed";
        }
        else {
          GeoMapImgNum++;
        }
      }
      var chart_title  = $('input[name="geomap_title"]',this).val();
      var geomap_lat  = $('select[name="geomap_lat"]',this).val();
      var geomap_long = $('select[name="geomap_long"]',this).val();
      if(geomap_lat == geomap_long) {
        //alert("Select suitable and different columns for lattitude and longitude.");
        $("#lat-long-modal").modal('show');
        $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
        $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
        $('body').removeClass("modal-open");
        $('body').css("padding-right","");
        return false;
      }
      var geomap_city  = $('input[name="geomap_city"]',this).val();
      var geomap_miles = $('select[name="geomap_miles_sel"]',this).val();
      var filersCount = $('input[name="geomap_filter_count"]',this).val();
      var filterJson = "";
      var imageName = 'geomap_'+sketch_id+'_'+GeoMapImgNum+'.png';
      var img_name = img_dir+imageName;
      for (i = 1; i <= filersCount; i++) {
        if($('#geomap_filter'+i).length == 0) {
          continue;
        }
        if($('input[name="geomap_filter_cond_val'+i+'"]',this).val() == "" ) {
          continue;
        }
        var colname  = $('select[name="geomap_filter_sel'+i+'"]',this).val();
        var operator	= $('select[name="geomap_filter_cond_sel'+i+'"]',this).val();
        var required_val = $('input[name="geomap_filter_cond_val'+i+'"]',this).val();
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
      var GlobaldataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "geomap_lat":"'+geomap_lat+'",';
      GlobaldataJson += '"geomap_long":"'+geomap_long+'", "geomap_city":"'+geomap_city+'", "geomap_miles":"'+geomap_miles+'", "filters":'+filterJsonwithGlobal+'}';
      var dataJson = '{"csv_path":"'+csv_path+'", "img_path":"'+img_name+'", "chart_title":"'+chart_title+'", "geomap_lat":"'+geomap_lat+'",';
      dataJson += '"geomap_long":"'+geomap_long+'", "geomap_city":"'+geomap_city+'", "geomap_miles":"'+geomap_miles+'", "filters":'+filterJson+'}';
      chart_data = "chart_data=" + GlobaldataJson +"&sketch_id=" + sketch_id+"&chart=geomap";
      tooltipPath = '/wiki/geo-map';
      var tooltipTitle = "tooltip";
      var panelhead = title+'<a class="tooltipp" title="'+tooltipTitle+'" target="_blank" href="'+tooltipPath+'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a><span id="geomap_'+GeoMapImgNum+'_'+sketch_id+'_'+dataid+'"  data-whatever="Geo Map" class="showForm geomap glyphicon glyphicon-pencil edit"></span>';
      panelhead   += '<span id="geomap_'+GeoMapImgNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
      var tabLi_a = title+'<i class="fa fa-arrows"></i>';
      if($('#edit_input').length != 0) {
        $( '#map_'+GeoMapImgNum).empty();
        $( '#geomap_'+GeoMapImgNum+' div.panel-body textarea').remove();
        $( '#geomap_'+GeoMapImgNum+' div.panel-heading').html(panelhead);
        $( '#tabs ul li.active a').html(tabLi_a);
      }
      else {
        $( ".graphical-area div.tab-pane" ).removeClass( "in active" );
        $( "#tabs ul li" ).removeClass( "active" );
        var geomapimgHTML = '<div id="geomap_'+GeoMapImgNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div>';
        geomapimgHTML += '<div class="panel-body" style="height: 700px; margin:0; padding:0;"><div id="map_'+GeoMapImgNum+'" style="height:97%; width:97%; margin:5px auto 5px auto;"></div>';
        geomapimgHTML += '</div></div>';
        $("#tabs ul").prepend('<li id="geomap_li_'+GeoMapImgNum+'" class="active"><a class="geo_map" data-toggle="tab" href="#geomap_'+GeoMapImgNum+'">'+tabLi_a+'</a></li>');
        $( ".graphical-area" ).append( geomapimgHTML );
      }
      $.ajax({
        type: "POST",
        url: "/tm_geomap/process/data",
        data: chart_data,
        beforeSend: function()
        {
          close_analytics_slide();
          $(".sections_forms").hide(0, on_form_hide);
          $('#map_'+GeoMapImgNum).append('<img class="loading_img" src="/sites/default/files/loading.gif">');
          $(window).scrollTop(0);
        },
        success: function (results) {
          var markers = [];
          results = results.replace("[1] ", "");
          results = results.replace(/"/g, "");
          var result = "["+results+"]";
          if (results == "") {
            var geomap_comp_json = '{"ImgType": "geomap", "ImgID": "geomap_img_'+GeoMapImgNum+'", "ImgName": "'+imageName+'", "dataset_id": "'+dataid+'","save_chart": "No", "data":['+dataJson+'], "markers":'+result+'}';
            var textAreaJsonField = '<textarea class="form-control json-data" id="geomap_img_'+GeoMapImgNum+'" name="geomap_img_'+GeoMapImgNum+'">'+geomap_comp_json+'</textarea>';
            $('#geomap_'+GeoMapImgNum+' div.panel-body').append(textAreaJsonField);
            updateChartsData(geomap_comp_json , 'geomap_img_'+GeoMapImgNum );
            var mapError = '<div id="danger_alert_msg_tc" style="text-align:left;" class="alert alert-danger alert-dismissible" role="alert">';
            mapError += "<strong>Chart not generated. Check your filters.</strong></div>";
            $('.loading_img').remove();
            $('#geomap_img_'+GeoMapImgNum).removeClass( "json-data" );
            $('#geomap_img_'+GeoMapImgNum).css( "display", "none" );
            $('#map_'+GeoMapImgNum).append(mapError);
            $('.nav-tabs a[href="#charts"]').tab('show');
            //$('#alertmsg').show();
            $('#save_report').addClass('alert-red');
          }
          else {
            var geomap_comp_json = '{"ImgType": "geomap", "ImgID": "geomap_img_'+GeoMapImgNum+'", "ImgName": "'+imageName+'", "dataset_id": "'+dataid+'", "data":['+dataJson+'], "markers":'+result+'}';
            var textAreaJsonField = '<textarea class="form-control json-data" id="geomap_img_'+GeoMapImgNum+'" name="geomap_img_'+GeoMapImgNum+'">'+geomap_comp_json+'</textarea>';
            $('#geomap_'+GeoMapImgNum+' div.panel-body').append(textAreaJsonField);
            updateChartsData(geomap_comp_json , 'geomap_img_'+GeoMapImgNum );
            markers = jQuery.parseJSON(result);
            var map_id = "map_"+GeoMapImgNum;
            var srcURL = init_map(map_id, markers);
            //generate_map_img(srcURL, GeoMapImgNum, chart_title);
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
      if(btnName == "geomap_addmore") {
        var next = $('#geomap_filter_count').val();
        next++;
        var getDom = $("#geomap_filter_sel1").html();
        var newAnd = '<div id="and_geomap_filter'+next+'" class="form-group form-inline andDiv">';
        var Andcont = '<span>And</span>';
        var newAndend = '</div>';
        var newfilterdiv = '<div id="geomap_filter'+next+'" class="form-group form-inline filterDiv">';
        var newline_filter_sel = '<select class="form-control filterColoumSel" id="geomap_filter_sel'+next+'" name="geomap_filter_sel'+next+'">';
        newline_filter_sel += getDom+'</select>';
        var newline_filter_cond_sel = '<select class="form-control" id="geomap_filter_cond_sel'+next+'" name="geomap_filter_cond_sel'+next+'">';
        newline_filter_cond_sel += '<option value="">--Select Operator--</option></select>';
        var newIn = '<input type="text" class="form-control" id="geomap_filter_cond_val'+next+'" name="geomap_filter_cond_val'+next+'" placeholder="Value">';
        var newfilterdivEnd = '</div>';
        var complDiv = newAnd+Andcont+newAndend+newfilterdiv+newline_filter_sel+newline_filter_cond_sel+newIn+newfilterdivEnd;
        var removebtn = '<input type="button" value="x" id="geomap_'+next+'" class="btn btn-danger remove-me" />';
        $( '#geomap_form .filterDiv' ).last().after(complDiv);
        $( '#geomap_filter'+next ).append(removebtn);
        $('#geomap_filter_count').val(next);
      }
    });
    /**** (remFilter) **/
    $('#secForms').on('click', '.remove-me', function() {
      var rmvbtnID = $(this).attr('id');
      var splitres = rmvbtnID.split("_");
      if(splitres[0] == 'geomap' ) {
        $('#and_geomap_filter'+splitres[1]).remove();
        $('#geomap_filter'+splitres[1]).remove();
      }
    });
    function on_form_hide() {
      $('#secForms').find("input[type=text]").val("");
      $('#geomap_form  .filterDiv:not(:first)').remove();
      $('#edit_input').remove();
    }
  });
})(jQuery);

function generate_map_img(srcURL, imgID, imgtitle) {
  var myPngImages =  document.getElementById('container-pdf-export');
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  var image = new Image();
  image.crossOrigin = "anonymous";  // This enables CORS
  image.src = srcURL;
  image.onload = function (event) {
    try {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      var image2 = new Image();
      image2.src = ctx.canvas.toDataURL();
      image2.title = imgtitle;
      image2.id = 'geomap_expImg_'+imgID;
      if(document.getElementById('geomap_expImg_'+imgID)){
        var pre_ele = document.getElementById('geomap_expImg_'+imgID);
        myPngImages.removeChild(pre_ele);
        myPngImages.appendChild(image2);
      }
      else {
        myPngImages.appendChild(image2);
      }
    }
    catch (e) {
      alert(e);
    }
  };
}
function init_map(divId, latLongarraystr) {
  var divChunk = divId.split("_");
  var imgID = divChunk[1];
  var markers = latLongarraystr;
  var map;
  //var centralLatLng = {lat: 37.090240, lng: -95.712891};
  for( i = 0; i < markers.length; i++ ) {
    var centralLatLng = {lat: markers[i][0], lng: markers[i][1]};
    break;
  }
  var mapOptions = {
    zoom: 6,
    center: centralLatLng,
    mapTypeId: 'terrain'
  };
  map = new google.maps.Map(document.getElementById(divId), mapOptions);
  for( i = 0; i < markers.length; i++ ) {
    var position = {lat: markers[i][0], lng: markers[i][1]};
    marker = new google.maps.Marker({
      position: position,
      map: map,
    });
  }
  var drawingManager = new google.maps.drawing.DrawingManager({
    //drawingMode: google.maps.drawing.OverlayType.MARKER, /***** Default palce marker on click ****/
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: ['polygon']
    },
  });
  drawingManager.setMap(map);
  var srcURL = '';
  //var srcURL = export_map(markers);
  return srcURL;
}
