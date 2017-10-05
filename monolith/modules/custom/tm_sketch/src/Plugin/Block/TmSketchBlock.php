<?php

namespace Drupal\tm_sketch\Plugin\Block;
use Drupal\Core\Block\BlockBase;
use Drupal\og\Og;
use Drupal\node\Entity\Node;
/**
 * Provides a 'TmSketchBlock' block.
 *
 * @Block(
 *  id = "tm_sketch_block",
 *  admin_label = @Translation("Tm sketch block"),
 * )
 */
class TmSketchBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */
  public function build() {
   // drupal_flush_all_caches();
    $build = [];
    $path = drupal_get_path('module', 'tm_sketch');
    $node = \Drupal::routeMatch()->getParameter('node');
    if ($node) {
       $nid = $node->nid->value;
      // Render a template file
      if ($node->getType() == 'process') {
        $twig = \Drupal::service('twig');
        $view_content = views_embed_view('process_referenced_nodes', 'block_1');
        $member = false;
        if (Og::isMember($node, \Drupal\user\Entity\User::load(\Drupal::currentUser()->id()))) {
          $member = true;
        }
        $template = $twig->loadTemplate($path . '/templates/tm_sketch_block.html.twig');
        $build['tm_sketch_block']['#markup'] = $template->render(['view_content' => $view_content, 'nid' => $nid, 'member' => $member]);

        return $build;
      }
      elseif ($node->getType() == 'folder') {
        $twig = \Drupal::service('twig');
        $view_content = views_embed_view('folder_referenced_nodes', 'block_1');
        $template = $twig->loadTemplate($path . '/templates/tm_sketch_block.html.twig');
        $member = true;
        $build['tm_sketch_block']['#markup'] = $template->render(['view_content' => $view_content, 'nid' => $nid,'member' => $member]);
        return $build;
      }
      elseif ($node->getType() == 'sketch') {
        $gnid = $node->id();
        $current_graph_data = '';
        if (!empty($node->get('field_graph')->getValue())) {
          $current_graph_data = $node->get('field_graph')->getValue();
          $current_graph_data = $current_graph_data[0]['value'];
        }
        $opt_markup = "";
        $main_array = array();
        $op_array = array();
        $opId = array();
        $field_input_port = '';
        $field_output_port = '';
        $bundle = "pallet"; // or $bundle='my_bundle_type';
        $query = \Drupal::entityQuery('node');
        $query->condition('status', 1);
        $query->condition('type', $bundle);
        $entity_ids = $query->execute();
        //print_r($entity_ids);
        if (!empty($entity_ids)) {
          foreach ($entity_ids as $nid) {
            $node_pallet = \Drupal\node\Entity\Node::load($nid);
            $pallet_title = $node_pallet->get('title')->value;
            $pallet_nid = $node_pallet->id();
            $operator_nid = $node_pallet->get('field_operator')->getValue();
            $opt_markup .= '<div class="pallet"><div class="panel-group">
                    <div class="panel panel-default">
                      <div class="panel-heading">
                        <h4 class="panel-title">
                          <a data-toggle="collapse" href="#' . $pallet_title . '" aria-expanded="false">' . $pallet_title . '</a>
                        </h4>
                      </div>
					  <div id="' . $pallet_title . '" class="panel-collapse collapse">
					    <ul class="list-group-selected">
						</ul>
                        <ul class="list-group">';
            $op_array2 = array();
            $op_i = 0;
            foreach ($operator_nid as $value) {
              $op_id = $value['target_id'];
              $op_node = \Drupal\node\Entity\Node::load($op_id);
              $op_title = $op_node->get('title')->value;
              $op_nid = $op_node->id();
              $fill_color = $op_node->get('field_fill_color')->getValue();
              if (!empty($op_node->get('field_input_port')->getValue())) {
                $field_input_port = $op_node->get('field_input_port')->getValue();
              } elseif (empty($op_node->get('field_input_port')->getValue())) {
                $field_input_port = '';
              }
              if (!empty($op_node->get('field_output_port')->getValue())) {
                $field_output_port = $op_node->get('field_output_port')->getValue();
              } elseif (empty($op_node->get('field_output_port')->getValue())) {
                $field_output_port = '';
              }
              if (!empty($op_node->get('field_operator_icon')->getValue())) {
                $field_operator_icon = $op_node->get('field_operator_icon')->getValue();
                $operator_icon_file = \Drupal\file\Entity\File::load($field_operator_icon[0]['target_id']);
                if (isset($operator_icon_file)) {
                  $operator_icon_filename = $operator_icon_file->getFileName();
                }
              }
              elseif (empty($op_node->get('field_operator_icon')->getValue())) {
                $field_operator_icon = 'default.png';
              }
			  $arrow = '<i title="Drag" class="fa fa-arrows"></i>';
              $opt_markup .= "<li style='-moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none;'
                                unselectable='on' onselectstart='return false;'onmousedown='return false;'
                                class='list-group-item filterdrag' id=$op_nid value=$op_nid><img class='op_img' src='/sites/default/files/$operator_icon_filename' alt=''/>&nbsp;" . $op_title . "</li>";
              $op_array[$op_nid] = array (
                "dLabel" => $op_title,
                "dInPorts" => $field_input_port,
                "dOutPorts" => $field_output_port,
                "imagePath" => $operator_icon_filename,
                "fillClr" => $fill_color
              );
              $op_array2[$op_i] = array('title' => $op_title, 'op_nid' => $op_nid,  'op_img' => $operator_icon_filename, 'pallet' => $pallet_title);
              $op_i++;
            }
            $opt_markup .= "</ul></div></div></div></div>";
            $main_array[] = array (
              "title" => $pallet_title,
              "operators" => $op_array2
            );
          }
        }
        $bundle = "source"; // or $bundle='my_bundle_type';
        $query_source = \Drupal::entityQuery('node');
        $query_source->condition('status', 1);
        $query_source->condition('type', $bundle);
        $result_source = $query_source->execute();

        $source_options = array();
        if (!empty($result_source)) {
          foreach ($result_source as $source_nid) {
            $sktnid = $node->id();
            $sketch_node = \Drupal\node\Entity\Node::load($sktnid);
            $source_node = \Drupal\node\Entity\Node::load($source_nid);
            $srcgid = $source_node->get('og_audience')->getString();
            $sktgid = $sketch_node->get('og_audience')->getString();
            if ($srcgid == $sktgid) {
              $source_title = $source_node->get('title')->value;
              $source_file = $source_node->get('field_source_file')->getValue();
              //print_r($source_filename);
              $src_file = \Drupal\file\Entity\File::load($source_file[0]['target_id']);
              $source_filename = str_replace("public://", '', $src_file->getFileUri());
              //print_r($src_file->getFileName());
              $source_options[$source_filename] = $source_title;
              // .= "<option value='".$source_filename."'>".$source_title."</option>";
              //drupal_set_message("<pre>".print_r($source_filename,true)."</pre>");
            }
          }
        }
        //print_r($source_options);
        $twig = \Drupal::service('twig');
        //$path =  drupal_get_path('module', 'tm_tamahagane');
        $template = $twig->loadTemplate($path . '/templates/tm_sketch_page.html.twig');
        $ren_mark = ['#markup' => $opt_markup];
        $main_json_array = json_encode($main_array, true);
        $opId_json = json_encode($opId);
        $op_json_array = json_encode($op_array, true);
        $graph_nid = $gnid;
        $currentuid = \Drupal::currentUser()->id();
        $nodeuid = $node->get('uid')->getString();
        if ($currentuid == $nodeuid) {
          $node_author = true;
        }
        $feedbackform = \Drupal::formBuilder()->getForm('Drupal\feedbacks\Form\AddFeedback');
        $view_content = views_embed_view('analytics', 'analytics_view');
        $markup = $template->render(['analytics_col' => $view_content, 'feedbackform' => $feedbackform, 'module_path' => $path, 'node_author' => $node_author, "opt_markup" => $ren_mark, "source_options" => $source_options, "main_array" => $main_json_array, "opId" => $opId_json, "op_array" => $op_json_array, "graph_nid" => $graph_nid, "current_graph_data" => $current_graph_data]);
        $build['sketch_tab_block']['#allowed_tags'] = [
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
          'img',
          'h4',
          'input',
          'script',
          'form',
          'label',
          'select',
          'button',
          'option',
          'textarea'
        ];
        $build['sketch_tab_block']['#markup'] = $markup;
        return $build;
      }

    }
    // Render a view in a block directly
    //$view_content = views_embed_view('process_referenced_nodes', 'block_1');
    //$build['tm_sketch_block']['#markup']  = render($view_content);
    //return $build;
  }
}