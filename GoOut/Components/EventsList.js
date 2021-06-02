import React, {Component} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSearch,faWindowClose,faCheck, faPlus} from '@fortawesome/free-solid-svg-icons';
import { View,StyleSheet,Image,Text, Alert} from 'react-native';
import { FlatList, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
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
          Events: null,
        };
      }
      componentDidMount(){
          this.userid=this.props.route.params.userid;
          NetInfo.fetch().then((state)=>{
              if(state.isConnected)
              {
                  this.GetEvents();
              }
              else{
                Alert.alert("","Please connect to the internet");
              }
          })
      }
    GetEvents= async ()=>{
        var Eventarray=[];
        const snapshot = await firestore().collection('Events').get()
        snapshot.docs.map(doc => Eventarray.push({data:doc.data(),id:doc.id}));
        this.setState({Events: Eventarray})
      }
      onSelectedItemsChange = (selectedItems) => {
        this.setState({ selectedItems });
      };
    icon = ({ name, size = 18, style }) => {
        // flatten the styles
        const flat = StyleSheet.flatten(style)
        // remove out the keys that aren't accepted on View
        const { color, fontSize, ...styles } = flat
    
        let iconComponent
        // the colour in the url on this site has to be a hex w/o hash
        const iconColor = color && color.substr(0, 1) === '#' ? `${color.substr(1)}/` : ''
    
        const Search = (
            <FontAwesomeIcon icon={faSearch} size="15" />
          )
          const Close = (
            <FontAwesomeIcon icon={faWindowClose} size="15" />
          )
      
          const Check = (
            <FontAwesomeIcon icon={faCheck} size="15" />
          )
          const Cancel = (
            <FontAwesomeIcon icon={faWindowClose} size="10" />
          )
          const Down = (
            <Image
            />
          )
          const Up = (
            <Image
            />
          )
    
        switch (name) {
          case 'search':
            iconComponent = Search
            break
          case 'keyboard-arrow-up':
            iconComponent = Up
            break
          case 'keyboard-arrow-down':
            iconComponent = Down
            break
          case 'close':
            iconComponent = Close
            break
          case 'check':
            iconComponent = Check
            break
          case 'cancel':
            iconComponent = Cancel
            break
          default:
            iconComponent = null
            break
        }
        return <View style={stylesMultiSelect}>{iconComponent}</View>
      }
    render(){
        return(
            <View style={styleevent.Background}>
                <View style={styleevent.Search}>
                    <TextInput placeholder={"Search Here"} style={styleevent.Bar}/>
                </View>
                <View style={{
                    width: 300
                }}>
                <SectionedMultiSelect
          items={items}
          IconRenderer={this.icon}
          uniqueKey="id"
          subKey="children"
          selectText="Tags..."
          showDropDowns={true}
          expandDropDowns={true}
          readOnlyHeadings={false}
          onSelectedItemsChange={this.onSelectedItemsChange}
          selectedItems={this.state.selectedItems}
          modalWithTouchable={true}
          styles={{
              itemText:{
                  fontSize: 20,
                  fontWeight: 'normal'
              },
              chipContainer:{
                  width: 80,
                  justifyContent: 'space-around',
              },
              chipText: {
                  fontStyle: 'italic',
              },
              selectToggle:{
                backgroundColor: '#dce8e7',
                marginTop: '5%',
                marginBottom: '1%',
                borderRadius: 10,
                width:300,
              },
              selectToggleText:{
                  textAlign: 'center'
              }
              
              
          }}
          />
          <View style={styleevent.AddEvent}>
              <Text style={styleevent.TextEvent}>Add Event</Text>
              <TouchableOpacity onPress={()=>{
                 this.props.navigation.navigate("EventCreate",{userid: this.userid});
              }}>
                  <FontAwesomeIcon icon={faPlus} size="23"/>
              </TouchableOpacity>
          </View>
          </View>
          <FlatList data={this.state.Events} renderItem={(event)=>{
              return(
                  <TouchableOpacity style={styleevent.EventContainer} onPress={()=>{
                      this.props.navigation.navigate("Content",{userid: this.userid,eventid:event.item.id });
                  }} ><Text style={styleevent.title}>{event.item.data.Name}</Text>
                    <Image style={styleevent.Image} source={
                        {
                            uri: "https://firebasestorage.googleapis.com/v0/b/goout-eb557.appspot.com/o/Image_Add-512.png?alt=media&token=dc8cb0cb-b5b6-4eae-bc87-ca303728902f"
                        }
                    }/></TouchableOpacity>);
          }} keyExtractor={event=>event.id} ItemSeparatorComponent={()=>{
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
        marginTop: '10%'
    },
    Bar:{
        width: 300,
        height: 40,
        backgroundColor: '#dce8e7',
        borderRadius: 10
    },
    SearchButton:{
        backgroundColor: '#d8dee8',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        
    },
    AddEvent:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#dce8e7',
        marginTop: '10%',
        borderRadius: 10,
        padding: 10,
        marginBottom: '10%'
    },
    TextEvent:{
        fontSize: 19,
    },
    Events: {
        fontSize: 10
      },
      title: {
        fontSize: 25,
        margin: '3%',
      },
      EventContainer:{
          backgroundColor: '#fae49b',
          borderRadius: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: 400,
          elevation: 5,
          marginBottom: '1%'
      },
      ItemSeparatorComponent:{
          marginBottom: '2%',
          marginTop: '2%',
          backgroundColor: 'black',
          height: 1,
      },
      Image:{
        width: 50,
        height: 50,
        alignSelf: 'center'
    },
})
export default Events;
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