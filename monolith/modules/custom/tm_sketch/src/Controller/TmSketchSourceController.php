<?php

namespace Drupal\tm_sketch\Controller;
use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
/**
 * Class TmSketchSourceController.
 *
 * @package Drupal\tm_sketch\Controller
 */
class TmSketchSourceController extends ControllerBase {
  /**
   * Tmsketchreadsource.
   *
   * @return string
   *   Return file string.
   */
  public function TmSketchReadSource() {
      if ($_SERVER['REQUEST_METHOD'] != 'POST') {
          return false;
      }
      $filename = $_POST['filename'];
      $hiddenId = $_POST['hiddenId'];
      $source_type = $_POST['sourceType'];
      $result = '';
      $outputFile = "sites/default/files/operator_files/".$hiddenId."_out.csv";
      if ($source_type == 'internal') {
          $SourceFile = "sites/default/files/".$filename;
            //shell_exec("cp -r $SourceFile $outputFile");
                //return new JsonResponse($hiddenId."_out.csv");
          if (!copy($SourceFile, $outputFile)) {
               return new JsonResponse("Failed to copy.");
           }else{
               return new JsonResponse($hiddenId."_out.csv");
           }

      }
      else if ($source_type == 'external') {
          $createdClassifierFile2 = $hiddenId."_out.csv";
          $droot = \Drupal::root();
          $droot = str_replace("\\", "/", $droot);
          $outputFile =  $droot."/sites/default/files/operator_files/".$createdClassifierFile2;
          $rdir = $droot . "/sites/default/files/rcode";
          $jsonn= '{
                 "fileurl": "'.$filename.'",
	             "outpath ": "'.$outputFile.'"
             }';
          $exe_command = "cd $rdir && Rscript readSource.R ".base64_encode($jsonn);
          $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
          $res = exec($invoirment_vars . $exe_command);
          if ($res == '["url not found"]' || $res == '["csv not found"]') {
              return new JsonResponse("File is not created");
          }
          else {
              return new JsonResponse($hiddenId."_out.csv");
          }
      }
  }

  public function TmSketchReadCols() {
    $file_path = $_REQUEST['file_path'];
    $droot = \Drupal::root();
    $droot = str_replace("\\", "/", $droot);
    $path_to_module = drupal_get_path('module', 'tm_analytics');
    $rdir = $droot . "/" . $path_to_module . "/includes/rcode";
    $exe_command = "cd $rdir && Rscript colnames.R $file_path";
    $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
    $res = exec($invoirment_vars . $exe_command);
    $res = str_replace("[1] \"", "", $res);
    $all_fields = explode("|", $res);
    array_pop($all_fields);
    return new JsonResponse($all_fields);
  }
  /**
   * Tmsketchmultifilter.
   *
   * @return string
   *   Return filtered file.
   */
  public function TmSketchMultiFilter() {
    if ($_SERVER['REQUEST_METHOD'] != 'POST') {
      return false;
    }
    $filter_data = $_POST["fiters_json"];
    $drupal_root = \Drupal::root();
    $drupal_root = str_replace("\\", "/", $drupal_root);
    $rdir = $drupal_root . "/sites/default/files/rcode";
    $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
    //$invoirment_vars = 'export R_LIBS="/home/khurram/R/x86_64-pc-linux-gnu-library/3.3"; export R_LIBS_USER="/home/khurram/R/x86_64-pc-linux-gnu-library/3.3"; export PATH=$PATH:/usr/bin/;';
    $exe_command = "cd $rdir && Rscript multiFiltering.R ".base64_encode($filter_data);
    exec($invoirment_vars . $exe_command, $output, $result);
    if (!$result) {
      return new JsonResponse('file created');
    }
    else {
      return new JsonResponse("File is not created.");
    }
  }
    /**
     * Tmsketchsorting.
     *
     * @return string
     *   Return filtered file.
     */
  public function TmSketchSorting() {
      $sort_json = $_POST["sort_json"];
      $drupal_root = \Drupal::root();
      $drupal_root = str_replace("\\", "/", $drupal_root);
      $rdir = $drupal_root . "/sites/default/files/rcode";
      $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
      $exe_command = "cd $rdir && Rscript sorting.R ".base64_encode($sort_json);
      exec($invoirment_vars . $exe_command, $output, $result);
      if (!$result) {
          return new JsonResponse('File Created');
      }
      else {
          return new JsonResponse("File is not created.");
      }
  }
    /**
     * Tmsketchjoins.
     *
     * @return string
     *   Return join file.
     */
    public function TmSketchJoins() {

        $join_json = $_POST["join_json"];
        $drupal_root = \Drupal::root();
        $drupal_root = str_replace("\\", "/", $drupal_root);
        $rdir = $drupal_root . "/sites/default/files/rcode";
        $exe_command = "cd $rdir && Rscript joins.R ".base64_encode($join_json);
        $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
        $res = exec($invoirment_vars . $exe_command);
        if ($res == '["File Created"]') {
            return new JsonResponse('file created');
        }
        else {
            return new JsonResponse("File is not created.");
        }
    }
    /**
     * tmsketchcat
     */
    public function TmSketchCat() {

        $cat_json = $_POST["cat_json"];
        $drupal_root = \Drupal::root();
        $drupal_root = str_replace("\\", "/", $drupal_root);
        $rdir = $drupal_root . "/sites/default/files/rcode";
        $exe_command = "cd $rdir && Rscript merge.R ".base64_encode($cat_json);
        $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
        $res = exec($invoirment_vars . $exe_command);
        if ($res == '["File Created"]') {
            return new JsonResponse('file created');
        } else if ($res == '["CSV not matched"]'){
            return new JsonResponse('csvs not matched');
        }
        else {
            return new JsonResponse("File is not created.");
        }
    }
  /**
   * tmsketchgroupby
   */
  public function TmSketchGroupBy() {
	$groupby_json = $_POST["groupby_json"];
	$drupal_root = \Drupal::root();
	$drupal_root = str_replace("\\", "/", $drupal_root);
	$rdir = $drupal_root . "/sites/default/files/rcode";
	$exe_command = "cd $rdir && Rscript groupBy.R ".base64_encode($groupby_json);
	$invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
	$res = exec($invoirment_vars . $exe_command);
      if ($res == '["File Created"]') {
	  return new JsonResponse('file created');
	}
    else {
	  return new JsonResponse("File is not created.");
	}

  }	
  /**
  * Tmsketchsave.
  *
  *   Save sketch node.
  */
  public function TmSketchSave() {
    $sketch_nid = $_REQUEST['sketch_nid'];
    $jsonSave = $_REQUEST['jsonSave'];
    $node_update = \Drupal\node\Entity\Node::load($sketch_nid);
    $node_update->set('field_graph', $jsonSave);
    $node_update->save();
    return new JsonResponse('/node/'.$sketch_nid);
  }
  public function TmSketchClassifierOp() {
    $file_path = $_REQUEST['file_path'];
    $col_name = $_REQUEST['col_name'];
    $hiddenId = $_POST['hiddenId'];
    $col_id = $_POST['col_id'];
    $droot = \Drupal::root();
    $droot = str_replace("\\", "/", $droot);
    $fpathh =  $droot."/sites/default/files/operator_files/".$file_path;
    $rdir = $droot . "/sites/default/files/rcode";
    $jsonn= '{
                 "dataset": "'.$fpathh.'",
	             "columNames ": "'.$col_name.'"
             }';
     $exe_command = "cd $rdir && Rscript classifierOp.R ".base64_encode($jsonn);
     $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';

     $res =  exec($invoirment_vars . $exe_command);
     $res = str_replace("[1] ", "", $res);
     $res = str_replace('\n', "", $res);
     $res = str_replace('\\', "", $res);
     $res = trim($res, '"');
     $res = json_decode($res, TRUE);
     $createdClassifierFile2 = $hiddenId."_out.csv";
     $createdClassifierFile =  $droot."/sites/default/files/operator_files/".$createdClassifierFile2;
      if (!$input = fopen($fpathh, 'r')) {
          die('could not open existing csv file');
      }
      if (!$output = fopen($createdClassifierFile, 'w')) {
          die('could not open temporary output file');
      }
      $rowid = 0;
      $conter = 0;
      while (($data = fgetcsv($input)) !== FALSE) {
          if ($rowid > 0) {
              $data[$col_id]= $res[$conter];
              $conter++;
          }
          fputcsv($output, $data);
          $rowid++;
      }
      fclose($input);
      fclose($output);
      return new JsonResponse($createdClassifierFile2);
  }
  public function TmSketchSliceOp(){
    $slice_json = $_REQUEST['slice_json'];
    $droot = \Drupal::root();
    $droot = str_replace("\\", "/", $droot);
    $rdir = $droot . "/sites/default/files/rcode";
    $exe_command = "cd $rdir && Rscript slice.R ".base64_encode($slice_json);
    $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
    $res = exec($invoirment_vars . $exe_command);

    if ($res == '["File Created"]') {
      return new JsonResponse('file created');
    } else if ($res == '["rows error"]'){
      return new JsonResponse("Rows To greater");
    }
    else {
      return new JsonResponse("File is not created.");
    }
  }
   public function TmSketchSelect() {
      $select_json = $_POST["select_json"];
      $drupal_root = \Drupal::root();
      $drupal_root = str_replace("\\", "/", $drupal_root);
      $rdir = $drupal_root . "/sites/default/files/rcode";
      $exe_command = "cd $rdir && Rscript select.R " . base64_encode($select_json).' 2>&1';
      $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
      exec($invoirment_vars . $exe_command, $output, $result);
      if (!$result) {
           return new JsonResponse('file created');
       } else {
           return new JsonResponse("File is not created.");
       }
    }
    public function TmSketchDistinct() {
        $distinct_json = $_POST["distinct_json"];
        $drupal_root = \Drupal::root();
        $drupal_root = str_replace("\\", "/", $drupal_root);
        $rdir = $drupal_root . "/sites/default/files/rcode";
        $exe_command = "cd $rdir && Rscript distinct.R ".base64_encode($distinct_json);
        $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';

        exec($invoirment_vars . $exe_command, $output, $result);
        if (!$result) {
            return new JsonResponse('file created');
        }
        else {
            return new JsonResponse("File is not created.");
        }
    }

    public function TmSketchSample() {
        $sample_json = $_POST["sample_json"];
        $drupal_root = \Drupal::root();
        $drupal_root = str_replace("\\", "/", $drupal_root);
        $rdir = $drupal_root . "/sites/default/files/rcode";
        $exe_command = "cd $rdir && Rscript sample.R ".base64_encode($sample_json);
        $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
      $res = exec($invoirment_vars . $exe_command);
      if ($res == '["File Created"]') {
        return new JsonResponse('file created');
      } else if ($res == '["rows error"]'){
        return new JsonResponse("Rows To greater");
      }
      else {
        return new JsonResponse("File is not created.");
      }
    }
    public function TmSketchMutate() {
        $mutate_json = $_POST["mutate_json"];
        $drupal_root = \Drupal::root();
        $drupal_root = str_replace("\\", "/", $drupal_root);
        $rdir = $drupal_root . "/sites/default/files/rcode";
        $exe_command = "cd $rdir && Rscript mutate.R ".base64_encode($mutate_json);
        $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';

        exec($invoirment_vars . $exe_command, $output, $result);
        if (!$result) {
            return new JsonResponse('file created');
        }
        else {
            return new JsonResponse("File is not created.");
        }
    }
    public function TmSketchSplit() {
        $split_json = $_POST["split_json"];
        $drupal_root = \Drupal::root();
        $drupal_root = str_replace("\\", "/", $drupal_root);
        $rdir = $drupal_root . "/sites/default/files/rcode";
        $exe_command = "cd $rdir && Rscript split.R ".base64_encode($split_json);
        $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
        exec($invoirment_vars . $exe_command, $output, $result);
        if (!$result) {
            return new JsonResponse('file created');
        }
        else {
            return new JsonResponse("File is not created.");
        }
    }
    public function TmSketchSummarize() {
        $summarize_json = $_POST["summarize_json"];
        $drupal_root = \Drupal::root();
        $drupal_root = str_replace("\\", "/", $drupal_root);
        $rdir = $drupal_root . "/sites/default/files/rcode";
        $exe_command = "cd $rdir && Rscript summary2.R ".base64_encode($summarize_json);
        $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
        exec($invoirment_vars . $exe_command, $output, $result);
        if (!$result) {
            return new JsonResponse('file created');
        }
        else {
            return new JsonResponse("File is not created.");
        }
    }

    public function TmSketchMapping() {

        $map_json = $_POST["map_json"];
        $drupal_root = \Drupal::root();
        $drupal_root = str_replace("\\", "/", $drupal_root);
        $rdir = $drupal_root . "/sites/default/files/rcode";
        $exe_command = "cd $rdir && Rscript mapping.R ".base64_encode($map_json);
        $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
        exec($invoirment_vars . $exe_command, $output, $result);
        if (!$result) {
            return new JsonResponse('file created');
        }
        else {
            return new JsonResponse("File is not created.");
        }
    }
    public function TmSketchKnnOp() {
        $knn_json = $_POST["knn_json"];
        $drupal_root = \Drupal::root();
        $drupal_root = str_replace("\\", "/", $drupal_root);
        $rdir = $drupal_root . "/sites/default/files/rcode";
        $exe_command = "cd $rdir && Rscript KNN-classifier.R ".base64_encode($knn_json);
        $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';

       $res = exec($invoirment_vars . $exe_command);

        if ($res == '["File Created"]') {
            return new JsonResponse('file created');
        } else if ($res == '["Invalid CSV for KNN"]'){
            return new JsonResponse('Invalid Csv');
        }
        else {
            return new JsonResponse("File is not created.");
        }
    }
    public function TmSketchDtreeOp() {
        $dtree_json = $_POST["dtree_json"];
        $drupal_root = \Drupal::root();
        $drupal_root = str_replace("\\", "/", $drupal_root);
        $rdir = $drupal_root . "/sites/default/files/rcode";
        $exe_command = "cd $rdir && Rscript decisiontree.R ".base64_encode($dtree_json);
        $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';

        $res = exec($invoirment_vars . $exe_command);
        if ($res == '["File Created"]') {
            return new JsonResponse('file created');
        } else if ($res == '["Invalid CSV for KNN"]'){
            return new JsonResponse('Invalid Csv');
        }
        else {
            return new JsonResponse("File is not created.");
        }
    }


    public function TmSketchDeleteDataset(){
        $fileName = $_POST['filenames'];
        $sketch_id = $_POST['sketch_id'];
        $fileNames = explode(',', $fileName);
        $drupal_root = str_replace("\\", "/", DRUPAL_ROOT);
        $pathForFile = $drupal_root . "/sites/default/files/operator_files/";
        foreach($fileNames as $fName){
            $path = $pathForFile . $fName;
            file_unmanaged_delete($path);
        }

        return new JsonResponse('/node/'.$sketch_id);
    }
	
    public function TmSketchPredictOp() {
        $predict_json = $_POST["predict_json"];
        $drupal_root = \Drupal::root();
        $drupal_root = str_replace("\\", "/", $drupal_root);
        $rdir = $drupal_root . "/sites/default/files/rcode";
        $exe_command = "cd $rdir && Rscript predict.R ".base64_encode($predict_json);
        $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
        $res = exec($invoirment_vars . $exe_command);
        if ($res == '["File Created"]') {
            return new JsonResponse('file created');
        }
        else {
            return new JsonResponse("File is not created.");
        }
    }
    public function TmSketchPerformanceOp() {
        $performance_json = $_POST["performance_json"];
        $drupal_root = \Drupal::root();
        $drupal_root = str_replace("\\", "/", $drupal_root);
        $rdir = $drupal_root . "/sites/default/files/rcode";
        $exe_command = "cd $rdir && Rscript performance.R ".base64_encode($performance_json);
        $invoirment_vars = 'export R_LIBS="/usr/lib64/R/library"; export R_LIBS_USER="/usr/lib64/R/library"; export PATH=$PATH:/usr/bin/;';
        $res = exec($invoirment_vars . $exe_command);
        if ($res == '["File Created"]') {
            return new JsonResponse('file created');
        }
        else {
            return new JsonResponse("File is not created.");
        }
    }

}
