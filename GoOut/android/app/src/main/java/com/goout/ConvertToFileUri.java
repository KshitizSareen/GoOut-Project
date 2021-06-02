package com.goout;

import android.database.Cursor;
import android.net.Uri;
import android.provider.MediaStore;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ConvertToFileUri extends ReactContextBaseJavaModule {
    @NonNull
    @Override
    public String getName() {
        return "ConvertToFileUri";
    }

    ConvertToFileUri(ReactApplicationContext reactContext)
    {
        super(reactContext);
    }

    @ReactMethod
    public void ConvertToUri(String UriString, Promise promise)
    {
        String result;
        Uri FileUri=Uri.parse(UriString);
        Cursor cursor = this.getCurrentActivity().getContentResolver().query(FileUri, null, null, null, null);
         // Source is Dropbox or other similar local file path
        result = FileUri.getPath();
        promise.resolve(result);
    }
}
