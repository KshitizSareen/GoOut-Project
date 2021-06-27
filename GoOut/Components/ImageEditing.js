import React, {Component} from 'react';
import { View,StyleSheet,Image,TouchableOpacity,FlatList, Alert, BackHandler} from 'react-native';
import { Dimensions } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowRight, faCrop, faFilter, faUndo} from '@fortawesome/free-solid-svg-icons';
import Video from 'react-native-video';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import {ImageFilterModule} from './Modules';
import NetInfo from '@react-native-community/netinfo';
import storage from '@react-native-firebase/storage';
import * as Progress from 'react-native-progress';
import firestore  from '@react-native-firebase/firestore';
import ImagePicker from 'react-native-image-crop-picker';
var currentIndex=0;
var ImageArray=[];
class ImageEditing extends Component{
    constructor(){
        super();
        this.state={
            ImagesUri:[],
            index:0,
            Paused:[],
            ShowIndicator: false,
            Types:[],
            Yindex:[],
            marginIndex:[],
        }
    } 
    componentDidMount(){
        ImageArray=[];
        currentIndex=0;
       this.props.route.params.Images.forEach((Image)=>{
        
           if(Image.mime.split('/')[0]=="image")
            {
            var ImageUri=this.state.ImagesUri;
            var Types=this.state.Types;
            var Yindex=this.state.Yindex;
            var marginIndex=this.state.marginIndex;
            ImageUri.push(Image.path);
            Types.push(0);
            Yindex.push(-1);
            marginIndex.push(-1);
            this.setState({ImagesUri:ImageUri});
            this.setState({Types: Types});
            this.setState({Yindex: Yindex});
            this.setState({marginIndex: marginIndex});
            ImageArray.push({
                Uri:Image.path,
                Type:0,
                Width:0,
                Height:0,
                downloadurl:"",
                FilePath:"",
            });
            this.DisplayImages(Image.path,ImageUri.length-1);
            }
            else
            {
                var ImageUri=this.state.ImagesUri;
            var Types=this.state.Types;
            var Yindex=this.state.Yindex;
            var marginIndex=this.state.marginIndex;
            ImageUri.push(Image.path);
            Types.push(1);
            Yindex.push(-1);
            marginIndex.push(-1);
             ImageArray.push({
                    Uri:Image.path,
                    Type:1,
                    Width:Image.width,
                    Height:Image.height,
                    downloadurl:"",
                    FilePath:"",
                    thumbnailpath: Image.thumbnailpath
                });
            if(Image.height>(0.9*windowHeight))
            {
                Yindex[ImageUri.length-1]=0.9*windowHeight;
                marginIndex[ImageUri.length-1]=0;
            }
            else
            {
                var yaxis=(Image.height/Image.width)*windowWidth;
                Yindex[ImageUri.length-1]=yaxis;
                marginIndex[ImageUri.length-1]=(0.9-yaxis/windowHeight)/2;
            }
            this.setState({ImagesUri: ImageUri});
            this.setState({Types: Types});
            this.setState({Yindex: Yindex});
            this.setState({marginIndex: marginIndex});
            }
            var Paused=this.state.Paused;
            Paused.push(true);
            this.setState({Paused:Paused});
        });
    }
    viewabilityConfig = {
        viewAreaCoveragePercentThreshold: 50,
      };
      onViewableItemsChanged = ({viewableItems, changed}) => {
        if(viewableItems.length>0)
        {
            var Paused=this.state.Paused;
            Paused[currentIndex]=true;
            Paused[viewableItems[0].index]=false;
            this.setState({Paused:Paused});
            console.log(viewableItems[0].index);
            this.setState({index:viewableItems[0].index})
            currentIndex=viewableItems[0].index;
            console.log(this.state.Paused);            
      }
    }
      OpenCropper=()=>{
        ImagePicker.openCropper({
            path: this.state.ImagesUri[this.state.index]}).then((ImageUri)=>{
            console.log(ImageUri);
            ImageFilterModule.CheckImageOrientation(ImageUri.path).then((res)=>{
                var index=this.state.index;
                var WH=res.split(',').map(Number);
                console.log(WH)
            var yaxis=(WH[1]/(WH[0]))*windowWidth;
            ImageArray[this.state.index].Width=WH[0];
        ImageArray[this.state.index].Height=WH[1];
            var Yindex=this.state.Yindex;
        var marginIndex=this.state.marginIndex;
        if(yaxis>(0.9*windowHeight))
        {
            Yindex[index]=0.9*windowHeight;
            marginIndex[index]=0;
            this.setState({Yindex: Yindex});
            this.setState({marginIndex: marginIndex});
        }
        else
        {
            Yindex[index]=yaxis;
            marginIndex[index]=(0.9-yaxis/windowHeight)/2;
            this.setState({Yindex: Yindex});
            this.setState({marginIndex: marginIndex});
        }
        });
        ImageArray[this.state.index].Uri=ImageUri.path;
            var UriArray=this.state.ImagesUri;
          UriArray[this.state.index]=ImageUri.path;
          this.setState({ImagesUri:UriArray});
        })
      }
      SetImage=(Uri)=>{
          var UriArray=this.state.ImagesUri;
          UriArray[this.state.index]=Uri;
          ImageArray[this.state.index].Uri=Uri;
          this.setState({ImagesUri:UriArray});
          this.props.navigation.goBack();
      }
      FilterImage=()=>{
          this.props.navigation.navigate("Image Filter",{ImageUri: this.state.ImagesUri[this.state.index],SetUri:this.SetImage});
      }
      UndoImage=()=>{
        ImageFilterModule.CheckImageOrientation(this.props.route.params.Images[this.state.index].path).then((res)=>{
            var index=this.state.index;
            var WH=res.split(',').map(Number);
            console.log(WH)
        var yaxis=(WH[1]/(WH[0]))*windowWidth;
        ImageArray[this.state.index].Width=WH[0];
        ImageArray[this.state.index].Height=WH[1];
        var Yindex=this.state.Yindex;
        var marginIndex=this.state.marginIndex;
        if(yaxis>(0.9*windowHeight))
        {
            Yindex[index]=0.9*windowHeight;
            marginIndex[index]=0;
            this.setState({Yindex: Yindex});
            this.setState({marginIndex: marginIndex});
        }
        else
        {
            Yindex[index]=yaxis;
            marginIndex[index]=(0.9-yaxis/windowHeight)/2;
            this.setState({Yindex: Yindex});
            this.setState({marginIndex: marginIndex});
        } 
    });

          ImageArray[this.state.index].Uri=this.props.route.params.Images[this.state.index].path;
          var Images=this.state.ImagesUri;
          Images[this.state.index]=this.props.route.params.Images[this.state.index].path;
          this.setState({ImagesUri:Images});
      }
      DisplayImages=  (ImageUri,index)=>{
     ImageFilterModule.CheckImageOrientation(ImageUri).then((res)=>{
            var WH=res.split(',').map(Number);
            console.log(WH)
            ImageArray[index].Width=WH[0];
            ImageArray[index].Height=WH[1];
        var yaxis=(WH[1]/(WH[0]))*windowWidth;
        var Yindex=this.state.Yindex;
        var marginIndex=this.state.marginIndex;
        if(yaxis>(0.9*windowHeight))
        {
            Yindex[index]=0.9*windowHeight;
            marginIndex[index]=0;
            this.setState({Yindex: Yindex});
            this.setState({marginIndex: marginIndex});
        }
        else
        {
            Yindex[index]=yaxis;
            marginIndex[index]=(0.9-yaxis/windowHeight)/2;
            this.setState({Yindex: Yindex});
            this.setState({marginIndex: marginIndex});
        }
        console.log(this.state.ImagesUri);
        console.log("Images:");
        console.log(ImageArray);
    });
            
      }

      SendImage=()=>{
          console.log(ImageArray);
       NetInfo.fetch().then((state)=>{
            if(state.isConnected)
            {
                var Paused=this.state.Paused;
                for(var i=0;i<Paused.length;i++)
                {
                    Paused[i]=true;
                }
                this.setState({Paused: Paused});
                var CallFunctionFromImage=false;
                var CallFunctionFromVideo=false;
                var ThumbNailCount=0;
                if(this.props.route.params.FromMedia==true)
                {
                    for(var i=0;i<ImageArray.length;i++){
                        if(ImageArray[i].Type==1)
                        {
                            CallFunctionFromVideo=true;
                            ThumbNailCount+=1;
                        }
                    }
                    CallFunctionFromImage=!CallFunctionFromVideo;
                }
             this.setState({ShowIndicator: true});
             var Messages=[];
             var Media=[];
             var MediaArray=[];
             var Message=[];
                var Set=[];
                var SetThumbnails=[];
                var UploadData=(callFunction)=>{
                    if(callFunction)
                    {
                    if(Set.length==this.state.ImagesUri.length)
                        {
                          if(this.props.route.params.FromMedia==false)
                          {
                          firestore().collection('Events').doc(this.props.route.params.eventid).get().then(res=>{
                              if ('Messages' in res.data())
                              {
                                  Messages=res.data().Messages;

                              }
                              Messages.unshift({Message:Message,User:this.props.route.params.User,type: 1});
                          }).then(()=>{
                            firestore().collection('Events').doc(this.props.route.params.eventid).update({
                                Messages: Messages
                            }).then(()=>{
                                this.props.route.params.SendMessage();
                                this.setState({ShowIndicator: false});
                                this.props.navigation.goBack();
                            });

                          })
                        }
                        else
                        {
                            firestore().collection('Events').doc(this.props.route.params.eventid).get().then(res=>{
                                if('Media' in res.data())
                                {
                                    Media=res.data().Media;
                                }
                                MediaArray.forEach(MediaFile=>{
                                    console.log(MediaFile);
                                    Media.unshift(MediaFile);
                                })
                            }).then(()=>{
                                firestore().collection('Events').doc(this.props.route.params.eventid).update({
                                    Media: Media
                                }).then(()=>{
                                    this.props.route.params.LoadImage();
                                    this.setState({ShowIndicator: false});
                                    this.props.navigation.goBack();
                                })
                            })
                        }
                      }
                    }
                }
              ImageArray.forEach((File)=>{
                  var fileName=File.Uri.split('/');
                  fileName=fileName[fileName.length-1];
                  var storageRef;
                  if(this.props.route.params.FromMedia==false)
                  {
                  storageRef=storage().ref(`Event/Chat/${this.props.route.params.eventid}/${this.props.route.params.UserId}/${fileName}`);
                  }
                  else
                  {
                    storageRef=storage().ref(`Event/Media/${this.props.route.params.eventid}/${this.props.route.params.UserId}/${fileName}`);
                  }
              storageRef.putFile(File.Uri).on(
                storage.TaskEvent.STATE_CHANGED,
                snapshot=>{
                  console.log("snapshot: "+snapshot.state);
                  console.log("progress: "+(snapshot.bytesTransferred/snapshot.totalBytes)*100);
                  if(snapshot.state==storage.TaskState.SUCCESS){
                    console.log("Success");
                    storageRef.getDownloadURL().then(downloadurl=>{
                        if(!Set.includes(downloadurl))
                        {
                        Set.push(downloadurl);
                        if(this.props.route.params.FromMedia==false)
                        {
                        var ImageObject=File;
                        ImageObject.downloadurl=downloadurl;
                        ImageObject.FilePath=`${this.props.route.params.UserId}/${fileName}`;
                        Message.push(ImageObject);
                        UploadData(true);
                        }
                        if(this.props.route.params.FromMedia==true)
                        {
                            //MediaArray.push({MediaFile:File,MediaUrl:downloadurl});
                            if(File.Type==0)
                            {
                                MediaArray.push({MediaFile:File,MediaUrl:downloadurl});
                                UploadData(CallFunctionFromImage);
                            }
                            else
                            {

                            var VideoObject={
                                MediaFile: File,
                                MediaUrl: downloadurl
                            };
                            var fileThumbNail=File.thumbnailpath.split('/');
                  fileThumbNail=fileThumbNail[fileThumbNail.length-1];
                            var storageRefThumbnail=storage().ref(`Event/Media/${this.props.route.params.eventid}/Thumbnail/${fileThumbNail}`);
                            storageRefThumbnail.putFile(File.thumbnailpath).on(
                                storage.TaskEvent.STATE_CHANGED,
                                snapshotThumbnail=>{
                                    console.log("Thumbnail snapshot: "+snapshotThumbnail.state);
                                    if(snapshotThumbnail.state==storage.TaskState.SUCCESS)
                                    {
                                        storageRefThumbnail.getDownloadURL().then(downloadurlThumbnail=>{
                                            if(!SetThumbnails.includes(downloadurlThumbnail))
                                            {
                                                SetThumbnails.push(downloadurlThumbnail);
                                            VideoObject.thumbnailUrl=downloadurlThumbnail;
                                            MediaArray.push(VideoObject);
                                            if(SetThumbnails.length==ThumbNailCount)
                                            {
                                            UploadData(CallFunctionFromVideo);
                                            }
                                            }

                                            
                                        })
                                    }
                                }
                            )
                        }
                        }
                        }
                    })
                  }
                },
                error=>{
                  console.log("image upload error"+ error);
                },
                )
              })
              }
            else
            {
                Alert.alert("","Please connect to the internet");
            }
        })
      }
      HandleBackButton(){
          return true;
      }
      componentWillUnmount(){
          ImageArray=[];
      }
      render(){
          const ShowProgressIndicator=()=>{
              if(this.state.ShowIndicator)
              {
                  return(
                      <View style={styles.ProgressIndicator}>
                          <Progress.Circle size={80} indeterminate={true} />
                      </View>
                  )
              }
          }
          var ShowLowerContainer=()=>{
              if(this.state.Types[this.state.index]==0)
              {
                 return(
                    <View style={styles.ButtonLowerContainer}>
                    <TouchableOpacity style={styles.ButtonStyle} onPress={()=>{
                        this.OpenCropper();
                    }}>
                        <FontAwesomeIcon icon={faCrop} size="30" color="lightblue"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ButtonStyle} onPress={()=>{
                        this.FilterImage();
                    }}>
                        <FontAwesomeIcon icon={faFilter} size="30" color="lightblue"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ButtonStyle} onPress={()=>{
                        this.UndoImage();
                    }}>
                        <FontAwesomeIcon icon={faUndo} size="30" color="lightblue"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ButtonStyle} onPress={()=>{
                        this.SendImage();
                    }}>
                        <FontAwesomeIcon icon={faArrowRight} size="30" color="lightblue"/>
                    </TouchableOpacity>
                </View>

                  )
              }
              else
              {
                return(
                    <View style={styles.ButtonLowerContainer}>
                    <TouchableOpacity style={styles.ButtonStyle} onPress={()=>{
                        this.SendImage();
                    }}>
                        <FontAwesomeIcon icon={faArrowRight} size="30" color="lightblue"/>
                    </TouchableOpacity>
                </View>
                )
                    return(
                        <View/>
                    )
              }
          }
                return(
                    <View
                    style={styles.Background}>
                       <FlatList
                       showsHorizontalScrollIndicator={true}
                       pagingEnabled={true}
                       horizontal={true}
                       data={this.state.ImagesUri}
                       getItemLayout={(data, index) => ({
                           length: windowWidth,
                           offset: windowWidth * index,
                           index,
                        })}
                        decelerationRate="normal"
                     renderItem={(item)=>{
                           if(this.state.Types[item.index]==0)
                           {
                           return(
                               <Image style={{
                                   width: windowWidth,
                                   height:  this.state.Yindex[item.index],
                                   marginTop:  this.state.marginIndex[item.index]*windowHeight
                               }}
                               source={
                                   {
                                       uri: item.item
                                   }
                             }resizeMode="cover"/>
                           )
                            }
                            else if(this.state.Types[item.index]==1)
                            {
                                return (
                                    <TouchableOpacity onPress={()=>{
                                        var Paused=this.state.Paused;
                                        Paused[item.index]=!Paused[item.index];
                                        this.setState({Paused:Paused});
                                    }}>
                                    <Video source={{
                                        uri: item.item
                                    }} ref={(ref)=>{
                                        this.player=ref;
                                    }} style={{
                                        width: windowWidth,
                                   height: this.state.Yindex[item.index],
                                   marginTop: this.state.marginIndex[item.index]*windowHeight
                                    }} resizeMode="cover" paused={this.state.Paused[item.index]} repeat={true}/>
                                    </TouchableOpacity>
                                )
                            }
                       }}
                       windowSize={1}
                 initialNumToRender={1}
                 maxToRenderPerBatch={1}
                 removeClippedSubviews={true}
                 onViewableItemsChanged={this.onViewableItemsChanged}
                 viewabilityConfig={this.viewabilityConfig} 
                 initialScrollIndex={this.state.index}     />
                  {
                    ShowLowerContainer()
                 }
                 {
                     ShowProgressIndicator()
                 }
                 </View> 
                  )
                  return(
                      <View/>
                  )
          
      }
}
const styles=StyleSheet.create({
    Background:{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    ButtonLowerContainer:{
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: '1%',
        marginTop:'1%',
    },
    cropView: {
      backgroundColor: 'red',
    },
    backgroundVideo: {
        width: windowWidth,
        marginTop: '50%'
      },
      ButtonStyle:{
          margin: '5%'
      },
      ProgressIndicator:{
          alignSelf: 'center',
          justifyContent:'center',
          position: 'absolute',
          backgroundColor: 'white',
          elevation: 2,
          width: windowWidth,
          height: windowHeight,
          borderRadius: 10,
          alignItems: 'center'
      }
})
export default ImageEditing;