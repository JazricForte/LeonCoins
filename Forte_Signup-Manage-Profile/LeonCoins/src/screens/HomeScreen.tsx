import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Auth from '../components/Auth';
import { supabase } from "../config/supabase";
import { User } from "@supabase/supabase-js";
import Manage from "../components/Manage";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC= () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Fetch the current session on component mount
    const fetchSession = async () => {
        const session = supabase.auth.session();
        setUser(session?.user || null);
      if (Error()) {
        console.error("Error fetching session:", Error().message);
      }
      setUser(session?.user || null);
    };

    fetchSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // Cleanup the listener on unmount
    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      {user ? <Manage /> : <Auth />}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1, // Ensures the container takes up the full screen
      justifyContent: 'center', // Centers content vertically
      backgroundColor: '#ffffff', // Optional: Set a background color
    },
  });

export default HomeScreen;