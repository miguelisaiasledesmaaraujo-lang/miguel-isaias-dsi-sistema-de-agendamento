import React from 'react';
import { Calendar, Database, Sparkles, Phone, ShieldCheck } from 'lucide-react';
import { SupabaseConfig } from '../types/index.ts';

interface HeaderProps {
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseModal: () => void;
  onOpenScheduleModal: () => void;
  onOpenMyAppointmentsModal: () => void;
  onOpenAdminDashboard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  supabaseConfig,
  onOpenSupabaseModal,
  onOpenScheduleModal,
  onOpenMyAppointmentsModal,
  onOpenAdminDashboard,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b0f17]/95 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <a href="#" className="flex items-center gap-3 group text-left">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <span className="font-display text-lg tracking-tighter">AV</span>
          </div>
          <div>
            <span className="font-display text-lg font-extrabold tracking-wider text-slate-100 uppercase group-hover:text-amber-400 transition-colors block leading-tight">
              AutoMiniaturas VIP
            </span>
            <span className="text-[11px] text-slate-400 font-medium tracking-widest uppercase block">
              Colecionáveis 1:18 · 1:24 · 1:43
            </span>
          </div>
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#catalogo" className="hover:text-amber-400 transition-colors">
            Catálogo
          </a>
          <a href="#como-funciona" className="hover:text-amber-400 transition-colors">
            Como Funciona
          </a>
          <a href="#showroom" className="hover:text-amber-400 transition-colors">
            Showroom
          </a>
          <button
            onClick={onOpenMyAppointmentsModal}
            className="hover:text-amber-400 transition-colors cursor-pointer text-slate-300"
          >
            Meus Agendamentos
          </button>
          <button
            onClick={onOpenAdminDashboard}
            className="hover:text-amber-400 transition-colors cursor-pointer text-slate-400 flex items-center gap-1.5"
          >
            <span>Painel Gestor</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSupabaseModal}
            title="Configurações e sincronização do Banco de Dados Supabase"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-700/80 bg-slate-900/60 text-slate-300 hover:border-slate-600 hover:text-white transition-all cursor-pointer"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                supabaseConfig.isConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="hidden sm:inline">
              {supabaseConfig.isConnected ? 'Supabase Conectado' : 'Supabase: Modo Local'}
            </span>
            <span className="sm:hidden">Supabase</span>
          </button>

          <button
            onClick={onOpenScheduleModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-98 rounded-md transition-all shadow-md shadow-amber-400/20 cursor-pointer whitespace-nowrap"
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar Visita</span>
          </button>
        </div>
      </div>
    </header>
  );
};
