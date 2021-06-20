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

    }
    GetEventRequests=()=>{

    }
    AddUser=(User,index)=>{

    }
    RemoveUser=(index)=>{
        
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
                            <Text style={{fontSize: 15,width: 0.55*windowWidth,alignSelf: 'center'}}>{"You have been invited to "+this.state.UserNames[data.index]}</Text>
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
export default EventRequests;