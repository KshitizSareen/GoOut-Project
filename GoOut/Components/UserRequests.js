import React, {Component} from 'react';
import { View,Text, Alert,Dimensions,TouchableOpacity} from 'react-native';
import { FlatList} from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faInbox,faTimes} from '@fortawesome/free-solid-svg-icons';
const windowWidth = Dimensions.get('window').width;
import FastImage from 'react-native-fast-image';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

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
        this.unsubscribe=this.props.navigation.addListener('focus',()=>{
            this.GetUserRequests();
        })
        messaging().onMessage(async mess=>{
            this.GetUserRequests();
        })

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
        var Images=[];
        var EventNames=[];
        for(var i=0;i<this.state.Requests.length;i++)
        {
            var EventID=this.state.Requests[i];
        firestore().collection('Events').doc(EventID).get().then(doc=>{
            Images.push(doc.data().ImageUri);
            this.setState({Images: Images});
            EventNames.push(doc.data().Name);
            this.setState({EventNames: EventNames});
        })
    }
    }
    RemoveUser=(Event)=>{
        var UserDoc=firestore().collection('Users').doc(this.props.route.params.UserID);
        var EventDoc=firestore().collection('Events').doc(Event);
        var UserRequests=this.state.Requests;
        firestore().runTransaction(async transaction=>{
            var doc=await transaction.get(UserDoc);
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
            transaction.update(UserDoc,{
                UserRequests: UserRequests
            })
            doc=await transaction.get(EventDoc);
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
            transaction.update(EventDoc,{
                EventRequests: EventRequests
            })
        }).then(()=>{
            this.GetUserRequests();
            firestore().collection('Events').doc(Event).get().then(Event=>{
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

    componentWillUnmount(){
        this.unsubscribe();
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
                            <TouchableOpacity style={{
                                flexDirection: 'row',
                                width: 0.65*windowWidth,
                                justifyContent: 'space-evenly'
                            }} onPress={()=>{
                                this.props.navigation.navigate("Content",{userid: this.props.route.params.UserID,eventid:data.item });
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
                            <Text style={{fontSize: 15,width: 0.5*windowWidth,alignSelf: 'center'}}>{"You hava requested  to join "+ this.state.EventNames[data.index]}</Text>
                            </TouchableOpacity>
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