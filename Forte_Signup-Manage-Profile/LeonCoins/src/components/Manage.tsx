import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image, Touchable, TouchableOpacity } from "react-native";
import { supabase } from "../config/supabase"; // Ensure this path is correct

const Manage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [expensesData, setExpensesData] = useState<any[]>([]);
  const [moneyData, setMoneyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from two tables in parallel
        const [moneyResponse, expensesResponse] = await Promise.all([
          supabase.from("Money").select("amount"), // Replace "Money" with your table name
          supabase.from("TrackExpenses").select("tracked_expenses, created_at"), // Replace "Expenses" with your table name
        ]);

        // Handle errors for each query
        if (moneyResponse.error) {
          console.error("Error fetching Money data:", moneyResponse.error.message);
        } else {
          setMoneyData(moneyResponse.data || []);
        }

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
    <><View style={styles.row}>
      <Image
        source={require("../image/ProfileImage.png")} // Replace with your image path
        style={styles.profile} />
        <Image
        source={require("../image/LeonCoinsIcon.png")} // Replace with your image path
        style={styles.logo} />
    </View><View style={styles.container}>
    <View style={styles.amountRectangle}>
  {data.length > 0 ? (
    <View style={styles.row}>
      <Text style={styles.text}>Balance</Text>
      <View style={styles.amountContainer}>
        <Text style={styles.amountText}>{data.map((item) => item.amount).join(", ")}</Text>
      </View>
    </View>
  ) : (
    <Text>No data available</Text>
  )}
</View>
<View style={styles.container}>
<View style={styles.trackRectangle}>
  <View style={styles.row}>
  <Image
    source={require("../image/ExpenseIcon.png")} style={styles.expenseIcon}// Replace with your image path
    />
  <Text style={styles.expensesTitle}>Take Loan</Text>
  </View>
  <Text style={styles.expensesSubtitle}>Expenses</Text>
  <View style={styles.row}>
            <View style={styles.expensesContainer}>
              <Text style={styles.expense}>
                {expensesData.map((item, index) => (
                  `${item.tracked_expenses}\n\n`
                )).join("")}
              </Text>
              
              <Text style={styles.timeExpense}>
              {expensesData.map((item, index) => (
                  `${new Date(item.created_at).toLocaleDateString()}\n\n`
                )).join("")}
                </Text>
            </View>
        </View>
        <TouchableOpacity onPress={() => console.log("Button Pressed")}>
            <Text style={styles.button}>Click Me</Text>
          </TouchableOpacity>
</View>
          </View>
        </View>
        <View style={styles.setBudgetRectangle}>
        <TouchableOpacity style={styles.row} onPress={() => console.log("Set Budget Clicked")}>
          <Image
            source={require("../image/SetBudgetIcon.png")} // Replace with your image path
            style={styles.setBudgetIcon}
          />
          <Text style={styles.setBudgetText}>Set your Budget</Text>
          <Text style={{ fontSize: 25, fontFamily: 'poppins', marginLeft: 55, bottom: 1, color: '#ffc600' }}>{'>'}</Text>
        </TouchableOpacity>
          </View>
      </> 
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 25,
    fontFamily: "Poppins",
    fontWeight: "400",
    lineHeight: 24,
    color: "#282460",
    width: 91,
    height: 19,
    flexShrink: 0,
    textAlign: "center",
    top: -3,
  },
  amountContainer: {
    marginLeft: 10, // Add spacing between "Balance" and the amount
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5, // Rounded corners
  },
  amountText: {
    fontSize: 25,
    fontFamily: "Poppins",
    fontWeight: "600",
    lineHeight: 24,
    color: "#282460",
  },
  amountRectangle: {
    width: 330,
    height: 96,
    flexShrink: 0,
    borderRadius: 20,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: -8, height: 11 },
    shadowOpacity: 0.11,
    shadowRadius: 28,
    elevation: 4, // For Android shadow
    alignItems: "flex-start", // Align content to the left
    justifyContent: "center", // Vertically center the content
    paddingLeft: 15, // Add padding to the left for spacing
    top: 50, // Adjust the top position as needed
  },
  trackRectangle: {
    width: 330,
    height: 300,
    flexShrink: 0,
    borderRadius: 20,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: -8, height: 11 },
    shadowOpacity: 0.11,
    shadowRadius: 28,
    elevation: 4, // For Android shadow
    alignItems: "flex-start", // Align content to the left
    justifyContent: "center", // Vertically center the content
    paddingLeft: 15, // Add padding to the left for spacing
    bottom: 50, // Adjust the top position as needed
  },
  row: {
    flexDirection: "row", // Arrange items horizontally
    alignItems: "center", // Vertically align items
  },
profile: {
  width: 53,
  height: 53.035,
  flexShrink: 0,
  top: 50,
  left: 26,
},
logo: {
  width: 53,
  height: 53.035,
  flexShrink: 0,
  top: 60,
  left: 230,
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
button: {
  backgroundColor: "#e9f2ff",
  padding: 10,
  borderRadius: 16,
  textAlign: "center",
  marginTop: 20,
  left: 110,
  fontFamily: "Poppins",
  fontWeight: "400",
  fontSize: 16,
  lineHeight: 0,
  letterSpacing: 0,
  color: "#00214e",
  shadowColor: "rgba(33, 150, 83, 0.07)",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.35,
  shadowRadius: 35, 
  elevation: 4, // For Android shadow
},
setBudgetRectangle: {
  width: 330,
  height: 75,
  flexShrink: 0,
  borderRadius: 20,
  borderColor: "#ffc600",
  borderWidth: 1,
  backgroundColor: "#transparent",
  shadowColor: "#000",
  shadowOffset: { width: -8, height: 11 },
  shadowOpacity: 0.11,
  shadowRadius: 28,
  elevation: 4, // For Android shadow
  justifyContent: "center", // Vertically center the content
  paddingLeft: 15, // Add padding to the left for spacing
  bottom: 170, // Adjust the top position as needed
  left: 20,
},
setBudgetIcon: {
  width: 26,
  height: 26,
  flexShrink: 0,
  marginRight: 20, // Add spacing between the icon and the text
  marginLeft: 20,
  bottom: 1,
},
setBudgetText: { 
    fontFamily: "Poppins",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 0,
    letterSpacing: 0,
    color: "#342e3f",
    bottom: 1,
  },
});

export default Manage;



