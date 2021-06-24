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
        for(var i=0;i<this.state.Invites.length;i++)
        {
            var UserID=this.state.Invites[i];
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
   RemoveUser=(index)=>{
        var Invites=this.state.Invites;
                firestore().collection('Users').doc(Invites[index]).get().then(doc=>{
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
                            break;
                        }
                    }
                    InvitedBy.splice(Eventindex,1);
                    firestore().collection('Users').doc(doc.id).update({
                        InvitedBy: InvitedBy
                    })
                })
                Invites.splice(index,1);
                firestore().collection('Events').doc(this.props.route.params.EventID).update({
                   Invites: Invites
                })
                this.setState({Invites: Invites});
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
                            <FastImage source={{
                                uri: this.state.Images[data.index],
                                priority: FastImage.priority.high,
                            }} style={{
                                width: 0.1*windowWidth,
                                height: 0.1*windowWidth,
                                borderRadius: 50,
                                margin: '1%'
                            }}/>
                            <Text style={{fontSize: 15,width: 0.55*windowWidth,alignSelf: 'center'}}>{this.state.UserNames[data.index]}</Text>
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