import { User, Challenge, Transaction, UserPlan, KycStatus, ChallengeType, ModerationItem } from '../types';
import { supabase } from './supabase';

// --- MOCK DATA ---
const MOCK_USER: User = {
  id: 'user-123',
  name: 'Alex Silva',
  email: 'alex.silva@example.com',
  cpf_hash: 'mock_cpf_hash_xyz',
  state: 'SP',
  plan: UserPlan.GOLD,
  xp: 1250,
  saldo: 15000, // R$150.00
  device_id: 'device-abc-789',
  kyc_status: KycStatus.APROVADO,
  createdAt: new Date(),
};

const getFutureDate = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

const MOCK_CHALLENGES: Challenge[] = [
  // Caminhada
  { id: 'c1', title: '5km por 5 Dias', type: ChallengeType.CAMINHADA, description: 'Caminhe 5 quilômetros por dia, 5 vezes em até 7 dias.', rules: { days: 5, distance: 5, window: 7 }, entryValue: 2000, vacancies: 20, participantsCount: 15, startDate: getFutureDate(2), endDate: getFutureDate(9), registrationEnd: getFutureDate(1) },
  { id: 'c2', title: '10km por 10 Dias', type: ChallengeType.CAMINHADA, description: 'Caminhe 10 quilômetros por dia, 10 vezes em até 14 dias.', rules: { days: 10, distance: 10, window: 14 }, entryValue: 4000, vacancies: 15, participantsCount: 8, startDate: getFutureDate(3), endDate: getFutureDate(17), registrationEnd: getFutureDate(2) },
  
  // Ciclismo
  { id: 'c3', title: '10km de Bike por 5 Dias', type: ChallengeType.CICLISMO, description: 'Pedale 10 quilômetros por dia, 5 vezes em até 7 dias.', rules: { days: 5, distance: 10, window: 7 }, entryValue: 2500, vacancies: 20, participantsCount: 18, startDate: getFutureDate(4), endDate: getFutureDate(11), registrationEnd: getFutureDate(3) },
  { id: 'c4', title: '20km de Bike por 10 Dias', type: ChallengeType.CICLISMO, description: 'Pedale 20 quilômetros por dia, 10 vezes em até 14 dias.', rules: { days: 10, distance: 20, window: 14 }, entryValue: 5000, vacancies: 10, participantsCount: 10, startDate: getFutureDate(5), endDate: getFutureDate(19), registrationEnd: getFutureDate(4) },

  // Flexões
  { id: 'c5', title: '10 Flexões em 30s por 5 Dias', type: ChallengeType.FLEXOES, description: 'Faça 10 flexões em 30 segundos, 5 vezes em até 7 dias.', rules: { days: 5, reps: 10, time: 30, window: 7 }, entryValue: 1000, vacancies: 30, participantsCount: 25, startDate: getFutureDate(2), endDate: getFutureDate(9), registrationEnd: getFutureDate(1) },
  { id: 'c6', title: '20 Flexões em 60s por 10 Dias', type: ChallengeType.FLEXOES, description: 'Faça 20 flexões em 60 segundos, 10 vezes em até 14 dias.', rules: { days: 10, reps: 20, time: 60, window: 14 }, entryValue: 1500, vacancies: 25, participantsCount: 26, startDate: getFutureDate(3), endDate: getFutureDate(17), registrationEnd: getFutureDate(2) },
  
  // Abdominais
  { id: 'c7', title: '20 Abdominais em 40s por 5 Dias', type: ChallengeType.ABDOMINAIS, description: 'Faça 20 abdominais em 40 segundos, 5 vezes em até 7 dias.', rules: { days: 5, reps: 20, time: 40, window: 7 }, entryValue: 1000, vacancies: 30, participantsCount: 12, startDate: getFutureDate(4), endDate: getFutureDate(11), registrationEnd: getFutureDate(3) },
  { id: 'c8', title: '40 Abdominais em 1m por 10 Dias', type: ChallengeType.ABDOMINAIS, description: 'Faça 40 abdominais em 1 minuto, 10 vezes em até 14 dias.', rules: { days: 10, reps: 40, time: 60, window: 14 }, entryValue: 1500, vacancies: 25, participantsCount: 20, startDate: getFutureDate(5), endDate: getFutureDate(19), registrationEnd: getFutureDate(4) },
  
  // Academia
  { id: 'c9', title: 'Academia por 5 Dias', type: ChallengeType.ACADEMIA, description: 'Vá para a academia 5 vezes em até 7 dias.', rules: { days: 5, window: 7 }, entryValue: 3000, vacancies: 20, participantsCount: 18, startDate: getFutureDate(6), endDate: getFutureDate(13), registrationEnd: getFutureDate(5) },
  { id: 'c10', title: 'Academia por 10 Dias', type: ChallengeType.ACADEMIA, description: 'Vá para a academia 10 vezes em até 14 dias.', rules: { days: 10, window: 14 }, entryValue: 6000, vacancies: 15, participantsCount: 7, startDate: getFutureDate(7), endDate: getFutureDate(21), registrationEnd: getFutureDate(6) },
];


const MOCK_TRANSACTIONS: Transaction[] = [
    {id: 't1', type: 'deposito', amount: 5000, fee: 0, status: 'concluido', createdAt: new Date(Date.now() - 86400000 * 5)},
    {id: 't2', type: 'entrada_desafio', amount: -2000, fee: 0, status: 'concluido', createdAt: new Date(Date.now() - 86400000 * 4)},
    {id: 't3', type: 'saque', amount: -10000, fee: 1000, status: 'pendente', createdAt: new Date(Date.now() - 86400000 * 1)},
];

const MOCK_MODERATION_ITEMS: ModerationItem[] = [
    { id: 'm1', videoId: 'v1', participationId: 'p1', challengeId: 'c1', userId: 'user-456', userName: 'Maria Costa', videoUrl: 'https://picsum.photos/seed/m1/400/300', challengeTitle: '5km por 5 Dias', checkType: 'checkin', livenessScore: 0.85, gpsTraces: Array.from({length: 10}).map((_, i) => ({lat: -23.55 + i*0.001, lng: -46.63 - i*0.001, timestamp: Date.now() + i*60000, speed: 5 + Math.random()})), metricsSummary: {distance: 5.1, avgSpeed: 5.2}, timestamp: new Date() },
    { id: 'm2', videoId: 'v2', participationId: 'p2', challengeId: 'c2', userId: 'user-789', userName: 'João Pereira', videoUrl: 'https://picsum.photos/seed/m2/400/300', challengeTitle: '30 Flexões Diárias', checkType: 'checkout', livenessScore: 0.55, gpsTraces: [], metricsSummary: {distance: 0, avgSpeed: 0}, timestamp: new Date(Date.now() - 3600000) },
    { id: 'm3', videoId: 'v3', participationId: 'p3', challengeId: 'c1', userId: 'user-012', userName: 'Ana Souza', videoUrl: 'https://picsum.photos/seed/m3/400/300', challengeTitle: '5km por 5 Dias', checkType: 'checkout', livenessScore: 0.95, gpsTraces: Array.from({length: 12}).map((_, i) => ({lat: -22.90 + i*0.001, lng: -43.17 - i*0.001, timestamp: Date.now() + i*60000, speed: 15 + Math.random()*5})), metricsSummary: {distance: 4.8, avgSpeed: 18.3}, timestamp: new Date(Date.now() - 7200000) },
];

const MOCK_PARTICIPANTS = [
  { id: 'user-123', name: 'Alex Silva', xp: 1250, progress: 60 },
  { id: 'user-456', name: 'Maria Costa', xp: 620, progress: 80 },
  { id: 'user-789', name: 'Bruno Ramos', xp: 325, progress: 40 },
  { id: 'user-012', name: 'Juliana Lima', xp: 1850, progress: 60 },
  { id: 'user-345', name: 'Carlos Souza', xp: 810, progress: 20 },
  { id: 'user-678', name: 'Fernanda Dias', xp: 2200, progress: 100 },
].sort((a, b) => b.progress - a.progress);


// --- MOCK API FUNCTIONS ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const xanoFetch = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${XANO_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Xano API error: ${response.statusText}`);
  }

  return response.json();
};

export const api = {
  login: async (email: string, pass: string): Promise<User> => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (authError || !authData.user) {
      throw new Error("Credenciais inválidas");
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (userError || !userData) {
      await delay(500);
      return MOCK_USER;
    }

    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      cpf_hash: userData.cpf_hash,
      state: userData.state,
      city: userData.city,
      phone: userData.phone,
      nickname: userData.nickname,
      avatarUrl: userData.avatar_url,
      birthDate: userData.birth_date,
      plan: userData.plan as UserPlan,
      xp: userData.xp,
      saldo: userData.saldo,
      device_id: userData.device_id,
      kyc_status: userData.kyc_status as KycStatus,
      createdAt: new Date(userData.created_at),
    };
  },

  loginWithGoogle: async (credential: string): Promise<User> => {
    const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: credential,
    });

    if (authError || !authData.user) {
      throw new Error("Falha na autenticação com Google");
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (userError || !userData) {
      await delay(500);
      return MOCK_USER;
    }

    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      cpf_hash: userData.cpf_hash,
      state: userData.state,
      city: userData.city,
      phone: userData.phone,
      nickname: userData.nickname,
      avatarUrl: userData.avatar_url,
      birthDate: userData.birth_date,
      plan: userData.plan as UserPlan,
      xp: userData.xp,
      saldo: userData.saldo,
      device_id: userData.device_id,
      kyc_status: userData.kyc_status as KycStatus,
      createdAt: new Date(userData.created_at),
    };
  },

  checkSession: async (): Promise<User> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      await delay(200);
      return MOCK_USER;
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error || !userData) {
      await delay(200);
      return MOCK_USER;
    }

    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      cpf_hash: userData.cpf_hash,
      state: userData.state,
      city: userData.city,
      phone: userData.phone,
      nickname: userData.nickname,
      avatarUrl: userData.avatar_url,
      birthDate: userData.birth_date,
      plan: userData.plan as UserPlan,
      xp: userData.xp,
      saldo: userData.saldo,
      device_id: userData.device_id,
      kyc_status: userData.kyc_status as KycStatus,
      createdAt: new Date(userData.created_at),
    };
  },

  getChallenges: async (): Promise<Challenge[]> => {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('start_date', { ascending: true });

    if (error || !data || data.length === 0) {
      await delay(500);
      return MOCK_CHALLENGES;
    }

    return data.map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      type: challenge.type as ChallengeType,
      description: challenge.description,
      rules: challenge.rules,
      entryValue: challenge.entry_value,
      vacancies: challenge.vacancies,
      participantsCount: challenge.participants_count,
      startDate: new Date(challenge.start_date),
      endDate: new Date(challenge.end_date),
      registrationEnd: new Date(challenge.registration_end),
    }));
  },

  getChallengeById: async (id: string): Promise<Challenge | undefined> => {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      await delay(300);
      return MOCK_CHALLENGES.find(c => c.id === id);
    }

    return {
      id: data.id,
      title: data.title,
      type: data.type as ChallengeType,
      description: data.description,
      rules: data.rules,
      entryValue: data.entry_value,
      vacancies: data.vacancies,
      participantsCount: data.participants_count,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      registrationEnd: new Date(data.registration_end),
    };
  },

  getChallengeRoomData: async (id: string): Promise<{ challenge: Challenge, participants: typeof MOCK_PARTICIPANTS } | null> => {
    await delay(700);
    const challenge = MOCK_CHALLENGES.find(c => c.id === id);
    if (!challenge) return null;
    return {
      challenge,
      participants: MOCK_PARTICIPANTS
    }
  },

  getUser: async (): Promise<User> => {
      await delay(200);
      return MOCK_USER;
  },

  updateUser: async (updates: Partial<User>): Promise<User> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      await delay(300);
      return { ...MOCK_USER, ...updates };
    }

    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.city) dbUpdates.city = updates.city;
    if (updates.nickname) dbUpdates.nickname = updates.nickname;
    if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.birthDate) dbUpdates.birth_date = updates.birthDate;

    const { data, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', session.user.id)
      .select()
      .single();

    if (error || !data) {
      await delay(300);
      return { ...MOCK_USER, ...updates };
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      cpf_hash: data.cpf_hash,
      state: data.state,
      city: data.city,
      phone: data.phone,
      nickname: data.nickname,
      avatarUrl: data.avatar_url,
      birthDate: data.birth_date,
      plan: data.plan as UserPlan,
      xp: data.xp,
      saldo: data.saldo,
      device_id: data.device_id,
      kyc_status: data.kyc_status as KycStatus,
      createdAt: new Date(data.created_at),
    };
  },
  
  getWalletTransactions: async (): Promise<Transaction[]> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      await delay(600);
      return MOCK_TRANSACTIONS;
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      await delay(600);
      return MOCK_TRANSACTIONS;
    }

    return data.map(t => ({
      id: t.id,
      type: t.type as 'deposito' | 'saque' | 'entrada_desafio',
      amount: t.amount,
      fee: t.fee,
      status: t.status as 'pendente' | 'concluido' | 'falhou',
      createdAt: new Date(t.created_at),
    }));
  },
  
  generateKeyword: async (participationId: string, checkType: 'checkin' | 'checkout'): Promise<string> => {
    await delay(400);
    const keywords = [
      'DISCIPLINA',
      'FOCO',
      'CONSTÂNCIA',
      'HÁBITO',
      'PERSEVERANÇA',
      'FORÇA',
      'COMPROMISSO',
      'VITÓRIA',
      'EVOLUÇÃO',
      'SUPERAÇÃO'
    ];
    const randomIndex = Math.floor(Math.random() * keywords.length);
    return keywords[randomIndex];
  },

  uploadVideo: async (participationId: string, checkType: 'checkin' | 'checkout', videoBlob: Blob): Promise<{ livenessScore: number, hash: string }> => {
    await delay(1500);
    console.log(`Uploading ${checkType} video for participation ${participationId}, size: ${videoBlob.size} bytes`);
    return {
        livenessScore: Math.random() * (0.98 - 0.4) + 0.4,
        hash: `mock_hash_${Date.now()}`
    };
  },
  
  startTracking: async (participationId: string): Promise<boolean> => {
    await delay(200);
    console.log(`Started tracking for participation ${participationId}`);
    return true;
  },
  
  stopTracking: async (participationId: string, gpsTraces: any[]): Promise<boolean> => {
    await delay(200);
    console.log(`Stopped tracking for participation ${participationId} with ${gpsTraces.length} points.`);
    return true;
  },

  getModerationQueue: async (): Promise<ModerationItem[]> => {
    const { data, error } = await supabase
      .from('moderation_items')
      .select('*')
      .order('liveness_score', { ascending: true });

    if (error || !data || data.length === 0) {
      await delay(800);
      return MOCK_MODERATION_ITEMS.sort((a,b) => a.livenessScore - b.livenessScore);
    }

    return data.map(item => ({
      id: item.id,
      videoId: item.video_id,
      participationId: item.participation_id,
      challengeId: item.challenge_id,
      userId: item.user_id,
      userName: item.user_name,
      videoUrl: item.video_url,
      challengeTitle: item.challenge_title,
      checkType: item.check_type as 'checkin' | 'checkout',
      livenessScore: parseFloat(item.liveness_score),
      gpsTraces: item.gps_traces || [],
      metricsSummary: item.metrics_summary,
      timestamp: new Date(item.timestamp),
    }));
  },

  moderateVideo: async (moderationId: string, decision: 'aprovar' | 'reprovar'): Promise<boolean> => {
    const { error } = await supabase
      .from('moderation_items')
      .delete()
      .eq('id', moderationId);

    if (error) {
      await delay(500);
      console.log(`Moderating item ${moderationId} with decision: ${decision}`);
      MOCK_MODERATION_ITEMS.splice(MOCK_MODERATION_ITEMS.findIndex(item => item.id === moderationId), 1);
      return true;
    }

    return true;
  }
};