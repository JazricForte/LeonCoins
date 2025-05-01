import React, { useEffect, useState } from "react";
import { View, Button, StyleSheet } from "react-native";
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

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const session = supabase.auth.session();
        setUser(session?.user || null);


        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

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
        flex: 1,
        justifyContent: 'center',
    },
});

export default HomeScreen; // Moved to the top level of the file