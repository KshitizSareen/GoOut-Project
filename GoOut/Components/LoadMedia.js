import React, {Component} from 'react';
import { View,StyleSheet,Image,FlatList} from 'react-native';
import { Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import * as Progress from 'react-native-progress';
import { TouchableOpacity } from 'react-native-gesture-handler';
class LoadMedia extends Component{
    constructor(){
        super();
        this.state={
            yindex:0,
            marginIndex:0,
            MediaObject:{},
            ShowLoadingAnimation: false,
            Paused:false
        }
    }
    componentDidMount(){
        console.log(windowWidth);
        console.log(windowHeight);
        var MediaObject=this.props.route.params.MediaFile;
        var yindex;
        var marginIndex;
        if(MediaObject.Height>(0.9*windowHeight))
        {
        yindex=0.9*windowHeight;
        marginIndex=0;
        }
        else
        {
            yindex=(MediaObject.Height/MediaObject.Width)*windowWidth;
            marginIndex=(0.9-yindex/windowHeight)/2;
        }
        //console.log(yindex);
        this.setState({yindex:yindex});
        this.setState({marginIndex:marginIndex});
    }
    render(){

        var ShowComponent=()=>{
        if(this.props.route.params.MediaFile.Type==0)
        {
        return(
                    <FastImage style={{
                           width: windowWidth,
                           height: this.state.yindex,
                       }}
                       source={
                           {
                               uri: this.props.route.params.MediaUrl,
                               priority: FastImage.priority.high
                           }
                     } resizeMode="cover" onLoadStart={()=>{
                         this.setState({ShowLoadingAnimation: true});
                     }} onLoadEnd={()=>{
                         this.setState({ShowLoadingAnimation: false});
                     }}/>
        )
        }
        else
        {
            return(
                <TouchableOpacity onPress={()=>{
                    this.setState({Paused:!this.state.Paused});
                }}>
                <Video source={{
                    uri: this.props.route.params.MediaUrl
                }} ref={(ref)=>{
                    this.player=ref;
                }} style={{
                    width: windowWidth,
               height: this.state.yindex,
                }} onLoadStart={()=>{
                    this.setState({ShowLoadingAnimation: true});
                }} onLoad={()=>{
                    this.setState({ShowLoadingAnimation: false});
                }} resizeMode="cover" repeat={true} paused={this.state.Paused}/>
                </TouchableOpacity>
            )
        }
    }
    var ShowLoadingAnimation=()=>{
        if(this.state.ShowLoadingAnimation)
        return(
            <Progress.Circle size={80} indeterminate={true} style={{alignSelf: 'center',position: 'absolute'}}/>
        )
    }
    return(
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            {
                ShowLoadingAnimation()
            }
            {ShowComponent()}

        </View>
    )
    }
}
export default LoadMedia;