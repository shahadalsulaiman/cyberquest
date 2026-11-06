

const PUZZLE = {
  "width": 18,
  "height": 18,
  "entries": [
    {
      "answer": "PROTECTION",
      "clue": "What is one benefit of cybersecurity?",
      "r": 0,
      "c": 6,
      "dir": "down",
      "number": 1,
      "lesson": "Protection means lowering security risks through preventive and defensive controls.",
      "defense": "Defend: combine MFA, patching, encryption, backups and awareness training."
    },
    {
      "answer": "PHYSICALSECURITY",
      "clue": "What is one thing cybersecurity is related to?",
      "r": 1,
      "c": 2,
      "dir": "down",
      "number": 2,
      "lesson": "Physical controls protect buildings, devices and information from unauthorized physical access.",
      "defense": "Defend: badge checks, locked equipment areas and visitor verification."
    },
    {
      "answer": "MALVERTISEMENT",
      "clue": "What is one cybersecurity threat vector?",
      "r": 2,
      "c": 8,
      "dir": "down",
      "number": 3,
      "lesson": "A malvertisement is a malicious online advertisement used to lead people to harmful sites or software.",
      "defense": "Defend: maintain browser security updates and avoid unexpected ads and downloads."
    },
    {
      "answer": "ACCESSING",
      "clue": "What is one thing cyberattacks aim at?",
      "r": 3,
      "c": 8,
      "dir": "across",
      "number": 4,
      "lesson": "Access to systems must be approved, authenticated and limited to authorized resources.",
      "defense": "Defend: use strong authentication, authorization and access logs."
    },
    {
      "answer": "IDENTITYTHEFTS",
      "clue": "What is one thing cybersecurity can prevent?",
      "r": 4,
      "c": 17,
      "dir": "down",
      "number": 5,
      "lesson": "Identity theft occurs when personal information is used to impersonate someone fraudulently.",
      "defense": "Defend: protect personal data, verify requests and use MFA."
    },
    {
      "answer": "SECURITYENGINEER",
      "clue": "What is on career that deals with cybersecurity?",
      "r": 6,
      "c": 0,
      "dir": "across",
      "number": 6,
      "lesson": "A security engineer builds, tests and maintains safeguards in digital infrastructure.",
      "defense": "Course link: implementing technical controls and secure system design."
    },
    {
      "answer": "VPNS",
      "clue": "What is one example of network security?",
      "r": 8,
      "c": 10,
      "dir": "down",
      "number": 7,
      "lesson": "Virtual private networks encrypt traffic between a device and a VPN endpoint.",
      "defense": "Defend: use trusted, institution-approved VPNs where appropriate; VPNs do not prevent phishing."
    },
    {
      "answer": "HACKERS",
      "clue": "What type of challenges do cybersecurities face?",
      "r": 9,
      "c": 12,
      "dir": "down",
      "number": 8,
      "lesson": "A hacker uses technical skills to examine or access systems; ethical and malicious intentions differ.",
      "defense": "Defend: patch vulnerabilities, apply least privilege and monitor suspicious activity."
    },
    {
      "answer": "PHISHING",
      "clue": "What is one type of cybersecurity threat?",
      "r": 9,
      "c": 15,
      "dir": "down",
      "number": 9,
      "lesson": "Phishing is social engineering that tricks people into revealing information or taking unsafe actions.",
      "defense": "Defend: inspect senders, avoid suspicious links and report unexpected credential requests."
    },
    {
      "answer": "CYBERSECURITY",
      "clue": "What is computer security?",
      "r": 11,
      "c": 5,
      "dir": "across",
      "number": 10,
      "lesson": "Cybersecurity combines people, processes and technologies to protect digital assets.",
      "defense": "Course link: security principles, threats, controls and the CIA triad."
    },
    {
      "answer": "BREACHES",
      "clue": "What is one thing cybersecurities protect?",
      "r": 13,
      "c": 6,
      "dir": "across",
      "number": 11,
      "lesson": "A breach is a security incident involving compromised protected data or systems.",
      "defense": "Defend: report suspected incidents quickly and follow incident-response procedures."
    },
    {
      "answer": "DATATHEFT",
      "clue": "What is one thing related to cybersecurity?",
      "r": 15,
      "c": 0,
      "dir": "across",
      "number": 12,
      "lesson": "Data theft is the unauthorized copying or taking of confidential information.",
      "defense": "Defend: apply least privilege, monitor access and encrypt sensitive records."
    }
  ]
};

(() => {
  'use strict';

  const puzzle = PUZZLE;
  const entries = puzzle.entries.map((entry) => ({ ...entry,
    id: `${entry.number}-${entry.dir}`,
    cells: Array.from({ length: entry.answer.length }, (_, i) => ({
      r: entry.r + (entry.dir === 'down' ? i : 0),
      c: entry.c + (entry.dir === 'across' ? i : 0)
    }))
  }));
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const cells = new Map();
  const inputs = new Map();
  const startNumbers = new Map();
  const hintedCells = new Set();
  let selected = null;
  let activeKey = null;
  let activeTab = 'across';
  let hintsUsed = 0;
  let startedAt = null;
  let elapsedMillis = 0;
  let timerId = null;
  let checked = false;
  let finished = false;

  const $ = (id) => document.getElementById(id);
  const cellKey = (r, c) => `${r},${c}`;
  const getEntryText = (entry) => entry.cells.map(({r, c}) => cells.get(cellKey(r, c)).value).join('');
  const isSolved = (entry) => getEntryText(entry) === entry.answer;
  const isComplete = (entry) => entry.cells.every(({r,c}) => Boolean(cells.get(cellKey(r,c)).value));
  const isWrong = (entry) => isComplete(entry) && !isSolved(entry);
  const activeCellEntries = (key) => cells.get(key)?.entries || [];

  entries.forEach((entry) => {
    startNumbers.set(cellKey(entry.r, entry.c), entry.number);
    entry.cells.forEach(({r, c}, i) => {
      const key = cellKey(r, c);
      if (!cells.has(key)) cells.set(key, { answer: entry.answer[i], value: '', entries: [] });
      if (cells.get(key).answer !== entry.answer[i]) {
        throw new Error(`Conflicting words at ${key}`);
      }
      cells.get(key).entries.push(entry.id);
    });
  });

  function makeGrid() {
    const board = $('crossword-grid');
    board.style.setProperty('--columns', String(puzzle.width));
    board.style.setProperty('--rows', String(puzzle.height));
    for (let r = 0; r < puzzle.height; r++) {
      for (let c = 0; c < puzzle.width; c++) {
        const key = cellKey(r, c);
        const wrapper = document.createElement('div');
        wrapper.className = 'cell';
        if (!cells.has(key)) {
          wrapper.classList.add('block');
          wrapper.setAttribute('aria-hidden', 'true');
        } else {
          const number = startNumbers.get(key);
          if (number !== undefined) {
            const label = document.createElement('span');
            label.className = 'cell-number';
            label.textContent = String(number);
            wrapper.appendChild(label);
          }
          const input = document.createElement('input');
          input.type = 'text';
          input.maxLength = 1;
          input.autocomplete = 'off';
          input.spellcheck = false;
          input.autocapitalize = 'characters';
          input.setAttribute('aria-label', `Row ${r + 1} column ${c + 1}${number !== undefined ? `, clue ${number}` : ''}`);
          input.dataset.key = key;
          input.addEventListener('click', () => {
            const options = activeCellEntries(key);
            if (selected && selected.cells.some(({r: rr, c: cc}) => cellKey(rr, cc) === key) && options.length > 1) {
              const other = options.find((id) => id !== selected.id);
              if (other) selectEntry(byId.get(other), key, false);
              else selectEntry(selected, key, false);
            } else {
              selectEntry(findPreferredEntry(key), key, false);
            }
          });
          input.addEventListener('focus', () => {
            activeKey = key;
            if (!selected || !selected.cells.some(({r: rr, c: cc}) => cellKey(rr, cc) === key)) {
              selectEntry(findPreferredEntry(key), key, false);
            } else {
              refreshClasses();
            }

            input.select();
          });
          input.addEventListener('input', (event) => {
            if (finished) return;
            const typed = event.target.value.replace(/[^a-z]/gi, '').slice(-1).toUpperCase();
            setCell(key, typed);
            if (typed) beginTimer();
            const correct = Boolean(typed) && typed === cells.get(key).answer;
            checked = false;
            updateUI(true);
            if (typed && !correct) {
              shakeWrongLetter(key);
              input.select();
            } else if (correct) {
              const nextKey = adjacentInEntry(key, 1);
              if (nextKey) focusKey(nextKey);
            }
          });
          input.addEventListener('keydown', (event) => onCellKeydown(event, key));
          wrapper.appendChild(input);
          inputs.set(key, input);
        }
        board.appendChild(wrapper);
      }
    }
  }

  function findPreferredEntry(key) {
    const options = activeCellEntries(key);
    const desired = options.find((id) => byId.get(id).dir === activeTab);
    return byId.get(desired || options[0]);
  }

  function selectEntry(entry, cursorKey = null, scrollClue = false) {
    if (!entry) return;
    selected = entry;
    activeTab = entry.dir;
    activeKey = cursorKey || cellKey(entry.r, entry.c);
    $('selected-label').textContent = `${entry.number} ${entry.dir.toUpperCase()}`;
    $('selected-length').textContent = `${entry.answer.length} LETTERS`;
    $('selected-clue').textContent = entry.clue;
    $('word-entry').value = getEntryText(entry);
    updateTabs();
    renderClues(scrollClue);
    refreshClasses();
    updateLesson();
    updateSelectedValidation();
    scrollGridToCell(activeKey);
  }

  function scrollGridToCell(key) {
    const input = inputs.get(key);
    const box = $('grid-scroll');
    if (!input) return;
    const left = input.parentElement.offsetLeft;
    const top = input.parentElement.offsetTop;
    if (left < box.scrollLeft + 12 || left + input.offsetWidth > box.scrollLeft + box.clientWidth - 12) {
      box.scrollLeft = Math.max(0, left - box.clientWidth / 2);
    }
    if (top < box.scrollTop + 10 || top + input.offsetHeight > box.scrollTop + box.clientHeight - 10) {
      box.scrollTop = Math.max(0, top - box.clientHeight / 2);
    }
  }

  function focusKey(key) {
    activeKey = key;
    const input = inputs.get(key);
    if (input) input.focus({ preventScroll: true });
    refreshClasses();
    scrollGridToCell(key);
  }

  function adjacentInEntry(key, offset) {
    if (!selected) return null;
    const index = selected.cells.findIndex(({r, c}) => cellKey(r, c) === key);
    if (index === -1) return null;
    const target = selected.cells[index + offset];
    return target ? cellKey(target.r, target.c) : null;
  }

  function onCellKeydown(event, key) {
    if (finished) { event.preventDefault(); return; }
    if (event.key === ' ' && activeCellEntries(key).length > 1) {
      event.preventDefault();
      const other = activeCellEntries(key).find((id) => id !== selected.id);
      selectEntry(byId.get(other), key, false);
      return;
    }
    if (event.key === 'Enter') { event.preventDefault(); checkAnswers(); return; }
    if (event.key === 'Backspace') {
      event.preventDefault();
      const hadCharacter = Boolean(cells.get(key).value);
      setCell(key, '');
      if (!hadCharacter) { const previous = adjacentInEntry(key, -1); if (previous) focusKey(previous); }
      checked = false;
      updateUI(true);
      return;
    }
    if (event.key === 'Delete') { event.preventDefault(); setCell(key, ''); checked = false; updateUI(true); return; }
    const arrows = {
      ArrowRight: [0, 1, 'across'], ArrowLeft: [0, -1, 'across'],
      ArrowDown: [1, 0, 'down'], ArrowUp: [-1, 0, 'down']
    };
    if (arrows[event.key]) {
      event.preventDefault();
      const [dr, dc, direction] = arrows[event.key];
      const available = activeCellEntries(key).find((id) => byId.get(id).dir === direction);
      if (available && selected.dir !== direction) selectEntry(byId.get(available), key, false);
      const [r, c] = key.split(',').map(Number);
      const nextKey = cellKey(r + dr, c + dc);
      if (cells.has(nextKey)) focusKey(nextKey);
    }
  }

  function updateTabs() {
    ['across', 'down'].forEach((dir) => {
      const button = $(`tab-${dir}`);
      const active = dir === activeTab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      if (active) $('clues-content').setAttribute('aria-labelledby', button.id);
    });
  }

  function renderClues(scrollToSelected = false) {
    const list = $('clues-content');
    list.replaceChildren();
    const visible = entries.filter((entry) => entry.dir === activeTab).sort((a, b) => a.number - b.number);
    visible.forEach((entry) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'clue-btn';
      button.classList.toggle('selected', selected?.id === entry.id);
      button.classList.toggle('solved', isSolved(entry));
      button.classList.toggle('wrong', isWrong(entry));
      button.setAttribute('aria-pressed', String(selected?.id === entry.id));
      const no = document.createElement('span');
      no.className = 'clue-no'; no.textContent = String(entry.number).padStart(2, '0');
      const content = document.createElement('span'); content.className = 'clue-content';
      const question = document.createElement('span'); question.textContent = entry.clue;
      const length = document.createElement('span'); length.className = 'clue-length'; length.textContent = `${entry.answer.length} letters`;
      content.append(question, document.createElement('br'), length);
      button.append(no, content);
      if (isSolved(entry) || isWrong(entry)) {
        const tick = document.createElement('span');
        tick.className = 'clue-status';
        tick.textContent = isSolved(entry) ? '✓' : '✕';
        tick.setAttribute('aria-label', isSolved(entry) ? 'Correct word' : 'Incorrect word');
        button.appendChild(tick);
      }
      button.addEventListener('click', () => { selectEntry(entry, null, false); });
      list.appendChild(button);
      if (scrollToSelected && selected?.id === entry.id) {
        button.scrollIntoView({block: 'nearest'});
      }
    });
  }

  function setCell(key, value) {
    cells.get(key).value = value;
    inputs.get(key).value = value;
  }

  const hasIncorrectLetter = (entry) => entry.cells.some(({r, c}, index) => {
    const letter = cells.get(cellKey(r, c)).value;
    return Boolean(letter) && letter !== entry.answer[index];
  });

  function refreshClasses() {
    const selectedKeys = new Set(selected ? selected.cells.map(({r, c}) => cellKey(r, c)) : []);
    for (const [key, input] of inputs) {
      const wrapper = input.parentElement;
      const { value, answer } = cells.get(key);
      const good = Boolean(value) && value === answer;
      const bad = Boolean(value) && value !== answer;
      wrapper.classList.toggle('part-of-selected', selectedKeys.has(key));
      wrapper.classList.toggle('cursor', key === activeKey);
      wrapper.classList.toggle('letter-correct', good);
      wrapper.classList.toggle('letter-wrong', bad);
      if (!bad) wrapper.classList.remove('shake-wrong');
      wrapper.classList.toggle('hinted', hintedCells.has(key));
      input.setAttribute('aria-invalid', String(bad));
    }
  }

  function shakeWrongLetter(key) {
    const square = inputs.get(key)?.parentElement;
    if (!square) return;

    square.classList.remove('shake-wrong');
    void square.offsetWidth;
    square.classList.add('shake-wrong');
  }

  function updateSelectedValidation() {
    const panel = document.querySelector('.selected-panel');
    const status = $('selected-status');
    const wrong = selected && hasIncorrectLetter(selected);
    const correct = selected && isSolved(selected);
    panel.classList.toggle('invalid', Boolean(wrong));
    panel.classList.toggle('valid', Boolean(correct));
    status.className = `answer-status ${wrong ? 'error' : correct ? 'success' : ''}`;
    status.textContent = wrong ? '✕ Red letter = incorrect. Replace it to continue.'
      : correct ? '✓ All letters correct! Security lesson unlocked below.'
      : 'Letters are checked immediately: green = correct, red = incorrect.';
    $('word-entry').setAttribute('aria-invalid', String(Boolean(wrong)));
  }

  function updateUI(announce = false) {
    const count = entries.filter(isSolved).length;
    $('solved-count').textContent = String(count);
    $('score').textContent = String(Math.max(0, count * 100 - hintsUsed * 15));
    $('progress-text').textContent = `${Math.round(count / entries.length * 100)}%`;
    $('progress-fill').style.width = `${count / entries.length * 100}%`;
    if (selected && document.activeElement !== $('word-entry')) $('word-entry').value = getEntryText(selected);
    renderClues();
    refreshClasses();
    updateLesson();
    updateSelectedValidation();
    if (announce && selected) {
      if (hasIncorrectLetter(selected)) setFeedback('✕ Incorrect letter! It shakes and turns red. Replace the red letter to continue.', 'error');
      else if (isSolved(selected)) setFeedback(`✓ ${selected.number} ${selected.dir}: All letters correct — green!`, 'success');
      else setFeedback('✓ Green letters are correct. Keep typing!');
    }
    if (count === entries.length && !finished) win();
  }

  function updateLesson() {
    const card = $('lesson');
    if (!selected || !isSolved(selected)) { card.hidden = true; return; }
    $('lesson-description').textContent = selected.lesson;
    $('lesson-defense').textContent = selected.defense;
    card.hidden = false;
  }

  function setFeedback(message, kind = '') {
    const feedback = $('feedback');
    feedback.textContent = message;
    feedback.className = `feedback ${kind}`;
  }

  function beginTimer() {
    if (startedAt !== null || finished) return;
    startedAt = performance.now();
    timerId = setInterval(showTime, 250);
  }

  function showTime() {
    const millis = elapsedMillis + (startedAt === null ? 0 : performance.now() - startedAt);
    const seconds = Math.floor(millis / 1000);
    $('timer').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function applyWord() {
    if (!selected || finished) return;
    const text = $('word-entry').value.replace(/[^a-z]/gi, '').toUpperCase().slice(0, selected.answer.length);
    $('word-entry').value = text;
    let lastMistake = null;
    selected.cells.forEach(({r, c}, i) => {
      const key = cellKey(r, c);
      const value = text[i] || '';
      if (value && value !== selected.answer[i] && cells.get(key).value !== value) lastMistake = key;
      setCell(key, value);
    });
    if (text) beginTimer();
    checked = false;
    updateUI(true);
    if (lastMistake) shakeWrongLetter(lastMistake);
  }

  function checkAnswers() {
    if (finished) return;
    checked = true;
    const solved = entries.filter(isSolved).length;
    const wrongLetters = [...cells.values()].filter((cell) => cell.value && cell.value !== cell.answer).length;
    const remaining = entries.length - solved;
    if (remaining === 0) { win(); return; }
    setFeedback(`${solved} of ${entries.length} words correct. ${wrongLetters ? `${wrongLetters} red ${wrongLetters === 1 ? 'letter needs' : 'letters need'} fixing.` : 'All entered letters are correct so far. Keep going!'} Each letter is checked as you type.`, wrongLetters ? 'error' : '');
    updateUI();
  }

  function revealLetter() {
    if (!selected || finished) return;
    const missingIndex = selected.cells.findIndex(({r, c}, i) => cells.get(cellKey(r, c)).value !== selected.answer[i]);
    if (missingIndex === -1) {
      setFeedback('This word is already correct. Choose another clue.','success'); return;
    }
    const {r, c} = selected.cells[missingIndex];
    const key = cellKey(r, c);
    setCell(key, selected.answer[missingIndex]);
    if (!hintedCells.has(key)) { hintsUsed += 1; hintedCells.add(key); }
    beginTimer();
    checked = false;
    focusKey(key);
    updateUI();
    setFeedback(`One letter revealed in ${selected.number} ${selected.dir}. A 15-point hint penalty was applied.`);
  }

  function win() {
    if (finished) return;
    finished = true;
    clearInterval(timerId);
    if (startedAt !== null) { elapsedMillis += performance.now() - startedAt; startedAt = null; }
    showTime();
    const score = Math.max(0, entries.length * 100 - hintsUsed * 15);
    $('win-summary').textContent = `You solved all ${entries.length} words in ${$('timer').textContent}, earning ${score} points${hintsUsed ? ` with ${hintsUsed} hint${hintsUsed === 1 ? '' : 's'}` : ' without using a hint'}!`;
    $('celebration').hidden = false;
    $('play-again').focus();
  }

  function restart() {
    if (!finished && [...cells.values()].some((cell) => cell.value) && !confirm('Clear all of your answers and restart the timer?')) return;
    for (const key of cells.keys()) setCell(key, '');
    clearInterval(timerId);
    startedAt = null;
    elapsedMillis = 0;
    hintsUsed = 0;
    hintedCells.clear();
    checked = false;
    finished = false;
    $('celebration').hidden = true;
    $('timer').textContent = '00:00';
    answeredChallenges.clear();
    renderChallenges();
    $('challenge-progress').textContent = `0 / ${challenges.length} CORRECT`;
    selectEntry(entries.find((entry) => entry.dir === 'across'), null, false);
    updateUI();
    setFeedback('New attempt ready. The timer starts when you enter your first letter.');
  }

  const challenges = [
    { topic: 'SOCIAL ENGINEERING · PHISHING',
      prompt: 'You get an urgent email saying your university account will be locked unless you click a link and enter your password. What should you do?',
      options: ['Use the link immediately', 'Open the university website independently and report the suspicious email', 'Send the email to classmates and ask them to try the link'],
      correct: 1, why: 'Phishing uses urgency and imitation to steal credentials. Verify using an official channel and report suspicious messages.' },
    { topic: 'PHYSICAL SECURITY · ACCESS CONTROL',
      prompt: 'A person without a badge follows you toward a restricted server room. What is the safest action?',
      options: ['Hold the secure door open', 'Ignore the situation', 'Follow entry procedures and alert authorized security staff'],
      correct: 2, why: 'Tailgating can bypass physical access controls. Follow authorization and visitor procedures.' },
    { topic: 'SECURE ACCESS · VPNS',
      prompt: 'You connect to public Wi-Fi using a university-approved VPN. Does that make it safe to enter a password on a fake login page?',
      options: ['Yes, a VPN blocks every scam', 'No, VPN encryption does not prevent phishing', 'Yes, but only on a laptop'],
      correct: 1, why: 'VPNs protect traffic between your device and a VPN endpoint but cannot prove that a website is genuine.' },
    { topic: 'CONFIDENTIALITY · BREACHES',
      prompt: 'You discover that confidential student files are accessible to people without permission. What should you do?',
      options: ['Report the exposure promptly through your organization’s incident-response process', 'Download and share the files as proof', 'Ignore it because no one complained'],
      correct: 0, why: 'Possible data breaches should be reported promptly while preserving evidence safely and limiting further exposure.' },
    { topic: 'MALWARE · MALVERTISEMENTS',
      prompt: 'A pop-up advertisement claims your device is infected and demands a software download. What is the safest response?',
      options: ['Install the advertised software', 'Close the suspicious page and use trusted security tools', 'Enter personal data to unlock the page'],
      correct: 1, why: 'Malicious advertisements exploit fear or curiosity to spread unwanted software and steal information.' }
  ];
  const answeredChallenges = new Map();

  function renderChallenges() {
    const root = $('challenge-questions');
    root.replaceChildren();
    challenges.forEach((challenge, index) => {
      const article = document.createElement('article');
      article.className = 'challenge-card';

      const header = document.createElement('div');
      header.className = 'challenge-card-header';
      const number = document.createElement('span');
      number.className = 'scenario-number';
      number.textContent = `QUESTION ${String(index + 1).padStart(2, '0')}`;
      const topic = document.createElement('span');
      topic.className = 'topic';
      topic.textContent = challenge.topic;
      header.append(number, topic);

      const heading = document.createElement('h3');
      heading.textContent = challenge.prompt;

      const instruction = document.createElement('p');
      instruction.className = 'choice-instruction';
      instruction.textContent = 'Choose one answer';

      const choices = document.createElement('div');
      choices.className = 'choice-list';

      const feedback = document.createElement('div');
      feedback.className = 'challenge-feedback';
      feedback.setAttribute('aria-live', 'polite');
      feedback.hidden = true;

      const buttons = challenge.options.map((option, choice) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'challenge-choice';
        const letter = document.createElement('span');
        letter.className = 'option-letter';
        letter.textContent = String.fromCharCode(65 + choice);
        const answerText = document.createElement('span');
        answerText.className = 'option-text';
        answerText.textContent = option;
        button.append(letter, answerText);

        button.addEventListener('click', () => {
          if (answeredChallenges.has(index)) return;
          const isCorrect = choice === challenge.correct;
          answeredChallenges.set(index, isCorrect);
          buttons.forEach((b, i) => {
            b.disabled = true;
            if (i === choice) b.classList.add('chosen', isCorrect ? 'correct' : 'wrong');
            if (!isCorrect && i === challenge.correct) b.classList.add('correct');
          });
          feedback.hidden = false;
          feedback.classList.toggle('error', !isCorrect);
          const status = document.createElement('strong');
          status.textContent = isCorrect ? '✓ Correct answer' : '✕ Not quite';
          const explanation = document.createElement('p');
          explanation.textContent = challenge.why;
          feedback.append(status, explanation);
          const completed = answeredChallenges.size;
          const correctCount = [...answeredChallenges.values()].filter(Boolean).length;
          $('challenge-progress').textContent = `${correctCount} / ${challenges.length} CORRECT · ${completed} ANSWERED`;
        });
        return button;
      });
      choices.append(...buttons);
      article.append(header, heading, instruction, choices, feedback);
      root.appendChild(article);
    });
  }

  function init() {
    $('across-num').textContent = entries.filter((entry) => entry.dir === 'across').length;
    $('down-num').textContent = entries.filter((entry) => entry.dir === 'down').length;
    $('clue-count').textContent = `${entries.length} CLUES`;
    makeGrid();
    renderChallenges();
    ['across', 'down'].forEach((direction) => {
      $(`tab-${direction}`).addEventListener('click', () => {
        activeTab = direction;
        const target = entries.find((entry) => entry.dir === direction && entry.number === selected?.number) || entries.find((entry) => entry.dir === direction);
        selectEntry(target, null, false);
      });
    });
    $('apply-word').addEventListener('click', applyWord);

    $('word-entry').addEventListener('input', applyWord);
    $('word-entry').addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); applyWord(); } });
    $('check-btn').addEventListener('click', checkAnswers);
    $('hint-btn').addEventListener('click', revealLetter);
    $('reset-btn').addEventListener('click', restart);
    $('play-again').addEventListener('click', restart);
    selectEntry(entries.find((entry) => entry.dir === 'across'), null, false);
    updateUI();
  }
  init();
})();
