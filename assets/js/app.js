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
      activeSupport: 'courses',
      supportFilters: {},
      supportSelectFilters: {},
      supportPages: {},
      supportPageSize: 10,
      user: null,
      isAdmin: false
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
          { name: 'estado_proceso', label: 'Estado', type: 'select-static', options: ['En Curso', 'Observado', 'Finalizado'] },
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
          { name: 'id_historial', label: 'Fase histórica', type: 'select', source: 'history', value: 'id_historial', text: historyOptionLabel },
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
          { name: 'nombre_carrera', label: 'Carrera', type: 'text' },
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
          { name: 'id_plan', label: 'Plan', type: 'select', source: 'plans', value: 'id_plan', text: planLabel },
          { name: 'id_poblacion', label: 'Población', type: 'select', source: 'populations', value: 'id_poblacion', text: (item) => item.tipo_poblacion },
          { name: 'id_participante', label: 'Participante', type: 'select', source: 'participants', value: 'id_participante', text: participantLabel, required: false },
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

    async function refreshData() {
      const previousSelectedId = state.selectedId;
      state.data = await loadReadOnlyData(state.client);
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
          correo_participante: participant?.correo_institucional || answer.correo_institucional || '',
          participante: participant || null
        };
      });
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
      document.getElementById('loginButton').addEventListener('click', openLoginModal);
      document.getElementById('logoutButton').addEventListener('click', signOut);
      document.getElementById('modalClose').addEventListener('click', closeModal);
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
    }

    function fillSelect(id, label, values) {
      const select = document.getElementById(id);
      select.innerHTML = `<option value="">${label}</option>${values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('')}`;
    }

    function populateDashboardFilters() {
      const career = state.dashboardFilters.career;
      const population = state.dashboardFilters.population;
      const plan = state.dashboardFilters.plan;
      const currentPlanIds = dashboardCurrentPlanIds();
      const dashboardPlans = state.data.plans.filter((item) => currentPlanIds.has(Number(item.id_plan)));

      fillSelect('dashboardCareer', 'Todas', unique(dashboardPlans.map((item) => displayText(item.nombre_carrera))));
      fillSelect('dashboardPopulation', 'Todos', unique(state.data.populations.map((item) => displayText(item.tipo_poblacion))));

      const planSelect = document.getElementById('dashboardPlan');
      planSelect.innerHTML = `<option value="">Todos</option>${dashboardPlans.map((item) => `
        <option value="${escapeHtml(item.id_plan)}">${escapeHtml(planLabel(item))}</option>
      `).join('')}`;

      document.getElementById('dashboardCareer').value = [...document.getElementById('dashboardCareer').options].some((option) => option.value === career) ? career : '';
      document.getElementById('dashboardPopulation').value = population;
      document.getElementById('dashboardPlan').value = currentPlanIds.has(Number(plan)) ? plan : '';
      state.dashboardFilters.career = document.getElementById('dashboardCareer').value;
      state.dashboardFilters.plan = document.getElementById('dashboardPlan').value;
    }

    function updateDashboardFilter(event) {
      const map = {
        dashboardCareer: 'career',
        dashboardPopulation: 'population',
        dashboardPlan: 'plan'
      };
      state.dashboardFilters[map[event.target.id]] = event.target.value;
      renderDashboardSections();
    }

    function clearDashboardFilters() {
      state.dashboardFilters = { career: '', population: '', plan: '' };
      populateDashboardFilters();
      renderDashboardSections();
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
    }

    function renderDashboardSections() {
      renderMetrics();
      renderPriorityBoard();
      renderDashboardCharts();
      renderAuthorityInsights();
    }

    function renderActiveModule() {
      document.querySelectorAll('[data-module-target]').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.moduleTarget === state.activeModule);
      });
      document.querySelectorAll('[data-module-page]').forEach((section) => {
        section.classList.toggle('is-active', section.dataset.modulePage === state.activeModule);
      });
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
    }

    function renderPriorityBoard() {
      const container = document.getElementById('priorityBoard');
      if (!container) return;

      const urgent = [
        ...attentionItems().slice(0, 2).map((item) => ({
          label: 'Proceso observado',
          title: item.title,
          detail: item.detail,
          meta: item.meta,
          className: 'priority-danger'
        })),
        ...criticalQuestionItems().slice(0, 2).map((item) => ({
          label: 'Pregunta crítica',
          title: item.label,
          detail: `${item.avg.toFixed(1)} de 5 - ${item.detail}`,
          meta: item.meta,
          className: 'priority-danger'
        }))
      ].slice(0, 3);
      const lowSample = lowSampleItems().slice(0, 3);
      const missingEvidence = missingEvidenceItems().slice(0, 3);

      container.innerHTML = `
        <article class="priority-card priority-card-main">
          <div class="priority-card-header">
            <div>
              <h2 class="panel-title">Prioridades de atención</h2>
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
              <h2 class="panel-title">Muestra baja</h2>
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
              <h2 class="panel-title">Sin evidencia</h2>
              <span class="panel-note">Expedientes que necesitan respaldo</span>
            </div>
            <strong>${missingEvidence.length}</strong>
          </div>
          <div class="priority-list">
            ${missingEvidence.length ? missingEvidence.map(priorityItemTemplate).join('') : emptyTemplate('No hay expedientes sin evidencia para este filtro.')}
          </div>
        </article>
      `;
    }

    function priorityItemTemplate(item) {
      return `
        <div class="priority-item ${item.className || ''}">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.detail)}</p>
          <small>${escapeHtml(item.meta)}</small>
        </div>
      `;
    }

    function renderDashboardCharts() {
      renderCareerGroupChart();
      renderFeedbackStatusChart();
      renderCriticalQuestionChart();
    }

    function renderCareerGroupChart() {
      const container = document.getElementById('chartCareerGroup');
      if (!container) return;
      const plans = mapBy(state.data.plans, 'id_plan');
      const populations = mapBy(state.data.populations, 'id_poblacion');
      const questions = mapBy(state.data.questions, 'id_pregunta');
      const rows = Array.from(groupBy(dashboardAnswers(), (answer) => [
        dashboardPlanTitle(plans.get(answer.id_plan)),
        dashboardPlanMeta(plans.get(answer.id_plan)),
        populations.get(answer.id_poblacion)?.tipo_poblacion || 'Sin población'
      ].join('||')).entries())
        .map(([key, answers]) => {
          const [career, planMeta, population] = key.split('||');
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
            career,
            planMeta: displayText(planMeta),
            population: displayText(population),
            avg,
            count: answers.length,
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

    function renderFeedbackStatusChart() {
      const container = document.getElementById('chartFeedbackStatus');
      if (!container) return;
      const groups = [
        { key: 'critical', label: 'Crítico', className: 'feedback-status-critical', count: 0 },
        { key: 'warning', label: 'Revisar', className: 'feedback-status-warning', count: 0 },
        { key: 'ok', label: 'Adecuado', className: 'feedback-status-ok', count: 0 }
      ];
      dashboardAnswers().forEach((answer) => {
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

    function renderCriticalQuestionChart() {
      const container = document.getElementById('chartCriticalQuestions');
      if (!container) return;
      const rows = criticalQuestionItems().slice(0, 5);

      container.innerHTML = rows.length
        ? rows.map((item) => `
          <article class="critical-item">
            <div>
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(item.detail)}</span>
              <small>${escapeHtml(item.meta)} - ${item.count} respuesta(s)</small>
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
              <span>${escapeHtml(subtitle)} - ${count} respuesta(s) ${sample}</span>
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
      const sample = item.count < 3 ? '<span class="sample-note">Muestra baja</span>' : '';
      const critical = item.criticalQuestionCount
        ? `<span class="sample-note sample-note-danger">${item.criticalQuestionCount} pregunta(s) crítica(s)</span>`
        : '<span class="sample-note sample-note-ok">Sin críticas</span>';
      const topCritical = item.topCriticalLabel
        ? `<small>Aspecto más sensible: ${escapeHtml(displayText(item.topCriticalLabel))}</small>`
        : '<small>Sin preguntas críticas detectadas.</small>';

      return `
        <article class="bar-row feedback-group-row">
          <div class="bar-row-head">
            <div>
              <strong>${escapeHtml(item.career)}</strong>
              <span>${escapeHtml(item.planMeta)} - ${escapeHtml(item.population)} - ${item.count} respuesta(s) ${sample} ${critical}</span>
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

    function dashboardCurrentPlanIds() {
      const nonHistoricalPlans = state.data.plans
        .filter((plan) => !normalizeText(plan.estado).includes('historico'))
        .map((plan) => Number(plan.id_plan));

      return new Set(nonHistoricalPlans);
    }

    function dashboardSurveyPlanIds() {
      const currentPlanIds = dashboardCurrentPlanIds();
      return new Set([...currentPlanIds].filter((idPlan) => {
        const relatedProcesses = state.processes.filter((item) => [
          item.evaluatedPlan?.id_plan,
          item.newPlan?.id_plan
        ].map(Number).includes(idPlan));

        return !relatedProcesses.length || relatedProcesses.some((item) => item.currentStep <= FEEDBACK_COLLECTION_STEP);
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

    function criticalQuestionItems() {
      const questions = mapBy(state.data.questions, 'id_pregunta');
      const plans = mapBy(state.data.plans, 'id_plan');
      const populations = mapBy(state.data.populations, 'id_poblacion');
      return Array.from(groupBy(dashboardAnswers(), (answer) => [
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
            status: feedbackStatus(avg)
          };
        })
        .filter((item) => item.avg > 0)
        .sort((a, b) => a.avg - b.avg);
    }

    function lowSampleItems() {
      const plans = mapBy(state.data.plans, 'id_plan');
      const populations = mapBy(state.data.populations, 'id_poblacion');
      return Array.from(groupBy(dashboardAnswers(), (answer) => [
        answer.id_plan,
        answer.id_poblacion
      ].join('|')).entries())
        .map(([key, answers]) => {
          const [idPlan, idPopulation] = key.split('|').map(Number);
          const avg = average(answers.map((answer) => Number(answer.valor_respuesta)));
          return {
            label: 'Validar muestra',
            title: displayText(populations.get(idPopulation)?.tipo_poblacion || 'Población'),
            detail: `${answers.length} respuesta(s), promedio ${avg.toFixed(1)} de 5.`,
            meta: `${dashboardPlanTitle(plans.get(idPlan))} - ${dashboardPlanMeta(plans.get(idPlan))}`,
            count: answers.length,
            className: 'priority-warning'
          };
        })
        .filter((item) => item.count > 0 && item.count < 3)
        .sort((a, b) => a.count - b.count);
    }

    function missingEvidenceItems() {
      return dashboardProcesses()
        .filter((item) => !normalizeText(item.status).includes('finalizado') && item.evidence.length === 0)
        .map((item) => ({
          label: 'Falta respaldo',
          title: item.career,
          detail: 'Expediente en curso sin evidencias documentales registradas.',
          meta: `${item.period?.nombre_periodo || 'Sin periodo'} - PC01-${item.id}`,
          className: 'priority-warning'
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
      const active = panels[state.activeInsight] || panels.attention;

      document.getElementById('insightTabs').innerHTML = Object.entries(panels).map(([key, panel]) => `
        <button class="insight-tab${key === state.activeInsight ? ' is-active' : ''}" type="button" data-insight-tab="${key}">
          ${escapeHtml(panel.label)} (${panel.rows.length})
        </button>
      `).join('');
      document.getElementById('insightPanelTitle').textContent = active.label;
      document.getElementById('insightPanelNote').textContent = active.note;
      document.getElementById('insightPanelList').innerHTML = active.rows.length
        ? active.rows.slice(0, 6).map((item) => insightItemTemplate(item.title, item.detail, item.meta, active.status || item.status)).join('')
        : emptyTemplate(active.empty);

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
            status: observedPhase?.estado_fase || item.status
          };
        });
    }

    function bottleneckItems() {
      return dashboardProcesses().flatMap((item) => {
        const missingBeforeLatest = item.fullTimeline
          .filter(({ step, entry }) => !entry && step.numero_paso < item.currentStep)
          .map(({ step }) => ({
            title: item.career,
            detail: `Paso ${step.numero_paso} sin registro antes del último paso documentado.`,
            meta: displayText(step.descripcion_paso)
          }));

        const lowEvidence = !normalizeText(item.status).includes('finalizado') && item.evidence.length === 0
          ? [{
              title: item.career,
              detail: 'Expediente en curso sin evidencias documentales registradas.',
              meta: `${item.period?.nombre_periodo || 'Sin periodo'} - PC01-${item.id}`
            }]
          : [];

        const observedComment = isObserved(item.status)
          ? [{
              title: item.career,
              detail: displayText(item.latest?.observaciones_revision || item.raw.motivo_revision || 'Proceso observado sin detalle adicional.'),
              meta: 'Observación activa'
            }]
          : [];

        return [...missingBeforeLatest, ...lowEvidence, ...observedComment];
      });
    }

    function feedbackAlertItems() {
      const questions = mapBy(state.data.questions, 'id_pregunta');
      const plans = mapBy(state.data.plans, 'id_plan');
      const byPlan = groupBy(dashboardAnswers(), 'id_plan');
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

    function insightItemTemplate(title, detail, meta, status) {
      return `
        <article class="insight-item">
          <div class="insight-top">
            <strong>${escapeHtml(title)}</strong>
            ${statusBadge(status)}
          </div>
          <p>${escapeHtml(detail || '-')}</p>
          <span>${escapeHtml(meta || '')}</span>
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
                <button class="mini-button" type="button" data-admin-action="add-history" data-process-id="${item.id}">Agregar fase</button>
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
                    : `<button class="mini-button" type="button" data-admin-action="add-history" data-process-id="${item.id}" data-step-id="${step.id_paso}">Registrar fase</button>`}
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
            <div class="mini muted">${answers.length} respuesta(s)</div>
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
        ['courses', 'Planes y cursos', supportCourses],
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
        },
        {
          title: 'Modelo curricular',
          note: 'Planes, cursos y reglas académicas del plan de estudios.',
          actions: [
            ['plans', 'Nuevo plan', 'Crea una versión de plan de estudio.'],
            ['courses', 'Nuevo curso', 'Agrega cursos a un plan curricular.'],
            ['prerequisites', 'Nuevo prerrequisito', 'Relaciona cursos objetivo y previos.']
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
                  <h3>Encuesta y participantes</h3>
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
                  <h3>Pendientes administrativos</h3>
                  <p>Elementos que conviene revisar antes de presentar o tomar decisiones.</p>
                </div>
              </div>
              <div class="admin-pending-list">
                ${pending.length ? pending.map(adminPendingTemplate).join('') : emptyTemplate('No hay pendientes administrativos detectados.')}
              </div>
            </section>
          </div>

          <div class="admin-maintenance-grid">
            ${actionGroups.map((group) => `
              <section class="admin-section-card">
                <div class="admin-section-header">
                  <div>
                    <h3>${escapeHtml(group.title)}</h3>
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
            Para editar o eliminar registros existentes usa el módulo Consultas o el detalle del expediente seleccionado. Esta pestaña queda como centro de mantenimiento rápido para el administrador.
          </div>
        </div>
      `;
      bindAdminActionButtons();
      bindAdminSupportShortcuts();
    }

    function adminDiagnostics() {
      const unassignedQuestions = adminUnassignedQuestions();
      const currentProcesses = currentDashboardProcesses();
      const participants = state.data.participants || [];
      return [
        {
          label: 'Participantes',
          value: participants.length,
          note: `${state.data.answers.length} respuesta(s) registradas`
        },
        {
          label: 'Preguntas',
          value: state.data.questions.length,
          note: `${state.data.questionLinks.length} asignación(es) por carrera y grupo`
        },
        {
          label: 'Sin asignación',
          value: unassignedQuestions.length,
          note: 'Preguntas que no aparecerán en la encuesta'
        },
        {
          label: 'Sin evidencia',
          value: currentProcesses.filter((item) => !normalizeText(item.status).includes('finalizado') && item.evidence.length === 0).length,
          note: 'Expedientes vigentes o activos sin respaldo'
        }
      ];
    }

    function adminUnassignedQuestions() {
      const assignedIds = new Set((state.data.questionLinks || []).map((link) => Number(link.id_pregunta)));
      return (state.data.questions || []).filter((question) => !assignedIds.has(Number(question.id_pregunta)));
    }

    function adminPendingItems() {
      const unassignedQuestions = adminUnassignedQuestions().slice(0, 2).map((question) => ({
        label: 'Pregunta sin asignación',
        title: displayText(question.categoria || `Pregunta ${question.id_pregunta}`),
        detail: displayText(question.texto_pregunta || 'Sin texto registrado.'),
        meta: 'Asignar carrera y grupo de interés',
        className: 'priority-warning'
      }));
      const evidence = missingEvidenceItems().slice(0, 2);
      const lowSample = lowSampleItems().slice(0, 1);
      return [...unassignedQuestions, ...evidence, ...lowSample].slice(0, 5);
    }

    function adminStatTemplate(item) {
      return `
        <article class="admin-stat-card">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
          <p>${escapeHtml(item.note)}</p>
        </article>
      `;
    }

    function adminPendingTemplate(item) {
      return `
        <article class="priority-item ${escapeHtml(item.className || 'priority-warning')}">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.detail)}</p>
          <em>${escapeHtml(item.meta)}</em>
        </article>
      `;
    }

    function bindAdminSupportShortcuts() {
      document.querySelectorAll('[data-admin-support]').forEach((button) => {
        button.addEventListener('click', () => {
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
      return { label: 'Planes y cursos', rows, columns: ['id', 'version', 'carrera', 'creditos', 'estado'], tableKey: 'plans' };
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
      return { label: 'Planes y cursos', rows, columns: ['codigo', 'curso', 'plan', 'area', 'ciclo', 'creditos', 'modalidad'], tableKey: 'courses' };
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

      const participantKeys = answers.map((answer) => [
        answer.id_participante || answer.correo_participante || `respuesta-${answer.id_respuesta}`,
        answer.id_plan,
        answer.id_poblacion
      ].join('|'));
      const uniqueParticipants = unique(participantKeys).length;
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
        ['Promedio general', overall ? overall.toFixed(1) : '0.0', feedbackStatus(overall).label],
        ['Participantes únicos', uniqueParticipants, 'Por correo, carrera y grupo'],
        ['Puntajes críticos', criticalCount, 'Respuestas menores a 3'],
        ['Comentarios', comments, 'Aclaraciones opcionales']
      ].map(([label, value, note]) => `
        <article class="score-card">
          <div class="mini muted">${escapeHtml(label)}</div>
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
              <small>${item.participants ? `${item.participants} participante(s) - ` : ''}${item.count} respuesta(s)</small>
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
                <em>${item.participants} participante(s) - ${item.count} respuesta(s)</em>
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
              <small>${escapeHtml(item.meta)} - ${item.count} respuesta(s)</small>
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
      if (action === 'add-evidence') openRecordForm('evidence', { fecha_carga: dateTimeLocalValue(new Date()) });
      if (action === 'edit-evidence') openRecordForm('evidence', findRecord('evidence', Number(button.dataset.id)));
      if (action === 'delete-evidence') confirmDelete('evidence', findRecord('evidence', Number(button.dataset.id)));
      if (action === 'edit-course') openRecordForm('courses', findRecord('courses', Number(button.dataset.id)));
      if (action === 'delete-course') confirmDelete('courses', findRecord('courses', Number(button.dataset.id)));
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
      const wide = field.type === 'textarea' || field.name.includes('comentario') || field.name.includes('motivo') ? ' wide' : '';
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
          : (state.data[field.source] || []).map((item) => ({ value: item[field.value], label: field.text(item) }));
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
      return `Historial ${item.id_historial} - PC01-${item.id_proceso} - Paso ${step?.numero_paso || item.id_paso}`;
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
      return answer.id_participante || answer.correo_participante || `respuesta-${answer.id_respuesta}`;
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
        area: 'área',
        categoria: 'categoría',
        codigo: 'código',
        nombre_area: 'área académica',
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
