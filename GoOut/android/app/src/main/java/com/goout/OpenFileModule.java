package com.goout;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Environment;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.RNFetchBlob.Utils.FileProvider;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;

public class OpenFileModule extends ReactContextBaseJavaModule {
    @NonNull
    @Override
    public String getName() {
        return "OpenFile";
    }
    OpenFileModule(ReactApplicationContext reactContext)
    {
        super(reactContext);
    }

    @ReactMethod
    public void OpenDocument(String UriString)
    {
        Uri path = Uri.parse(UriString);
        Intent pdfOpenintent = new Intent(Intent.ACTION_VIEW);
        pdfOpenintent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        pdfOpenintent.setDataAndType(path, "application/pdf");
        pdfOpenintent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            this.getReactApplicationContext().startActivity(pdfOpenintent);
        }
        catch (ActivityNotFoundException e) {
            Toast.makeText(this.getReactApplicationContext(), "No application found which can open the file", Toast.LENGTH_SHORT).show();
        }
    }
}
