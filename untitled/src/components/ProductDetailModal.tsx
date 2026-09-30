import React, { useState } from 'react';
import { X, Calendar, CheckCircle2, ShieldCheck, Box, Sparkles, MapPin, Truck, Video } from 'lucide-react';
import { Miniature } from '../types/index.ts';
import { formatBRL } from '../lib/whatsapp.ts';

interface ProductDetailModalProps {
  miniature: Miniature | null;
  onClose: () => void;
  onSchedule: (miniature: Miniature) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  miniature,
  onClose,
  onSchedule,
}) => {
  const [imageError, setImageError] = useState(false);

  if (!miniature) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-[#0e131d] shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left Column: Image & Highlights */}
          <div className="md:col-span-6 bg-slate-950 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-800/80">
              {!imageError ? (
                <img
                  src={miniature.image_url}
                  alt={miniature.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                  <Box className="w-12 h-12 text-amber-500/40 mb-2" />
                  <span className="text-xs">{miniature.name}</span>
                </div>
              )}

              {miniature.badge && (
                <span className="absolute top-3 left-3 text-xs font-bold text-amber-300 bg-slate-950/90 px-2.5 py-1 rounded border border-amber-500/30">
                  {miniature.badge}
                </span>
              )}
            </div>

            {/* Quick Inspection Bullet Points */}
            <div className="mt-6 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Garantia de autenticidade e caixa original de fábrica intacta</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Disponível para inspeção presencial imediata no showroom</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Opção de tour por vídeo ao vivo em 4K com macro zoom</span>
              </div>
            </div>
          </div>

          {/* Right Column: Specs & Direct Booking CTA */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                <span>Escala {miniature.scale}</span>
                <span>·</span>
                <span>{miniature.manufacturer}</span>
                <span>·</span>
                <span>{miniature.material}</span>
              </div>

              <h2 className="mt-2 text-2xl font-extrabold text-white leading-tight">
                {miniature.name}
              </h2>

              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                {miniature.description}
              </p>

              {/* Technical Spec Grid */}
              <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400">Marca / Veículo</div>
                  <div className="font-semibold text-white mt-0.5">{miniature.brand}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400">Ano do Modelo</div>
                  <div className="font-semibold text-white mt-0.5">{miniature.year}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400">Cor Oficial</div>
                  <div className="font-semibold text-white mt-0.5">{miniature.color}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400">Edição / Certificado</div>
                  <div className="font-semibold text-white mt-0.5 font-mono">
                    {miniature.edition_number || 'Série Regular'}
                  </div>
                </div>
              </div>

              {/* Features list */}
              <div className="mt-6">
                <div className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Destaques de Engenharia & Articulação:
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {miniature.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Contiguous Purchase / Schedule Module */}
            <div className="pt-6 border-t border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs text-slate-400 block">Preço à vista / reserva</span>
                  <span className="text-2xl font-mono font-extrabold text-white">
                    {formatBRL(miniature.price)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-400 font-semibold block">
                    {miniature.stock > 0 ? `${miniature.stock} em estoque` : 'Esgotado'}
                  </span>
                  <span className="text-[11px] text-slate-400">Showroom SP</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onSchedule(miniature);
                }}
                disabled={miniature.stock <= 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-400/20 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar Horário para Vistoria & Compra</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
