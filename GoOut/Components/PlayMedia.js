import React, {Component} from 'react';
import { View,StyleSheet,Image, FlatList,Dimensions,TouchableOpacity } from 'react-native';
import * as Progress from 'react-native-progress';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import Video from 'react-native-video';
var currentIndex=0;
import RNFetchBlob from 'rn-fetch-blob'
class PlayMedia extends Component{
    constructor(){
        super();
        this.state={
            Paused: [],
            ShowVideos:[],
        }
        }
        componentDidMount(){
            currentIndex=0;
           console.log(this.props.route.params.Message);
           var ShowVideos=this.state.ShowVideos; 
           this.props.route.params.Message.forEach((MessageObject,index)=>{
               RNFetchBlob.fs.exists(RNFetchBlob.fs.dirs.PictureDir+'/GoOut/'+MessageObject.FilePath).then((async res=>{  
                if(res==true)
                   {
                       ShowVideos[index]=true;
                       this.setState({ShowVideos:ShowVideos});
                   }
                   else
                   {
                   await RNFetchBlob
                    .config({
                      // add this option that makes response data to be stored as a file,
                      // this is much more performant.
                      fileCache : true,
                      path: RNFetchBlob.fs.dirs.PictureDir+'/GoOut/'+MessageObject.FilePath,
                    })
                    .fetch('GET', MessageObject.downloadurl, {
                      //some headers ..
                    })
                    .then((result) => {
                      // the temp file path
                      console.log('The file saved to ', result.path())
                      var ShowVideos=this.state.ShowVideos;
                      ShowVideos[index]=true;
                      this.setState({ShowVideos:ShowVideos});
                    })
                   }
               }))
            }
           )
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
          }
        }

    render(){
        return(
            <View style={styles.Background}>
                <FlatList
                showsHorizontalScrollIndicator={true}
                pagingEnabled={true}
                horizontal={true}
                data={this.props.route.params.Message}
                getItemLayout={(data, index) => ({
                    length: windowWidth,
                    offset: windowWidth * index,
                    index,
                 })}
                 decelerationRate="normal"
                 renderItem={(item)=>{
                    if(this.state.ShowVideos[item.index]==true)
                    {
                    if(item.item.Type==0)
                     {
                        var yaxis=(item.item.Height/item.item.Width)*windowWidth;
                         return(
                            <Image style={{
                                width: windowWidth,
                                height: yaxis > (0.9*windowHeight) ? 0.9*windowHeight : yaxis,
                               alignSelf: 'center'
                            }}
                            source={
                                {
                                    uri: 'file://'+RNFetchBlob.fs.dirs.PictureDir+'/GoOut/'+item.item.FilePath
                                }
                          } resizeMode="cover"  />
                         )
                     }
                     else{
                             return(
                                <TouchableOpacity style={{
                                    alignSelf: 'center'
                                }} onPress={()=>{
                                    var Paused=this.state.Paused;
                                    Paused[item.index]=!Paused[item.index];
                                    this.setState({Paused:Paused});
                                }}>
                                <Video source={{
                                    uri: RNFetchBlob.fs.dirs.PictureDir+'/GoOut/'+item.item.FilePath
                                }} ref={(ref)=>{
                                    this.player=ref;
                                }} style={{
                                    width: windowWidth,
                               height: item.item.Height > (0.9*windowHeight) ? 0.9*windowHeight : item.item.Height,
                                }} resizeMode="cover" paused={this.state.Paused[item.index]} repeat={true}/>
                                </TouchableOpacity>
                             )
                     }
                    }
                    else
                         {
                            return(
                                <View style={{
                                    width: windowWidth,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Progress.Circle size={80} indeterminate={true} />
                                </View>
                            )
                         }
                 }} windowSize={1}
                 initialNumToRender={1}
                 maxToRenderPerBatch={1}
                 removeClippedSubviews={true}
                 onViewableItemsChanged={this.onViewableItemsChanged}
                 viewabilityConfig={this.viewabilityConfig} 
                 />
            </View>

        )
    }
}
export default PlayMedia;
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
          width: 200,
          height: 200,
          borderRadius: 10,
          alignItems: 'center'
      }
})