<?php
namespace Drupal\mc_devmode\Controller;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\ReplaceCommand;
/**
 * Class DevmodeController.
 *
 * @package Drupal\mc_devmode\Controller
 */
class DevmodeController extends ControllerBase {
  /**
   * Devmode.
   *
   * @return string
   *   Return Hello string.
   */
  public function devmode($data_id = 0, $rid = 0, $chart_type = "", $image_num = 1) {
	if ($data_id) {
	  $droot = \Drupal::root();
	  //get R code based on chart type
	  if ($chart_type == "lineplot") {
		$chart_type = 'linechart';
	  }
	  if ($chart_type == "area") {
		$chart_type = 'areachart';
	  }
	  if ($chart_type == "ddscatterplot") {
		$chart_type = '2dscatterplot';
	  }
	  $chart_module_path = drupal_get_path('module', 'tm_' . $chart_type);
	  $cm_path = $droot . '/' . $chart_module_path;
	  $chart_r_dir = $cm_path . '/includes/rcodes_plotly/';
	  $chart_r_file = $chart_type . '.R';
	  if ($chart_type == "2dscatterplot") {
		$chart_r_file = 'scatterplot.R';
	  }
	  if ($chart_type == "cmatrix") {
	    $chart_r_file = 'correlation_matrix.R';
	  }
	  if ($chart_type == "spmatrix") {
	    $chart_r_file = 'scatterplot_matrix.R';
	  }
        if ($chart_type == "lreg") {
            $chart_r_file = 'linearregression.R';
        }
	  if ($chart_type == "donutchart") {
	    $chart_r_file = 'donut1.R';
	  }
	  $chart_r_path = $chart_r_dir . $chart_r_file;
	  $r_code = file_get_contents($chart_r_path);  
	  //get generated chart html
	  $resultJson = "";
	  $rindex = $_REQUEST['varName'];
      $resultJson = $_REQUEST[$rindex];
      $dataArray[] = json_decode($resultJson, TRUE);
	  //print_r($dataArray[0]['data'][0]);
		//exit();
	  $graph_file_name = $dataArray[0]['ImgName'];
	  $graph_dir = $droot . '/sites/default/files/projectChartImages/';
	  //$graph_file_name = $chart_type."_".$data_id."_".$rid."_".$image_num.".html";
	  //$dataArray[0]['data'][0]['img_path'] =
	  $graph_file_path = $dataArray[0]['data'][0]['img_path'];
	  //$graph_file_path = str_replace('/mnt/www/beta-version-47.marketcaliper.com', '/var/www/mcal_d8_local', $dataArray[0]['data'][0]['img_path']);
	  $chart_html = "";
	  if (file_exists($graph_file_path)) {
		$chart_html = file_get_contents($graph_file_path);
	  }
	  else {
		$chart_html = file_get_contents($graph_dir . $graph_file_name);
	  }
	  //if($chart_html == ""){
  
	  //}
	  $script = '<script>(function ($) { $(document).ready(function(){ window.HTMLWidgets.staticRender(); });})(jQuery);</script>';
	  $chtml = $chart_html . $script;
	  $report_path = \Drupal::service('path.alias_manager')->getAliasByPath('/node/' . $rid);
	  //  $data_node = \Drupal\node\Entity\Node::load($pid);
	  // $file_url = $data_node->field_dataset->entity->getFileUri();
	  //  $file_path = str_replace("public://","", $file_url);
	  //   $csvfile_path = $droot."/sites/default/files/".$file_path;
	  $csvfile_path = "";
	  $twig = \Drupal::service('twig');
	  $path = drupal_get_path('module', 'mc_devmode');
	  $module_path = $droot . '/' . $path;
	  $file_path = $csvfile_path;
	  $graph_dir = $droot . '/sites/default/files/projectChartImages/';
	  $devmode_dir = $droot . '/' . $path . '/temp_chart_data';
	  $graph_temp_path = $devmode_dir . '/' . $graph_file_name;
	  //print_r($dataArray);
	  $dataArray[0]['data'][0]['img_path'] = $graph_temp_path;
	  //$dataArray[0]['data'][0]['csv_path'] = str_replace('/mnt/www/beta-version-47.marketcaliper.com', '/var/www/mcal_d8_local', $dataArray[0]['data'][0]['csv_path']);
	  $chart_json = json_encode($dataArray[0]['data'][0]);
	  //$chart_json;
	  $envoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
	  //  $envoirment_vars = 'export R_LIBS="/home/khurram/R/x86_64-pc-linux-gnu-library/3.3"; export R_LIBS_USER="/home/khurram/R/x86_64-pc-linux-gnu-library/3.3"; export PATH=$PATH:/usr/bin/;';      
	 $exe_command = "cd $chart_r_dir && Rscript " . $chart_r_file . " " . base64_encode($chart_json);
	  $res = exec($envoirment_vars . $exe_command);
	  //echo $graph_temp_path;
	  $filenm_arr = explode('.', $graph_file_name);
	  $temp_files = $devmode_dir . '/' . $filenm_arr[0] . "_files";
	  // unlink($graph_temp_path);
	  //exec("chmod -R 777" . $devmode_dir);
	  // exec("rm -rf " . $temp_files);
	  //print_r($res);
	  $res = str_replace("[1] ", "", $res);
	  $res = str_replace('\n', "", $res);
	  $res = str_replace('\\', "", $res);
	  $res = trim($res, '"');
	  $res_a = json_decode($res, TRUE);
	  // print_r($res_a);
	  $data = $res_a['dfFiltered'];
	  $env_var = $res_a['objList'];
	  //print_r($env_var);
	  $headers = array();
	  $data2 = array();
	  $analysis = array();
	  $col = 0;
	  foreach ($data as $key => $value) {
		$row = 0;
		$headers[$col] = $key;
		foreach ($value as $k => $v) {
		  $data2[$row][$col] = $v;
		  $row++;
		}
		$col++;
	  }
	  if ($res_a['csv_load_status']) {
		$analysis[] = 'Dataset load time: |' . $res_a['csv_load_time_elapsed'] . 's';
		$analysis[] = 'Total rows in dataset: |' . $res_a['csv_number_of_rows'];
	  }
	  if ($res_a['nrows_after_filter']) {
		$analysis[] = 'Filter load time: |' . $res_a['fillters_time_elapsed'] . 's';
		$analysis[] = 'Rows after applying filters: |' . $res_a['nrows_after_filter_int'] . '';
	  }
	  if (isset($res_a['coerce_time_elapsed'])) {
		$analysis[] = 'Chart coercion time: |' . $res_a['coerce_time_elapsed'] . 's';
	  }
	  if (isset($res_a['chart_generate_time_elapsed'])) {
		$analysis[] = 'Chart generation time: |' . $res_a['chart_generate_time_elapsed'] . 's';
	  }
	  if (isset($res_a['output_time_elapsed'])) {
		$analysis[] = 'Output result time: |' . $res_a['output_time_elapsed'] . 's';
	  }
	  // $resultJson = $_REQUEST['chart_data'];
	  // $dataArray[] = json_decode($resultJson, true);
	  // $options = array('absolute' => TRUE);
	  $chart_data = $dataArray[0]['data'][0];
	  $chart_data['csv_path'] = 'path to your csv file';
	  $data_json = $this->prepare_json($chart_data); //json_encode($dataArray[0]['data']);
	  $cols = array();
	  foreach ($dataArray[0]['data'][0] as $key => $val) {
		//if(strpos($key, '_col') && strpos($key, '_type') === FALSE){
		array_push($cols, $key);
		//}
	  }
	  //echo $chart_type;
	  $example_code = $this->prepare_code($chart_r_path, $chart_type, $data_json);
	 /* echo '<pre>'.$example_code['code'].'</pre>'; */
	  $template = $twig->loadTemplate($path . '/templates/mc_devmode.html.twig');
	  $response['devmode_html'] = $template->render([
		'graph_html' => $chtml,
		'r_code' => $r_code,
		'r_example_code' => $example_code['code'],
		'report_path' => $report_path,
		'module_path' => $module_path,
		'heads' => $headers,
		'rows' => $data2,
		'env_var' => $env_var,
		'analysis' => $analysis,
		'dataset_id' => $data_id,
		'report_id' => $rid,
		'chart_type' => $chart_type,
		'img_num' => $image_num
	  ]);
	  return [
		'#type' => 'markup',
		'#markup' => $response['devmode_html'],
		'#allowed_tags' => [
		  'div',
		  'ul',
		  'li',
		  'span',
		  'p',
		  'a',
		  'code',
		  'pre',
		  'table',
		  'thead',
		  'tbody',
		  'tr',
		  'td',
		  'th',
		  'strong',
		  'input',
		  'script'
		],
	  ];
	}
	else {
	  return [];
	}
  }
  public function prepare_code($r_file, $chart_type, $data_json, $lib_name = 'plotly') {
    //echo $chart_type;
    $patt = $this->load_pattern($lib_name);
    $main_script = array();
    $libs_include = array();
    $vars = array();
    $var_in_layout = array();
    $pre_func = array();
    $plot_func = array();
    $post_func = array();
    $post_title_func = array();
    $object_get_col = "";
    $post_object = array();
    $html_func = array();
    $post_plot_func = array();
    $code = array();
    $code_formatted = "";
    if($chart_type == 'areachart') {
      $pre_func[] = "colors <- brewer.pal(12, 'Paired')";
    }
    $pre_func[] = '# Export data as csv file from "Data" tab';
    $pre_func[] = '# change csv_path accordingly in jsonStr to run this example';
    $pre_func[] = "jsonStr <- '" . $data_json . "'";
    //$pre_func[] = 'json <- rawToChar(jsonStr)';
    $pre_func[] = 'chartOptions <- fromJSON(jsonStr)';
    $post_func[] = 'df <- read.csv(file = csvPath,
                       header = TRUE,
                       na.string = c("", "NA"),
                       stringsAsFactors = TRUE,
                       encoding = "Latin-1"
                     )';
    $post_func[] = 'df <- as.data.frame(df)';
    //$plot_func[$occur] = array();
    //return file($r_file);
    $rcode = array();
    $rcode = $this->load_rfile($r_file);
    $libs_include = $this->get_libs($rcode, $chart_type);
    $vars = $this->get_general_variables($rcode, $chart_type);
    $cols = $this->get_cols_used($vars, $chart_type);
    /*if($chart_type == 'areachart') {
      $cols = $this->get_cols_used($vars, $chart_type);
    }*/
    $post_title_func = $this->title_preprocess($vars);
    $post_object[] = $this->prepare_data_obj('dfFiltered', $chart_type, $cols);
    $plot_func = $this->get_plot_function($rcode, $chart_type, $cols, $patt);
    $var_in_layout = $this->find_layout_variables($rcode, $plot_func, $patt);
    $post_plot_func[] = 'p';
    $data_obj = $this->get_data_obj($plot_func);
    // echo $data_obj;
     $scene_str = implode("",$var_in_layout);
    //print_r($post_title_func);
    //print_r($plot_func);
    $vars_str = implode("", $vars);
    $plot_func_str = implode("", $plot_func);
    // $code_arr = file($r_file);
    $bubble_size = "";
    if($chart_type == 'bubblechart') {
      $bubble_size = 'siz <- as.numeric(dfFiltered[[bCol]])*as.numeric(bSize)';
    }
    $density = "";
    if($chart_type == 'surfacechart') {
      $density = 'rd <- kde2d(x = dfFiltered[[xCol]], y = dfFiltered[[yCol]], n = nrow(dfFiltered))';
    }
    $code = [
      $libs_include,
      $pre_func,
      array($vars_str),
      $post_func,
      $post_title_func,
      $post_object,
     // $var_in_layout,
      array($scene_str),
      array($bubble_size),
      array($density),
      $plot_func,
      //array($plot_func_str),
      $post_plot_func,
    ];
    foreach ($code as $funcs) {
      //$code_formatted .= implode("\n",$funcs);
      foreach ($funcs as $func) {
        if(trim($func) == "") {
          continue;
        }
		else {
          $code_formatted .= $func;
          $code_formatted .= "\n";
        }
      }
      //$code_formatted .= "\n";
    }
    return [
      'code' => $code_formatted,
    ];
    //$html_func
    //return $main_script[$libs_include, $pre_func, $plot_func, $post_func, $html_func];
    //return ['1'];
  }
  public function load_pattern($lib) {
    $patterns = array (
      'plotly' => array (
        'main_call' => 'plot_ly',
        'sec_call' => 'layout',
        'line_continue' => ',',
        'function_continue' => '%>%',
      ),
      'ggplot' => array (
        'main_call' => 'ggplot',
        'line_continue' => ',',
        'function_continue' => '+',
      ),
      'ggplot2' => array (
        'main_call' => 'ggplot',
        'line_continue' => ',',
        'function_continue' => '+',
      ),
      'ggplotly' => array(),
    );
    return $patterns[$lib];
  }
  public function get_libs($rcode, $chart_type) {
    $libs = array();
    $lib_start = 0;
    $lib_comp = 0;
    foreach ($rcode as $line) {
      if (trim($line) == "") {
        continue;
      }
      $comment_pos = strpos(trim($line), '#');
      if ($comment_pos === 0) {
        continue;
      }
      if (preg_match('/library\((.*?)\)/', $line, $match)) {
        $lib_start++;
        $lib_comp = 0;
        // echo $match[0];
        if($chart_type == 'surfacechart') {
          if(trim($match[0]) == "library(dplyr)") {
             continue;
          }
        }
        array_push($libs, $match[0]);
      }
      else {
        $lib_comp = 1;
      }
      /*if($lib_start == 1 && $lib_comp = 1){
          return [$lib_start, $lib_comp];
      }*/
    }
    return $libs;
  }
  public function get_plot_function($rcode, $chart_type, $cols, $patt) {
    $function = array();
    $line_flag = 0;
    $fun_flag = 0;
    $occur = 0;
    $func_start = 0;
    $func_cmp = 0;
    foreach ($rcode as $line) {
      if (trim($line) == "") {
        continue;
      }
      $comment_pos = strpos(trim($line), '#');
      if ($comment_pos === 0) {
        continue;
      }
      if (strpos($line, $patt['main_call'])) {
        $func_start = 1;
        $line = str_replace(PHP_EOL, '', $line);
        array_push($function, trim($line));
        $lc = substr_compare(trim($line), $patt['line_continue'], -1, strlen($patt['line_continue']));
        if ($lc == 0) {
          $line_flag = 1;
        }
        $fc = substr_compare(trim($line), $patt['function_continue'], -1, strlen($patt['function_continue']));
        if ($fc == -2) {
          $fun_flag = 1;
        }
        $occur++;
      }
      else {
        if (($line_flag == 1) || ($fun_flag == 1)) {
          //echo "here main ";
          //echo $line;
          $line = str_replace("), silent = TRUE)", "", $line);
          $line = str_replace("layout(scene = scene))", "layout(scene = scene)", $line);
          //$line = str_replace("colorbar(title = colorCol) %>%", "", $line);
          $line = str_replace(PHP_EOL, '', $line);
          array_push($function, $line);
          $lc = substr_compare(trim($line), $patt['line_continue'], -1, strlen($patt['line_continue']));
          if ($lc == 0) {
            $line_flag = 1;
          }
          else {
            $line_flag = 0;
          }
          $fc = substr_compare(trim($line), $patt['function_continue'], -1, strlen($patt['function_continue']));
          if ($fc == -2) {
            $fun_flag = 1;
          }
          else {
            $fun_flag = 0;
          }
          if (($line_flag == 0) && ($fun_flag == 0)) {
            $func_cmp = 1;
            $func_start = 0;
          }
        }
        if($chart_type == 'areachart') {
          if (strpos(trim($line), '<- try') || strpos(trim($line), '<- system.time') || strpos(trim($line), ')') === 0 || strpos(trim($line), 'silent = TRUE')) {
             continue;
          }
          /*if (strpos($line, $patt['sec_call'])) {
              continue;
          }
          if (strpos($line, $patt['sec_call'])) {
             continue;
          }*/
        }
        //  echo "fs: ". $func_start .' && '. ' fc: '. $func_cmp .' && '. " lf: ". $line_flag .' && '. " ff:". $fun_flag ."<br>";
        if ($func_start == 1 && $func_cmp == 0 && $line_flag == 0 && $fun_flag == 0) {
          $line = str_replace(PHP_EOL, '', $line);
          array_push($function, $line);
          if (strpos($line, $patt['sec_call'])) {
            $lc = substr_compare(trim($line), $patt['line_continue'], -1, strlen($patt['line_continue']));
            if ($lc == 0) {
              $line_flag = 1;
            }
            else {
              $line_flag = 0;
              // echo 'here1 ';
            }
            $fc = substr_compare(trim($line), $patt['function_continue'], -1, strlen($patt['function_continue']));
            if ($fc == -2) {
              $fun_flag = 1;
            }
            else {
              $fun_flag = 0;
              // echo 'here2 ';
            }
          }
        }
        else {

        }
        if ($func_cmp == 1) {
          //break;
          $validate = $this->validate_plot_function($function, $chart_type, $cols);
          if ($validate == 1) {
            break;
          }
          if ($validate == 3) {
            $func_start = 0;
            $func_cmp = 0;
            $line_flag = 0;
            $fun_flag = 0;
            $function = array();
          }
        }
      }
    }
    return $function;
  }
  public function get_data_obj($function = array()) {
    $obj = "";
    $obj_flag = 0;
    $obj_patt = '/\= (.*?)\[\[(.*?)\]\]/';
    $func_start = $function[0];
    if (preg_match($obj_patt, $func_start, $match)) {
      $obj_flag = 1;
      // echo $match[0];
      //array_push($libs, $match[0]);
      $obj = trim($match[1]);
    }
    return $obj;
  }
  public function validate_plot_function($function, $chart_type, $cols) {
    /*
     * 1 all clear
     * 2 open close not proper
     * 3 find next
    */
    $validate = 0;
    $open_close = 0;
    $all_cols_used = 0;
    $find_next = 0;
    $open_count = 0;
    $close_count = 0;
    foreach ($function as $fstr) {
      $open_count += substr_count($fstr, "(");
      $close_count += substr_count($fstr, ")");
    }
    if ($open_count == $close_count) {
      $validate = 1;
    }
    $each_true = array();
    $func_str = implode("", $function);
    //print_r($cols);
    //echo $func_str;
    foreach ($cols as $col) {
      //$col_v = explode('_', $col);
      //$col_str = $col_v[0]." =";
      if (strpos($func_str, $col) !== FALSE) {
        array_push($each_true, 'TRUE');
      }
    }
    if (count($cols) == count($each_true)) {
      $validate = 1;
    }
    else {
      $validate = 3;
    }
    //print_r($cols);
    //echo $func_str;
    if($chart_type == 'areachart' || $chart_type == 'surfacechart'){
      $validate = 1;
    }
    return $validate;
  }
  public function load_rfile($rfile) {
    $code = array();

    $code = file($rfile);

    return $code;
  }
  public function find_layout_variables($rcode, $function, $pattern, $variable_hint = 'layout') {
    $func_declaration = array();
    $dec_start = 0;
    $dec_cmp = 0;
    $var_name_patt = '/layout\(([^\)]+)\)/';
    $line_flag = 0;
    $fun_flag = 0;
    $variable_name = "";
    foreach ($function as $fun_line) {
      if (strpos($fun_line, $variable_hint)) {
        if (strpos($fun_line, 'list')) {

        }
        else {
          if (preg_match($var_name_patt, $fun_line, $match)) {
            //print_r($match);
            $match_arr = explode('=', $match[1]);
            //print_r($match_arr);
            if (trim($match_arr[0]) == trim($match_arr[1])) {
              $variable_name = trim($match_arr[0]);
            }
          }
        }
      }
    }
    if ($variable_name != "") {
      foreach ($rcode as $line) {
        if (trim($line) == "") {
          continue;
        }
        $comment_pos = strpos(trim($line), '#');
        if ($comment_pos === 0) {
          continue;
        }
        $varname_pos = strpos(trim($line), $variable_name);
        if ($varname_pos === 0) {
          array_push($func_declaration, $line);
          $dec_start = 1;
          $lc = substr_compare(trim($line), $pattern['line_continue'], -1, strlen($pattern['line_continue']));
          if ($lc == 0) {
            $line_flag = 1;
          }
          $fc = substr_compare(trim($line), $pattern['function_continue'], -1, strlen($pattern['function_continue']));
          if ($fc == -2) {
            $fun_flag = 1;
          }
        }
        else {
          if (($line_flag == 1) || ($fun_flag == 1)) {
            //echo "here main ";
            array_push($func_declaration, $line);
            $lc = substr_compare(trim($line), $pattern['line_continue'], -1, strlen($pattern['line_continue']));
            if ($lc == 0) {
              $line_flag = 1;
            }
            else {
              $line_flag = 0;
            }
            $fc = substr_compare(trim($line), $pattern['function_continue'], -1, strlen($pattern['function_continue']));
            if ($fc == -2) {
              $fun_flag = 1;
            }
            else {
              $fun_flag = 0;
            }
            if (($line_flag == 0) && ($fun_flag == 0)) {
              $dec_cmp = 1;
              $dec_start = 0;
            }
          }
        }
        if ($dec_cmp == 1) {
          break;
        }
      }
    }
    return $func_declaration;
  }
  public function get_general_variables($rcode, $chart_type) {
    $vars = array();
    foreach ($rcode as $line) {
      if (trim($line) == "") {
        continue;
      }
      $chartopt_pos = strpos(trim($line), 'chartOptions');
      if ($chartopt_pos === 0) {
        continue;
      }
      elseif ($chartopt_pos) {
        if (strpos(trim($line), 'img_path') || strpos(trim($line), 'Type') || strpos(trim($line), 'length') || strpos(trim($line), 'sapply') || strpos(trim($line), 'chartOptions$filters')) {
          continue;
        }
        array_push($vars, $line);
      }
      if($chart_type == 'areachart') {
        $colnames_pos = strpos(trim($line), 'colNames');
        if ($colnames_pos === 0) {
          array_push($vars, $line);
        }
      }
    }
    return $vars;
  }
  public function get_cols_used($vars, $chart_type = "") {
    $cols = array();
    foreach ($vars as $var) {
      $var_arr = explode('<-', $var);
      if (strpos(trim($var_arr[0]), 'Col') && strpos(trim($var_arr[0]), 'Type') === FALSE) {
        array_push($cols, trim($var_arr[0]));
      }
      if($chart_type == 'areachart') {
        if (strpos(trim($var_arr[0]), 'colNames') === 0) {
          array_push($cols, trim($var_arr[0]));
        }
      }
    }
    return $cols;
  }
  public function prepare_json($chart_data) {
    $data_json = "";
    foreach ($chart_data as $key => $val) {
      if (strpos(trim($key), '_type')) {
        unset($chart_data[$key]);
      }
    }
    unset($chart_data['img_path']);
    //unset($chart_data['filters']);
    $chart_data['filters'] = array();
    $data_json = json_encode($chart_data);
    return $data_json;
  }
  public function prepare_data_obj($obj_name, $chart_type, $cols) {
    $obj_str = "";
    $func_list = array();
    if($chart_type == 'areachart'){
      $obj_name = 'colNames';
    }
    if ($obj_name == "dfFiltered") {
      $obj_str .= 'dfFiltered <- df %>%' . "\n";
      foreach ($cols as $col) {
        $func_list[] = 'get(' . $col . ')';
      }
      $obj_str .= 'select(' . implode(",", $func_list) . ')';
    }
    if( $obj_name == 'colNames'){
	  $obj_str .= 'for (variable in colNames) {
	  dfFiltered <- df[c(variable)]
	  }';
    }
    return $obj_str;
  }
  public function title_preprocess($vars) {
    $title_main = array();
    $title_sec = array();
    $func_patt = array();
    $func_list = array();
    /*$post_func[] = 'xTitle <- ifelse(xTitle == "", "X Col", xTitle)';
    $post_func[] = 'yTitle <- ifelse(yTitle == "", "Y Col", yTitle)';
    $post_func[] = 'zTitle <- ifelse(zTitle == "", "Z Col", zTitle)';
    $post_func[] = 'chartTitle <- ifelse(is.null(chartTitle), "chartTitle", chartTitle)';*/
    $func_patt['f'] = 'f <- list( family = "Open Sans, verdana, arial, sans-serif", size = 16, color = "#444444" )';
    $func_patt['x'] = 'x <- list( title = xTitle, titlefont = f )';
    $func_patt['y'] = 'y <- list( title = yTitle, titlefont = f )';
    $func_patt['z'] = 'z <- list( title = zTitle, titlefont = f )';
    $func_patt['chartTitle'] = 'chartTitle <- ifelse(chartTitle == "", "chartTitle", chartTitle)';
    $func_patt['axisf'] = 'axisf <- list( family = "Open Sans, verdana, arial, sans-serif", size = 10, color = "#444444" )';
    array_push($title_sec, $func_patt['f']);
    array_push($title_sec, $func_patt['axisf']);
    foreach ($vars as $var) {
      $var_arr = explode('<-', $var);
      $var_name = trim($var_arr[0]);
      if (strpos($var_name, 'Title')) {
        $f_str = $var_name.' <- ifelse('.$var_name.' == "", "Col '.$var_name.'", '.$var_name.')';
        array_push($title_main, $f_str);
        $f_patt = $func_patt[$var_name[0]];
        array_push($title_sec, $f_patt);
      }
    }
    //array_push($title_main, $func_patt['chartTitle']);
    $func_list = array_merge($title_main, $title_sec);
    return $func_list;
  }
}