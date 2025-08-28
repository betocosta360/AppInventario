import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NUCLEOS } from '../../lib/constants';

export default function NucleosScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNucleos = NUCLEOS.filter(nucleo =>
    nucleo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNucleoPress = (nucleo: typeof NUCLEOS[number]) => {
    router.push({
      pathname: '/nucleos/[id]',
      params: { id: nucleo.id }
    });
  };

  const renderNucleoCard = ({ item }: { item: typeof NUCLEOS[number] }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleNucleoPress(item)}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
       
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#fff" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar núcleos..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredNucleos}
        renderItem={renderNucleoCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum núcleo encontrado</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 24,
    backgroundColor: '#181818',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingTop: 28,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242424',
    paddingHorizontal: 14,
  
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#fff',
    margin: 8,
    paddingVertical: 0,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#242424',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
});