import { Colors } from '@/constants/Colors';
import { DEPARTMENTS, EQUIPMENT_STATUSES, EQUIPMENT_TYPES, NUCLEOS } from '@/lib/constants';
import { db } from '@/lib/firebase';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, orderBy, query, startAfter, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Equipment } from '../../lib/types';
import { colors } from '../../styles';

export default function Equipamentos() {
  const colorScheme = useColorScheme() ?? 'dark';

  const { nucleoId } = useLocalSearchParams();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedEquipment, setEditedEquipment] = useState<Equipment | null>(null);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadEquipments();
  }, []);

  useEffect(() => {
    filterEquipments();
  }, [searchQuery, equipments]);

  const loadEquipments = async (isLoadingMore = false) => {
    try {
      if (!isLoadingMore) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const equipmentsRef = collection(db, 'equipments');
      let q = query(
        equipmentsRef,
        orderBy('name')
      );

      if (nucleoId) {
        q = query(
          equipmentsRef,
          orderBy('name'),
          where('nucleoId', '==', nucleoId)
        );
      }

      if (isLoadingMore && lastVisible) {
        q = query(
          equipmentsRef,
          orderBy('name'),
          startAfter(lastVisible),
          ...(nucleoId ? [where('nucleoId', '==', nucleoId)] : [])
        );
      }

      const querySnapshot = await getDocs(q);
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc);

      const equipmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Equipment[];

      if (isLoadingMore) {
        setEquipments(prev => [...prev, ...equipmentsData]);
      } else {
        setEquipments(equipmentsData);
      }
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os equipamentos.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const filterEquipments = () => {
    if (!searchQuery.trim()) {
      setFilteredEquipments(equipments);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = equipments.filter(equipment =>
      equipment.name.toLowerCase().includes(query) ||
      equipment.serialNumber.toLowerCase().includes(query) ||
      equipment.type.toLowerCase().includes(query) ||
      equipment.status.toLowerCase().includes(query) ||
      equipment.departmentId?.toLowerCase().includes(query) ||
      equipment.nucleoId?.toLowerCase().includes(query)
    );

    setFilteredEquipments(filtered);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este equipamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'equipments', id));
              setEquipments(prev => prev.filter(eq => eq.id !== id));
              setFilteredEquipments(prev => prev.filter(eq => eq.id !== id));
              Alert.alert('Sucesso', 'Equipamento excluído com sucesso!');
            } catch (error) {
              console.error('Erro ao excluir equipamento:', error);
              Alert.alert('Erro', 'Não foi possível excluir o equipamento.');
            }
          }
        }
      ]
    );
  };

  const handleEdit = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setEditedEquipment(equipment);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedEquipment) return;

    try {
      const equipmentRef = doc(db, 'equipments', selectedEquipment.id);
      await updateDoc(equipmentRef, {
        ...selectedEquipment,
        updatedAt: new Date().toISOString(),
      });

      // Atualizar a lista local
      const updatedEquipments = equipments.map(eq =>
        eq.id === selectedEquipment.id ? selectedEquipment : eq
      );
      setEquipments(updatedEquipments);
      setFilteredEquipments(updatedEquipments);

      setEditModalVisible(false);
      Alert.alert('Sucesso', 'Equipamento atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o equipamento.');
    }
  };

  const handleView = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em uso':
        return colors.success;
      case 'Em manutenção':
        return colors.warning;
      case 'Disponível':
        return colors.info;
      case 'Baixado':
        return colors.error;
      default:
        return colors.text;
    }
  };

  const renderEquipmentCard = ({ item }: { item: Equipment }) => (
    <View style={[styles.card, {
      backgroundColor: colorScheme === 'dark' ? '#27272A' : '#FFFFFF',
      borderColor: colorScheme === 'dark' ? '#3F3F46' : '#E5E7EB'
    }]}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: Colors[colorScheme].text }]} numberOfLines={2}>{item.name}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, {
                backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6'
              }]}
              onPress={() => handleView(item)}
            >
              <Ionicons name="eye" size={20} color={Colors[colorScheme].text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, {
                backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6'
              }]}
              onPress={() => handleEdit(item)}
            >
              <Ionicons name="pencil" size={20} color={Colors[colorScheme].text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, {
                backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6'
              }]}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash" size={20} color={Colors[colorScheme].text} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardText, { color: Colors[colorScheme].text }]} numberOfLines={1}>
            <Ionicons name="barcode-outline" size={16} color={Colors[colorScheme].icon} /> {item.serialNumber}
          </Text>
          <Text style={[styles.cardText, { color: Colors[colorScheme].text }]} numberOfLines={1}>
            <Ionicons name="hardware-chip-outline" size={16} color={Colors[colorScheme].icon} /> {item.type}
          </Text>
          <Text style={[styles.cardText, { color: Colors[colorScheme].text }]} numberOfLines={1}>
            <Ionicons name="checkmark-circle-outline" size={16} color={Colors[colorScheme].icon} /> {item.status}
          </Text>
          {item.departmentId && (
            <Text style={[styles.cardText, { color: Colors[colorScheme].text }]} numberOfLines={1}>
              <Ionicons name="business-outline" size={16} color={Colors[colorScheme].icon} /> {item.departmentId}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContent, {
          backgroundColor: colorScheme === 'dark' ? '#27272A' : '#FFFFFF',
          borderColor: colorScheme === 'dark' ? '#3F3F46' : '#E5E7EB'
        }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: Colors[colorScheme].text }]}>Detalhes do Equipamento</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {selectedEquipment && (
              <>
                <View style={styles.modalSection}>
                  <Text style={[styles.modalLabel, { color: Colors[colorScheme].text }]}>Nome</Text>
                  <Text style={[styles.modalValue, { color: Colors[colorScheme].text }]}>{selectedEquipment.name}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={[styles.modalLabel, { color: Colors[colorScheme].text }]}>Status</Text>
                  <Text style={[styles.modalValue, { color: getStatusColor(selectedEquipment.status) }]}>
                    {selectedEquipment.status}
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={[styles.modalLabel, { color: Colors[colorScheme].text }]}>Tipo</Text>
                  <Text style={[styles.modalValue, { color: Colors[colorScheme].text }]}>{selectedEquipment.type}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={[styles.modalLabel, { color: Colors[colorScheme].text }]}>Número de Série</Text>
                  <Text style={[styles.modalValue, { color: Colors[colorScheme].text }]}>{selectedEquipment.serialNumber}</Text>
                </View>

                {selectedEquipment.departmentId && (
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: Colors[colorScheme].text }]}>Departamento</Text>
                    <Text style={[styles.modalValue, { color: Colors[colorScheme].text }]}>{selectedEquipment.departmentId}</Text>
                  </View>
                )}

                {selectedEquipment.nucleoId && (
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: Colors[colorScheme].text }]}>Núcleo</Text>
                    <Text style={[styles.modalValue, { color: Colors[colorScheme].text }]}>{selectedEquipment.nucleoId}</Text>
                  </View>
                )}

                {selectedEquipment.model && (
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: Colors[colorScheme].text }]}>Modelo</Text>
                    <Text style={[styles.modalValue, { color: Colors[colorScheme].text }]}>{selectedEquipment.model}</Text>
                  </View>
                )}

                {selectedEquipment.manufacturer && (
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: Colors[colorScheme].text }]}>Fabricante</Text>
                    <Text style={[styles.modalValue, { color: Colors[colorScheme].text }]}>{selectedEquipment.manufacturer}</Text>
                  </View>
                )}

                {selectedEquipment.ipAddress && (
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: Colors[colorScheme].text }]}>Endereço IP</Text>
                    <Text style={[styles.modalValue, { color: Colors[colorScheme].text }]}>{selectedEquipment.ipAddress}</Text>
                  </View>
                )}

                {selectedEquipment.notes && (
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: Colors[colorScheme].text }]}>Observações</Text>
                    <Text style={[styles.modalValue, { color: Colors[colorScheme].text }]}>{selectedEquipment.notes}</Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderEditModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContent, {
          backgroundColor: colorScheme === 'dark' ? '#27272A' : '#FFFFFF',
          borderColor: colorScheme === 'dark' ? '#3F3F46' : '#E5E7EB'
        }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: Colors[colorScheme].text }]}>Editar Equipamento</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {selectedEquipment && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Nome</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                    }]}
                    value={selectedEquipment.name}
                    onChangeText={(text) => setSelectedEquipment({ ...selectedEquipment, name: text })}
                    placeholder="Nome do equipamento"
                    placeholderTextColor={Colors[colorScheme].icon}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Tipo</Text>
                  <View style={[styles.pickerContainer, {
                    backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                    borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                  }]}>
                    <Picker
                      selectedValue={selectedEquipment.type}
                      onValueChange={(value: Equipment['type']) => setSelectedEquipment({ ...selectedEquipment, type: value })}
                      style={[styles.picker, {
                        color: Colors[colorScheme].text,
                        backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6'
                      }]}
                      dropdownIconColor={Colors[colorScheme].icon}
                    >
                      <Picker.Item label="Selecione um tipo" value="" color={Colors[colorScheme].icon} />
                      {EQUIPMENT_TYPES.map((type) => (
                        <Picker.Item
                          key={type}
                          label={type}
                          value={type}
                          color={Colors[colorScheme].text}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Status</Text>
                  <View style={[styles.pickerContainer, {
                    backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                    borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                  }]}>
                    <Picker
                      selectedValue={selectedEquipment.status}
                      onValueChange={(value: Equipment['status']) => setSelectedEquipment({ ...selectedEquipment, status: value })}
                      style={[styles.picker, {
                        color: Colors[colorScheme].text,
                        backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6'
                      }]}
                      dropdownIconColor={Colors[colorScheme].icon}
                    >
                      <Picker.Item label="Selecione um status" value="" color={Colors[colorScheme].icon} />
                      {EQUIPMENT_STATUSES.map((status) => (
                        <Picker.Item
                          key={status}
                          label={status}
                          value={status}
                          color={Colors[colorScheme].text}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Número de Série</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                    }]}
                    value={selectedEquipment.serialNumber}
                    onChangeText={(text) => setSelectedEquipment({ ...selectedEquipment, serialNumber: text })}
                    placeholder="Número de série do equipamento"
                    placeholderTextColor={Colors[colorScheme].icon}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Departamento</Text>
                  <View style={[styles.pickerContainer, {
                    backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                    borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                  }]}>
                    <Picker
                      selectedValue={selectedEquipment.departmentId}
                      onValueChange={(value: Equipment['departmentId']) => setSelectedEquipment({ ...selectedEquipment, departmentId: value })}
                      style={[styles.picker, {
                        color: Colors[colorScheme].text,
                        backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6'
                      }]}
                      dropdownIconColor={Colors[colorScheme].icon}
                    >
                      <Picker.Item label="Selecione um departamento" value="" color={Colors[colorScheme].icon} />
                      {DEPARTMENTS.map((dept) => (
                        <Picker.Item
                          key={dept}
                          label={dept}
                          value={dept}
                          color={Colors[colorScheme].text}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Núcleo</Text>
                  <View style={[styles.pickerContainer, {
                    backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                    borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                  }]}>
                    <Picker
                      selectedValue={selectedEquipment.nucleoId}
                      onValueChange={(value: Equipment['nucleoId']) => setSelectedEquipment({ ...selectedEquipment, nucleoId: value })}
                      style={[styles.picker, {
                        color: Colors[colorScheme].text,
                        backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6'
                      }]}
                      dropdownIconColor={Colors[colorScheme].icon}
                    >
                      <Picker.Item label="Selecione um núcleo" value="" color={Colors[colorScheme].icon} />
                      {NUCLEOS.map((nucleo) => (
                        <Picker.Item
                          key={nucleo.id}
                          label={nucleo.name}
                          value={nucleo.id}
                          color={Colors[colorScheme].text}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Modelo</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                    }]}
                    value={selectedEquipment.model}
                    onChangeText={(text) => setSelectedEquipment({ ...selectedEquipment, model: text })}
                    placeholder="Modelo do equipamento"
                    placeholderTextColor={Colors[colorScheme].icon}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Fabricante</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                    }]}
                    value={selectedEquipment.manufacturer}
                    onChangeText={(text) => setSelectedEquipment({ ...selectedEquipment, manufacturer: text })}
                    placeholder="Fabricante do equipamento"
                    placeholderTextColor={Colors[colorScheme].icon}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Endereço IP</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                    }]}
                    value={selectedEquipment.ipAddress}
                    onChangeText={(text) => setSelectedEquipment({ ...selectedEquipment, ipAddress: text })}
                    placeholder="Endereço IP do equipamento"
                    placeholderTextColor={Colors[colorScheme].icon}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Observações</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                    }]}
                    value={selectedEquipment.notes}
                    onChangeText={(text) => setSelectedEquipment({ ...selectedEquipment, notes: text })}
                    placeholder="Observações sobre o equipamento"
                    placeholderTextColor={Colors[colorScheme].icon}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton, {
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6'
                    }]}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={[styles.buttonText, { color: Colors[colorScheme].text }]}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton, { backgroundColor: Colors[colorScheme].tint }]}
                    onPress={handleSaveEdit}
                  >
                    <Text style={[styles.buttonText, { color: Colors[colorScheme].background }]}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadEquipments(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </View>
    );
  }
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: Colors[colorScheme].text }]}>Equipamentos</Text>

        <View style={styles.searchRow}>
          <View style={[styles.searchContainer, {
            backgroundColor: colorScheme === 'dark' ? '#27272A' : '#F3F4F6',
            borderColor: colorScheme === 'dark' ? '#3F3F46' : '#E5E7EB'
          }]}>
            <Ionicons name="search" size={20} color={Colors[colorScheme].icon} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: Colors[colorScheme].text }]}
              placeholder="Buscar equipamento..."
              placeholderTextColor={Colors[colorScheme].icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: Colors[colorScheme].tint }]}
            onPress={() => router.push('/equipamentos/new')}
          >
            <Ionicons name="add" size={24} color={Colors[colorScheme].background} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredEquipments}
            keyExtractor={item => item.id}
            renderItem={renderEquipmentCard}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: Colors[colorScheme].icon }]}>
                  {searchQuery ? 'Nenhum equipamento encontrado.' : 'Nenhum equipamento cadastrado.'}
                </Text>
              </View>
            }
          />
        )}
        {renderModal()}
        {renderEditModal()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    flex: 1,
    marginRight: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    gap: 8,
  },
  cardText: {
    fontSize: 14,
    color: Colors.dark.text,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalBody: {
    maxHeight: '90%',
  },
  modalSection: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#27272a',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272a',
    borderRadius: 8,
    padding: 4,
  },
  picker: {
    flex: 1,
  },
  pickerOption: {
    padding: 12,
    borderRadius: 8,
    marginRight: 4,
  },
  pickerOptionSelected: {
    backgroundColor: Colors.dark.tint,
  },
  pickerOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  pickerOptionTextSelected: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: Colors.dark.tint,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  modalButton: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#3F3F46',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});