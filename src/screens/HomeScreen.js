import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, Linking, Platform, Alert } from 'react-native'
import { Avatar, Button, Card, Title, Paragraph } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import storage from '@react-native-firebase/storage';
const HomeScreen = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const getDetails = async () => {
    const querySnap = await firestore().collection('ads')
      .get()
    const result = querySnap.docs.map(docSnap => docSnap.data())
    // console.log(result)
    setItems(result)
  }

  const openDial = (phone) => {
    if (Platform.OS === 'android') {
      Linking.openURL(`tel:${phone}`)
    } else {
      Linking.openURL(`telprompt:${phone}`)
    }
  }
  // delete button functionality
  const deletePost = (itemphone) => {
    // console.log(itemphone);
    firestore().collection('ads')
      .doc(itemphone)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists) {
          const { image } = documentSnapshot.data()

          if (image != null) {
            const storageRef = storage().refFromURL(image)
            // const imageRef = storage().ref(storageRef.fullPath);
            const imageRef = storageRef().child(`/items`)

            imageRef.delete()
              .then(() => {
                console.log(`${image} has been deleted succesfully`);
                deleteFirestoreData(itemphone);
              })
              .catch((err) => {
                console.log(err);
              })
          }
        }
      })
  }


  const deleteFirestoreData = (itemphone) => {
    firestore().collection('ads').doc(itemphone).delete()
      .then(() => {
        Alert.alert('your post deleted successfully')
      }).catch((err) => {
        console.log(err);
      })
  }

  useEffect(() => {
    getDetails()
    return () => {
      console.log("cleanup")
    }
  }, [])

  const renderItem = (item) => {
    return (
      <Card style={styles.card}>
        <Card.Title title={item.name} />
        <Card.Content>
          <Paragraph>{item.desc}</Paragraph>
          <Paragraph>{item.year}</Paragraph>
        </Card.Content>
        <Card.Cover source={{ uri: item.image }} />
        <Card.Actions>
          <Button>{item.price}</Button>
          {auth().currentUser.uid === item.uid ?
            <MaterialIcons name="delete" size={17} color="red" onPress={() => deletePost(item.phone)} />
            :
            <>
              <Button onPress={() => openDial(item.phone)}>call seller</Button>

            </>
          }
        </Card.Actions>
      </Card>
    )
  }
  return (
    <View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.phone}
        renderItem={({ item }) => renderItem(item)}
        onRefresh={() => {
          setLoading(true)
          getDetails()
          setLoading(false)
        }}
        refreshing={loading}
      />
    </View>
  )
}


const styles = StyleSheet.create({
  card: {
    margin: 10,
    elevation: 2
  }
});



export default HomeScreen
