import React, {Component} from 'react';
import{
    StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput, Image,Dimensions,
   KeyboardAvoidingView
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Modal from 'react-native-modal';
import messaging from '@react-native-firebase/messaging';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
class SignIn extends Component{
    constructor(){
        super()
        this.state={
            username:"",
            password: "",
            modalLoginVisible: false,
            modalSignupVisible: false,
            usernameCreate:"",
            passwordCreate: "",
            displayName: "",
            FirstName: "",
            LastName:"",
        }
    }
    componentDidMount()
    {
        messaging().onNotificationOpenedApp(remoteMessage=>{
            console.log(
              'Notification caused app to open from background state:',
              remoteMessage.notification.body,
            );
          })
          messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log(
              'Notification caused app to open from quit state:',
              remoteMessage.notification.body,
            );
            console.log(remoteMessage.data);
          }
        }).catch(err=>{
            console.log(err);
        });
    }
    GetInfo= async ()=>{
    }
    SignIn=  ()=>{
        NetInfo.fetch().then((state)=>{
            if(state.isConnected)
            {
                if(this.state.username!=""  && this.state.password!="")
                {
                    var docid="";
                  auth().signInWithEmailAndPassword(this.state.username, this.state.password).then((user)=>{
                        this.setState({modalLoginVisible: false});
                        Alert.alert("","Login Succesful");
                    }).then(()=>{
                        firestore().collection('Users').where('Email','==',this.state.username).get().then(querySnapshot=> {
      querySnapshot.forEach(function(doc) {
          // doc.data() is never undefined for query doc snapshots
          docid=doc.id;
          messaging().getToken().then(token=>{
            firestore().collection('Users').doc(doc.id).update({
                NotificationToken:token
            }).catch(err=>{
                console.log(err);
            })
         })
        });
        this.props.navigation.navigate("Tabs",{userid: docid});
            AsyncStorage.setItem('Email',this.state.username);
            AsyncStorage.setItem('Password',this.state.password);})}).catch(error=>{
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    Alert.alert("","Inavlid Credentials");
                    return;
                });
            }
            else{
                Alert.alert("","Please enter all the details");
            }
            }
            else
            {
                Alert.alert("","Please connect to the internet");
            }
        });
    }
    GenerateSubstrings=(Names)=>{
        var UserSubstrings=[];
        for(var j=0;j<Names[0].length;j++)
        {
            var k=5;
            while(k<Names[0].length)
            {
            var Name=Names[0].substring(j,j+k);
            UserSubstrings.push(Name);
            k+=1;
            }
        }
        UserSubstrings.push(Names[1]);
        UserSubstrings.push(Names[2]);
        return UserSubstrings;
    }
    SignUp=()=>{
        NetInfo.fetch().then((state)=>{
            if(state.isConnected)
            {
                if(this.state.usernameCreate!="" && this.state.passwordCreate!="" && this.state.displayName!="" && this.state.FirstName!="" && this.state.LastName!="")
                {
                    
                  auth().createUserWithEmailAndPassword(this.state.usernameCreate, this.state.passwordCreate).then((res)=>{
                      Alert.alert("","Sign Up Succesful");
                        firestore().collection('Users').add({
                            Email: this.state.usernameCreate,
                            Username: this.state.displayName.toLowerCase(),
                            Number: "",
                            Image: "https://firebasestorage.googleapis.com/v0/b/goout-4391e.appspot.com/o/0c3b3adb1a7530892e55ef36d3be6cb8.png?alt=media&token=3a29d2dc-500c-4e0a-8564-04678a8d75d5",
                            FirstName: this.state.FirstName.charAt(0).toUpperCase()+this.state.FirstName.slice(1),
                            LastName: this.state.LastName.charAt(0).toUpperCase()+this.state.LastName.slice(1),
                            SearchArray: this.GenerateSubstrings([this.state.displayName.toLowerCase(),this.state.FirstName.toLowerCase(),this.state.LastName.toLowerCase()]),
                            userid: res.user.uid
                         });
                        this.setState({modalSignupVisible: false});
                    })
                    .catch(error=>{
                  // Handle Errors here.
                  var errorCode = error.code;
                  var errorMessage = error.message;
                  Alert.alert("","Inavlid Credentials");
                  console.log(error);
                  return;
                });
            }
            else
            {
                Alert.alert("","Please enter all the details");
            }
            }
            else
            {
                Alert.alert("","Please connect to the internet");
            }
        });
    }
    SetModalLoginVisible=async ()=>{
        if (this.state.modalLoginVisible)
        this.setState({modalLoginVisible: false});
        else
        {
            var username=await AsyncStorage.getItem('Email');
        var password=await AsyncStorage.getItem('Password');
        if (username!=null && password!=null)
        {
            this.setState({username: username});
            this.setState({ password: password});
        }
        else
        {
            this.setState({username: ""});
            this.setState({ password: ""});
        }
        this.setState({modalLoginVisible: true});
        }
    }
    SetModalSignupVisible=()=>{
        if (this.state.modalSignupVisible)
        this.setState({modalSignupVisible: false});
        else
        this.setState({modalSignupVisible: true});
    }
    render()
    {
        return(
            <View style={styles.View}>
            <Image source={require('../static/a1695e7b-5875-4314-bf70-b50c4a0386f3_200x200.png') 
            } style={styles.Image}/>
            <View style={styles.TextContainer}>
            <Text style={styles.Text1}>Have Fun</Text>
            <Text style={styles.Text2}>Meet Friends</Text>
            <Text style={styles.Text3}>Stay Safe</Text>
            <TouchableOpacity style={styles.Button} onPress={()=>{
                this.SetModalLoginVisible();
            }}>
                <Text style={styles.Text3}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.Button} onPress={()=>{
                this.SetModalSignupVisible();
            }}>
                <Text style={styles.Text3}>Sign Up</Text>
            </TouchableOpacity>
            </View>
            <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.modalLoginVisible}
        onRequestClose={() => {
            this.SetModalLoginVisible();
        }}
        onBackdropPress={()=>{
            this.SetModalLoginVisible();
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput placeholder="Email" style={styles.textinput} value={this.state.username} onChangeText={(value)=>{
                this.setState({username: value});
            }}/>
            <TextInput placeholder="Password" secureTextEntry={true} style={styles.textinput} value={this.state.password} onChangeText={(value)=>{
                this.setState({password: value})  
        }}/>
           <TouchableOpacity style={styles.ButtonModal}  onPress={()=>{this.SignIn()}}><Text style={styles.Text3}>Login</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.modalSignupVisible}
        onRequestClose={() => {
            this.SetModalSignupVisible();
        }}
        onBackdropPress={()=>{
            this.SetModalSignupVisible();
        }}
      >
        <View style={styles.centeredView} >
          <View style={styles.modalView}>
          <TextInput placeholder="First Name" style={styles.textinput} onChangeText={(value)=>{
                this.setState({FirstName: value});
            }}/>
            <TextInput placeholder="Last Name" style={styles.textinput} onChangeText={(value)=>{
                this.setState({LastName: value});
            }}/>
          <TextInput placeholder="Username" style={styles.textinput} onChangeText={(value)=>{
                this.setState({displayName: value});
            }}/>
            <TextInput placeholder="Email" style={styles.textinput} onChangeText={(value)=>{
                this.setState({usernameCreate: value});
            }}/>
            <TextInput placeholder="Password" style={styles.textinput} secureTextEntry={true} onChangeText={(value)=>{
                this.setState({passwordCreate: value});
            }}/>
            <TouchableOpacity style={styles.ButtonModal}  onPress={()=>{this.SignUp()}}><Text style={styles.Text3}>Sign up</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
            </View>
        );
    }

}
const styles= StyleSheet.create({
    View:{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    TextContainer:{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20%'
        
    },
    Image:{
        height: 0.1*windowHeight,
        width: 0.2*windowWidth,
        resizeMode: 'contain',
        
    },
    Text1:{
        fontSize: 40,
        fontStyle: 'italic',
        fontWeight: '300'
    },
    Text2:{
        fontSize: 30,
        fontStyle: 'italic',
        fontWeight: '300'
    },
    Text3:{
        fontSize:25,
        fontStyle: 'italic',
        fontWeight: '300'
    },
    Button:{
        backgroundColor: 'lightblue',
        padding: '3%',
        marginTop: '5%',
        width: 0.3*windowWidth,
        alignItems: 'center',
        borderRadius: 10,
        elevation: 5
    },
    centeredView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
      },
      modalView: {
        backgroundColor: "white",
        padding: '10%',
        borderRadius: 20,
        elevation: 5,
        justifyContent: 'space-between',
        alignItems: 'center'
      },
      textinput:{
          marginBottom: '5%',
          borderRadius: 10,
          backgroundColor: '#f0f2f5',
          width: 0.5*windowWidth,
          alignContent: 'center'
      },
      ButtonModal:{
        backgroundColor: 'lightblue',
        width: 0.5*windowWidth,
        alignItems: 'center',
        borderRadius: 10,
        elevation: 5,
        padding: '1%',
    },
});
export default SignIn;