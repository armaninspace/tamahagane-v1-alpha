<?php
namespace Drupal\tm_wordcloud\Controller;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\ReplaceCommand;
/**
 * Class WordcloudController.
 *
 * @package Drupal\tm_wordcloud\Controller
 */
class WordcloudController extends ControllerBase {
  public function addForm() {
	$file_path = $_REQUEST['file_path'];
   //$file_path = "/mnt/www/beta-03.tamahagane.org/htdocs/modules/custom/tm_analytics/data_files/4385026e-8ab6-46b1-83e2-257c4d1c8946.csv";
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
    } //////////end each
    $allfield_data = array (
	  'integer_type' => $saved_integerField,
	  'factor_type'  => $saved_factorField,
	  'chars_type'   => $saved_characterField,
	  'numeric_type' => $saved_numericField,
	  'logical_type' => $saved_logicalField
    );
    $saved_allFields = array_merge($saved_numericField, $saved_integerField, $saved_characterField, $saved_factorField, $saved_logicalField);
    $int_num_fields = array_merge($saved_numericField, $saved_integerField);
    $img_dir = $droot.'/sites/default/files/projectChartImages/';
	$twig = \Drupal::service('twig');
	$path =  drupal_get_path('module', 'tm_wordcloud');
	$template = $twig->loadTemplate($path.'/templates/tm_wordcloud_form.html.twig');
	$response['form_html'] = $template->render(['img_dir' => $img_dir,'num_fields'=>$int_num_fields, 'merged_fields'=>$saved_allFields,'all_types'=>$allfield_data]);
    return new JsonResponse($response);
  }
  public function processData() {
    $chart_type = $_REQUEST['chart'];
    $chart_json = $_REQUEST['chart_data'];
    $chart_data_array  = json_decode($chart_json, TRUE);
    $result_file  = $chart_data_array['img_path'];
    $rfile_path = 'wordcloud.R';
    $rdir_name = '/rcodes_plotly';/*** Plotly ***/
    $droot = \Drupal::root();
    $path_to_module = drupal_get_path('module', 'tm_wordcloud');
    $rdir = $droot . "/" . $path_to_module . "/includes" . $rdir_name;
    $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
    //$invoirment_vars = 'export R_LIBS="/home/khurram/R/x86_64-pc-linux-gnu-library/3.3"; export R_LIBS_USER="/home/khurram/R/x86_64-pc-linux-gnu-library/3.3"; export PATH=$PATH:/usr/bin/;';
	$exe_command = "cd $rdir && Rscript " . $rfile_path . " " . base64_encode($chart_json);
	$res = exec($invoirment_vars . $exe_command);
	$action = $res;
    $response['chart_html'] = $action;
    return new JsonResponse($response);
  }
}