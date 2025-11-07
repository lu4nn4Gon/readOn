import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  cinza: "#302f2fff",
  sombra: "#000000",
};

const SINOPSES_LONGAS = {
  "o-amanhecer-na-colheita":
    "Em meio a tradições antigas de uma comunidade isolada, uma jovem descobre segredos que há muito sustentam o poder local. Conforme o ritual da colheita se aproxima, alianças são testadas e a linha entre dever e liberdade se desfaz. O passado de sua família volta à tona em documentos esquecidos, revelando sacrifícios e pactos que moldaram o destino de todos. Para romper o ciclo, ela precisa escolher entre proteger quem ama ou expor a verdade, assumindo o preço dessa escolha. Ao nascer do sol, nada mais será como antes.",
  "jogos-vorazes":
    "Após anos de opressão, os distritos enviam jovens para um combate televisionado onde só um pode sobreviver. Katniss Everdeen se oferece no lugar da irmã e se vê jogada num tabuleiro onde habilidade, estratégia e imagem pública valem tanto quanto uma flecha certeira. Entre alianças improváveis e armadilhas cruéis, ela aprende a manipular o espetáculo para continuar viva. Mas sua atitude desafiadora planta uma semente de esperança que o poder central não pode controlar, e o público começa a enxergar além do show.",
  "jogos-vorazes-em-chamas":
    "Vencedora contra todas as probabilidades, Katniss retorna para casa apenas para descobrir que sua vitória acendeu um pavio. A turnê obrigatória pelos distritos revela sinais de rebelião, enquanto o governo trama uma edição especial dos jogos para silenciar símbolos. Forçada a voltar à arena, ela enfrenta um campo ainda mais letal, onde cada obstáculo tem dupla intenção. A sobrevivência passa a significar mais do que salvar a própria vida: trata-se de proteger um movimento que cresce nas sombras.",
  "jogos-vorazes-a-esperanca":
    "Com a propaganda e a guerra travadas em paralelo, Katniss lida com perdas, traumas e escolhas políticas que nem sempre oferecem saída limpa. Transformada em ícone, ela tenta recuperar a própria voz em meio a interesses que a usam como ferramenta. À medida que o cerco ao poder se fecha, a fronteira entre justiceiros e tiranos fica turva. O desfecho cobra um preço alto, obrigando-a a reconsiderar o que é vitória quando o mundo precisa ser reconstruído a partir dos cacos.",
  "como-nos-filmes":
    "Uma garota viciada em comédias românticas decide aplicar na vida real o que aprendeu nas telas. Entre encontros improvisados, mal-entendidos e diálogos afiados, ela descobre que o coração nem sempre segue um roteiro previsível. Quando uma amizade confortável começa a parecer algo mais, surgem medos e expectativas que nenhum clichê resolve sozinho. No fim, amar significa correr riscos fora de cena e aceitar que a autenticidade tem mais impacto do que qualquer final perfeito.",
  "nao-e-como-nos-filmes":
    "Determinada a provar que a vida real não precisa de trilhas sonoras para ser extraordinária, uma jovem confronta expectativas românticas e pressões familiares. O relacionamento que nasce aos poucos não cabe em rótulos fáceis nem em regras prontas. Entre conversas honestas, conflitos e recomeços, ela entende que maturidade amorosa é feita de escolhas pequenas, consistentes — e de abrir mão da performance para viver o que realmente importa.",
  "a-empregada":
    "Contratada por uma família aparentemente perfeita, uma funcionária doméstica percebe que a casa esconde rotinas estranhas e segredos perigosos. Observações inocentes se tornam pistas: portas trancadas, mensagens apagadas, versões que não batem. Quando um incidente transforma suspeitas em ameaça real, ela precisa decidir em quem confiar — inclusive em si mesma. A cada revelação, o jogo de aparências se desfaz, expondo relações de poder e culpas enterradas.",
  "a-empregada-esta-de-olho":
    "Depois de tentar recomeçar a vida, a protagonista é puxada de volta ao passado por acontecimentos que repetem velhos padrões. O que parecia coincidência vira um tabuleiro onde alguém observa seus passos. Novos personagens entram em cena com histórias convincentes demais para serem totalmente verdadeiras. Entre lembranças fragmentadas e provas duvidosas, ela precisa enxergar o que não foi visto antes para quebrar o ciclo que a prende.",
  "o-segredo-da-empregada":
    "Uma descoberta antiga ressurge, conectando pessoas e lugares que jamais deveriam se cruzar. Ao investigar, a protagonista percebe que pistas foram deixadas para conduzi-la a uma conclusão específica. Mas a verdade é mais ambígua do que parece, e cada passo adiante cobra um preço emocional. Quando tudo se encaixa, o que vem à tona muda não só o passado — redefine as possibilidades de futuro.",
  "o-massacre-da-mansao-hope":
    "Décadas após um crime brutal durante um encontro da alta sociedade, uma visitante retorna à mansão para montar o quebra-cabeça final. Entre depoimentos contraditórios, quartos selados e objetos fora de lugar, a lógica do mistério testa a sanidade de quem investiga. As versões sobreviventes do caso escondem interesses mesquinhos e culpas compartilhadas. A solução exige olhar para detalhes ignorados na noite do crime — e aceitar que a verdade nem sempre traz consolo.",
  "asas-reluzentes":
    "Em um reino dividido por magia e intrigas, uma guerreira marcada por escolhas difíceis precisa unir forças com alguém que jurou evitar. Conspiradores ameaçam a frágil paz enquanto criaturas antigas voltam a despertar. Entre treinamentos, missões e promessas quebradas, nasce uma ligação que desafia juramentos e lealdades. Para proteger quem ama, ela terá de confrontar a própria sombra — e descobrir que a luz mais forte nem sempre é a mais evidente.",
  "como-sobreviver-a-um-filme-de-terror":
    "Guiada por regras não escritas dos filmes de terror, uma protagonista tenta virar a mesa quando estranhos eventos começam a acontecer. Evitar porões, não se separar do grupo, desconfiar do timing perfeito — nada parece suficiente quando o medo tem humor ácido. Enquanto a contagem de sustos cresce, a sátira revela porque certos clichês persistem. Sobreviver exige rir do absurdo e, ao mesmo tempo, levar o perigo a sério.",
};

const KEY_LISTA = "@readon:lista_desejos";
const KEY_AVALIACOES = (id) => `@readon:avaliacoes:${id}`;

const SESSION_KEY = "@readon:session";
const keyUser = (uid, name) => `@readon:${name}:${uid}`;

async function getSessionUid() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return s?.email || s?.username || null;
  } catch {
    return null;
  }
}

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
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      {Array.from({ length: full }).map((_, i) => (
        <MaterialCommunityIcons key={`f${i}`} name="star" size={size} color="#f5c518" />
      ))}
      {half && <MaterialCommunityIcons key="half" name="star-half-full" size={size} color="#f5c518" />}
      {Array.from({ length: empty }).map((_, i) => (
        <MaterialCommunityIcons key={`e${i}`} name="star-outline" size={size} color="#f5c518" />
      ))}
    </View>
  );
}

export default class DetalheLivro extends React.Component {
  state = {
    emLista: false,
    avaliacoes: [],
    notaMedia: 0,
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

  _extrairCapaPayload = (capa) => {
    if (typeof capa !== "string") {
      return { capaLocal: capa, capaUri: null, capa: null };
    }
    return { capaLocal: null, capaUri: capa, capa: capa };
  };

  setLeituraAtual = async () => {
    const livro = this.props.route?.params?.livro;
    if (!livro?.id) return;

    const uid = (await getSessionUid()) || "__anon__";
    const KEY_LEITURA_ATUAL = keyUser(uid, "leitura_atual");
    const KEY_CURRENT_BOOK = keyUser(uid, "current_book");
    const KEY_CURRENT_BOOKS = keyUser(uid, "current_books");
    const KEY_LIDOS = keyUser(uid, "lidos");

    const { capaLocal, capaUri, capa } = this._extrairCapaPayload(livro.capa);

    const payload = {
      id: livro.id,
      titulo: livro.titulo,
      autor: livro.autor || "",
      capa: capa || null,
      capaUri,
      capaLocal,
      inicioEm: new Date().toISOString(),
      progresso: 0,
    };

    await AsyncStorage.setItem(KEY_LEITURA_ATUAL, JSON.stringify(payload));
    await AsyncStorage.setItem(KEY_CURRENT_BOOK, JSON.stringify(payload));

    const arrRaw = (await AsyncStorage.getItem(KEY_CURRENT_BOOKS)) || "[]";
    let arr = [];
    try {
      arr = JSON.parse(arrRaw);
      if (!Array.isArray(arr)) arr = [];
    } catch {
      arr = [];
    }
    arr = arr.filter((b) => b && b.id !== livro.id);
    arr.unshift(payload);
    await AsyncStorage.setItem(KEY_CURRENT_BOOKS, JSON.stringify(arr));

    const lidosRaw = (await AsyncStorage.getItem(KEY_LIDOS)) || "[]";
    let lidos = [];
    try {
      lidos = JSON.parse(lidosRaw);
      if (!Array.isArray(lidos)) lidos = [];
    } catch {
      lidos = [];
    }
    const jaTem = lidos.some((b) => b && b.id === livro.id);
    if (!jaTem) {
      lidos.unshift({
        id: livro.id,
        titulo: livro.titulo,
        autor: livro.autor || "",
        capa: capa || null,
        capaUri,
        capaLocal,
        lidoEm: new Date().toISOString(),
      });
      await AsyncStorage.setItem(KEY_LIDOS, JSON.stringify(lidos));
    }

    this.props.navigation?.navigate("Home");
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
    const locais = (info.ondeVer || []).join(" · ");
    return (
      <Pressable
        onPress={() => Alert.alert("Adaptação", `${info.titulo}\n\nOnde ver: ${locais || "—"}`)}
        style={estilos.botaoAdaptacaoDark}
      >
        <Text style={estilos.textoBotaoAdaptacaoDark}>🎬 Ver adaptação e onde ver</Text>
      </Pressable>
    );
  };

  renderItemAvaliacao = ({ item }) => (
    <View style={estilos.itemAvaliacao}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={estilos.avAutor}>{item.usuario}</Text>
        <Stars value={item.nota} size={16} />
      </View>
      {item.comentario ? <Text style={estilos.avTexto}>{item.comentario}</Text> : null}
      <Text style={estilos.avQuando}>{new Date(item.data).toLocaleDateString()}</Text>
    </View>
  );

  render() {
    const livro = this.props.route?.params?.livro;
    const { notaMedia, avaliacoes } = this.state;
    if (!livro) return null;

    const sinopseCompleta = livro.sinopseLonga || SINOPSES_LONGAS[livro.id] || livro.sinopse || "";

    return (
      <LinearGradient colors={[CORES.gradientStart, CORES.gradientEnd]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={estilos.conteudo}>
              <Pressable
                style={estilos.botaoVoltar}
                onPress={() => this.props.navigation?.navigate("AdicionarLivro")}
              >
                <MaterialCommunityIcons name="arrow-left" size={20} color={CORES.azul500} />
                <Text style={estilos.txtVoltar}>Voltar</Text>
              </Pressable>

              <View style={estilos.header}>
                <View style={estilos.capaWrap}>
                  {livro.capa ? (
                    <Image
                      source={typeof livro.capa === "string" ? { uri: livro.capa } : livro.capa}
                      style={estilos.capa}
                    />
                  ) : (
                    <View
                      style={[
                        estilos.capa,
                        { alignItems: "center", justifyContent: "center", backgroundColor: "#F1F2F4" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="book-open-page-variant"
                        size={48}
                        color={CORES.azul300}
                      />
                    </View>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={estilos.titulo}>{livro.titulo}</Text>
                  {livro.autor ? <Text style={estilos.autor}>{livro.autor}</Text> : null}

                  <View style={estilos.notaLinha}>
                    <Stars value={notaMedia} />
                    <Text style={estilos.notaTexto}>
                      {avaliacoes.length ? `${notaMedia.toFixed(1)} (${avaliacoes.length})` : "Sem avaliações"}
                    </Text>
                  </View>
                </View>
              </View>

              {sinopseCompleta.length > 0 && (
                <View style={estilos.caixa}>
                  <Text style={estilos.secaoTitulo}>Sinopse</Text>
                  <Text style={estilos.sinopse}>{sinopseCompleta}</Text>
                </View>
              )}

              {this.renderBotaoAdaptacao(livro)}

              <View style={estilos.caixa}>
                <Text style={estilos.secaoTitulo}>Avaliações</Text>
                {avaliacoes.length ? (
                  <FlatList
                    data={avaliacoes}
                    keyExtractor={(_, i) => "av-" + i}
                    renderItem={this.renderItemAvaliacao}
                    ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                    scrollEnabled={false}
                  />
                ) : (
                  <Text style={estilos.vazio}>Ainda não há avaliações.</Text>
                )}
              </View>

              <Pressable onPress={this.setLeituraAtual} style={estilos.botaoGrandePrim}>
                <MaterialCommunityIcons name="book-open-outline" size={20} color={CORES.branco} />
                <Text style={estilos.textoBotaoGrandePrim}>Adicione leitura atual</Text>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
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
  botaoVoltar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "transparent",
    paddingVertical: 6,
    paddingHorizontal: 2,
    marginBottom: 6,
  },
  txtVoltar: {
    color: CORES.azul500,
    fontSize: 15,
    fontWeight: "700",
  },
  header: {
    width: "100%",
    maxWidth: LARGURA_MAX,
    backgroundColor: CORES.branco,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 16,
    padding: 14,
    marginTop: 6,
    flexDirection: "row",
    gap: 14,
    shadowColor: CORES.sombra,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  capaWrap: {
    width: 110,
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F1F2F4",
  },
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
  sinopse: {
    color: CORES.textoSuave,
    fontSize: 15,
    lineHeight: 23,
  },
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
  vazio: { color: CORES.textoSuave },
});
