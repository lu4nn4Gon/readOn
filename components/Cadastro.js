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

const GENDER_OPTIONS = ["Feminino", "Masculino", "Outro"];

/** PALETA (hex em tudo) */
const COLORS = {
  gradientStart: "#d6fcf9ff",
  gradientEnd:   "#6ef0eaff",
  blue500: "#038b89ff",
  blue300: "#b3b3b3ff",
  blueIconBg: "#fbf5fdd6",
  textDark: "#000000ff",
  textSub:  "#58627A",
  white: "#ffffffff",
  cardBorder: "#D6D5D3",
  shadowStrong: "#040000FF",
  shadowSoft:   "#000000a7",
};

export default class Cadastro extends React.Component {
  state = {
    nome: "",
    usuario: "",      // <- novo campo
    email: "",
    nascimento: "",
    genero: "",
    celular: "",
    senha: "",
    confirmarSenha: "",
  };

  componentDidMount() {
    this.props.navigation?.setOptions({ title: "cadastro" });
  }

  somenteDigitos = (v) => (v || "").replace(/\D+/g, "");
  senhaForte = (v) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v || "");
  emailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || "").toLowerCase());
  usernameValido = (v) => /^[a-z0-9_]{3,20}$/.test((v || "").toLowerCase()); // 3-20, letras/números/_

  validarDataBR = (v) => {
    const m = /^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{4}$/.exec(v || "");
    if (!m) return false;
    const [dd, mm, yyyy] = v.split("/").map((x) => parseInt(x, 10));
    const dt = new Date(yyyy, mm - 1, dd);
    return dt.getFullYear() === yyyy && dt.getMonth() === mm - 1 && dt.getDate() === dd;
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
      if (!this.usernameValido(username))
        return Alert.alert("Nome de usuário inválido",
          "Use 3–20 caracteres, apenas letras minúsculas, números ou _ (underline).");

      if (!this.emailValido(emailKey)) return Alert.alert("Email inválido", "Informe um email válido.");
      if (!this.validarDataBR(nascimento)) return Alert.alert("Data inválida", "Use DD/MM/AAAA.");
      if (celN.length < 10 || celN.length > 11) return Alert.alert("Celular inválido", "Use DDD + número.");
      if (!this.senhaForte(senha)) return Alert.alert("Senha fraca", "Mín. 8, com 1 maiúscula, 1 minúscula e 1 número.");
      if (senha !== confirmarSenha) return Alert.alert("Senhas diferentes", "Confirmação não confere.");

      // unicidade
      const existeEmail = await AsyncStorage.getItem(emailKey);
      if (existeEmail) return Alert.alert("Email já cadastrado", "Tente outro.");

      const userIndexKey = `@username:${username}`;
      const existeUser = await AsyncStorage.getItem(userIndexKey);
      if (existeUser) return Alert.alert("Nome de usuário em uso", "Escolha outro @nome.");

      const registro = {
        nome: nome.trim(),
        usuario: username, // <- salvo como aparece na plataforma (minúsculo)
        email: emailKey,
        nascimento: nascimento.trim(),
        genero: genero.trim(),
        celular: celN,
        senha,
        criadoEm: new Date().toISOString(),
      };

      // salva registro e índice de username
      await AsyncStorage.setItem(emailKey, JSON.stringify(registro));
      await AsyncStorage.setItem(userIndexKey, emailKey);

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

  Input = ({ icon, placeholder, secure, keyboardType, value, onChangeText, maxLength, autoCapitalize = "none" }) => (
    <View style={styles.inputPill}>
      <View style={styles.inputIcon}>
        <MaterialCommunityIcons name={icon} size={20} color={COLORS.blue500} />
      </View>
      <TextInput
        style={styles.inputText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSub}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );

  GeneroSelect = () => {
    const { genero } = this.state;
    return (
      <View style={{ margin: 9, width: "100%"}}>
        <Text style={[styles.sectionLabel]}>Gênero</Text>
        <View style={styles.chipsRow}>
          {GENDER_OPTIONS.map((opt) => {
            const active = genero === opt;
            return (
              <Pressable key={opt} onPress={() => this.setState({ genero: opt })} style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{opt}</Text>
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
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.page}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.greetingCard}>
              <Text style={styles.greetTitle}>Olá!</Text>
              <Text style={styles.greetSub}>Crie sua conta para começar a explorar.</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.formTitle}>cadastro</Text>

              {this.Input({
                icon: "account",
                placeholder: "Nome completo",
                value: nome,
                onChangeText: (v) => this.setState({ nome: v }),
                autoCapitalize: "words",
              })}

              {this.Input({
                icon: "account-circle",
                placeholder: "Nome de usuário (ex.: seu_nome)",
                value: usuario,
                onChangeText: (v) =>
                  this.setState({ usuario: v.replace(/\s+/g, "_") }), 
                autoCapitalize: "none",
                maxLength: 20,
              })}


              {this.Input({
                icon: "email",
                placeholder: "Email",
                keyboardType: "email-address",
                value: email,
                onChangeText: (v) => this.setState({ email: v }),
              })}

              <View style={styles.inputPill}>
                <View style={styles.inputIcon}>
                  <MaterialCommunityIcons name="calendar" size={20} color={COLORS.blue500} />
                </View>
                <TextInput
                  style={styles.inputText}
                  placeholder="Data de nascimento (DD/MM/AAAA)"
                  placeholderTextColor={COLORS.textSub}
                  keyboardType="number-pad"
                  value={nascimento}
                  onChangeText={(v) => this.setState({ nascimento: this.formatarDataInput(v) })}
                  maxLength={10}
                  autoCapitalize="none"
                />
              </View>

              {this.GeneroSelect()}

              <View style={styles.inputPill}>
                <View style={styles.inputIcon}>
                  <MaterialCommunityIcons name="phone" size={20} color={COLORS.blue500} />
                </View>
                <TextInput
                  style={styles.inputText}
                  placeholder="Celular ((00) 00000-0000)"
                  placeholderTextColor={COLORS.textSub}
                  keyboardType="number-pad"
                  value={celular}
                  onChangeText={(v) => this.setState({ celular: this.formatarCelular(v) })}
                  maxLength={15}
                  autoCapitalize="none"
                />
              </View>

              {this.Input({ icon: "lock", placeholder: "Senha forte", secure: true, value: senha, onChangeText: (v) => this.setState({ senha: v }) })}
              {this.Input({ icon: "lock-check", placeholder: "Verificar senha", secure: true, value: confirmarSenha, onChangeText: (v) => this.setState({ confirmarSenha: v }) })}

              <Pressable onPress={this.gravar} style={styles.ctaBtn}>
                <Text style={styles.ctaTxt}>Cadastrar</Text>
              </Pressable>

            
             
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }
}

const MAX_W = 480;

const styles = StyleSheet.create({
  page: { flex: 1 },
  container: {
    padding: 18,
    paddingBottom: 28,
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  greetingCard: {
    backgroundColor: COLORS.blue500,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.blue500,
    shadowColor: COLORS.shadowStrong,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 15 },
    elevation: 6,
    width: "100%",
    maxWidth: MAX_W,
    alignSelf: "center",
    alignItems: "center",
  },
  greetTitle: { color: COLORS.white, fontSize: 20, fontWeight: "800", marginBottom: 6, textAlign: "center" },
  greetSub: { color: COLORS.white, opacity: 0.9, fontSize: 13, textAlign: "center" },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: COLORS.shadowStrong,
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 25 },
    elevation: 6,
    width: "100%",
    maxWidth: MAX_W,
    alignSelf: "center",
    alignItems: "stretch",
  },
  formTitle: {
    color: COLORS.blue500,
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 12,
    textTransform: "lowercase",
    textAlign: "center",
  },
  inputPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.blue300,
  },
  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.blueIconBg,
    marginRight: 10,
  },
  inputText: { flex: 1, color: COLORS.textDark, paddingVertical: 10, fontSize: 14 },
  sectionLabel: { color: COLORS.textDark, fontWeight: "700", marginBottom: 8 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.blue300,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginHorizontal: 4,
    marginBottom: 8,
    backgroundColor: COLORS.white,
  },
  chipActive: { backgroundColor: COLORS.blue500, borderColor: COLORS.blue500 },
  chipTxt: { color: COLORS.textSub, fontWeight: "700" },
  chipTxtActive: { color: COLORS.white, fontWeight: "800" },
  ctaBtn: {
    backgroundColor: COLORS.blue500,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 14,
    alignSelf: "center",
  },
  ctaTxt: { color: COLORS.white, fontWeight: "800", fontSize: 16, textAlign: "center" },
});
