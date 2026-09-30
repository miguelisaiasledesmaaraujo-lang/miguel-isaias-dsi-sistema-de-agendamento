import React, { useState } from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  Save,
  MessageCircle,
  Database,
  Download,
  Search,
  Filter,
  Car,
  DollarSign,
  TrendingUp,
  Boxes,
  ArrowUpDown,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Appointment, Miniature, SupabaseConfig } from '../types/index.ts';
import { formatBRL, formatDateBR, createWhatsAppMessage } from '../lib/whatsapp.ts';
import { uploadMiniatureImage } from '../lib/supabase.ts';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  miniatures: Miniature[];
  supabaseConfig: SupabaseConfig;
  onUpdateStatus: (id: string, newStatus: Appointment['status']) => void;
  onSaveMiniature: (miniature: Miniature) => void;
  onDeleteMiniature: (id: string) => void;
  onOpenSupabaseModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  appointments,
  miniatures,
  supabaseConfig,
  onUpdateStatus,
  onSaveMiniature,
  onDeleteMiniature,
  onOpenSupabaseModal,
}) => {
  const [activeTab, setActiveTab] = useState<'agendamentos' | 'catalogo'>('agendamentos');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Appointment['status'] | 'todos'>('todos');

  // New miniature form modal
  const [showAddMiniature, setShowAddMiniature] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [newModel, setNewModel] = useState<Partial<Miniature>>({
    name: '',
    brand: '',
    manufacturer: '',
    scale: '1:18',
    year: new Date().getFullYear(),
    color: '',
    price: 1200,
    stock: 1,
    material: 'Diecast Metal',
    image_url: '',
    description: '',
    features: ['Abertura de portas e capô', 'Rodas esterçantes'],
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const result = await uploadMiniatureImage(file);
      if (result.success && result.url) {
        setNewModel((prev) => ({ ...prev, image_url: result.url }));
      }
    } catch (err) {
      console.error('Falha no upload da foto:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (!isOpen) return null;

  // KPIs
  const totalAppointments = appointments.length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmado' || a.status === 'concluido').length;
  const potentialRevenue = appointments
    .filter((a) => a.status !== 'cancelado')
    .reduce((acc, curr) => acc + curr.miniature_price, 0);
  const totalStock = miniatures.reduce((acc, curr) => acc + curr.stock, 0);

  // Filtered Appointments
  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch =
      app.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.client_phone.includes(searchTerm) ||
      app.miniature_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Data', 'Hora', 'Cliente', 'WhatsApp', 'Email', 'Miniatura', 'Escala', 'Valor', 'Status', 'Modalidade'];
    const rows = appointments.map((a) => [
      a.id,
      a.appointment_date,
      a.appointment_time,
      `"${a.client_name}"`,
      `"${a.client_phone}"`,
      a.client_email,
      `"${a.miniature_name}"`,
      a.miniature_scale || '1:18',
      a.miniature_price,
      a.status,
      a.modality,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agendamentos_autominiaturas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateMiniature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.name || !newModel.brand || !newModel.price) return;

    const id = `min-${Date.now().toString().slice(-4)}`;
    const created: Miniature = {
      id,
      name: newModel.name,
      brand: newModel.brand,
      manufacturer: newModel.manufacturer || 'AutoArt',
      scale: newModel.scale || '1:18',
      year: Number(newModel.year) || 2020,
      color: newModel.color || 'Preto',
      price: Number(newModel.price) || 990,
      stock: Number(newModel.stock) || 1,
      is_limited_edition: Boolean(newModel.is_limited_edition),
      edition_number: newModel.edition_number,
      material: newModel.material || 'Diecast Metal',
      features: newModel.features || ['Abertura de portas e capô'],
      image_url: newModel.image_url || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800',
      badge: newModel.badge,
      description: newModel.description || 'Miniatura colecionável em escala detalhada.',
    };

    onSaveMiniature(created);
    setShowAddMiniature(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-800 bg-[#0c1017] shadow-2xl flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-[#0c1017] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Painel de Gestão & Agendamentos</h2>
              <p className="text-xs text-slate-400">
                Gerenciamento de reservas, status do cliente e acervo de miniaturas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSupabaseModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>{supabaseConfig.isConnected ? 'Supabase Conectado' : 'Supabase Local'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/60">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Total Agendamentos</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
              {totalAppointments}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Registrados no banco</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/60">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Reservas Confirmadas</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
              {confirmedCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Sessões agendadas</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/60">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Faturamento Estimado</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-amber-400 tabular-nums">
              {formatBRL(potentialRevenue)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Valor em carteira ativa</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/60">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Miniaturas em Estoque</span>
              <Car className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
              {totalStock} un.
            </div>
            <div className="text-[11px] text-slate-500 mt-1">{miniatures.length} modelos cadastrados</div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('agendamentos')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'agendamentos'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Agendamentos & Vendas ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('catalogo')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'catalogo'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Catálogo de Miniaturas ({miniatures.length})
            </button>
          </div>

          {activeTab === 'agendamentos' ? (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md border border-slate-700 bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddMiniature(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Nova Miniatura</span>
            </button>
          )}
        </div>

        {/* Tab Content: Agendamentos */}
        {activeTab === 'agendamentos' && (
          <div className="p-6 space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filtrar por cliente, telefone ou carro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Status Segmented Control */}
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
                {(['todos', 'pendente', 'confirmado', 'concluido', 'cancelado'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Código / Data</th>
                    <th className="py-3 px-4">Cliente & Contato</th>
                    <th className="py-3 px-4">Miniatura Solicitada</th>
                    <th className="py-3 px-4">Valor</th>
                    <th className="py-3 px-4">Modalidade</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-500">
                        Nenhum agendamento encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono">
                          <span className="font-bold text-amber-400">#{app.id}</span>
                          <div className="text-[11px] text-slate-400">
                            {formatDateBR(app.appointment_date)} às {app.appointment_time}h
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{app.client_name}</div>
                          <div className="text-[11px] text-slate-400">{app.client_phone}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-white truncate max-w-[200px]">
                            {app.miniature_name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Escala {app.miniature_scale || '1:18'}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                          {formatBRL(app.miniature_price)}
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-[11px] text-slate-300">
                            {app.modality === 'showroom' ? 'Showroom VIP' : 'Tour por Vídeo'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={app.status}
                            onChange={(e) => onUpdateStatus(app.id, e.target.value as Appointment['status'])}
                            className={`py-1 px-2 rounded text-xs font-semibold border focus:outline-none cursor-pointer ${
                              app.status === 'confirmado'
                                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                                : app.status === 'concluido'
                                ? 'bg-sky-950/60 border-sky-500/40 text-sky-400'
                                : app.status === 'cancelado'
                                ? 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                                : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                            }`}
                          >
                            <option value="pendente">Pendente</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="concluido">Concluído</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={createWhatsAppMessage(app, supabaseConfig.storePhone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Abrir WhatsApp com cliente"
                              className="p-1.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 hover:bg-emerald-900/80 cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Catálogo */}
        {activeTab === 'catalogo' && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {miniatures.map((min) => (
                <div
                  key={min.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-12 rounded bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                      <img
                        src={min.image_url}
                        alt={min.name}
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-mono text-amber-400">{min.scale} · {min.manufacturer}</span>
                      <h4 className="font-bold text-white text-sm truncate">{min.name}</h4>
                      <div className="text-xs font-mono font-bold text-white mt-1">
                        {formatBRL(min.price)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Estoque: <strong className="text-white">{min.stock} un.</strong></span>
                    <button
                      onClick={() => onDeleteMiniature(min.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Excluir miniatura"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Miniature Modal */}
        {showAddMiniature && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
            <div className="relative w-full max-w-lg rounded-xl border border-slate-800 bg-[#0e131d] p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm">Cadastrar Nova Miniatura</h3>
                <button
                  onClick={() => setShowAddMiniature(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateMiniature} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Nome do Veículo / Modelo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ford GT Heritage Edition"
                    value={newModel.name}
                    onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Marca *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ford"
                      value={newModel.brand}
                      onChange={(e) => setNewModel({ ...newModel, brand: e.target.value })}
                      className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Fabricante</label>
                    <input
                      type="text"
                      placeholder="Ex: AutoArt"
                      value={newModel.manufacturer}
                      onChange={(e) => setNewModel({ ...newModel, manufacturer: e.target.value })}
                      className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Escala</label>
                    <select
                      value={newModel.scale}
                      onChange={(e) => setNewModel({ ...newModel, scale: e.target.value as any })}
                      className="w-full py-2 px-2 bg-slate-900 border border-slate-700 rounded text-white"
                    >
                      <option value="1:18">1:18</option>
                      <option value="1:24">1:24</option>
                      <option value="1:43">1:43</option>
                      <option value="1:64">1:64</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Preço (R$) *</label>
                    <input
                      type="number"
                      required
                      value={newModel.price}
                      onChange={(e) => setNewModel({ ...newModel, price: Number(e.target.value) })}
                      className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Estoque</label>
                    <input
                      type="number"
                      value={newModel.stock}
                      onChange={(e) => setNewModel({ ...newModel, stock: Number(e.target.value) })}
                      className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Foto da Miniatura (Upload no Supabase Storage ou URL)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 cursor-pointer transition-colors text-xs font-medium">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isUploadingPhoto ? 'Enviando ao Storage...' : 'Fazer Upload de Foto'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploadingPhoto}
                        className="hidden"
                      />
                    </label>

                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Ou cole o link da imagem (https://...)"
                        value={newModel.image_url}
                        onChange={(e) => setNewModel({ ...newModel, image_url: e.target.value })}
                        className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                      />
                    </div>
                  </div>

                  {newModel.image_url && (
                    <div className="mt-2 flex items-center gap-2.5 p-2 rounded bg-slate-950 border border-slate-800">
                      <div className="w-12 h-9 rounded overflow-hidden bg-slate-900 shrink-0">
                        <img
                          src={newModel.image_url}
                          alt="Prévia"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium truncate flex-1">
                        Foto carregada pronta para ser salva no Supabase
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Descrição</label>
                  <textarea
                    rows={2}
                    placeholder="Detalhes de acabamento, interior, motor..."
                    value={newModel.description}
                    onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMiniature(false)}
                    className="px-3 py-1.5 rounded text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-amber-400 text-slate-950 font-bold hover:bg-amber-300"
                  >
                    Salvar Miniatura
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
