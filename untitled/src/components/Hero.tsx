import React from 'react';
import { Calendar, Search, ShieldCheck, Sparkles, MapPin, Clock, Award } from 'lucide-react';
import { ScaleType } from '../types/index.ts';
import { heroShowroomImg } from '../data/mockData.ts';

interface HeroProps {
  selectedScale: ScaleType | 'all';
  onSelectScale: (scale: ScaleType | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenScheduleModal: () => void;
  totalModels: number;
}

export const Hero: React.FC<HeroProps> = ({
  selectedScale,
  onSelectScale,
  searchQuery,
  onSearchChange,
  onOpenScheduleModal,
  totalModels,
}) => {
  return (
    <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-[#0e1420] via-[#0b0f17] to-[#0b0f17] pt-12 pb-14">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-80 bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Main Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Showroom & Acervo de Colecionadores</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-mono">São Paulo / SP</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15] text-balance">
              Miniaturas Raras com Atendimento VIP & Agendamento Presencial
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Escolha seu modelo diecast ou resina de alta precisão (1:18, 1:24 e 1:43), agende dia e horário para inspeção minuciosa no nosso showroom ou reserve online com confirmação instantânea no WhatsApp e banco de dados Supabase.
            </p>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenScheduleModal}
                className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-98 rounded-lg shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar Horário & Comprar</span>
              </button>

              <a
                href="#catalogo"
                className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-all cursor-pointer"
              >
                <span>Explorar Catálogo ({totalModels})</span>
              </a>
            </div>

            {/* Adjacent Trust points */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
              <div>
                <div className="font-semibold text-slate-200 text-sm">Vistoria Macro</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Abertura de portas, motor e suspensão</div>
              </div>
              <div>
                <div className="font-semibold text-slate-200 text-sm">Sincronizado Supabase</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Banco de dados em tempo real</div>
              </div>
              <div>
                <div className="font-semibold text-slate-200 text-sm">WhatsApp Direto</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Confirmação ágil com consultor</div>
              </div>
            </div>
          </div>

          {/* Featured Car Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl backdrop-blur-sm overflow-hidden group">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                <img
                  src={heroShowroomImg}
                  alt="Destaque da Coleção: Miniatura Colecionável 1:18 AutoArt Signature"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

                <div className="absolute top-3 left-3 text-[11px] font-bold text-amber-400 bg-slate-950/80 px-2.5 py-1 rounded border border-amber-500/30">
                  Destaque da Semana
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <div className="text-xs text-slate-400 font-mono">1:18 · AutoArt Signature</div>
                  <div className="text-base font-bold text-white">Pagani Huayra BC & Porsche GT3</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-emerald-400 font-semibold">Exemplar de Exposição</span>
                    <span className="text-base font-mono font-bold text-amber-400">R$ 1.890,00</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  Showroom Itaim Bibi, SP
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Sessões de 45 min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Scale Filter Bar */}
        <div id="catalogo" className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Interactive Scale Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-lg overflow-x-auto">
            <button
              onClick={() => onSelectScale('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedScale === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas as Escalas
            </button>
            {(['1:18', '1:24', '1:43', '1:64'] as ScaleType[]).map((scale) => (
              <button
                key={scale}
                onClick={() => onSelectScale(scale)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedScale === scale
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Escala {scale}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por Porsche, Ferrari, Skyline..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/90 border border-slate-800 focus:border-amber-400 focus:outline-none rounded-lg text-slate-200 placeholder-slate-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
