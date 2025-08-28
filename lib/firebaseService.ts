import {
  signOut as firebaseSignOut,
  getAuth,
  signInWithEmailAndPassword,
  User
} from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, limit as firestoreLimit, getDoc, getDocs, orderBy, query, serverTimestamp, Timestamp, updateDoc, where } from 'firebase/firestore';
import { app, db } from './firebase';
import type { Department, Employee, Equipment, EquipmentStatus, EquipmentType, NucleoId } from './types';

// Firestore collection names
const EQUIPMENTS_COLLECTION = 'equipments';
const EMPLOYEES_COLLECTION = 'employees';
const USERS_COLLECTION = 'users';

// --- Equipment Service Functions ---
export type NewEquipmentData = {
  serialNumber: string;
  type: EquipmentType;
  name: string;
  model?: string;
  manufacturer?: string;
  status: EquipmentStatus;
  ipAddress?: string;
  nucleoId?: NucleoId | null;
  employeeId?: string | null;
  departmentId?: Department | null;
  purchaseDate?: string | null;
  notes?: string;
};

export async function addEquipment(equipmentData: NewEquipmentData): Promise<string> {
  try {
    const q = query(collection(db, EQUIPMENTS_COLLECTION), where("serialNumber", "==", equipmentData.serialNumber));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error(`Número de série '${equipmentData.serialNumber}' já existe no sistema.`);
    }
    const docRef = await addDoc(collection(db, EQUIPMENTS_COLLECTION), {
      ...equipmentData,
      model: equipmentData.model || "",
      manufacturer: equipmentData.manufacturer || "",
      ipAddress: equipmentData.ipAddress || "",
      employeeId: equipmentData.employeeId || null,
      departmentId: equipmentData.departmentId || null,
      nucleoId: equipmentData.nucleoId || null,
      purchaseDate: equipmentData.purchaseDate || null,
      notes: equipmentData.notes || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding equipment: ", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Falha ao adicionar equipamento ao banco de dados.");
  }
}

export async function getEquipmentById(equipmentId: string): Promise<Equipment | null> {
  try {
    const docRef = doc(db, EQUIPMENTS_COLLECTION, equipmentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        purchaseDate: data.purchaseDate || null,
      } as Equipment;
    }
    return null;
  } catch (error) {
    console.error("Error fetching equipment by ID: ", error);
    throw error;
  }
}

export async function updateEquipment(equipmentId: string, data: Partial<NewEquipmentData>): Promise<void> {
  try {
    const equipmentRef = doc(db, EQUIPMENTS_COLLECTION, equipmentId);
    if (data.serialNumber) {
      const q = query(collection(db, EQUIPMENTS_COLLECTION), where("serialNumber", "==", data.serialNumber));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty && querySnapshot.docs.some(d => d.id !== equipmentId)) {
        throw new Error(`Número de série '${data.serialNumber}' já pertence a outro equipamento.`);
      }
    }
    await updateDoc(equipmentRef, {
      ...data,
      purchaseDate: data.hasOwnProperty('purchaseDate') ? (data.purchaseDate || null) : undefined,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating equipment: ", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Falha ao atualizar equipamento no banco de dados.");
  }
}

export async function deleteEquipment(equipmentId: string): Promise<void> {
  try {
    const equipmentRef = doc(db, EQUIPMENTS_COLLECTION, equipmentId);
    await deleteDoc(equipmentRef);
  } catch (error) {
    console.error("Error deleting equipment: ", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Falha ao deletar equipamento do banco de dados.");
  }
}

export async function getAllEquipment(): Promise<Equipment[]> {
  try {
    const q = query(collection(db, EQUIPMENTS_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        purchaseDate: data.purchaseDate || null,
      } as Equipment;
    });
  } catch (error) {
    console.error("Error fetching all equipment: ", error);
    return [];
  }
}

// --- Employee Service Functions ---
export type NewEmployeeData = {
  name: string;
  registration?: string;
  networkUsername?: string;
  department?: Department | null;
  nucleoId?: NucleoId | null;
  email?: string;
  phone?: string;
  position?: string;
};

export async function addEmployee(employeeData: NewEmployeeData): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), {
      ...employeeData,
      registration: employeeData.registration || "",
      networkUsername: employeeData.networkUsername || "",
      email: employeeData.email || "",
      phone: employeeData.phone || "",
      position: employeeData.position || "",
      nucleoId: employeeData.nucleoId || null,
      department: employeeData.department || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding employee: ", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Falha ao adicionar colaborador ao banco de dados.");
  }
}

export async function getAllEmployees(): Promise<Employee[]> {
  try {
    const q = query(collection(db, EMPLOYEES_COLLECTION), orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      } as Employee;
    });
  } catch (error) {
    console.error("Error fetching all employees: ", error);
    return [];
  }
}

export async function getEmployeeById(employeeId: string): Promise<Employee | null> {
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        department: data.department || null,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      } as Employee;
    }
    return null;
  } catch (error) {
    console.error("Error fetching employee by ID: ", error);
    throw error;
  }
}

export async function updateEmployee(employeeId: string, data: Partial<NewEmployeeData>): Promise<void> {
  try {
    const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    const updateData: Partial<Employee> = { ...data };
    if (data.hasOwnProperty('department')) {
      updateData.department = data.department || null;
    }
    if (data.hasOwnProperty('nucleoId')) {
      updateData.nucleoId = data.nucleoId || null;
    }
    if (data.hasOwnProperty('networkUsername')) {
      updateData.networkUsername = data.networkUsername || "";
    }
    await updateDoc(employeeRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating employee: ", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Falha ao atualizar colaborador no banco de dados.");
  }
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  try {
    const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    await deleteDoc(employeeRef);
  } catch (error) {
    console.error("Error deleting employee: ", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Falha ao deletar colaborador do banco de dados.");
  }
}

// --- Dashboard & Report Service Functions ---
const buildQueryConstraints = (nucleoId?: string | null) => {
  const constraints = [];
  if (nucleoId && nucleoId !== 'todos') {
    constraints.push(where("nucleoId", "==", nucleoId));
  }
  return constraints;
};

export async function getEquipmentCount(): Promise<number> {
  const snapshot = await getDocs(collection(db, EQUIPMENTS_COLLECTION));
  return snapshot.size;
}

export async function getEmployeeCount(): Promise<number> {
  const snapshot = await getDocs(collection(db, EMPLOYEES_COLLECTION));
  return snapshot.size;
}

export async function getEquipmentByStatus(): Promise<Record<EquipmentStatus, number>> {
  const snapshot = await getDocs(collection(db, EQUIPMENTS_COLLECTION));
  const counts: Record<EquipmentStatus, number> = {} as Record<EquipmentStatus, number>;
  snapshot.forEach((doc) => {
    const status = doc.data().status as EquipmentStatus;
    counts[status] = (counts[status] || 0) + 1;
  });
  return counts;
}

export async function getEquipmentByType(): Promise<Record<EquipmentType, number>> {
  const snapshot = await getDocs(collection(db, EQUIPMENTS_COLLECTION));
  const counts: Record<EquipmentType, number> = {} as Record<EquipmentType, number>;
  snapshot.forEach((doc) => {
    const type = doc.data().type as EquipmentType;
    counts[type] = (counts[type] || 0) + 1;
  });
  return counts;
}

export async function getEquipmentByDepartment(): Promise<Record<Department, number>> {
  const snapshot = await getDocs(collection(db, EQUIPMENTS_COLLECTION));
  const counts: Record<Department, number> = {} as Record<Department, number>;
  snapshot.forEach((doc) => {
    const department = doc.data().departmentId as Department;
    counts[department] = (counts[department] || 0) + 1;
  });
  return counts;
}

export async function getRecentEquipmentActivity(): Promise<any[]> {
  try {
    const q = query(
      collection(db, EQUIPMENTS_COLLECTION),
      orderBy("updatedAt", "desc"),
      firestoreLimit(5)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        description: `Equipamento ${data.name} (${data.serialNumber}) atualizado`,
        date: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toLocaleDateString() : data.updatedAt,
      };
    });
  } catch (error) {
    console.error("Error fetching recent equipment activity: ", error);
    return [];
  }
}

export class FirebaseService {
  private auth;

  constructor() {
    this.auth = getAuth(app);
  }

  async signIn(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(this.auth);
    } catch (error) {
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
} 