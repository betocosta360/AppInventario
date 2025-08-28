import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { authPromise } from '../../lib/firebase'; // só garante que o Firebase Auth carregou

export default function AuthLayout() {
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    authPromise.then(() => setFirebaseReady(true));
  }, []);

  if (!firebaseReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
