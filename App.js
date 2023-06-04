
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
    let temp = JSON.parse(JSON.stringify(quests))
    let quest = temp.filter(q => (q.id == currentQuestId))[0]
    temp.splice(quests.indexOf(quest), 1)
    let subQuests = getAllSubQuests(currentQuestId)
    subQuests.forEach((sQ) => {
      temp.splice(temp.indexOf(sQ), 1)
    })
    updateQuestCompletion(temp)
  }

  const toggleQuestCompletion = (questId) => {
    console.log("Toggling")
    quests.forEach(q => {
      console.log(q.id)
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
      tempQuests[tempQuests.indexOf(quest)].completion = completion

    if (quest.parentID != 0) {
      updateQuestCompletion(quest.parentID, tempQuests)
    } else {
      setQuests(tempQuests)
      setUpdated(updated * -1)
    }
  }

  //Top down method
  //Go through children
  //Calculate completion of children
  //Return list of children and their updated completions
  //If top level, apply changes 
  const updateTotalCompletion = (id, tempQuests) => {
    let completion = 0
    let childCompletions = []
    let directChildren = getDirectSubQuestData(id, tempQuests)

    //Go through direct children
    directChildren.forEach(c => {
      //Get that child's completion
      let childCompletion = updateTotalCompletion(c.id, tempQuests)
      //Calculate completion based on child completion
      completion += childCompletion[1]/directChildren.length
      //Add child completion to current completion
      childCompletions.concat(childCompletion)
    })
    let quest = getQuest(id, tempQuests)
    childCompletions.push([id, directChildren.length == 0 ? quest.completion : completion])

    if(quest.parentID != 0){
      return(childCompletions)
    }

    childCompletions.forEach(cQ => {
      let childQuest = getQuest(cq[0], tempQuests)
      tempQuests[tempQuests.indexOf(childQuest)].completion = cq[1]
    })
    setQuests(temp)
  }

  const UpdateDisplayedQuests = () => {
    let display = []
    quests.forEach(q => {
      if (active) {
        if (getTopLevelParent(q.id).completion != 100) {
          display.push(q)
        }
      }
      else {
        if (getTopLevelParent(q.id).completion == 100) {
          display.push(q)
        }
      }
    })
    setDisplayedQuests(display)
  }

  const getTopLevelParent = (id) => {
    let quest = getQuest(id)
    if (quest.parentID != 0) {
      return getTopLevelParent(quest.parentID)
    }
    return quest;
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
    setCurrentQuestId(questId)
    setCurrentParentId(questParentId)
    setQuestModalShowing(true)
  }

  const openDeletionModal = (questId = 0) => {
    setCurrentQuestId(questId)
    setDeletionModalShowing(true)
  }

  const addQuest = (questTitle, description) => {
    let temp = JSON.parse(JSON.stringify(quests))
    temp.push({ title: questTitle, text: description, id: temp.length + 1, parentID: currentParentId, completion: 0 })
    setQuests(temp)
    setUpdated(updated * -1)
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
      subQuests.concat(getAllSubQuests(sQ.id))
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