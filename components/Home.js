import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const KEY_CURRENT_BOOK = "@readon:current_book";

// imagem do cabeçalho
const arteHome = require("../assets/home.png");

const CORES = {
  gradientStart: "#d6fcf9ff",
  gradientEnd:   "#6ef0eaff",
  azul500: "#038b89ff",
  azul300: "#b3b3b3ff",
  texto: "#2C3E50",
  textoSuave: "#58627A",
  branco: "#ffffff",
  borda: "#E6E3DF",
  cinza: "#302f2fff",
  sombra: "#000000",
};

export default class Home extends React.Component {
  state = {
    carregando: true,
    livro: null, // { id, titulo, autor, capa, inicioEm }
  };

  componentDidMount() {
    this._unsub = this.props.navigation?.addListener?.("focus", this.carregar);
    this.carregar();
  }
  componentWillUnmount() { this._unsub?.(); }

  carregar = async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY_CURRENT_BOOK);
      this.setState({ livro: raw ? JSON.parse(raw) : null, carregando: false });
    } catch {
      this.setState({ livro: null, carregando: false });
    }
  };

  onAddPress = () => Alert.alert("Adicionar livro", "Em breve esta ação estará disponível.");

  formatarData = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  getDiaDoMes = () => String(new Date().getDate()).padStart(2, "0");

  Header = () => {
    const nome = this.props.route?.params?.userNome || "usuário";
    return (
      <View style={estilos.cabecalhoWrap}>
        <View style={estilos.cabecalho}>
          <View style={estilos.linhaCabecalho}>
            <View style={{ flex: 1 }}>
              <Text style={[estilos.titulo, { paddingTop: 50 }]}>Bem-vindo, {nome}</Text>
              <Text style={estilos.subtitulo}>Que livro você leu hoje?</Text>
            </View>
          </View>

          <View style={estilos.faixa}>
            <Text style={estilos.seloDia}>Dia {this.getDiaDoMes()}</Text>
          </View>

          {/* 1) Onda */}
          <View style={estilos.onda} />

          {/* 2) Imagem por cima da onda (ordem + zIndex) */}
          <Image source={arteHome} style={estilos.imagemCabecalho} />
        </View>
      </View>
    );
  };

  CardVazio = () => (
    <View style={[estilos.cartao, estilos.cartaoVazio]}>
      <Text style={estilos.tituloCartao}>Adicionar um livro</Text>
      <Text style={estilos.subtituloCartao}>Tem algum livro que você está lendo?</Text>

      <View style={estilos.fundoCruzes}>
        <MaterialCommunityIcons name="plus" size={56} color="#ECF3F4" />
        <MaterialCommunityIcons name="plus" size={40} color="#F0F6F7" />
        <MaterialCommunityIcons name="plus" size={28} color="#F4F9F9" />
      </View>

      <Pressable onPress={this.onAddPress} style={estilos.botaoPrimario}>
        <MaterialCommunityIcons name="plus" size={18} color={CORES.branco} />
        <Text style={estilos.textoBotaoPrimario}>Adicionar livro</Text>
      </Pressable>
    </View>
  );

  CardLivro = () => {
    const { livro } = this.state;
    return (
      <View style={[estilos.cartao, estilos.cartaoLivro]}>
        <Text style={estilos.tituloLivro} numberOfLines={2}>
          {livro?.titulo || "Sem título"}
        </Text>

        <View style={estilos.linhaLivro}>
          <View style={estilos.capaContainer}>
            {livro?.capa ? (
              <Image source={{ uri: livro.capa }} style={estilos.capaImagem} />
            ) : (
              <View style={estilos.capaVazia}>
                <MaterialCommunityIcons name="book-open-page-variant" size={42} color={CORES.textoSuave} />
              </View>
            )}
          </View>

          <View style={{ flex: 1, paddingLeft: 14 }}>
            {!!livro?.inicioEm && (
              <Text style={estilos.metaLivro}>A partir de {this.formatarData(livro.inicioEm)}</Text>
            )}
            {!!livro?.autor && <Text style={estilos.autorLivro}>{livro.autor}</Text>}

            <View style={estilos.seloNota}>
              <MaterialCommunityIcons name="note-outline" size={16} color={CORES.textoSuave} />
              <Text style={estilos.textoSeloNota}>1 nota</Text>
            </View>
          </View>
        </View>

        <View style={estilos.grupoFlutuante}>
          <Pressable style={estilos.botaoFlutuante}><MaterialCommunityIcons name="timer-outline" size={20} color={CORES.branco} /></Pressable>
          <Pressable style={estilos.botaoFlutuante}><MaterialCommunityIcons name="note-text-outline" size={20} color={CORES.branco} /></Pressable>
          <Pressable style={estilos.botaoFlutuante}><MaterialCommunityIcons name="plus" size={20} color={CORES.branco} /></Pressable>
        </View>
      </View>
    );
  };

  InfoLendo = () => (
    <View style={estilos.pilulaInfo}>
      <Text style={estilos.textoPilulaInfo}>Você está lendo um livro.</Text>
      <View style={estilos.avatarInfo}>
        <MaterialCommunityIcons name="flask-outline" size={20} color={CORES.branco} />
      </View>
    </View>
  );

  render() {
    const { carregando, livro } = this.state;

    return (
      <LinearGradient colors={[CORES.gradientStart, CORES.gradientEnd]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
              <this.Header />

              {carregando ? (
                <Text style={{ color: CORES.textoSuave, marginTop: 16 }}>Carregando...</Text>
              ) : livro ? (
                <>
                  <this.CardLivro />
                  <View style={{ height: 12 }} />
                  <this.InfoLendo />
                </>
              ) : (
                <>
                  <this.CardVazio />
                  <View style={{ height: 12 }} />
                  <this.InfoLendo />
                </>
              )}

              <View style={{ height: 60 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    );
  }
}

const LARGURA_MAX = 520;

const estilos = StyleSheet.create({
  conteudo: {
    paddingHorizontal: 18,
    paddingBottom: 28,
    flexGrow: 1,
    alignItems: "center",
  },

  // Cabeçalho grudado no topo
  cabecalhoWrap: { width: "100%", alignItems: "center", marginTop: 0 },
  cabecalho: {
    width: "110%",
    maxWidth: LARGURA_MAX,
    backgroundColor: CORES.azul500,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 100,
    overflow: "hidden",
  },
  linhaCabecalho: { flexDirection: "row", alignItems: "flex-start" },
  titulo: { color: "#E8F4FA", fontWeight: "800", fontSize: 32, marginTop: 12, marginBottom: 6 },
  subtitulo: { color: "#D3E7F3", fontSize: 14 },

  faixa: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  seloDia: {
    backgroundColor: CORES.cinza,
    color: "#fefefeff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    fontWeight: "900",
  },

  // Onda (fundo) — zIndex menor
  onda: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 200,
    right: -60,
    bottom: -80,
    backgroundColor: "rgba(255,255,255,0.25)",
    transform: [{ rotate: "12deg" }],
    zIndex: 1,
  },

  imagemCabecalho: {
    position: "absolute",
    right: -15,
    bottom: -5,
    width: 230,
    height: 200,
    resizeMode: "contain",
    zIndex: 2,
  },

 
  cartao: {
    width: "100%",
    marginTop: 30,
    maxWidth: LARGURA_MAX,
    backgroundColor: CORES.branco,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 22,
    padding: 18,
    alignSelf: "center",
    shadowColor: CORES.sombra,
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },

  cartaoVazio: { alignItems: "flex-start", overflow: "hidden" },
  tituloCartao: { color: CORES.texto, fontSize: 22, fontWeight: "800", marginBottom: 6 },
  subtituloCartao: { color: CORES.textoSuave, marginBottom: 18 },
  fundoCruzes: { position: "absolute", right: 24, bottom: 18, opacity: 0.45, gap: 8 },

  botaoPrimario: {
    backgroundColor: CORES.azul500,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textoBotaoPrimario: { color: CORES.branco, fontWeight: "800" },

  cartaoLivro: {},
  tituloLivro: { color: CORES.texto, fontSize: 20, fontWeight: "800", marginBottom: 10 },
  linhaLivro: { flexDirection: "row", alignItems: "center" },

  capaContainer: {
    width: 110, height: 160,
    borderRadius: 14, overflow: "hidden",
    backgroundColor: "#F1F2F4",
  },
  capaImagem: { width: "100%", height: "100%", resizeMode: "cover" },
  capaVazia: { flex: 1, alignItems: "center", justifyContent: "center" },

  metaLivro: { color: CORES.textoSuave },
  autorLivro: { color: CORES.textoSuave, marginTop: 4 },
  seloNota: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F4F7FA",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  textoSeloNota: { color: CORES.textoSuave },

  grupoFlutuante: {
    position: "absolute",
    right: 16, bottom: 16,
    flexDirection: "row", gap: 10,
  },
  botaoFlutuante: {
    width: 48, height: 48, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: CORES.azul500,
    elevation: 3,
    shadowColor: CORES.sombra,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },

  pilulaInfo: {
    width: "100%",
    maxWidth: LARGURA_MAX,
    backgroundColor: CORES.branco,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: CORES.sombra,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  textoPilulaInfo: { color: CORES.texto, fontSize: 16 },
  avatarInfo: {
    width: 36, height: 36, borderRadius: 999,
    backgroundColor: CORES.azul500,
    alignItems: "center", justifyContent: "center",
  },
});
