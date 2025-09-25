import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  "The native FbtAssetPack module is not linked. Make sure you have run 'expo prebuild' and rebuilt the native app.";

const NativeAssetPack = NativeModules.FbtAssetPack
  ? NativeModules.FbtAssetPack
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      },
    );

export async function getAssetPackVideoUri(fileName) {
  if (Platform.OS !== 'android') {
    return null;
  }

  if (!fileName) {
    return null;
  }

  const filePath = await NativeAssetPack.getAssetUri(fileName);
  if (!filePath) {
    return null;
  }

  if (filePath.startsWith('file://')) {
    return filePath;
  }
  return `file://${filePath}`;
}
