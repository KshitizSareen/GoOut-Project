import React, {Component} from 'react';
import NetInfo from '@react-native-community/netinfo';
import { View,StyleSheet,Text, Alert,Dimensions,TouchableOpacity, TextInput,Image } from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import CheckBox from '@react-native-community/checkbox';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Modal from 'react-native-modal';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCannabis, faCheck, faCross, faInbox, faMinus, faPlus, faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import FastImage from 'react-native-fast-image';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

class ShowMembers extends Component{
    constructor(){
        super();
        this.state={
            Members:[],
            Images:[],
            UserNames:[],
        }
    }
    componentDidMount(){
        this.FetchMembers();
        messaging().onMessage(async mess=>{
            this.FetchMembers();
        })
    }
    FetchMembers=()=>{
        firestore().collection('Events').doc(this.props.route.params.EventID).get().then(doc=>{
            if(doc.data().Members!=null)
            {
                this.setState({Members: doc.data().Members});
            }
            this.GetExternalData();
        })
    }
    GetExternalData=()=>{
        var Images=[];
        var UserNames=[];
        for(var i=0;i<this.state.Members.length;i++)
        {
            var UserID=this.state.Members[i];
        firestore().collection('Users').doc(UserID).get().then(doc=>{
            Images.push(doc.data().Image);
            this.setState({Images: Images});
            UserNames.push(doc.data().Username);
            this.setState({UserNames: UserNames});
        })
    }
    }
   RemoveUser=(index)=>{
        var Members=this.state.Members;
        var UserDoc=firestore().collection('Users').doc(Members[index]);
        var EventDoc=firestore().collection('Events').doc(this.props.route.params.EventID)
        var UserId=Members[index];
                firestore().runTransaction(async transaction=>{
                    var doc=await transaction.get(UserDoc);
                    var MembersOf=[];
                    if(doc.data().MembersOf!=null)
                    {
                        MembersOf=doc.data().MembersOf;
                    }
                    var Eventindex;
                    for(var i=0;i<MembersOf.length;i++)
                    {
                        if(MembersOf[i]==this.props.route.params.EventID)
                        {
                            Eventindex=i;
                            MembersOf.splice(Eventindex,1);
                            break;
                        }
                    }
                    transaction.update(UserDoc,{
                        MembersOf: MembersOf
                    })
                    var Event=await transaction.get(EventDoc);
                    if(Event.data().Members!=null)
                    {
                        Members=Event.data().Members;
                    }
                    var UserIndex;
                    for(var i=0;i<Members.length;i++)
                    {
                        if(Members[i]==Members[index])
                        {
                            UserIndex=i;
                            Members.splice(UserIndex,1);
                            break;
                        }
                    }
                    transaction.update(EventDoc,{
                        Members: Members
                    })
                }).then(()=>{
                    this.FetchMembers();
                    firestore().collection('Users').doc(UserId).get().then(User=>{
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
                    firestore().collection('Events').doc(this.props.route.params.EventID).get().then(Event=>{
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
                }).catch(err=>{
                    console.log(err);
            Alert.alert("","Please check your network connection");
                })
    }

    render(){
        var ShowMembers=()=>{
            return(
                <FlatList style={{marginTop: '2%'}} data={this.state.Members} renderItem={(data)=>{
                    return(
                        <View style={{
                            alignItems: 'center',
                            width: 0.95*windowWidth,
                            padding: '1%',
                            backgroundColor: 'lightblue',
                            marginBottom: '2%',
                            borderRadius: 10,
                            flexDirection: 'row'
                            
                        }}>
                           <TouchableOpacity style={{
                                flexDirection: 'row',
                                width: 0.65*windowWidth,
                                justifyContent: 'space-evenly'
                            }} onPress={()=>{
                                this.props.navigation.navigate("UserInfo",{userid: data.item})
                            }}>
                            <FastImage source={{
                                uri: this.state.Images[data.index],
                                priority: FastImage.priority.high,
                            }} style={{
                                width: 0.1*windowWidth,
                                height: 0.1*windowWidth,
                                borderRadius: 50,
                                margin: '1%'
                            }}/>
                            <Text style={{fontSize: 15,width: 0.5*windowWidth,alignSelf: 'center'}}>{this.state.UserNames[data.index]}</Text>
                            </TouchableOpacity> 
                            {
                                this.props.route.params.OwnerID == this.props.route.params.UserID ? 
                            <View style={{
                                flexDirection: 'row',
                                width: 0.3*windowWidth,
                                justifyContent: 'space-evenly',
                                margin: '1%'
                            }}>
                            <TouchableOpacity onPress={()=>{
                                this.RemoveUser(data.index);
                            }}>
                                <FontAwesomeIcon icon={faMinus} size="20"/>
                            </TouchableOpacity>
                            </View>:
                            null
                }
                            </View>
                    )
                }}/>
            )
        }
        var ShowNoMembers=()=>{
            return(
                <View>
                    <Text style={{
                        alignSelf: 'center',
                        fontSize: 40
                    }}>0</Text>
                    <Text style={{
                        alignSelf: 'center',
                        fontSize: 40
                    }}>Members</Text>
                    <FontAwesomeIcon style={{
                        marginTop: '5%',
                        alignSelf: 'center'
                    }} icon={faUser} size={(0.5*windowWidth).toString()} color="lightblue"/>
                </View>
            )
        }
        return(
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                {
                    this.state.Members.length >0 ? ShowMembers() : ShowNoMembers()
                }
            </View>
        )
    }
}
export default ShowMembers;