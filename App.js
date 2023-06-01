import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Quest from './src/Components/Quest';
import QuestDetailsModal from './src/Components/QuestDetailsModal'
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './src/Components/Styles/AppStyles'
import { GestureHandlerRootView, TouchableHighlight } from 'react-native-gesture-handler';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
export default function App() {
  const [updated, setUpdated] = useState(1)
  const [questModalShowing, setQuestModalShowing] = useState(false)
  const [editingQuest, setEditingQuest] = useState(false)
  const [active, setActive] = useState(true);
  const [quests, setQuests] = useState([])
  const [activeQuests, setActiveQuests] = useState([])
  const [completedQuests, setCompletedQuests] = useState([])
  const [currentQuestToEditId, setCurrentQuestToEditId] = useState(0)
  const [currentParentId, setCurrentParentId] = useState(0)

  const load = async () => {
    //Multiget
    try {
      const values = await AsyncStorage.multiGet(['activeQuests', 'completedQuests'])
      values.forEach(element => {
        if (element[0] === '@activeQuests') {
          setActiveQuests(JSON.parse(element))
        } else if (element[0] === '@completedQuests') {
          setCompletedQuests(JSON.parse(element[0]))
        }
      });
      setQuests(activeQuests)
    } catch (e) {
    }
  }

  const save = async () => {
    try {
      const active = JSON.stringify(activeQuests)
      await AsyncStorage.setItem('@activeQuests', active)
      const completed = JSON.stringify(completedQuests)
      await AsyncStorage.setItem('@completedQuests', completed)
    } catch (e) {
      console.log("Error " + e + "In saving")
    }
  }

  useEffect(() => {
    load();
    setCurrentParentId(0)
    setCurrentQuestToEditId(0)
    setActive(true);
  }, []);

  //When updated, save and reload
  useEffect(() => {
    //Store current quest data to the relevant list
    if(active){
      setActiveQuests(quests)
    }else{
      setCompletedQuests(quests)
    }
    //save list
    save(activeQuests, completedQuests)
    //reload
    load()
  }, [updated])

  const setQuest = (questID, newQuest) => {
    let quest = getQuest(questID)
    if (quest) {
      quests[quests.indexOf(quest)].title = newQuest.title
      quests[quests.indexOf(quest)].text = newQuest.text
    }
    else {
      addQuest(newQuest.title, newQuest.text)
    }
  }

  const deleteQuest = (questID) => {
    let quest = getQuest(questID)
    if (quest) {
      quests.splice(quests.indexOf(quest), 1)
    }
    quests.filter(q => q.parentID == questID).map(subQ => {
      deleteQuest(subQ.id)
    })

    setUpdated(updated * -1)
  }

  const toggleQuestCompletion = (questId) => {
    let quest = getQuest(questId)
    if (quest) {
      quest.completion == 0 ?
        quests[quests.indexOf(quest)].completion = 100 :
        quests[quests.indexOf(quest)].completion = 0
    }
    setUpdated(updated * -1)
  }

  const parseQuest = (quest, ix, questLevel) => {
    return (
      <Quest title={quest.title} text={quest.text} id={quest.id} parentID={quest.parentID}
        subQuests={getSubQuests(quest.id, questLevel + 1)} level={questLevel}
        completion={getCompletion(quest.id)} complete={toggleQuestCompletion} addSubQuest={openQuestDetailsModal}
        openQuestDetailsModal={openQuestDetailsModal} deleteQ={deleteQuest} key={ix} />
    )
  }

  const getCompletion = (questID) => {
    let completion = 0
    let quest = getQuest(questID)
    let subQuests = quests.filter(q => q.parentID == quest.id)
    if (subQuests.length > 0) {
      subQuests.forEach(q => {
        completion += getCompletion(q.id) / subQuests.length
      });
    }
    else {
      completion = quest.completion
    }
    return completion
  }

  const openQuestDetailsModal = (questId = 0, questParentId = 0) => {
    setCurrentQuestToEditId(questId)
    setCurrentParentId(questParentId)
    setQuestModalShowing(true)
    
  }

  const addQuest = (questTitle, description) => {
    quests.push({ title: questTitle, text: description, id: quests.length + 1, parentID: currentParentId, completion: 0 })
    setUpdated(updated * -1)
  }

  const getQuest = (questID) => {
    let matchingQuest = quests.filter(q => q.id == questID)
    if (matchingQuest.length == 0 || matchingQuest == null) {
    } else if (matchingQuest.length > 1) {
      return matchingQuest[0];
    } else {
      return matchingQuest[0];
    }
    return null
  }

  const getSubQuests = (questID, questLevel) => {
    let subQuests = []
    quests.filter(q => q.parentID == questID).map((subQ, ix) => {
      subQuests.push(parseQuest(subQ, ix, questLevel))
    })
    return subQuests;
  }

  return (


      <GestureHandlerRootView style={styles.main}>
        <View style={styles.titleCard}>
          <Text style={styles.title}>Active Quests</Text>
        </View>
        <ScrollView style={styles.questLog}>
          {quests.map((q, ix) => (q.parentID == 0 && parseQuest(q, ix, 0, updated, setUpdated)))}
          <TouchableOpacity style={styles.addNewQuest} onPress={() => openQuestDetailsModal()}>
            <FontAwesomeIcon style={styles.icon} icon={faPlus} size={60} />
          </TouchableOpacity>
        </ScrollView>
        {questModalShowing && <QuestDetailsModal id={currentQuestToEditId}
          getQuest={getQuest} setQuest={setQuest} setQuestModalShowing={setQuestModalShowing} />}
      </GestureHandlerRootView>
  );
}