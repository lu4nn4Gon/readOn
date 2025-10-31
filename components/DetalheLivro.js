import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const h = React.createElement;

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
};

const KEY_LISTA = "@readon:lista_desejos";
const KEY_AVALIACOES = (id) => `@readon:avaliacoes:${id}`;
const KEY_LEITURA_ATUAL = "@readon:leitura_atual";
const KEY_CURRENT_BOOK = "@readon:current_book"; 

const ADAPTACOES = {
  "jogos-vorazes": {
    titulo: "The Hunger Games (2012)",
    ondeVer: ["Prime Video (aluguel/compra)", "Apple TV (aluguel/compra)"],
  },
  "jogos-vorazes-em-chamas": {
    titulo: "Catching Fire (2013)",
    ondeVer: ["Prime Video (aluguel/compra)"],
  },
  "jogos-vorazes-a-esperanca": {
    titulo: "Mockingjay (2014/2015)",
    ondeVer: ["Prime Video (aluguel/compra)"],
  },
};

function Stars({ value = 0, size = 18 }) {
  const rounded = Math.round(value * 2) / 2;
  const full = Math.floor(rounded);
  const half = rounded - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  const children = [];
  for (let i = 0; i < full; i++) {
    children.push(h(MaterialCommunityIcons, { key: "f" + i, name: "star", size, color: "#f5c518" }));
  }
  if (half) children.push(h(MaterialCommunityIcons, { key: "half", name: "star-half-full", size, color: "#f5c518" }));
  for (let i = 0; i < empty; i++) {
    children.push(h(MaterialCommunityIcons, { key: "e" + i, name: "star-outline", size, color: "#f5c518" }));
  }
  return h(View, { style: { flexDirection: "row", alignItems: "center", gap: 2 } }, children);
}

export default class DetalheLivro extends React.Component {
  state = {
    emLista: false,
    avaliacoes: [], 
    notaMedia: 0,
    modalAvaliar: false,
    notaTemp: "5",
    comentarioTemp: "",
  };

  componentDidMount() {
    this.carregar();
  }

  carregar = async () => {
    const livro = this.props.route?.params?.livro;
    if (!livro?.id) return;

    const listaRaw = (await AsyncStorage.getItem(KEY_LISTA)) || "[]";
    const lista = JSON.parse(listaRaw);

    const avRaw = (await AsyncStorage.getItem(KEY_AVALIACOES(livro.id))) || "[]";
    const avaliacoes = JSON.parse(avRaw);

    this.setState(
      {
        emLista: lista.includes(livro.id),
        avaliacoes,
      },
      this.recalcularMedia
    );
  };

  salvarColecao = async (key, arr) => {
    await AsyncStorage.setItem(key, JSON.stringify(arr));
  };

  toggleLista = async () => {
    const livro = this.props.route?.params?.livro;
    const listaRaw = (await AsyncStorage.getItem(KEY_LISTA)) || "[]";
    let lista = JSON.parse(listaRaw);
    const idx = lista.indexOf(livro.id);
    if (idx >= 0) lista.splice(idx, 1);
    else lista.push(livro.id);
    await this.salvarColecao(KEY_LISTA, lista);
    this.setState({ emLista: lista.includes(livro.id) });
  };

  setLeituraAtual = async () => {
    const livro = this.props.route?.params?.livro;
    const payload = {
      id: livro.id,
      titulo: livro.titulo,
      autor: livro.autor || "",
      capa: typeof livro.capa === "string" ? livro.capa : (livro.capa?.uri ? livro.capa.uri : null),
      inicioEm: new Date().toISOString(), 
      progresso: 0,
    };
    await AsyncStorage.setItem(KEY_LEITURA_ATUAL, JSON.stringify(payload));
    await AsyncStorage.setItem(KEY_CURRENT_BOOK, JSON.stringify(payload));
    Alert.alert("Leitura atual", "Este livro foi definido como sua leitura atual.");
  };

  abrirModalAvaliar = () => this.setState({ modalAvaliar: true, notaTemp: "5", comentarioTemp: "" });
  fecharModalAvaliar = () => this.setState({ modalAvaliar: false });

  salvarAvaliacao = async () => {
    const livro = this.props.route?.params?.livro;
    const nota = Number(this.state.notaTemp);
    if (isNaN(nota) || nota < 0 || nota > 5) {
      Alert.alert("Nota inválida", "Informe um número entre 0 e 5.");
      return;
    }
    const novo = {
      usuario: "Você",
      nota,
      comentario: (this.state.comentarioTemp || "").trim(),
      data: new Date().toISOString(),
    };
    const atual = [...this.state.avaliacoes, novo];
    await AsyncStorage.setItem(KEY_AVALIACOES(livro.id), JSON.stringify(atual));
    this.setState({ avaliacoes: atual, modalAvaliar: false }, this.recalcularMedia);
  };

  recalcularMedia = () => {
    const { avaliacoes } = this.state;
    if (!avaliacoes.length) return this.setState({ notaMedia: 0 });
    const soma = avaliacoes.reduce((acc, it) => acc + Number(it.nota || 0), 0);
    this.setState({ notaMedia: soma / avaliacoes.length });
  };

  renderBotaoAdaptacao = (livro) => {
    const info = ADAPTACOES[livro.id] || livro.adaptacao;
    if (!info) return null;
    return h(
      Pressable,
      {
        onPress: () => {
          const locais = (info.ondeVer || []).join(" · ");
          Alert.alert("Adaptação", `${info.titulo}\n\nOnde ver: ${locais || "—"}`);
        },
        style: [estilos.botaoAdaptacaoDark],
      },
      h(Text, { style: estilos.textoBotaoAdaptacaoDark }, "🎬 Ver adaptação e onde ver")
    );
  };

  renderItemAvaliacao = ({ item }) =>
    h(
      View,
      { style: estilos.itemAvaliacao },
      h(
        View,
        { style: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" } },
        h(Text, { style: estilos.avAutor }, item.usuario),
        h(Stars, { value: item.nota, size: 16 })
      ),
      item.comentario ? h(Text, { style: estilos.avTexto }, item.comentario) : null,
      h(Text, { style: estilos.avQuando }, new Date(item.data).toLocaleDateString())
    );

  render() {
    const livro = this.props.route?.params?.livro;
    const { emLista, notaMedia, avaliacoes, modalAvaliar, notaTemp, comentarioTemp } = this.state;
    if (!livro) return null;


    const header = h(
      View,
      { style: estilos.header },
      h(
        View,
        { style: estilos.capaWrap },
        livro.capa
          ? h(Image, {
              source: typeof livro.capa === "string" ? { uri: livro.capa } : livro.capa,
              style: estilos.capa,
            })
          : h(
              View,
              { style: [estilos.capa, { alignItems: "center", justifyContent: "center", backgroundColor: "#F1F2F4" }] },
              h(MaterialCommunityIcons, { name: "book-open-page-variant", size: 48, color: CORES.azul300 })
            )
      ),
      h(
        View,
        { style: { flex: 1 } },
        h(Text, { style: estilos.titulo }, livro.titulo),
        livro.autor ? h(Text, { style: estilos.autor }, livro.autor) : null,
        h(
          View,
          { style: estilos.notaLinha },
          h(Stars, { value: notaMedia }),
          h(Text, { style: estilos.notaTexto }, avaliacoes.length ? `${notaMedia.toFixed(1)} (${avaliacoes.length})` : "Sem avaliações")
        )
      )
    );


    const sinopseBox = livro.sinopse
      ? h(
          View,
          { style: estilos.caixa },
          h(Text, { style: estilos.secaoTitulo }, "Sinopse"),
          h(Text, { style: estilos.sinopse }, livro.sinopse)
        )
      : null;

    const adapt = this.renderBotaoAdaptacao(livro);

    const avaliacoesSec = h(
      View,
      { style: estilos.caixa },
      h(Text, { style: estilos.secaoTitulo }, "Avaliações"),
      avaliacoes.length
        ? h(FlatList, {
            data: avaliacoes,
            keyExtractor: (_, i) => "av-" + i,
            renderItem: this.renderItemAvaliacao,
            ItemSeparatorComponent: () => h(View, { style: { height: 8 } }),
            scrollEnabled: false,
          })
        : h(Text, { style: estilos.vazio }, "Ainda não há avaliações.")
    );


    const botaoLeituraAtual = h(
      Pressable,
      { onPress: this.setLeituraAtual, style: estilos.botaoGrandePrim },
      h(MaterialCommunityIcons, { name: "book-open-outline", size: 20, color: CORES.branco }),
      h(Text, { style: estilos.textoBotaoGrandePrim }, "Adicione leitura atual")
    );

    const acoesQuadradosBottom = h(
      View,
      { style: estilos.quadradosRow },
      h(
        Pressable,
        { onPress: this.abrirModalAvaliar, style: estilos.quadradoPrim },
        h(MaterialCommunityIcons, { name: "star-plus-outline", size: 26, color: CORES.branco }),
        h(Text, { style: estilos.quadradoPrimTxt }, "Avaliar")
      ),
      h(
        Pressable,
        { onPress: this.toggleLista, style: estilos.quadradoSec },
        h(MaterialCommunityIcons, {
          name: emLista ? "playlist-check" : "playlist-plus",
          size: 26,
          color: CORES.azul500,
        }),
        h(Text, { style: estilos.quadradoSecTxt }, emLista ? "Na lista" : "Adicionar à lista")
      )
    );


    const modal = h(
      Modal,
      { visible: modalAvaliar, transparent: true, animationType: "fade" },
      h(
        View,
        { style: estilos.modalOverlay },
        h(
          View,
          { style: estilos.modalCard },
          h(Text, { style: estilos.modalTitulo }, "Sua avaliação"),
          h(
            View,
            { style: estilos.campoLinha },
            h(Text, { style: estilos.rotulo }, "Nota (0–5)"),
            h(TextInput, {
              style: estilos.campoTexto,
              keyboardType: "decimal-pad",
              value: notaTemp,
              onChangeText: (v) => this.setState({ notaTemp: v }),
              placeholder: "5",
            })
          ),
          h(
            View,
            { style: estilos.campoLinha },
            h(Text, { style: estilos.rotulo }, "Comentário"),
            h(TextInput, {
              style: [estilos.campoTexto, { height: 90, textAlignVertical: "top" }],
              multiline: true,
              value: comentarioTemp,
              onChangeText: (v) => this.setState({ comentarioTemp: v }),
              placeholder: "O que achou do livro?",
            })
          ),
          h(
            View,
            { style: { flexDirection: "row", justifyContent: "flex-end", gap: 10 } },
            h(Pressable, { onPress: this.fecharModalAvaliar, style: estilos.botaoLinha }, h(Text, { style: estilos.botaoLinhaTxt }, "Cancelar")),
            h(
              Pressable,
              { onPress: this.salvarAvaliacao, style: [estilos.botaoLinha, estilos.botaoLinhaPrim] },
              h(Text, { style: [estilos.botaoLinhaTxt, { color: CORES.branco }] }, "Salvar")
            )
          )
        )
      )
    );


    return h(
      LinearGradient,
      { colors: [CORES.gradientStart, CORES.gradientEnd], style: { flex: 1 } },
      h(
        SafeAreaView,
        { style: { flex: 1 }, edges: ["bottom"] },
        h(
          KeyboardAvoidingView,
          { behavior: Platform.OS === "ios" ? "padding" : undefined, style: { flex: 1 } },
          h(
            ScrollView,
            { contentContainerStyle: estilos.conteudo },
            header,
            sinopseBox,
            adapt,
            avaliacoesSec,
            botaoLeituraAtual,
            acoesQuadradosBottom,
            modal
          )
        )
      )
    );
  }
}

const LARGURA_MAX = 560;

const estilos = StyleSheet.create({
  conteudo: {
    padding: 18,
    paddingBottom: 28,
    marginTop: 40,
    flexGrow: 1,
    alignItems: "center",
  },

  header: {
    width: "100%",
    maxWidth: LARGURA_MAX,
    backgroundColor: CORES.branco,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    flexDirection: "row",
    gap: 14,
    shadowColor: CORES.sombra,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  capaWrap: { width: 110, height: 160, borderRadius: 12, overflow: "hidden", backgroundColor: "#F1F2F4" },
  capa: { width: "100%", height: "100%", resizeMode: "cover" },
  titulo: { color: CORES.texto, fontSize: 20, fontWeight: "800" },
  autor: { color: CORES.textoSuave, marginTop: 4 },
  notaLinha: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  notaTexto: { color: CORES.textoSuave, fontWeight: "700" },

  caixa: {
    width: "100%",
    maxWidth: LARGURA_MAX,
    backgroundColor: CORES.branco,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    shadowColor: CORES.sombra,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  secaoTitulo: { color: CORES.texto, fontSize: 16, fontWeight: "800", marginBottom: 8 },
  sinopse: { color: CORES.textoSuave, lineHeight: 20 },


  botaoGrandePrim: {
    width: "100%",
    maxWidth: LARGURA_MAX,
    marginTop: 12,
    backgroundColor: CORES.azul500,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: CORES.sombra,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  textoBotaoGrandePrim: {
    color: CORES.branco,
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.2,
  },

  
  quadradosRow: {
    width: "100%",
    maxWidth: LARGURA_MAX,
    marginTop: 12,
    flexDirection: "row",
    gap: 12,
  },
  quadradoPrim: {
    flex: 1,
    height: 100, 
    backgroundColor: CORES.azul500,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: CORES.sombra,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  quadradoPrimTxt: { color: CORES.branco, fontWeight: "900", fontSize: 15 },

  quadradoSec: {
    flex: 1,
    height: 100, 
    backgroundColor: "rgba(3,139,137,0.10)",
    borderWidth: 2,
    borderColor: CORES.azul500,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  quadradoSecTxt: { color: CORES.azul500, fontWeight: "900", fontSize: 15 },

  
  botaoAdaptacaoDark: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: CORES.cinza,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CORES.cinza,
    alignSelf: "flex-start",
  },
  textoBotaoAdaptacaoDark: { color: CORES.branco, fontWeight: "900" },

  
  itemAvaliacao: {
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 12,
    padding: 10,
  },
  avAutor: { color: CORES.texto, fontWeight: "800" },
  avTexto: { color: CORES.textoSuave, marginTop: 4 },
  avQuando: { color: CORES.azul300, marginTop: 6, fontSize: 12 },

 
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: CORES.branco,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  modalTitulo: { color: CORES.texto, fontWeight: "800", fontSize: 18, marginBottom: 10 },
  campoLinha: { marginBottom: 10 },
  rotulo: { color: CORES.texto, fontWeight: "700", marginBottom: 4 },
  campoTexto: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: CORES.texto,
  },
  botaoLinha: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CORES.borda,
    backgroundColor: "#fff",
  },
  botaoLinhaPrim: { backgroundColor: CORES.azul500, borderColor: CORES.azul500 },
  botaoLinhaTxt: { color: CORES.texto, fontWeight: "800" },

  vazio: { color: CORES.textoSuave },
});
