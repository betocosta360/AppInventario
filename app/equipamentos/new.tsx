import { Colors } from '@/constants/Colors';
import { DEPARTMENTS, EQUIPMENT_STATUSES, EQUIPMENT_TYPES, NUCLEOS } from '@/lib/constants';
import { db } from '@/lib/firebase';
import { Equipment, EquipmentStatus, EquipmentType } from '@/lib/types';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function NewEquipment() {
  const [equipment, setEquipment] = useState<Partial<Equipment>>({
    name: '',
    serialNumber: '',
    type: 'Computador' as EquipmentType,
    status: 'Disponível' as EquipmentStatus,
    departmentId: null,
    nucleoId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const colorScheme = useColorScheme() ?? 'dark';

  const handleSave = async () => {
    try {
      if (!equipment.name || !equipment.serialNumber || !equipment.type || !equipment.status) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      const equipmentData = {
        ...equipment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'equipments'), equipmentData);
      Alert.alert('Sucesso', 'Equipamento cadastrado com sucesso!');
      router.back();
    } catch (error) {
      console.error('Erro ao cadastrar equipamento:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o equipamento.');
    }
  };

  const pickerStyle = {
    color: Colors[colorScheme].text,
    backgroundColor: colorScheme === 'dark' ? '#27272A' : '#FFFFFF',
  };

  const pickerItemStyle = {
    color: Colors[colorScheme].text,
    backgroundColor: colorScheme === 'dark' ? '#27272A' : '#FFFFFF',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <View style={styles.formContainer}>
        <Text style={[styles.label, { color: Colors[colorScheme].text }]}>Nome do Equipamento *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colorScheme === 'dark' ? '#27272A' : '#FFFFFF',
            color: Colors[colorScheme].text,
            borderColor: colorScheme === 'dark' ? '#3F3F46' : '#E5E7EB'
          }]}
          value={equipment.name}
          onChangeText={(text) => setEquipment(prev => ({ ...prev, name: text }))}
          placeholder="Digite o nome do equipamento"
          placeholderTextColor={Colors[colorScheme].icon}
        />

        <Text style={[styles.label, { color: Colors[colorScheme].text }]}>Número de Série *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colorScheme === 'dark' ? '#27272A' : '#FFFFFF',
            color: Colors[colorScheme].text,
            borderColor: colorScheme === 'dark' ? '#3F3F46' : '#E5E7EB'
          }]}
          value={equipment.serialNumber}
          onChangeText={(text) => setEquipment(prev => ({ ...prev, serialNumber: text }))}
          placeholder="Digite o número de série"
          placeholderTextColor={Colors[colorScheme].icon}
        />

        <Text style={[styles.label, { color: Colors[colorScheme].text }]}>Tipo *</Text>
        <View style={[styles.pickerContainer, { 
          backgroundColor: colorScheme === 'dark' ? '#27272A' : '#FFFFFF',
          borderColor: colorScheme === 'dark' ? '#3F3F46' : '#E5E7EB'
        }]}>
          <Picker
            selectedValue={equipment.type}
            onValueChange={(value: EquipmentType) => setEquipment(prev => ({ ...prev, type: value }))}
            style={pickerStyle}
            dropdownIconColor={Colors[colorScheme].text}
            mode="dropdown"
          >
            {EQUIPMENT_TYPES.map((type) => (
              <Picker.Item 
                key={type} 
                label={type} 
                value={type}
                color={Colors[colorScheme].text}
                style={pickerItemStyle}
              />
            ))}
          </Picker>
        </View>

        <Text style={[styles.label, { color: Colors[colorScheme].text }]}>Status *</Text>
        <View style={[styles.pickerContainer, { 
          backgroundColor: colorScheme === 'dark' ? '#27272A' : '#FFFFFF',
          borderColor: colorScheme === 'dark' ? '#3F3F46' : '#E5E7EB'
        }]}>
          <Picker
            selectedValue={equipment.status}
            onValueChange={(value: EquipmentStatus) => setEquipment(prev => ({ ...prev, status: value }))}
            style={pickerStyle}
            dropdownIconColor={Colors[colorScheme].text}
            mode="dropdown"
          >
            {EQUIPMENT_STATUSES.map((status) => (
              <Picker.Item 
                key={status} 
                label={status} 
                value={status}
                color={Colors[colorScheme].text}
                style={pickerItemStyle}
              />
            ))}
          </Picker>
        </View>

        <Text style={[styles.label, { color: Colors[colorScheme].text }]}>Departamento</Text>
        <View style={[styles.pickerContainer, { 
          backgroundColor: colorScheme === 'dark' ? '#27272A' : '#FFFFFF',
          borderColor: colorScheme === 'dark' ? '#3F3F46' : '#E5E7EB'
        }]}>
          <Picker
            selectedValue={equipment.departmentId}
            onValueChange={(value) => setEquipment(prev => ({ ...prev, departmentId: value }))}
            style={pickerStyle}
            dropdownIconColor={Colors[colorScheme].text}
            mode="dropdown"
          >
            <Picker.Item 
              label="Selecione um departamento" 
              value={null}
              color={Colors[colorScheme].text}
              style={pickerItemStyle}
            />
            {DEPARTMENTS.map((dept) => (
              <Picker.Item 
                key={dept} 
                label={dept} 
                value={dept}
                color={Colors[colorScheme].text}
                style={pickerItemStyle}
              />
            ))}
          </Picker>
        </View>

        <Text style={[styles.label, { color: Colors[colorScheme].text }]}>Núcleo</Text>
        <View style={[styles.pickerContainer, { 
          backgroundColor: colorScheme === 'dark' ? '#27272A' : '#FFFFFF',
          borderColor: colorScheme === 'dark' ? '#3F3F46' : '#E5E7EB'
        }]}>
          <Picker
            selectedValue={equipment.nucleoId}
            onValueChange={(value) => setEquipment(prev => ({ ...prev, nucleoId: value }))}
            style={pickerStyle}
            dropdownIconColor={Colors[colorScheme].text}
            mode="dropdown"
          >
            <Picker.Item 
              label="Selecione um núcleo" 
              value={null}
              color={Colors[colorScheme].text}
              style={pickerItemStyle}
            />
            {NUCLEOS.map((nucleo) => (
              <Picker.Item 
                key={nucleo.id} 
                label={nucleo.name} 
                value={nucleo.id}
                color={Colors[colorScheme].text}
                style={pickerItemStyle}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { 
              backgroundColor: colorScheme === 'dark' ? '#3F3F46' : '#E5E7EB'
            }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.buttonText, { color: Colors[colorScheme].text }]}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, { backgroundColor: Colors[colorScheme].tint }]}
            onPress={handleSave}
          >
            <Text style={[styles.buttonText, { color: Colors[colorScheme].background }]}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 25
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 14,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#3F3F46',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 