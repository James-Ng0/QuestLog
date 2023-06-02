import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { AppState, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Quest from './src/Components/Quest';
import QuestDetailsModal from './src/Components/QuestDetailsModal'
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './src/Components/Styles/AppStyles'
import { GestureHandlerRootView, RefreshControl, Swipeable, TouchableHighlight } from 'react-native-gesture-handler';
import { faPlus, faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
export default function App() {
  const [loaded, setLoaded] = useState(1)
  const [updated, setUpdated] = useState(0)
  const [startup, setStartup] = useState(true)
  const [saving, setSaving] = useState(1)
  const [updateCompletion, setUpdateCompletion] = useState(1)
  const [questModalShowing, setQuestModalShowing] = useState(false)
  const [active, setActive] = useState(true);
  const [quests, setQuests] = useState([])
  const [displayedQuests, setDisplayedQuests] = useState([])
  const [currentQuestToEditId, setCurrentQuestToEditId] = useState(0)
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
    setLoaded(loaded * -1)
  }

  const getQuests = () => {
    return new Promise((resolve, reject) => {
      resolve(AsyncStorage.getItem('@quests'))
    })
  }

  const save = async () => {
    let quests = JSON.stringify(quests)
    const saving = new Promise((resolve, reject) => {
      resolve(() => {
        AsyncStorage.setItem('@quests', quests)
      })
    }).catch(e => { "Error in saving: " + e })
  }

  useEffect(() => {
    load();
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

  const setQuest = (questID, newQuest) => {
    let quest = getQuest(questID)
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

  const refresh = () => {
    load()
  }
  const deleteQuest = (questID) => {
    let quest = getQuest(questID)
    if (quest) {
      let temp = JSON.parse(JSON.stringify(quests))
      temp.splice(quests.indexOf(quest), 1)
      setQuests(temp)
    }
    quests.filter(q => q.parentID == questID).map(subQ => {
      deleteQuest(subQ.id)
    })
    setUpdated(updated * -1)
  }

  const toggleQuestCompletion = (questId) => {
    let quest = getQuest(questId)
    console.log(questId);
    console.log(quests[0]);
    if (quest) {
      let tempQuests = JSON.parse(JSON.stringify(quests))
      if (quest.completion == 100) {
        console.log(tempQuests.indexOf(quest))
        tempQuests[tempQuests.indexOf(quest)].completion = 0
      }
      else {
        tempQuests[tempQuests.indexOf(quest)].completion = 100
      }
      setQuests(temp)
    }
  }

  const UpdateDisplayedQuests = () => {
    let tempQuests = JSON.parse(JSON.stringify(quests))
    let displayedQuests = tempQuests
    /*
    tempQuests.forEach(q => {
      if(active){
        if(getCompletion(getTopLevelParent(q.id).id) != 100){
          displayedQuests.push(q)
        }
      }else{
        if(getCompletion(getTopLevelParent(q.id).id) == 100){
          console.log(q)
          displayedQuests.push(q)
        }
      }
    }
    )
    */
    setDisplayedQuests(displayedQuests)
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
    let temp = JSON.parse(JSON.stringify(quests))
    temp.push({ title: questTitle, text: description, id: quests.length + 1, parentID: currentParentId, completion: 0 })
    setQuests(temp)
    setUpdated(updated * -1)
  }

  const getQuest = (questID) => {
    let matchingQuest = quests.filter(q => q.id == questID)
    if (matchingQuest.length > 0) {
      console.log("Quest found")
      return matchingQuest[0];
    }
    console.log("Quest not found")
    return null
  }

  const getSubQuests = (questID, questLevel) => {
    let subQuests = []
    quests.filter(q => q.parentID == questID).map((subQ, ix) => {
      subQuests.push(parseQuest(subQ, ix, questLevel))
    })
    return subQuests;
  }

  const getSubQuestIds = (questList, id) => {
    let subQuests = []
    questList.filter(q => (q.parentID == id)).map(q => {
      subQuests.push(q.id)
      subQuests.concat(getSubQuestIds(questList, q.id))
    })
    return subQuests
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
        {active && <TouchableOpacity style={styles.addNewQuest} onPress={() => openQuestDetailsModal()}>
          <FontAwesomeIcon style={styles.icon} icon={faPlus} size={60} />
        </TouchableOpacity>}
        {false && <TouchableOpacity style={styles.addNewQuest} onPress={() => refresh()}>
          <FontAwesomeIcon style={styles.icon} icon={faPlus} size={60} />
        </TouchableOpacity>}
      </ScrollView>
      {questModalShowing && <QuestDetailsModal id={currentQuestToEditId}
        getQuest={getQuest} setQuest={setQuest} setQuestModalShowing={setQuestModalShowing} />}
    </GestureHandlerRootView>
  );
}