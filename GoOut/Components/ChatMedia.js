import React, {Component} from 'react';
import { View,StyleSheet,Image,FlatList} from 'react-native';
import { Dimensions } from 'react-native';
import Video from 'react-native-video';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
var currentIndex=0;
var UserId="";
class ChatMedia extends Component{
    constructor(){
        super();
        this.state={
            ImagesUri:[],
            index:0,
            yindex:[],
            marginIndex: [],
            Types:[],
            Paused:[]
        }
    }
    componentDidMount(){
        currentIndex=0;
        UserId=this.props.route.params.UserId;
        var i=0;
        this.props.route.params.Images.forEach((Image)=>{
            if(Image.type.split('/')[0]==0)
            {
            var ImageUri=this.state.ImagesUri;
            var marginIndex=this.state.marginIndex;
            var yindex=this.state.yindex;
            var Types=this.state.Types;
            Types.push(0);
            ImageUri.push(Image.path);
            marginIndex.push(-1);
            yindex.push(-1);
            this.setState({ImagesUri:ImageUri});
            this.setState({marginIndex: marginIndex});
            this.setState({yindex:yindex});
            this.setState({Types:Types});
            this.DisplayImages(this.state.ImagesUri[i],i);
            }
            else
            {
                var ImageUri=this.state.ImagesUri;
                ImageUri.push(Image.path);
                var Types=this.state.Types;
                Types.push(1);
                this.setState({Types:Types});
                this.setState({ImagesUri:ImageUri});
                var marginIndex=this.state.marginIndex;
            var yindex=this.state.yindex;
            if(Image.height>(0.9*windowHeight))
            {
                yindex.push(0.9*windowHeight);
                marginIndex.push(0);
            }
            else
            {
                var yaxis=(Image.height/Image.width)*windowWidth;
                yindex.push(yaxis);
                marginIndex.push((0.9-yaxis/windowHeight)/2);
            }
            this.setState({marginIndex: marginIndex});
            this.setState({yindex:yindex});
            }
            var Paused=this.state.Paused;
            Paused.push(true);
            this.setState({Paused:Paused});
            i+=1;
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
            this.setState({index:viewableItems[0].index})
            currentIndex=viewableItems[0].index;           
      }
    }
    DisplayImages=  (ImageUri,index)=>{
        ImageFilterModule.CheckImageOrientation(ImageUri).then((res)=>{
               var WH=res.split(',').map(Number);
           var yaxis=(WH[1]/(WH[0]))*windowWidth;
           var yindex=this.state.yindex;
           var marginIndex=this.state.marginIndex;
           if(yaxis>(0.9*windowHeight))
           {
               yindex[index]=0.9*windowHeight;
               marginIndex[index]=0;
               this.setState({yindex: yindex})
               this.setState({marginIndex:marginIndex});
           }
           else
           {
               yindex[index]=yaxis;
               marginIndex[index]=(0.9-yaxis/windowHeight)/2;
               this.setState({yindex:yindex});
               this.setState({marginIndex: marginIndex});   
           }
       });
               
         } 
    render()
    {
        return(
            <View
            style={styles.Background}>
               <FlatList
               showsHorizontalScrollIndicator={false}
               pagingEnabled={true}
               horizontal={true}
               data={this.state.ImagesUri}
               getItemLayout={(data, index) => ({
                   length: windowWidth,
                   offset: windowWidth * index,
                   index,
                })}
                decelerationRate="fast"
                snapToInterval={windowWidth}
               renderItem={(item)=>{
                   if(this.state.Types[item.index]==0)
                   {
                   return(
                       <Image style={{
                           width: windowWidth,
                           height: this.state.yindex[item.index],
                           marginTop: this.state.marginIndex[item.index]*windowHeight
                       }}
                       source={
                           {
                               uri: item.item
                           }
                     }resizeMode="cover"/>
                   )
                    }
                    else
                    {
                        return (
                            <Video source={{
                                uri: item.item
                            }} ref={(ref)=>{
                                this.player=ref;
                            }} style={{
                                width: windowWidth,
                           height: this.state.yindex[item.index],
                           marginTop: this.state.marginIndex[item.index]*windowHeight
                            }} resizeMode="cover" paused={this.state.Paused[item.index]}/>
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
         </View> 
          )
    }
}
export default ChatMedia;
const styles=StyleSheet.create({
    Background:{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'black'
    },
})