<?php

namespace Drupal\og_menu\Form;

use Drupal\Core\Entity\EntityManagerInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\og\OgGroupAudienceHelperInterface;
use Drupal\og_menu\OgMenuInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides terms overview form for a taxonomy vocabulary.
 */
class OverviewMenuInstances extends FormBase {

  /**
   * The module handler service.
   *
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  protected $moduleHandler;

  /**
   * The term storage controller.
   *
   * @var \Drupal\taxonomy\TermStorageInterface
   */
  protected $storageController;

  /**
   * Constructs an OverviewTerms object.
   *
   * @param \Drupal\Core\Entity\EntityManagerInterface $entity_manager
   *   The entity manager service.
   */
  public function __construct(EntityManagerInterface $entity_manager) {
    $this->entityManager = $entity_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity.manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'ogmenu_overview_instances';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, OgMenuInterface $ogmenu = NULL) {
    $og_instance_storage = $this->entityManager->getStorage('ogmenu_instance');
    $query = $og_instance_storage->getQuery()
      ->sort('id')
      ->condition('type', $ogmenu->id())
      ->pager(10);

    $rids = $query->execute();
    $entities = $og_instance_storage->loadMultiple($rids);
    $list = array('#theme' => 'item_list');
    /** @var \Drupal\Core\Entity\EntityInterface $entity */
    foreach ($entities as $entity) {
      $value = $entity->get(OgGroupAudienceHelperInterface::DEFAULT_FIELD)->getValue();
      if (!$value) {
        throw new \Exception('OG Menu requires an og group to be referenced.');
      }

      $list['#items'][] = $entity->toLink();
    }
    if (count($entities)) {
      $build = array(
        'list' => $list,
      );
    }
    else {
      $build['#markup'] = $this->t('No menu instances have been created yet.');
    }

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {

  }

}
