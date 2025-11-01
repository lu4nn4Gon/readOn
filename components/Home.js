// Home.js
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

  // compatibilidade
  sucesso: "#86efac",
  perigo: "#fca5a5",

  // semântica solicitada
  lido: "#86efac",
  lidoBorda: "#16a34a",
  lidoTexto: "#16a34a",
  desistido: "#fca5a5",
  desistidoBorda: "#dc2626",
  desistidoTexto: "#dc2626",

  // badge lendo
  lendoBg: "rgba(3,139,137,0.10)",
  lendoBorda: "rgba(3,139,137,0.30)",
  lendoTxt: "#026160ff",
};

const LARGURA_MAX = 520;

export default class Home extends React.Component {
  state = {
    carregando: true,
    livro: null,
    listaDesejos: [],
  };

  componentDidMount() {
    this._unsub = this.props.navigation?.addListener?.("focus", this.carregar);
    this.carregar();
  }
  componentWillUnmount() {
    this._unsub?.();
  }

  // === helpers ===
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
      const raw = await AsyncStorage.getItem(KEY_CURRENT_BOOK);
      this.setState({ livro: raw ? JSON.parse(raw) : null, carregando: false });
    } catch {
      this.setState({ livro: null, carregando: false });
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

  irParaBiblioteca = (filtro) => {
    const pode = !!this.props.navigation?.navigate;
    if (pode) {
      try {
        this.props.navigation.navigate("Biblioteca", filtro ? { filtro } : undefined);
      } catch {
        Alert.alert("Biblioteca", "Tela de biblioteca ainda não foi implementada.");
      }
    } else {
      Alert.alert("Biblioteca", "Tela de biblioteca ainda não foi implementada.");
    }
  };

  irParaLancamentos = () => {
    const pode = !!this.props.navigation?.navigate;
    if (pode) {
      try {
        this.props.navigation.navigate("Lancamentos");
      } catch {
        Alert.alert("Lançamentos", "Tela de lançamentos ainda não foi implementada.");
      }
    } else {
      Alert.alert("Lançamentos", "Tela de lançamentos ainda não foi implementada.");
    }
  };

  // ===== UI =====
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

 

  // ===== Cartão de livro — versão premium (botões ao lado da capa)
  CartaoLivro = () => {
    const { livro } = this.state;
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
            {/* capa */}
            <View style={estilos.capaWrap}>
              <View style={estilos.capaHalo} />
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

            {/* infos */}
            <View style={estilos.infoCol}>

              {!!livro?.genero && (
                <View style={estilos.chipLinha}>
                  <View style={estilos.chipInfo}>
                    <MaterialCommunityIcons name="tag-outline" size={14} color={CORES.azul500} />
                    <Text style={estilos.chipTxt}>{livro.genero}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* ações ao lado da capa */}
            <View style={estilos.acoesCol}>
              <Pressable
                onPress={() => Alert.alert("Leitura", "Marcar como lida (implementar lógica)")}
                style={[estilos.btnPill, estilos.btnLidoOutline]}
              >
                <MaterialCommunityIcons name="check-bold" size={16} color={CORES.lidoBorda} />
                <Text style={estilos.btnPillTxtLido}>Lido</Text>
              </Pressable>

              <Pressable
                onPress={() => Alert.alert("Leitura", "Desistir da leitura (implementar lógica)")}
                style={[estilos.btnPill, estilos.btnDesistidoOutline]}
              >
                <MaterialCommunityIcons name="close" size={16} color={CORES.desistidoBorda} />
                <Text style={estilos.btnPillTxtDesistido}>Desistido</Text>
              </Pressable>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  CartaoListaDesejos = () => {
    const { listaDesejos } = this.state;
    const vazia = !listaDesejos || listaDesejos.length === 0;
    return (
      <View style={[estilos.cartao, estilos.cartaoListaDesejos]}>
        <View style={estilos.listaDesejosTopo}>
          <Text style={estilos.listaDesejosTitulo}>Lista de desejos</Text>
          <Pressable
            onPress={() =>
              Alert.alert("Lista de desejos", "Adicionar item — em breve.")
            }
            style={estilos.botaoFantasma}
          >
            <MaterialCommunityIcons
              name="heart-plus"
              size={18}
              color={CORES.azul500}
            />
            <Text style={estilos.textoBotaoFantasma}>Adicionar</Text>
          </Pressable>
        </View>

        {vazia ? (
          <>
            <Text style={estilos.listaDesejosMensagem}>
              Sua lista de desejos está vazia no momento.
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={estilos.listaDesejosLinha}
            >
              <View style={[estilos.itemDesejo, estilos.itemDesejoPlaceholder]}>
                <View style={estilos.capaDesejoPlaceholder}>
                  <MaterialCommunityIcons
                    name="book-outline"
                    size={30}
                    color={CORES.azul300}
                  />
                </View>
                <Text numberOfLines={1} style={estilos.tituloDesejoPlaceholder}>
                  Nome do livro
                </Text>
                <Text numberOfLines={1} style={estilos.autorDesejoPlaceholder}>
                  Autor
                </Text>
              </View>

              <View style={[estilos.itemDesejo, estilos.itemDesejoPlaceholder]}>
                <View style={estilos.capaDesejoPlaceholder}>
                  <MaterialCommunityIcons
                    name="book-outline"
                    size={30}
                    color={CORES.azul300}
                  />
                </View>
                <Text numberOfLines={1} style={estilos.tituloDesejoPlaceholder}>
                  Nome do livro
                </Text>
                <Text numberOfLines={1} style={estilos.autorDesejoPlaceholder}>
                  Autor
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  Alert.alert(
                    "Lista de desejos",
                    "Em breve você poderá adicionar um livro."
                  )
                }
                style={[estilos.itemDesejo, estilos.itemDesejoAdd]}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={26}
                  color={CORES.textoSuave}
                />
                <Text style={estilos.itemDesejoAddTxt}>Adicionar</Text>
              </Pressable>
            </ScrollView>
          </>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={estilos.listaDesejosLinha}
          >
            {listaDesejos.map((it) => (
              <View key={it.id} style={estilos.itemDesejo}>
                <View style={estilos.capaDesejoPlaceholder}>
                  <MaterialCommunityIcons
                    name="book-outline"
                    size={30}
                    color={CORES.azul300}
                  />
                </View>
                <Text numberOfLines={1} style={estilos.tituloDesejo}>
                  {it.titulo || "Sem título"}
                </Text>
                {!!it.autor && (
                  <Text numberOfLines={1} style={estilos.autorDesejo}>
                    {it.autor}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  CartaoBiblioteca = () => {
    return (
      <View style={[estilos.cartao, estilos.cartaoBiblioteca]}>
        <Text style={estilos.bibliotecaTitulo}>Sua biblioteca</Text>
        <View style={estilos.bibliotecaBotoesLinha}>
          <Pressable
            onPress={() => this.irParaBiblioteca("favoritos")}
            style={[estilos.chipBiblioteca, estilos.chipFavoritos]}
          >
            <MaterialCommunityIcons name="heart" size={16} />
            <Text style={estilos.textoChipBiblioteca}>Favoritos</Text>
          </Pressable>
          <Pressable
            onPress={() => this.irParaBiblioteca("lidos")}
            style={[estilos.chipBiblioteca, estilos.chipLidos]}
          >
            <MaterialCommunityIcons name="check-circle" size={16} />
            <Text style={estilos.textoChipBiblioteca}>Lidos</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  SecaoNovidades = () => {
    const LANCAMENTOS = [
      { id: "l1", titulo: "A Cidade de Bronze", data: "2025-10-18" },
      { id: "l2", titulo: "O Problema dos 3 Corpos (edição comentada)", data: "2025-10-22" },
      { id: "l3", titulo: "A Biblioteca da Meia-Noite", data: "2025-11-02" },
    ];
    const EM_ALTA = [
      { id: "h1", titulo: "Torto Arado" },
      { id: "h2", titulo: "É Assim que Acaba" },
      { id: "h3", titulo: "Verity" },
      { id: "h4", titulo: "O Homem de Giz" },
    ];

    return (
      <View style={[estilos.cartao, estilos.cartaoNovidadesTexto]}>
        <View style={estilos.linhaTituloNovidades}>
          <MaterialCommunityIcons name="new-box" size={18} color={CORES.azul500} />
          <Text style={estilos.novidadesTitulo}>Novidades</Text>
        </View>

        <View style={estilos.blocoNovidades}>
          <View style={estilos.linhaBlocoTopo}>
            <Text style={estilos.subtituloBloco}>Lançamentos</Text>
            <Pressable onPress={this.irParaLancamentos} style={estilos.verTodosBotao}>
              <Text style={estilos.verTodosTexto}>Ver todos</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color={CORES.azul500} />
            </Pressable>
          </View>

          <View style={estilos.listaTexto}>
            {LANCAMENTOS.map((it) => (
              <Pressable
                key={it.id}
                android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                onPress={() =>
                  Alert.alert(
                    "Lançamento",
                    `${it.titulo} — ${this.formatarData(it.data)}`
                  )
                }
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <View style={estilos.linhaLancamento}>
                  <View style={estilos.pontoLista} />
                  <Text style={estilos.itemLancamentoTitulo} numberOfLines={1}>
                    {it.titulo}
                  </Text>
                  <View style={estilos.seloData}>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={12}
                      color={CORES.azul500}
                    />
                    <Text style={estilos.textoSeloData}>
                      {this.formatarData(it.data)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={estilos.divisorNovidades} />

        <View style={estilos.blocoNovidades}>
          <Text style={estilos.subtituloBloco}>Em alta</Text>
          <View style={estilos.listaTexto}>
            {EM_ALTA.map((it, idx) => (
              <Pressable
                key={it.id}
                android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                onPress={() => Alert.alert("Em alta", `${idx + 1}. ${it.titulo}`)}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <View style={estilos.linhaAlta}>
                  <View style={estilos.seloNumero}>
                    <Text style={estilos.textoSeloNumero}>{idx + 1}</Text>
                  </View>
                  <Text style={estilos.itemAltaTitulo} numberOfLines={1}>
                    {it.titulo}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    );
  };

  render() {
    const { carregando, livro } = this.state;

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

              {/* Cartão Vazio SEMPRE visível */}
              <this.CartaoVazio />

              {/* Se houver livro, mostra também o card do livro */}
              {!!livro && (
                <>
                  <View style={{ height: 10 }} />
                  <this.CartaoLivro />
                </>
              )}

              <View style={{ height: 12 }} />
              <this.CartaoListaDesejos />

              <View style={{ height: 14 }} />
              <this.CartaoBiblioteca />

              <View style={{ height: 16 }} />
              <this.SecaoNovidades />

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

  // Cabeçalho
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

  // Cartão base
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

  // Cartão Vazio
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

  // ========= Cartão de leitura — versão premium =========
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

  tituloLivro: {
    color: CORES.texto,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.2,
    marginTop: 2,
  },
  autorLivro: {
    color: CORES.textoSuave,
    fontSize: 14,
    marginTop: 2,
    marginBottom: 30,
  },

  livroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  // Capa com halo/borda
  capaWrap: {
    width: 116,
    height: 168,
    alignItems: "center",
    justifyContent: "center",
  },
  capaHalo: {
    position: "absolute",
    marginTop: 40,
    marginRight: 20,
    width: 250,
    height: 250,
    borderRadius: 190,
    backgroundColor: "rgba(7, 255, 251, 0.29)",
    ...(Platform.OS === "web" ? { filter: "blur(18px)" } : {}),
  },
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

  infoCol: {
    flex: 1,
    paddingRight: 8,
    minHeight: 168,
    justifyContent: "center",
  },
  metaLivroPrint: { color: CORES.textoSuave, fontSize: 12 },
  metaLivroPrint2: { color: CORES.textoSuave, marginTop: 2, fontSize: 12 },

 

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

  // Ações ao lado da capa (vertical)
  acoesCol: {
    width: 112,
    alignItems: "stretch",
    justifyContent: "center",
    gap: 10,
  },
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
  btnLidoOutline: { borderColor: CORES.lidoBorda, backgroundColor: "rgba(134,239,172,0.10)" },
  btnDesistidoOutline: { borderColor: CORES.desistidoBorda, backgroundColor: "rgba(252,165,165,0.10)" },
  btnPillTxtLido: { color: CORES.lidoBorda, fontWeight: "900" },
  btnPillTxtDesistido: { color: CORES.desistidoBorda, fontWeight: "900" },

  // ====== (resto dos cartões) ======
  // Lista de desejos
  cartaoListaDesejos: { marginTop: 14, marginBottom: 10 },
  listaDesejosTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  listaDesejosTitulo: { color: CORES.texto, fontSize: 20, fontWeight: "800" },
  listaDesejosMensagem: { color: CORES.textoSuave, marginBottom: 6 },
  botaoFantasma: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(3,139,137,0.08)",
    borderRadius: 12,
  },
  textoBotaoFantasma: { color: CORES.azul500, fontWeight: "800" },
  listaDesejosLinha: { gap: 12, paddingRight: 4 },
  itemDesejo: {
    width: 130,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 14,
    backgroundColor: CORES.branco,
    padding: 10,
    shadowColor: CORES.sombra,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  itemDesejoPlaceholder: { alignItems: "flex-start", justifyContent: "flex-start" },
  capaDesejoPlaceholder: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#F1F2F4",
    alignItems: "center",
    justifyContent: "center",
  },
  tituloDesejoPlaceholder: { color: CORES.azul300, fontWeight: "700" },
  autorDesejoPlaceholder: { color: CORES.azul300, fontSize: 12, marginTop: 2 },
  capaDesejo: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#F1F2F4",
  },
  tituloDesejo: { color: CORES.texto, fontWeight: "800" },
  autorDesejo: { color: CORES.textoSuave, fontSize: 12, marginTop: 2 },
  itemDesejoAdd: { alignItems: "center", justifyContent: "center", gap: 8 },
  itemDesejoAddTxt: { color: CORES.textoSuave, fontWeight: "700" },

  // Biblioteca
  cartaoBiblioteca: { paddingVertical: 14, marginTop: 12 },
  bibliotecaTitulo: {
    color: CORES.texto,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },
  bibliotecaBotoesLinha: { flexDirection: "row", alignItems: "center", gap: 10 },
  chipBiblioteca: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(3,139,137,0.08)",
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  textoChipBiblioteca: { color: CORES.azul500, fontWeight: "800" },
  chipFavoritos: {},
  chipLidos: {},

  // Novidades
  cartaoNovidadesTexto: {
    marginTop: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "rgba(3,139,137,0.35)",
  },
  linhaTituloNovidades: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  novidadesTitulo: { color: CORES.texto, fontSize: 20, fontWeight: "800" },
  blocoNovidades: { marginTop: 12 },
  linhaBlocoTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  subtituloBloco: {
    color: CORES.texto,
    fontSize: 16,
    fontWeight: "800",
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    backgroundColor: "rgba(3,139,137,0.08)",
    borderRadius: 8,
  },
  verTodosBotao: { flexDirection: "row", alignItems: "center", gap: 4 },
  verTodosTexto: { color: CORES.azul500, fontWeight: "900" },
  listaTexto: { gap: 10 },
  linhaLancamento: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  pontoLista: { width: 8, height: 8, borderRadius: 999, backgroundColor: CORES.azul500 },
  itemLancamentoTitulo: {
    flex: 1,
    color: CORES.textoSuave,
    fontSize: 14,
    fontWeight: "600",
  },
  seloData: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(3,139,137,0.10)",
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  textoSeloData: { color: CORES.azul500, fontWeight: "800", fontSize: 12 },

  divisorNovidades: {
    height: 1,
    backgroundColor: CORES.borda,
    marginTop: 18,
    marginBottom: 12,
  },
  linhaAlta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  seloNumero: {
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(3,139,137,0.10)",
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  textoSeloNumero: { color: CORES.azul500, fontWeight: "900", fontSize: 12 },
});
