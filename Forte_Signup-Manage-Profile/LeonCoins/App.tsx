
import Auth from "../LeonCoins/src/components/Auth";
import AppNavigator from "./src/navigation/AppNavigator";
import HomeScreen from "./src/screens/HomeScreen";
import { StyleSheet, View } from "react-native";

const App = () => {
  return <View style={styles.container}>
    <HomeScreen />;
    </View>

  
};

export default App;

const styles = StyleSheet.create({
    container: {
      flex: 1, // Ensures the container takes up the full screen
      justifyContent: 'center', // Centers content vertically
      backgroundColor: '#ffffff', // Optional: Set a background color
    },
  });

