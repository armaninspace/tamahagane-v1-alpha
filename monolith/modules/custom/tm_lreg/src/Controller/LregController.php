<?php

namespace Drupal\tm_lreg\Controller;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\ReplaceCommand;
/**
 * Class Linear regression Controller.
 *
 * @package Drupal\tm_lreg\Controller
 */
class LregController extends ControllerBase {
  public function addForm() {
    $file_path = $_REQUEST['file_path'];
    $droot = \Drupal::root();
    $droot = str_replace("\\", "/", $droot);
    $path_to_module = drupal_get_path('module', 'tm_analytics');
    $rdir = $droot . "/" . $path_to_module . "/includes/rcode";
    $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
    //$invoirment_vars = 'export R_LIBS="/home/khurram/R/x86_64-pc-linux-gnu-library/3.3"; export R_LIBS_USER="/home/khurram/R/x86_64-pc-linux-gnu-library/3.3"; export PATH=$PATH:/usr/bin/;';
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
    }
    $allfield_data = array (
      'integer_type' =>  $saved_integerField,
      'factor_type' => $saved_factorField,
      'chars_type' => $saved_characterField,
      'numeric_type' => $saved_numericField,
      'logical_type' => $saved_logicalField
    );
    $saved_allFields = array_merge($saved_numericField, $saved_integerField, $saved_characterField, $saved_factorField, $saved_logicalField);
    $int_num_fields = array_merge($saved_numericField, $saved_integerField);
    $img_dir = $droot.'/sites/default/files/projectChartImages/';
    $twig = \Drupal::service('twig');
    $path =  drupal_get_path('module', 'tm_lreg');
    $template = $twig->loadTemplate($path.'/templates/tm_lreg_form.html.twig');
    $response['form_html'] = $template->render(['img_dir' => $img_dir,'num_fields'=>$int_num_fields, 'merged_fields'=>$saved_allFields,'all_types'=>$allfield_data]);
    return new JsonResponse($response);
  }
  public function processData() {
    $chart_type = $_REQUEST['chart'];
    $chart_json = $_REQUEST['chart_data'];
    $chart_data_array  = json_decode($chart_json, TRUE);
    $result_file  = $chart_data_array['img_path'];
    $rfile_path = 'linearregression.R';
    $rdir_name = '/rcodes_plotly';
    $droot = \Drupal::root();
    $path_to_module = drupal_get_path('module', 'tm_lreg');
    $rdir = $droot . "/" . $path_to_module . "/includes" . $rdir_name;
    $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
    //$invoirment_vars = 'export R_LIBS="/home/khurram/R/x86_64-pc-linux-gnu-library/3.3"; export R_LIBS_USER="/home/khurram/R/x86_64-pc-linux-gnu-library/3.3"; export PATH=$PATH:/usr/bin/;';
    $exe_command = "cd $rdir && Rscript " . $rfile_path . " " . base64_encode($chart_json);
    $res = exec($invoirment_vars . $exe_command);
    if ($chart_type == "lregchart") {
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
        $resp_alert_success .= '<strong>Filters load time: </strong>' . $res_a['numeric_fillters_time_elapsed'] . 's<br/>';
        $resp_alert_success .= '<strong>No. of rows in dataset after implementing filters: </strong>' . $res_a['nrows_after_numeric_filter_int'] . '<br/>';
        $resp_alert_error .= '<strong>No rows available after applying filter! </strong><br/>';
      }
      if ($res_a['nrows_after_contains_filter']) {
        $resp_alert_success .= '<strong>Filter load time: </strong>' . $res_a['contains_fillters_time_elapsed'] . 's<br/>';
        $resp_alert_success .= '<strong>No. of rows in dataset after implementing filters: </strong>' . $res_a['nrows_after_contains_filter_int'] . '<br/>';
      }
      elseif ($res_a['nrows_after_contains_filter'] === FALSE) {
        $resp_alert_success .= '<strong>Filters load time: </strong>' . $res_a['contains_fillters_time_elapsed'] . 's<br/>';
        $resp_alert_success .= '<strong>No. of rows in dataset after implementing filters: </strong>' . $res_a['nrows_after_contains_filter_int'] . '<br/>';
        $resp_alert_error .= '<strong>Need at least 2 points to generate chart.</strong><br/>';
      }
      if ($res_a['unique values for ranking'] === FALSE) {
        $resp_alert_error .= '<strong>Unique values for ranking are greater than 12.</strong><br/>';
      }
      if ($res_a['area chart density check'] === FALSE) {
        $resp_alert_error .= '<strong>Need at least 2 points to select a bandwidth automatically.</strong><br/>';
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
        //echo $result_file;
      if ($output) {
        $resp = "";
        if ($chart_type == "lregchart") {
          $file = fopen($result_file, 'w');
          //echo $file;
            for ($i = 1; $i <= 4; $i++) {
              $lines = file($chart_data_array['plot_path' . $i]);
              $id_array = explode("\"", $lines[16]);
              $id = $id_array[1];
              $script_one = $lines[18];
              $generated_id = uniqid("htmlwidget-");
              $script_one = str_replace($id, $generated_id, $script_one);
              $resp .= '<div class="col-md-6">';
              $resp .= '<div id="htmlwidget_container"><div id="' . $generated_id . '" class="plotly html-widget"></div></div>';
              $resp .= $script_one;
              $resp .= '</div>';
              $files_dir = str_replace(".html", "", $chart_data_array['plot_path' . $i]);
              exec("rm -r " . $files_dir . "_files");
              exec("rm -r " . $chart_data_array['plot_path' . $i]);
              //break;
              //echo $resp; works here
            }
            if (isset($res_a['summaryobj'])) {
              // Residuals
              $resp .= '<br /><br /><p style="float:left;"><b>Residuals:</b></p><br /><table class="table table-bordered table-inverse">';
              $resp .= '<thead><tr><th>Min.</th><th>1Q</th><th>Median</th><th>Mean</th><th>3Q</th><th>Max.</th></tr></thead>';
              $resp .= '<tbody><tr><td>' . $res_a['summaryobj']['res']['Min.'] . '</td><td>' . $res_a['summaryobj']['res']['1st Qu.'] . '</td>';
              $resp .= '<td>' . $res_a['summaryobj']['res']['Median'] . '</td><td>' . $res_a['summaryobj']['res']['Mean'] . '</td>';
              $resp .= '<td>' . $res_a['summaryobj']['res']['3rd Qu.'] . '</td><td>' . $res_a['summaryobj']['res']['Max.'] . '</td></tr></tbody></table>';
              //Coefficients
              $resp .= '<br /><br /><p style="float:left;"><b>Coefficients:</b></p><br /><table class="table table-bordered table-inverse">';
              $resp .= '<thead><tr><th>Estimate Std.</th><th>Error</th><th>t value</th><th>Pr(>|t|)</th></tr></thead><tbody>';
              foreach ($res_a['summaryobj']['coef'] as $coeff) {
                  $this->fix_array_key($coeff);
                  $resp .= '<tr><td>' . $coeff['Estimate'] . '</td><td>' . $coeff['Std.Error'] . '</td>';
                  $resp .= '<td>' . $coeff['tvalue'] . '</td><td>' . $coeff['Pr(>|t|)'] . '</td></tr>';
              }
              $resp .= '</tbody></table>';
              //Other Info for linear regression
              $resp .= '<div style="float: left; text-align: left;"><p>';
              $resp .= '<b>Residual Standard Error: </b>' . $res_a['summaryobj']['rse'] . '<br />';
              $resp .= '<b>Multiple R-squared: </b>' . $res_a['summaryobj']['rsquared'] . '<br />';
              $resp .= '<b>Adjusted R-squared: </b>' . $res_a['summaryobj']['ajstrsquared'] . '<br />';
              $resp .= '<b>F-statistics: </b>' . $res_a['summaryobj']['Fstatistic'] . '<br />';
              $resp .= '</p></div>';
            }
          //echo $resp; 
          fwrite($file, $resp);
          fclose($file);
          //$action = "Success_lreg".$resp_warning_message.$resp_success_message.$resp_error_message.$resp.$files_names.$command;
          $action = $resp_warning_message . $resp_success_message . $resp_error_message . $resp;
        }
      }
      else {
        $resp_error_message = $res_error_start . $resp_alert_error . "<strong>Chart is not generated.</strong><br/></div>";
        $action = "0|||" . $resp_warning_message . $resp_success_message . $resp_error_message;
      }
    }
    $response['chart_html'] = $action;
    return new JsonResponse($response);
  }
  function fix_array_key(&$arr) {
    $arr = array_combine(
      array_map(
        function ($str) {
          return str_replace(" ", "", $str);
        },
        array_keys($arr)
      ),
      array_values($arr)
    );
    foreach ($arr as $key => $val) {
      if (is_array($val)) {
        fix_array_key($arr[$key]);
      }
    }
  }
}