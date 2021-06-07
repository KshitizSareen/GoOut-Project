import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faList,  faUser} from '@fortawesome/free-solid-svg-icons';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Events from './EventsList';
import Info from './Info';
import messaging from '@react-native-firebase/messaging';
import NetInfo from '@react-native-community/netinfo';
import firestore  from '@react-native-firebase/firestore';
const Tab=createBottomTabNavigator();
  class Tabs extends Component{
      componentDidMount(){
          this.GetToken();
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
      GetToken=()=>{
        NetInfo.fetch().then(state=>{
            if(state.isConnected)
            {
                messaging().getToken().then(token=>{
                    firestore().collection('Users').doc(this.props.route.params.userid).update({
                        NotificationToken:token
                    }).catch(err=>{
                        console.log(err);
                    })
                 })
            }
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
