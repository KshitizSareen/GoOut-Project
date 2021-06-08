import React, {Component} from 'react';
import NetInfo from '@react-native-community/netinfo';
import { View,StyleSheet,Text, Alert, TouchableOpacity,FlatList, Dimensions} from 'react-native';
import * as Progress from 'react-native-progress';
import RNFetchBlob from 'rn-fetch-blob';
import FileViewer from 'react-native-file-viewer';
class LoadDocuments extends Component{
    constructor(){
        super();
        this.state={
            ShowLoadingIndicator:[],
        }
    }
    componentDidMount(){
        var ShowLoadingIndicator=[];
        for (var i=0;i<this.props.route.params.Message.length;i++)
        {
            ShowLoadingIndicator.push(false);
        }
        this.setState({ShowLoadingIndicator: ShowLoadingIndicator});
    }
    render(){
        return(
            <View>
                <FlatList data={this.props.route.params.Message} renderItem={(data)=>{
                    return(
                            <View >
                                 <TouchableOpacity disabled={this.state.ShowLoadingIndicator[data.index]} style={{
                                     flexDirection: 'row',
                                     backgroundColor: 'lightblue',
                                     justifyContent: 'space-between',
                                     borderRadius: 50,
                                     padding: '3%',
                                     margin: '5%',
                                     
                                 }} onPress={()=>{
                                     NetInfo.fetch().then((state)=>{
                                         if(state.isConnected)
                                         {
                                             RNFetchBlob.fs.exists(RNFetchBlob.fs.dirs.DocumentDir+'/'+data.item.FilePath).then(async res=>{
                                                 if(res==true)
                                                 {
                                                     console.log("Exists");
                                                     console.log(RNFetchBlob.fs.dirs.DocumentDir+'/'+data.item.FilePath);
                                                    FileViewer.open("file://"+RNFetchBlob.fs.dirs.DocumentDir+'/'+data.item.FilePath);
                                                 }
                                                 else
                                                 {
                                                     var ShowLoadingIndicator=this.state.ShowLoadingIndicator;
                                                     ShowLoadingIndicator[data.index]=true;
                                                     this.setState({ShowLoadingIndicator: ShowLoadingIndicator});
                                                    await RNFetchBlob
                                                    .config({
                                                      // add this option that makes response data to be stored as a file,
                                                      // this is much more performant.
                                                      fileCache : true,
                                                      path: RNFetchBlob.fs.dirs.DocumentDir+'/'+data.item.FilePath,
                                                    })
                                                    .fetch('GET', data.item.downloadurl, {
                                                      //some headers ..
                                                    })
                                                    .then((result) => {
                                                      // the temp file path
                                                      var ShowLoadingIndicator=this.state.ShowLoadingIndicator;
                                                     ShowLoadingIndicator[data.index]=false;
                                                     this.setState({ShowLoadingIndicator: ShowLoadingIndicator});
                                                      console.log('The file saved to ', result.path());
                                                      FileViewer.open("file://"+RNFetchBlob.fs.dirs.DocumentDir+'/'+data.item.FilePath);
                                                    })
                                                 }
                                             })
                                         }
                                         else
                                         {
                                            Alert.alert("","Please connect to the internet")
                                         }
                                     })
                                 }}>
                                     <Text style={{
                                         fontSize: 20,
                                         fontFamily: 'serif',
                                         fontWeight: '800',
                                         fontStyle: 'italic',
                                         margin: '1%'
                                     }}>{data.item.FileName}</Text>
                                     {
                                         this.state.ShowLoadingIndicator[data.index]==true ? <Progress.Circle size={40} indeterminate={true} style={{
                                             margin: '1%'
                                        }}/> : null
                                     }
                                     </TouchableOpacity>
                                 </View>
                    )
                }}/>
            </View>
        )
    }

}
const styles=StyleSheet.create({
    body:{
        flex:1,
        justifyContent: 'center',
        alignContent: 'center',
        alignSelf: 'center'
    }
})
export default LoadDocuments;