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
            Message: "",
            Messages: [],
            User: null,
            modalUploadVisible: false,
            Media:[],
            Caption: "",
            ImageUrls: [],
            ShowLoadingAnimation: false,
            ShowIndicator: false,
            ImageUri: "https://firebasestorage.googleapis.com/v0/b/goout-4391e.appspot.com/o/a1695e7b-5875-4314-bf70-b50c4a0386f3_200x200.png?alt=media&token=8c962cb0-02e9-4f51-bec2-e2699cebcfac",
            Users: false
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
                    }
                });
                this.SetChat();
                messaging().onMessage(msg=>{
                    console.log(msg.data);
                })
            }
            else{
                Alert.alert("","Please connect to the internet")
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
    }
    SetPhotos=()=>{
        this.setState({Chat:false});
        this.setState({Photos:true});
        this.setState({Info: false});
        this.setState({Users: false});
    }
    SetUsers=()=>{
        this.setState({Chat:false});
        this.setState({Photos:false});
        this.setState({Info: false});
        this.setState({Users: true});
    }
    SetInfo=()=>{
        this.setState({Chat:false});
        this.setState({Photos:false});
        this.setState({Info: true});
        this.setState({Users: false});
    }
    ShowAnimation=(value)=>{
        this.setState({ShowLoadingAnimation: value});
    }
    HandleBackButton(){
        return true;
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
         return <Text style={styles.TextDetails}>{this.state.Price}</Text>
         }
         else{
             return <Text style={styles.TextDetails}>Free</Text>
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
               <EventUsers userid={this.props.route.params.userid} eventid={this.props.route.params.eventid} navigation={this.props.navigation} ShowAnimation={this.ShowAnimation}/>
           );
        }
    }   
        return(
            <View style={styles.Background}>
                {
                ShowLoadingAnimation()
                }
                <View style={styles.Description}>
                    <TouchableOpacity onPress={()=>{
                        this.SelectImage();
                }}><FastImage source={{
                    uri: this.state.ImageUri,
                    priority: FastImage.priority.low
                }} style={styles.Image} /></TouchableOpacity>
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
                        <Text style={styles.PanelText}>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.PanelButton} onPress={()=>{
                        this.SetPhotos();
                    }}>
                        <Text style={styles.PanelText}>Media</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.PanelButton} onPress={()=>{
                        this.SetInfo();
                    }}>
                        <Text style={styles.PanelText}>Info</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.PanelLastButton} onPress={()=>{
                        this.SetUsers();
                    }}>
                        <Text style={styles.PanelText}>Members</Text>
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
        justifyContent: 'space-between',
        margin: '5%',
    },
    Image:{
        width: 0.4*windowWidth,
        height: 0.2*windowHeight,
        borderRadius: 5,
        marginRight: '2.5%'
    },
    TextContainer:
    {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'column',
        marginLeft: '2.5%'
    },
    TextDetails:{
        fontSize: 20,
        backgroundColor: '#dce8e7',
        padding: '0.5%',
        textAlign: 'center',
        elevation: 5,
        borderRadius: 10,
        width: 0.4*windowWidth

    },
    Panel:{
        flexDirection: 'row',
        height: 50,
        justifyContent: 'space-between',
        backgroundColor: 'lightblue',
        alignItems: 'stretch'
    },
    PanelButton:{
        backgroundColor: '#dce8e7',
        height: 50,
        borderRightColor: 'black',
        borderRightWidth: 2,
        borderLeftWidth: 2,
        elevation: 5,
        width: 0.25*windowWidth,
    },
    PanelFirstButton:{
        backgroundColor: '#dce8e7',
        height: 50,
        borderRightColor: 'black',
        borderRightWidth: 2,
        elevation: 5,
        width: 0.25*windowWidth,
    },
    PanelLastButton:{
        backgroundColor: '#dce8e7',
        height: 50,
        borderLeftColor: 'black',
        borderLeftWidth: 2,
        elevation: 5,
        width: 0.25*windowWidth,
    },
    PanelText:{
        textAlign: 'center',
        paddingTop: '10%',
        fontSize: 21
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