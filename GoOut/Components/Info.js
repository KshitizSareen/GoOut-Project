import React, {Component} from 'react';
import NetInfo from '@react-native-community/netinfo';
import { View,StyleSheet,Image,Text, Alert, KeyboardAvoidingView } from 'react-native';
import {TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-community/async-storage';
import storage from '@react-native-firebase/storage';
import  ImagePicker from 'react-native-image-crop-picker'
class Info extends Component{
    constructor(){
        super();
        this.state={
            doc:{
                Email:"",
                Username:"",
                Number:"",
                Image: "",
            },
            code: "",
                phone:"",
                uri: "https://firebasestorage.googleapis.com/v0/b/goout-eb557.appspot.com/o/8-512.png?alt=media&token=12bc098a-0310-462c-a73c-872c360eaf3f",
                ImageSelected: false
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
        ImagePicker.showImagePicker(options, (response) => {
          
            if (response.didCancel) {
            } else if (response.error) {
            } else if (response.customButton) {
            } else {
          
              // You can also display the image using data:
              // const source = { uri: 'data:image/jpeg;base64,' + response.data };
          
              this.setState({
                uri: response.uri,
                ImageSelected: true
              });
              Alert.alert("","Do you want to set this Image as Display Image?",[
                { text: "OK", onPress: () => this.UploadData()},
                {
                  text: "Cancel",
                  onPress: () => {
                      this.setState({uri:"https://firebasestorage.googleapis.com/v0/b/goout-eb557.appspot.com/o/8-512.png?alt=media&token=12bc098a-0310-462c-a73c-872c360eaf3f"})
                  },
                  style: "cancel"
                },
              ],);
            }
          });
    }
    UploadData=()=>{
        if(this.state.ImageSelected)
        {
            if(this.state.uri=="https://firebasestorage.googleapis.com/v0/b/goout-eb557.appspot.com/o/8-512.png?alt=media&token=12bc098a-0310-462c-a73c-872c360eaf3f")
            {
                NetInfo.fetch().then((state)=>{
                    if(state.isConnected)
                    {firestore().collection('Users').doc(this.userid).update({
                      Image:this.state.uri
                  });
                    }
                    else
                    {
                      Alert.alert("","Please connect to the internet")
                    }
                })
            }
            else
            {
                console.log(this.state.uri);
                const fileExtension=this.state.uri.split('.').pop();
    const uid=this.userid;
    const fileName=`${uid}.${fileExtension}`;
    var storageRef=storage().ref(`userImages/${fileName}`);
    storageRef.putFile(this.state.uri).on(
      storage.TaskEvent.STATE_CHANGED,
      snapshot=>{
        console.log("snapshot: "+snapshot.state);
        console.log("progress: "+(snapshot.bytesTransferred/snapshot.totalBytes)*100);
        if(snapshot.state==storage.TaskState.SUCCESS){
          console.log("Success");
          storageRef.getDownloadURL().then(downloadurl=>{
            this.setState({uri: downloadurl});
            firestore().collection('Users').doc(this.userid).update({
                Image:downloadurl
            });
          });
        }
      },
      error=>{
        console.log("image upload error"+ error);
      },
      )
            }
        }
        if(this.state.code!="" && this.state.phone!="")
        {
            firestore().collection('Users').doc(this.userid).update({
                Number: this.state.code+" "+this.state.phone
            });

        }
        else{
            firestore().collection('Users').doc(this.userid).update({
                Number: ""
            });
        }


    }
    render(){
        return(
            <KeyboardAvoidingView style={styles.Background} behavior="height" enabled={true}>
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
                    <Text style={styles.TextLabel}>Username:</Text><TextInput style={styles.TextFields} keyboardType={"phone-pad"} value={this.state.doc.Username} editable={false}/>
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
                </KeyboardAvoidingView>
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
        marginTop: '70%',
        marginBottom: '5%'
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
        paddingBottom: '10%',
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