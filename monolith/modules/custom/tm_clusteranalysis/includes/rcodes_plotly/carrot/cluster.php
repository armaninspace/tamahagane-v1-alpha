<?php
error_reporting(E_ALL);
ini_set('display_errors','On');

require_once('carrot2.php');
//$args = $argv[1];
$args = $_REQUEST['chart_data'];


$invoirmentVars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
$exeCommand = "Rscript cluster.R ".base64_encode($args);



$dataStr = exec($invoirmentVars . $exeCommand);

$dataStr = str_replace('\n', "", $dataStr);
$dataStr = str_replace("\n\r", " ", $dataStr);
$dataStr = str_replace('\\', "", $dataStr);
$dataStr = str_replace("[1] ", "", $dataStr);
$dataStr = trim($dataStr, '"');


if($dataStr == "empty" || $dataStr==""){
    echo "empty";
    exit();
}



$data = json_decode($dataStr,true);



$dataSet = $data['dataset'];
$colsArr = $data['cols'];


$listing = array();

foreach ($dataSet as $colName => $colData) {
    $rowcount = 0;
    foreach ($colData as $val) { 
        $listing[$rowcount][$colName] = $val;
        $rowcount++;
    
    }

}

if(!empty($listing)){

$processor = new Carrot2Processor("http://localhost:8080/dcs/rest");
$job = new Carrot2Job();
$algorithm = "lingo";

foreach($listing as $doc)
{
  $tXt = '';
  if(is_array($colsArr[0])){
    foreach ($colsArr[0] as $value) {
     $tXt .= $doc[$value] . " ";
   
   }
  }
  else{
    $tXt = $doc[$colsArr[0]];
  }
  
    $job->addDocument(trim($tXt));
}


function displayCluster(Carrot2Cluster $cluster, &$d3_json_array) {
        
        $temp = array();
        if(preg_match('/(Other Topics)/i', $cluster->getLabel())){
          return;
        }
        $temp['name'] = $cluster->getLabel();
        $temp['size'] = $cluster->size();
        $temp['ids'] = $cluster->getDocumentIds();
          
        if (count($cluster->getSubclusters()) > 0) {
          $temp['subclusters'] = $cluster->getSubclusters();
          foreach ($cluster->getSubclusters() as $subcluster) {
            displayCluster($subcluster);
          }
        }else{
          $temp['subclusters'] = 0;
        }
        $d3_json_array[] = $temp;           
      }       
      $job->setAlgorithm($algorithm);
      
      //$job->setQuery("data mining"); // set the query as a hint for the clustering algorithm (optional)
      $job->setAttributes(array (
      /*  'TermDocumentMatrixBuilder.termWeighting' => 'org.carrot2.text.vsm.LinearTfIdfTermWeighting',
          'dcs.output.format' => 'JSON', "LingoClusteringAlgorithm.desiredClusterCountBase"=>$num_clusters*/
        'LingoClusteringAlgorithm.desiredClusterCountBase' => 30, 
        'dcs.output.format' => 'JSON', 
        'TermDocumentMatrixBuilder.termWeighting' => 'org.carrot2.text.vsm.LogTfIdfTermWeighting',
        'TermDocumentMatrixReducer.factorizationFactory' => 'org.carrot2.matrix.factorization.PartialSingularValueDecompositionFactory',
        'DocumentAssigner.minClusterSize' => '2',
        'CaseNormalizer.dfThreshold' => '1',
      ));
        
      $result = $processor->cluster($job);                
      $clusters = $result->getClusters();       
      $d3_json_array = array();     
      if (count($clusters) > 0){        
        foreach ($clusters as $cluster){
          displayCluster($cluster, $d3_json_array);
        }
      }
      $d3_json = array();
      foreach($d3_json_array as $cluster){
        $d3_json[] = array("label" => $cluster['name'], "weight" => $cluster['size'], "ids" => $cluster['ids']);
      } 

      
      $alerts['dataArr'] = $listing;
      $alerts['cluster_json_Arr'] = $d3_json;
      
      $compData = json_encode($alerts);
      
      $jsonDecode = json_decode($args);
      $txtFilePath = $jsonDecode->img_path;
      if(!empty($d3_json)){
        $file = fopen($txtFilePath, 'w');
        fwrite($file, $compData);
        fclose($file);
        echo $compData;
        exit();
      }
      else{
        echo "fail";
        exit();
      }
}
else{
    echo "fail";
    exit();
}

/********************************
exit();
$docsArr = explode("|||", $data);
array_pop($docsArr);
$processor = new Carrot2Processor();
$job = new Carrot2Job();
$algorithm = "lingo";

foreach($docsArr as $doc)
{
	//echo $txt . "<br>";
	$job->addDocument($doc);
}

function displayCluster(Carrot2Cluster $cluster, &$d3_json_array) {
        
        $temp = array();
        if(preg_match('/(Other Topics)/i', $cluster->getLabel())){
          return;
        }
        $temp['name'] = $cluster->getLabel();
        $temp['size'] = $cluster->size();
        $temp['ids'] = $cluster->getDocumentIds();
          
        if (count($cluster->getSubclusters()) > 0) {
          $temp['subclusters'] = $cluster->getSubclusters();
          foreach ($cluster->getSubclusters() as $subcluster) {
            displayCluster($subcluster);
          }
        }else{
          $temp['subclusters'] = 0;
        }
        $d3_json_array[] = $temp;           
      }       
      $job->setAlgorithm($algorithm);
      
      //$job->setQuery("data mining"); // set the query as a hint for the clustering algorithm (optional)
      $job->setAttributes(array (
      /*  'TermDocumentMatrixBuilder.termWeighting' => 'org.carrot2.text.vsm.LinearTfIdfTermWeighting',
          'dcs.output.format' => 'JSON', "LingoClusteringAlgorithm.desiredClusterCountBase"=>$num_clusters*/
        /*'LingoClusteringAlgorithm.desiredClusterCountBase' => 30, 
        'dcs.output.format' => 'JSON', 
        'TermDocumentMatrixBuilder.termWeighting' => 'org.carrot2.text.vsm.LogTfIdfTermWeighting',
        'TermDocumentMatrixReducer.factorizationFactory' => 'org.carrot2.matrix.factorization.PartialSingularValueDecompositionFactory',
        'DocumentAssigner.minClusterSize' => '2',
        'CaseNormalizer.dfThreshold' => '1',
      ));
        
      $result = $processor->cluster($job);  
                  
      $clusters = $result->getClusters(); 
              
      $d3_json_array = array();     
      if (count($clusters) > 0){        
        foreach ($clusters as $cluster){
          displayCluster($cluster, $d3_json_array);
        }
      }
      $d3_json = array();
      foreach($d3_json_array as $cluster){
        $d3_json[] = array("label" => $cluster['name'], "weight" => $cluster['size'], "ids" => $cluster['ids']);
      } 

$jsonData =  json_encode($d3_json);

/***********************************
$jsonDecode = json_decode($args);
$txtFilePath = $jsonDecode->img_path;
if(!empty($d3_json)){
    $file = fopen($txtFilePath, 'w');
    fwrite($file, $jsonData);
    fclose($file);
    echo $jsonData;
    exit();
}
else{
    echo "fail";
    exit();
}

*/