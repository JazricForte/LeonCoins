import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ActivityIndicator, Image, TouchableOpacity, ScrollView, } from "react-native";
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from "../config/supabase";
import { useNavigation } from "@react-navigation/native";

type Props = StackScreenProps<RootStackParamList, 'TrackMore'>;

const TrackMoreScreen: React.FC<Props> = () => {
  const [loading, setLoading] = React.useState(true);
  const [expensesData, setExpensesData] = useState<any[]>([]);
  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
      const fetchData = async () => {
        try {
          const [ expensesResponse ] = await Promise.all([
                    supabase.from("TrackExpenses").select("tracked_expenses, created_at"), // Replace "Expenses" with your table name
                  ]);
  
          if (expensesResponse.error) {
            console.error("Error fetching Expenses data:", expensesResponse.error.message);
          } else {
            setExpensesData(expensesResponse.data || []);
          }
        } catch (error) {
          console.error("Unexpected error:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);
  
    if (loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
  return (
    <>
    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
    <ScrollView contentContainerStyle={styles.scrollContent}>
    <View style={styles.container}>
    <View style={styles.row}>
      <Image
        source={require("../image/ExpenseIcon.png")} style={styles.expenseIcon} // Replace with your image path
      />
      <Text style={styles.expensesTitle}>Tracked Expenses</Text>
    </View><Text style={styles.expensesSubtitle}>Expenses</Text><View style={styles.row}>
        <View style={styles.expensesContainer}>
          <Text style={styles.expense}>
            {expensesData.map((item) => (
              `${item.tracked_expenses}\n\n`
            )).join("")}
          </Text>

          <Text style={styles.timeExpense}>
            {expensesData.map((item) => (
              `${new Date(item.created_at).toLocaleDateString()}\n\n`
            )).join("")}
          </Text>
        </View>
      </View>
      </View>
      </ScrollView>
      </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: "row", // Arrange items horizontally
    alignItems: "center", // Vertically align items
  },
expenseIcon: {
  width: 26,
  height: 21,
  flexShrink: 0,
  marginRight: 10, // Add spacing between the icon and the text
  bottom: 1,
  left: 20,
},
expensesTitle: {
  fontSize: 25,
  fontWeight: "600",
  lineHeight: 0,
  letterSpacing: 0,
  color: "#282460",
  bottom: 1,
  left: 20
},
expensesSubtitle: {
  fontSize: 13,
  color: "#00214E",
  marginBottom: 10,
  left: 20,
  bottom: -19,
  fontWeight: "600",
  fontFamily: "Poppins",
  lineHeight: 0,
  letterSpacing: 0,
},
expensesContainer: {
  marginTop: 10,
  padding: 10,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
  flexDirection: "row",
},
expense: {
  fontSize: 13,
  color: "#00214e",
  fontFamily: "Poppins",
  fontWeight: "600",
  lineHeight: 0,
  letterSpacing: 0,
  left: 20,
  bottom: -9,
  marginRight: 15,
},
timeExpense: {
  fontSize: 13,
  color: "#ffc600",
  fontFamily: "Poppins",
  fontWeight: "600",
  lineHeight: 0,
  letterSpacing: 0,
  
  left: 160,
  bottom: -9,
},
backButton: {
    backgroundColor: "#e9f2ff",
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-start", // Align the button to the top-left
    marginLeft: 15,
    marginBottom: 20,
    marginTop: 50 // Add some space below the button
  },
  backButtonText: {
    color: "#00214e",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 20, // Add padding at the bottom for better spacing
  },
});

export default TrackMoreScreen;
