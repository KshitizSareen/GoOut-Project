import numpy as np
import cv2
import urllib.request
from tempfile import NamedTemporaryFile
import uuid
import pyrebase


firebaseConfig = {
    "apiKey": "AIzaSyAdIKbyYM-Kd4Bu0RKbGQqhBX7DOe4cdRw",
    "authDomain": "goout-4391e.firebaseapp.com",
    "databaseURL":"https://goout-4391e-default-rtdb.firebaseio.com",
    "projectId": "goout-4391e",
    "storageBucket": "goout-4391e.appspot.com",
    "messagingSenderId": "1025747200349",
    "appId": "1:1025747200349:web:5994af405c2651f61360b4",
    "measurementId": "G-Q1HT5YQL1J"
  }

Codes=[0,1,5,6,10,11,12,14,16,17,19]

def ProcessImage(request):
    """Responds to any HTTP request.
    Args:
        request (flask.Request): HTTP request object.
    Returns:
        The response text or any set of values that can be turned into a
        Response object using
        `make_response <https://flask.palletsprjects.com/en/1.1.x/api/#flask.Flask.make_response>`.
    """
    firebase=pyrebase.initialize_app(firebaseConfig)
    storage=firebase.storage()
    url=request
    req=urllib.request.urlopen(url)
    arr = np.asarray(bytearray(req.read()), dtype=np.uint8)
    imgOriginal=cv2.imdecode(arr,-1)
    imgGray=cv2.cvtColor(imgOriginal,cv2.COLOR_BGR2GRAY)
    Uris={

    }
    with NamedTemporaryFile() as temp:
        uuidvalue=uuid.uuid1()
        path_on_cloud="FilterImages/Image"+str(uuidvalue)+".png"
        temp_file="".join([str(temp.name),str(uuidvalue)+'.png'])
        cv2.imwrite(temp_file,imgGray)
        imgput=storage.child(path_on_cloud).put(temp_file)
        DownloadUrl=storage.child(path_on_cloud).get_url(imgput['downloadTokens'])
        Uris[temp_file]=DownloadUrl
    for i in range(len(Codes)):
        with NamedTemporaryFile() as temp:
            img=cv2.applyColorMap(imgGray,Codes[i])
            uuidvalue=uuid.uuid1()
            path_on_cloud="FilterImages/Image"+str(uuidvalue)+".png"
            temp_file="".join([str(temp.name),str(uuidvalue)+'.png'])
            cv2.imwrite(temp_file,img)
            imgput=storage.child(path_on_cloud).put(temp_file)
            DownloadUrl=storage.child(path_on_cloud).get_url(imgput['downloadTokens'])
            Uris[temp_file]=DownloadUrl
    return Uris

ProcessImage("https://firebasestorage.googleapis.com/v0/b/goout-4391e.appspot.com/o/a1695e7b-5875-4314-bf70-b50c4a0386f3_200x200.png?alt=media&token=8c962cb0-02e9-4f51-bec2-e2699cebcfac")