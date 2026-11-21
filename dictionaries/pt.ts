import type { Dict } from "./es";
export const pt: Dict = {
  nav: { home: "Início", panel: "Painel", login: "Entrar", logout: "Sair", users: "Usuários e funções" },
  common: {
    save: "Salvar", delete: "Excluir", add: "Adicionar", yes: "Sim", no: "Não", empty: "Ainda não há registros.",
    noAccess: "Você não tem permissão para ver esta seção.", actions: "Ações", select: "— Selecionar —",
    language: "Idioma", total: "Total", back: "Voltar", newRecord: "Novo registro", edit: "Editar", saved: "Salvo com sucesso.", saveError: "Não foi possível salvar. Verifique os dados ou suas permissões.", all: "Todas", search: "Filtrar",
    records: "registros",
  },
  home: {
    welcome: "Bem-vindos à", subtitle: "Uma família que adora a Deus e serve sua comunidade.",
    schedule: "Horários de culto", upcomingEvents: "Próximos eventos", latestSermons: "Últimas pregações",
    announcements: "Avisos", prayerCta: "Precisa de oração? Entre e envie seu pedido.",
    contact: "Contato", joinUs: "Junte-se à comunidade", watch: "Assistir",
  },
  days: { sunday: "Domingo", monday: "Segunda", tuesday: "Terça", wednesday: "Quarta", thursday: "Quinta", friday: "Sexta", saturday: "Sábado" },
  auth: {
    title: "Área de membros", email: "E-mail", password: "Senha", fullName: "Nome completo",
    signIn: "Entrar", signUp: "Criar conta", noAccount: "Não tem conta?", haveAccount: "Já tem conta?",
    checkEmail: "Conta criada. Verifique seu e-mail se for pedida confirmação e depois entre.", error: "E-mail ou senha incorretos.",
  },
  panel: { title: "Painel da igreja", hello: "Olá", role: "Sua função", summary: "Resumo" },
  roles: { miembro: "Membro", lider: "Líder", secretaria: "Secretaria", tesorero: "Tesouraria", pastor: "Pastor", admin: "Administrador" },
  users: { title: "Usuários e funções", changeRole: "Mudar função", site: "Sede", onlyAdmin: "Só o administrador pode mudar funções." },
  sites: { allSites: "Toda a igreja", filter: "Sede:", directory: "Diretório de congregações", directoryDesc: "Encontre uma sede e veja seus horários de culto.", searchLabel: "Buscar por sede, país ou cidade", searchBtn: "Buscar", seeAll: "Ver todas", noResults: "Nenhuma sede encontrada para esta busca.", noSites: "Ainda não há sedes publicadas.", general: "Geral (todas as sedes)", scheduleTbc: "Horário a confirmar" },
  modules: {
    sites: { title: "Sedes", desc: "Congregações em cada cidade e país", fields: { name: "Nome da sede", country: "País", city: "Cidade", address: "Endereço", schedule: "Horário de culto", pastor_name: "Pastor", phone: "Telefone", published: "Publicada no diretório" } },
    members: { title: "Membros", desc: "Cadastro da congregação", fields: { site_id: "Sede", full_name: "Nome completo", email: "E-mail", phone: "Telefone", birth_date: "Data de nascimento", address: "Endereço", country: "País", baptized: "Batizado", status: "Situação", cell_id: "Célula", ministry_id: "Ministério" } },
    cells: { title: "Células", desc: "Grupos nas casas", fields: { site_id: "Sede", name: "Nome", leader_name: "Líder", meeting_day: "Dia de reunião", address: "Endereço" } },
    ministries: { title: "Ministérios", desc: "Louvor, jovens, crianças e mais", fields: { site_id: "Sede", name: "Nome", leader_name: "Líder", description: "Descrição" } },
    attendance: { title: "Frequência", desc: "Contagem por culto ou célula", fields: { site_id: "Sede", date: "Data", service: "Culto / reunião", cell_id: "Célula", adults: "Adultos", children: "Crianças", visitors: "Visitantes", notes: "Notas" } },
    events: { title: "Eventos", desc: "Calendário de atividades", fields: { site_id: "Sede", title: "Título", starts_at: "Data e hora", location: "Local", description: "Descrição", is_public: "Público" } },
    sermons: { title: "Pregações", desc: "Mensagens em vídeo e áudio", fields: { site_id: "Sede", title: "Título", preacher: "Pregador", date: "Data", bible_passage: "Passagem bíblica", video_url: "Vídeo (YouTube)", audio_url: "Áudio", summary: "Resumo" } },
    donations: { title: "Dízimos e ofertas", desc: "Controle financeiro", fields: { site_id: "Sede", date: "Data", kind: "Tipo", amount: "Valor", currency: "Moeda", method: "Meio", member_id: "Membro", notes: "Notas" } },
    announcements: { title: "Avisos", desc: "Notícias da igreja", fields: { site_id: "Sede", title: "Título", body: "Mensagem", is_public: "Público" } },
    prayer_requests: { title: "Pedidos de oração", desc: "Orem uns pelos outros", fields: { site_id: "Sede", name: "Nome", request: "Pedido", is_public: "Compartilhar com a igreja", status: "Situação" } },
  },
  options: {
    active: "Ativo", visitor: "Visitante", inactive: "Inativo",
    tithe: "Dízimo", offering: "Oferta", missions: "Missões", building: "Construção", other: "Outro",
    cash: "Dinheiro", transfer: "Transferência", card: "Cartão",
    pending: "Pendente", praying: "Orando", answered: "Respondido",
  },
};
