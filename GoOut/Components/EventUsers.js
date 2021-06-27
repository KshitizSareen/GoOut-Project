import React, {Component} from 'react';
import NetInfo from '@react-native-community/netinfo';
import { View,StyleSheet,Text, Alert,Dimensions,TouchableOpacity, TextInput,Image } from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import CheckBox from '@react-native-community/checkbox';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Modal from 'react-native-modal';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import FastImage from 'react-native-fast-image';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
const axios = require('axios').default ;

class EventUsers extends Component{
    constructor(){
        super()
        this.state={
            Username:"",
            Users:[],
            Members:[],
            Ownerid:"",
            EventRequests:[]
        }
    }
    componentDidMount(){
        firestore().collection('Events').doc(this.props.eventid).get().then(event=>{
            this.setState({Ownerid: event.data().Owner});
        })
    }
    SearchUsers=(Username)=>{
        if(Username!="")
        {
            firestore().collection('Events').doc(this.props.eventid).get().then(EventData=>{
                var Members=[];
                if(EventData.data().Members!=null)
                {
                    Members=EventData.data().Members;
                }
                var EventRequests=[];
                if(EventData.data().EventRequests!=null)
                {
                    EventRequests=EventData.data().EventRequests;
                }
                this.setState({EventRequests: EventRequests});
                this.setState({Members: Members});
            })
            firestore().collection('Users').where("userid","!=",auth().currentUser.uid).where("SearchArray","array-contains",Username.toLowerCase()).limit(1000).get().then(res=>{
                this.setState({Users: res.docs});
            })
        }
    }
    AddUser=(User,index)=>{
        var UserDoc=firestore().collection('Users').doc(User.id);
        var EventDoc=firestore().collection('Events').doc(this.props.eventid);
        firestore().runTransaction(async transaction=>{
            var UserData=await transaction.get(UserDoc);
            var InvitedEvents=[];
                  if(UserData.data().InvitedBy!=null)
                  {
                      InvitedEvents=UserData.data().InvitedBy;
                  }
                  InvitedEvents.push(this.props.eventid);
                  transaction.update(UserDoc,{
                    InvitedBy: InvitedEvents
                  })
                  var Event=await transaction.get(EventDoc);
                  var Invites=[];
                          if(Event.data().Invites!=null)
                          {
                              Invites=Event.data().Invites;
                          }
                          Invites.push(User.id);
                          transaction.update(EventDoc,{
                            Invites: Invites
                          })
        }).then(()=>{
            this.SearchUsers(this.state.Username);
                    /*axios.post("https://fcm.googleapis.com/fcm/send",{
                        "to" : User.data().NotificationToken,
           "notification" : {
               "body" : "You have been invited to "+this.props.EventName+"\n"+"Check your app for invites",
               "title": "Event Invite"
           },
           "data":{
          
           }
          },{
                        headers:{
                          Authorization: "key=AAAA7tNMKV0:APA91bEZHjBk7k1YayjyS_7HrM8rznxOyH-_1GHWH58hqyvmVMoBPMCCsQ23G-9W16gJhh2RyDVE4qSWn5y2QiX3MG39hv1javY_34IJNE5PpWdMKa-QHSXaXop8nxpZc5-VsP2OTzXd",
                          "Content-Type": "application/json"
                        },
                    })*/
        }).catch(err=>{
            console.log(err);
            Alert.alert("","Please check your network connection");
        })
    }
    RemoveUser=(index)=>{
        var User=this.state.Users[index];
        var UserDoc=firestore().collection('Users').doc(User.id);
        var EventDoc=firestore().collection('Events').doc(this.props.eventid);
            firestore().runTransaction(async transaction=>{
                var InvitedEvents=[];
                var user=await transaction.get(UserDoc);
                if(user.data().InvitedBy!=null)
                {
                    InvitedEvents=user.data().InvitedBy;
                }
                var eventIndex;
                for(var i=0;i<InvitedEvents.length;i++)
                {
                    if(InvitedEvents[i]==this.props.eventid)
                    {
                        eventIndex=i;
                        InvitedEvents.splice(eventIndex,1);
                        break;
                    }
                }
                transaction.update(UserDoc,{
                    InvitedBy: InvitedEvents
                })
                var Event=await transaction.get(EventDoc);
                var Invites=[];
                        if(Event.data().Invites!=null)
                        {
                            Invites=Event.data().Invites;
                        }
                        var UserIndex;
                        for(var i=0;i<Invites.length;i++)
                {
                    if(Invites[i]==User.id)
                    {
                        UserIndex=i;
                        Invites.splice(UserIndex,1);
                        break;
                    }
                }
                transaction.update(EventDoc,{
                    Invites: Invites
                })
            }).then(()=>{
                this.SearchUsers(this.state.Username);
                    /*axios.post("https://fcm.googleapis.com/fcm/send",{
              "to" : User.data().NotificationToken,
 "data":{

 }
},{
              headers:{
                Authorization: "key=AAAA7tNMKV0:APA91bEZHjBk7k1YayjyS_7HrM8rznxOyH-_1GHWH58hqyvmVMoBPMCCsQ23G-9W16gJhh2RyDVE4qSWn5y2QiX3MG39hv1javY_34IJNE5PpWdMKa-QHSXaXop8nxpZc5-VsP2OTzXd",
                "Content-Type": "application/json"
              },
          })
            }).catch(err=>{
                console.log(err);
            Alert.alert("","Please check your network connection");
            */
            })
    }
    render(){
        var ShowAdd=(index)=>{
            return(
                <TouchableOpacity style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                }} onPress={()=>{
                    this.AddUser(index);
                }}>
                    <FontAwesomeIcon icon={faPlus} size="20"/>
                </TouchableOpacity>
            )
        }
        var ShowRemove=(index)=>{
            return(
                <TouchableOpacity style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                }} onPress={()=>{
                    this.RemoveUser(index);
                }}>
                    <FontAwesomeIcon icon={faMinus} size="20"/>
                </TouchableOpacity>
            )
        }
        return(
            <View style={styles.background}>
                <TextInput style={styles.searchbar} placeholder="Search Users" value={this.state.Username} placeholderTextColor="black" onChange={(value)=>{
                    this.setState({Username:value.nativeEvent.text});
                    this.SearchUsers(value.nativeEvent.text);
                }}/>
                <FlatList data={this.state.Users} renderItem={(data)=>{
                    if(!this.state.Members.includes(data.item.id) && !this.state.EventRequests.includes(data.item.id) && data.item.id!=this.state.Ownerid)
                    {
                    return(
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: 0.9*windowWidth,
                            backgroundColor: 'lightblue',
                            padding: '2%',
                            borderRadius: 10,
                            marginBottom: '2%'
                        }}>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <FastImage style={{
                                    borderRadius: 30,
                                    width: 50,
                                    height: 50,
                                    marginRight: '1%'
                                }} source={{
                                    uri: data.item.data().Image,
                                    priority: FastImage.priority.high
                                }}/>
                            <View>
                            <Text style={{color: 'black',fontSize: 22}}>{data.item.data().Username}</Text>
                            <Text style={{color: 'black',fontSize: 22}}>{data.item.data().FirstName+" "+data.item.data().LastName}</Text>
                            </View>
                            </View>
                            {
                                data.item.data().InvitedBy!=null && data.item.data().InvitedBy.includes(this.props.eventid) ? ShowRemove(data.index) : ShowAdd(data.item,data.index)
                            }
                            </View>
                    )
                        }
                }}/>
            </View>
        )
    }
}

const styles=StyleSheet.create({
    background:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchbar:{
        width: 0.75*windowWidth,
        backgroundColor: '#c1c7c5',
        borderRadius: 10,
        margin: '5%'
    }
})
export default EventUsers;