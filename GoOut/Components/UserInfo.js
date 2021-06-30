import React, {Component} from 'react';
import NetInfo from '@react-native-community/netinfo';
import { View,StyleSheet,Image,Text, Alert, BackHandler,Dimensions } from 'react-native';
import {TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-community/async-storage';
import storage from '@react-native-firebase/storage';
import  ImagePicker from 'react-native-image-crop-picker'
import * as Progress from 'react-native-progress';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
class UserInfo extends Component{
    constructor(){
        super();
        this.state={
            doc:{
                Email:"",
                Number:"",
                Image: "",
            },
            code: "",
                phone:"",
                uri: "https://firebasestorage.googleapis.com/v0/b/goout-eb557.appspot.com/o/8-512.png?alt=media&token=12bc098a-0310-462c-a73c-872c360eaf3f",
                ImageSelected: false,
                Username:"",
                ShowLoadingAnimation: false,
                visitingID: "",
                FirstName: "",
                LastName: ""
        };
    }
    ConfirmChanges=()=>{
        NetInfo.fetch().then((state)=>{
            if(state.isConnected)
            {
                this.UploadData();
            }
            else{
                Alert.alert("","Please connect to the internet");
            }
        })
    }
    componentDidMount(){
        this.userid=this.props.route.params.userid;
        NetInfo.fetch().then((state)=>{
            if(state.isConnected)
            {
                    firestore().collection("Users").doc(this.userid).get().then((doc)=>{
                        if(doc.exists)
                        {
                            this.setState({doc:doc.data()});
                            if (doc.data().Number!="")
                            {
                            this.setState({code: doc.data().Number.split(" ")[0]});
                            this.setState({phone: doc.data().Number.split(" ")[1]});
                            }
                            this.setState({uri: doc.data().Image});
                            if(doc.data().Username!="")
                            {
                                this.setState({Username: doc.data().Username});
                            }
                            if(doc.data().FirstName!=null)
                            {
                                this.setState({FirstName: doc.data().FirstName});
                            }
                            if(doc.data().LastName!=null)
                            {
                                this.setState({LastName: doc.data().LastName});
                            }
                        }
                    })

            }
            else{
                Alert.alert("","Please connect to the internet"); 
            }
        });
    }
    ShowAnimation=(value)=>{
        this.setState({ShowLoadingAnimation: value});
    }
    HandleBackButton(){
        return true;
    }
    render(){
        return(
            <View style={styles.Background}>
                <TouchableOpacity disabled={true} style={styles.ImageContainer} onPress={()=>{
                    this.SelectImage();
                }}>
                <Image source={
                    {
                        uri: this.state.uri
                    }
                } style={styles.Image} />
                </TouchableOpacity>
                <View style={{
                    height: 0.2*windowHeight,
                    justifyContent: 'space-evenly',
                    alignItems: 'center'
                }}>
                    <TextInput style={styles.TextFields} value={this.state.Username} editable={false} onChange={(value)=>{
                        this.setState({Username: value.nativeEvent.text});
                    }}/>
                    <TextInput style={styles.TextFields} value={this.state.FirstName+" "+this.state.LastName} editable={false} onChange={(value)=>{
                        this.setState({Username: value.nativeEvent.text});
                    }}/>
                        </View>
                        
                </View>
        )
    }
}
const styles=StyleSheet.create({
    Image:{
        height: 0.2*windowHeight,
        width: 0.4*windowWidth,
        borderRadius: 70,
    },
    ImageContainer:{
        marginBottom: '5%',
        marginTop: '5%'
    },
    TextContainerInput:{
        flexDirection: 'row',
        marginBottom: '5%',
        alignItems: 'center',
        width: windowWidth,
        justifyContent: 'space-evenly'
    },
    TextLabel:{
        paddingTop: '1.5%',
        paddingRight: '1%',
        width: 100,
        borderRadius: 5,
        fontSize:20,
        fontStyle: 'italic',
        fontWeight: '300',
    },
    TextFields:{
          borderRadius: 10,
          backgroundColor: '#dce8e7',
          width: 0.7*windowWidth,
          alignContent: 'center',
          color: 'black'
        },
    code:{
        borderRadius: 10,
        backgroundColor: '#dce8e7',
        width: 0.1*windowWidth,
        alignContent: 'center',
        marginRight: '2%',
  },
    Background:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    Button:{
        backgroundColor: 'lightblue',
        padding: '3%',
        marginTop: '5%',
        width: 0.7*windowWidth,
        alignItems: 'center',
        borderRadius: 10,
        elevation: 5,
    },
    Text3:{
        fontSize:25,
        fontStyle: 'italic',
        fontWeight: '300'
    },
    ButtonContainer:{
        alignItems:'center',
        justifyContent: 'center'
    },
})


export default UserInfo;