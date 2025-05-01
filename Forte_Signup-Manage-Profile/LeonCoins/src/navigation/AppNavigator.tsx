import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import Manage from "../components/Manage";

export type RootStackParamList = {
  Home: undefined;
  Profile: { userId?: string };
  Choices: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen 
                    name="Home" 
                    component={HomeScreen} 
                    options={{ title: 'what' }} 
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;