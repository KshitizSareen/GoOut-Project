import React, {Component} from 'react';
import NetInfo from '@react-native-community/netinfo';
import { View,StyleSheet,Text, Alert,Dimensions,TouchableOpacity, TextInput } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import CheckBox from '@react-native-community/checkbox';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Modal from 'react-native-modal';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import axios from 'axios';
class EventInfo extends Component{
    constructor(){
      super();
      this.state={
        DateModalVisible:false,
        mode:"date",
        Name: "",
        Description: "",
        Tags: "",
        Location:"",
        Date: "Date",
        Time:"Time",
        From:"",
        To:"",
        Public: true,
        Permission: true,
        Free: true,
        Price: 0,
        TagModel: false,
        Tags: [],
        Tag:""
      };
    }
    componentDidMount(){
        this.UpdateInfo();
    }
    UpdateInfo=()=>{
        firestore().collection('Events').doc(this.props.eventid).get().then(res=>{
            this.setState({
                Date: res.data().Date,
                From: res.data().From,
                Location: res.data().Location,
                Name: res.data().Name,
                Tags: res.data().Tags,
                To:res.data().To,
                Permission: res.data().Permission,
                Price: res.data().Price,
                Public: res.data().Public,
                Time: res.data().Time,
                Free: res.data().Free
             })
        }).then(()=>{
        }).catch((err)=>{
          console.log(err);
          Alert.alert("","Please check your network connection");
      })
    }
    SetName=(value)=>{
      this.setState({Name:value});
    }
    SetDescription=(value)=>{
      this.setState({Description: value});
    }
    SetTags=(value)=>{
      this.setState({Tags: value});
    }
    SetLocation=(value)=>{
      this.setState({Location:value});
    }
    SetDate=(value)=>{
      var DateString="Date - "+value.getDate()+'/'+(value.getMonth()+1)+'/'+value.getFullYear();
      this.setState({Date:DateString});
    }
    SetTime=(value)=>{
      var hours = value.getHours() ; // gives the value in 24 hours format
  var AmOrPm = hours >= 12 ? 'pm' : 'am';
  hours = (hours % 12) || 12;
  var minutes = value.getMinutes() ;
  var finalTime = "Time  - " + hours + ":" + minutes + " " + AmOrPm; 
      this.setState({Time: finalTime});
    }
    SetFrom=(value)=>{
      this.setState({From: value});
    }
    SetTo=(value)=>{
      this.setState({To:value});
    }
    SetPublic=(value)=>{
      this.setState({Public: value});
    }
    SetPermission=(value)=>{
      this.setState({Permission: value});
    }
    SetDateModalVisible=()=>{
      if(this.state.DateModalVisible)
      {
      this.setState({DateModalVisible:false});
      }
      else{
        this.setState({DateModalVisible:true});
      }
    }
    SetModalMode=(mode)=>{
      this.setState({mode: mode});
    }
    SetPrice=(value)=>{
      this.setState({Price: value})
    }
    SetPriceVisible=(value)=>{
      this.setState({Free: value});
    }
    UploadData=()=>{
          if(this.state.Name=="" || this.state.Time=="Time" || this.state.Date=="Date")
          {
            Alert.alert("","Please enter Name,Date and Time");
            return;
          }
          var EventDoc=firestore().collection('Events').doc(this.props.eventid);
          firestore().runTransaction(async transaction=>{
            transaction.update(EventDoc,{
              Name: this.state.Name,
            Tags: this.state.Tags,
            Location: this.state.Location,
            Date: this.state.Date,
            Time: this.state.Time,
            From: this.state.From,
            To: this.state.To,
            Public: this.state.Public,
            Price: parseInt(this.state.Price),
            SearchArray: this.GenerateSubstrings(this.state.Name.toLowerCase().trim())
            })
          }).then(()=>{
            Alert.alert("","Event Succesfully Updated");
            firestore().collection('Events').doc(this.props.eventid).get().then(Event=>{
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
  "notification":{
  "title": "GoOut",
  "body": "Info has been updated in "+Event.data().Name+", Check your app for details"
  }
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
    GenerateSubstrings=(Name,Tags)=>{
      var Substrings=[];
      for(var j=0;j<Name.length;j++)
      {
          var k=5;
          while(k<Name.length)
          {
          var NameSubString=Name.substring(j,j+k);
          Substrings.push(NameSubString);
          k+=1;
          }
      }
      Substrings.push(Name);
      return Substrings;
  }
    ShowTagModal=(value)=>{
      this.setState({TagModel: value});
    }
    AddTag=(Tag)=>{
      var Tags=this.state.Tags;
      Tags.push('#'+Tag.toLowerCase().trim());
      this.setState({Tags: Tags});
      this.setState({Tag:""});
    }
    RemoveTag=(index)=>{
      var Tags=this.state.Tags;
      Tags.splice(index,1);
      this.setState({Tags: Tags});
    }
      render()
      {

        var ShowDateTimeModal=()=>{
          return(
          <DateTimePickerModal
          isVisible={this.state.DateModalVisible}
          mode={this.state.mode}
          onCancel={()=>{
            this.SetDateModalVisible();
          }}
          onConfirm={(value)=>{
            if(this.state.mode=="date")
            {
              this.SetDate(value);
            }
            else
            {
              this.SetTime(value);
            }
          }}
          is24Hour={false}
        />)
        }
        var ShowTagModel=()=>{
          return(
            <Modal
            visible={this.state.TagModel}
            animationType="fade"
            onRequestClose={()=>{
              this.ShowTagModal(false);
            }}
            onBackdropPress={()=>{
              this.ShowTagModal(false);
            }}>
              <View style={styleevent.centeredViewModal}>
                <View style={styleevent.modalView}>
                <TextInput placeholder="Enter Tag" placeholderTextColor="darkgrey" value={this.state.Tag} style={{
                    width: 0.9*windowWidth,
                    padding: '4%',
                    color: 'grey',
                    borderBottomWidth: 1
                  }} onChange={(value)=>{
                    this.setState({Tag: value.nativeEvent.text});
                  }} onSubmitEditing={()=>{
                    if(this.state.Tag!="")
                    {
                      this.AddTag(this.state.Tag);
                    }
                  }}/>
                <ScrollView>
                  {
                    this.state.Tags.map((Tag,index)=>{
                      return(
                      <View style={{flexDirection: 'row',
                      alignItems: 'center',
                      borderBottomWidth: 1}}>
                      <Text style={{width: 0.75*windowWidth,
                    color: 'black',
                    fontSize: 15,
                    padding: '4%'}}>{Tag}</Text>
                      <TouchableOpacity style={{
                        padding: '5%'
                      }} onPress={()=>{
                        this.RemoveTag(index);
                      }}>
                      <FontAwesomeIcon icon={faMinus} size="20"/>
                      </TouchableOpacity>
                      </View>
                    )})
                    }
                  </ScrollView>
                </View>
                </View>
            </Modal>
          )
        }
          return(
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styleevent.centeredView}>
                {
                  ShowDateTimeModal()
                }
                {
                  ShowTagModel()
                }
                  <TextInput editable={this.props.userid==this.props.OwnerId} placeholderTextColor="darkgrey" scrollEnabled={true} placeholder="Name"  style={styleevent.EventName} value={this.state.Name} onChangeText={(value)=>{
                    this.SetName(value);
                  }}/>
                  <TouchableOpacity disabled={this.props.userid!=this.props.OwnerId} style={styleevent.EventTags} onPress={()=>{
                    this.ShowTagModal(true);
                  }}>
                    <TextInput placeholderTextColor="darkgrey" multiline={true} editable={false} style={{fontSize: 20,color: 'grey'}} value={this.state.Tags.length==0 ? "Tags" : this.state.Tags.join(' ')}/>
                  </TouchableOpacity>
                  <TextInput placeholderTextColor="darkgrey" editable={this.props.userid==this.props.OwnerId} placeholder="Location"  style={styleevent.EventAddress} value={this.state.Location} multiline={true} onChangeText={(value)=>{
                    this.SetLocation(value);
                  }}/>
                  <TouchableOpacity style={{
                  justifyContent: 'center',
                    backgroundColor: '#dce8e7',
          borderRadius: 5,
          marginBottom: '5%',
          height: 40,
          fontWeight: '100',
          color: 'grey',
          fontSize: 20,
          padding: '1%',
          width: 0.9*windowWidth
                  }} disabled={this.props.userid!=this.props.OwnerId} onPress={()=>{
                    this.SetDateModalVisible();
                    this.SetModalMode("date");
                  }}><Text style={styleevent.Time}>{this.state.Date}</Text></TouchableOpacity>
                  <TouchableOpacity style={{
                  justifyContent: 'center',
                    backgroundColor: '#dce8e7',
          borderRadius: 5,
          marginBottom: '5%',
          height: 40,
          fontWeight: '100',
          color: 'grey',
          fontSize: 20,
          padding: '1%',
          width: 0.9*windowWidth
                  }} disabled={this.props.userid!=this.props.OwnerId} onPress={()=>{
                    this.SetDateModalVisible();
                    this.SetModalMode("time");
                  }}><Text style={styleevent.Time}>{this.state.Time}</Text></TouchableOpacity>
                  <Text style={styleevent.label}>Age Group:</Text>
                  <View style={styleevent.AgeView}>
                      <TextInput placeholderTextColor="darkgrey" editable={this.props.userid==this.props.OwnerId} placeholderTextColor="darkgrey" style={styleevent.AgeInput} keyboardType="number-pad" placeholder="From" value={this.state.From} onChangeText={(value)=>{
                    this.SetFrom(value);
                  }}/>
                  <View style={styleevent.Seperator}><Text>---</Text></View>
                  <TextInput placeholderTextColor="darkgrey" editable={this.props.userid==this.props.OwnerId} placeholderTextColor="darkgrey" style={styleevent.AgeInput} keyboardType="number-pad" placeholder="To" value={this.state.To} onChangeText={(value)=>{
                    this.SetTo(value);
                  }}/>
                  </View>
                  {
                   this.props.userid==this.props.OwnerId ?  
                   <View style={{
                     alignItems: 'center'
                   }}>
                  <View style={styleevent.CheckBoxView}>
                    <Text style={styleevent.label}>Keep Public</Text>
                    <CheckBox disabled={this.props.userid!=this.props.OwnerId} value={this.state.Public} onValueChange={(value)=>{
                      this.SetPublic(value);
                    }}/>
                  </View>
                  </View> : null
                  }
                   <TextInput placeholderTextColor="darkgrey" editable={this.props.userid==this.props.OwnerId} placeholder="Set Price" style={styleevent.EventPrice} value={this.state.Price.toString()} keyboardType="number-pad" onChangeText={(value)=>{
             this.SetPrice(value);
            }}/>
                {
                  this.props.userid==this.props.OwnerId ?
                  <TouchableOpacity style={styleevent.Button} onPress={()=>{
                    this.UploadData();
                  }}>
                    <Text style={styleevent.Text3}>Update Event</Text>
                  </TouchableOpacity>:
                  null
      }
      </View>
                  </ScrollView>
  
          );
      }
  }
  export default EventInfo;
  const styleevent=StyleSheet.create({
    centeredView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        height: windowHeight
      },
      EventName:{
        width: 0.9*windowWidth,
        height: 40,
        backgroundColor: '#dce8e7',
        borderRadius: 5,
        marginBottom: '5%',
        fontSize: 20,
        padding: '1%',
        marginTop: '3%',
        color: 'black'
      },
      EventTags:{
        width: 0.9*windowWidth,
        height: 100,
        backgroundColor: '#dce8e7',
        marginBottom: '5%',
        borderRadius: 5,
        padding: '1%',
        justifyContent: 'center',
        
      },
      EventAddress:{
        width: 0.9*windowWidth,
        height: 100,
        backgroundColor: '#dce8e7',
        marginBottom: '5%',
        borderRadius: 5,
        fontSize: 20,
        padding: '1%',
        fontSize: 20,
        color: 'black'
      },
      Time:{
        fontSize: 20,
        color: 'black'
      },
      label:{
        height: 40,
        fontWeight: '100',
        color: 'black',
        fontSize: 20,
        marginBottom: '1%',
      },
      AgeView:{
          flexDirection: 'row',
          width: 0.9*windowWidth,
          alignItems:'center',
          justifyContent: 'space-evenly'
      },
      AgeInput:{
        width: 0.4*windowWidth,
        height: 40,
        backgroundColor: '#dce8e7',
        borderRadius: 5,
        marginBottom: '5%',
        fontSize: 20,
        padding: '1%',
        fontSize: 20,
        color: 'black'
      },
      Seperator:{
        width: 0.1*windowWidth,
        height: 40,
          fontSize: 20,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20
      },
      CheckBoxView:{
        flexDirection: 'row',
        marginBottom: '1%'
      },
      Button:{
        backgroundColor: 'lightblue',
        padding: '3%',
        marginTop: '1%',
        width: 0.9*windowWidth,
        alignItems: 'center',
        borderRadius: 10,
        elevation: 5,
        marginBottom: '5%'
    },
    Text3:{
      fontSize:25,
      fontStyle: 'italic',
      fontWeight: '300'
  },
  EventPrice:{
        height: 40,
        backgroundColor: '#dce8e7',
        borderRadius: 5,
        marginBottom: '5%',
        fontSize: 20,
        padding: '1%',
        width: 0.9*windowWidth,
        fontSize: 20,
        color: 'black'

  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centeredViewModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

});