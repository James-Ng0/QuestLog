import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
    quest: {
        backgroundColor: 'black',
        borderColor: 'white',

        borderWidth: 10,
        alignSelf: "stretch",
        borderLeftWidth: 0,
        borderRightWidth: 0,
        marginTop: 10
    },

    title: {
        color: 'white',
        zIndex: 100,
    },

    expandedTitle: {
        fontWeight: 600,
    },

    titleAndProgress: {
        alignSelf:'center',
        flexDirection: 'column'
    },

    titleSection: {
        flexDirection: 'row',
    },

    progressBarBackground: {
        justifyContent: 'center',
        height: 5,
        backgroundColor: 'gray',
        alignItems: 'flex-start',
        width:200,
    },

    progressBar: {
        height: 5,
    },

    text: {
        fontSize: 20,
        maxHeight: 200,
        alignSelf: 'flex-start',
        paddingBottom: '5%',
    },

    header: {
        backgroundColor: 'black',
        height: 100,
        justifyContent: 'center',
        marginBottom: 0,
        
    },
    subQuestLog: {
        alignSelf: 'stretch',
        maxHeight: '100%',
    },

    swipeOptions: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: 'white',
        height: '100%',
    },

    icon: {
        color: 'white',
        justifyContent: 'center',
        alignSelf: 'center',
        alignContent: 'stretch',
        marginBottom: '10%'
    },

    button: {
        justifyContent: 'center',
        height: 100,
        width: 100,
        justifySelf: 'stretch',
        borderColor: 'white',
    }
});

export default styles