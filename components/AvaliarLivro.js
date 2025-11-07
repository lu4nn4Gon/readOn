import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Easing,
  Vibration,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const CORES = {
  bg1: "#d6fcf9ff",
  bg2: "#6ef0eaff",
  prim: "#038b89ff",
  texto: "#2C3E50",
  branco: "#ffffff",
};

const PALETA = [
  "#ff3b30",
  "#ff9500", 
  "#ffcc00", 
  "#34c759", 
  "#00c7be", 
  "#007aff", 
  "#af52de", 
  "#ff2d55", 
];

const { width: W, height: H } = Dimensions.get("window");


function ConfettiRain({ count = 90, durationMin = 1600, durationMax = 2800 }) {
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const startX = Math.random() * W;
      const endX = startX + (Math.random() * 140 - 70); 
      const delay = Math.random() * 450;
      const dur = durationMin + Math.random() * (durationMax - durationMin);

    
      const w = 6 + Math.floor(Math.random() * 10);   
      const h = 10 + Math.floor(Math.random() * 22);  
      const borderRadius =
        Math.random() < 0.28 ? Math.max(w, h) : Math.floor(Math.random() * 4); 
      const bg = PALETA[i % PALETA.length];

   
      const prog = new Animated.Value(0);

      arr.push({
        key: `p${i}`,
        startX,
        endX,
        delay,
        dur,
        w,
        h,
        borderRadius,
        bg,
        prog,
        spinDir: Math.random() > 0.5 ? 1 : -1,
        sway: 10 + Math.random() * 24, 
      });
    }
    return arr;
  }, [count, durationMin, durationMax]);

  useEffect(() => {
    const anims = particles.map((p) =>
      Animated.timing(p.prog, {
        toValue: 1,
        duration: p.dur,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
        delay: p.delay,
      })
    );
    Animated.stagger(10, anims).start();
  }, [particles]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => {
        const translateY = p.prog.interpolate({
          inputRange: [0, 1],
          outputRange: [-60, H + 80],
        });

       
        const translateX = p.prog.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [p.startX, (p.startX + p.endX) / 2, p.endX],
        });

  
        const rotateZ = p.prog.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", `${p.spinDir * (360 + Math.random() * 360)}deg`],
        });

      
        const rotateX = p.prog.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: ["0deg", "180deg", "360deg"],
        });

      
        const scale = p.prog.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.9, 1.1, 1],
        });

       
        const sway = p.prog.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [0, p.sway, -p.sway, p.sway, 0],
        });

        return (
          <Animated.View
            key={p.key}
            style={{
              position: "absolute",
              width: p.w,
              height: p.h,
              backgroundColor: p.bg,
              borderRadius: p.borderRadius,
              opacity: 0.95,
              transform: [
                { translateX },
                { translateY },
                { translateX: sway }, 
                { rotateZ },
                { rotateX },
                { scale },
              ],
            }}
          />
        );
      })}
    </View>
  );
}

export default function AvaliarLivro({ navigation }) {
 
  useEffect(() => {
    const padrao = [180, 120, 180, 120, 260];
    Vibration.vibrate(padrao, false);
    return () => Vibration.cancel();
  }, []);

  return (
    <LinearGradient colors={[CORES.bg1, CORES.bg2]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
    
        <View style={estilos.topbar}>
          <Pressable onPress={() => navigation.goBack()} style={estilos.btnVoltar}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={CORES.prim} />
            <Text style={estilos.txtVoltar}>Voltar</Text>
          </Pressable>
        </View>

        <View style={estilos.body}>
          <Text style={estilos.titulo}>Livro marcado como LIDO</Text>
          <Text style={estilos.sub}>
            Em breve você poderá avaliar aqui. Aproveite o momento! 🎉
          </Text>
        </View>

      
        <ConfettiRain />
      </SafeAreaView>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  topbar: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
    alignItems: "flex-start",
  },
  btnVoltar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  txtVoltar: { color: CORES.prim, fontWeight: "700", fontSize: 15 },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 10,
  },
  titulo: {
    color: CORES.texto,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  sub: {
    color: "#58627A",
    textAlign: "center",
  },
});
