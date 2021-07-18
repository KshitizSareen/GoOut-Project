import React, {Component} from 'react';
import { View,Text, Alert,Dimensions,TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendar, faMinus } from '@fortawesome/free-solid-svg-icons';
const windowWidth = Dimensions.get('window').width;
import FastImage from 'react-native-fast-image';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

class MyEvents extends Component{
    constructor(){
        super();
        this.state={
            Events:[],
            Images:[],
            EventNames:[],
            OwnerID:""
        }
    }
    componentDidMount(){
        this.unsubscribe=this.props.navigation.addListener('focus',()=>{
            this.GetEvents();
        })
            messaging().onMessage(async mess=>{
                this.GetEvents();
            })
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
        var Images=[];
        var EventNames=[];
        for(var i=0;i<this.state.Events.length;i++)
        {
            var EventID=this.state.Events[i];
        firestore().collection('Events').doc(EventID).get().then(doc=>{
            Images.push(doc.data().ImageUri);
            this.setState({Images: Images});
            EventNames.push(doc.data().Name);
            this.setState({EventNames: EventNames});
        })
    }
    }
    ExitEvent=(Event)=>{
        var UserDoc=firestore().collection('Users').doc(this.props.route.params.UserID);
        var EventDoc=firestore().collection('Events').doc(Event);
        var MembersOf=[];
        var CheckError=false;
        firestore().runTransaction(async transaction=>{
            var User=await transaction.get(UserDoc);
            if(User.data().MembersOf!=null)
            {
                MembersOf=User.data().MembersOf;
            }
            var Eventindex;
            for(var i=0;i<MembersOf.length;i++)
            {
                if(MembersOf[i]==Event)
                {
                    Eventindex=i;
                    MembersOf.splice(Eventindex,1);
                    break;
                }
            }
            transaction.update(UserDoc,{
                MembersOf: MembersOf
            })
            var doc=await transaction.get(EventDoc);
            if(doc.data().Owner==this.props.route.params.UserID)
            {
                Alert.alert("","Owner cannot be removed from the event");
                CheckError=true;
                throw '';
            }
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
                    Members.splice(UserIndex,1);
                    break;
                }
            }
            transaction.update(EventDoc,{
                Members: Members
            })
        }).then(()=>{
             this.GetEvents();
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
            if(!CheckError)
            Alert.alert("","Please check your network connection");
        })
    }
    componentWillUnmount(){
        this.unsubscribe();
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
                            this.props.navigation.navigate("Content",{userid: this.props.route.params.UserID,eventid:data.item});
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
                        marginTop: '5%',
                        alignSelf: 'center'
                    }} icon={faCalendar} size={(0.5*windowWidth).toString()} color="lightblue"/>
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