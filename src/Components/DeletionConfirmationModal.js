import { faL } from "@fortawesome/free-solid-svg-icons";
import React from "react"
import { Text, View, TouchableHighlight } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import styles from './Styles/QuestModalStyles'

const DeletionConfirmationModal = ({ confirm, setModalShowing }) => {
    const pressConfirm = () => {
        confirm()
        setModalShowing(false)
    }

    return (
        <GestureHandlerRootView style={styles.root}>
        <View style={styles.modal}>
            <Text style={[styles.label]}>Are you sure you want to delete this quest?</Text>
            <View style={styles.confirmSection}>
                <TouchableHighlight style={styles.button} onPress={pressConfirm}>
                    <Text style={styles.buttonText}>
                        Confirm
                    </Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.button} onPress={() => {setModalShowing(false)}}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableHighlight>
            </View>
        </View>
        </GestureHandlerRootView>
    )
};

export default DeletionConfirmationModal;