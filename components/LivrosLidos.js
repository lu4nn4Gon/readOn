import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const SESSION_KEY = "@readon:session";
const keyUser = (uid, name) => `@readon:${name}:${uid}`;

const CORES = {
  bg1: "#d6fcf9ff",
  bg2: "#6ef0eaff",
  prim: "#038b89ff",
  texto: "#2C3E50",
  textoSuave: "#58627A",
  branco: "#ffffff",
  borda: "#E6E3DF",
};

function formatarData(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

export default function LivrosLidos({ navigation }) {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsub = navigation.addListener("focus", carregar);
    carregar();
    return unsub;
  }, [navigation]);

  async function carregar() {
    try {
      const sRaw = await AsyncStorage.getItem(SESSION_KEY);
      const s = sRaw ? JSON.parse(sRaw) : null;
      const uid = s?.email || s?.username || "__anon__";
      const KEY_READ_BOOKS = keyUser(uid, "read_books");

      const raw = (await AsyncStorage.getItem(KEY_READ_BOOKS)) || "[]";
      let lidos = [];
      try {
        lidos = JSON.parse(raw);
        if (!Array.isArray(lidos)) lidos = [];
      } catch {
        lidos = [];
      }
      setItens(lidos);
    } finally {
      setCarregando(false);
    }
  }

  const resolverFonteCapa = (capa) => {
    if (!capa) return null;
    if (typeof capa === "number") return capa;
    if (typeof capa === "string") return { uri: capa };
    if (capa?.uri) return { uri: capa.uri };
    return null;
  };

  return (
    <LinearGradient colors={[CORES.bg1, CORES.bg2]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>

        <View style={estilos.topo}>
          <Pressable onPress={() => navigation.goBack()} style={estilos.voltarBtn}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={CORES.prim} />
            <Text style={estilos.voltarTxt}>Voltar</Text>
          </Pressable>
          <Text style={estilos.titulo}>Livros lidos</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={estilos.container}>
          {carregando && <Text style={estilos.suave}>Carregando...</Text>}

          {!carregando && itens.length === 0 && (
            <View style={estilos.vazio}>
              <MaterialCommunityIcons name="book-check-outline" size={40} color={CORES.prim} />
              <Text style={estilos.suave}>Nenhum livro lido ainda.</Text>
            </View>
          )}

          {itens.map((b) => {
            const fonte = resolverFonteCapa(b?.capaLocal || b?.capa || b?.capaUri);
            return (
              <View key={b.id} style={estilos.card}>
                <View style={estilos.capa}>
                  {fonte ? (
                    <Image source={fonte} style={estilos.capaImg} />
                  ) : (
                    <View style={estilos.capaVazia}>
                      <MaterialCommunityIcons name="book-open-page-variant" size={32} color="#9aa3af" />
                    </View>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.tituloLivro} numberOfLines={2}>
                    {b.titulo || "Sem título"}
                  </Text>
                  {!!b.autor && (
                    <Text style={estilos.autor} numberOfLines={1}>
                      {b.autor}
                    </Text>
                  )}
                  <View style={estilos.linhaInfo}>
                    <MaterialCommunityIcons name="calendar-check" size={16} color={CORES.prim} />
                    <Text style={estilos.infoTxt}>
                      Concluído em {formatarData(b.finalizadoEm)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  topo: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  voltarBtn: { flexDirection: "row", alignItems: "center", gap: 6, padding: 6, width: 60 },
  voltarTxt: { color: CORES.prim, fontWeight: "700" },
  titulo: { color: CORES.texto, fontSize: 18, fontWeight: "800" },
  container: { padding: 16, gap: 12 },
  suave: { color: CORES.textoSuave },
  vazio: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: CORES.branco,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 14,
    padding: 12,
  },
  capa: {
    width: 70,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F1F2F4",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  capaImg: { width: "100%", height: "100%", resizeMode: "cover" },
  capaVazia: { flex: 1, alignItems: "center", justifyContent: "center" },
  tituloLivro: { color: CORES.texto, fontWeight: "800", fontSize: 16 },
  autor: { color: CORES.textoSuave, marginTop: 2, marginBottom: 8 },
  linhaInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoTxt: { color: CORES.texto, fontWeight: "600" },
});
