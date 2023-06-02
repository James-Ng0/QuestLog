import { StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

const styles = StyleSheet.create({
    main: {
      flex: 1,
      backgroundColor: '#000',
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    questLog: {
      alignSelf: "stretch",
    },
  
    titleCard: {
      height: 100,
      width:400,
      alignItems:'center',
      backgroundColor: '#000',
      borderColor: 'white',
      fontSize: 40,
      color: '#fff',
      justifyContent: 'center',
      borderWidth: 5,
      borderLeftWidth: 0,
      borderRightWidth: 0,
      borderTopWidth: 0,
      paddingTop: 20,
      marginTop: 10,
    },
  
    title: {
      color: '#fff',
      fontSize: 30,
      fontWeight: 'bold',
    },

    addNewQuest: {
        height:100,
        width:100,
        alignSelf:'center',
        justifyContent:'center',
        alignItems:'center',
        marginTop:'10%',
    },
    icon: {
        color: 'white',
        justifySelf: 'center',
        alignContent: 'stretch',
        marginBottom:'5%'
    },
    swipeCard: {
        backgroundColor:'#fff'
    },
  });

  
  export default styles