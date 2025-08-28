import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.navigate('/(auth)/login')}
      >
        <Text style={styles.buttonText}>Acesse agora</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#000', // ou a cor de fundo que desejar
  },
  title: {
    color: 'white',
    marginBottom: 20,
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    padding: 20,
    backgroundColor: 'blue',
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
