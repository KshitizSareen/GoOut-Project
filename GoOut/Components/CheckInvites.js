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

class CheckInvites extends Component{
    constructor(){
        super();
        this.state={
            Invites:[],
            UserName:"",
            DisplayPic:""
        }
    }
    componentDidMount(){
        console.log(10);
        this.FetchInvites();
        messaging().onMessage(async msg=>{
            console.log("message received");
            this.FetchInvites();
        })
    }
    FetchInvites=()=>{
        firestore().collection('Users').doc(this.props.route.params.UserID).get().then(doc=>{
            console.log(doc.data());
            if(doc.data().InvitedBy!=null)
            {
                this.setState({Invites: doc.data().InvitedBy});
            }
            this.setState({UserName:doc.data().Username});
            this.setState({DisplayPic: doc.data().Image});
        })
    }
    AddUser=(Invite,index)=>{
        firestore().collection('Events').doc(Invite.EventID).get().then(Event=>{
            var Members=[];
            if(Event.data().Members!=null)
            {
                Members=Event.data().Members;
            }
            Members.push(
                {
                    UserID: this.props.route.params.UserID,
                    UserDP: this.state.DisplayPic,
                    UserName: this.state.UserName
                }
            );
            var Invites=[];
            if(Event.data().Invites!=null)
            {
                Invites=Event.data().Invites;
            }
            var UserIndex;
            for(var i=0;i<Invites.length;i++)
            {
                if(Invites[i].UserID==this.props.route.params.UserID)
                {
                    UserIndex=i;
                    break;
                }
            }
            Invites.splice(UserIndex,1);
            firestore().collection('Events').doc(Invite.EventID).update({
                Members: Members,
                Invites: Invites
            })
            firestore().collection('Users').doc(this.props.route.params.UserID).get().then(User=>{
                var MembersOf=[];
                if(User.data().MembersOf!=null)
                {
                    MembersOf=User.data().MembersOf;
                }
                MembersOf.push({
                    EventName: Event.data().Name,
                    EventUri: Event.data().ImageUri,
                    EventID: Invite.EventID
                })
                var InvitedBy=this.state.Invites;
                InvitedBy.splice(index,1);
                firestore().collection('Users').doc(this.props.route.params.UserID).update({
                    MembersOf: MembersOf,
                    InvitedBy: InvitedBy
                })
                this.setState({Invites: InvitedBy});
            })
        })
    }
    RemoveUser=(index)=>{
        var InvitedBy=this.state.Invites;
                firestore().collection('Events').doc(InvitedBy[index].EventID).get().then(doc=>{
                    var Invites=[];
                    if(doc.data().Invites!=null)
                    {
                        Invites=doc.data().Invites;
                    }
                    var Userindex;
                    for(var i=0;i,Invites.length;i++)
                    {
                        if(Invites[i].UserID==this.props.route.params.UserID)
                        {
                            Userindex=i;
                            break;
                        }
                    }
                    Invites.splice(Userindex,1);
                    firestore().collection('Events').doc(doc.id).update({
                        Invites: Invites
                    })
                })
                InvitedBy.splice(index,1);
                firestore().collection('Users').doc(this.props.route.params.UserID).update({
                    InvitedBy: InvitedBy
                })
                this.setState({Invites: InvitedBy});
    }

    render(){
        var ShowInvites=()=>{
            return(
                <FlatList style={{marginTop: '2%'}} data={this.state.Invites} renderItem={(data)=>{
                    console.log(data.item);
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
                                uri: data.item.EventDP,
                                priority: FastImage.priority.high,
                            }} style={{
                                width: 0.1*windowWidth,
                                height: 0.1*windowWidth,
                                borderRadius: 50,
                                margin: '1%'
                            }}/>
                            <Text style={{fontSize: 15,width: 0.55*windowWidth,alignSelf: 'center'}}>{data.item.OwnerName+" has invited you to "+data.item.EventName}</Text>
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