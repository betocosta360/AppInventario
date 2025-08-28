import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { authPromise } from '../../lib/firebase';
import {
  getAllEmployees,
  getAllEquipment,
  getRecentEquipmentActivity,
} from '../../lib/firebaseService';
import type { Employee, Equipment } from '../../lib/types';

const statusColors: Record<string, string> = {
  'Em uso': '#4faaff',
  'Em manutenção': '#ffa500',
  'Disponível': '#00cc66',
  'Baixado': '#ff4d4d',
};

export default function Dashboard() {
  const router = useRouter();
  const [auth, setAuth] = useState<any>(null);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<{ [key: string]: number }>({});
  const [equipmentByStatus, setEquipmentByStatus] = useState<Record<string, Equipment[]>>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    authPromise.then(setAuth);

    const fetchData = async () => {
      try {
        const [equipments, employees, recent] = await Promise.all([
          getAllEquipment(),
          getAllEmployees(),
          getRecentEquipmentActivity(),
        ]);
        setEquipmentList(equipments);
        setEmployeeList(employees);
        setRecentActivity(recent);

        const typeCounts: { [key: string]: number } = {};
        const statusGroups: Record<string, Equipment[]> = {};

        equipments.forEach((item) => {
          const type = item.type || 'Desconhecido';
          const status = item.status || 'Desconhecido';
          typeCounts[type] = (typeCounts[type] || 0) + 1;
          if (!statusGroups[status]) statusGroups[status] = [];
          statusGroups[status].push(item);
        });

        const sortedTypes = Object.keys(typeCounts).sort().reduce((acc, key) => {
          acc[key] = typeCounts[key];
          return acc;
        }, {} as typeof typeCounts);

        setEquipmentTypes(sortedTypes);
        setEquipmentByStatus(statusGroups);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert('Erro ao sair', error.message);
    }
  };

  const openStatusModal = (status: string) => {
    setSelectedStatus(status);
    setStatusModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="exit-outline" size={30} color="white" />
      </TouchableOpacity>

      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, styles.cardColumn]}>
          <Ionicons name="people" size={28} color="#fff" />
          <Text style={styles.cardText}>{employeeList.length} Colaboradores</Text>
        </View>

        <View style={[styles.summaryCard, styles.cardColumn]}>
          <Ionicons name="hardware-chip-outline" size={28} color="#fff" />
          <Text style={styles.cardText}>{equipmentList.length} Equipamentos</Text>
        </View>

        <View style={[styles.summaryCard, styles.cardColumn, styles.summaryCardLarge]}>
          <Ionicons name="stats-chart-outline" size={28} color="#fff" />
          <Text style={[styles.cardText, { marginBottom: 8 }]}>
            Tipos{'\n'}de{'\n'}equipamentos
          </Text>
          {Object.entries(equipmentTypes).map(([type, count]) => (
            <Text key={type} style={styles.equipmentTypeText}>
              {type}: {count}
            </Text>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.summaryCard, styles.cardColumn, styles.summaryCardLarge]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="time-outline" size={28} color="#fff" />
          <Text style={[styles.cardText, { marginBottom: 8 }]}>
            Últimas{'\n'}atualizações
          </Text>
          {recentActivity.slice(0, 1).map((activity, index) => (
            <View key={index} style={{ marginBottom: 6 }}>
              <Text style={[styles.cardText, { fontSize: 11 }]}>{activity.description}</Text>
              <Text style={[styles.cardText, { opacity: 0.7, fontSize: 10 }]}>{activity.date}</Text>
            </View>
          ))}
          <Text style={[styles.cardText, { color: '#4faaff', marginTop: 6 }]}>Ver todas</Text>
        </TouchableOpacity>

        <View style={[styles.summaryCardLarge, { marginTop: 12 }]}>
          <Text style={[styles.cardText, { marginBottom: 8, fontWeight: 'bold' }]}>
            Status dos equipamentos
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(equipmentByStatus).map(([status, items]) => (
              <TouchableOpacity
                key={status}
                onPress={() => openStatusModal(status)}
                style={{
                  backgroundColor: statusColors[status] || '#999',
                  padding: 12,
                  borderRadius: 12,
                  marginRight: 12,
                  width: 160,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', marginBottom: 6 }}>{status}</Text>
                <Text style={{ color: '#fff' }}>{items.length} equipamentos</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Modal de atualizações */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Todas as atualizações</Text>
            <ScrollView style={{ marginTop: 10 }}>
              {recentActivity.map((activity, index) => (
                <View key={index} style={{ marginBottom: 10 }}>
                  <Text style={{ color: '#fff', fontSize: 12 }}>{activity.description}</Text>
                  <Text style={{ color: '#aaa', fontSize: 10 }}>{activity.date}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de equipamentos por status */}
      <Modal visible={statusModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Equipamentos - {selectedStatus}
            </Text>
            <ScrollView style={{ marginTop: 10 }}>
              {(equipmentByStatus[selectedStatus || ''] || []).map((eq, index) => (
                <View key={index} style={{ marginBottom: 10 }}>
                  <Text style={{ color: '#fff', fontSize: 13 }}>{eq.name}</Text>
                  <Text style={{ color: '#aaa', fontSize: 11 }}>Tipo: {eq.type}</Text>
                  <Text style={{ color: '#aaa', fontSize: 11 }}>Localização: {eq.nucleoId || 'Não informada'}</Text>
                  <Text style={{ color: '#aaa', fontSize: 11 }}>Nº de série: {eq.serialNumber || 'Não informado'}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    paddingTop: 80,
  },
  logoutButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  summaryCard: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '48%',
    minWidth: 150,
    maxWidth: '48%',
    gap: 12,
    alignItems: 'center',
  },
  cardColumn: {
    flexDirection: 'column',
  },
  summaryCardLarge: {
    width: '100%',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
  },
  cardText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  equipmentTypeText: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: '#000000cc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#4faaff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});
