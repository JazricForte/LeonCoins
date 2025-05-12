import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image, Touchable, TouchableOpacity, Modal, TextInput, Platform } from "react-native";
import { supabase } from "../config/supabase"; // Ensure this path is correct
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from "../navigation/AppNavigator";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from "react-native-progress"; // Import the progress bar library
// Removed duplicate import of RootStackParamList

type ManageProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const Manage: React.FC<ManageProps> = ({ navigation }) => {
  const [data, setData] = useState<any[]>([]);
  const [expensesData, setExpensesData] = useState<any[]>([]);
  const [moneyData, setMoneyData] = useState<any[]>([]);
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [accountData, setAccountData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false); // State to control modal visibility
  const [selectedDate, setSelectedDate] = useState(new Date()); // State to store the selected date
  const [showDatePicker, setShowDatePicker] = useState(false); // State to control date picker visibility
  const [budgetLimit, setBudgetLimit] = useState(""); // State to store the budget limit
  const [totalExpenses, setTotalExpenses] = useState(0); // Total expenses from Supabase
  const [reloadKey, setReloadKey] = useState(0); // State to trigger reload

  const onChangeDate = (event: any, date?: Date) => {
    if (date) {
      setSelectedDate(date); // Update the selected date
    }
    setShowDatePicker(false); // Hide the date picker
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from two tables in parallel
        const [moneyResponse, expensesResponse, budgetResponse, accountResponse] = await Promise.all([
          supabase.from("Money").select("*"), // Replace "Money" with your table name
          supabase.from("TrackExpenses").select("tracked_expenses, created_at, account_id"), // Replace "Expenses" with your table name
          supabase.from("SetBudget").select("budget_limit, duration, account_id"), // Fetch budget limit
          supabase.from("Account").select("id"), // Fetch budget limit
        ]);

        // Handle errors for each query
        if (moneyResponse.error) {
          console.error("Error fetching Money data:", moneyResponse.error.message);
        } else {
          console.log("Money Response:", moneyResponse.data); // Debugging
          setMoneyData(moneyResponse.data || []);
        }

        if (expensesResponse.error) {
          console.error("Error fetching Expenses data:", expensesResponse.error.message);
        } else {
          setExpensesData(expensesResponse.data || []);
        }

        if (budgetResponse.error) {
          console.error("Error fetching Budget data:", budgetResponse.error.message);
        } else {
          console.log("Budget Response:", budgetResponse.data); // Debugging
          setBudgetData(budgetResponse.data || []);
        }

        if (accountResponse.error) {
          console.error("Error fetching Account data:", accountResponse.error.message);
        } else {
          console.log("Account Response:", accountResponse.data); // Debugging
          setAccountData(accountResponse.data || []);
        }

      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBudgetAndExpenses = async () => {
      try {
        // Fetch budget limit
        const { data: budgetData, error: budgetError } = await supabase
          .from("SetBudget") // Replace with your table name
          .select("budget_limit")
          .order("duration", { ascending: false }) // Get the latest budget
          .limit(1);

        if (budgetError) {
          console.error("Error fetching budget limit:", budgetError.message);
        } else if (budgetData && budgetData.length > 0) {
          setBudgetLimit(budgetData[0].budget_limit);
        }

        // Fetch total expenses
        const { data: expensesData, error: expensesError } = await supabase
          .from("TrackExpenses") // Replace with your table name
          .select("tracked_expenses");

        if (expensesError) {
          console.error("Error fetching expenses:", expensesError.message);
        } else {
          const total = expensesData.reduce(
            (sum, item) => sum + item.tracked_expenses,
            0
          );
          setTotalExpenses(total);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetAndExpenses(); // Fetch budget and expenses data
    fetchData();
  }, [reloadKey]);


  const spendMoney = async (amountToSpend: number) => {
  try {
    // Check if the amount to spend exceeds the remaining budget
    const remainingBudget = parseFloat(budgetLimit || "0") - totalExpenses;
    if (amountToSpend > remainingBudget) {
      alert("You cannot spend more than the remaining budget!");
      return;
    }

    // Deduct the amount from the balance
    const updatedBalance = Number(moneyData[0]?.amount - amountToSpend);
    if (updatedBalance < 0) {
      alert("Insufficient balance!");
      return;
    }

    console.log("Updated balance:", updatedBalance);
if (updatedBalance === undefined || updatedBalance === null) {
  console.error("Updated balance is undefined or null");
  return;
}
    // Update the Money table
    const { error: moneyError } = await supabase
      .from("Money") // Replace with your table name
      .update({ amount: updatedBalance }) // Update the balance
      .eq("id", moneyData[0]?.id); // Ensure you update the correct row

      console.log("Money data:", moneyData);
      if (!moneyData[0]?.id) {
  console.error("Invalid ID for update");
  return;
}

    if (moneyError) {
      console.error("Error updating balance:", moneyError.message);
      return;
    }

    // Add the spent amount to the expenses
    const { error: expensesError } = await supabase
      .from("TrackExpenses") // Replace with your table name
      .insert([{ tracked_expenses: amountToSpend, created_at: new Date().toISOString(), account_id: accountData[0]?.id }]); // Add the amount to expenses

    if (expensesError) {
      console.error("Error adding to expenses:", expensesError.message);
      return;
    }

    // Update the local state
    setMoneyData([{ ...moneyData[0], amount: updatedBalance }]);
    setTotalExpenses((prev) => prev + amountToSpend);

    alert("Money spent successfully!");
  } catch (error) {
    console.error("Unexpected error:", error);
  }
};


const deleteData = async (id: number) => {
  try {
    // Delete from SetBudget table
    const { error: budgetError } = await supabase
      .from("SetBudget") // Replace with your table name
      .delete()
      .eq("account_id", id); // Match the row by ID

    if (budgetError) {
      console.error("Error deleting data from SetBudget:", budgetError.message);
      alert("Failed to delete data from SetBudget.");
      return;
    }

    // Delete from TrackExpenses table
    const { error: expensesError } = await supabase
      .from("TrackExpenses") // Replace with your table name
      .delete()
      .eq("account_id", id); // Match the row by ID

    if (expensesError) {
      console.error("Error deleting data from TrackExpenses:", expensesError.message);
      alert("Failed to delete data from TrackExpenses.");
      return;
    }

    alert("Data deleted successfully!");
    setReloadKey((prev) => prev + 1); // Trigger reload to refresh data
  } catch (error) {
    console.error("Unexpected error:", error);
  }
};

  const insertOrUpdateBudget = async () => {
  try {
    // Check if a budget limit already exists
    const { data: existingBudget, error: fetchError } = await supabase
      .from("SetBudget") // Replace with your table name
      .select("*")
      .order("duration", { ascending: false }) // Get the latest budget
      .limit(1);

    if (fetchError) {
      console.error("Error fetching existing budget:", fetchError.message);
      return;
    }

    if (existingBudget && existingBudget.length > 0) {
      // Update the existing budget limit
      const { error: updateError } = await supabase
        .from("SetBudget")
        .update({
          budget_limit: budgetLimit, // Update the budget limit
          duration: selectedDate.toISOString(),
          account_id: accountData[0]?.id // Update the duration
        })
        .eq("account_id", accountData[0]?.id); // Match the record by ID

      if (updateError) {
        console.error("Error updating budget:", updateError.message);
      } else {
        console.log("Budget updated successfully");
        alert("Budget updated successfully!");
      }
    } else {
      // Insert a new budget limit if none exists
      const { error: insertError } = await supabase
        .from("SetBudget")
        .insert([
          {
            budget_limit: budgetLimit,
            duration: selectedDate.toISOString(),
            account_id: accountData[0]?.id
          },
        ]);

      if (insertError) {
        console.error("Error inserting new budget:", insertError.message);
      } else {
        console.log("New budget inserted successfully");
        alert("New budget inserted successfully!");
      }
    }
    
  } catch (error) {
    console.error("Unexpected error:", error);
  }
};

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  async function fetchBudgetAndExpenses() {
    try {
      // Fetch budget limit
      const { data: budgetData, error: budgetError } = await supabase
        .from("SetBudget") // Replace with your table name
        .select("budget_limit")
        .order("duration", { ascending: false }) // Get the latest budget
        .limit(1);

      if (budgetError) {
        console.error("Error fetching budget limit:", budgetError.message);
      } else if (budgetData && budgetData.length > 0) {
        setBudgetLimit(budgetData[0].budget_limit);
      }

      // Fetch total expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from("TrackExpenses") // Replace with your table name
        .select("tracked_expenses");

      if (expensesError) {
        console.error("Error fetching expenses:", expensesError.message);
      } else {
        const total = expensesData.reduce(
          (sum, item) => sum + item.tracked_expenses,
          0
        );
        setTotalExpenses(total);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
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
  {moneyData.length > 0 ? (
    <View style={styles.row}>
      <Text style={styles.text}>Balance</Text>
      <View style={styles.amountContainer}>
        <Text style={styles.amountText}>{moneyData.map((item) => item.amount)}</Text>
      </View>
      </View>
  ) : (
    <Text>No data available</Text>
  )}
</View>

<View>
  {budgetData.length > 0 ? (
    // Display budget text if data exists
    <Text style={styles.budgetText}>
      {`${totalExpenses} / ${budgetData.map((item) => item.budget_limit)} Until ${new Date(budgetData[0]?.duration).toLocaleDateString()}`}
    </Text>
  ) : (
    // Display "No Budget Set" if no data exists
    <Text style={styles.budgetText}>No Budget Set</Text>
  )}
</View>

  <View>
      {/* Progress Bar */}
      <Progress.Bar
        progress={totalExpenses / parseFloat((budgetData[0]?.budget_limit || "1"))} // Progress value (0 to 1)
        width={300} // Width of the progress bar
        height={20} // Height of the progress bar
        color="#ffc600" // Color of the progress bar
        unfilledColor="#e9f2ff" // Background color of the unfilled portion
        borderWidth={1} // Border width
        borderColor="#ccc" // Border color
        style={styles.progressBar}
      />
    </View>

<View style={styles.container}>
<View style={styles.trackRectangle}>
  <View style={styles.row}>
  <Image
    source={require("../image/ExpenseIcon.png")} style={styles.expenseIcon}// Replace with your image path
    />
  <Text style={styles.expensesTitle}>Tracked Expenses</Text>
  </View>
  <Text style={styles.expensesSubtitle}>Expenses</Text>
  <View style={styles.row}>
            <View style={styles.expensesContainer}>
              <Text style={styles.expense}>
    {expensesData
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by created_at (latest first)
      .slice(0, 3) // Get the latest 3 items
      .map((item) => `${item.tracked_expenses}\n\n`) // Map the data to display
      .join("")}
  </Text>

  <Text style={styles.timeExpense}>
    {expensesData
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by created_at (latest first)
      .slice(0, 3) // Get the latest 3 items
      .map((item) => `${new Date(item.created_at).toLocaleDateString()}\n\n`) // Format the date
      .join("")}
  </Text>
            </View>
        </View>
        <TouchableOpacity onPress={() => { navigation.navigate('TrackMore'); console.log("Expenses Data:", expensesData); }}>
            <Text style={styles.button}>More</Text>
          </TouchableOpacity>
</View>
          </View>
        </View>
        <View style={styles.setBudgetRectangle}>
        <TouchableOpacity style={styles.row} onPress={() => setModalVisible(true)}>
          <Image
            source={require("../image/SetBudgetIcon.png")} // Replace with your image path
            style={styles.setBudgetIcon}
          />
          <Text style={styles.setBudgetText}>Set your Budget</Text>
          <Text style={{ fontSize: 25, fontFamily: 'poppins', marginLeft: 55, bottom: 1, color: '#ffc600' }}>{'>'}</Text>
        </TouchableOpacity>
          </View>
          <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)} // Close the modal when the back button is pressed
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Set Your Budget</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your budget"
                keyboardType="numeric"
                value={budgetLimit}
                onChangeText={(text) => setBudgetLimit(text)} // Update the budget limit
              />
              {/* Date Picker Button */}
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateButtonText}>
                  {selectedDate.toDateString()} {/* Display the selected date */}
                </Text>
              </TouchableOpacity>

              {/* Date Picker */}
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  minimumDate={new Date()} // Restrict to future dates
                  onChange={onChangeDate} // Handle date selection
                />
              )}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => deleteData(budgetData[0]?.account_id)} // Close the modal
                >
                  <Text style={styles.modalButtonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setModalVisible(false)} // Close the modal
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSave]}
                  onPress={async () => {
                  await insertOrUpdateBudget(); 
                  await fetchBudgetAndExpenses(); // Fetch updated budget and expenses
                  setReloadKey((prev) => prev + 1);
                  setModalVisible(false); // Close the modal
                  }}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <TouchableOpacity style={{ left: 140, bottom: 100, position: "absolute", }} onPress={async () => {spendMoney(50); await fetchBudgetAndExpenses(); // Fetch updated budget and expenses
                  setReloadKey((prev) => prev + 1);}} // Replace 50 with the amount you want to spend
        >
          <Text>Spend Money</Text>
        </TouchableOpacity>
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
  alignContent: "center",
  marginTop: 20,
  left: 117,
  fontFamily: "Poppins",
  fontWeight: "600",
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContainer: {
    width: 300,
     height: 280,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modalButtons: {
    top: 227,
    left: 20,
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#e9f2ff",
  },
  modalButtonSave: {
    backgroundColor: "#ffc600",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00214e",
  },
  dateButton: {
    backgroundColor: "#e9f2ff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  dateButtonText: {
    fontSize: 16,
    color: "#00214e",
    fontWeight: "600",
  },
  progressBar: {
    position: "absolute",
    flex: 1,
    right: -150,
    top: 0,
    width: 300
  },
  budgetText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#282460",
    top: 20,
    right: 5,
    zIndex: 1,
    maxWidth: "100%",
  },
});

export default Manage;



