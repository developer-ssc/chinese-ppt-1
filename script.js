/* ============================================
   六國論 互動式簡報 — JavaScript
   功能：投影片導航、Chart.js圖表、互動測驗
   ============================================ */

// ---- State ----
let currentSlide = 0;
let chartInitialized = false;

const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  // Apply data-bg classes to each slide
  slides.forEach(slide => {
    const bg = slide.getAttribute('data-bg');
    if (bg) slide.classList.add(bg);
  });
  buildDots();
  updateUI();
  initQuiz();
  document.getElementById('total-slides').textContent = totalSlides;
});

// ---- Build Navigation Dots ----
function buildDots() {
  const dotsContainer = document.getElementById('slide-dots');
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.title = `第 ${i + 1} 頁`;
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
}

// ---- Navigate ----
function changeSlide(direction) {
  const next = currentSlide + direction;
  if (next < 0 || next >= totalSlides) return;
  goToSlide(next);
}

function goToSlide(index) {
  slides[currentSlide].classList.remove('active');
  slides[currentSlide].classList.add('prev');

  // Remove prev class after transition
  const prevIndex = currentSlide;
  setTimeout(() => {
    slides[prevIndex].classList.remove('prev');
  }, 650);

  currentSlide = index;
  slides[currentSlide].classList.add('active');

  updateUI();

  // Init chart on slide 5 (index 4)
  if (currentSlide === 4 && !chartInitialized) {
    initLandChart();
    chartInitialized = true;
  }
}

function updateUI() {
  // Counter
  document.getElementById('current-slide').textContent = currentSlide + 1;

  // Progress bar
  const pct = ((currentSlide + 1) / totalSlides) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';

  // Dots
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentSlide);
  });
}

// ---- Keyboard Navigation ----
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
    e.preventDefault();
    changeSlide(1);
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    changeSlide(-1);
  }
});

// ---- Touch/Swipe ----
let touchStartX = 0;
document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
document.addEventListener('touchend', (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) changeSlide(diff > 0 ? 1 : -1);
});

// ---- Click to advance (not on interactive elements) ----
document.getElementById('presentation').addEventListener('click', (e) => {
  const tag = e.target.tagName.toLowerCase();
  const interactive = ['button', 'a', 'input', 'select', 'canvas'];
  if (interactive.includes(tag)) return;
  if (e.target.closest('#quiz-container')) return;
  if (e.target.closest('.option-btn')) return;
  changeSlide(1);
});

// ============================================
// CHART.JS — Land Loss Comparison (Slide 5)
// ============================================
function initLandChart() {
  const ctx = document.getElementById('landChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['秦國所得\n（賂秦 vs 戰勝）', '六國所失\n（賂秦 vs 戰敗）'],
      datasets: [
        {
          label: '賂秦所得/所失',
          data: [100, 100],
          backgroundColor: ['rgba(192,57,43,0.85)', 'rgba(26,44,92,0.85)'],
          borderColor: ['#c0392b', '#1a2c5c'],
          borderWidth: 2,
          borderRadius: 8,
        },
        {
          label: '戰勝/戰敗所得/所失',
          data: [1, 1],
          backgroundColor: ['rgba(192,57,43,0.35)', 'rgba(26,44,92,0.35)'],
          borderColor: ['#c0392b', '#1a2c5c'],
          borderWidth: 2,
          borderRadius: 8,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: { color: 'rgba(245,230,200,0.9)', font: { size: 13, family: 'Noto Serif TC' } }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed.y;
              return ` ${ctx.dataset.label}：${val === 100 ? '100份' : '1份（基準）'}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: 'rgba(245,230,200,0.85)', font: { size: 12, family: 'Noto Serif TC' } },
          grid: { color: 'rgba(245,230,200,0.1)' }
        },
        y: {
          ticks: {
            color: 'rgba(245,230,200,0.85)',
            font: { size: 12, family: 'Noto Serif TC' },
            callback: (v) => v + '份'
          },
          grid: { color: 'rgba(245,230,200,0.1)' },
          title: {
            display: true,
            text: '土地份量（相對比例）',
            color: 'rgba(245,230,200,0.7)',
            font: { size: 12 }
          }
        }
      }
    }
  });
}

// ============================================
// QUIZ (Slide 15)
// ============================================
const quizData = [
  {
    question: '蘇洵在《六國論》中提出，六國破滅的根本原因是什麼？',
    options: ['A. 兵器不夠鋒利', 'B. 作戰策略失誤', 'C. 割地賄賂秦國', 'D. 人口太少'],
    answer: 2,
    explanation: '✅ 正確！蘇洵開門見山：「弊在賂秦」——割地賄賂秦國才是根本原因。'
  },
  {
    question: '「以地事秦，猶抱薪救火」這個比喻中，「薪」比喻什麼？',
    options: ['A. 秦國的軍隊', 'B. 六國割讓的土地', 'C. 六國的謀臣', 'D. 燕國的刺客'],
    answer: 1,
    explanation: '✅ 正確！「薪」（柴火）比喻六國割讓的土地——越給越多，火（秦國）越燒越旺！'
  },
  {
    question: '趙國最終滅亡的直接原因是什麼？',
    options: ['A. 割地賂秦太多', 'B. 與秦國結盟', 'C. 誤信讒言，誅殺良將李牧', 'D. 派荊軻刺殺秦王'],
    answer: 2,
    explanation: '✅ 正確！趙王誤信讒言，殺死了能打敗秦軍的大將李牧，自毀長城，導致滅亡。'
  },
  {
    question: '蘇洵寫《六國論》的真正目的是什麼？',
    options: [
      'A. 研究戰國歷史',
      'B. 讚揚秦始皇統一天下',
      'C. 諷諭北宋朝廷停止向契丹、西夏繳納歲幣',
      'D. 批評六國君主的個人品德'
    ],
    answer: 2,
    explanation: '✅ 正確！蘇洵借古諷今，以六國賂秦之事，警惕宋朝不應以歲幣換取和平。'
  }
];

let quizState = {
  current: 0,
  score: 0,
  answered: false
};

function initQuiz() {
  quizState = { current: 0, score: 0, answered: false };
  document.getElementById('q-total').textContent = quizData.length;
  renderQuestion();

  document.getElementById('next-btn').addEventListener('click', nextQuestion);
  document.getElementById('restart-btn').addEventListener('click', () => {
    quizState = { current: 0, score: 0, answered: false };
    document.getElementById('quiz-final').classList.add('hidden');
    document.getElementById('question-box').classList.remove('hidden');
    document.getElementById('quiz-result').classList.add('hidden');
    renderQuestion();
  });
}

function renderQuestion() {
  const q = quizData[quizState.current];
  document.getElementById('q-current').textContent = quizState.current + 1;
  document.getElementById('question-text').textContent = q.question;

  const container = document.getElementById('options-container');
  container.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => selectAnswer(i, btn));
    container.appendChild(btn);
  });

  document.getElementById('quiz-result').classList.add('hidden');
  quizState.answered = false;
}

function selectAnswer(index, btn) {
  if (quizState.answered) return;
  quizState.answered = true;

  const q = quizData[quizState.current];
  const allBtns = document.querySelectorAll('.option-btn');

  allBtns.forEach((b, i) => {
    b.disabled = true;
    if (i === q.answer) b.classList.add('correct');
    if (i === index && index !== q.answer) b.classList.add('wrong');
  });

  if (index === q.answer) quizState.score++;

  const resultDiv = document.getElementById('quiz-result');
  const resultText = document.getElementById('result-text');
  resultText.textContent = q.explanation;
  resultDiv.classList.remove('hidden');
}

function nextQuestion() {
  quizState.current++;
  if (quizState.current >= quizData.length) {
    showFinalScore();
  } else {
    renderQuestion();
  }
}

function showFinalScore() {
  document.getElementById('question-box').classList.add('hidden');
  document.getElementById('quiz-result').classList.add('hidden');
  document.getElementById('quiz-final').classList.remove('hidden');
  document.getElementById('final-score').textContent = quizState.score;
}
