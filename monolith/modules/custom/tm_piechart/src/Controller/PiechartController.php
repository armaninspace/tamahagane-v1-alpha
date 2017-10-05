<?php
namespace Drupal\tm_piechart\Controller;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\ReplaceCommand;
/**
 * Class PiechartController.
 *
 * @package Drupal\tm_piechart\Controller
 */
class PiechartController extends ControllerBase {
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
	$allfield_data = array(
	  'integer_type' => $saved_integerField,
	  'factor_type'  => $saved_factorField,
	  'chars_type'   => $saved_characterField,
	  'numeric_type' => $saved_numericField,
	  'logical_type' => $saved_logicalField
	);
	$saved_allFields = array_merge($saved_numericField, $saved_integerField, $saved_characterField, $saved_factorField, $saved_logicalField);
	$int_num_fields = array_merge($saved_numericField, $saved_integerField,$saved_logicalField);
	$factorNlogical = array_merge($saved_factorField,$saved_logicalField);
    $img_dir = $droot.'/sites/default/files/projectChartImages/';
    $twig = \Drupal::service('twig');
    $path =  drupal_get_path('module', 'tm_piechart');
    $module_path = $droot.'/'.$path;
	$template = $twig->loadTemplate($path.'/templates/tm_piechart_form.html.twig');
	$response['form_html'] = $template->render(['img_dir' => $img_dir,'num_fields'=>$int_num_fields, 'merged_fields'=>$saved_allFields,'all_types'=>$factorNlogical]);
    return new JsonResponse($response);
  }
  public function processData() {
    $chart_type = $_REQUEST['chart'];
    $chart_json = $_REQUEST['chart_data'];
	$chart_data_array  = json_decode($chart_json, TRUE);
	$result_file  = $chart_data_array['img_path'];
	$rfile_path = 'piechart.R';
	$rdir_name = '/rcodes_plotly';/*** Plotly ***/
	$droot = \Drupal::root();
	$path_to_module = drupal_get_path('module', 'tm_piechart');
	$rdir = $droot . "/" . $path_to_module . "/includes" . $rdir_name;
	$invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
	$exe_command = "cd $rdir && Rscript " . $rfile_path . " " . base64_encode($chart_json);
	$res = exec($invoirment_vars . $exe_command);
	if ($chart_type == "piechart") {
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
		$id_array = explode("\"", $lines[16]);
		$id = $id_array[1];
		$script_one = $lines[18];
		$generated_id = uniqid("htmlwidget-");
		$script_one = str_replace($id, $generated_id, $script_one);
		$resp .= '<div id="htmlwidget_container" class="pie_chart"><div id="' . $generated_id . '" class="plotly html-widget"></div></div>';
		$resp .= $script_one;
		//$resp .= $lines;
		$files_dir = str_replace(".html", "", $result_file);
		exec("rm -r " . $files_dir . "_files");
		$file = fopen($result_file, 'w');
		fwrite($file, $resp);
		fclose($file);
		//$action = "Success_others" . $resp_warning_message . $resp_success_message . $resp_error_message . $resp . $command;
		$action = $resp_warning_message . $resp_success_message . $resp_error_message . $resp;
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