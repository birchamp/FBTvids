package com.unfoldingword.fbtapp.assetpack

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.play.core.assetpacks.AssetPackManagerFactory
import com.unfoldingword.fbtapp.BuildConfig
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream

private const val PACK_NAME = "fbtvideos"
private const val ASSET_DIRECTORY = "videos"
private const val TAG = "FbtAssetPack"

class FbtAssetPackModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "FbtAssetPack"

    @ReactMethod
    fun getAssetUri(fileName: String, promise: Promise) {
        try {
            val cacheDir = File(reactContext.filesDir, PACK_NAME)
            if (!cacheDir.exists()) {
                cacheDir.mkdirs()
            }

            val destination = File(cacheDir, fileName)
            if (!destination.exists()) {
                val copied = if (BuildConfig.DEBUG) {
                    copyFromEmbeddedAssets(fileName, destination) || copyFromAssetPack(fileName, destination)
                } else {
                    copyFromAssetPack(fileName, destination) || copyFromEmbeddedAssets(fileName, destination)
                }

                if (!copied) {
                    promise.reject("MISSING_FILE", "File $fileName not found in asset pack or dev asset directory.")
                    return
                }
            }

            promise.resolve(destination.absolutePath)
        } catch (e: Exception) {
            promise.reject("ASSET_ERROR", e)
        }
    }

    private fun copyFromAssetPack(fileName: String, destination: File): Boolean {
        return try {
            val manager = AssetPackManagerFactory.getInstance(reactContext)
            val location = manager.getPackLocation(PACK_NAME) ?: return false
            val assetPath = location.assetsPath() ?: return false
            val source = File(assetPath, "$ASSET_DIRECTORY/$fileName")
            if (!source.exists()) {
                return false
            }
            source.inputStream().use { input ->
                writeStreamToFile(input, destination)
            }
            true
        } catch (error: Exception) {
            Log.w(TAG, "Asset pack unavailable, falling back", error)
            false
        }
    }

    private fun copyFromEmbeddedAssets(fileName: String, destination: File): Boolean {
        return try {
            val assetPath = "$ASSET_DIRECTORY/$fileName"
            reactContext.assets.open(assetPath).use { input ->
                writeStreamToFile(input, destination)
            }
            true
        } catch (error: Exception) {
            Log.w(TAG, "Embedded asset missing", error)
            false
        }
    }

    private fun writeStreamToFile(inputStream: InputStream, destination: File) {
        FileOutputStream(destination).use { output ->
            inputStream.copyTo(output)
        }
    }
}
