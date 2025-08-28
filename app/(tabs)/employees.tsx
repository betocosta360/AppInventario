import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Department, DEPARTMENTS, NucleoId, NUCLEOS } from '../../lib/constants';
import { addEmployee, deleteEmployee, getAllEmployees } from '../../lib/firebaseService';
import { Employee } from '../../lib/types';

const ITEMS_PER_PAGE = 10;

export default function Colaboradores() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme() ?? 'dark';
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    registration: '',
    networkUsername: '',
    department: '' as Department | '',
    nucleoId: '' as NucleoId | '',
    email: '',
    phone: '',
    position: '',
  });
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editedEmployee, setEditedEmployee] = useState<Employee | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [searchQuery, employees]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const employeesData = await getAllEmployees();
      setEmployees(employeesData);
      setFilteredEmployees(employeesData);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      Alert.alert('Erro', 'Não foi possível carregar os colaboradores.');
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = employees.filter(employee => 
      employee.name.toLowerCase().includes(query) ||
      employee.email?.toLowerCase().includes(query) ||
      employee.department?.toLowerCase().includes(query)
    );
    
    setFilteredEmployees(filtered);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditedEmployee(employee);
    setEditModalVisible(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir o colaborador ${employee.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEmployee(employee.id);
              await loadEmployees();
              Alert.alert('Sucesso', 'Colaborador excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Erro ao excluir colaborador');
            }
          }
        }
      ]
    );
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalVisible(true);
  };

  const handleAddEmployee = async () => {
    try {
      if (!newEmployee.name.trim()) {
        Alert.alert('Erro', 'O nome do colaborador é obrigatório.');
        return;
      }

      await addEmployee({
        name: newEmployee.name,
        registration: newEmployee.registration || undefined,
        networkUsername: newEmployee.networkUsername || undefined,
        department: newEmployee.department || null,
        nucleoId: newEmployee.nucleoId || null,
        email: newEmployee.email || undefined,
        phone: newEmployee.phone || undefined,
        position: newEmployee.position || undefined,
      });

      setModalVisible(false);
      setNewEmployee({
        name: '',
        registration: '',
        networkUsername: '',
        department: '' as Department | '',
        nucleoId: '' as NucleoId | '',
        email: '',
        phone: '',
        position: '',
      });
      await loadEmployees();
      Alert.alert('Sucesso', 'Colaborador cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao cadastrar colaborador:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o colaborador.');
    }
  };

  const handleSaveEdit = async () => {
    if (!editedEmployee) return;

    try {
      await deleteEmployee(editedEmployee.id);
      await addEmployee(editedEmployee);
      await loadEmployees();
      setEditModalVisible(false);
      Alert.alert('Sucesso', 'Colaborador editado com sucesso!');
    } catch (error) {
      console.error('Erro ao editar colaborador:', error);
      Alert.alert('Erro', 'Não foi possível editar o colaborador.');
    }
  };

  const renderEmployeeCard = ({ item }: { item: Employee }) => (
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
              onPress={() => handleViewEmployee(item)}
            >
              <Ionicons name="eye" size={20} color={Colors[colorScheme].text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { 
                backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6'
              }]}
              onPress={() => handleEditEmployee(item)}
            >
              <Ionicons name="pencil" size={20} color={Colors[colorScheme].text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { 
                backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6'
              }]}
              onPress={() => handleDeleteEmployee(item)}
            >
              <Ionicons name="trash" size={20} color={Colors[colorScheme].text} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardText, { color: Colors[colorScheme].text }]} numberOfLines={1}>
            <Ionicons name="mail-outline" size={16} color={Colors[colorScheme].icon} /> {item.email || 'Não informado'}
          </Text>
          <Text style={[styles.cardText, { color: Colors[colorScheme].text }]} numberOfLines={1}>
            <Ionicons name="business-outline" size={16} color={Colors[colorScheme].icon} /> {item.department || 'Não informado'}
          </Text>
          <Text style={[styles.cardText, { color: Colors[colorScheme].text }]} numberOfLines={1}>
            <Ionicons name="location-outline" size={16} color={Colors[colorScheme].icon} /> {item.nucleoId || 'Não informado'}
          </Text>
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
            <Text style={[styles.modalTitle, { color: Colors[colorScheme].text }]}>Detalhes do Colaborador</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {selectedEmployee && (
              <>
                <View style={styles.modalSection}>
                  <Text style={[styles.modalLabel, { color: Colors[colorScheme].text }]}>Nome</Text>
                  <Text style={[styles.modalValue, { color: Colors[colorScheme].text }]}>{selectedEmployee.name}</Text>
                </View>

                {selectedEmployee.registration && (
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: Colors[colorScheme].text }]}>Matrícula</Text>
                    <Text style={[styles.modalValue, { color: Colors[colorScheme].text }]}>{selectedEmployee.registration}</Text>
                  </View>
                )}

                {selectedEmployee.networkUsername && (
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: Colors[colorScheme].text }]}>Usuário de Rede</Text>
                    <Text style={[styles.modalValue, { color: Colors[colorScheme].text }]}>{selectedEmployee.networkUsername}</Text>
                  </View>
                )}

                {selectedEmployee.department && (
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: Colors[colorScheme].text }]}>Departamento</Text>
                    <Text style={[styles.modalValue, { color: Colors[colorScheme].text }]}>{selectedEmployee.department}</Text>
                  </View>
                )}

                {selectedEmployee.nucleoId && (
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: Colors[colorScheme].text }]}>Núcleo</Text>
                    <Text style={[styles.modalValue, { color: Colors[colorScheme].text }]}>{selectedEmployee.nucleoId}</Text>
                  </View>
                )}

                {selectedEmployee.email && (
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: Colors[colorScheme].text }]}>E-mail</Text>
                    <Text style={[styles.modalValue, { color: Colors[colorScheme].text }]}>{selectedEmployee.email}</Text>
                  </View>
                )}

                {selectedEmployee.phone && (
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: Colors[colorScheme].text }]}>Telefone</Text>
                    <Text style={[styles.modalValue, { color: Colors[colorScheme].text }]}>{selectedEmployee.phone}</Text>
                  </View>
                )}

                {selectedEmployee.position && (
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: Colors[colorScheme].text }]}>Cargo</Text>
                    <Text style={[styles.modalValue, { color: Colors[colorScheme].text }]}>{selectedEmployee.position}</Text>
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
            <Text style={[styles.modalTitle, { color: Colors[colorScheme].text }]}>Editar Colaborador</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {editedEmployee && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Nome</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                    }]}
                    value={editedEmployee.name}
                    onChangeText={(text) => setEditedEmployee({...editedEmployee, name: text})}
                    placeholder="Nome completo"
                    placeholderTextColor={Colors[colorScheme].icon}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Matrícula</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                    }]}
                    value={editedEmployee.registration}
                    onChangeText={(text) => setEditedEmployee({...editedEmployee, registration: text})}
                    placeholder="Número da matrícula"
                    placeholderTextColor={Colors[colorScheme].icon}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Usuário de Rede</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                    }]}
                    value={editedEmployee.networkUsername}
                    onChangeText={(text) => setEditedEmployee({...editedEmployee, networkUsername: text})}
                    placeholder="Nome de usuário da rede"
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
                      selectedValue={editedEmployee.department}
                      onValueChange={(value) => setEditedEmployee({...editedEmployee, department: value})}
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
                      selectedValue={editedEmployee.nucleoId}
                      onValueChange={(value) => setEditedEmployee({...editedEmployee, nucleoId: value})}
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
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>E-mail</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                    }]}
                    value={editedEmployee.email}
                    onChangeText={(text) => setEditedEmployee({...editedEmployee, email: text})}
                    placeholder="E-mail corporativo"
                    placeholderTextColor={Colors[colorScheme].icon}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Telefone</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                    }]}
                    value={editedEmployee.phone}
                    onChangeText={(text) => setEditedEmployee({...editedEmployee, phone: text})}
                    placeholder="Número de telefone"
                    placeholderTextColor={Colors[colorScheme].icon}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Cargo</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                    }]}
                    value={editedEmployee.position}
                    onChangeText={(text) => setEditedEmployee({...editedEmployee, position: text})}
                    placeholder="Cargo/Função"
                    placeholderTextColor={Colors[colorScheme].icon}
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4faaff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: Colors[colorScheme].text }]}>Colaboradores</Text>
        
        <View style={styles.searchRow}>
          <View style={[styles.searchContainer, { 
            backgroundColor: colorScheme === 'dark' ? '#27272A' : '#F3F4F6',
            borderColor: colorScheme === 'dark' ? '#3F3F46' : '#E5E7EB'
          }]}>
            <Ionicons name="search" size={20} color={Colors[colorScheme].icon} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: Colors[colorScheme].text }]}
              placeholder="Buscar colaboradores..."
              placeholderTextColor={Colors[colorScheme].icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: Colors[colorScheme].tint }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color={Colors[colorScheme].background} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredEmployees}
          renderItem={renderEmployeeCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: Colors[colorScheme].icon }]}>
                {searchQuery ? 'Nenhum colaborador encontrado.' : 'Nenhum colaborador cadastrado.'}
              </Text>
            </View>
          }
        />

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={[styles.modalContent, { 
              backgroundColor: colorScheme === 'dark' ? '#27272A' : '#FFFFFF',
            }]}>
              <Text style={[styles.modalTitle, { color: Colors[colorScheme].text }]}>Novo Colaborador</Text>
              
              <ScrollView style={styles.modalScroll}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Nome *</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                    }]}
                    value={newEmployee.name}
                    onChangeText={(text) => setNewEmployee(prev => ({ ...prev, name: text }))}
                    placeholder="Nome completo"
                    placeholderTextColor={Colors[colorScheme].icon}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Matrícula</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                    }]}
                    value={newEmployee.registration}
                    onChangeText={(text) => setNewEmployee(prev => ({ ...prev, registration: text }))}
                    placeholder="Número da matrícula"
                    placeholderTextColor={Colors[colorScheme].icon}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Usuário de Rede</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                    }]}
                    value={newEmployee.networkUsername}
                    onChangeText={(text) => setNewEmployee(prev => ({ ...prev, networkUsername: text }))}
                    placeholder="Nome de usuário da rede"
                    placeholderTextColor={Colors[colorScheme].icon}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Departamento</Text>
                  <View style={[styles.pickerContainer, { 
                    backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                    borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                  }]}>
                    <Picker
                      selectedValue={newEmployee.department}
                      onValueChange={(value) => setNewEmployee(prev => ({ ...prev, department: value }))}
                      style={[styles.picker, { 
                        color: Colors[colorScheme].text,
                        backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6'
                      }]}
                      dropdownIconColor={Colors[colorScheme].icon}
                      itemStyle={{ height: 50 }}
                    >
                      <Picker.Item label="Selecione um departamento" value="" color={Colors[colorScheme].icon} />
                      {DEPARTMENTS.map((dept) => (
                        <Picker.Item 
                          key={dept} 
                          label={dept} 
                          value={dept} 
                          color={Colors[colorScheme].text}
                          style={{ height: 50, backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6' }}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Núcleo</Text>
                  <View style={[styles.pickerContainer, { 
                    backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                    borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                  }]}>
                    <Picker
                      selectedValue={newEmployee.nucleoId}
                      onValueChange={(value) => setNewEmployee(prev => ({ ...prev, nucleoId: value }))}
                      style={[styles.picker, { 
                        color: Colors[colorScheme].text,
                        backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6'
                      }]}
                      dropdownIconColor={Colors[colorScheme].icon}
                      itemStyle={{ height: 50 }}
                    >
                      <Picker.Item label="Selecione um núcleo" value="" color={Colors[colorScheme].icon} />
                      {NUCLEOS.map((nucleo) => (
                        <Picker.Item 
                          key={nucleo.id} 
                          label={nucleo.name} 
                          value={nucleo.id} 
                          color={Colors[colorScheme].text}
                          style={{ height: 50, backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6' }}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>E-mail</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                    }]}
                    value={newEmployee.email}
                    onChangeText={(text) => setNewEmployee(prev => ({ ...prev, email: text }))}
                    placeholder="E-mail corporativo"
                    placeholderTextColor={Colors[colorScheme].icon}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Telefone</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                    }]}
                    value={newEmployee.phone}
                    onChangeText={(text) => setNewEmployee(prev => ({ ...prev, phone: text }))}
                    placeholder="Número de telefone"
                    placeholderTextColor={Colors[colorScheme].icon}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Cargo</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6',
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#52525B' : '#E5E7EB'
                    }]}
                    value={newEmployee.position}
                    onChangeText={(text) => setNewEmployee(prev => ({ ...prev, position: text }))}
                    placeholder="Cargo/Função"
                    placeholderTextColor={Colors[colorScheme].icon}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton, { 
                    backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#F3F4F6'
                  }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.buttonText, { color: Colors[colorScheme].text }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton, { backgroundColor: Colors[colorScheme].tint }]}
                  onPress={handleAddEmployee}
                >
                  <Text style={[styles.buttonText, { color: Colors[colorScheme].background }]}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    backgroundColor: '#27272A',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  addButton: {
    backgroundColor: Colors.dark.tint,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.dark.icon,
    textAlign: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
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
    color: Colors.dark.text,
    marginBottom: 0,
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: Colors.dark.text,
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#3F3F46',
    borderRadius: 8,
    padding: 14,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: '#52525B',
    height: 60,
  },
  pickerContainer: {
    backgroundColor: '#3F3F46',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#52525B',
    overflow: 'hidden',
    height: 60,
  },
  picker: {
    color: Colors.dark.text,
    height: 60,
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#3F3F46',
  },
  saveButton: {
    backgroundColor: Colors.dark.tint,
  },
  buttonText: {
    color: Colors.dark.text,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    maxHeight: '90%',
  },
  inputContainer: {
    marginBottom: 16,
  },
}); 