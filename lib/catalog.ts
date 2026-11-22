// Catálogo de 200 sistemas (20 áreas × 10). Los datos se guardan en la tabla genérica `records`.
// Para agregar un sistema: añade una línea a CATALOG con  clave | ícono | es | fr | ht | en | pt | campos
import type { Role } from "@/config/site";

export type Lang = "es" | "fr" | "ht" | "en" | "pt";
export type L5 = [string, string, string, string, string];
const LANGS: Lang[] = ["es", "fr", "ht", "en", "pt"];
const pick = (l: L5, lang: string) => l[Math.max(0, LANGS.indexOf(lang as Lang))];

export type SysFieldType = "text" | "textarea" | "number" | "date" | "datetime" | "bool" | "select" | "url" | "email";
type Vocab = { type: SysFieldType; label: L5; options?: string[] };

// ---------- Vocabulario de campos (se reutiliza en todos los sistemas) ----------
const V: Record<string, Vocab> = {
  name: { type: "text", label: ["Nombre", "Nom", "Non", "Name", "Nome"] },
  title: { type: "text", label: ["Título", "Titre", "Tit", "Title", "Título"] },
  date: { type: "date", label: ["Fecha", "Date", "Dat", "Date", "Data"] },
  start: { type: "datetime", label: ["Inicio", "Début", "Kòmansman", "Start", "Início"] },
  end: { type: "datetime", label: ["Término", "Fin", "Fen", "End", "Término"] },
  due: { type: "date", label: ["Fecha límite", "Échéance", "Dat limit", "Due date", "Prazo"] },
  resp: { type: "text", label: ["Responsable", "Responsable", "Responsab", "Person in charge", "Responsável"] },
  person: { type: "text", label: ["Persona", "Personne", "Moun", "Person", "Pessoa"] },
  guardian: { type: "text", label: ["Apoderado", "Tuteur", "Responsab legal", "Guardian", "Responsável legal"] },
  phone: { type: "text", label: ["Teléfono", "Téléphone", "Telefòn", "Phone", "Telefone"] },
  email: { type: "email", label: ["Correo", "Courriel", "Imèl", "Email", "E-mail"] },
  address: { type: "text", label: ["Dirección", "Adresse", "Adrès", "Address", "Endereço"] },
  place: { type: "text", label: ["Lugar", "Lieu", "Kote", "Place", "Local"] },
  country: { type: "text", label: ["País", "Pays", "Peyi", "Country", "País"] },
  org: { type: "text", label: ["Organización", "Organisation", "Òganizasyon", "Organization", "Organização"] },
  supplier: { type: "text", label: ["Proveedor", "Fournisseur", "Founisè", "Supplier", "Fornecedor"] },
  role: { type: "text", label: ["Función", "Fonction", "Wòl", "Role", "Função"] },
  group: { type: "text", label: ["Grupo", "Groupe", "Gwoup", "Group", "Grupo"] },
  category: { type: "text", label: ["Categoría", "Catégorie", "Kategori", "Category", "Categoria"] },
  level: { type: "text", label: ["Nivel", "Niveau", "Nivo", "Level", "Nível"] },
  topic: { type: "text", label: ["Tema", "Thème", "Tèm", "Topic", "Tema"] },
  passage: { type: "text", label: ["Pasaje bíblico", "Passage biblique", "Pasaj biblik", "Bible passage", "Passagem bíblica"] },
  code: { type: "text", label: ["Código", "Code", "Kòd", "Code", "Código"] },
  age: { type: "number", label: ["Edad", "Âge", "Laj", "Age", "Idade"] },
  qty: { type: "number", label: ["Cantidad", "Quantité", "Kantite", "Quantity", "Quantidade"] },
  people: { type: "number", label: ["Participantes", "Participants", "Patisipan", "Participants", "Participantes"] },
  hours: { type: "number", label: ["Horas", "Heures", "Èdtan", "Hours", "Horas"] },
  amount: { type: "number", label: ["Monto", "Montant", "Montan", "Amount", "Valor"] },
  budget: { type: "number", label: ["Presupuesto", "Budget", "Bidjè", "Budget", "Orçamento"] },
  cost: { type: "number", label: ["Costo", "Coût", "Kou", "Cost", "Custo"] },
  currency: { type: "select", options: ["CLP", "USD", "EUR", "HTG", "BRL"], label: ["Moneda", "Devise", "Lajan", "Currency", "Moeda"] },
  status: { type: "select", options: ["pending", "in_progress", "done", "cancelled"], label: ["Estado", "Statut", "Estati", "Status", "Situação"] },
  priority: { type: "select", options: ["low", "medium", "high"], label: ["Prioridad", "Priorité", "Priyorite", "Priority", "Prioridade"] },
  freq: { type: "select", options: ["once", "weekly", "monthly", "yearly"], label: ["Frecuencia", "Fréquence", "Frekans", "Frequency", "Frequência"] },
  approved: { type: "bool", label: ["Aprobado", "Approuvé", "Apwouve", "Approved", "Aprovado"] },
  active: { type: "bool", label: ["Activo", "Actif", "Aktif", "Active", "Ativo"] },
  url: { type: "url", label: ["Enlace", "Lien", "Lyen", "Link", "Link"] },
  doc: { type: "url", label: ["Documento", "Document", "Dokiman", "Document", "Documento"] },
  desc: { type: "textarea", label: ["Descripción", "Description", "Deskripsyon", "Description", "Descrição"] },
  result: { type: "textarea", label: ["Resultado", "Résultat", "Rezilta", "Result", "Resultado"] },
  notes: { type: "textarea", label: ["Notas", "Notes", "Nòt", "Notes", "Notas"] },
};

const OPTIONS: Record<string, L5> = {
  pending: ["Pendiente", "En attente", "Ap tann", "Pending", "Pendente"],
  in_progress: ["En curso", "En cours", "Ap fèt", "In progress", "Em andamento"],
  done: ["Terminado", "Terminé", "Fini", "Done", "Concluído"],
  cancelled: ["Cancelado", "Annulé", "Anile", "Cancelled", "Cancelado"],
  low: ["Baja", "Basse", "Ba", "Low", "Baixa"],
  medium: ["Media", "Moyenne", "Mwayen", "Medium", "Média"],
  high: ["Alta", "Haute", "Wo", "High", "Alta"],
  once: ["Una vez", "Une fois", "Yon fwa", "Once", "Uma vez"],
  weekly: ["Semanal", "Hebdomadaire", "Chak semèn", "Weekly", "Semanal"],
  monthly: ["Mensual", "Mensuel", "Chak mwa", "Monthly", "Mensal"],
  yearly: ["Anual", "Annuel", "Chak ane", "Yearly", "Anual"],
};

// ---------- Áreas (los permisos son los mismos que la tabla area_access en la base) ----------
const ALL: Role[] = ["miembro", "lider", "secretaria", "tesorero", "pastor", "admin"];
const LEAD: Role[] = ["lider", "secretaria", "pastor", "admin"];
const STAFF: Role[] = ["secretaria", "pastor", "admin"];
const FIN: Role[] = ["tesorero", "pastor", "admin"];

export type Area = { key: string; icon: string; label: L5; read: Role[]; write: Role[] };
export const AREAS: Area[] = [
  { key: "admin", icon: "🏛", label: ["Administración", "Administration", "Administrasyon", "Administration", "Administração"], read: STAFF, write: STAFF },
  { key: "secretaria", icon: "🗂", label: ["Secretaría", "Secrétariat", "Sekretarya", "Office", "Secretaria"], read: STAFF, write: STAFF },
  { key: "finanzas", icon: "💰", label: ["Finanzas", "Finances", "Finans", "Finance", "Finanças"], read: FIN, write: FIN },
  { key: "pastoral", icon: "🕊", label: ["Cuidado pastoral", "Soin pastoral", "Swen pastoral", "Pastoral care", "Cuidado pastoral"], read: LEAD, write: LEAD },
  { key: "discipulado", icon: "📖", label: ["Discipulado y enseñanza", "Discipulat et enseignement", "Disipla ak ansèyman", "Discipleship & teaching", "Discipulado e ensino"], read: ALL, write: LEAD },
  { key: "ninos", icon: "🧒", label: ["Ministerio de niños", "Ministère des enfants", "Ministè timoun", "Children's ministry", "Ministério infantil"], read: LEAD, write: LEAD },
  { key: "jovenes", icon: "🔥", label: ["Jóvenes", "Jeunesse", "Jèn", "Youth", "Jovens"], read: LEAD, write: LEAD },
  { key: "mujeres", icon: "🌸", label: ["Mujeres", "Femmes", "Fanm", "Women", "Mulheres"], read: LEAD, write: LEAD },
  { key: "hombres", icon: "🛡", label: ["Varones", "Hommes", "Gason", "Men", "Homens"], read: LEAD, write: LEAD },
  { key: "familia", icon: "👨‍👩‍👧", label: ["Familia y matrimonios", "Famille et couples", "Fanmi ak maryaj", "Family & marriage", "Família e casais"], read: LEAD, write: LEAD },
  { key: "alabanza", icon: "🎸", label: ["Alabanza y artes", "Louange et arts", "Louwanj ak la", "Worship & arts", "Louvor e artes"], read: ALL, write: LEAD },
  { key: "medios", icon: "📡", label: ["Medios y comunicación", "Médias et communication", "Medya ak kominikasyon", "Media & communication", "Mídia e comunicação"], read: ALL, write: LEAD },
  { key: "misiones", icon: "🌍", label: ["Misiones y evangelismo", "Missions et évangélisation", "Misyon ak evanjelizasyon", "Missions & evangelism", "Missões e evangelismo"], read: ALL, write: LEAD },
  { key: "social", icon: "🤲", label: ["Acción social", "Action sociale", "Aksyon sosyal", "Social outreach", "Ação social"], read: ["lider", "secretaria", "tesorero", "pastor", "admin"], write: LEAD },
  { key: "eventos", icon: "🎪", label: ["Eventos y logística", "Événements et logistique", "Aktivite ak lojistik", "Events & logistics", "Eventos e logística"], read: ALL, write: LEAD },
  { key: "infra", icon: "🧰", label: ["Infraestructura", "Infrastructure", "Enfrastrikti", "Facilities", "Infraestrutura"], read: ["secretaria", "tesorero", "pastor", "admin"], write: STAFF },
  { key: "seguridad", icon: "🛡️", label: ["Seguridad", "Sécurité", "Sekirite", "Safety & security", "Segurança"], read: LEAD, write: LEAD },
  { key: "tecnologia", icon: "💻", label: ["Tecnología", "Technologie", "Teknoloji", "Technology", "Tecnologia"], read: STAFF, write: STAFF },
  { key: "voluntarios", icon: "🙋", label: ["Voluntariado y personal", "Bénévolat et personnel", "Volontè ak anplwaye", "Volunteers & staff", "Voluntariado e pessoal"], read: LEAD, write: LEAD },
  { key: "legal", icon: "⚖️", label: ["Legal y documentos", "Juridique et documents", "Legal ak dokiman", "Legal & documents", "Jurídico e documentos"], read: STAFF, write: ["pastor", "admin"] },
  { key: "intercesion", icon: "🛐", label: ["Intercesión y oración", "Intercession et prière", "Entèsesyon ak lapriyè", "Intercession & prayer", "Intercessão e oração"], read: ALL, write: LEAD },
  { key: "ujieres", icon: "🤵", label: ["Ujieres y protocolo", "Accueil et protocole", "Asistan ak pwotokòl", "Ushers & protocol", "Recepção e protocolo"], read: LEAD, write: LEAD },
  { key: "diaconia", icon: "🫱", label: ["Diaconía y ancianos", "Diaconat et anciens", "Dyakonat ak ansyen", "Deacons & elders", "Diaconia e anciãos"], read: ["lider", "secretaria", "tesorero", "pastor", "admin"], write: STAFF },
  { key: "escuela", icon: "📚", label: ["Escuela dominical", "École du dimanche", "Lekòl dimanch", "Sunday school", "Escola dominical"], read: ALL, write: LEAD },
  { key: "adolescentes", icon: "🎧", label: ["Adolescentes", "Adolescents", "Adolesan", "Teens", "Adolescentes"], read: LEAD, write: LEAD },
  { key: "celulas", icon: "🏘", label: ["Células y grupos", "Cellules et groupes", "Selil ak gwoup", "Cells & small groups", "Células e grupos"], read: LEAD, write: LEAD },
  { key: "evangelismo", icon: "📣", label: ["Evangelismo", "Évangélisation", "Evanjelizasyon", "Evangelism", "Evangelismo"], read: ALL, write: LEAD },
  { key: "consolidacion", icon: "🌱", label: ["Consolidación", "Consolidation", "Konsolidasyon", "Follow-up & consolidation", "Consolidação"], read: LEAD, write: LEAD },
  { key: "capellania", icon: "🏥", label: ["Capellanía", "Aumônerie", "Omonri", "Chaplaincy", "Capelania"], read: LEAD, write: LEAD },
  { key: "instituto", icon: "🎓", label: ["Instituto bíblico", "Institut biblique", "Enstiti biblik", "Bible institute", "Instituto bíblico"], read: ALL, write: LEAD },
];

// ---------- Los 300 sistemas ----------
const CATALOG = `
admin.planes|🗂|Plan estratégico|Plan stratégique|Plan estratejik|Strategic plan|Plano estratégico|title,resp,start,end,status,desc
admin.metas|🎯|Metas anuales|Objectifs annuels|Objektif anyèl|Annual goals|Metas anuais|title,resp,due,status,priority,notes
admin.reuniones|🤝|Reuniones de liderazgo|Réunions de direction|Reyinyon lidè|Leadership meetings|Reuniões de liderança|title,start,place,people,result
admin.actas|📜|Actas y acuerdos|Procès-verbaux|Pwosè vèbal|Minutes & resolutions|Atas e acordos|title,date,resp,desc,doc
admin.tareas|✅|Tareas administrativas|Tâches administratives|Travay administratif|Admin tasks|Tarefas administrativas|title,resp,due,priority,status
admin.comites|👔|Comités|Comités|Komite|Committees|Comitês|name,resp,role,active,notes
admin.politicas|📘|Políticas internas|Politiques internes|Règleman entèn|Internal policies|Políticas internas|title,category,date,doc,active
admin.proyectos|🏗|Proyectos|Projets|Pwojè|Projects|Projetos|title,resp,budget,start,end,status
admin.indicadores|📊|Indicadores|Indicateurs|Endikatè|KPIs|Indicadores|name,category,qty,date,notes
admin.agenda|🗓|Agenda pastoral|Agenda pastoral|Ajanda pastè|Pastoral agenda|Agenda pastoral|title,start,place,person,notes
secretaria.correspondencia|✉️|Correspondencia|Correspondance|Korespondans|Correspondence|Correspondência|title,date,person,org,desc
secretaria.certificados|🏅|Certificados|Certificats|Sètifika|Certificates|Certificados|title,person,date,code,doc
secretaria.bautismos|💧|Registro de bautismos|Registre des baptêmes|Rejis batèm|Baptism records|Registro de batismos|person,date,place,resp,code
secretaria.matrimonios|💍|Registro de matrimonios|Registre des mariages|Rejis maryaj|Marriage records|Registro de casamentos|name,date,place,resp,code
secretaria.presentaciones|👶|Presentación de niños|Présentation d'enfants|Prezantasyon timoun|Child dedications|Apresentação de crianças|person,guardian,date,resp,notes
secretaria.defunciones|🕯|Servicios fúnebres|Services funèbres|Sèvis antèman|Funeral services|Cerimônias fúnebres|person,date,place,resp,notes
secretaria.cartas|📨|Cartas de traslado|Lettres de transfert|Lèt transfè|Transfer letters|Cartas de transferência|person,org,date,status,doc
secretaria.archivo|🗄|Archivo documental|Archives|Achiv|Archive|Arquivo|title,category,date,code,doc
secretaria.contactos|📇|Directorio de contactos|Répertoire|Anyè kontak|Contact directory|Agenda de contatos|name,org,phone,email,address
secretaria.solicitudes|📥|Solicitudes|Demandes|Demann|Requests|Solicitações|title,person,date,status,desc
finanzas.presupuesto|📒|Presupuesto anual|Budget annuel|Bidjè anyèl|Annual budget|Orçamento anual|category,amount,currency,date,notes
finanzas.cuentas|🏦|Cuentas y bancos|Comptes et banques|Kont ak bank|Accounts & banks|Contas e bancos|name,org,currency,amount,notes
finanzas.caja|💵|Caja chica|Petite caisse|Ti kès|Petty cash|Caixa pequeno|date,desc,amount,currency,resp
finanzas.proveedores|🧑‍💼|Proveedores|Fournisseurs|Founisè|Suppliers|Fornecedores|name,category,phone,email,notes
finanzas.facturas|🧾|Facturas por pagar|Factures à payer|Fakti pou peye|Bills to pay|Contas a pagar|supplier,amount,currency,due,status
finanzas.compromisos|🤲|Promesas de fe|Promesses de foi|Pwomès lafwa|Faith pledges|Promessas de fé|person,amount,currency,freq,status
finanzas.campanas|📣|Campañas de recaudación|Collectes de fonds|Kanpay lajan|Fundraising campaigns|Campanhas de arrecadação|title,budget,currency,start,end,status
finanzas.activos|🏷|Activos fijos|Immobilisations|Byen fiks|Fixed assets|Ativos fixos|name,category,cost,date,place
finanzas.auditoria|🔍|Auditorías|Audits|Odit|Audits|Auditorias|title,date,resp,result,doc
finanzas.reportes|📈|Informes financieros|Rapports financiers|Rapò finansye|Financial reports|Relatórios financeiros|title,date,amount,currency,doc
pastoral.visitas|🏡|Visitas pastorales|Visites pastorales|Vizit pastoral|Pastoral visits|Visitas pastorais|person,date,address,resp,notes
pastoral.consejeria|💬|Consejería|Accompagnement|Konsèy|Counseling|Aconselhamento|person,date,resp,status,notes
pastoral.hospital|🏥|Visitas a hospitales|Visites à l'hôpital|Vizit lopital|Hospital visits|Visitas hospitalares|person,place,date,resp,notes
pastoral.duelo|🤍|Acompañamiento en duelo|Accompagnement du deuil|Akonpayman nan dèy|Grief support|Apoio no luto|person,date,resp,status,notes
pastoral.nuevos|🌱|Nuevos creyentes|Nouveaux croyants|Nouvo kwayan|New believers|Novos convertidos|person,phone,date,resp,status
pastoral.seguimiento|📞|Llamadas de seguimiento|Appels de suivi|Apèl swivi|Follow-up calls|Ligações de acompanhamento|person,phone,date,resp,result
pastoral.restauracion|🔄|Restauración|Restauration|Restorasyon|Restoration|Restauração|person,resp,start,status,notes
pastoral.oracion24|⏰|Cadena de oración|Chaîne de prière|Chèn lapriyè|Prayer chain|Corrente de oração|person,start,end,topic,notes
pastoral.ayuno|🍞|Jornadas de ayuno|Journées de jeûne|Jou jèn|Fasting days|Dias de jejum|title,start,end,people,notes
pastoral.testimonios|✨|Testimonios|Témoignages|Temwayaj|Testimonies|Testemunhos|person,date,title,desc,approved
discipulado.grupos|👥|Grupos de discipulado|Groupes de disciples|Gwoup disip|Discipleship groups|Grupos de discipulado|name,resp,place,freq,people
discipulado.mentores|🧭|Mentorías|Mentorat|Konseye|Mentoring|Mentoria|person,resp,start,status,notes
discipulado.planes|📚|Planes de lectura|Plans de lecture|Plan lekti|Reading plans|Planos de leitura|title,start,end,passage,desc
discipulado.estudios|📖|Estudios bíblicos|Études bibliques|Etid biblik|Bible studies|Estudos bíblicos|topic,passage,date,resp,place
discipulado.biblioteca|📕|Biblioteca|Bibliothèque|Bibliyotèk|Library|Biblioteca|title,person,category,qty,code
discipulado.prestamos|🔁|Préstamos de libros|Prêts de livres|Prè liv|Book loans|Empréstimos de livros|title,person,date,due,status
discipulado.seminarios|🎤|Seminarios|Séminaires|Seminè|Seminars|Seminários|title,resp,start,place,people
discipulado.retiros|⛺|Retiros espirituales|Retraites spirituelles|Retrèt espirityèl|Spiritual retreats|Retiros espirituais|title,start,end,place,budget
discipulado.memoria|🧠|Versículos para memorizar|Versets à mémoriser|Vèsè pou memorize|Memory verses|Versículos para memorizar|passage,date,group,notes
discipulado.evaluaciones|📝|Evaluaciones|Évaluations|Evalyasyon|Assessments|Avaliações|person,topic,date,level,result
ninos.registro|🧒|Registro de niños|Registre des enfants|Rejis timoun|Children registry|Cadastro de crianças|name,age,guardian,phone,notes
ninos.checkin|🎫|Check-in de niños|Accueil des enfants|Antre timoun|Kids check-in|Check-in infantil|name,guardian,date,code,notes
ninos.clases|🖍|Clases infantiles|Classes d'enfants|Klas timoun|Kids classes|Aulas infantis|title,group,resp,date,people
ninos.maestros|👩‍🏫|Maestros de niños|Moniteurs|Monitè timoun|Kids teachers|Professores infantis|person,group,phone,active,notes
ninos.curriculo|🗒|Currículo infantil|Programme enfants|Kourikoulòm timoun|Kids curriculum|Currículo infantil|title,group,passage,date,doc
ninos.cumpleanos|🎈|Cumpleaños infantiles|Anniversaires enfants|Anivèsè timoun|Kids birthdays|Aniversários infantis|name,date,guardian,group,notes
ninos.campamento|🏕|Campamento infantil|Camp d'enfants|Kan timoun|Kids camp|Acampamento infantil|title,start,end,place,people
ninos.vbs|🌈|Escuela bíblica de vacaciones|École biblique de vacances|Lekòl biblik vakans|Vacation Bible School|Escola bíblica de férias|title,start,end,resp,people
ninos.materiales|✂️|Materiales infantiles|Matériel enfants|Materyèl timoun|Kids supplies|Materiais infantis|name,qty,place,cost,notes
ninos.autorizaciones|🖊|Autorizaciones de padres|Autorisations parentales|Otorizasyon paran|Parental consents|Autorizações dos pais|name,guardian,date,approved,doc
jovenes.registro|🧑|Registro de jóvenes|Registre des jeunes|Rejis jèn|Youth registry|Cadastro de jovens|name,age,phone,email,group
jovenes.reuniones|🔥|Reuniones de jóvenes|Réunions de jeunes|Reyinyon jèn|Youth meetings|Reuniões de jovens|title,start,place,people,notes
jovenes.lideres|⭐|Líderes juveniles|Leaders jeunesse|Lidè jèn|Youth leaders|Líderes de jovens|person,role,phone,active,notes
jovenes.campamentos|🏔|Campamentos juveniles|Camps de jeunes|Kan jèn|Youth camps|Acampamentos de jovens|title,start,end,place,budget
jovenes.deportes|⚽|Deportes|Sports|Espò|Sports|Esportes|title,date,place,resp,people
jovenes.becas|🎓|Becas de estudio|Bourses d'études|Bous etid|Scholarships|Bolsas de estudo|person,org,amount,currency,status
jovenes.vocacional|🧭|Orientación vocacional|Orientation professionnelle|Oryantasyon pwofesyonèl|Career guidance|Orientação vocacional|person,topic,date,resp,notes
jovenes.universitarios|🏫|Universitarios|Universitaires|Inivèsitè|College students|Universitários|name,org,level,phone,notes
jovenes.redes|📲|Redes juveniles|Réseaux jeunesse|Rezo jèn|Youth social media|Redes jovens|title,date,url,resp,status
jovenes.desafios|🏆|Desafíos|Défis|Defi|Challenges|Desafios|title,start,end,people,result
mujeres.grupos|🌸|Grupos de mujeres|Groupes de femmes|Gwoup fanm|Women's groups|Grupos de mulheres|name,resp,place,freq,people
mujeres.reuniones|☕|Reuniones de damas|Réunions des dames|Reyinyon dam|Ladies meetings|Reuniões de senhoras|title,start,place,people,notes
mujeres.conferencias|🎙|Conferencias de mujeres|Conférences de femmes|Konferans fanm|Women's conferences|Conferências de mulheres|title,start,place,budget,people
mujeres.madres|🤱|Apoyo a madres|Soutien aux mères|Sipò pou manman|Mothers support|Apoio às mães|person,phone,date,resp,notes
mujeres.viudas|💐|Cuidado de viudas|Soin des veuves|Swen vèv|Widows care|Cuidado de viúvas|person,phone,address,resp,notes
mujeres.talleres|🧵|Talleres|Ateliers|Atelye|Workshops|Oficinas|title,date,resp,people,cost
mujeres.oracion|🙏|Círculos de oración|Cercles de prière|Sèk lapriyè|Prayer circles|Círculos de oração|name,resp,freq,place,people
mujeres.mentoria|👭|Mentoría femenina|Mentorat féminin|Konseye fanm|Women's mentoring|Mentoria feminina|person,resp,start,status,notes
mujeres.emprende|💼|Emprendimiento|Entrepreneuriat|Antreprenarya|Entrepreneurship|Empreendedorismo|person,title,category,status,notes
mujeres.visitas|🚪|Visitas de damas|Visites des dames|Vizit dam|Ladies visits|Visitas das senhoras|person,date,address,resp,notes
hombres.grupos|🛡|Grupos de varones|Groupes d'hommes|Gwoup gason|Men's groups|Grupos de homens|name,resp,place,freq,people
hombres.desayunos|🍳|Desayunos de varones|Petits-déjeuners d'hommes|Ti dejene gason|Men's breakfasts|Cafés de homens|title,date,place,people,cost
hombres.retiros|🌲|Retiros de varones|Retraites d'hommes|Retrèt gason|Men's retreats|Retiros de homens|title,start,end,place,budget
hombres.padres|👨‍👧|Escuela de padres|École des pères|Lekòl papa|Fathers school|Escola de pais|title,date,resp,people,notes
hombres.mentoria|🤝|Mentoría de varones|Mentorat d'hommes|Konseye gason|Men's mentoring|Mentoria de homens|person,resp,start,status,notes
hombres.servicio|🔧|Brigadas de servicio|Brigades de service|Brigad sèvis|Service crews|Brigadas de serviço|title,date,place,resp,people
hombres.oficios|🛠|Oficios y habilidades|Métiers et compétences|Metye ak konpetans|Trades & skills|Ofícios e habilidades|person,category,phone,level,notes
hombres.deporte|🏀|Deporte de varones|Sport hommes|Espò gason|Men's sports|Esporte masculino|title,date,place,people,resp
hombres.oracion|🌙|Vigilias de oración|Veillées de prière|Vèy lapriyè|Prayer vigils|Vigílias de oração|title,start,end,place,people
hombres.proyectos|📐|Proyectos de varones|Projets d'hommes|Pwojè gason|Men's projects|Projetos de homens|title,resp,budget,due,status
familia.matrimonios|💑|Ministerio de matrimonios|Ministère des couples|Ministè maryaj|Marriage ministry|Ministério de casais|name,resp,date,status,notes
familia.prematrimonial|💌|Consejería prematrimonial|Préparation au mariage|Konsèy anvan maryaj|Premarital counseling|Aconselhamento pré-nupcial|name,resp,start,status,notes
familia.escuela|🏠|Escuela para padres|École des parents|Lekòl paran|Parenting school|Escola de pais|title,date,resp,people,place
familia.encuentros|❤️|Encuentros de parejas|Rencontres de couples|Rankont koup|Couples retreats|Encontros de casais|title,start,place,people,budget
familia.familias|🏘|Registro de familias|Registre des familles|Rejis fanmi|Family registry|Cadastro de famílias|name,address,phone,people,notes
familia.aniversarios|🎉|Aniversarios de boda|Anniversaires de mariage|Anivèsè maryaj|Wedding anniversaries|Aniversários de casamento|name,date,phone,notes
familia.adultos|👴|Adultos mayores|Aînés|Granmoun aje|Seniors|Terceira idade|person,age,phone,address,notes
familia.crisis|🆘|Familias en crisis|Familles en crise|Fanmi an kriz|Families in crisis|Famílias em crise|name,resp,date,priority,notes
familia.adopcion|🫶|Apoyo a la adopción|Soutien à l'adoption|Sipò adopsyon|Adoption support|Apoio à adoção|name,resp,date,status,notes
familia.actividades|🎡|Actividades familiares|Activités familiales|Aktivite fanmi|Family activities|Atividades familiares|title,date,place,people,cost
alabanza.equipos|🎸|Equipos de alabanza|Équipes de louange|Ekip louwanj|Worship teams|Equipes de louvor|name,resp,role,active,notes
alabanza.repertorio|🎼|Repertorio|Répertoire|Repètwa|Song repertoire|Repertório|title,person,category,level,url
alabanza.ensayos|🎹|Ensayos|Répétitions|Repetisyon|Rehearsals|Ensaios|title,start,place,resp,notes
alabanza.listas|📃|Listas de canciones|Listes de chants|Lis chante|Set lists|Listas de músicas|title,date,resp,desc
alabanza.instrumentos|🥁|Instrumentos|Instruments|Enstriman|Instruments|Instrumentos|name,category,qty,place,notes
alabanza.coro|🎶|Coro|Chorale|Koral|Choir|Coral|person,role,phone,active,notes
alabanza.danza|💃|Danza|Danse|Dans|Dance|Dança|name,resp,people,active,notes
alabanza.teatro|🎭|Teatro|Théâtre|Teyat|Drama|Teatro|title,date,resp,people,place
alabanza.escuela|🎻|Escuela de música|École de musique|Lekòl mizik|Music school|Escola de música|person,category,level,resp,notes
alabanza.grabaciones|🎧|Grabaciones|Enregistrements|Anrejistreman|Recordings|Gravações|title,date,resp,url,status
medios.publicaciones|📰|Publicaciones|Publications|Piblikasyon|Posts|Publicações|title,date,url,resp,status
medios.calendario|🗓|Calendario de contenido|Calendrier éditorial|Kalandriye kontni|Content calendar|Calendário de conteúdo|title,date,category,resp,status
medios.fotos|📷|Fotografía|Photographie|Foto|Photography|Fotografia|title,date,resp,url,notes
medios.video|🎬|Producción de video|Production vidéo|Pwodiksyon videyo|Video production|Produção de vídeo|title,due,resp,url,status
medios.sonido|🔊|Equipo de sonido|Équipe son|Ekip son|Sound team|Equipe de som|person,role,date,active,notes
medios.boletin|🗞|Boletín semanal|Bulletin hebdomadaire|Bilten chak semèn|Weekly bulletin|Boletim semanal|title,date,resp,doc,status
medios.radio|📻|Radio y podcast|Radio et podcast|Radyo ak podkas|Radio & podcast|Rádio e podcast|title,date,resp,url,notes
medios.diseno|🎨|Diseño gráfico|Graphisme|Grafis|Graphic design|Design gráfico|title,due,resp,url,status
medios.prensa|🗣|Prensa|Presse|Laprès|Press|Imprensa|title,date,org,person,notes
medios.web|🌐|Sitio web|Site web|Sit wèb|Website|Site|title,url,resp,date,status
misiones.misioneros|🌍|Misioneros|Missionnaires|Misyonè|Missionaries|Missionários|person,country,org,email,notes
misiones.campos|🗺|Campos misioneros|Champs missionnaires|Chan misyon|Mission fields|Campos missionários|name,country,resp,people,notes
misiones.viajes|✈️|Viajes misioneros|Voyages missionnaires|Vwayaj misyonè|Mission trips|Viagens missionárias|title,country,start,end,budget
misiones.ofrendas|💰|Ofrendas misioneras|Offrandes missionnaires|Ofrann misyon|Mission offerings|Ofertas missionárias|title,amount,currency,date,notes
misiones.evangelismo|📢|Evangelismo|Évangélisation|Evanjelizasyon|Evangelism|Evangelismo|title,date,place,people,result
misiones.plantacion|🌱|Plantación de iglesias|Implantation d'églises|Plante legliz|Church planting|Plantação de igrejas|name,country,resp,start,status
misiones.literatura|📚|Literatura evangelística|Littérature|Literati|Gospel literature|Literatura evangelística|title,qty,place,cost,notes
misiones.oracion|🙌|Oración por las naciones|Prière pour les nations|Lapriyè pou nasyon yo|Prayer for nations|Oração pelas nações|country,topic,date,resp,notes
misiones.alianzas|🤝|Alianzas misioneras|Partenariats|Patenarya|Mission partners|Parcerias missionárias|org,country,person,email,active
misiones.informes|📄|Informes de misión|Rapports de mission|Rapò misyon|Mission reports|Relatórios de missão|title,date,person,result,doc
social.despensa|🥫|Banco de alimentos|Banque alimentaire|Bank manje|Food bank|Banco de alimentos|name,qty,date,place,notes
social.beneficiarios|🧺|Beneficiarios|Bénéficiaires|Benefisyè|Beneficiaries|Beneficiários|person,phone,address,status,notes
social.ropero|👕|Ropero solidario|Vestiaire solidaire|Rad solidarite|Clothing bank|Bazar solidário|category,qty,date,place,notes
social.comedor|🍲|Comedor comunitario|Cantine solidaire|Kantin kominotè|Soup kitchen|Refeitório comunitário|date,people,resp,cost,notes
social.migrantes|🧳|Apoyo a migrantes|Soutien aux migrants|Sipò pou migran|Migrant support|Apoio a migrantes|person,country,phone,priority,notes
social.emergencias|🚨|Ayuda de emergencia|Aide d'urgence|Èd ijans|Emergency aid|Ajuda emergencial|person,date,amount,currency,status
social.empleo|💼|Bolsa de empleo|Bourse d'emploi|Travay disponib|Job board|Banco de empregos|title,org,place,email,active
social.carcel|⛓|Ministerio carcelario|Ministère des prisons|Ministè prizon|Prison ministry|Ministério prisional|place,date,resp,people,notes
social.donaciones|🎁|Donaciones en especie|Dons en nature|Don an nati|In-kind donations|Doações|person,category,qty,date,notes
social.jornadas|🙋|Jornadas solidarias|Journées solidaires|Jounen solidarite|Outreach days|Ações solidárias|title,date,place,people,result
eventos.planificacion|📅|Planificación de eventos|Planification d'événements|Planifikasyon aktivite|Event planning|Planejamento de eventos|title,start,place,budget,status
eventos.inscripciones|🎟|Inscripciones a eventos|Inscriptions aux événements|Enskripsyon aktivite|Event registrations|Inscrições em eventos|person,title,email,phone,status
eventos.salas|🚪|Reserva de salas|Réservation de salles|Rezèvasyon sal|Room booking|Reserva de salas|place,start,end,person,approved
eventos.transporte|🚌|Transporte|Transport|Transpò|Transportation|Transporte|title,date,qty,resp,cost
eventos.alojamiento|🛏|Alojamiento|Hébergement|Lojman|Lodging|Hospedagem|person,place,start,end,cost
eventos.alimentacion|🍽|Alimentación|Restauration|Manje|Catering|Alimentação|title,date,people,supplier,cost
eventos.invitados|🎤|Invitados especiales|Invités spéciaux|Envite espesyal|Guest speakers|Convidados especiais|person,org,date,phone,notes
eventos.logistica|📦|Logística|Logistique|Lojistik|Logistics|Logística|title,resp,qty,due,status
eventos.patrocinios|🤝|Patrocinios|Parrainages|Patwonaj|Sponsorships|Patrocínios|org,amount,currency,person,status
eventos.evaluacion|⭐|Evaluación de eventos|Évaluation des événements|Evalyasyon aktivite|Event evaluation|Avaliação de eventos|title,date,people,result,notes
infra.edificios|🏛|Edificios y templos|Bâtiments|Batiman|Buildings|Edifícios|name,address,qty,resp,notes
infra.mantenimiento|🧰|Mantenimiento|Maintenance|Antretyen|Maintenance|Manutenção|title,place,due,priority,status
infra.reparaciones|🔨|Reparaciones|Réparations|Reparasyon|Repairs|Reparos|title,place,cost,supplier,status
infra.limpieza|🧹|Turnos de limpieza|Nettoyage|Netwayaj|Cleaning roster|Escala de limpeza|person,date,place,status,notes
infra.vehiculos|🚐|Vehículos|Véhicules|Machin|Vehicles|Veículos|name,code,resp,date,notes
infra.combustible|⛽|Combustible|Carburant|Gazolin|Fuel log|Combustível|name,date,qty,cost,resp
infra.servicios|💡|Servicios básicos|Services publics|Sèvis piblik|Utilities|Serviços públicos|category,supplier,amount,currency,due
infra.llaves|🔑|Control de llaves|Contrôle des clés|Kontwòl kle|Key control|Controle de chaves|name,person,date,place,status
infra.obras|🚧|Obras y construcción|Travaux|Konstriksyon|Construction works|Obras|title,budget,start,end,status
infra.mobiliario|🪑|Mobiliario|Mobilier|Mèb|Furniture|Mobiliário|name,qty,place,category,notes
seguridad.equipo|👮|Equipo de seguridad|Équipe de sécurité|Ekip sekirite|Security team|Equipe de segurança|person,role,phone,active,notes
seguridad.turnos|🕐|Turnos de seguridad|Tours de garde|Tou gad|Security shifts|Turnos de segurança|person,start,end,place,notes
seguridad.incidentes|⚠️|Incidentes|Incidents|Ensidan|Incidents|Incidentes|title,date,place,priority,desc
seguridad.emergencia|🚒|Plan de emergencia|Plan d'urgence|Plan ijans|Emergency plan|Plano de emergência|title,resp,date,doc,active
seguridad.simulacros|🔔|Simulacros|Exercices d'évacuation|Egzèsis evakyasyon|Drills|Simulados|title,date,people,result,notes
seguridad.extintores|🧯|Extintores|Extincteurs|Ekstenktè|Extinguishers|Extintores|code,place,due,status,notes
seguridad.primeros|⛑|Primeros auxilios|Premiers secours|Premye swen|First aid|Primeiros socorros|person,role,phone,due,notes
seguridad.estacionamiento|🅿️|Estacionamiento|Parking|Pakin|Parking|Estacionamento|person,role,date,place,notes
seguridad.camaras|📹|Cámaras|Caméras|Kamera|Cameras|Câmeras|code,place,status,resp,notes
seguridad.proteccion|📋|Protección de menores|Protection des mineurs|Pwoteksyon timoun|Child safeguarding|Proteção de menores|title,date,resp,doc,active
tecnologia.equipos|💻|Equipos informáticos|Matériel informatique|Ekipman enfòmatik|IT equipment|Equipamentos de TI|name,code,person,place,status
tecnologia.licencias|🔐|Licencias de software|Licences logicielles|Lisans lojisyèl|Software licenses|Licenças de software|name,supplier,cost,due,active
tecnologia.soporte|🛎|Soporte técnico|Support technique|Sipò teknik|Tech support|Suporte técnico|title,person,date,priority,status
tecnologia.redes|📡|Red e internet|Réseau et internet|Rezo ak entènèt|Network & internet|Rede e internet|name,supplier,cost,place,notes
tecnologia.accesos|🗝|Accesos y cuentas|Accès et comptes|Aksè ak kont|Accounts & access|Acessos e contas|name,person,role,active,notes
tecnologia.respaldos|💾|Respaldos|Sauvegardes|Sovgad|Backups|Backups|title,date,resp,status,notes
tecnologia.streaming|📺|Equipos de transmisión|Matériel de diffusion|Ekipman difizyon|Streaming gear|Equipamentos de transmissão|name,qty,place,status,notes
tecnologia.proyectos|🧪|Proyectos digitales|Projets numériques|Pwojè dijital|Digital projects|Projetos digitais|title,resp,due,status,desc
tecnologia.capacitacion|🖥|Capacitación digital|Formation numérique|Fòmasyon dijital|Digital training|Capacitação digital|title,date,people,resp,notes
tecnologia.proveedores|🏢|Proveedores tecnológicos|Fournisseurs TI|Founisè teknoloji|Tech vendors|Fornecedores de TI|name,category,phone,email,notes
voluntarios.registro|🙋‍♀️|Registro de voluntarios|Registre des bénévoles|Rejis volontè|Volunteer registry|Cadastro de voluntários|person,phone,email,role,active
voluntarios.dones|🎁|Dones y talentos|Dons et talents|Don ak talan|Gifts & talents|Dons e talentos|person,category,level,notes
voluntarios.horas|⏱|Horas de servicio|Heures de service|Èdtan sèvis|Service hours|Horas de serviço|person,date,hours,role,notes
voluntarios.capacitacion|🎓|Capacitación de servidores|Formation des serviteurs|Fòmasyon sèvitè|Volunteer training|Treinamento de voluntários|title,date,resp,people,notes
voluntarios.reconocimientos|🏅|Reconocimientos|Reconnaissances|Rekonesans|Recognitions|Reconhecimentos|person,title,date,notes
voluntarios.personal|🧑‍💼|Personal contratado|Personnel salarié|Anplwaye|Staff|Funcionários|person,role,start,phone,active
voluntarios.permisos|🏖|Vacaciones y permisos|Congés|Vakans ak konje|Leave requests|Férias e licenças|person,start,end,approved,notes
voluntarios.evaluacion|📈|Evaluación de desempeño|Évaluation|Evalyasyon pèfòmans|Performance reviews|Avaliação de desempenho|person,date,resp,result,notes
voluntarios.vacantes|📌|Vacantes de servicio|Postes à pourvoir|Pòs ouvè|Open positions|Vagas de serviço|title,role,resp,due,status
voluntarios.entrevistas|🗨|Entrevistas|Entretiens|Entrevi|Interviews|Entrevistas|person,role,date,resp,result
legal.documentos|📑|Documentos legales|Documents juridiques|Dokiman legal|Legal documents|Documentos legais|title,category,date,doc,notes
legal.contratos|✍️|Contratos|Contrats|Kontra|Contracts|Contratos|title,org,start,end,doc
legal.permisos|🪪|Permisos y licencias|Permis et licences|Pèmi ak lisans|Permits & licenses|Alvarás e licenças|title,org,date,due,status
legal.seguros|☂️|Seguros|Assurances|Asirans|Insurance|Seguros|title,org,cost,due,doc
legal.propiedades|🏠|Propiedades|Propriétés|Pwopriyete|Properties|Propriedades|name,address,date,doc,notes
legal.estatutos|⚖️|Estatutos|Statuts|Estati legal|Bylaws|Estatutos|title,date,code,doc,active
legal.directiva|🧑‍⚖️|Directiva legal|Conseil d'administration|Konsèy administrasyon|Board of directors|Diretoria|person,role,start,end,active
legal.asambleas|🗳|Asambleas|Assemblées générales|Asanble|General assemblies|Assembleias|title,date,place,people,doc
legal.cumplimiento|✔️|Cumplimiento|Conformité|Konfòmite|Compliance|Conformidade|title,resp,due,status,notes
legal.privacidad|🔒|Protección de datos|Protection des données|Pwoteksyon done|Data protection|Proteção de dados|title,resp,date,doc,status
intercesion.turnos|⏰|Turnos de intercesión|Tours d'intercession|Tou entèsesyon|Intercession shifts|Turnos de intercessão|person,start,end,topic,notes
intercesion.vigilias|🌙|Vigilias|Veillées|Vèy|Vigils|Vigílias|title,start,end,place,people
intercesion.peticiones|🙏|Peticiones especiales|Demandes spéciales|Demann espesyal|Special requests|Pedidos especiais|person,topic,date,priority,status
intercesion.respuestas|✨|Oraciones contestadas|Prières exaucées|Priyè ki jwenn repons|Answered prayers|Orações respondidas|person,date,topic,result
intercesion.ayunos|🍞|Ayunos congregacionales|Jeûnes de l'assemblée|Jèn legliz|Church fasts|Jejuns da igreja|title,start,end,people,notes
intercesion.guerreros|🛡|Guerreros de oración|Guerriers de prière|Gèrye lapriyè|Prayer warriors|Guerreiros de oração|person,phone,group,active,notes
intercesion.motivos|📋|Motivos de oración semanales|Sujets de prière hebdomadaires|Sijè lapriyè chak semèn|Weekly prayer points|Motivos de oração semanais|title,date,passage,desc
intercesion.cadenas|🔗|Cadenas de oración|Chaînes de prière|Chèn lapriyè|Prayer chains|Correntes de oração|title,resp,start,people,status
intercesion.altar|🕯|Ministerio de altar|Ministère de l'autel|Ministè lotèl|Altar ministry|Ministério de altar|person,date,resp,result,notes
intercesion.naciones|🌍|Intercesión por naciones|Intercession pour les nations|Entèsesyon pou nasyon yo|Prayer for nations|Intercessão pelas nações|country,topic,date,resp,notes
ujieres.equipo|🤵|Equipo de ujieres|Équipe d'accueil|Ekip asistan|Usher team|Equipe de recepção|person,role,phone,active,notes
ujieres.turnos|🕐|Turnos de ujieres|Tours des huissiers|Tou asistan|Usher schedule|Escala de recepção|person,date,place,role,notes
ujieres.bienvenida|👋|Bienvenida a visitas|Accueil des visiteurs|Akèy vizitè|Visitor welcome|Boas-vindas a visitantes|person,date,phone,resp,notes
ujieres.asientos|💺|Control de asientos|Gestion des places|Kontwòl chèz|Seating control|Controle de assentos|date,place,qty,people,notes
ujieres.protocolo|🎖|Protocolo|Protocole|Pwotokòl|Protocol|Protocolo|title,date,resp,desc
ujieres.ofrenda|🧺|Recolección de ofrendas|Collecte des offrandes|Ranmase ofrann|Offering collection|Recolhimento de ofertas|date,resp,amount,currency,notes
ujieres.objetos|🔎|Objetos perdidos|Objets trouvés|Bagay pèdi|Lost & found|Achados e perdidos|title,date,place,status,notes
ujieres.santacena|🍷|Servicio de Santa Cena|Service de la Sainte Cène|Sèvis Sentsèn|Communion service|Serviço da Santa Ceia|date,resp,people,qty,notes
ujieres.capacitacion|📘|Capacitación de ujieres|Formation des huissiers|Fòmasyon asistan|Usher training|Treinamento de recepção|title,date,resp,people,notes
ujieres.incidencias|⚠️|Incidencias en culto|Incidents au culte|Ensidan nan kilt|Service incidents|Ocorrências no culto|title,date,place,priority,desc
diaconia.diaconos|🫱|Diáconos|Diacres|Dyak|Deacons|Diáconos|person,role,phone,start,active
diaconia.ancianos|👴|Consejo de ancianos|Conseil des anciens|Konsèy ansyen|Elders council|Conselho de anciãos|person,role,start,phone,active
diaconia.ayudas|🤲|Ayudas a hermanos|Aide aux frères|Èd pou frè yo|Member assistance|Ajuda a irmãos|person,date,amount,currency,status
diaconia.visitas|🏡|Visitas diaconales|Visites diaconales|Vizit dyak|Deacon visits|Visitas diaconais|person,date,address,resp,notes
diaconia.reuniones|🤝|Reuniones del consejo|Réunions du conseil|Reyinyon konsèy|Council meetings|Reuniões do conselho|title,start,place,people,result
diaconia.acuerdos|📜|Acuerdos del consejo|Décisions du conseil|Desizyon konsèy|Council resolutions|Decisões do conselho|title,date,resp,approved,doc
diaconia.disciplina|⚖️|Restauración y disciplina|Restauration et discipline|Restorasyon ak disiplin|Restoration & discipline|Restauração e disciplina|person,resp,start,status,notes
diaconia.ordenaciones|🙌|Ordenaciones|Ordinations|Ordinasyon|Ordinations|Ordenações|person,role,date,resp,doc
diaconia.necesidades|📦|Necesidades de la congregación|Besoins de l'assemblée|Bezwen legliz la|Congregation needs|Necessidades da congregação|title,person,priority,status,notes
diaconia.cena|🍞|Preparación de la Santa Cena|Préparation de la Sainte Cène|Preparasyon Sentsèn|Communion preparation|Preparação da Santa Ceia|date,resp,qty,cost,notes
escuela.clases|📚|Clases dominicales|Classes du dimanche|Klas dimanch|Sunday classes|Aulas dominicais|title,group,resp,date,people
escuela.maestros|👩‍🏫|Maestros|Moniteurs|Pwofesè|Teachers|Professores|person,group,phone,active,notes
escuela.alumnos|🧑‍🎓|Alumnos|Élèves|Elèv|Students|Alunos|name,age,group,phone,notes
escuela.lecciones|📖|Plan de lecciones|Plan des leçons|Plan leson|Lesson plan|Plano de lições|title,date,passage,group,desc
escuela.asistencia|📋|Asistencia dominical|Présence du dimanche|Prezans dimanch|Sunday attendance|Frequência dominical|date,group,people,resp,notes
escuela.trimestres|🗓|Trimestres|Trimestres|Trimès|Quarters|Trimestres|title,start,end,topic,notes
escuela.materiales|📦|Materiales y libros|Matériel et livres|Materyèl ak liv|Materials & books|Materiais e livros|name,qty,cost,supplier,notes
escuela.concursos|🏆|Concursos bíblicos|Concours bibliques|Konkou biblik|Bible quizzes|Concursos bíblicos|title,date,people,result,notes
escuela.aulas|🚪|Salas y grupos|Salles et groupes|Sal ak gwoup|Rooms & groups|Salas e turmas|name,place,qty,resp,notes
escuela.evaluaciones|📝|Evaluaciones|Évaluations|Evalyasyon|Assessments|Avaliações|person,group,date,level,result
adolescentes.registro|🎧|Registro de adolescentes|Registre des adolescents|Rejis adolesan|Teen registry|Cadastro de adolescentes|name,age,guardian,phone,group
adolescentes.reuniones|🔥|Reuniones de adolescentes|Réunions des ados|Reyinyon adolesan|Teen meetings|Reuniões de adolescentes|title,start,place,people,notes
adolescentes.mentores|🧭|Mentores|Mentors|Konseye|Mentors|Mentores|person,resp,phone,active,notes
adolescentes.campamentos|⛺|Campamentos|Camps|Kan|Camps|Acampamentos|title,start,end,place,budget
adolescentes.permisos|🖊|Permisos de padres|Autorisations parentales|Otorizasyon paran|Parent permissions|Autorizações dos pais|name,guardian,date,approved,doc
adolescentes.actividades|🎯|Actividades|Activités|Aktivite|Activities|Atividades|title,date,place,resp,cost
adolescentes.talentos|🎤|Talentos y artes|Talents et arts|Talan ak la|Talents & arts|Talentos e artes|person,category,level,notes
adolescentes.estudios|📖|Estudios bíblicos juveniles|Études bibliques ados|Etid biblik adolesan|Teen Bible studies|Estudos bíblicos teen|topic,passage,date,resp,place
adolescentes.consejeria|💬|Consejería|Accompagnement|Konsèy|Counseling|Aconselhamento|person,date,resp,status,notes
adolescentes.servicio|🙋|Servicio comunitario|Service communautaire|Sèvis kominotè|Community service|Serviço comunitário|title,date,place,people,result
celulas.grupos|🏘|Grupos de crecimiento|Groupes de croissance|Gwoup kwasans|Growth groups|Grupos de crescimento|name,resp,address,freq,people
celulas.reportes|📊|Reportes semanales|Rapports hebdomadaires|Rapò chak semèn|Weekly reports|Relatórios semanais|group,date,people,amount,notes
celulas.lideres|⭐|Líderes de célula|Leaders de cellule|Lidè selil|Cell leaders|Líderes de célula|person,group,phone,level,active
celulas.anfitriones|🏠|Casas anfitrionas|Maisons d'accueil|Kay ki resevwa|Host homes|Casas anfitriãs|person,address,phone,qty,active
celulas.multiplicacion|🌱|Multiplicaciones|Multiplications|Miltiplikasyon|Multiplications|Multiplicações|group,date,resp,people,notes
celulas.temas|📖|Temas de estudio|Thèmes d'étude|Tèm etid|Study topics|Temas de estudo|title,date,passage,desc
celulas.supervision|🧭|Supervisión de redes|Supervision des réseaux|Sipèvizyon rezo|Network oversight|Supervisão de redes|group,resp,date,result,notes
celulas.visitas|🚪|Visitas a células|Visites des cellules|Vizit selil|Cell visits|Visitas às células|group,person,date,resp,notes
celulas.nuevos|🤝|Invitados nuevos|Nouveaux invités|Nouvo envite|New guests|Novos convidados|person,group,phone,date,status
celulas.metas|🎯|Metas de crecimiento|Objectifs de croissance|Objektif kwasans|Growth goals|Metas de crescimento|group,title,qty,due,status
evangelismo.salidas|📣|Salidas evangelísticas|Sorties d'évangélisation|Sòti evanjelizasyon|Outreach outings|Saídas evangelísticas|title,date,place,people,result
evangelismo.equipos|👥|Equipos de evangelismo|Équipes d'évangélisation|Ekip evanjelizasyon|Evangelism teams|Equipes de evangelismo|name,resp,group,people,active
evangelismo.decisiones|✝️|Decisiones de fe|Décisions de foi|Desizyon lafwa|Faith decisions|Decisões de fé|person,phone,date,place,resp
evangelismo.campanas|🎪|Campañas evangelísticas|Campagnes d'évangélisation|Kanpay evanjelizasyon|Evangelistic campaigns|Campanhas evangelísticas|title,start,end,place,budget
evangelismo.zonas|🗺|Zonas y barrios|Zones et quartiers|Zòn ak katye|Zones & neighborhoods|Zonas e bairros|name,address,resp,people,notes
evangelismo.materiales|📄|Folletos y biblias|Tracts et bibles|Feyè ak bib|Tracts & Bibles|Folhetos e bíblias|name,qty,cost,place,notes
evangelismo.digital|📱|Evangelismo digital|Évangélisation numérique|Evanjelizasyon dijital|Digital evangelism|Evangelismo digital|title,date,url,people,result
evangelismo.capacitacion|🎓|Capacitación evangelística|Formation à l'évangélisation|Fòmasyon evanjelizasyon|Evangelism training|Treinamento evangelístico|title,date,resp,people,notes
evangelismo.testimonios|✨|Testimonios de salvación|Témoignages de salut|Temwayaj sali|Salvation testimonies|Testemunhos de salvação|person,date,title,desc,approved
evangelismo.metas|🎯|Metas de alcance|Objectifs de portée|Objektif|Outreach goals|Metas de alcance|title,qty,due,resp,status
consolidacion.nuevos|🌱|Nuevos convertidos|Nouveaux convertis|Nouvo konvèti|New converts|Novos convertidos|person,phone,date,resp,status
consolidacion.llamadas|📞|Llamadas de consolidación|Appels de suivi|Apèl swivi|Follow-up calls|Ligações de consolidação|person,phone,date,resp,result
consolidacion.visitas|🏡|Visitas de consolidación|Visites de suivi|Vizit swivi|Follow-up visits|Visitas de consolidação|person,address,date,resp,notes
consolidacion.fundamentos|📘|Clases de fundamentos|Cours de fondements|Klas fondasyon|Foundations classes|Aulas de fundamentos|title,group,resp,date,people
consolidacion.encuentros|🔥|Encuentros|Rencontres|Rankont|Encounters|Encontros|title,start,end,place,people
consolidacion.bautismo|💧|Preparación al bautismo|Préparation au baptême|Preparasyon batèm|Baptism preparation|Preparação para o batismo|person,date,resp,status,notes
consolidacion.padrinos|🤝|Padrinos espirituales|Parrains spirituels|Parenn espirityèl|Spiritual sponsors|Padrinhos espirituais|person,resp,start,status,notes
consolidacion.integracion|🧩|Integración a ministerios|Intégration aux ministères|Entegrasyon nan ministè|Ministry integration|Integração aos ministérios|person,group,date,status,notes
consolidacion.oracion|🙏|Oración por nuevos|Prière pour les nouveaux|Lapriyè pou nouvo yo|Prayer for newcomers|Oração pelos novos|person,date,resp,notes
consolidacion.indicadores|📊|Indicadores de retención|Indicateurs de rétention|Endikatè retansyon|Retention metrics|Indicadores de retenção|title,date,qty,result,notes
capellania.hospitales|🏥|Capellanía hospitalaria|Aumônerie hospitalière|Omonri lopital|Hospital chaplaincy|Capelania hospitalar|place,date,resp,people,notes
capellania.carceles|⛓|Capellanía carcelaria|Aumônerie carcérale|Omonri prizon|Prison chaplaincy|Capelania prisional|place,date,resp,people,notes
capellania.escolar|🏫|Capellanía escolar|Aumônerie scolaire|Omonri lekòl|School chaplaincy|Capelania escolar|org,place,date,resp,notes
capellania.empresarial|🏢|Capellanía empresarial|Aumônerie en entreprise|Omonri antrepriz|Workplace chaplaincy|Capelania empresarial|org,person,date,resp,notes
capellania.capellanes|🕊|Capellanes|Aumôniers|Omonye|Chaplains|Capelães|person,role,phone,org,active
capellania.atenciones|💬|Atenciones|Accompagnements|Akonpayman|Care sessions|Atendimentos|person,place,date,resp,notes
capellania.emergencias|🚑|Crisis y emergencias|Crises et urgences|Kriz ak ijans|Crisis response|Crises e emergências|title,date,place,priority,result
capellania.funerales|🕯|Acompañamiento fúnebre|Accompagnement funéraire|Akonpayman antèman|Funeral support|Acompanhamento fúnebre|person,date,place,resp,notes
capellania.convenios|📄|Convenios institucionales|Conventions|Akò|Institutional agreements|Convênios|org,start,end,resp,doc
capellania.informes|📊|Informes de capellanía|Rapports d'aumônerie|Rapò omonri|Chaplaincy reports|Relatórios de capelania|title,date,people,result,doc
instituto.programas|🎓|Programas académicos|Programmes académiques|Pwogram akademik|Academic programs|Programas acadêmicos|title,level,hours,resp,active
instituto.materias|📚|Materias|Matières|Matyè|Subjects|Disciplinas|title,level,hours,resp,notes
instituto.profesores|👨‍🏫|Profesores|Professeurs|Pwofesè|Faculty|Professores|person,role,email,phone,active
instituto.estudiantes|🧑‍🎓|Estudiantes|Étudiants|Etidyan|Students|Estudantes|name,email,phone,level,status
instituto.matriculas|📝|Matrículas|Inscriptions|Enskripsyon|Enrollments|Matrículas|person,title,date,amount,status
instituto.calificaciones|📈|Calificaciones|Notes|Nòt|Grades|Notas|person,title,date,result,notes
instituto.horarios|🗓|Horarios de clases|Horaires des cours|Orè klas|Class schedule|Horários de aulas|title,start,end,place,resp
instituto.graduaciones|🎉|Graduaciones|Remises de diplômes|Gradyasyon|Graduations|Formaturas|title,date,people,place,notes
instituto.biblioteca|📕|Biblioteca teológica|Bibliothèque théologique|Bibliyotèk teyolojik|Theology library|Biblioteca teológica|title,person,category,qty,code
instituto.becas|💳|Becas|Bourses|Bous|Scholarships|Bolsas|person,amount,currency,status,notes
`;

// ---------- Tipos y utilidades ----------
export type SysField = { key: string; type: SysFieldType; options?: string[]; label?: string };
export type SysModule = { key: string; area: string; icon: string; labels: L5; fields: SysField[]; custom?: boolean; hidden?: boolean; siteId?: string | null };

export const SYSTEMS: SysModule[] = CATALOG.trim().split("\n").map((line) => {
  const [key, icon, es, fr, ht, en, pt, fields] = line.split("|");
  return {
    key, icon, area: key.split(".")[0], labels: [es, fr, ht, en, pt],
    fields: fields.split(",").map((f) => ({ key: f, type: V[f].type, options: V[f].options })),
  };
});

export const getSystem = (key: string) => SYSTEMS.find((s) => s.key === key);
export const getArea = (key: string) => AREAS.find((a) => a.key === key);
export const sysTitle = (s: SysModule, lang: string) => pick(s.labels, lang);
export const areaTitle = (a: { label: L5 }, lang: string) => pick(a.label, lang);
export const fieldLabel = (key: string, lang: string) => (V[key] ? pick(V[key].label, lang) : key);
export const optionLabel = (key: string, lang: string) => (OPTIONS[key] ? pick(OPTIONS[key], lang) : key);
export const canReadArea = (area: string, role: Role | null) => !!role && !!getArea(area)?.read.includes(role);
export const canWriteArea = (area: string, role: Role | null) => !!role && !!getArea(area)?.write.includes(role);

// Nombre visible de un campo (los campos propios traen su nombre)
export const fLabel = (f: SysField, lang: string) => f.label || fieldLabel(f.key, lang);
export const VOCAB = Object.entries(V).map(([key, v]) => ({ key, type: v.type, options: v.options }));
export const LANGS5 = LANGS;
