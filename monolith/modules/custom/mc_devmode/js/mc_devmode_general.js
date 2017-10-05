/**
 * @file
 * The script to control general aspects related to development mode.
 */
(function ($, Drupal) {
  $(document).ready(function() {
    //tab-pane panel-heading edit
	$(document).on('click','a.devmode', function (event) {
	  event.preventDefault();
	  var id = $(this).find('span').attr('id');
	  var formId = 'form_'+id;
	  var varName = $('#'+formId+" textarea").attr('name');
	  var faction = $('#'+formId).attr('action');
	  var nfaction = faction+"?varName="+varName;
	  $('#'+formId).attr('action', nfaction);

	  //alert(formId);
	  $('#'+formId).submit();
	  //var id_split = $(this).find('span').attr('id').split('_');
	  /*var gid = $("#nodeID").val();
	   var rid = $("#reportID").val();
	   var url = '/mc/devmode/'+gid+'/'+rid+'/'+id_split[0]+'/'+id_split[1];
	   //alert(url);
	   window.location.href = url;*/
	});
//http://beta-version-47.marketcaliper.com/mc_devmode/load/33/65/scatterplot/1
	if($("#result_found").length) {
	  var result_found = $("#result_found").val();
	  if(result_found == "no") {
		var url = $(".devmode-wrapper .go-back-wrapper a").attr("href");
		window.location.href = url;
	  }
	}
	/*insertionQ(".graphical-area .myTab").every(function(element){
	   console.log(12);
	 });*/
	/*$( ".graphical-area" ).on( "custom", function( event, param1, param2 ) {
	   alert( param1 + "\n" + param2 );
	 });
	 */
	/* $(document).bind("ajaxSend", function(){
	   setTimeout(function(){
	   addCodeAnalytics();
	 }, 2000);
	 }).bind("ajaxSuccess", function(){
	   setTimeout(function(){
	   addCodeAnalytics();
	 }, 3000);
	 });*/
	/* $(document).on('ajaxSuccess', function(event,xhr,options){
	   alert(1);
	 });*/
	 /*   $(document).on('ajaxSuccess', function(event,xhr,options){
	 // alert(1);
	 if($('body.page-node-type-report').length){
	 // if($('.graphical-area .myTab').length) {
	 $('.graphical-area .myTab').each(function () {
	 var id_split = $(this).find('.panel-heading .showForm').attr('id').split('_');
	 var id = id_split[0] + '_' + id_split[1];
	 //      alert(id);
	 var chart_type = id_split[0];
	 var imgNum = id_split[1];
	 var data_id = id_split[3];
	 var rid = id_split[2];
	 var formUrl = '/mc_devmode/load/' + data_id + '/' + rid + '/' + chart_type + '/' + imgNum;

	 var types = ["linechart", "scatterplot", "lreg", "histogram", "boxplot", "area", "areachart", "donutchart", "bubblechart", "trendplot", "barchart", "heatmap", "corel", "geomap", "wcloud", "rankingplot", "pyramidchart", "spmatrix", "piechart", "surfacechart", "radarchart", "voronoidiagram","lineplot"];
	 //var types = [];
	 //types.indexOf(chart_type) != -1
	 if ($.inArray(chart_type, types) != -1) {
	 //alert(id_split[0]);
	 var markup = '<div class="devmode-wrapper">' +
	 '<a class="devmode" href="#" style="">Code & Analytics <span id="' + id + '" class="glyphicon glyphicon-link devmod"></span></a>' +
	 '</div>';
	 if ($(this).find(".devmode-wrapper").length == 0) {
	 // alert(eleId);
	 $(this).find('.panel-body').prepend(markup);
	 $(this).find('.panel-body textarea').attr('name', 'chart_data');
	 $(this).find('.panel-body textarea').wrap("<form id='form_" + id + "'  action='" + formUrl + "' method='post'></form>");
	 }
	 }

	 });
	 // }
	 }
	 });*/
  });
  Drupal.behaviors.mc_devmode_general = {
	attach: function (context ,settings) {
	  //alert(JSON.stringify(context));
	  // $('.graphical-area').on('DOMNodeInserted', function() {
	  // alert($('.graphical-area .myTab').length);
	  // });

	  //if($('body.page-node-type-report').length){
	  //alert($('.graphical-area .myTab').length);
	  $(document).bind("ajaxSuccess", function(){
		  //alert(1);
		  setTimeout(function(){
			  // alert($('.graphical-area .myTab').length);
			  addCodeAnalytics();
		  }, 1000);
	  });
	  /*$('.graphical-area .myTab').each(function() {
	   var id_split = $(this).find('.panel-heading .showForm').attr('id').split('_');
	   var id = id_split[0] + '_' + id_split[1];
	   //  alert(id);
	   var chart_type = id_split[0];
	   var imgNum =  id_split[1];
	   var data_id = id_split[3];
	   var rid = id_split[2];
	   var formUrl = '/mc_devmode/load/'+data_id+'/'+rid+'/'+chart_type+'/'+imgNum;

	   var types = ["lineplot", "scatterplot", "histogram", "boxplot", "area", "areachart", "donutchart", "bubblechart", "trendplot", "barchart", "heatmap", "corel", "geomap", "wcloud", "rankingplot", "pyramidchart", "spmatrix", "piechart", "surfacechart", "radarchart", "voronoidiagram"];
	   //var types = [];
	   //types.indexOf(chart_type) != -1
	   if ($.inArray(chart_type, types) != -1) {
	   //alert(id_split[0]);
	   var markup = '<div class="devmode-wrapper">' +
	   '<a class="devmode" href="#" style="">Code & Analytics <span id="' + id + '" class="glyphicon glyphicon-link devmod"></span></a>' +
	   '</div>';
	   if ($(this).find(".devmode-wrapper").length == 0) {
	   // alert(eleId);
	   $(this).find('.panel-body').prepend(markup);
	   //$(this).find('.panel-body textarea').attr('name', 'chart_data');
	   $(this).find('.panel-body textarea').wrap( "<form id='form_"+id+"'  action='"+formUrl+"' method='post'></form>" );
	   }
	   }

	   });*/
	  //}
	}
  };
  addCodeAnalytics = function() {
	//alert("here");
	$('.graphical-area .myTab').each(function () {
	  var id_split = $(this).find('.panel-heading .showForm').attr('id').split('_');
	  var id = id_split[0] + '_' + id_split[1];
		 //alert(id);
	  var chart_type = id_split[0];
	  var imgNum = id_split[1];
	  var data_id = id_split[3];
	  var rid = id_split[2];
	  var formUrl = '/mc_devmode/load/' + data_id + '/' + rid + '/' + chart_type + '/' + imgNum;
	  var types = ["lineplot", "lreg", "biplot",  "scatterplot", "cmatrixchart", "ddscatterplot", "histogram", "boxplot", "area", "areachart", "donutchart", "bubblechart", "trendplot", "barchart", "heatmap", "cmatrix", "rankingplot", "pyramidchart", "spmatrix", "piechart", "surfacechart", "radarchart", "voronoidiagram"];
	  //var types = [];
	  //types.indexOf(chart_type) != -1
	  if ($.inArray(chart_type, types) != -1) {
		//alert(id_split[0]);
		var markup = '<div class="devmode-wrapper">' +
			'<a class="devmode" href="#" style="">Code & Analytics <span id="' + id + '" class="glyphicon glyphicon-link devmod"></span></a>' +
			'</div>';
		if ($(this).find(".devmode-wrapper").length == 0) {
		  // alert(eleId);
		  $(this).find('.panel-body').prepend(markup);
		  // $(this).find('.panel-body textarea').attr('name', 'chart_data');
		  $(this).find('.panel-body textarea').wrap("<form id='form_" + id + "'  action='" + formUrl + "' method='post'></form>");
		}
	  }
	});
  }
})(jQuery, Drupal);