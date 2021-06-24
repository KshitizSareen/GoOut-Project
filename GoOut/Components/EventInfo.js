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
      NetInfo.fetch().then((state)=>{
        if(state.isConnected)
        {
          if(this.state.Name=="" || this.state.Time=="Time" || this.state.Date=="Date")
          {
            Alert.alert("","Please enter Name,Date and Time");
            return;
          }
          firestore().collection('Events').doc(this.props.eventid).update({
            Name: this.state.Name,
            Tags: this.state.Tags,
            Location: this.state.Location,
            Date: this.state.Date,
            Time: this.state.Time,
            From: this.state.From,
            To: this.state.To,
            Public: this.state.Public,
            Permission: this.state.Permission,
            Owner: this.props.userid,
            Price: parseInt(this.state.Price),
            Free: this.state.Free
          }).then(()=>{
            Alert.alert("","Event has been succesfuly updated");
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
            <TextInput editable={this.props.userid==this.props.OwnerId} placeholder="Set Price" placeholderTextColor="grey" style={styleevent.EventPrice} value={this.state.Price.toString()} keyboardType="number-pad" onChangeText={(value)=>{
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
                      borderBottomWidth: 1}}>
                      <Text style={{width: 0.75*windowWidth,
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
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styleevent.centeredView}>
                {
                  ShowDateTimeModal()
                }
                {
                  ShowTagModel()
                }
                  <TextInput editable={this.props.userid==this.props.OwnerId} scrollEnabled={true} placeholder="Name" placeholderTextColor="grey" style={styleevent.EventName} value={this.state.Name} onChangeText={(value)=>{
                    this.SetName(value);
                  }}/>
                  <TouchableOpacity disabled={this.props.userid!=this.props.OwnerId} style={styleevent.EventTags} onPress={()=>{
                    this.ShowTagModal(true);
                  }}>
                    <TextInput multiline={true} editable={false} style={{fontSize: 20,color: 'grey'}} value={this.state.Tags.length==0 ? "Tags" : this.state.Tags.join(' ')}/>
                  </TouchableOpacity>
                  <TextInput editable={this.props.userid==this.props.OwnerId} placeholder="Location" placeholderTextColor="grey" style={styleevent.EventAddress} value={this.state.Location} multiline={true} onChangeText={(value)=>{
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
                      <TextInput editable={this.props.userid==this.props.OwnerId} style={styleevent.AgeInput} keyboardType="number-pad" placeholder="From" placeholderTextColor="grey" value={this.state.From} onChangeText={(value)=>{
                    this.SetFrom(value);
                  }}/>
                  <View style={styleevent.Seperator}><Text>---</Text></View>
                  <TextInput editable={this.props.userid==this.props.OwnerId} style={styleevent.AgeInput} placeholderTextColor="grey" keyboardType="number-pad" placeholder="To" value={this.state.To} onChangeText={(value)=>{
                    this.SetTo(value);
                  }}/>
                  </View>
                  <View style={styleevent.CheckBoxView}>
                    <Text style={styleevent.label}>Keep Public</Text>
                    <CheckBox disabled={this.props.userid!=this.props.OwnerId} value={this.state.Public} onValueChange={(value)=>{
                      this.SetPublic(value);
                    }}/>
                  </View>
                  <View style={styleevent.CheckBoxView}>
                    <Text style={styleevent.label}>Allow People To Post Content</Text>
                    <CheckBox disabled={this.props.userid!=this.props.OwnerId} value={this.state.Permission} onValueChange={(value)=>{
                      this.SetPermission(value);
                    }}/>
                  </View>
                  <View style={styleevent.CheckBoxView}>
                    <Text style={styleevent.label}>Set Price</Text>
                    <CheckBox disabled={this.props.userid!=this.props.OwnerId} value={this.state.Free} onValueChange={(value)=>{
                      this.SetPriceVisible(value);
                    }}/>
                  </View>
                  {ShowPrice()}
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
        color: 'grey'
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
        color: 'grey'
      },
      Time:{
        fontSize: 20,
        color: 'grey'
      },
      label:{
        height: 40,
        fontWeight: '100',
        color: 'grey',
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
        color: 'grey'
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