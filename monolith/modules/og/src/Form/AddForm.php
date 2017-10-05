<?php

namespace Drupal\og\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

use Drupal\Core\Form\FormInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Url;

use Drupal\og\Og;

class AddForm extends FormBase {
    protected $id;

    function getFormID() {
        return 'og_add_member';
    }

    public function buildForm(array $form, FormStateInterface $form_state, $id = '') {
        $this->id = $id;
        $form['userdata'] = [
            '#type' => 'entity_autocomplete',
            '#target_type' => 'user',
            '#selection_settings' => ['include_anonymous' => FALSE],
            '#title' => $this->t('Select Member'),
        ];
        $form['actions'] = array('#type' => 'actions');
        $form['actions']['submit'] = array(
            '#type' => 'submit',
            '#value' => t('Add'),
        );
        return $form;
    }

    public function validateForm(array &$form, FormStateInterface $form_state) {
        /*Nothing to validate on this form*/
    }

    public function submitForm(array &$form, FormStateInterface $form_state) {

        $user_id = $form_state->getValue('userdata');
        $group_id =$this->id;
        $user = \Drupal\user\Entity\User::load($user_id);
        $group = \Drupal\node\Entity\Node::load($group_id);
        if (Og::isMember($group, $user)) {
            // User is already a member, return them back.
            drupal_set_message(t('This user is already a member of this group'),'warning');
        }else{
            $membership = Og::createMembership($group, $user);
            $membership->save();
            drupal_set_message(t('Member has been added'));

        }
        $path = 'http://beta-04.tamahagane.org/group/node/'."$this->id".'/admin/members';
        $response = new TrustedRedirectResponse($path);
        $form_state->setResponse($response);

    }

}