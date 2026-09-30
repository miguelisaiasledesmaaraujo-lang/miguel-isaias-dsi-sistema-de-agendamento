import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Appointment, Miniature, SupabaseConfig } from '../types/index.ts';
import { INITIAL_MINIATURES, INITIAL_APPOINTMENTS, STORE_DEFAULT_PHONE } from '../data/mockData.ts';

const STORAGE_KEYS = {
  CONFIG: 'autominiaturas_supabase_config_v1',
  APPOINTMENTS: 'autominiaturas_appointments_v1',
  MINIATURES: 'autominiaturas_miniatures_v1',
};

// Retrieve saved config or check environment variables
export function getSavedConfig(): SupabaseConfig {
  const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        url: parsed.url || '',
        anonKey: parsed.anonKey || '',
        isConnected: Boolean(parsed.isConnected),
        storePhone: parsed.storePhone || STORE_DEFAULT_PHONE,
        lastChecked: parsed.lastChecked,
        error: parsed.error,
      };
    } catch {
      // ignore
    }
  }

  // Fallback to Vite env variables if provided
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: envUrl,
    anonKey: envKey,
    isConnected: false,
    storePhone: STORE_DEFAULT_PHONE,
  };
}

export function saveConfig(config: SupabaseConfig): void {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
}

let activeClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSavedConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }
  if (!activeClient) {
    try {
      activeClient = createClient(config.url, config.anonKey, {
        auth: { persistSession: false },
      });
    } catch (err) {
      console.error('Falha ao inicializar Supabase client:', err);
      return null;
    }
  }
  return activeClient;
}

export function resetSupabaseClient(): void {
  activeClient = null;
}

// Test Supabase connection
export async function testConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: 'URL e Chave Anon do Supabase são obrigatórias.' };
  }
  try {
    const testClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    });

    // Test a basic select or health check
    const { error } = await testClient.from('appointments').select('id').limit(1);

    if (error) {
      // If table does not exist, connection is valid but schema is missing
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'Conectado ao Supabase! Porém a tabela "appointments" ainda não foi criada. Utilize o script SQL abaixo.',
        };
      }
      return { success: false, message: `Erro ao conectar: ${error.message}` };
    }

    return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Falha desconhecida na conexão.' };
  }
}

// Get Appointments
export async function getAppointments(): Promise<Appointment[]> {
  const client = getSupabaseClient();
  const localData = getLocalAppointments();

  if (client) {
    try {
      const { data, error } = await client
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Map database fields
        const formatted: Appointment[] = data.map((item: any) => ({
          id: item.id,
          created_at: item.created_at,
          client_name: item.client_name,
          client_phone: item.client_phone,
          client_email: item.client_email,
          client_document: item.client_document,
          miniature_id: item.miniature_id,
          miniature_name: item.miniature_name,
          miniature_scale: item.miniature_scale,
          miniature_price: Number(item.miniature_price),
          appointment_date: item.appointment_date,
          appointment_time: item.appointment_time,
          modality: item.modality,
          payment_preference: item.payment_preference,
          notes: item.notes,
          status: item.status,
          sync_status: 'synced',
        }));
        // Update local cache
        saveLocalAppointments(formatted);
        return formatted;
      }
    } catch (err) {
      console.warn('Erro ao buscar do Supabase, usando dados locais:', err);
    }
  }

  return localData;
}

// Create Appointment
export async function saveAppointment(appointment: Appointment): Promise<{ success: boolean; syncStatus: 'synced' | 'local_only' }> {
  // Always save locally first to guarantee zero data loss
  const current = getLocalAppointments();
  const updated = [appointment, ...current.filter((a) => a.id !== appointment.id)];
  saveLocalAppointments(updated);

  const client = getSupabaseClient();
  if (client) {
    try {
      // 1. Ensure the miniature exists in Supabase to avoid foreign key violation
      if (appointment.miniature_id) {
        const localMin = getLocalMiniatures().find((m) => m.id === appointment.miniature_id);
        if (localMin) {
          try {
            await client.from('miniatures').upsert({
              id: localMin.id,
              name: localMin.name,
              brand: localMin.brand,
              manufacturer: localMin.manufacturer,
              scale: localMin.scale,
              year: localMin.year,
              color: localMin.color,
              price: localMin.price,
              stock: localMin.stock,
              is_limited_edition: localMin.is_limited_edition,
              edition_number: localMin.edition_number || null,
              material: localMin.material,
              features: localMin.features,
              image_url: localMin.image_url,
              badge: localMin.badge || null,
              description: localMin.description,
            });
          } catch (upsertErr) {
            console.warn('Tentativa de sincronizar miniatura antes do agendamento:', upsertErr);
          }
        }
      }

      // 2. Insert or update appointment
      const payload: any = {
        id: appointment.id,
        created_at: appointment.created_at,
        client_name: appointment.client_name,
        client_phone: appointment.client_phone,
        client_email: appointment.client_email,
        client_document: appointment.client_document || null,
        miniature_id: appointment.miniature_id || null,
        miniature_name: appointment.miniature_name,
        miniature_scale: appointment.miniature_scale || '1:18',
        miniature_price: appointment.miniature_price,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        modality: appointment.modality,
        payment_preference: appointment.payment_preference,
        notes: appointment.notes || '',
        status: appointment.status,
      };

      let { error } = await client.from('appointments').upsert(payload);

      // If foreign key constraint still fails (error 23503), retry saving with miniature_id = null
      if (error && (error.code === '23503' || error.message.includes('foreign key'))) {
        console.warn('Aviso: chave estrangeira não encontrada, salvando agendamento com miniature_id nulo:', error.message);
        payload.miniature_id = null;
        const retryResult = await client.from('appointments').upsert(payload);
        error = retryResult.error;
      }

      if (!error) {
        // Mark as synced locally
        appointment.sync_status = 'synced';
        saveLocalAppointments(
          updated.map((item) => (item.id === appointment.id ? { ...item, sync_status: 'synced' } : item))
        );
        return { success: true, syncStatus: 'synced' };
      } else {
        console.warn('Erro ao inserir no Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Falha na chamada ao Supabase:', err);
    }
  }

  return { success: true, syncStatus: 'local_only' };
}

// Update Appointment Status
export async function updateAppointmentStatus(
  id: string,
  newStatus: Appointment['status']
): Promise<boolean> {
  const current = getLocalAppointments();
  const target = current.find((a) => a.id === id);
  if (!target) return false;

  target.status = newStatus;
  saveLocalAppointments([...current]);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id);
    } catch (err) {
      console.warn('Erro ao atualizar status no Supabase:', err);
    }
  }
  return true;
}

// Get Miniatures Catalog
export async function getMiniatures(): Promise<Miniature[]> {
  const client = getSupabaseClient();
  const localData = getLocalMiniatures();

  if (client) {
    try {
      const { data, error } = await client
        .from('miniatures')
        .select('*')
        .order('price', { ascending: false });

      if (!error && data && data.length > 0) {
        const formatted: Miniature[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          brand: item.brand,
          manufacturer: item.manufacturer,
          scale: item.scale,
          year: item.year,
          color: item.color,
          price: Number(item.price),
          stock: Number(item.stock),
          is_limited_edition: Boolean(item.is_limited_edition),
          edition_number: item.edition_number,
          material: item.material,
          features: Array.isArray(item.features) ? item.features : JSON.parse(item.features || '[]'),
          image_url: item.image_url,
          badge: item.badge,
          description: item.description,
          created_at: item.created_at,
        }));
        saveLocalMiniatures(formatted);
        return formatted;
      } else if (!error && data && data.length === 0) {
        // Table exists in Supabase but is empty: auto-seed catalog so foreign keys match!
        console.info('Catálogo vazio no Supabase. Semeando miniaturas iniciais...');
        for (const m of localData) {
          await client.from('miniatures').upsert({
            id: m.id,
            name: m.name,
            brand: m.brand,
            manufacturer: m.manufacturer,
            scale: m.scale,
            year: m.year,
            color: m.color,
            price: m.price,
            stock: m.stock,
            is_limited_edition: m.is_limited_edition,
            edition_number: m.edition_number || null,
            material: m.material,
            features: m.features,
            image_url: m.image_url,
            badge: m.badge || null,
            description: m.description,
          });
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar miniaturas do Supabase:', err);
    }
  }

  return localData;
}

// Save or Update Miniature
export async function saveMiniature(miniature: Miniature): Promise<boolean> {
  const current = getLocalMiniatures();
  const exists = current.some((m) => m.id === miniature.id);
  const updated = exists
    ? current.map((m) => (m.id === miniature.id ? miniature : m))
    : [miniature, ...current];

  saveLocalMiniatures(updated);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('miniatures').upsert({
        id: miniature.id,
        name: miniature.name,
        brand: miniature.brand,
        manufacturer: miniature.manufacturer,
        scale: miniature.scale,
        year: miniature.year,
        color: miniature.color,
        price: miniature.price,
        stock: miniature.stock,
        is_limited_edition: miniature.is_limited_edition,
        edition_number: miniature.edition_number || null,
        material: miniature.material,
        features: miniature.features,
        image_url: miniature.image_url,
        badge: miniature.badge || null,
        description: miniature.description,
      });
    } catch (err) {
      console.warn('Erro ao salvar miniatura no Supabase:', err);
    }
  }
  return true;
}

// Delete Miniature
export async function deleteMiniature(id: string): Promise<boolean> {
  const current = getLocalMiniatures();
  saveLocalMiniatures(current.filter((m) => m.id !== id));

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('miniatures').delete().eq('id', id);
    } catch (err) {
      console.warn('Erro ao excluir miniatura no Supabase:', err);
    }
  }
  return true;
}

// Local storage helpers
function getLocalAppointments(): Appointment[] {
  const stored = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    return INITIAL_APPOINTMENTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_APPOINTMENTS;
  }
}

function saveLocalAppointments(data: Appointment[]): void {
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(data));
}

function getLocalMiniatures(): Miniature[] {
  const stored = localStorage.getItem(STORAGE_KEYS.MINIATURES);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.MINIATURES, JSON.stringify(INITIAL_MINIATURES));
    return INITIAL_MINIATURES;
  }
  try {
    const parsed: Miniature[] = JSON.parse(stored);
    // Refresh with local image assets if images are missing or pointing to external unsplash
    const refreshed = parsed.map((item) => {
      const match = INITIAL_MINIATURES.find((m) => m.id === item.id);
      if (match && (!item.image_url || item.image_url.includes('unsplash.com'))) {
        return { ...item, image_url: match.image_url };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEYS.MINIATURES, JSON.stringify(refreshed));
    return refreshed;
  } catch {
    return INITIAL_MINIATURES;
  }
}

function saveLocalMiniatures(data: Miniature[]): void {
  localStorage.setItem(STORAGE_KEYS.MINIATURES, JSON.stringify(data));
}

// Upload miniature photo to Supabase Storage (or convert to base64 if offline/local)
export async function uploadMiniatureImage(
  file: File
): Promise<{ success: boolean; url: string; error?: string }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `cars/${fileName}`;

      const { data, error } = await client.storage
        .from('miniatures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.warn('Erro ao enviar imagem ao Supabase Storage:', error.message);
      } else if (data) {
        const { data: publicData } = client.storage
          .from('miniatures')
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          return { success: true, url: publicData.publicUrl };
        }
      }
    } catch (err: any) {
      console.warn('Falha no upload para Supabase Storage, recorrendo a base64:', err);
    }
  }

  // Fallback: Read as base64 Data URL so local storage works seamlessly
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({ success: true, url: reader.result as string });
    };
    reader.onerror = () => {
      resolve({ success: false, url: '', error: 'Falha ao ler o arquivo localmente.' });
    };
    reader.readAsDataURL(file);
  });
}

// SQL Script generator for the user's Supabase dashboard
export function getSupabaseSchemaSQL(): string {
  return `-- =========================================================================
-- ESQUEMA COMPLETO: BANCO DE DADOS & POLÍTICAS DE ARMAZENAMENTO (STORAGE)
-- LOJA DE MINIATURAS & SISTEMA DE AGENDAMENTO VIP
-- Execute este script no SQL Editor do seu console Supabase (supabase.com)
-- =========================================================================

-- 1. TABELA DE MINIATURAS (Carros Colecionáveis)
create table if not exists public.miniatures (
  id text primary key,
  name text not null,
  brand text not null,
  manufacturer text not null,
  scale text not null default '1:18',
  year integer,
  color text,
  price numeric(10, 2) not null,
  stock integer not null default 1,
  is_limited_edition boolean default false,
  edition_number text,
  material text not null default 'Diecast Metal',
  features jsonb default '[]'::jsonb,
  image_url text not null,
  badge text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. TABELA DE AGENDAMENTOS & RESERVAS DE COMPRA
create table if not exists public.appointments (
  id text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  client_name text not null,
  client_phone text not null,
  client_email text not null,
  client_document text,
  miniature_id text,
  miniature_name text not null,
  miniature_scale text default '1:18',
  miniature_price numeric(10, 2) not null,
  appointment_date date not null,
  appointment_time text not null,
  modality text not null default 'showroom',
  payment_preference text not null default 'pix',
  notes text,
  status text not null default 'pendente'
);

-- Remover chave estrangeira estrita caso já exista para evitar erros de constraint se as tabelas forem populadas fora de ordem
alter table public.appointments drop constraint if exists appointments_miniature_id_fkey;

-- 3. ÍNDICES DE PERFORMANCE
create index if not exists idx_appointments_date on public.appointments(appointment_date);
create index if not exists idx_appointments_status on public.appointments(status);
create index if not exists idx_miniatures_scale on public.miniatures(scale);
create index if not exists idx_miniatures_brand on public.miniatures(brand);

-- 4. ROW LEVEL SECURITY (RLS) NAS TABELAS
alter table public.miniatures enable row level security;
alter table public.appointments enable row level security;

-- Limpar políticas antigas se já existirem
drop policy if exists "Permitir leitura pública das miniaturas" on public.miniatures;
drop policy if exists "Permitir inserção de miniaturas" on public.miniatures;
drop policy if exists "Permitir atualização de miniaturas" on public.miniatures;
drop policy if exists "Permitir exclusão de miniaturas" on public.miniatures;

drop policy if exists "Permitir leitura pública dos agendamentos" on public.appointments;
drop policy if exists "Permitir criar agendamentos" on public.appointments;
drop policy if exists "Permitir atualizar agendamentos" on public.appointments;
drop policy if exists "Permitir cancelar agendamentos" on public.appointments;

-- Políticas da tabela 'miniatures'
create policy "Permitir leitura pública das miniaturas"
  on public.miniatures for select using (true);

create policy "Permitir inserção de miniaturas"
  on public.miniatures for insert with check (true);

create policy "Permitir atualização de miniaturas"
  on public.miniatures for update using (true) with check (true);

create policy "Permitir exclusão de miniaturas"
  on public.miniatures for delete using (true);

-- Políticas da tabela 'appointments'
create policy "Permitir leitura pública dos agendamentos"
  on public.appointments for select using (true);

create policy "Permitir criar agendamentos"
  on public.appointments for insert with check (true);

create policy "Permitir atualizar agendamentos"
  on public.appointments for update using (true) with check (true);

create policy "Permitir cancelar agendamentos"
  on public.appointments for delete using (true);

-- =========================================================================
-- 5. CONFIGURAÇÃO DO SUPABASE STORAGE (BUCKETS & POLÍTICAS DE ARMAZENAMENTO)
-- =========================================================================

-- Criação do Bucket 'miniatures' público para fotos e uploads de miniaturas
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'miniatures',
  'miniatures',
  true,
  10485760, -- Limite de 10 Megabytes por foto
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

-- NOTA: storage.objects já possui RLS ativado nativamente no Supabase.
-- NUNCA execute 'alter table storage.objects enable row level security;' pois gera o erro 42501.

-- Limpar políticas antigas de storage se já existirem
drop policy if exists "Imagens de miniaturas são públicas" on storage.objects;
drop policy if exists "Permitir upload de fotos de miniaturas" on storage.objects;
drop policy if exists "Permitir atualizar fotos de miniaturas" on storage.objects;
drop policy if exists "Permitir deletar fotos de miniaturas" on storage.objects;

-- POLÍTICA 1: Visualização Pública de Imagens
create policy "Imagens de miniaturas são públicas"
  on storage.objects for select
  to public
  using (bucket_id = 'miniatures');

-- POLÍTICA 2: Upload de Novas Fotos de Miniaturas
create policy "Permitir upload de fotos de miniaturas"
  on storage.objects for insert
  to public
  with check (bucket_id = 'miniatures');

-- POLÍTICA 3: Atualização de Fotos Existentes
create policy "Permitir atualizar fotos de miniaturas"
  on storage.objects for update
  to public
  using (bucket_id = 'miniatures')
  with check (bucket_id = 'miniatures');

-- POLÍTICA 4: Exclusão de Fotos
create policy "Permitir deletar fotos de miniaturas"
  on storage.objects for delete
  to public
  using (bucket_id = 'miniatures');

-- =========================================================================
-- 6. DADOS INICIAIS (CARGA DO CATÁLOGO DE COLECIONÁVEIS)
-- =========================================================================
insert into public.miniatures (id, name, brand, manufacturer, scale, year, color, price, stock, is_limited_edition, edition_number, material, features, image_url, badge, description)
values
  ('min-001', 'Porsche 911 GT3 RS (991.2)', 'Porsche', 'AutoArt Signature', '1:18', 2019, 'Lizard Green & Carbono', 1890.00, 2, true, '142/500', 'Diecast Metal', '["Abertura total de portas, capô e motor", "Direção esterçante", "Gaiola de proteção"]'::jsonb, 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800', 'Edição Limitada', 'Miniatura ultra-detalhada da linha Signature.'),
  ('min-002', 'Nissan Skyline GT-R R34 V-Spec II', 'Nissan', 'AutoArt Millenium', '1:18', 2002, 'Bayside Blue Perolizado', 2450.00, 1, true, '089/350', 'Diecast Metal', '["Motor RB26DETT twin-turbo", "Rodas NISMO LM-GT4"]'::jsonb, 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800', 'Última Unidade', 'O lendário Godzilla em sua versão mais reverenciada.'),
  ('min-003', 'Ferrari F40 Competizione', 'Ferrari', 'Kyosho High-End', '1:18', 1989, 'Rosso Corsa Tradizionale', 2790.00, 3, false, null, 'Diecast Metal', '["Clamshell traseiro basculante", "Faróis escamoteáveis"]'::jsonb, 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800', 'Ícone Supremo', 'Último supercarro homologado sob supervisão de Enzo Ferrari.'),
  ('min-004', 'Shelby Cobra 427 S/C Roadster', 'Shelby American', 'GMP / Acme Diecast', '1:18', 1965, 'Guardsman Blue', 1580.00, 2, true, '310/750', 'Diecast Metal', '["Escapamentos laterais cromados", "Pneus Goodyear clássicos"]'::jsonb, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', 'Muscle Lendário', 'A força bruta americana em escala 1:18 em metal fundido.'),
  ('min-005', 'McLaren MP4/4 Ayrton Senna #12', 'McLaren Honda', 'Minichamps', '1:43', 1988, 'Marlboro Racing White/Red', 790.00, 4, true, 'Ed. Campeão 1988', 'Diecast ZAMAC', '["Réplica de capacete de Ayrton Senna", "Case expositor em acrílico"]'::jsonb, 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800', 'Homenagem Senna', 'Monolugar mais dominante da história da Fórmula 1.'),
  ('min-006', 'Mercedes-Benz 300 SL Gullwing', 'Mercedes-Benz', 'Bburago Signature', '1:24', 1954, 'Prata Metálico DB180', 640.00, 5, false, null, 'Diecast Metal', '["Portas asas-de-gaivota com amortecedor", "Mala sob medida"]'::jsonb, 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?w=800', 'Clássico Eterno', 'O clássico alemão dos anos 50 em escala 1:24.'),
  ('min-007', 'Lamborghini Countach LP5000 QV', 'Lamborghini', 'Kyosho Ousia', '1:18', 1985, 'Giallo Fly (Amarelo)', 2190.00, 1, true, '204/400', 'Resina Composta', '["Aerofólio traseiro colossal", "Rodas telefone vazadas"]'::jsonb, 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800', 'Pôster dos Anos 80', 'Agressividade pura de SantAgata Bolognese.'),
  ('min-008', 'BMW M3 E30 Sport Evolution', 'BMW', 'OttOmobile', '1:18', 1990, 'Brilliant Red', 1390.00, 3, true, '1240/2000', 'Resina Composta', '["Lábio frontal ajustável", "Bancos Recaro Motorsport"]'::jsonb, 'https://images.unsplash.com/photo-1555353540-64580b51c258?w=800', 'Touring Icon', 'Lenda das pistas do DTM em escala 1:18.')
on conflict (id) do update set
  price = excluded.price,
  stock = excluded.stock;
`;
}
