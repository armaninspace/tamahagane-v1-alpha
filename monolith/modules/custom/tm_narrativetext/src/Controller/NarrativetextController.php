<?php
namespace Drupal\tm_narrativetext\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\ReplaceCommand;
/**
 * Class NarrativetextController.
 *
 * @package Drupal\tm_narrativetext\Controller
 */
class NarrativetextController extends ControllerBase {
  public function addForm() {
	$twig = \Drupal::service('twig');
	$path =  drupal_get_path('module', 'tm_narrativetext');
	$template = $twig->loadTemplate($path.'/templates/tm_narrativetext_form.html.twig');
	$response['form_html'] = $template->render([ ]);
	return new JsonResponse($response);
 }
}