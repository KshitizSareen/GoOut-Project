import React, {Component} from 'react';
import { View,Text, Alert,Dimensions,TouchableOpacity } from 'react-native';
import { FlatList} from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {faMinus,faUser } from '@fortawesome/free-solid-svg-icons';
const windowWidth = Dimensions.get('window').width;
import FastImage from 'react-native-fast-image';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

class ShowInvites extends Component{
    constructor(){
        super();
        this.state={
            Invites:[],
            Images:[],
            UserNames:[],
        }
    }
    componentDidMount(){
        this.FetchInvites();
        messaging().onMessage(async mess=>{
            this.FetchInvites();
        })
    }
    FetchInvites=()=>{
        firestore().collection('Events').doc(this.props.route.params.EventID).get().then(doc=>{
            if(doc.data().Invites!=null)
            {
                this.setState({Invites: doc.data().Invites});
            }
            this.GetExternalData();
        })
    }
    GetExternalData=()=>{
        var Images=[];
        var UserNames=[];
        for(var i=0;i<this.state.Invites.length;i++)
        {
            var UserID=this.state.Invites[i];
        firestore().collection('Users').doc(UserID).get().then(doc=>{
            Images.push(doc.data().Image);
            this.setState({Images: Images});
            UserNames.push(doc.data().Username);
            this.setState({UserNames: UserNames});
        })
    }
    }
   RemoveUser=(index)=>{
        var Invites=this.state.Invites;
        var UserID=Invites[index];
        var UserDoc=firestore().collection('Users').doc(Invites[index]);
        var EventDoc=firestore().collection('Events').doc(this.props.route.params.EventID);
        firestore().runTransaction(async transaction=>{
            var doc=await transaction.get(UserDoc);
                    var InvitedBy=[];
                    if(doc.data().InvitedBy!=null)
                    {
                        InvitedBy=doc.data().InvitedBy;
                    }
                    var Eventindex;
                    for(var i=0;i<InvitedBy.length;i++)
                    {
                        if(InvitedBy[i]==this.props.route.params.EventID)
                        {
                            Eventindex=i;
                            InvitedBy.splice(Eventindex,1);
                            break;
                        }
                    }
                    transaction.update(UserDoc,{
                        InvitedBy: InvitedBy
                    })
                    var Event=await transaction.get(EventDoc);
                    if(Event.data().Invites!=null)
                    {
                        Invites=Event.data().Invites;
                    }
                    var UserIndex;
                    for(var i=0;i<Invites.length;i++)
                    {
                        if(Invites[i]==Invites[index])
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
                    this.FetchInvites();
                    firestore().collection('Users').doc(UserID).get().then(User=>{
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
                        firestore().collection('Events').doc(this.props.route.params.EventID).get().then(Event=>{
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

                    })
                }).catch(err=>{
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
                            <TouchableOpacity style={{
                                flexDirection: 'row',
                                width: 0.65*windowWidth,
                                justifyContent: 'space-evenly'
                            }} onPress={()=>{
                                this.props.navigation.navigate("UserInfo",{userid: data.item})
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
                            <Text style={{fontSize: 15,width: 0.5*windowWidth,alignSelf: 'center'}}>{this.state.UserNames[data.index]}</Text>
                            </TouchableOpacity>
                            {
                                this.props.route.params.OwnerID == this.props.route.params.UserID ?
                            <View style={{
                                flexDirection: 'row',
                                width: 0.3*windowWidth,
                                justifyContent: 'space-evenly',
                                margin: '1%'
                            }}>
                            <TouchableOpacity onPress={()=>{
                                this.RemoveUser(data.index);
                            }}>
                                <FontAwesomeIcon icon={faMinus} size="20"/>
                            </TouchableOpacity>
                            </View>
                            :
                            null
                }
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
                    this.state.Invites.length >0 ? ShowInvites() : ShowNoInvites()
                }
            </View>
        )
    }
}
export default ShowInvites;