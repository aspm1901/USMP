const SURVEY_CONFIG = {
  SUPABASE_URL: 'https://syanolcxbjarcmpxkmqf.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5YW5vbGN4YmphcmNtcHhrbXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MzA2OTYsImV4cCI6MjA5NDQwNjY5Nn0.bV93pPhfVpBGBRpodmttKuHf57ty7kFE0gUkB4jnwsQ'
};

const SURVEY_TABLES = {
  plans: 'plan_estudio',
  populations: 'poblacion_objetivo',
  questions: 'pregunta_encuesta',
  questionLinks: 'pregunta_carrera_poblacion',
  answers: 'respuesta_encuesta'
};

const surveyState = {
  client: null,
  plans: [],
  populations: [],
  questions: [],
  questionLinks: [],
  activeQuestions: []
};

document.addEventListener('DOMContentLoaded', initSurvey);

async function initSurvey() {
  surveyState.client = window.supabase.createClient(SURVEY_CONFIG.SUPABASE_URL, SURVEY_CONFIG.SUPABASE_ANON_KEY);
  showLoadingState();

  try {
    await loadSurveyData();
    renderSurveyForm();
    const form = document.getElementById('surveyForm');
    form.noValidate = true;
    form.addEventListener('submit', submitSurvey);
    document.getElementById('surveyPlan').addEventListener('change', renderFilteredQuestions);
    document.getElementById('surveyPopulation').addEventListener('change', renderFilteredQuestions);
    document.getElementById('questionList').addEventListener('click', handleQuestionListClick);
    showSurveyMessage('Selecciona tu carrera y tipo de participante para ver las preguntas.', false);
  } catch (error) {
    console.error(error);
    showSurveyMessage('No se pudo cargar la encuesta. Revisa permisos SELECT en Supabase.', true);
  }
}

function showLoadingState() {
  const submit = document.getElementById('surveySubmit');
  document.getElementById('questionList').innerHTML = '<div class="empty">Cargando preguntas de la encuesta...</div>';
  submit.disabled = true;
  showSurveyMessage('Cargando carreras, participantes y preguntas.', false);
}

async function loadSurveyData() {
  const [plans, populations, questions, questionLinks] = await Promise.all([
    surveyState.client.from(SURVEY_TABLES.plans).select('*').order('nombre_carrera', { ascending: true }),
    surveyState.client.from(SURVEY_TABLES.populations).select('*').order('id_poblacion', { ascending: true }),
    surveyState.client.from(SURVEY_TABLES.questions).select('*').order('id_pregunta', { ascending: true }),
    surveyState.client.from(SURVEY_TABLES.questionLinks).select('*')
  ]);

  if (plans.error) throw plans.error;
  if (populations.error) throw populations.error;
  if (questions.error) throw questions.error;
  if (questionLinks.error) throw questionLinks.error;

  surveyState.plans = plans.data || [];
  surveyState.populations = populations.data || [];
  surveyState.questions = questions.data || [];
  surveyState.questionLinks = questionLinks.data || [];
}

function renderSurveyForm() {
  const publicPlans = publicCareerOptions(surveyState.plans);
  document.getElementById('surveyPlan').innerHTML = [
    '<option value="">Seleccionar carrera / plan</option>',
    ...publicPlans.map((plan) => `<option value="${escapeHtml(plan.id_plan)}">${escapeHtml(planLabel(plan))}</option>`)
  ].join('');

  document.getElementById('surveyPopulation').innerHTML = [
    '<option value="">Seleccionar tipo de participante</option>',
    ...surveyState.populations.map((item) => `<option value="${escapeHtml(item.id_poblacion)}">${escapeHtml(item.tipo_poblacion)}</option>`)
  ].join('');

  surveyState.activeQuestions = [];
  document.getElementById('questionList').innerHTML = '<div class="empty">Selecciona una carrera y un tipo de participante para cargar las preguntas.</div>';
  document.getElementById('surveySubmit').disabled = true;
}

function renderFilteredQuestions() {
  const plan = selectedPlan();
  const idPopulation = Number(document.getElementById('surveyPopulation').value);
  const submit = document.getElementById('surveySubmit');

  if (!plan || !idPopulation) {
    surveyState.activeQuestions = [];
    document.getElementById('questionList').innerHTML = '<div class="empty">Selecciona una carrera y un tipo de participante para cargar las preguntas.</div>';
    submit.disabled = true;
    return;
  }

  const allowedQuestionIds = new Set(surveyState.questionLinks
    .filter((link) => Number(link.id_carrera) === Number(plan.id_carrera) && Number(link.id_poblacion) === idPopulation)
    .map((link) => Number(link.id_pregunta)));

  surveyState.activeQuestions = surveyState.questions
    .filter((question) => allowedQuestionIds.has(Number(question.id_pregunta)));

  document.getElementById('questionList').innerHTML = surveyState.activeQuestions.length
    ? `${questionIntroTemplate()}${scoreLegendTemplate()}${surveyState.activeQuestions.map(questionTemplate).join('')}`
    : '<div class="empty">No hay preguntas configuradas para esta carrera y tipo de participante.</div>';

  submit.disabled = !surveyState.activeQuestions.length;
}

function questionIntroTemplate() {
  return `
    <section class="question-intro">
      Evalúa cada aspecto del 1 al 5 según tu experiencia. Los comentarios son opcionales y solo aparecen si deseas agregar una precisión.
    </section>
  `;
}

function questionTemplate(question, index) {
  const scoreLabels = {
    1: 'Totalmente en desacuerdo',
    2: 'En desacuerdo',
    3: 'Neutral',
    4: 'De acuerdo',
    5: 'Totalmente de acuerdo'
  };

  return `
    <article class="question-card">
      <div>
        <div class="question-category">${escapeHtml(question.categoria || `Pregunta ${index + 1}`)}</div>
        <h3>${escapeHtml(question.texto_pregunta)}</h3>
      </div>
      <div class="score-options" role="radiogroup" aria-label="Puntaje de 1 a 5">
        ${[1, 2, 3, 4, 5].map((score) => `
          <label title="${escapeHtml(scoreLabels[score])}">
            <input type="radio" name="score_${question.id_pregunta}" value="${score}" required>
            <span>${score}</span>
          </label>
        `).join('')}
      </div>
      <div class="field">
        <button class="mini-button comment-toggle" type="button" data-comment-toggle="${question.id_pregunta}">Agregar comentario</button>
        <div id="commentWrap_${question.id_pregunta}" class="question-comment is-hidden">
          <label for="comment_${question.id_pregunta}">Comentario opcional</label>
          <textarea id="comment_${question.id_pregunta}" name="comment_${question.id_pregunta}" placeholder="Puedes comentar una razón, necesidad o sugerencia"></textarea>
        </div>
      </div>
    </article>
  `;
}

function handleQuestionListClick(event) {
  const button = event.target.closest('[data-comment-toggle]');
  if (!button) return;

  const container = document.getElementById(`commentWrap_${button.dataset.commentToggle}`);
  if (!container) return;

  const isHidden = container.classList.toggle('is-hidden');
  button.textContent = isHidden ? 'Agregar comentario' : 'Ocultar comentario';
}

function scoreLegendTemplate() {
  return `
    <section class="score-legend" aria-label="Significado de la escala de evaluación">
      <span><strong>1</strong> Totalmente en desacuerdo</span>
      <span><strong>2</strong> En desacuerdo</span>
      <span><strong>3</strong> Neutral</span>
      <span><strong>4</strong> De acuerdo</span>
      <span><strong>5</strong> Totalmente de acuerdo</span>
    </section>
  `;
}

async function submitSurvey(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const submit = document.getElementById('surveySubmit');
  const idPlan = Number(form.get('id_plan'));
  const idPopulation = Number(form.get('id_poblacion'));
  const email = normalizeEmail(form.get('correo_institucional'));

  if (!email.endsWith('@usmp.pe')) {
    showSurveyMessage('Usa un correo institucional válido con dominio @usmp.pe.', true);
    return;
  }

  if (!surveyState.activeQuestions.length) {
    showSurveyMessage('Selecciona una carrera y tipo de participante con preguntas configuradas.', true);
    return;
  }

  const missingQuestion = firstMissingQuestion();
  if (missingQuestion) {
    showSurveyMessage('Falta marcar una respuesta. Revisa la pregunta resaltada antes de enviar.', true);
    missingQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const payload = surveyState.activeQuestions.map((question) => ({
    id_pregunta: question.id_pregunta,
    id_plan: idPlan,
    id_poblacion: idPopulation,
    valor_respuesta: Number(form.get(`score_${question.id_pregunta}`)),
    comentario: String(form.get(`comment_${question.id_pregunta}`) || '').trim() || null,
    correo_institucional: email,
    fecha_respuesta: new Date().toISOString()
  }));

  submit.disabled = true;
  submit.textContent = 'Verificando...';
  showSurveyMessage('Verificando si este correo ya registró la encuesta.', false);

  const duplicated = await alreadyAnswered(email, idPlan, idPopulation);
  if (duplicated.error) {
    console.error(duplicated.error);
    submit.disabled = false;
    submit.textContent = 'Enviar respuestas';
    showSurveyMessage('No se pudo validar duplicados. Revisa permisos SELECT en respuesta_encuesta.', true);
    return;
  }

  if (duplicated.exists) {
    submit.disabled = false;
    submit.textContent = 'Enviar respuestas';
    showSurveyMessage('Este correo ya registró respuestas para esta carrera y tipo de participante. No es necesario volver a llenar la encuesta.', true);
    return;
  }

  submit.textContent = 'Enviando...';
  showSurveyMessage('Guardando respuestas en Supabase.', false);

  const { error } = await surveyState.client.from(SURVEY_TABLES.answers).insert(payload);

  submit.disabled = false;
  submit.textContent = 'Enviar respuestas';

  if (error) {
    console.error(error);
    showSurveyMessage('No se pudo guardar. Verifica que respuesta_encuesta tenga la columna correo_institucional y permiso INSERT anon.', true);
    return;
  }

  event.currentTarget.reset();
  surveyState.activeQuestions = [];
  document.getElementById('questionList').innerHTML = '<div class="empty">Selecciona una carrera y un tipo de participante para cargar las preguntas.</div>';
  document.getElementById('surveySubmit').disabled = true;
  showSurveyMessage('Tus respuestas fueron registradas correctamente. Gracias por participar en la mejora curricular.', false);
}

function firstMissingQuestion() {
  document.querySelectorAll('.question-card.is-missing').forEach((card) => card.classList.remove('is-missing'));

  for (const question of surveyState.activeQuestions) {
    const selected = document.querySelector(`input[name="score_${question.id_pregunta}"]:checked`);
    if (!selected) {
      const card = document.querySelector(`input[name="score_${question.id_pregunta}"]`)?.closest('.question-card');
      card?.classList.add('is-missing');
      return card;
    }
  }

  return null;
}

async function alreadyAnswered(email, idPlan, idPopulation) {
  const { data, error } = await surveyState.client
    .from(SURVEY_TABLES.answers)
    .select('id_respuesta')
    .eq('correo_institucional', email)
    .eq('id_plan', idPlan)
    .eq('id_poblacion', idPopulation)
    .limit(1);

  return { exists: Boolean(data?.length), error };
}

function showSurveyMessage(message, isError) {
  const alert = document.getElementById('surveyAlert');
  document.getElementById('surveyMessage').textContent = message;
  alert.classList.add('is-visible');
  alert.classList.toggle('is-error', Boolean(isError));
}

function planLabel(plan) {
  if (!plan) return '-';
  return plan.nombre_carrera;
}

function selectedPlan() {
  const idPlan = Number(document.getElementById('surveyPlan').value);
  return surveyState.plans.find((plan) => Number(plan.id_plan) === idPlan) || null;
}

function publicCareerOptions(plans) {
  const priority = {
    vigente: 5,
    propuesta: 4,
    'en revision': 3,
    historico: 1
  };

  const bestByCareer = new Map();
  plans.forEach((plan) => {
    const career = normalizeText(plan.nombre_carrera);
    const current = bestByCareer.get(career);
    if (!current || planRank(plan, priority) > planRank(current, priority)) {
      bestByCareer.set(career, plan);
    }
  });

  return [...bestByCareer.values()].sort((a, b) => a.nombre_carrera.localeCompare(b.nombre_carrera, 'es'));
}

function planRank(plan, priority) {
  return (priority[normalizeText(plan.estado)] || 0) * 10000 + Number(plan.anio_version || 0);
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
