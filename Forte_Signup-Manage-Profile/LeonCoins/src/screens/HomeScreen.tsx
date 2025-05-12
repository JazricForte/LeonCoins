import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Auth from '../components/Auth';
import { supabase } from "../config/supabase";
import { User } from "@supabase/supabase-js";
import Manage from "../components/Manage";

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = supabase.auth.session();
        setUser(session?.user || null);
      } catch (error) {
        console.error("Error fetching session:", (error as Error).message);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      {user ? <Manage navigation={navigation} /> : <Auth />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
});

export default HomeScreen;
