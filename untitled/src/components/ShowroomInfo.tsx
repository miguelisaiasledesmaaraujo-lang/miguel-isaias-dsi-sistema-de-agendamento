import React from 'react';
import { MapPin, Clock, ShieldCheck, Sparkles, Coffee, Box, Phone } from 'lucide-react';
import { STORE_ADDRESS, heroShowroomImg } from '../data/mockData.ts';

interface ShowroomInfoProps {
  onOpenSchedule: () => void;
  storePhone: string;
}

export const ShowroomInfo: React.FC<ShowroomInfoProps> = ({
  onOpenSchedule,
  storePhone,
}) => {
  return (
    <section id="showroom" className="py-16 border-b border-slate-800/80 bg-[#0c1018]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Details */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-semibold text-amber-400 tracking-wider uppercase">
                Ambiente Exclusivo
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
                Showroom Físico de Alta Precisão
              </h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Desenvolvemos uma galeria climatizada e com iluminação de estúdio fotográfico (CRI &gt; 98) para que você possa apreciar cada centímetro da pintura, acabamento de tapeçaria interna e engenharia mecânica da sua miniatura antes de fechar negócio.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start gap-3">
                <Coffee className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white text-sm">Sessão Privada com Café</div>
                  <div className="text-slate-400 mt-1">Atendimento individual com consultor especialista em diecast.</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white text-sm">Kit de Inspeção Cirúrgica</div>
                  <div className="text-slate-400 mt-1">Disponibilizamos luvas de algodão e lupas ópticas de 10x.</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start gap-3">
                <Box className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white text-sm">Embalagem de Alta Proteção</div>
                  <div className="text-slate-400 mt-1">Cases reforçados e proteção sob medida para viagens e transporte.</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white text-sm">Certificado de Autenticidade</div>
                  <div className="text-slate-400 mt-1">Checagem de chassi, holograma de fábrica e caixa original.</div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenSchedule}
                className="px-6 py-3 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer shadow-md shadow-amber-400/20"
              >
                Agendar Horário no Showroom
              </button>
            </div>
          </div>

          {/* Right Column: Address & Hours Card with Showroom Showcase Image */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 aspect-[16/9] shadow-xl group">
              <img
                src={heroShowroomImg}
                alt="Showroom de Colecionáveis de Miniaturas AutoMiniaturas VIP"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 text-xs text-white font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Showroom Aberto para Visitas Agendadas</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Localização & Contato</h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Endereço do Showroom</div>
                    <div className="text-slate-400 mt-0.5 leading-relaxed">{STORE_ADDRESS}</div>
                    <span className="text-[11px] text-amber-400/90 font-medium mt-0.5 block">
                      Estacionamento com manobrista no local
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Horários de Atendimento Agendado</div>
                    <div className="text-slate-400 mt-0.5">Segunda a Sexta: 09h às 19h30</div>
                    <div className="text-slate-400">Sábados: 09h às 16h (Com agendamento prévio)</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Canal Direto de WhatsApp</div>
                    <div className="text-slate-400 mt-0.5 font-mono">+{storePhone}</div>
                    <div className="text-[11px] text-emerald-400">Confirmação de agendamento em até 15 minutos</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
                ⚠️ <strong className="text-slate-300">Nota aos Colecionadores:</strong> Por motivos de segurança e exclusividade no atendimento, o acesso ao showroom é realizado estritamente mediante agendamento prévio registrado em nosso sistema.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
