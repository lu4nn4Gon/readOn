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

const SESSION_KEY = "@readon:session";
const KEY_LISTA = "@readon:lista_desejos"; 
const keyUser = (uid, name) => `@readon:${name}:${uid}`;

const arteHome = require("../assets/home.png");

const CORES = {
  inicioGradiente: "#d6fcf9ff",
  fimGradiente: "#6ef0eaff",
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
  lendoFundo: "rgba(3,139,137,0.10)",
  lendoBorda: "rgba(3,139,137,0.30)",
  lendoTexto: "#026160ff",
};

const LARGURA_MAXIMA = 520;

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

export default class Home extends React.Component {
  state = {
    carregando: true,
    livros: [],
    listaDesejos: [],
    userNome: "usuário",
    uid: "__anon__",
  };

  componentDidMount() {
    this._desinscrever = this.props.navigation?.addListener?.("focus", this.carregar);
    this.carregar();
  }
  componentWillUnmount() {
    this._desinscrever?.();
  }

  resolverFonteCapa = (capa) => {
    if (!capa) return null;
    if (typeof capa === "number") return capa;       
    if (typeof capa === "string") return { uri: capa }; 
    if (capa?.uri) return { uri: capa.uri };         
    return null;
  };


  formatarData = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  obterDiaDoMes = () => String(new Date().getDate()).padStart(2, "0");

  carregar = async () => {
    try {
      const s = await getSession();
      const uid = s?.uid || "__anon__";
      const userNome = this.props.route?.params?.userNome || s?.nome || "usuário";

      const KEY_CURRENT_BOOKS = keyUser(uid, "current_books");
      const KEY_CURRENT_BOOK  = keyUser(uid, "current_book");   // legado único
      const KEY_READ_BOOKS    = keyUser(uid, "read_books");
      const KEY_DROPPED_BOOKS = keyUser(uid, "dropped_books");
      const KEY_FAVORITOS     = keyUser(uid, "favoritos");

      const [rawAtuais, rawFavoritos, rawLidos, rawDrop, rawDesejos] = await Promise.all([
        AsyncStorage.getItem(KEY_CURRENT_BOOKS),
        AsyncStorage.getItem(KEY_FAVORITOS),
        AsyncStorage.getItem(KEY_READ_BOOKS),
        AsyncStorage.getItem(KEY_DROPPED_BOOKS),
        AsyncStorage.getItem(KEY_LISTA),
      ]);

  
      let atuais = [];
      try { atuais = JSON.parse(rawAtuais || "[]"); if (!Array.isArray(atuais)) atuais = []; } catch { atuais = []; }

  
      const legadoRaw = await AsyncStorage.getItem(KEY_CURRENT_BOOK);
      if (legadoRaw) {
        try {
          const legado = JSON.parse(legadoRaw);
          if (legado?.id) {
            atuais = [legado, ...atuais.filter((b) => b && b.id !== legado.id)];
          }
        } catch {}
        try { await AsyncStorage.removeItem(KEY_CURRENT_BOOK); } catch {}
      }

   
      let favoritos = [];  try { favoritos = JSON.parse(rawFavoritos || "[]"); if (!Array.isArray(favoritos)) favoritos = []; } catch { favoritos = []; }
      let lidos = [];      try { lidos      = JSON.parse(rawLidos || "[]");     if (!Array.isArray(lidos))      lidos = [];      } catch { lidos = []; }
      let desistidos = []; try { desistidos = JSON.parse(rawDrop || "[]");      if (!Array.isArray(desistidos)) desistidos = []; } catch { desistidos = []; }

     
      const livros = atuais.filter(Boolean).map((b) => ({
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

      let desejosBrutos = [];
      try { desejosBrutos = JSON.parse(rawDesejos || "[]"); if (!Array.isArray(desejosBrutos)) desejosBrutos = []; } catch { desejosBrutos = []; }

      const fontes = [...atuais, ...favoritos, ...lidos, ...desistidos].filter(Boolean);
      const byId = new Map();
      for (const it of fontes) if (it?.id) byId.set(it.id, it);

      const listaDesejos = desejosBrutos
        .map((d) => {
          if (d && typeof d === "object" && d.id) {
            return {
              id: d.id,
              titulo: d.titulo || "Sem título",
              autor: d.autor || "",
              capa: d.capa || null,
              capaUri: d.capaUri || null,
              capaLocal: d.capaLocal || null,
            };
          }
          if (typeof d === "string") {
            const hit = byId.get(d);
            if (hit) {
              return {
                id: hit.id,
                titulo: hit.titulo || "Sem título",
                autor: hit.autor || "",
                capa: hit.capa || null,
                capaUri: hit.capaUri || null,
                capaLocal: hit.capaLocal || null,
              };
            }
            return { id: d, titulo: "(sem dados)", autor: "", capa: null };
          }
          return null;
        })
        .filter(Boolean);

      this.setState({ livros, listaDesejos, carregando: false, userNome, uid });
    } catch {
      this.setState({ livros: [], listaDesejos: [], carregando: false });
    }
  };

  marcarComoLido = async (livro) => {
    try {
      const { uid } = this.state;
      const KEY_CURRENT_BOOKS = keyUser(uid, "current_books");
      const KEY_READ_BOOKS = keyUser(uid, "read_books");
      const KEY_CURRENT_BOOK = keyUser(uid, "current_book"); // legado

      const rawCurrent = (await AsyncStorage.getItem(KEY_CURRENT_BOOKS)) || "[]";
      const rawRead = (await AsyncStorage.getItem(KEY_READ_BOOKS)) || "[]";
      let atuais = [];
      let lidos = [];
      try { atuais = JSON.parse(rawCurrent); if (!Array.isArray(atuais)) atuais = []; } catch { atuais = []; }
      try { lidos  = JSON.parse(rawRead);   if (!Array.isArray(lidos))  lidos  = []; } catch { lidos = []; }

      const novosAtuais = atuais.filter((b) => b && b.id !== livro.id);
      const finalizado = { ...livro, finalizadoEm: new Date().toISOString() };
      const novosLidos = [finalizado, ...lidos.filter((b) => b && b.id !== livro.id)];

      await AsyncStorage.setItem(KEY_CURRENT_BOOKS, JSON.stringify(novosAtuais));
      await AsyncStorage.setItem(KEY_READ_BOOKS, JSON.stringify(novosLidos));
      try { await AsyncStorage.removeItem(KEY_CURRENT_BOOK); } catch {}

      this.setState(
        (st) => ({ livros: st.livros.filter((b) => b.id !== livro.id) }),
        () => {
          try { this.props.navigation?.navigate?.("AvaliarLivro", { livro: finalizado }); } catch {}
        }
      );
    } catch {
      Alert.alert("Erro", "Não foi possível marcar como lido.");
    }
  };

  desistirLeitura = async (livro) => {
    try {
      const { uid } = this.state;
      const KEY_CURRENT_BOOKS = keyUser(uid, "current_books");
      const KEY_DROPPED_BOOKS = keyUser(uid, "dropped_books");
      const KEY_CURRENT_BOOK = keyUser(uid, "current_book"); // legado

      const rawCurrent = (await AsyncStorage.getItem(KEY_CURRENT_BOOKS)) || "[]";
      const rawDropped = (await AsyncStorage.getItem(KEY_DROPPED_BOOKS)) || "[]";

      let atuais = [];
      let desistidos = [];
      try { atuais = JSON.parse(rawCurrent);  if (!Array.isArray(atuais))   atuais = []; } catch { atuais = []; }
      try { desistidos = JSON.parse(rawDropped); if (!Array.isArray(desistidos)) desistidos = []; } catch { desistidos = []; }

      const novosAtuais = atuais.filter((b) => b && b.id !== livro.id);
      const registroDesistido = { ...livro, desistidoEm: new Date().toISOString() };
      const novosDesistidos = [registroDesistido, ...desistidos.filter((b) => b && b.id !== livro.id)];

      await AsyncStorage.setItem(KEY_CURRENT_BOOKS, JSON.stringify(novosAtuais));
      await AsyncStorage.setItem(KEY_DROPPED_BOOKS, JSON.stringify(novosDesistidos));
      try { await AsyncStorage.removeItem(KEY_CURRENT_BOOK); } catch {}

      this.setState((st) => ({ livros: st.livros.filter((b) => b.id !== livro.id) }));
      Alert.alert("Pronto", "Você desistiu desta leitura. O livro foi removido da sua lista de lendo.");
    } catch {
      Alert.alert("Erro", "Não foi possível desistir desta leitura.");
    }
  };

  sair = () => {
    this.props.navigation?.reset?.({ index: 0, routes: [{ name: "Login" }] });
  };

  aoPressionarAdicionar = () => {
    if (this.props.navigation?.navigate) {
      try { this.props.navigation.navigate("AdicionarLivro"); }
      catch { Alert.alert("Adicionar", "Tela 'AdicionarLivro' não encontrada."); }
    } else {
      Alert.alert("Adicionar", "Navegação indisponível no momento.");
    }
  };

  irParaBiblioteca = (filtro) => {
    if (this.props.navigation?.navigate) {
      try {
        if (filtro === "lidos") this.props.navigation.navigate("LivrosLidos");
        else this.props.navigation.navigate("Biblioteca", filtro ? { filtro } : undefined);
      } catch {
        Alert.alert("Biblioteca", "Tela de biblioteca ainda não foi implementada.");
      }
    } else {
      Alert.alert("Biblioteca", "Tela de biblioteca ainda não foi implementada.");
    }
  };

  irParaLancamentos = () => {
    if (this.props.navigation?.navigate) {
      try { this.props.navigation.navigate("Lancamentos"); }
      catch { Alert.alert("Lançamentos", "Tela de lançamentos ainda não foi implementada."); }
    } else {
      Alert.alert("Lançamentos", "Tela de lançamentos ainda não foi implementada.");
    }
  };

  Cabecalho = () => {
    const nome = this.state.userNome || "usuário";
    return (
      <View style={estilos.cabecalhoContainer}>
        <View style={estilos.cabecalho}>
          <View style={estilos.cabecalhoLinha}>
            <View style={{ flex: 1 }}>
              <Text style={[estilos.cabecalhoTitulo, { paddingTop: 50 }]}>
                Bem-vindo, {nome}
              </Text>
              <Text style={estilos.cabecalhoSubtitulo}>Que livro você leu hoje?</Text>
            </View>
          </View>
          <View style={estilos.faixa}>
            <Text style={estilos.seloDia}>Dia {this.obterDiaDoMes()}</Text>
          </View>
          <View style={estilos.ondaDecorativa} />
          <Image source={arteHome} style={estilos.imagemCabecalho} />
        </View>
      </View>
    );
  };

  CartaoVazio = () => (
    <View style={[estilos.cartao, estilos.cartaoVazio]}>
      <Text style={estilos.cartaoTitulo}>Tem algum livro que você está lendo?</Text>
      <Text style={estilos.cartaoSubtitulo}>Adicione sua leitura atual</Text>
      <View style={estilos.fundoCruzes}>
        <MaterialCommunityIcons name="plus" size={12} color="#0ae0b2ff" />
        <MaterialCommunityIcons name="plus" size={40} color="#0ae0b2ff" />
        <MaterialCommunityIcons name="plus" size={28} color="#0ae0b2ff" />
      </View>
      <Pressable onPress={this.aoPressionarAdicionar} style={estilos.botaoPrimario}>
        <MaterialCommunityIcons name="plus" size={18} color={CORES.branco} />
        <Text style={estilos.botaoPrimarioTexto}>Adicionar livro</Text>
      </Pressable>
    </View>
  );

  CartaoLivro = ({ livro }) => {
    const fonteCapa = this.resolverFonteCapa(livro?.capaLocal || livro?.capa || livro?.capaUri);
    return (
      <View style={[estilos.cartao, estilos.cartaoLivro]}>
        <LinearGradient colors={["#ffffff", "rgba(255,255,255,0.95)"]} style={estilos.cartaoLivroFundo}>
          <View style={estilos.badgeLendoLinha}>
            <View style={estilos.badgeLendo}>
              <MaterialCommunityIcons name="book-open-variant" size={14} color={CORES.lendoTexto} />
              <Text style={estilos.badgeLendoTexto}>Lendo</Text>
            </View>
            {!!livro?.inicioEm && <Text style={estilos.metaLivroTexto}>desde {this.formatarData(livro.inicioEm)}</Text>}
          </View>

          <Text style={estilos.tituloLivro} numberOfLines={2}>{livro?.titulo || "Sem título"}</Text>
          {!!livro?.autor && <Text style={estilos.autorLivro} numberOfLines={1}>{livro.autor}</Text>}

          <View style={estilos.livroLinha}>
            <View style={estilos.capaContainer}>
              <View style={estilos.capaBorda}>
                {fonteCapa ? (
                  <Image source={fonteCapa} style={estilos.capaImagem} />
                ) : (
                  <View style={estilos.capaVazia}>
                    <MaterialCommunityIcons name="book-open-page-variant" size={42} color={CORES.textoSuave} />
                  </View>
                )}
              </View>
            </View>

            <View style={estilos.infoColuna} />

            <View style={estilos.acoesColuna}>
              <Pressable onPress={() => this.marcarComoLido(livro)} style={[estilos.botaoPill, estilos.botaoLidoContorno]}>
                <MaterialCommunityIcons name="check-bold" size={16} color={CORES.lidoBorda} />
                <Text style={estilos.botaoPillTextoLido}>Lido</Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  Alert.alert("Desistir da leitura", "Tem certeza que deseja desistir deste livro?", [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Desistir", style: "destructive", onPress: () => this.desistirLeitura(livro) },
                  ])
                }
                style={[estilos.botaoPill, estilos.botaoDesistidoContorno]}
              >
                <MaterialCommunityIcons name="close" size={16} color={CORES.desistidoBorda} />
                <Text style={estilos.botaoPillTextoDesistido}>Desistido</Text>
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
            onPress={() => Alert.alert("Lista de desejos", "Para adicionar/remover, use o botão na tela de detalhes do livro.")}
            style={estilos.botaoFantasma}
          >
            <MaterialCommunityIcons name="heart-plus" size={18} color={CORES.azul500} />
            <Text style={estilos.textoBotaoFantasma}>Gerenciar</Text>
          </Pressable>
        </View>

        {vazia ? (
          <>
            <Text style={estilos.listaDesejosMensagem}>Sua lista de desejos está vazia no momento.</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.listaDesejosLinha}>
              <View style={[estilos.itemDesejo, estilos.itemDesejoPlaceholder]}>
                <View style={estilos.capaDesejoPlaceholder}>
                  <MaterialCommunityIcons name="book-outline" size={30} color={CORES.azul300} />
                </View>
                <Text numberOfLines={1} style={estilos.tituloDesejoPlaceholder}>Nome do livro</Text>
                <Text numberOfLines={1} style={estilos.autorDesejoPlaceholder}>Autor</Text>
              </View>

              <View style={[estilos.itemDesejo, estilos.itemDesejoPlaceholder]}>
                <View style={estilos.capaDesejoPlaceholder}>
                  <MaterialCommunityIcons name="book-outline" size={30} color={CORES.azul300} />
                </View>
                <Text numberOfLines={1} style={estilos.tituloDesejoPlaceholder}>Nome do livro</Text>
                <Text numberOfLines={1} style={estilos.autorDesejoPlaceholder}>Autor</Text>
              </View>
            </ScrollView>
          </>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.listaDesejosLinha}>
            {listaDesejos.map((it) => {
              const fonteCapa = this.resolverFonteCapa(it?.capaLocal || it?.capa || it?.capaUri);
              return (
                <Pressable
                  key={it.id}
                  onPress={() => {
                    try { this.props.navigation?.navigate?.("DetalheLivro", { livro: it }); } catch {}
                  }}
                  style={estilos.itemDesejo}
                >
                  <View style={estilos.capaDesejoPlaceholder}>
                    {fonteCapa ? (
                      <Image source={fonteCapa} style={{ width: "100%", height: "100%", borderRadius: 10 }} />
                    ) : (
                      <MaterialCommunityIcons name="book-outline" size={30} color={CORES.azul300} />
                    )}
                  </View>
                  <Text numberOfLines={1} style={estilos.tituloDesejo}>{it.titulo || "(sem dados)"}</Text>
                  {!!it.autor && <Text numberOfLines={1} style={estilos.autorDesejo}>{it.autor}</Text>}
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  };

  CartaoBiblioteca = () => (
    <View style={[estilos.cartao, estilos.cartaoBiblioteca]}>
      <Text style={estilos.bibliotecaTitulo}>Sua biblioteca</Text>
      <View style={estilos.bibliotecaBotoesLinha}>
        <Pressable onPress={() => this.irParaBiblioteca("favoritos")} style={[estilos.chipBiblioteca]}>
          <MaterialCommunityIcons name="heart" size={16} />
          <Text style={estilos.textoChipBiblioteca}>Favoritos</Text>
        </Pressable>
        <Pressable onPress={() => this.irParaBiblioteca("lidos")} style={[estilos.chipBiblioteca]}>
          <MaterialCommunityIcons name="check-circle" size={16} />
          <Text style={estilos.textoChipBiblioteca}>Lidos</Text>
        </Pressable>
      </View>
    </View>
  );

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
                onPress={() => Alert.alert("Lançamento", `${it.titulo} — ${this.formatarData(it.data)}`)}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <View style={estilos.linhaLancamento}>
                  <View style={estilos.pontoLista} />
                  <Text style={estilos.itemLancamentoTitulo} numberOfLines={1}>{it.titulo}</Text>
                  <View style={estilos.seloData}>
                    <MaterialCommunityIcons name="calendar" size={12} color={CORES.azul500} />
                    <Text style={estilos.textoSeloData}>{this.formatarData(it.data)}</Text>
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
                  <Text style={estilos.itemAltaTitulo} numberOfLines={1}>{it.titulo}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    );
  };

  render() {
    const { carregando, livros } = this.state;

    return (
      <LinearGradient colors={[CORES.inicioGradiente, CORES.fimGradiente]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
              <this.Cabecalho />

              {carregando && <Text style={{ color: CORES.textoSuave, marginTop: 14 }}>Carregando...</Text>}

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

              <View style={{ height: 12 }} />
              <this.CartaoListaDesejos />

              <View style={{ height: 14 }} />
              <this.CartaoBiblioteca />

              <View style={{ height: 16 }} />
              <this.SecaoNovidades />

              <View style={{ height: 28 }} />
              <Pressable onPress={this.sair} style={estilos.botaoSairFinal}>
                <MaterialCommunityIcons name="logout" size={18} color={CORES.branco} />
                <Text style={estilos.textoBotaoSairFinal}>Sair</Text>
              </Pressable>
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

  cabecalhoContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 0,
  },

  cabecalho: {
    width: "110%",
    maxWidth: LARGURA_MAXIMA,
    backgroundColor: CORES.azul500,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 100,
    overflow: "hidden",
  },

  cabecalhoLinha: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  cabecalhoTitulo: {
    color: "#E8F4FA",
    fontWeight: "800",
    fontSize: 32,
    marginTop: 12,
    marginBottom: 6,
  },

  cabecalhoSubtitulo: {
    color: "#D3E7F3",
    fontSize: 14,
  },

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

  ondaDecorativa: {
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
    maxWidth: LARGURA_MAXIMA,
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

  cartaoVazio: {
    alignItems: "flex-start",
    overflow: "hidden",
  },

  cartaoTitulo: {
    color: CORES.texto,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },

  cartaoSubtitulo: {
    color: CORES.textoSuave,
    marginBottom: 18,
  },

  fundoCruzes: {
    position: "absolute",
    right: 24,
    bottom: 18,
    opacity: 0.45,
    gap: 8,
  },

  botaoPrimario: {
    backgroundColor: CORES.azul500,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  botaoPrimarioTexto: {
    color: CORES.branco,
    fontWeight: "800",
  },

  cartaoLivro: {
    borderWidth: 0,
    padding: 0,
    backgroundColor: "transparent",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },

  cartaoLivroFundo: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(3,139,137,0.20)",
    overflow: "hidden",
  },

  badgeLendoLinha: {
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
    backgroundColor: CORES.lendoFundo,
    borderWidth: 1,
    borderColor: CORES.lendoBorda,
    marginBottom: 4,
  },

  badgeLendoTexto: {
    color: CORES.lendoTexto,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  metaLivroTexto: {
    color: CORES.textoSuave,
    fontSize: 12,
  },

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

  livroLinha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  capaContainer: {
    width: 116,
    height: 168,
    alignItems: "center",
    justifyContent: "center",
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

  capaImagem: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  capaVazia: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  infoColuna: {
    flex: 1,
    paddingRight: 8,
    minHeight: 168,
    justifyContent: "center",
  },

  acoesColuna: {
    width: 112,
    alignItems: "stretch",
    justifyContent: "center",
    gap: 10,
  },

  botaoPill: {
    height: 42,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "transparent",
  },

  botaoLidoContorno: {
    borderColor: CORES.lidoBorda,
    backgroundColor: "rgba(134,239,172,0.10)",
  },

  botaoDesistidoContorno: {
    borderColor: CORES.desistidoBorda,
    backgroundColor: "rgba(252,165,165,0.10)",
  },

  botaoPillTextoLido: {
    color: CORES.lidoBorda,
    fontWeight: "900",
  },

  botaoPillTextoDesistido: {
    color: CORES.desistidoBorda,
    fontWeight: "900",
  },

  cartaoListaDesejos: {
    marginTop: 14,
    marginBottom: 10,
  },

  listaDesejosTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  listaDesejosTitulo: {
    color: CORES.texto,
    fontSize: 20,
    fontWeight: "800",
  },

  listaDesejosMensagem: {
    color: CORES.textoSuave,
    marginBottom: 6,
  },

  botaoFantasma: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(3,139,137,0.08)",
    borderRadius: 12,
  },

  textoBotaoFantasma: {
    color: CORES.azul500,
    fontWeight: "800",
  },

  listaDesejosLinha: {
    gap: 12,
    paddingRight: 4,
  },

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

  itemDesejoPlaceholder: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },

  capaDesejoPlaceholder: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#F1F2F4",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  tituloDesejoPlaceholder: {
    color: CORES.azul300,
    fontWeight: "700",
  },

  autorDesejoPlaceholder: {
    color: CORES.azul300,
    fontSize: 12,
    marginTop: 2,
  },

  tituloDesejo: {
    color: CORES.texto,
    fontWeight: "800",
  },

  autorDesejo: {
    color: CORES.textoSuave,
    fontSize: 12,
    marginTop: 2,
  },

  cartaoBiblioteca: {
    paddingVertical: 14,
    marginTop: 12,
  },

  bibliotecaTitulo: {
    color: CORES.texto,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },

  bibliotecaBotoesLinha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

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

  textoChipBiblioteca: {
    color: CORES.azul500,
    fontWeight: "800",
  },

  
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

  novidadesTitulo: {
    color: CORES.texto,
    fontSize: 20,
    fontWeight: "800",
  },

  blocoNovidades: {
    marginTop: 12,
  },

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

  verTodosBotao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  verTodosTexto: {
    color: CORES.azul500,
    fontWeight: "900",
  },

  listaTexto: {
    gap: 10,
  },

  linhaLancamento: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
  },

  pontoLista: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: CORES.azul500,
  },

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

  textoSeloData: {
    color: CORES.azul500,
    fontWeight: "800",
    fontSize: 12,
  },

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

  textoSeloNumero: {
    color: CORES.azul500,
    fontWeight: "900",
    fontSize: 12,
  },

  botaoSairFinal: {
    width: "100%",
    maxWidth: LARGURA_MAXIMA,
    backgroundColor: CORES.azul500,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "center",
    marginTop: 10,
  },

  textoBotaoSairFinal: {
    color: CORES.branco,
    fontWeight: "800",
    fontSize: 16,
  },
});

