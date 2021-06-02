import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, {Component} from 'react';
import { View,StyleSheet,Image,TouchableOpacity,FlatList} from 'react-native';
import { Dimensions } from 'react-native';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import {ImageFilterModule}  from './Modules';
import RNFetchBlob from 'rn-fetch-blob';
var Codes=[0,1,5,6,10,11,12,14,16,17,19]
class FilterImage extends Component{
    constructor(){
        super();
        this.state={
            ImageUri: "",
            y:0,
            FilteredUris:[],
            x:0,
            marginTop:0,
        }
    }
    TrashArray=[];
    componentDidMount(){
        this.setState({
            ImageUri:this.props.route.params.ImageUri,
        });
        this.setState({FilteredUris: [...this.state.FilteredUris,this.props.route.params.ImageUri]});
        ImageFilterModule.CheckImageOrientation(this.props.route.params.ImageUri).then((res)=>{
            console.log(res);
            var WH=res.split(',').map(Number);
            console.log(WH);
            var yaxis=(WH[1]/(WH[0]))*windowWidth;
            if(yaxis>(0.65*windowHeight))
            {
                this.setState({y: 0.65*windowHeight})
                this.setState({marginTop:0});
            }
            else
            {
                this.setState({y: yaxis});
                this.setState({marginTop:(0.65-yaxis/windowHeight)/2});

            }
        }).then(()=>{
            ImageFilterModule.GetGreyFilter().then((res)=>{
                this.TrashArray.push("file://"+res);
                console.log(res);
                this.setState({FilteredUris: [...this.state.FilteredUris,"file://"+res]});
                this.SetImageUris();

            });
        });
        
    }
    SetImage=(uri)=>{
        this.setState({ImageUri:uri});
    }
    SetImageUris= async ()=>{
        for(var i=0;i<Codes.length;i++)
        {
        await ImageFilterModule.ProcessImage(Codes[i]).then((res)=>{
            this.TrashArray.push("file://"+res);
            console.log(res.replace(" ",""));
            this.setState({FilteredUris: [...this.state.FilteredUris,"file://"+res]});
        });
    }
}
    componentWillUnmount(){
    this.TrashArray.forEach(Uri=>{
        if(Uri!=this.state.ImageUri)
        {
        RNFetchBlob.fs.unlink(Uri).then(()=>{
            console.log("FIle Deleted");
        }).catch(()=>{
            console.log("Error Occured");
        })
    }
    })
}
    render(){
        return(
            <View style={styles.Background}>
                <View style={styles.ImageView}>
                               <Image style={{
                                   width: windowWidth,
                                   height: this.state.y,
                                   marginTop: this.state.marginTop*windowHeight
                               }}
                               source={
                                   {
                                       uri: this.state.ImageUri
                                   }
                               } resizeMode="cover"/>
                               </View>
                           
                           <View style={styles.ButtonLowerContainer}>
                           <TouchableOpacity onPress={()=>{
                               this.props.route.params.SetUri(this.state.ImageUri);
                           }}>
                                   <FontAwesomeIcon icon={faCheck} color="lightblue" size="30" style={{
                                       margin: '5%',
                                       alignSelf: 'center'
                                   }}/>
                               </TouchableOpacity>
                               <FlatList horizontal={true} data={this.state.FilteredUris} renderItem={(data)=>
                               {
                                   console.log(data.item);
                                   return(
                                       <TouchableOpacity onPress={()=>{
                                           this.SetImage(data.item);
                                       }}>
                                       <Image source={
                                           {
                                               uri: data.item
                                           }
                                       } style={{width: windowWidth/3,
                                        height: this.state.y/3}} resizeMode="cover"/>
                                       </TouchableOpacity>
                                   )
                               }}/>
                           </View>
                    </View> 
        );
    } 
}
const styles=StyleSheet.create({
    Background:{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
    },
    ButtonLowerContainer:{
        flexDirection: 'column',
        alignItems: 'center', 
        marginBottom: '1%'
    },
});
export default FilterImage;