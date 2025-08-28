export const DEPARTMENTS = [
  "ASCOM", "ASJUR", "ASPLAN", "AUDIT", "CGERP-I", "CGERP-II", "CI", "COEN", 
  "CORC", "COSB", "CPL", "CTEC", "CTINF", "DEAS", "DEOB-NE", "DEOB-SO", 
  "DESP", "DHID", "DIARH", "DIESG", "DIFIN", "DIFRA", "DIGAN", "DIGEP", 
  "DIOMB", "DIPAM", "DIPES", "DIPLO-NE", "DIPLO-SO", "DIPRO", "DIPSE-NE", 
  "DIPSE-SO", "DISUP", "DIVAB", "DIVEB", "DMAB", "DMR", "DP", "DSA", 
  "GEAFI", "GCEN", "SEAPE", "SECOB", "SECOM", "SEDES", "SEGET", "SEOFI", 
  "SEPAT", "SEPCO", "SESMT"
] as const;

export type Department = typeof DEPARTMENTS[number];

export const NUCLEOS = [
  { id: "salvador", name: "Salvador" },
  { id: "barreiras", name: "Barreiras" },
  { id: "caetite", name: "Caetité" },
  { id: "feira-de-santana", name: "Feira de Santana" },
  { id: "irece", name: "Irecê" },
  { id: "juazeiro", name: "Juazeiro" },
  { id: "ribeira-do-pombal", name: "Ribeira do Pombal" },
  { id: "senhor-do-bonfim", name: "Senhor do Bonfim" },
  { id: "seabra", name: "Seabra" },
  { id: "santa-maria-da-vitoria", name: "Santa Maria da Vitória" },
  { id: "teixeira-de-freitas", name: "Teixeira de Freitas" },
] as const;

export type NucleoId = typeof NUCLEOS[number]['id'];
export type Nucleo = typeof NUCLEOS[number];

export const EQUIPMENT_TYPES = [
  "Computador", "Notebook", "Impressora", "Scanner", "Switch", "WiFi"
] as const;

export type EquipmentType = typeof EQUIPMENT_TYPES[number];

export const EQUIPMENT_STATUSES = [
  "Em uso", "Em manutenção", "Disponível", "Baixado"
] as const;

export type EquipmentStatus = typeof EQUIPMENT_STATUSES[number];

export const USER_ROLES = ["Admin", "User"] as const;
export type UserRole = typeof USER_ROLES[number];

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCLCr4B3_4_YhKqVAjVeKi4W0IuJKgaYfY",
  authDomain: "inventario-fa5ad.firebaseapp.com",
  databaseURL: "https://inventario-fa5ad-default-rtdb.firebaseio.com",
  projectId: "inventario-fa5ad",
  storageBucket: "inventario-fa5ad.appspot.com",
  messagingSenderId: "1046112012876",
  appId: "1:1046112012876:web:be02820ef1b9412bcf82e9",
  measurementId: "G-9W7RPNPP5F"
}; 