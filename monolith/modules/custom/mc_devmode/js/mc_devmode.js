(function ($) {
  $(document).ready(function() {
	$("#export").click(function() {
	   $("#dataTable").tableToCSV();
	});
    /**************tabs view settings***************/
    $(".nav-tabs a").click(function() {
      if($(this).attr('href')=="#charts") {
	    $('.sections_forms').hide();
	  }
	  $(this).tab('show');
    });
    /**** (OperatorChangeFunc) ***/
	$("#secForms").on("change", '.filterColoumSel', function() {
	  var selectID = this.id;
	  var splittedID = selectID.split("_");
	  var condselectID = '#'+splittedID[0]+'_'+splittedID[1]+'_cond_'+splittedID[2];
	  var selectedValType = $('option:selected', this).attr("data-type");
	  var optionString = '<option value="">--Select Operator--</option>';
	  if(selectedValType == "integer" || selectedValType == "numeric" || selectedValType == "factor"  || selectedValType == "logical") {
		optionString += '<option value="==">is equal to</option><option value="!=">is not equal to</option><option value=">">is greater than</option><option value="<">is less than</option><option value=">=">is greater than equal to</option><option value="<=">is less than equal to</option>';
	  }
	  else if(selectedValType == "character") {
		optionString += '<option value="==">is equal to</option><option value="contains">Contains</option>';
	  }
	  $(condselectID).html(optionString);
	});
  });
})(jQuery);