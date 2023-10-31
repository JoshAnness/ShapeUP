import axios from 'axios';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const sendMessageToChatGPT = async (message) => {
  const apiKey = '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';
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  try {
    const response = await axios.post(endpoint, {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: message }],
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('ChatGPT API request failed:', error);
    return 'Sorry, something went wrong.';
  }
};



const ChatGPT= ({ navigation }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [conversation, setConversation] = useState([]);

  const handleSendMessage = async () => {
    const response = await sendMessageToChatGPT(inputMessage);
    setConversation([...conversation, { role: 'user', content: inputMessage }, { role: 'assistant', content: response }]);
    setInputMessage('');
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flex: 1, padding: 16 }}
      enableOnAndroid={true}
      extraHeight={100} // Adjust this value as needed
    >
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          {/* Display chat conversation here */}
          {conversation.map((message, index) => (
            <Text key={index} style={{ marginBottom: 10 }}>
              {message.role}: {message.content}
            </Text>
          ))}
        </ScrollView>
      </View>
      <TextInput
        value={inputMessage}
        onChangeText={(text) => setInputMessage(text)}
        placeholder="Type your message..."
        style={{ marginBottom: 10, padding: 8, borderColor: 'gray', borderWidth: 1 }}
      />
      <Button
        title="Send"
        onPress={handleSendMessage}
        buttonStyle={{ backgroundColor: 'blue' }}
        titleStyle={{ fontWeight: 'bold' }}
      />
    </KeyboardAwareScrollView>
  );
}

export default ChatGPT;