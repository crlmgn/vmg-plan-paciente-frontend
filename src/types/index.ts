export type Rol = "admin" | "farmacia";

export type EstadoFarmacia = "pendiente" | "aprobada" | "rechazada";

export interface Provincia {
  id: number;
  codigo: number;
  nombre: string;
}

export interface Canton {
  id: number;
  codigo: number;
  nombre: string;
  provincia: number;
}

export interface Distrito {
  id: number;
  codigo: number;
  nombre: string;
  canton: number;
}

export interface Farmacia {
  id: number;
  nombre: string;
  correo_contacto: string;
  telefono: string;
  provincia: number;
  canton: number;
  distrito: number;
  direccion_exacta: string;
  provincia_detalle?: Provincia;
  canton_detalle?: Canton;
  distrito_detalle?: Distrito;
  estado: EstadoFarmacia;
  motivo_rechazo: string;
  fecha_resolucion: string | null;
  resuelto_por_email?: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface Plan {
  id: number;
  medicamento: number;
  nombre: string;
  descripcion: string;
  cantidad_comprada: number;
  cantidad_gratis: number;
  activo: boolean;
}

export interface Medicamento {
  id: number;
  nombre: string;
  descripcion: string;
  presentacion: string;
  cantidad: number | null;
  fuerza_mg: number | null;
  activo: boolean;
  planes: Plan[];
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LoginResponse {
  access: string;
  refresh: string;
  rol: Rol;
  farmacia_id: number | null;
}

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: Rol;
  farmacia_id: number | null;
  farmacia_estado: EstadoFarmacia | null;
}

export interface CheckEmailResponse {
  existe: boolean;
  estado: EstadoFarmacia | null;
}

export interface ApiErrorBody {
  detail?: string;
  [field: string]: unknown;
}

export interface Cliente {
  id: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  nombre_completo: string;
  cedula: string;
  creado_en: string;
}

export interface Compra {
  id: number;
  cliente: string;
  cliente_detalle?: Cliente;
  medicamento: number;
  medicamento_nombre?: string;
  farmacia: number;
  farmacia_nombre?: string;
  numero_factura: string;
  cantidad: number;
  foto_factura: string | null;
  fecha: string;
  creado_en: string;
}

export interface Canje {
  id: number;
  cliente: string;
  cliente_detalle?: Cliente;
  plan: number;
  plan_nombre?: string;
  medicamento_nombre?: string;
  farmacia: number;
  farmacia_nombre?: string;
  cantidad: number;
  fecha: string;
  facturas: string[];
  creado_en: string;
}

export interface EstadoCanje {
  plan_id: number;
  plan_nombre: string;
  medicamento_id: number;
  medicamento_nombre: string;
  cantidad_comprada: number;
  cantidad_gratis: number;
  total_comprado: number;
  unidades_disponibles: number;
  canjes_disponibles: number;
  aplica_canje: boolean;
  unidades_para_proximo_canje: number;
}

export interface ConfiguracionSMTP {
  host: string;
  puerto: number;
  usuario: string;
  password_configurada: boolean;
  usar_tls: boolean;
  from_email: string;
  esta_configurado: boolean;
  actualizado_en: string;
}
