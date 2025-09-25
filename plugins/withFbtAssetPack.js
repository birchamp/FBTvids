const {
  AndroidConfig,
  withAndroidManifest,
  withAppBuildGradle,
  withSettingsGradle,
  withMainApplication,
  withDangerousMod,
  createRunOncePlugin,
} = require('@expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');
const path = require('path');
const fs = require('fs');

const PACK_NAME = 'fbtvideos';
const ASSET_SUBDIR = 'videos';
const MODULE_NAME = 'FbtAssetPack';
const MODULE_PACKAGE_CLASS = `${MODULE_NAME}Package`;
const PLAY_ASSET_DELIVERY_DEP = 'com.google.android.play:asset-delivery:2.2.1';
const ASSET_SOURCE_DIR = path.join('assetpack', ASSET_SUBDIR);

function ensureMetaData(mainApplication, name, value) {
  const existing = mainApplication['meta-data'] ?? [];
  if (!existing.some((item) => item.$['android:name'] === name)) {
    existing.push({
      $: {
        'android:name': name,
        'android:value': value,
      },
    });
    mainApplication['meta-data'] = existing;
  }
}

function applyAndroidManifest(config) {
  return withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplication(config.modResults);
    ensureMetaData(mainApplication, 'com.android.vending.asset-pack', PACK_NAME);
    return config;
  });
}

function applyAppBuildGradle(config) {
  return withAppBuildGradle(config, (config) => {
    const contents = config.modResults.contents;
    config.modResults.contents = mergeContents({
      tag: 'fbt-asset-pack-assetpacks',
      src: contents,
      newSrc: `    assetPacks = [":${PACK_NAME}"]`,
      anchor: 'android {',
      offset: 1,
      comment: '//',
    }).contents;

    if (!config.modResults.contents.includes(PLAY_ASSET_DELIVERY_DEP)) {
      config.modResults.contents = mergeContents({
        tag: 'fbt-asset-pack-dependency',
        src: config.modResults.contents,
        newSrc: `    implementation "${PLAY_ASSET_DELIVERY_DEP}"`,
        anchor: 'dependencies {',
        offset: 1,
        comment: '//',
      }).contents;
    }
    return config;
  });
}

function applySettingsGradle(config) {
  return withSettingsGradle(config, (config) => {
    const includeLine = `include ':${PACK_NAME}'`;
    const projectDirLine = `project(':${PACK_NAME}').projectDir = new File(rootProject.projectDir, 'app/src/main/assetpacks/${PACK_NAME}')`;

    if (!config.modResults.contents.includes(includeLine)) {
      config.modResults.contents += `\n${includeLine}`;
    }
    if (!config.modResults.contents.includes(projectDirLine)) {
      config.modResults.contents += `\n${projectDirLine}`;
    }

    return config;
  });
}

function applyMainApplication(config) {
  return withMainApplication(config, (config) => {
    const modResults = config.modResults;
    if (!modResults?.contents) {
      return config;
    }

    const packageName = AndroidConfig.Package.getPackage(config);
    if (!packageName) {
      return config;
    }

    const importLine = `import ${packageName}.assetpack.${MODULE_PACKAGE_CLASS}`;
    if (!modResults.contents.includes(importLine)) {
      const packageImportAnchor = 'import expo.modules.ApplicationLifecycleDispatcher';
      modResults.contents = modResults.contents.replace(
        packageImportAnchor,
        `${importLine}\n${packageImportAnchor}`
      );
    }

    if (!modResults.contents.includes(`${MODULE_PACKAGE_CLASS}()`)) {
      const packagesApplyAnchor = 'return PackageList(this).packages.apply {';
      modResults.contents = modResults.contents.replace(
        packagesApplyAnchor,
        `${packagesApplyAnchor}\n      add(${MODULE_PACKAGE_CLASS}())`
      );
    }

    return config;
  });
}

async function copyAssetPackVideos(projectRoot, assetPackAssetsDir) {
  const sourceDir = path.join(projectRoot, ASSET_SOURCE_DIR);
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Asset pack source directory missing: ${sourceDir}`);
  }
  const files = await fs.promises.readdir(sourceDir);
  const mediaFiles = files.filter((file) => file.endsWith('.mp4'));
  await fs.promises.mkdir(assetPackAssetsDir, { recursive: true });
  await Promise.all(
    mediaFiles.map(async (file) => {
      const from = path.join(sourceDir, file);
      const to = path.join(assetPackAssetsDir, file);
      await fs.promises.copyFile(from, to);
    }),
  );
  return { sourceDir, mediaFiles };
}

async function copyDevFallbackVideos(projectRoot, sourceDir, mediaFiles) {
  if (!mediaFiles.length) {
    return;
  }
  const devAssetsDir = path.join(
    projectRoot,
    'android',
    'app',
    'src',
    'dev',
    'assets',
    ASSET_SUBDIR,
  );
  await fs.promises.mkdir(devAssetsDir, { recursive: true });
  await Promise.all(
    mediaFiles.map(async (file) => {
      const from = path.join(sourceDir, file);
      const to = path.join(devAssetsDir, file);
      await fs.promises.copyFile(from, to);
    }),
  );
}

async function writeFileDiffers(targetPath, contents) {
  const existing = fs.existsSync(targetPath) ? await fs.promises.readFile(targetPath, 'utf8') : null;
  if (existing !== contents) {
    await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.promises.writeFile(targetPath, contents, 'utf8');
  }
}

function createAssetPackManifest(packageName) {
  return `<?xml version="1.0" encoding="utf-8"?>\n<manifest package="${packageName}.${PACK_NAME}">\n    <application>\n        <meta-data\n            android:name="com.android.vending.asset-pack"\n            android:value="install-time" />\n    </application>\n</manifest>\n`;
}

function createAssetPackBuildGradle() {
  return `plugins {\n    id 'com.android.asset-pack'\n}\n\nassetPack {\n    packName = '${PACK_NAME}'\n    deliveryType = com.android.build.gradle.internal.dsl.AssetPackBundleSpec.DeliveryType.INSTALL_TIME\n}\n`;
}

function createKotlinModule(packageName) {
  return `package ${packageName}.assetpack\n\nimport android.util.Log\nimport com.facebook.react.bridge.Promise\nimport com.facebook.react.bridge.ReactApplicationContext\nimport com.facebook.react.bridge.ReactContextBaseJavaModule\nimport com.facebook.react.bridge.ReactMethod\nimport com.google.android.play.core.assetpacks.AssetPackManagerFactory\nimport ${packageName}.BuildConfig\nimport java.io.File\nimport java.io.FileOutputStream\nimport java.io.InputStream\n\nprivate const val PACK_NAME = "${PACK_NAME}"\nprivate const val ASSET_DIRECTORY = "${ASSET_SUBDIR}"\nprivate const val TAG = "${MODULE_NAME}"\n\nclass ${MODULE_NAME}Module(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {\n    override fun getName(): String = "${MODULE_NAME}"\n\n    @ReactMethod\n    fun getAssetUri(fileName: String, promise: Promise) {\n        try {\n            val cacheDir = File(reactContext.filesDir, PACK_NAME)\n            if (!cacheDir.exists()) {\n                cacheDir.mkdirs()\n            }\n\n            val destination = File(cacheDir, fileName)\n            if (!destination.exists()) {\n                val copied = if (BuildConfig.DEBUG) {\n                    copyFromEmbeddedAssets(fileName, destination) || copyFromAssetPack(fileName, destination)\n                } else {\n                    copyFromAssetPack(fileName, destination) || copyFromEmbeddedAssets(fileName, destination)\n                }\n\n                if (!copied) {\n                    promise.reject("MISSING_FILE", "File $fileName not found in asset pack or dev asset directory.")\n                    return\n                }\n            }\n\n            promise.resolve(destination.absolutePath)\n        } catch (e: Exception) {\n            promise.reject("ASSET_ERROR", e)\n        }\n    }\n\n    private fun copyFromAssetPack(fileName: String, destination: File): Boolean {\n        return try {\n            val manager = AssetPackManagerFactory.getInstance(reactContext)\n            val location = manager.getPackLocation(PACK_NAME) ?: return false\n            val assetPath = location.assetsPath() ?: return false\n            val source = File(assetPath, "$ASSET_DIRECTORY/$fileName")\n            if (!source.exists()) {\n                return false\n            }\n            source.inputStream().use { input ->\n                writeStreamToFile(input, destination)\n            }\n            true\n        } catch (error: Exception) {\n            Log.w(TAG, "Asset pack unavailable, falling back", error)\n            false\n        }\n    }\n\n    private fun copyFromEmbeddedAssets(fileName: String, destination: File): Boolean {\n        return try {\n            val assetPath = "$ASSET_DIRECTORY/$fileName"\n            reactContext.assets.open(assetPath).use { input ->\n                writeStreamToFile(input, destination)\n            }\n            true\n        } catch (error: Exception) {\n            Log.w(TAG, "Embedded asset missing", error)\n            false\n        }\n    }\n\n    private fun writeStreamToFile(inputStream: InputStream, destination: File) {\n        FileOutputStream(destination).use { output ->\n            inputStream.copyTo(output)\n        }\n    }\n}\n`;
}

function createKotlinPackage(packageName) {
  return `package ${packageName}.assetpack\n\nimport com.facebook.react.ReactPackage\nimport com.facebook.react.bridge.NativeModule\nimport com.facebook.react.bridge.ReactApplicationContext\nimport com.facebook.react.uimanager.ViewManager\n\nclass ${MODULE_PACKAGE_CLASS} : ReactPackage {\n    override fun createNativeModules(reactContext: ReactApplicationContext): MutableList<NativeModule> {\n        return mutableListOf(${MODULE_NAME}Module(reactContext))\n    }\n\n    override fun createViewManagers(reactContext: ReactApplicationContext): MutableList<ViewManager<*, *>> {\n        return mutableListOf()\n    }\n}\n`;
}

function applyDangerousMod(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const { projectRoot } = config.modRequest;
      const androidDir = path.join(projectRoot, 'android');
      const packageName = AndroidConfig.Package.getPackage(config);
      if (!packageName) {
        throw new Error('Android package name is required to configure asset pack');
      }

      const assetPackDir = path.join(androidDir, 'app', 'src', 'main', 'assetpacks', PACK_NAME);
      const assetPackAssetsDir = path.join(assetPackDir, 'src', 'main', 'assets', ASSET_SUBDIR);
      const { sourceDir, mediaFiles } = await copyAssetPackVideos(projectRoot, assetPackAssetsDir);
      await copyDevFallbackVideos(projectRoot, sourceDir, mediaFiles);

      await writeFileDiffers(path.join(assetPackDir, 'build.gradle'), createAssetPackBuildGradle());
      const manifestPath = path.join(assetPackDir, 'src', 'main', 'manifest', 'AndroidManifest.xml');
      await writeFileDiffers(manifestPath, createAssetPackManifest(packageName));

      const kotlinDir = path.join(
        androidDir,
        'app',
        'src',
        'main',
        'java',
        ...packageName.split('.'),
        'assetpack'
      );
      await writeFileDiffers(path.join(kotlinDir, `${MODULE_NAME}Module.kt`), createKotlinModule(packageName));
      await writeFileDiffers(path.join(kotlinDir, `${MODULE_PACKAGE_CLASS}.kt`), createKotlinPackage(packageName));

      return config;
    },
  ]);
}

const withFbtAssetPack = (config) => {
  config = applyAndroidManifest(config);
  config = applyAppBuildGradle(config);
  config = applySettingsGradle(config);
  config = applyMainApplication(config);
  config = applyDangerousMod(config);
  return config;
};

module.exports = createRunOncePlugin(withFbtAssetPack, 'with-fbt-asset-pack', '1.0.0');
