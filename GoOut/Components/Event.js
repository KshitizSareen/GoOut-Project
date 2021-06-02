import React, {Component} from 'react';
import NetInfo from '@react-native-community/netinfo';
import { View,StyleSheet,Text, Alert,Dimensions,TouchableOpacity } from 'react-native';
import { FlatList, ScrollView, TextInput } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import CheckBox from '@react-native-community/checkbox';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Modal from 'react-native-modal';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
class EventCreate extends Component{
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
      NetInfo.fetch().then((state)=>{
        if(state.isConnected)
        {
          if(this.state.Name=="" || this.state.Time=="Time" || this.state.Date=="Date")
          {
            Alert.alert("","Please enter Name,Date and Time");
            return;
          }
          firestore().collection('Events').add({
            Name: this.state.Name,
            Tags: this.state.Tags,
            Location: this.state.Location,
            Date: this.state.Date,
            Time: this.state.Time,
            From: this.state.From,
            To: this.state.To,
            Public: this.state.Public,
            Permission: this.state.Permission,
            Owner: this.props.route.params.userid,
            Price: parseInt(this.state.Price),
            ImageUri: "https://firebasestorage.googleapis.com/v0/b/goout-4391e.appspot.com/o/a1695e7b-5875-4314-bf70-b50c4a0386f3_200x200.png?alt=media&token=8c962cb0-02e9-4f51-bec2-e2699cebcfac"
          }).then((doc)=>{
            Alert.alert("","Event has been succesfuly created");
          })
        }
        else{
          Alert.alert("","Please connect to the internet");
        }
      })
    }

    ShowTagModal=(value)=>{
      this.setState({TagModel: value});
    }
    AddTag=(Tag)=>{
      var Tags=this.state.Tags;
      Tags.push('#'+Tag);
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
        var ShowPrice=()=>{
  
          if (this.state.Free)
          {
          return (
            <TextInput placeholder="Set Price" placeholderTextColor="grey" style={styleevent.EventPrice} value={this.state.Price} keyboardType="number-pad" onChangeText={(value)=>{
             this.SetPrice(value);
            }}/>
          )
          }
        }

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
                  <TextInput placeholder="Enter Tag" value={this.state.Tag} placeholderTextColor="grey" style={{
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
                      justifyContent: 'space-between',
                      borderBottomWidth: 1}}>
                      <Text style={{
                    color: 'grey',
                    fontSize: 22,
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
              <View style={styleevent.centeredView}>
                {
                  ShowDateTimeModal()
                }
                {
                  ShowTagModel()
                }
                  <ScrollView showsVerticalScrollIndicator={false}>
                  <TextInput scrollEnabled={true} placeholder="Name" placeholderTextColor="grey" style={styleevent.EventName} value={this.state.Name} onChangeText={(value)=>{
                    this.SetName(value);
                  }}/>
                  <TouchableOpacity>

                  </TouchableOpacity>
                  <TouchableOpacity style={styleevent.EventTags} onPress={()=>{
                    this.ShowTagModal(true);
                  }}>
                    <TextInput multiline={true} editable={false} style={{fontSize: 20,color: 'grey'}} value={this.state.Tags.length==0 ? "Tags" : this.state.Tags.join(' ')}/>
                  </TouchableOpacity>
                  <TextInput placeholder="Location" placeholderTextColor="grey" style={styleevent.EventAddress} value={this.state.Location} multiline={true} onChangeText={(value)=>{
                    this.SetLocation(value);
                  }}/>
                  <TouchableOpacity onPress={()=>{
                    this.SetDateModalVisible();
                    this.SetModalMode("date");
                  }}><Text style={styleevent.Time}>{this.state.Date}</Text></TouchableOpacity>
                  <TouchableOpacity onPress={()=>{
                    this.SetDateModalVisible();
                    this.SetModalMode("time");
                  }}><Text style={styleevent.Time}>{this.state.Time}</Text></TouchableOpacity>
                  <Text style={styleevent.label}>Age Group:</Text>
                  <View style={styleevent.AgeView}>
                      <TextInput style={styleevent.AgeInput} keyboardType="number-pad" placeholder="From" placeholderTextColor="grey" value={this.state.From} onChangeText={(value)=>{
                    this.SetFrom(value);
                  }}/><Text style={styleevent.Seperator}>---</Text><TextInput style={styleevent.AgeInput} placeholderTextColor="grey" keyboardType="number-pad" placeholder="To" value={this.state.To} onChangeText={(value)=>{
                    this.SetTo(value);
                  }}/>
                  </View>
                  <View style={styleevent.CheckBoxView}>
                    <Text style={styleevent.label}>Keep Public</Text>
                    <CheckBox disabled={false} value={this.state.Public} onValueChange={(value)=>{
                      this.SetPublic(value);
                    }}/>
                  </View>
                  <View style={styleevent.CheckBoxView}>
                    <Text style={styleevent.label}>Allow People To Post Content</Text>
                    <CheckBox disabled={false} value={this.state.Permission} onValueChange={(value)=>{
                      this.SetPermission(value);
                    }}/>
                  </View>
                  <View style={styleevent.CheckBoxView}>
                    <Text style={styleevent.label}>Set Price</Text>
                    <CheckBox disabled={false} value={this.state.Free} onValueChange={(value)=>{
                      this.SetPriceVisible(value);
                    }}/>
                  </View>
                  {ShowPrice()}
                  <TouchableOpacity style={styleevent.Button} onPress={()=>{
                    this.UploadData();
                  }}>
                    <Text style={styleevent.Text3}>Create Event</Text>
                  </TouchableOpacity>
                  </ScrollView></View>
  
          );
      }
  }
  export default EventCreate;
  const styleevent=StyleSheet.create({
      centeredView: {
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          alignItems: 'center',
        },
        EventName:{
          width: 375,
          height: 40,
          backgroundColor: '#dce8e7',
          borderRadius: 5,
          marginBottom: '5%',
          fontSize: 20,
          padding: '1%',
          marginTop: '3%',
          color: 'grey'
        },
        EventDescription:{
          width: 375,
          height: 100,
          backgroundColor: '#dce8e7',
          marginBottom: '5%',
          borderRadius: 5,
          fontSize: 20,
          padding: '1%'
        },
        EventTags:{
          width: 375,
          height: 100,
          backgroundColor: '#dce8e7',
          marginBottom: '5%',
          borderRadius: 5,
          padding: '1%',
          justifyContent: 'center',
          
        },
        EventAddress:{
          width: 375,
          height: 100,
          backgroundColor: '#dce8e7',
          marginBottom: '5%',
          borderRadius: 5,
          fontSize: 20,
          padding: '1%',
          fontSize: 20,
          color: 'grey'
        },
        Image:{
            width: 250,
            height: 180,
            marginTop: '5%',
            alignSelf: 'center',
            marginBottom: '5%',
            backgroundColor: '#dce8e7'
        },
        Time:{
          backgroundColor: '#dce8e7',
          borderRadius: 5,
          marginBottom: '5%',
          height: 40,
          fontWeight: '100',
          color: 'grey',
          fontSize: 20,
          padding: '1%',
          paddingTop: '2%',
          width: 375
  
        },
        label:{
          height: 40,
          fontWeight: '100',
          color: 'grey',
          fontSize: 20,
          marginBottom: '1%',
          marginRight: '5%'
        },
        AgeView:{
            flexDirection: 'row'
        },
        AgeInput:{
          width: 170,
          height: 40,
          backgroundColor: '#dce8e7',
          borderRadius: 5,
          marginBottom: '5%',
          fontSize: 20,
          padding: '1%',
          fontSize: 20,
          color: 'grey'
        },
        Seperator:{
            marginLeft: '3%',
            marginRight: '3%',
            fontSize: 20,
            marginTop: '1%'
        },
        CheckBoxView:{
          flexDirection: 'row',
          marginBottom: '1%'
        },
        Button:{
          backgroundColor: 'lightblue',
          padding: '3%',
          marginTop: '1%',
          width: 350,
          alignItems: 'center',
          borderRadius: 10,
          elevation: 5,
          marginLeft: '3%',
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
          width: 375,
          fontSize: 20,
          color: 'grey'

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