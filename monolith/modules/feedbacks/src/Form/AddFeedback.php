<?php

namespace Drupal\feedbacks\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Symfony\Component\HttpFoundation\Request;


/**
 * Extends FormBase.
 *
 * @inheritdoc
 *
 * @group feedbacks
 */
class AddFeedback extends FormBase {

  /**
   * Setting formId.
   *
   * @inheritdoc
   */
  public function getFormId() {
    return 'feedbacks_form';
  }

  /**
   * Building Form.
   *
   * @inheritdoc
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['name'] = [
      '#type' => 'hidden',
      '#title' => $this->t('Name'),
      '#value' => $this->currentUser()->getAccountName(),
      '#required' => TRUE,
    ];

    $form['path'] = [
      '#type' => 'hidden',
      '#title' => $this->t('Feedback Page'),
      '#value' => Request::createFromGlobals()->server->get('HTTP_REFERER'),
      '#required' => TRUE,
    ];

    $form['feedback_information'] = [
      '#type' => 'markup',
      '#markup' => 'If you experience a bug or would like to see an addition on the current page,
      feel free to leave us a message.',
    ];

    $form['message'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Feedback'),
      '#rows' => 3,
      '#title_display' => 'invisible',
      '#required' => TRUE,
    ];

    $form['file'] = [
      '#title' => t('File'),
      '#type' => 'managed_file',
      '#description' => t('Only files with the following extensions are allowed: gif png jpg jpeg.'),
      '#upload_validators'  => [
        'file_validate_extensions' => array('gif png jpg jpeg'),
        'file_validate_size' => array(25600000),
      ],
      '#upload_location' => 'public://feedbacks/images',
      '#required' => FALSE,
    ];

    $form['actions'] = [
      '#type' => 'actions',
    ];

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Send Feedback'),
    ];

    return $form;
  }

  /**
   * Form Validation.
   *
   * @inheritdoc
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    // Validate submitted form data.
    parent::validateForm($form, $form_state);
    $validators = array(
      'file_validate_extensions' => array("gif png jpg jpeg"),
      'file_validate_size' => array(file_upload_max_size()),
    );
    $file = file_save_upload('file', $validators, FALSE, 0, FILE_EXISTS_REPLACE);
    if ($file === FALSE) {
      $form_state->setError($form["file"], "Failed to upload the file");
    }
    elseif ($file !== NULL) {
      $form_state->setValue("file", $file->toArray());
    }
  }

  /**
   * Form Submission.
   *
   * @inheritdoc
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $values = $form_state->getValues();
    $fid = 0;
    $fileuri = '';
    if (!empty($values['file'])) {
      $fid = $values['file']['fid'][0]['value'];
      $file = file_load($fid);
      $file->setPermanent();
      $file->save();
      $fileuri = $values['file']['uri'][0]['value'];
    }
    $name = $values['name'];
    $message = $values['message'];
    $path = $values['path'];
    $timestamp = time();
    FeedbackClass::add($name, $message, $path, $timestamp, $fid, $fileuri);
    $form_state->setRedirectUrl(Url::fromUri($path));
    drupal_set_message($this->t('Your Feedback has been submitted'));
  }

}

