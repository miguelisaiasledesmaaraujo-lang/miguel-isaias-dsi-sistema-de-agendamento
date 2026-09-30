import React from 'react';
import { Calendar, Car, MessageCircle, ShieldCheck, QrCode, Sparkles } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Selecione o Modelo no Acervo',
      desc: 'Navegue pelo nosso catálogo de miniaturas em escalas 1:18, 1:24 e 1:43. Verifique fotos reais, nível de abertura de partes móveis e certificados de tiragem limitada.',
      icon: Car,
    },
    {
      num: '02',
      title: 'Escolha Data & Modalidade',
      desc: 'Defina a melhor data e horário para comparecer ao nosso Showroom no Itaim Bibi ou agende uma sessão de inspeção detalhada por chamada de vídeo em 4K.',
      icon: Calendar,
    },
    {
      num: '03',
      title: 'Registro no Banco & WhatsApp',
      desc: 'O agendamento é registrado no banco de dados Supabase e um ticket oficial é gerado. Você envia os detalhes no WhatsApp com um único clique para validação imediata.',
      icon: MessageCircle,
    },
    {
      num: '04',
      title: 'Vistoria VIP & Aquisição',
      desc: 'No dia agendado, inspecione a miniatura com luvas de colecionador e lupa de precisão. Conclua a compra com Pix, cartão de crédito em até 12x ou sinal antecipado.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="como-funciona" className="py-16 border-b border-slate-800/80 bg-[#090d14]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold text-amber-400 tracking-wider uppercase">
            Experiência do Colecionador
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
            Como Funciona o Agendamento & Compra
          </h2>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Processo transparente e seguro para você adquirir miniaturas raras com garantia de procedência.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-bold text-amber-400/80">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <span>Passo {step.num} de 04</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
