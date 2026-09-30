import { Miniature, Appointment } from '../types/index.ts';

import heroShowroomImg from '../assets/images/hero_diecast_showroom_1790709230425.jpg';
import porscheImg from '../assets/images/car_porsche_gt3_1790709244094.jpg';
import skylineImg from '../assets/images/car_skyline_gtr_1790709254738.jpg';
import ferrariImg from '../assets/images/car_ferrari_f40_1790709266658.jpg';
import shelbyImg from '../assets/images/car_shelby_cobra_1790709276154.jpg';
import sennaImg from '../assets/images/car_senna_mclaren_1790709289586.jpg';
import mercedesImg from '../assets/images/car_mercedes_gullwing_1790709302124.jpg';
import lamboImg from '../assets/images/car_lambo_countach_1790709312163.jpg';
import bmwImg from '../assets/images/car_bmw_m3_1790709322104.jpg';

export { heroShowroomImg };

export const INITIAL_MINIATURES: Miniature[] = [
  {
    id: 'min-001',
    name: 'Porsche 911 GT3 RS (991.2)',
    brand: 'Porsche',
    manufacturer: 'AutoArt Signature',
    scale: '1:18',
    year: 2019,
    color: 'Lizard Green & Carbono',
    price: 1890,
    stock: 2,
    is_limited_edition: true,
    edition_number: '142/500',
    material: 'Diecast Metal',
    features: [
      'Abertura total de portas, capô e tampa traseira',
      'Direção esterçante com volante funcional',
      'Gaiola de proteção interna e cintos em tecido',
      'Pinças de freio cerâmicas detalhadas'
    ],
    image_url: porscheImg,
    badge: 'Edição Limitada',
    description: 'Miniatura ultra-detalhada da linha Signature com pintura fiel ao código oficial Lizard Green. Peça de centro de coleção.'
  },
  {
    id: 'min-002',
    name: 'Nissan Skyline GT-R R34 V-Spec II',
    brand: 'Nissan',
    manufacturer: 'AutoArt Millenium',
    scale: '1:18',
    year: 2002,
    color: 'Bayside Blue Perolizado',
    price: 2450,
    stock: 1,
    is_limited_edition: true,
    edition_number: '089/350',
    material: 'Diecast Metal',
    features: [
      'Motor RB26DETT twin-turbo fielmente reproduzido com tubulações',
      'Rodas NISMO LM-GT4 cromadas',
      'Interior aveludado e painel MFD funcional estático',
      'Capô em fibra de carbono funcional com suporte de haste'
    ],
    image_url: skylineImg,
    badge: 'Última Unidade',
    description: 'O lendário Godzilla em sua versão mais reverenciada. Acabamento primoroso de colecionador clássico japonês.'
  },
  {
    id: 'min-003',
    name: 'Ferrari F40 Competizione',
    brand: 'Ferrari',
    manufacturer: 'Kyosho High-End',
    scale: '1:18',
    year: 1989,
    color: 'Rosso Corsa Tradizionale',
    price: 2790,
    stock: 3,
    is_limited_edition: false,
    material: 'Diecast Metal',
    features: [
      'Clamshell traseiro basculante com hastes de sustentação',
      'Faróis escamoteáveis articulados por alavanca no chassi',
      'Assentos concha kevlar com textura tátil',
      'Rodas OZ Racing monotranca intercambiáveis'
    ],
    image_url: ferrariImg,
    badge: 'Ícone Supremo',
    description: 'Último supercarro homologado sob supervisão de Enzo Ferrari. Nível cirúrgico de detalhamento de chassis tubular.'
  },
  {
    id: 'min-004',
    name: 'Shelby Cobra 427 S/C Roadster',
    brand: 'Shelby American',
    manufacturer: 'GMP / Acme Diecast',
    scale: '1:18',
    year: 1965,
    color: 'Guardsman Blue com Faixas Brancas',
    price: 1580,
    stock: 2,
    is_limited_edition: true,
    edition_number: '310/750',
    material: 'Diecast Metal',
    features: [
      'Escapamentos laterais cromados com blindagem térmica',
      'Fiação completa de ignição e carburador Holley quadrijet',
      'Santantônio do piloto em aço inox',
      'Pneus Goodyear com faixa branca com lettering em relevo'
    ],
    image_url: shelbyImg,
    badge: 'Muscle Lendário',
    description: 'A força bruta americana em escala 1:18 com peso substancial de mais de 1,2 kg de puro metal diecast fundido.'
  },
  {
    id: 'min-005',
    name: 'McLaren MP4/4 Ayrton Senna #12',
    brand: 'McLaren Honda',
    manufacturer: 'Minichamps World Champion',
    scale: '1:43',
    year: 1988,
    color: 'Marlboro Racing White/Red',
    price: 790,
    stock: 4,
    is_limited_edition: true,
    edition_number: 'Ed. Campeão 1988',
    material: 'Diecast ZAMAC',
    features: [
      'Mini capacete réplica de Ayrton Senna modelado no cockpit',
      'Asa traseira de alta pressão aerodinâmica com perfil metálico',
      'Case expositor acrílico de cristal com base em madeira nobre',
      'Decais históricos completos'
    ],
    image_url: sennaImg,
    badge: 'Homenagem Senna',
    description: 'O monolugar mais dominante da história da Fórmula 1, vencedor de 15 das 16 corridas na temporada de 1988.'
  },
  {
    id: 'min-006',
    name: 'Mercedes-Benz 300 SL Gullwing',
    brand: 'Mercedes-Benz',
    manufacturer: 'Bburago Signature Precision',
    scale: '1:24',
    year: 1954,
    color: 'Prata Metálico DB180',
    price: 640,
    stock: 5,
    is_limited_edition: false,
    material: 'Diecast Metal',
    features: [
      'Portas asas-de-gaivota com amortecedor de pressão em escala',
      'Mala sob medida de época no porta-malas traseiro',
      'Estepe funcional fixado com cinta de couro sintético',
      'Grade dianteira cromada vazada'
    ],
    image_url: mercedesImg,
    badge: 'Clássico Eterno',
    description: 'O clássico alemão dos anos 50 em escala 1:24 com proporções elegantes para colecionadores de clássicos europeus.'
  },
  {
    id: 'min-007',
    name: 'Lamborghini Countach LP5000 QV',
    brand: 'Lamborghini',
    manufacturer: 'Kyosho Ousia',
    scale: '1:18',
    year: 1985,
    color: 'Giallo Fly (Amarelo)',
    price: 2190,
    stock: 1,
    is_limited_edition: true,
    edition_number: '204/400',
    material: 'Resina Composta',
    features: [
      'Carroceria esculpida em resina com vincos agudos perfeitos',
      'Aerofólio traseiro colossal em delta',
      'Rodas estilo "telefone" perfuradas em dourado acetinado',
      'Entradas de ar NACA funcionais vazadas'
    ],
    image_url: lamboImg,
    badge: 'Pôster dos Anos 80',
    description: 'A agressividade pura de SantAgata Bolognese em sua versão Quattrovalvole com linhas futuristas marcantes.'
  },
  {
    id: 'min-008',
    name: 'BMW M3 E30 Sport Evolution',
    brand: 'BMW',
    manufacturer: 'OttOmobile',
    scale: '1:18',
    year: 1990,
    color: 'Brilliant Red',
    price: 1390,
    stock: 3,
    is_limited_edition: true,
    edition_number: '1240/2000',
    material: 'Resina Composta',
    features: [
      'Lábio frontal ajustável DTM e aerofólio com gurney flap',
      'Bancos Recaro com acabamento tricolor M Motorsport',
      'Cintos de segurança esportivos em vermelho brilhante',
      'Emblemas M3 em metal photo-etched em relevo'
    ],
    image_url: bmwImg,
    badge: 'Touring Icon',
    description: 'A lenda das pistas do DTM. Miniatura em resina com acabamento de pintura impecável sem imperfeições.'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'AM-9021',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    client_name: 'Guilherme Siqueira',
    client_phone: '(11) 98765-4321',
    client_email: 'guilherme.siqueira@gmail.com',
    miniature_id: 'min-001',
    miniature_name: 'Porsche 911 GT3 RS (991.2)',
    miniature_scale: '1:18',
    miniature_price: 1890,
    appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    appointment_time: '14:30',
    modality: 'showroom',
    payment_preference: 'pix_agora',
    notes: 'Desejo examinar a caixa original e o certificado de edição 142/500.',
    status: 'confirmado',
    sync_status: 'local_only'
  },
  {
    id: 'AM-9022',
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    client_name: 'Renata Albuquerque',
    client_phone: '(21) 99123-8877',
    client_email: 'renata.alb@hotmail.com',
    miniature_id: 'min-003',
    miniature_name: 'Ferrari F40 Competizione',
    miniature_scale: '1:18',
    miniature_price: 2790,
    appointment_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    appointment_time: '16:00',
    modality: 'video_vip',
    payment_preference: 'cartao_presencial',
    notes: 'Tour por vídeo para inspecionar os faróis escamoteáveis antes do envio.',
    status: 'pendente',
    sync_status: 'local_only'
  }
];

export const AVAILABLE_TIME_SLOTS = [
  '09:30',
  '11:00',
  '13:30',
  '15:00',
  '16:30',
  '18:00',
  '19:30'
];

export const STORE_DEFAULT_PHONE = '5511999998888';
export const STORE_ADDRESS = 'Av. Brigadeiro Faria Lima, 2400 - Showroom 12, Itaim Bibi, São Paulo - SP';
