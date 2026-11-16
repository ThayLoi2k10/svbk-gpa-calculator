const LETTER_TO_4 = {
  "A+": 4.0,
  "A": 4.0,
  "B+": 3.5,
  "B": 3.0,
  "C+": 2.5,
  "C": 2.0,
  "D+": 1.5,
  "D": 1.0,
  "F": 0.0,
};

function score10ToLetter(score) {
  if (score >= 9.5) return "A+";
  if (score >= 8.5) return "A";
  if (score >= 8.0) return "B+";
  if (score >= 7.0) return "B";
  if (score >= 6.5) return "C+";
  if (score >= 5.5) return "C";
  if (score >= 5.0) return "D+";
  if (score >= 4.0) return "D";
  return "F";
}

const COURSE_CODE_RE = /^[A-Z]{2,}[A-Z0-9_]*\d+$/;
const SCORE_RE = /^(?:--|\d+(?:[.,]\d+)?)$/;
const LETTER_RE = /^(?:--|A\+|A|B\+|B|C\+|C|D\+|D|F\+|F|MT|DT|CT|RT|VT)$/i;
const CREDITS_RE = /^\d+(?:[.,]\d+)?$/;

const SAMPLE_DATA = `Stt
Mã môn học
Tên môn học
Điểm số
Điểm chữ
Tín chỉ
Đạt
Ghi chú
Toán
22/22
Khối kiến thức Bắt buộc
1
CO1007
Cấu trúc Rời rạc cho Khoa học Máy tính
7.7
B
4
2
CO2011
Mô hình hóa Toán học
7.4
B
3
3
MT1003
Giải tích 1
7.7
B
4
4
MT1005
Giải tích 2
9.7
A+
4
5
MT1007
Đại số Tuyến tính
9.3
A
3
6
MT2013
Xác suất và Thống kê
9.8
A+
4
Khoa học Tự nhiên
8/8
Khối kiến thức Bắt buộc
1
CH1003
Hóa đại cương
8.9
A
3
2
PH1003
Vật lý 1
7.8
B
4
3
PH1007
Thí nghiệm Vật lý
9.8
A+
1
Kinh tế - Chính trị - Xã hội - Luật
9/13
Khối kiến thức Bắt buộc
1
SP1007
Pháp luật Việt Nam Đại cương
7.5
B
2
2
SP1031
Triết học Mác - Lênin
8
B+
3
3
SP1033
Kinh tế Chính trị Mác - Lênin
8.2
B+
2
4
SP1035
Chủ nghĩa Xã hội Khoa học
8.2
B+
2
5
SP1037
Tư tưởng Hồ Chí Minh
--
--
2
6
SP1039
Lịch sử Đảng Cộng sản Việt Nam
--
--
2
Ngoại ngữ
8/8
Khối kiến thức Bắt buộc
1
LA1003
Anh văn 1
9.4
A
2
2
LA1005
Anh văn 2
12
--
2
3
LA1007
Anh văn 3
12
--
2
4
LA1009
Anh văn 4
12
--
2
Nhập môn
3/3
Khối kiến thức Bắt buộc
1
CO1005
Nhập môn Điện toán
8.5
A
3
Giáo dục quốc phòng
Khối kiến thức Bắt buộc
1
MI1003
Giáo dục Quốc phòng
21
--
0
Giáo dục thể chất học phần 1
Khối kiến thức Tự chọn
3
PE1011
Bóng chuyền (Học phần 1)
10
A+
0
Giáo dục thể chất học phần 2
Khối kiến thức Tự chọn
3
PE1035
Bóng chuyền (Học phần 2)
9
A
0
Tự chọn bổ sung / tự do
3/9
Khối kiến thức Tự chọn
1
CO3061
Nhập môn Trí tuệ Nhân tạo
7.7
B
3
Kiến thức về con người và môi trường/kỹ năng nghề nghiệp chuyên nghiệp
3/3
Khối kiến thức Bắt buộc
1
CO2001
Kỹ năng Chuyên nghiệp cho Kỹ sư
9
A
3
Bắt buộc ngành
3/13
Khối kiến thức Bắt buộc
1
CO2017
Hệ điều hành
9.4
A
3
2
CO3001
Công nghệ Phần mềm
--
--
3
Bắt buộc cơ sở ngành
21/21
Khối kiến thức Bắt buộc
1
CO1023
Hệ thống số
7.1
B
3
2
CO1027
Kỹ thuật Lập trình
9
A
3
3
CO2003
Cấu trúc Dữ liệu và Giải Thuật
8.5
A
4
4
CO2007
Kiến trúc Máy tính
8
B+
4
5
CO2013
Hệ cơ sở Dữ liệu
8
B+
4
6
CO2039
Lập trình Nâng cao
9
A
3`;

function parseMyBKText(rawText) {
  // Hỗ trợ cả copy dạng nhiều dòng lẫn copy dạng bảng phân tách bằng tab (\t)
  const tokens = rawText
    .replace(/\r\n/g, "\n")
    .split(/[\n\t]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const courses = [];
  const seenCodes = new Set();

  for (let i = 0; i <= tokens.length - 5; i++) {
    const code = tokens[i];
    if (!COURSE_CODE_RE.test(code)) continue;

    const name = tokens[i + 1];
    const scoreRaw = tokens[i + 2];
    const letterRaw = tokens[i + 3];
    const creditsRaw = tokens[i + 4];

    if (!SCORE_RE.test(scoreRaw)) continue;
    if (!LETTER_RE.test(letterRaw)) continue;
    if (!CREDITS_RE.test(creditsRaw)) continue;

    const credits = parseFloat(creditsRaw.replace(",", "."));
    const letter = letterRaw.toUpperCase();

    // Chỉ giữ lại các môn vừa có số tín chỉ (> 0) vừa có điểm (khác "--")
    if (credits <= 0 || scoreRaw === "--") {
      i += 4;
      continue;
    }

    let score10 = null;
    let statusType = "empty"; // counted | special | empty
    let statusText = "Chưa có điểm";

    if (scoreRaw !== "--") {
      const parsedScore = parseFloat(scoreRaw.replace(",", "."));
      if (parsedScore === 12 && letter === "--") {
        statusType = "special";
        statusText = "Miễn thi (12)";
      } else if (parsedScore === 21 && letter === "--") {
        statusType = "special";
        statusText = "Đạt (21)";
      } else if (parsedScore >= 0 && parsedScore <= 10) {
        score10 = parsedScore;
        if (credits <= 0) {
          statusType = "special";
          statusText = "0 tín chỉ";
        } else {
          statusType = "counted";
          statusText = "Tính GPA";
        }
      } else {
        statusType = "special";
        statusText = `Mã đặc biệt (${scoreRaw})`;
      }
    }

    const score4 =
      statusType === "counted" && Object.prototype.hasOwnProperty.call(LETTER_TO_4, letter)
        ? LETTER_TO_4[letter]
        : null;

    if (!seenCodes.has(code)) {
      seenCodes.add(code);
      courses.push({
        code,
        name,
        credits,
        scoreRaw,
        score10,
        letter,
        score4,
        statusType,
        statusText,
      });
    }

    i += 4;
  }

  return courses;
}

function calculateGPA(courses) {
  let sumWeighted10 = 0;
  let sumCredits10 = 0;

  let sumWeighted4 = 0;
  let sumCredits4 = 0;

  let countedCourses = 0;
  let ignoredCredits = 0;
  let accumulatedCredits = 0;

  for (const c of courses) {
    if (c.statusType === "counted" && c.score10 !== null) {
      sumWeighted10 += c.score10 * c.credits;
      sumCredits10 += c.credits;
      countedCourses += 1;

      if (c.letter !== "F" && c.letter !== "F+") {
        accumulatedCredits += c.credits;
      }

      if (c.score4 !== null) {
        sumWeighted4 += c.score4 * c.credits;
        sumCredits4 += c.credits;
      }
    } else {
      ignoredCredits += c.credits;
      const isSpecialPass =
        c.scoreRaw === "12" ||
        c.scoreRaw === "21" ||
        c.letter === "MT" ||
        c.letter === "DT";
      if (isSpecialPass && c.credits > 0) {
        accumulatedCredits += c.credits;
      }
    }
  }

  return {
    gpa10: sumCredits10 > 0 ? sumWeighted10 / sumCredits10 : 0,
    gpa4: sumCredits4 > 0 ? sumWeighted4 / sumCredits4 : 0,
    countedCredits: sumCredits10,
    accumulatedCredits,
    countedCourses,
    totalCourses: courses.length,
    ignoredCredits,
  };
}

function mergeCourses(baseCourses, plannedMap) {
  const merged = [];
  const handledCodes = new Set();

  for (const c of baseCourses) {
    if (plannedMap.has(c.code)) {
      const plan = plannedMap.get(c.code);
      const letter = score10ToLetter(plan.score10);
      const score4 = LETTER_TO_4[letter];
      const isImprove = c.score10 !== null;
      merged.push({
        ...c,
        name: plan.name || c.name,
        credits: plan.credits,
        scoreRaw: String(plan.score10),
        score10: plan.score10,
        letter,
        score4,
        statusType: plan.credits > 0 ? "counted" : "special",
        statusText: isImprove ? "Kế hoạch (Cải thiện)" : "Kế hoạch (Mục tiêu)",
        isPlanned: true,
        originalScoreRaw: c.scoreRaw,
      });
      handledCodes.add(c.code);
    } else {
      merged.push(c);
    }
  }

  for (const [code, plan] of plannedMap.entries()) {
    if (handledCodes.has(code)) continue;
    const letter = score10ToLetter(plan.score10);
    const score4 = LETTER_TO_4[letter];
    merged.push({
      code,
      name: plan.name,
      credits: plan.credits,
      scoreRaw: String(plan.score10),
      score10: plan.score10,
      letter,
      score4,
      statusType: plan.credits > 0 ? "counted" : "special",
      statusText: "Kế hoạch (Môn mới)",
      isPlanned: true,
      originalScoreRaw: null,
    });
  }

  return sortCourses(merged);
}

function sortCourses(courses) {
  const getTier = (c) => {
    if (c.isPlanned) return 0;
    if (c.statusType === "counted") return 1;
    return 2;
  };

  return [...courses].sort((a, b) => {
    const tierDiff = getTier(a) - getTier(b);
    if (tierDiff !== 0) return tierDiff;

    if (getTier(a) === 1) {
      const score4Diff = (a.score4 ?? 0) - (b.score4 ?? 0);
      if (score4Diff !== 0) return score4Diff;

      const creditsDiff = b.credits - a.credits;
      if (creditsDiff !== 0) return creditsDiff;
    }

    return a.code.localeCompare(b.code);
  });
}

// DOM Elements
const rawInput = document.getElementById("rawInput");
const clearBtn = document.getElementById("clearBtn");
const resultsSection = document.getElementById("resultsSection");

const gpa10Value = document.getElementById("gpa10Value");
const gpa10Sub = document.getElementById("gpa10Sub");
const gpa4Value = document.getElementById("gpa4Value");
const gpa4Sub = document.getElementById("gpa4Sub");
const countedCoursesValue = document.getElementById("countedCoursesValue");
const totalParsedSub = document.getElementById("totalParsedSub");
const countedCreditsValue = document.getElementById("countedCreditsValue");
const ignoredCreditsSub = document.getElementById("ignoredCreditsSub");
const accumulatedCreditsValue = document.getElementById("accumulatedCreditsValue");
const accumulatedCreditsSub = document.getElementById("accumulatedCreditsSub");

const planForm = document.getElementById("planForm");
const planCodeInput = document.getElementById("planCode");
const planNameInput = document.getElementById("planName");
const planCreditsInput = document.getElementById("planCredits");
const planScoreInput = document.getElementById("planScore");
const courseCodeList = document.getElementById("courseCodeList");
const planTags = document.getElementById("planTags");
const clearPlansBtn = document.getElementById("clearPlansBtn");

const countAll = document.getElementById("countAll");
const countCounted = document.getElementById("countCounted");
const countExcluded = document.getElementById("countExcluded");
const courseTableBody = document.getElementById("courseTableBody");
const filterBtns = document.querySelectorAll(".filter-btn");

let baseCourses = [];
let currentCourses = [];
const plannedMap = new Map();
let currentFilter = "all";

function updateCourseDatalist() {
  courseCodeList.innerHTML = "";
  for (const c of baseCourses) {
    const opt = document.createElement("option");
    opt.value = c.code;
    opt.textContent = `${c.code} - ${c.name} (${c.credits} TC)`;
    courseCodeList.appendChild(opt);
  }
}

function renderPlanTags() {
  planTags.innerHTML = "";
  if (plannedMap.size === 0) {
    planTags.classList.add("hidden");
    clearPlansBtn.classList.add("hidden");
    return;
  }

  planTags.classList.remove("hidden");
  clearPlansBtn.classList.remove("hidden");

  for (const [code, plan] of plannedMap.entries()) {
    const tag = document.createElement("span");
    tag.className = "plan-tag";

    const label = document.createElement("span");
    label.textContent = `${code}: ${plan.score10} (${score10ToLetter(plan.score10)}) · ${plan.credits} TC`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.title = "Xóa kế hoạch môn này";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      plannedMap.delete(code);
      recalculateAndRender();
    });

    tag.append(label, removeBtn);
    planTags.appendChild(tag);
  }
}

function prefillPlanForm(code, name, credits, score10) {
  planCodeInput.value = code;
  planNameInput.value = name;
  planCreditsInput.value = String(credits > 0 ? credits : 3);
  planScoreInput.value = score10 !== null && score10 !== undefined ? String(score10) : "";
  planScoreInput.focus();
}

function renderTable() {
  courseTableBody.innerHTML = "";

  const filtered = currentCourses.filter((c) => {
    if (currentFilter === "counted") return c.statusType === "counted";
    if (currentFilter === "excluded") return c.statusType !== "counted";
    return true;
  });

  if (filtered.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 9;
    td.className = "center";
    td.textContent = "Không có môn học nào phù hợp.";
    tr.appendChild(td);
    courseTableBody.appendChild(tr);
    return;
  }

  filtered.forEach((c, idx) => {
    const tr = document.createElement("tr");
    if (c.isPlanned) {
      tr.className = "row-planned";
    }

    const tdIdx = document.createElement("td");
    tdIdx.textContent = String(idx + 1);

    const tdCode = document.createElement("td");
    const codeSpan = document.createElement("span");
    codeSpan.className = "code-pill";
    codeSpan.textContent = c.code;
    tdCode.appendChild(codeSpan);

    const tdName = document.createElement("td");
    tdName.textContent = c.name;

    const tdCredits = document.createElement("td");
    tdCredits.className = "num";
    tdCredits.textContent = String(c.credits);

    const tdScore10 = document.createElement("td");
    tdScore10.className = "num";
    tdScore10.textContent = c.scoreRaw;
    if (c.isPlanned && c.originalScoreRaw !== null) {
      const diff = document.createElement("span");
      diff.className = "score-diff";
      diff.textContent = `cũ: ${c.originalScoreRaw}`;
      tdScore10.appendChild(diff);
    }

    const tdLetter = document.createElement("td");
    tdLetter.className = "center";
    tdLetter.textContent = c.letter;

    const tdScore4 = document.createElement("td");
    tdScore4.className = "num";
    tdScore4.textContent = c.score4 !== null ? c.score4.toFixed(1) : "--";

    const tdStatus = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = c.isPlanned ? "badge badge-planned" : `badge badge-${c.statusType}`;
    badge.textContent = c.statusText;
    tdStatus.appendChild(badge);

    const tdAction = document.createElement("td");
    tdAction.className = "center";
    if (c.isPlanned) {
      const resetBtn = document.createElement("button");
      resetBtn.type = "button";
      resetBtn.className = "btn btn-ghost btn-xs";
      resetBtn.textContent = "Hủy";
      resetBtn.addEventListener("click", () => {
        plannedMap.delete(c.code);
        recalculateAndRender();
      });
      tdAction.appendChild(resetBtn);
    } else {
      const planBtn = document.createElement("button");
      planBtn.type = "button";
      planBtn.className = "btn btn-secondary btn-xs";
      planBtn.textContent = c.score10 !== null ? "Cải thiện" : "Mục tiêu";
      planBtn.addEventListener("click", () => {
        prefillPlanForm(c.code, c.name, c.credits, c.score10);
      });
      tdAction.appendChild(planBtn);
    }

    tr.append(tdIdx, tdCode, tdName, tdCredits, tdScore10, tdLetter, tdScore4, tdStatus, tdAction);
    courseTableBody.appendChild(tr);
  });
}

function formatDelta(diff) {
  const sign = diff >= 0 ? "+" : "";
  return `${sign}${diff.toFixed(2)}`;
}

function recalculateAndRender() {
  if (baseCourses.length === 0 && plannedMap.size === 0) {
    resultsSection.classList.add("hidden");
    currentCourses = [];
    return;
  }

  currentCourses = mergeCourses(baseCourses, plannedMap);
  const stats = calculateGPA(currentCourses);
  const baseStats = calculateGPA(baseCourses);
  const hasPlans = plannedMap.size > 0;

  gpa10Value.textContent = stats.gpa10.toFixed(2);
  if (hasPlans && baseCourses.length > 0) {
    const diff10 = stats.gpa10 - baseStats.gpa10;
    gpa10Sub.textContent = `Hiện tại: ${baseStats.gpa10.toFixed(2)} (${formatDelta(diff10)})`;
  } else {
    gpa10Sub.textContent = `${stats.countedCredits} tín chỉ tính điểm`;
  }

  gpa4Value.textContent = stats.gpa4.toFixed(2);
  if (hasPlans && baseCourses.length > 0) {
    const diff4 = stats.gpa4 - baseStats.gpa4;
    gpa4Sub.textContent = `Hiện tại: ${baseStats.gpa4.toFixed(2)} (${formatDelta(diff4)})`;
  } else {
    gpa4Sub.textContent = "Quy đổi từ điểm chữ (thang 4.0)";
  }

  countedCoursesValue.textContent = String(stats.countedCourses);
  totalParsedSub.textContent = `Trên tổng ${stats.totalCourses} môn nhận diện`;

  countedCreditsValue.textContent = String(stats.countedCredits);
  ignoredCreditsSub.textContent = `${stats.ignoredCredits} tín chỉ miễn thi / chưa có điểm`;

  accumulatedCreditsValue.textContent = String(stats.accumulatedCredits);
  const specialPassCredits = stats.accumulatedCredits - stats.countedCredits;
  accumulatedCreditsSub.textContent =
    specialPassCredits > 0
      ? `Gồm ${stats.countedCredits} TC điểm + ${specialPassCredits} TC MT/Đạt`
      : "Tổng tín chỉ đã đạt";

  countAll.textContent = String(currentCourses.length);
  countCounted.textContent = String(stats.countedCourses);
  countExcluded.textContent = String(currentCourses.length - stats.countedCourses);

  resultsSection.classList.remove("hidden");
  renderPlanTags();
  renderTable();
}

function runCalculation() {
  const text = rawInput.value.trim();
  baseCourses = text ? parseMyBKText(text) : [];
  updateCourseDatalist();
  recalculateAndRender();
}

planCodeInput.addEventListener("input", () => {
  const code = planCodeInput.value.trim().toUpperCase();
  const existing = baseCourses.find((c) => c.code === code);
  if (existing) {
    planNameInput.value = existing.name;
    if (existing.credits > 0) {
      planCreditsInput.value = String(existing.credits);
    }
  }
});

planForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const code = planCodeInput.value.trim().toUpperCase();
  const name = planNameInput.value.trim();
  const credits = parseFloat(planCreditsInput.value);
  const score10 = parseFloat(planScoreInput.value);

  if (
    !code ||
    !name ||
    Number.isNaN(credits) ||
    !Number.isInteger(credits) ||
    credits < 1 ||
    credits > 4 ||
    Number.isNaN(score10) ||
    score10 < 0 ||
    score10 > 10
  ) {
    return;
  }

  plannedMap.set(code, { code, name, credits, score10 });
  planCodeInput.value = "";
  planNameInput.value = "";
  planScoreInput.value = "";
  recalculateAndRender();
});

clearPlansBtn.addEventListener("click", () => {
  plannedMap.clear();
  recalculateAndRender();
});

rawInput.addEventListener("paste", () => {
  setTimeout(runCalculation, 0);
});

rawInput.addEventListener("input", runCalculation);

clearBtn.addEventListener("click", () => {
  rawInput.value = "";
  baseCourses = [];
  plannedMap.clear();
  updateCourseDatalist();
  resultsSection.classList.add("hidden");
  currentCourses = [];
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTable();
  });
});
