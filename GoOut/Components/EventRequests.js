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

class EventRequests extends Component{
    constructor(){
        super();
        this.state={
            Requests:[],
            Images:[],
            UserNames:[]
        }
    }
    componentDidMount(){
        this.GetEventRequests();

    }
    GetEventRequests=()=>{
        firestore().collection('Events').doc(this.props.eventid).get().then(Event=>{
            var EventRequests=[];
            if(Event.data().EventRequests!=null)
            {
                EventRequests=Event.data().EventRequests;
            }
            this.setState({Requests: EventRequests});
            this.GetExternalData();
        })
    }
    GetExternalData=()=>{
        for(var i=0;i<this.state.Requests.length;i++)
        {
            var UserID=this.state.Requests[i];
        firestore().collection('Users').doc(UserID).get().then(doc=>{
            var Images=this.state.Images;
            Images.push(doc.data().Image);
            this.setState({Images: Images});
            var UserNames=this.state.UserNames;
            UserNames.push(doc.data().Username);
            this.setState({UserNames: UserNames});
        })
    }
    }
    AddUser=(User)=>{
        firestore().collection('Users').doc(User).get().then(doc=>{
            var MembersOf=[];
            if(doc.data().MembersOf!=null)
            {
                MembersOf=doc.data().MembersOf;
            }
            MembersOf.push(this.props.eventid);
            var UserRequests=[];
            if(doc.data().UserRequests!=null)
            {
                UserRequests=doc.data().UserRequests;
            }
            var EventIndex;
            for(var i=0;i<UserRequests.length;i++)
            {
                if(UserRequests[i]==this.props.eventid)
                {
                    EventIndex=i;
                    UserRequests.splice(EventIndex,1);
                    break;
                }
            }
            firestore().collection('Users').doc(User).update({
                MembersOf: MembersOf,
                UserRequests: UserRequests
            })
        })
        firestore().collection('Events').doc(this.props.eventid).get().then(Event=>{
            var Members=[];
            if(Event.data().Members!=null)
            {
                Members=Event.data().Members;
            }
            Members.push(User);
            var EventRequests=[];
            if(Event.data().EventRequests!=null)
            {
                EventRequests=Event.data().EventRequests;
            }
            var UserIndex;
            for(var i=0;i<EventRequests.length;i++)
            {
                if(EventRequests[i]==User)
                {
                    UserIndex=i;
                    EventRequests.splice(UserIndex,1);
                    break;
                }
            }
            firestore().collection('Events').doc(this.props.eventid).update({
                Members: Members,
                EventRequests: EventRequests
            })
            this.setState({Requests: EventRequests});
        })

    }
    RemoveUser=(User)=>{
        firestore().collection('Users').doc(User).get().then(doc=>{
            var UserRequests=[];
            if(doc.data().UserRequests!=null)
            {
                UserRequests=doc.data().UserRequests;
            }
            var EventIndex;
            for(var i=0;i<UserRequests.length;i++)
            {
                if(UserRequests[i]==this.props.eventid)
                {
                    EventIndex=i;
                    UserRequests.splice(EventIndex,1);
                    break;
                }
            }
            firestore().collection('Users').doc(User).update({
                UserRequests: UserRequests
            })
        })
        firestore().collection('Events').doc(this.props.eventid).get().then(Event=>{
            var EventRequests=[];
            if(Event.data().EventRequests!=null)
            {
                EventRequests=Event.data().EventRequests;
            }
            var UserIndex;
            for(var i=0;i<EventRequests.length;i++)
            {
                if(EventRequests[i]==User)
                {
                    UserIndex=i;
                    EventRequests.splice(UserIndex,1);
                    break;
                }
            }
            firestore().collection('Events').doc(this.props.eventid).update({
                EventRequests: EventRequests
            })
            this.setState({Requests: EventRequests});
        })
    }

    render(){
        var ShowRequests=()=>{
            return(
                <FlatList style={{marginTop: '2%'}} data={this.state.Requests} renderItem={(data)=>{
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
                            <Text style={{fontSize: 15,width: 0.55*windowWidth,alignSelf: 'center'}}>{this.state.UserNames[data.index]+" has requested to join the event"}</Text>
                            <View style={{
                                flexDirection: 'row',
                                width: 0.3*windowWidth,
                                justifyContent: 'space-evenly',
                                margin: '1%'
                            }}>
                            <TouchableOpacity onPress={()=>{
                                this.AddUser(data.item);
                            }}>
                                <FontAwesomeIcon icon={faCheck} size="20"/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>{
                                this.RemoveUser(data.item);
                            }}>
                                <FontAwesomeIcon icon={faTimes} size="20"/>
                            </TouchableOpacity>
                            </View>
                            </View>
                    )
                }}/>
            )
        }
        var ShowNoRequests=()=>{
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
                    this.state.Requests.length >0 ? ShowRequests() : ShowNoRequests()
                }
            </View>
        )
    }
}
export default EventRequests;