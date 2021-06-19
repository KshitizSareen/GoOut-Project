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
            Events:[]
        }
    }
    componentDidMount(){
        this.focusEvent=this.props.navigation.addListener('focus',()=>{
            this.GetEvents();
        });
    }
    GetEvents=()=>{
       firestore().collection('Users').doc(this.props.route.params.UserID).get().then((doc)=>{
           var Events=[];
           if(doc.data().MembersOf!=null)
           {
               Events=doc.data().MembersOf;
           }
           this.setState({Events: Events});
       })
    }
    componentWillUnmount(){
    }
    render(){
        var ShowEvents=()=>{
            return(
                <FlatList style={{marginTop: '2%'}} data={this.state.Events} renderItem={(data)=>{
                    return(
                        <TouchableOpacity style={{
                            alignItems: 'center',
                            width: 0.95*windowWidth,
                            padding: '1%',
                            backgroundColor: 'lightblue',
                            marginBottom: '2%',
                            borderRadius: 10,
                            flexDirection: 'row'
                            
                        }}>
                            <FastImage source={{
                                uri: data.item.EventUri,
                                priority: FastImage.priority.high,
                            }} style={{
                                width: 0.1*windowWidth,
                                height: 0.1*windowWidth,
                                borderRadius: 50,
                                margin: '1%'
                            }}/>
                            <Text style={{fontSize: 15,width: 0.55*windowWidth,alignSelf: 'center'}}>{data.item.EventName}</Text>
                            </TouchableOpacity>
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