package com.goout;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.net.Uri;
import android.os.AsyncTask;
import android.provider.MediaStore;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.theartofdev.edmodo.cropper.CropImage;
import com.theartofdev.edmodo.cropper.CropImageView;

import org.opencv.android.OpenCVLoader;
import org.opencv.android.Utils;
import org.opencv.core.Mat;
import org.opencv.imgproc.Imgproc;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

public class ImageFilterModule extends ReactContextBaseJavaModule {
    private static  String TAG="OpenCV";
    private static Bitmap bmp;
    private static Mat mattoconvert;
    private Promise mPickerPromise;
    private Integer count=1;
    static {
        if (OpenCVLoader.initDebug()) {
            Log.d(TAG, "OpenCV Loaded Succesfully");
        } else {
            Log.d(TAG, "opencv failed");
        }
    }
    private final ActivityEventListener mActivityEventListener=new BaseActivityEventListener(){
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if(requestCode==CropImage.CROP_IMAGE_ACTIVITY_REQUEST_CODE)
            {
                CropImage.ActivityResult result=CropImage.getActivityResult(data);
                if(resultCode==getCurrentActivity().RESULT_OK)
                {
                    mPickerPromise.resolve(result.getUri().toString());
                }
            }
        }
    };
    ImageFilterModule(ReactApplicationContext reactContext)
    {
        super(reactContext);
        reactContext.addActivityEventListener(mActivityEventListener);
    }
    @NonNull
    @Override
    public String getName() {
        return "ImageFilterModule";
    }
    @ReactMethod
    private void GetGreyFilter(Promise promise) throws IOException {
        Mat mat=new Mat();
        Utils.bitmapToMat(bmp,mat);
        Imgproc.cvtColor(mat,mat,Imgproc.COLOR_BGR2GRAY);
        mattoconvert=mat;
        Bitmap bmpgrey = Bitmap.createBitmap(mat.cols(), mat.rows(), Bitmap.Config.ARGB_8888);
        Utils.matToBitmap(mat, bmpgrey);
        UUID Guid=java.util.UUID.randomUUID();
        String Path=MediaStore.Images.Media.insertImage(this.getCurrentActivity().getContentResolver(),bmpgrey,"IMG_" + Guid.toString(),null);
        count+=1;
        Path=getFilePathFromUri(Uri.parse(Path));
        promise.resolve(Path);
    }
    @ReactMethod
    protected void ProcessImage(Integer code,Promise promise) {
        Mat MatColor=new Mat();
        Imgproc.applyColorMap(mattoconvert,MatColor,code);
        Bitmap bmpcolor = Bitmap.createBitmap(MatColor.cols(), MatColor.rows(), Bitmap.Config.ARGB_8888);
        Utils.matToBitmap(MatColor,bmpcolor);
        UUID Guid=java.util.UUID.randomUUID();
        String Path=MediaStore.Images.Media.insertImage(this.getCurrentActivity().getContentResolver(),bmpcolor,"IMG_" + Guid.toString(),null);
        count+=1;
        Path=getFilePathFromUri(Uri.parse(Path));
        promise.resolve(Path);
    }

        private String getFilePathFromUri(Uri uri) {
        String result;
        Cursor cursor = this.getCurrentActivity().getContentResolver().query(uri, null, null, null, null);
        if (cursor == null) { // Source is Dropbox or other similar local file path
            result = uri.getPath();
        } else {
            cursor.moveToFirst();
            int idx = cursor.getColumnIndex(MediaStore.Images.ImageColumns.DATA);
            result = cursor.getString(idx);
            cursor.close();
        }
        return result;
    }
    @ReactMethod
    public void CheckImageOrientation(String ImageUri,final Promise promise) throws IOException {
        //Toast.makeText(this.getReactApplicationContext(),Uri.parse(ImageUri).getPath(),Toast.LENGTH_LONG).show();
        bmp= MediaStore.Images.Media.getBitmap(this.getCurrentActivity().getContentResolver(),Uri.parse(ImageUri));
        ExifInterface exif=new ExifInterface(Uri.parse(ImageUri).getPath());
        int orientation=exif.getAttributeInt(ExifInterface.TAG_ORIENTATION,1);
        int rotation=0;
        if (orientation == 6)
            rotation = 90;
        else if (orientation == 3)
            rotation = 180;
        else if (orientation == 8)
            rotation = 270;
            if(rotation!=0)
            {
                Matrix matrix=new Matrix();
                matrix.postRotate(rotation);
                Bitmap rotated=Bitmap.createBitmap(bmp,0,0,bmp.getWidth(),bmp.getHeight(),matrix,true);
                bmp.recycle();
                bmp=rotated;

            }
            String Values="";
            Values+=bmp.getWidth();
            Values+=',';
            Values+=bmp.getHeight();
            promise.resolve(Values);
    }
    @ReactMethod
    private void StartCrop(String ImageUri,Promise promise)
    {
        mPickerPromise=promise;
        CropImage.activity(Uri.parse(ImageUri)).start(getCurrentActivity());
    }
}
