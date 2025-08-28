import { Department, EquipmentStatus, EquipmentType, NucleoId } from './constants';

export interface Equipment {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  registration?: string;
  networkUsername?: string;
  department?: Department | null;
  nucleoId?: NucleoId | null;
  email?: string;
  phone?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'User';
  createdAt: string;
  updatedAt: string;
}

export type { Department, EquipmentStatus, EquipmentType, NucleoId }; 