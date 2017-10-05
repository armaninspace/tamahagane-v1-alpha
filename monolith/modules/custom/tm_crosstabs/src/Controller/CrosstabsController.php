<?php
namespace Drupal\tm_crosstabs\Controller;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\ReplaceCommand;
/**
 * Class CrosstabsController.
 *
 * @package Drupal\tm_crosstabs\Controller
 */
class CrosstabsController extends ControllerBase {
  public function addForm() {
    $file_path = $_REQUEST['file_path'];
	//$file_path = "/var/www/beta-03-tama-local.com/htdocs/modules/custom/tm_analytics/data_files/4385026e-8ab6-46b1-83e2-257c4d1c8946.csv";
	//$file_path = "/var/www/beta-03-tama-local.com/htdocs/sites/default/files/operator_files/97b1a8cc-4e3e-49b4-9dc3-c767f15e4501_out
	//.csv";
	$droot = \Drupal::root();
	$droot = str_replace("\\", "/", $droot);
	$path_to_module = drupal_get_path('module', 'tm_analytics');
	$rdir = $droot . "/" . $path_to_module . "/includes/rcode";
	$invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
	$exe_command = "cd $rdir && Rscript colnames.R $file_path";
	$res = exec($invoirment_vars . $exe_command);
	$res = str_replace("[1] \"", "", $res);
	$all_fields = explode("|", $res);
	$empty = array_pop($all_fields);
	$field_types = array();
	$field_names = array();
	$saved_integerField = array();
	$saved_numericField = array();
	$saved_characterField = array();
	$saved_factorField = array();
	$saved_logicalField = array();
	foreach ($all_fields as $vals) {
	  $parts = explode("=", $vals);
	  if ($parts[1] == "integer") {
	    $saved_integerField[] = $vals;
	  }
	  if ($parts[1] == "factor") {
	    $saved_factorField[] = $vals;
	  }
	  if ($parts[1] == "numeric") {
	    $saved_numericField [] = $vals;
	  }
	  if ($parts[1] == "character") {
	    $saved_characterField[] = $vals;
	  }
	  if ($parts[1] == "logical") {
	    $saved_logicalField[] = $vals;
	  }
	} //////////end each
	$allfield_data = array (
	  'integer_type' =>  $saved_integerField,
	  'factor_type'  =>  $saved_factorField,
	  'chars_type'   =>  $saved_characterField,
	  'numeric_type' =>  $saved_numericField,
	  'logical_type' =>  $saved_logicalField
	);
	$saved_allFields = array_merge($saved_numericField, $saved_integerField, $saved_characterField, $saved_factorField, $saved_logicalField);
	$int_num_fields = array_merge($saved_numericField, $saved_integerField,$saved_factorField,$saved_logicalField);
    $img_dir = $droot.'/sites/default/files/projectChartImages/';
    $twig = \Drupal::service('twig');
	$path =  drupal_get_path('module', 'tm_crosstabs');
	$module_path = $droot.'/'.$path;
	$template = $twig->loadTemplate($path.'/templates/tm_crosstabs_form.html.twig');
	$response['form_html'] = $template->render(['img_dir' => $img_dir,'num_fields'=>$int_num_fields, 'merged_fields'=>$saved_allFields,'all_types'=>$allfield_data]);
    return new JsonResponse($response);
  }
  public function process_cross_tabs($data) {
	// print_r($data);
	//echo '--data line--'; exit();
    //  $data = '{ "cols_and_chart_title": { "chart_title": "cross chart 1","x_col": "Age","y_col": "Gender","x_col_type": "integer","y_col_type": "factor" },"bigtotal": 99,"bigmean":  40.99,"mid_rows": [ { "name": "Female","total": 39,"mean": 42.308 },{ "name": "Male","total": 60,"mean": 40.133 } ] }';
    $data_array = json_decode($data, TRUE);
    if (
	  ($data_array['cols_and_chart_title']['x_col_type'] == "numeric" &&  $data_array['cols_and_chart_title']['y_col_type'] == "factor")||
	  ($data_array['cols_and_chart_title']['x_col_type'] == "integer" &&  $data_array['cols_and_chart_title']['y_col_type'] == "factor")||
	  ($data_array['cols_and_chart_title']['x_col_type'] == "factor" &&  $data_array['cols_and_chart_title']['y_col_type'] == "numeric")||
	  ($data_array['cols_and_chart_title']['x_col_type'] == "factor" &&  $data_array['cols_and_chart_title']['y_col_type'] == "integer")
	) {
		if ($data_array['cols_and_chart_title']['x_col_type'] == "factor") {
		  // echo 'in 2ns if';
          //$cross_table .= "x col is factor";
		  $cross_table = '<table class="table table-bordered"><thead>';
		  $cross_table .= '<tr><th></th><th>' . $data_array['cols_and_chart_title']['y_col'] . '</th></tr>';
		  $cross_table .= '<tr><th colspan="2">' . $data_array['cols_and_chart_title']['x_col'] . '</th></tr></thead>';
		  $cross_table .= '<tbody><tr><td>Sample Size</td><td>' . $data_array['bigtotal'] . '</td></tr>';
		  foreach ($data_array['mid_rows'] as $mid_rows_key => $mid_rows_val) {
			$cross_table .= '<tr><td>' . $mid_rows_val['name'] . '<br>Mean</td>';
			$cross_table .= '<td>' . $mid_rows_val['total'] . '<br>' . $mid_rows_val['mean'] . '</td></tr>';
		  }
		  $cross_table .= '</tbody></table>';
		}
		elseif ($data_array['cols_and_chart_title']['y_col_type'] == "factor") {
		  $countheadrow = count($data_array['mid_rows']) + 1;
		  $cross_table = '<table class="table table-bordered"><thead>';
		  $cross_table .= '<tr><th></th><th colspan="' . $countheadrow . '">' . $data_array['cols_and_chart_title']['y_col'] . '</th></tr>';
		  $cross_table .= '<tr><th></th>';
		  foreach ($data_array['mid_rows'] as $mid_rows_key => $mid_rows_val) {
		    $cross_table .= '<th>' . $mid_rows_val['name'] . '</th>';
		  }
		  $cross_table .= '<th>Total</th></tr>';
		  $cross_table .= '<tr><th>' . $data_array['cols_and_chart_title']['x_col'] . '</th>';
		  $cross_table .= '<th colspan="' . $countheadrow . '"></th></tr></thead>';
          $cross_table .= '<tbody><tr><td>Sample Size</td>';
		  foreach ($data_array['mid_rows'] as $mid_rows_key => $mid_rows_val) {
			$cross_table .= '<td>' . $mid_rows_val['total'] . '</td>';
		  }
		  $cross_table .= '<td>' . $data_array['bigtotal'] . '</td></tr>';
		  $cross_table .= '<tr><td>Mean</td>';
		  foreach ($data_array['mid_rows'] as $mid_rows_key => $mid_rows_val) {
			$cross_table .= '<td>' . $mid_rows_val['mean'] . '</td>';
		  }
		  $cross_table .= '<td>' . $data_array['bigmean'] . '</td></tr>';
		  $cross_table .= '</tbody></table>';
		}
      }
	  else {
			  $colstotal = count($data_array['first_row']) + 1;
			  $cross_table = '<table class="table table-bordered"><thead>';
			  $cross_table .= '<tr><th></th><th colspan="' . $colstotal . '">' . $data_array['cols_and_chart_title']['y_col'] . '</th></tr>';
			  $cross_table .= '<tr><th>' . $data_array['cols_and_chart_title']['x_col'] . '</th>';
			  foreach ($data_array['first_row'] as $value) {
				  $cross_table .= '<th>' . $value . '</th>';
			  }
			  $cross_table .= '<th>Row Total</th></tr></thead>';
			  foreach ($data_array['mid_rows'] as $mid_rows_key => $mid_rows_val) {
				$rowcount = count($mid_rows_val) - 3;
				$totalrowspancount = $rowcount/2;
				$cross_table .= '<tbody><tr><th scope="rowgroup" rowspan="' . $rowcount . '">' . $mid_rows_val['row_name'] . '</th>';
				foreach ($mid_rows_val['observed_value'] as $obs_val) {
				  $cross_table .= '<td>' . $obs_val . '</td>';
				}
				$cross_table .= '<td rowspan="' . $totalrowspancount . '">' . $mid_rows_val['row_total'] . '</td></tr>';
				$cross_table .= '<tr>';
				foreach ($mid_rows_val['expected_value'] as $exp_val) {
			      $cross_table .= '<td>' . $exp_val . '</td>';
				}
				$cross_table .= '</tr>';
				$cross_table .= '<tr>';
				foreach ($mid_rows_val['chisq_value'] as $chisq_val) {
				  $cross_table .= '<td>' . $chisq_val . '</td>';
				}
				$cross_table .= '</tr>';
				$cross_table .= '<tr>';
				foreach ($mid_rows_val['row_prop'] as $rowprop_val) {
				  $cross_table .= '<td>' . $rowprop_val . '</td>';
				}
				$cross_table .= '<td rowspan="' . $totalrowspancount . '">' . $mid_rows_val['row_total_prop'] . '</td></tr>';
				$cross_table .= '<tr>';
				foreach ($mid_rows_val['col_prop'] as $colprop_val) {
				  $cross_table .= '<td>' . $colprop_val . '</td>';
				}
				$cross_table .= '</tr>';
				$cross_table .= '<tr>';
				foreach ($mid_rows_val['table_total_prop'] as $tableprop_val) {
				  $cross_table .= '<td>' . $tableprop_val . '</td>';
				}
				$cross_table .= '</tr></tbody>';
			  }
			  $countrow_fortotal = count($data_array['last_row'])-2;
			  $cross_table .= '<tbody><tr><th scope="rowgroup" rowspan="' . $countrow_fortotal . '">' . $data_array['last_row']['row_name'] . '</th>';
			  foreach ($data_array['last_row']['column_totals'] as $cols_total_val) {
			    $cross_table .= '<td>' . $cols_total_val . '</td>';
			  }
			  $cross_table .= '<td rowspan="2">' . $data_array['last_row']['grand_total'] . '</td></tr>';
			  $cross_table .= '<tr>';
			  foreach ($data_array['last_row']['column_total_porportion'] as $col_total_pro_val) {
			    $cross_table .= '<td>' . $col_total_pro_val . '</td>';
			  }
			  $cross_table .= '</tr></tbody>';
			  $cross_table .= '</table>';
		}
		return $cross_table;
  }
  public function processData() {
	$chart_type = $_REQUEST['chart'];
	$chart_json = $_REQUEST['chart_data'];
	$chart_data_array  = json_decode($chart_json, TRUE);
	$result_file  = $chart_data_array['img_path'];
	$rfile_path = 'crosstabs.R';
	$rdir_name = '/rcodes_plotly';/*** Plotly ***/
	$droot = \Drupal::root();
	$path_to_module = drupal_get_path('module', 'tm_crosstabs');
	$rdir = $droot . "/" . $path_to_module . "/includes" . $rdir_name;
	$invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
	$exe_command = "cd $rdir && Rscript " . $rfile_path . " " . base64_encode($chart_json);
	$res = exec($invoirment_vars . $exe_command);
	if ($chart_type == "crosstabs") {
	  $res = str_replace("[1] ", "", $res);
	  $res = str_replace('\n', "", $res);
	  $res = str_replace('\\', "", $res);
	  $res = trim($res, '"');
	  $res_a = json_decode($res, TRUE);
	  $output = $res_a["output"];

	  /**** Note handling ****************/
	  $resp_success_message = "";
	  $resp_error_message = "";
	  $resp_warning_message = "";
	  $alert_cross_btn = '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
	  $res_success_start = '<div id="success_alert_msg" style="text-align:left;" class="alert alert-success alert-dismissible" role="alert">' . $alert_cross_btn;
	  $res_error_start = '<div id="danger_alert_msg" style="text-align:left;" class="alert alert-danger alert-dismissible" role="alert">' . $alert_cross_btn;
	  $res_warrning_start = '<div id="warning_alert_msg" style="text-align:left;" class="alert alert-warning alert-dismissible" role="alert">' . $alert_cross_btn;
	  if ($res_a['csv_load_status']) {
		$resp_alert_success .= '<strong>Dataset load time: </strong>' . $res_a['csv_load_time_elapsed'] . 's<br/>';
		$resp_alert_success .= '<strong>Total rows in dataset: </strong>' . $res_a['csv_number_of_rows'] . '<br/>';
	  }
	  elseif ($res_a['csv_load_status'] === FALSE) {
		$resp_alert_error .= '<strong>Error in dataset loading!</strong><br/>';
	  }
	  if ($res_a['nrows_after_numeric_filter']) {
		  $resp_alert_success .= '<strong>Filter load time: </strong>' . $res_a['numeric_fillters_time_elapsed'] . 's<br/>';
		  $resp_alert_success .= '<strong>No. of rows in dataset after implementing filters: </strong>' . $res_a['nrows_after_numeric_filter_int'] . '<br/>';
	  }
	  elseif ($res_a['nrows_after_numeric_filter'] === FALSE) {
		  $resp_alert_success .= '<strong>Filter load time: </strong>' . $res_a['numeric_fillters_time_elapsed'] . 's<br/>';
		  $resp_alert_success .= '<strong>No. of rows in dataset after implementing filters: </strong>' . $res_a['nrows_after_numeric_filter_int'] . '<br/>';
		  $resp_alert_error .= '<strong>Need at least 2 points to generate chart.</strong><br/>';
	  }
	  if ($res_a['nrows_after_contains_filter']) {
		  $resp_alert_success .= '<strong>Filter load time: </strong>' . $res_a['contains_fillters_time_elapsed'] . 's<br/>';
		  $resp_alert_success .= '<strong>No. of rows in dataset after implementing filters: </strong>' . $res_a['nrows_after_contains_filter_int'] . '<br/>';
	  }
	  elseif ($res_a['nrows_after_contains_filter'] === FALSE) {
		  $resp_alert_success .= '<strong>Filter load time: </strong>' . $res_a['contains_fillters_time_elapsed'] . 's<br/>';
		  $resp_alert_success .= '<strong>No. of rows in dataset after implementing filters: </strong>' . $res_a['nrows_after_contains_filter_int'] . '<br/>';
		  $resp_alert_error .= '<strong>Need at least 2 points to generate chart.</strong><br/>';
	  }
	  if (isset($res_a['coerce_time_elapsed'])) {
		$resp_alert_success .= '<strong>Chart coercion time: </strong>' . $res_a['coerce_time_elapsed'] . 's<br/>';
	  }
	  if (isset($res_a['chart_generate_time_elapsed'])) {
		$resp_alert_success .= '<strong>Chart generation time: </strong>' . $res_a['chart_generate_time_elapsed'] . 's<br/>';
	  }
	  if (isset($res_a['output_time_elapsed'])) {
		$resp_alert_success .= '<strong>Output result time: </strong>' . $res_a['output_time_elapsed'] . 's<br/>';
	  }
	  if (isset($res_a['warning_output'])) {
		$resp_alert_warning .= '<strong>Warning! </strong>' . $res_a['warning_output'] . '<br/>';
	  }
	  if (isset($res_a['warning_reading_csv'])) {
		$resp_alert_warning .= '<strong>Warning Reading CSV! </strong>' . $res_a['warning_reading_csv'] . '<br/>';
	  }
	  if (isset($res_a['warning_coerce'])) {
		$resp_alert_warning .= '<strong>Warning Coercion! </strong>' . $res_a['warning_coerce'] . '<br/>';
	  }
	  if ($res_a['both_columns_unique_length_is_one']) {
		$resp_alert_error .= '<strong>Length of unique value: </strong> 1<br/>';
	  }
	  /*if ($res_a['columns_unique_length_is_one']) {
		$resp_alert_error .= '<strong>Length of unique value: </strong> 1<br/>';
	  }*/
        if ($res_a['factor_coulnm_not_found']) {
            $resp_alert_error .= '<strong>Atleast one factor column required to proceed </strong> <br/>';
        }
	  if ($resp_alert_success != "") {
		$resp_success_message = $res_success_start . $resp_alert_success . '</div>';
	  }
	  if ($resp_alert_error != "") {
		$resp_error_message = $res_error_start . $resp_alert_error . "</div>";
	  }
	  if ($resp_alert_warning != "") {
		$resp_warning_message = $res_warrning_start . $resp_alert_warning . "</div>";
	  }

	  /**** End Note handling ****************/

	  if ($output) {
		$resp = "";
		$lines = file($result_file);
		$resp = json_encode($lines);
		$data_str = str_replace('\n', "", $resp);
		$data_str = str_replace('\\', "", $data_str);
		$data_str = trim($data_str, '[]');
		$data_str = trim($data_str, '"');
	  // echo '<pre>'; print_r($data_str); echo '--data srt--'; exit();
		$cross_table_html = $this->process_cross_tabs($data_str);
		$result_file_html = str_replace(".json", ".html", $result_file);
		$file = fopen($result_file_html, 'w');
		fwrite($file, $cross_table_html);
		fclose($file);
		exec("rm -r " . $result_file);
		//$action = "Success Cross" . $resp_warning_message . $resp_success_message . $resp_error_message . $cross_table_html . $command;
		//$action = $data_str;
		$action = $resp_warning_message . $resp_success_message . $resp_error_message . $cross_table_html;
	  }
	  else {
		$resp_error_message = $res_error_start . $resp_alert_error . "<strong>Chart is not generated.</strong><br/></div>";
		//$action = "0|||Error" . $resp_warning_message . $resp_success_message . $resp_error_message . $command . $res;
		$action = "0|||" . $resp_warning_message . $resp_success_message . $resp_error_message;
	  }
	}
	$response['chart_html'] = $action;
	return new JsonResponse($response);
  }
}