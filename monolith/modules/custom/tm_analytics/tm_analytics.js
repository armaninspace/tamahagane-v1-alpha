
(function ($) {
  /**
   * Function for loads charts on report page
   */
  $(window).bind("load", function() {
    $('#delcharts').val('');
	var empty = $(".graphical-area").html().trim().length == 0;
	if ( empty ) {
	  //var path = Drupal.settings.tm_analytics.basepath;
	  //var path = drupalSettings.tm_analytics.baseUrl;
	  var sketch_id = $(".node--type-sketch.node--view-mode-full").data('history-node-id');
	  dataid = sketch_id;
		$.ajax({
		url: Drupal.url('tm_analytics/show_charts/' + dataid),
		type: "POST",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		beforeSend: function()
		{
		 $('.graphical-area').append('<div class="loading-div full-width"><img class="loading_img" src="/sites/default/files/loading.gif"></div>');
		 //$('.gridster').append('<div class="loading-div full-width"><img class="loading_img" src="/sites/default/files/loading.gif"></div>');
		},
		success: function (response) {
		  $('.loading-div').remove();
		  if (response.nocharts) {
			$('.graphical-area').append(response.nocharts);
		    //$('.gridster').html(response.nocharts);
		    //$('#charts #tabs').prepend('<div class="no-charts">No chart generated yet</div>');
			//$('.links').hide();
			return false;
		  } 
		  else {
			var $wrapper = $('#charts_list_ul');
			var $wrapper2 = $('.graphical-area');
			//var $wrapper2 = $('.gridster')
			$('#datacharts').remove();
			$('#chartsdata').append('<textarea id="datacharts" style="display: none">'+response.all_charts+'</textarea>');
/*				var textJson = $('#chartsdata #datacharts').val();
				var obj = jQuery.parseJSON(textJson);
				for (var i = 0; i < obj.length; i++) {
					id = obj[i]["id"];
					text = obj[i]["text"];
					value = obj[i]["value"];
					if(value) {
						//$wrapper2.append('<div class="analytics-textarea-main"><div id="txt-blocks-controls"><span class="glyphicon glyphicon-edit"></span><span id="txt-minus-plus" class="glyphicon glyphicon-minus-sign"></span><span class="glyphicon glyphicon-remove-sign"></span></div><div class="analytics-textarea"><div id="analytics-textarea-'+id+'" class="mathjax">'+value+'</div><textarea id="analytics-textarea-'+id+'" class="mathjax anatxt-area-edit" style="display: none"></textarea></div></div>'); //add input box
						$("textarea#analytics-textarea-"+id).val(value);
					}
				}*/
			//var $wrapper3 = $('#datacharts');
			//$wrapper3.html(response.all_charts);
			$wrapper.append(response.tabs);
			$wrapper.addClass("filled-tabs");
			$wrapper2.append(response.tabs_cont);
			if(response.tcluster_json) {
				$.each(response.tcluster_json, function(key,value){
					tclustermake(value.json_data , value.div_id, value.img_num);
				});
			}
			Drupal.attachBehaviors();
			setTimeout(function(){
			  window.HTMLWidgets.staticRender();
			}, 1100);
			//window.HTMLWidgets.staticRender();
			Drupal.attachBehaviors($wrapper[0]);
		  }
		  $('div.bi_plot').closest('div.compare-body').parent('div.panel-body').addClass('bi_compare');
		  $(window).scrollTop(0);

		}
	  });
	}
		setTimeout(function () {
		var head = document.getElementsByTagName("head")[0], script;
		script = document.createElement("script");
		script.type = "text/x-mathjax-config";
		script[(window.opera ? "innerHTML" : "text")] =
			"MathJax.Hub.Config({\n" +
			"  tex2jax: { inlineMath: [['$','$'], ['\\\\(','\\\\)']] }\n" +
			"});"
		head.appendChild(script);
		script = document.createElement("script");
		script.type = "text/javascript";
		script.src  = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=TeX-MML-AM_CHTML";
		head.appendChild(script);
 	  $('.draggable-element').arrangeable({dragSelector: '.glyphicon-move'});
		},1000)

  });
  $(document).ready(function() {



    /**
     * To Close parameter modal on chart edit.
     */
		var max_fields      = 10; //maximum input boxes allowed
		var wrapper         = $(".graphical-area"); //Fields wrapper
		var add_button      = $("#charts-add-text"); //Add button ID
		var x;
		$(add_button).click(function(e){ //on add input button click
			e.preventDefault();
			//var x = $('.analytics-textarea').length;
		/*	if($('.analytics-textarea').length > 0) {
				var lastid = $('.analytics-textarea').children().last('textarea').attr('id');
				var res = lastid.split("-");
				x = res['2'];
			}
			else {
				x = 0;
			}*/

			var divs_length = $('.graphical-area .analytics-textarea-main').length;
			divs_length = divs_length + 1;


			/*	alert($('.analytics-textarea').length);
        if($('.analytics-textarea').length > 0) {
          x = $('.analytics-textarea').length;
        }
        else {
          x = 0;
        }*/
			//if(x < max_fields){ //max input box allowed
				//x++; //text box increment
			$(wrapper).prepend('<div class="analytics-textarea-main draggable-element" id="text_div_'+divs_length+'"><div id="txt-blocks-controls"><span class="glyphicon glyphicon-move"></span><span id="txt-minus-plus" class="glyphicon glyphicon-minus-sign"></span><span class="glyphicon glyphicon-remove-sign"></span></div><div class="analytics-textarea"><textarea id="analytics-textarea-'+divs_length+'"></textarea></div></div>'); //add input box
			$('.draggable-element').arrangeable({dragSelector: '.glyphicon-move'});
			//}
			//var selector = $("[id ^=analytics-textarea-]");
			var selector = $("#analytics-textarea-"+divs_length);
      var txtdivid = "text_div_"+divs_length;
			tinyMCE.init({
				mode : "textareas",
				theme : "modern",
        fixed_toolbar_container: '#mytoolbar',
        toolbar: " bold italic | forecolor backcolor emoticons mathslate |fontselect | fontsize",
        plugins: "mathslate",
        force_br_newlines : false,
				//force_p_newlines : false,
				forced_root_block : '',
				selector : "#analytics-textarea-"+divs_length,
        init_instance_callback: function (editor) {
          editor.on('blur', function (e) {
           // alert("#analytics-textarea-"+divs_length);
            var htmlContent = tinyMCE.get("analytics-textarea-"+divs_length).getContent();
            var txtval = htmlContent.replace(/"/g, "'");
            txtval = txtval.replace(/(?:\r\n|\r|\n)/g, '<br />');
            addtxtDivs(txtdivid, txtval);
          });
        }
			});
		});

		function addtxtDivs(txtdivid, txtval){
			var textJson = jQuery('#chartsdata #datacharts').val();
			textJson = textJson.trim();
			var already = false;
			if (textJson && textJson != 'undefined') {
				var obj = jQuery.parseJSON(textJson);
					obj.push({
						"divId": txtdivid,
						"type": "text",
						"value": txtval
					});
				$('#chartsdata #datacharts').val(JSON.stringify(obj));
			}
			else{
				var array = [];
				array.push({
					"divId": txtdivid,
					"type": "text",
					"value": txtval
				});
				$('#chartsdata #datacharts').val(JSON.stringify(array));
			}
		}

		$(wrapper).on("click",".analytics-textarea-main .glyphicon-remove-sign", function(e) { //user click on remove text
			e.preventDefault(); $(this).parent().parent('div').remove(); x--;
		})
		$(wrapper).on("click","#txt-minus-plus", function(e) {
			if($(this).hasClass('glyphicon-minus-sign')) {
				$(this).removeClass("glyphicon-minus-sign").addClass("glyphicon-plus-sign");
			}
			else {
				$(this).removeClass("glyphicon-plus-sign").addClass("glyphicon-minus-sign");
			}
			if($(this).parent().parent().attr('class') == "analytics-textarea-main draggable-element"){
				$(this).parent().parent().find(".analytics-textarea").slideToggle("fast");

			} else if($(this).parent().parent().attr('class') == "img_div") {
				$(this).parent().parent().find("div.img-body").slideToggle("fast");
			} else {
				$(this).parent().parent().find("div.panel-body").slideToggle("fast");
			}
		});

		$(wrapper).on("click",".glyphicon-edit", function(e) {
			$(this).parent().parent().find("textarea").slideToggle("fast");
		});

		//$('.analytics-textarea-main').arrangeable();

    /**
     * to apply fine uploader to upload images
     */
    jQuery('#imgsDivData').val('');
    $("#charts-add-img").click(function () {
      var wrapper = $(".graphical-area");
      var divs_length = $('.graphical-area .img_div').length;
      divs_length = divs_length + 1;
      var html = '<div id="img_div_'+divs_length+'" class="img_div">';
          html+=  '<div id="txt-blocks-controls"><span id="txt-minus-plus" class="glyphicon glyphicon-minus-sign"></span><span id="img_div_'+divs_length+'_rem" class="glyphicon glyphicon-remove-sign rem_img_div"></span></div>';
          html+= '<div class="img-body"></div>';
      html+= '</div>';
      // $("#img_div_"+divs_length).prepend('<a id="img_div_'+divs_length+'_rem" class="rem_img_div" href="#">Remove</a>');

      var div_id = "img_div_"+divs_length;
      $(".graphical-area").prepend(html);
      $("#img_div_"+divs_length+" .img-body").fineUploader({
        template: 'qq-template-gallery',
        request: {
          endpoint: '/upload-file'
        },
        validation: {
          allowedExtensions: ['jpeg', 'jpg', 'gif', 'png']
        },
        deleteFile: {
          enabled: true,
          endpoint: '/delete'
        },
        callbacks: {
          onComplete: function(id, name, responseJSON, xhr){
            //alert(div_id+'-----'+name+'-----'+responseJSON.uuid);
            addImgDivs(div_id, name, responseJSON.uuid);

          },
          onDeleteComplete: function(id, xhr, isError) {
						var img_name = this.getName(id);
						var textJson = $('#chartsdata #datacharts').val();
						if(textJson.length > 0){
							var obj = jQuery.parseJSON(textJson);
							for (var i = obj.length; i--;) {
								if (obj[i]['divId'] && obj[i]['divId'] == div_id) {
									for(var j = obj[i]['images'].length; j--;){
										if(obj[i]['images'][j]['img_name'] == img_name){
											// delete obj[i]["images"][j];
											obj[i]["images"].splice(j, 1);
										}
									}
								}
							}
							$('#chartsdata #datacharts').val(JSON.stringify(obj));
						}
          }
        }
      });

    });
		function addImgDivs(divid, img_name, img_dir){
			var textJson = jQuery('#chartsdata #datacharts').val();
			textJson = textJson.trim();
			var already = false;
			if (textJson && textJson != 'undefined') {
				var obj = jQuery.parseJSON(textJson);
				obj.map(function (singlobj) {
					if (singlobj.divId && singlobj.divId == divid) {
						var options = {
							'img_name': img_name,
							'img_dir': img_dir
						};
						singlobj.images.push(options);
						already = true;
					}
				});
				if (already == false) {
					obj.push({
						"divId": divid,
						"type": "img_div",
						"images": [{
							'img_name': img_name,
							'img_dir': img_dir
						}]
					});
				}
				$('#chartsdata #datacharts').val(JSON.stringify(obj));
			}
			else{
				var array = [];
				array.push({
					"divId": divid,
					"type": "img_div",
					"images": [{
						'img_name': img_name,
						'img_dir': img_dir
					}]
				});
				$('#chartsdata #datacharts').val(JSON.stringify(array));
			}
		}
    $(".graphical-area").on("click", '.edit_txt_div', function() {
      var divID = $(this).attr('id');
      var splitID = divID.split("_");
      var txtdivid = "text_div_"+splitID[2];
			var valu = $("#analytics-textarea-"+splitID[2]).val();
      $("#analytics-textarea-"+splitID[2]).remove();
			$("#analytics-area-"+splitID[2]).hide();
      $("#text_div_"+splitID[2]).append('<textarea id="analytics-textarea2-'+splitID[2]+'">'+valu+'</textarea>');
			tinyMCE.init({
				mode : "textareas",
				theme : "modern",
				fixed_toolbar_container: '#mytoolbar',
				toolbar: " bold italic | forecolor backcolor emoticons mathslate |fontselect | fontsize",
				plugins: "mathslate",
				force_br_newlines : false,
				//force_p_newlines : false,
				forced_root_block : '',
				selector : "#analytics-textarea2-"+splitID[2],
				init_instance_callback: function (editor) {
					editor.on('blur', function (e) {
            var htmlContent = tinyMCE.get("analytics-textarea2-"+splitID[2]).getContent();
						var txtval = htmlContent.replace(/"/g, "'");
						txtval = txtval.replace(/(?:\r\n|\r|\n)/g, '<br />');
						addtxtDivs(txtdivid, txtval);
					});
				}
			});
    });
    $(".graphical-area").on("click", '.rem_img_div', function() {
      var delID = $(this).attr('id');
      var splitID = delID.split("_");
      var divID = splitID[0]+'_'+splitID[1]+'_'+splitID[2];
      var textJson = $('#chartsdata #datacharts').val();
      var textJson2 = $('#imgsDivData').val();
      var data = '';
      if(textJson.length > 0){
        var obj = jQuery.parseJSON(textJson);
        for (var i = obj.length; i--;) {
          if (obj[i]['divId'] && obj[i]['divId'] === divID) {
            data = obj[i]['images'];
            obj.splice(i, 1);
          }
        }
        $('#chartsdata #datacharts').val(JSON.stringify(obj));
      }
      if(textJson2.length > 0){
        var obj2 = jQuery.parseJSON(textJson2);
        for (var i = obj2.length; i--;) {
          if (obj2[i]['divId'] && obj2[i]['divId'] === divID) {
            data = obj2[i]['images'];
            obj2.splice(i, 1);
          }
        }
        $('#imgsDivData').val(JSON.stringify(obj2));
      }
      $.ajax({
        type: "POST",
        url: Drupal.url('tm_analytics/delete_img_files'),
        data: "data_arr=" + JSON.stringify(data),
        success: function (result) {
          if(result){
            $('#'+divID).remove();
          }
        }
      });

    });

		$(".graphical-area").on("click", '.rem_txt_div', function() {
			var delID = $(this).attr('id');
			var splitID = delID.split("_");
			var divID = splitID[0]+'_'+splitID[1]+'_'+splitID[2];
			var textJson = $('#chartsdata #datacharts').val();
			var data = '';
			if(textJson.length > 0){
				var obj = jQuery.parseJSON(textJson);
				for (var i = obj.length; i--;) {
					if (obj[i]['divId'] === divID) {
						data = obj[i]['images'];
						obj.splice(i, 1);
					}
				}
				$('#chartsdata #datacharts').val(JSON.stringify(obj));
			}
		});


    $("body").on("click", '.graphical-area .myTab .edit', function(){
      $('#AreachartDiv, #3dScatterDiv, #surfacechartdiv, #crosstabsDiv, #histogramchartdiv, #3dScatterDiv, #linechartDiv, #2dscatterDiv, #AreachartDiv, #surfacechartdiv, #PiechartDiv, #BubblechartDiv,#BoxplotDiv').empty();
      $("#exTab1 .tab-content").show();
      $("#chart-edit-title").after().append('<span class="glyphicon glyphicon-remove-circle close-chart-edit"></span>');
	    $('.alert-danger, .alert-success').remove();
    });
    /**
    * Function to sort charts li
    */
	$('.graphical-area ul li').addClass('test');
    $("#charts_list_ul").sortable({
      start: function(event, ui) {
        ui.item.data('start_pos', ui.item.index());
      },
      stop: function(event, ui) {
	    var start_pos = ui.item.data('start_pos');
	    if (start_pos != ui.item.index()) {
	      //$('#alertmsg').show();
		  //$('#save_report').addClass('alert-red');
		  $('#btn-save').addClass('alert-red')
	    }
      }
    });
	$(".dropdown-menu").on('click', 'li a', function(){
	  $(this).parents('.dropdown').find('.dropdown-toggle').html($(this).text()+' <span class="caret"></span>');
	  $('#secForms').append('<div class="loading-div full-width"><img class="loading_img" src="/sites/default/files/loading.gif"></div>');
	  setTimeout(function() {
		$('.loading-div').remove();
	  }, 2000);
	});
	$('body').on('click', 'div.panel-heading span.showForm', function(){
	  //alert('test');
	  var whatever = $(this).attr('data-whatever');
	  var whattext = '';
	  var whatattr = '';
	  //alert(whatever);
	  $(".dropdown-menu li a").each(function() {
		whatattr = $(this).attr("data-whatever");
		whattext = $(this).text();
		//alert(whatattr);
		if (whatever == whatattr) {
		  //alert(whattext);
		  $(this).parents('.dropdown').find('.dropdown-toggle').html(whattext+' <span class="caret"></span>');
		}
	  });
	});
    /**
     * to clear all charts
     */
    $('body').on('click','#btn-clear-report', function() {
	  var imgName = '';
	  var imgType = '';
	  var filesArray = new Array();
      close_form_slide();
      $('#secForms').empty();
	  var textJson = $('#chartsdata #datacharts').val();
	  var obj = jQuery.parseJSON(textJson);
	  for (var i = obj.length; i--;) {
			if (!obj[i].type) {
				imgType = obj[i]["ImgType"];
				if (imgType != 'shtml') {
					imgName = obj[i]['ImgName'].replace(',', '');
					filesArray.push(imgName);
					var preVal = $.trim($('#delcharts').val());
					var newVal = preVal + ',' + imgName;
					newVal = (newVal[0] == ',') ? newVal.substr(1) : newVal;
					$('#delcharts').val(newVal);
				}
			}
	  }
	  //alert(filesArray[0]);
	  var jsonString = JSON.stringify(filesArray);
	  $.ajax({
		type: "POST",
		url: Drupal.url('tm_analytics/clear_charts'),
		//data : "chart_id="+chart_id,
		data: {data : jsonString},
		success: function (result) {
		  $('#datacharts').empty();
		  $('.graphical-area').empty();
		  //$('.gridster').empty;
		  $('#charts_list_ul').empty();
			$('.input_fields_wrap').empty();
		  //$('#alertmsg').show();
		  //$('#save_report').addClass('alert-red');
		  $('#btn-save').addClass('alert-red')
		}
	  });
    });
    /**
     * change area of li on checked nd unchecked event
     */
	$('.select-chart-dropbox').on('click', 'li span', function(e) {
	  e.stopPropagation();
	  $(this).toggleClass("selected-li");
	  if ($(this).parents("#selected1").length) {
		var orderno = $(this).parents("li").attr("order-list");
		var groupnamethis = $(this).parents("li").attr("group-name");
		var allline = $(this).parents("li").html();
		var alllineAttr = $(this).parents("li").attr("data-search-term");
		var allorderno = '';
		$(this).parents("li").remove();
		var ullilenght = $("ul#selected1 li").length;
		if (ullilenght < 2) {
		  $(".select-chart-dropbox ul#selected1 ").removeClass("block");
		}
		var counter = 0;
		$(".select-chart-dropbox #other li.dropdown-content").each(function() {
		  var groupname = $(this).attr("group-name");
		  var allorderno = $(this).attr("order-list");
		  if(groupname == groupnamethis ) {
			if ( parseInt(allorderno) + 1 ==   parseInt(orderno) ) {
			  $(this).after('<li class="dropdown-content" data-search-term="'+alllineAttr+'" order-list="'+orderno+'" group-name="'+groupname+'">'+allline+'</li>');
			  counter++;
			  return false;
			}
		  }
		});
		if(counter == 0) {
		  $(".select-chart-dropbox #other li.dropdown-header").each(function() {
			var groupname = $(this).attr("group-name");
			if(groupname == groupnamethis ) {
			  $(this).after('<li class="dropdown-content" data-search-term="' + alllineAttr + '" order-list="' + orderno + '" group-name="' + groupname + '">' + allline + '</li>');
			}
		  });
		}
	  }
	  if ($(this).parents("#other").length) {
		var orderno = $(this).parents("li").attr("order-list");
		var getclass = $(this).parents("li").attr("class");
		var groupname = $(this).parents("li").attr("group-name");
		var allline = $(this).parents("li").html();
		var alllineAttr = $(this).parents("li").attr("data-search-term");
		 $(this).parents("li").remove();
		var ullilenght = $("ul#selected1 li").length;
		if (ullilenght==1) {
		  $(".select-chart-dropbox ul#selected1 ").addClass("block");
		}
		$(".selectpicker ul#selected1 ").append('<li class="dropdown-content" data-search-term="'+alllineAttr+'" order-list="'+orderno+'" group-name="'+groupname+'">'+allline+'</li>');
		$(".selectpicker ul#selected1 ").show();
	  }
	});
	/**
	* for live search ul li start
	*/
	$('.select-chart-dropbox').on('click','input.live-search-box', function(e){
      e.stopPropagation();
	});
	$('.live-search-box').on('keyup', function(){
	  var searchTerm = $(this).val().toLowerCase();
	  $('.live-search-list li').each(function(){
		if ($(this).filter('[data-search-term *= ' + searchTerm + ']').length > 0 || searchTerm.length < 1) {
		  $(this).show();
		} 
		else {
		  $(this).hide();
		}
	  });
	  $('#selected1 li').each(function(){
		if ($(this).filter('[data-search-term *= ' + searchTerm + ']').length > 0 || searchTerm.length < 1) {
		  $(this).show();
		} 
		else {
		  $(this).hide();
		}
	  });
	});
	$('#searchbox').on('keyup', function() {
	  // Declare variables
	  var input, filter, ul, li, a, i;
	  input = document.getElementById('searchbox');
	  filter = input.value.toUpperCase();
	  ul = document.getElementById("charts_list_ul");
	  li = ul.getElementsByTagName('li');
	  // Loop through all list items, and hide those who don't match the search query
	  for (i = 0; i < li.length; i++) {
		a = li[i].getElementsByTagName("a")[0];
		if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
		  li[i].style.display = "";
		} else {
		  li[i].style.display = "none";
		}
	  }
	});
    /**
    * show/hide form on dataset change
    */
    $("body").on("change", '#dataset_val', function(){
	  $('#secForms').empty();
	  jQuery('#no_chart_msg').hide();
    });
  
	/**
	 * tabs view settings
	 */
	$("body").on("click", '.analytics-column .nav-tabs a', function(){
	  $('#dataset_val').removeAttr('disabled');

	  $(this).tab('show');
	});
  
	/**
	 * to remove special chars
	 */
	$(document).on("keyup", "#chart-div .sections_forms input:text, #data-view-filters input:text", function () {
		var specialchars = /[^a-z0-9\s.]/gi;
		var slctVal = $(this).prev('select').val();
		if(slctVal == "isIn"){
			specialchars = /[^a-z0-9\s.,]/gi;
		}
		if (specialchars.test($(this).val())) {
			if(slctVal != "regEx"){
				$(this).val($(this).val().replace(specialchars, ''));
				$(this).focus();
				if ($('.op-spec-div .alert-danger').length == 0) {
					$(this).parent().parent().parent().prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> No special characters allowed </div>');
				}
				else {
					$('.op-spec-div .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> No special characters allowed.');
				}
				$('.tab-content, #chart-div .op-spec-div').animate({ scrollTop: 0 }, 'slow');
				$(window).scrollTop(0);
			}
		}
	});
  
	/**
	 * to verify factor type filters
	 */
	$("body").on("click", "#chart-div .op-spec-div .sections_forms input[type='submit'], #design #secForms .sections_forms input[type='submit']", function() {
	  var formid= $(this).closest('form').attr('id');
      var mainDiv = $(this).parent().parent().parent().attr('id');
	  var count=1;
	  var input_type=true;
	  var equal = "==";
	  var notequal = "!=";
	  var arr = [];
	  var error=0;
      $('#'+ mainDiv +' #'+formid + ' .filterDiv').each(function() {
		var option=$(this).find('option:selected', 'select').attr('data-type');

		var option_val=$(this).find('option:selected', 'select').val();
		var op_value=$(this).find('select').next().val();
		var theValue = $(this).find('input').val();
		var val_type = isNaN(theValue);
		if (op_value == "contains") {
		  theValue = theValue.toLowerCase()
		}
		var total = option_val + '-' + op_value + '-' + theValue;
		if (option_val && op_value && theValue) {
		  arr.push(total);
		}
		if (option=="factor" && val_type == input_type && op_value != equal && op_value != notequal) {
		  error = 1;
		} else if (option=="integer" && val_type == input_type && op_value != "regEx") {
		  error = 2;
		} else if (option == "numeric" && val_type == input_type && op_value != "regEx") {
		  error = 2;
		} else if (option == "factor" && (op_value == '>' || op_value == '<' || op_value == '>=' || op_value == '<=')){
            error = 3;
        }
		count++;
	  });
	  if (error == 1) {
		  if ($('.alert-danger').length == 0) {
			  $(this).parent().parent().parent().prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filters Error! only equal or not-equal allowed for factor. </div>');
		  } else {
			  $('.alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filters Error! only equal or not-equal allowed for factor. ');
		  }
        $('.tab-content, #chart-div .op-spec-div').animate({ scrollTop: 0 }, 'slow');
        $(window).scrollTop(0);

		return false
	  }
	  if (error == 2) {
		  if ($('.alert-danger').length == 0) {
			  $(this).parent().parent().parent().prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filters Error! Please enter numeric value for numeric filter. </div>');
		  } else {
			  $('.alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filters Error! Please enter numeric value for numeric filter. ');
		  }
        $('.tab-content, #chart-div .op-spec-div').animate({ scrollTop: 0 }, 'slow');
        $(window).scrollTop(0);

		return false
	  }
	  if (error == 3) {
		  if ($('.alert-danger').length == 0) {
			  $(this).parent().parent().parent().prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filters Error! greater than or less than not allowed with factor. </div>');
		  } else {
			  $('.alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filters Error! greater than or less than not allowed with factor. ');
		  }
        $('.tab-content, #chart-div .op-spec-div').animate({ scrollTop: 0 }, 'slow');
        $(window).scrollTop(0);

	  	return false;
	  }

	  var arr_len = arr.length;
	  var sor = arr.sort();
	  var arr_uniq = jQuery.unique( sor );
	  var uniq_len = arr_uniq.length;
	  if(arr_len != uniq_len) {
		//alert('Filter Error!! filters must be unique');
		  if ($('.op-spec-div .alert-danger').length == 0) {
		  	//$(this).parent().prepend('<div id="alert-msg"></div>');
			  $(this).parent().parent().parent().prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filters Error! filters must be unique. </div>');
		  } else {
			  $('op-spec-div .alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Filters Error! filters must be unique. ');
		  }
        $('.tab-content, #chart-div .op-spec-div').animate({ scrollTop: 0 }, 'slow');
        $(window).scrollTop(0);
		return false;
	  }
	});
	/**
	 * (OperatorChangeFunc)
	 */
	$("body").on("change", '#chart-div .filterColoumSel, #secForms .filterColoumSel', function() {
	  var selectID = this.id;
	  var splittedID = selectID.split("_");
	  var condselectID = '#'+splittedID[0]+'_'+splittedID[1]+'_cond_'+splittedID[2];
	  var selectedValType = $('option:selected', this).attr("data-type");
	  var optionString = '<option value="">--Select Operator--</option>';
	  if (selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor"  || selectedValType == "logical") {
		  optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
	  }
	  else if (selectedValType == "character") {
		optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
	  }
	  $(condselectID).html(optionString);
	});
	/**
	 * Save Report Func.
	 */
	var modalConfirm_save = function(callback){
	  $("#btn-yes").on("click", function() {
		callback(true);
		$("#save-modal").modal('hide');
	  });
	  $("#btn-no").on("click", function() {
		callback(false);
		$("#save-modal").modal('hide');
	  });
	};
	$('#save_report').click(function( event ) {
	  var cnfirmform ="";
	  var cnfirm = "";
	  if($('#secForms form').is(':visible')) {
	    /*$("#save-modal").modal('show');
	    $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
	    $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
	    $('body').removeClass("modal-open");
	    $('body').css("padding-right","");*/
	    //modalConfirm_save(function(confirm) {
	    /*if (confirm("Are you sure you want to save without submit form ?")) {

		  cnfirmform = "true";
		}
	    else {
		  return false;
	    }*/
	    //});
	  }

		var sketch_id = $(".node--type-sketch.node--view-mode-full").data('history-node-id');
		var rid = sketch_id;
		var textJson = $('#chartsdata #datacharts').val();
		var all = [];
		if (textJson && textJson != 'undefined') {
		  textJson = jQuery.parseJSON(textJson);
			$('div.graphical-area>div').each(function () {
				var id = $(this).attr('id');
				var splitID = id.split("_");
				var img_id = splitID[0] + '_img_' + splitID[1];
				textJson.map(function (person) {
					if (person.ImgID && person.ImgID == img_id) {
						all.push(person);
					} else if(person.divId && person.divId == id){
						all.push(person);
					}
				});
			});

 		 for (var i = all.length; i--;) {
			if (all[i]['save_chart'] === "No") {
				all.splice(i, 1);
			}
		  }
		}
		//var anatextareaCount = $('.analytics-textarea').length;
		/*if($('.analytics-textarea').length > 0) {
			var lastid = $('.analytics-textarea').children().last('textarea').attr('id');
			var res = lastid.split("-");
			var anatextareaCount = res['2'];
		}*/

		/*var anatextareaJson = [];
		for (i = 1; i <= anatextareaCount; i++) {
			if ($('#analytics-textarea-'+i).length == 0) {
				continue;
			}
			var anatextarea = $('textarea#analytics-textarea-'+i).val();
			var id = i;
			anatextareaJson.push({
				"id":id,
				"value":anatextarea,
				"type": 'text'
			});
		}
		for (i = 0; i < anatextareaJson.length; i++) {
			//all.push(anatextareaJson[i]);
		}*/

		var delcharts = $('#delcharts').val();
	    data = "str=" + JSON.stringify(all) + "&sketch_id=" + rid + "&filenames=" + delcharts;
		  $.ajax({
			type: "POST",
			url: "/tm_analytics/save_charts",
			data: data,
			beforeSend: function () {
				//jQuery(".analytics-column .graphLoader-save").css('visibility', 'visible');
			},
			success: function (result) {
				//window.location.href = window.location.protocol + "//" + window.location.host + result;
				jQuery(".analytics-column .graphLoader-save").css('visibility', 'hidden');
				//jQuery('#alertmsg').hide();
				//$('#save_report').removeClass('alert-red');
				$('#btn-save').removeClass('alert-red');
				//jQuery("#chartsmsgModal").modal("show");
				//setModalBackdrop2();
				/*$(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
				$('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
				$('body').removeClass("modal-open");
				$('body').css("padding-right", "");*/
				$('div.panel-body').removeClass('bi_compare');
			}
			/* success: function (result) {
			 window.location.href = window.location.protocol + "//" + window.location.host + result;
			 }*/
		});

	});
	/**
	 * Delete Chart
	 */
	var modalConfirm = function(callback){
	  $("#modal-btn-yes").on("click", function() {
		callback(true);
		$("#del-modal").modal('hide');
	  });
	  $("#modal-btn-no").on("click", function() {
		callback(false);
		$("#del-modal").modal('hide');
	  });
	};
$(".graphical-area").on("click", '.rem-chart', function() {
	  $("#del-modal").modal('show');
	 /* $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
	  $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
	  $('body').removeClass("modal-open");
	  $('body').css("padding-right","");*/
		setModalBackdrop2();
	  var delID = $(this).attr('id');
	  var splitID = delID.split("_");
	  var remDiv = splitID[0];
	  var delID = splitID[1];
	  var delDiv = splitID[0]+'_'+splitID[1];
	  var imgid = splitID[0] + '_img_' + delID;
	 
	  modalConfirm(function(confirm) {
		if(confirm){
			//alert(delDiv);
		  var all = [];
		  var textJson = $('#chartsdata #datacharts').val();
		  var imgJson = '';
		  if (remDiv == 'dtree') {
			imgJson = $("textarea#dt_img_"+delID).val(); 
			//alert(imgJson);
		  }
		  else {
		    imgJson = $("textarea#"+imgid).val();
		  }
		  //var imgJson = $("'#'+delDiv+ '.form-control.json-data'").val();
			//alert(imgid);
			//alert(imgJson);
		  var obj = jQuery.parseJSON(textJson);
		  var obj2 = jQuery.parseJSON(imgJson);
			//alert(obj2["ImgName"]);
		  var imgName ='';
		  if(remDiv != 'compare') {
			imgName = obj2["ImgName"];
		  }
		  else {
			imgName = '';
		  }
		  for (var i = obj.length; i--;) {
			if (obj[i]['ImgID'] === imgid) {
			  obj.splice(i, 1);
			}
		  }

			  $.ajax({
				type: "POST",
				url: Drupal.url('tm_analytics/delete_charts'),
				//data : "chart_id="+chart_id,
				data: "img_name=" + imgName,
				success: function (result) {
			      if (remDiv == 'dtree') {
					$('#dt_li_' + delID).remove();
					$('#dt_' + delID).remove();
					$('#dt_expImg_' + delID).remove();
				  }
				  else {
					$('#' + remDiv + '_li_' + delID).remove();
					$('#' + remDiv + '_' + delID).remove();
					$('#' + remDiv + '_expImg_' + delID).remove();
				  }
				  $("#tabs ul li").first().addClass("active");
				  $("#tabs ul li a").first().trigger("click");
				  $(".tab-content .myTab").first().addClass("in active");
				  $('#delcharts').val(imgName);
				  //$('#save_report').addClass('alert-red');
				  $('#btn-save').addClass('alert-red')
				}
			  });

		  //$('#alertmsg').show();
		  return false;
		}
		else {
		}
	  });
	  /*var cnfirm = confirm('Are you sure you want to delete this chart?');
	  if (cnfirm) {
		var delID = $(this).attr('id');
		var splitID = delID.split("_");
		var remDiv = splitID[0];
		var delID = splitID[1];
		var imgid = splitID[0] + '_img_' + delID;
		$('#'+remDiv+'_li_'+delID).remove();
		$('#'+remDiv+'_'+delID).remove();
		$('#'+remDiv+'_expImg_'+delID).remove();
		$( "#tabs ul li" ).first().addClass( "active" );
		$( "#tabs ul li a" ).first().trigger( "click" );
		$( ".tab-content .myTab" ).first().addClass( "in active" );
		var all = [];
		var textJson = $('#chartsdata #datacharts').val();
		var obj = jQuery.parseJSON(textJson);
		for (var i = obj.length; i--;) {
		  if (obj[i]['ImgID'] === imgid) {
		    obj.splice(i, 1);
		  }
		}
		$('#alertmsg').show();
		return false;
	  }*/
	});
	/**
	* to cancel form
	*/
	$('body').on('click','.cancel_btn, .close-chart-edit, .close-nav-tabs', function() {
    $('#edit_input').remove();
    $('.op-area-note').show();
    $('#exTab1 .nav-tabs, #exTab1 .tab-content').hide();
    $(window).scrollTop(0);
	});
	/**
	* compare charts code
	*/
    $("body").on("click", '#charts_list_ul li a.comparechart', function(e) {
        close_analytics_slide();
        return false;
    });
		$("body").on("click", '#elements_list_ul li', function(e) {
			close_analytics_slide();
			$(".charts-text span").removeClass("glyphicon-minus").addClass("glyphicon-plus");
			return false;
		});
	var path = '/modules/custom/tm_analytics';
	var sketch_id = $(".node--type-sketch.node--view-mode-full").data('history-node-id');

	$('#compareModal').on('hidden.bs.modal', function () {
      $( "#compare_title" ).val("");
      $("#compare_rows_col").val($("#compare_rows_col option[value='']").val());
      $( "#newSelects" ).empty();
      $('#edit_input').remove();
    });
    $("#compareModal").on("change", '#compare_rows_col', function() {
      var valopt = $(this).val();
      change_compare_opt(valopt);
    });
	  $('body').on('submit', 'form#compare_chart_form', function(e) {
		  var title = $('input[name="compare_title"]').val();
		  var compareSecNum = $('#charts ul li .comparechart').length;
		  if(!compareSecNum || compareSecNum==0) {
			  var compareSecNum = 1;
			  $('input[name="compare_sec_num"]').val(compareSecNum);
		  }
		  else {
			  if($('#edit_input').length != 0) {
				  var barchartImgNum = $('#edit_input').val();
			  }
			  else {
				  compareSecNum++;
				  $('input[name="compare_sec_num"]').val(compareSecNum);
			  }
		  }
		  var panelhead = title+'<span id="compare_'+compareSecNum+'_'+sketch_id+'" class="glyphicon glyphicon-pencil comp_edit edit"></span>';
		  panelhead   += '<span id="compare_'+compareSecNum+'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
		  var tabLi_a = title+'<i class="fa fa-arrows"></i>';
		  if($('#compare_rows_col').val() == 1) {
			  var divQuantity = '<div id="compare_'+compareSecNum+'_subdiv_0" class="col-md-6 compare-sub-div form-group" style="height:520px;width: 50%;"><img class="loading_img" src="'+path+'/includes/img/loading.gif"></div>';
			  divQuantity += '<div id="compare_'+compareSecNum+'_subdiv_1" class="col-md-6 compare-sub-div form-group" style="height:520px;"><img class="loading_img" src="'+path+'/includes/img/loading.gif"></div>';
		  }
		  else if($('#compare_rows_col').val() == 2) {
			  var divQuantity = '<div id="compare_'+compareSecNum+'_subdiv_0" class="col-md-6 compare-sub-div form-group" style="height:520px;width: 50%;"><img class="loading_img" src="'+path+'/includes/img/loading.gif"></div>';
			  divQuantity += '<div id="compare_'+compareSecNum+'_subdiv_1" class="col-md-6 compare-sub-div form-group" style="height:520px;"><img class="loading_img" src="'+path+'/includes/img/loading.gif"></div>';
			  divQuantity += '<div id="compare_'+compareSecNum+'_subdiv_2" class="col-md-6 compare-sub-div form-group" style="height:520px;"><img class="loading_img" src="'+path+'/includes/img/loading.gif"></div>';
			  divQuantity += '<div id="compare_'+compareSecNum+'_subdiv_3" class="col-md-6 compare-sub-div form-group" style="height:520px;"><img class="loading_img" src="'+path+'/includes/img/loading.gif"></div>';
		  }
		  if($('#edit_input').length != 0) {
			  $( '#compare_'+compareSecNum+' div.panel-body').empty();
			  $( '#compare_'+compareSecNum+' div.panel-body').append(divQuantity);
			  $( '#compare_'+compareSecNum+' div.panel-heading').html(panelhead);
			  $( '#tabs ul li.active a').html(tabLi_a);
		  }
		  else {
			  $( ".graphical-area div.tab-pane" ).removeClass( "in active" );
			  $( "#tabs ul li" ).removeClass( "active" );
			  var maps ='<div id="compare_'+compareSecNum+'" class="tab-pane fade in active myTab panel panel-default"><div class="panel-heading">'+panelhead+'</div><div class="panel-body"><div class="compare-div">';
			  maps += divQuantity;
			  maps += "</div></div></div>";
			  $("#tabs ul").prepend('<li id="compare_li_'+compareSecNum+'" class="active"><a data-toggle="tab" class="comparechart" href="#compare_'+compareSecNum+'">'+tabLi_a+'</a></li>');
			  $('.graphical-area').append(maps);
		  }
		  var compare_rows_col = $('#compare_rows_col').val();
		  if($('#compare_rows_col').val() == 1) {
			  var sec1 = $('#section1 option:selected').val();
			  var sec2 = $('#section2 option:selected').val();
			  var sectionArray = [sec1, sec2];
		  }
		  else if ($('#compare_rows_col').val() == 2) {
			  var sec1 = $('#section1 option:selected').val();
			  var sec2 = $('#section2 option:selected').val();
			  var sec3 = $('#section3 option:selected').val();
			  var sec4 = $('#section4 option:selected').val();
			  var sectionArray = [sec1, sec2, sec3, sec4];
		  }
		  close_analytics_slide();
		  var dataJson = '{"chart_title":"'+title+'", "compare_rows_col":"'+compare_rows_col+'", "sections":"'+sectionArray+'"}';
		  var sectionArrayLen = sectionArray.length;
		  var imgNameArr = [];
		  var chartNameArr = [];
		  var plotlychartArr = ['line', 'scatter', 'area', 'surface', 'bubble','ddscatter','bar','pie','spmatrix','box','histo','heatmap','wcloud','bar','cmatrix','dt','rankingplot','bi','donutchart','geomap','tcluster','trendplot'];
		  (function() {
			  var index = 0;
			  function loadData() {
				  if (index < sectionArrayLen) {
					  var sectionArraySplit = sectionArray[index].split("_");
					  //alert(sectionArraySplit[0]);
					  var imgID = sectionArraySplit[0]+"_img_"+sectionArraySplit[1];
					  var textJson = jQuery('#datacharts').val();
					  var jsaonData = "";
					  var obj = jQuery.parseJSON(textJson);
					  for (var i = obj.length; i--;) {
						  if (obj[i]['ImgID'] === imgID) {
							  jsaonData = obj[i];
							  var imgName = jsaonData.ImgName;
							  imgNameArr.push(imgName);
							  // alert(imgName);
							  var chart_titles = jsaonData['data'][0]['chart_title'];
							  chartNameArr.push(chart_titles);
						  }
					  }
					  // var jsaonData = jQuery.parseJSON($("#"+imgID).text());
					  var imgName = jsaonData.ImgName;
					  var imgName_1 = imgName.split('_');
					  var chart_title = jsaonData['data'][0]['chart_title'];
					  var arraycheck = $.inArray(sectionArraySplit[0], plotlychartArr);
					  if (arraycheck > -1) {
						  $.get( "/sites/default/files/projectChartImages/"+imgName, function( data ) {
							  var k = Math.floor(Math.random()* 1000000);
							  $('#compare_'+compareSecNum+'_subdiv_'+index).html(chart_title);
							  $('#compare_'+compareSecNum+'_subdiv_'+index).append(data);
							  $('#compare_'+compareSecNum+'_subdiv_'+index+' > div#htmlwidget_container').attr('class',imgName_1[0]);
							  $('#compare_'+compareSecNum+'_subdiv_'+index+' > div#htmlwidget_container > div').attr('id', 'htmlwidget-'+k);
							  $('#compare_'+compareSecNum+'_subdiv_'+index+' > script').attr('data-for', 'htmlwidget-'+k);

							  //window.HTMLWidgets.staticRender();
							  setTimeout(function(){
								  window.HTMLWidgets.staticRender();
							  }, 1000);
							  ++index;
							  loadData();
						  });
					  }
					  else if (sectionArraySplit[0] == "tcluster") {
						  $.get( "/sites/default/files/projectChartImages/"+imgName, function( datacluster ) {
							  var divID = 'compare_'+compareSecNum+'_subdiv_'+index;
							  var jsonData = jQuery.parseJSON(datacluster);
							  var clusterJson = jsonData.cluster_json_Arr;
							  tclustermake(clusterJson, divID, 0);
							  ++index;
							  loadData();
						  });
					  }
					  else {
						  var maps2 = '<img src="/sites/default/files/projectChartImages/'+imgName+'?'+$.now()+'">';
						  $('#compare_'+compareSecNum+'_subdiv_'+index).html(maps2);
						  ++index;
						  loadData();
					  }
				  }
			  }
			  loadData();
		  })();
		  setTimeout(function() {
			  var compare_comp_json = '{"ImgType": "compare", "ImgID": "compare_img_'+compareSecNum+'", "ImgName": "'+imgNameArr+'","ChartName": "'+chartNameArr+'", "data":['+dataJson+']}';
			  var maps3 = '<textarea class="form-control json-data" id="compare_img_'+compareSecNum+'" name="compare_img_'+compareSecNum+'">'+compare_comp_json+'</textarea>';
			  $('#compare_'+compareSecNum+' div.panel-body').append(maps3);
			  $('div.biplot').closest('div.panel-body').addClass('bi_compare');
			  updateChartsData(compare_comp_json, 'compare_img_'+compareSecNum);
		  }, 3000);
		  //$('#alertmsg').show();
		  //$('#save_report').addClass('alert-red');
		  $('#btn-save').addClass('alert-red')
		  $('#compareModal').modal('hide');
		  $("#compareModal .modal-footer #compareSubmit").hide();
		  $('.nav-tabs a[href="#charts"]').tab('show');
		  return false;
	  });
      $("#compareModal").click(function () {
         /* $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
          $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
          $('body').removeClass("modal-open");
          $('body').css("padding-right","");*/
		  setModalBackdrop2();
      });
    //$('#compareModal').on('show.bs.modal', function (event) {
      //$(".comp_edit").click(function () {
      $(document).on("click", ".comp_edit, #compare_btn", function () {
      	var length = $('#charts_list_ul li').length;
		var length2 = $('#charts_list_ul li a.crossplot, #charts_list_ul li a.narrative_text').length;
		    length = length - length2;

        if (length < 2) {
            //alert('At least two charts required to compare!');
		  $("#two-chart-modal").modal('show');
		 /* $(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
		  $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
		  $('body').removeClass("modal-open");
		  $('body').css("padding-right","");*/
			setModalBackdrop2();
		  return false;
        }
        //var button = $(event.relatedTarget);
        var editID = $(this).attr('id');
        $("#compareModal .modal-footer #compareSubmit").hide();
        if (typeof editID !== typeof undefined && editID !== false && editID != "compare_btn") {
            var splitID = editID.split("_");
            var chartType = splitID[0];
            var imgID = splitID[1];
            var reportID = splitID[2];
            $('.graphical-area').append('<input class="editInput" type="hidden" name="edit_input" id="edit_input" value="' + imgID + '">');
            var textJson = $('#compare_img_' + imgID).val();
            var obj = jQuery.parseJSON(textJson);
            $.each(obj.data, function (key, value) {
                $('#compare_title').val(value['chart_title']);
                $('#compare_rows_col option[value="' + value["compare_rows_col"] + '"]').prop('selected', true);
                change_compare_opt(value["compare_rows_col"], value["sections"]);
            });
        }
          $('#compareModal .alert.alert-danger').remove();
          $('#compareModal').modal('show');
          /*$(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
          $('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
          $('body').removeClass("modal-open");
          $('body').css("padding-right","");*/
		  setModalBackdrop2();
      });
    function change_compare_opt(selectOpt, selectionArr = "") {
      var selection1 = "<label for= class='control-label'>Section 1</label><select id='selection1' class='form-control'>";
      var selection2 = "<label for= class='control-label'>Section 2</label><select id='selection2' class='form-control'>";
      var selection3 = "<label for= class='control-label'>Section 3</label><select id='selection3' class='form-control'>";
      var selection4 = "<label for= class='control-label'>Section 4</label><select id='selection4' class='form-control'>";
      var html = '';
      var splitselectionArr = selectionArr.split(",");
      var selected1 = "";
      var selected2 = "";
      var selected3 = "";
      var selected4 = "";

        $('#tabs li a').each(function() {
	    var vals = $(this).parents('li').attr('id').split('_');
	    if (vals[0] == "compare" || vals[0] == "cross" || vals[0] == "shtml" || vals[0] == "lreg" || vals[0] == "wcloud" || vals[0] == "geomap" || vals[0] == "tcluster" || vals[0] == "dt") {
		  return true;
	    }
	    var newvals = vals[0]+"_"+vals[2];
	    if (typeof splitselectionArr[0] !== typeof undefined && splitselectionArr[0] !== false && splitselectionArr[0] == newvals) {
	      selected1 = 'selected = "selected"';
	    }
	    else {
	      selected1 = "";
	    }
	    if (typeof splitselectionArr[1] !== typeof undefined && splitselectionArr[1] !== false && splitselectionArr[1] == newvals) {
	      selected2 = 'selected = "selected"';
	    }
	    else {
	      selected2 = "";
	    }
	    if (typeof splitselectionArr[2] !== typeof undefined && splitselectionArr[2] !== false && splitselectionArr[2] == newvals) {
	      selected3 = 'selected = "selected"';
	    }
	    else {
	      selected3 = "";
	    }
	    if (typeof splitselectionArr[3] !== typeof undefined && splitselectionArr[3] !== false && splitselectionArr[3] == newvals) {
	      selected4 = 'selected = "selected"';
	    }
	    else {
	      selected4 = "";
	    }
	    selection1 +='<option '+selected1+' value="'+newvals+'">'+$(this).text()+'</option>';
	    selection2 +='<option '+selected2+' value="'+newvals+'">'+$(this).text()+'</option>';
	    selection3 +='<option '+selected3+' value="'+newvals+'">'+$(this).text()+'</option>';
	    selection4 +='<option '+selected4+' value="'+newvals+'">'+$(this).text()+'</option>';
	  });
      selection1 +="</select>";
      selection2 +="</select>";
      selection3 +="</select>";
      selection4 +="</select>";
      if (selectOpt == 1) {
	    html +="<div id='section1' class='col-md-6 form-group'>"+selection1+"</div> <div id='section2' class='col-md-6 form-group'>"+selection2+"</div>";
	    $("#compareModal .modal-footer #compareSubmit").show();
      }
      else if (selectOpt == 2) {
	    html +="<div id='section1' class='col-md-6 form-group'>"+selection1+"</div> <div id='section2' class='col-md-6 form-group'>"+selection2+"</div>";
	    html +="<div id='section3' class='col-md-6 form-group'>"+selection3+"</div> <div id='section4' class='col-md-6 form-group'>"+selection4+"</div>";
	    $("#compareModal .modal-footer #compareSubmit").show();
      }
      else {
	    html = '';
	    $("#compareModal .modal-footer #compareSubmit").hide();
      }

      $('#newSelects').html(html);
    }
	/**
	* to remove special chars
	*/
	$(document).on("keyup", "#secForms .sections_forms input:text, #compareModal input:text", function () {
	  var specialchars = /[^a-z0-9\s.]/gi;
	  var slctVal = $(this).prev('select').val();
	  if (specialchars.test($(this).val())) {
		  if(slctVal != "regEx") {
			  $(this).val($(this).val().replace(/[^a-z0-9\s.]/gi, ''));
			  if ($('.alert-danger').length == 0) {
				  $(this).parent().parent().parent().prepend('<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Alert! Special characters not allowed. </div>');
			  } else {
				  $('.alert-danger').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Alert! Column name & operators are required to apply filter. ');
			  }
			  $('.tab-content, #chart-div .op-spec-div').animate({ scrollTop: 0 }, 'slow');
			  $(window).scrollTop(0);
			  //$("#sc-modal").modal('show');
			  //setModalBackdrop2();
		  }
	  }
	});
	/*if ($('#sketch-btns').is(':visible')) {
	  $('.node-report-operation ul.links').show();
	}
	else {
	  $('.node-report-operation ul.links').hide();
	}*/
	/***
	* show/hide two cols
	*/
	/**
	* tabs view settings
	*/
	$("body").on("click", '.analytics-side', function() {
	  if($(this).hasClass('closed')) {
		  $('div.sketch-coloumn').hide();
		  $('div.analytics-column').removeClass('col-md-4').addClass('col-md-8 open');
			$('div.operator-coloumn').addClass('analytics-opt-open');
			$(this).removeClass('closed');
	    $(this).attr('title','Collapse');
	  }
	  else {
		  $('div.sketch-coloumn, div.operator-coloumn').show();
		  $('div.analytics-column').removeClass('col-md-8 open').addClass('col-md-4');
			$('div.operator-coloumn').removeClass('analytics-opt-open');
			$('div.operator-coloumn').addClass('analytic-opt-open');
		  $(this).addClass('closed');
	    $(this).attr('title','Expand');
	  }
	});
	$("body").on("click", '.sketch-side', function() {
	  if($(this).hasClass('closed')) {
		  $('div.analytics-column').hide();
		  $('div.sketch-coloumn').removeClass('col-md-4').addClass('col-md-8 open');
			$('div.operator-coloumn').addClass('sketch-opt-open');
			$(this).removeClass('closed');
	    $(this).attr('title','Collapse');
	  }
	  else {
	    $('div.analytics-column').show();
			$('div.sketch-coloumn').removeClass('col-md-8 open').addClass('col-md-4');
			$('div.operator-coloumn').removeClass('sketch-opt-open');
			$(this).addClass('closed');
	    $(this).attr('title','Expand');
	  }	
	});
	/*$('#operator-btn2').click(function(){
	  $('#design div.select-chart-dropbox .btn.dropdown-toggle').html('New Section <span class="caret"></span>');
	})*/

  });
})(jQuery);

function setModalBackdrop2(){
	jQuery(".analytics-column .xl-report-display-tpl-row").addClass("after_modal_appended");
	if(jQuery('.sketch-coloumn .modal-backdrop').length == 0){
		jQuery('.modal-backdrop').appendTo('.analytics-column .xl-report-display-tpl-row');
	} else {
		jQuery('.modal-backdrop:eq(1)').appendTo('.analytics-column .xl-report-display-tpl-row');
	}
	jQuery('body').removeClass("modal-open");
	jQuery('body').css("padding-right", "");
}

 /**
  * update charts data in data div after creation of any chart.
  * @param chartjson
  * @param imgnum
  */
function updateChartsData(chartjson, imgnum) {
  var all = [];
  var textJson = jQuery('#chartsdata #datacharts').val();
  textJson = textJson.trim();
  if (textJson && textJson != 'undefined') {
	var obj = jQuery.parseJSON(textJson);
	for (var i = obj.length; i--;) {
	  if (obj[i]['ImgID'] === imgnum) {
        obj.splice(i, 1);
	  }
	}
	jQuery.each(obj, function (key, value) {
	  all[key] = value;
	});
	var chartjson2 = jQuery.parseJSON(chartjson);
	all.push(chartjson2) ;
	jQuery('#chartsdata #datacharts').val(JSON.stringify(all));
  } 
  else {
	var chartjson2 = jQuery.parseJSON(chartjson);
	all.push(chartjson2) ;
	jQuery('#chartsdata #datacharts').val(JSON.stringify(all));
  }
  jQuery('#no_chart_msg').hide();
	 jQuery('.no-charts').hide();
  /*if (jQuery('#sketch-btns').length != 0) {
    jQuery('.node-report-operation ul.links').show();
  }*/
}
function close_analytics_slide() {
  jQuery("div#charts").removeClass("in active");
  //jQuery("div#design").removeClass("in active");
  jQuery(".charts-text .caret").addClass("closed");
  jQuery("#operator-btn2 span").removeClass("glyphicon-minus").addClass("glyphicon-plus");
  jQuery("#operator-area2").hide();
  jQuery("#operator-rel2").addClass("closed");
}
function open_analytics_slide() {
  //jQuery("div#design").addClass("in active");
  jQuery("div#charts").removeClass("in active");
  jQuery(".charts-text .caret").addClass("closed");
  jQuery("#operator-area2").show('medium').removeClass("closed");
  jQuery("#operator-btn2 span").removeClass("glyphicon-plus").addClass("glyphicon-minus");
  jQuery("#operator-rel2").removeClass("closed");
}
function open_form_slide() {
  jQuery("div#charts").removeClass("in active");
  jQuery(".charts-text .caret").addClass("closed");
  jQuery("#form-cont").removeClass("closed");
  jQuery("#form-cont #design").show('medium');
  jQuery("#form-cont #design").addClass("active in");
}
function close_form_slide() {
  jQuery("#form-cont").addClass("closed");
  jQuery("#form-cont #design").hide();
  jQuery("#form-cont #design").removeClass("active in");
}
function tclustermake(data, divID, clusterID) {
  var dataObj = {groups:[]};
  function exists(groups, key) {
	for (var i in groups)
	  if (key == groups[i].label)
	  return i;
	  return -1;
  }
  for (var i in data) {
	dataObj.groups[i]=({label:data[i].label,weight:0,groups:[], ids: data[i].ids});
	for (var j in data[i].ids) {
	  //dataObj.groups[i].profileIndex=data[i].ids[0];
	  dataObj.groups[i].weight++;
	  var matched = get_matched_groups( data[i].ids[j], i );
		for(var m in matched) {
		var indx = exists(dataObj.groups[i].groups, matched[m].label);
		if (indx == -1)
		  dataObj.groups[i].groups.push({label:matched[m].label,url: "", weight:1, ids:[data[i].ids[j]]});
		else {
		  dataObj.groups[i].groups[indx].weight++;
		  dataObj.groups[i].groups[indx].ids.push(data[i].ids[j]);
		}
	  }
	}
  }
  function get_matched_groups(m_id, last_id) {
	last_id++;
	var matched = [];
	for( var m = last_id; m < data.length; m++ ) {
	  var has = data[m].ids.indexOf(m_id);
	  if(has != -1) {
	    matched.push({label:data[m].label});
	  }
	}
	return matched;
  }
  var foamtree = new CarrotSearchFoamTree({
	id: divID,
	dataObject: {
	  groups: dataObj.groups
	},
	onGroupClick: function (event) {
	  if (event.shiftKey) {
		// Don't select group in this case
		event.preventDefault();
		// Open or close depending on the Ctrl key
		this.open({
		  groups: event.ctrlKey ? event.bottommostOpenGroup : event.group,
		  open: !event.ctrlKey
		});
	  }
	  if (clusterID != 0) {
	    //update group detail view
		update_profile_list(event.topmostClosedGroup, clusterID); // event.topmostClosedGroup
	  }
	},
	// On double click, open the group for browsing instead of exposing it.
	onGroupDoubleClick: function (event) {
	  // Prevent the default behavior (expose)
	  event.preventDefault();
	  
	  // Open the group instead
	  this.open(event.group);
	},
	//disable zooming
	onGroupMouseWheel: function(e) {
	  e.preventDefault();
	  simulate_scroll(e);
	  return false;
	}, 
  });
  // Resize FoamTree on orientation change
  window.addEventListener("orientationchange", foamtree.resize);
  
  // Resize on window size changes
  window.addEventListener("resize", (function () {
	var timeout;
	return function () {
	  window.clearTimeout(timeout);
	  timeout = window.setTimeout(foamtree.resize, 300);
	}
  })());

  function simulate_scroll(e) {
	var scroll;
	if(e.delta == -1) {
	  scroll = jQuery('body').scrollTop() + 100;
	}
	else {
	  scroll = jQuery('body').scrollTop() - 100;
	}
	if(scroll >= 0) {
	  jQuery('body').scrollTop(scroll);
	}
  }
}
function update_profile_list(group, clusterID) {
  var listings = jQuery.parseJSON(jQuery( "#listingsclusterJson_"+clusterID ).val());
  //var listings = jQuery( "#listingsclusterJson_"+clusterID ).val();
  /*console.log("#listingsclusterJson_"+clusterID);
  console.log(listings);
  return false;*/
  var ids = group.ids, cnt = 0;
  jQuery("#refinedResults_"+clusterID).empty();
  var resultData = "";
  var htmlRow = '<table id="tcluster_rslt_'+clusterID+'" class="table table-bordered table-inverse dt-responsive cluster_table">';
  var listing = '';
  var counter = 0;
  var counter1 = 0;
  for(var i in ids) {
	listing = listings[ids[i]];
	if(counter1 == 0) {
	  htmlRow += '<thead>';
	  htmlRow += "<tr>";
	  for (var key in listing) {
		 htmlRow += "<th><span>"+key+"</span></th>";
	  }
	  htmlRow += "</tr></thead>";
	}
	counter1++;
  }
  htmlRow += "<tbody>";
  for(var i in ids) {
	listing = listings[ids[i]];
	if(counter == 0) {
	  htmlRow += "<tr>";
	  for (var key in listing) {
		var value = listing[key];
		htmlRow += "<td><div class='td-rep-inner'>"+value+"</div></td>";
	  }
	  htmlRow += "</tr>";
	}
	else {
	  htmlRow += "<tr>";
	  for (var key in listing) {
		var value = listing[key];
		htmlRow += "<td><div class='td-rep-inner'>"+value+"</div></td>";
	  }
	  htmlRow += "</tr>";
	}
	resultData += htmlRow;
	htmlRow = "";
	counter++;
  }
  resultData += "</tbody></table>";
  jQuery("#refinedResults_"+clusterID).append(resultData);
  jQuery('#tcluster_rslt_'+clusterID).DataTable( {
	"language": {
	   "search": "<span class='search-label'>Search:</span>"
	}
	//responsive: true
  });
 }