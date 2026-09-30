import React, { useState } from 'react';
import { X, Search, Calendar, Clock, MapPin, MessageCircle, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Appointment } from '../types/index.ts';
import { formatBRL, formatDateBR, createWhatsAppMessage } from '../lib/whatsapp.ts';

interface MyAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  storePhone: string;
}

export const MyAppointmentsModal: React.FC<MyAppointmentsModalProps> = ({
  isOpen,
  onClose,
  appointments,
  storePhone,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = appointments.filter((app) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      app.client_name.toLowerCase().includes(term) ||
      app.client_phone.includes(term) ||
      app.id.toLowerCase().includes(term) ||
      app.miniature_name.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmado':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmado no Showroom
          </span>
        );
      case 'concluido':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-sky-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Compra Concluída
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-semibold">
            <XCircle className="w-3.5 h-3.5" /> Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-semibold">
            <Clock className="w-3.5 h-3.5" /> Aguardando Confirmação
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-800 bg-[#0e131d] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-white">Consultar Meus Agendamentos</h2>
            <p className="text-xs text-slate-400">
              Verifique o status da sua reserva ou entre em contato pelo WhatsApp
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter input */}
        <div className="p-6 pb-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Digite seu nome, WhatsApp ou código (#AM-9021)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Appointments List */}
        <div className="p-6 space-y-4 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-slate-600 mb-1" />
              <p className="text-sm font-medium">Nenhum agendamento encontrado.</p>
              <p className="text-xs text-slate-600">
                Se você já realizou um agendamento, verifique se digitou o WhatsApp corretamente.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 transition-colors hover:border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">#{item.id}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs text-slate-400">Cliente: {item.client_name}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm mt-0.5">{item.miniature_name}</h4>
                  </div>
                  <div>{getStatusBadge(item.status)}</div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-800/80 text-slate-400">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Data & Horário:</span>
                    <span className="text-slate-200 font-medium">
                      {formatDateBR(item.appointment_date)} às {item.appointment_time}h
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Valor:</span>
                    <span className="text-amber-400 font-mono font-bold">
                      {formatBRL(item.miniature_price)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Modalidade:</span>
                    <span className="text-slate-200 font-medium capitalize">
                      {item.modality === 'showroom' ? 'Showroom Presencial' : 'Tour por Vídeo'}
                    </span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    "{item.notes}"
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Banco de Dados: {item.sync_status === 'synced' ? 'Sincronizado Supabase' : 'Armazenamento Local'}
                  </span>
                  <a
                    href={createWhatsAppMessage(item, storePhone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 rounded-md transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Falar no WhatsApp</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
