import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image } from 'react-native';
import { supabase } from '../config/supabase'; // Ensure this path is correct

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      let result;
      if (isSignUp) {
        result = await supabase.auth.signUp({ email, password });
      } else {
        result = await supabase.auth.signIn({ email, password });
      }

      if (result.error) {
        Alert.alert('Error', result.error.message);
      } else {
        Alert.alert(
          isSignUp ? 'Sign Up Successful' : 'Login Successful',
          'You are now authenticated!'
        );
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../image/LeonCoinsIcon.png')} // Replace with your image path
        style={styles.logo}
      />
      <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Log In'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={isSignUp ? 'Sign Up' : 'Log In'} onPress={handleAuth} />
      <Button
        title={isSignUp ? 'Switch to Log In' : 'Switch to Sign Up'}
        onPress={() => setIsSignUp(!isSignUp)}
        color="gray"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    width: '100%',
  },
  logo: {
    width: 256,
    height: 152,
    flexShrink: 0,
    aspectRatio: 32 / 19,
    marginBottom: 20,
  },
});

export default Auth;
