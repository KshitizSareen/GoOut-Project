import React, {Component} from 'react';
import NetInfo from '@react-native-community/netinfo';
import { View,StyleSheet,Image,Text, Alert, BackHandler } from 'react-native';
import {TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-community/async-storage';
import storage from '@react-native-firebase/storage';
import  ImagePicker from 'react-native-image-crop-picker'
import * as Progress from 'react-native-progress';
class Info extends Component{
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
                ShowLoadingAnimation: false
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
                        }
                    })

            }
            else{
                Alert.alert("","Please connect to the internet"); 
            }
        });
    }
    InputNumber(value,code)
    {
        if (code==1)
        {
            this.setState({code: value});
        }
        else
        {
            this.setState({phone: value});
        }
    }
    SignOut= async ()=>{
        await AsyncStorage.setItem('Email',"");
          await AsyncStorage.setItem('Password',"");
        NetInfo.fetch().then((state)=>{
            if(state.isConnected)
            {
                auth().signOut().then(  ()=>{
                    this.props.navigation.navigate("Auth");
                });
            }
            else{
                Alert.alert("","Please connect to the internet"); 
            }
        })
    }
    SelectImage=()=>{
        ImagePicker.openPicker({
            cropping: true,
            mediaType: 'photo'
        }).then((Image)=>{
            var StorageRef=storage().ref(`User/${this.props.route.params.userid}/ImagePic`);
            StorageRef.putFile(Image.path).on(
                storage.TaskEvent.STATE_CHANGED,
                snapshot=>{
                    this.ShowAnimation(true);
                    if(snapshot.state==storage.TaskState.SUCCESS)
                    {
                        StorageRef.getDownloadURL().then(downloadUrl=>{
                            firestore().collection('Users').doc(this.props.route.params.userid).update({
                                Image: downloadUrl
                            })
                            this.setState({uri: downloadUrl});
                            this.ShowAnimation(false);
                        })
                    }
                }
            )

        }).catch(err=>{

        })
    }
    UploadData=()=>{
        if(this.state.code!="" && this.state.phone!="" && this.state.Username!="")
        {
            firestore().collection('Users').doc(this.userid).update({
                Number: this.state.code+" "+this.state.phone,
                Username: this.state.Username
            });

        }
        else{
            Alert.alert("","Please enter a mobile number and username");
        }


    }
    ShowAnimation=(value)=>{
        this.setState({ShowLoadingAnimation: value});
    }
    HandleBackButton(){
        return true;
    }
    render(){
        var ShowLoadingAnimation=()=>{
            if(this.state.ShowLoadingAnimation)
            {
                BackHandler.addEventListener('hardwareBackPress',this.HandleBackButton);
            return(
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    alignSelf:'center',
                    position: 'absolute'
                }}>
              <Progress.Circle size={80} indeterminate={true} />
              </View>
            )
                  }
                  else
                  {
                    BackHandler.removeEventListener('hardwareBackPress',this.HandleBackButton);
                  }
        }
        return(
            <View style={styles.Background} behavior="height" enabled={true}>
                {
                    ShowLoadingAnimation()
                }
                <TouchableOpacity style={styles.ImageContainer} onPress={()=>{
                    this.SelectImage();
                }}>
                <Image source={
                    {
                        uri: this.state.uri
                    }
                } style={styles.Image} />
                </TouchableOpacity>
                <View style={styles.TextContainer}>
                    <View style={styles.TextContainerInput}>
                        <Text style={styles.TextLabel}>Email:</Text><TextInput style={styles.TextFields} keyboardType={"phone-pad"} value={this.state.doc.Email} editable={false}/>
                        </View>
                        <View style={styles.TextContainerInput}>
                    <Text style={styles.TextLabel}>Username:</Text><TextInput style={styles.TextFields} value={this.state.Username} onChange={(value)=>{
                        this.setState({Username: value.nativeEvent.text});
                    }}/>
                    </View>
                        <View style={styles.TextContainerInput}>
                        <Text style={styles.TextLabel}>Number:</Text><TextInput style={styles.code} keyboardType={"phone-pad"} value={this.state.code} onChangeText={(value)=>{
                            this.InputNumber(value,1);
                        }}/><TextInput style={styles.TextFields} keyboardType={"phone-pad"} value={this.state.phone} onChangeText={(value)=>{
                            this.InputNumber(value,2);
                        }}/>
                        </View>
                        
                    </View>
                    <View style={styles.ButtonContainer}>
                    <TouchableOpacity style={styles.Button} onPress={()=>{
                        this.ConfirmChanges();
            }}>
                <Text style={styles.Text3}>Confirm Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.Button} onPress={()=>{
                this.SignOut();
            }}>
                <Text style={styles.Text3}>Logout</Text>
            </TouchableOpacity>
            </View>
                </View>
        )
    }
}
const styles=StyleSheet.create({
    Image:{
        width: 150,
        height: 150,
        borderRadius: 70,
    },
    ImageContainer:{
        marginTop: '90%',
        marginBottom: '5%',
    },
    TextContainer:{
        flexDirection: 'column',
        
    },
    TextContainerInput:{
        flexDirection: 'row',
        marginBottom: '5%'
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
          width: 230,
          alignContent: 'center',
        },
    code:{
        borderRadius: 10,
        backgroundColor: '#dce8e7',
        width: 50,
        alignContent: 'center',
        marginRight: '2%',
  },
    Background:{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    Button:{
        backgroundColor: 'lightblue',
        padding: '3%',
        marginTop: '5%',
        width: 250,
        alignItems: 'center',
        borderRadius: 10,
        elevation: 5,
        marginLeft: '20%',
    },
    Text3:{
        fontSize:25,
        fontStyle: 'italic',
        fontWeight: '300'
    },
    ButtonContainer:{
        marginTop: '5%',
        marginBottom: '60%',
        marginRight: '12%'
    },
})
const stylesMultiSelect = StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 30,
    },
    container: {
      paddingTop: 40,
      paddingHorizontal: 20,
    },
    welcome: {
      fontSize: 20,
      textAlign: 'center',
      margin: 10,
      color: '#333',
    },
    border: {
      borderBottomWidth: 1,
      borderBottomColor: '#dadada',
      marginBottom: 20,
    },
    heading: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 5,
      marginTop: 20,
    },
    label: {
      fontWeight: 'bold',
    },
    switch: {
      marginBottom: 20,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
  })
  export default Info;