<?php

/**
 * @file
 * Contains \Drupal\Tests\og_menu\Kernel\OgMenuConfigImportTest.
 */

namespace Drupal\Tests\og_menu\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\og\OgGroupAudienceHelper;
use Drupal\Tests\ConfigTestTrait;

/**
 * @group og_menu
 */
class OgMenuConfigImportTest extends KernelTestBase {

  use ConfigTestTrait;

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    'field',
    'og',
    'og_menu',
    'system',
    'user',
    'node'
  ];

  public function testModuleInstallationWithDefaultConfig() {
    \Drupal::service('module_installer')->install(['og_menu_test']);
    $this->assertArrayHasKey(OgGroupAudienceHelper::DEFAULT_FIELD, \Drupal::service('entity_field.manager')->getFieldStorageDefinitions('ogmenu_instance'));
  }

  public function testConfigImport() {
    $active = $this->container->get('config.storage');
    $sync = $this->container->get('config.storage.sync');
    $this->copyConfig($active, $sync);

    $src_dir = __DIR__ . '/../../modules/og_menu_test/config/install';
    $target_dir = config_get_config_directory(CONFIG_SYNC_DIRECTORY);

    $names = [
      'field.field.ogmenu_instance.test.og_audience',
      'field.storage.ogmenu_instance.og_audience',
      'node.type.group',
      'og_menu.ogmenu.test'
    ];

    foreach ($names as $name) {
      $this->assertTrue(file_unmanaged_copy("$src_dir/$name.yml", "$target_dir/$name.yml"));
    }

    // Import the content of the sync directory.
    $this->configImporter()->import();
    $this->assertArrayHasKey(OgGroupAudienceHelper::DEFAULT_FIELD, \Drupal::service('entity_field.manager')->getFieldStorageDefinitions('ogmenu_instance'));
  }

}
