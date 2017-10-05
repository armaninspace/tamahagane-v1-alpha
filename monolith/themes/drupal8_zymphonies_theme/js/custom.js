jQuery(document).ready(function($){
  /*$(".modal-links").on("click", function(e) {
	  $('.add-process').prepend('<img class="loading_img" src="/sites/default/files/default_images/throbber-active.gif">');
	  setTimeout(function(){
		$('.loading_img').remove();
	  }, 2000);
  });*/
  $(".process-link").on("click", function(e) {
	$('.add-process .process-link').append('<img class="loading_img" src="/sites/default/files/default_images/throbber-active.gif">');
	//$('<img class="loading_img" src="/sites/default/files/default_images/throbber-active.gif">').insertAfter(".add-process .process-link");
	setTimeout(function(){
	  $('.loading_img').remove();
	}, 2000);
  });
  $(".add-process #btn-operator").on("click", function(e) {
	$('.add-process #btn-operator').append('<img class="loading_img" src="/sites/default/files/default_images/throbber-active.gif">');
	setTimeout(function(){
	  $('.loading_img').remove();
	}, 2000);
  });
  $(".add-process #btn-source").on("click", function(e) {
	$('.add-process #btn-source').append('<img class="loading_img" src="/sites/default/files/default_images/throbber-active.gif">');
	setTimeout(function(){
	  $('.loading_img').remove();
	}, 2000);
  });
  $(".node-ops #btn-edit").on("click", function(e) {
	$('<img class="loading_img" src="/sites/default/files/default_images/throbber-active.gif">').insertAfter(".node-ops #btn-edit");
	setTimeout(function(){
	  $('.loading_img').remove();
	}, 2000);
  });
  $(".node-ops #btn-del").on("click", function(e) {
	$('<img class="loading_img" src="/sites/default/files/default_images/throbber-active.gif">').insertAfter(".node-ops #btn-del");
	setTimeout(function(){
	  $('.loading_img').remove();
	}, 2000);
  });
  /**
   * to show/hide analytics tabs
   */
  /*if(!$('body').hasClass('page-node-type-sketch') == true){
	  $("#quicktabs-project_tabs ul li a:eq(1)").hide();
  }
  else{
	$("#quicktabs-project_tabs ul li a:eq(1)").show();
  }*/
  $('.group_state_class').hide();
  if($('body').hasClass('path-frontpage') == true) {
	$.ajax({
	  url: Drupal.url('tm_analytics/check_group_status'),
	  type: "POST",
	  contentType: "application/json; charset=utf-8",
	  dataType: "json",
	  success: function (response) {
		var arr = response.reverse();
		var count = 0;
		$("div.group-state-div").each(function () {
		  var p_id =$(this).text();
		  var p_value = '';
		  var found = _.some(arr, function(value) {
			if(value.indexOf(p_id)!= -1){
			  p_value = value
			}
			return value.indexOf(p_id)!=-1;
		  });
		  var index = arr.indexOf(p_value);
		  var splitID = arr[index].split("||");
		  if (splitID[2] == 'owner') {
			$(this).html('<span class="btn btn-default no-link">You are the owner</span>');
			$('.process-table .group-state-div span.btn').removeClass('btn');
			$('.process-table .group-state-div span.btn-default').removeClass('btn-default');
		  }
		  else if (splitID[2] == 'unsubscribe') {
			$(this).html('<a href="/group/node/' + splitID[0] + '/unsubscribe" class="group_state_class use-ajax modal-links btn btn-default" data-dialog-type="modal">Unsubscribe</a>');
			$('.process-table a.group_state_class.btn').removeClass('btn');
            $('.process-table a.group_state_class.btn-default').removeClass('btn-default');
			$( "body.admin-user .group_state_class" ).on( "click", function(event) {
			  $("body.admin-user").addClass('model-opened');
			});
		  }
		  else {
			$(this).html('<a href="/group/node/' + splitID[0] + '/subscribe" class="group_state_class use-ajax modal-links btn btn-default" data-dialog-type="modal">Subscribe</a>');
			$('.process-table a.group_state_class.btn').removeClass('btn');
            $('.process-table a.group_state_class.btn-default').removeClass('btn-default');
			$( "body.admin-user .group_state_class" ).on( "click", function(event) {
			  $("body.admin-user").addClass('model-opened');
			});
		  }
	      count++;
		});
		Drupal.attachBehaviors();
	  }
	});
  }
  /////////// Welcome Page Code////////////
  $('.path-frontpage .block-views h2').wrap( "<div class='block-title'></div>" );
  //$('.path-frontpage .block-views h2').prepend($('<img>',{id:'uPImg',src:'/sites/default/files/pictures/6.png'})).prepend($('<img>',{id:'downImg',src:'/sites/default/files/pictures/8.png'}));
  jQuery('.path-frontpage .block-views h2').on('click', function(event) {
    var value = $(this).text();
	if(value == "Datasets") {
	  jQuery('.dataset-block').toggle('show');
	  $(this).find('img').toggle();
	}
	else if(value == "Reports") {
	  //alert(value);
	  jQuery('.reports-table').toggle('show');
	  $(this).find('img').toggle();
	}
  });
  /////////// Welcome Page Code////////////
  $('.xl-report-display-tpl-row .graphical-area .panel-default .panel-heading span').wrapAll( "<div class='cont-icons' />");
  $('.dataset-link').on('click',function(event) {
    $('div.ui-dialog').addClass('dataset-dialog');
  });
  $('span.no-data').parent('li.messages__item').addClass('hidden-li');
  //Main menu
  $('#main-menu').smartmenus();
  $('.quicktabs-tabs').addClass('nav nav-tabs');
  //Mobile menu toggle
  $('.navbar-toggle').click(function(){
	$('.region-primary-menu').slideToggle();
  });
  $( ".node--view-mode-full div .node-title" ).parent('div').addClass('title-cont');
  $( ".node--type-process div .group-title" ).parent('div').addClass('title-cont');
  $( ".node--type-process div a:contains('Subscribe')" ).parent('div').addClass('subscribe');
  $( ".node--type-process div a:contains('Unsubscribe')" ).parent('div').addClass('subscribe');
  $( ".node--type-process div a:contains('group membership')" ).parent('div').addClass('subscribe');
  $( ".node--type-process div span.group" ).parent('div').addClass('subscribe');
  $( ".node--type-sketch div:contains('Groups audience')" ).parent('div').addClass('audience');
  $( "form.comment-form" ).closest('section').addClass('comment-wrapper full-width');
  //$('.subscribe a').addClass('btn btn-default');
  //$('.subscribe span').addClass('btn btn-default');
  //$('.node-process-form').closest('.ui-dialog').addClass('process-dialog');
  $('form.node-form #edit-delete').addClass('btn');
  $('form.node-confirm-form #edit-cancel').addClass('btn');
  $( "body.admin-user .modal-links" ).on( "click", function(event) {
	$("body.admin-user").addClass('model-opened');
  });
  $( "body.user-logged-in .feedback_link a.use-ajax" ).on( "click", function(event) {
	$(this).css('margin-top','7px');
	$("body.admin-user").addClass('model-opened');
	setTimeout(function() {
	  $(this).css('margin-top','0');
	}, 4000);
  });
  /*$(".ui-dialog").on("hidden", function () {
    $("body.admin-user").removeClass('model-opened');
  });
  */
  /*$('body.admin-user .ui-dialog').dialog({
    close: function(e, ui) {
	  $("body.admin-user").removeClass('model-opened');
	  $( "body.user-logged-in .feedback_link a.use-ajax" ).css('margin-top','0');
	}
  });*/
  if ($('.ui-dialog').length < 0) {
    $("body.admin-user").removeClass('model-opened');
    $( "body.user-logged-in .feedback_link a.use-ajax" ).css('margin-top','0');
  }
  $('#quicktabs-project_tabs ul li a:contains("Sketch")').addClass('sketch');
  $('#quicktabs-project_tabs ul li a.quicktabs-loaded').click(function() {
    $('.comment-wrapper').addClass('hidden');
    $('section[id^="node-sketch-comment"]').addClass('hidden');
    $('section[id^="node-json-comment"]').addClass('hidden');
    $('section[id^="node-rcode-comment"]').addClass('hidden');
    $('section[id^="node-doc-comment"]').addClass('hidden');
  });
  $('#quicktabs-project_tabs ul li a.sketch').click(function() {
    $('.comment-wrapper').removeClass('hidden');
    $('section[id^="node-sketch-comment"]').removeClass('hidden');
    $('section[id^="node-json-comment"]').removeClass('hidden');
    $('section[id^="node-rcode-comment"]').removeClass('hidden');
    $('section[id^="node-doc-comment"]').removeClass('hidden');
  });
  //$('.region-content .block-local-tasks-block ul.tabs.primary li a:contains("View")').parent('li').addClass('hidden');
  $('.region-content .block-local-tasks-block ul.tabs.primary li a:contains("Group")').parent('li').addClass('hidden');
  $.fn.clickToggle = function(func1, func2) {
	var funcs = [func1, func2];
    this.data('toggleclicked', 0);
    this.click(function() {
	  var data = $(this).data();
	  var tc = data.toggleclicked;
	  $.proxy(funcs[tc], this)();
	  data.toggleclicked = (tc + 1) % 2;
    });
    return this;
  };
  // $('#stencil .panel-title a').addClass('param-title');
  $( "#stencil .panel-title a" ).each(function(index) {
    $(this).clickToggle(function() {
	  $(this).attr( "aria-expanded", "true" );
    }, function() {
	  $(this).removeAttr( "aria-expanded" );
    });
  });
  $('#edit-account').parent('.user-form').closest('body').addClass('user-edit');
  //Mobile dropdown menu
  if ( $(window).width() < 767) {
	$(".region-primary-menu li a:not(.has-submenu)").click(function () {
	  $('.region-primary-menu').hide();
	});
  }
  $(".modal-links").on("click", function(e) {
	$('.add-pro').append('<img class="loading_img" src="/sites/default/files/throbber-active.gif">');
	setTimeout(function(){
	  $('.loading_img').remove();
	}, 2000);
  });
  /*active class to my account link*/
  $('ul.menu li a:contains("account")').closest('ul').addClass('account-menu');
  $('.account-menu').attr('id','user-menu');
  var pathArray = window.location.pathname.split("/");
  var secondLevelPath = pathArray[1];
  var editPath = pathArray[3];
  if ( secondLevelPath == 'user') {
    $('.account-menu li:first-child a').addClass('is-active');
    $('#main-menu li.active').removeClass('active');
  }
  /*end active class to my account*/
  $('.region-content .block-local-tasks-block ul.tabs.primary li a:contains("Edit")').addClass('edit-node-link task-link');
  $('.region-content .block-local-tasks-block ul.tabs.primary li a:contains("Delete")').addClass('del-node-link task-link');
  $('.edit-node-link').attr('title','Edit');
  $('.del-node-link').attr('title','Delete');
  /*$('a.task-link').addClass('use-ajax');
  $('a.task-link').attr('data-dialog-type','modal');
  $('a.task-link').attr('data-dialog-options','{"width":700}');*/
  $('.region-content .block-local-tasks-block ul.tabs.primary li a:contains("View")').addClass('task-man-link');
  $('.region-content .block-local-tasks-block ul.tabs.primary li a:contains("Manage display")').addClass('task-man-link');
  $('a.task-man-link').removeClass('use-ajax');
  $('a.task-man-link').removeAttr('data-dialog-type');
  $('a.task-man-link').removeAttr('data-dialog-options');
  $(".top-header .node-ops a.edit-node-link").on("click", function(e) {
	//$('<img class="loading_img" src="/sites/default/files/default_images/throbber-active.gif">').insertAfter(".edit-node-link");
	$(this).append('<img class="loading_img" src="/sites/default/files/default_images/throbber-active.gif">');
	setTimeout(function(){
	  $('.loading_img').remove();
	}, 2000);
  });
  $(".top-header .node-ops a.del-node-link").on("click", function(e) {
	//$('<img class="loading_img" src="/sites/default/files/default_images/throbber-active.gif">').insertAfter(".del-node-link");
	$(this).append('<img class="loading_img" src="/sites/default/files/default_images/throbber-active.gif">');
	setTimeout(function(){
	  $('.loading_img').remove();
	}, 2000);
  });
  $('body.path-user .region-content .block-local-tasks-block ul.tabs.primary li a').removeClass('edit-node-link task-link');
  $('body.path-user .region-content .block-local-tasks-block ul.tabs.primary li a').removeClass('use-ajax');
  $('body.path-user .region-content .block-local-tasks-block ul.tabs.primary li a').removeAttr("data-dialog-type");
  $('body.path-user .region-content .block-local-tasks-block ul.tabs.primary li a').removeAttr("data-dialog-options");
  $('body.path-user .region-content .block-local-tasks-block ul.tabs.primary li a').removeAttr("data-drupal-link-system-path");
  $('body.path-user .region-content .block-local-tasks-block ul.tabs.primary li a').removeAttr("class");
  $('body.path-user.user-logged-in .block-local-tasks-block ul.tabs.primary li a:contains("Edit")').addClass('edit-user-link');
  $('.edit-user-link').attr('title','Edit');
  /*$('div.block-local-tasks-block ul.tabs.primary li:not(:first-child) a').addClass('use-ajax');
  $('div.block-local-tasks-block ul.tabs.primary li:not(:first-child) a').attr('data-dialog-type','modal');
  $('div.block-local-tasks-block ul.tabs.primary li:not(:first-child) a').attr('data-dialog-options','{"width":700}');*/
  $('.breadcrumb ul li:last-child a').removeAttr('href');
  $('.breadcrumb ul li:last-child a').replaceWith(function () {
    return $('<span/>', {
	  html: $(this).html()
    });
  });
  $('.process-block a.group_state_class').removeAttr('style');
  $('.process-block .process div.views-field-nothing').wrap('<div class="full-width"></div>');
  /*node reference links*/
  $(".folder-link").on("click", function(e) {
    $('<img class="loading_img" src="/sites/default/files/default_images/throbber-active.gif">').appendTo(".folder-link");
    setTimeout(function(){
	  $('.loading_img').remove();
    }, 2000);
  });
  $(".json-link").on("click", function(e) {
	$('<img class="loading_img" src="/sites/default/files/default_images/throbber-active.gif">').appendTo(".json-link");
	setTimeout(function(){
	  $('.loading_img').remove();
	}, 2000);
  });
  $(".rcode-link").on("click", function(e) {
	$('<img class="loading_img" src="/sites/default/files/default_images/throbber-active.gif">').appendTo(".rcode-link");
	setTimeout(function(){
	  $('.loading_img').remove();
	}, 2000);
  });
  $(".sketch-link").on("click", function(e) {
	$('<img class="loading_img" src="/sites/default/files/default_images/throbber-active.gif">').appendTo(".sketch-link");
	setTimeout(function(){
	  $('.loading_img').remove();
	}, 2000);
  });
  $(".doc-link").on("click", function(e) {
	$('<img class="loading_img" src="/sites/default/files/default_images/throbber-active.gif">').appendTo(".doc-link");
	setTimeout(function(){
	  $('.loading_img').remove();
	}, 2000);
  });
  $(".source-link").on("click", function(e) {
	$('<img class="loading_img" src="/sites/default/files/default_images/throbber-active.gif">').appendTo(".source-link");
	setTimeout(function(){
	  $('.loading_img').remove();
	}, 2000);
  });
  /*end node reference links*/
  if($('body').hasClass('page-node-type-process') == true) {
	$('div.subscribe a').addClass('use-ajax modal-links group_state_class').attr("data-dialog-type","modal").on( "click", function(event) {
	  $("body.page-node-type-process").addClass('model-opened');
	});
	Drupal.attachBehaviors();
  }  
  /*$('[data-toggle="tooltip"]').tooltip({
    position: {
        my: "center bottom",
        at: "center bottom+30",
        collision: "flipfit",
        using: function( position, feedback ) {
            $( this ).addClass( feedback.vertical )
                .css( position );
        }
    }
  });
  $('.navigator-slide').tooltip({
    position: {
        my: "center bottom",
        at: "center top-5",
        collision: "flip",
        using: function( position, feedback ) {
            $( this ).addClass( feedback.vertical )
                .css( position );
        }
    }
  });*/
  $( "#main-menu li a:contains('Home')" ).addClass('home-link');
  $( "header .menu li a:contains('out')" ).addClass('log-out-link');
  $('.login-content form.user-login-form').prepend('<div class="form-title">USER LOGIN</div>');
  $('<i class="glyphicon glyphicon-user"></i>').insertAfter('.login-content input[name="name"]');
  $('<i class="glyphicon glyphicon-lock"></i>').insertAfter('.login-content input[name="pass"]');
  $('.login-content form.user-login-form').append('<div class="forget-pass"><a href="/user/password">Forget Password</a></div>');
  $('.updates-msg-list').closest('div.quicktabs-tabpage').addClass('updates-tab');
  if ($('.field-body').length) {
    $('body.page-node-type-process .add-process-nodes').addClass('with-desc');
  }
  else {
	$('body.page-node-type-process .add-process-nodes').addClass('wo-desc');
  }
  $('div.pro-ref-nodes:contains("No results found")').addClass('col-xs-12 no-result');
  $('div.node--type-source div:contains("Source file")').parent('div').addClass('source-content');
  $('#block-socialsharingblock').addClass('collapse width');

  $('.s-opener a.share').clickToggle(function() {
	$('#block-socialsharingblock').css('display','block');
  }, function() {
	$('#block-socialsharingblock').css('display','none');
  });
  $('article.node--type-source .node__content table').DataTable({ responsive: true });
  $(document).on('submit','form.node-source-form',function(event) {
	if ($('.form-managed-file span.file').length == 0) {
	  alert( "Enter required fields." );
	  $('form.node-source-form .form-file').addClass("error");
	  $('form.node-source-form .form-file').focus();
	  event.preventDefault();
	}
	else if($.trim( $('.field--name-title input.form-text').val() ) == '' ) {
	  alert( "Enter title." );
	  $('.field--name-title input.form-text').addClass("error");
	  $('.field--name-title input.form-text').focus();
	  event.preventDefault();
	}
  });
});
(function($) {
  $( document ).ajaxStop(function() {
	  $( "div#drupal-modal form:contains('subscribe')" ).closest('div#drupal-modal').addClass('subscribe');
	  $( "div#drupal-modal form.user-form" ).closest('div.ui-dialog').addClass('user-dialog');
	  $('#add-process-ref-nodes .dropdown.open').removeClass('open');
    //$("body.admin-user").removeClass('model-opened');
  });
})(jQuery);