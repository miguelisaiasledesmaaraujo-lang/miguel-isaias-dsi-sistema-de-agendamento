export type ScaleType = '1:18' | '1:24' | '1:43' | '1:64';

export type MaterialType = 'Diecast Metal' | 'Resina Composta' | 'Diecast ZAMAC';

export type AppointmentModality = 'showroom' | 'video_vip' | 'delivery_vip';

export type PaymentPreference = 'pix' | 'cartao_presencial' | 'dinheiro' | 'pix_agora';

export type AppointmentStatus = 'pendente' | 'confirmado' | 'concluido' | 'cancelado';

export interface Miniature {
  id: string;
  name: string;
  brand: string;
  manufacturer: string;
  scale: ScaleType;
  year: number;
  color: string;
  price: number;
  stock: number;
  is_limited_edition: boolean;
  edition_number?: string;
  material: MaterialType;
  features: string[];
  image_url: string;
  badge?: string;
  description: string;
  created_at?: string;
}

export interface Appointment {
  id: string;
  created_at: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  client_document?: string;
  miniature_id: string;
  miniature_name: string;
  miniature_scale?: string;
  miniature_price: number;
  appointment_date: string;
  appointment_time: string;
  modality: AppointmentModality;
  payment_preference: PaymentPreference;
  notes?: string;
  status: AppointmentStatus;
  sync_status: 'synced' | 'local_only';
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  storePhone: string;
  lastChecked?: string;
  error?: string;
}
