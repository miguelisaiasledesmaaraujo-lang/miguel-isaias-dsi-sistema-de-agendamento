import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  ExternalLink,
  Code,
  ShieldCheck,
  Server
} from 'lucide-react';
import { SupabaseConfig, Appointment, Miniature } from '../types/index.ts';
import { testConnection, getSupabaseSchemaSQL, resetSupabaseClient } from '../lib/supabase.ts';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfig;
  onSaveConfig: (config: SupabaseConfig) => void;
  onSyncAllToSupabase: () => Promise<{ success: boolean; message: string }>;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onSyncAllToSupabase,
}) => {
  const [url, setUrl] = useState(config.url);
  const [anonKey, setAnonKey] = useState(config.anonKey);
  const [storePhone, setStorePhone] = useState(config.storePhone || '5511999998888');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [showSQL, setShowSQL] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testConnection(url.trim(), anonKey.trim());
      setTestResult(res);

      if (res.success) {
        const updatedConfig: SupabaseConfig = {
          url: url.trim(),
          anonKey: anonKey.trim(),
          isConnected: true,
          storePhone: storePhone.trim(),
          lastChecked: new Date().toISOString(),
          error: undefined,
        };
        onSaveConfig(updatedConfig);
        resetSupabaseClient();
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Falha ao testar conexão.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveOnly = () => {
    const updatedConfig: SupabaseConfig = {
      url: url.trim(),
      anonKey: anonKey.trim(),
      isConnected: config.isConnected,
      storePhone: storePhone.trim(),
      lastChecked: new Date().toISOString(),
    };
    onSaveConfig(updatedConfig);
    resetSupabaseClient();
    onClose();
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(getSupabaseSchemaSQL());
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2500);
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await onSyncAllToSupabase();
      setSyncResult(res.message);
    } catch (err: any) {
      setSyncResult('Erro ao sincronizar: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-800 bg-[#0e131d] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Integração com Supabase Database</h2>
              <p className="text-xs text-slate-400">
                Conecte seu banco de dados Supabase para salvar e sincronizar agendamentos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              config.isConnected
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
            }`}
          >
            {config.isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Server className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <div className="font-bold text-white text-sm">
                {config.isConnected
                  ? 'Supabase Conectado e Operando'
                  : 'Modo Armazenamento Local Ativo (Pronto para Uso)'}
              </div>
              <p className="mt-1 leading-relaxed opacity-90">
                {config.isConnected
                  ? 'Todos os novos agendamentos e alterações no catálogo são gravados diretamente no seu banco de dados Supabase.'
                  : 'O sistema está gravando todos os agendamentos e reservas no armazenamento local seguro do navegador. Para persistir no seu projeto Supabase em nuvem, insira a URL e Chave Anon abaixo.'}
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                placeholder="https://sua-instancia.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700/80 rounded-lg text-white font-mono placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Encontrado em <em>Project Settings &gt; API &gt; Project URL</em>
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700/80 rounded-lg text-white font-mono placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Encontrado em <em>Project Settings &gt; API &gt; Project API keys &gt; anon public</em>
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                WhatsApp da Loja para Agendamentos (com DDI e DDD)
              </label>
              <input
                type="text"
                placeholder="5511999998888"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700/80 rounded-lg text-white font-mono placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Número onde os clientes enviarão os comprovantes de agendamento.
              </span>
            </div>

            {/* Test result message */}
            {testResult && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {syncResult && (
              <div className="p-3 rounded-lg border border-sky-500/40 bg-sky-950/40 text-sky-300 text-xs">
                {syncResult}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !url || !anonKey}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-98 disabled:opacity-50 text-white font-bold text-xs transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testando Conexão...' : 'Testar Conexão Agora'}</span>
              </button>

              <button
                type="button"
                onClick={handleSyncData}
                disabled={isSyncing || !config.isConnected}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Server className="w-3.5 h-3.5 text-amber-400" />
                <span>Sincronizar Dados Locais</span>
              </button>

              <button
                type="button"
                onClick={handleSaveOnly}
                className="ml-auto px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Salvar Configurações
              </button>
            </div>
          </div>

          {/* SQL Schema Creator Box */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Script SQL Completo (Tabelas + Storage Bucket + Políticas RLS)
                </span>
              </div>
              <button
                onClick={handleCopySQL}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-800/60 rounded cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSQL ? 'Copiado!' : 'Copiar Script SQL Completo'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Este script cria as tabelas <code className="text-slate-200">appointments</code> e <code className="text-slate-200">miniatures</code>, além de criar o <strong>Bucket de Armazenamento (Storage)</strong> com limite de 10MB e <strong>todas as 4 políticas de upload/leitura de fotos</strong>. Cole na aba <strong>SQL Editor</strong> do painel Supabase:
            </p>

            <div className="relative rounded-lg bg-slate-950 border border-slate-800 p-3 font-mono text-[11px] text-slate-300 max-h-56 overflow-y-auto">
              <pre>{getSupabaseSchemaSQL()}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
