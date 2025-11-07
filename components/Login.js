import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const logo = require("../assets/logo.png");

const CORES = {
  gradientStart: "#d6fcf9ff",
  gradientEnd:   "#6ef0eaff",
  azul500: "#038b89ff",
  azul300: "#b3b3b3ff",
  fundoIconeAzul: "#fbf5fdd6",
  textoEscuro: "#000000ff",
  textoSuave:  "#58627A",
  branco: "#ffffffff",
  bordaCartao: "#D6D5D3",
  sombraForte: "#040000FF",
};

export default class Login extends React.Component {
  state = {
    identificador: "",
    senha: "",
    carregando: false,
  };

  _ehEmail = (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || "").toLowerCase());

  entrar = async () => {
    try {
      const { identificador, senha } = this.state;
      const id = (identificador || "").trim().toLowerCase();

      if (!id || !senha) {
        Alert.alert("Atenção", "Informe seu email/usuário e a senha.");
        return;
      }

      this.setState({ carregando: true });

      let emailKey = id;
      if (!this._ehEmail(id)) {
        const apontado = await AsyncStorage.getItem(`@username:${id}`);
        if (!apontado) {
          this.setState({ carregando: false });
          Alert.alert("Erro", "Usuário não encontrado.");
          return;
        }
        emailKey = apontado;
      }

      const raw = await AsyncStorage.getItem(emailKey);
      if (!raw) {
        this.setState({ carregando: false });
        Alert.alert("Erro", "Credenciais inválidas.");
        return;
      }

      const user = JSON.parse(raw);
      if (user.senha !== senha) {
        this.setState({ carregando: false });
        Alert.alert("Erro", "Senha incorreta.");
        return;
      }

      this.setState({ carregando: false, senha: "" });

      await AsyncStorage.setItem(
        "@readon:session",
        JSON.stringify({
          email: emailKey,
          username: user.usuario,
          nome: user.nome,
        })
      );

      Alert.alert(
        "Bem-vindo(a)!",
        `Olá, ${user.nome}!`,
        [
          {
            text: "OK",
            onPress: () =>
              this.props.navigation?.replace("Home", { userNome: user.nome }),
          },
        ],
        { cancelable: false }
      );
    } catch {
      this.setState({ carregando: false });
      Alert.alert("Erro", "Não foi possível realizar o login.");
    }
  };

  render() {
    const { identificador, senha, carregando } = this.state;

    return (
      <LinearGradient
        colors={[CORES.gradientStart, CORES.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={estilos.pagina}
      >
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={estilos.conteudo}
              keyboardShouldPersistTaps="handled"
            >
              <View style={estilos.areaHeroi}>
                <View style={estilos.logoContainerAbsoluto}>
                  <Image
                    source={logo}
                    style={estilos.logoSobreposta}
                    accessible
                    accessibilityLabel="Logo do aplicativo"
                  />
                </View>

                <View style={[estilos.cartaoBemVindo, estilos.cartaoBemVindoComLogo]}>
                  <Text style={estilos.tituloBemVindo}>Bem-vindo!!!</Text>
                  <Text style={estilos.subtituloBemVindo}>Entre para continuar</Text>
                </View>
              </View>

              <View style={estilos.cartaoFormulario}>
                <View style={estilos.campoCapsula}>
                  <View style={estilos.iconeCampo}>
                    <MaterialCommunityIcons
                      name="account"
                      size={20}
                      color={CORES.azul500}
                    />
                  </View>
                  <TextInput
                    style={estilos.campoTexto}
                    placeholder="Email ou nome de usuário"
                    placeholderTextColor={CORES.textoSuave}
                    value={identificador}
                    onChangeText={(v) => this.setState({ identificador: v })}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View style={estilos.campoCapsula}>
                  <View style={estilos.iconeCampo}>
                    <MaterialCommunityIcons
                      name="lock"
                      size={20}
                      color={CORES.azul500}
                    />
                  </View>
                  <TextInput
                    style={estilos.campoTexto}
                    placeholder="Senha"
                    placeholderTextColor={CORES.textoSuave}
                    value={senha}
                    onChangeText={(v) => this.setState({ senha: v })}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <Pressable
                  disabled={carregando}
                  onPress={this.entrar}
                  style={[estilos.botaoPrincipal, carregando && { opacity: 0.7 }]}
                >
                  <Text style={estilos.textoBotao}>
                    {carregando ? "Entrando..." : "Entrar"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => this.props.navigation?.navigate("Cadastro")}
                  style={estilos.botaoSecundario}
                >
                  <Text style={estilos.textoLink}>Criar conta</Text>
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    );
  }
}

const LARGURA_MAX = 480;

const estilos = StyleSheet.create({
  pagina: { flex: 1 },
  conteudo: {
    padding: 18,
    paddingBottom: 28,
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  areaHeroi: {
    width: "100%",
    maxWidth: LARGURA_MAX,
    alignSelf: "center",
    position: "relative",
    marginBottom: 16,
  },
  logoContainerAbsoluto: {
    position: "absolute",
    top: -190,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 3,
  },
  logoSobreposta: {
    width: 175,
    height: 300,
    resizeMode: "contain",
  },
  cartaoBemVindo: {
    backgroundColor: CORES.azul500,
    borderRadius: 22,
    padding: 18,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: CORES.azul500,
    shadowColor: CORES.sombraForte,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 15 },
    elevation: 6,
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
  },
  cartaoBemVindoComLogo: {
    paddingTop: 65,
  },
  tituloBemVindo: {
    color: CORES.branco,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
  },
  subtituloBemVindo: {
    color: CORES.branco,
    opacity: 0.9,
    fontSize: 13,
    textAlign: "center",
  },
  cartaoFormulario: {
    backgroundColor: CORES.branco,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: CORES.bordaCartao,
    shadowColor: CORES.sombraForte,
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 25 },
    elevation: 6,
    width: "100%",
    maxWidth: LARGURA_MAX,
    alignSelf: "center",
    alignItems: "stretch",
  },
  campoCapsula: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CORES.branco,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CORES.azul300,
  },
  iconeCampo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CORES.fundoIconeAzul,
    marginRight: 10,
  },
  campoTexto: { flex: 1, color: CORES.textoEscuro, paddingVertical: 10, fontSize: 14 },
  botaoPrincipal: {
    backgroundColor: CORES.azul500,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 6,
    alignSelf: "center",
  },
  textoBotao: { color: CORES.branco, fontWeight: "800", fontSize: 16, textAlign: "center" },
  botaoSecundario: { paddingVertical: 12, alignItems: "center" },
  textoLink: { color: CORES.textoSuave, fontSize: 14, textDecorationLine: "underline" },
});
