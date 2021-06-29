import React, {Component} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowAltCircleRight, faFile, faImage,faPlay,faUpload} from '@fortawesome/free-solid-svg-icons';
import { View,StyleSheet,Text,Alert,TouchableOpacity,FlatList,  TextInput,Dimensions,BackHandler,Image} from 'react-native';
import firestore  from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import Video from 'react-native-video';
import FastImage from 'react-native-fast-image';
import { ScrollView } from 'react-native-gesture-handler';
import ImageResizer from 'react-native-image-resizer';
import {ProcessingManager} from 'react-native-video-processing';
import { createThumbnail } from "react-native-create-thumbnail";
class EventMedia extends Component{
    constructor() {
        super();
        this.state = {
            Media: [],
            User: null
        };
      }
      componentDidMount(){
        firestore().collection('Users').doc(this.props.userid).get().then((doc)=>{
            if(doc.exists)
            {
                var User=new Object();
                User.Name=doc.data().Username;
                this.setState({User: User});
                this.GetMedia();
            }
        })
      }
      GetMedia= async ()=>{
        firestore().collection('Events').doc(this.props.eventid).get().then(doc=>{
            if(doc.exists)
            {
                if('Media' in doc.data())
                {
                    this.setState({Media:doc.data().Media});
                    
                }
            }
        })
      }
      LoadImage= async ()=>{
        firestore().collection('Events').doc(this.props.eventid).get().then(doc=>{
            if(doc.exists)
            {
                if('Media' in doc.data())
                {
                    this.setState({Media:doc.data().Media});
                    
                }
            }
        })
      }
      UploadPhoto= ()=>{
        this.setState({modalUploadVisible: false});
        ImagePicker.openPicker({
            multiple: true,
          }).then(images => {
              var ImagesToSend=[];
              images.map(image=>{
                  if(image.mime.split('/')[0]=="image")
                  {
              ImageResizer.createResizedImage(image.path, windowWidth, 0.9*windowHeight, 'JPEG', 100, 0, undefined, false,{mode:'contain',onlyScaleDown:true})
                .then(resizedImage => {
                    var ImageObject={};
                        ImageObject=image;
                    ImageObject.path=resizedImage.uri;
                    /*console.log(resizedImage.width);
                    console.log(resizedImage.height);
                    console.log(resizedImage.size);*/
                    ImagesToSend.push(ImageObject);
                    if(ImagesToSend.length==images.length)
                                {
                             this.props.navigation.navigate("Image Editing",{Images:ImagesToSend,SendMessage: this.SendMediaMessage,UserId:this.props.userid,eventid: this.props.eventid,User: this.state.User,FromMedia: true,LoadImage:this.LoadImage});
                                }
                    }).catch(err => {
                        console.log(err);
                        return Alert.alert(
                          'Unable to resize the photo',
                          'Check the console for full the error message',
                        );
                      });
                    }
                    else
                    {
                        createThumbnail({
                            url: image.path,
                            timeStamp: 1,
                          })
                            .then(response => {
                                var VideoObject={};
                                VideoObject=image;
                                VideoObject.thumbnailpath=response.path;
                                ProcessingManager.getVideoInfo(image.path).then(origin=>{
                                    ProcessingManager.compress(image.path, {
                                        width: origin.size && origin.size.width / 3,
                                        height: origin.size && origin.size.height / 3,
                                        bitrateMultiplier: 7,
                                        minimumBitrate: 300000
                                        }).then(NewVideo=>{
                                            VideoObject.path=NewVideo.source;
                                            ImagesToSend.push(VideoObject);
                                            if(ImagesToSend.length==images.length)
                                {
                             this.props.navigation.navigate("Image Editing",{Images:ImagesToSend,SendMessage: this.SendMediaMessage,UserId:this.props.userid,eventid: this.props.eventid,User: this.state.User,FromMedia: true,LoadImage:this.LoadImage});
                                }
                                        });
                                });
                            })
                            .catch(err => console.log({ err }));

                    }
                })
              }).catch(err=>{
              })
              
    }
      render(){
          return(
              <View style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
              }}>
                  <FlatList data={this.state.Media} initialNumToRender={3} style={{
                      margin: '1%'
                  }} numColumns={3} renderItem={(data)=>{
                      //console.log(data.item);
                      if(data.item.MediaFile.Type==0)
                      {
                          return(
                              <TouchableOpacity style={{
                                borderWidth: 1,
                                borderColor: 'white',
                            }} onPress={()=>{
                                this.props.navigation.navigate("LoadMedia",{MediaFile: data.item.MediaFile,MediaUrl: data.item.MediaUrl})
                            }}>
                              <FastImage style={{
                                  width: 0.32*windowWidth,
                                  height: 0.32*windowWidth
                              }} source={{
                                  uri: data.item.MediaUrl,
                                  priority: FastImage.priority.low
                              }} resizeMode="cover"/>
                              </TouchableOpacity>
                          )
                      }
                      else if(data.item.MediaFile.Type==1)
                      {
                          return(
                          <TouchableOpacity style={{
                              borderWidth: 1,
                              borderColor: 'white',
                              alignSelf: 'flex-start'
                          }} onPress={()=>{
                            this.props.navigation.navigate("LoadMedia",{MediaFile: data.item.MediaFile,MediaUrl: data.item.MediaUrl})
                        }}>
                              <FastImage style={{
                                  width: 0.32*windowWidth,
                                  height: 0.32*windowWidth
                              }} source={{
                                  uri: data.item.thumbnailUrl,
                                  priority: FastImage.priority.low
                              }} resizeMode="cover"/>
                          </TouchableOpacity>
                          );
                      }
                  }} refreshing={true}/>
                  <View style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '2%'
                  }}>
                      <TouchableOpacity onPress={()=>{
                          this.UploadPhoto();
                      }}>
                          <FontAwesomeIcon icon={faUpload} size="40" color="lightblue"/>
                      </TouchableOpacity>
                  </View>
              </View>
          )
      }
}
export default EventMedia;