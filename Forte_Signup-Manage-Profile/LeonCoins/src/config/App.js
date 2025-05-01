import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { supabase } from './supabase';
import Auth from '../../Auth';
import TodoList from './TodoList';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for user session on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      // Clean up the auth listener when component unmounts
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {user ? <TodoList user={user} /> : <Auth />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
});