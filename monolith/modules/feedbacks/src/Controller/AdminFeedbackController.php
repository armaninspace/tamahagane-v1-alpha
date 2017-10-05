<?php

namespace Drupal\feedbacks\Controller;

use Drupal\feedbacks\Form\FeedbackClass;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Link;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Url;
/**
 * Extends ControllerBase.
 *
 * @inheritdoc
 */
class AdminFeedbackController extends ControllerBase {

  /**
   * Contents for Admin Page of feedbacs.
   *
   * @return array
   *   Returns renderable array that will display all feedbacks on Page
   */
  public function content() {
    // Table header.
    $header = [
      [
        'data' => $this->t('Date'),
        'field' => 'timestamp',
        'sort' => 'desc',
      ],
      [
        'data' => $this->t('User'),
        'field' => 'name',
        'sort' => 'asc',
      ],
      [
        'data' => $this->t('Location'),
        'field' => 'path',
        'sort' => 'asc',
      ],
      'message' => $this->t('Feedback'),
      'fileuri' => $this->t('File'),
      'operations' => $this->t('Actions'),
    ];

    $rows = [];

    if (FeedbackClass::getAll($header)) {
      foreach (FeedbackClass::getAll($header) as $id => $content) {
        $actionLink = [];

        $actionLink[] = Link::createFromRoute(
          $this->t('Edit'),
          'feedbacks_edit.form', ['id' => $id]
        )->toRenderable();
        $actionLink[] = Link::createFromRoute(
          $this->t('Delete'),
          'feedbacks_delete.form', ['id' => $id]
        )->toRenderable();

        $actionLinks = render($actionLink);

        $submitDate = DrupalDateTime::createFromTimestamp($content->timestamp,
          new \DateTimeZone(drupal_get_user_timezone())
        );

        $status = ($content->status == 1) ? 'open' : 'processed';
        if ($content->fileuri != '') {
          $filename = explode('/', $content->fileuri);
          $fileuri = file_create_url($content->fileuri);
          $fileurl = Url::fromUri($fileuri);
          $filelink = \Drupal::l(t($filename[4]), $fileurl);
        }
        else {
          $filelink = '';
        }
        $rows[$status][] = [
          'data' => [
            $submitDate->format('m/d/Y - H:i'),
            $content->name,
            $content->path,
            $content->message,
            $filelink,
            $actionLinks,
          ],
        ];
      }
      if (isset($rows['open']) && !empty($rows['open'])) {
        $tableOpen = [
          '#type' => 'table',
          '#header' => $header,
          '#rows' => $rows['open'],
          '#attributes' => [
            'id' => 'op-fb-table',
          ],
        ];
        $openedFeedbacks = render($tableOpen);
      }
      else {
        $openedFeedbacks = "There are no Open feedback entries.";
      }

      if (isset($rows['processed']) && !empty($rows['processed'])) {
        $tableProcessed = [
          '#type' => 'table',
          '#header' => $header,
          '#rows' => $rows['processed'],
          '#attributes' => [
            'id' => 'pr-fb-table',
          ],
        ];
        $processedFeedbacks = render($tableProcessed);
      }
      else {
        $processedFeedbacks = 'There are no processed feedback entries.';
      }

      $feedback_list = [
        '#type' => 'markup',
        '#markup' => '<h3>Open Feedback Messages</h3>' .
        $openedFeedbacks .
        '<h3>Processed Feedback Messages</h3>' . $processedFeedbacks,
      ];
    }
    else {
      $feedback_list = [
        '#type' => 'markup',
        '#markup' => '<p>No Feedbacks Found</p>',
      ];
    }

    return $feedback_list;
  }

}
