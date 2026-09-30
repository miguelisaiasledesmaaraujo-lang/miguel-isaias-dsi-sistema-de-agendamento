import React, { useState } from 'react';
import { Calendar, Eye, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Miniature } from '../types/index.ts';
import { formatBRL } from '../lib/whatsapp.ts';

interface MiniatureCardProps {
  miniature: Miniature;
  onSelectForAppointment: (miniature: Miniature) => void;
  onViewDetails: (miniature: Miniature) => void;
}

export const MiniatureCard: React.FC<MiniatureCardProps> = ({
  miniature,
  onSelectForAppointment,
  onViewDetails,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-[#101622] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl hover:shadow-black/50">
      {/* Product Image Slot */}
      <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden cursor-pointer group" onClick={() => onViewDetails(miniature)}>
        {!imageError ? (
          <img
            src={miniature.image_url}
            alt={miniature.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-slate-500">
            <div className="w-12 h-12 rounded-lg bg-slate-800/80 flex items-center justify-center mb-2">
              <span className="font-display font-black text-amber-400 text-lg">AV</span>
            </div>
            <span className="text-xs font-semibold text-slate-400 text-center">{miniature.name}</span>
            <span className="text-[10px] text-slate-600 mt-1">Escala {miniature.scale}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#101622] via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Quiet badge if limited edition */}
        {miniature.badge && (
          <div className="absolute top-3 left-3 text-[11px] font-bold text-amber-300 bg-slate-950/80 px-2.5 py-0.5 rounded border border-amber-500/20 backdrop-blur-xs">
            {miniature.badge}
          </div>
        )}

        {/* Edition Number */}
        {miniature.edition_number && (
          <div className="absolute top-3 right-3 text-[11px] font-mono text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 backdrop-blur-xs">
            {miniature.edition_number}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Zero-Pill Unboxed Metadata */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span className="text-amber-400 font-semibold">{miniature.scale}</span>
            <span aria-hidden="true">·</span>
            <span>{miniature.manufacturer}</span>
            <span aria-hidden="true">·</span>
            <span>{miniature.material}</span>
          </div>

          <h3
            onClick={() => onViewDetails(miniature)}
            className="mt-2 text-base font-bold text-white hover:text-amber-400 transition-colors cursor-pointer line-clamp-1"
          >
            {miniature.name}
          </h3>

          <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {miniature.description}
          </p>

          {/* Key opening features */}
          <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-slate-400">
            {miniature.features.slice(0, 2).map((feature, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[200px]">{feature}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Price & Primary Action */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-slate-400">Valor de Colecionador</div>
            <div className="text-lg font-mono font-bold text-white tabular-nums">
              {formatBRL(miniature.price)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(miniature)}
              title="Ver detalhes da miniatura"
              className="p-2 rounded-lg border border-slate-700/80 bg-slate-800/60 text-slate-300 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectForAppointment(miniature)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-98 rounded-lg shadow-sm shadow-amber-400/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agendar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
