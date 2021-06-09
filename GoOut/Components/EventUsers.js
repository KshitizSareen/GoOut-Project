import React, {Component} from 'react';
import NetInfo from '@react-native-community/netinfo';
import { View,StyleSheet,Text, Alert,Dimensions,TouchableOpacity, TextInput } from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import CheckBox from '@react-native-community/checkbox';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Modal from 'react-native-modal';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

class EventUsers extends Component{
    componentDidMount(){
    }
    render(){
        return(
           <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
           }}>
               <TouchableOpacity style={styles.AddUser} onPress={()=>{
                   this.props.navigation.navigate("AddUser",{userid: this.props.userid,eventid: this.props.eventid});
               }}>
                   <Text>Add User</Text>
               </TouchableOpacity>
               <FlatList />
           </View>
        )
    }
}

const styles=StyleSheet.create({
    AddUser:{
        width:0.5*windowWidth,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'lightblue',
        padding: '1%',
        borderRadius: 10,
        elevation: 5,
        margin: '5%'
    },
})
export default EventUsers;