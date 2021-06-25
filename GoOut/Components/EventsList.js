import React, {Component} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSearch,faWindowClose,faCheck, faPlus} from '@fortawesome/free-solid-svg-icons';
import { View,StyleSheet,Image,Text, Alert,Dimensions} from 'react-native';
import { FlatList, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
  const items = [
      // this is the parent or 'item'
      {
        name: 'Tags',
        id: 0,
        // these are the children or 'sub items'
      },
    
    ];
class Events extends Component{
    constructor() {
        super();
        this.state = {
          selectedItems: [],
          Events: [],
          EventKey:""
        };
      }
      SearchEvents=(Event)=>{
        firestore().collection('Events').where("SearchArray","array-contains",Event.toLowerCase().trim()).where("Public","==",true).limit(1000).get().then(NameResults=>{
          firestore().collection('Events').where("Tags","array-contains",Event.toLowerCase().trim()).where("Public","==",true).limit(1000).get().then(TagResults=>{
            var Events=[];
            var EventIDSet=new Set();
            for(var i=0;i<NameResults.docs.length;i++)
            {
              if (!EventIDSet.has(NameResults.docs[i].id))
              {
                EventIDSet.add(NameResults.docs[i].id);
                Events.push(NameResults.docs[i]);
              }
            }
            for(var i=0;i<TagResults.docs.length;i++)
            {
              if (!EventIDSet.has(TagResults.docs[i].id))
              {
                EventIDSet.add(TagResults.docs[i].id);
                Events.push(TagResults.docs[i]);
              }
            }
            console.log(Events);
            this.setState({Events: Events});
          })
        })
      }
    render(){
        return(
            <View style={styleevent.Background}>
               <TouchableOpacity style={styleevent.AddEvent} onPress={()=>{
                 this.props.navigation.navigate("EventCreate",{userid: this.props.route.params.userid});
              }}>
              <Text style={styleevent.TextEvent}>Add Event</Text>
          </TouchableOpacity>
          <TextInput placeholder={"Search Here"} style={styleevent.Bar} value={this.state.EventKey} onChange={(value=>{
            this.setState({EventKey: value.nativeEvent.text});
            this.SearchEvents(value.nativeEvent.text);
          })}/>
          <FlatList data={this.state.Events} style={{marginTop: '4%'}} renderItem={(event)=>{
              return(
                  <TouchableOpacity style={styleevent.EventContainer} onPress={()=>{
                      this.props.navigation.navigate("Content",{userid: this.props.route.params.userid,eventid:event.item.id,EventName: event.item.data().Name });
                  }} ><Text style={styleevent.title}>{event.item.data().Name}</Text>
                    <Image style={styleevent.Image} source={
                        {
                            uri: event.item.data().ImageUri
                        }
                    }/></TouchableOpacity>);
          }} ItemSeparatorComponent={()=>{
              return(<View style={styleevent.ItemSeparatorComponent}/>);
          }}/>
                </View>       
        )
    }
}
const styleevent=StyleSheet.create({
    Background:{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    Search:{
        flexDirection: 'row',
        marginTop: '3%'
    },
    Bar:{
        width: 0.9*windowWidth,
        height: 50,
        backgroundColor: '#dce8e7',
        borderRadius: 10
    },
    SearchButton:{
        backgroundColor: '#d8dee8',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
      },
    AddEvent:{
        justifyContent: 'center',
        backgroundColor: '#dce8e7',
        marginTop: '3%',
        borderRadius: 10,
        padding: 10,
        marginBottom: '3%'
    },
    TextEvent:{
        fontSize: 19,
    },
    Events: {
        fontSize: 10
      },
      title: {
        fontSize: 25,
        width: 0.7*windowWidth
      },
      EventContainer:{
          backgroundColor: 'lightblue',
          borderRadius: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          elevation: 5,
          marginBottom: '1%',
          width: 0.9*windowWidth,
          padding: '1%',
          alignItems: 'center'
      },
      ItemSeparatorComponent:{
          marginTop: '2%',
          backgroundColor: 'black',
      },
      Image:{
        width: 50,
        height: 50,
        borderRadius: 50
    },
})
export default Events;