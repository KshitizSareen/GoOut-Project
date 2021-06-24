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

class UserRequests extends Component{
    constructor(){
        super();
        this.state={
            Requests:[],
            Images:[],
            EventNames:[]
        }
    }
    componentDidMount(){
        this.GetUserRequests();

    }
    GetUserRequests=()=>{
        firestore().collection('Users').doc(this.props.route.params.UserID).get().then(User=>{
            var UserRequests=[];
            if(User.data().UserRequests!=null)
            {
                UserRequests=User.data().UserRequests;
            }
            this.setState({Requests: UserRequests});
            this.GetExternalData();
        })
    }
    GetExternalData=()=>{
        for(var i=0;i<this.state.Requests.length;i++)
        {
            var EventID=this.state.Requests[i];
        firestore().collection('Events').doc(EventID).get().then(doc=>{
            var Images=this.state.Images;
            Images.push(doc.data().ImageUri);
            this.setState({Images: Images});
            var EventNames=this.state.EventNames;
            EventNames.push(doc.data().Name);
            this.setState({EventNames: EventNames});
        })
    }
    }
    RemoveUser=(Event)=>{
        firestore().collection('Users').doc(this.props.route.params.UserID).get().then(doc=>{
            var UserRequests=[];
            if(doc.data().UserRequests!=null)
            {
                UserRequests=doc.data().UserRequests;
            }
            var EventIndex;
            for(var i=0;i<UserRequests.length;i++)
            {
                if(UserRequests[i]==Event)
                {
                    EventIndex=i;
                    UserRequests.splice(EventIndex,1);
                    break;
                }
            }
            firestore().collection('Users').doc(this.props.route.params.UserID).update({
                UserRequests: UserRequests
            })
            this.setState({Requests: UserRequests});
        })
        firestore().collection('Events').doc(Event).get().then(doc=>{
            var EventRequests=[];
            if(doc.data().EventRequests!=null)
            {
                EventRequests=doc.data().EventRequests;
            }
            var UserIndex;
            for(var i=0;i<EventRequests.length;i++)
            {
                if(EventRequests[i]==this.props.route.params.UserID)
                {
                    UserIndex=i;
                    EventRequests.splice(UserIndex,1);
                    break;
                }
            }
            firestore().collection('Events').doc(Event).update({
                EventRequests: EventRequests
            })
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
                            <Text style={{fontSize: 15,width: 0.55*windowWidth,alignSelf: 'center'}}>{"You hava requested  to join "+ this.state.EventNames[data.index]}</Text>
                            <View style={{
                                flexDirection: 'row',
                                width: 0.3*windowWidth,
                                justifyContent: 'space-evenly',
                                margin: '1%'
                            }}>
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
                    <Text style={{
                        alignSelf: 'center',
                        fontSize: 40
                    }}>Sent</Text>
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
                    this.state.Requests.length >0 ? ShowRequests() : ShowNoRequests()
                }
            </View>
        )
    }
}
export default UserRequests;