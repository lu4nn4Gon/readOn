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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// mesmas cores da página de cadastro
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
    identificador: "", // email OU nome de usuário
    senha: "",
    carregando: false,
  };

  componentDidMount() {
    this.props.navigation?.setOptions({ title: "Login" });
  }

  _ehEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || "").toLowerCase());

  entrar = async () => {
    try {
      const { identificador, senha } = this.state;
      const id = (identificador || "").trim().toLowerCase();

      if (!id || !senha) {
        Alert.alert("Atenção", "Informe seu email/usuário e a senha.");
        return;
      }

      this.setState({ carregando: true });

      // 1) Resolver para o e-mail: se for usuário, pega no índice @username:
      let emailKey = id;
      if (!this._ehEmail(id)) {
        const apontado = await AsyncStorage.getItem(`@username:${id}`);
        if (!apontado) {
          this.setState({ carregando: false });
          Alert.alert("Erro", "Usuário não encontrado.");
          return;
        }
        emailKey = apontado; // valor salvo no índice é o e-mail
      }

      // 2) Buscar o registro do usuário (salvo com a chave = e-mail)
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

      // sucesso
      this.setState({ carregando: false, senha: "" });
      Alert.alert("Bem-vindo(a)!", `Olá, ${user.nome}!`);
      // acione um callback ou navegue:
      this.props.onLoginSucesso?.(user);
      // this.props.navigation?.replace("Home"); // se quiser navegar
    } catch (e) {
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
            {/* Cartão de boas-vindas */}
            <View style={estilos.cartaoOla}>
              <Text style={estilos.tituloOla}>Bem-vindo(a)!</Text>
              <Text style={estilos.subtituloOla}>Entre para continuar.</Text>
            </View>

            {/* Cartão do formulário */}
            <View style={estilos.cartaoFormulario}>
              <Text style={estilos.tituloFormulario}>Login</Text>

              {/* Identificador (email ou usuário) */}
              <View style={estilos.campoCapsula}>
                <View style={estilos.iconeCampo}>
                  <MaterialCommunityIcons name="account" size={20} color={CORES.azul500} />
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

              {/* Senha */}
              <View style={estilos.campoCapsula}>
                <View style={estilos.iconeCampo}>
                  <MaterialCommunityIcons name="lock" size={20} color={CORES.azul500} />
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

              {/* Ações */}
              <Pressable
                disabled={carregando}
                onPress={this.entrar}
                style={[estilos.botaoPrincipal, carregando && { opacity: 0.7 }]}
              >
                <Text style={estilos.textoBotao}>{carregando ? "Entrando..." : "Entrar"}</Text>
              </Pressable>

              {/* Link para cadastro (opcional) */}
              <Pressable
                style={estilos.linkSecundario}
                onPress={() => this.props.navigation?.navigate?.("Cadastro")}
              >
                <Text style={estilos.textoLink}>Não tem conta? Cadastre-se</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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

  cartaoOla: {
    backgroundColor: CORES.azul500,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CORES.azul500,
    shadowColor: CORES.sombraForte,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 15 },
    elevation: 6,
    width: "100%",
    maxWidth: LARGURA_MAX,
    alignSelf: "center",
    alignItems: "center",
  },
  tituloOla: { color: CORES.branco, fontSize: 20, fontWeight: "800", marginBottom: 6, textAlign: "center" },
  subtituloOla: { color: CORES.branco, opacity: 0.9, fontSize: 13, textAlign: "center" },

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
  tituloFormulario: {
    color: CORES.azul500,
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 12,
    textTransform: "lowercase",
    textAlign: "center",
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

  linkSecundario: { paddingVertical: 12, alignItems: "center" },
  textoLink: { color: CORES.textoSuave, fontSize: 14, textDecorationLine: "underline" },
});
