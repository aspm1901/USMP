// [EXPO_LLAVES_SUPABASE] Aquí están las credenciales y la ANON KEY de Supabase.
const CONFIG = {
      SUPABASE_URL: 'https://syanolcxbjarcmpxkmqf.supabase.co',
      SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5YW5vbGN4YmphcmNtcHhrbXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MzA2OTYsImV4cCI6MjA5NDQwNjY5Nn0.bV93pPhfVpBGBRpodmttKuHf57ty7kFE0gUkB4jnwsQ'
    };

    const TABLES = {
      careers: 'carrera',
      processes: 'proceso_curricular',
      plans: 'plan_estudio',
      periods: 'periodo_academico',
      history: 'historial_fase',
      steps: 'catalogo_paso',
      actors: 'actor_institucional',
      areas: 'area_academica',
      cycles: 'ciclo_academico',
      courses: 'curso',
      evidence: 'evidencia_documental',
      populations: 'poblacion_objetivo',
      questions: 'pregunta_encuesta',
      questionLinks: 'pregunta_carrera_poblacion',
      answers: 'respuesta_encuesta',
      participants: 'encuesta_participante',
      prerequisites: 'prerrequisito'
    };

    const FEEDBACK_COLLECTION_STEP = 5;

    const state = {
      client: null,
      data: null,
      processes: [],
      filtered: [],
      selectedId: null,
      activeModule: 'dashboard',
      activeInsight: 'attention',
      activeDetailTab: 'timeline',
      selectedTimelineStep: {},
      dashboardFilters: {
        career: '',
        population: '',
        plan: ''
      },
      feedbackFilters: {
        process: '',
        career: '',
        population: '',
        plan: ''
      },
      activeSupport: 'plans',
      supportFilters: {},
      supportSelectFilters: {},
      supportPages: {},
      supportPageSize: 10,
      user: null,
      isAdmin: false,
      mallaProcessId: null,
      mallaPlanId: null,
      mallaEditable: false,
      mallaSelectedCourseId: null
    };

    const EDIT_CONFIG = {
      processes: {
        table: TABLES.processes,
        label: 'expediente',
        pk: 'id_proceso',
        fields: [
          { name: 'id_plan_evaluado', label: 'Plan evaluado', type: 'select', source: 'plans', value: 'id_plan', text: planLabel },
          { name: 'id_plan_nuevo', label: 'Plan nuevo', type: 'select', source: 'plans', value: 'id_plan', text: planLabel },
          { name: 'id_periodo', label: 'Periodo', type: 'select', source: 'periods', value: 'id_periodo', text: (item) => item.nombre_periodo },
          { name: 'fecha_inicio', label: 'Fecha inicio', type: 'date' },

          { name: 'motivo_revision', label: 'Motivo de revisión', type: 'textarea' }
        ]
      },
      history: {
        table: TABLES.history,
        label: 'fase',
        pk: 'id_historial',
        fields: [
          { name: 'id_proceso', label: 'Expediente', type: 'select', source: 'processes', value: 'id_proceso', text: processOptionLabel },
          { name: 'id_paso', label: 'Paso PC01', type: 'select', source: 'steps', value: 'id_paso', text: (item) => `${item.numero_paso}. ${item.descripcion_paso}` },
          { name: 'id_actor', label: 'Actor', type: 'select', source: 'actors', value: 'id_actor', text: (item) => `${item.siglas} - ${item.nombre_dependencia}` },
          { name: 'fecha_ejecucion', label: 'Fecha ejecución', type: 'date' },
          { name: 'estado_fase', label: 'Estado fase', type: 'select-static', options: ['Aprobado', 'Observado', 'En Curso', 'Finalizado'] },
          { name: 'observaciones_revision', label: 'Observaciones', type: 'textarea' }
        ]
      },
      evidence: {
        table: TABLES.evidence,
        label: 'evidencia',
        pk: 'id_evidencia',
        fields: [
          { name: 'id_historial', label: 'Fase del expediente', type: 'select', source: 'history', value: 'id_historial', text: historyOptionLabel, filter: (item, record) => !record?.id_proceso || Number(item.id_proceso) === Number(record.id_proceso) },
          { name: 'tipo_documento', label: 'Tipo documento', type: 'text' },
          { name: 'ruta_archivo_pdf', label: 'Ruta archivo PDF', type: 'text' },
          { name: 'fecha_carga', label: 'Fecha carga', type: 'datetime-local' }
        ]
      },
      plans: {
        table: TABLES.plans,
        label: 'plan de estudio',
        pk: 'id_plan',
        fields: [
          { name: 'anio_version', label: 'Año versión', type: 'number' },
          { name: 'id_carrera', label: 'Carrera', type: 'select', source: 'careers', value: 'id_carrera', text: (item) => item.nombre_carrera },
          { name: 'total_creditos_requeridos', label: 'Créditos requeridos', type: 'number' },
          { name: 'estado', label: 'Estado', type: 'select-static', options: ['Historico', 'Vigente', 'En Revision', 'Propuesta'] }
        ]
      },
      courses: {
        table: TABLES.courses,
        label: 'curso',
        pk: 'id_curso',
        fields: [
          { name: 'id_plan', label: 'Plan', type: 'select', source: 'plans', value: 'id_plan', text: planLabel },
          { name: 'id_area', label: 'Área', type: 'select', source: 'areas', value: 'id_area', text: (item) => item.nombre_area },
          { name: 'id_ciclo', label: 'Ciclo', type: 'select', source: 'cycles', value: 'id_ciclo', text: (item) => `${item.numero_ciclo}. ${item.denominacion}` },
          { name: 'codigo_curso', label: 'Código', type: 'text' },
          { name: 'nombre', label: 'Nombre', type: 'text' },
          { name: 'creditos', label: 'Créditos', type: 'number' },
          { name: 'modalidad', label: 'Modalidad', type: 'select-static', options: ['Presencial', 'Semipresencial', 'Virtual'] }
        ]
      },
      answers: {
        table: TABLES.answers,
        label: 'respuesta de encuesta',
        pk: 'id_respuesta',
        fields: [
          { name: 'id_pregunta', label: 'Pregunta', type: 'select', source: 'questions', value: 'id_pregunta', text: (item) => `${item.categoria} - ${item.texto_pregunta}` },
          { name: 'id_participante', label: 'Participante', type: 'select', source: 'participants', value: 'id_participante', text: participantLabel },
          { name: 'valor_respuesta', label: 'Valor respuesta', type: 'number', min: 1, max: 5 },
          { name: 'comentario', label: 'Comentario', type: 'textarea' },
          { name: 'fecha_respuesta', label: 'Fecha respuesta', type: 'datetime-local' }
        ]
      },
      prerequisites: {
        table: TABLES.prerequisites,
        label: 'prerrequisito',
        pk: ['id_curso_objetivo', 'id_curso_previo'],
        fields: [
          { name: 'id_curso_objetivo', label: 'Curso objetivo', type: 'select', source: 'courses', value: 'id_curso', text: courseOptionLabel },
          { name: 'id_curso_previo', label: 'Curso previo', type: 'select', source: 'courses', value: 'id_curso', text: courseOptionLabel },
          { name: 'comentarios_regla', label: 'Regla', type: 'textarea' }
        ]
      }
    };

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
      bindEvents();
      showConnectionMessage('Cargando información desde Supabase...');

      try {
        // [EXPO_CONEXION_BD] Inicialización de la conexión con la base de datos (Backend).
        state.client = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        await syncSession();
        await refreshData();
        state.client.auth.onAuthStateChange(async (_event, session) => {
          state.user = session?.user || null;
          state.isAdmin = Boolean(state.user);
          updateSessionUI();
          render();
        });
      } catch (error) {
        console.error(error);
        showConnectionMessage('No se pudo consultar Supabase. Revisa permisos SELECT, red o nombres de tablas.');
      }
    }

    async function syncSession() {
      const { data, error } = await state.client.auth.getSession();
      if (error) throw error;
      state.user = data.session?.user || null;
      state.isAdmin = Boolean(state.user);
      updateSessionUI();
    }

    // [EXPO_CONSULTAS_SELECT] Extracción masiva. Equivale a sentencias "SELECT * FROM tabla".
    async function refreshData() {
      const previousSelectedId = state.selectedId;
      state.data = await loadReadOnlyData(state.client);
      hydratePlanCareers();
      hydrateAnswerParticipants();
      state.processes = buildProcesses(state.data);
      state.filtered = state.processes;
      state.selectedId = state.processes.some((item) => item.id === previousSelectedId)
        ? previousSelectedId
        : state.processes[0]?.id || null;
      hideConnectionMessage();
      populateFilters();
      render();
    }

    async function loadReadOnlyData(client) {
      const entries = await Promise.all(Object.entries(TABLES).map(async ([key, table]) => {
        const { data, error } = await client.from(table).select('*');
        if (error) throw error;
        return [key, data || []];
      }));

      return Object.fromEntries(entries);
    }

    function hydrateAnswerParticipants() {
      const participants = mapBy(state.data.participants || [], 'id_participante');
      state.data.answers = (state.data.answers || []).map((answer) => {
        const participant = participants.get(answer.id_participante);
        return {
          ...answer,
          id_plan: answer.id_plan ?? participant?.id_plan ?? null,
          id_poblacion: answer.id_poblacion ?? participant?.id_poblacion ?? null,
          correo_participante: participant?.correo_institucional || answer.correo_institucional || '',
          participante: participant || null
        };
      });
    }

    function hydratePlanCareers() {
      const careers = mapBy(state.data.careers || [], 'id_carrera');
      state.data.plans = (state.data.plans || []).map((plan) => ({
        ...plan,
        nombre_carrera: careers.get(plan.id_carrera)?.nombre_carrera || plan.nombre_carrera || ''
      }));
    }

    function bindEvents() {
      document.querySelectorAll('[data-module-target]').forEach((button) => {
        button.addEventListener('click', () => {
          state.activeModule = button.dataset.moduleTarget;
          renderActiveModule();
        });
      });
      document.getElementById('searchInput').addEventListener('input', applyFilters);
      document.getElementById('filterPeriod').addEventListener('change', applyFilters);
      document.getElementById('filterCareer').addEventListener('change', applyFilters);
      document.getElementById('filterStatus').addEventListener('change', applyFilters);
      document.getElementById('clearFilters').addEventListener('click', clearFilters);
      document.getElementById('dashboardCareer').addEventListener('change', updateDashboardFilter);
      document.getElementById('dashboardPopulation').addEventListener('change', updateDashboardFilter);
      document.getElementById('dashboardPlan').addEventListener('change', updateDashboardFilter);
      document.getElementById('dashboardClearFilters').addEventListener('click', clearDashboardFilters);
      document.getElementById('feedbackProcess').addEventListener('change', updateFeedbackFilter);
      document.getElementById('feedbackCareer').addEventListener('change', updateFeedbackFilter);
      document.getElementById('feedbackPopulation').addEventListener('change', updateFeedbackFilter);
      document.getElementById('feedbackPlan').addEventListener('change', updateFeedbackFilter);
      document.getElementById('feedbackClearFilters').addEventListener('click', clearFeedbackFilters);
      document.getElementById('mallaProcess').addEventListener('change', onMallaProcessChange);
      document.getElementById('mallaPlan').addEventListener('change', onMallaPlanChange);
      document.getElementById('mallaAddCourseBtn').addEventListener('click', () => mallaAddCourse());
      const mallaAddExistingCourseBtn = document.getElementById('mallaAddExistingCourseBtn');
      if(mallaAddExistingCourseBtn) mallaAddExistingCourseBtn.addEventListener('click', mallaAddExistingCourse);
      document.getElementById('mallaAddAreaBtn').addEventListener('click', mallaAddArea);
      document.getElementById('mallaAddPrereqBtn').addEventListener('click', mallaAddPrerequisite);
      document.getElementById('mallaBackBtn').addEventListener('click', () => { state.activeModule = 'dashboard'; render(); });
      document.getElementById('mallaExportPdf').addEventListener('click', mallaExportPdf);
      document.getElementById('loginButton').addEventListener('click', openLoginModal);
      document.getElementById('logoutButton').addEventListener('click', signOut);
      document.getElementById('modalClose').addEventListener('click', closeModal);
      document.querySelectorAll('[data-dashboard-jump]').forEach((item) => {
        item.addEventListener('click', handleDashboardJump);
        item.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleDashboardJump(event);
          }
        });
      });
    }

    function buildProcesses(data) {
      const plans = mapBy(data.plans, 'id_plan');
      const periods = mapBy(data.periods, 'id_periodo');
      const steps = mapBy(data.steps, 'id_paso');
      const actors = mapBy(data.actors, 'id_actor');
      const evidenceByHistory = groupBy(data.evidence, 'id_historial');

      return data.processes
        .map((process) => {
          const evaluatedPlan = plans.get(process.id_plan_evaluado);
          const newPlan = plans.get(process.id_plan_nuevo);
          const period = periods.get(process.id_periodo);
          const history = data.history
            .filter((item) => item.id_proceso === process.id_proceso)
            .sort((a, b) => new Date(a.fecha_ejecucion) - new Date(b.fecha_ejecucion))
            .map((item) => ({
              ...item,
              step: steps.get(item.id_paso),
              actor: actors.get(item.id_actor),
              evidence: evidenceByHistory.get(item.id_historial) || []
            }));
          const latest = history.at(-1);
          const fullTimeline = buildFullTimeline(data.steps, history);
          const currentStep = Math.max(0, ...history.map((item) => item.step?.numero_paso || 0));
          const registeredSteps = new Set(history.map((item) => item.id_paso)).size;
          const planIds = [process.id_plan_evaluado, process.id_plan_nuevo].filter(Boolean);
          const courses = data.courses.filter((course) => planIds.includes(course.id_plan));
          const answers = data.answers.filter((answer) => planIds.includes(answer.id_plan));
          const evidence = history.flatMap((item) => item.evidence);
          const searchable = [
            process.id_proceso,
            process.estado_proceso,
            process.motivo_revision,
            evaluatedPlan?.nombre_carrera,
            newPlan?.nombre_carrera,
            period?.nombre_periodo,
            latest?.observaciones_revision,
            ...history.map((item) => item.observaciones_revision),
            ...courses.map((course) => `${course.codigo_curso} ${course.nombre}`),
            ...answers.map((answer) => answer.comentario),
            ...evidence.map((item) => `${item.tipo_documento} ${item.ruta_archivo_pdf}`)
          ].join(' ');

          return {
            id: process.id_proceso,
            raw: process,
            evaluatedPlan,
            newPlan,
            period,
            history,
            fullTimeline,
            latest,
            currentStep,
            registeredSteps,
            progress: Math.min(100, Math.round((registeredSteps / data.steps.length) * 100)),
            courses,
            answers,
            evidence,
            career: newPlan?.nombre_carrera || evaluatedPlan?.nombre_carrera || 'Sin carrera',
            status: process.estado_proceso || 'Sin estado',
            searchable: normalizeText(searchable)
          };
        })
        .sort((a, b) => new Date(b.raw.fecha_inicio) - new Date(a.raw.fecha_inicio));
    }

    function populateFilters() {
      fillSelect('filterPeriod', 'Todos', unique(state.processes.map((item) => item.period?.nombre_periodo)));
      fillSelect('filterCareer', 'Todas', unique(state.processes.map((item) => item.career)));
      fillSelect('filterStatus', 'Todos', unique(state.processes.map((item) => item.status)));
      populateDashboardFilters();
      populateFeedbackFilters();
    }

    function fillSelect(id, label, values) {
      const select = document.getElementById(id);
      select.innerHTML = `<option value="">${label}</option>${values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('')}`;
    }

    function populateDashboardFilters() {
      const career = state.dashboardFilters.career;
      const currentPlanIds = dashboardCurrentPlanIds();
      const dashboardPlans = state.data.plans.filter((item) => currentPlanIds.has(Number(item.id_plan)));

      fillSelect('dashboardCareer', 'Todas', unique(dashboardPlans.map((item) => displayText(item.nombre_carrera))));
      fillSelect('dashboardPopulation', 'Todos', unique(state.data.populations.map((item) => displayText(item.tipo_poblacion))));

      const planSelect = document.getElementById('dashboardPlan');
      planSelect.innerHTML = `<option value="">Todos</option>${dashboardPlans.map((item) => `
        <option value="${escapeHtml(item.id_plan)}">${escapeHtml(planLabel(item))}</option>
      `).join('')}`;

      document.getElementById('dashboardCareer').value = [...document.getElementById('dashboardCareer').options].some((option) => option.value === career) ? career : '';
      document.getElementById('dashboardPopulation').value = '';
      document.getElementById('dashboardPlan').value = '';
      state.dashboardFilters.career = document.getElementById('dashboardCareer').value;
      state.dashboardFilters.population = '';
      state.dashboardFilters.plan = '';
    }

    function populateFeedbackFilters() {
      ensureDefaultFeedbackProcess();

      const filters = state.feedbackFilters;
      const process = feedbackSelectedProcess();
      const processPlanIds = process ? processPlanIdSet(process) : dashboardSurveyPlanIds();
      const feedbackPlans = state.data.plans.filter((item) => processPlanIds.has(Number(item.id_plan)));
      const fallbackPlans = feedbackPlans.length ? feedbackPlans : state.data.plans.filter((item) => dashboardCurrentPlanIds().has(Number(item.id_plan)));

      const processSelect = document.getElementById('feedbackProcess');
      processSelect.innerHTML = `<option value="">Último proceso</option>${feedbackProcessOptions().map((item) => `
        <option value="${escapeHtml(item.id)}">${escapeHtml(feedbackProcessLabel(item))}</option>
      `).join('')}`;

      fillSelect('feedbackCareer', 'Todas', unique(fallbackPlans.map((item) => displayText(item.nombre_carrera))));
      fillSelect('feedbackPopulation', 'Todos', unique(state.data.populations.map((item) => displayText(item.tipo_poblacion))));

      const feedbackPlanSelect = document.getElementById('feedbackPlan');
      feedbackPlanSelect.innerHTML = `<option value="">Todos</option>${fallbackPlans.map((item) => `
        <option value="${escapeHtml(item.id_plan)}">${escapeHtml(planLabel(item))}</option>
      `).join('')}`;

      processSelect.value = state.processes.some((item) => String(item.id) === String(filters.process)) ? filters.process : '';
      document.getElementById('feedbackCareer').value = [...document.getElementById('feedbackCareer').options].some((option) => option.value === filters.career) ? filters.career : '';
      document.getElementById('feedbackPopulation').value = filters.population;
      document.getElementById('feedbackPlan').value = [...feedbackPlanSelect.options].some((option) => option.value === String(filters.plan)) ? filters.plan : '';

      state.feedbackFilters.process = processSelect.value;
      state.feedbackFilters.career = document.getElementById('feedbackCareer').value;
      state.feedbackFilters.population = document.getElementById('feedbackPopulation').value;
      state.feedbackFilters.plan = document.getElementById('feedbackPlan').value;
    }

    function updateDashboardFilter(event) {
      const map = {
        dashboardCareer: 'career',
        dashboardPopulation: 'population',
        dashboardPlan: 'plan'
      };
      state.dashboardFilters[map[event.target.id]] = event.target.value;
      populateDashboardFilters();
      renderDashboardSections();
    }

    function updateFeedbackFilter(event) {
      const map = {
        feedbackProcess: 'process',
        feedbackCareer: 'career',
        feedbackPopulation: 'population',
        feedbackPlan: 'plan'
      };
      state.feedbackFilters[map[event.target.id]] = event.target.value;
      populateFeedbackFilters();
      renderFeedbackSections();
    }

    function clearDashboardFilters() {
      state.dashboardFilters = { career: '', population: '', plan: '' };
      populateDashboardFilters();
      renderDashboardSections();
    }

    function clearFeedbackFilters() {
      state.feedbackFilters = {
        process: '',
        career: '',
        population: '',
        plan: ''
      };
      populateFeedbackFilters();
      renderFeedbackSections();
    }

    function handleDashboardJump(event) {
      const target = event.currentTarget.dataset.dashboardJump;
      if (target === 'feedback') {
        openFeedbackModule();
        return;
      }
      if (target === 'evidence') {
        openSupportModule('evidence');
        return;
      }
      if (target === 'observed') {
        openRecordsModule({ statusText: 'observado' });
        return;
      }
      if (target === 'done') {
        openRecordsModule({ statusText: 'finalizado' });
        return;
      }
      if (target === 'attention') {
        const first = attentionItems()[0];
        openRecordsModule({ processId: first?.processId, statusText: first ? '' : 'observado' });
        return;
      }
      openRecordsModule();
    }

    function openFeedbackModule(extraFilters = {}) {
      state.activeModule = 'feedback';
      state.feedbackFilters = {
        process: extraFilters.process || state.feedbackFilters.process || '',
        career: extraFilters.career || '',
        population: extraFilters.population || '',
        plan: extraFilters.plan || ''
      };
      renderActiveModule();
      populateFeedbackFilters();
      renderFeedbackSections();
      scrollModuleTop();
    }

    function openSupportModule(tabKey) {
      state.activeModule = 'model';
      state.activeSupport = tabKey;
      renderActiveModule();
      renderSupport();
      scrollModuleTop();
    }

    function openRecordsModule(options = {}) {
      state.activeModule = 'records';
      clearRecordFilterInputs();

      let rows = state.processes.slice();
      if (options.statusText) rows = rows.filter((item) => normalizeText(item.status).includes(normalizeText(options.statusText)));
      state.filtered = rows;
      state.selectedId = Number(options.processId) || rows[0]?.id || state.processes[0]?.id || null;
      if (state.selectedId) state.activeDetailTab = options.detailTab || 'timeline';

      renderActiveModule();
      renderProcessList();
      renderDetail();
      scrollModuleTop();
    }

    function clearRecordFilterInputs() {
      ['searchInput', 'filterPeriod', 'filterCareer', 'filterStatus'].forEach((id) => {
        const field = document.getElementById(id);
        if (field) field.value = '';
      });
    }

    function scrollModuleTop() {
      document.querySelector('.module-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function applyFilters() {
      const query = normalizeText(document.getElementById('searchInput').value);
      const period = document.getElementById('filterPeriod').value;
      const career = document.getElementById('filterCareer').value;
      const status = document.getElementById('filterStatus').value;

      state.filtered = state.processes.filter((item) => {
        const matchesQuery = !query || item.searchable.includes(query);
        const matchesPeriod = !period || item.period?.nombre_periodo === period;
        const matchesCareer = !career || item.career === career;
        const matchesStatus = !status || item.status === status;
        return matchesQuery && matchesPeriod && matchesCareer && matchesStatus;
      });

      if (!state.filtered.some((item) => item.id === state.selectedId)) {
        state.selectedId = state.filtered[0]?.id || null;
      }

      render();
    }

    function clearFilters() {
      document.getElementById('searchInput').value = '';
      document.getElementById('filterPeriod').value = '';
      document.getElementById('filterCareer').value = '';
      document.getElementById('filterStatus').value = '';
      state.filtered = state.processes;
      state.selectedId = state.filtered[0]?.id || null;
      render();
    }

    function render() {
      document.body.classList.toggle('admin-mode', state.isAdmin);
      renderActiveModule();
      populateDashboardFilters();
      renderDashboardSections();
      renderProcessList();
      renderDetail();
      renderSupport();
      renderAdminHome();
      renderMalla();
    }

    function renderDashboardSections() {
      renderMetrics();
      renderDashboardFeedbackSummary();
      renderFeedbackSections();
      renderAuthorityInsights();
    }

    function renderActiveModule() {
      document.querySelectorAll('[data-module-target]').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.moduleTarget === state.activeModule);
      });
      document.querySelectorAll('[data-module-page]').forEach((section) => {
        section.classList.toggle('is-active', section.dataset.modulePage === state.activeModule);
      });
      document.body.classList.toggle('malla-active', state.activeModule === 'malla');
    }

    function renderMetrics() {
      const processes = dashboardProcesses();
      const answers = dashboardAnswers();
      const progress = average(processes.map((item) => item.progress));
      const observed = processes.filter((item) => normalizeText(item.status).includes('observado')).length;
      const done = processes.filter((item) => normalizeText(item.status).includes('finalizado')).length;
      const attention = attentionItems().length;
      const feedback = average(answers.map((item) => Number(item.valor_respuesta)));
      const activePeriod = activePeriodLabel();

      document.getElementById('metricTotal').textContent = processes.length;
      document.getElementById('metricProgress').textContent = `${Math.round(progress)}%`;
      document.getElementById('metricObserved').textContent = observed;
      document.getElementById('metricDone').textContent = done;
      document.getElementById('metricAttention').textContent = attention;
      document.getElementById('metricActivePeriod').textContent = activePeriod;
      document.getElementById('metricEvidence').textContent = processes.reduce((total, item) => total + item.evidence.length, 0);
      document.getElementById('metricFeedback').textContent = feedback ? feedback.toFixed(1) : '0.0';
      document.getElementById('metricFeedbackCard')?.classList.toggle('is-hidden', !answers.length);
    }

    function renderDashboardFeedbackSummary() {
      const section = document.getElementById('dashboardFeedbackSummary');
      const container = document.getElementById('dashboardFeedbackContent');
      if (!section || !container) return;

      if (container.parentElement !== section) section.appendChild(container);

      const answers = dashboardAnswers();
      section.classList.toggle('is-hidden', !answers.length);
      if (!answers.length) {
        container.innerHTML = '';
        return;
      }

      const critical = criticalQuestionItems();
      const lowSample = lowSampleItems();
      const alerts = feedbackAlertItems();
      const avg = average(answers.map((item) => Number(item.valor_respuesta)));
      const participants = participantCount(answers);

      container.innerHTML = `
        <article class="feedback-quick-card">
          <span class="quick-label"><span class="ui-icon" aria-hidden="true">👥</span>Participantes</span>
          <strong>${participants}</strong>
          <p>${answers.length} valoraciones de preguntas</p>
        </article>
        <article class="feedback-quick-card drilldown-card" role="button" tabindex="0" data-dashboard-jump="feedback">
          <span class="quick-label"><span class="ui-icon" aria-hidden="true">📊</span>Promedio</span>
          <strong>${avg.toFixed(1)}</strong>
          <p>Escala de 1 a 5</p>
        </article>
        <article class="feedback-quick-card drilldown-card" role="button" tabindex="0" data-dashboard-jump="feedback">
          <span class="quick-label"><span class="ui-icon" aria-hidden="true">⚠️</span>Alertas</span>
          <strong>${alerts.length}</strong>
          <p>Promedios bajos detectados</p>
        </article>
        <article class="feedback-quick-card drilldown-card" role="button" tabindex="0" data-dashboard-jump="feedback">
          <span class="quick-label"><span class="ui-icon" aria-hidden="true">🚩</span>Preguntas críticas</span>
          <strong>${critical.length}</strong>
          <p>${lowSample.length ? `${lowSample.length} grupo(s) con muestra baja` : 'Sin muestra baja detectada'}</p>
        </article>
      `;
      bindDrilldownCards(container);
    }

    function renderPriorityBoard(targetId = 'feedbackPriorityBoard', options = {}) {
      const container = document.getElementById(targetId);
      if (!container) return;
      const sourceAnswers = options.answers || dashboardAnswers();
      const sourceProcesses = options.processes || dashboardProcesses();

      const urgent = [
        ...attentionItems(sourceProcesses).slice(0, 2).map((item) => ({
          ...item,
          label: 'Proceso observado',
          title: item.title,
          detail: item.detail,
          meta: item.meta,
          className: 'priority-danger'
        })),
        ...criticalQuestionItems(sourceAnswers).slice(0, 2).map((item) => ({
          ...item,
          label: 'Pregunta crítica',
          title: item.label,
          detail: `${item.avg.toFixed(1)} de 5 - ${item.detail}`,
          meta: item.meta,
          className: 'priority-danger'
        }))
      ].slice(0, 3);
      const lowSample = lowSampleItems(sourceAnswers).slice(0, 3);
      const missingEvidence = missingEvidenceItems(sourceProcesses).slice(0, 3);

      container.innerHTML = `
        <article class="priority-card priority-card-main">
          <div class="priority-card-header">
            <div>
              <h2 class="panel-title"><span class="ui-icon" aria-hidden="true">⚠️</span>Prioridades de atención</h2>
              <span class="panel-note">Lo que conviene revisar primero</span>
            </div>
            <strong>${urgent.length}</strong>
          </div>
          <div class="priority-list">
            ${urgent.length ? urgent.map(priorityItemTemplate).join('') : emptyTemplate('No hay urgencias críticas con el filtro actual.')}
          </div>
        </article>
        <article class="priority-card">
          <div class="priority-card-header">
            <div>
              <h2 class="panel-title"><span class="ui-icon" aria-hidden="true">👥</span>Muestra baja</h2>
              <span class="panel-note">Promedios con pocas respuestas</span>
            </div>
            <strong>${lowSample.length}</strong>
          </div>
          <div class="priority-list">
            ${lowSample.length ? lowSample.map(priorityItemTemplate).join('') : emptyTemplate('No hay grupos con muestra baja.')}
          </div>
        </article>
        <article class="priority-card">
          <div class="priority-card-header">
            <div>
              <h2 class="panel-title"><span class="ui-icon" aria-hidden="true">📄</span>Sin evidencia</h2>
              <span class="panel-note">Expedientes que necesitan respaldo</span>
            </div>
            <strong>${missingEvidence.length}</strong>
          </div>
          <div class="priority-list">
            ${missingEvidence.length ? missingEvidence.map(priorityItemTemplate).join('') : emptyTemplate('No hay expedientes sin evidencia para este filtro.')}
          </div>
        </article>
      `;
      container.querySelectorAll('.priority-card').forEach((card) => {
        if (card.querySelector('.empty')) card.remove();
      });
      container.classList.toggle('is-hidden', !container.querySelector('.priority-card'));
      bindDrilldownCards(container);
    }

    function priorityItemTemplate(item) {
      const actionAttrs = priorityActionAttributes(item);
      return `
        <div class="priority-item ${item.className || ''}${actionAttrs ? ' drilldown-card' : ''}" ${actionAttrs}>
          <span><span class="ui-icon" aria-hidden="true">${priorityItemIcon(item)}</span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.detail)}</p>
          <small>${escapeHtml(item.meta)}</small>
        </div>
      `;
    }

    function priorityActionAttributes(item) {
      if (item.action === 'process' && item.processId) {
        return `role="button" tabindex="0" data-priority-action="process" data-process-id="${escapeHtml(item.processId)}"`;
      }
      if (item.action === 'feedback-detail' && item.idPlan && item.idPopulation) {
        return `role="button" tabindex="0" data-feedback-detail data-id-plan="${escapeHtml(item.idPlan)}" data-id-population="${escapeHtml(item.idPopulation)}" ${item.idQuestion ? `data-id-question="${escapeHtml(item.idQuestion)}"` : ''}`;
      }
      return '';
    }

    function priorityItemIcon(item) {
      const text = normalizeText(`${item.label || ''} ${item.className || ''}`);
      if (text.includes('evidencia') || text.includes('respaldo')) return '📄';
      if (text.includes('muestra')) return '👥';
      if (text.includes('pregunta')) return '🚩';
      if (text.includes('observado') || text.includes('danger')) return '⚠️';
      return '📌';
    }

    function renderFeedbackSections() {
      const hasAnswers = feedbackAnswers().length > 0;
      document.getElementById('feedbackEmptyState')?.classList.toggle('is-hidden', hasAnswers);
      document.getElementById('feedbackAnalysis')?.classList.toggle('is-hidden', !hasAnswers);
      if (!hasAnswers) return;

      renderPriorityBoard('feedbackPriorityBoard', {
        answers: feedbackAnswers(),
        processes: feedbackProcesses()
      });
      renderCareerGroupChart('feedbackChartCareerGroup');
      renderFeedbackStatusChart('feedbackChartStatus');
      renderCriticalQuestionChart('feedbackChartCriticalQuestions');
      bindDrilldownCards(document.getElementById('feedbackAnalysis'));
    }

    function bindDrilldownCards(root = document) {
      root?.querySelectorAll('[data-dashboard-jump], [data-priority-action], [data-feedback-detail]').forEach((element) => {
        if (element.dataset.drilldownBound === 'true') return;
        element.dataset.drilldownBound = 'true';
        element.addEventListener('click', handleDrilldownAction);
        element.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleDrilldownAction(event);
          }
        });
      });
    }

    function handleDrilldownAction(event) {
      const target = event.currentTarget;
      if (target.dataset.dashboardJump) {
        handleDashboardJump(event);
        return;
      }
      if (target.dataset.priorityAction === 'process') {
        openRecordsModule({ processId: Number(target.dataset.processId) });
        return;
      }
      if (target.hasAttribute('data-feedback-detail')) {
        openFeedbackDetailModal({
          idPlan: Number(target.dataset.idPlan),
          idPopulation: Number(target.dataset.idPopulation),
          idQuestion: target.dataset.idQuestion ? Number(target.dataset.idQuestion) : null
        });
      }
    }

    function renderCareerGroupChart(targetId = 'feedbackChartCareerGroup') {
      const container = document.getElementById(targetId);
      if (!container) return;
      const plans = mapBy(state.data.plans, 'id_plan');
      const populations = mapBy(state.data.populations, 'id_poblacion');
      const questions = mapBy(state.data.questions, 'id_pregunta');
      const sourceAnswers = targetId === 'feedbackChartCareerGroup' ? feedbackAnswers() : dashboardAnswers();
      const rows = Array.from(groupBy(sourceAnswers, (answer) => [
        answer.id_plan,
        answer.id_poblacion
      ].join('|')).entries())
        .map(([key, answers]) => {
          const [idPlan, idPopulation] = key.split('|').map(Number);
          const plan = plans.get(idPlan);
          const populationRecord = populations.get(idPopulation);
          const avg = average(answers.map((answer) => Number(answer.valor_respuesta)));
          const criticalAnswers = answers.filter((answer) => Number(answer.valor_respuesta) < 3);
          const criticalQuestionCount = new Set(criticalAnswers.map((answer) => answer.id_pregunta)).size;
          const topCritical = Array.from(groupBy(criticalAnswers, 'id_pregunta').entries())
            .map(([idQuestion, questionAnswers]) => ({
              question: questions.get(Number(idQuestion)),
              avg: average(questionAnswers.map((answer) => Number(answer.valor_respuesta)))
            }))
            .sort((a, b) => a.avg - b.avg)[0];

          return {
            idPlan,
            idPopulation,
            career: dashboardPlanTitle(plan),
            planMeta: dashboardPlanMeta(plan),
            population: displayText(populationRecord?.tipo_poblacion || 'Sin población'),
            avg,
            count: answers.length,
            participants: participantCount(answers),
            criticalQuestionCount,
            topCriticalLabel: topCritical?.question?.categoria || '',
            status: feedbackStatus(avg)
          };
        })
        .sort((a, b) => a.avg - b.avg)
        .slice(0, 8);

      container.innerHTML = rows.length
        ? rows.map(feedbackGroupRowTemplate).join('')
        : emptyTemplate('Aún no hay respuestas suficientes para graficar.');
    }

    function renderFeedbackStatusChart(targetId = 'feedbackChartStatus') {
      const container = document.getElementById(targetId);
      if (!container) return;
      const groups = [
        { key: 'critical', label: 'Crítico', className: 'feedback-status-critical', count: 0 },
        { key: 'warning', label: 'Revisar', className: 'feedback-status-warning', count: 0 },
        { key: 'ok', label: 'Adecuado', className: 'feedback-status-ok', count: 0 }
      ];
      const sourceAnswers = targetId === 'feedbackChartStatus' ? feedbackAnswers() : dashboardAnswers();
      sourceAnswers.forEach((answer) => {
        const value = Number(answer.valor_respuesta);
        if (value < 3) groups[0].count += 1;
        else if (value < 3.8) groups[1].count += 1;
        else groups[2].count += 1;
      });
      const total = sum(groups.map((item) => item.count));

      container.innerHTML = total
        ? `
          <div class="status-stack">
            ${groups.map((item) => `<span class="${item.className}" style="width:${Math.max(4, (item.count / total) * 100)}%"></span>`).join('')}
          </div>
          <div class="status-breakdown">
            ${groups.map((item) => `
              <div>
                <span class="${item.className}">${item.label}</span>
                <strong>${item.count}</strong>
                <small>${Math.round((item.count / total) * 100)}%</small>
              </div>
            `).join('')}
          </div>
        `
        : emptyTemplate('Aún no hay respuestas para calcular el semáforo.');
    }

    function renderCriticalQuestionChart(targetId = 'feedbackChartCriticalQuestions') {
      const container = document.getElementById(targetId);
      if (!container) return;
      const sourceAnswers = targetId === 'feedbackChartCriticalQuestions' ? feedbackAnswers() : dashboardAnswers();
      const rows = criticalQuestionItems(sourceAnswers).slice(0, 5);

      container.innerHTML = rows.length
        ? rows.map((item) => `
          <article class="critical-item drilldown-card" role="button" tabindex="0" data-feedback-detail data-id-plan="${escapeHtml(item.idPlan)}" data-id-population="${escapeHtml(item.idPopulation)}" data-id-question="${escapeHtml(item.idQuestion)}">
            <div>
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(item.detail)}</span>
              <small>${escapeHtml(item.meta)} - ${item.count} valoración(es)</small>
            </div>
            <b class="${item.status.className}">${item.avg.toFixed(1)}</b>
          </article>
        `).join('')
        : emptyTemplate('Aún no hay respuestas para ordenar preguntas críticas.');
    }

    function barChartRowTemplate(title, subtitle, value, count, status) {
      const sample = count < 3 ? '<span class="sample-note">Muestra baja</span>' : '';
      return `
        <article class="bar-row">
          <div class="bar-row-head">
            <div>
              <strong>${escapeHtml(title)}</strong>
              <span>${escapeHtml(subtitle)} - ${count} valoración(es) ${sample}</span>
            </div>
            <b class="${status.className}">${value.toFixed(1)}</b>
          </div>
          <div class="bar-track">
            <div class="bar-fill ${status.className}" style="width:${Math.min(100, Math.max(0, value * 20))}%"></div>
          </div>
        </article>
      `;
    }

    function feedbackGroupRowTemplate(item) {
      const sample = item.participants < 3 ? '<span class="sample-note">Muestra baja</span>' : '';
      const critical = item.criticalQuestionCount
        ? `<span class="sample-note sample-note-danger">${item.criticalQuestionCount} pregunta(s) crítica(s)</span>`
        : '<span class="sample-note sample-note-ok">Sin críticas</span>';
      const topCritical = item.topCriticalLabel
        ? `<small>Aspecto más sensible: ${escapeHtml(displayText(item.topCriticalLabel))}</small>`
        : '<small>Sin preguntas críticas detectadas.</small>';

      return `
        <article class="bar-row feedback-group-row drilldown-card" role="button" tabindex="0" data-feedback-detail data-id-plan="${escapeHtml(item.idPlan)}" data-id-population="${escapeHtml(item.idPopulation)}">
          <div class="bar-row-head">
            <div>
              <strong>${escapeHtml(item.career)}</strong>
              <span>${escapeHtml(item.planMeta)} - ${escapeHtml(item.population)} - ${item.participants} participante(s) (${item.count} valoraciones) ${sample} ${critical}</span>
              ${topCritical}
            </div>
            <b class="${item.status.className}">${item.avg.toFixed(1)}</b>
          </div>
          <div class="bar-track">
            <div class="bar-fill ${item.status.className}" style="width:${Math.min(100, Math.max(0, item.avg * 20))}%"></div>
          </div>
        </article>
      `;
    }

    function legacyOpenFeedbackDetailModal({ idPlan, idPopulation, idQuestion = null }) {
      const questions = mapBy(state.data.questions, 'id_pregunta');
      const populations = mapBy(state.data.populations, 'id_poblacion');
      const plan = state.data.plans.find((item) => Number(item.id_plan) === Number(idPlan));
      const answers = state.data.answers
        .filter((answer) => Number(answer.id_plan) === Number(idPlan))
        .filter((answer) => Number(answer.id_poblacion) === Number(idPopulation))
        .filter((answer) => !idQuestion || Number(answer.id_pregunta) === Number(idQuestion))
        .slice()
        .sort((a, b) => Number(a.id_pregunta) - Number(b.id_pregunta) || new Date(b.fecha_respuesta) - new Date(a.fecha_respuesta));

      const avg = average(answers.map((answer) => Number(answer.valor_respuesta)));
      const title = idQuestion
        ? `Detalle de pregunta: ${displayText(questions.get(idQuestion)?.categoria || `Pregunta ${idQuestion}`)}`
        : `Detalle de feedback: ${dashboardPlanTitle(plan)}`;
      const subtitle = `${planLabel(plan)} - ${displayText(populations.get(idPopulation)?.tipo_poblacion || 'Grupo de interés')} - ${answers.length} valoración(es) - promedio ${avg ? avg.toFixed(1) : '0.0'}`;
      const rows = answers.map((answer) => {
        const question = questions.get(answer.id_pregunta);
        return `
          <article class="answer-detail-row">
            <div>
              <strong>${escapeHtml(displayText(question?.categoria || `Pregunta ${answer.id_pregunta}`))}</strong>
              <p>${escapeHtml(displayText(question?.texto_pregunta || 'Sin texto registrado.'))}</p>
              ${answer.comentario ? `<em>${escapeHtml(displayText(answer.comentario))}</em>` : ''}
              <small>${escapeHtml(answer.correo_participante || 'Participante registrado')} - ${formatDate(answer.fecha_respuesta)}</small>
            </div>
            <b class="${feedbackStatus(Number(answer.valor_respuesta)).className}">${escapeHtml(answer.valor_respuesta)}</b>
          </article>
        `;
      }).join('');

      openModal(title, subtitle, `
        <section class="answer-detail-list">
          ${rows || emptyTemplate('No hay respuestas para este detalle.')}
        </section>
      `);
    }

    function openFeedbackDetailModal({ idPlan, idPopulation, idQuestion = null }) {
      const questions = mapBy(state.data.questions, 'id_pregunta');
      const populations = mapBy(state.data.populations, 'id_poblacion');
      const plan = state.data.plans.find((item) => Number(item.id_plan) === Number(idPlan));
      const answers = state.data.answers
        .filter((answer) => Number(answer.id_plan) === Number(idPlan))
        .filter((answer) => Number(answer.id_poblacion) === Number(idPopulation))
        .filter((answer) => !idQuestion || Number(answer.id_pregunta) === Number(idQuestion))
        .slice()
        .sort((a, b) => Number(a.id_pregunta) - Number(b.id_pregunta) || new Date(b.fecha_respuesta) - new Date(a.fecha_respuesta));

      const avg = average(answers.map((answer) => Number(answer.valor_respuesta)));
      const selectedQuestion = idQuestion ? questions.get(idQuestion) : null;
      const participants = participantCount(answers);
      const commentsCount = answers.filter((answer) => String(answer.comentario || '').trim()).length;
      const distribution = [1, 2, 3, 4, 5].map((score) => ({
        score,
        count: answers.filter((answer) => Number(answer.valor_respuesta) === score).length
      }));
      const title = idQuestion
        ? `Detalle de pregunta: ${displayText(selectedQuestion?.categoria || `Pregunta ${idQuestion}`)}`
        : `Detalle de feedback: ${dashboardPlanTitle(plan)}`;
      const subtitle = `${planLabel(plan)} - ${displayText(populations.get(idPopulation)?.tipo_poblacion || 'Grupo de interés')} - ${participants} participante(s) - ${answers.length} valoración(es) - promedio ${avg ? avg.toFixed(1) : '0.0'}`;
      const focusBlock = selectedQuestion
        ? `
          <section class="answer-focus">
            <strong>${escapeHtml(displayText(selectedQuestion.categoria || `Pregunta ${idQuestion}`))}</strong>
            <p>${escapeHtml(displayText(selectedQuestion.texto_pregunta || 'Sin texto registrado.'))}</p>
          </section>
        `
        : '';

      openModal(title, subtitle, `
        ${focusBlock}
        <section class="answer-detail-summary" aria-label="Resumen de respuestas">
          <article><span>Participantes</span><strong>${participants}</strong></article>
          <article><span>Promedio</span><strong>${avg ? avg.toFixed(1) : '0.0'}</strong></article>
          <article><span>Valoraciones</span><strong>${answers.length}</strong></article>
          <article><span>Comentarios</span><strong>${commentsCount}</strong></article>
        </section>
        <section class="answer-distribution" aria-label="Distribución de puntajes">
          ${distribution.map((item) => `
            <div class="answer-distribution-item">
              <span>${item.score}</span>
              <div><i style="width:${answers.length ? Math.max(4, (item.count / answers.length) * 100) : 0}%"></i></div>
              <b>${item.count}</b>
            </div>
          `).join('')}
        </section>
        <section class="answer-filter-row" aria-label="Filtrar respuestas">
          <button class="answer-filter-btn is-active" type="button" data-answer-filter="all">Todas</button>
          <button class="answer-filter-btn" type="button" data-answer-filter="critical">Críticas 1-2</button>
          <button class="answer-filter-btn" type="button" data-answer-filter="neutral">Neutras 3</button>
          <button class="answer-filter-btn" type="button" data-answer-filter="positive">Positivas 4-5</button>
          <button class="answer-filter-btn" type="button" data-answer-filter="comments">Con comentario</button>
        </section>
        <section id="answerDetailRows" class="answer-detail-list"></section>
        <nav id="answerDetailPagination" class="answer-pagination" aria-label="Paginación de respuestas"></nav>
      `);

      const pageSize = 10;
      let currentPage = 1;
      let currentFilter = 'all';

      const filteredAnswers = () => answers.filter((answer) => {
        const score = Number(answer.valor_respuesta);
        if (currentFilter === 'critical') return score <= 2;
        if (currentFilter === 'neutral') return score === 3;
        if (currentFilter === 'positive') return score >= 4;
        if (currentFilter === 'comments') return String(answer.comentario || '').trim();
        return true;
      });

      const rowTemplate = (answer) => {
        const question = questions.get(answer.id_pregunta);
        const status = feedbackStatus(Number(answer.valor_respuesta));
        const rowQuestion = idQuestion
          ? ''
          : `
            <strong>${escapeHtml(displayText(question?.categoria || `Pregunta ${answer.id_pregunta}`))}</strong>
            <p>${escapeHtml(displayText(question?.texto_pregunta || 'Sin texto registrado.'))}</p>
          `;

        return `
          <article class="answer-detail-row">
            <div>
              ${rowQuestion || '<strong>Respuesta registrada</strong>'}
              ${answer.comentario ? `<em>${escapeHtml(displayText(answer.comentario))}</em>` : '<p class="muted-answer">Sin comentario adicional.</p>'}
              <small>${escapeHtml(answer.correo_participante || 'Participante registrado')} - ${formatDate(answer.fecha_respuesta)}</small>
            </div>
            <b class="${status.className}" title="${escapeHtml(status.label)}">${escapeHtml(answer.valor_respuesta)}</b>
          </article>
        `;
      };

      const paintAnswerList = () => {
        const rowsContainer = document.getElementById('answerDetailRows');
        const pagination = document.getElementById('answerDetailPagination');
        if (!rowsContainer || !pagination) return;
        const visible = filteredAnswers();
        const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
        currentPage = Math.min(Math.max(1, currentPage), totalPages);
        const start = (currentPage - 1) * pageSize;
        const pageRows = visible.slice(start, start + pageSize);
        rowsContainer.innerHTML = pageRows.length
          ? pageRows.map(rowTemplate).join('')
          : emptyTemplate('No hay respuestas para este filtro.');
        pagination.innerHTML = `
          <span>${visible.length ? `${start + 1}-${Math.min(start + pageSize, visible.length)} de ${visible.length}` : '0 respuestas'}</span>
          <div>
            <button type="button" data-answer-page="prev" ${currentPage <= 1 ? 'disabled' : ''}>Anterior</button>
            <b>Página ${currentPage} de ${totalPages}</b>
            <button type="button" data-answer-page="next" ${currentPage >= totalPages ? 'disabled' : ''}>Siguiente</button>
          </div>
        `;
      };

      document.querySelectorAll('[data-answer-filter]').forEach((button) => {
        button.addEventListener('click', () => {
          currentFilter = button.dataset.answerFilter;
          currentPage = 1;
          document.querySelectorAll('[data-answer-filter]').forEach((item) => item.classList.toggle('is-active', item === button));
          paintAnswerList();
        });
      });
      document.getElementById('answerDetailPagination')?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-answer-page]');
        if (!button) return;
        currentPage += button.dataset.answerPage === 'next' ? 1 : -1;
        paintAnswerList();
      });
      paintAnswerList();
    }

    function dashboardAnswers() {
      const plans = mapBy(state.data.plans, 'id_plan');
      const filters = state.dashboardFilters;
      const surveyPlanIds = dashboardSurveyPlanIds();
      return state.data.answers.filter((answer) => {
        const plan = plans.get(answer.id_plan);
        const population = state.data.populations.find((item) => item.id_poblacion === answer.id_poblacion);
        const matchesScope = surveyPlanIds.has(Number(answer.id_plan));
        const matchesCareer = !filters.career || displayText(plan?.nombre_carrera) === filters.career;
        const matchesPopulation = !filters.population || displayText(population?.tipo_poblacion) === filters.population;
        const matchesPlan = !filters.plan || String(answer.id_plan) === String(filters.plan);
        return matchesScope && matchesCareer && matchesPopulation && matchesPlan;
      });
    }

    function dashboardProcesses() {
      const filters = state.dashboardFilters;
      return currentDashboardProcesses().filter((item) => {
        const planIds = [item.evaluatedPlan?.id_plan, item.newPlan?.id_plan].filter(Boolean).map(String);
        const matchesCareer = !filters.career || item.career === filters.career;
        const matchesPlan = !filters.plan || planIds.includes(String(filters.plan));
        return matchesCareer && matchesPlan;
      });
    }

    function feedbackProcessOptions() {
      return currentDashboardProcesses()
        .slice()
        .sort((a, b) => feedbackProcessRank(b) - feedbackProcessRank(a));
    }

    function feedbackProcessRank(item) {
      const hasAnswersWeight = processHasFeedbackAnswers(item) ? 20000000000000 : 0;
      const activeWeight = isObserved(item.status) || normalizeText(item.status).includes('curso') ? 10000000000000 : 0;
      return hasAnswersWeight + activeWeight + new Date(item.raw.fecha_inicio || 0).getTime();
    }

    function processHasFeedbackAnswers(item) {
      const planIds = processPlanIdSet(item);
      return state.data.answers.some((answer) => planIds.has(Number(answer.id_plan)));
    }

    function ensureDefaultFeedbackProcess() {
      if (state.feedbackFilters.process && state.processes.some((item) => String(item.id) === String(state.feedbackFilters.process))) return;
      state.feedbackFilters.process = String(feedbackProcessOptions()[0]?.id || '');
    }

    function feedbackSelectedProcess() {
      ensureDefaultFeedbackProcess();
      return state.processes.find((item) => String(item.id) === String(state.feedbackFilters.process)) || null;
    }

    function processPlanIdSet(process) {
      return new Set([process?.evaluatedPlan?.id_plan, process?.newPlan?.id_plan]
        .filter(Boolean)
        .map(Number));
    }

    function feedbackProcesses() {
      const selected = feedbackSelectedProcess();
      return selected ? [selected] : [];
    }

    function feedbackAnswers() {
      const process = feedbackSelectedProcess();
      const processPlanIds = process ? processPlanIdSet(process) : dashboardSurveyPlanIds();
      const plans = mapBy(state.data.plans, 'id_plan');
      const filters = state.feedbackFilters;

      return state.data.answers.filter((answer) => {
        const plan = plans.get(answer.id_plan);
        const population = state.data.populations.find((item) => item.id_poblacion === answer.id_poblacion);
        const matchesProcess = processPlanIds.has(Number(answer.id_plan));
        const matchesCareer = !filters.career || displayText(plan?.nombre_carrera) === filters.career;
        const matchesPopulation = !filters.population || displayText(population?.tipo_poblacion) === filters.population;
        const matchesPlan = !filters.plan || String(answer.id_plan) === String(filters.plan);
        return matchesProcess && matchesCareer && matchesPopulation && matchesPlan;
      });
    }

    function feedbackProcessLabel(item) {
      const period = item.period?.nombre_periodo || 'Sin periodo';
      return `PC01-${item.id} - ${shortCareerName(item.career)} - ${shortPeriodName(period)}`;
    }

    function shortCareerName(value) {
      const career = displayText(value);
      const normalized = normalizeText(career);
      if (normalized.includes('computacion') || normalized.includes('sistemas')) return 'Comp.';
      if (normalized.includes('industrial')) return 'Ind.';
      if (normalized.includes('electronica')) return 'Elect.';
      if (normalized.includes('civil')) return 'Civil';
      if (normalized.includes('arquitectura')) return 'Arq.';
      return career.length > 14 ? `${career.slice(0, 11)}...` : career;
    }

    function shortPeriodName(value) {
      return displayText(value).replace(/^20(\d{2})-/, '$1-');
    }

    function dashboardCurrentPlanIds() {
      const nonHistoricalPlans = state.data.plans
        .filter((plan) => !normalizeText(plan.estado).includes('historico'))
        .map((plan) => Number(plan.id_plan));

      return new Set(nonHistoricalPlans);
    }

    function dashboardSurveyPlanIds() {
      const currentPlanIds = dashboardCurrentPlanIds();
      const answeredPlanIds = new Set((state.data.answers || [])
        .map((answer) => Number(answer.id_plan))
        .filter((idPlan) => currentPlanIds.has(idPlan)));

      return new Set([...currentPlanIds].filter((idPlan) => {
        const relatedProcesses = state.processes.filter((item) => [
          item.evaluatedPlan?.id_plan,
          item.newPlan?.id_plan
        ].map(Number).includes(idPlan));

        return answeredPlanIds.has(idPlan)
          || !relatedProcesses.length
          || relatedProcesses.some((item) => item.currentStep <= FEEDBACK_COLLECTION_STEP);
      }));
    }

    function currentDashboardProcesses() {
      return state.processes.filter((item) => {
        const planIsCurrent = [item.evaluatedPlan, item.newPlan]
          .filter(Boolean)
          .some((plan) => !normalizeText(plan.estado).includes('historico'));
        return planIsCurrent;
      });
    }

    function criticalQuestionItems(sourceAnswers = dashboardAnswers()) {
      const questions = mapBy(state.data.questions, 'id_pregunta');
      const plans = mapBy(state.data.plans, 'id_plan');
      const populations = mapBy(state.data.populations, 'id_poblacion');
      return Array.from(groupBy(sourceAnswers, (answer) => [
        answer.id_plan,
        answer.id_poblacion,
        answer.id_pregunta
      ].join('|')).entries())
        .map(([key, answers]) => {
          const [idPlan, idPopulation, idQuestion] = key.split('|').map(Number);
          const question = questions.get(idQuestion);
          const avg = average(answers.map((answer) => Number(answer.valor_respuesta)));
          return {
            label: displayText(question?.categoria || `Pregunta ${idQuestion}`),
            detail: displayText(question?.texto_pregunta || ''),
            meta: `${dashboardPlanTitle(plans.get(idPlan))} - ${dashboardPlanMeta(plans.get(idPlan))} - ${displayText(populations.get(idPopulation)?.tipo_poblacion || 'Población')}`,
            avg,
            count: answers.length,
            status: feedbackStatus(avg),
            idPlan,
            idPopulation,
            idQuestion,
            action: 'feedback-detail'
          };
        })
        .filter((item) => item.avg > 0)
        .sort((a, b) => a.avg - b.avg);
    }

    function lowSampleItems(sourceAnswers = dashboardAnswers()) {
      const plans = mapBy(state.data.plans, 'id_plan');
      const populations = mapBy(state.data.populations, 'id_poblacion');
      return Array.from(groupBy(sourceAnswers, (answer) => [
        answer.id_plan,
        answer.id_poblacion
      ].join('|')).entries())
        .map(([key, answers]) => {
          const [idPlan, idPopulation] = key.split('|').map(Number);
          const avg = average(answers.map((answer) => Number(answer.valor_respuesta)));
          const participants = participantCount(answers);
          return {
            label: 'Validar muestra',
            title: displayText(populations.get(idPopulation)?.tipo_poblacion || 'Población'),
            detail: `${participants} participante(s), promedio ${avg.toFixed(1)} de 5.`,
            meta: `${dashboardPlanTitle(plans.get(idPlan))} - ${dashboardPlanMeta(plans.get(idPlan))}`,
            count: participants,
            className: 'priority-warning',
            idPlan,
            idPopulation,
            action: 'feedback-detail'
          };
        })
        .filter((item) => item.count > 0 && item.count < 3)
        .sort((a, b) => a.count - b.count);
    }

    function missingEvidenceItems(sourceProcesses = dashboardProcesses()) {
      return sourceProcesses
        .filter((item) => !normalizeText(item.status).includes('finalizado') && item.evidence.length === 0)
        .map((item) => ({
          label: 'Falta respaldo',
          title: item.career,
          detail: 'Expediente en curso sin evidencias documentales registradas.',
          meta: `${item.period?.nombre_periodo || 'Sin periodo'} - PC01-${item.id}`,
          className: 'priority-warning',
          processId: item.id,
          action: 'process'
        }));
    }

    function dashboardPlanTitle(plan) {
      return displayText(plan?.nombre_carrera || 'Sin carrera');
    }

    function dashboardPlanMeta(plan) {
      if (!plan) return 'Sin plan';
      return `Plan ${plan.anio_version} - ${plan.total_creditos_requeridos} créd. - ${displayText(plan.estado)}`;
    }

    function renderAuthorityInsights() {
      const attention = attentionItems();
      const bottlenecks = bottleneckItems();
      const feedbackAlerts = feedbackAlertItems();
      const panels = {
        attention: {
          label: 'Atención requerida',
          note: `${attention.length} casos`,
          rows: attention,
          empty: 'No hay procesos observados ni fases observadas.',
          status: null
        },
        bottlenecks: {
          label: 'Cuellos de botella',
          note: `${bottlenecks.length} alertas`,
          rows: bottlenecks,
          empty: 'No se detectan brechas críticas con los datos actuales.',
          status: 'Observado'
        },
        feedback: {
          label: 'Alertas por feedback',
          note: `${feedbackAlerts.length} alertas`,
          rows: feedbackAlerts,
          empty: 'No hay carreras con feedback bajo según las respuestas actuales.',
          status: 'Observado'
        }
      };
      const visiblePanels = Object.entries(panels).filter(([key, panel]) => key !== 'feedback' || panel.rows.length);
      if (!visiblePanels.some(([key]) => key === state.activeInsight)) state.activeInsight = 'attention';
      const current = panels[state.activeInsight] || panels.attention;

      document.getElementById('insightTabs').innerHTML = visiblePanels.map(([key, panel]) => `
        <button class="insight-tab${key === state.activeInsight ? ' is-active' : ''}" type="button" data-insight-tab="${key}">
          ${escapeHtml(panel.label)} (${panel.rows.length})
        </button>
      `).join('');
      document.getElementById('insightPanelTitle').textContent = current.label;
      document.getElementById('insightPanelNote').textContent = current.note;
      document.getElementById('insightPanelList').innerHTML = current.rows.length
        ? current.rows.slice(0, 6).map((item) => insightItemTemplate(item, current.status || item.status)).join('')
        : emptyTemplate(current.empty);
      bindDrilldownCards(document.getElementById('insightPanelList'));

      document.querySelectorAll('[data-insight-tab]').forEach((button) => {
        button.addEventListener('click', () => {
          state.activeInsight = button.dataset.insightTab;
          renderAuthorityInsights();
        });
      });
    }

    function activePeriodLabel() {
      const active = state.data.periods.find((period) => normalizeText(period.estado).includes('activo'));
      if (active) return active.nombre_periodo;

      const sorted = state.data.periods
        .slice()
        .sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));
      return sorted[0]?.nombre_periodo || '-';
    }

    function attentionItems() {
      return dashboardProcesses()
        .filter((item) => isObserved(item.status) || item.history.some((entry) => isObserved(entry.estado_fase)))
        .map((item) => {
          const observedPhase = item.history.find((entry) => isObserved(entry.estado_fase));
          return {
            title: item.career,
            detail: displayText(observedPhase?.observaciones_revision || item.latest?.observaciones_revision || item.raw.motivo_revision || 'Requiere revisión.'),
            meta: `${item.period?.nombre_periodo || 'Sin periodo'} - PC01-${item.id}`,
            status: observedPhase?.estado_fase || item.status,
            processId: item.id,
            action: 'process'
          };
        });
    }

    function bottleneckItems() {
      return dashboardProcesses().flatMap((item) => {
        const missingBeforeLatest = item.fullTimeline
          .filter(({ step, entry }) => !entry && step.numero_paso < item.currentStep)
          .map(({ step }) => ({
            title: item.career,
            detail: `Paso ${step.numero_paso} sin registro antes del ?ltimo paso documentado.`,
            meta: displayText(step.descripcion_paso),
            processId: item.id,
            action: 'process'
          }));

        const lowEvidence = !normalizeText(item.status).includes('finalizado') && item.evidence.length === 0
          ? [{
              title: item.career,
              detail: 'Expediente en curso sin evidencias documentales registradas.',
              meta: `${item.period?.nombre_periodo || 'Sin periodo'} - PC01-${item.id}`,
              processId: item.id,
              action: 'process'
            }]
          : [];

        const observedComment = isObserved(item.status)
          ? [{
              title: item.career,
              detail: displayText(item.latest?.observaciones_revision || item.raw.motivo_revision || 'Proceso observado sin detalle adicional.'),
              meta: 'Observación activa',
              processId: item.id,
              action: 'process'
            }]
          : [];

        return [...missingBeforeLatest, ...lowEvidence, ...observedComment];
      });
    }

    function feedbackAlertItems(sourceAnswers = dashboardAnswers()) {
      const questions = mapBy(state.data.questions, 'id_pregunta');
      const plans = mapBy(state.data.plans, 'id_plan');
      const byPlan = groupBy(sourceAnswers, 'id_plan');
      const alerts = [];

      byPlan.forEach((answers, planId) => {
        const plan = plans.get(Number(planId));
        const avg = average(answers.map((item) => Number(item.valor_respuesta)));
        if (avg > 0 && avg < 3) {
          alerts.push({
            title: displayText(plan?.nombre_carrera || `Plan ${planId}`),
            detail: `Feedback promedio bajo: ${avg.toFixed(1)} de 5. Conviene revisar comentarios y causas recurrentes.`,
            meta: planLabel(plan)
          });
        }

        const byCategory = groupBy(answers, (answer) => questions.get(answer.id_pregunta)?.categoria || 'Sin categoría');
        byCategory.forEach((categoryAnswers, category) => {
          const categoryAvg = average(categoryAnswers.map((item) => Number(item.valor_respuesta)));
          if (categoryAvg > 0 && categoryAvg < 3) {
            alerts.push({
              title: displayText(plan?.nombre_carrera || `Plan ${planId}`),
              detail: `${category}: promedio ${categoryAvg.toFixed(1)} de 5.`,
              meta: 'Categoría crítica de encuesta'
            });
          }
        });
      });

      return alerts.sort((a, b) => a.detail.localeCompare(b.detail));
    }

    function insightItemTemplate(item, status) {
      const actionAttrs = item.processId
        ? `role="button" tabindex="0" data-priority-action="process" data-process-id="${escapeHtml(item.processId)}"`
        : '';
      return `
        <article class="insight-item ${actionAttrs ? 'drilldown-card' : ''}" ${actionAttrs}>
          <div class="insight-top">
            <strong>${escapeHtml(item.title)}</strong>
            ${statusBadge(status)}
          </div>
          <p>${escapeHtml(item.detail || '-')}</p>
          <span>${escapeHtml(item.meta || '')}</span>
        </article>
      `;
    }

    function renderProcessList() {
      document.getElementById('resultCount').textContent = `${state.filtered.length} resultados`;
      document.getElementById('processList').innerHTML = state.filtered.length
        ? state.filtered.map((item) => processCardTemplate(item)).join('')
        : emptyTemplate('No hay expedientes con esos filtros.');

      document.querySelectorAll('[data-process-id]').forEach((button) => {
        button.addEventListener('click', () => {
          state.selectedId = Number(button.dataset.processId);
          state.activeDetailTab = 'timeline';
          state.selectedTimelineStep[state.selectedId] = getDefaultTimelineStep(state.processes.find((item) => item.id === state.selectedId));
          renderProcessList();
          renderDetail();
        });
      });
    }

    function processCardTemplate(item) {
      const active = item.id === state.selectedId ? ' is-active' : '';
      return `
        <button class="process-card${active}" type="button" data-process-id="${item.id}">
          <div class="process-top">
            <div>
              <div class="process-code">Expediente PC01-${item.id}</div>
              <div class="process-career">${escapeHtml(displayText(item.career))}</div>
            </div>
            ${statusBadge(item.status)}
          </div>
          <div class="process-meta">
            <span>${escapeHtml(item.period?.nombre_periodo || 'Sin periodo')}</span>
            <span>${formatDate(item.raw.fecha_inicio)}</span>
            <span>${item.registeredSteps}/12 fases registradas</span>
          </div>
          <div class="progress-wrap">
            <div class="progress-track"><div class="progress-bar" style="width:${item.progress}%"></div></div>
          </div>
          <div class="process-reason">${escapeHtml(displayText(item.raw.motivo_revision || 'Sin motivo registrado'))}</div>
        </button>
      `;
    }

    function renderDetail() {
      const item = state.processes.find((process) => process.id === state.selectedId);
      const container = document.getElementById('detailContent');

      if (!item) {
        container.innerHTML = emptyTemplate('Selecciona un expediente para ver el detalle.');
        return;
      }

      container.innerHTML = `
        <div class="hero fade-in">
          <div class="hero-row">
            <div>
              <h2>${escapeHtml(displayText(item.career))}</h2>
              <p class="reason">${escapeHtml(displayText(item.raw.motivo_revision || 'Sin motivo registrado.'))}</p>
              <div class="admin-actions">
                <button class="mini-button" type="button" data-admin-action="edit-process" data-id="${item.id}">Editar expediente</button>
                <button class="mini-button danger" type="button" data-admin-action="delete-process" data-id="${item.id}">Eliminar expediente</button>
                <button class="mini-button primary" type="button" data-admin-action="add-history" data-process-id="${item.id}">Agregar fase</button>
                <button class="mini-button" type="button" data-admin-action="add-evidence">Agregar evidencia</button>
              </div>
            </div>
            ${statusBadge(item.status)}
          </div>
          <div class="summary-grid">
            ${summaryItem('Periodo', item.period?.nombre_periodo || 'Sin periodo')}
            ${summaryItem('Plan evaluado', planLabel(item.evaluatedPlan))}
            ${summaryItem('Plan nuevo', planLabel(item.newPlan))}
            ${summaryItem('Última fase', item.latest ? `Paso ${item.latest.step?.numero_paso || item.latest.id_paso}: ${displayText(item.latest.estado_fase)}` : 'Sin historial')}
          </div>
          <div class="progress-wrap">
            <div class="progress-label">
              <span>Avance del proceso PC01</span>
              <span>${item.registeredSteps} de 12 fases registradas - ${item.progress}%</span>
            </div>
            <div class="progress-track"><div class="progress-bar" style="width:${item.progress}%"></div></div>
          </div>
        </div>
        ${publicStatusTemplate(item)}
        <div class="tabs">
          ${detailTabButton('timeline', 'Trazabilidad')}
          ${detailTabButton('plans', 'Planes y cursos')}
          ${detailTabButton('feedback', 'Feedback')}
          ${detailTabButton('evidence', 'Evidencias')}
        </div>
        <div id="detailTabContent" class="tab-panel is-active fade-in">${detailTabContent(item)}</div>
      `;

      document.querySelectorAll('[data-detail-tab]').forEach((button) => {
        button.addEventListener('click', () => {
          state.activeDetailTab = button.dataset.detailTab;
          renderDetail();
        });
      });

      document.querySelectorAll('[data-timeline-step]').forEach((button) => {
        button.addEventListener('click', () => {
          state.selectedTimelineStep[item.id] = Number(button.dataset.timelineStep);
          renderDetail();
        });
      });

      bindAdminActionButtons();
    }

    function detailTabButton(id, label) {
      const active = state.activeDetailTab === id ? ' is-active' : '';
      return `<button class="tab-btn${active}" type="button" data-detail-tab="${id}">${label}</button>`;
    }

    function detailTabContent(item) {
      if (state.activeDetailTab === 'plans') return plansTemplate(item);
      if (state.activeDetailTab === 'feedback') return feedbackTemplate(item);
      if (state.activeDetailTab === 'evidence') return evidenceTemplate(item.evidence);
      return timelineTemplate(item);
    }

    function publicStatusTemplate(item) {
      const latestActor = item.latest?.actor;
      const nextStep = nextExpectedStep(item);

      return `
        <section class="public-status" aria-label="Estado para el usuario">
          <div>
            <div class="section-eyebrow">Estado para el usuario</div>
            <h3>${escapeHtml(publicStatusMessage(item))}</h3>
            <p>${escapeHtml(displayText(item.raw.motivo_revision || 'No se registró motivo de revisión.'))}</p>
          </div>
          <div class="public-status-grid">
            ${summaryItem('Estado actual', displayText(item.status))}
            ${summaryItem('Último paso', item.latest ? `Paso ${item.latest.step?.numero_paso || item.latest.id_paso}: ${displayText(item.latest.estado_fase)}` : 'Sin historial')}
            ${summaryItem('Responsable', latestActor ? `${latestActor.siglas} - ${latestActor.nombre_dependencia}` : 'Sin responsable registrado')}
            ${summaryItem('Próximo paso esperado', nextStep ? `Paso ${nextStep.numero_paso}: ${displayText(nextStep.descripcion_paso)}` : 'Proceso culminado o sin siguiente paso')}
          </div>
        </section>
      `;
    }

    function publicStatusMessage(item) {
      const status = normalizeText(item.status);
      if (status.includes('finalizado')) return 'El proceso curricular se encuentra culminado.';
      if (status.includes('observado')) return 'El proceso requiere corrección o revisión antes de continuar.';
      return 'El proceso curricular se encuentra en evaluación.';
    }

    function nextExpectedStep(item) {
      if (normalizeText(item.status).includes('finalizado')) return null;
      const latestNumber = item.latest?.step?.numero_paso || 0;
      return state.data.steps
        .slice()
        .sort((a, b) => a.numero_paso - b.numero_paso)
        .find((step) => step.numero_paso > latestNumber) || null;
    }

    function timelineSummaryTemplate(item) {
      const pending = Math.max(0, item.fullTimeline.length - item.registeredSteps);
      const latestActor = item.latest?.actor;
      return `
        <div class="timeline-summary">
          ${summaryItem('Fases registradas', `${item.registeredSteps} de ${item.fullTimeline.length}`)}
          ${summaryItem('Fases pendientes', pending)}
          ${summaryItem('Último responsable', latestActor ? `${latestActor.siglas} - ${latestActor.nombre_dependencia}` : 'Sin responsable')}
          ${summaryItem('Última fecha', item.latest ? formatDate(item.latest.fecha_ejecucion) : 'Sin fecha')}
        </div>
      `;
    }

    function legendItem(status, description) {
      return `
        <div class="legend-item">
          ${statusBadge(status)}
          <span>${escapeHtml(description)}</span>
        </div>
      `;
    }

    function buildFullTimeline(steps, history) {
      const historyByStep = groupBy(history, 'id_paso');

      return steps
        .slice()
        .sort((a, b) => a.numero_paso - b.numero_paso)
        .map((step) => {
          const entries = (historyByStep.get(step.id_paso) || [])
            .slice()
            .sort((a, b) => new Date(b.fecha_ejecucion) - new Date(a.fecha_ejecucion));

          return {
            step,
            entry: entries[0] || null,
            extraEntries: entries.slice(1)
          };
        });
    }

    function timelineTemplate(item) {
      const selectedStep = state.selectedTimelineStep[item.id] || getDefaultTimelineStep(item);
      const selected = item.fullTimeline.find(({ step }) => step.id_paso === selectedStep) || item.fullTimeline[0];

      return `
        <div class="timeline-compact">
          ${timelineSummaryTemplate(item)}
          <div class="timeline-stepper" aria-label="Pasos del proceso PC01">
            ${item.fullTimeline.map(({ step, entry }) => `
              <button class="step-chip${step.id_paso === selected.step.id_paso ? ' is-active' : ''}${entry ? ' is-registered' : ' is-missing'}" type="button" data-timeline-step="${step.id_paso}" title="${escapeHtml(displayText(step.descripcion_paso || ''))}">
                <span>${step.numero_paso}</span>
                <small>${entry ? entry.estado_fase : 'Sin registro'}</small>
              </button>
            `).join('')}
          </div>
          <article class="timeline-item timeline-focus${selected.entry ? '' : ' is-missing'}">
            ${timelineEntryTemplate(item, selected.step, selected.entry, selected.extraEntries)}
          </article>
          <div class="state-legend">
            ${legendItem('Finalizado', 'Proceso culminado')}
            ${legendItem('En curso', 'Proceso en evaluación')}
            ${legendItem('Observado', 'Requiere corrección o revisión')}
            ${legendItem('Sin registro', 'Paso aún no documentado')}
          </div>
        </div>
      `;
    }

    function timelineEntryTemplate(item, step, entry, extraEntries) {
      return `
              <div class="step-number">${step.numero_paso}</div>
              <div>
                <h3 class="timeline-title">${escapeHtml(displayText(step.descripcion_paso || 'Paso sin descripción'))}</h3>
                <div class="timeline-meta">
                  <span>${statusBadge(entry?.estado_fase || 'Sin registro')}</span>
                  <span>${entry ? formatDate(entry.fecha_ejecucion) : 'Fecha pendiente'}</span>
                  <span>${entry ? `${escapeHtml(entry.actor?.siglas || 'Actor')} - ${escapeHtml(entry.actor?.nombre_dependencia || 'Sin dependencia')}` : 'Sin actor registrado'}</span>
                  <span>${entry ? entry.evidence.length : 0} evidencia(s)</span>
                </div>
                <div class="timeline-note">${escapeHtml(displayText(entry?.observaciones_revision || 'Este paso aún no tiene registro en historial_fase para este expediente.'))}</div>
                ${entry?.evidence?.length ? `<div class="timeline-meta">${entry.evidence.map((doc) => `<span>${escapeHtml(displayText(doc.tipo_documento))} - ${escapeHtml(doc.ruta_archivo_pdf)}</span>`).join('')}</div>` : ''}
                ${extraEntries.length ? `<div class="timeline-meta"><span>${extraEntries.length} registro(s) adicional(es) en este paso</span></div>` : ''}
                <div class="admin-actions">
                  ${entry
                    ? `<button class="mini-button" type="button" data-admin-action="edit-history" data-id="${entry.id_historial}">Editar fase</button>
                       <button class="mini-button danger" type="button" data-admin-action="delete-history" data-id="${entry.id_historial}">Eliminar fase</button>`
                    : `<button class="mini-button primary" type="button" data-admin-action="add-history" data-process-id="${item.id}" data-step-id="${step.id_paso}">Registrar fase</button>`}
                </div>
              </div>
      `;
    }

    function getDefaultTimelineStep(item) {
      if (!item?.fullTimeline?.length) return null;
      const latestStepId = item.latest?.id_paso;
      if (latestStepId) return latestStepId;
      return item.fullTimeline[0].step.id_paso;
    }

    function plansTemplate(item) {
      const planRows = [
        ['Evaluado', item.evaluatedPlan],
        ['Nuevo', item.newPlan]
      ].map(([type, plan]) => ({
        tipo: type,
        version: plan?.anio_version || '-',
        carrera: displayText(plan?.nombre_carrera || '-'),
        creditos: plan?.total_creditos_requeridos || '-',
        estado: displayText(plan?.estado || '-')
      }));

      const courses = item.courses
        .slice()
        .sort((a, b) => (a.id_plan - b.id_plan) || (a.id_ciclo - b.id_ciclo) || a.nombre.localeCompare(b.nombre, 'es'));

      return `
        <div class="section-grid">
          <div class="info-card">
            <div class="info-card-header">Comparación de planes</div>
            <div class="info-card-body">${simpleTable(planRows, ['tipo', 'version', 'carrera', 'creditos', 'estado'])}</div>
          </div>
          <div class="info-card">
            <div class="info-card-header">Lectura rápida</div>
            <div class="info-card-body">
              <div class="summary-grid">
                ${summaryItem('Cursos visibles', courses.length)}
                ${summaryItem('Créditos en cursos', sum(courses.map((course) => course.creditos)))}
                ${summaryItem('Modalidades', unique(courses.map((course) => course.modalidad)).join(', ') || '-')}
                ${summaryItem('Áreas', unique(courses.map((course) => areaName(course.id_area))).length)}
              </div>
            </div>
          </div>
        </div>
        <div style="height:14px"></div>
        ${courses.length ? `<div class="course-grid">${courses.map(courseCardTemplate).join('')}</div>` : emptyTemplate('No hay cursos asociados a estos planes.')}
      `;
    }

    function courseCardTemplate(course) {
      const plan = state.data.plans.find((item) => item.id_plan === course.id_plan);
      const cycle = state.data.cycles.find((item) => item.id_ciclo === course.id_ciclo);
      return `
        <article class="course-card">
          <div class="course-code">${escapeHtml(course.codigo_curso)} - Plan ${escapeHtml(plan?.anio_version || course.id_plan)}</div>
          <div class="course-name">${escapeHtml(displayText(course.nombre))}</div>
          <div class="course-meta">
            <span>${escapeHtml(cycle?.denominacion || `Ciclo ${course.id_ciclo}`)}</span>
            <span>${escapeHtml(areaName(course.id_area))}</span>
            <span>${course.creditos} créditos</span>
            <span>${escapeHtml(course.modalidad)}</span>
          </div>
          <div class="admin-actions">
            <button class="mini-button" type="button" data-admin-action="edit-course" data-id="${course.id_curso}">Editar curso</button>
            <button class="mini-button danger" type="button" data-admin-action="delete-course" data-id="${course.id_curso}">Eliminar curso</button>
          </div>
        </article>
      `;
    }

    function feedbackTemplate(item) {
      if (!item.answers.length) return emptyTemplate('No hay respuestas de encuesta vinculadas a estos planes.');

      const questions = mapBy(state.data.questions, 'id_pregunta');
      const populations = mapBy(state.data.populations, 'id_poblacion');
      const grouped = groupBy(item.answers, (answer) => questions.get(answer.id_pregunta)?.categoria || 'Sin categoría');
      const scoreCards = Array.from(grouped.entries()).map(([category, answers]) => {
        const avg = average(answers.map((answer) => Number(answer.valor_respuesta)));
        return `
          <article class="score-card">
            <div class="mini muted">${escapeHtml(category)}</div>
            <div class="score-value">${avg.toFixed(1)}</div>
            <div class="score-bar"><div class="score-fill" style="width:${Math.min(100, avg * 20)}%"></div></div>
            <div class="mini muted">${participantCount(answers)} participante(s), ${answers.length} valoración(es)</div>
          </article>
        `;
      }).join('');

      const comments = item.answers
        .slice()
        .sort((a, b) => new Date(b.fecha_respuesta) - new Date(a.fecha_respuesta))
        .map((answer) => {
          const question = questions.get(answer.id_pregunta);
          const population = populations.get(answer.id_poblacion);
          return `
            <article class="comment-item">
              <div class="timeline-meta">
                <span>${escapeHtml(displayText(population?.tipo_poblacion || 'Población'))}</span>
                <span>${escapeHtml(displayText(question?.categoria || 'Categoría'))}</span>
                <span>Puntaje ${answer.valor_respuesta}/5</span>
                <span>${formatDate(answer.fecha_respuesta)}</span>
              </div>
              <div class="timeline-note">${escapeHtml(answer.comentario || 'Sin comentario.')}</div>
              <div class="mini muted">${escapeHtml(displayText(question?.texto_pregunta || ''))}</div>
            </article>
          `;
        }).join('');

      return `
        <div class="feedback-grid">${scoreCards}</div>
        <div class="comment-list">${comments}</div>
      `;
    }

    function evidenceTemplate(evidence) {
      if (!evidence.length) return emptyTemplate('Este expediente no tiene evidencias documentales asociadas.');

      return `
        <div class="evidence-list">
          ${evidence.map((doc) => {
            const history = state.data.history.find((item) => item.id_historial === doc.id_historial);
            const step = state.data.steps.find((item) => item.id_paso === history?.id_paso);
            return `
              <article class="evidence-item">
                <h3 class="evidence-title">${escapeHtml(doc.tipo_documento)}</h3>
                <div class="timeline-meta">
                  <span>${formatDate(doc.fecha_carga)}</span>
                  <span>${step ? `Paso ${step.numero_paso}: ${displayText(step.descripcion_paso)}` : 'Paso no identificado'}</span>
                </div>
                <div class="timeline-note">Ruta documental: ${escapeHtml(doc.ruta_archivo_pdf)}</div>
                <div class="admin-actions">
                  <button class="mini-button" type="button" data-admin-action="edit-evidence" data-id="${doc.id_evidencia}">Editar evidencia</button>
                  <button class="mini-button danger" type="button" data-admin-action="delete-evidence" data-id="${doc.id_evidencia}">Eliminar evidencia</button>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      `;
    }

    function renderSupport() {
      const supports = supportDefinitions();

      document.getElementById('supportTabs').innerHTML = supports.map(([id, label]) => {
        const active = state.activeSupport === id ? ' is-active' : '';
        return `<button class="tab-btn${active}" type="button" data-support-tab="${id}">${label}</button>`;
      }).join('');

      const active = supports.find(([id]) => id === state.activeSupport) || supports[0];
      document.getElementById('supportContent').innerHTML = adminToolbarForSupport(active[0]) + renderSupportContent(active[0], active[2]());

      document.querySelectorAll('[data-support-tab]').forEach((button) => {
        button.addEventListener('click', () => {
          state.activeSupport = button.dataset.supportTab;
          state.supportPages[state.activeSupport] = 1;
          renderSupport();
        });
      });

      bindSupportControls();
      bindAdminActionButtons();
    }

    function supportDefinitions() {
      return [
        ['plans', 'Planes', supportPlans],
        ['courses', 'Cursos', supportCourses],
        ['answers', 'Feedback', supportAnswers],
        ['questions', 'Preguntas de encuesta', supportSurveyQuestions],
        ['evidence', 'Evidencias', supportEvidence],
        ['prerequisites', 'Prerrequisitos', supportPrerequisites],
        ['catalogs', 'Catálogos', supportCatalogs]
      ];
    }

    function activeSupportPayload() {
      const active = supportDefinitions().find(([id]) => id === state.activeSupport) || supportDefinitions()[0];
      const payload = active[2]();
      return typeof payload === 'string' ? null : [active[0], payload];
    }

    function renderSupportContent(tableKey, payload) {
      if (typeof payload === 'string') return payload;

      const filteredRows = filteredSupportRows(tableKey, payload);
      const pageSize = state.supportPageSize;
      const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
      const currentPage = Math.min(state.supportPages[tableKey] || 1, totalPages);
      state.supportPages[tableKey] = currentPage;
      const start = (currentPage - 1) * pageSize;
      const pagedRows = filteredRows.slice(start, start + pageSize);

      return `
        ${payload.summary || ''}
        <div class="support-tools">
          <div class="field">
            <label for="supportSearch">Filtrar consulta</label>
            <input id="supportSearch" type="search" value="${escapeHtml(state.supportFilters[tableKey] || '')}" placeholder="Buscar en ${escapeHtml(payload.label.toLowerCase())}">
          </div>
          ${supportSelectFiltersTemplate(tableKey, payload)}
          <div class="field">
            <label for="supportPageSize">Filas</label>
            <select id="supportPageSize">
              ${[5, 10, 20, 50].map((size) => `<option value="${size}" ${size === pageSize ? 'selected' : ''}>${size}</option>`).join('')}
            </select>
          </div>
          <button id="supportClearFilter" class="mini-button" type="button">Limpiar</button>
          ${payload.exportable ? '<button id="supportExportCsv" class="mini-button" type="button">Exportar CSV</button>' : ''}
        </div>
        <div id="supportResults">${supportResultsTemplate(tableKey, payload)}</div>
      `;
    }

    function supportResultsTemplate(tableKey, payload) {
      const filteredRows = filteredSupportRows(tableKey, payload);
      const pageSize = state.supportPageSize;
      const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
      const currentPage = Math.min(state.supportPages[tableKey] || 1, totalPages);
      state.supportPages[tableKey] = currentPage;
      const start = (currentPage - 1) * pageSize;
      const pagedRows = filteredRows.slice(start, start + pageSize);

      return `
        ${editableTable(pagedRows, payload.columns, payload.tableKey, filteredRows.length)}
        <div class="pagination">
          <button class="mini-button" type="button" data-support-page="prev" ${currentPage <= 1 ? 'disabled' : ''}>Anterior</button>
          <span class="pagination-note">Página ${currentPage} de ${totalPages} - ${filteredRows.length} registros</span>
          <button class="mini-button" type="button" data-support-page="next" ${currentPage >= totalPages ? 'disabled' : ''}>Siguiente</button>
        </div>
      `;
    }

    function renderSupportResultsOnly() {
      const active = activeSupportPayload();
      if (!active) return;
      const [tableKey, payload] = active;
      document.getElementById('supportResults').innerHTML = supportResultsTemplate(tableKey, payload);
      bindSupportPagination();
      bindAdminActionButtons();
    }

    function bindSupportControls() {
      const search = document.getElementById('supportSearch');
      if (search) {
        search.addEventListener('input', () => {
          state.supportFilters[state.activeSupport] = search.value;
          state.supportPages[state.activeSupport] = 1;
          renderSupportResultsOnly();
        });
      }

      const pageSize = document.getElementById('supportPageSize');
      if (pageSize) {
        pageSize.addEventListener('change', () => {
          state.supportPageSize = Number(pageSize.value);
          state.supportPages[state.activeSupport] = 1;
          renderSupport();
        });
      }

      const clear = document.getElementById('supportClearFilter');
      if (clear) {
        clear.addEventListener('click', () => {
          state.supportFilters[state.activeSupport] = '';
          state.supportSelectFilters[state.activeSupport] = {};
          state.supportPages[state.activeSupport] = 1;
          renderSupport();
        });
      }

      document.querySelectorAll('[data-support-filter]').forEach((select) => {
        select.addEventListener('change', () => {
          if (!state.supportSelectFilters[state.activeSupport]) {
            state.supportSelectFilters[state.activeSupport] = {};
          }
          state.supportSelectFilters[state.activeSupport][select.dataset.supportFilter] = select.value;
          state.supportPages[state.activeSupport] = 1;
          renderSupportResultsOnly();
        });
      });

      const exportCsv = document.getElementById('supportExportCsv');
      if (exportCsv) {
        exportCsv.addEventListener('click', exportActiveSupportCsv);
      }

      bindSupportPagination();
    }

    function bindSupportPagination() {
      document.querySelectorAll('[data-support-page]').forEach((button) => {
        button.addEventListener('click', () => {
          const direction = button.dataset.supportPage === 'next' ? 1 : -1;
          state.supportPages[state.activeSupport] = Math.max(1, (state.supportPages[state.activeSupport] || 1) + direction);
          renderSupportResultsOnly();
        });
      });
    }

    function filterSupportRows(rows, query) {
      const normalized = normalizeText(query);
      if (!normalized) return rows;
      return rows.filter((row) => normalizeText(Object.entries(row)
        .filter(([key]) => key !== '_record')
        .map(([, value]) => value)
        .join(' ')).includes(normalized));
    }

    function filteredSupportRows(tableKey, payload) {
      const query = state.supportFilters[tableKey] || '';
      const selected = state.supportSelectFilters[tableKey] || {};
      return filterSupportRows(payload.rows, query).filter((row) => {
        if (!payload.filters?.length) return true;
        return payload.filters.every((filter) => {
          const value = selected[filter.key];
          return !value || String(row[filter.key]) === String(value);
        });
      });
    }

    function exportActiveSupportCsv() {
      const active = activeSupportPayload();
      if (!active) return;

      const [tableKey, payload] = active;
      const rows = filteredSupportRows(tableKey, payload);
      const csv = [
        payload.columns.join(','),
        ...rows.map((row) => payload.columns.map((column) => csvCell(row[column])).join(','))
      ].join('\n');
      const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tableKey}-${todayISO()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }

    function csvCell(value) {
      const text = displayText(value ?? '');
      return `"${String(text).replaceAll('"', '""')}"`;
    }

    function renderAdminHome() {
      const container = document.getElementById('adminHomeContent');
      if (!container) return;

      if (!state.isAdmin) {
        container.innerHTML = `
          <div class="admin-home-body">
            <div class="admin-login-note">
              Para modificar datos inicia sesión como administrador. En modo invitado la plataforma queda como consulta pública, sin botones de crear, editar ni eliminar.
            </div>
            <button id="adminModuleLogin" class="btn" type="button">Ingresar como admin</button>
          </div>
        `;
        document.getElementById('adminModuleLogin').addEventListener('click', openLoginModal);
        return;
      }

      const actionGroups = [
        {
          title: 'Proceso PC01',
          note: 'Expedientes, fases y evidencias del proceso curricular.',
          actions: [
            ['processes', 'Nuevo expediente', 'Registra un proceso curricular PC01.'],
            ['history', 'Nueva fase', 'Agrega un paso ejecutado dentro de la trazabilidad.'],
            ['evidence', 'Nueva evidencia', 'Vincula un documento a una fase registrada.']
          ]
        }
      ];
      const surveyUrl = new URL('encuesta.html', window.location.href).href;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(surveyUrl)}`;
      const diagnostics = adminDiagnostics();
      const pending = adminPendingItems();

      container.innerHTML = `
        <div class="admin-home-body">
          <div class="admin-insight-grid">
            ${diagnostics.map(adminStatTemplate).join('')}
          </div>

          <div class="admin-dashboard-grid">
            <section class="admin-section-card admin-section-main">
              <div class="admin-section-header">
                <div>
                  <h3><span class="ui-icon" aria-hidden="true">📝</span>Encuesta y participantes</h3>
                  <p>Control del formulario público y de la información que alimenta el tablero.</p>
                </div>
              </div>
              <div class="survey-qr-card">
                <img src="${qrUrl}" alt="QR para formulario de encuesta">
                <div>
                  <strong>Formulario público de encuesta</strong>
                  <p>Comparte este QR para que estudiantes, egresados o docentes registren feedback. Sus respuestas alimentan el tablero, el semáforo y las preguntas críticas.</p>
                  <div class="admin-button-row">
                    <a class="mini-button" href="./encuesta.html" target="_blank" rel="noopener">Abrir formulario</a>
                    <button class="mini-button" type="button" data-admin-action="add-survey-question">Agregar pregunta</button>
                    <button class="mini-button" type="button" data-admin-support="answers">Ver feedback</button>
                  </div>
                </div>
              </div>
            </section>

            <section class="admin-section-card">
              <div class="admin-section-header">
                <div>
                  <h3><span class="ui-icon" aria-hidden="true">⚠️</span>Pendientes administrativos</h3>
                  <p>Elementos que conviene revisar antes de presentar o tomar decisiones.</p>
                </div>
              </div>
              <div class="admin-pending-list">
                ${pending.length ? pending.map(adminPendingTemplate).join('') : emptyTemplate('No hay pendientes administrativos detectados.')}
              </div>
            </section>
          </div>

          <div class="admin-maintenance-grid admin-maintenance-grid-single">
            ${actionGroups.map((group) => `
              <section class="admin-section-card">
                <div class="admin-section-header">
                  <div>
                    <h3><span class="ui-icon" aria-hidden="true">${adminGroupIcon(group.title)}</span>${escapeHtml(group.title)}</h3>
                    <p>${escapeHtml(group.note)}</p>
                  </div>
                </div>
                <div class="admin-action-grid">
                  ${group.actions.map(([tableKey, title, text]) => `
                    <article class="admin-action-card">
                      <div>
                        <strong>${escapeHtml(title)}</strong>
                        <p>${escapeHtml(text)}</p>
                      </div>
                      <button class="mini-button" type="button" data-admin-action="add-record" data-table-key="${tableKey}">Crear</button>
                    </article>
                  `).join('')}
                </div>
              </section>
            `).join('')}
          </div>

          <div class="admin-login-note">
            Para planes, cursos y prerrequisitos usa Consultas. Esta pestaña queda como centro rápido para operar encuestas, expedientes, fases y evidencias.
          </div>
        </div>
      `;
      bindAdminActionButtons();
      bindAdminSupportShortcuts();
      bindDrilldownCards(container);
    }

    function adminDiagnostics() {
      const currentProcesses = currentDashboardProcesses();
      const participants = state.data.participants || [];
      return [
        {
          label: 'Participantes',
          value: participants.length,
          note: `${state.data.answers.length} valoración(es) de preguntas`
        },
        {
          label: 'Preguntas',
          value: state.data.questions.length,
          note: `${state.data.questionLinks.length} asignación(es) por carrera y grupo`
        },
        {
          label: 'Sin evidencia',
          value: currentProcesses.filter((item) => !normalizeText(item.status).includes('finalizado') && item.evidence.length === 0).length,
          note: 'Expedientes vigentes o activos sin respaldo'
        }
      ];
    }

    function adminGroupIcon(title) {
      const text = normalizeText(title);
      if (text.includes('modelo')) return '🧩';
      if (text.includes('proceso')) return '📁';
      return '⚙️';
    }

    function adminUnassignedQuestions() {
      const assignedIds = new Set((state.data.questionLinks || []).map((link) => Number(link.id_pregunta)));
      return (state.data.questions || []).filter((question) => !assignedIds.has(Number(question.id_pregunta)));
    }

    function adminPendingItems() {
      const evidence = missingEvidenceItems().slice(0, 2);
      const lowSample = lowSampleItems().slice(0, 1);
      return [...evidence, ...lowSample].slice(0, 5);
    }

    function adminStatTemplate(item) {
      return `
        <article class="admin-stat-card">
          <span><span class="ui-icon" aria-hidden="true">${adminStatIcon(item.label)}</span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
          <p>${escapeHtml(item.note)}</p>
        </article>
      `;
    }

    function adminStatIcon(label) {
      const text = normalizeText(label);
      if (text.includes('participante')) return '👥';
      if (text.includes('pregunta')) return '📝';
      if (text.includes('asignacion')) return '🔗';
      if (text.includes('evidencia')) return '📄';
      return '📌';
    }

    function adminPendingTemplate(item) {
      return `
        <article class="priority-item ${escapeHtml(item.className || 'priority-warning')}">
          <span><span class="ui-icon" aria-hidden="true">${priorityItemIcon(item)}</span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.detail)}</p>
          <em>${escapeHtml(item.meta)}</em>
        </article>
      `;
    }

    function bindAdminSupportShortcuts() {
      document.querySelectorAll('[data-admin-support]').forEach((button) => {
        button.addEventListener('click', () => {
          if (button.dataset.adminSupport === 'answers') {
            state.activeModule = 'feedback';
            renderActiveModule();
            renderFeedbackSections();
            return;
          }
          state.activeModule = 'model';
          state.activeSupport = button.dataset.adminSupport;
          renderSupport();
          renderActiveModule();
        });
      });
    }

    function adminToolbarForSupport(activeSupport) {
      const actionBySupport = {
        plans: ['plans', 'Agregar plan'],
        courses: ['courses', 'Agregar curso'],
        questions: ['survey-question', 'Agregar pregunta'],
        prerequisites: ['prerequisites', 'Agregar prerrequisito'],
        evidence: ['evidence', 'Agregar evidencia']
      };
      const action = actionBySupport[activeSupport];
      if (!action) return '<div class="admin-toolbar"><span class="mini muted">Consulta sin creación manual desde administración</span></div>';

      return `
        <div class="admin-toolbar">
          <button class="mini-button" type="button" data-admin-action="${action[0] === 'survey-question' ? 'add-survey-question' : 'add-record'}" ${action[0] === 'survey-question' ? '' : `data-table-key="${action[0]}"`}>${action[1]}</button>
        </div>
      `;
    }

    function supportPlans() {
      const rows = state.data.plans.map((plan) => ({
        id: plan.id_plan,
        version: plan.anio_version,
        carrera: displayText(plan.nombre_carrera),
        creditos: plan.total_creditos_requeridos,
        estado: displayText(plan.estado),
        _record: plan
      }));
      return { label: 'Planes', rows, columns: ['id', 'version', 'carrera', 'creditos', 'estado'], tableKey: 'plans' };
    }

    function supportCourses() {
      const rows = state.data.courses.map((course) => ({
        codigo: course.codigo_curso,
        curso: course.nombre,
        plan: planLabel(state.data.plans.find((plan) => plan.id_plan === course.id_plan)),
        area: areaName(course.id_area),
        ciclo: state.data.cycles.find((cycle) => cycle.id_ciclo === course.id_ciclo)?.denominacion || course.id_ciclo,
        creditos: course.creditos,
        modalidad: course.modalidad,
        _record: course
      }));
      return { label: 'Cursos', rows, columns: ['codigo', 'curso', 'plan', 'area', 'ciclo', 'creditos', 'modalidad'], tableKey: 'courses' };
    }

    function supportAnswers() {
      const questions = mapBy(state.data.questions, 'id_pregunta');
      const populations = mapBy(state.data.populations, 'id_poblacion');
      const plans = mapBy(state.data.plans, 'id_plan');
      const summary = feedbackSummaryTemplate(state.data.answers, questions, populations, plans);
      const rows = state.data.answers.map((answer) => ({
        fecha: formatDate(answer.fecha_respuesta),
        correo: answer.correo_participante || '-',
        plan: planLabel(plans.get(answer.id_plan)),
        poblacion: displayText(populations.get(answer.id_poblacion)?.tipo_poblacion || '-'),
        categoria: displayText(questions.get(answer.id_pregunta)?.categoria || '-'),
        puntaje: `${answer.valor_respuesta}/5`,
        estado: feedbackStatus(Number(answer.valor_respuesta)).label,
        comentario: answer.comentario,
        _record: answer
      }));
      return { label: 'Feedback', rows, columns: ['fecha', 'correo', 'plan', 'poblacion', 'categoria', 'puntaje', 'estado', 'comentario'], tableKey: 'answers', summary, exportable: true };
    }

    function supportSurveyQuestions() {
      const questions = mapBy(state.data.questions, 'id_pregunta');
      const careers = mapBy(state.data.careers || [], 'id_carrera');
      const populations = mapBy(state.data.populations, 'id_poblacion');
      const rows = (state.data.questionLinks || []).map((link) => {
        const question = questions.get(link.id_pregunta);
        const career = careers.get(link.id_carrera);
        const population = populations.get(link.id_poblacion);
        return {
          carrera: displayText(career?.nombre_carrera || `Carrera ${link.id_carrera}`),
          poblacion: displayText(population?.tipo_poblacion || `Población ${link.id_poblacion}`),
          categoria: displayText(question?.categoria || '-'),
          pregunta: displayText(question?.texto_pregunta || `Pregunta ${link.id_pregunta}`),
          id_carrera: link.id_carrera,
          id_poblacion: link.id_poblacion,
          _record: {
            id_pregunta: link.id_pregunta,
            id_carrera: link.id_carrera,
            id_poblacion: link.id_poblacion,
            categoria: question?.categoria || '',
            texto_pregunta: question?.texto_pregunta || ''
          }
        };
      }).sort((a, b) => a.carrera.localeCompare(b.carrera, 'es') || a.poblacion.localeCompare(b.poblacion, 'es') || a.categoria.localeCompare(b.categoria, 'es'));

      return {
        label: 'Preguntas de encuesta',
        rows,
        columns: ['carrera', 'poblacion', 'categoria', 'pregunta'],
        tableKey: 'questionLinks',
        filters: [
          {
            key: 'id_carrera',
            label: 'Carrera',
            options: unique(rows.map((row) => row.id_carrera)).map((id) => ({
              value: id,
              label: rows.find((row) => Number(row.id_carrera) === Number(id))?.carrera || `Carrera ${id}`
            }))
          },
          {
            key: 'id_poblacion',
            label: 'Grupo de interés',
            options: unique(rows.map((row) => row.id_poblacion)).map((id) => ({
              value: id,
              label: rows.find((row) => Number(row.id_poblacion) === Number(id))?.poblacion || `Población ${id}`
            }))
          }
        ]
      };
    }

    function feedbackSummaryTemplate(answers, questions, populations, plans) {
      if (!answers.length) return '';

      const uniqueParticipants = participantCount(answers);
      const overall = average(answers.map((answer) => Number(answer.valor_respuesta)));
      const comments = answers.filter((answer) => String(answer.comentario || '').trim()).length;
      const criticalCount = answers.filter((answer) => Number(answer.valor_respuesta) < 3).length;
      const byPlan = Array.from(groupBy(answers, 'id_plan').entries())
        .map(([planId, planAnswers]) => ({
          label: planLabel(plans.get(Number(planId))),
          avg: average(planAnswers.map((answer) => Number(answer.valor_respuesta))),
          count: planAnswers.length,
          participants: unique(planAnswers.map(participantKey)).length
        }))
        .sort((a, b) => a.avg - b.avg)
        .slice(0, 3);
      const byCareerPopulation = Array.from(groupBy(answers, (answer) => [
        planLabel(plans.get(answer.id_plan)),
        populations.get(answer.id_poblacion)?.tipo_poblacion || 'Sin población'
      ].join('||')).entries())
        .map(([key, groupAnswers]) => {
          const [career, population] = key.split('||');
          return {
            career,
            population: displayText(population),
            avg: average(groupAnswers.map((answer) => Number(answer.valor_respuesta))),
            count: groupAnswers.length,
            participants: unique(groupAnswers.map(participantKey)).length
          };
        })
        .sort((a, b) => a.career.localeCompare(b.career, 'es') || a.population.localeCompare(b.population, 'es'));
      const byPopulation = Array.from(groupBy(answers, (answer) => populations.get(answer.id_poblacion)?.tipo_poblacion || 'Sin población').entries())
        .map(([population, populationAnswers]) => ({
          label: displayText(population),
          avg: average(populationAnswers.map((answer) => Number(answer.valor_respuesta))),
          count: populationAnswers.length,
          participants: unique(populationAnswers.map(participantKey)).length
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'es'));
      const byCategory = Array.from(groupBy(answers, (answer) => questions.get(answer.id_pregunta)?.categoria || 'Sin categoría').entries())
        .map(([category, categoryAnswers]) => ({
          label: displayText(category),
          avg: average(categoryAnswers.map((answer) => Number(answer.valor_respuesta))),
          count: categoryAnswers.length
        }))
        .sort((a, b) => a.avg - b.avg)
        .slice(0, 4);
      const lowQuestions = Array.from(groupBy(answers, (answer) => [
        answer.id_plan,
        answer.id_poblacion,
        answer.id_pregunta
      ].join('|')).entries())
        .map(([key, questionAnswers]) => {
          const [idPlan, idPopulation, idQuestion] = key.split('|').map(Number);
          const question = questions.get(idQuestion);
          return {
            label: displayText(question?.texto_pregunta || `Pregunta ${idQuestion}`),
            meta: `${planLabel(plans.get(idPlan))} - ${displayText(populations.get(idPopulation)?.tipo_poblacion || 'Población')} - ${displayText(question?.categoria || 'Sin categoría')}`,
            avg: average(questionAnswers.map((answer) => Number(answer.valor_respuesta))),
            count: questionAnswers.length
          };
        })
        .sort((a, b) => a.avg - b.avg)
        .slice(0, 5);
      const highlightedComments = answers
        .filter((answer) => String(answer.comentario || '').trim())
        .slice()
        .sort((a, b) => Number(a.valor_respuesta) - Number(b.valor_respuesta) || new Date(b.fecha_respuesta) - new Date(a.fecha_respuesta))
        .slice(0, 5);

      const metricCards = [
        ['📊', 'Promedio general', overall ? overall.toFixed(1) : '0.0', feedbackStatus(overall).label],
        ['👥', 'Participantes únicos', uniqueParticipants, 'Por correo, carrera y grupo'],
        ['🚩', 'Puntajes críticos', criticalCount, 'Valoraciones menores a 3'],
        ['💬', 'Comentarios', comments, 'Aclaraciones opcionales']
      ].map(([icon, label, value, note]) => `
        <article class="score-card">
          <div class="mini muted score-label"><span class="ui-icon" aria-hidden="true">${icon}</span>${escapeHtml(label)}</div>
          <div class="score-value">${escapeHtml(value)}</div>
          <div class="mini muted">${escapeHtml(note)}</div>
        </article>
      `).join('');

      const list = (title, items) => `
        <article class="feedback-summary-list">
          <h3>${escapeHtml(title)}</h3>
          ${items.map((item) => `
            <div class="feedback-summary-row">
              <span>${escapeHtml(item.label)}</span>
              <strong class="${feedbackStatus(item.avg).className}">${item.avg.toFixed(1)}</strong>
              <small>${item.participants ? `${item.participants} participante(s) - ` : ''}${item.count} valoración(es)</small>
            </div>
          `).join('')}
        </article>
      `;
      const matrix = `
        <article class="feedback-summary-list feedback-summary-wide">
          <h3>Resultados por carrera y grupo de interés</h3>
          <div class="feedback-matrix">
            ${byCareerPopulation.map((item) => `
              <div class="feedback-matrix-row">
                <span>${escapeHtml(item.career)}</span>
                <small>${escapeHtml(item.population)}</small>
                <strong class="${feedbackStatus(item.avg).className}">${item.avg.toFixed(1)}</strong>
                <em>${item.participants} participante(s) - ${item.count} valoración(es)</em>
              </div>
            `).join('')}
          </div>
        </article>
      `;
      const questionRanking = `
        <article class="feedback-summary-list feedback-summary-wide">
          <h3>Preguntas con menor promedio</h3>
          ${lowQuestions.map((item) => `
            <div class="feedback-summary-row feedback-question-row">
              <span>${escapeHtml(item.label)}</span>
              <strong class="${feedbackStatus(item.avg).className}">${item.avg.toFixed(1)}</strong>
              <small>${escapeHtml(item.meta)} - ${item.count} valoración(es)</small>
            </div>
          `).join('')}
        </article>
      `;
      const commentsList = highlightedComments.length ? `
        <article class="feedback-summary-list feedback-summary-wide">
          <h3>Comentarios que explican puntajes bajos</h3>
          ${highlightedComments.map((answer) => {
            const question = questions.get(answer.id_pregunta);
            return `
              <div class="feedback-comment-row">
                <strong class="${feedbackStatus(Number(answer.valor_respuesta)).className}">${answer.valor_respuesta}/5</strong>
                <span>${escapeHtml(answer.comentario)}</span>
                <small>${escapeHtml(planLabel(plans.get(answer.id_plan)))} - ${escapeHtml(displayText(populations.get(answer.id_poblacion)?.tipo_poblacion || 'Población'))} - ${escapeHtml(displayText(question?.categoria || 'Sin categoría'))}</small>
              </div>
            `;
          }).join('')}
        </article>
      ` : '';

      return `
        <section class="feedback-summary">
          <div class="feedback-grid">${metricCards}</div>
          <div class="feedback-summary-columns">
            ${list('Carreras que requieren más atención', byPlan)}
            ${list('Promedio por grupo de interés', byPopulation)}
            ${list('Categorías con menor puntaje', byCategory)}
          </div>
          ${matrix}
          ${questionRanking}
          ${commentsList}
        </section>
      `;
    }

    function supportSelectFiltersTemplate(tableKey, payload) {
      if (!payload.filters?.length) return '';
      const values = state.supportSelectFilters[tableKey] || {};
      return payload.filters.map((filter) => `
        <div class="field">
          <label for="supportFilter_${escapeHtml(filter.key)}">${escapeHtml(filter.label)}</label>
          <select id="supportFilter_${escapeHtml(filter.key)}" data-support-filter="${escapeHtml(filter.key)}">
            <option value="">Todos</option>
            ${filter.options.map((option) => `<option value="${escapeHtml(option.value)}" ${String(values[filter.key] || '') === String(option.value) ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
          </select>
        </div>
      `).join('');
    }

    function feedbackStatus(value) {
      if (!Number.isFinite(value) || value <= 0) return { label: 'Sin datos', className: 'feedback-status-muted' };
      if (value < 3) return { label: 'Crítico', className: 'feedback-status-critical' };
      if (value < 3.8) return { label: 'Revisar', className: 'feedback-status-warning' };
      return { label: 'Adecuado', className: 'feedback-status-ok' };
    }

    function supportPrerequisites() {
      const courses = mapBy(state.data.courses, 'id_curso');
      const rows = state.data.prerequisites.map((item) => ({
        curso: displayText(courses.get(item.id_curso_objetivo)?.nombre || item.id_curso_objetivo),
        requisito: displayText(courses.get(item.id_curso_previo)?.nombre || item.id_curso_previo),
        regla: item.comentarios_regla,
        _record: item
      }));
      return { label: 'Prerrequisitos', rows, columns: ['curso', 'requisito', 'regla'], tableKey: 'prerequisites' };
    }

    function supportEvidence() {
      const history = mapBy(state.data.history, 'id_historial');
      const steps = mapBy(state.data.steps, 'id_paso');
      const rows = state.data.evidence.map((doc) => {
        const entry = history.get(doc.id_historial);
        const step = steps.get(entry?.id_paso);
        return {
          documento: doc.tipo_documento,
          expediente: entry ? `PC01-${entry.id_proceso}` : '-',
          paso: step ? `${step.numero_paso}. ${displayText(step.descripcion_paso)}` : '-',
          ruta: doc.ruta_archivo_pdf,
          carga: formatDate(doc.fecha_carga),
          _record: doc
        };
      });
      return { label: 'Evidencias', rows, columns: ['documento', 'expediente', 'paso', 'ruta', 'carga'], tableKey: 'evidence' };
    }

    function supportCatalogs() {
      return `
        <div class="section-grid">
          <div class="info-card"><div class="info-card-header">Actores</div><div class="info-card-body">${simpleTable(state.data.actors, ['siglas', 'nombre_dependencia'])}</div></div>
          <div class="info-card"><div class="info-card-header">Áreas académicas</div><div class="info-card-body">${simpleTable(state.data.areas, ['nombre_area', 'color_hexadecimal'])}</div></div>
          <div class="info-card"><div class="info-card-header">Ciclos académicos</div><div class="info-card-body">${simpleTable(state.data.cycles, ['numero_ciclo', 'denominacion'])}</div></div>
          <div class="info-card"><div class="info-card-header">Periodos</div><div class="info-card-body">${simpleTable(state.data.periods, ['nombre_periodo', 'fecha_inicio', 'fecha_fin', 'estado'])}</div></div>
          <div class="info-card"><div class="info-card-header">Pasos PC01</div><div class="info-card-body">${simpleTable(state.data.steps, ['numero_paso', 'descripcion_paso'])}</div></div>
          <div class="info-card"><div class="info-card-header">Poblaciones objetivo</div><div class="info-card-body">${simpleTable(state.data.populations, ['tipo_poblacion'])}</div></div>
        </div>
      `;
    }

    function summaryItem(label, value) {
      return `
        <div class="summary-item">
          <div class="summary-label">${escapeHtml(label)}</div>
          <div class="summary-value">${escapeHtml(displayText(String(value ?? '-')))}</div>
        </div>
      `;
    }

    function simpleTable(rows, columns) {
      if (!rows.length) return emptyTemplate('Sin registros para mostrar.');

      return `
        <div class="table-wrap">
          <table>
            <thead><tr>${columns.map((column) => `<th>${escapeHtml(labelize(column))}</th>`).join('')}</tr></thead>
            <tbody>
              ${rows.map((row) => `
                <tr>${columns.map((column) => `<td>${escapeHtml(displayText(row[column] ?? '-'))}</td>`).join('')}</tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    function editableTable(rows, columns, tableKey) {
      if (!rows.length) return emptyTemplate('Sin registros para mostrar.');
      const config = EDIT_CONFIG[tableKey];
      const customActions = tableKey === 'questionLinks';
      const hasActions = Boolean((config && tableKey !== 'answers') || customActions);

      return `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                ${columns.map((column) => `<th>${escapeHtml(labelize(column))}</th>`).join('')}
                ${hasActions ? '<th class="admin-only">Acciones</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${rows.map((row) => {
                const recordId = config ? encodeRecordId(config, row._record) : '';
                const questionRecordId = customActions ? surveyQuestionRecordId(row._record) : '';
                return `
                  <tr>
                    ${columns.map((column) => `<td>${escapeHtml(displayText(row[column] ?? '-'))}</td>`).join('')}
                    ${customActions ? `
                      <td class="action-cell admin-only">
                        <button class="mini-button" type="button" data-admin-action="edit-survey-question" data-record-id="${escapeHtml(questionRecordId)}">Editar</button>
                        <button class="mini-button danger" type="button" data-admin-action="remove-survey-question" data-record-id="${escapeHtml(questionRecordId)}">Quitar</button>
                      </td>
                    ` : config && tableKey !== 'answers' ? `
                      <td class="action-cell admin-only">
                        <button class="mini-button" type="button" data-admin-action="edit-record" data-table-key="${tableKey}" data-record-id="${escapeHtml(recordId)}">Editar</button>
                        <button class="mini-button danger" type="button" data-admin-action="delete-record" data-table-key="${tableKey}" data-record-id="${escapeHtml(recordId)}">Eliminar</button>
                      </td>
                    ` : ''}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    function updateSessionUI() {
      document.getElementById('sessionBadge').textContent = state.isAdmin
        ? `Admin - ${state.user.email}`
        : 'Invitado - Solo lectura';
      document.getElementById('loginButton').classList.toggle('is-hidden', state.isAdmin);
      document.getElementById('logoutButton').classList.toggle('is-hidden', !state.isAdmin);
      document.body.classList.toggle('admin-mode', state.isAdmin);
    }

    function openLoginModal() {
      openModal('Acceso administrador', 'Ingresa con la cuenta creada en Supabase Auth.', `
        <form id="loginForm">
          <div class="form-grid">
            <div class="field wide">
              <label for="adminEmail">Correo</label>
              <input id="adminEmail" name="email" type="email" autocomplete="username" required>
            </div>
            <div class="field wide">
              <label for="adminPassword">Clave</label>
              <input id="adminPassword" name="password" type="password" autocomplete="current-password" required>
            </div>
          </div>
          <div class="form-actions">
            <button class="mini-button" type="button" data-close-modal>Cancelar</button>
            <button class="btn" type="submit">Entrar</button>
          </div>
        </form>
      `);

      document.getElementById('loginForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const { error } = await state.client.auth.signInWithPassword({
          email: form.get('email'),
          password: form.get('password')
        });
        if (error) {
          showConnectionMessage(`No se pudo iniciar sesión: ${error.message}`);
          return;
        }
        closeModal();
      });
    }

    async function signOut() {
      await state.client.auth.signOut();
      state.user = null;
      state.isAdmin = false;
      updateSessionUI();
      render();
    }

    function bindAdminActionButtons() {
      document.querySelectorAll('[data-admin-action]').forEach((button) => {
        button.addEventListener('click', handleAdminAction);
      });
    }

    function handleAdminAction(event) {
      if (!state.isAdmin) return;
      const button = event.currentTarget;
      const action = button.dataset.adminAction;
      const selected = state.processes.find((item) => item.id === state.selectedId);

      if (action === 'edit-process') openRecordForm('processes', findRecord('processes', Number(button.dataset.id)));
      if (action === 'delete-process') confirmDelete('processes', findRecord('processes', Number(button.dataset.id)));
      if (action === 'add-history') openRecordForm('history', {
        id_proceso: Number(button.dataset.processId || selected?.id),
        id_paso: button.dataset.stepId ? Number(button.dataset.stepId) : '',
        fecha_ejecucion: todayISO(),
        estado_fase: 'Aprobado'
      });
      if (action === 'edit-history') openRecordForm('history', findRecord('history', Number(button.dataset.id)));
      if (action === 'delete-history') confirmDelete('history', findRecord('history', Number(button.dataset.id)));
      if (action === 'add-evidence') openRecordForm('evidence', {
        id_proceso: selected?.id || '',
        fecha_carga: dateTimeLocalValue(new Date())
      });
      if (action === 'edit-evidence') openRecordForm('evidence', findRecord('evidence', Number(button.dataset.id)));
      if (action === 'delete-evidence') confirmDelete('evidence', findRecord('evidence', Number(button.dataset.id)));
      if (action === 'edit-course') openRecordForm('courses', findRecord('courses', Number(button.dataset.id)));
      if (action === 'delete-course') confirmDeleteCourse(findRecord('courses', Number(button.dataset.id)));
      if (action === 'add-record') openRecordForm(button.dataset.tableKey, defaultRecord(button.dataset.tableKey));
      if (action === 'edit-record') openRecordForm(button.dataset.tableKey, findRecordByEncodedId(button.dataset.tableKey, button.dataset.recordId));
      if (action === 'delete-record') confirmDelete(button.dataset.tableKey, findRecordByEncodedId(button.dataset.tableKey, button.dataset.recordId));
      if (action === 'add-survey-question') openSurveyQuestionForm();
      if (action === 'edit-survey-question') openSurveyQuestionForm(findSurveyQuestionRecord(button.dataset.recordId));
      if (action === 'remove-survey-question') removeSurveyQuestionLink(findSurveyQuestionRecord(button.dataset.recordId));
    }

    function openSurveyQuestionForm(record = {}) {
      const isEdit = Boolean(record.id_pregunta && record.id_carrera && record.id_poblacion);
      const body = `
        <form id="surveyQuestionForm">
          <div class="form-grid">
            <div class="field">
              <label for="id_carrera">Carrera</label>
              <select id="id_carrera" name="id_carrera" required>
                <option value="">Seleccionar</option>
                ${(state.data.careers || []).map((career) => `<option value="${escapeHtml(career.id_carrera)}" ${String(career.id_carrera) === String(record.id_carrera || '') ? 'selected' : ''}>${escapeHtml(displayText(career.nombre_carrera))}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label for="id_poblacion">Grupo de interés</label>
              <select id="id_poblacion" name="id_poblacion" required>
                <option value="">Seleccionar</option>
                ${state.data.populations.map((population) => `<option value="${escapeHtml(population.id_poblacion)}" ${String(population.id_poblacion) === String(record.id_poblacion || '') ? 'selected' : ''}>${escapeHtml(displayText(population.tipo_poblacion))}</option>`).join('')}
              </select>
            </div>
            <div class="field wide">
              <label>Categoría</label>
              <div class="category-picker">
                <div id="categorySuggestions" class="category-suggestions" role="group" aria-label="Categorías sugeridas"></div>
                <button id="newCategoryButton" class="mini-button" type="button">Nueva categoría</button>
              </div>
              <input id="categoria" name="categoria" type="hidden" value="${escapeHtml(record.categoria || '')}" required>
              <input id="categoria_custom" class="is-hidden" type="text" value="${escapeHtml(record.categoria || '')}" placeholder="Escribe la nueva categoría">
            </div>
            <div class="field wide">
              <label for="texto_pregunta">Pregunta</label>
              <textarea id="texto_pregunta" name="texto_pregunta" required>${escapeHtml(record.texto_pregunta || '')}</textarea>
            </div>
          </div>
          <div class="form-actions">
            <button class="mini-button" type="button" data-close-modal>Cancelar</button>
            <button class="btn" type="submit">${isEdit ? 'Guardar cambios' : 'Agregar pregunta'}</button>
          </div>
        </form>
      `;

      openModal(isEdit ? 'Editar pregunta de encuesta' : 'Agregar pregunta de encuesta', 'Los cambios se guardan en pregunta_encuesta y pregunta_carrera_poblacion.', body);
      bindSurveyQuestionCategoryControls(record);
      document.getElementById('surveyQuestionForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        await saveSurveyQuestion(record, new FormData(event.currentTarget));
      });
    }

    function bindSurveyQuestionCategoryControls(record = {}) {
      const career = document.getElementById('id_carrera');
      const population = document.getElementById('id_poblacion');
      const suggestions = document.getElementById('categorySuggestions');
      const input = document.getElementById('categoria');
      const customInput = document.getElementById('categoria_custom');
      const button = document.getElementById('newCategoryButton');

      const refresh = () => {
        const current = input.value || record.categoria || '';
        const categories = suggestedCategories(Number(career.value), Number(population.value));
        const hasCurrent = categories.some((category) => normalizeText(category) === normalizeText(current));

        suggestions.innerHTML = categories.length
          ? categories.map((category) => `
              <button class="category-chip${normalizeText(category) === normalizeText(current) ? ' is-selected' : ''}" type="button" data-category="${escapeHtml(category)}">
                ${escapeHtml(category)}
              </button>
            `).join('')
          : '<span class="mini muted">No hay categorías sugeridas para esta selección.</span>';

        if (current && !hasCurrent) {
          showCustomCategory(true);
        } else {
          showCustomCategory(false);
          input.value = current && hasCurrent ? current : categories[0] || '';
          markSelectedCategory(input.value);
        }
      };

      const showCustomCategory = (custom) => {
        suggestions.classList.toggle('is-hidden', custom);
        customInput.classList.toggle('is-hidden', !custom);
        customInput.required = custom;
        button.textContent = custom ? 'Usar categoría existente' : 'Nueva categoría';
        if (custom) {
          customInput.value = input.value;
          customInput.focus();
        } else {
          input.value = suggestions.querySelector('.category-chip.is-selected')?.dataset.category
            || suggestions.querySelector('.category-chip')?.dataset.category
            || '';
          markSelectedCategory(input.value);
        }
      };

      const markSelectedCategory = (value) => {
        suggestions.querySelectorAll('.category-chip').forEach((chip) => {
          chip.classList.toggle('is-selected', normalizeText(chip.dataset.category) === normalizeText(value));
        });
      };

      career.addEventListener('change', refresh);
      population.addEventListener('change', refresh);
      suggestions.addEventListener('click', (event) => {
        const chip = event.target.closest('[data-category]');
        if (!chip) return;
        input.value = chip.dataset.category;
        markSelectedCategory(input.value);
      });
      customInput.addEventListener('input', () => {
        input.value = customInput.value;
      });
      button.addEventListener('click', () => {
        const custom = customInput.classList.contains('is-hidden');
        showCustomCategory(custom);
      });

      refresh();
    }

    function suggestedCategories(idCarrera, idPoblacion) {
      const questions = mapBy(state.data.questions, 'id_pregunta');
      const links = state.data.questionLinks || [];
      const scoped = links
        .filter((link) => Number(link.id_carrera) === idCarrera && Number(link.id_poblacion) === idPoblacion)
        .map((link) => questions.get(link.id_pregunta)?.categoria);
      const careerWide = links
        .filter((link) => Number(link.id_carrera) === idCarrera)
        .map((link) => questions.get(link.id_pregunta)?.categoria);
      const categoryCareers = new Map();
      links.forEach((link) => {
        const category = questions.get(link.id_pregunta)?.categoria;
        if (!category) return;
        const key = normalizeText(category);
        if (!categoryCareers.has(key)) {
          categoryCareers.set(key, { label: displayText(category), careers: new Set() });
        }
        categoryCareers.get(key).careers.add(Number(link.id_carrera));
      });
      const careerCount = unique((state.data.careers || []).map((career) => career.id_carrera)).length;
      const shared = [...categoryCareers.values()]
        .filter((item) => careerCount > 0 && item.careers.size >= careerCount)
        .map((item) => item.label);

      return unique([...scoped, ...careerWide, ...shared].map(displayText));
    }

    async function saveSurveyQuestion(original, formData) {
      const category = String(formData.get('categoria') || formData.get('categoria_sugerida') || '').trim();
      const payload = {
        categoria: category,
        texto_pregunta: String(formData.get('texto_pregunta') || '').trim()
      };
      const idCarrera = Number(formData.get('id_carrera'));
      const idPoblacion = Number(formData.get('id_poblacion'));
      const isEdit = Boolean(original.id_pregunta && original.id_carrera && original.id_poblacion);

      if (!payload.categoria || !payload.texto_pregunta || !idCarrera || !idPoblacion) {
        showConnectionMessage('Completa carrera, grupo, categoría y pregunta.');
        return;
      }

      let idPregunta = original.id_pregunta;
      const questionQuery = state.client.from(TABLES.questions);
      const questionResult = isEdit
        ? await questionQuery.update(payload).eq('id_pregunta', original.id_pregunta)
        : await questionQuery.insert(payload).select('id_pregunta').single();

      if (questionResult.error) {
        showConnectionMessage(`No se pudo guardar la pregunta: ${questionResult.error.message}`);
        return;
      }

      if (!isEdit) idPregunta = questionResult.data.id_pregunta;

      if (isEdit && (Number(original.id_carrera) !== idCarrera || Number(original.id_poblacion) !== idPoblacion)) {
        const { error: deleteError } = await state.client
          .from(TABLES.questionLinks)
          .delete()
          .eq('id_pregunta', original.id_pregunta)
          .eq('id_carrera', original.id_carrera)
          .eq('id_poblacion', original.id_poblacion);

        if (deleteError) {
          showConnectionMessage(`No se pudo actualizar la asociación: ${deleteError.message}`);
          return;
        }
      }

      const { error: linkError } = await state.client
        .from(TABLES.questionLinks)
        .upsert({
          id_pregunta: idPregunta,
          id_carrera: idCarrera,
          id_poblacion: idPoblacion
        });

      if (linkError) {
        showConnectionMessage(`No se pudo asociar la pregunta: ${linkError.message}`);
        return;
      }

      closeModal();
      await refreshData();
      state.activeSupport = 'questions';
      showConnectionMessage('Pregunta guardada correctamente en Supabase.');
      setTimeout(hideConnectionMessage, 2400);
    }

    async function removeSurveyQuestionLink(record) {
      if (!record) return;
      const accepted = window.confirm('Quitar esta pregunta de la carrera y grupo seleccionados? Las respuestas historicas no se eliminan.');
      if (!accepted) return;

      const { error } = await state.client
        .from(TABLES.questionLinks)
        .delete()
        .eq('id_pregunta', record.id_pregunta)
        .eq('id_carrera', record.id_carrera)
        .eq('id_poblacion', record.id_poblacion);

      if (error) {
        showConnectionMessage(`No se pudo quitar la pregunta: ${error.message}`);
        return;
      }

      await refreshData();
      state.activeSupport = 'questions';
      showConnectionMessage('Pregunta retirada de la encuesta. Las respuestas anteriores se conservan.');
      setTimeout(hideConnectionMessage, 2400);
    }

    function openRecordForm(tableKey, record = {}) {
      const config = EDIT_CONFIG[tableKey];
      const isEdit = Boolean(record && hasPrimaryKey(config, record));
      const title = `${isEdit ? 'Editar' : 'Crear'} ${config.label}`;
      const body = `
        <form id="recordForm">
          <div class="form-grid">
            ${config.fields.map((field) => fieldTemplate(field, record)).join('')}
          </div>
          <div class="form-actions">
            <button class="mini-button" type="button" data-close-modal>Cancelar</button>
            <button class="btn" type="submit">${isEdit ? 'Guardar cambios' : 'Crear registro'}</button>
          </div>
        </form>
      `;

      openModal(title, 'Los cambios se guardan directamente en Supabase.', body);
      document.getElementById('recordForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        await saveRecord(tableKey, record, new FormData(event.currentTarget));
      });
    }

    function fieldTemplate(field, record) {
      const value = record?.[field.name] ?? '';
      const wide = field.type === 'textarea' || field.name.includes('comentario') || field.name.includes('motivo') || field.name === 'id_historial' ? ' wide' : '';
      const required = field.required === false ? '' : ' required';

      if (field.type === 'textarea') {
        return `
          <div class="field${wide}">
            <label for="${field.name}">${escapeHtml(field.label)}</label>
            <textarea id="${field.name}" name="${field.name}"${required}>${escapeHtml(value)}</textarea>
          </div>
        `;
      }

      if (field.type === 'select' || field.type === 'select-static') {
        const options = field.type === 'select-static'
          ? field.options.map((option) => ({ value: option, label: option }))
          : (state.data[field.source] || [])
            .filter((item) => !field.filter || field.filter(item, record))
            .map((item) => ({ value: item[field.value], label: field.text(item) }));
        return `
          <div class="field${wide}">
            <label for="${field.name}">${escapeHtml(field.label)}</label>
            <select id="${field.name}" name="${field.name}"${required}>
              <option value="">Seleccionar</option>
              ${options.map((option) => `<option value="${escapeHtml(option.value)}" ${String(option.value) === String(value) ? 'selected' : ''}>${escapeHtml(displayText(option.label))}</option>`).join('')}
            </select>
          </div>
        `;
      }

      return `
        <div class="field${wide}">
          <label for="${field.name}">${escapeHtml(field.label)}</label>
          <input id="${field.name}" name="${field.name}" type="${field.type || 'text'}" value="${escapeHtml(inputValue(field, value))}"${field.min ? ` min="${field.min}"` : ''}${field.max ? ` max="${field.max}"` : ''}${required}>
        </div>
      `;
    }

    // [EXPO_CONSULTAS_INSERT_UPDATE] Motor de guardado. Equivale a sentencias "INSERT" o "UPDATE" usando Query Builder.
    async function saveRecord(tableKey, original, formData) {
      const config = EDIT_CONFIG[tableKey];
      const payload = {};

      config.fields.forEach((field) => {
        const raw = formData.get(field.name);
        payload[field.name] = castFieldValue(field, raw);
      });

      const isEdit = hasPrimaryKey(config, original);
      const query = state.client.from(config.table);
      const { error } = isEdit
        ? await applyPrimaryKeyFilter(query.update(payload), config, original)
        : await query.insert(payload);

      if (error) {
        showConnectionMessage(`No se pudo guardar: ${error.message}`);
        return;
      }

      closeModal();
      await refreshData();
      showConnectionMessage('Cambio guardado correctamente en Supabase.');
      setTimeout(hideConnectionMessage, 2400);
    }

    async function confirmDelete(tableKey, record) {
      if (!record) return;
      if (tableKey === 'courses') {
        await confirmDeleteCourse(record);
        return;
      }
      const config = EDIT_CONFIG[tableKey];
      const label = recordLabel(tableKey, record);
      const accepted = window.confirm(`Eliminar ${config.label}: ${label}?`);
      if (!accepted) return;

      const { error } = await applyPrimaryKeyFilter(state.client.from(config.table).delete(), config, record);
      if (error) {
        showConnectionMessage(`No se pudo eliminar: ${error.message}`);
        return;
      }

      await refreshData();
      showConnectionMessage('Registro eliminado correctamente.');
      setTimeout(hideConnectionMessage, 2400);
    }

    async function confirmDeleteCourse(course) {
      if (!course) return;
      const relations = coursePrerequisiteRelations(course.id_curso);
      const body = `
        <div class="delete-relations-list">
          <h3>${relations.length ? 'Relaciones de prerrequisito asociadas' : 'Sin prerrequisitos asociados'}</h3>
          ${relations.length
            ? `<ol>${relations.map((relation) => `<li>${escapeHtml(relation.label)}</li>`).join('')}</ol>`
            : '<p class="delete-note">Este curso no tiene relaciones de prerrequisito registradas.</p>'}
          <p class="delete-note">
            ${relations.length
              ? 'Si continúas, se eliminarán solo estas relaciones y luego el curso. No se borrará ningún otro curso.'
              : 'Si continúas, se eliminará únicamente este curso.'}
          </p>
        </div>
        <div class="form-actions">
          <button class="mini-button" type="button" data-close-modal>Cancelar</button>
          <button class="btn" type="button" id="confirmCourseDeleteButton">Eliminar curso</button>
        </div>
      `;

      openModal('Eliminar curso', courseOptionLabel(course), body);
      document.getElementById('confirmCourseDeleteButton').addEventListener('click', async () => {
        const deleted = await deleteCourseWithPrerequisites(course.id_curso);
        if (!deleted) return;

        closeModal();
        await refreshData();
        showConnectionMessage(relations.length
          ? `Curso eliminado. También se quitaron ${relations.length} relación(es) de prerrequisito asociadas.`
          : 'Curso eliminado correctamente.');
        setTimeout(hideConnectionMessage, 3000);
      });
    }
    function coursePrerequisiteRelations(courseId) {
      const courses = mapBy(state.data.courses || [], 'id_curso');
      const targetId = Number(courseId);
      return (state.data.prerequisites || [])
        .filter((relation) => Number(relation.id_curso_objetivo) === targetId || Number(relation.id_curso_previo) === targetId)
        .map((relation) => {
          const objective = courses.get(relation.id_curso_objetivo);
          const previous = courses.get(relation.id_curso_previo);
          const objectiveLabel = objective ? courseOptionLabel(objective) : `Curso ${relation.id_curso_objetivo}`;
          const previousLabel = previous ? courseOptionLabel(previous) : `Curso ${relation.id_curso_previo}`;
          const role = Number(relation.id_curso_objetivo) === targetId
            ? 'Este curso requiere'
            : 'Este curso habilita';
          return {
            ...relation,
            label: Number(relation.id_curso_objetivo) === targetId
              ? `${role}: ${previousLabel}`
              : `${role}: ${objectiveLabel}`
          };
        });
    }

    async function deleteCourseWithPrerequisites(courseId) {
      const targetId = Number(courseId);

      const { error: relationError } = await state.client
        .from(TABLES.prerequisites)
        .delete()
        .or(`id_curso_objetivo.eq.${targetId},id_curso_previo.eq.${targetId}`);
      if (relationError) {
        showConnectionMessage(`No se pudieron eliminar las relaciones de prerrequisito asociadas: ${relationError.message}`);
        return false;
      }

      const { error: courseError } = await state.client
        .from(TABLES.courses)
        .delete()
        .eq('id_curso', targetId);
      if (courseError) {
        showConnectionMessage(`No se pudo eliminar el curso: ${courseError.message}`);
        return false;
      }

      return true;
    }

    function openModal(title, subtitle, body) {
      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalSubtitle').textContent = subtitle || '';
      document.getElementById('modalBody').innerHTML = body;
      document.getElementById('modalOverlay').classList.add('is-open');
      document.body.classList.add('modal-open');
      document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModal));
    }

    function closeModal() {
      document.getElementById('modalOverlay').classList.remove('is-open');
      document.body.classList.remove('modal-open');
    }

    function applyPrimaryKeyFilter(query, config, record) {
      const keys = Array.isArray(config.pk) ? config.pk : [config.pk];
      return keys.reduce((current, key) => current.eq(key, record[key]), query);
    }

    function hasPrimaryKey(config, record) {
      if (!record) return false;
      const keys = Array.isArray(config.pk) ? config.pk : [config.pk];
      return keys.every((key) => record[key] !== undefined && record[key] !== null && record[key] !== '');
    }

    function encodeRecordId(config, record) {
      const keys = Array.isArray(config.pk) ? config.pk : [config.pk];
      return keys.map((key) => `${key}:${record[key]}`).join('|');
    }

    function surveyQuestionRecordId(record) {
      return [
        `id_pregunta:${record.id_pregunta}`,
        `id_carrera:${record.id_carrera}`,
        `id_poblacion:${record.id_poblacion}`
      ].join('|');
    }

    function findSurveyQuestionRecord(encodedId) {
      const keys = Object.fromEntries(String(encodedId).split('|').map((part) => part.split(':')));
      const link = (state.data.questionLinks || []).find((record) =>
        String(record.id_pregunta) === String(keys.id_pregunta)
        && String(record.id_carrera) === String(keys.id_carrera)
        && String(record.id_poblacion) === String(keys.id_poblacion));
      if (!link) return null;

      const question = state.data.questions.find((item) => Number(item.id_pregunta) === Number(link.id_pregunta));
      return {
        ...link,
        categoria: question?.categoria || '',
        texto_pregunta: question?.texto_pregunta || ''
      };
    }

    function findRecordByEncodedId(tableKey, encodedId) {
      const config = EDIT_CONFIG[tableKey];
      const keys = Object.fromEntries(String(encodedId).split('|').map((part) => part.split(':')));
      return (state.data[tableKey] || []).find((record) => {
        const pk = Array.isArray(config.pk) ? config.pk : [config.pk];
        return pk.every((key) => String(record[key]) === String(keys[key]));
      });
    }

    function findRecord(tableKey, id) {
      const config = EDIT_CONFIG[tableKey];
      if (Array.isArray(config.pk)) return null;
      return (state.data[tableKey] || []).find((record) => Number(record[config.pk]) === Number(id));
    }

    function defaultRecord(tableKey) {
      if (tableKey === 'history') return { fecha_ejecucion: todayISO(), estado_fase: 'Aprobado', id_proceso: state.selectedId || '' };
      if (tableKey === 'evidence') return { fecha_carga: dateTimeLocalValue(new Date()) };
      if (tableKey === 'answers') return { fecha_respuesta: dateTimeLocalValue(new Date()), valor_respuesta: 3 };
      if (tableKey === 'courses') return { creditos: 4, modalidad: 'Presencial' };
      return {};
    }

    function castFieldValue(field, raw) {
      if (raw === '') return null;
      if (field.type === 'number' || field.name.startsWith('id_') || field.name === 'valor_respuesta') return Number(raw);
      if (field.type === 'datetime-local') return new Date(raw).toISOString();
      return raw;
    }

    function inputValue(field, value) {
      if (!value) return '';
      if (field.type === 'datetime-local') return dateTimeLocalValue(value);
      return value;
    }

    function todayISO() {
      return new Date().toISOString().slice(0, 10);
    }

    function dateTimeLocalValue(value) {
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      const offset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    }

    function processOptionLabel(item) {
      const plan = state.data.plans.find((planItem) => planItem.id_plan === item.id_plan_nuevo || planItem.id_plan === item.id_plan_evaluado);
      return `PC01-${item.id_proceso} - ${displayText(plan?.nombre_carrera || 'Sin carrera')}`;
    }

    function historyOptionLabel(item) {
      const step = state.data.steps.find((stepItem) => stepItem.id_paso === item.id_paso);
      const process = state.processes.find((processItem) => Number(processItem.id) === Number(item.id_proceso));
      const actor = state.data.actors.find((actorItem) => Number(actorItem.id_actor) === Number(item.id_actor));
      const processLabel = process ? `PC01-${process.id} - ${displayText(process.career)}` : `PC01-${item.id_proceso}`;
      const stepLabel = `Paso ${step?.numero_paso || item.id_paso}`;
      const status = displayText(item.estado_fase || 'Sin estado');
      const actorLabel = actor?.siglas ? ` ? ${displayText(actor.siglas)}` : '';
      return `${processLabel} - ${stepLabel} - ${status}${actorLabel}`;
    }

    function courseOptionLabel(item) {
      return `${item.codigo_curso} - ${displayText(item.nombre)}`;
    }

    function recordLabel(tableKey, record) {
      if (tableKey === 'processes') return `PC01-${record.id_proceso}`;
      if (tableKey === 'history') return `Historial ${record.id_historial}`;
      if (tableKey === 'evidence') return record.tipo_documento || `Evidencia ${record.id_evidencia}`;
      if (tableKey === 'plans') return planLabel(record);
      if (tableKey === 'courses') return courseOptionLabel(record);
      if (tableKey === 'answers') return `Respuesta ${record.id_respuesta}`;
      if (tableKey === 'prerequisites') return `${record.id_curso_previo} -> ${record.id_curso_objetivo}`;
      return 'registro';
    }

    function statusBadge(status) {
      return `<span class="badge ${statusClass(status)}">${escapeHtml(displayText(status || 'Sin estado'))}</span>`;
    }

    function planLabel(plan) {
      if (!plan) return 'Sin plan';
      return `${displayText(plan.nombre_carrera)} ${plan.anio_version} - ${plan.total_creditos_requeridos} créd. - ${displayText(plan.estado)}`;
    }

    function participantLabel(participant) {
      if (!participant) return 'Sin participante';
      return `${displayText(participant.correo_institucional)} - ${planLabel(state.data.plans.find((plan) => plan.id_plan === participant.id_plan))}`;
    }

    function participantKey(answer) {
      return [
        answer.id_participante || answer.correo_participante || answer.correo_institucional || `respuesta-${answer.id_respuesta}`,
        answer.id_plan,
        answer.id_poblacion
      ].join('|');
    }

    function participantCount(answers) {
      return unique((answers || []).map(participantKey)).length;
    }

    function areaName(id) {
      const area = state.data.areas.find((item) => item.id_area === id)?.nombre_area;
      return area ? displayText(area) : `Área ${id}`;
    }

    function statusClass(value) {
      const status = normalizeText(value).replace(/\s+/g, '-');
      if (status.includes('finalizado')) return 'status-finalizado';
      if (status.includes('aprobado')) return 'status-aprobado';
      if (status.includes('observado')) return 'status-observado';
      if (status.includes('rechazado')) return 'status-rechazado';
      if (status.includes('curso')) return 'status-en-curso';
      if (status.includes('pendiente')) return 'status-pendiente';
      if (status.includes('revision')) return 'status-revision';
      if (status.includes('sin-registro')) return 'status-missing';
      return 'status-default';
    }

    function isObserved(value) {
      const status = normalizeText(value);
      return status.includes('observado') || status.includes('rechazado');
    }

    function mapBy(records, key) {
      return new Map(records.map((record) => [record[key], record]));
    }

    function groupBy(records, keyOrGetter) {
      const getter = typeof keyOrGetter === 'function' ? keyOrGetter : (record) => record[keyOrGetter];
      return records.reduce((map, record) => {
        const key = getter(record);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(record);
        return map;
      }, new Map());
    }

    function unique(values) {
      return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'es'));
    }

    function average(values) {
      const valid = values.map(Number).filter((value) => Number.isFinite(value));
      return valid.length ? valid.reduce((total, value) => total + value, 0) / valid.length : 0;
    }

    function sum(values) {
      return values.map(Number).filter(Number.isFinite).reduce((total, value) => total + value, 0);
    }

    function normalizeText(value) {
      return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function labelize(value) {
      const labels = {
        anio_version: 'año versión',
        total_creditos_requeridos: 'créditos requeridos',
        creditos: 'créditos',
        version: 'versión',
        area: 'Área',
        categoria: 'categoría',
        codigo: 'código',
        nombre_area: 'Área académica',
        numero_ciclo: 'número de ciclo',
        fecha_inicio: 'fecha de inicio',
        fecha_fin: 'fecha de fin',
        descripcion_paso: 'descripción del paso',
        tipo_poblacion: 'tipo de población',
        texto_pregunta: 'texto de pregunta',
        poblacion: 'población'
      };
      return labels[value] || String(value).replace(/_/g, ' ');
    }


    /* ================================================================
       MALLA CURRICULAR — Fase 1
       ================================================================ */

    const MALLA_DESIGN_STEP = 3;

    function renderMalla() {
      populateMallaProcessSelector();
      const planId = state.mallaPlanId;
      const container = document.getElementById('mallaContainer');
      const empty = document.getElementById('mallaEmpty');
      const legend = document.getElementById('mallaLegend');
      const toolbar = document.getElementById('mallaToolbar');
      const banner = document.getElementById('mallaReadonlyBanner');

      if (!planId) {
        container.style.display = 'none';
        empty.classList.remove('is-hidden');
        legend.classList.add('is-hidden');
        toolbar.classList.remove('is-editable');
        banner.classList.add('is-hidden');
        return;
      }

      empty.classList.add('is-hidden');
      container.style.display = '';

      if (state.mallaEditable) {
        toolbar.classList.add('is-editable');
        banner.classList.add('is-hidden');
      } else {
        toolbar.classList.remove('is-editable');
        banner.classList.remove('is-hidden');
      }

      const courses = state.data.courses.filter((c) => c.id_plan === planId && !c.nombre.toLowerCase().includes('electiv'));
      const cycles = state.data.cycles.slice().sort((a, b) => a.numero_ciclo - b.numero_ciclo);
      const areas = mapBy(state.data.areas, 'id_area');

      renderMallaStats(courses, cycles);
      renderMallaGrid(courses, cycles, areas);
      renderMallaLegend(courses, areas);
    }

    
    function populateMallaCareerSelector() {
      const select = document.getElementById('mallaCareer');
      if (!select) return;
      const careers = unique((state.processes || []).map(p => p.evaluatedPlan?.id_carrera || p.newPlan?.id_carrera));
      const currentVal = state.mallaCareerId || '';
      let html = '<option value="">Todas las carreras</option>';
      careers.forEach(id => {
        if (!id) return;
        const careerName = state.data.careers?.find(c => c.id_carrera === id)?.nombre_carrera || 'Carrera ' + id;
        html += `<option value="${id}" ${id === currentVal ? 'selected' : ''}>${escapeHtml(careerName)}</option>`;
      });
      select.innerHTML = html;
      if (!select.dataset.bound) {
        select.addEventListener('change', (e) => {
          state.mallaCareerId = e.target.value ? Number(e.target.value) : null;
          state.mallaProcessId = null;
          state.mallaPlanId = null;
          populateMallaProcessSelector();
          onMallaProcessChange();
        });
        select.dataset.bound = 'true';
      }
    }

    function populateMallaProcessSelector() {
      populateMallaCareerSelector();
      const select = document.getElementById('mallaProcess');
      let processes = state.processes || [];
      if (state.mallaCareerId) {
         processes = processes.filter(p => (p.evaluatedPlan?.id_carrera === state.mallaCareerId) || (p.newPlan?.id_carrera === state.mallaCareerId));
      }
      const currentVal = state.mallaProcessId;


      const designProcs = processes.filter((p) => p.currentStep >= 3 && p.currentStep <= 6);
      const otherProcs = processes.filter((p) => p.currentStep > 6);

      let html = '<option value="">Selecciona un proceso</option>';
      if (designProcs.length) {
        html += '<optgroup label="En diseño curricular (Pasos 3 al 6)">';
        designProcs.forEach((p) => {
          const career = p.evaluatedPlan?.nombre_carrera || p.newPlan?.nombre_carrera || 'Sin carrera';
          const periodName = p.period ? p.period.nombre_periodo : ''; const labelPrefix = state.mallaCareerId ? 'Proceso ' : escapeHtml(career) + ' '; html += `<option value="${p.id}" ${p.id === currentVal ? 'selected' : ''}>${labelPrefix}${periodName ? '(' + periodName + ')' : ''} — ${escapeHtml(p.status)}</option>`;
        });
        html += '</optgroup>';
      }
      if (otherProcs.length) {
        html += '<optgroup label="Otros procesos (solo lectura)">';
        otherProcs.forEach((p) => {
          const career = p.evaluatedPlan?.nombre_carrera || p.newPlan?.nombre_carrera || 'Sin carrera';
          const periodName = p.period ? p.period.nombre_periodo : ''; const labelPrefix = state.mallaCareerId ? 'Proceso ' : escapeHtml(career) + ' '; html += `<option value="${p.id}" ${p.id === currentVal ? 'selected' : ''}>${labelPrefix}${periodName ? '(' + periodName + ')' : ''} — ${escapeHtml(p.status)}</option>`;
        });
        html += '</optgroup>';
      }
      select.innerHTML = html;
    }

    function onMallaProcessChange() {
      const val = document.getElementById('mallaProcess').value;
      state.mallaProcessId = val ? Number(val) : null;
      state.mallaPlanId = null;
      state.mallaSelectedCourseId = null;

      const proc = state.processes.find((p) => p.id === state.mallaProcessId);
      state.mallaEditable = proc ? proc.currentStep >= 3 && proc.currentStep <= 6 && state.isAdmin : false;

      const planSelect = document.getElementById('mallaPlan');
      let html = '<option value="">Selecciona un plan</option>';
      if (proc) {
        if (proc.newPlan) html += `<option value="${proc.newPlan.id_plan}">Plan nuevo — ${escapeHtml(proc.newPlan.anio_version)} ${escapeHtml(proc.newPlan.nombre_carrera)}</option>`;
        if (proc.evaluatedPlan) html += `<option value="${proc.evaluatedPlan.id_plan}">Plan evaluado — ${escapeHtml(proc.evaluatedPlan.anio_version)} ${escapeHtml(proc.evaluatedPlan.nombre_carrera)}</option>`;
      }
      planSelect.innerHTML = html;

      if (proc && proc.newPlan) {
        state.mallaPlanId = proc.newPlan.id_plan;
        planSelect.value = String(proc.newPlan.id_plan);
      }
      renderMalla();
    }

    function onMallaPlanChange() {
      const val = document.getElementById('mallaPlan').value;
      state.mallaPlanId = val ? Number(val) : null;
      state.mallaSelectedCourseId = null;
      renderMalla();
    }
    function renderMallaStats(courses, cycles) {
      const stats = document.getElementById('mallaStats');
      const totalCredits = courses.reduce((s, c) => s + (c.creditos || 0), 0);
      const usedCycles = new Set(courses.map((c) => c.id_ciclo)).size;
      const usedAreas = new Set(courses.map((c) => c.id_area)).size;
      stats.innerHTML = `
        <span><strong>${courses.length}</strong> cursos</span>
        <span><strong>${totalCredits}</strong> créditos</span>
        <span><strong>${usedCycles}</strong> ciclos</span>
        <span><strong>${usedAreas}</strong> áreas</span>
      `;
    }

    // [EXPO_GRAFOS_MALLA] Lógica relacional recursiva para calcular las flechas y la topología de Prerrequisitos.
    function renderMallaGrid(courses, cycles, areas) {
      const grid = document.getElementById('mallaGrid');
      clearMallaArrows();

      const activeCycles = cycles; // SIEMPRE MANTENER LOS 10 CICLOS FIJOS
      if (!activeCycles.length) {
        clearMallaCourseDetail();
        grid.innerHTML = '<div class="empty" style="grid-column:1/-1">No hay ciclos configurados en la BD.</div>';
        return;
      }

      grid.style.gridTemplateColumns = `repeat(${activeCycles.length}, 1fr)`;

      const grouped = {};
      activeCycles.forEach((cy) => { grouped[cy.id_ciclo] = []; });
      courses.forEach((c) => {
        if (grouped[c.id_ciclo]) grouped[c.id_ciclo].push(c);
      });

      // --- Ordenamiento topológico y por cadenas ---
      const courseIds = new Set(courses.map((c) => c.id_curso));
      const prereqs = (state.data.prerequisites || []).filter((p) =>
        courseIds.has(p.id_curso_objetivo) && courseIds.has(p.id_curso_previo)
      );
      const courseRowMap = new Map(); // id_curso -> row index

      // Calculamos peso de cada curso (descendientes directos e indirectos)
      function calcWeight(id, visited = new Set()) {
        if (visited.has(id)) return 0;
        visited.add(id);
        const children = prereqs.filter((p) => p.id_curso_previo === id);
        let w = children.length;
        children.forEach((p) => { w += calcWeight(p.id_curso_objetivo, visited); });
        return w;
      }

      const weights = {};
      const incomingCounts = {};
      const outgoingCounts = {};
      courses.forEach((c) => {
        weights[c.id_curso] = calcWeight(c.id_curso);
        incomingCounts[c.id_curso] = prereqs.filter((p) => p.id_curso_objetivo === c.id_curso).length;
        outgoingCounts[c.id_curso] = prereqs.filter((p) => p.id_curso_previo === c.id_curso).length;
      });

      const areaOrder = (course) => {
        const area = areas.get(course.id_area);
        return `${area?.color_hexadecimal || ''}|${area?.nombre_area || ''}`;
      };

      activeCycles.forEach((cy) => {
        const arr = grouped[cy.id_ciclo];
        if (!arr) return;

        arr.forEach((c) => {
          // Buscamos si tiene prerrequisitos que ya fueron ubicados en ciclos anteriores
          const incoming = prereqs.filter((p) => p.id_curso_objetivo === c.id_curso);
          const incomingRows = incoming.map(p => courseRowMap.get(p.id_curso_previo)).filter(r => r !== undefined);
          c._targetRow = incomingRows.length ? Math.min(...incomingRows) : 999;
          c._weight = weights[c.id_curso];
          c._incomingCount = incomingCounts[c.id_curso] || 0;
          c._outgoingCount = outgoingCounts[c.id_curso] || 0;
          c._isChainCourse = c._incomingCount > 0 || c._outgoingCount > 0;
          c._isIndependent = !c._isChainCourse;
          c._areaOrder = areaOrder(c);
        });

        const customOrderStr = localStorage.getItem('usmp_custom_order_' + state.mallaPlanId);
        const customOrderMap = customOrderStr ? JSON.parse(customOrderStr) : {};
        const manualOrder = customOrderMap[cy.id_ciclo];
        
        if (manualOrder && manualOrder.length > 0) {
          arr.sort((a, b) => {
            const idxA = manualOrder.indexOf(a.id_curso);
            const idxB = manualOrder.indexOf(b.id_curso);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return 0;
          });
        } else {
          arr.sort((a, b) => {
            // Si ambos tienen un "target row", el que deba estar más arriba va primero
            if (a._isIndependent !== b._isIndependent) return a._isIndependent ? 1 : -1;
            if (a._outgoingCount !== b._outgoingCount) return b._outgoingCount - a._outgoingCount;
            if (a._weight !== b._weight) return b._weight - a._weight;
            if (a._targetRow !== b._targetRow) return a._targetRow - b._targetRow;
            // Luego, los que tengan más "peso" (cadena más larga) van primero
            const areaCompare = a._areaOrder.localeCompare(b._areaOrder, 'es');
            if (areaCompare) return areaCompare;
            // Desempate por área
            return a.nombre.localeCompare(b.nombre, 'es');
          });
        }

        // Guardamos la fila final en la que quedó cada curso en este ciclo
        arr.forEach((c, index) => {
          courseRowMap.set(c.id_curso, index);
        });
      });

      const maxRows = Math.max(...Object.values(grouped).map((arr) => arr.length), 1);

      let html = '';

      activeCycles.forEach((cy) => {
        html += `<div class="malla-cycle-header" style="grid-column:auto">Ciclo ${cy.numero_ciclo}</div>`;
      });

      for (let row = 0; row < maxRows; row++) {
        activeCycles.forEach((cy) => {
          const course = grouped[cy.id_ciclo][row];
          if (course) {
            html += mallaCourseCell(course, areas);
          } else {
            html += `<div class="malla-empty-slot" data-cycle="${cy.id_ciclo}">+</div>`;
          }
        });
      }

      let accumCredits = 0;
      activeCycles.forEach((cy) => {
        const cycleCredits = grouped[cy.id_ciclo].reduce((s, c) => s + (c.creditos || 0), 0);
        html += `<div class="malla-credits-row">${cycleCredits} cr.</div>`;
      });

      activeCycles.forEach((cy) => {
        const cycleCredits = grouped[cy.id_ciclo].reduce((s, c) => s + (c.creditos || 0), 0);
        accumCredits += cycleCredits;
        html += `<div class="malla-credits-accum">${accumCredits} ac.</div>`;
      });

      grid.innerHTML = html;

            let draggedCourseId = null;
      let sourceCycleId = null;
      let draggedElement = null;

      grid.ondragstart = (e) => {
        const el = e.target.closest('.malla-course');
        if (el) {
          draggedElement = el;
          draggedCourseId = Number(el.dataset.courseId);
          sourceCycleId = Number(el.dataset.cycleId);
          e.dataTransfer.effectAllowed = 'move';
          setTimeout(() => el.classList.add('is-dragging'), 0);
        }
      };

      grid.ondragend = (e) => {
        const el = e.target.closest('.malla-course');
        if (el) el.classList.remove('is-dragging');
        grid.querySelectorAll('.malla-course, .malla-empty-slot').forEach(el => el.classList.remove('drag-over'));
        draggedElement = null;
      };

      grid.ondragover = (e) => {
        e.preventDefault();
        const dropTarget = e.target.closest('.malla-course, .malla-empty-slot');
        if (dropTarget && draggedElement && dropTarget !== draggedElement) {
          const targetCycleId = Number(dropTarget.dataset.cycleId || dropTarget.dataset.cycle);
          if (targetCycleId === sourceCycleId) {
            e.dataTransfer.dropEffect = 'move';
            
            // Lógica de Swap visual en vivo
            const parent = dropTarget.parentNode;
            const nextA = draggedElement.nextSibling;
            const nextB = dropTarget.nextSibling;
            
            // Evitar oscilación si nextA === dropTarget o viceversa
            if (nextA === dropTarget) {
                parent.insertBefore(dropTarget, draggedElement);
            } else if (nextB === draggedElement) {
                parent.insertBefore(draggedElement, dropTarget);
            } else {
                parent.insertBefore(draggedElement, nextB);
                parent.insertBefore(dropTarget, nextA);
            }
          }
        }
      };

      grid.ondrop = (e) => {
        e.preventDefault();
        if (draggedCourseId && sourceCycleId) {
            const customOrderStr = localStorage.getItem('usmp_custom_order_' + state.mallaPlanId);
            const customOrderMap = customOrderStr ? JSON.parse(customOrderStr) : {};
            
            // Simplemente leemos el orden final que quedó en el DOM tras los swaps
            const finalOrder = Array.from(grid.querySelectorAll(`[data-cycle-id="${sourceCycleId}"]`))
                                      .map(el => Number(el.dataset.courseId))
                                      .filter(id => id);
            
            customOrderMap[sourceCycleId] = finalOrder;
            localStorage.setItem('usmp_custom_order_' + state.mallaPlanId, JSON.stringify(customOrderMap));
            
            renderMallaGrid(courses, cycles, areas);
        }
        grid.querySelectorAll('.malla-course, .malla-empty-slot').forEach(el => el.classList.remove('drag-over'));
      };

      grid.querySelectorAll('.malla-course').forEach((el) => {
        el.addEventListener('mouseenter', () => highlightChain(Number(el.dataset.courseId)));
        el.addEventListener('mouseleave', () => {
          if (state.mallaSelectedCourseId) {
            highlightChain(state.mallaSelectedCourseId);
          } else {
            clearChainHighlight();
          }
        });
        el.addEventListener('click', (e) => {
          if (e.target.classList.contains('malla-course-delete') || e.target.classList.contains('malla-course-edit')) return;
          const courseId = Number(el.dataset.courseId);
          state.mallaSelectedCourseId = state.mallaSelectedCourseId === courseId ? null : courseId;
          if (state.mallaSelectedCourseId) {
            highlightChain(state.mallaSelectedCourseId);
            renderMallaCourseDetail(courseId);
          } else {
            clearChainHighlight();
            clearMallaCourseDetail();
          }
        });
      });

      if (state.mallaSelectedCourseId && grid.querySelector(`[data-course-id="${state.mallaSelectedCourseId}"]`)) {
        highlightChain(state.mallaSelectedCourseId);
        renderMallaCourseDetail(state.mallaSelectedCourseId);
      } else {
        state.mallaSelectedCourseId = null;
        clearMallaCourseDetail();
      }

      grid.querySelectorAll('.malla-course-edit').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          mallaEditCourse(Number(btn.dataset.courseId));
        });
      });

      grid.querySelectorAll('.malla-course-delete').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          mallaDeleteCourse(Number(btn.dataset.courseId));
        });
      });
    }

    function mallaCourseCell(course, areas) {
      const area = areas.get(course.id_area);
      const color = area?.color_hexadecimal || '#888888';
      const isElective = course.es_electivo;
      const adminBtns = state.mallaEditable
        ? `<button class="malla-course-edit" data-course-id="${course.id_curso}" title="Editar curso">✎</button><button class="malla-course-delete" data-course-id="${course.id_curso}" title="Eliminar curso">✕</button>`
        : '';

      return `
        <div class="malla-course ${isElective ? 'is-elective' : ''}"
             draggable="true"
             data-course-id="${course.id_curso}"
             data-cycle-id="${course.id_ciclo}"
             style="${isElective ? '' : `background-color:${color}`}">
          ${adminBtns}
          <div class="malla-course-name">${escapeHtml(course.nombre)}</div>
          <div class="malla-course-bottom">
            <span class="malla-course-code">${escapeHtml(course.codigo_curso)}</span>
            <span class="malla-course-credits">${course.creditos} cr.</span>
          </div>
        </div>`;
    }

    function renderMallaLegend(courses, areas) {
      const legend = document.getElementById('mallaLegend');
      if (!courses.length) { legend.classList.add('is-hidden'); return; }

      const usedAreaIds = [...new Set(courses.map((c) => c.id_area))];
      const items = usedAreaIds.map((id) => {
        const area = areas.get(id);
        if (!area) return '';
        const currentColor = area.color_hexadecimal && area.color_hexadecimal.startsWith('#') ? area.color_hexadecimal : '#888888';
        if (state.isAdmin) {
          return `<div class="malla-legend-item">
            <input type="color" class="malla-legend-picker" data-area-id="${id}" value="${currentColor}" title="Cambiar color">
            <span class="malla-legend-name" data-area-id="${id}" title="Clic para editar área">${escapeHtml(area.nombre_area)}</span>
          </div>`;
        }
        return `<div class="malla-legend-item"><span class="malla-legend-swatch" style="background:${currentColor}"></span>${escapeHtml(area.nombre_area)}</div>`;
      }).filter(Boolean);

      legend.innerHTML = items.join('');
      legend.classList.remove('is-hidden');

      legend.querySelectorAll('.malla-legend-picker').forEach((picker) => {
        picker.addEventListener('change', async (e) => {
          const areaId = Number(e.target.dataset.areaId);
          const newColor = e.target.value;
          const { error } = await state.client.from(TABLES.areas).update({ color_hexadecimal: newColor }).eq('id_area', areaId);
          if (error) { alert('Error al actualizar color: ' + error.message); return; }
          await refreshData();
          showConnectionMessage('Color actualizado.');
          setTimeout(hideConnectionMessage, 2000);
        });
      });

      legend.querySelectorAll('.malla-legend-name').forEach((name) => {
        name.addEventListener('click', () => mallaEditArea(Number(name.dataset.areaId)));
      });
    }

    async function mallaEditArea(areaId) {
      const area = state.data.areas.find((a) => a.id_area === areaId);
      if (!area) return;
      const currentColor = area.color_hexadecimal && area.color_hexadecimal.startsWith('#') ? area.color_hexadecimal : '#888888';

      const body = `
        <form id="mallaEditAreaForm" class="form-grid">
          <div class="field">
            <label>Nombre del área</label>
            <input type="text" name="nombre_area" required value="${escapeHtml(area.nombre_area)}">
          </div>
          <div class="field">
            <label>Color hexadecimal</label>
            <div style="display:flex;gap:8px;align-items:center">
              <input type="color" name="color_hexadecimal" value="${currentColor}" style="width:50px;height:40px;cursor:pointer;border:1px solid var(--line);border-radius:6px">
              <input type="text" name="color_hex_text" value="${currentColor}" style="flex:1;font-family:monospace" pattern="^#[0-9A-Fa-f]{6}$" placeholder="#2E86C1">
            </div>
          </div>
          <div class="wide" style="text-align:right;padding-top:8px">
            <button type="submit" class="mini-button primary">Guardar cambios</button>
          </div>
        </form>
      `;

      openModal('Editar área académica', escapeHtml(area.nombre_area), body);

      const colorInput = document.querySelector('#mallaEditAreaForm [name="color_hexadecimal"]');
      const textInput = document.querySelector('#mallaEditAreaForm [name="color_hex_text"]');
      colorInput.addEventListener('input', () => { textInput.value = colorInput.value; });
      textInput.addEventListener('input', () => { if (/^#[0-9A-Fa-f]{6}$/.test(textInput.value)) colorInput.value = textInput.value; });

      document.getElementById('mallaEditAreaForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const updates = {
          nombre_area: form.nombre_area.value.trim(),
          color_hexadecimal: form.color_hexadecimal.value
        };

        const { error } = await state.client.from(TABLES.areas).update(updates).eq('id_area', areaId);
        if (error) { alert('Error al editar área: ' + error.message); return; }

        closeModal();
        await refreshData();
        showConnectionMessage('Área actualizada.');
        setTimeout(hideConnectionMessage, 2400);
      });
    }

    function clearMallaArrows() {
      const svg = document.getElementById('mallaArrows');
      if (!svg) return;
      const defs = svg.querySelector('defs');
      svg.innerHTML = '';
      if (defs) svg.appendChild(defs);
      svg.style.display = 'none';
    }

    /* --- Flechas SVG de prerrequisitos (Fase 2 inline) --- */

    function renderMallaArrows(courses, areas) {
      const svg = document.getElementById('mallaArrows');
      const container = document.getElementById('mallaContainer');
      // Limpiar flechas anteriores
      const defs = svg.querySelector('defs');
      svg.innerHTML = '';
      if (defs) svg.appendChild(defs);

      const courseIds = new Set(courses.map((c) => c.id_curso));
      const prereqs = (state.data.prerequisites || []).filter((p) =>
        courseIds.has(p.id_curso_objetivo) && courseIds.has(p.id_curso_previo)
      );
      if (!prereqs.length) { svg.style.display = 'none'; return; }

      // Ajustar tamaño del SVG al contenedor
      const containerRect = container.getBoundingClientRect();
      const svgWidth = Math.max(container.scrollWidth, container.clientWidth);
      const svgHeight = Math.max(container.scrollHeight, container.clientHeight);
      svg.setAttribute('width', svgWidth);
      svg.setAttribute('height', svgHeight);
      svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
      svg.style.display = 'block';
      svg.style.width = svgWidth + 'px';
      svg.style.height = svgHeight + 'px';

      prereqs.forEach((p) => {
        const fromEl = container.querySelector(`[data-course-id="${p.id_curso_previo}"]`);
        const toEl = container.querySelector(`[data-course-id="${p.id_curso_objetivo}"]`);
        if (!fromEl || !toEl) return;

        const fromCourse = courses.find((c) => c.id_curso === p.id_curso_previo);
        const areaColor = fromCourse && areas ? (areas.get(fromCourse.id_area)?.color_hexadecimal || '#888') : '#888';

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();

        const x1 = fromRect.right - containerRect.left + container.scrollLeft + 3;
        const y1 = fromRect.top + fromRect.height / 2 - containerRect.top + container.scrollTop;
        const x2 = toRect.left - containerRect.left + container.scrollLeft - 3;
        const y2 = toRect.top + toRect.height / 2 - containerRect.top + container.scrollTop;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        let d = '';
        if (Math.abs(y1 - y2) < 10) {
          // Están en la misma línea horizontal, línea recta
          d = `M${x1},${y1} L${x2},${y2}`;
        } else {
          // Diferente línea: línea ortogonal (derecha, arriba/abajo, derecha)
          // Usamos un offset para que las líneas no se encimen perfectamente si hay múltiples
          const offset = 8 + (p.id_curso_previo % 5) * 4;
          const midX = x1 + offset;
          d = `M${x1},${y1} L${midX},${y1} L${midX},${y2} L${x2},${y2}`;
        }

        path.setAttribute('d', d);
        path.setAttribute('class', 'malla-arrow');
        path.setAttribute('marker-end', 'url(#arrowhead)');
        path.setAttribute('stroke', areaColor);
        path.setAttribute('stroke-dasharray', '5 3');
        path.dataset.from = p.id_curso_previo;
        path.dataset.to = p.id_curso_objetivo;
        svg.appendChild(path);
      });
    }

    /* --- Highlight de cadena de prerrequisitos --- */

    function highlightChain(courseId) {
      const courseIds = new Set();
      const visited = new Set();

      function walkBack(id) {
        if (visited.has(id)) return;
        visited.add(id);
        courseIds.add(id);
        (state.data.prerequisites || []).filter((p) => p.id_curso_objetivo === id).forEach((p) => walkBack(p.id_curso_previo));
      }
      function walkForward(id) {
        if (visited.has(id)) return;
        visited.add(id);
        courseIds.add(id);
        (state.data.prerequisites || []).filter((p) => p.id_curso_previo === id).forEach((p) => walkForward(p.id_curso_objetivo));
      }

      walkBack(courseId);
      visited.clear();
      walkForward(courseId);

      document.querySelectorAll('.malla-course').forEach((el) => {
        const id = Number(el.dataset.courseId);
        if (courseIds.has(id)) {
          el.classList.add('is-chain');
          el.classList.remove('is-dimmed');
        } else {
          el.classList.remove('is-chain');
          el.classList.add('is-dimmed');
        }
      });

      document.querySelectorAll('.malla-arrow').forEach((path) => {
        const from = Number(path.dataset.from);
        const to = Number(path.dataset.to);
        if (courseIds.has(from) && courseIds.has(to)) {
          path.classList.add('is-chain');
          path.setAttribute('marker-end', 'url(#arrowheadRed)');
        } else {
          path.classList.remove('is-chain');
        }
      });
    }

    function clearChainHighlight() {
      document.querySelectorAll('.malla-course').forEach((el) => {
        el.classList.remove('is-chain', 'is-dimmed');
      });
      document.querySelectorAll('.malla-arrow').forEach((path) => {
        path.classList.remove('is-chain');
        path.setAttribute('marker-end', 'url(#arrowhead)');
      });
    }

    function renderMallaCourseDetail(courseId) {
      const panel = document.getElementById('mallaCourseDetail');
      if (!panel) return;
      const course = state.data.courses.find((c) => c.id_curso === courseId);
      if (!course) {
        clearMallaCourseDetail();
        return;
      }

      const area = state.data.areas.find((a) => a.id_area === course.id_area);
      const cycle = state.data.cycles.find((cy) => cy.id_ciclo === course.id_ciclo);
      const prereqs = (state.data.prerequisites || [])
        .filter((p) => p.id_curso_objetivo === courseId)
        .map((p) => state.data.courses.find((c) => c.id_curso === p.id_curso_previo)?.nombre || '?');
      const dependents = (state.data.prerequisites || [])
        .filter((p) => p.id_curso_previo === courseId)
        .map((p) => state.data.courses.find((c) => c.id_curso === p.id_curso_objetivo)?.nombre || '?');

      panel.classList.remove('is-hidden');
      panel.innerHTML = `
        <div class="malla-course-detail-header">
          <div>
            <h3>${escapeHtml(course.nombre)}</h3>
            <p class="muted">${escapeHtml(course.codigo_curso)} · ${escapeHtml(cycle?.denominacion || 'Sin ciclo')}</p>
          </div>
          <button class="mini-button" type="button" id="clearMallaCourseDetail">Limpiar ruta</button>
        </div>
        <div class="malla-course-detail-grid">
          <div class="malla-course-detail-item"><span>Créditos</span><strong>${course.creditos}</strong></div>
          <div class="malla-course-detail-item"><span>Área</span><strong>${escapeHtml(area?.nombre_area || 'Sin área')}</strong></div>
          <div class="malla-course-detail-item"><span>Modalidad</span><strong>${escapeHtml(course.modalidad || 'Sin modalidad')}</strong></div>
          <div class="malla-course-detail-item"><span>Tipo</span><strong>${course.es_electivo ? 'Electivo' : 'Obligatorio'}</strong></div>
        </div>
        <div class="malla-course-detail-relations">
          <div class="malla-course-detail-item">
            <h4>Prerrequisitos</h4>
            ${prereqs.length ? `<ul>${prereqs.map((name) => `<li>${escapeHtml(name)}</li>`).join('')}</ul>` : '<p>No registra prerrequisitos.</p>'}
          </div>
          <div class="malla-course-detail-item">
            <h4>Cursos que habilita</h4>
            ${dependents.length ? `<ul>${dependents.map((name) => `<li>${escapeHtml(name)}</li>`).join('')}</ul>` : '<p>No habilita cursos posteriores.</p>'}
          </div>
        </div>
      `;
      document.getElementById('clearMallaCourseDetail').addEventListener('click', () => {
        state.mallaSelectedCourseId = null;
        clearChainHighlight();
        clearMallaCourseDetail();
      });
    }

    function clearMallaCourseDetail() {
      const panel = document.getElementById('mallaCourseDetail');
      if (!panel) return;
      panel.classList.add('is-hidden');
      panel.innerHTML = '';
    }
    /* --- Formularios CRUD de malla --- */

    async function mallaAddExistingCourse() {
      if (!state.mallaPlanId) return;

      const uniqueCourses = [];
      const seenNames = new Set();
      (state.data.courses || []).forEach(c => {
        const lowerName = c.nombre.trim().toLowerCase();
        if (!seenNames.has(lowerName)) {
          seenNames.add(lowerName);
          uniqueCourses.push(c);
        }
      });
      uniqueCourses.sort((a,b) => a.nombre.localeCompare(b.nombre));

      const body = `
        <div class="form-grid" style="margin-bottom: 20px;">
          <div class="field wide">
            <label>Buscar curso histórico por Nombre o Código</label>
            <input type="text" id="mallaCourseSearchInput" placeholder="Ej: Matemática Básica..." autocomplete="off">
          </div>
          <div class="wide">
            <div id="mallaCourseSearchResults" style="max-height: 250px; overflow-y: auto; border: 1px solid var(--line); border-radius: 6px; display: none; flex-direction: column;">
              <!-- Results go here -->
            </div>
          </div>
        </div>
      `;

      openModal('Buscador de Cursos Históricos', 'Selecciona uno para configurar sus créditos y ciclo en esta malla', body);

      const searchInput = document.getElementById('mallaCourseSearchInput');
      const resultsContainer = document.getElementById('mallaCourseSearchResults');

      const renderResults = (query) => {
        const q = query.toLowerCase().trim();
        if (!q) {
          resultsContainer.style.display = 'none';
          resultsContainer.innerHTML = '';
          return;
        }

        const filtered = uniqueCourses.filter(c => {
          const n = (c.nombre || '').toLowerCase();
          const cod = (c.codigo_curso || '').toLowerCase();
          return n.includes(q) || cod.includes(q);
        }).slice(0, 15);
        
        if (filtered.length === 0) {
          resultsContainer.style.display = 'flex';
          resultsContainer.innerHTML = '<div style="padding: 16px; color: var(--text-muted); text-align: center;">No se encontraron cursos con ese término</div>';
          return;
        }

        resultsContainer.style.display = 'flex';
        resultsContainer.innerHTML = filtered.map(c => `
          <div class="search-result-item" data-id="${c.id_curso}" style="padding: 12px; cursor: pointer; border-bottom: 1px solid var(--line); transition: background 0.2s;">
            <div style="font-weight: 600; color: var(--text);">${escapeHtml(c.nombre)}</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Código: ${escapeHtml(c.codigo_curso)} • Créditos: ${c.creditos}</div>
          </div>
        `).join('');

        const items = resultsContainer.querySelectorAll('.search-result-item');
        items.forEach(item => {
          item.addEventListener('click', () => {
            const id = Number(item.getAttribute('data-id'));
            const found = uniqueCourses.find(c => c.id_curso === id);
            closeModal();
            if (found) setTimeout(() => mallaAddCourse(found), 300);
          });
          item.addEventListener('mouseover', () => item.style.backgroundColor = 'var(--bg)');
          item.addEventListener('mouseout', () => item.style.backgroundColor = 'transparent');
        });
      };

      searchInput.addEventListener('input', (e) => renderResults(e.target.value));
      setTimeout(() => searchInput.focus(), 200);
    }

    async function mallaAddCourse(prefill = null) {
      if (!state.mallaPlanId) return;

      const cycleOptions = state.data.cycles
        .slice().sort((a, b) => a.numero_ciclo - b.numero_ciclo)
        .map((cy) => `<option value="${cy.id_ciclo}">${cy.numero_ciclo}. ${escapeHtml(cy.denominacion)}</option>`)
        .join('');

      const areaOptions = state.data.areas
        .map((a) => `<option value="${a.id_area}">${escapeHtml(a.nombre_area)}</option>`)
        .join('');

      const body = `
        <form id="mallaAddCourseForm" class="form-grid">
          <div class="field">
            <label>Código</label>
            <input type="text" name="codigo_curso" required placeholder="Ej: SIS011" value="${prefill && prefill.codigo_curso ? escapeHtml(prefill.codigo_curso) : ''}">
          </div>
          <div class="field">
            <label>Nombre del curso</label>
            <input type="text" name="nombre" required placeholder="Ej: Matemática Discreta" value="${prefill && prefill.nombre ? escapeHtml(prefill.nombre) : ''}">
          </div>
          <div class="field">
            <label>Ciclo</label>
            <select name="id_ciclo" required>${cycleOptions}</select>
          </div>
          <div class="field">
            <label>Área académica</label>
            <div style="display:flex;gap:6px">
              <select name="id_area" id="mallaAddCourseArea" required style="flex:1">
                ${state.data.areas.map(a => `<option value="${a.id_area}" ${prefill && prefill.id_area === a.id_area ? 'selected' : ''}>${escapeHtml(a.nombre_area)}</option>`).join('')}
              </select>
              <button type="button" id="mallaInlineAddArea" class="mini-button" style="white-space:nowrap">+ Nueva</button>
            </div>
          </div>
          <div id="mallaInlineAreaFields" class="field wide" style="display:none;gap:8px;align-items:flex-end">
            <div class="field" style="flex:1;margin:0">
              <label>Nombre del área nueva</label>
              <input type="text" id="mallaInlineAreaName" placeholder="Ej: Formación General">
            </div>
            <div class="field" style="width:60px;margin:0">
              <label>Color</label>
              <input type="color" id="mallaInlineAreaColor" value="#2E86C1" style="width:100%;height:36px;cursor:pointer;border:1px solid var(--line);border-radius:6px">
            </div>
            <button type="button" id="mallaInlineAreaSave" class="mini-button primary" style="height:36px">Crear</button>
          </div>
          <div class="field">
            <label>Créditos</label>
            <input type="number" name="creditos" required min="1" max="10" value="4">
          </div>
          <div class="field">
            <label>Modalidad</label>
            <select name="modalidad">
              <option>Presencial</option>
              <option>Semipresencial</option>
              <option>Virtual</option>
            </select>
          </div>
          <div class="field" style="display:flex;align-items:center;gap:8px">
            <input type="checkbox" name="es_electivo" id="mallaElectiveCheck">
            <label for="mallaElectiveCheck" style="margin:0">Es electivo</label>
          </div>
          <div class="wide" style="text-align:right;padding-top:8px">
            <button type="submit" class="mini-button primary">Agregar curso</button>
          </div>
        </form>
      `;

      openModal('Agregar curso a la malla', 'Se añadirá al plan seleccionado', body);

      document.getElementById('mallaInlineAddArea').addEventListener('click', () => {
        const fields = document.getElementById('mallaInlineAreaFields');
        fields.style.display = fields.style.display === 'none' ? 'flex' : 'none';
      });

      document.getElementById('mallaInlineAreaSave').addEventListener('click', async () => {
        const name = document.getElementById('mallaInlineAreaName').value.trim();
        const color = document.getElementById('mallaInlineAreaColor').value;
        if (!name) { alert('Escribe un nombre para el área.'); return; }

        const { data, error } = await state.client.from(TABLES.areas).insert({ nombre_area: name, color_hexadecimal: color }).select().single();
        if (error) { alert('Error: ' + error.message); return; }

        await refreshData();
        const select = document.getElementById('mallaAddCourseArea');
        select.innerHTML = state.data.areas.map((a) => `<option value="${a.id_area}" ${a.id_area === data.id_area ? 'selected' : ''}>${escapeHtml(a.nombre_area)}</option>`).join('');
        document.getElementById('mallaInlineAreaFields').style.display = 'none';
        showConnectionMessage('Área "' + name + '" creada.');
        setTimeout(hideConnectionMessage, 2400);
      });

      document.getElementById('mallaAddCourseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const record = {
          id_plan: state.mallaPlanId,
          codigo_curso: form.codigo_curso.value.trim(),
          nombre: form.nombre.value.trim(),
          id_ciclo: Number(form.id_ciclo.value),
          id_area: Number(form.id_area.value),
          creditos: Number(form.creditos.value),
          modalidad: form.modalidad.value,
          es_electivo: form.es_electivo.checked
        };

        const { error } = await state.client.from(TABLES.courses).insert(record);
        if (error) { alert('Error al agregar curso: ' + error.message); return; }

        closeModal();
        await refreshData();
        showConnectionMessage('Curso agregado a la malla.');
        setTimeout(hideConnectionMessage, 2400);
      });
    }

    async function mallaAddArea() {
      const body = `
        <form id="mallaAddAreaForm" class="form-grid">
          <div class="field">
            <label>Nombre del área</label>
            <input type="text" name="nombre_area" required placeholder="Ej: Ciencias de la Computación">
          </div>
          <div class="field">
            <label>Color</label>
            <input type="color" name="color_hexadecimal" value="#2E86C1" style="width:100%;height:40px;cursor:pointer;border:1px solid var(--line);border-radius:6px">
          </div>
          <div class="wide" style="text-align:right;padding-top:8px">
            <button type="submit" class="mini-button primary">Crear área</button>
          </div>
        </form>
      `;

      openModal('Nueva área académica', 'El color se usará en la malla curricular', body);

      document.getElementById('mallaAddAreaForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const record = {
          nombre_area: form.nombre_area.value.trim(),
          color_hexadecimal: form.color_hexadecimal.value
        };

        const { error } = await state.client.from(TABLES.areas).insert(record);
        if (error) { alert('Error al crear área: ' + error.message); return; }

        closeModal();
        await refreshData();
        showConnectionMessage('Área académica creada.');
        setTimeout(hideConnectionMessage, 2400);
      });
    }

    async function mallaAddPrerequisite() {
      if (!state.mallaPlanId) return;

      const courses = state.data.courses
        .filter((c) => c.id_plan === state.mallaPlanId)
        .slice().sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

      const cycles = state.data.cycles
        .slice().sort((a, b) => a.numero_ciclo - b.numero_ciclo);

      const cycleOptions = cycles.map((cy) =>
        `<option value="${cy.id_ciclo}">Ciclo ${cy.numero_ciclo}</option>`
      ).join('');

      const body = `
        <form id="mallaAddPrereqForm" class="form-grid">
          <div class="field">
            <label>Ciclo del prerrequisito</label>
            <select id="prereqCyclePrev">${cycleOptions}</select>
          </div>
          <div class="field">
            <label>Ciclo del curso objetivo</label>
            <select id="prereqCycleObj">${cycleOptions}</select>
          </div>
          <div class="field">
            <label>Curso previo (prerrequisito)</label>
            <select name="id_curso_previo" id="prereqSelectPrev" required></select>
          </div>
          <div class="field">
            <label>Curso objetivo (requiere al anterior)</label>
            <select name="id_curso_objetivo" id="prereqSelectObj" required></select>
          </div>
          <div class="field wide">
            <label>Comentario (opcional)</label>
            <textarea name="comentarios_regla" rows="2" placeholder="Ej: Aprobado con nota mínima 11"></textarea>
          </div>
          <div class="wide" style="text-align:right;padding-top:8px">
            <button type="submit" class="mini-button primary">Vincular prerrequisito</button>
          </div>
        </form>
      `;

      openModal('Agregar prerrequisito', 'Filtra por ciclo para encontrar los cursos', body);

      function fillCourseSelect(selectId, cycleId) {
        const filtered = courses.filter((c) => c.id_ciclo === Number(cycleId));
        const sel = document.getElementById(selectId);
        sel.innerHTML = filtered.length
          ? filtered.map((c) => `<option value="${c.id_curso}">${escapeHtml(c.nombre)}</option>`).join('')
          : '<option value="">Sin cursos en este ciclo</option>';
      }

      const cyclePrev = document.getElementById('prereqCyclePrev');
      const cycleObj = document.getElementById('prereqCycleObj');

      fillCourseSelect('prereqSelectPrev', cyclePrev.value);
      if (cycles.length > 1) cycleObj.value = cycles[1].id_ciclo;
      fillCourseSelect('prereqSelectObj', cycleObj.value);

      cyclePrev.addEventListener('change', () => fillCourseSelect('prereqSelectPrev', cyclePrev.value));
      cycleObj.addEventListener('change', () => fillCourseSelect('prereqSelectObj', cycleObj.value));

      document.getElementById('mallaAddPrereqForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const previo = Number(form.id_curso_previo.value);
        const objetivo = Number(form.id_curso_objetivo.value);

        if (!previo || !objetivo) { alert('Selecciona ambos cursos.'); return; }
        if (previo === objetivo) { alert('El curso previo y el objetivo no pueden ser el mismo.'); return; }

        const prevCycle = courses.find((c) => c.id_curso === previo);
        const objCycle = courses.find((c) => c.id_curso === objetivo);
        if (prevCycle && objCycle && prevCycle.id_ciclo >= objCycle.id_ciclo) {
          if (!confirm('⚠️ El prerrequisito está en un ciclo igual o posterior al curso objetivo. ¿Continuar?')) return;
        }

        const record = {
          id_curso_previo: previo,
          id_curso_objetivo: objetivo,
          comentarios_regla: form.comentarios_regla.value.trim() || null
        };

        const { error } = await state.client.from(TABLES.prerequisites).insert(record);
        if (error) { alert('Error al agregar prerrequisito: ' + error.message); return; }

        closeModal();
        await refreshData();
        showConnectionMessage('Prerrequisito vinculado.');
        setTimeout(hideConnectionMessage, 2400);
      });
    }

    async function mallaEditCourse(courseId) {
      const course = state.data.courses.find((c) => c.id_curso === courseId);
      if (!course) return;

      const cycleOptions = state.data.cycles
        .slice().sort((a, b) => a.numero_ciclo - b.numero_ciclo)
        .map((cy) => `<option value="${cy.id_ciclo}" ${cy.id_ciclo === course.id_ciclo ? 'selected' : ''}>${cy.numero_ciclo}. ${escapeHtml(cy.denominacion)}</option>`)
        .join('');

      const areaOptions = state.data.areas
        .map((a) => `<option value="${a.id_area}" ${a.id_area === course.id_area ? 'selected' : ''}>${escapeHtml(a.nombre_area)}</option>`)
        .join('');

      const body = `
        <form id="mallaEditCourseForm" class="form-grid">
          <div class="field">
            <label>Código</label>
            <input type="text" name="codigo_curso" required value="${escapeHtml(course.codigo_curso)}">
          </div>
          <div class="field">
            <label>Nombre</label>
            <input type="text" name="nombre" required value="${escapeHtml(course.nombre)}">
          </div>
          <div class="field">
            <label>Ciclo</label>
            <select name="id_ciclo" required>${cycleOptions}</select>
          </div>
          <div class="field">
            <label>Área académica</label>
            <select name="id_area" required>${areaOptions}</select>
          </div>
          <div class="field">
            <label>Créditos</label>
            <input type="number" name="creditos" required min="1" max="10" value="${course.creditos}">
          </div>
          <div class="field">
            <label>Modalidad</label>
            <select name="modalidad">
              <option ${course.modalidad === 'Presencial' ? 'selected' : ''}>Presencial</option>
              <option ${course.modalidad === 'Semipresencial' ? 'selected' : ''}>Semipresencial</option>
              <option ${course.modalidad === 'Virtual' ? 'selected' : ''}>Virtual</option>
            </select>
          </div>
          <div class="field" style="display:flex;align-items:center;gap:8px">
            <input type="checkbox" name="es_electivo" id="mallaEditElective" ${course.es_electivo ? 'checked' : ''}>
            <label for="mallaEditElective" style="margin:0">Es electivo</label>
          </div>
          <div class="wide" style="text-align:right;padding-top:8px">
            <button type="submit" class="mini-button primary">Guardar cambios</button>
          </div>
        </form>
      `;

      openModal('Editar curso', escapeHtml(course.nombre), body);

      document.getElementById('mallaEditCourseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const updates = {
          codigo_curso: form.codigo_curso.value.trim(),
          nombre: form.nombre.value.trim(),
          id_ciclo: Number(form.id_ciclo.value),
          id_area: Number(form.id_area.value),
          creditos: Number(form.creditos.value),
          modalidad: form.modalidad.value,
          es_electivo: form.es_electivo.checked
        };

        const { error } = await state.client.from(TABLES.courses).update(updates).eq('id_curso', courseId);
        if (error) { alert('Error al editar curso: ' + error.message); return; }

        closeModal();
        await refreshData();
        showConnectionMessage('Curso actualizado.');
        setTimeout(hideConnectionMessage, 2400);
      });
    }

    async function mallaDeleteCourse(courseId) {
      await confirmDeleteCourse(findRecord('courses', Number(courseId)));
    }

    /* ================================================================
    /* --- Exportar malla a PDF --- */

    async function mallaExportPdf() {
      const btn = document.getElementById('mallaExportPdf');
      btn.disabled = true;
      btn.textContent = '⏳ Generando...';

      try {
        const proc = state.processes.find((p) => p.id === state.mallaProcessId);
        const career = proc?.newPlan?.nombre_carrera || proc?.evaluatedPlan?.nombre_carrera || 'Sin carrera';
        const planYear = proc?.newPlan?.anio_version || proc?.evaluatedPlan?.anio_version || '';

        // Crear contenedor temporal para el PDF
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;width:1400px;background:#fff;padding:40px;font-family:"Plus Jakarta Sans",sans-serif;';
        document.body.appendChild(wrapper);

        // Header con logo
        const header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;gap:20px;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #8B1A1A;';
        header.innerHTML = `
          <img src="./logousmp.png" style="height:70px;width:auto;" crossorigin="anonymous">
          <div>
            <div style="font-size:22px;font-weight:800;color:#1a1a2e;">Malla Curricular</div>
            <div style="font-size:15px;color:#555;font-weight:600;">${escapeHtml(career)} — Plan ${escapeHtml(planYear)}</div>
            <div style="font-size:12px;color:#888;margin-top:2px;">Universidad de San Martín de Porres — Facultad de Ingeniería y Arquitectura</div>
          </div>
        `;
        wrapper.appendChild(header);

        // Clonar la grilla y la leyenda
        const gridClone = document.getElementById('mallaContainer').cloneNode(true);
        gridClone.style.position = 'relative';
        gridClone.style.overflow = 'visible';
        // Remover botones de eliminar/editar del clon
        gridClone.querySelectorAll('.malla-course-delete, .malla-course-edit').forEach((el) => el.remove());
        wrapper.appendChild(gridClone);

        const legendClone = document.getElementById('mallaLegend').cloneNode(true);
        legendClone.style.marginTop = '20px';
        // Reemplazar inputs color por swatches en el clon
        legendClone.querySelectorAll('.malla-legend-picker').forEach((input) => {
          const swatch = document.createElement('span');
          swatch.className = 'malla-legend-swatch';
          swatch.style.cssText = `display:inline-block;width:16px;height:16px;border-radius:3px;background:${input.value};border:1px solid rgba(0,0,0,0.12);flex-shrink:0;`;
          input.replaceWith(swatch);
        });
        // Quitar interactividad de los nombres
        legendClone.querySelectorAll('.malla-legend-name').forEach((el) => {
          const span = document.createElement('span');
          span.textContent = el.textContent;
          el.replaceWith(span);
        });
        wrapper.appendChild(legendClone);

        // Stats
        const stats = document.createElement('div');
        stats.style.cssText = 'margin-top:12px;font-size:11px;color:#888;text-align:right;';
        stats.textContent = `Generado el ${new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'long', year:'numeric' })}`;
        wrapper.appendChild(stats);

        // Renderizar a canvas
        const canvas = await html2canvas(wrapper, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        document.body.removeChild(wrapper);

        // Generar PDF landscape
        const { jsPDF } = window.jspdf;
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = canvas.width;
        const pdfHeight = canvas.height;
        const ratio = pdfWidth / pdfHeight;

        const pdf = new jsPDF({
          orientation: ratio > 1 ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const margin = 8;
        const usableW = pageW - margin * 2;
        const usableH = pageH - margin * 2;

        let finalW = usableW;
        let finalH = usableW / ratio;
        if (finalH > usableH) {
          finalH = usableH;
          finalW = usableH * ratio;
        }

        pdf.addImage(imgData, 'PNG', margin, margin, finalW, finalH);
        pdf.save(`Malla_${career.replace(/\s+/g, '_')}_${planYear}.pdf`);

        showConnectionMessage('PDF exportado correctamente.');
        setTimeout(hideConnectionMessage, 3000);
      } catch (err) {
        console.error('Error exportando PDF:', err);
        alert('Error al exportar PDF: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = '📄 Exportar PDF';
      }
    }

    /* ================================================================
       FIN MALLA CURRICULAR
       ================================================================ */

    function displayText(value) {
      const text = String(value ?? '');
      const replacements = {
        'En Curso': 'En curso',
        'En Revision': 'En revisión',
        'en revision': 'en revisión',
        Historico: 'Histórico',
        historico: 'histórico',
        'Referencia huerfana': 'Referencia huérfana'
      };
      const exact = replacements[text] || text;
      return exact
        .replace(/\bGestion\b/g, 'Gestión')
        .replace(/\bgestion\b/g, 'gestión')
        .replace(/\bIngenieria\b/g, 'Ingeniería')
        .replace(/\bingenieria\b/g, 'ingeniería')
        .replace(/\bComputacion\b/g, 'Computación')
        .replace(/\bcomputacion\b/g, 'computación')
        .replace(/\bRevision\b/g, 'Revisión')
        .replace(/\brevision\b/g, 'revisión')
        .replace(/\bHistorico\b/g, 'Histórico')
        .replace(/\bhistorico\b/g, 'histórico')
        .replace(/\bTecnologia\b/g, 'Tecnología')
        .replace(/\btecnologia\b/g, 'tecnología')
        .replace(/\bSatisfaccion\b/g, 'Satisfacción')
        .replace(/\bsatisfaccion\b/g, 'satisfacción')
        .replace(/\bCategoria\b/g, 'Categoría')
        .replace(/\bcategoria\b/g, 'categoría')
        .replace(/\bPoblacion\b/g, 'Población')
        .replace(/\bpoblacion\b/g, 'población')
        .replace(/\bInformacion\b/g, 'Información')
        .replace(/\binformacion\b/g, 'información')
        .replace(/\bAcademica\b/g, 'Académica')
        .replace(/\bacademica\b/g, 'académica')
        .replace(/\bAcademicas\b/g, 'Académicas')
        .replace(/\bacademicas\b/g, 'académicas')
        .replace(/\bBibliografia\b/g, 'Bibliografía')
        .replace(/\bbibliografia\b/g, 'bibliografía');
    }

    function formatDate(raw) {
      if (!raw) return 'Sin fecha';
      const date = new Date(raw);
      if (Number.isNaN(date.getTime())) return raw;
      return new Intl.DateTimeFormat('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char]));
    }

    function emptyTemplate(message) {
      return `<div class="empty">${escapeHtml(message)}</div>`;
    }

    function showConnectionMessage(message) {
      document.getElementById('connectionMessage').textContent = message;
      document.getElementById('connectionAlert').classList.add('is-visible');
    }

    function hideConnectionMessage() {
      document.getElementById('connectionAlert').classList.remove('is-visible');
    }

document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    const isDark = localStorage.getItem('usmp_theme') === 'dark';
    if (isDark) {
        document.body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '☀️'; // Sun
    } else {
        themeToggleBtn.innerHTML = '🌙'; // Moon
    }

    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const currentlyDark = document.body.classList.contains('dark-theme');
      localStorage.setItem('usmp_theme', currentlyDark ? 'dark' : 'light');
      themeToggleBtn.innerHTML = currentlyDark ? '☀️' : '🌙';
    });
  }
});
