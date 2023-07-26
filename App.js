
import { useState, useEffect } from 'react';
import { AppState, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import Quest from './src/Components/Quest';
import QuestDetailsModal from './src/Components/QuestDetailsModal'
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './src/Components/Styles/AppStyles'
import { GestureHandlerRootView, RefreshControl, Swipeable, TouchableHighlight } from 'react-native-gesture-handler';
import { faPlus, faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import DeletionConfirmationModal from './src/Components/DeletionConfirmationModal';
export default function App() {
  const [updated, setUpdated] = useState(0)
  const [startup, setStartup] = useState(true)
  const [questModalShowing, setQuestModalShowing] = useState(false)
  const [deletionModalShowing, setDeletionModalShowing] = useState(false)
  const [active, setActive] = useState(true);
  const [quests, setQuests] = useState([])
  const [displayedQuests, setDisplayedQuests] = useState([])
  const [currentQuestId, setCurrentQuestId] = useState(0)
  const [currentParentId, setCurrentParentId] = useState(0)

  const load = async () => {
    getQuests()
      .then((result) => {
        if (result == null) {
          setQuests([])
        } else {
          setQuests(JSON.parse(result))
        }
      })
      .catch(e => console.log("Error : " + e))
  }

  const getQuests = () => {
    return new Promise((resolve, reject) => {
      resolve(AsyncStorage.getItem('@quests'))
    })
  }

  const save = async () => {
    try {
      let stringQuests = JSON.stringify(quests)
      await AsyncStorage.setItem('@quests', stringQuests)
    }
    catch {
      e => { "Error in saving: " + e }
    }
  }

  useEffect(() => {
    load();
    StatusBar.setBackgroundColor('black')
    setStartup(false)
  }, []);

  useEffect(() => {
    if (!startup) {
      save()
    }
  }, [updated])

  useEffect(() => {
    UpdateDisplayedQuests()
  }, [active, quests])

  const setQuest = (newQuest) => {
    let quest = getQuest(currentQuestId)
    if (quest) {
      let temp = JSON.parse(JSON.stringify(quests))
      temp[quests.indexOf(quest)].title = newQuest.title
      temp[quests.indexOf(quest)].text = newQuest.text
      setQuests(temp)
      setUpdated(updated * -1)
    }
    else {
      addQuest(newQuest.title, newQuest.text)
    }
  }

  const deleteQuest = () => {
    let tempQuests = JSON.parse(JSON.stringify(quests))
    let quest = getQuest(currentQuestId, tempQuests)
    let subQuests = getAllSubQuests(currentQuestId)
    tempQuests.splice(tempQuests.indexOf(quest))
    subQuests.forEach((sQ) => {
      tempQuests.splice(tempQuests.indexOf(sQ))
    })
    //If quest has parent, update its completion
    if(quest.parentID != 0){
      updateQuestCompletion(quest.parentID, tempQuests)
    }else{
      setQuests(tempQuests)
      setUpdated(updated * -1)
    }
  }

  const toggleQuestCompletion = (questId) => {
    quests.forEach(q => {
    })
    let temp = JSON.parse(JSON.stringify(quests))
    let quest = getQuest(questId, temp)
    temp[temp.indexOf(quest)].completion = quest.completion == 100 ? 0 : 100
    if (quest.parentID != 0) {
      updateQuestCompletion(quest.parentID, temp)
    } else {
      setQuests(temp)
      setUpdated(updated * -1)
    }
  }

  //Bottom up method
  const updateQuestCompletion = (questId, tempQuests) => {
    let completion = 0
    let quest = getQuest(questId, tempQuests)
    let subQuests = getDirectSubQuestData(questId, tempQuests)
    
    subQuests.forEach(sQ => {
      completion += sQ.completion / subQuests.length
    })
    if(tempQuests[tempQuests.indexOf(quest)] == undefined){
    }
    tempQuests[tempQuests.indexOf(quest)].completion = completion
    if (quest.parentID != 0) {
      updateQuestCompletion(quest.parentID, tempQuests)
    } else {
      setQuests(tempQuests)
      setUpdated(updated * -1)
    }
  }


  const UpdateDisplayedQuests = () => {
    let display = []
    quests.forEach(q => {
      let parent = getTopLevelParent(q.id)
      if (active) {
        if (parent.completion != 100) {
          display.push(q)
        }
      }
      else {
        if (parent.completion == 100) {
          display.push(q)
        }
      }
    })
    setDisplayedQuests(display)
  }

  const getTopLevelParent = (id, questList = quests) => {
    let quest = getQuest(id, questList)
    if (quest) {
      if (quest.parentID != 0) {
        return getTopLevelParent(quest.parentID)
      }
      return quest;
    }
  }

  const parseQuest = (quest, ix, questLevel) => {
    return (

      <Quest title={quest.title} text={quest.text} id={quest.id} parentID={quest.parentID}
        subQuests={getSubQuests(quest.id, questLevel + 1)} level={questLevel}
        completion={quest.completion == null ? 0 : quest.completion} complete={toggleQuestCompletion}
        openQuestDetailsModal={openQuestDetailsModal} deleteQ={openDeletionModal} key={ix} />

    )
  }

  const openQuestDetailsModal = (questId = 0, questParentId = 0) => {
    if(deletionModalShowing){
      return
    }
    setCurrentQuestId(questId)
    setCurrentParentId(questParentId)
    setQuestModalShowing(true)
  }

  const openDeletionModal = (questId = 0) => {
    if(questModalShowing){
      return
    }
    setCurrentQuestId(questId)
    setDeletionModalShowing(true)
  }

  const addQuest = (questTitle, description) => {
    let temp = JSON.parse(JSON.stringify(quests))
    let nextId = getNextAvailableId()
    temp.push({ title: questTitle, text: description, id: nextId, parentID: currentParentId, completion: 0 })
    if(currentParentId != 0){
      updateQuestCompletion(currentParentId, temp)
    }else{
      setQuests(temp)
      setUpdated(updated * -1)
    }
  }

  const getNextAvailableId = (questList = quests) => {
    for(let i = 1; i <= questList.length + 1; i++){
      if(!getQuest(i, questList)){
        return i
      }
    }
    return 1
  }
  const getQuest = (questID, questList = quests) => {
    let matchingQuest = questList.filter(q => q.id == questID)
    if (matchingQuest.length > 0) {
      return matchingQuest[0];
    }
    return null
  }

  const getSubQuests = (questId, questLevel) => {
    let subQuests = getDirectSubQuestData(questId)
    let parsedSubQuests = []
    subQuests.forEach((sQ, ix) => {
      parsedSubQuests.push(parseQuest(sQ, ix, questLevel))
    })
    return parsedSubQuests;
  }

  const getDirectSubQuestData = (id, questList = quests) => {
    return questList.filter(q => (q.parentID == id))
  }

  const getAllSubQuests = (id, questList = quests) => {
    let directChildren = getDirectSubQuestData(id, questList)
    let subQuests = []
    directChildren.forEach((sQ) => {
      subQuests.push(sQ)
      subQuests = subQuests.concat(getAllSubQuests(sQ.id, questList))
    })
    
    return subQuests;
  }

  const changeQuests = () => {
    setActive(!active)
  }

  return (
    <GestureHandlerRootView style={styles.main}>
      <TouchableHighlight onPress={changeQuests}>
        <View style={styles.titleCard}>
          <Text style={styles.title}>{active ? "Active Quests" : "Completed Quests"}</Text>
        </View>
      </TouchableHighlight>
      <ScrollView style={styles.questLog}>
        {displayedQuests.map((q, ix) => (q.parentID == 0 && parseQuest(q, ix, 0)))}
        {active && <TouchableOpacity style={styles.addNewQuest} onPress={() => { openQuestDetailsModal() }}>
          <FontAwesomeIcon style={styles.icon} icon={faPlus} size={60} />
        </TouchableOpacity>}
        {false && <TouchableOpacity style={styles.addNewQuest} onPress={() => refresh()}>
          <FontAwesomeIcon style={styles.icon} icon={faPlus} size={60} />
        </TouchableOpacity>}
      </ScrollView>
      {questModalShowing && <QuestDetailsModal id={currentQuestId}
        getQuest={getQuest} setQuest={setQuest} setQuestModalShowing={setQuestModalShowing} />}

      {deletionModalShowing && <DeletionConfirmationModal id={currentQuestId} confirm={deleteQuest} setModalShowing={setDeletionModalShowing} />}
    </GestureHandlerRootView>
  );
}