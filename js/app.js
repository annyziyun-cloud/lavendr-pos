/* =======================================================
   1. 全域資料庫與狀態管理 (Global State)
   ======================================================= */
let memberDatabase = {
    '0900000000': {
        name: '醬寶寶', phone: '0900000000', gender: '男', birthday: '1998-05-20', idNumber: 'A123456789',
        tier: '薰衣草花田 Lavender', points: 2500, annualSpend: 15800,
        orders: [{ id: 'ORD-001', item: '客製化香水 (木質調)', status: '待取貨' }],
        reservations: [{ date: '2026-10-10 14:00-15:00', type: '一對一調香訂製' }],
        usedSeriesDiscount: false // ★ 新增：紀錄是否用過特定系列優惠
    },
    '0911111111': {
        name: 'Anny', phone: '0911111111', gender: '女', birthday: '2003-11-26', idNumber: 'F223344556',
        tier: '晨露花香 Dewdrop', points: 850, annualSpend: 3200,
        orders: [
            { id: 'ORD-002', item: '薰衣草保濕潔手露', status: '待取貨' },
            { id: 'ORD-003', item: '晨露花香香氛蠟燭', status: '已領取' }
        ],
        reservations: [],
        usedSeriesDiscount: true // ★ 模擬：Anny 已經用過優惠了
    }
};

let currentViewedMemberPhone = '';

/* =======================================================
   ★ Lavend/r 調香系統大腦：題目、標籤與故事資料庫
   ======================================================= */
const scentQuizData = {
    baseQuestions: [
        {
            id: 'Q1', question: '推開 Lavend/r 的門，你希望今天帶走的這瓶香水，是為了誰而調製？',
            options: [
                { label: '「給現在的我」', value: 'A' }, { label: '「給理想中的我」', value: 'B' },
                { label: '「給特別的你」', value: 'C' }, { label: '「給某個瞬間」', value: 'D' }
            ]
        },
        {
            id: 'Q2', question: '當這股氣味與肌膚融合時，你希望它散發的是什麼樣感受？',
            options: [
                { label: '安靜而保有邊界：不過度熱情，帶點清冷與疏離感...', value: 'A', archetype: 'intellectual_woods' },
                { label: '充滿張力與生命力：打破沉悶，帶有反差感...', value: 'B', archetype: 'vibrant_awakening' },
                { label: '溫潤而包容：沒有攻擊性，像一個安全的避風港...', value: 'C', archetype: 'second_skin' },
                { label: '深邃且難以捉摸：充滿未說出口的潛台詞...', value: 'D', archetype: 'velvet_paradox' }
            ]
        },
        {
            id: 'Q3', question: '如果這瓶香水是一本小說，你認為哪一句話最適合印在扉頁呢?',
            options: [
                { label: '「在極致的克制與秩序中，往往藏著最深沉的熱愛。」', value: 'A', archetype: 'intellectual_woods' },
                { label: '「平靜的水面下，是旁人看不見的暗湧。」', value: 'B', archetype: 'velvet_paradox' },
                { label: '「那些沒有說出口的，都在空氣裡了。」', value: 'C', archetype: 'grounded_earth' },
                { label: '「故事從最精彩的半途開始，沒有起點，也沒有終點。」', value: 'D', archetype: 'vibrant_awakening' }
            ]
        },
        {
            id: 'Q4', question: '閉上眼睛想像，這段故事的「底色與質地」摸起來是什麼感覺？',
            options: [
                { label: '冰涼的拋光石材，或是雨後乾淨微冷的空氣。', value: 'A', archetype: 'mineral_horizon' },
                { label: '陽光曬過的棉麻布料，帶著體溫的柔軟。', value: 'B', archetype: 'second_skin' },
                { label: '帶有顆粒感的粗糙羊皮紙，或是乾燥的木柴。', value: 'C', archetype: 'intellectual_woods' },
                { label: '揉碎的綠色枝葉，與剛拂過果園的微風。', value: 'D', archetype: 'grounded_earth' }
            ]
        },
        {
            id: 'Q5', question: '這瓶香水中，你最「不可不可或缺」的核心靈魂是什麼？',
            options: [
                { label: '茶香與木質的沉穩（伯爵茶、檀香、雪松）', value: 'A', archetype: 'intellectual_woods', note: '伯爵茶、檀香' },
                { label: '花朵與果實的靈動（玫瑰、鈴蘭、無花果、柑橘）', value: 'B', archetype: 'vibrant_awakening', note: '千葉玫瑰、水蜜桃' },
                { label: '辛香與皮革的微醺（粉紅胡椒、莎草、麂皮）', value: 'C', archetype: 'velvet_paradox', note: '粉紅胡椒、莎草' },
                { label: '乾淨皂香與草本的純粹（薰衣草、薄荷、白麝香）', value: 'D', archetype: 'second_skin', note: '薰衣草、白麝香' }
            ]
        },
        {
            id: 'Q6', question: '最後，有什麼氣味元素是你希望「絕對不要出現」的？(可多選)', multiple: true,
            options: [
                { label: '過於甜膩的糖果/香草味', value: 'A' }, { label: '濃烈的白花香（如茉莉、晚香玉）', value: 'B' },
                { label: '帶有侵略性的辛香料味', value: 'C' }, { label: '潮濕的泥土或苔蘚味', value: 'D' },
                { label: '毫無禁忌，請給我驚喜', value: 'E', exclusive: true } 
            ]
        }
    ],
    branches: {
        'A': [ 
            {
                id: 'A1', question: '哪一個瞬間最能讓你感到絕對的「愜意」與放鬆？',
                options: [
                    { label: '午後的一場大雨後，空氣充滿濕度，青草與土壤的氣味。', value: '1', note: '橡木苔、岩蘭草、苦橙葉' },
                    { label: '早晨陽光透過亞麻窗簾，灑在剛洗淨的純白床單上。', value: '2', note: '鈴蘭、鳶尾花、純淨皂香' },
                    { label: '夜晚點起暖黃閱讀燈，窩在沙發裡翻閱舊書，喝著茶。', value: '3', note: '伯爵茶、雪松、琥珀' },
                    { label: '漫步在清晨薄霧的海灘，迎面吹來帶有鹽分的微風。', value: '4', note: '海鹽、鼠尾草、冰涼醛香' }
                ]
            },
            {
                id: 'A2', question: '當置身於人群中時，別人在第一時間感受到的你，最接近哪一種輪廓？',
                options: [
                    { label: '「打磨光滑的冷調大理石」', value: '1', note: '柏樹、微苦的冷木質' },
                    { label: '「透著微光的亞麻織物」', value: '2', note: '羊絨木、洋甘菊' },
                    { label: '「帶有解構剪裁的深色層次」', value: '3', note: '帶煙燻感的木質、沉香' },
                    { label: '「折射著光線的流動稜鏡」', value: '4', note: '杜松子、乾淨雪松' }
                ]
            },
            {
                id: 'A3', question: '如果這瓶香水化作一句低語，那會是下列哪一句？',
                options: [
                    { label: '「世界再喧囂，我也能成為自己的避難所。」', value: '1' },
                    { label: '「你不必總是那麼堅強，允許自己被溫柔地接住吧。」', value: '2' },
                    { label: '「無論好壞，所有的經歷都是為了迎來下一次的破曉。」', value: '3' },
                    { label: '「就讓心裡保留一片下雨的空間，陰影裡也有它的美意。」', value: '4' }
                ]
            }
        ],
        'B': [], 'C': [], 'D': [] 
    }
};

const fragranceProfiles = {
    'intellectual_woods': {
        name: '冷調木質與茶 (The Intellectual Woods)', quote: '「在極致的克制與秩序中，往往藏著最深沉的熱愛。」',
        storyTemplate: ['推開極簡純白的空間，大理石桌面乾淨無瑕，只放著一杯散發著裊裊熱氣的伯爵茶。','這是屬於理智者的氣息，外表看似高冷、保持著優雅的界線感，內心卻對世界有著最細膩而通透的解讀。','它的香氣俐落而有支撐力，是一件能在喧囂中維持自我秩序的隱形戰袍。']
    },
    'second_skin': {
        name: '純淨皂香與柔白麝香 (The Second Skin)', quote: '「你不必總是那麼堅強，允許自己被溫柔地接住吧。」',
        storyTemplate: ['早晨的陽光透過亞麻窗簾，輕輕灑落在剛洗淨的純白床單上。','這是不具任何攻擊性的溫柔，宛如第二層肌膚般的陪伴。','它不急於彰顯個性，而是在你疲憊時，用微溫的膚觸感卸下你所有的防備，給你一個最安穩、沒有評價的擁抱。']
    },
    'mineral_horizon': {
        name: '海洋礦物與晨露 (The Mineral Horizon)', quote: '「任憑時間在此緩步，沉澱出無可撼動的安定。」',
        storyTemplate: ['獨自漫步在清晨還帶著薄霧的灰藍色海灘，迎面而來的是帶有鹽分與冷空氣的微風。','獻給渴望抽離、嚮往絕對自由的靈魂。','這股帶有透明感與空間感的氣息，宛如將一切繁冗斷捨離，只留下最純粹的自己，是通往內在平靜的鑰匙。']
    },
    'grounded_earth': {
        name: '大地草本與綠意 (The Grounded Earth)', quote: '「就讓心裡保留一片下雨的空間，陰影裡也有它的美意。」',
        storyTemplate: ['午後的一場大雨，洗刷了森林裡的泥土與青草，空氣中帶著微濕潤的重量。','這是一款向下扎根的氣味，充滿生命經歷過風雨後的韌性。','適合那些內心豐富、懂得欣賞事物殘缺美感，並習慣在安靜與復古的氛圍中積蓄力量的敘事者。']
    },
    'velvet_paradox': {
        name: '辛香微醺與皮革 (The Velvet Paradox)', quote: '「平靜的水面下，是旁人看不見的暗湧。」',
        storyTemplate: ['深夜裡點著微光的吧台，或是翻閱到一半、散發著墨水味的陳年舊書。','帶有微微的辛辣與煙燻感，像是為了保護柔軟內心而長出的優雅刺。','氣味深邃且充滿未說出口的潛台詞，反差極大，需要時間一層層剝開，極具魅惑與知性的餘韻。']
    },
    'vibrant_awakening': {
        name: '明亮柑橘與花果 (The Vibrant Awakening)', quote: '「故事從最精彩的半途開始，沒有起點，也沒有終點。」',
        storyTemplate: ['折射著光線的流動稜鏡，將沉悶的空氣瞬間劃破。','跳躍的多汁果香與靈動的花朵，瓦解了過度的緊繃與猶豫不決。','這是破繭而出的生命力，帶有微氣泡般的明亮感，宣告著對未知的熱愛與無所畏懼，隨時準備好迎向下一場冒險。']
    }
};

let currentQuizSession = { customerPhone: '', answers: {}, calculatedResult: null };

/* =======================================================
   2. 基礎導覽邏輯 (Navigation)
   ======================================================= */
function switchTab(tabId) {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => section.style.display = 'none');
    
    const navBtns = document.querySelectorAll('.nav-buttons button');
    navBtns.forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const activeSection = document.getElementById(tabId);
    if (activeSection) activeSection.style.display = 'block';

    if (tabId === 'tab-member' && currentViewedMemberPhone !== '') {
        const member = memberDatabase[currentViewedMemberPhone];
        if(member) {
            renderProfileCard(member);
            document.getElementById('memberResult').style.display = 'block';
        }
    }
    
    // ★ 切換到 POS 時，自動載入商品與當前客人資訊
    if (tabId === 'tab-pos') {
        initPOS();
    }
}

/* =======================================================
   3. 分頁一：會員接待與操作
   ======================================================= */
function hideAllMemberSections() {
    document.getElementById('memberResult').style.display = 'none';
    document.getElementById('tierInfo').style.display = 'none';
    document.getElementById('registrationForm').style.display = 'none';
}

function searchMember() {
    const phoneInput = document.getElementById('phoneSearch').value.trim();
    if (phoneInput === '') { alert('請輸入顧客電話！'); return; }

    hideAllMemberSections();
    const member = memberDatabase[phoneInput];

    if (member) {
        currentViewedMemberPhone = phoneInput; 
        renderProfileCard(member);
        document.getElementById('memberResult').style.display = 'block';
    } else {
        alert('查無此會員，請建立新客檔案。');
        showRegistrationForm(phoneInput);
    }
}

function showRegistrationForm(prefillPhone = '') {
    hideAllMemberSections();
    document.getElementById('regPhone').value = prefillPhone;
    document.getElementById('registrationForm').style.display = 'block';
}

function cancelRegistration() {
    hideAllMemberSections();
    document.getElementById('tierInfo').style.display = 'block';
}

function submitRegistration(event) {
    event.preventDefault(); 
    const phone = document.getElementById('regPhone').value;
    const name = document.getElementById('regName').value;
    const gender = document.getElementById('regGender').value;
    const birthday = document.getElementById('regBirthday').value;
    const idNum = document.getElementById('regId').value;

    if(memberDatabase[phone]) { alert('此電話已註冊！'); return; }

    memberDatabase[phone] = {
        name: name, phone: phone, gender: gender, birthday: birthday, idNumber: idNum,
        tier: '微風草本 Seedling', points: 0, annualSpend: 0, orders: [], reservations: [],
        usedSeriesDiscount: false
    };

    alert('新客檔案建立成功！');
    document.getElementById('phoneSearch').value = phone;
    searchMember(); 
}

function renderProfileCard(member) {
    const resultBox = document.getElementById('memberResult');
    let reservationHtml = member.reservations.length > 0 
        ? `<div class="reservation-box active-res">📅 近期預約：${member.reservations[0].date}｜${member.reservations[0].type}</div>`
        : `<div class="reservation-box empty-res">📅 近期無預約</div>`;

    resultBox.innerHTML = `
        <div style="width: 100%;">
            <div class="profile-header">
                <div>
                    <h3 style="margin:0; font-size: 1.8rem;">${member.name}</h3>
                    <p style="margin: 5px 0 0; color: var(--lavender-primary);">${member.tier}</p>
                </div>
                <div class="profile-actions">
                    <button class="btn-primary" onclick="renderOrders()">🛍️ 待取貨單</button>
                    <button class="btn-secondary" onclick="renderAccountSettings()">⚙️ 帳戶設定</button>
                </div>
            </div>
            <div class="profile-info">
                <div class="info-item"><span class="info-label">聯絡電話</span><span class="info-value">${member.phone}</span></div>
                <div class="info-item"><span class="info-label">目前點數</span><span class="info-value" style="color: var(--accent-gold);">${member.points} pts</span></div>
                <div class="info-item"><span class="info-label">年度消費累積</span><span class="info-value">NT$ ${member.annualSpend.toLocaleString()}</span></div>
            </div>
            <div class="profile-footer">${reservationHtml}</div>
        </div>
    `;
}

function renderOrders() {
    const member = memberDatabase[currentViewedMemberPhone];
    const resultBox = document.getElementById('memberResult');

    let ordersHtml = (!member.orders || member.orders.length === 0) 
        ? `<p style="color:var(--text-muted); text-align:center; padding: 2rem 0;">目前無待取貨單。</p>`
        : `<ul class="order-list">` + member.orders.map((o, i) => o.status === '待取貨' 
            ? `<li class="order-item"><div class="order-info"><span>📦 ${o.item}</span><span class="badge badge-pending">${o.status}</span></div><button class="btn-small" onclick="updateOrderStatus(${i})">設為已領取</button></li>`
            : `<li class="order-item completed"><div class="order-info"><span>✅ ${o.item}</span><span class="badge badge-completed">${o.status}</span></div></li>`).join('') + `</ul>`;

    resultBox.innerHTML = `
        <div style="width: 100%;">
            <div class="profile-header" style="border-bottom:none;"><h3 style="margin:0;">🛍️ 訂單管理</h3></div>
            <div class="form-body" style="padding: 0;">${ordersHtml}<div class="form-actions"><button class="btn-primary" onclick="searchMember()">返回</button></div></div>
        </div>
    `;
}

function updateOrderStatus(i) {
    memberDatabase[currentViewedMemberPhone].orders[i].status = '已領取';
    renderOrders(); 
}

function renderAccountSettings() {
    const member = memberDatabase[currentViewedMemberPhone];
    document.getElementById('memberResult').innerHTML = `
        <div style="width: 100%;">
            <div class="profile-header" style="border-bottom:none;"><h3 style="margin:0;">⚙ 帳戶設定</h3></div>
            <div class="form-body" style="padding: 0;">
                <div class="form-group"><label>聯絡電話 (可修改)</label><input type="tel" id="editPhone" value="${member.phone}"></div>
                <div style="display:flex; gap:15px;">
                    <div class="form-group" style="flex:1;"><label>生日 (不可修改)</label><input type="text" value="${member.birthday}" readonly></div>
                    <div class="form-group" style="flex:1;"><label>身分證/護照 (不可修改)</label><input type="text" value="${member.idNumber}" readonly></div>
                </div>
                <div class="form-actions" style="justify-content: space-between;">
                    <button class="btn-danger" onclick="deleteAccount()">註銷帳號</button>
                    <div><button class="btn-text" onclick="searchMember()">返回</button><button class="btn-primary" onclick="saveAccountSettings()">儲存</button></div>
                </div>
            </div>
        </div>
    `;
}

function saveAccountSettings() {
    const newPhone = document.getElementById('editPhone').value;
    const oldPhone = currentViewedMemberPhone;
    if (newPhone !== oldPhone) {
        memberDatabase[newPhone] = memberDatabase[oldPhone];
        memberDatabase[newPhone].phone = newPhone;
        delete memberDatabase[oldPhone];
        currentViewedMemberPhone = newPhone;
        document.getElementById('phoneSearch').value = newPhone;
    }
    alert('資料更新成功！'); searchMember();
}

function deleteAccount() {
    if (confirm('確定要註銷此帳號嗎？')) {
        delete memberDatabase[currentViewedMemberPhone];
        alert('帳號已註銷。');
        document.getElementById('phoneSearch').value = '';
        currentViewedMemberPhone = '';
        hideAllMemberSections();
        document.getElementById('tierInfo').style.display = 'block';
    }
}

/* =======================================================
   4. 分頁二：專屬調香 - 預約矩陣系統
   ======================================================= */
const TIME_SLOTS = ["10:00-11:00", "11:30-12:30", "14:00-15:00", "15:30-16:30", "17:00-18:00", "18:30-19:30"];
let currentSelectedDate = '';
let pendingBookingSlot = null; 

let scheduleDatabase = {
    '2026-10-10': { '14:00-15:00': ['0900000000'] }
};

function initBookingDashboard() {
    const dateInput = document.getElementById('bookingDate');
    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    dateInput.value = formattedToday;
    currentSelectedDate = formattedToday;

    dateInput.addEventListener('change', (e) => {
        currentSelectedDate = e.target.value;
        renderDailySchedule(currentSelectedDate);
    });

    renderDailySchedule(currentSelectedDate);
}
window.addEventListener('DOMContentLoaded', initBookingDashboard);

function renderDailySchedule(date) {
    const container = document.getElementById('dailySchedule');
    container.innerHTML = '';
    const dayData = scheduleDatabase[date] || {};

    TIME_SLOTS.forEach(slot => {
        const bookedPhones = dayData[slot] || [];
        const currentCount = bookedPhones.length;
        
        let slotHtml = `<div class="time-slot-card"><div class="slot-header"><span class="slot-time">${slot}</span><span class="slot-capacity">${currentCount} / 2 人</span></div><div class="booked-list">`;

        bookedPhones.forEach(phone => {
            const member = memberDatabase[phone];
            if (member) {
                slotHtml += `<div class="booked-customer" onclick="openWorkbench('${phone}', '${date}', '${slot}')"><span>👤 ${member.name}</span><span style="color:#888; font-size:0.85rem;">${phone}</span></div>`;
            }
        });

        if (currentCount < 2) {
            slotHtml += `<button class="empty-slot-btn" onclick="addBooking('${date}', '${slot}')">+ 新增該時段預約</button>`;
        }
        slotHtml += `</div></div>`;
        container.innerHTML += slotHtml;
    });
}

function addBooking(date, slot) {
    pendingBookingSlot = { date, slot };
    document.getElementById('bookingModalText').textContent = `請輸入欲預約 【${date} ${slot}】 的顧客電話：`;
    document.getElementById('bookingModalPhone').value = '';
    document.getElementById('bookingModal').style.display = 'flex'; 
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
    pendingBookingSlot = null;
}

function confirmBooking() {
    if (!pendingBookingSlot) return;
    const { date, slot } = pendingBookingSlot;
    const phoneInput = document.getElementById('bookingModalPhone').value.trim();

    if (!phoneInput) { alert('請輸入顧客電話！'); return; }
    if (!memberDatabase[phoneInput]) {
        alert('查無此會員！請先至「1. 會員接待」建立檔案。');
        closeBookingModal();
        switchTab('tab-member');
        document.getElementById('phoneSearch').value = phoneInput;
        searchMember();
        return;
    }

    if (!scheduleDatabase[date]) scheduleDatabase[date] = {};
    if (!scheduleDatabase[date][slot]) scheduleDatabase[date][slot] = [];
    if (scheduleDatabase[date][slot].includes(phoneInput)) {
        alert('此顧客已預約該時段，一個名字僅能製作一瓶。'); return;
    }

    scheduleDatabase[date][slot].push(phoneInput);
    memberDatabase[phoneInput].reservations.unshift({ date: `${date} ${slot}`, type: '一對一調香訂製' });

    alert(`預約成功！`);
    closeBookingModal();
    renderDailySchedule(date);
}

/* =======================================================
   5. 分頁二：專屬調香工作台 (問卷與演算法)
   ======================================================= */
let quizQueue = []; 
let currentQuestionIndex = 0; 
let selectedOptionValues = []; 

function openWorkbench(phone, date, slot) {
    const member = memberDatabase[phone];
    document.getElementById('bookingDashboard').style.display = 'none';
    document.getElementById('workbenchView').style.display = 'block';
    document.getElementById('wbCustomerName').textContent = `調香處方箋 - 👤 ${member.name}`;
    document.getElementById('wbCustomerPhone').textContent = `時段：${date} ${slot} ｜ 電話：${member.phone}`;
    startQuiz(phone);
}

function closeWorkbench() {
    document.getElementById('workbenchView').style.display = 'none';
    document.getElementById('bookingDashboard').style.display = 'block';
}

function startQuiz(phone) {
    currentQuizSession.customerPhone = phone;
    currentQuizSession.answers = {};
    quizQueue = [...scentQuizData.baseQuestions];
    currentQuestionIndex = 0;

    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('postQuizSteps').style.display = 'none';

    renderQuestion();
}

function renderQuestion() {
    const container = document.getElementById('quizContainer');
    const questionData = quizQueue[currentQuestionIndex];
    selectedOptionValues = []; 

    const isMultiple = questionData.multiple ? true : false;
    let optionsHtml = '';
    
    questionData.options.forEach((opt, index) => {
        const isExclusive = opt.exclusive ? true : false;
        optionsHtml += `<button class="quiz-option-btn" id="opt_${index}" onclick="selectOption(${index}, '${opt.value}', ${isMultiple}, ${isExclusive})">${opt.label}</button>`;
    });

    container.innerHTML = `
        <div class="quiz-question" style="animation: fadeIn 0.3s ease-out;">
            <span style="color: var(--lavender-primary); margin-right: 8px;">${questionData.id}.</span>${questionData.question}
        </div>
        <div class="quiz-options" style="animation: fadeIn 0.4s ease-out;">
            ${optionsHtml}
        </div>
        <div class="quiz-actions">
            <button class="btn-primary" onclick="nextQuestion()" id="nextBtn" disabled style="opacity: 0.5; cursor: not-allowed;">下一題 ➔</button>
        </div>
    `;
}

function selectOption(index, value, isMultiple, isExclusive) {
    const btn = document.getElementById(`opt_${index}`);
    const nextBtn = document.getElementById('nextBtn');
    const currentQ = quizQueue[currentQuestionIndex];

    if (!isMultiple) {
        document.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedOptionValues = [value];
    } else {
        if (isExclusive) {
            document.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedOptionValues = [value];
        } else {
            currentQ.options.forEach((opt, idx) => {
                if(opt.exclusive) {
                    document.getElementById(`opt_${idx}`).classList.remove('selected');
                    selectedOptionValues = selectedOptionValues.filter(v => v !== opt.value);
                }
            });

            if (btn.classList.contains('selected')) {
                btn.classList.remove('selected');
                selectedOptionValues = selectedOptionValues.filter(v => v !== value); 
            } else {
                btn.classList.add('selected');
                selectedOptionValues.push(value); 
            }
        }
    }

    if (selectedOptionValues.length > 0) {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    } else {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
    }
}

function nextQuestion() {
    if (selectedOptionValues.length === 0) return;

    const currentQ = quizQueue[currentQuestionIndex];
    currentQuizSession.answers[currentQ.id] = currentQ.multiple ? [...selectedOptionValues] : selectedOptionValues[0];

    if (currentQ.id === 'Q1') {
        const branchChoice = selectedOptionValues[0];
        const branchQuestions = scentQuizData.branches[branchChoice];
        if (branchQuestions && branchQuestions.length > 0) {
            quizQueue = quizQueue.concat(branchQuestions);
        }
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < quizQueue.length) { renderQuestion(); } 
    else { finishQuiz(); }
}

function finishQuiz() {
    document.getElementById('quizContainer').style.display = 'none';
    const resultBox = document.getElementById('quizResult');
    const ans = currentQuizSession.answers;
    
    let scores = {
        'intellectual_woods': 0, 'second_skin': 0, 'mineral_horizon': 0, 
        'grounded_earth': 0, 'velvet_paradox': 0, 'vibrant_awakening': 0
    };

    const allQuestions = [...scentQuizData.baseQuestions, ...(scentQuizData.branches[ans['Q1']] || [])];
    let topNote = '佛手柑、清涼微風'; 
    let middleNote = '純淨白麝香';
    let baseNote = '溫暖雪松';

    allQuestions.forEach(q => {
        const selectedValue = ans[q.id];
        if(!selectedValue || Array.isArray(selectedValue)) return; 

        const selectedOption = q.options.find(opt => opt.value === selectedValue);
        if (selectedOption) {
            if(selectedOption.archetype && scores[selectedOption.archetype] !== undefined) {
                scores[selectedOption.archetype] += 1; 
            }
            if(q.id === 'A1') topNote = selectedOption.note;
            if(q.id === 'Q5') middleNote = selectedOption.note;
            if(q.id === 'A2') baseNote = selectedOption.note;
        }
    });

    const sortedArchetypes = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    const mainProfile = fragranceProfiles[sortedArchetypes[0]];

    resultBox.innerHTML = `
        <div style="border: 1px solid var(--lavender-primary); border-radius: 8px; padding: 2rem; background: #fff; text-align: center;">
            <p style="color: var(--text-muted); letter-spacing: 2px; font-size: 0.85rem; margin: 0 0 10px 0;">YOUR SCENT NARRATIVE</p>
            <h3 style="color: var(--lavender-primary); font-size: 1.6rem; margin: 0 0 5px 0;">《${mainProfile.name}》</h3>
            <p style="font-style: italic; color: var(--text-dark); margin-bottom: 2rem;">${mainProfile.quote}</p>
            <div style="text-align: left; background: #faf9f8; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                <h4 style="margin-top: 0; color: var(--text-dark); border-bottom: 1px solid #ddd; padding-bottom: 8px;">專屬香氣結構</h4>
                <p><strong>前調 (Top)</strong>： ${topNote}</p><p><strong>中調 (Middle)</strong>： ${middleNote}</p><p><strong>後調 (Base)</strong>： ${baseNote}</p>
            </div>
            <div style="text-align: left; line-height: 1.8; color: #555; font-size: 0.95rem;">
                <p><strong>氣味解析：</strong></p>
                <p>初聞時，<strong>[${topNote}]</strong> 就像 ${getOptionLabel('A1', ans['A1'])}</p>
                <p>核心的 <strong>[${middleNote}]</strong> ，${mainProfile.storyTemplate[1]}</p>
                <p>隨著時間推移，香氣會沉澱為 <strong>[${baseNote}]</strong>。${mainProfile.storyTemplate[2]}</p>
            </div>
        </div>
    `;

    resultBox.style.display = 'block';
    document.getElementById('postQuizSteps').style.display = 'block';
}

function getOptionLabel(questionId, value) {
    if(!value) return '一段未知的旅程。';
    const allQuestions = [...scentQuizData.baseQuestions, ...scentQuizData.branches['A']];
    const q = allQuestions.find(q => q.id === questionId);
    if (!q) return '一段未知的旅程。';
    const opt = q.options.find(o => o.value === value);
    return opt ? opt.label.replace(/。$/, '') + '；' : '一段未知的旅程。';
}


/* =======================================================
   6. 分頁三：結帳工作台 (進階金流與數位收據)
   ======================================================= */
const productCatalog = [
    { id: 'P01', name: '客製化調香香水 (50ml)', series: '調香訂製', price: 3280 },
    { id: 'P02', name: '保濕潔手露', series: '淨化系列', price: 850 },
    { id: 'P03', name: '舒緩沐浴油', series: '淨化系列', price: 1250 },
    { id: 'P04', name: '香氛蠟燭', series: '居家空間系列', price: 1580 },
    { id: 'P05', name: '大理石擴香石', series: '居家空間系列', price: 680 },
    { id: 'P06', name: '香氛護髮精油', series: '養護精油系列', price: 800 }
];

let shoppingCart = [];
let currentTotalForCheckout = 0; // 用於全域計算找零

function initPOS() {
    renderProductCatalog();
    updateCartUI();
}

function renderProductCatalog() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    productCatalog.forEach(product => {
        grid.innerHTML += `
            <div class="product-card" onclick="addToCart('${product.id}')">
                <div class="product-series">${product.series}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">NT$ ${product.price.toLocaleString()}</div>
            </div>
        `;
    });
}

// 加入購物車 (預設一般商品為已領取，客製調香強制為待取貨)
function addToCart(productId) {
    const product = productCatalog.find(p => p.id === productId);
    if(product) {
        // 使用解構賦值複製商品，並給予獨立的狀態屬性
        let defaultStatus = product.name.includes('客製化調香') ? '待取貨' : '已領取';
        shoppingCart.push({ ...product, status: defaultStatus });
        updateCartUI();
    }
}

// 修改購物車內單一商品的狀態
function updateItemStatus(index, status) {
    shoppingCart[index].status = status;
}

function removeFromCart(index) {
    shoppingCart.splice(index, 1);
    updateCartUI();
}

// 動態切換付款輸入欄位
function togglePaymentFields() {
    const method = document.getElementById('cartPayment').value;
    document.getElementById('payCash').style.display = method === '現金' ? 'block' : 'none';
    document.getElementById('payCredit').style.display = method === '信用卡' ? 'block' : 'none';
    document.getElementById('payMobile').style.display = method === '行動支付' ? 'block' : 'none';
    calculateChange(); // 切換時重新計算找零顯示
}

// 計算現金找零
function calculateChange() {
    const received = parseInt(document.getElementById('cashReceived').value) || 0;
    const change = received - currentTotalForCheckout;
    const display = document.getElementById('changeAmountDisplay');
    
    if (document.getElementById('cartPayment').value !== '現金') return;

    if (change < 0) {
        display.textContent = `金額不足：還差 $${Math.abs(change).toLocaleString()}`;
        display.style.color = '#d9534f';
    } else {
        display.textContent = `找零：$${change.toLocaleString()}`;
        display.style.color = 'var(--lavender-primary)';
    }
}

function updateCartUI() {
    const customerInfo = document.getElementById('cartCustomerInfo');
    const member = memberDatabase[currentViewedMemberPhone];

    if (member) {
        customerInfo.innerHTML = `<strong>👤 結帳對象：${member.name}</strong> 
                                  <br><span style="color:#888; font-size:0.85rem;">目前累積點數: ${member.points} pts ｜ 
                                  特定優惠使用狀態：${member.usedSeriesDiscount ? '<span style="color:#d9534f">已使用過</span>' : '<span style="color:var(--lavender-primary)">尚未使用</span>'}</span>`;
    } else {
        customerInfo.innerHTML = `<strong>🚶‍♂️ 非會員結帳 (Walk-in)</strong> <br><span style="color:#888; font-size:0.85rem;">無法累積點數或使用專屬優惠</span>`;
    }

    const cartItemsDiv = document.getElementById('cartItems');
    cartItemsDiv.innerHTML = '';
    let subtotal = 0;
    let targetSeriesTotal = 0;

    shoppingCart.forEach((item, index) => {
        subtotal += item.price;
        if(item.series === '淨化系列') targetSeriesTotal += item.price;

        // 客製化調香鎖定為待取貨不可改，其他商品可讓店員切換
        const isCustomPerfume = item.name.includes('客製化調香');
        
        cartItemsDiv.innerHTML += `
            <div class="cart-item" style="align-items: flex-start;">
                <div class="cart-item-name">
                    ${item.name} <br>
                    <span style="font-size:0.75rem; color:#888;">${item.series}</span><br>
                    <select class="cart-item-status-select" onchange="updateItemStatus(${index}, this.value)" ${isCustomPerfume ? 'disabled' : ''}>
                        <option value="已領取" ${item.status === '已領取' ? 'selected' : ''}>有現貨 (直接帶走)</option>
                        <option value="待取貨" ${item.status === '待取貨' ? 'selected' : ''}>需訂貨 (待取單)</option>
                    </select>
                </div>
                <div style="text-align: right;">
                    <div class="cart-item-price">$${item.price.toLocaleString()}</div>
                    <button class="btn-remove" style="margin-top: 5px;" onclick="removeFromCart(${index})">移除</button>
                </div>
            </div>
        `;
    });

    let discount = 0;
    if (member && !member.usedSeriesDiscount && targetSeriesTotal >= 2000) {
        discount = 200;
    }

    currentTotalForCheckout = subtotal - discount; // 更新全域變數供現金找零使用

    document.getElementById('cartSubtotal').textContent = `$${subtotal.toLocaleString()}`;
    document.getElementById('cartDiscount').textContent = `-$${discount}`;
    document.getElementById('cartTotal').textContent = `$${currentTotalForCheckout.toLocaleString()}`;
    
    calculateChange(); // 更新購物車時，同步刷新找零金額
}

function processCheckout() {
    if (shoppingCart.length === 0) { alert('購物車是空的！'); return; }

    const paymentMethod = document.getElementById('cartPayment').value;
    let payDetailText = '';

    // ★ 金流防呆驗證
    if (paymentMethod === '現金') {
        const received = parseInt(document.getElementById('cashReceived').value) || 0;
        if (received < currentTotalForCheckout) { alert('實收金額不足！請確認顧客給付金額。'); return; }
        payDetailText = `實收：$${received.toLocaleString()} / 找零：$${(received - currentTotalForCheckout).toLocaleString()}`;
    } else if (paymentMethod === '信用卡') {
        const card = document.getElementById('creditCardNum').value.trim();
        if (!card) { alert('請輸入信用卡卡號！'); return; }
        payDetailText = `卡號末四碼：**** ${card.slice(-4).padStart(4, '0')}`;
    } else if (paymentMethod === '行動支付') {
        const tid = document.getElementById('mobileTransactionId').value.trim();
        if (!tid) { alert('請輸入行動支付的交易成功序號！'); return; }
        payDetailText = `交易序號：${tid}`;
    }

    // 計算優惠與寫入會員資料庫
    let subtotal = 0;
    shoppingCart.forEach(item => subtotal += item.price);
    const discount = subtotal - currentTotalForCheckout;
    const member = memberDatabase[currentViewedMemberPhone];
    const carrier = document.getElementById('cartCarrier').value.trim();

    if (member) {
        if (discount > 0) member.usedSeriesDiscount = true;
        member.points += Math.floor(currentTotalForCheckout / 100);
        member.annualSpend += currentTotalForCheckout;
        
        // 將購物車商品依照各自的狀態(現貨/待取)寫入訂單庫
        shoppingCart.forEach(item => {
            member.orders.unshift({ 
                id: 'ORD-' + Math.floor(Math.random() * 10000), 
                item: item.name, 
                status: item.status 
            });
        });
    }

    // 呼叫數位收據生成器
    generateReceipt(subtotal, discount, currentTotalForCheckout, paymentMethod, payDetailText, carrier);
}

// 產生並顯示數位收據
function generateReceipt(subtotal, discount, total, method, detail, carrier) {
    const now = new Date();
    document.getElementById('receiptDate').textContent = now.toLocaleString('zh-TW', { hour12: false });
    
    const itemsContainer = document.getElementById('receiptItems');
    itemsContainer.innerHTML = shoppingCart.map(item => `
        <div style="display:flex; justify-content:space-between; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px dotted #ccc;">
            <div style="flex:1;">
                <div style="font-weight: bold;">${item.name}</div>
                <div style="font-size:0.75rem; color:#888;">[狀態: ${item.status}]</div>
            </div>
            <div style="font-weight: bold;">$${item.price.toLocaleString()}</div>
        </div>
    `).join('');

    document.getElementById('rcptSub').textContent = `$${subtotal.toLocaleString()}`;
    document.getElementById('rcptDisc').textContent = `-$${discount}`;
    document.getElementById('rcptTotal').textContent = `$${total.toLocaleString()}`;

    document.getElementById('rcptPayMethod').textContent = method;
    document.getElementById('rcptPayDetail').textContent = detail;
    document.getElementById('rcptCarrier').textContent = carrier ? `載具條碼：${carrier}` : '';

    // 顯示收據彈窗
    document.getElementById('receiptModal').style.display = 'flex';
}

// 關閉收據並清空購物車
function closeReceipt() {
    document.getElementById('receiptModal').style.display = 'none';
    shoppingCart = [];
    document.getElementById('cartCarrier').value = '';
    document.getElementById('creditCardNum').value = '';
    document.getElementById('cashReceived').value = '';
    document.getElementById('mobileTransactionId').value = '';
    document.getElementById('cartPayment').selectedIndex = 0;
    
    togglePaymentFields();
    updateCartUI();
}
