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
        this.GetMessages();
        firestore().collection('Users').doc(this.props.userid).get().then((doc)=>{
            if(doc.exists)
            {
                var User=new Object();
                User.Name=doc.data().Username;
                this.setState({User: User});
            }
        })
        messaging().onMessage(msg=>{
            console.log(msg.notification.title);
            this.GetMessages();
        })
    }
    SendMessage=(type)=>{
        NetInfo.fetch().then((state)=>{
            if(state.isConnected)
            {
                    if(this.state.Message!="")
        {

                var Messages=this.state.Messages;
                    Messages.unshift({Message:this.state.Message.trim(),User:this.state.User,type: 0});
                    this.setState({Message:""});
                firestore().collection('Events').doc(this.props.eventid).update({
                    Messages: Messages
                }).then(()=>{
                    firestore().collection('Events').doc(this.props.eventid).get().then((doc)=>{
                        if(doc.exists)
                        {
                            if ('Messages' in doc.data())
                            {
                                this.setState({Messages: doc.data().Messages});
                            }
                        }
                    })
                })
            }
        }
        else
            {
                Alert.alert("","Please connect to the internet");
            }});
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
    UploadPhoto= ()=>{
        this.setState({modalUploadVisible: false});
        ImagePicker.openPicker({
            multiple: true,
          }).then(images => {
              this.props.ShowAnimation(false);
              this.props.navigation.navigate("Image Editing",{Images:images,SendMessage: this.SendMediaMessage,UserId:this.props.userid,eventid: this.props.eventid,User: this.state.User,FromMedia: false});
              }).catch(err=>{
                this.props.ShowAnimation(false);
              })
              this.props.ShowAnimation(true);
              
    }
    SendMediaMessage=()=>{
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
            this.props.ShowAnimation(true);
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
            NetInfo.fetch().then(state=>{
               if(state.isConnected)
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
                          firestore().collection('Events').doc(this.props.eventid).get().then(res=>{
                              if ('Messages' in res.data())
                              {
                                  Messages=res.data().Messages;

                              }
                              Messages.unshift({Message:Message,User:this.state.User,type: 2});
                          }).then(()=>{
                            firestore().collection('Events').doc(this.props.eventid).update({
                                Messages: Messages
                            }).then(()=>{
                                this.props.ShowAnimation(false);
                                this.SendMediaMessage();
                            });

                          })
                      }
                        }
                    })
                  }
                },
                error=>{
                  console.log("image upload error"+ error);
                },
                )
              })
              }
            else
            {
                Alert.alert("","Please connect to the internet");
            }
            })
            clearInterval(SendPDFInterval);
        }
            },1000);
          } catch (err) {
            if (DocumentPicker.isCancel(err)) {
              // User cancelled the picker, exit any dialogs or menus and move on
              this.props.ShowAnimation(false);
              BackHandler.removeEventListener('hardwareBackPress',this.HandleBackButton);
            } else {
              throw err;
            }
          }

    }
    HandleBackButton(){
        return true;
    }
    UploadImage=(fileName,filepath,index,finalindex)=>{
                    const userid=this.props.userid;
    var storageRef=storage().ref(`ChatImages/${userid}/${fileName}`);
    storageRef.putFile(filepath).on(
      storage.TaskEvent.STATE_CHANGED,
      snapshot=>{
        console.log("snapshot: "+snapshot.state);
        console.log("progress: "+(snapshot.bytesTransferred/snapshot.totalBytes)*100);
        if(snapshot.state==storage.TaskState.SUCCESS){
          console.log("Success");
          storageRef.getDownloadURL().then(downloadurl=>{
              var ImageUrls=this.state.ImageUrls;
              ImageUrls.push(downloadurl);
              this.setState({ImageUrls:ImageUrls});
          }).then(()=>{
              return "Completed";
          });
        }
      },
      error=>{
        console.log("image upload error"+ error);
      });
    }
    SetModalUploadVisible=()=>{
        if (this.state.modalUploadVisible)
        this.setState({modalUploadVisible: false});
        else
        this.setState({modalUploadVisible: true});
    }
    SetModalCaptionVisible=()=>{
        if(this.state.modalCaptionVisible)
        {
            this.setState({modalCaptionVisible: false});
        }
        else{
            this.setState({modalCaptionVisible: true});
        }
    }
    render(){
        var ShowModel=()=>{
            return(
                <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.modalUploadVisible}
                onRequestClose={() => {
                    this.SetModalUploadVisible();
                }}
                onBackdropPress={()=>{
                    this.SetModalUploadVisible();
                }}
              >
                <View style={styles.centeredView} >
                  <View style={styles.modalView}>
                      <View style={styles.modalInnerView}>
                   <TouchableOpacity onPress={()=>{
                        this.UploadPhoto();
                   }}><FontAwesomeIcon icon={faImage} size="30" style={styles.IconsUpload} color="lightblue"/></TouchableOpacity>
    <TouchableOpacity onPress={()=>{
        this.UploadPDF();
    }}><FontAwesomeIcon icon={faFile} size="30" color="lightblue"/></TouchableOpacity>
    </View>
                  </View>
                </View>
              </Modal>
            );
        }
        return(
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
            }}
            enabled={true}>
                {
                    ShowModel()
                }
                <FlatList style={styles.Messages} data={this.state.Messages} renderItem={(data)=>{
                    console.log(data.item);
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
                                width: 40,
                                margin: '1%'
                                
                            }} onPress={()=>{
                                NetInfo.fetch().then((state)=>{
                                    if(state.isConnected)
                                    {
                                        this.props.navigation.navigate("PlayMedia",{Message:data.item.Message});
                                    }
                                    else
                                    {
                                       Alert.alert("","Please connect to the internet")
                                    }
                                })
                            }}>
                                <FontAwesomeIcon icon={faPlay} size="40" color="lightblue" style={{
                                }}/>
                                </TouchableOpacity>
                                <Text style={{
                                    fontSize: 25,
                                    fontFamily: 'serif',
                                    fontWeight: '800',
                                    fontStyle: 'italic'
                                }}>Play Media</Text>
                            </View>
                        </View>
                        )
                    }
                    else if(data.item.type==2)
                    {
                        return(
                        <View style={styles.Message}>
                            <Text style={styles.TextName}>{data.item.User.Name}</Text>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}>
                            <TouchableOpacity style={{
                                width: 40,
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
                <TextInput multiline={true} style={styles.ChatInput} value={this.state.Message}  onChangeText={(value)=>{
                    this.setState({Message: value});
                }} value={this.state.Message}/>
                <TouchableOpacity style={styles.UploadButton} onPress={()=>{
                    this.SetModalUploadVisible();
                }}><FontAwesomeIcon icon={faUpload} size="40" color="lightblue" style={styles.Icons}/></TouchableOpacity>
                <TouchableOpacity style={styles.UploadButton} onPress={()=>{
                    this.SendMessage(0);
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
        color: 'black'
    },
    CaptionInput:{
        width: 200,
        height: 40,
        backgroundColor: '#dce8e7',
        borderRadius: 10,
        marginTop: '5%'
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
        justifyContent: 'center',
        padding: '1%',
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
        width: 0.95*windowWidth
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
        flexDirection: 'row'
      },
      ModalUpload:{
          flexDirection: 'row',
      },
      IconsUpload:{
          margin: '5%'
      },
      UploadButton:{
          alignSelf: 'flex-end',
          marginLeft: '3%'
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