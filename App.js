import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, LogBox, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
// just to ignore the native event emitter warning
LogBox.ignoreLogs(['new NativeEventEmitter']);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const message = {
    to: expoPushToken,
    sound: "default",
    title:"My first push notification",
    body: "This is my test push notification"
  }
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token)).catch((err) => console.log(err));
  },[])
  const sendNotfication = async () => {
    await fetch("https://exp.host/--/api/v2/push/send",{
      method: "POST",
      headers: {
        host: "exp.host",
        accept: "application/json",
        "accept-encoding": "gzip, deflate",
        "content-type": "application/json"
      },
      body: JSON.stringify(message)
    })
  }
  async function registerForPushNotificationsAsync() {
    let token;
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      token = (await Notifications.getExpoPushTokenAsync({ projectId: '5f6a4234-53a7-4be6-91f6-72736a0244e1' })).data;
      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    return token;
  }
  return (
    <View style={styles.container}>
      <Text>Expo push notification test!</Text>
      <Button title='Send push notification' onPress={sendNotfication}/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 100,
  },
});
