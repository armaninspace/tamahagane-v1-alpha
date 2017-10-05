<?php

namespace Drupal\og\Form;

use Drupal\Core\Entity\ContentEntityDeleteForm;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Url;

/**
 * Provides a confirmation form for unsubscribing form a group.
 */
class DeleteMemberForm extends ContentEntityDeleteForm {

    /**
     * {@inheritdoc}
     */
    public function getFormId() {
        return 'og_deletemember_confirm_form';
    }

    /**
     * {@inheritdoc}
     */
    public function getQuestion() {
        /** @var OgMembershipInterface $membership */
        $membership = $this->getEntity();
        /** @var EntityInterface $group */
        $group = $membership->getGroup();

        return $this->t('Are you sure you want to delete this member from the group %label?', ['%label' => $group->label()]);
    }

    /**
     * {@inheritdoc}
     */
    public function getConfirmText() {
        return $this->t('Delete');
    }

    /**
     * {@inheritdoc}
     */
    public function getCancelUrl() {
        /** @var EntityInterface $group */
        //$group = $this->entity->getGroup();

        // User doesn't have access to the group entity, so redirect to front page,
        // otherwise back to the group entity.
        //return $group->access('view') ? $group->toUrl() : new Url('<front>');
    }
    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state) {
        /** @var OgMembershipInterface $membership */
        $membership = $this->getEntity();
        // kint($membership); exit();
        /** @var EntityInterface $group */
        $group = $membership->getGroup();
        $gid =  $group->nid->value ;
        //$redirect = $group->access('view') ? $group->toUrl() : Url::fromRoute('<front>');
        //$form_state->setRedirectUrl($redirect);

        $membership->delete();
        drupal_set_message($this->t('Member Deleted form group.'));

        $path = 'http://beta-04.tamahagane.org/group/node/'."$gid".'/admin/members';
        $response = new TrustedRedirectResponse($path);
        $form_state->setResponse($response);
    }


}
