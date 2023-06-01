import React, { useState } from "react"
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { GestureHandlerRootView, Swipeable, TouchableWithoutFeedback, TouchableOpacity } from "react-native-gesture-handler";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrashAlt, faPenAlt, faStar, faChevronRight, faChevronDown, faPlus } from "@fortawesome/free-solid-svg-icons";
import styles from './Styles/QuestStyles'

const Quest = ({ title, text = "", id, parentID = 0, subQuests = [], level = 0, completion = 0, complete, openQuestDetailsModal, deleteQ}) => {
    const [expanded, setExpanded] = useState(false)
    let rows = [];

    const tap = () => {
        setExpanded(!expanded);
    }

    const edit = () => {
    }

    const delQuest = () => {
        deleteQ(id);
        let row = rows.filter(r => r.ID == id)
        if(row.length > 0){
            row[0].sw.close();
        }
    }

    //Delete and Edit buttons
    const swipeLeft = () => {
        if (!expanded) {
            return;
        }
        return (
            <View style={[styles.swipeOptions]}>
                <TouchableOpacity style={styles.button} onPress={delQuest}>
                    <FontAwesomeIcon icon={faTrashAlt} style={styles.icon} size={30} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, expanded && { borderBottomWidth: 1 }]} onPress={() => openQuestDetailsModal(id,0)}>
                    <FontAwesomeIcon icon={faPenAlt} style={styles.icon} size={30} />
                </TouchableOpacity>
            </View>
        )
    }

    //Add Update Progress and Add Quest buttons
    const swipeRight = () => {
        return (
            (subQuests.length == 0 || expanded) &&
            <View style={styles.swipeOptions}>
                {subQuests.length == 0 && <TouchableOpacity style={styles.button} onPress={()=>{complete(id)}}>
                    <FontAwesomeIcon icon={faStar} style={styles.icon} size={30} />
                </TouchableOpacity>}

                {expanded && <TouchableOpacity style={styles.button} onPress={() => openQuestDetailsModal(0, id)}>
                    <FontAwesomeIcon icon={faPlus} style={styles.icon} size={30} />
                </TouchableOpacity>}
            </View>
        )
    }

    

    return (
        <GestureHandlerRootView>
            <View style={
                [styles.quest, expanded && { maxHeight: 400 },
                level == 0 ? { borderWidth: 1 } : { borderWidth: 0 }]
            }>
                <TouchableWithoutFeedback onPress={tap}>
                    <Swipeable
                        renderRightActions={swipeRight}
                        renderLeftActions={swipeLeft}
                        ref={ref=>rows.push({ID: id, sw: ref})}
                    >
                        <View style={styles.header}>
                            <View style={[styles.titleSection, level == 0 ? { alignSelf: 'center' } : { paddingLeft: level * 35 }]}>
                                {level > 0 && <View style={{ width: '20%', justifyContent: 'center', alignSelf: 'center' }}>
                                    {subQuests.length > 0 && <FontAwesomeIcon style={[styles.icon, { marginBottom: '-3%', marginRight: '2%' }]} icon={expanded ? faChevronDown : faChevronRight} size={25} />}
                                </View>}
                                <View style={[styles.titleAndProgress, level == 0 && { width: '90%' }]}>
                                    {/* Title */}
                                    <Text style={
                                        [styles.title, expanded && { fontWeight: 600 }, { fontSize: 30 - (level * 5) }, level == 0 && { alignSelf: 'center' },
                                        completion == 100 ? { color: '#666565' } : { color: 'white' }]
                                    }>{title}
                                    </Text>

                                    {/* Progress bar */}
                                    <View style={[styles.progressBarBackground, { alignSelf: 'flex-start' }, level == 0 && { marginLeft: '5%', marginRight: '5%', width: '90%' }]}>
                                        <View style={[styles.progressBar, { alignSelf: 'flex-start' }, { width: (completion) + '%' },
                                        completion == 100 ? { backgroundColor: '#666565' } : { backgroundColor: 'white' }]} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Swipeable>
                </TouchableWithoutFeedback>

                {/* Description text */}
                <View styles={{ flexDirection: 'row'}}>
                    <View style={[level == 0 && { alignSelf: 'center' }]} />
                    {expanded && <Text style={
                        [styles.text, { marginRight: '3%', marginLeft: '3%', fontSize: 20 - level * 2, paddingLeft: 20 + level * 50 },
                        level == 0 && { alignSelf: 'center', textAlign: 'center' }, completion == 100 ? { color: '#525252' } : { color: 'lightgray' }]}>{text}
                    </Text>}
                </View>


                {/* Subquests */}
                {expanded && <ScrollView style={styles.subQuestLog} nestedScrollEnabled={true}>{subQuests}</ScrollView>}
            </View>
        </GestureHandlerRootView>
    )
};

export default Quest;
