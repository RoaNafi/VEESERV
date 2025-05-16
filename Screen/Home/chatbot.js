import React, { useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const ChatBot = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const sendMessage = async () => {
    if (message.trim()) {
      const newUserMsg = { type: 'user', message };
      setChatHistory(prev => [newUserMsg, ...prev]);

      try {
        const response = await axios.post('http://176.119.254.225:80/chatbot/chat', {
          message,
        });

        const newBotMsg = { type: 'bot', message: response.data.response };
        setChatHistory(prev => [newBotMsg, ...prev]);
      } catch (error) {
        console.error('Error:', error);
      }

      setMessage('');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20} // Adjust this offset to push up higher
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <FlatList
              data={chatHistory}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.messageContainer,
                    item.type === 'user' ? styles.userMessage : styles.botMessage,
                  ]}
                >
                  <Text style={styles.messageText}>{item.message}</Text>
                </View>
              )}
              inverted
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            />

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type your message"
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
              />
              <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                <Ionicons name="send" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 15,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  userMessage: {
    backgroundColor: '#086189',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#FF7F50',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 10, // Adds space between input and messages
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#086189',
    padding: 12,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatBot;
