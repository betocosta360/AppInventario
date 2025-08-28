import { useRouter } from 'expo-router';
import {
  Auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { authPromise } from '../../lib/firebase'; // usa a Promise agora

export default function Login() {
  const router = useRouter();
  const [auth, setAuth] = useState<Auth | null>(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: any;
  
    authPromise.then((authInstance) => {
      setAuth(authInstance as Auth);
  
      unsubscribe = onAuthStateChanged(authInstance, (user) => {
        if (user) {
          router.replace('/(tabs)/dashboard');
        } else {
          setLoading(false);
        }
      });
    });
  
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [router]);
  

  const handleLogin = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      Alert.alert('Erro ao fazer login', error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#1a1a1a',
        }}
      >
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#1a1a1a',
      }}
    >
      <Text style={{ color: 'white', fontSize: 24, marginBottom: 30 }}>
        Faça seu login
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{
          backgroundColor: '#333',
          color: 'white',
          padding: 15,
          borderRadius: 10,
          width: '100%',
          marginBottom: 15,
        }}
      />

      <TextInput
        placeholder="Senha"
        placeholderTextColor="#ccc"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={{
          backgroundColor: '#333',
          color: 'white',
          padding: 15,
          borderRadius: 10,
          width: '100%',
          marginBottom: 20,
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: 'blue',
          borderRadius: 20,
          paddingVertical: 15,
          paddingHorizontal: 40,
          width: '100%',
          alignItems: 'center',
        }}
        disabled={loading}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Acessar</Text>
      </TouchableOpacity>
    </View>
  );
}
