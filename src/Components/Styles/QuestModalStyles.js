import { StyleSheet } from "react-native";

styles = StyleSheet.create({

    root: {
        position: 'absolute',
        width: '80%',
        alignSelf: 'center',
    },

    modal: {
        backgroundColor: 'black',
        borderWidth: 2,
        borderColor: 'white',
    },

    title: {
        alignSelf: 'center',
        marginTop: '5%',
        color: '#fff',
        fontSize: 30,
        marginBottom: '5%',

    },

    inputField: {
        width: '80%',
        marginBottom: '10%'
    },

    label: {
        marginTop: '5%',
        color: 'white',
        marginLeft: '10%',
        fontSize: 20,
        marginBottom: '5%',
    },

    textInput: {
        borderColor: 'white',
        borderBottomWidth: 1,
        width: '80%',
        color: 'white',
        marginLeft: '15%',
        overflow: 'visible'
    },

    confirmSection: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },

    button: {
        flex: 1,
        height:50,
        justifyContent: 'center',
        borderColor: 'white',
        borderWidth: 1,
    },

    buttonText: {
        alignSelf: 'center',
        color: 'white',
        fontSize: 20,
    }
});

export default styles