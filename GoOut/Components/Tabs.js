import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faEnvelope, faEnvelopeOpenText,  faList,  faMap,  faUser} from '@fortawesome/free-solid-svg-icons';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Events from './EventsList';
import Info from './Info';
import messaging from '@react-native-firebase/messaging';
import firestore  from '@react-native-firebase/firestore';
import CheckInvites from './CheckInvites';
import MyEvents from './MyEvents';
import UserRequests from './UserRequests';
import { BackHandler } from 'react-native';
const Tab=createBottomTabNavigator();
  class Tabs extends Component{
      componentDidMount(){
        this.props.navigation.addListener('focus', () => {
            BackHandler.addEventListener('hardwareBackPress',this.handler);
        });
        this.props.navigation.addListener('blur', () => {
            BackHandler.removeEventListener('hardwareBackPress',this.handler);
        });
          this.GetToken();
      }
      handler=()=>{
        BackHandler.exitApp();
    }
      GetToken=()=>{
                messaging().getToken().then(token=>{
                    firestore().collection('Users').doc(this.props.route.params.userid).update({
                        NotificationToken:token
                    }).catch(err=>{
                        console.log(err);
                    })
                 }).catch(err=>{
                     console.log(err);
                     Alert.alert("","Please enter all the details");
                 })
    }
      render()
      {
          return(
              <Tab.Navigator
              tabBarOptions={{
                  activeTintColor: 'blue',
                  inactiveTintColor: 'black',
                  labelStyle: {
                      fontSize: 12
                  }
              }}>
                  <Tab.Screen
                  name="Check Events" 
                  component={MyEvents}
                  options={{
                      tabBarLabel: 'My Events',
                      tabBarIcon: ()=>(
                          <FontAwesomeIcon icon={faMap} color="grey" size="28"/>
                      ),
                  }}
                  initialParams={{
                    UserID: this.props.route.params.userid
                }}/>
                <Tab.Screen
                  name="Check Invites"
                  component={CheckInvites}
                  options={{
                      tabBarLabel: 'Invites',
                      tabBarIcon: ()=>(
                          <FontAwesomeIcon icon={faEnvelope} color="grey" size="28"/>
                      ),
                  }}
                  initialParams={{
                    UserID: this.props.route.params.userid
                }}/>
                  <Tab.Screen
                  name="Events"
                  component={Events}
                  options={{
                      tabBarLabel: 'Events',
                      tabBarIcon: ()=>(
                          <FontAwesomeIcon icon={faList} color="grey" size="28"/>
                      ),
                  }
                  }
                  initialParams={{
                      userid: this.props.route.params.userid
                  }}/>
                  <Tab.Screen
                  name="Check Requests"
                  component={UserRequests}
                  options={{
                      tabBarLabel: 'Requests',
                      tabBarIcon: ()=>(
                          <FontAwesomeIcon icon={faEnvelopeOpenText} color="grey" size="28"/>
                      ),
                  }}
                  initialParams={{
                    UserID: this.props.route.params.userid
                }}/>
                  <Tab.Screen
                  name="Info"
                  component={Info}
                  options={{
                      tabBarLabel: 'Info',
                      tabBarIcon: ()=>(
                          <FontAwesomeIcon icon={faUser} color="grey" size="28"/>
                      ),
                  }}
                  initialParams={{
                    userid: this.props.route.params.userid
                }}/>
              </Tab.Navigator>
          )
      }
  }
export default Tabs;
