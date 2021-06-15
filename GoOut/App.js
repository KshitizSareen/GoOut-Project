/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React,{Component} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SignIn from './Components/SignIn'
import EventCreate from './Components/Event.js';
import Tabs from './Components/Tabs.js';
import Content from './Components/Content.js';
import ImageEditing from './Components/ImageEditing.js';
import FilterImage from './Components/FilterImage';
import ChatMedia from './Components/ChatMedia';
import PlayMedia from './Components/PlayMedia';
import LoadDocuments from './Components/LoadDocuments';
import Events from './Components/EventsList';
import EventMedia from './Components/EventMedia';
import LoadMedia from './Components/LoadMedia';
import EventInfo from './Components/EventInfo';
import EventUsers from './Components/EventUsers';
import AddUser from './Components/AddUser';
const Stack=createStackNavigator();
class App extends Component{
  render()
  {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerShown: false
      }}>
      <Stack.Screen
            name="Auth"
            component={SignIn}
            options={{
              title: 'Welcome',
              headerStyle: {backgroundColor: '#F0f0f7'},
            }}/>
            <Stack.Screen
            name="Tabs"
            component={Tabs}
            options={{
              title: 'Welcome',
              headerStyle: {backgroundColor: '#F0f0f7'},
            }}/>
            <Stack.Screen
            name="EventCreate"
            component={EventCreate}
            options={{
              title: 'Welcome',
              headerStyle: {backgroundColor: '#F0f0f7'},
            }}/>
            <Stack.Screen
            name="Content"
            component={Content}
            options={{
              title: 'Welcome',
              headerStyle: {backgroundColor: '#F0f0f7'},
            }}/>
            <Stack.Screen
            name="Image Editing"
            component={ImageEditing}
            options={{
              title: 'Welcome',
              headerStyle: {backgroundColor: '#F0f0f7'},
            }}/>
            <Stack.Screen
            name="Image Filter"
            component={FilterImage}
            options={{
              title: 'Welcome',
              headerStyle: {backgroundColor: '#F0f0f7'},
            }}/>
            <Stack.Screen
            name="Chat Media"
            component={ChatMedia}
            options={{
              title: 'Welcome',
              headerStyle: {backgroundColor: '#F0f0f7'},
            }}/>
            <Stack.Screen
            name="PlayMedia"
            component={PlayMedia}
            options={{
              title: 'Welcome',
              headerStyle: {backgroundColor: '#F0f0f7'},
            }}/>
            <Stack.Screen
            name="LoadDocuments"
            component={LoadDocuments}
            options={{
              title: 'Welcome',
              headerStyle: {backgroundColor: '#F0f0f7'},
            }}/>
            <Stack.Screen
            name="EventList"
            component={Events}
            options={{
              title: 'Welcome',
              headerStyle: {backgroundColor: '#F0f0f7'},
            }}/>
            <Stack.Screen
            name="EventMedia"
            component={EventMedia}
            options={{
              title: 'Welcome',
              headerStyle: {backgroundColor: '#F0f0f7'},
            }}/>
            <Stack.Screen
            name="LoadMedia"
            component={LoadMedia}
            options={{
              title: 'Welcome',
              headerStyle: {backgroundColor: '#F0f0f7'},
            }}/>
            <Stack.Screen
            name="EventInfo"
            component={EventInfo}
            options={{
              title: 'Welcome',
              headerStyle: {backgroundColor: '#F0f0f7'},
            }}/>
            <Stack.Screen
            name="EventUsers"
            component={EventUsers}
            options={{
              title: 'Welcome',
              headerStyle: {backgroundColor: '#F0f0f7'},
            }}/>
            <Stack.Screen
            name="AddUser"
            component={AddUser}
            options={{
              title: 'Welcome',
              headerStyle: {backgroundColor: '#F0f0f7'},
            }}/>
            </Stack.Navigator>
    </NavigationContainer>
  )}
          }  

export default App;