import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faList,  faUser} from '@fortawesome/free-solid-svg-icons';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Events from './EventsList';
import Info from './Info';
const Tab=createBottomTabNavigator();
  class Tabs extends Component{
      componentDidMount(){
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