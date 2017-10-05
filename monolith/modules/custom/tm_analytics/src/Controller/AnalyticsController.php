<?php
namespace Drupal\tm_analytics\Controller;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\ReplaceCommand;
use Drupal\Core\Path\AliasManager;
use Drupal\og\Og;
use Drupal\user\EntityOwnerInterface;
class AnalyticsController extends ControllerBase {
  public function saveReport() {
      $sketch_id = $_REQUEST['sketch_id'];
	$str = $_REQUEST['str'];
	$drupal_root = str_replace("\\", "/", DRUPAL_ROOT);
	$imgdir = $drupal_root . "/sites/default/files/projectChartImages/";
	$read_str = json_decode($str, TRUE);
	foreach ($read_str as $key => $val ) {
	  $img_name = $val['ImgName'];
	  $exploded_img_name = explode(".", $img_name);
	  $editedname = $exploded_img_name[0] . "_ed." . $exploded_img_name[1];	  
	  if ($imgdir . $editedname == $val['data'][0]['img_path']) {
		if (file_exists($imgdir . $editedname)) {
		  unlink($imgdir . $img_name);
		  rename($imgdir . $editedname, $imgdir . $img_name);
		}
		$read_str[$key]['data'][0]['img_path']= trim(str_replace('_ed', '', $val['data'][0]['img_path']));
	  }
	}
	
	$fileName = $_POST['filenames'];
	$fileNames = explode(',', $fileName);

	foreach($fileNames as $fName) {	  
	  $path = $imgdir . $fName;
	  file_unmanaged_delete($path);
    }
	
	$node_update= \Drupal\node\Entity\Node::load($sketch_id);
	$node_update->set("field_charts_data", json_encode($read_str));
	$node_update->save();
	return new JsonResponse('/node/'.$sketch_id);
  }
	public function deleteImgFiles() {
		$image_arr = $_REQUEST['data_arr'];
		$dataArray = json_decode($image_arr, TRUE);
		$drupal_root = str_replace("\\", "/", DRUPAL_ROOT);
		$pathForHTml = $drupal_root . "/sites/default/files/pictures/";
		foreach ($dataArray as $key => $value){
			$path = $pathForHTml . $value['img_dir'];
			file_unmanaged_delete_recursive($path);
		}

		return new JsonResponse('files deleted');
	}

	public function deleteCharts() {
    $sketch_id = $_REQUEST['sketch_id'];
    $image = $_REQUEST['img_name'];
    $drupal_root = str_replace("\\", "/", DRUPAL_ROOT);
    $pathForHTml = $drupal_root . "/sites/default/files/projectChartImages/";
    //$pathHtml = 'D:/xampp/htdocs/tamahagane4-new3/sites/default/files/projectChartImages/';
	$path = $pathForHTml . $image;
	 
	//file_unmanaged_delete($path);
	 
	return new JsonResponse('/node/'.$sketch_id);
  }
  public function clearCharts() {
	$sketch_id = $_REQUEST['sketch_id'];
	$drupal_root = str_replace("\\", "/", DRUPAL_ROOT);
    $pathForHTml = $drupal_root . "/sites/default/files/projectChartImages/";
	//$pathHtml = 'D:/xampp/htdocs/tamahagane4-new3/sites/default/files/projectChartImages/';
	$data_post = $_POST['data'];
	/*$delim = '.html';
	$parts = explode($delim,$data_post);
	$string1 = implode($delim,array_slice($parts,0)) . $delim;
	echo  implode($parts);*/	
	$data = json_decode($data_post);
	foreach($data as $image){	
	  //echo $image;
	  $path = $pathForHTml . $image;
	  //file_unmanaged_delete($path);
	}	
	exit();
  } 
  public function extract_string($str, $from, $to) {
	$from_pos = strpos($str, $from);
	$from_pos = $from_pos + strlen($from);
	$to_pos   = strpos($str, $to, $from_pos);// to must be after from
	$return   = substr($str, $from_pos, $to_pos-$from_pos);
	unset($str, $from, $to, $from_pos, $to_pos );
	return $return;
  }
	public function showCharts($id = 0) {
		/*[{"ImgType": "scatterplot", "ImgID": "scatter_img_1", "ImgName": "scatter_plot_1_7_1.html", "data":[{"csv_path":"/mnt/www/beta-version-47.marketcaliper.com/htdocs/sites/default/files/datasets/Mock-Survey-Data_4.csv", "img_path":"/mnt/www/beta-version-47.marketcaliper.com/htdocs/sites/default/files/projectChartImages/scatter_plot_1_7_1.html", "chart_title":"scatter", "x_col":"Age", "y_col":"Household.Size", "z_col":"Household.Income", "x_col_type":"integer", "y_col_type":"integer", "z_col_type":"integer","x_title":"tt", "y_title":"yy", "z_title":"zz", "color_col":"Gender", "color_col_type":"factor", "filters":[]}]}]*/
		//            $resultJson = $data_node->get(field_charts_data)->value;
		if ($id > 0) {
			$data_node = \Drupal\node\Entity\Node::load($id);
			$resultJson = $data_node->get(field_charts_data)->value;
			$title = "";
			$tabs = "";
			$tabCont = "";
			$imgsHtml = "";
			$textclusterdoc = array();
			$tjson= '';
			$drupal_root = str_replace("\\", "/", DRUPAL_ROOT);
			$pathForHTml = $drupal_root . '/sites/default/files/projectChartImages/';
			$tooltipPath = "";
			$tooltipTitle = 'Get Help';
			$img_div_id = 1;
      $txt_div_id = 1;
			if ($resultJson && $resultJson != '[]') {
				$dataArray = json_decode($resultJson, TRUE);
				$activeFlag = 0;
				$liclass = "";
				$tabdivClass = "";
				$plotlychartArr = array('linechart', 'scatter', 'areaplot', 'trendplot', 'surfaceplot', 'bubbleplot','ddscatterplot','piechart','spmatrixplot','boxplot','histogram','heatmapplot','barchart','cmatrixplot','rankingplot','biplot','donutchart','geomap');
				foreach ($dataArray as $key => $value):
					$activeFlag++;
					if ($activeFlag == 1):
						$liclass = ' class="active"';
						$tabdivClass = " in active";
					else:
						$liclass = "";
						$tabdivClass = "";
					endif;
					if ($value['ImgType'] != "global_filters") {
						$title = $value['data'][0]['chart_title'];
					}
					if ($value['ImgType'] == "scatterplot") {
						$imgidarr = explode("_", $value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="scatter_li_' . $imgid . '"' . $liclass . '><a data-toggle="tab" title="Click" class="scatterplot" href="#scatter_' . $imgid . '">' . $title . '<i class="fa fa-arrows"></i></a></li>';
						//if ($activeFlag == 1):
						$tabCont .= '<div id="scatter_' . $imgid . '" class="myTab panel panel-default draggable-element"><div class="panel-heading">' . $title;
						//$tabCont .= '<div id="scatter_' . $imgid . '" class="tab-pane fade' . $tabdivClass . ' myTab panel panel-default"><div class="panel-heading">' . $title . '<a class="tooltipp" title="' . $tooltipTitle . '" target="_blank" href="' . $tooltipPath . '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
						$tabCont .= '<span id="scatter_' . $imgid . '_rem" class="glyphicon glyphicon-remove-sign rem-chart" title="Remove"></span><span id="scatterplot_' . $imgid . '_' . $id . '_'. $value['dataset_id'].'"  data-whatever="Scatter Plot" class="showForm scatterplot glyphicon glyphicon-edit edit" title="Edit"></span><span id="txt-minus-plus" class="glyphicon glyphicon-minus-sign" title="Minimize"></span><span class="glyphicon glyphicon-move" title="Move"></span>';
						$tabCont .= '</div>';
						$tabCont .= '<div class="panel-body">' . file_get_contents($pathForHTml . $value['ImgName']);
						$tabCont .= '<textarea class="form-control json-data" id="scatter_img_' . $imgid . '" name="scatter_img_' . $imgid . '">' . json_encode($value) . '</textarea></div></div>';
						//endif;
					}
					elseif ($value['type'] == "img_div") {
						$tabCont .=  '<div id="'.$value['divId'].'" class="img_div draggable-element">';
						$tabCont .=  '<div id="img-blocks-controls"><span class="img-block-heading blocks-heading">Image</span><span class="glyphicon glyphicon-move" title="Move"></span><span id="txt-minus-plus" class="glyphicon glyphicon-minus-sign" title="Minimize"></span><span id="'.$value['divId'].'_rem" class="glyphicon glyphicon-remove-sign rem_img_div" title="Remove"></span></div>';
						$tabCont .= '<div class="img-body">';
						foreach ($value['images'] as $key => $value2){
							$tabCont .= '<img class="fine_uploader_img" src="/sites/default/files/pictures/'.$value2['img_dir'].'/'.$value2['img_name'].'">';
						}
						$tabCont .= '</div></div>';
						$img_div_id++;
					}
          //'<div class="analytics-textarea-main"><div id="txt-blocks-controls"><span class="glyphicon glyphicon-edit"></span><span id="txt-minus-plus" class="glyphicon glyphicon-minus-sign"></span><span class="glyphicon glyphicon-remove-sign"></span></div><div class="analytics-textarea"><div id="analytics-textarea-'+id+'" class="mathjax">'+value+'</div><textarea id="analytics-textarea-'+id+'" class="mathjax anatxt-area-edit" style="display: none"></textarea></div></div>'
          //'<div class="analytics-textarea-main" id="text_div_'+divs_length+'">
           //<div id="txt-blocks-controls"><span id="txt-minus-plus" class="glyphicon glyphicon-minus-sign"></span><span class="glyphicon glyphicon-remove-sign"></span></div>
           //<div class="analytics-textarea"><textarea id="analytics-textarea-'+divs_length+'"></textarea></div></div>'
          elseif ($value['type'] == "text") {
            $divid = explode("_", $value['divId']);
            $tabCont .=  '<div id="'.$value['divId'].'" class="analytics-textarea-main draggable-element">';
            $tabCont .=  '<div id="txt-blocks-controls"><span class="text-block-heading blocks-heading">Paragraph</span><span class="glyphicon glyphicon-move" title="Move"></span><span id="txt-minus-plus" class="glyphicon glyphicon-minus-sign" title="Minimize"></span><span id="'.$value['divId'].'_edit" class="glyphicon glyphicon-edit edit_txt_div" title="Edit"></span><span id="'.$value['divId'].'_rem" class="glyphicon glyphicon-remove-sign rem_txt_div" title="Remove"></span></div>';
            $tabCont .= '<div class="analytics-textarea">';
            $tabCont .= '<div id="analytics-area-'.$divid[2].'" class="mathjax">'.$value['value'].'</div>';
            $tabCont .= '<textarea style="display: none" id="analytics-textarea-'.$divid[2].'">'.$value['value'].'</textarea>';
            $tabCont .= '</div></div>';
            $txt_div_id++;
          }

          /////////if for 2dscaterplot
					elseif ($value['ImgType'] == "ddscatterplot") {
						$imgidarr = explode("_", $value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="ddscatter_li_' . $imgid . '"' . $liclass . '><a data-toggle="tab" title="Click" class="ddscatterplot" href="#ddscatter_' . $imgid . '">' . $title . '<i class="fa fa-arrows"></i></a></li>';
						if ($activeFlag == 1):
							$tabCont .= '<div id="ddscatter_' . $imgid . '" class="tab-pane fade' . $tabdivClass . ' myTab panel panel-default"><div class="panel-heading">' . $title . '<a class="tooltipp" title="' . $tooltipTitle . '" target="_blank" href="' . $tooltipPath . '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
							$tabCont .= '<span id="ddscatterplot_' . $imgid . '_' . $id . '_'.$value['dataset_id'].'"  data-whatever="2dScatter Plot" class="showForm ddscatterplot glyphicon glyphicon-pencil edit"></span><span id="ddscatter_' . $imgid . '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
							$tabCont .= '</div>';
							$tabCont .= '<div class="panel-body">' . file_get_contents($pathForHTml . $value['ImgName']);
							$tabCont .= '<textarea class="form-control json-data" id="ddscatter_img_' . $imgid . '" name="ddscatter_img_' . $imgid . '">' . json_encode($value) . '</textarea></div></div>';
						endif;
					}/////////if for 2dscaterplot
					elseif($value['ImgType'] == "lineplot") {
						$tooltipPath = '/wiki/line-plot';
						$imgidarr = explode("_", $value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="line_li_' . $imgid . '"' . $liclass . '><a data-toggle="tab" title="Click" class="lineplot" href="#line_' . $imgid . '">' . $title . '<i class="fa fa-arrows"></i></a></li>';
						//if ($activeFlag == 1):
						$tabCont .= '<div id="line_' . $imgid . '" class="myTab panel panel-default draggable-element"><div class="panel-heading">' . $title;
						//$tabCont .= '<div id="line_' . $imgid . '" class="tab-pane fade' . $tabdivClass . ' myTab panel panel-default"><div class="panel-heading">' . $title . '<a class="tooltipp" title="' . $tooltipTitle . '" target="_blank" href="' . $tooltipPath . '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
						$tabCont .= '<span id="line_' . $imgid . '_rem" class="glyphicon glyphicon-remove-sign rem-chart" title="Remove"></span><span id="lineplot_' . $imgid . '_' . $id . '_'.$value['dataset_id'].'" data-whatever="Line Chart" class="showForm linechart glyphicon glyphicon-edit edit" title="Edit"></span><span id="txt-minus-plus" class="glyphicon glyphicon-minus-sign" title="Minimize"></span><span class="glyphicon glyphicon-move" title="Move"></span>';
						$tabCont .= '</div>';
						$tabCont .= '<div class="panel-body">' . file_get_contents($pathForHTml . $value['ImgName']);
						$tabCont .= '<textarea class="form-control json-data" id="line_img_' . $imgid . '" name="line_img_' . $imgid . '">' . json_encode($value) . '</textarea></div></div>';
						//	endif;
					}///////////if for linechart
					elseif($value['ImgType'] == "areaplot") {
						$tooltipPath = '/wiki/area-chart';
						$imgidarr = explode("_",$value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="area_li_'.$imgid.'"'.$liclass. '><a data-toggle="tab" title="Click" class="areaplot" href="#area_'.$imgid.'">'.$title.'<i class="fa fa-arrows"></i></a></li>';
						//if ($activeFlag == 1):
						//$tabCont .= '<div id="area_'.$imgid.'" class="tab-pane fade'.$tabdivClass.' myTab panel panel-default"><div class="panel-heading">'.$title.'<a class="tooltipp" title="'.$tooltipTitle.'" target="_blank" href="'.$tooltipPath.'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
            //$tabCont .= '<div id="area_'.$imgid.'" class="myTab panel panel-default draggable-element"><div class="panel-heading">'.$title.'<a class="tooltipp" title="'.$tooltipTitle.'" target="_blank" href="'.$tooltipPath.'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
            $tabCont .= '<div id="area_'.$imgid.'" class="myTab panel panel-default draggable-element"><div class="panel-heading">'.$title;
            $tabCont .= '<span id="area_'.$imgid.'_rem" class="glyphicon glyphicon-remove-sign rem-chart" title="Remove"></span><span id="area_'.$imgid.'_'.$id.'_'. $value['dataset_id'].'"  data-whatever="Area Chart" class="showForm areachart glyphicon glyphicon-edit edit" title="Edit"></span><span id="txt-minus-plus" class="glyphicon glyphicon-minus-sign" title="Minimize"></span><span class="glyphicon glyphicon-move" title="Move"></span>';
						$tabCont .= '</div>';
						$tabCont .= '<div class="panel-body">'.file_get_contents($pathForHTml.$value['ImgName']);
						$tabCont .= '<textarea class="form-control json-data" id="area_img_'.$imgid.'" name="area_img_'.$imgid.'">'.json_encode($value).'</textarea></div></div>';
						//endif;
					}/////////////if for area chart
					// Boxplot
					elseif($value['ImgType'] == "boxplot") {
						$tooltipPath = '/wiki/box-plot';
						$imgidarr = explode("_",$value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="box_li_'.$imgid.'"'.$liclass. '><a data-toggle="tab" title="Click" class="boxplot" href="#box_'.$imgid.'">'.$title.'<i class="fa fa-arrows"></i></a></li>';
						if ($activeFlag == 1):
							$tabCont .= '<div id="box_'.$imgid.'" class="tab-pane fade'.$tabdivClass.' myTab panel panel-default"><div class="panel-heading">'.$title.'<a class="tooltipp" title="'.$tooltipTitle.'" target="_blank" href="'.$tooltipPath.'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
							$tabCont .= '<span id="boxplot_'.$imgid.'_'.$id.'_'. $value['dataset_id'].'"  data-whatever="Boxplot" class="showForm boxplot glyphicon glyphicon-pencil edit"></span><span id="box_'.$imgid.'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
							$tabCont .= '</div>';
							$tabCont .= '<div class="panel-body">'.file_get_contents($pathForHTml.$value['ImgName']);
							$tabCont .= '<textarea class="form-control json-data" id="box_img_'.$imgid.'" name="area_img_'.$imgid.'">'.json_encode($value).'</textarea></div></div>';
						endif;
					}
					elseif($value['ImgType'] == "lregplot") {
						$tooltipPath = '/wiki/lregplot';
						$imgidarr = explode("_",$value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="lreg_li_'.$imgid.'"'.$liclass. '><a data-toggle="tab" title="Click" class="lregplot" href="#lreg_'.$imgid.'">'.$title.'<i class="fa fa-arrows"></i></a></li>';
						if ($activeFlag == 1):
							$tabCont .= '<div id="lreg_'.$imgid.'" class="tab-pane fade'.$tabdivClass.' myTab panel panel-default"><div class="panel-heading">'.$title.'<a class="tooltipp" title="'.$tooltipTitle.'" target="_blank" href="'.$tooltipPath.'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
							$tabCont .= '<span id="lreg_'.$imgid.'_'.$id.'_'. $value['dataset_id'].'"  data-whatever="lreg" class="showForm lregchart glyphicon glyphicon-pencil edit"></span><span id="lreg_'.$imgid.'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
							$tabCont .= '</div>';
							$tabCont .= '<div class="panel-body">'.file_get_contents($pathForHTml.$value['ImgName']);
							$tabCont .= '<textarea class="form-control json-data" id="lreg_img_'.$imgid.'" name="lreg_img_'.$imgid.'">'.json_encode($value).'</textarea></div></div>';
							$tabCont .= '<script>';
							$tabCont .= 'setTimeout(function(){';
							$tabCont .= 'window.HTMLWidgets.staticRender();';
							$tabCont .= ' }, 2000);';
							$tabCont .= 'setTimeout(function(){';
							$tabCont .= 'window.HTMLWidgets.staticRender();';
							$tabCont .= ' }, 2000);';
							$tabCont .= 'setTimeout(function(){';
							$tabCont .= 'window.HTMLWidgets.staticRender();';
							$tabCont .= ' }, 2000);';
							$tabCont .= 'setTimeout(function(){';
							$tabCont .= 'window.HTMLWidgets.staticRender();';
							$tabCont .= ' }, 2000);';
							$tabCont .= '</script>';
						endif;
					}
					// Correlation plot matrix
					elseif($value['ImgType'] == "cmatrixplot") {
						$tooltipPath = '/wiki/correlation-plot-matrix';
						$imgidarr = explode("_",$value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="cmatrix_li_'.$imgid.'"'.$liclass. '><a data-toggle="tab" title="Click" class="cmatrixplot" href="#cmatrix_'.$imgid.'">'.$title.'<i class="fa fa-arrows"></i></a></li>';
						if ($activeFlag == 1):
							$tabCont .= '<div id="cmatrix_'.$imgid.'" class="tab-pane fade'.$tabdivClass.' myTab panel panel-default"><div class="panel-heading">'.$title.'<a class="tooltipp" title="'.$tooltipTitle.'" target="_blank" href="'.$tooltipPath.'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
							$tabCont .= '<span id="cmatrix_'.$imgid.'_'.$id.'_'. $value['dataset_id'].'"  data-whatever="cmatrix" class="showForm cmatrixchart glyphicon glyphicon-pencil edit"></span><span id="cmatrix_'.$imgid.'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
							$tabCont .= '</div>';
							$tabCont .= '<div class="panel-body">'.file_get_contents($pathForHTml.$value['ImgName']);
							$tabCont .= '<textarea class="form-control json-data" id="cmatrix_img_'.$imgid.'" name="cmatrix_img_'.$imgid.'">'.json_encode($value).'</textarea></div></div>';
						endif;
					}
					elseif($value['ImgType'] == "barchart") {
						$tooltipPath = '/wiki/barchart';
						$imgidarr = explode("_",$value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="bar_li_'.$imgid.'"'.$liclass. '><a data-toggle="tab" title="Click" class="barplot" href="#bar_'.$imgid.'">'.$title.'<i class="fa fa-arrows"></i></a></li>';
						if ($activeFlag == 1):
							$tabCont .= '<div id="bar_'.$imgid.'" class="tab-pane fade'.$tabdivClass.' myTab panel panel-default"><div class="panel-heading">'.$title.'<a class="tooltipp" title="'.$tooltipTitle.'" target="_blank" href="'.$tooltipPath.'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
							$tabCont .= '<span id="barchart_'.$imgid.'_'.$id.'_'. $value['dataset_id'].'"  data-whatever="barchart" class="showForm barchart glyphicon glyphicon-pencil edit"></span><span id="bar_'.$imgid.'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
							$tabCont .= '</div>';
							$tabCont .= '<div class="panel-body">'.file_get_contents($pathForHTml.$value['ImgName']);
							$tabCont .= '<textarea class="form-control json-data" id="bar_img_'.$imgid.'" name="bar_img_'.$imgid.'">'.json_encode($value).'</textarea></div></div>';
						endif;
					}
					elseif($value['ImgType'] == "histogram") {
						$tooltipPath = '/wiki/histogram';
						$imgidarr = explode("_",$value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="histo_li_'.$imgid.'"'.$liclass. '><a data-toggle="tab" title="Click" class="histoplot" href="#histo_'.$imgid.'">'.$title.'<i class="fa fa-arrows"></i></a></li>';
						//if ($activeFlag == 1):
						//$tabCont .= '<div id="histo_'.$imgid.'" class="tab-pane fade'.$tabdivClass.' myTab panel panel-default"><div class="panel-heading">'.$title.'<a class="tooltipp" title="'.$tooltipTitle.'" target="_blank" href="'.$tooltipPath.'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
						$tabCont .= '<div id="histo_'.$imgid.'" class="myTab panel panel-default draggable-element"><div class="panel-heading">'.$title;
						$tabCont .= '<span id="histo_'.$imgid.'_rem" class="glyphicon glyphicon-remove-sign rem-chart" title="Remove"></span><span id="histogram_'.$imgid.'_'.$id.'_'. $value['dataset_id'].'"  data-whatever="Histogram" class="showForm histogram glyphicon glyphicon-edit edit" title="Edit"></span><span id="txt-minus-plus" class="glyphicon glyphicon-minus-sign" title="Minimize"></span><span class="glyphicon glyphicon-move" title="Move"></span>';
						$tabCont .= '</div>';
						$tabCont .= '<div class="panel-body">'.file_get_contents($pathForHTml.$value['ImgName']);
						$tabCont .= '<textarea class="form-control json-data" id="histo_img_'.$imgid.'" name="histo_img_'.$imgid.'">'.json_encode($value).'</textarea></div></div>';
						//	endif;
					}/////////////if for histogram
					elseif($value['ImgType'] == "geomap") {
						$tooltipPath = '/wiki/geo-map';
						$imgidarr = explode("_",$value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="geomap_li_' . $imgid . '"' . $liclass . '><a data-toggle="tab" title="Click" class="geo_map" href="#geomap_' . $imgid . '">' . $title . '<i class="fa fa-arrows"></i></a></li>';
						//if ($activeFlag == 1):
						$tabCont .= '<div id="geomap_' . $imgid . '"  class="tab-pane fade' . $tabdivClass . ' myTab panel panel-default"><div class="panel-heading">' . $title . '<a class="tooltipp" title="' . $tooltipTitle . '" target="_blank" href="' . $tooltipPath . '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
						$tabCont .= '<span id="geomap_' . $imgid . '_' . $id . '_'. $value['dataset_id'].'"  data-whatever="Geo Map" class="showForm geomap glyphicon glyphicon-pencil edit"></span><span id="geomap_' . $imgid . '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
						$tabCont .= '</div>';
						$tabCont .= '<div class="panel-body" style="height: 700px; margin:0; padding:0;"><div id="map_' . $imgid . '" style="height:97%; width:97%; margin:5px auto 5px auto;"></div>';
						$tabCont .= '<textarea class="form-control json-data" id="geomap_img_' . $imgid . '" name="geomap_img_' . $imgid . '">' . json_encode($value) . '</textarea></div></div>';
						$tabCont .= '<script>';
						$tabCont .= 'var srcURL = init_map("map_' . $imgid . '", ' . json_encode($value['markers']) . ');';
						$tabCont .= 'setTimeout(function(){';
						//$tabCont .= 'generate_map_img(srcURL, ' . $imgid . ', "' . $title . '");';
						$tabCont .= 'document.getElementById("geomap_' . $imgid . '").removeAttribute("style");';
						$tabCont .= ' }, 5000);';
						$tabCont .= '</script>';
						//endif
					}/////////////if for histogram
					// Scatter plot matrix
					elseif($value['ImgType'] == "spmatrixplot") {
						$tooltipPath = '/wiki/scatter-plot-matrix';
						$imgidarr = explode("_",$value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="spmatrix_li_'.$imgid.'"'.$liclass. '><a data-toggle="tab" title="Click" class="spmatrixplot" href="#spmatrix_'.$imgid.'">'.$title.'<i class="fa fa-arrows"></i></a></li>';
						if ($activeFlag == 1):
							$tabCont .= '<div id="spmatrix_'.$imgid.'" class="tab-pane fade'.$tabdivClass.' myTab panel panel-default"><div class="panel-heading">'.$title.'<a class="tooltipp" title="'.$tooltipTitle.'" target="_blank" href="'.$tooltipPath.'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
							$tabCont .= '<span id="spmatrix_'.$imgid.'_'.$id.'_'. $value['dataset_id'].'"  data-whatever="Spmatrix" class="showForm spmatrixchart glyphicon glyphicon-pencil edit"></span><span id="spmatrix_'.$imgid.'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
							$tabCont .= '</div>';
							$tabCont .= '<div class="panel-body">'.file_get_contents($pathForHTml.$value['ImgName']);
							$tabCont .= '<textarea class="form-control json-data" id="spmatrix_img_'.$imgid.'" name="spmatrix_img_'.$imgid.'">'.json_encode($value).'</textarea></div></div>';
						endif;
					}
					elseif($value['ImgType'] == "heatmapplot") {
						$tooltipPath = '/wiki/heatmapchart';
						$imgidarr = explode("_", $value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="heatmap_li_' . $imgid . '"' . $liclass . '><a data-toggle="tab" title="Click" class="heatmap" href="#heatmap_' . $imgid . '">' . $title . '<i class="fa fa-arrows"></i></a></li>';
						if ($activeFlag == 1):
							$tabCont .= '<div id="heatmap_' . $imgid . '" class="tab-pane fade' . $tabdivClass . ' myTab panel panel-default"><div class="panel-heading">' . $title . '<a class="tooltipp" title="' . $tooltipTitle . '" target="_blank" href="' . $tooltipPath . '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
							$tabCont .= '<span id="heatmap_' . $imgid . '_' . $id . '_' . $value['dataset_id'] . '"  data-whatever="heatmap" class="showForm heatmapchart glyphicon glyphicon-pencil edit"></span><span id="heatmap_' . $imgid . '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
							$tabCont .= '</div>';
							$tabCont .= '<div class="panel-body">' . file_get_contents($pathForHTml . $value['ImgName']);
							$tabCont .= '<textarea class="form-control json-data" id="heatmap_img_' . $imgid . '" name="heatmap_img_' . $imgid . '">' . json_encode($value) . '</textarea></div></div>';
						endif;
					}
					elseif($value['ImgType'] == "dtree") {
						$tooltipPath = '/wiki/dtree';
						$imgidarr = explode("_",$value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="dt_li_'.$imgid.'"'.$liclass. '><a data-toggle="tab" title="Click" class="dtree" href="#dt_'.$imgid.'">'.$title.'<i class="fa fa-arrows"></i></a></li>';
						if ($activeFlag == 1):
							$tabCont .= '<div id="dt_'.$imgid.'" class="tab-pane fade'.$tabdivClass.' myTab panel panel-default"><div class="panel-heading">'.$title.'<a class="tooltipp" title="'.$tooltipTitle.'" target="_blank" href="'.$tooltipPath.'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
							$tabCont .= '<span id="dtree_'.$imgid.'_'.$id.'_'. $value['dataset_id'].'"  data-whatever="dtree" class="showForm dtree glyphicon glyphicon-pencil edit"></span><span id="dtree_'.$imgid.'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
							$tabCont .= '</div>';
							$tabCont .= '<div class="panel-body"><img src="/sites/default/files/projectChartImages/'.$value['ImgName'].'">';
							$tabCont .= '<textarea class="form-control json-data" id="dt_img_'.$imgid.'" name="dt_img_'.$imgid.'">'.json_encode($value).'</textarea></div></div>';
						endif;
					}
					elseif ($value['ImgType'] == "surfaceplot") {
						$tooltipPath = '/wiki/surface-chart';
						$imgidarr = explode("_", $value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="surface_li_' . $imgid . '"' . $liclass . '><a data-toggle="tab" title="Click" class="surfaceplot" href="#surface_' . $imgid . '">' . $title . '<i class="fa fa-arrows"></i></a></li>';
						if ($activeFlag == 1):
							$tabCont .= '<div id="surface_' . $imgid . '" class="tab-pane fade' . $tabdivClass . ' myTab panel panel-default"><div class="panel-heading">' . $title . '<a class="tooltipp" title="' . $tooltipTitle . '" target="_blank" href="' . $tooltipPath . '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
							$tabCont .= '<span id="surfacechart_' . $imgid . '_' . $id . '_'. $value['dataset_id'].'"  data-whatever="Surface Chart" class="showForm surfacechart glyphicon glyphicon-pencil edit"></span><span id="surface_' . $imgid . '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
							$tabCont .= '</div>';
							$tabCont .= '<div class="panel-body">' . file_get_contents($pathForHTml . $value['ImgName']);
							$tabCont .= '<textarea class="form-control json-data" id="surface_img_' . $imgid . '" name="surface_img_' . $imgid . '">' . json_encode($value) . '</textarea></div></div>';
						endif;
					}/////// if for surface chart
					elseif ($value['ImgType'] == "bubbleplot") {
						$tooltipPath = '/wiki/bubble-chart';
						$imgidarr = explode("_", $value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="bubble_li_' . $imgid . '"' . $liclass . '><a data-toggle="tab" title="Click" class="bubbleplot" href="#bubble_' . $imgid . '">' . $title . '<i class="fa fa-arrows"></i></a></li>';
						//if ($activeFlag == 1):
						//$tabCont .= '<div id="bubble_' . $imgid . '" class="tab-pane fade' . $tabdivClass . ' myTab panel panel-default"><div class="panel-heading">' . $title . '<a class="tooltipp" title="' . $tooltipTitle . '" target="_blank" href="' . $tooltipPath . '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
						$tabCont .= '<div id="bubble_' . $imgid . '" class="myTab panel panel-default draggable-element"><div class="panel-heading">' . $title;
						$tabCont .= '<span id="bubble_' . $imgid . '_rem" class="glyphicon glyphicon-remove-sign rem-chart" title="Remove"></span><span id="bubblechart_' . $imgid . '_' . $id .'_'. $value['dataset_id'].'"  data-whatever="Bubble Chart" class="showForm bubblechart glyphicon glyphicon-edit edit" title="Edit"></span><span id="txt-minus-plus" class="glyphicon glyphicon-minus-sign" title="Minimize"></span><span class="glyphicon glyphicon-move" title="Move"></span>';
						$tabCont .= '</div>';
						$tabCont .= '<div class="panel-body">' . file_get_contents($pathForHTml . $value['ImgName']);
						$tabCont .= '<textarea class="form-control json-data" id="bubble_img_' . $imgid . '" name="bubble_img_' . $imgid . '">' . json_encode($value) . '</textarea></div></div>';
						//endif;
					}/////////////////if for bubble plot
					elseif ($value['ImgType'] == "crosstabs") {
						$tooltipPath = '/wiki/cross-tabs';
						$imgidarr = explode("_", $value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="cross_li_'.$imgid.'"'.$liclass.'><a data-toggle="tab" title="Click" class="crossplot" href="#cross_'.$imgid.'">'.$title.'<i class="fa fa-arrows"></i></a></li>';
						if ($activeFlag == 1):
							$tabCont .= '<div id="cross_'.$imgid.'" class="tab-pane fade'.$tabdivClass.' myTab panel panel-default"><div class="panel-heading">'.$title.'<a class="tooltipp" title="'.$tooltipTitle.'" target="_blank" href="'.$tooltipPath.'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
							$tabCont .= '<span id="crosstabs_'.$imgid.'_'. $id .'_'. $value['dataset_id'].'"  data-whatever="Cross Tabs" class="showForm crosstabs glyphicon glyphicon-pencil edit"></span><span id="cross_'.$imgid.'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
							$tabCont .= '</div>';
							$tabCont .= '<div class="panel-body">'.file_get_contents($pathForHTml.$value['ImgName']);
							$tabCont .= '<textarea class="form-control json-data" id="cross_img_' . $imgid . '" name="cross_img_' . $imgid . '">' . json_encode($value) . '</textarea></div></div>';
						endif;
					}/////////////////if for csorr tabs
					elseif ($value['ImgType'] == "piechart") {
						$tooltipPath = '/wiki/pie-chart';
						$imgidarr = explode("_",$value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="pie_li_'.$imgid.'"'.$liclass.'><a data-toggle="tab" title="Click" class="pieplot" href="#pie_'.$imgid.'">'.$title.'<i class="fa fa-arrows"></i></a></li>';
						if ($activeFlag == 1):
							$tabCont .= '<div id="pie_'.$imgid.'" class="tab-pane fade'.$tabdivClass.' myTab panel panel-default"><div class="panel-heading">'.$title.'<a class="tooltipp" title="'.$tooltipTitle.'" target="_blank" href="'.$tooltipPath.'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
							$tabCont .= '<span id="piechart_'.$imgid.'_'.$id.'_'. $value['dataset_id'].'" data-whatever="Pie Chart" class="showForm piechart glyphicon glyphicon-pencil edit"></span><span id="pie_'.$imgid.'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
							$tabCont .= '</div>';
							$tabCont .= '<div class="panel-body">'.file_get_contents($pathForHTml.$value['ImgName']);
							$tabCont .= '<textarea class="form-control json-data" id="pie_img_'.$imgid.'" name="pie_img_'.$imgid.'">'.json_encode($value).'</textarea></div></div>';
						endif;
					}/////////////////if for pie chart
					elseif ($value['ImgType'] == "shtml") {
						$tooltipPath = '/wiki/narrative-text';
						$imgidarr = explode("_",$value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="shtml_li_'.$imgid.'"'.$liclass.'><a data-toggle="tab" title="Click" class="narrative_text" href="#shtml_'.$imgid.'">'.$title.'<i class="fa fa-arrows"></i></a></li>';
						$tabCont .= '<div id="shtml_'.$imgid.'" class="tab-pane fade'.$tabdivClass.' myTab panel panel-default"><div class="panel-heading">'.$title.'<a class="tooltipp" title="'.$tooltipTitle.'" target="_blank" href="'.$tooltipPath.'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
						$tabCont .= '<span id="shtml_'.$imgid.'_'.$id.'" data-whatever="Narrative Text" class="showForm narrativetext glyphicon glyphicon-pencil edit"></span><span id="shtml_'.$imgid.'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
						$tabCont .= '</div>';
						$tabCont .= '<div class="panel-body">'.$value['data'][0]['htmlData'];
						$tabCont .= '<textarea class="form-control json-data" id="shtml_img_'.$imgid.'" name="shtml_img_'.$imgid.'">'.json_encode($value).'</textarea></div></div>';
					}/////////////////if for narrative text
					elseif ($value['ImgType'] == "wordcloud") {
						$tooltipPath = '/wiki/word-cloud';
						$imgidarr = explode("_",$value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="wcloud_li_'.$imgid.'"'.$liclass.'><a data-toggle="tab" title="Click" class="word_cloud" href="#wcloud_'.$imgid.'">'.$title.'<i class="fa fa-arrows"></i></a></li>';
						if ($activeFlag == 1):
							$tabCont .= '<div id="wcloud_'.$imgid.'" class="tab-pane fade'.$tabdivClass.' myTab panel panel-default"><div class="panel-heading">'.$title.'<a class="tooltipp" title="'.$tooltipTitle.'" target="_blank" href="'.$tooltipPath.'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
							$tabCont .= '<span id="wcloud_'.$imgid.'_'.$id.'_'. $value['dataset_id'].'"  data-whatever="Word Cloud" class="showForm wordcloud glyphicon glyphicon-pencil edit"></span><span id="wcloud_'.$imgid.'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
							$tabCont .= '</div>';
							$tabCont .= '<div class="panel-body"><img src="/sites/default/files/projectChartImages/'.$value['ImgName'].'">';
							$tabCont .= '<textarea class="form-control json-data" id="wcloud_img_'.$imgid.'" name="wcloud_img_'.$imgid.'">'.json_encode($value).'</textarea></div></div>';
						endif;
					}/////////////////if for wordclous
					elseif ($value['ImgType'] == "donutchart") {
						$tooltipPath = '/wiki/donut-chart';
						$imgidarr = explode("_",$value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="donutchart_li_'.$imgid.'"'.$liclass.'><a data-toggle="tab" title="Click" class="donut_chart" href="#donutchart_'.$imgid.'">'.$title.'<i class="fa fa-arrows"></i></a></li>';
						if ($activeFlag == 1):
							$tabCont .= '<div id="donutchart_'.$imgid.'" class="tab-pane fade'.$tabdivClass.' myTab panel panel-default"><div class="panel-heading">'.$title.'<a class="tooltipp" title="'.$tooltipTitle.'" target="_blank" href="'.$tooltipPath.'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
							$tabCont .= '<span id="donutchart_'.$imgid.'_'.$id.'_'. $value['dataset_id'].'"data-whatever="Donut Chart" class="showForm donutchart glyphicon glyphicon-pencil edit"></span><span id="donutchart_'.$imgid.'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
							$tabCont .= '</div>';
							$tabCont .= '<div class="panel-body">' . file_get_contents($pathForHTml . $value['ImgName']);
							$tabCont .= '<textarea class="form-control json-data" id="donutchart_img_'.$imgid.'" name="donutchart_img_'.$imgid.'">'.json_encode($value).'</textarea></div></div>';
						endif;
					}/////////////////if for donut chart
					elseif($value['ImgType'] == "biplot") {
						$tooltipPath = '/wiki/bi-plot';
						$imgidarr = explode("_",$value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="bi_li_'.$imgid.'"'.$liclass. '><a data-toggle="tab" title="Click" class="biplot" href="#bi_'.$imgid.'">'.$title.'<i class="fa fa-arrows"></i></a></li>';
						if ($activeFlag == 1):
							$tabCont .= '<div id="bi_'.$imgid.'" class="tab-pane fade'.$tabdivClass.' myTab panel panel-default"><div class="panel-heading">'.$title.'<a class="tooltipp" title="'.$tooltipTitle.'" target="_blank" href="'.$tooltipPath.'"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
							$tabCont .= '<span id="biplot_'.$imgid.'_'.$id.'_'. $value['dataset_id'].'"  data-whatever="biplot" class="showForm biplot glyphicon glyphicon-pencil edit"></span><span id="box_'.$imgid.'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
							$tabCont .= '</div>';
							$tabCont .= '<div class="panel-body">'.file_get_contents($pathForHTml.$value['ImgName']);
							$tabCont .= '<textarea class="form-control json-data" id="bi_img_'.$imgid.'" name="bi_img_'.$imgid.'">'.json_encode($value).'</textarea></div></div>';
						endif;
					}
					elseif($value['ImgType'] == "trendplot") {
						$tooltipPath = '/wiki/trend-plot';
						$imgidarr = explode("_",$value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="trendplot_li_' . $imgid . '"' . $liclass . '><a data-toggle="tab" title="Click" class="trendchart" href="#trendplot_' . $imgid . '">' . $title . '<i class="fa fa-arrows"></i></a></li>';
						if ($activeFlag == 1):
							$tabCont .= '<div id="trendplot_' . $imgid . '" class="tab-pane fade' . $tabdivClass . ' myTab panel panel-default"><div class="panel-heading">' . $title . '<a class="tooltipp" title="' . $tooltipTitle . '" target="_blank" href="' . $tooltipPath . '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
							$tabCont .= '<span id="trendplot_' . $imgid . '_' . $id.'_'. $value['dataset_id']. '"  data-whatever="Trend Plot" class="showForm trendplot glyphicon glyphicon-pencil edit"></span><span id="trendplot_' . $imgid . '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
							$tabCont .= '</div>';
							$tabCont .= '<div class="panel-body">'.file_get_contents($pathForHTml.$value['ImgName']);
							$tabCont .= '<textarea class="form-control json-data" id="trendplot_img_' . $imgid . '" name="trendplot_img_' . $imgid . '">' . json_encode($value) . '</textarea></div></div>';
						endif;
					}
					elseif($value['ImgType'] == "rankingplot") {
						$tooltipPath = '/wiki/ranking-plot';
						$imgidarr = explode("_",$value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="rankingplot_li_' . $imgid . '"' . $liclass . '><a data-toggle="tab" title="Click" class="rankingchart" href="#rankingplot_' . $imgid . '">' . $title . '<i class="fa fa-arrows"></i></a></li>';
						if ($activeFlag == 1):
							$tabCont .= '<div id="rankingplot_' . $imgid . '" class="tab-pane fade' . $tabdivClass . ' myTab panel panel-default"><div class="panel-heading">' . $title . '<a class="tooltipp" title="' . $tooltipTitle . '" target="_blank" href="' . $tooltipPath . '"><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>';
							$tabCont .= '<span id="rankingplot_' . $imgid . '_' . $id . '_'. $value['dataset_id'].'"  data-whatever="Ranking Plot" class="showForm rankingplot glyphicon glyphicon-pencil edit"></span><span id="rankingplot_' . $imgid . '_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
							$tabCont .= '</div>';
							$tabCont .= '<div class="panel-body">'.file_get_contents($pathForHTml.$value['ImgName']);
							$tabCont .= '<textarea class="form-control json-data" id="rankingplot_img_' . $imgid . '" name="rankingplot_img_' . $imgid . '">' . json_encode($value) . '</textarea></div></div>';
						endif;
					}
					elseif($value['ImgType'] == "textcluster") {
						$tooltipPath = '/wiki/topic-based-text-clustering';
						$imgidarr = explode("_",$value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="tcluster_li_' . $imgid . '"><a title="Click" class="cluster_analysis" href="#tcluster_' . $imgid . '">' . $title . '<i class="fa fa-arrows"></i></a></li>';
            //if ($activeFlag == 1):
            $clusterjsonText = file_get_contents($pathForHTml . $value['ImgName']);
							$clusterdecodedText = json_decode($clusterjsonText, TRUE);
							$dataArr = json_encode($clusterdecodedText['dataArr']);
							$cluster_json = json_encode($clusterdecodedText['cluster_json_Arr']);
							$tjson[$activeFlag]['json_data'] = $clusterdecodedText['cluster_json_Arr'];
							$tjson[$activeFlag]['div_id'] = 'tcluster_pbody_' . $imgid;
							$tjson[$activeFlag]['img_num'] = $imgid;

							$tabCont .= '<div id="tcluster_' . $imgid . '" class="myTab panel panel-default draggable-element"><div class="panel-heading">' . $title;
							$tabCont .= '<span id="tcluster_' . $imgid . '_rem" class="glyphicon glyphicon-remove-sign rem-chart" title="Remove"></span><span id="tcluster_' . $imgid . '_' . $id . '_'. $value['dataset_id'].'"  data-whatever="Topic Based Text Clustering" class="showForm clusteranalysis glyphicon glyphicon-edit edit" title="Edit"></span><span id="txt-minus-plus" class="glyphicon glyphicon-minus-sign" title="Minimize"></span><span class="glyphicon glyphicon-move" title="Move"></span>';
							$tabCont .= '</div>';
							$tabCont .= '<div class="panel-body"><div id="tcluster_pbody_' . $imgid . '" style="height:480px; min-width:100%;"></div>';
							$tabCont .= '<div class="refined-topscroll"><div class="scroll-div">&nbsp;</div></div>';
							$tabCont .= '<div id="refinedResults_' . $imgid . '" class="refinedResults"></div><div class="cluster-json">';
							$tabCont .= '<textarea class="form-control json-data" id="tcluster_img_' . $imgid . '" name="tcluster_img_' . $imgid . '">' . json_encode($value) . '</textarea></div>';
							$tabCont .= '</div><textarea style="display:none;" id="listingsclusterJson_' . $imgid . '" class="form-control" name="listingsclusterJson_' . $imgid . '">' . $dataArr . '</textarea></div>';
							$textclusterdoc[] = array(
									"containerID" => "tcluster_pbody_" . $imgid,
									"JsonString" => $cluster_json
							);
            //endif;
					}
					elseif($value['ImgType'] == "compare") {
						$imgidarr = explode("_",$value['ImgID']);
						$imgid = end($imgidarr);
						$tabs .= '<li id="compare_li_'.$imgid.'"'.$liclass.'><a data-toggle="tab" title="Click" class="comparechart" href="#compare_'.$imgid.'">'.$title.'<i class="fa fa-arrows"></i></a></li>';

						$tabCont .= '<div id="compare_'.$imgid.'" class="tab-pane fade'.$tabdivClass.' myTab panel panel-default"><div class="panel-heading">'.$title;
						$tabCont .= '<span id="compare_'. $imgid . '_' . $id .'" class="glyphicon glyphicon-pencil comp_edit edit"></span><span id="compare_'.$imgid.'_rem" class="glyphicon glyphicon-trash rem-chart"></span>';
						$tabCont .= '</div>';
						$imgNameArr = explode(",", $value['ImgName']);
						$chartsNameArr = explode(",", $value['ChartName']);
						$imgName = explode('_',$imgNameArr);

						$tabCont .= '<div class="panel-body">';
						foreach($imgNameArr as $index=>$val1) {
							$explodeVal1 = explode('_', $val1);
						}
						/*if ($explodeVal1[0] == "biplot") {
              $tabCont .= '<div class="compare-body bi_compare">';
            }
            else {*/
						$tabCont .= '<div class="compare-body">';
						//}

						$divPos = 0;
						$compareID = 'compare_'.$imgid;
						foreach($imgNameArr as $index=>$val) {
							$explodeVal = explode('_', $val);
							//echo $explodeVal[0].'--';
							if (in_array($explodeVal[0], $plotlychartArr)) {
								//echo "in first if";
								$chartHTML = file_get_contents($pathForHTml.$val);
								$numID = $this->extract_string($chartHTML, 'id="htmlwidget-', '" class="plotly');
								//$numID = '1';
								$generated_id = uniqid();
								$newHTML = str_replace($numID, $generated_id, $chartHTML);
								$tabCont .= '<div id="compare_' . $imgid . '_subdiv_' . $divPos . '" class="col-md-6 form-group" style="height:520px;">';
								$tabCont .= '<div>'.$chartsNameArr[$index].'</div>';
								$tabCont .= $newHTML;
								$tabCont .= '</div>';
							}
							elseif ($explodeVal[0] == "tcluster") {
								$clusterjsonText = file_get_contents($pathForHTml.$val);
								$clusterdecodedText = json_decode($clusterjsonText, true);
								$cluster_json = json_encode($clusterdecodedText['cluster_json_Arr']);
								$tjson_data = $clusterdecodedText['cluster_json_Arr'];
								$tjson_divid= 'tcluster_pbody_' . $imgid;

								$tabCont .= '<div id="compare_' . $imgid . '_subdiv_' . $divPos . '" class="col-md-6 form-group" style="height:520px; display:block;"></div>';
								$divID = 'compare_' . $imgid . '_subdiv_' . $divPos;
								$textclusterdoc[] = array("containerID" => $divID , "JsonString" => $cluster_json, "compareID" => $compareID);
							}
							else {
								$tabCont .= '<div id="compare_' . $imgid . '_subdiv_' . $divPos . '" class="col-md-6 form-group"><img src="/sites/default/files/projectChartImages/'.$val.'"></div>';
							}
							$tabCont .= '<script>';
							$tabCont .= 'setTimeout(function(){';
							$tabCont .= 'window.HTMLWidgets.staticRender();';
							$tabCont .= ' }, 2000);';
							/*$tabCont .= ' if ($("#htmlwidget_container").hasClass("bi_plot")) {';
              $tabCont .= '$(this).closest(".compare-body").addClass("bi_compare");';
              $tabCont .= '}';*/
							$tabCont .= '</script>';
							$divPos++;
						}
						$tabCont .= '<textarea class="form-control json-data" id="compare_img_'.$imgid.'" name="compare_img_'.$imgid.'">'.json_encode($value).'</textarea></div></div></div>';
						$compare_sec_num = $imgid;
					}/////////////////if for compare chart
				endforeach;
			}///////2nd if for result
			else {
				$tabs= "<div id='no_chart_msg'>No chart generated yet.</div>";
				$response['nocharts'] = $tabs;
				return new JsonResponse($response);
			}
			//echo "<pre>";
			//print_r($tabCont); exit();
			$response['tabs'] = $tabs;
			$response['tabs_cont'] = $tabCont;
			$response['tcluster_json'] = $tjson;
			$response['all_charts'] =  $resultJson;
			return new JsonResponse($response);
		}
		else {
			return [];
		}//////first if for id
	}
  public function checkGroupState(){
	$nidsarr = array();
	$nids = \Drupal::entityQuery('node')
		->condition('type', 'process')
		->condition('status', '1')
		->execute();
	if ($nids) {
	  $state ='';
	  foreach($nids as $nid) {
		$item = node_load($nid);
		$title = $item->getTitle();
		if (($item instanceof EntityOwnerInterface) && ($item->getOwnerId() == \Drupal::currentUser()->id())) {
		  $state = "owner";
		}
		else if (Og::isMember($item, \Drupal\user\Entity\User::load(\Drupal::currentUser()->id()))) {
		  $state = 'unsubscribe';
		}
		else {
		  $state = 'sunsucribe';
		}
		$nidsarr[] = $nid.'||'.$title.'||'.$state;
	  }
	}
	$response = $nidsarr;
	return new JsonResponse($response);
  }
}