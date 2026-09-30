import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Car,
  MapPin,
  Video,
  Truck,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  QrCode,
  DollarSign
} from 'lucide-react';
import { Miniature, Appointment, AppointmentModality, PaymentPreference } from '../types/index.ts';
import { AVAILABLE_TIME_SLOTS } from '../data/mockData.ts';
import { formatBRL, createWhatsAppMessage, formatDateBR } from '../lib/whatsapp.ts';
import { saveAppointment } from '../lib/supabase.ts';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  miniatures: Miniature[];
  initialMiniature?: Miniature | null;
  storePhone: string;
  onAppointmentCreated: (appointment: Appointment) => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  miniatures,
  initialMiniature,
  storePhone,
  onAppointmentCreated,
}) => {
  const [selectedMiniatureId, setSelectedMiniatureId] = useState<string>(
    initialMiniature?.id || miniatures[0]?.id || ''
  );

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const [appointmentDate, setAppointmentDate] = useState<string>(todayStr);
  const [appointmentTime, setAppointmentTime] = useState<string>(AVAILABLE_TIME_SLOTS[1]);
  const [modality, setModality] = useState<AppointmentModality>('showroom');
  const [paymentPreference, setPaymentPreference] = useState<PaymentPreference>('pix');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentMiniature = miniatures.find((m) => m.id === selectedMiniatureId) || initialMiniature;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!clientName.trim()) {
      setErrorMsg('Por favor, informe seu nome completo.');
      return;
    }
    if (!clientPhone.trim() || clientPhone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Informe um número de WhatsApp válido com DDD (mínimo 10 dígitos).');
      return;
    }
    if (!appointmentDate) {
      setErrorMsg('Escolha uma data para o agendamento.');
      return;
    }
    if (!appointmentTime) {
      setErrorMsg('Escolha um horário disponível.');
      return;
    }
    if (!currentMiniature) {
      setErrorMsg('Selecione uma miniatura para agendar.');
      return;
    }

    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newAppointment: Appointment = {
      id: `AM-${randomSuffix}`,
      created_at: new Date().toISOString(),
      client_name: clientName.trim(),
      client_phone: clientPhone.trim(),
      client_email: clientEmail.trim() || 'cliente@autominiaturas.com.br',
      miniature_id: currentMiniature.id,
      miniature_name: currentMiniature.name,
      miniature_scale: currentMiniature.scale,
      miniature_price: currentMiniature.price,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      modality,
      payment_preference: paymentPreference,
      notes: notes.trim(),
      status: 'pendente',
      sync_status: 'local_only',
    };

    try {
      const result = await saveAppointment(newAppointment);
      newAppointment.sync_status = result.syncStatus;
      setConfirmedAppointment(newAppointment);
      onAppointmentCreated(newAppointment);
    } catch (err: any) {
      setErrorMsg('Erro ao registrar agendamento: ' + (err?.message || 'Tente novamente.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (!confirmedAppointment) return;
    navigator.clipboard.writeText(`#${confirmedAppointment.id}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleResetAndClose = () => {
    setConfirmedAppointment(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-800 bg-[#0e131d] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-[#0e131d]/95 backdrop-blur px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {confirmedAppointment ? 'Agendamento Confirmado' : 'Agendar Visita & Compra de Miniatura'}
              </h2>
              <p className="text-xs text-slate-400">
                {confirmedAppointment
                  ? 'Sua reserva foi gravada no banco de dados e aguarda confirmação no WhatsApp'
                  : 'Reserve seu modelo exclusivo e escolha a melhor data e horário'}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {confirmedAppointment ? (
            /* Confirmation Screen */
            <div className="space-y-6">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Agendamento Realizado com Sucesso!</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Os dados foram gravados no banco de dados. Agora entre em contato pelo WhatsApp para validação imediata do seu horário.
                </p>

                {/* Ticket code badge */}
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs">
                  <span className="text-slate-400">Código da Reserva:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">#{confirmedAppointment.id}</span>
                  <button
                    onClick={handleCopyCode}
                    className="ml-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Copiar código"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                {copiedCode && <span className="block text-[11px] text-emerald-400 mt-1 font-medium">Código copiado!</span>}
              </div>

              {/* Summary Details */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Miniatura:</span>
                  <span className="font-bold text-white">{confirmedAppointment.miniature_name} ({confirmedAppointment.miniature_scale})</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Valor Total:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {formatBRL(confirmedAppointment.miniature_price)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Data e Hora:</span>
                  <span className="font-semibold text-white">
                    {formatDateBR(confirmedAppointment.appointment_date)} às {confirmedAppointment.appointment_time}h
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Modalidade:</span>
                  <span className="font-semibold text-white">
                    {confirmedAppointment.modality === 'showroom'
                      ? 'Showroom Presencial VIP (Itaim Bibi, SP)'
                      : confirmedAppointment.modality === 'video_vip'
                      ? 'Apresentação VIP em Vídeo Privado'
                      : 'Entrega Especial & Vistoria'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Status no Banco:</span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Pendente de Confirmação no WhatsApp
                  </span>
                </div>
              </div>

              {/* WhatsApp Call to Action */}
              <div className="space-y-3">
                <a
                  href={createWhatsAppMessage(confirmedAppointment, storePhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Enviar Confirmação no WhatsApp da Loja</span>
                  <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
                </a>

                <button
                  onClick={handleResetAndClose}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Concluir e Voltar ao Catálogo
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/80 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Step 1: Select Miniature Car */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  1. Modelo da Miniatura Selecionada
                </label>
                <div className="relative">
                  <select
                    value={selectedMiniatureId}
                    onChange={(e) => setSelectedMiniatureId(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    {miniatures.map((m) => (
                      <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                        {m.name} · {m.scale} ({m.manufacturer}) - {formatBRL(m.price)}
                      </option>
                    ))}
                  </select>
                </div>

                {currentMiniature && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 rounded bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                        <img
                          src={currentMiniature.image_url}
                          alt={currentMiniature.name}
                          className="w-full h-full object-cover"
                          onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{currentMiniature.name}</div>
                        <div className="text-slate-400 text-[11px]">
                          {currentMiniature.scale} · {currentMiniature.material} · {currentMiniature.color}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-[10px]">Valor</div>
                      <div className="font-mono font-bold text-amber-400 text-sm">
                        {formatBRL(currentMiniature.price)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Modality */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  2. Tipo de Agendamento
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModality('showroom')}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      modality === 'showroom'
                        ? 'border-amber-400 bg-amber-400/10 text-white'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-white">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span>Showroom VIP</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Inspeção com luvas e café no Itaim Bibi, SP
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModality('video_vip')}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      modality === 'video_vip'
                        ? 'border-amber-400 bg-amber-400/10 text-white'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-white">
                      <Video className="w-4 h-4 text-amber-400" />
                      <span>Vídeo Tour 4K</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Apresentação privada via chamada de vídeo
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModality('delivery_vip')}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      modality === 'delivery_vip'
                        ? 'border-amber-400 bg-amber-400/10 text-white'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-white">
                      <Truck className="w-4 h-4 text-amber-400" />
                      <span>Entrega Express</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Entrega com agendamento e vistoria na entrega
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 3: Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    3. Data Desejada
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={todayStr}
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Horário Disponível
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {AVAILABLE_TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setAppointmentTime(slot)}
                        className={`py-2 px-1 text-xs font-mono font-medium rounded-md border text-center transition-colors cursor-pointer ${
                          appointmentTime === slot
                            ? 'border-amber-400 bg-amber-400 text-slate-950 font-bold'
                            : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 4: Payment Preference */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  4. Forma de Pagamento Preferida
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentPreference('pix')}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      paymentPreference === 'pix'
                        ? 'border-amber-400 bg-amber-400/10 text-white font-semibold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <QrCode className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    <span className="text-[11px] block">Pix no Showroom</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentPreference('pix_agora')}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      paymentPreference === 'pix_agora'
                        ? 'border-amber-400 bg-amber-400/10 text-white font-semibold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    <span className="text-[11px] block">Sinal Pix (Garantia)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentPreference('cartao_presencial')}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      paymentPreference === 'cartao_presencial'
                        ? 'border-amber-400 bg-amber-400/10 text-white font-semibold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-sky-400" />
                    <span className="text-[11px] block">Cartão até 12x</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentPreference('dinheiro')}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      paymentPreference === 'dinheiro'
                        ? 'border-amber-400 bg-amber-400/10 text-white font-semibold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <DollarSign className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    <span className="text-[11px] block">Espécie no Ato</span>
                  </button>
                </div>
              </div>

              {/* Step 5: Customer Details */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  5. Seus Dados para Contato
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Nome Completo *</span>
                    <input
                      type="text"
                      placeholder="Ex: Carlos Eduardo Silva"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full py-2 px-3 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">WhatsApp com DDD *</span>
                    <input
                      type="tel"
                      placeholder="(11) 98765-4321"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full py-2 px-3 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">E-mail (para confirmação)</span>
                    <input
                      type="email"
                      placeholder="carlos@exemplo.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full py-2 px-3 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Observações ou Dúvidas</span>
                    <input
                      type="text"
                      placeholder="Ex: Gostaria de ver o certificado de série"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full py-2 px-3 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-98 disabled:opacity-50 transition-all shadow-lg shadow-amber-400/20 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{isSubmitting ? 'Salvando no Banco...' : 'Confirmar Agendamento & Salvar no Banco'}</span>
                </button>
                <p className="text-center text-[11px] text-slate-500 mt-2">
                  Seus dados são salvos de forma segura no banco de dados e você será direcionado para o WhatsApp para confirmação imediata.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
