// Traducciones de los módulos del Aula virtual (se combinan con los diccionarios en lib/i18n.ts)
export const extra = {
  es: {
    siteFields: { region_id: "Región" },
    courseFields: { capacity: "Cupo (máx. alumnos)", level: "Nivel", live_url: "Enlace de clase en vivo (Zoom/Meet)" },
    modules: {
      regions: { title: "Regiones", desc: "Agrupa las iglesias por región", fields: { name: "Región", description: "Descripción" } },
      lessons: { title: "Lecciones", desc: "Contenido del aula virtual", fields: { site_id: "Sede", course_id: "Curso", position: "Orden", title: "Título", video_url: "Video (YouTube)", material_url: "Material (enlace)", content: "Contenido" } },
      assignments: { title: "Tareas del aula", desc: "Tareas para los alumnos", fields: { site_id: "Sede", course_id: "Curso", title: "Título", due_at: "Fecha límite", points: "Puntos", instructions: "Instrucciones" } },
      quiz_questions: { title: "Preguntas de examen", desc: "Exámenes con corrección automática", fields: { site_id: "Sede", course_id: "Curso", position: "Orden", question: "Pregunta", option_a: "Opción A", option_b: "Opción B", option_c: "Opción C", option_d: "Opción D", correct: "Respuesta correcta" } },
      submissions: { title: "Entregas", desc: "Tareas entregadas para calificar", fields: { assignment_id: "Tarea", student_name: "Alumno", content: "Respuesta", link: "Enlace", grade: "Nota", feedback: "Comentario" } },
    },
  },
  fr: {
    siteFields: { region_id: "Région" },
    courseFields: { capacity: "Places (max. élèves)", level: "Niveau", live_url: "Lien du cours en direct (Zoom/Meet)" },
    modules: {
      regions: { title: "Régions", desc: "Regroupe les églises par région", fields: { name: "Région", description: "Description" } },
      lessons: { title: "Leçons", desc: "Contenu de la classe virtuelle", fields: { site_id: "Assemblée", course_id: "Cours", position: "Ordre", title: "Titre", video_url: "Vidéo (YouTube)", material_url: "Support (lien)", content: "Contenu" } },
      assignments: { title: "Devoirs", desc: "Devoirs pour les élèves", fields: { site_id: "Assemblée", course_id: "Cours", title: "Titre", due_at: "Échéance", points: "Points", instructions: "Consignes" } },
      quiz_questions: { title: "Questions d'examen", desc: "Examens corrigés automatiquement", fields: { site_id: "Assemblée", course_id: "Cours", position: "Ordre", question: "Question", option_a: "Option A", option_b: "Option B", option_c: "Option C", option_d: "Option D", correct: "Bonne réponse" } },
      submissions: { title: "Devoirs rendus", desc: "Devoirs à noter", fields: { assignment_id: "Devoir", student_name: "Élève", content: "Réponse", link: "Lien", grade: "Note", feedback: "Commentaire" } },
    },
  },
  ht: {
    siteFields: { region_id: "Rejyon" },
    courseFields: { capacity: "Plas (maks. elèv)", level: "Nivo", live_url: "Lyen klas an dirèk (Zoom/Meet)" },
    modules: {
      regions: { title: "Rejyon", desc: "Gwoupe legliz yo pa rejyon", fields: { name: "Rejyon", description: "Deskripsyon" } },
      lessons: { title: "Leson", desc: "Kontni sal klas vityèl la", fields: { site_id: "Legliz lokal", course_id: "Kou", position: "Lòd", title: "Tit", video_url: "Videyo (YouTube)", material_url: "Materyèl (lyen)", content: "Kontni" } },
      assignments: { title: "Devwa", desc: "Devwa pou elèv yo", fields: { site_id: "Legliz lokal", course_id: "Kou", title: "Tit", due_at: "Dat limit", points: "Pwen", instructions: "Enstriksyon" } },
      quiz_questions: { title: "Kesyon egzamen", desc: "Egzamen ki korije otomatikman", fields: { site_id: "Legliz lokal", course_id: "Kou", position: "Lòd", question: "Kesyon", option_a: "Chwa A", option_b: "Chwa B", option_c: "Chwa C", option_d: "Chwa D", correct: "Bon repons" } },
      submissions: { title: "Devwa remèt", desc: "Devwa pou bay nòt", fields: { assignment_id: "Devwa", student_name: "Elèv", content: "Repons", link: "Lyen", grade: "Nòt", feedback: "Kòmantè" } },
    },
  },
  en: {
    siteFields: { region_id: "Region" },
    courseFields: { capacity: "Capacity (max students)", level: "Level", live_url: "Live class link (Zoom/Meet)" },
    modules: {
      regions: { title: "Regions", desc: "Group churches by region", fields: { name: "Region", description: "Description" } },
      lessons: { title: "Lessons", desc: "Virtual classroom content", fields: { site_id: "Branch", course_id: "Course", position: "Order", title: "Title", video_url: "Video (YouTube)", material_url: "Material (link)", content: "Content" } },
      assignments: { title: "Homework", desc: "Assignments for students", fields: { site_id: "Branch", course_id: "Course", title: "Title", due_at: "Due date", points: "Points", instructions: "Instructions" } },
      quiz_questions: { title: "Exam questions", desc: "Auto-graded exams", fields: { site_id: "Branch", course_id: "Course", position: "Order", question: "Question", option_a: "Option A", option_b: "Option B", option_c: "Option C", option_d: "Option D", correct: "Correct answer" } },
      submissions: { title: "Submissions", desc: "Homework to grade", fields: { assignment_id: "Assignment", student_name: "Student", content: "Answer", link: "Link", grade: "Grade", feedback: "Feedback" } },
    },
  },
  pt: {
    siteFields: { region_id: "Região" },
    courseFields: { capacity: "Vagas (máx. alunos)", level: "Nível", live_url: "Link da aula ao vivo (Zoom/Meet)" },
    modules: {
      regions: { title: "Regiões", desc: "Agrupa as igrejas por região", fields: { name: "Região", description: "Descrição" } },
      lessons: { title: "Lições", desc: "Conteúdo da sala virtual", fields: { site_id: "Sede", course_id: "Curso", position: "Ordem", title: "Título", video_url: "Vídeo (YouTube)", material_url: "Material (link)", content: "Conteúdo" } },
      assignments: { title: "Tarefas", desc: "Tarefas para os alunos", fields: { site_id: "Sede", course_id: "Curso", title: "Título", due_at: "Prazo", points: "Pontos", instructions: "Instruções" } },
      quiz_questions: { title: "Perguntas da prova", desc: "Provas com correção automática", fields: { site_id: "Sede", course_id: "Curso", position: "Ordem", question: "Pergunta", option_a: "Opção A", option_b: "Opção B", option_c: "Opção C", option_d: "Opção D", correct: "Resposta correta" } },
      submissions: { title: "Entregas", desc: "Tarefas para corrigir", fields: { assignment_id: "Tarefa", student_name: "Aluno", content: "Resposta", link: "Link", grade: "Nota", feedback: "Comentário" } },
    },
  },
};
