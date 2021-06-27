import React, {Component} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowAltCircleRight, faFile, faImage,faPlay,faUpload} from '@fortawesome/free-solid-svg-icons';
import { View,StyleSheet,Text,Alert,TouchableOpacity,FlatList,  TextInput,Dimensions,BackHandler} from 'react-native';
import firestore  from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
const windowWidth = Dimensions.get('window').width;
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import messaging from '@react-native-firebase/messaging';
class Chat extends Component{
    constructor() {
        super();
        this.state = {
            Price: 0,
            Chat: false,
            Photos: false,
            Videos: false,
            Info: false,
            Name:"",
            Time:"",
            Date:"",
            uri:"https://firebasestorage.googleapis.com/v0/b/goout-eb557.appspot.com/o/Image_Add-512.png?alt=media&token=dc8cb0cb-b5b6-4eae-bc87-ca303728902f",
            Message: "",
            Messages: [],
            User: null,
            modalUploadVisible: false,
            Media:[],
            Caption: "",
            ImageUrls: [],
            ShowLoadingAnimation: false,
            ShowIndicator: false,
        };
      }
    componentDidMount(){
        this.message="";
        this.GetMessages();
        firestore().collection('Users').doc(this.props.userid).get().then((doc)=>{
            if(doc.exists)
            {
                var User=new Object();
                User.Name=doc.data().Username;
                this.setState({User: User});
            }
        })
        messaging().onMessage( async msg=>{
            this.GetMessages();
        })
    }
    SendMessage=(Message)=>{
                    if(Message!="")
        {

                var Messages=this.state.Messages;
                Messages.unshift({Message:Message.trim(),User:this.state.User,type: 0});
                        this.setState({Messages: Messages});
                    var EventDoc=firestore().collection('Events').doc(this.props.eventid);
                    firestore().runTransaction(async transaction=>{
                        var doc= await transaction.get(EventDoc);
                        if('Messages' in doc.data())
                        {
                            Messages=doc.data().Messages;
                        }
                        else
                        {
                            Messages=[];
                        }
                        Messages.unshift({Message:Message.trim(),User:this.state.User,type: 0});
                        transaction.update(EventDoc,{
                            Messages: Messages
                        })
                    }).then(()=>{
                    }).catch(err=>{
                        console.log(err);
            Alert.alert("","Please check your network connection");
                    })
            }
    }
    GetMessages=()=>{
        firestore().collection('Events').doc(this.props.eventid).get().then((doc)=>{
            if(doc.exists)
            {
                if ('Messages' in doc.data())
                {
                    this.setState({Messages: doc.data().Messages});
                }
            }
        })
    }
    UploadPDF= async ()=>{
        try {
            this.setState({modalUploadVisible: false});
            var ResultUris=new Array();
            const results = await DocumentPicker.pickMultiple({
              type: [DocumentPicker.types.allFiles],
            });
            for (const res of results) {
                console.log(res.uri);
                const uriComponents = res.uri.split('/');
                const destPath = `${RNFetchBlob.fs.dirs.DocumentDir}/${this.props.userid}${res.name}`;
                var FileObject={};
                FileObject.FilePath=`${this.props.userid}${res.name}`;
                FileObject.DestPath="file://"+destPath;
                FileObject.FileName=res.name;
                console.log(destPath);
                await RNFS.copyFile(res.uri, destPath);
                console.log(destPath);
                ResultUris.push(FileObject);
            }
            const SendPDFInterval=setInterval(()=>{
                if(ResultUris.length==results.length)
            {
             var Messages=[];
             var Message=[];
                var Set=[];
              ResultUris.forEach((File)=>{
                var fileName=File.DestPath.split('/');
                fileName=fileName[fileName.length-1];
                  var storageRef=storage().ref(`Event/Chat/${this.props.eventid}/${this.props.userid}/${fileName}`);
              storageRef.putFile(File.DestPath).on(
                storage.TaskEvent.STATE_CHANGED,
                snapshot=>{
                  console.log("snapshot: "+snapshot.state);
                  console.log("progress: "+(snapshot.bytesTransferred/snapshot.totalBytes)*100);
                  if(snapshot.state==storage.TaskState.SUCCESS){
                    console.log("Success");
                    storageRef.getDownloadURL().then(downloadurl=>{
                        if(!Set.includes(downloadurl))
                        {
                        Set.push(downloadurl);
                        var FileObject={};
                        FileObject.downloadurl=downloadurl;
                        FileObject.FilePath=File.FilePath;
                        FileObject.FileName=File.FileName;
                        Message.push(FileObject);
                        /*RNFetchBlob.fs.unlink(File.DestPath).then(()=>{
                            console.log("File Deleted");
                        });*/
                      if(Set.length==ResultUris.length)
                      {
                          console.log("Twice");
                          var EventDoc=firestore().collection('Events').doc(this.props.eventid);
                          firestore().runTransaction(async transaction=>{
                              var res=await transaction.get(EventDoc);
                              if ('Messages' in res.data())
                              {
                                  Messages=res.data().Messages;

                              }
                              Messages.unshift({Message:Message,User:this.state.User,type: 1});
                              transaction.update(EventDoc,{
                                Messages: Messages
                              })
                          }).then(()=>{
                            }).catch(err=>{
                                console.log(err);
            Alert.alert("","Please check your network connection");
                            })
                      }
                        }
                    }).catch(err=>{
                        console.log(err);
                        Alert.alert("","Please check your network connection");
                    })
                  }
                  if(snapshot.state==storage.TaskState.ERROR)
                  {
                    console.log(err);
                    Alert.alert("","Please check your network connection");
                  }
                },
                error=>{
                  console.log("image upload error"+ error);
                },

                )
              })
            clearInterval(SendPDFInterval);
        }
            },1000);
          } catch (err) {
            if (DocumentPicker.isCancel(err)) {
              // User cancelled the picker, exit any dialogs or menus and move on
            } else {
              throw err;
            }
          }

    }
    render(){
        return(
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
            }}
            enabled={true}>
                <FlatList style={styles.Messages} data={this.state.Messages} renderItem={(data)=>{
                    if(data.item.type==0)
                    {
                    return(
                        <View style={styles.Message}>
                            <Text style={styles.TextName}>{data.item.User.Name}</Text>
                    <Text style={styles.TextData}>{data.item.Message}</Text>
                        </View>
                    )
                    }
       
                    else if(data.item.type==1)
                    {
                        return(
                        <View style={styles.Message}>
                            <Text style={styles.TextName}>{data.item.User.Name}</Text>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}>
                            <TouchableOpacity style={{
                                width: 0.1*windowWidth,
                                margin: '1%'
                                
                            }} onPress={()=>{
                                NetInfo.fetch().then((state)=>{
                                    if(state.isConnected)
                                    {
                                        this.props.navigation.navigate("LoadDocuments",{Message:data.item.Message});
                                    }
                                    else
                                    {
                                       Alert.alert("","Please connect to the internet")
                                    }
                                })
                            }}>
                                <FontAwesomeIcon icon={faFile} size="40" color="lightblue" style={{
                                }}/>
                                </TouchableOpacity>
                                <Text style={{
                                    fontSize: 25,
                                    fontFamily: 'serif',
                                    fontWeight: '800',
                                    fontStyle: 'italic'
                                }}>Open Document</Text>
                            </View>
                        </View>
                        )
                    }
                }} keyExtractor={data=>data.item}/>
                <View style={styles.Chat}>
                <TextInput multiline={true} style={styles.ChatInput} value={this.state.Message}  onChange={(value)=>{
                    this.message=value.nativeEvent.text;
                    this.setState({Message: value.nativeEvent.text});
                }} value={this.state.Message}/>
                <TouchableOpacity style={styles.UploadButton} onPress={()=>{
                    this.UploadPDF();
                }}><FontAwesomeIcon icon={faUpload} size="40" color="lightblue" style={styles.Icons}/></TouchableOpacity>
                <TouchableOpacity style={styles.UploadButton} onPress={()=>{
                    this.SendMessage(this.message);
                    this.setState({Message: ""});
                    this.message="";
                }}><FontAwesomeIcon icon={faArrowAltCircleRight} size="40" color="lightblue" style={styles.Icons}/></TouchableOpacity>
                </View>
            </View>
        );

    }
}
const styles=StyleSheet.create({
    ChatInput:{
        width: 0.7*windowWidth,
        backgroundColor: '#dce8e7',
        borderRadius: 10,
        alignSelf: 'center',
    },
    CaptionInput:{
        width: 200,
        height: 40,
        backgroundColor: '#dce8e7',
        borderRadius: 10,
        marginTop: '5%',
    },
    CaptionView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: '50%',
      },
    Chat:{
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        padding: '1%',
        width: windowWidth,
        alignItems: 'center',
        },
    Messages:{
            margin: '2%',
        },
    Message:{
        backgroundColor: '#dce8e7',
        marginBottom: '2%',
        fontSize: 17,
        fontFamily: 'serif',
        fontStyle: 'italic',
        fontWeight: '800',
        borderRadius: 10,
        padding: '1%',
        width: 0.95*windowWidth,
    },
    TextData:{
        fontFamily: 'serif',
        fontWeight: '800',
        fontSize: 17,
    },
    TextName:{
        fontFamily: 'serif',
        fontWeight: '800',
        fontSize: 12,
    },
    Icons:{
    },
    centeredView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalView: {
        backgroundColor: "white",
        padding: '5%',
        borderRadius: 20,
        elevation: 5,
        justifyContent: 'space-evenly',
      },
      modalInnerView:{
        justifyContent: 'space-evenly',
        flexDirection: 'row',
      },
      ModalUpload:{
          flexDirection: 'row',
      },
      IconsUpload:{
          margin: '5%',
      },
      UploadButton:{
          alignSelf: 'flex-end',
      },
        ProgressIndicator:{
            alignSelf: 'flex-start',
            backgroundColor: 'white',
            elevation: 2,
            width: 200,
            height: 200,
            borderRadius: 10,
        }


})
export default Chat;