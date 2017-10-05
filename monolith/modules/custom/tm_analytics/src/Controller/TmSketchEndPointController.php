<?php

namespace Drupal\tm_analytics\Controller;
use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\tm_analytics\Controller\TmSketchFileHandler as Filehandler;
/**
 * Class TmSketchEndPointController.
 *
 * @package Drupal\tm_sanalytics\Controller
 */
class TmSketchEndPointController extends ControllerBase {

  function test() {
    $uploader = new Filehandler();
    // Specify the list of valid extensions, ex. array("jpeg", "xml", "bmp")
    $uploader->allowedExtensions = array(); // all files types allowed by default
    // Specify max file size in bytes.
    $uploader->sizeLimit = null;
    // Specify the input name set in the javascript.
    $uploader->inputName = "qqfile"; // matches Fine Uploader's default inputName value by default
    // If you want to use the chunking/resume feature, specify the folder to temporarily save parts.
    $uploader->chunksFolder = "/htdocs/sites/default/files/pictures";

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
       // Assumes you have a chunking.success.endpoint set to point here with a query parameter of "done".
      // For example: /myserver/handlers/endpoint.php?done
      if (isset($_GET["done"])) {
        $result = $uploader->combineChunks("files");
      }
      // Handles upload requests
      else {
        $droot = \Drupal::root();
        $droot = str_replace("\\", "/", $droot);
        $fpth = $droot.'/sites/default/files/pictures';
        // Call handleUpload() with the name of the folder, relative to PHP's getcwd()
        $result = $uploader->handleUpload($fpth);
        // To return a name used for uploaded file you can use the following line.
        $result["uploadName"] = $uploader->getUploadName();
      }

      return new JsonResponse($result);
    }
    // for delete file requests
    else if ($_SERVER['REQUEST_METHOD'] == "DELETE") {
      $droot = \Drupal::root();
      $droot = str_replace("\\", "/", $droot);
      $fpth = $droot.'/sites/default/files/pictures';
      $result = $uploader->handleDelete($fpth);
      return new JsonResponse($result);
    }
    else {
      return new JsonResponse('File not saved');
    }


  }

}