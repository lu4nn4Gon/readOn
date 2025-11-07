import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Easing,
  Vibration,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CORES = {
  bg1: "#d6fcf9ff",
  bg2: "#6ef0eaff",
  prim: "#038b89ff",
  texto: "#2C3E50",
  textoSuave: "#58627A",
  branco: "#ffffff",
  borda: "#E6E3DF",
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


const SESSION_KEY = "@readon:session";
const keyUser = (uid, name) => `@readon:${name}:${uid}`;

const KEY_AVALIACOES = (id) => `@readon:avaliacoes:${id}`;

async function getSession() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    const uid = s?.email || s?.username || null;
    return uid ? { uid, nome: s?.nome || "usuário" } : null;
  } catch {
    return null;
  }
}

function resolverFonteCapa(capaLike) {
  if (!capaLike) return null;
  if (typeof capaLike === "number") return capaLike;
  if (typeof capaLike === "string") return { uri: capaLike };
  if (capaLike?.uri) return { uri: capaLike.uri };
  return null;
}

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

export default function AvaliarLivro({ navigation, route }) {
  const livro = route?.params?.livro || null;

  const [rating, setRating] = useState(0); // 1..5
  const [comentario, setComentario] = useState("");
  const [uid, setUid] = useState("__anon__");
  const [userNome, setUserNome] = useState("usuário");


  useEffect(() => {
    const padrao = [180, 120, 180, 120, 260];
    Vibration.vibrate(padrao, false);
    return () => Vibration.cancel();
  }, []);

 
  useEffect(() => {
    (async () => {
      const s = await getSession();
      if (s?.uid) {
        setUid(s.uid);
        setUserNome(s.nome || "usuário");
      }
    })();
  }, []);

  const onSelectStar = (n) => setRating(n);

  const salvarAvaliacao = async () => {
    try {
      if (!livro?.id) {
        Alert.alert("Erro", "Livro inválido para avaliação.");
        return;
      }
      if (rating < 1) {
        Alert.alert("Ops", "Selecione uma nota (pelo menos 1 estrela).");
        return;
      }

      
      const KEY_REVIEWS = keyUser(uid, "reviews");
      const rawUser = (await AsyncStorage.getItem(KEY_REVIEWS)) || "[]";
      let reviewsUser = [];
      try {
        reviewsUser = JSON.parse(rawUser);
        if (!Array.isArray(reviewsUser)) reviewsUser = [];
      } catch {
        reviewsUser = [];
      }

      const novaReviewUsuario = {
        id: `${livro.id}:${Date.now()}`,
        livroId: livro.id,
        titulo: livro.titulo || "",
        autor: livro.autor || "",
        capa: livro.capa ?? livro.capaUri ?? livro.capaLocal ?? null,
        rating, // 1..5
        comentario: (comentario || "").trim(),
        uid,
        userNome,
        criadoEm: new Date().toISOString(),
      };

      const atualizadasUsuario = [novaReviewUsuario, ...reviewsUser];
      await AsyncStorage.setItem(KEY_REVIEWS, JSON.stringify(atualizadasUsuario));

      const chaveLivro = KEY_AVALIACOES(livro.id);
      const rawLivro = (await AsyncStorage.getItem(chaveLivro)) || "[]";
      let reviewsLivro = [];
      try {
        reviewsLivro = JSON.parse(rawLivro);
        if (!Array.isArray(reviewsLivro)) reviewsLivro = [];
      } catch {
        reviewsLivro = [];
      }

    
      const itemDetalhe = {
        usuario: userNome,                     
        nota: Number(rating),                  
        comentario: (comentario || "").trim(),   
        data: new Date().toISOString(),       
      };

      reviewsLivro.unshift(itemDetalhe);
      await AsyncStorage.setItem(chaveLivro, JSON.stringify(reviewsLivro));

      Alert.alert("Obrigado!", "Sua avaliação foi salva com sucesso.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar sua avaliação.");
    }
  };

  const capaSrc = resolverFonteCapa(livro?.capaLocal || livro?.capa || livro?.capaUri);

  return (
    <LinearGradient colors={[CORES.bg1, CORES.bg2]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      
        <View style={estilos.topbar}>
          <Pressable onPress={() => navigation.goBack()} style={estilos.btnVoltar}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={CORES.prim} />
            <Text style={estilos.txtVoltar}>Voltar</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={estilos.conteudo}
            keyboardShouldPersistTaps="handled"
          >
           
            <View style={estilos.headerArea}>
              <Text style={estilos.headerTitulo}>
                {livro?.titulo ? `"${livro.titulo}" marcado como LIDO` : "Livro marcado como LIDO"}
              </Text>
              <Text style={estilos.headerSub}>Deixe sua avaliação abaixo</Text>
            </View>

         
            <View style={estilos.linhaLivro}>
              <View style={estilos.capaBorda}>
                {capaSrc ? (
                  <Image source={capaSrc} style={estilos.capaImagem} />
                ) : (
                  <View style={estilos.capaVazia}>
                    <MaterialCommunityIcons
                      name="book-open-page-variant"
                      size={42}
                      color={CORES.textoSuave}
                    />
                  </View>
                )}
              </View>

              <View style={estilos.infoCol}>
                <Text style={estilos.tituloLivro} numberOfLines={2}>
                  {livro?.titulo || "Sem título"}
                </Text>
                {!!livro?.autor && (
                  <Text style={estilos.autorLivro} numberOfLines={1}>
                    {livro.autor}
                  </Text>
                )}
                <Text style={estilos.usuarioTxt} numberOfLines={1}>
                  Avaliando como: <Text style={{ fontWeight: "800" }}>{userNome}</Text>
                </Text>
              </View>
            </View>

          
            <View style={estilos.estrelasArea}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => onSelectStar(n)} style={estilos.starBtn}>
                  <MaterialCommunityIcons
                    name={n <= rating ? "star" : "star-outline"}
                    size={28}
                    color={CORES.prim}
                  />
                </Pressable>
              ))}
            </View>

          
            <View style={estilos.caixaTextoArea}>
              <Text style={estilos.label}>Comentário (opcional)</Text>
              <TextInput
                style={estilos.textarea}
                placeholder="Escreva o que achou do livro..."
                placeholderTextColor={CORES.textoSuave}
                multiline
                value={comentario}
                onChangeText={setComentario}
                maxLength={1000}
              />
              <Text style={estilos.contador}>{comentario.length}/1000</Text>
            </View>

           
            <Pressable onPress={salvarAvaliacao} style={estilos.btnSalvar}>
              <MaterialCommunityIcons name="send" size={18} color={CORES.branco} />
              <Text style={estilos.btnSalvarTxt}>Enviar avaliação</Text>
            </Pressable>

            <View style={{ height: 30 }} />
          </ScrollView>
        </KeyboardAvoidingView>

   
        <ConfettiRain />
      </SafeAreaView>
    </LinearGradient>
  );
}

const LARGURA_CAPA = 116;
const ALTURA_CAPA = 168;
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

  conteudo: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },

  headerArea: { alignItems: "center", marginTop: 6, marginBottom: 10 },
  headerTitulo: {
    color: CORES.texto,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  headerSub: { color: CORES.textoSuave, marginTop: 4 },

  linhaLivro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 10,
    marginBottom: 16,
  },
  capaBorda: {
    width: LARGURA_CAPA,
    height: ALTURA_CAPA,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F1F2F4",
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  capaImagem: { width: "100%", height: "100%", resizeMode: "cover" },
  capaVazia: { flex: 1, alignItems: "center", justifyContent: "center" },
  infoCol: { flex: 1, minHeight: ALTURA_CAPA, justifyContent: "center", paddingRight: 4 },
  tituloLivro: { color: CORES.texto, fontSize: 18, fontWeight: "900" },
  autorLivro: { color: CORES.textoSuave, marginTop: 4, marginBottom: 12 },
  usuarioTxt: { color: CORES.textoSuave },

  estrelasArea: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
    marginBottom: 10,
  },
  starBtn: { padding: 4 },

  caixaTextoArea: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 14,
    padding: 12,
    backgroundColor: CORES.branco,
  },
  label: { color: CORES.texto, fontWeight: "800", marginBottom: 6 },
  textarea: {
    minHeight: 100,
    textAlignVertical: "top",
    color: CORES.texto,
    fontSize: 14,
  },
  contador: { alignSelf: "flex-end", color: CORES.textoSuave, marginTop: 6, fontSize: 12 },

  btnSalvar: {
    marginTop: 14,
    backgroundColor: CORES.prim,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnSalvarTxt: { color: CORES.branco, fontWeight: "800" },
});
