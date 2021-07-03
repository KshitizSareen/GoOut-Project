import React, {Component} from 'react';
import NetInfo from '@react-native-community/netinfo';
import { View,StyleSheet,Text,Image, Alert, TouchableOpacity,FlatList, ScrollView, Animated,Dimensions, BackHandler} from 'react-native';
import firestore  from '@react-native-firebase/firestore';
import * as Progress from 'react-native-progress';
import messaging from '@react-native-firebase/messaging';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import Chat from './Chat.js';
import EventMedia from './EventMedia.js';
import EventInfo from './EventInfo.js';
var userid="";
import ImagePicker from 'react-native-image-crop-picker';
import FastImage from 'react-native-fast-image';
import storage from '@react-native-firebase/storage';
import EventUsers from './EventUsers.js';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBook, faBookReader, faBug, faClipboardList, faComment, faImage, faInfo, faList, faSignInAlt, faSignOutAlt, faTag, faTextHeight, faUser, faUserCircle, faUserFriends, faWindowClose } from '@fortawesome/free-solid-svg-icons';
import EventRequests from './EventRequests.js';
import axios from 'axios';
class Content extends Component{
    constructor() {
        super();
        this.spinValue = new Animated.Value(0)
        this.state = {
            Price: 0,
            Chat: false,
            Photos: false,
            Info: false,
            Name:"",
            Time:"",
            Date:"",
            ShowLoadingAnimation: false,
            ShowIndicator: false,
            ImageUri: "https://firebasestorage.googleapis.com/v0/b/goout-4391e.appspot.com/o/a1695e7b-5875-4314-bf70-b50c4a0386f3_200x200.png?alt=media&token=8c962cb0-02e9-4f51-bec2-e2699cebcfac",
            Users: false,
            Ownername: "",
            NoOfMembers:0,
            NoOfInvites:0,
            Members:[],
            OwnerID:"",
            UserRequests:false,
            EventRequests:[],
            Invites: [],
        };
      }
    componentDidMount(){
        userid=this.props.route.params.userid;
                this.SetChat();
                this.InitializeContent();
        messaging().onMessage(async mess=>{
            this.InitializeContent();
        })

    }
    SelectImage=()=>{
        ImagePicker.openPicker({
            cropping: true,
            mediaType: 'photo'
        }).then((Image)=>{
            var StorageRef=storage().ref(`Event/${this.props.route.params.eventid}/ImagePic`);
            StorageRef.putFile(Image.path).on(
                storage.TaskEvent.STATE_CHANGED,
                snapshot=>{
                    if(snapshot.state==storage.TaskState.SUCCESS)
                    {
                        StorageRef.getDownloadURL().then(downloadUrl=>{
                            var EventDoc=firestore().collection('Events').doc(this.props.route.params.eventid);
                            firestore().runTransaction(async transaction=>{
                                transaction.update(EventDoc,{
                                    ImageUri: downloadUrl
                                })
                            }).then(()=>{
                                this.setState({ImageUri: downloadUrl});
                                EventDoc.get().then(Event=>{
                                    if(Event.data().Members!=null)
                                    {
                                        for(var i=0;i<Event.data().Members.length;i++)
                                        {
                                            firestore().collection('Users').doc(Event.data().Members[i]).get().then(User=>{
                                                if(User.data().NotificationToken!=null)
                                                {
                                                    axios.post("https://fcm.googleapis.com/fcm/send",{
                      "to" : User.data().NotificationToken,
                    "data":{
                    
                    },
                    },{
                      headers:{
                        Authorization: "key=AAAA7tNMKV0:APA91bEZHjBk7k1YayjyS_7HrM8rznxOyH-_1GHWH58hqyvmVMoBPMCCsQ23G-9W16gJhh2RyDVE4qSWn5y2QiX3MG39hv1javY_34IJNE5PpWdMKa-QHSXaXop8nxpZc5-VsP2OTzXd",
                        "Content-Type": "application/json"
                      },
                    })
                                                }
                                            })
                    
                                        }
                                    }
                                })
                            })
                        })
                    }
                }
            )

        }).catch(err=>{

        })
    }
    InitializeContent=()=>{
        firestore().collection('Events').doc(this.props.route.params.eventid).get().then((doc)=>{
            if(doc.exists)
            {
                this.setState({Name:doc.data().Name});
                this.setState({Time:doc.data().Time});
                this.setState({Price:doc.data().Price});
                this.setState({Date: doc.data().Date});
                this.setState({ImageUri: doc.data().ImageUri});
                this.setState({OwnerID: doc.data().Owner});
                if(doc.data().Members!=null)
                {
                    this.setState({NoOfMembers: doc.data().Members.length});
                    this.setState({Members: doc.data().Members});
                }
                if(doc.data().Invites!=null)
                {
                    this.setState({NoOfInvites: doc.data().Invites.length});
                }
                if(doc.data().EventRequests!=null)
                {
                    this.setState({EventRequests: doc.data().EventRequests});
                }
                if(doc.data().Invites!=null)
                {
                    this.setState({Invites: doc.data().Invites});
                }
                console.log(this.state.Invites);
                !this.state.Members.includes(this.props.route.params.userid) ?  this.SetInfo() : null
            }
        });
    }
      SetChat=()=>{

        this.setState({Chat:true});
        this.setState({Photos:false});
        this.setState({Info: false});
        this.setState({Users: false});
        this.setState({UserRequests: false});
    }
    SetPhotos=()=>{
        this.setState({Chat:false});
        this.setState({Photos:true});
        this.setState({Info: false});
        this.setState({Users: false});
        this.setState({UserRequests: false});
    }
    SetUsers=()=>{
        this.setState({Chat:false});
        this.setState({Photos:false});
        this.setState({Info: false});
        this.setState({Users: true});
        this.setState({UserRequests: false});
    }
    SetInfo=()=>{
        this.setState({Chat:false});
        this.setState({Photos:false});
        this.setState({Info: true});
        this.setState({Users: false});
        this.setState({UserRequests: false});
    }
    SetUserRequests=()=>{
        this.setState({Chat:false});
        this.setState({Photos:false});
        this.setState({Info: false});
        this.setState({Users: false});
        this.setState({UserRequests: true});
    }
    ShowAnimation=(value)=>{
        this.setState({ShowLoadingAnimation: value});
    }
    HandleBackButton(){
        return true;
    }
    EnterEvent=()=>{
        var UserDoc=firestore().collection('Users').doc(this.props.route.params.userid);
        var EventDoc=firestore().collection('Events').doc(this.props.route.params.eventid);
        firestore().runTransaction(async transaction=>{
            var doc=await transaction.get(UserDoc);
            var UserRequests=[];
            console.log(UserRequests);
            if(doc.data().UserRequests!=null)
            {
                UserRequests=doc.data().UserRequests;
            }
            UserRequests.push(this.props.route.params.eventid);
            transaction.update(UserDoc,{
                UserRequests: UserRequests
            })
            doc=await transaction.get(EventDoc);
            var EventRequests=[]
            if(doc.data().EventRequests!=null)
            {
                EventRequests=doc.data().EventRequests;
            }
            EventRequests.push(this.props.route.params.userid)
            transaction.update(EventDoc,{
                EventRequests: EventRequests
            })
        }).then(()=>{
            this.InitializeContent();
            firestore().collection('Users').doc(this.state.OwnerID).get().then((User)=>{
                console.log(User.data());
                if(User.data().NotificationToken!=null)
                {
                    axios.post("https://fcm.googleapis.com/fcm/send",{
  "to" : User.data().NotificationToken,
"data":{

},
"notification":{
"title": "GoOut",
"body":"You have requested to join "+this.state.Name
}
},{
  headers:{
    Authorization: "key=AAAA7tNMKV0:APA91bEZHjBk7k1YayjyS_7HrM8rznxOyH-_1GHWH58hqyvmVMoBPMCCsQ23G-9W16gJhh2RyDVE4qSWn5y2QiX3MG39hv1javY_34IJNE5PpWdMKa-QHSXaXop8nxpZc5-VsP2OTzXd",
    "Content-Type": "application/json"
  },
})
                }
            })
            firestore().collection('Users').doc(this.props.route.params.userid).get().then((User)=>{
                console.log(User.data());
                if(User.data().NotificationToken!=null)
                {
                    axios.post("https://fcm.googleapis.com/fcm/send",{
  "to" : User.data().NotificationToken,
"data":{

},
"notification":{
"title": "GoOut",
"body":"You have requested to join "+this.state.Name
}
},{
  headers:{
    Authorization: "key=AAAA7tNMKV0:APA91bEZHjBk7k1YayjyS_7HrM8rznxOyH-_1GHWH58hqyvmVMoBPMCCsQ23G-9W16gJhh2RyDVE4qSWn5y2QiX3MG39hv1javY_34IJNE5PpWdMKa-QHSXaXop8nxpZc5-VsP2OTzXd",
    "Content-Type": "application/json"
  },
})
                }
            })
        }).catch(err=>{
            console.log(err);
            Alert.alert("","Please check your network connection");
        })

    }
                
    componentWillUnmount(){
    }
    render()
    {
          
     var ShowPice=()=>{
         if(this.state.Price!=0)
         {
         return <Text style={styles.TextDetails}>{"Price - "+this.state.Price}</Text>
         }
         else{
             return <Text style={styles.TextDetails}>Price - Free</Text>
         }
     }
     var DisplayChat=()=>{
         if(this.state.Chat)
         {
             return(
                 <Chat userid={this.props.route.params.userid} eventid={this.props.route.params.eventid} navigation={this.props.navigation} ShowAnimation={this.ShowAnimation} OwnerId={this.state.OwnerID}/>
             );
         }
     }
     var DisplayMedia=()=>{
         if(this.state.Photos)
         {
            return(
                <EventMedia userid={this.props.route.params.userid} eventid={this.props.route.params.eventid} navigation={this.props.navigation} ShowAnimation={this.ShowAnimation} OwnerId={this.state.OwnerID}/>
            );
         }
     }
     var DisplayInfo=()=>{
         if(this.state.Info)
         {
            return(
                <EventInfo userid={this.props.route.params.userid} eventid={this.props.route.params.eventid} navigation={this.props.navigation} ShowAnimation={this.ShowAnimation} OwnerId={this.state.OwnerID}/>
            );
         }
     }   
     var DisplayUsers=()=>{
        if(this.state.Users)
        {
           return(
               <EventUsers userid={this.props.route.params.userid} eventid={this.props.route.params.eventid} navigation={this.props.navigation} ShowAnimation={this.ShowAnimation} OwnerId={this.state.OwnerID}/>
           );
        }
    }
    var DisplayEventRequests=()=>{
        if(this.state.UserRequests)
        {
            return(
                <EventRequests userid={this.props.route.params.userid} eventid={this.props.route.params.eventid} navigation={this.props.navigation} OwnerId={this.state.OwnerID}/>
            )
        }
    } 
    var DisplayOwnerPanel=()=>{
        return(
            <View style={styles.Panel}>
                    <TouchableOpacity style={{
        backgroundColor: '#dce8e7',
        height: 50,
        justifyContent: 'center',
        alignItems:'center',
        width: 0.2*windowWidth
    }} onPress={()=>{
                        this.SetChat();
                    }}>
                        <FontAwesomeIcon icon={faComment} color="lightblue" size="40"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
        backgroundColor: '#dce8e7',
        height: 50,
        justifyContent: 'center',
        alignItems:'center',
        width: 0.2*windowWidth
    }} onPress={()=>{
                        this.SetPhotos();
                    }}>
                        <FontAwesomeIcon icon={faImage} color="lightblue" size="40"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
        backgroundColor: '#dce8e7',
        height: 50,
        justifyContent: 'center',
        alignItems:'center',
        width: 0.2*windowWidth
    }} onPress={()=>{
                        this.SetInfo();
                    }}>
                        <FontAwesomeIcon icon={faInfo} color="lightblue" size="40"/>
                    </TouchableOpacity>
                <TouchableOpacity style={{
        backgroundColor: '#dce8e7',
        height: 50,
        justifyContent: 'center',
        alignItems:'center',
        width: 0.2*windowWidth
    }} onPress={()=>{
                        this.SetUsers();
                    }}>
                        <FontAwesomeIcon icon={faUserCircle} color="lightblue" size="40"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
        backgroundColor: '#dce8e7',
        height: 50,
        justifyContent: 'center',
        alignItems:'center',
        width: 0.2*windowWidth
    }} onPress={()=>{
                        this.SetUserRequests();
                    }}>
                        <FontAwesomeIcon icon={faUserFriends} color="lightblue" size="40"/>
                    </TouchableOpacity>
                </View>
        )
    }
    var DisplayNotOwnerPanel=()=>{
        return(
            <View style={styles.Panel}>
                    <TouchableOpacity style={{
        backgroundColor: '#dce8e7',
        height: 50,
        justifyContent: 'center',
        alignItems:'center',
        width: 0.33*windowWidth
    }} onPress={()=>{
                        this.SetChat();
                    }}>
                        <FontAwesomeIcon icon={faComment} color="lightblue" size="40"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
        backgroundColor: '#dce8e7',
        height: 50,
        justifyContent: 'center',
        alignItems:'center',
        width: 0.33*windowWidth
    }} onPress={()=>{
                        this.SetPhotos();
                    }}>
                        <FontAwesomeIcon icon={faImage} color="lightblue" size="40"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
        backgroundColor: '#dce8e7',
        height: 50,
        justifyContent: 'center',
        alignItems:'center',
        width: 0.33*windowWidth
    }} onPress={()=>{
                        this.SetInfo();
                    }}>
                        <FontAwesomeIcon icon={faInfo} color="lightblue" size="40"/>
                    </TouchableOpacity>
                </View>
        )
    } 
    var DisplayInfoPanel=()=>{
            return(
                <View style={styles.Panel}>
                        <TouchableOpacity style={{
            backgroundColor: '#dce8e7',
            height: 50,
            justifyContent: 'center',
            alignItems:'center',
            width: windowWidth
        }} onPress={()=>{
                            this.SetInfo();
                        }}>
                            <FontAwesomeIcon icon={faInfo} color="lightblue" size="40"/>
                        </TouchableOpacity>
                    </View>
            )
    }
        return(
            <View style={styles.Background}>
                <View style={styles.Description}>
                    <View style={{
                        width: 0.5*windowWidth,
                        justifyContent: 'space-evenly',
                        alignItems: 'center',
                        height: 0.25*windowHeight,
                    }}>
                    <TouchableOpacity disabled={this.state.OwnerID!=this.props.route.params.userid} onPress={()=>{
                        this.SelectImage();
                }}><FastImage source={{
                    uri: this.state.ImageUri,
                    priority: FastImage.priority.low
                }} style={styles.Image} /></TouchableOpacity>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    width: 0.5*windowWidth
                }}>
                    <TouchableOpacity style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                    }} onPress={()=>{
                        this.props.navigation.navigate("ShowMembers",{EventID: this.props.route.params.eventid,OwnerID: this.state.OwnerID,UserID: this.props.route.params.userid});
                    }}>
                        <Text style={{
                            fontSize: 20
                        }}>{this.state.NoOfMembers}</Text>
                    <Text style={{
                            fontSize: 13
                        }}>Members</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        justifyContent: 'center',
                        alignItems: 'center'
                    }} onPress={()=>{
                        this.props.navigation.navigate("ShowInvites",{EventID: this.props.route.params.eventid,OwnerID: this.state.OwnerID,UserID: this.props.route.params.userid});
                    }}>
                        <Text style={{
                            fontSize: 20
                        }}>{this.state.NoOfInvites}</Text>
                    <Text style={{
                            fontSize: 13
                        }}>Invites</Text>
                    </TouchableOpacity>
                </View>
                {
                    this.state.OwnerID!=this.props.route.params.userid && !this.state.Members.includes(this.props.route.params.userid) && !this.state.EventRequests.includes(this.props.route.params.userid) && !this.state.Invites.includes(this.props.route.params.userid)  ? 
                    <TouchableOpacity style={{
                        backgroundColor: 'lightblue',
                        borderRadius: 10,
                        width: 0.25*windowWidth,
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2%'
                    }} onPress={()=>{
    this.EnterEvent();
}}>
    <Text>Request Entry</Text>
</TouchableOpacity> : null
    }
                </View>
                    <View style={styles.TextContainer}> 
            <Text style={styles.TextDetails}>{this.state.Date}</Text>
            <Text style={styles.TextDetails}>{this.state.Time}</Text>
                        {
                            ShowPice()
                        }
                    </View>
                </View>
                {
                    this.state.OwnerID==this.props.route.params.userid ? DisplayOwnerPanel()
                : this.state.Members.includes(this.props.route.params.userid) ?  DisplayNotOwnerPanel() : DisplayInfoPanel()
                

            }
                            {
                    DisplayChat()
                }
                {
                    DisplayMedia()
                }
                {
                    DisplayInfo()
                }
                {
                    DisplayUsers()
                }
                {
                    DisplayEventRequests()
                }
            </View>
        )
    }
}
const styles=StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
      },
    Background:{
        flex: 1,
    },
    Description:{
        flexDirection :'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        height: 0.25*windowHeight,
        width: windowWidth
    },
    Image:{
        width: 0.2*windowWidth,
        height: 0.2*windowWidth,
        borderRadius: 50,
        marginRight: '2.5%',
    },
    TextContainer:
    {
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'column',
        height: 0.25*windowHeight,
        width: 0.5*windowWidth
    },
    TextDetails:{
        fontSize: 20,
        textAlign: 'center',
        borderRadius: 10,
        width: 0.4*windowWidth

    },
    Panel:{
        flexDirection: 'row',
        height: 50,
        justifyContent: 'space-between',
        backgroundColor: '#dce8e7',
        width: windowWidth,
        elevation: 5,
    },
    ChatInput:{
        width: 300,
        backgroundColor: '#dce8e7',
        borderRadius: 10,
        alignSelf: 'center',
        marginRight: '3%',
        marginLeft: '2%'
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
        justifyContent: 'space-evenly',
        padding: '1%'
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
        padding: '1%'
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
        marginLeft: '5%'
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
          alignSelf: 'center'
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
export default Content;
