import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CameraScreen from './components/CameraScreen';
import InvoiceListScreen from './components/InvoiceListScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [invoices, setInvoices] = useState([]);

  const handleAddInvoice = (invoice) => {
    setInvoices(prev => [...prev, invoice]);
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Cámara') {
                iconName = focused ? 'camera' : 'camera-outline';
              } else if (route.name === 'Facturas') {
                iconName = focused ? 'list' : 'list-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
          })}
        >
          <Tab.Screen name="Cámara">
            {(props) => (
              <CameraScreen {...props} onAddInvoice={handleAddInvoice} />
            )}
          </Tab.Screen>
          <Tab.Screen name="Facturas">
            {(props) => (
              <InvoiceListScreen {...props} invoices={invoices} />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
