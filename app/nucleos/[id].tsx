import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NUCLEOS } from '../../lib/constants';
import { db } from '../../lib/firebase';
import type { Employee, Equipment } from '../../lib/types';

export default function NucleoDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<'employee' | 'equipment' | null>(null);

  const nucleo = NUCLEOS.find(n => n.id === id);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const employeesQuery = query(
        collection(db, 'employees'),
        where('nucleoId', '==', id)
      );
      const employeesSnapshot = await getDocs(employeesQuery);
      const employeesData = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Employee[];

      const equipmentsQuery = query(
        collection(db, 'equipments'),
        where('nucleoId', '==', id)
      );
      const equipmentsSnapshot = await getDocs(equipmentsQuery);
      const equipmentsData = equipmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Equipment[];

      setEmployees(employeesData);
      setEquipments(equipmentsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEmployeeCard = ({ item }: { item: Employee }) => (
    <View style={styles.itemCard}>
      <Ionicons name="person-outline" size={20} color="#999" />
      <Text style={styles.itemText}>{item.name}</Text>
    </View>
  );

  const renderEquipmentCard = ({ item }: { item: Equipment }) => (
    <View style={styles.itemCard}>
      <Ionicons name="hardware-chip-outline" size={20} color="#999" />
      <Text style={styles.itemText}>{item.name}</Text>
    </View>
  );

  if (!nucleo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Núcleo não encontrado</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{nucleo.name}</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.card} onPress={() => {
          setSelectedType('employee');
          setModalVisible(true);
        }}>
          <View style={styles.cardHeader}>
            <Ionicons name="people-outline" size={50} color="#FAFAFA" />
            <Text style={styles.cardTitle}>Colaboradores ({employees.length})</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => {
          setSelectedType('equipment');
          setModalVisible(true);
        }}>
          <View style={styles.cardHeader}>
            <Ionicons name="hardware-chip-outline" size={50} color="#FAFAFA" />
            <Text style={styles.cardTitle}>Equipamentos ({equipments.length})</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            {selectedType === 'employee' && (
              <>
                <Text style={styles.modalTitle}>Colaboradores</Text>
                <FlatList
                  data={employees}
                  renderItem={renderEmployeeCard}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.list}
                />
              </>
            )}

            {selectedType === 'equipment' && (
              <>
                <Text style={styles.modalTitle}>Equipamentos</Text>
                <FlatList
                  data={equipments}
                  renderItem={renderEquipmentCard}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.list}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
    marginTop: 30
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FAFAFA',
    flex: 1,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    gap: 16,
    marginTop: 60,
  },
  card: {
    backgroundColor: '#27272A',
    borderRadius: 8,
    padding: 80,
   
  },
  cardHeader: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FAFAFA',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 150, //
  },
  errorText: {
    color: '#F87171',
    textAlign: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#27272A',
    borderRadius: 10,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FAFAFA',
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  itemText: {
    color: '#FAFAFA',
    fontSize: 16,
    marginLeft: 8,
  },
  modalClose: {
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  list: {
    paddingBottom: 16,
  },
});
