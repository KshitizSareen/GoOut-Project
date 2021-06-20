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
            UserRequests:false
        };
      }
    componentDidMount(){
        userid=this.props.route.params.userid;
        console.log(userid);
        NetInfo.fetch().then((state)=>{
            if(state.isConnected)
            {
                firestore().collection('Events').doc(this.props.route.params.eventid).get().then((doc)=>{
                    if(doc.exists)
                    {
                        this.setState({Name:doc.data().Name});
                        this.setState({Time:doc.data().Time});
                        this.setState({Price:doc.data().Price});
                        this.setState({Date: doc.data().Date});
                        this.setState({ImageUri: doc.data().ImageUri});
                        this.GetOwner(doc.data().Owner);
                        this.setState({OwnerID: doc.data().Owner});
                        if(doc.data().Members!=null)
                        {
                            this.setState({NoOfMembers: doc.data().Members.length});
                        }
                        if(doc.data().Invites!=null)
                        {
                            this.setState({NoOfInvites: doc.data().Invites.length});
                        }
                    }
                });
                this.SetChat();
            }
            else{
                Alert.alert("","Please connect to the internet")
            }
        })

    }

    GetOwner=(OnwerID)=>{
        NetInfo.fetch().then(state=>{
            if(state.isConnected)
            {
                firestore().collection('Users').doc(OnwerID).get().then(doc=>{
                    if(doc.exists)
                    {
                        this.setState({Ownername: doc.data().Username});
                    }
                })
            }
        })
    }

    SelectImage=()=>{
        ImagePicker.openPicker({
            cropping: true,
            mediaType: 'photo'
        }).then((Image)=>{
            var StorageRef=storage().ref(`Event/Data/${this.props.route.params.eventid}/ImagePic`);
            StorageRef.putFile(Image.path).on(
                storage.TaskEvent.STATE_CHANGED,
                snapshot=>{
                    this.ShowAnimation(true);
                    if(snapshot.state==storage.TaskState.SUCCESS)
                    {
                        StorageRef.getDownloadURL().then(downloadUrl=>{
                            firestore().collection('Events').doc(this.props.route.params.eventid).update({
                                ImageUri: downloadUrl
                            })
                            this.setState({ImageUri: downloadUrl});
                            this.ShowAnimation(false);
                        })
                    }
                }
            )

        }).catch(err=>{

        })
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
        firestore().collection('Users').doc(this.props.route.params.userid).get().then(doc=>{
            var UserRequests=[];
            console.log(UserRequests);
            if(doc.data().UserRequests!=null)
            {
                UserRequests=doc.data().UserRequests;
            }
            UserRequests.push(this.props.route.params.eventid);
            firestore().collection('Users').doc(this.props.route.params.userid).update({
                UserRequests: UserRequests
            })
        })
        firestore().collection('Events').doc(this.props.route.params.eventid).get().then(doc=>{
            var EventRequests=[]
            if(doc.data().EventRequests!=null)
            {
                EventRequests=doc.data().EventRequests;
            }
            EventRequests.push(this.props.route.params.userid)
            firestore().collection('Events').doc(this.props.route.params.eventid).update({
                EventRequests: EventRequests
            })
        })
    }
                
    componentWillUnmount(){
    }
    render()
    {
        var ShowLoadingAnimation=()=>{
            if(this.state.ShowLoadingAnimation)
            {
                BackHandler.addEventListener('hardwareBackPress',this.HandleBackButton);
            return(
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    alignSelf:'center',
                    overflow: 'visible'
                }}>
              <Progress.Circle size={80} indeterminate={true} />
              </View>
            )
                  }
                  else
                  {
                    BackHandler.removeEventListener('hardwareBackPress',this.HandleBackButton);
                  }
        }
          
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
                 <Chat userid={this.props.route.params.userid} eventid={this.props.route.params.eventid} navigation={this.props.navigation} ShowAnimation={this.ShowAnimation}/>
             );
         }
     }
     var DisplayMedia=()=>{
         if(this.state.Photos)
         {
            return(
                <EventMedia userid={this.props.route.params.userid} eventid={this.props.route.params.eventid} navigation={this.props.navigation} ShowAnimation={this.ShowAnimation}/>
            );
         }
     }
     var DisplayInfo=()=>{
         if(this.state.Info)
         {
            return(
                <EventInfo userid={this.props.route.params.userid} eventid={this.props.route.params.eventid} navigation={this.props.navigation} ShowAnimation={this.ShowAnimation}/>
            );
         }
     }   
     var DisplayUsers=()=>{
        if(this.state.Users)
        {
           return(
               <EventUsers userid={this.props.route.params.userid} eventid={this.props.route.params.eventid} navigation={this.props.navigation} ShowAnimation={this.ShowAnimation} OwnerName={this.state.Ownername} EventName={this.state.Name} EventImage={this.state.ImageUri}/>
           );
        }
    }
    var DisplayEventRequests=()=>{
        if(this.state.UserRequests)
        {
            return(
                <EventRequests userid={this.props.route.params.userid} eventid={this.props.route.params.eventid} navigation={this.props.navigation}/>
            )
        }
    }   
        return(
            <View style={styles.Background}>
                {
                ShowLoadingAnimation()
                }
                <View style={styles.Description}>
                    <View style={{
                        width: 0.5*windowWidth,
                        justifyContent: 'space-evenly',
                        alignItems: 'center',
                        height: 0.25*windowHeight,
                    }}>
                    <TouchableOpacity onPress={()=>{
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
                        this.props.navigation.navigate("ShowMembers",{EventID: this.props.route.params.eventid});
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
                        this.props.navigation.navigate("ShowInvites",{EventID: this.props.route.params.eventid});
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
                    this.state.OwnerID!=this.props.route.params.userid ? 
                    <TouchableOpacity onPress={()=>{
    this.EnterEvent();
}}>
    <FontAwesomeIcon icon={faSignInAlt} size="30" color="lightblue"/>
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
                <View style={styles.Panel}>
                    <TouchableOpacity style={styles.PanelFirstButton} onPress={()=>{
                        this.SetChat();
                    }}>
                        <FontAwesomeIcon icon={faComment} color="lightblue" size="40"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.PanelButton} onPress={()=>{
                        this.SetPhotos();
                    }}>
                        <FontAwesomeIcon icon={faImage} color="lightblue" size="40"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.PanelButton} onPress={()=>{
                        this.SetInfo();
                    }}>
                        <FontAwesomeIcon icon={faInfo} color="lightblue" size="40"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.PanelButton} onPress={()=>{
                        this.SetUsers();
                    }}>
                        <FontAwesomeIcon icon={faUserCircle} color="lightblue" size="40"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.PanelLastButton} onPress={()=>{
                        this.SetUserRequests();
                    }}>
                        <FontAwesomeIcon icon={faUserFriends} color="lightblue" size="40"/>
                    </TouchableOpacity>
                </View>
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
    PanelButton:{
        backgroundColor: '#dce8e7',
        height: 50,
        justifyContent: 'center',
        alignItems:'center',
        width: 0.2*windowWidth
    },
    PanelFirstButton:{
        backgroundColor: '#dce8e7',
        height: 50,
        justifyContent: 'center',
        alignItems:'center',
        width: 0.2*windowWidth
    },
    PanelLastButton:{
        backgroundColor: '#dce8e7',
        height: 50,
        justifyContent: 'center',
        alignItems:'center',
        width: 0.2*windowWidth
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
