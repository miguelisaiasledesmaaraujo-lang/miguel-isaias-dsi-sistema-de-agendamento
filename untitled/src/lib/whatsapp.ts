import { Appointment } from '../types/index.ts';

const MODALITY_NAMES: Record<Appointment['modality'], string> = {
  showroom: 'Showroom Presencial VIP (Visita & Compra)',
  video_vip: 'Apresentação VIP em Vídeo Privado',
  delivery_vip: 'Entrega Especial & Vistoria Express',
};

const PAYMENT_NAMES: Record<Appointment['payment_preference'], string> = {
  pix: 'Pix no Showroom',
  pix_agora: 'Pix Imediato (Reserva Garantida)',
  cartao_presencial: 'Cartão de Débito/Crédito no Showroom',
  dinheiro: 'Espécie / À vista na Retirada',
};

export function createWhatsAppMessage(appointment: Appointment, storePhone: string): string {
  // Clean phone number (leave only digits)
  const cleanPhone = storePhone.replace(/\D/g, '');

  const dateFormatted = appointment.appointment_date.split('-').reverse().join('/');
  const modalityLabel = MODALITY_NAMES[appointment.modality] || appointment.modality;
  const paymentLabel = PAYMENT_NAMES[appointment.payment_preference] || appointment.payment_preference;
  const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    appointment.miniature_price
  );

  const message = [
    `🏎️ *NOVO AGENDAMENTO DE MINIATURA - AUTOMINIATURAS VIP*`,
    ``,
    `Olá! Gostaria de confirmar meu agendamento para compra de miniatura:`,
    ``,
    `*Código da Reserva:* #${appointment.id}`,
    `*Modelo:* ${appointment.miniature_name} (${appointment.miniature_scale || '1:18'})`,
    `*Valor:* ${priceFormatted}`,
    `*Data Agendada:* ${dateFormatted}`,
    `*Horário:* ${appointment.appointment_time}h`,
    `*Modalidade:* ${modalityLabel}`,
    `*Forma de Pagamento:* ${paymentLabel}`,
    ``,
    `*Dados do Colecionador:*`,
    `• Nome: ${appointment.client_name}`,
    `• WhatsApp: ${appointment.client_phone}`,
    `• E-mail: ${appointment.client_email}`,
    appointment.notes ? `• Observações: ${appointment.notes}` : null,
    ``,
    `Aguardo a confirmação da equipe. Obrigado!`,
  ]
    .filter((line) => line !== null)
    .join('\n');

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}
