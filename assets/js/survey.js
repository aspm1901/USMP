const SURVEY_CONFIG = {
  SUPABASE_URL: 'https://syanolcxbjarcmpxkmqf.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5YW5vbGN4YmphcmNtcHhrbXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MzA2OTYsImV4cCI6MjA5NDQwNjY5Nn0.bV93pPhfVpBGBRpodmttKuHf57ty7kFE0gUkB4jnwsQ'
};

const SURVEY_TABLES = {
  plans: 'plan_estudio',
  populations: 'poblacion_objetivo',
  questions: 'pregunta_encuesta',
  answers: 'respuesta_encuesta'
};

const surveyState = {
  client: null,
  plans: [],
  populations: [],
  questions: []
};

document.addEventListener('DOMContentLoaded', initSurvey);

async function initSurvey() {
  surveyState.client = window.supabase.createClient(SURVEY_CONFIG.SUPABASE_URL, SURVEY_CONFIG.SUPABASE_ANON_KEY);

  try {
    await loadSurveyData();
    renderSurveyForm();
    document.getElementById('surveyForm').addEventListener('submit', submitSurvey);
    showSurveyMessage('Selecciona tu carrera y responde cada pregunta.', false);
  } catch (error) {
    console.error(error);
    showSurveyMessage('No se pudo cargar la encuesta. Revisa permisos SELECT en Supabase.', true);
  }
}

async function loadSurveyData() {
  const [plans, populations, questions] = await Promise.all([
    surveyState.client.from(SURVEY_TABLES.plans).select('*').order('nombre_carrera', { ascending: true }),
    surveyState.client.from(SURVEY_TABLES.populations).select('*').order('id_poblacion', { ascending: true }),
    surveyState.client.from(SURVEY_TABLES.questions).select('*').order('id_pregunta', { ascending: true })
  ]);

  if (plans.error) throw plans.error;
  if (populations.error) throw populations.error;
  if (questions.error) throw questions.error;

  surveyState.plans = plans.data || [];
  surveyState.populations = populations.data || [];
  surveyState.questions = questions.data || [];
}

function renderSurveyForm() {
  document.getElementById('surveyPlan').innerHTML = [
    '<option value="">Seleccionar carrera / plan</option>',
    ...surveyState.plans.map((plan) => `<option value="${escapeHtml(plan.id_plan)}">${escapeHtml(planLabel(plan))}</option>`)
  ].join('');

  document.getElementById('surveyPopulation').innerHTML = [
    '<option value="">Seleccionar tipo de participante</option>',
    ...surveyState.populations.map((item) => `<option value="${escapeHtml(item.id_poblacion)}">${escapeHtml(item.tipo_poblacion)}</option>`)
  ].join('');

  document.getElementById('questionList').innerHTML = surveyState.questions.length
    ? surveyState.questions.map(questionTemplate).join('')
    : '<div class="empty">No hay preguntas configuradas.</div>';
}

function questionTemplate(question, index) {
  return `
    <article class="question-card">
      <div>
        <div class="question-category">${escapeHtml(question.categoria || `Pregunta ${index + 1}`)}</div>
        <h3>${escapeHtml(question.texto_pregunta)}</h3>
      </div>
      <div class="score-options" role="radiogroup" aria-label="Puntaje de 1 a 5">
        ${[1, 2, 3, 4, 5].map((score) => `
          <label>
            <input type="radio" name="score_${question.id_pregunta}" value="${score}" required>
            <span>${score}</span>
          </label>
        `).join('')}
      </div>
      <div class="field">
        <label for="comment_${question.id_pregunta}">Comentario opcional</label>
        <textarea id="comment_${question.id_pregunta}" name="comment_${question.id_pregunta}" placeholder="Puedes comentar una razon, necesidad o sugerencia"></textarea>
      </div>
    </article>
  `;
}

async function submitSurvey(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const submit = document.getElementById('surveySubmit');
  const idPlan = Number(form.get('id_plan'));
  const idPopulation = Number(form.get('id_poblacion'));

  const payload = surveyState.questions.map((question) => ({
    id_pregunta: question.id_pregunta,
    id_plan: idPlan,
    id_poblacion: idPopulation,
    valor_respuesta: Number(form.get(`score_${question.id_pregunta}`)),
    comentario: String(form.get(`comment_${question.id_pregunta}`) || '').trim() || null,
    fecha_respuesta: new Date().toISOString()
  }));

  submit.disabled = true;
  submit.textContent = 'Enviando...';
  showSurveyMessage('Guardando respuestas en Supabase.', false);

  const { error } = await surveyState.client.from(SURVEY_TABLES.answers).insert(payload);

  submit.disabled = false;
  submit.textContent = 'Enviar respuestas';

  if (error) {
    console.error(error);
    showSurveyMessage('No se pudo guardar. Si RLS esta activo, permite INSERT anon en respuesta_encuesta.', true);
    return;
  }

  event.currentTarget.reset();
  showSurveyMessage('Respuestas registradas correctamente. Gracias por participar.', false);
}

function showSurveyMessage(message, isError) {
  const alert = document.getElementById('surveyAlert');
  document.getElementById('surveyMessage').textContent = message;
  alert.classList.add('is-visible');
  alert.classList.toggle('is-error', Boolean(isError));
}

function planLabel(plan) {
  if (!plan) return '-';
  return `${plan.nombre_carrera} ${plan.anio_version} - ${plan.total_creditos_requeridos} cred. - ${plan.estado}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
