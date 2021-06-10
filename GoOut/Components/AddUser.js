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
class AddUser extends Component{
    constructor(){
        super()
        this.state={
            Username:"",
            Users:[]
        }
    }
    componentDidMount(){
    }
    SearchUsers=(Username)=>{
        if(Username!="")
        {
            firestore().collection('Users').where("userid","!=",auth().currentUser.uid).where("SearchArray","array-contains",Username.toLowerCase()).limit(1000).get().then(res=>{
                console.log(res.docs);
                this.setState({Users: res.docs});
            })
        }
    }
    render(){
        return(
            <View style={styles.background}>
                <TextInput style={styles.searchbar} placeholder="Search Users" value={this.state.Username} placeholderTextColor="black" onChange={(value)=>{
                    this.setState({Username:value.nativeEvent.text});
                    this.SearchUsers(value.nativeEvent.text);
                }}/>
                <FlatList data={this.state.Users} renderItem={(data)=>{
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
                            <TouchableOpacity style={{
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <FontAwesomeIcon icon={faPlus} size="20"/>
                            </TouchableOpacity>
                            </View>
                    )
                }}/>
            </View>
        )
    }
}
export default AddUser;

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
