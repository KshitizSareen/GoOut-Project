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

class MyEvents extends Component{
    constructor(){
        super();
        this.state={
            Events:[],
            Images:[],
            EventNames:[],
        }
    }
    componentDidMount(){
        console.log(80);
            this.GetEvents();
    }
    GetEvents=()=>{
       firestore().collection('Users').doc(this.props.route.params.UserID).get().then((doc)=>{
           var Events=[];
           if(doc.data().MembersOf!=null)
           {
               Events=doc.data().MembersOf;
           }
           this.setState({Events: Events});
           this.GetExternalData();
       })
    }
    GetExternalData=()=>{
        for(var i=0;i<this.state.Events.length;i++)
        {
            var EventID=this.state.Events[i];
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
    ExitEvent=(Event)=>{
            var MembersOf=this.state.Events;
            var Eventindex;
            for(var i=0;i<MembersOf.length;i++)
            {
                if(MembersOf[i]==Event)
                {
                    Eventindex=i;
                    break;
                }
            }
            MembersOf.splice(Eventindex,1);
            firestore().collection('Users').doc(this.props.route.params.UserID).update({
                MembersOf: MembersOf
            })
            this.setState({Events: MembersOf});
        firestore().collection('Events').doc(Event).get().then(doc=>{
            var Members=[]
            if(doc.data().Members!=null)
            {
                Members=doc.data().Members;
            }
            var UserIndex;
            for(var i=0;i<Members.length;i++)
            {
                if(Members[i]==this.props.route.params.UserID)
                {
                    UserIndex=i;
                    break;
                }
            }
            Members.splice(UserIndex,1);
            firestore().collection('Events').doc(Event).update({
                Members: Members
            })
        })
    }
    componentWillUnmount(){
        console.log("exited");
    }
    render(){
        var ShowEvents=()=>{
            return(
                <FlatList style={{marginTop: '2%'}} data={this.state.Events} renderItem={(data)=>{
                    return(
                        <View style={{
                            width: 0.95*windowWidth,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1%',
                            backgroundColor: 'lightblue',
                            marginBottom: '2%',
                            borderRadius: 10,
                            flexDirection: 'row'
                        }}>
                        <TouchableOpacity style={{
                            flexDirection: 'row',
                            width: 0.75*windowWidth,
                            justifyContent: 'space-evenly'
                        }} onPress={()=>{
                            this.props.navigation.navigate("Content",{userid: this.props.route.params.UserID,eventid:data.item,EventName: this.state.EventNames[data.index]});
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
                            <Text style={{fontSize: 15,width: 0.55*windowWidth,alignSelf: 'center'}}>{this.state.EventNames[data.index]}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>{
                                this.ExitEvent(data.item);
                            }}>
                                <FontAwesomeIcon icon={faMinus} size="20"/>
                            </TouchableOpacity>
                            </View>
                    )
                }}/>
            )
        }
        var ShowNoEvents=()=>{
            return(
                <View>
                    <Text style={{
                        alignSelf: 'center',
                        fontSize: 40
                    }}>0</Text>
                    <Text style={{
                        alignSelf: 'center',
                        fontSize: 40
                    }}>Events</Text>
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
                    this.state.Events.length >0 ? ShowEvents() : ShowNoEvents()
                }
            </View>
        )
    }
}
export default MyEvents;