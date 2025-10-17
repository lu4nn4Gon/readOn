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

// opções de gênero para selecionar
const GENDER_OPTIONS = ["Feminino", "Masculino", "Outro"];

// cores
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
  sombraSuave: "#000000a7",
};

export default class Cadastro extends React.Component {
  state = {
    nome: "",
    usuario: "",
    email: "",
    nascimento: "",
    genero: "",
    celular: "",
    senha: "",
    confirmarSenha: "",
  };

  componentDidMount() {
    this.props.navigation?.setOptions({ title: "Cadastro" });
  }

  // utilidades de validação/mascara
  somenteDigitos = (v) => (v || "").replace(/\D+/g, "");
  senhaForte = (v) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v || "");
  emailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || "").toLowerCase());
  usuarioValido = (v) => /^[a-z0-9_]{3,20}$/.test((v || "").toLowerCase());

  validarDataBR = (v) => {
    const m = /^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{4}$/.exec(v || "");
    if (!m) return false;
    const [dd, mm, yyyy] = v.split("/").map((x) => parseInt(x, 10));
    const dt = new Date(yyyy, mm - 1, dd);
    return dt.getFullYear() === yyyy && dt.getMonth() === (mm - 1) && dt.getDate() === dd;
  };

  formatarDataInput = (v) => {
    const d = this.somenteDigitos(v).slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4, 8)}`;
  };

  formatarCelular = (v) => {
    const d = this.somenteDigitos(v).slice(0, 11);
    if (d.length === 0) return "";
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
  };

  gravar = async () => {
    try {
      const { nome, usuario, email, nascimento, genero, celular, senha, confirmarSenha } = this.state;
      const celN = this.somenteDigitos(celular);
      const emailKey = (email || "").trim().toLowerCase();
      const username = (usuario || "").trim().toLowerCase();

      if (!nome.trim() || !username || !emailKey || !nascimento.trim() || !genero.trim() || !celN || !senha || !confirmarSenha) {
        Alert.alert("Atenção", "Preencha todos os campos.");
        return;
      }
      if (!this.usuarioValido(username))
        return Alert.alert("Nome de usuário inválido", "Use 3–20 caracteres, apenas letras minúsculas, números ou _.");
      if (!this.emailValido(emailKey)) return Alert.alert("Email inválido", "Informe um email válido.");
      if (!this.validarDataBR(nascimento)) return Alert.alert("Data inválida", "Use DD/MM/AAAA.");
      if (celN.length < 10 || celN.length > 11) return Alert.alert("Celular inválido", "Use DDD + número.");
      if (!this.senhaForte(senha)) return Alert.alert("Senha fraca", "Mín. 8, com 1 maiúscula, 1 minúscula e 1 número.");
      if (senha !== confirmarSenha) return Alert.alert("Senhas diferentes", "Confirmação não confere.");

      const existeEmail = await AsyncStorage.getItem(emailKey);
      if (existeEmail) return Alert.alert("Email já cadastrado", "Tente outro.");

      const chaveUsuario = `@username:${username}`;
      const existeUser = await AsyncStorage.getItem(chaveUsuario);
      if (existeUser) return Alert.alert("Nome de usuário em uso", "Escolha outro @nome.");

      const registro = {
        nome: nome.trim(),
        usuario: username,
        email: emailKey,
        nascimento: nascimento.trim(),
        genero: genero.trim(),
        celular: celN,
        senha,
        criadoEm: new Date().toISOString(),
      };

      await AsyncStorage.setItem(emailKey, JSON.stringify(registro));
      await AsyncStorage.setItem(chaveUsuario, emailKey);

      Alert.alert("Sucesso", "Cadastro salvo!");
      this.setState({
        nome: "",
        usuario: "",
        email: "",
        nascimento: "",
        genero: "",
        celular: "",
        senha: "",
        confirmarSenha: "",
      });
      this.props.onAfterSave?.();
    } catch {
      Alert.alert("Erro", "Não foi possível salvar.");
    }
  };

  GeneroSelect = () => {
    const { genero } = this.state;
    return (
      <View style={{ margin: 9, width: "100%" }}>
        <Text style={estilos.rotuloSecao}>Gênero</Text>
        <View style={estilos.linhaChips}>
          {GENDER_OPTIONS.map((opt) => {
            const ativo = genero === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => this.setState({ genero: opt })}
                style={[estilos.chip, ativo && estilos.chipAtivo]}
              >
                <Text style={[estilos.textoChip, ativo && estilos.textoChipAtivo]}>
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  render() {
    const { nome, usuario, email, nascimento, celular, senha, confirmarSenha } = this.state;

    return (
      <LinearGradient
        colors={[CORES.gradientStart, CORES.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={estilos.pagina}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
            {/* cartão de boas-vindas */}
            <View style={estilos.cartaoOla}>
              <Text style={estilos.tituloOla}>Olá!</Text>
              <Text style={estilos.subtituloOla}>Crie sua conta para começar a explorar.</Text>
            </View>

            {/* cartão do formulário */}
            <View style={estilos.cartaoFormulario}>
              <Text style={estilos.tituloFormulario}>Cadastro</Text>

              {/* Nome completo */}
              <View style={estilos.campoCapsula}>
                <View style={estilos.iconeCampo}>
                  <MaterialCommunityIcons name="account" size={20} color={CORES.azul500} />
                </View>
                <TextInput
                  style={estilos.campoTexto}
                  placeholder="Nome completo"
                  placeholderTextColor={CORES.textoSuave}
                  value={nome}
                  onChangeText={(v) => this.setState({ nome: v })}
                  autoCapitalize="words"
                />
              </View>

              {/* Nome de usuário */}
              <View style={estilos.campoCapsula}>
                <View style={estilos.iconeCampo}>
                  <MaterialCommunityIcons name="account-circle" size={20} color={CORES.azul500} />
                </View>
                <TextInput
                  style={estilos.campoTexto}
                  placeholder="Nome de usuário (ex.: seu_nome)"
                  placeholderTextColor={CORES.textoSuave}
                  value={usuario}
                  onChangeText={(v) => this.setState({ usuario: v.replace(/\s+/g, "_") })}
                  autoCapitalize="none"
                  maxLength={20}
                />
              </View>

              {/* Email */}
              <View style={estilos.campoCapsula}>
                <View style={estilos.iconeCampo}>
                  <MaterialCommunityIcons name="email" size={20} color={CORES.azul500} />
                </View>
                <TextInput
                  style={estilos.campoTexto}
                  placeholder="Email"
                  placeholderTextColor={CORES.textoSuave}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(v) => this.setState({ email: v })}
                  autoCapitalize="none"
                />
              </View>

              {/* Data de nascimento */}
              <View style={estilos.campoCapsula}>
                <View style={estilos.iconeCampo}>
                  <MaterialCommunityIcons name="calendar" size={20} color={CORES.azul500} />
                </View>
                <TextInput
                  style={estilos.campoTexto}
                  placeholder="Data de nascimento (DD/MM/AAAA)"
                  placeholderTextColor={CORES.textoSuave}
                  keyboardType="number-pad"
                  value={nascimento}
                  onChangeText={(v) => this.setState({ nascimento: this.formatarDataInput(v) })}
                  maxLength={10}
                  autoCapitalize="none"
                />
              </View>

              {/* Seletor de gênero */}
              {this.GeneroSelect()}

              {/* Celular */}
              <View style={estilos.campoCapsula}>
                <View style={estilos.iconeCampo}>
                  <MaterialCommunityIcons name="phone" size={20} color={CORES.azul500} />
                </View>
                <TextInput
                  style={estilos.campoTexto}
                  placeholder="Celular ((00) 00000-0000)"
                  placeholderTextColor={CORES.textoSuave}
                  keyboardType="number-pad"
                  value={celular}
                  onChangeText={(v) => this.setState({ celular: this.formatarCelular(v) })}
                  maxLength={15}
                  autoCapitalize="none"
                />
              </View>

              {/* Senha */}
              <View style={estilos.campoCapsula}>
                <View style={estilos.iconeCampo}>
                  <MaterialCommunityIcons name="lock" size={20} color={CORES.azul500} />
                </View>
                <TextInput
                  style={estilos.campoTexto}
                  placeholder="Senha forte"
                  placeholderTextColor={CORES.textoSuave}
                  value={senha}
                  onChangeText={(v) => this.setState({ senha: v })}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {/* Confirmar senha */}
              <View style={estilos.campoCapsula}>
                <View style={estilos.iconeCampo}>
                  <MaterialCommunityIcons name="lock-check" size={20} color={CORES.azul500} />
                </View>
                <TextInput
                  style={estilos.campoTexto}
                  placeholder="Verificar senha"
                  placeholderTextColor={CORES.textoSuave}
                  value={confirmarSenha}
                  onChangeText={(v) => this.setState({ confirmarSenha: v })}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {/* Botão cadastrar */}
              <Pressable onPress={this.gravar} style={estilos.botaoPrincipal}>
                <Text style={estilos.textoBotao}>Cadastrar</Text>
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

  rotuloSecao: { color: CORES.textoEscuro, fontWeight: "700", marginBottom: 8 },

  linhaChips: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },

  chip: {
    borderWidth: 1,
    borderColor: CORES.azul300,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginHorizontal: 4,
    marginBottom: 8,
    backgroundColor: CORES.branco,
  },
  chipAtivo: { backgroundColor: CORES.azul500, borderColor: CORES.azul500 },

  textoChip: { color: CORES.textoSuave, fontWeight: "700" },
  textoChipAtivo: { color: CORES.branco, fontWeight: "800" },

  botaoPrincipal: {
    backgroundColor: CORES.azul500,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 14,
    alignSelf: "center",
  },
  textoBotao: { color: CORES.branco, fontWeight: "800", fontSize: 16, textAlign: "center" },
});
