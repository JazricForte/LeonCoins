import React from "react";
import { StyleSheet, View, Alert } from "react-native";
import { Button, Input } from "react-native-elements";
import { supabase } from '../config/supabase';

export default function Auth() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    async function signInWithEmail() {
        setLoading(true);
        const { session, error} = await supabase.auth.signIn({
            email: email,
            password: password
        });

        if (error) Alert.alert('Error', error.message);
        setLoading(false);
        return {session, error};
    }

    async function signUpWithEmail() {
        setLoading(true);
        const { user, session, error } = await supabase.auth.signUp({
            email: email,
            password: password
          });

        console.log('session', session);
        console.log('error', error);

        if (error) Alert.alert(error.message);
        else Alert.alert('Success', 'Check your email for the confirmation link');
        setLoading(false);
        return {session, error};
    }

    return (
        <View style={styles.container}>
            <Input
                label='Email'
                leftIcon={{ type: 'material', name: 'email' }}
                onChangeText={(text) => setEmail(text)}
                value={email}
                placeholder='email@address.com'
                autoCapitalize='none'
            />
            <Input
                label='Password'
                leftIcon={{ type: 'material', name: 'lock' }}
                placeholder='Password'
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry={true}
                autoCapitalize="none"
            />
            <View style={styles.buttonContainer}>
                <Button
                    title='Sign In'
                    disabled={loading}
                    onPress={() => signInWithEmail()}
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <Button
                        title="Sign Up"
                        disabled={loading}
                        onPress={() => signUpWithEmail()}   
                    />
                </View>
        </View>
    );        
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        width: 350,
    },
    buttonContainer: {
        marginTop: 10,
    },
});