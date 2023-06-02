import React, { useState } from "react"
import { StyleSheet, Text, View, ScrollView, TouchableHighlight } from 'react-native';
import { GestureHandlerRootView, Swipeable, TouchableWithoutFeedback, TouchableOpacity, TextInput } from "react-native-gesture-handler";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrashAlt, faPenAlt, faStar, faChevronRight, faChevronDown, faPlus } from "@fortawesome/free-solid-svg-icons";
import styles from './Styles/QuestModalStyles'

const QuestDetailsModal = ({ id, getQuest, setQuest, setQuestModalShowing }) => {
    quest = id == 0 ? {} : getQuest(id)
    if(quest==null){
        return(null);
    }
    const [title, setTitle] = useState(quest.title == undefined ? "" : quest.title)
    const [description, setDescription] = useState(quest.text == undefined ? "" : quest.text)

    const confirm = () => {
        if(title != ""){
            setQuest(id, {title: title, text: description})
            setQuestModalShowing(false)
        }   
    }

    return (
        <View style={styles.questDetailsModal}>
            <Text style={styles.title}>{id == 0 ? "New Quest" : "Edit Quest"}</Text>
            <View style={styles.inputField}>
                <Text style={styles.label}>Quest Name</Text>
                <TextInput style={styles.textInput} maxLength={35}
                onChangeText={newText =>(setTitle(newText))} defaultValue={title}></TextInput>
            </View>
            <View style={styles.inputField}>
                <Text style={styles.label}>Quest Description</Text>
                <TextInput style={styles.textInput} multiline={true} maxLength={75} 
                onChangeText={newText =>(setDescription(newText))} defaultValue={description}></TextInput>
            </View>
            <View style={styles.confirmSection}>
                <TouchableHighlight style={styles.button} onPress={confirm}>
                    <Text style={styles.buttonText}>Confirm</Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.button} onPress={() => {setQuestModalShowing(false)}}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableHighlight>
            </View>
        </View>
    )
}

export default QuestDetailsModal;