// Textos del Aula virtual y del centro de 200 sistemas
type T = {
  sys: { title: string; desc: string; search: string; systems: string; records: string; areas: string; noResults: string; readOnly: string };
  aula: {
    title: string; desc: string; my: string; available: string; enroll: string; enrolled: string; leave: string; progress: string;
    lessons: string; assignments: string; exam: string; live: string; joinLive: string; certificate: string; markDone: string;
    completed: string; next: string; prev: string; material: string; submit: string; yourWork: string; content: string; link: string;
    grade: string; feedback: string; waiting: string; due: string; takeExam: string; result: string; noLessons: string; noCourses: string;
    teacher: string; manage: string; certTitle: string; certBody: string; certDone: string; print: string; notEnrolled: string;
    points: string; noQuestions: string; send: string; course: string; locked: string; manageLessons: string; manageAssignments: string;
    manageQuiz: string; manageSubmissions: string;
  };
};

const es: T = {
  sys: { title: "200 sistemas", desc: "Todas las áreas de la iglesia en un solo lugar.", search: "Buscar un sistema…", systems: "sistemas", records: "registros", areas: "áreas", noResults: "No se encontraron sistemas.", readOnly: "Solo lectura" },
  aula: {
    title: "Aula virtual", desc: "Cursos, lecciones, tareas y exámenes en línea.", my: "Mis cursos", available: "Cursos disponibles", enroll: "Inscribirme", enrolled: "Inscrito", leave: "Salir del curso", progress: "Progreso",
    lessons: "Lecciones", assignments: "Tareas", exam: "Examen", live: "Clase en vivo", joinLive: "Entrar a la clase en vivo", certificate: "Certificado", markDone: "Marcar como completada",
    completed: "Completada", next: "Siguiente", prev: "Anterior", material: "Material de apoyo", submit: "Entregar tarea", yourWork: "Tu entrega", content: "Respuesta", link: "Enlace (opcional)",
    grade: "Nota", feedback: "Comentario del maestro", waiting: "Entregada, esperando corrección", due: "Fecha límite", takeExam: "Rendir examen", result: "Resultado", noLessons: "Este curso aún no tiene lecciones.", noCourses: "Aún no hay cursos.",
    teacher: "Maestro", manage: "Administrar", certTitle: "Certificado de finalización", certBody: "Se certifica que", certDone: "ha completado satisfactoriamente el curso", print: "Imprimir / guardar PDF", notEnrolled: "Inscríbete para ver el contenido.",
    points: "puntos", noQuestions: "Este curso no tiene examen.", send: "Enviar", course: "Curso", locked: "Completa todas las lecciones para obtener tu certificado.", manageLessons: "Lecciones", manageAssignments: "Tareas",
    manageQuiz: "Preguntas de examen", manageSubmissions: "Entregas para corregir",
  },
};

const fr: T = {
  sys: { title: "200 systèmes", desc: "Tous les domaines de l'église au même endroit.", search: "Rechercher un système…", systems: "systèmes", records: "enregistrements", areas: "domaines", noResults: "Aucun système trouvé.", readOnly: "Lecture seule" },
  aula: {
    title: "Salle de classe virtuelle", desc: "Cours, leçons, devoirs et examens en ligne.", my: "Mes cours", available: "Cours disponibles", enroll: "M'inscrire", enrolled: "Inscrit", leave: "Quitter le cours", progress: "Progression",
    lessons: "Leçons", assignments: "Devoirs", exam: "Examen", live: "Cours en direct", joinLive: "Rejoindre le cours en direct", certificate: "Certificat", markDone: "Marquer comme terminée",
    completed: "Terminée", next: "Suivante", prev: "Précédente", material: "Support de cours", submit: "Rendre le devoir", yourWork: "Votre devoir", content: "Réponse", link: "Lien (facultatif)",
    grade: "Note", feedback: "Commentaire de l'enseignant", waiting: "Rendu, en attente de correction", due: "Échéance", takeExam: "Passer l'examen", result: "Résultat", noLessons: "Ce cours n'a pas encore de leçons.", noCourses: "Aucun cours pour le moment.",
    teacher: "Enseignant", manage: "Gérer", certTitle: "Certificat de réussite", certBody: "Nous certifions que", certDone: "a terminé avec succès le cours", print: "Imprimer / PDF", notEnrolled: "Inscrivez-vous pour voir le contenu.",
    points: "points", noQuestions: "Ce cours n'a pas d'examen.", send: "Envoyer", course: "Cours", locked: "Terminez toutes les leçons pour obtenir votre certificat.", manageLessons: "Leçons", manageAssignments: "Devoirs",
    manageQuiz: "Questions d'examen", manageSubmissions: "Devoirs à corriger",
  },
};

const ht: T = {
  sys: { title: "200 sistèm", desc: "Tout domèn legliz la nan yon sèl kote.", search: "Chèche yon sistèm…", systems: "sistèm", records: "anrejistreman", areas: "domèn", noResults: "Pa jwenn okenn sistèm.", readOnly: "Lekti sèlman" },
  aula: {
    title: "Sal klas vityèl", desc: "Kou, leson, devwa ak egzamen sou entènèt.", my: "Kou mwen yo", available: "Kou ki disponib", enroll: "Enskri m", enrolled: "Enskri", leave: "Kite kou a", progress: "Pwogrè",
    lessons: "Leson", assignments: "Devwa", exam: "Egzamen", live: "Klas an dirèk", joinLive: "Antre nan klas an dirèk la", certificate: "Sètifika", markDone: "Make kòm fini",
    completed: "Fini", next: "Swivan", prev: "Anvan", material: "Materyèl", submit: "Remèt devwa a", yourWork: "Travay ou", content: "Repons", link: "Lyen (si ou vle)",
    grade: "Nòt", feedback: "Kòmantè pwofesè a", waiting: "Remèt, ap tann koreksyon", due: "Dat limit", takeExam: "Pase egzamen an", result: "Rezilta", noLessons: "Kou sa a poko gen leson.", noCourses: "Poko gen kou.",
    teacher: "Pwofesè", manage: "Jere", certTitle: "Sètifika fen kou", certBody: "Nou sètifye ke", certDone: "fin kou sa a avèk siksè", print: "Enprime / PDF", notEnrolled: "Enskri pou w wè kontni an.",
    points: "pwen", noQuestions: "Kou sa a pa gen egzamen.", send: "Voye", course: "Kou", locked: "Fini tout leson yo pou w jwenn sètifika ou.", manageLessons: "Leson", manageAssignments: "Devwa",
    manageQuiz: "Kesyon egzamen", manageSubmissions: "Devwa pou korije",
  },
};

const en: T = {
  sys: { title: "200 systems", desc: "Every area of the church in one place.", search: "Search a system…", systems: "systems", records: "records", areas: "areas", noResults: "No systems found.", readOnly: "Read only" },
  aula: {
    title: "Virtual classroom", desc: "Online courses, lessons, homework and exams.", my: "My courses", available: "Available courses", enroll: "Enroll", enrolled: "Enrolled", leave: "Leave course", progress: "Progress",
    lessons: "Lessons", assignments: "Homework", exam: "Exam", live: "Live class", joinLive: "Join the live class", certificate: "Certificate", markDone: "Mark as completed",
    completed: "Completed", next: "Next", prev: "Previous", material: "Course material", submit: "Submit homework", yourWork: "Your submission", content: "Answer", link: "Link (optional)",
    grade: "Grade", feedback: "Teacher feedback", waiting: "Submitted, waiting for grading", due: "Due date", takeExam: "Take the exam", result: "Result", noLessons: "This course has no lessons yet.", noCourses: "No courses yet.",
    teacher: "Teacher", manage: "Manage", certTitle: "Certificate of completion", certBody: "This certifies that", certDone: "has successfully completed the course", print: "Print / save PDF", notEnrolled: "Enroll to see the content.",
    points: "points", noQuestions: "This course has no exam.", send: "Send", course: "Course", locked: "Complete all lessons to get your certificate.", manageLessons: "Lessons", manageAssignments: "Homework",
    manageQuiz: "Exam questions", manageSubmissions: "Submissions to grade",
  },
};

const pt: T = {
  sys: { title: "200 sistemas", desc: "Todas as áreas da igreja em um só lugar.", search: "Buscar um sistema…", systems: "sistemas", records: "registros", areas: "áreas", noResults: "Nenhum sistema encontrado.", readOnly: "Somente leitura" },
  aula: {
    title: "Sala de aula virtual", desc: "Cursos, lições, tarefas e provas online.", my: "Meus cursos", available: "Cursos disponíveis", enroll: "Inscrever-me", enrolled: "Inscrito", leave: "Sair do curso", progress: "Progresso",
    lessons: "Lições", assignments: "Tarefas", exam: "Prova", live: "Aula ao vivo", joinLive: "Entrar na aula ao vivo", certificate: "Certificado", markDone: "Marcar como concluída",
    completed: "Concluída", next: "Próxima", prev: "Anterior", material: "Material de apoio", submit: "Entregar tarefa", yourWork: "Sua entrega", content: "Resposta", link: "Link (opcional)",
    grade: "Nota", feedback: "Comentário do professor", waiting: "Entregue, aguardando correção", due: "Prazo", takeExam: "Fazer a prova", result: "Resultado", noLessons: "Este curso ainda não tem lições.", noCourses: "Ainda não há cursos.",
    teacher: "Professor", manage: "Administrar", certTitle: "Certificado de conclusão", certBody: "Certificamos que", certDone: "concluiu com êxito o curso", print: "Imprimir / salvar PDF", notEnrolled: "Inscreva-se para ver o conteúdo.",
    points: "pontos", noQuestions: "Este curso não tem prova.", send: "Enviar", course: "Curso", locked: "Conclua todas as lições para obter seu certificado.", manageLessons: "Lições", manageAssignments: "Tarefas",
    manageQuiz: "Perguntas da prova", manageSubmissions: "Entregas para corrigir",
  },
};

const ALL: Record<string, T> = { es, fr, ht, en, pt };
export const getUi4 = (lang: string): T => ALL[lang] ?? es;
