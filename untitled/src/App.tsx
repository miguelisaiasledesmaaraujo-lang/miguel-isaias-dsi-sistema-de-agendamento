import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { MiniatureCard } from './components/MiniatureCard.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { AppointmentModal } from './components/AppointmentModal.tsx';
import { MyAppointmentsModal } from './components/MyAppointmentsModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { SupabaseModal } from './components/SupabaseModal.tsx';
import { HowItWorks } from './components/HowItWorks.tsx';
import { ShowroomInfo } from './components/ShowroomInfo.tsx';
import { Footer } from './components/Footer.tsx';

import { Miniature, Appointment, SupabaseConfig, ScaleType } from './types/index.ts';
import {
  getSavedConfig,
  saveConfig,
  getMiniatures,
  getAppointments,
  updateAppointmentStatus,
  saveMiniature,
  deleteMiniature,
  getSupabaseClient,
  saveAppointment,
} from './lib/supabase.ts';
import { CheckCircle2, AlertCircle, Database, Calendar } from 'lucide-react';

export default function App() {
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSavedConfig());
  const [miniatures, setMiniatures] = useState<Miniature[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedScale, setSelectedScale] = useState<ScaleType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isMyAppointmentsOpen, setIsMyAppointmentsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);
  const [detailMiniature, setDetailMiniature] = useState<Miniature | null>(null);
  const [preSelectedMiniature, setPreSelectedMiniature] = useState<Miniature | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [mins, apps] = await Promise.all([getMiniatures(), getAppointments()]);
        setMiniatures(mins);
        setAppointments(apps);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter miniatures
  const filteredMiniatures = miniatures.filter((item) => {
    const matchesScale = selectedScale === 'all' || item.scale === selectedScale;
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !term ||
      item.name.toLowerCase().includes(term) ||
      item.brand.toLowerCase().includes(term) ||
      item.manufacturer.toLowerCase().includes(term) ||
      item.color.toLowerCase().includes(term);
    return matchesScale && matchesSearch;
  });

  // Handle appointment creation
  const handleAppointmentCreated = (newApp: Appointment) => {
    setAppointments((prev) => [newApp, ...prev.filter((a) => a.id !== newApp.id)]);
    showToast(
      `Agendamento #${newApp.id} registrado com sucesso no banco de dados!`,
      'success'
    );
  };

  // Update appointment status
  const handleUpdateStatus = async (id: string, newStatus: Appointment['status']) => {
    await updateAppointmentStatus(id, newStatus);
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
    showToast(`Status do agendamento #${id} atualizado para ${newStatus}.`, 'info');
  };

  // Save miniature
  const handleSaveMiniature = async (min: Miniature) => {
    await saveMiniature(min);
    setMiniatures((prev) => {
      const exists = prev.some((m) => m.id === min.id);
      return exists ? prev.map((m) => (m.id === min.id ? min : m)) : [min, ...prev];
    });
    showToast(`Miniatura "${min.name}" salva com sucesso!`, 'success');
  };

  // Delete miniature
  const handleDeleteMiniature = async (id: string) => {
    await deleteMiniature(id);
    setMiniatures((prev) => prev.filter((m) => m.id !== id));
    showToast('Miniatura removida com sucesso.', 'info');
  };

  // Save Supabase Config
  const handleSaveConfig = (newConfig: SupabaseConfig) => {
    saveConfig(newConfig);
    setSupabaseConfig(newConfig);
    showToast('Configurações do Supabase salvas.', 'success');
  };

  // Sync All Data to Supabase
  const handleSyncAllToSupabase = async (): Promise<{ success: boolean; message: string }> => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase não configurado ou desconectado.' };
    }

    try {
      // 1. Sync Miniatures
      for (const m of miniatures) {
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

      // 2. Sync Appointments
      for (const a of appointments) {
        await client.from('appointments').upsert({
          id: a.id,
          created_at: a.created_at,
          client_name: a.client_name,
          client_phone: a.client_phone,
          client_email: a.client_email,
          client_document: a.client_document || null,
          miniature_id: a.miniature_id,
          miniature_name: a.miniature_name,
          miniature_scale: a.miniature_scale || '1:18',
          miniature_price: a.miniature_price,
          appointment_date: a.appointment_date,
          appointment_time: a.appointment_time,
          modality: a.modality,
          payment_preference: a.payment_preference,
          notes: a.notes || '',
          status: a.status,
        });
      }

      // Mark local appointments as synced
      setAppointments((prev) => prev.map((item) => ({ ...item, sync_status: 'synced' })));

      return {
        success: true,
        message: `Sincronização concluída com sucesso! ${miniatures.length} modelos e ${appointments.length} agendamentos salvos no Supabase.`,
      };
    } catch (err: any) {
      return { success: false, message: 'Falha na sincronização: ' + err.message };
    }
  };

  const handleOpenScheduleForMiniature = (min: Miniature) => {
    setPreSelectedMiniature(min);
    setIsScheduleOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-bottom-4 duration-200">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'info' && <Database className="w-4 h-4 text-sky-400 shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span className="text-white">{toastMessage.text}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Header
        supabaseConfig={supabaseConfig}
        onOpenSupabaseModal={() => setIsSupabaseOpen(true)}
        onOpenScheduleModal={() => {
          setPreSelectedMiniature(null);
          setIsScheduleOpen(true);
        }}
        onOpenMyAppointmentsModal={() => setIsMyAppointmentsOpen(true)}
        onOpenAdminDashboard={() => setIsAdminOpen(true)}
      />

      <main className="flex-1">
        {/* Hero Banner with scale filter and search */}
        <Hero
          selectedScale={selectedScale}
          onSelectScale={setSelectedScale}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenScheduleModal={() => {
            setPreSelectedMiniature(null);
            setIsScheduleOpen(true);
          }}
          totalModels={miniatures.length}
        />

        {/* Featured Miniatures Collection Grid */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-semibold text-amber-400 tracking-wider uppercase">
                Acervo Disponível
              </div>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                Miniaturas Colecionáveis para Vistoria & Compra
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Exibindo {filteredMiniatures.length} modelos diecast e resina certificados
              </p>
            </div>

            <div className="text-xs text-slate-400">
              Clique em <strong className="text-amber-400 font-semibold">Agendar</strong> para reservar seu horário de vistoria.
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-80 rounded-xl bg-slate-900/40 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : filteredMiniatures.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-slate-800 bg-slate-900/30 p-8 space-y-3">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Nenhuma miniatura encontrada</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Não encontramos miniaturas para o termo "{searchQuery}" na escala selecionada. Tente limpar os filtros.
              </p>
              <button
                onClick={() => {
                  setSelectedScale('all');
                  setSearchQuery('');
                }}
                className="mt-2 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer"
              >
                Limpar Filtros de Busca
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMiniatures.map((miniature) => (
                <MiniatureCard
                  key={miniature.id}
                  miniature={miniature}
                  onSelectForAppointment={handleOpenScheduleForMiniature}
                  onViewDetails={setDetailMiniature}
                />
              ))}
            </div>
          )}
        </section>

        {/* Step-by-step How It Works */}
        <HowItWorks />

        {/* Physical Showroom & Inspection Equipment */}
        <ShowroomInfo
          onOpenSchedule={() => {
            setPreSelectedMiniature(null);
            setIsScheduleOpen(true);
          }}
          storePhone={supabaseConfig.storePhone}
        />
      </main>

      {/* Footer */}
      <Footer
        supabaseConfig={supabaseConfig}
        onOpenSupabaseModal={() => setIsSupabaseOpen(true)}
        onOpenAdminDashboard={() => setIsAdminOpen(true)}
      />

      {/* Modals */}
      <ProductDetailModal
        miniature={detailMiniature}
        onClose={() => setDetailMiniature(null)}
        onSchedule={handleOpenScheduleForMiniature}
      />

      <AppointmentModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        miniatures={miniatures}
        initialMiniature={preSelectedMiniature}
        storePhone={supabaseConfig.storePhone}
        onAppointmentCreated={handleAppointmentCreated}
      />

      <MyAppointmentsModal
        isOpen={isMyAppointmentsOpen}
        onClose={() => setIsMyAppointmentsOpen(false)}
        appointments={appointments}
        storePhone={supabaseConfig.storePhone}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        appointments={appointments}
        miniatures={miniatures}
        supabaseConfig={supabaseConfig}
        onUpdateStatus={handleUpdateStatus}
        onSaveMiniature={handleSaveMiniature}
        onDeleteMiniature={handleDeleteMiniature}
        onOpenSupabaseModal={() => {
          setIsAdminOpen(false);
          setIsSupabaseOpen(true);
        }}
      />

      <SupabaseModal
        isOpen={isSupabaseOpen}
        onClose={() => setIsSupabaseOpen(false)}
        config={supabaseConfig}
        onSaveConfig={handleSaveConfig}
        onSyncAllToSupabase={handleSyncAllToSupabase}
      />
    </div>
  );
}
