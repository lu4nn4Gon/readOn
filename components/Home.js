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
const KEY_CURRENT_BOOKS = "@readon:current_books";     
const arteHome = require("../assets/home.png");

const CORES = {
  gradientStart: "#d6fcf9ff",
  gradientEnd: "#6ef0eaff",
  azul500: "#038b89ff",
  azul300: "#b3b3b3ff",
  texto: "#2C3E50",
  textoSuave: "#58627A",
  branco: "#ffffff",
  borda: "#E6E3DF",
  cinza: "#302f2fff",
  sombra: "#000000",

  lidoBorda: "#16a34a",
  desistidoBorda: "#dc2626",

  lendoBg: "rgba(3,139,137,0.10)",
  lendoBorda: "rgba(3,139,137,0.30)",
  lendoTxt: "#026160ff",
};

const LARGURA_MAX = 520;

export default class Home extends React.Component {
  state = {
    carregando: true,
    livros: [], 
  };

  componentDidMount() {
    this._unsub = this.props.navigation?.addListener?.("focus", this.carregar);
    this.carregar();
  }
  componentWillUnmount() {
    this._unsub?.();
  }

  
  resolveCapaSource = (capa) => {
    if (!capa) return null;
    if (typeof capa === "number") return capa;      
    if (typeof capa === "string") return { uri: capa };
    if (capa?.uri) return { uri: capa.uri };
    return null;
  };

  formatarData = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  getDiaDoMes = () => String(new Date().getDate()).padStart(2, "0");

  carregar = async () => {
    try {
     
      const arrRaw = (await AsyncStorage.getItem(KEY_CURRENT_BOOKS)) || "[]";
      let arr = [];
      try {
        arr = JSON.parse(arrRaw);
        if (!Array.isArray(arr)) arr = [];
      } catch {
        arr = [];
      }

      const singleRaw = await AsyncStorage.getItem(KEY_CURRENT_BOOK);
      if (singleRaw) {
        const single = JSON.parse(singleRaw);
        if (single?.id) arr = [single, ...arr.filter((b) => b && b.id !== single.id)];
      }

      
      const livros = arr.filter(Boolean).map((b) => ({
        id: b.id,
        titulo: b.titulo || "Sem título",
        autor: b.autor || "",
        genero: b.genero || "",
        capa: b.capa || null,
        capaUri: b.capaUri || null,
        capaLocal: b.capaLocal || null,
        inicioEm: b.inicioEm || null,
        progresso: typeof b.progresso === "number" ? b.progresso : 0,
      }));

      this.setState({ livros, carregando: false });
    } catch {
      this.setState({ livros: [], carregando: false });
    }
  };

  onAddPress = () => {
    const pode = !!this.props.navigation?.navigate;
    if (pode) {
      try {
        this.props.navigation.navigate("AdicionarLivro");
      } catch {
        Alert.alert("Adicionar", "Tela 'AdicionarLivro' não encontrada.");
      }
    } else {
      Alert.alert("Adicionar", "Navegação indisponível no momento.");
    }
  };

 
  Cabecalho = () => {
    const nome = this.props.route?.params?.userNome || "usuário";
    return (
      <View style={estilos.cabecalhoWrap}>
        <View style={estilos.cabecalho}>
          <View style={estilos.linhaCabecalho}>
            <View style={{ flex: 1 }}>
              <Text style={[estilos.titulo, { paddingTop: 50 }]}>
                Bem-vindo, {nome}
              </Text>
              <Text style={estilos.subtitulo}>Que livro você leu hoje?</Text>
            </View>
          </View>
          <View style={estilos.faixa}>
            <Text style={estilos.seloDia}>Dia {this.getDiaDoMes()}</Text>
          </View>
          <View style={estilos.onda} />
          <Image source={arteHome} style={estilos.imagemCabecalho} />
        </View>
      </View>
    );
  };

  CartaoVazio = () => (
    <View style={[estilos.cartao, estilos.cartaoVazio]}>
      <Text style={estilos.tituloCartao}>Tem algum livro que você está lendo?</Text>
      <Text style={estilos.subtituloCartao}>Adicione sua leitura atual</Text>
      <View style={estilos.fundoCruzes}>
        <MaterialCommunityIcons name="plus" size={12} color="#0ae0b2ff" />
        <MaterialCommunityIcons name="plus" size={40} color="#0ae0b2ff" />
        <MaterialCommunityIcons name="plus" size={28} color="#0ae0b2ff" />
      </View>
      <Pressable onPress={this.onAddPress} style={estilos.botaoPrimario}>
        <MaterialCommunityIcons name="plus" size={18} color={CORES.branco} />
        <Text style={estilos.textoBotaoPrimario}>Adicionar livro</Text>
      </Pressable>
    </View>
  );

  
  CartaoLivro = ({ livro }) => {
    const capaSrc = this.resolveCapaSource(
      livro?.capaLocal || livro?.capa || livro?.capaUri
    );

    return (
      <View style={[estilos.cartao, estilos.cartaoLivro]}>
        <LinearGradient
          colors={["#ffffff", "rgba(255,255,255,0.95)"]}
          style={estilos.cartaoLivroBg}
        >
          <View style={estilos.badgeLendoRow}>
            <View style={estilos.badgeLendo}>
              <MaterialCommunityIcons
                name="book-open-variant"
                size={14}
                color={CORES.lendoTxt}
              />
              <Text style={estilos.badgeLendoTxt}>Lendo</Text>
            </View>
            {!!livro?.inicioEm && (
              <Text style={estilos.metaLivroPrint}>
                desde {this.formatarData(livro.inicioEm)}
              </Text>
            )}
          </View>

          <Text style={estilos.tituloLivro} numberOfLines={2}>
            {livro?.titulo || "Sem título"}
          </Text>
          {!!livro?.autor && (
            <Text style={estilos.autorLivro} numberOfLines={1}>
              {livro.autor}
            </Text>
          )}

          <View style={estilos.livroRow}>
           
            <View style={estilos.capaWrap}>
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
            </View>

           
            <View style={estilos.infoCol}>
              {!!livro?.genero && (
                <View style={estilos.chipLinha}>
                  <View style={estilos.chipInfo}>
                    <MaterialCommunityIcons
                      name="tag-outline"
                      size={14}
                      color={CORES.azul500}
                    />
                    <Text style={estilos.chipTxt}>{livro.genero}</Text>
                  </View>
                </View>
              )}
            </View>

          
            <View style={estilos.acoesCol}>
              <Pressable
                onPress={() =>
                  Alert.alert("Leitura", "Marcar como lida (implementar lógica)")
                }
                style={[estilos.btnPill, estilos.btnLidoOutline]}
              >
                <MaterialCommunityIcons
                  name="check-bold"
                  size={16}
                  color={CORES.lidoBorda}
                />
                <Text style={estilos.btnPillTxtLido}>Lido</Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  Alert.alert("Leitura", "Desistir da leitura (implementar lógica)")
                }
                style={[estilos.btnPill, estilos.btnDesistidoOutline]}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={16}
                  color={CORES.desistidoBorda}
                />
                <Text style={estilos.btnPillTxtDesistido}>Desistido</Text>
              </Pressable>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  render() {
    const { carregando, livros } = this.state;

    return (
      <LinearGradient colors={[CORES.gradientStart, CORES.gradientEnd]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={estilos.conteudo}
              keyboardShouldPersistTaps="handled"
            >
              <this.Cabecalho />

              {carregando && (
                <Text style={{ color: CORES.textoSuave, marginTop: 14 }}>
                  Carregando...
                </Text>
              )}

              
              <this.CartaoVazio />

              {Array.isArray(livros) && livros.length > 0 && (
                <>
                  <View style={{ height: 10 }} />
                  {livros.map((b) => (
                    <View key={b.id} style={{ width: "100%" }}>
                      <this.CartaoLivro livro={b} />
                    </View>
                  ))}
                </>
              )}

              <View style={{ height: 28 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    );
  }
}

const estilos = StyleSheet.create({
  conteudo: {
    paddingHorizontal: 18,
    paddingBottom: 28,
    flexGrow: 1,
    alignItems: "center",
  },

  
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
  titulo: {
    color: "#E8F4FA",
    fontWeight: "800",
    fontSize: 32,
    marginTop: 12,
    marginBottom: 6,
  },
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
    marginTop: 22,
    maxWidth: LARGURA_MAX,
    backgroundColor: CORES.branco,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 22,
    padding: 18,
    alignSelf: "center",
    shadowColor: CORES.sombra,
    shadowOpacity: 0.1,
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

  
  cartaoLivro: {
    borderWidth: 0,
    padding: 0,
    backgroundColor: "transparent",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  cartaoLivroBg: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(3,139,137,0.20)",
    overflow: "hidden",
  },

  badgeLendoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  badgeLendo: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: CORES.lendoBg,
    borderWidth: 1,
    borderColor: CORES.lendoBorda,
    marginBottom: 4,
  },
  badgeLendoTxt: { color: CORES.lendoTxt, fontWeight: "900", letterSpacing: 0.2 },
  metaLivroPrint: { color: CORES.textoSuave, fontSize: 12 },

  tituloLivro: {
    color: CORES.texto,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.2,
    marginTop: 2,
  },
  autorLivro: { color: CORES.textoSuave, fontSize: 14, marginTop: 2, marginBottom: 30 },

  livroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  capaWrap: { width: 116, height: 168, alignItems: "center", justifyContent: "center" },
  capaBorda: {
    width: 116,
    height: 168,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F1F2F4",
    borderWidth: 1,
    borderColor: "rgba(3,139,137,0.25)",
  },
  capaImagem: { width: "100%", height: "100%", resizeMode: "cover" },
  capaVazia: { flex: 1, alignItems: "center", justifyContent: "center" },

  
  infoCol: { flex: 1, paddingRight: 8, minHeight: 168, justifyContent: "center" },
  chipLinha: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  chipInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(3,139,137,0.08)",
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  chipTxt: { color: CORES.azul500, fontWeight: "800", fontSize: 12 },

  
  acoesCol: { width: 112, alignItems: "stretch", justifyContent: "center", gap: 10 },
  btnPill: {
    height: 42,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "transparent",
  },
  btnLidoOutline: {
    borderColor: CORES.lidoBorda,
    backgroundColor: "rgba(134,239,172,0.10)",
  },
  btnDesistidoOutline: {
    borderColor: CORES.desistidoBorda,
    backgroundColor: "rgba(252,165,165,0.10)",
  },
  btnPillTxtLido: { color: CORES.lidoBorda, fontWeight: "900" },
  btnPillTxtDesistido: { color: CORES.desistidoBorda, fontWeight: "900" },
});
