import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const CORES = {
  gradientStart: "#d6fcf9ff",
  gradientEnd: "#6ef0eaff",
  azul500: "#038b89ff",
  azul300: "#b3b3b3ff",
  texto: "#2C3E50",
  textoSuave: "#58627A",
  branco: "#ffffff",
  borda: "#E6E3DF",
  sombra: "#000000",
};

const LIVROS = [
  {
    id: "o-amanhecer-na-colheita",
    titulo: "O Amanhecer na Colheita",
    autor: "Suzanne Collins",
    genero: "Distopia · YA",
    sinopse: "Velhas tradições, novos segredos e um destino que muda ao nascer do sol.",
    capa: require("../assets/livros/o-amanhecer-na-colheita.jpg"),
  },
  {
    id: "jogos-vorazes",
    titulo: "Jogos Vorazes",
    autor: "Suzanne Collins",
    genero: "Distopia · YA",
    sinopse: "Katniss entra numa luta televisiva pela sobrevivência e pela liberdade.",
    capa: require("../assets/livros/jogos-vorazes.jpg"),
  },
  {
    id: "jogos-vorazes-em-chamas",
    titulo: "Jogos Vorazes: Em Chamas",
    autor: "Suzanne Collins",
    genero: "Distopia · YA",
    sinopse: "A faísca da rebelião cresce enquanto o perigo se aproxima.",
    capa: require("../assets/livros/jogos-vorazes-em-chamas.jpg"),
  },
  {
    id: "jogos-vorazes-a-esperanca",
    titulo: "Jogos Vorazes: A Esperança",
    autor: "Suzanne Collins",
    genero: "Distopia · YA",
    sinopse: "O fim do regime se aproxima e escolhas custam caro.",
    capa: require("../assets/livros/jogos-vorazes-a-esperanca.jpg"),
  },
  {
    id: "como-nos-filmes",
    titulo: "Como nos Filmes",
    autor: "Lynn Painter",
    genero: "Romance contemporâneo",
    sinopse: "Quando a vida real resolve seguir um roteiro inesquecível.",
    capa: require("../assets/livros/como-nos-filmes.jpg"),
  },
  {
    id: "nao-e-como-nos-filmes",
    titulo: "Não é como nos Filmes",
    autor: "Lynn Painter",
    genero: "Romance contemporâneo",
    sinopse: "Nem todo clichê resiste à realidade — e tudo bem.",
    capa: require("../assets/livros/nao-e-como-nos-filmes.jpg"),
  },
  {
    id: "a-empregada",
    titulo: "A Empregada",
    autor: "Freida McFadden",
    genero: "Thriller psicológico",
    sinopse: "Uma casa perfeita esconde segredos que podem ser fatais.",
    capa: require("../assets/livros/a-empregada.jpg"),
  },
  {
    id: "a-empregada-esta-de-olho",
    titulo: "A Empregada Está de Olho",
    autor: "Freida McFadden",
    genero: "Thriller psicológico",
    sinopse: "Velhos fantasmas retornam e nada passa despercebido.",
    capa: require("../assets/livros/a-empregada-esta-de-olho.jpg"),
  },
  {
    id: "o-segredo-da-empregada",
    titulo: "O Segredo da Empregada",
    autor: "Freida McFadden",
    genero: "Thriller psicológico",
    sinopse: "Uma verdade enterrada ameaça vir à tona.",
    capa: require("../assets/livros/o-segredo-da-empregada.jpg"),
  },
  {
    id: "o-massacre-da-mansao-hope",
    titulo: "O Massacre da Mansão Hope",
    autor: "Riley Sager",
    genero: "Suspense · Mistério",
    sinopse: "Um crime antigo, convidados suspeitos e pistas por toda parte.",
    capa: require("../assets/livros/o-massacre-da-mansao-hope.jpg"),
  },
  {
    id: "asas-reluzentes",
    titulo: "Asas Reluzentes",
    autor: "Allison Saft",
    genero: "Fantasia · Romantasy",
    sinopse: "Entre luz e sombra, uma guerreira encontra seu próprio voo.",
    capa: require("../assets/livros/asas-reluzentes.jpg"),
  },
  {
    id: "como-sobreviver-a-um-filme-de-terror",
    titulo: "Como sobreviver a um filme de terror",
    autor: "Scarlett Dunmore",
    genero: "Terror · Comédia",
    sinopse: "As regras não escritas para não ser a próxima vítima.",
    capa: require("../assets/livros/como-sobreviver-a-um-filme-de-terror.jpg"),
  },
];

export default class AdicionarLivro extends React.Component {
  state = { busca: "" };

  abrirDetalhe = (item) => {
    const pode = !!this.props.navigation?.navigate;
    if (pode) {
      try {
        this.props.navigation.navigate("DetalheLivro", { livro: item });
      } catch {
        Alert.alert(item.titulo, "Tela de detalhes será feita depois.");
      }
    } else {
      Alert.alert(item.titulo, "Tela de detalhes será feita depois.");
    }
  };

  filtrar = () => {
    const q = this.state.busca.trim().toLowerCase();
    if (!q) return LIVROS;
    return LIVROS.filter((l) =>
      `${l.titulo} ${l.autor} ${l.genero}`.toLowerCase().includes(q)
    );
  };

  renderItem = ({ item }) => (
    <Pressable onPress={() => this.abrirDetalhe(item)} style={estilos.item}>
      <Image source={item.capa} style={estilos.itemCapa} />
      <View style={{ flex: 1 }}>
        <Text style={estilos.itemTitulo} numberOfLines={1}>
          {item.titulo}
        </Text>
        <Text style={estilos.itemAutor} numberOfLines={1}>
          {item.autor}
        </Text>

        <View style={estilos.linhaChips}>
          <View style={estilos.chipGenero}>
            <MaterialCommunityIcons
              name="tag-outline"
              size={12}
              color={CORES.azul500}
            />
            <Text style={estilos.chipGeneroTxt} numberOfLines={1}>
              {item.genero}
            </Text>
          </View>
        </View>

        <Text style={estilos.itemSinopse} numberOfLines={2}>
          {item.sinopse}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color={CORES.textoSuave}
      />
    </Pressable>
  );

  render() {
    const dados = this.filtrar();

    return (
      <LinearGradient
        colors={[CORES.gradientStart, CORES.gradientEnd]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <View style={estilos.conteudo}>
      
              <Pressable
                style={estilos.botaoVoltar}
                onPress={() => this.props.navigation.navigate("Home")}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={22}
                  color={CORES.azul500}
                />
                <Text style={estilos.txtVoltar}>Voltar</Text>
              </Pressable>

              <Text style={estilos.tituloPagina}>Adicionar livro</Text>

              <View style={estilos.campoBuscaWrap}>
                <MaterialCommunityIcons
                  name="magnify"
                  size={20}
                  color={CORES.textoSuave}
                />
                <TextInput
                  style={estilos.campoBusca}
                  placeholder="Buscar por título, autor ou gênero"
                  placeholderTextColor={CORES.azul300}
                  value={this.state.busca}
                  onChangeText={(t) => this.setState({ busca: t })}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {this.state.busca.length > 0 && (
                  <Pressable
                    onPress={() => this.setState({ busca: "" })}
                    hitSlop={12}
                  >
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={18}
                      color={CORES.azul300}
                    />
                  </Pressable>
                )}
              </View>

              <FlatList
                data={dados}
                keyExtractor={(it) => it.id}
                renderItem={this.renderItem}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                contentContainerStyle={{ paddingBottom: 18 }}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    );
  }
}

const LARGURA_MAX = 560;

const estilos = StyleSheet.create({
  conteudo: {
    flex: 1,
    padding: 18,
    alignSelf: "center",
    width: "100%",
    maxWidth: LARGURA_MAX,
  },
  botaoVoltar: {
    flexDirection: "row",     
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",    
    marginTop: 35,
  },
  txtVoltar: {
    color: CORES.azul500,
    fontSize: 15,
    fontWeight: "700",
  },
  tituloPagina: {
    color: CORES.texto,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
    paddingTop: 6,
  },
  campoBuscaWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: CORES.branco,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CORES.borda,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    shadowColor: CORES.sombra,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  campoBusca: { flex: 1, color: CORES.texto, fontSize: 14 },
  item: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: CORES.branco,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
    padding: 12,
    alignItems: "center",
    shadowColor: CORES.sombra,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  itemCapa: {
    width: 60,
    height: 90,
    borderRadius: 8,
    marginRight: 2,
    backgroundColor: "#F1F2F4",
  },
  itemTitulo: { color: CORES.texto, fontWeight: "800", fontSize: 15 },
  itemAutor: { color: CORES.textoSuave, marginTop: 2, marginBottom: 6 },
  linhaChips: { flexDirection: "row", gap: 8, marginBottom: 6 },
  chipGenero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(3,139,137,0.08)",
    borderWidth: 1,
    borderColor: CORES.borda,
    alignSelf: "flex-start",
  },
  chipGeneroTxt: { color: CORES.azul500, fontWeight: "800", fontSize: 12 },
  itemSinopse: { color: CORES.textoSuave, fontSize: 12 },
});
