import React, {Component} from 'react';
import NetInfo from '@react-native-community/netinfo';
import { View,StyleSheet,Text, Alert,Dimensions,TouchableOpacity, TextInput,Image } from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import CheckBox from '@react-native-community/checkbox';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Modal from 'react-native-modal';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCannabis, faCheck, faCross, faInbox, faMinus, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import FastImage from 'react-native-fast-image';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

class CheckInvites extends Component{
    constructor(){
        super();
        this.state={
            Invites:[],
            Images:[],
            EventNames:[],
        }
    }
    componentDidMount(){
        this.FetchInvites();
        messaging().onMessage(async msg=>{
            this.FetchInvites();
        })
    }

    GetExternalData=()=>{
        var Images=[];
        var EventNames=[];
        for(var i=0;i<this.state.Invites.length;i++)
        {
            var EventID=this.state.Invites[i];
        firestore().collection('Events').doc(EventID).get().then(doc=>{
            Images.push(doc.data().ImageUri);
            this.setState({Images: Images});
            EventNames.push(doc.data().Name);
            this.setState({EventNames: EventNames});
        })
    }
    }

    FetchInvites=()=>{
        firestore().collection('Users').doc(this.props.route.params.UserID).get().then(doc=>{
            if(doc.data().InvitedBy!=null)
            {
                this.setState({Invites: doc.data().InvitedBy});
            }
            this.GetExternalData();
        });
    }
    AddUser=(Invite,index)=>{
        var EventDoc=firestore().collection('Events').doc(Invite);
        var UserDoc=firestore().collection('Users').doc(this.props.route.params.UserID);
        var InvitedBy=this.state.Invites;
        firestore().runTransaction(async transaction=>{
            const Event=await transaction.get(EventDoc);
            var Members=[];
            if(Event.data().Members!=null)
            {
                Members=Event.data().Members;
            }
            Members.push(this.props.route.params.UserID );
            var Invites=[];
            if(Event.data().Invites!=null)
            {
                Invites=Event.data().Invites;
            }
            var UserIndex;
            for(var i=0;i<Invites.length;i++)
            {
                if(Invites[i]==this.props.route.params.UserID)
                {
                    UserIndex=i;
                    Invites.splice(UserIndex,1);
                    break;
                }
            }
            transaction.update(EventDoc,{
                Members: Members,
                Invites: Invites
            })
            const User=await transaction.get(UserDoc);
                var MembersOf=[];
                if(User.data().MembersOf!=null)
                {
                    MembersOf=User.data().MembersOf;
                }
                MembersOf.push(Invite)
                if(User.data().InvitedBy!=null)
                {
                    InvitedBy=User.data().InvitedBy;
                }
                var EventIndex=null;
                for(var i=0;i<InvitedBy.length;i++)
                {
                    if(InvitedBy[i]==Invite)
                    {
                        EventIndex=i;
                        InvitedBy.splice(EventIndex,1);
                        break;
                    }
                }
                transaction.update(UserDoc,{
                    MembersOf: MembersOf,
                    InvitedBy: InvitedBy
                })
        }).then(()=>{
            this.FetchInvites();
            firestore().collection('Events').doc(Invite).get().then(Event=>{
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
"notification":{
"title": "GoOut",
"body": User.data().Username +" has joined "+Event.data().Name
}
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
        }).catch((err)=>{
            console.log(err);
            Alert.alert("","Please check your network connection");
        })
    }
    RemoveUser=(index)=>{
        var InvitedBy=this.state.Invites;
        var EventDoc=firestore().collection('Events').doc(InvitedBy[index]);
        var UserDoc=firestore().collection('Users').doc(this.props.route.params.UserID);
        firestore().runTransaction(async transaction=>{
            var doc=await transaction.get(EventDoc);
            var Invites=[];
                    if(doc.data().Invites!=null)
                    {
                        Invites=doc.data().Invites;
                    }
                    var Userindex;
                    for(var i=0;i,Invites.length;i++)
                    {
                        if(Invites[i]==this.props.route.params.UserID)
                        {
                            Userindex=i;
                            Invites.splice(Userindex,1);
                            break;
                        }
                    } 
                    transaction.update(EventDoc,{
                        Invites: Invites
                    })
                    var User=await transaction.get(UserDoc);
                    if(User.data().InvitedBy!=null)
                    {
                        InvitedBy=User.data().InvitedBy;
                    }
                    var EventIndex=null;
                    for(var i=0;i<InvitedBy.length;i++)
                    {
                        if(InvitedBy[i]==InvitedBy[index])
                        {
                            EventIndex=i;
                            InvitedBy.splice(EventIndex,1);
                            break;
                        }
                    }
                    transaction.update(UserDoc,{
                        InvitedBy: InvitedBy
                    })
        }).then(()=>{
            this.FetchInvites();
            firestore().collection('Events').doc(InvitedBy[index]).get().then(Event=>{
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
        }).catch((err)=>{
            console.log(err);
            Alert.alert("","Please check your network connection");
        })
    }

    render(){
        var ShowInvites=()=>{
            return(
                <FlatList style={{marginTop: '2%'}} data={this.state.Invites} renderItem={(data)=>{
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
                            <FastImage source={{
                                uri: this.state.Images[data.index],
                                priority: FastImage.priority.high,
                            }} style={{
                                width: 0.1*windowWidth,
                                height: 0.1*windowWidth,
                                borderRadius: 50,
                                margin: '1%'
                            }}/>
                            <Text style={{fontSize: 15,width: 0.55*windowWidth,alignSelf: 'center'}}>{"You have been invited to "+this.state.EventNames[data.index]}</Text>
                            <View style={{
                                flexDirection: 'row',
                                width: 0.3*windowWidth,
                                justifyContent: 'space-evenly',
                                margin: '1%'
                            }}>
                            <TouchableOpacity onPress={()=>{
                                this.AddUser(data.item,data.index);
                            }}>
                                <FontAwesomeIcon icon={faCheck} size="20"/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>{
                                this.RemoveUser(data.index);
                            }}>
                                <FontAwesomeIcon icon={faTimes} size="20"/>
                            </TouchableOpacity>
                            </View>
                            </View>
                    )
                }}/>
            )
        }
        var ShowNoInvites=()=>{
            return(
                <View>
                    <Text style={{
                        alignSelf: 'center',
                        fontSize: 40
                    }}>0</Text>
                    <Text style={{
                        alignSelf: 'center',
                        fontSize: 40
                    }}>Invites</Text>
                    <FontAwesomeIcon style={{
                        marginTop: '5%',
                        alignSelf: 'center'
                    }} icon={faInbox} size={(0.5*windowWidth).toString()} color="lightblue"/>
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
                    this.state.Invites.length >0 ? ShowInvites() : ShowNoInvites()
                }
            </View>
        )
    }
}
export default CheckInvites;