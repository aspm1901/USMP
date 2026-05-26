const CONFIG = {
      SUPABASE_URL: 'https://syanolcxbjarcmpxkmqf.supabase.co',
      SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5YW5vbGN4YmphcmNtcHhrbXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MzA2OTYsImV4cCI6MjA5NDQwNjY5Nn0.bV93pPhfVpBGBRpodmttKuHf57ty7kFE0gUkB4jnwsQ'
    };

    const TABLES = {
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
      answers: 'respuesta_encuesta',
      prerequisites: 'prerrequisito'
    };

    const state = {
      client: null,
      data: null,
      processes: [],
      filtered: [],
      selectedId: null,
      activeModule: 'dashboard',
      activeDetailTab: 'timeline',
      selectedTimelineStep: {},
      activeSupport: 'courses',
      supportFilters: {},
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
          { name: 'motivo_revision', label: 'Motivo de revision', type: 'textarea' }
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
          { name: 'fecha_ejecucion', label: 'Fecha ejecucion', type: 'date' },
          { name: 'estado_fase', label: 'Estado fase', type: 'select-static', options: ['Aprobado', 'Observado', 'En Curso', 'Finalizado'] },
          { name: 'observaciones_revision', label: 'Observaciones', type: 'textarea' }
        ]
      },
      evidence: {
        table: TABLES.evidence,
        label: 'evidencia',
        pk: 'id_evidencia',
        fields: [
          { name: 'id_historial', label: 'Fase historica', type: 'select', source: 'history', value: 'id_historial', text: historyOptionLabel },
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
          { name: 'anio_version', label: 'Anio version', type: 'number' },
          { name: 'nombre_carrera', label: 'Carrera', type: 'text' },
          { name: 'total_creditos_requeridos', label: 'Creditos requeridos', type: 'number' },
          { name: 'estado', label: 'Estado', type: 'select-static', options: ['Historico', 'Vigente', 'En Revision', 'Propuesta'] }
        ]
      },
      courses: {
        table: TABLES.courses,
        label: 'curso',
        pk: 'id_curso',
        fields: [
          { name: 'id_plan', label: 'Plan', type: 'select', source: 'plans', value: 'id_plan', text: planLabel },
          { name: 'id_area', label: 'Area', type: 'select', source: 'areas', value: 'id_area', text: (item) => item.nombre_area },
          { name: 'id_ciclo', label: 'Ciclo', type: 'select', source: 'cycles', value: 'id_ciclo', text: (item) => `${item.numero_ciclo}. ${item.denominacion}` },
          { name: 'codigo_curso', label: 'Codigo', type: 'text' },
          { name: 'nombre', label: 'Nombre', type: 'text' },
          { name: 'creditos', label: 'Creditos', type: 'number' },
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
          { name: 'id_poblacion', label: 'Poblacion', type: 'select', source: 'populations', value: 'id_poblacion', text: (item) => item.tipo_poblacion },
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
      showConnectionMessage('Cargando informacion desde Supabase...');

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
      document.getElementById('loginButton').addEventListener('click', openLoginModal);
      document.getElementById('logoutButton').addEventListener('click', signOut);
      document.getElementById('modalClose').addEventListener('click', closeModal);
      document.getElementById('modalOverlay').addEventListener('click', (event) => {
        if (event.target.id === 'modalOverlay') closeModal();
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
    }

    function fillSelect(id, label, values) {
      const select = document.getElementById(id);
      select.innerHTML = `<option value="">${label}</option>${values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('')}`;
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
      renderMetrics();
      renderAuthorityInsights();
      renderProcessList();
      renderDetail();
      renderSupport();
      renderAdminHome();
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
      const progress = average(state.processes.map((item) => item.progress));
      const observed = state.processes.filter((item) => normalizeText(item.status).includes('observado')).length;
      const done = state.processes.filter((item) => normalizeText(item.status).includes('finalizado')).length;
      const attention = attentionItems().length;
      const feedback = average(state.data.answers.map((item) => Number(item.valor_respuesta)));
      const activePeriod = activePeriodLabel();

      document.getElementById('metricTotal').textContent = state.processes.length;
      document.getElementById('metricProgress').textContent = `${Math.round(progress)}%`;
      document.getElementById('metricObserved').textContent = observed;
      document.getElementById('metricDone').textContent = done;
      document.getElementById('metricAttention').textContent = attention;
      document.getElementById('metricActivePeriod').textContent = activePeriod;
      document.getElementById('metricEvidence').textContent = state.data.evidence.length;
      document.getElementById('metricFeedback').textContent = feedback ? feedback.toFixed(1) : '0.0';
    }

    function renderAuthorityInsights() {
      const attention = attentionItems();
      const bottlenecks = bottleneckItems();
      const feedbackAlerts = feedbackAlertItems();

      document.getElementById('attentionCount').textContent = `${attention.length} casos`;
      document.getElementById('attentionList').innerHTML = attention.length
        ? attention.slice(0, 5).map((item) => insightItemTemplate(item.title, item.detail, item.meta, item.status)).join('')
        : emptyTemplate('No hay procesos observados ni fases observadas.');

      document.getElementById('bottleneckCount').textContent = `${bottlenecks.length} alertas`;
      document.getElementById('bottleneckList').innerHTML = bottlenecks.length
        ? bottlenecks.slice(0, 5).map((item) => insightItemTemplate(item.title, item.detail, item.meta, 'Observado')).join('')
        : emptyTemplate('No se detectan brechas criticas con los datos actuales.');

      const responsible = responsibleSummary();
      document.getElementById('responsibleList').innerHTML = responsible.length
        ? responsible.map((item) => insightItemTemplate(item.actor, `${item.count} fase(s) registradas`, item.dependency, 'Aprobado')).join('')
        : emptyTemplate('Aun no hay responsables registrados.');

      document.getElementById('feedbackAlertCount').textContent = `${feedbackAlerts.length} alertas`;
      document.getElementById('feedbackAlertList').innerHTML = feedbackAlerts.length
        ? feedbackAlerts.slice(0, 5).map((item) => insightItemTemplate(item.title, item.detail, item.meta, 'Observado')).join('')
        : emptyTemplate('No hay carreras con feedback bajo segun las respuestas actuales.');
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
      return state.processes
        .filter((item) => isObserved(item.status) || item.history.some((entry) => isObserved(entry.estado_fase)))
        .map((item) => {
          const observedPhase = item.history.find((entry) => isObserved(entry.estado_fase));
          return {
            title: item.career,
            detail: observedPhase?.observaciones_revision || item.latest?.observaciones_revision || item.raw.motivo_revision || 'Requiere revision.',
            meta: `${item.period?.nombre_periodo || 'Sin periodo'} - PC01-${item.id}`,
            status: observedPhase?.estado_fase || item.status
          };
        });
    }

    function bottleneckItems() {
      return state.processes.flatMap((item) => {
        const missingBeforeLatest = item.fullTimeline
          .filter(({ step, entry }) => !entry && step.numero_paso < item.currentStep)
          .map(({ step }) => ({
            title: item.career,
            detail: `Paso ${step.numero_paso} sin registro antes del ultimo paso documentado.`,
            meta: step.descripcion_paso
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
              detail: item.latest?.observaciones_revision || item.raw.motivo_revision || 'Proceso observado sin detalle adicional.',
              meta: 'Observacion activa'
            }]
          : [];

        return [...missingBeforeLatest, ...lowEvidence, ...observedComment];
      });
    }

    function responsibleSummary() {
      const counts = new Map();
      state.data.history.forEach((entry) => {
        const actor = state.data.actors.find((item) => item.id_actor === entry.id_actor);
        const key = actor?.siglas || 'Sin actor';
        if (!counts.has(key)) {
          counts.set(key, {
            actor: key,
            dependency: actor?.nombre_dependencia || 'Sin dependencia',
            count: 0
          });
        }
        counts.get(key).count += 1;
      });

      return [...counts.values()].sort((a, b) => b.count - a.count);
    }

    function feedbackAlertItems() {
      const questions = mapBy(state.data.questions, 'id_pregunta');
      const plans = mapBy(state.data.plans, 'id_plan');
      const byPlan = groupBy(state.data.answers, 'id_plan');
      const alerts = [];

      byPlan.forEach((answers, planId) => {
        const plan = plans.get(Number(planId));
        const avg = average(answers.map((item) => Number(item.valor_respuesta)));
        if (avg > 0 && avg < 3) {
          alerts.push({
            title: plan?.nombre_carrera || `Plan ${planId}`,
            detail: `Feedback promedio bajo: ${avg.toFixed(1)} de 5. Conviene revisar comentarios y causas recurrentes.`,
            meta: planLabel(plan)
          });
        }

        const byCategory = groupBy(answers, (answer) => questions.get(answer.id_pregunta)?.categoria || 'Sin categoria');
        byCategory.forEach((categoryAnswers, category) => {
          const categoryAvg = average(categoryAnswers.map((item) => Number(item.valor_respuesta)));
          if (categoryAvg > 0 && categoryAvg < 3) {
            alerts.push({
              title: plan?.nombre_carrera || `Plan ${planId}`,
              detail: `${category}: promedio ${categoryAvg.toFixed(1)} de 5.`,
              meta: 'Categoria critica de encuesta'
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
              <div class="process-career">${escapeHtml(item.career)}</div>
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
          <div class="process-reason">${escapeHtml(item.raw.motivo_revision || 'Sin motivo registrado')}</div>
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
              <h2>${escapeHtml(item.career)}</h2>
              <p class="reason">${escapeHtml(item.raw.motivo_revision || 'Sin motivo registrado.')}</p>
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
            ${summaryItem('Ultima fase', item.latest ? `Paso ${item.latest.step?.numero_paso || item.latest.id_paso}: ${item.latest.estado_fase}` : 'Sin historial')}
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
            <p>${escapeHtml(item.raw.motivo_revision || 'No se registro motivo de revision.')}</p>
          </div>
          <div class="public-status-grid">
            ${summaryItem('Estado actual', item.status)}
            ${summaryItem('Ultimo paso', item.latest ? `Paso ${item.latest.step?.numero_paso || item.latest.id_paso}: ${item.latest.estado_fase}` : 'Sin historial')}
            ${summaryItem('Responsable', latestActor ? `${latestActor.siglas} - ${latestActor.nombre_dependencia}` : 'Sin responsable registrado')}
            ${summaryItem('Proximo paso esperado', nextStep ? `Paso ${nextStep.numero_paso}: ${nextStep.descripcion_paso}` : 'Proceso culminado o sin siguiente paso')}
          </div>
        </section>
      `;
    }

    function publicStatusMessage(item) {
      const status = normalizeText(item.status);
      if (status.includes('finalizado')) return 'El proceso curricular se encuentra culminado.';
      if (status.includes('observado')) return 'El proceso requiere correccion o revision antes de continuar.';
      return 'El proceso curricular se encuentra en evaluacion.';
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
          ${summaryItem('Ultimo responsable', latestActor ? `${latestActor.siglas} - ${latestActor.nombre_dependencia}` : 'Sin responsable')}
          ${summaryItem('Ultima fecha', item.latest ? formatDate(item.latest.fecha_ejecucion) : 'Sin fecha')}
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
              <button class="step-chip${step.id_paso === selected.step.id_paso ? ' is-active' : ''}${entry ? ' is-registered' : ' is-missing'}" type="button" data-timeline-step="${step.id_paso}" title="${escapeHtml(step.descripcion_paso || '')}">
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
            ${legendItem('En Curso', 'Proceso en evaluacion')}
            ${legendItem('Observado', 'Requiere correccion o revision')}
            ${legendItem('Sin registro', 'Paso aun no documentado')}
          </div>
        </div>
      `;
    }

    function timelineEntryTemplate(item, step, entry, extraEntries) {
      return `
              <div class="step-number">${step.numero_paso}</div>
              <div>
                <h3 class="timeline-title">${escapeHtml(step.descripcion_paso || 'Paso sin descripcion')}</h3>
                <div class="timeline-meta">
                  <span>${statusBadge(entry?.estado_fase || 'Sin registro')}</span>
                  <span>${entry ? formatDate(entry.fecha_ejecucion) : 'Fecha pendiente'}</span>
                  <span>${entry ? `${escapeHtml(entry.actor?.siglas || 'Actor')} - ${escapeHtml(entry.actor?.nombre_dependencia || 'Sin dependencia')}` : 'Sin actor registrado'}</span>
                  <span>${entry ? entry.evidence.length : 0} evidencia(s)</span>
                </div>
                <div class="timeline-note">${escapeHtml(entry?.observaciones_revision || 'Este paso aun no tiene registro en historial_fase para este expediente.')}</div>
                ${entry?.evidence?.length ? `<div class="timeline-meta">${entry.evidence.map((doc) => `<span>${escapeHtml(doc.tipo_documento)} - ${escapeHtml(doc.ruta_archivo_pdf)}</span>`).join('')}</div>` : ''}
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
        carrera: plan?.nombre_carrera || '-',
        creditos: plan?.total_creditos_requeridos || '-',
        estado: plan?.estado || '-'
      }));

      const courses = item.courses
        .slice()
        .sort((a, b) => (a.id_plan - b.id_plan) || (a.id_ciclo - b.id_ciclo) || a.nombre.localeCompare(b.nombre, 'es'));

      return `
        <div class="section-grid">
          <div class="info-card">
            <div class="info-card-header">Comparacion de planes</div>
            <div class="info-card-body">${simpleTable(planRows, ['tipo', 'version', 'carrera', 'creditos', 'estado'])}</div>
          </div>
          <div class="info-card">
            <div class="info-card-header">Lectura rapida</div>
            <div class="info-card-body">
              <div class="summary-grid">
                ${summaryItem('Cursos visibles', courses.length)}
                ${summaryItem('Creditos en cursos', sum(courses.map((course) => course.creditos)))}
                ${summaryItem('Modalidades', unique(courses.map((course) => course.modalidad)).join(', ') || '-')}
                ${summaryItem('Areas', unique(courses.map((course) => areaName(course.id_area))).length)}
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
          <div class="course-name">${escapeHtml(course.nombre)}</div>
          <div class="course-meta">
            <span>${escapeHtml(cycle?.denominacion || `Ciclo ${course.id_ciclo}`)}</span>
            <span>${escapeHtml(areaName(course.id_area))}</span>
            <span>${course.creditos} creditos</span>
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
      const grouped = groupBy(item.answers, (answer) => questions.get(answer.id_pregunta)?.categoria || 'Sin categoria');
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
                <span>${escapeHtml(population?.tipo_poblacion || 'Poblacion')}</span>
                <span>${escapeHtml(question?.categoria || 'Categoria')}</span>
                <span>Puntaje ${answer.valor_respuesta}/5</span>
                <span>${formatDate(answer.fecha_respuesta)}</span>
              </div>
              <div class="timeline-note">${escapeHtml(answer.comentario || 'Sin comentario.')}</div>
              <div class="mini muted">${escapeHtml(question?.texto_pregunta || '')}</div>
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
                  <span>${step ? `Paso ${step.numero_paso}: ${step.descripcion_paso}` : 'Paso no identificado'}</span>
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
      const supports = [
        ['courses', 'Planes y cursos', supportCourses],
        ['answers', 'Feedback', supportAnswers],
        ['evidence', 'Evidencias', supportEvidence],
        ['prerequisites', 'Prerrequisitos', supportPrerequisites],
        ['catalogs', 'Catalogos', supportCatalogs]
      ];

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

    function renderSupportContent(tableKey, payload) {
      if (typeof payload === 'string') return payload;

      const query = state.supportFilters[tableKey] || '';
      const filteredRows = filterSupportRows(payload.rows, query);
      const pageSize = state.supportPageSize;
      const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
      const currentPage = Math.min(state.supportPages[tableKey] || 1, totalPages);
      state.supportPages[tableKey] = currentPage;
      const start = (currentPage - 1) * pageSize;
      const pagedRows = filteredRows.slice(start, start + pageSize);

      return `
        <div class="support-tools">
          <div class="field">
            <label for="supportSearch">Filtrar consulta</label>
            <input id="supportSearch" type="search" value="${escapeHtml(query)}" placeholder="Buscar en ${escapeHtml(payload.label.toLowerCase())}">
          </div>
          <div class="field">
            <label for="supportPageSize">Filas</label>
            <select id="supportPageSize">
              ${[5, 10, 20, 50].map((size) => `<option value="${size}" ${size === pageSize ? 'selected' : ''}>${size}</option>`).join('')}
            </select>
          </div>
          <button id="supportClearFilter" class="mini-button" type="button">Limpiar</button>
        </div>
        ${editableTable(pagedRows, payload.columns, payload.tableKey, filteredRows.length)}
        <div class="pagination">
          <button class="mini-button" type="button" data-support-page="prev" ${currentPage <= 1 ? 'disabled' : ''}>Anterior</button>
          <span class="pagination-note">Pagina ${currentPage} de ${totalPages} - ${filteredRows.length} registros</span>
          <button class="mini-button" type="button" data-support-page="next" ${currentPage >= totalPages ? 'disabled' : ''}>Siguiente</button>
        </div>
      `;
    }

    function bindSupportControls() {
      const search = document.getElementById('supportSearch');
      if (search) {
        search.addEventListener('input', () => {
          state.supportFilters[state.activeSupport] = search.value;
          state.supportPages[state.activeSupport] = 1;
          renderSupport();
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
          state.supportPages[state.activeSupport] = 1;
          renderSupport();
        });
      }

      document.querySelectorAll('[data-support-page]').forEach((button) => {
        button.addEventListener('click', () => {
          const direction = button.dataset.supportPage === 'next' ? 1 : -1;
          state.supportPages[state.activeSupport] = Math.max(1, (state.supportPages[state.activeSupport] || 1) + direction);
          renderSupport();
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

    function renderAdminHome() {
      const container = document.getElementById('adminHomeContent');
      if (!container) return;

      if (!state.isAdmin) {
        container.innerHTML = `
          <div class="admin-home-body">
            <div class="admin-login-note">
              Para modificar datos inicia sesion como administrador. En modo invitado la plataforma queda como consulta publica, sin botones de crear, editar ni eliminar.
            </div>
            <button id="adminModuleLogin" class="btn" type="button">Ingresar como admin</button>
          </div>
        `;
        document.getElementById('adminModuleLogin').addEventListener('click', openLoginModal);
        return;
      }

      const actions = [
        ['processes', 'Nuevo expediente', 'Registra un proceso curricular PC01.'],
        ['history', 'Nueva fase', 'Agrega un paso ejecutado dentro de la trazabilidad.'],
        ['evidence', 'Nueva evidencia', 'Vincula un documento a una fase registrada.'],
        ['plans', 'Nuevo plan', 'Crea una version de plan de estudio.'],
        ['courses', 'Nuevo curso', 'Agrega cursos a un plan curricular.'],
        ['prerequisites', 'Nuevo prerrequisito', 'Relaciona cursos objetivo y previos.']
      ];
      const surveyUrl = new URL('encuesta.html', window.location.href).href;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(surveyUrl)}`;

      container.innerHTML = `
        <div class="admin-home-body">
          <div class="survey-qr-card">
            <img src="${qrUrl}" alt="QR para formulario de encuesta">
            <div>
              <strong>Formulario publico de encuesta</strong>
              <p>Comparte este QR para que estudiantes, egresados o docentes registren feedback. Sus respuestas alimentan el tablero y las alertas.</p>
              <a class="mini-button" href="./encuesta.html" target="_blank" rel="noopener">Abrir formulario</a>
            </div>
          </div>
          <div class="admin-action-grid">
            ${actions.map(([tableKey, title, text]) => `
              <article class="admin-action-card">
                <div>
                  <strong>${escapeHtml(title)}</strong>
                  <p>${escapeHtml(text)}</p>
                </div>
                <button class="mini-button" type="button" data-admin-action="add-record" data-table-key="${tableKey}">Crear</button>
              </article>
            `).join('')}
          </div>
          <div class="admin-login-note">
            Para editar o eliminar registros existentes usa el modulo Consultas o el detalle del expediente seleccionado.
          </div>
        </div>
      `;
      bindAdminActionButtons();
    }

    function adminToolbarForSupport(activeSupport) {
      const actionBySupport = {
        plans: ['plans', 'Agregar plan'],
        courses: ['courses', 'Agregar curso'],
        prerequisites: ['prerequisites', 'Agregar prerrequisito'],
        evidence: ['evidence', 'Agregar evidencia']
      };
      const action = actionBySupport[activeSupport];
      if (!action) return '<div class="admin-toolbar"><span class="mini muted">Consulta sin creacion manual desde administracion</span></div>';

      return `
        <div class="admin-toolbar">
          <button class="mini-button" type="button" data-admin-action="add-record" data-table-key="${action[0]}">${action[1]}</button>
        </div>
      `;
    }

    function supportPlans() {
      const rows = state.data.plans.map((plan) => ({
        id: plan.id_plan,
        version: plan.anio_version,
        carrera: plan.nombre_carrera,
        creditos: plan.total_creditos_requeridos,
        estado: plan.estado,
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
      const rows = state.data.answers.map((answer) => ({
        fecha: formatDate(answer.fecha_respuesta),
        plan: planLabel(plans.get(answer.id_plan)),
        poblacion: populations.get(answer.id_poblacion)?.tipo_poblacion || '-',
        categoria: questions.get(answer.id_pregunta)?.categoria || '-',
        puntaje: `${answer.valor_respuesta}/5`,
        comentario: answer.comentario,
        _record: answer
      }));
      return { label: 'Feedback', rows, columns: ['fecha', 'plan', 'poblacion', 'categoria', 'puntaje', 'comentario'], tableKey: 'answers' };
    }

    function supportPrerequisites() {
      const courses = mapBy(state.data.courses, 'id_curso');
      const rows = state.data.prerequisites.map((item) => ({
        curso: courses.get(item.id_curso_objetivo)?.nombre || item.id_curso_objetivo,
        requisito: courses.get(item.id_curso_previo)?.nombre || item.id_curso_previo,
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
          paso: step ? `${step.numero_paso}. ${step.descripcion_paso}` : '-',
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
          <div class="info-card"><div class="info-card-header">Areas academicas</div><div class="info-card-body">${simpleTable(state.data.areas, ['nombre_area', 'color_hexadecimal'])}</div></div>
          <div class="info-card"><div class="info-card-header">Ciclos academicos</div><div class="info-card-body">${simpleTable(state.data.cycles, ['numero_ciclo', 'denominacion'])}</div></div>
          <div class="info-card"><div class="info-card-header">Periodos</div><div class="info-card-body">${simpleTable(state.data.periods, ['nombre_periodo', 'fecha_inicio', 'fecha_fin', 'estado'])}</div></div>
          <div class="info-card"><div class="info-card-header">Pasos PC01</div><div class="info-card-body">${simpleTable(state.data.steps, ['numero_paso', 'descripcion_paso'])}</div></div>
          <div class="info-card"><div class="info-card-header">Poblaciones objetivo</div><div class="info-card-body">${simpleTable(state.data.populations, ['tipo_poblacion'])}</div></div>
          <div class="info-card"><div class="info-card-header">Preguntas de encuesta</div><div class="info-card-body">${simpleTable(state.data.questions, ['categoria', 'texto_pregunta'])}</div></div>
        </div>
      `;
    }

    function summaryItem(label, value) {
      return `
        <div class="summary-item">
          <div class="summary-label">${escapeHtml(label)}</div>
          <div class="summary-value">${escapeHtml(String(value ?? '-'))}</div>
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
                <tr>${columns.map((column) => `<td>${escapeHtml(row[column] ?? '-')}</td>`).join('')}</tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    function editableTable(rows, columns, tableKey) {
      if (!rows.length) return emptyTemplate('Sin registros para mostrar.');
      const config = EDIT_CONFIG[tableKey];

      return `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                ${columns.map((column) => `<th>${escapeHtml(labelize(column))}</th>`).join('')}
                <th class="admin-only">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((row) => {
                const recordId = encodeRecordId(config, row._record);
                return `
                  <tr>
                    ${columns.map((column) => `<td>${escapeHtml(row[column] ?? '-')}</td>`).join('')}
                    <td class="action-cell admin-only">
                      <button class="mini-button" type="button" data-admin-action="edit-record" data-table-key="${tableKey}" data-record-id="${escapeHtml(recordId)}">Editar</button>
                      <button class="mini-button danger" type="button" data-admin-action="delete-record" data-table-key="${tableKey}" data-record-id="${escapeHtml(recordId)}">Eliminar</button>
                    </td>
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
          showConnectionMessage(`No se pudo iniciar sesion: ${error.message}`);
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
              ${options.map((option) => `<option value="${escapeHtml(option.value)}" ${String(option.value) === String(value) ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
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
      document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModal));
    }

    function closeModal() {
      document.getElementById('modalOverlay').classList.remove('is-open');
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
      return `PC01-${item.id_proceso} - ${plan?.nombre_carrera || 'Sin carrera'}`;
    }

    function historyOptionLabel(item) {
      const step = state.data.steps.find((stepItem) => stepItem.id_paso === item.id_paso);
      return `Historial ${item.id_historial} - PC01-${item.id_proceso} - Paso ${step?.numero_paso || item.id_paso}`;
    }

    function courseOptionLabel(item) {
      return `${item.codigo_curso} - ${item.nombre}`;
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
      return `<span class="badge ${statusClass(status)}">${escapeHtml(status || 'Sin estado')}</span>`;
    }

    function planLabel(plan) {
      if (!plan) return 'Sin plan';
      return `${plan.nombre_carrera} ${plan.anio_version} - ${plan.total_creditos_requeridos} cred. - ${plan.estado}`;
    }

    function areaName(id) {
      return state.data.areas.find((area) => area.id_area === id)?.nombre_area || `Area ${id}`;
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
      return String(value).replace(/_/g, ' ');
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
