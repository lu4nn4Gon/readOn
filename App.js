import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "./components/Login";
import Cadastro from "./components/Cadastro";
import Home from "./components/Home";
import AdicionarLivro from "./components/AdicionarLivro";
import DetalheLivro from "./components/DetalheLivro";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" translucent />
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>

        <Stack.Screen name="Login" component={Login} />

        <Stack.Screen name="Cadastro" component={Cadastro} />

        <Stack.Screen name="Home" component={Home} />

        <Stack.Screen name="AdicionarLivro" component={AdicionarLivro} />
        
        <Stack.Screen name="DetalheLivro" component={DetalheLivro} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
