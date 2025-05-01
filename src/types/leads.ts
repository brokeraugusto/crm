
export type LeadStatus = "novo" | "contato" | "visita" | "proposta" | "vendido" | "perdido";

export interface Lead {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  interesse?: string;
  status: LeadStatus;
  observacao?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface LeadImovel {
  id: string;
  lead_id: string;
  imovel_id: string;
  created_at: string;
}

export interface Imovel {
  id: string;
  titulo: string;
  tipo: string;
  endereco: string;
  preco: number;
  quartos: number;
  banheiros: number;
  area: string;
  status: string;
  imagem?: string;
  descricao?: string;
  created_at: string;
  updated_at: string;
}

export interface Atividade {
  id: string;
  titulo: string;
  tipo: string;
  data: string;
  duracao: string;
  endereco?: string;
  descricao?: string;
  lead_id?: string;
  imovel_id?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}
