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
      data: null,
      processes: [],
      filtered: [],
      selectedId: null,
      activeDetailTab: 'timeline',
      activeSupport: 'courses'
    };

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
      bindEvents();
      showConnectionMessage('Cargando informacion desde Supabase...');

      try {
        const client = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        state.data = await loadReadOnlyData(client);
        state.processes = buildProcesses(state.data);
        state.filtered = state.processes;
        state.selectedId = state.processes[0]?.id || null;
        hideConnectionMessage();
        populateFilters();
        render();
      } catch (error) {
        console.error(error);
        showConnectionMessage('No se pudo consultar Supabase. Revisa permisos SELECT, red o nombres de tablas.');
      }
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
      document.getElementById('searchInput').addEventListener('input', applyFilters);
      document.getElementById('filterPeriod').addEventListener('change', applyFilters);
      document.getElementById('filterCareer').addEventListener('change', applyFilters);
      document.getElementById('filterStatus').addEventListener('change', applyFilters);
      document.getElementById('clearFilters').addEventListener('click', clearFilters);
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
      renderMetrics();
      renderProcessList();
      renderDetail();
      renderSupport();
    }

    function renderMetrics() {
      const progress = average(state.processes.map((item) => item.progress));
      const observed = state.processes.filter((item) => normalizeText(item.status).includes('observado')).length;
      const feedback = average(state.data.answers.map((item) => Number(item.valor_respuesta)));

      document.getElementById('metricTotal').textContent = state.processes.length;
      document.getElementById('metricProgress').textContent = `${Math.round(progress)}%`;
      document.getElementById('metricObserved').textContent = observed;
      document.getElementById('metricFeedback').textContent = feedback ? feedback.toFixed(1) : '0.0';
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
      return `
        <div class="timeline">
          ${item.fullTimeline.map(({ step, entry, extraEntries }) => `
            <article class="timeline-item${entry ? '' : ' is-missing'}">
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
              </div>
            </article>
          `).join('')}
        </div>
      `;
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
                <div class="timeline-meta">
                  <span>${escapeHtml(doc.tipo_documento)}</span>
                  <span>${formatDate(doc.fecha_carga)}</span>
                  <span>Paso ${escapeHtml(step?.numero_paso || '-')}</span>
                </div>
                <div class="timeline-note">${escapeHtml(doc.ruta_archivo_pdf)}</div>
              </article>
            `;
          }).join('')}
        </div>
      `;
    }

    function renderSupport() {
      const supports = [
        ['plans', 'Planes', supportPlans()],
        ['courses', 'Cursos', supportCourses()],
        ['answers', 'Encuestas', supportAnswers()],
        ['prerequisites', 'Prerrequisitos', supportPrerequisites()],
        ['evidence', 'Evidencias', supportEvidence()],
        ['catalogs', 'Catalogos', supportCatalogs()]
      ];

      document.getElementById('supportTabs').innerHTML = supports.map(([id, label]) => {
        const active = state.activeSupport === id ? ' is-active' : '';
        return `<button class="tab-btn${active}" type="button" data-support-tab="${id}">${label}</button>`;
      }).join('');

      const active = supports.find(([id]) => id === state.activeSupport) || supports[0];
      document.getElementById('supportContent').innerHTML = active[2];

      document.querySelectorAll('[data-support-tab]').forEach((button) => {
        button.addEventListener('click', () => {
          state.activeSupport = button.dataset.supportTab;
          renderSupport();
        });
      });
    }

    function supportPlans() {
      const rows = state.data.plans.map((plan) => ({
        id: plan.id_plan,
        version: plan.anio_version,
        carrera: plan.nombre_carrera,
        creditos: plan.total_creditos_requeridos,
        estado: plan.estado
      }));
      return simpleTable(rows, ['id', 'version', 'carrera', 'creditos', 'estado']);
    }

    function supportCourses() {
      const rows = state.data.courses.map((course) => ({
        codigo: course.codigo_curso,
        curso: course.nombre,
        plan: planLabel(state.data.plans.find((plan) => plan.id_plan === course.id_plan)),
        area: areaName(course.id_area),
        ciclo: state.data.cycles.find((cycle) => cycle.id_ciclo === course.id_ciclo)?.denominacion || course.id_ciclo,
        creditos: course.creditos,
        modalidad: course.modalidad
      }));
      return simpleTable(rows, ['codigo', 'curso', 'plan', 'area', 'ciclo', 'creditos', 'modalidad']);
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
        comentario: answer.comentario
      }));
      return simpleTable(rows, ['fecha', 'plan', 'poblacion', 'categoria', 'puntaje', 'comentario']);
    }

    function supportPrerequisites() {
      const courses = mapBy(state.data.courses, 'id_curso');
      const rows = state.data.prerequisites.map((item) => ({
        curso: courses.get(item.id_curso_objetivo)?.nombre || item.id_curso_objetivo,
        requisito: courses.get(item.id_curso_previo)?.nombre || item.id_curso_previo,
        regla: item.comentarios_regla
      }));
      return simpleTable(rows, ['curso', 'requisito', 'regla']);
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
          carga: formatDate(doc.fecha_carga)
        };
      });
      return simpleTable(rows, ['documento', 'expediente', 'paso', 'ruta', 'carga']);
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
      return 'status-default';
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
