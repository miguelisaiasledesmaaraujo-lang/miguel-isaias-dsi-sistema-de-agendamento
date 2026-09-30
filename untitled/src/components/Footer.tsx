import React from 'react';
import { Database, MessageCircle, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { SupabaseConfig } from '../types/index.ts';

interface FooterProps {
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseModal: () => void;
  onOpenAdminDashboard: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  supabaseConfig,
  onOpenSupabaseModal,
  onOpenAdminDashboard,
}) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#080b10] text-slate-400 text-xs py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/60">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-amber-400 flex items-center justify-center text-slate-950 font-black text-xs">
                AV
              </div>
              <span className="font-display font-bold text-white text-base tracking-wider uppercase">
                AutoMiniaturas VIP
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Loja e showroom especializado em miniaturas de carros de alta precisão nas escalas 1:18, 1:24 e 1:43 para colecionadores exigentes.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Navegação Rápida</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li><a href="#catalogo" className="hover:text-amber-400 transition-colors">Catálogo Completo</a></li>
              <li><a href="#como-funciona" className="hover:text-amber-400 transition-colors">Como Funciona</a></li>
              <li><a href="#showroom" className="hover:text-amber-400 transition-colors">Showroom Presencial</a></li>
              <li><button onClick={onOpenAdminDashboard} className="hover:text-amber-400 transition-colors cursor-pointer text-left">Painel do Lojista</button></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Banco de Dados & Supabase</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sistema integrado ao Supabase para persistência relacional de agendamentos e catálogo de miniaturas.
            </p>
            <button
              onClick={onOpenSupabaseModal}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer pt-1"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Configurar Conexão Supabase</span>
            </button>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Segurança & Contato</h4>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>Itaim Bibi, São Paulo - SP</div>
              <div>WhatsApp: +{supabaseConfig.storePhone}</div>
              <div className="text-emerald-400 font-medium">Atendimento com Hora Marcada</div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} AutoMiniaturas VIP. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Dados protegidos via Supabase</span>
            </span>
            <span>·</span>
            <span>Escalas 1:18, 1:24, 1:43</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
