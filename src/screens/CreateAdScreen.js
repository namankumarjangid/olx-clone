import React, { useState } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { TextInput, Button } from 'react-native-paper'
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

const CreateAdScreen = () => {
    const [name, setName] = useState('')
    const [desc, setDesc] = useState('')
    const [year, setYear] = useState('')
    const [price, setPrice] = useState('')
    const [phone, setPhone] = useState('')
    const [image, setImage] = useState("")
    const [uploading, setUploading] = useState(false);
    const [transferred, setTransferred] = useState(0);


    // rnfirebase.io -  website tutorial
    // uncomment this 👇🏼 stuff for usign firebase admin cloud messaging refere to the folder node-message

    // const sendNoti = () => {
    //     firestore().collection('usertoken').get().then(querySnap => {
    //         const userDevicetoken = querySnap.docs.map(docSnap => {
    //             return docSnap.data().token
    //         })
    //         console.log(userDevicetoken)
    //     //     // fetch('https://93423d1a7427.ngrok.io/send-noti', {
    //     //     //     method: 'post',
    //     //     //     headers: {
    //     //     //         'Content-Type': 'application/json'

    //     //     //     },
    //     //     //     body: JSON.stringify({
    //     //     //         tokens: userDevicetoken
    //     //     //     })
    //     //     // })
    //     // })
    // }


    const openCamera = () => {

        launchImageLibrary({ quality: 0.5 }, (fileobj) => {
            //    console.log(fileobj)
            setUploading(true);
            setTransferred(0);
            const uploadImage = storage().ref().child(`/items/${Date.now()}`).putFile(fileobj.uri)

            uploadImage.on('state_changed', (snapshot) => {
                setTransferred(
                    Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100,
                );
                // var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                // if (progress == 100) { alert("uploaded") }
            },
                (error) => {
                    alert("something went wrong")
                },
                () => {
                    // Handle successful uploads on complete
                    uploadImage.snapshot.ref.getDownloadURL().then((downloadURL) => {
                        setUploading(false);
                        setImage(downloadURL)
                    });
                }
            );
        })
    }


    const postData = async () => {

        try {
            await firestore().collection('ads')
                .add({
                    name,
                    desc,
                    year,
                    price,
                    phone,
                    image,
                    uid: auth().currentUser.uid
                })
            Alert.alert("posted your Ad!")

            // will clear the input fields after submit
            setName('');
            setDesc('');
            setPhone('');
            setPrice('');
            setYear('');
            setImage('')

        } catch (err) {
            Alert.alert("something went wrong.try again")
        }
        // sendNoti()

    }


    return (
        <View style={styles.container}>
            <Text style={styles.text}>Create Ad!</Text>
            <TextInput
                label="Ad title"
                value={name}
                mode="outlined"
                onChangeText={text => setName(text)}
            />
            <TextInput
                label="Describe what you are selling"
                value={desc}
                mode="outlined"
                numberOfLines={3}
                multiline={true}
                onChangeText={text => setDesc(text)}
            />
            <TextInput
                label="year of purchase"
                value={year}
                mode="outlined"
                keyboardType="numeric"
                onChangeText={text => setYear(text)}
            />
            <TextInput
                label="price in INR"
                value={price}
                mode="outlined"
                keyboardType="numeric"
                onChangeText={text => setPrice(text)}
            />
            <TextInput
                label="Your contact Number"
                value={phone}
                mode="outlined"
                keyboardType="numeric"
                onChangeText={text => setPhone(text)}
            />

            <Button icon="camera" mode="contained" onPress={() => openCamera()}>
                upload Image
            </Button>
            {
                uploading ? (
                    <>
                        <Text style={styles.text}>{transferred} % Completed!</Text>
                    </>
                ) : (
                    <Button disabled={image ? false : true} mode="contained" onPress={() => postData()}>
                        Post
                    </Button>
                )
            }
            {/* <Button disabled={image ? false : true} mode="contained" onPress={() => postData()}>
                Post
            </Button> */}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 30,
        justifyContent: "space-evenly"
    },
    text: {
        fontSize: 22,
        textAlign: "center"
    }
});


export default CreateAdScreen
