import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CORES = {
  bg1: "#d6fcf9ff",
  bg2: "#6ef0eaff",
  branco: "#ffffff",
  texto: "#2C3E50",
  textoSuave: "#58627A",
  prim: "#038b89ff",
  borda: "#E6E3DF",
  sombra: "#000000",
};

const LARGURA_MAX = 720;
const SESSION_KEY = "@readon:session";
const keyUser = (uid, name) => `@readon:${name}:${uid}`;

async function getSessionUid() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return "__anon__";
    const s = JSON.parse(raw);
    return s?.email || s?.username || "__anon__";
  } catch {
    return "__anon__";
  }
}

export default class LivrosFavoritos extends React.Component {
  state = {
    favoritos: [],
    carregando: false,
    refresh: false,
  };

  componentDidMount() {
    this._unsub = this.props.navigation?.addListener?.("focus", this.carregar);
    this.carregar();
  }
  componentWillUnmount() {
    this._unsub?.();
  }

  lerJSON = (raw, fallback) => {
    try {
      const v = JSON.parse(raw);
      return v ?? fallback;
    } catch {
      return fallback;
    }
  };

  _extrairCapaSource = (item) => {
    if (item?.capa) {
  
      if (typeof item.capa === "string") return { uri: item.capa };
   
      return item.capa;
    }
    if (item?.capaUri) return { uri: item.capaUri };
    if (item?.capaLocal) return item.capaLocal;
    return null;
  };

  carregar = async () => {
    this.setState({ carregando: true });
    const uid = await getSessionUid();
    const KEY_FAVORITOS = keyUser(uid, "favoritos");
    const raw = (await AsyncStorage.getItem(KEY_FAVORITOS)) || "[]";
    const favoritos = this.lerJSON(raw, []);
 
    const norm = favoritos
      .filter(Boolean)
      .map((b) => ({
        id: b.id,
        titulo: b.titulo || "Sem título",
        autor: b.autor || "",
        capa: b.capa ?? null,
        capaUri: b.capaUri ?? null,
        capaLocal: b.capaLocal ?? null,
      }));
    this.setState({ favoritos: norm, carregando: false, refresh: false });
  };

  onRefresh = async () => {
    this.setState({ refresh: true });
    await this.carregar();
  };

  removerFavorito = async (id) => {
    const uid = await getSessionUid();
    const KEY_FAVORITOS = keyUser(uid, "favoritos");
    const raw = (await AsyncStorage.getItem(KEY_FAVORITOS)) || "[]";
    let favoritos = this.lerJSON(raw, []);
    favoritos = favoritos.filter((b) => b && b.id !== id);
    await AsyncStorage.setItem(KEY_FAVORITOS, JSON.stringify(favoritos));
    this.setState((st) => ({ favoritos: st.favoritos.filter((x) => x.id !== id) }));
  };

  abrirDetalhe = (item) => {
   
    const livro = {
      id: item.id,
      titulo: item.titulo,
      autor: item.autor,
      capa: item.capa ?? item.capaUri ?? item.capaLocal ?? null,
    };
    this.props.navigation?.navigate?.("DetalheLivro", { livro });
  };

  renderItem = ({ item }) => {
    const src = this._extrairCapaSource(item);
    return (
      <Pressable style={estilos.card} onPress={() => this.abrirDetalhe(item)}>
        <View style={estilos.capaWrap}>
          {src ? (
            <Image source={src} style={estilos.capa} />
          ) : (
            <View style={estilos.capaVazia}>
              <MaterialCommunityIcons name="book-open-page-variant" size={36} color={CORES.textoSuave} />
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text numberOfLines={2} style={estilos.titulo}>
            {item.titulo}
          </Text>
          {!!item.autor && (
            <Text numberOfLines={1} style={estilos.autor}>
              {item.autor}
            </Text>
          )}
        </View>

        <Pressable
          onPress={() => this.removerFavorito(item.id)}
          style={estilos.btnFavorito}
          android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: true }}
        >
          <MaterialCommunityIcons name="star" size={22} color={CORES.prim} />
        </Pressable>
      </Pressable>
    );
  };

  renderVazio = () => (
    <View style={estilos.vazio}>
      <MaterialCommunityIcons name="star-outline" size={28} color={CORES.textoSuave} />
      <Text style={estilos.vazioTitulo}>Sem favoritos ainda</Text>
      <Text style={estilos.vazioSub}>
        Toque na estrela em um livro para adicioná-lo aos seus favoritos.
      </Text>
    </View>
  );

  render() {
    const { favoritos, refresh } = this.state;

    return (
      <LinearGradient colors={[CORES.bg1, CORES.bg2]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <View style={estilos.container}>
            <View style={estilos.topo}>
              <Text style={estilos.tituloPagina}>Meus Favoritos</Text>
            </View>

            <View style={estilos.listaWrap}>
              <FlatList
                data={favoritos}
                keyExtractor={(it) => String(it.id)}
                renderItem={this.renderItem}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                ListEmptyComponent={this.renderVazio}
                refreshControl={
                  <RefreshControl refreshing={refresh} onRefresh={this.onRefresh} />
                }
                contentContainerStyle={{ paddingVertical: 8 }}
              />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 45,
  },
  topo: {
    paddingTop: 24,
    paddingBottom: 8,
    alignItems: "flex-start",
  },
  tituloPagina: {
    fontSize: 22,
    fontWeight: "900",
    color: CORES.texto,
  },
  listaWrap: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    maxWidth: LARGURA_MAX,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: CORES.branco,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 16,
    shadowColor: CORES.sombra,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  capaWrap: {
    width: 60,
    height: 90,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F1F2F4",
  },
  capa: { width: "100%", height: "100%", resizeMode: "cover" },
  capaVazia: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  titulo: { color: CORES.texto, fontWeight: "800", fontSize: 15 },
  autor: { color: CORES.textoSuave, marginTop: 2 },

  btnFavorito: {
    padding: 8,
    borderRadius: 999,
    marginLeft: "auto",
  },

  vazio: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 6,
  },
  vazioTitulo: { color: CORES.texto, fontWeight: "900", fontSize: 16 },
  vazioSub: { color: CORES.textoSuave, textAlign: "center", paddingHorizontal: 24 },
});
