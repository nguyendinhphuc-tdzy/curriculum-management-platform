// -------------------------------------------------------------
// Global App State
// -------------------------------------------------------------
let activeLesson = null;
let currentLessonData = null;
let dirtyChanges = {
  vocabularies: {},
  sentences: {},
  dialogues: {}
};

// -------------------------------------------------------------
// DOM Elements
// -------------------------------------------------------------
const languageSelect = document.getElementById('language-select');
const levelSelect = document.getElementById('level-select');
const lessonsList = document.getElementById('lessons-list');
const currentLessonTitle = document.getElementById('current-lesson-title');
const lessonIdBadge = document.getElementById('lesson-id-badge');

const saveBtn = document.getElementById('save-btn');
const previewJsonBtn = document.getElementById('preview-json-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toast-text');

const vocabCount = document.getElementById('vocab-count');
const sentencesCount = document.getElementById('sentences-count');
const dialogueCount = document.getElementById('dialogue-count');

const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Modal Elements
const jsonModal = document.getElementById('json-modal');
const modalLessonId = document.getElementById('modal-lesson-id');
const jsonCodeBlock = document.getElementById('json-code-block');
const copyJsonBtn = document.getElementById('copy-json-btn');
const downloadJsonBtn = document.getElementById('download-json-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

// -------------------------------------------------------------
// Initialization
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadLessons();

  // Setup Event Listeners
  languageSelect.addEventListener('change', loadLessons);
  levelSelect.addEventListener('change', loadLessons);

  // Tabs toggle
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  // Buttons toggle
  saveBtn.addEventListener('click', saveChanges);
  previewJsonBtn.addEventListener('click', openJsonPreview);
  exportJsonBtn.addEventListener('click', exportJsonFile);

  // Modal close
  closeModalBtn.addEventListener('click', () => jsonModal.classList.remove('open'));
  window.addEventListener('click', (e) => {
    if (e.target === jsonModal) jsonModal.classList.remove('open');
  });

  copyJsonBtn.addEventListener('click', copyJsonToClipboard);
  downloadJsonBtn.addEventListener('click', downloadJsonFile);
});

// -------------------------------------------------------------
// Core Actions & API Integration
// -------------------------------------------------------------

// Fetch lessons based on current language & level filter
async function loadLessons() {
  lessonsList.innerHTML = '<li class="loading-item">Loading lessons...</li>';
  resetWorkspace();

  const lang = languageSelect.value;
  const lvl = levelSelect.value;

  try {
    const res = await fetch(`/api/lessons?language=${lang}&level=${lvl}`);
    const lessons = await res.json();

    lessonsList.innerHTML = '';
    if (lessons.length === 0) {
      lessonsList.innerHTML = '<li class="loading-item">No lessons found.</li>';
      return;
    }

    lessons.forEach(lesson => {
      const li = document.createElement('li');
      li.dataset.id = lesson.id;
      li.innerHTML = `
        <span class="lesson-code">${lesson.code}</span>
        <span class="lesson-name">${lesson.title}</span>
      `;
      li.addEventListener('click', () => selectLesson(lesson.id));
      lessonsList.appendChild(li);
    });

    // Auto-select first lesson if available
    if (lessons.length > 0) {
      selectLesson(lessons[0].id);
    }
  } catch (err) {
    lessonsList.innerHTML = '<li class="loading-item">Error loading lessons.</li>';
    showToast('Failed to load lessons list from API.', 'danger');
  }
}

// Select a lesson and fetch its details
async function selectLesson(lessonId) {
  // Clear active styling on other list items
  Array.from(lessonsList.children).forEach(li => {
    if (li.dataset.id === lessonId) li.classList.add('active');
    else li.classList.remove('active');
  });

  activeLesson = lessonId;
  resetDirtyState();

  try {
    const res = await fetch(`/api/lessons/${lessonId}`);
    currentLessonData = await res.json();

    // Update headers & meta
    currentLessonTitle.textContent = currentLessonData.title;
    lessonIdBadge.textContent = currentLessonData.id;

    // Enable workspace action buttons
    previewJsonBtn.classList.remove('disabled');
    previewJsonBtn.removeAttribute('disabled');
    exportJsonBtn.classList.remove('disabled');
    exportJsonBtn.removeAttribute('disabled');

    // Update tab text dynamically based on lesson type
    const dialogueTabBtn = document.querySelector('.tab-btn[data-tab="dialogue"]');
    if (currentLessonData.type === 'dialogue') {
      dialogueTabBtn.innerHTML = `💬 Dialogue Script <span class="tab-count" id="dialogue-count">${currentLessonData.dialogues.length}</span>`;
    } else {
      dialogueTabBtn.innerHTML = `🎙️ Tutor Script <span class="tab-count" id="dialogue-count">${currentLessonData.dialogues.length}</span>`;
    }

    // Render tables
    renderVocab(currentLessonData.vocabularies);
    renderSentences(currentLessonData.sentences);
    renderDialogue(currentLessonData.dialogues);

  } catch (err) {
    showToast('Failed to load lesson details.', 'danger');
  }
}

// -------------------------------------------------------------
// Render Tables (Grid views)
// -------------------------------------------------------------

function renderVocab(vocabList) {
  vocabCount.textContent = vocabList.length;
  const tbody = document.getElementById('vocab-tbody');
  tbody.innerHTML = '';

  if (vocabList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No vocabulary items found for this lesson.</td></tr>';
    return;
  }

  vocabList.forEach(v => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="id-cell">${v.id}</span></td>
      <td class="cell-editable" contenteditable="true" data-type="vocab" data-id="${v.id}" data-field="character">${escapeHtml(v.character)}</td>
      <td class="cell-editable" contenteditable="true" data-type="vocab" data-id="${v.id}" data-field="reading_or_pronunciation">${escapeHtml(v.reading_or_pronunciation || '')}</td>
      <td class="cell-editable" contenteditable="true" data-type="vocab" data-id="${v.id}" data-field="romanization">${escapeHtml(v.romanization || '')}</td>
      <td class="cell-editable" contenteditable="true" data-type="vocab" data-id="${v.id}" data-field="english">${escapeHtml(v.english || '')}</td>
    `;
    setupEditableCellListeners(tr);
    tbody.appendChild(tr);
  });
}

function renderSentences(sentenceList) {
  sentencesCount.textContent = sentenceList.length;
  const tbody = document.getElementById('sentences-tbody');
  tbody.innerHTML = '';

  if (sentenceList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No sentence items found for this lesson.</td></tr>';
    return;
  }

  sentenceList.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="id-cell">${s.id}</span></td>
      <td class="cell-editable" contenteditable="true" data-type="sentence" data-id="${s.id}" data-field="content">${escapeHtml(s.content)}</td>
      <td class="cell-editable" contenteditable="true" data-type="sentence" data-id="${s.id}" data-field="reading_or_pronunciation">${escapeHtml(s.reading_or_pronunciation || '')}</td>
      <td class="cell-editable" contenteditable="true" data-type="sentence" data-id="${s.id}" data-field="romanization">${escapeHtml(s.romanization || '')}</td>
      <td class="cell-editable" contenteditable="true" data-type="sentence" data-id="${s.id}" data-field="english">${escapeHtml(s.english || '')}</td>
    `;
    setupEditableCellListeners(tr);
    tbody.appendChild(tr);
  });
}

function renderDialogue(dialogueList) {
  const table = document.getElementById('dialogue-table');
  const thead = table.querySelector('thead');
  const tbody = document.getElementById('dialogue-tbody');
  
  const isMicro = currentLessonData && currentLessonData.type === 'micro';
  
  // Set headers dynamically
  if (isMicro) {
    thead.innerHTML = `
      <tr>
        <th style="width: 15%">Segment ID</th>
        <th style="width: 45%">Clean Tutor Text</th>
        <th style="width: 40%">Gemini TTS Tagged Text (e.g. [pause], [warmly])</th>
      </tr>
    `;
  } else {
    thead.innerHTML = `
      <tr>
        <th style="width: 15%">Segment ID</th>
        <th style="width: 20%">Character / Role</th>
        <th style="width: 30%">Dialogue Text</th>
        <th style="width: 20%">English Translation</th>
        <th style="width: 15%">Audio File</th>
      </tr>
    `;
  }

  tbody.innerHTML = '';

  if (dialogueList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${isMicro ? 3 : 5}" class="empty-state">No dialogue/script lines found for this lesson.</td></tr>`;
    return;
  }

  dialogueList.forEach(d => {
    const tr = document.createElement('tr');
    if (isMicro) {
      tr.innerHTML = `
        <td><span class="id-cell">${d.segment_id}</span></td>
        <td class="cell-editable" contenteditable="true" data-type="dialogue" data-id="${d.segment_id}" data-field="text">${escapeHtml(d.text)}</td>
        <td class="cell-editable" contenteditable="true" data-type="dialogue" data-id="${d.segment_id}" data-field="tts_tag">${escapeHtml(d.tts_tag || '')}</td>
      `;
    } else {
      tr.innerHTML = `
        <td><span class="id-cell">${d.segment_id}</span></td>
        <td class="cell-editable" contenteditable="true" data-type="dialogue" data-id="${d.segment_id}" data-field="character_or_role">${escapeHtml(d.character_or_role || '')}</td>
        <td class="cell-editable" contenteditable="true" data-type="dialogue" data-id="${d.segment_id}" data-field="text">${escapeHtml(d.text)}</td>
        <td class="cell-editable" contenteditable="true" data-type="dialogue" data-id="${d.segment_id}" data-field="english">${escapeHtml(d.english || '')}</td>
        <td class="cell-editable" contenteditable="true" data-type="dialogue" data-id="${d.segment_id}" data-field="audio_file">${escapeHtml(d.audio_file || '')}</td>
      `;
    }
    setupEditableCellListeners(tr);
    tbody.appendChild(tr);
  });
}

// -------------------------------------------------------------
// Inline cell-editing & Changes Tracking
// -------------------------------------------------------------

function setupEditableCellListeners(rowElement) {
  const cells = rowElement.querySelectorAll('.cell-editable');
  cells.forEach(cell => {
    // Record original text to compare on blur
    cell.addEventListener('focus', function() {
      this.dataset.original = this.innerText;
    });

    cell.addEventListener('blur', function() {
      const type = this.dataset.type;
      const id = this.dataset.id;
      const field = this.dataset.field;
      const val = this.innerText.trim();

      if (val !== this.dataset.original.trim()) {
        this.style.backgroundColor = 'rgba(99, 102, 241, 0.08)'; // Light violet tint for unsaved cell
        
        // Save change to dirty tracking object
        if (type === 'vocab') {
          if (!dirtyChanges.vocabularies[id]) dirtyChanges.vocabularies[id] = { id: id };
          dirtyChanges.vocabularies[id][field] = val;
        } else if (type === 'sentence') {
          if (!dirtyChanges.sentences[id]) dirtyChanges.sentences[id] = { id: id };
          dirtyChanges.sentences[id][field] = val;
        } else if (type === 'dialogue') {
          if (!dirtyChanges.dialogues[id]) dirtyChanges.dialogues[id] = { segment_id: id };
          dirtyChanges.dialogues[id][field] = val;
        }

        // Enable save button
        saveBtn.classList.remove('disabled');
        saveBtn.removeAttribute('disabled');
      }
    });

    // Handle enter key behavior (prevent defaults, blur instead)
    cell.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.blur();
      }
    });
  });
}

// Save all accumulated inline edits
async function saveChanges() {
  if (saveBtn.classList.contains('disabled')) return;

  const payload = {
    vocabularies: Object.values(dirtyChanges.vocabularies),
    sentences: Object.values(dirtyChanges.sentences),
    dialogues: Object.values(dirtyChanges.dialogues)
  };

  try {
    const res = await fetch(`/api/lessons/${activeLesson}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast('All changes successfully saved and synced.');
      
      // Clear yellow background from edited cells
      document.querySelectorAll('.cell-editable').forEach(cell => {
        cell.style.backgroundColor = '';
      });

      resetDirtyState();
      
      // Reload lesson details to refresh local cache
      selectLesson(activeLesson);
    } else {
      showToast('Failed to save changes.', 'danger');
    }
  } catch (err) {
    showToast('Network error saving changes.', 'danger');
  }
}

// -------------------------------------------------------------
// JSON Preview and Download Actions
// -------------------------------------------------------------

async function openJsonPreview() {
  if (previewJsonBtn.classList.contains('disabled')) return;

  jsonCodeBlock.textContent = 'Loading JSON preview...';
  modalLessonId.textContent = activeLesson;
  jsonModal.classList.add('open');

  try {
    const res = await fetch(`/api/lessons/${activeLesson}/export`);
    const data = await res.json();
    jsonCodeBlock.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    jsonCodeBlock.textContent = 'Failed to load JSON preview from server.';
  }
}

function exportJsonFile() {
  if (exportJsonBtn.classList.contains('disabled')) return;
  // Trigger API download by loading the browser location
  window.location.href = `/api/lessons/${activeLesson}/export`;
}

function copyJsonToClipboard() {
  const codeText = jsonCodeBlock.textContent;
  navigator.clipboard.writeText(codeText)
    .then(() => {
      const originalText = copyJsonBtn.textContent;
      copyJsonBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyJsonBtn.textContent = originalText;
      }, 2000);
    })
    .catch(() => {
      showToast('Failed to copy text to clipboard.', 'danger');
    });
}

function downloadJsonFile() {
  const codeText = jsonCodeBlock.textContent;
  const blob = new Blob([codeText], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${activeLesson}_spec.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// -------------------------------------------------------------
// Utilities & Helper Functions
// -------------------------------------------------------------

function resetWorkspace() {
  activeLesson = null;
  currentLessonData = null;
  
  currentLessonTitle.textContent = 'Select a Lesson';
  lessonIdBadge.textContent = 'No Lesson Selected';

  // Disable action buttons
  previewJsonBtn.classList.add('disabled');
  previewJsonBtn.setAttribute('disabled', 'true');
  exportJsonBtn.classList.add('disabled');
  exportJsonBtn.setAttribute('disabled', 'true');

  document.getElementById('vocab-tbody').innerHTML = '<tr><td colspan="5" class="empty-state">Select a lesson to load vocabulary items.</td></tr>';
  document.getElementById('sentences-tbody').innerHTML = '<tr><td colspan="5" class="empty-state">Select a lesson to load sentence items.</td></tr>';
  document.getElementById('dialogue-tbody').innerHTML = '<tr><td colspan="3" class="empty-state">Select a lesson to load dialogue lines.</td></tr>';

  vocabCount.textContent = '0';
  sentencesCount.textContent = '0';
  dialogueCount.textContent = '0';

  resetDirtyState();
}

function resetDirtyState() {
  dirtyChanges = {
    vocabularies: {},
    sentences: {},
    dialogues: {}
  };
  saveBtn.classList.add('disabled');
  saveBtn.setAttribute('disabled', 'true');
}

function showToast(message, type = 'success') {
  toastText.textContent = message;
  toast.className = 'toast show';
  if (type === 'danger') {
    toast.style.borderLeftColor = 'var(--color-danger)';
  } else if (type === 'warning') {
    toast.style.borderLeftColor = 'var(--color-warning)';
  } else {
    toast.style.borderLeftColor = 'var(--color-success)';
  }

  // Clear timeout to avoid stacking
  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
