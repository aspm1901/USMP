const SURVEY_CONFIG = {
  SUPABASE_URL: 'https://syanolcxbjarcmpxkmqf.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5YW5vbGN4YmphcmNtcHhrbXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MzA2OTYsImV4cCI6MjA5NDQwNjY5Nn0.bV93pPhfVpBGBRpodmttKuHf57ty7kFE0gUkB4jnwsQ'
};

const SURVEY_TABLES = {
  plans: 'plan_estudio',
  populations: 'poblacion_objetivo',
  questions: 'pregunta_encuesta',
  questionLinks: 'pregunta_carrera_poblacion',
  answers: 'respuesta_encuesta',
  participants: 'encuesta_participante'
};

const surveyState = {
  client: null,
  plans: [],
  populations: [],
  questions: [],
  questionLinks: [],
  activeQuestions: [],
  confirmed: false,
  confirmedPlanId: null,
  confirmedPopulationId: null,
  confirmedEmail: '',
  confirmedParticipantId: null
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
    document.getElementById('surveyConfirm').addEventListener('click', confirmSurveyIdentity);
    document.getElementById('surveyEmail').addEventListener('input', resetSurveySelection);
    document.getElementById('surveyPlan').addEventListener('change', resetSurveySelection);
    document.getElementById('surveyPopulation').addEventListener('change', resetSurveySelection);
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
    '<option value="">Seleccionar carrera</option>',
    ...publicPlans.map((plan) => `<option value="${escapeHtml(plan.id_plan)}">${escapeHtml(planLabel(plan))}</option>`)
  ].join('');

  document.getElementById('surveyPopulation').innerHTML = [
    '<option value="">Seleccionar tipo de participante</option>',
    ...surveyState.populations.map((item) => `<option value="${escapeHtml(item.id_poblacion)}">${escapeHtml(item.tipo_poblacion)}</option>`)
  ].join('');

  surveyState.activeQuestions = [];
  document.getElementById('questionList').innerHTML = '<div class="empty">Selecciona una carrera y un tipo de participante para cargar las preguntas.</div>';
  document.getElementById('surveySubmit').disabled = true;
  document.getElementById('surveyConfirmedSummary').classList.add('is-hidden');
  document.getElementById('surveyConfirm').disabled = false;
}

async function confirmSurveyIdentity() {
  const plan = selectedPlan();
  const idPopulation = Number(document.getElementById('surveyPopulation').value);
  const email = normalizeEmail(document.getElementById('surveyEmail').value);
  const submit = document.getElementById('surveySubmit');
  const confirm = document.getElementById('surveyConfirm');

  if (!isInstitutionalEmail(email)) {
    showSurveyMessage('Utilice un correo institucional válido (@usmp.pe).', true);
    document.getElementById('surveyEmail').focus();
    return;
  }

  if (!plan || !idPopulation) {
    surveyState.activeQuestions = [];
    document.getElementById('questionList').innerHTML = '<div class="empty">Selecciona una carrera y un tipo de participante para cargar las preguntas.</div>';
    submit.disabled = true;
    showSurveyMessage('Seleccione carrera evaluada y tipo de participante antes de continuar.', true);
    return;
  }

  confirm.disabled = true;
  confirm.textContent = 'Validando...';
  showSurveyMessage('Validando si este correo ya respondió la encuesta.', false);

  const duplicated = await alreadyAnswered(email);
  confirm.disabled = false;
  confirm.textContent = 'Confirmar datos y ver encuesta';

  if (duplicated.error) {
    console.error(duplicated.error);
    showSurveyMessage(duplicateValidationMessage(duplicated.error), true);
    return;
  }

  if (duplicated.exists) {
    surveyState.activeQuestions = [];
    document.getElementById('questionList').innerHTML = '<div class="empty">Este correo ya registró una encuesta. No puede volver a responder con otra carrera.</div>';
    submit.disabled = true;
    showSurveyMessage('Este correo ya respondió una encuesta. No puede volver a llenarla con otra carrera o grupo de interés.', true);
    return;
  }

  surveyState.activeQuestions = questionsForSelection(plan, idPopulation);

  document.getElementById('questionList').innerHTML = surveyState.activeQuestions.length
    ? `${questionIntroTemplate()}${scoreLegendTemplate()}${surveyState.activeQuestions.map(questionTemplate).join('')}`
    : '<div class="empty">No hay preguntas configuradas para esta carrera y tipo de participante.</div>';

  submit.disabled = !surveyState.activeQuestions.length;
  if (!surveyState.activeQuestions.length) {
    showSurveyMessage('No hay preguntas configuradas para esta carrera y tipo de participante.', true);
    return;
  }

  surveyState.confirmed = true;
  surveyState.confirmedPlanId = Number(plan.id_plan);
  surveyState.confirmedPopulationId = idPopulation;
  surveyState.confirmedEmail = email;
  surveyState.confirmedParticipantId = null;
  lockSurveyIdentity(true);
  renderConfirmedSummary(plan, selectedPopulation(), email);
  confirm.disabled = true;
  document.querySelector('.survey-confirm-actions').classList.add('is-hidden');
  showSurveyMessage('Datos confirmados. Complete la encuesta para enviar sus respuestas.', false);
}

function resetSurveySelection() {
  if (surveyState.confirmed) return;

  surveyState.activeQuestions = [];
  surveyState.confirmedPlanId = null;
  surveyState.confirmedPopulationId = null;
  surveyState.confirmedEmail = '';
  surveyState.confirmedParticipantId = null;
  document.getElementById('surveyConfirmedSummary').classList.add('is-hidden');
  document.getElementById('questionList').innerHTML = '<div class="empty">Confirma tus datos para cargar las preguntas de la encuesta.</div>';
  document.getElementById('surveySubmit').disabled = true;
  document.getElementById('surveyConfirm').disabled = false;
  document.getElementById('surveyConfirm').textContent = 'Confirmar datos y ver encuesta';
  document.querySelector('.survey-confirm-actions').classList.remove('is-hidden');
}

function questionsForSelection(plan, idPopulation) {
  const allowedQuestionIds = new Set(surveyState.questionLinks
    .filter((link) => Number(link.id_carrera) === Number(plan.id_carrera) && Number(link.id_poblacion) === Number(idPopulation))
    .map((link) => Number(link.id_pregunta)));

  return surveyState.questions
    .filter((question) => allowedQuestionIds.has(Number(question.id_pregunta)));
}

function lockSurveyIdentity(locked) {
  document.getElementById('surveyIdentity').classList.toggle('is-locked', locked);
  document.getElementById('surveyEmail').disabled = locked;
  document.getElementById('surveyPlan').disabled = locked;
  document.getElementById('surveyPopulation').disabled = locked;
}

function renderConfirmedSummary(plan, population, email) {
  const summary = document.getElementById('surveyConfirmedSummary');
  summary.innerHTML = `
    <strong>Datos confirmados</strong>
    <span>${escapeHtml(email)}</span>
    <span>${escapeHtml(plan.nombre_carrera)} · ${escapeHtml(population?.tipo_poblacion || '-')}</span>
  `;
  summary.classList.remove('is-hidden');
}

function questionIntroTemplate() {
  return `
    <section class="question-intro">
      Evalúa cada aspecto de la formación curricular según tu experiencia. Los comentarios son opcionales y solo aparecen si deseas agregar una precisión.
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
  const idPlan = surveyState.confirmedPlanId;
  const idPopulation = surveyState.confirmedPopulationId;
  const email = surveyState.confirmedEmail;

  if (!surveyState.confirmed || !idPlan || !idPopulation) {
    showSurveyMessage('Confirme sus datos antes de responder la encuesta.', true);
    return;
  }

  if (!isInstitutionalEmail(email)) {
    showSurveyMessage('Utilice un correo institucional válido (@usmp.pe).', true);
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
    fecha_respuesta: new Date().toISOString()
  }));

  submit.disabled = true;
  submit.textContent = 'Verificando...';
  showSurveyMessage('Verificando si este correo ya registró la encuesta.', false);

  const duplicated = await alreadyAnswered(email);
  if (duplicated.error) {
    console.error(duplicated.error);
    submit.disabled = false;
    submit.textContent = 'Enviar respuestas';
    showSurveyMessage(duplicateValidationMessage(duplicated.error), true);
    return;
  }

  if (duplicated.exists) {
    submit.disabled = false;
    submit.textContent = 'Enviar respuestas';
    showSurveyMessage('Este correo ya registró una encuesta. No es necesario volver a llenar otra.', true);
    return;
  }

  submit.textContent = 'Enviando...';
  showSurveyMessage('Registrando participante y guardando respuestas en Supabase.', false);

  let insertResult;
  try {
    const participant = await createSurveyParticipant(email, idPlan, idPopulation);
    if (participant.error) {
      throw participant.error;
    }

    surveyState.confirmedParticipantId = participant.id;
    insertResult = await surveyState.client.from(SURVEY_TABLES.answers).insert(payload.map((answer) => ({
      ...answer,
      id_participante: participant.id
    })));
  } catch (error) {
    console.error(error);
    submit.disabled = false;
    submit.textContent = 'Enviar respuestas';
    showSurveyMessage(participantSaveMessage(error), true);
    return;
  }

  const { error } = insertResult;

  submit.disabled = false;
  submit.textContent = 'Enviar respuestas';

  if (error) {
    console.error(error);
    showSurveyMessage('No se pudo guardar. Verifica permisos INSERT en respuesta_encuesta y que exista id_participante.', true);
    return;
  }

  showCompletionScreen(event.currentTarget);
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

async function alreadyAnswered(email) {
  const participantResult = await surveyState.client
    .from(SURVEY_TABLES.participants)
    .select('id_participante')
    .eq('correo_institucional', email)
    .limit(1);

  if (participantResult.error) {
    return { exists: false, error: participantResult.error };
  }

  if (participantResult.data?.length) {
    return { exists: true, error: null };
  }

  return { exists: false, error: null };
}

async function createSurveyParticipant(email, idPlan, idPopulation) {
  const { data, error } = await surveyState.client
    .from(SURVEY_TABLES.participants)
    .insert({
      correo_institucional: email,
      id_plan: idPlan,
      id_poblacion: idPopulation,
      fecha_registro: new Date().toISOString()
    })
    .select('id_participante')
    .single();

  return { id: data?.id_participante || null, error };
}

function duplicateValidationMessage(error) {
  if (error?.code === '42P01' && String(error.message || '').includes('encuesta_participante')) {
    return 'Falta crear o exponer la tabla encuesta_participante en Supabase.';
  }

  if (error?.code === '42703' && String(error.message || '').includes('correo_institucional')) {
    return 'Falta la columna correo_institucional en encuesta_participante.';
  }

  return 'No se pudo validar si ya respondió. Revise permisos SELECT en encuesta_participante.';
}

function participantSaveMessage(error) {
  const message = String(error?.message || '');
  if (error?.code === '23505') {
    return 'Este correo ya registró una encuesta. No puede volver a responder.';
  }

  if (error?.code === '42501' || message.includes('permission denied')) {
    return 'No se pudo registrar participante. Revise permisos INSERT en encuesta_participante.';
  }

  if (message.includes('sequence') || message.includes('id_participante_seq')) {
    return 'Falta permiso sobre la secuencia de encuesta_participante. Otorgue USAGE y SELECT a anon.';
  }

  return 'No se pudo guardar por un problema con Supabase. Intente nuevamente.';
}

function resetSurveyAfterSuccess(form) {
  form?.reset();
  surveyState.activeQuestions = [];
  surveyState.confirmed = false;
  surveyState.confirmedPlanId = null;
  surveyState.confirmedPopulationId = null;
  surveyState.confirmedEmail = '';
  surveyState.confirmedParticipantId = null;
  lockSurveyIdentity(false);
  document.getElementById('surveyConfirmedSummary').classList.add('is-hidden');
  document.getElementById('questionList').innerHTML = '<div class="empty">Selecciona una carrera y un tipo de participante para cargar las preguntas.</div>';
  document.getElementById('surveySubmit').disabled = true;
  document.getElementById('surveyConfirm').disabled = false;
  document.getElementById('surveyConfirm').textContent = 'Confirmar datos y ver encuesta';
  document.querySelector('.survey-confirm-actions')?.classList.remove('is-hidden');
}

function showCompletionScreen(form) {
  const alert = document.getElementById('surveyAlert');
  const hero = document.getElementById('surveyHero');
  const surveyForm = document.getElementById('surveyForm');
  const completion = document.getElementById('surveyCompletion');

  alert?.classList.remove('is-visible', 'is-error');
  hero?.classList.add('is-hidden');
  surveyForm?.classList.add('is-hidden');
  completion?.classList.remove('is-hidden');

  if (hero) hero.style.display = 'none';
  if (surveyForm) surveyForm.style.display = 'none';
  if (completion) completion.style.display = 'grid';

  try {
    resetSurveyAfterSuccess(form);
  } catch (error) {
    console.error(error);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
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

function selectedPopulation() {
  const idPopulation = Number(document.getElementById('surveyPopulation').value);
  return surveyState.populations.find((population) => Number(population.id_poblacion) === idPopulation) || null;
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

function isInstitutionalEmail(value) {
  return /^[^@\s]+@usmp\.pe$/i.test(normalizeEmail(value));
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
