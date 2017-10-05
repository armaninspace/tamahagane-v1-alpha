<?php
namespace Drupal\tm_breadcrumb\Breadcrumb;
use Drupal\Core\Breadcrumb\Breadcrumb;
use Drupal\Core\Breadcrumb\BreadcrumbBuilderInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Link ;

class EasydrupalBreadCrumbBuilder implements BreadcrumbBuilderInterface {
  /**
  * {@inheritdoc}
  */
  public function applies(RouteMatchInterface $attributes) {
	$parameters = $attributes->getParameters()->all();
	// I need my breadcrumbs for a few node types ONLY,
	// so it should be applied on node page ONLY.
	if (isset ($parameters['node']) && !empty ($parameters['node'])) {
	  return TRUE;
	}
  }
  public function loadNode($node, &$nodes) {
	// $nodearr = array();
	$gid2 = $node->get('og_audience')->getString();
	$fid2 = $node->get('field_folder_reference')->getString();
	$id2 = '';
	if($fid2) {
	  $nodes[] = $fid2;
	  $id2 = $fid2;
	  $node3 = \Drupal\node\Entity\Node::load($id2);
	  $fid3 = $node3->get('field_folder_reference')->getString();
	  $gid3 = $node3->get('og_audience')->getString();
	  if($fid3) {
		$this->loadNode($node3, $nodes);
	  }
	  else {
		$nodes[] = $gid3;
	  }
	}
	else {
	  $nodes[] = $gid2;
	  //$id2 = $gid2;
	}  
	return $nodes;
  }
  /**palet source operator
  * {@inheritdoc}
  */
  public function build(RouteMatchInterface $route_match) {
	$breadcrumb = new Breadcrumb();
	$breadcrumb->addLink(Link ::createFromRoute('Projects', '<front>'));
	$node = \Drupal::routeMatch()->getParameter('node');
	$node_type = $node->bundle();
	//$node_title = $node->get('title')->value;
	//$nid = $node->nid->value;
	if($node_type == 'sketch' || $node_type == 'folder' || $node_type == 'doc' || $node_type == 'rcode' || $node_type == 'json' || $node_type == 'source') {
	  $gid = $node->get('og_audience')->getString();
        $fid = '';
        if($node_type != 'source'){
            $fid = $node->get('field_folder_reference')->getString();
        }
	  $node2 = '';
	  $id = '';
	  if($fid) {
		$node2 = \Drupal\node\Entity\Node::load($fid);
		$nodes= array();
		$nodes2= array();
		//////////////////////////////////////////////////////
		//$this->loadNode($node2 , $nodes);
		$nodes2 =   $this->loadNode($node2, $nodes);
		$nodes2 = array_reverse($nodes2);
		//echo "<pre>";
		//print_r($nodes2);
		foreach ($nodes2 as &$value) {
		  $node3 = \Drupal\node\Entity\Node::load($value);
		  $node_title = $node3->get('title')->value;
		  $breadcrumb->addLink( Link::createFromRoute($node_title, 'entity.node.canonical', ['node' => $value]));
		}
		//////////////////////////////////////////////////////////////////////
		$id = $fid;
	  }
	  else {
		$node2 = \Drupal\node\Entity\Node::load($gid);
		$id = $gid;
	  }
	  $node_title = $node2->get('title')->value;
	  $breadcrumb->addLink( Link::createFromRoute($node_title, 'entity.node.canonical', ['node' => $id]));
	}
	// Don't forget to add cache control by a route,
	// otherwise you will surprice,
	// all breadcrumb will be the same for all pages.
	$breadcrumb->addCacheContexts(['route']);
	return $breadcrumb;
  }
}