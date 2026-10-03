/* =======================================================
   1. 全域資料庫與狀態管理 (Global State)
   ======================================================= */
// 模擬會員資料庫 
let memberDatabase = {
    '0900000000': {
        name: '醬寶寶', phone: '0900000000', gender: '男', birthday: '1998-05-20', idNumber: 'A123456789',
        tier: '薰衣草花田 Lavender', points: 2500, annualSpend: 15800,
        orders: [{ id: 'ORD-001', item: '客製化香水 (木質調)', status: '待取貨' }],
        reservations: [{ date: '2026-10-10 14:00-15:00', type: '一對一調香訂製' }]
    },
    '0911111111': {
        name: 'Anny', phone: '0911111111', gender: '女', birthday: '2003-11-26', idNumber: 'F223344556',
        tier: '晨露花香 Dewdrop', points: 850, annualSpend: 3200,
        orders: [
            { id: 'ORD-002', item: '薰衣草保濕潔手露', status: '待取貨' },
            { id: 'ORD-003', item: '晨露花香香氛蠟燭', status: '已領取' }
        ],
        reservations: []
    }
};

let currentViewedMemberPhone = '';

/* =======================================================
   ★ Lavend/r 調香系統大腦：題目與故事資料庫
   ======================================================= */
const scentQuizData = {
    // 共同必答題 (Q1 ~ Q6)
    baseQuestions: [
        {
            id: 'Q1',
            question: '推開 Lavend/r 的門，你希望今天帶走的這瓶香水，是為了誰而調製？',
            options: [
                { label: '「給現在的我」', value: 'A' },
                { label: '「給理想中的我」', value: 'B' },
                { label: '「給特別的你」', value: 'C' },
                { label: '「給某個瞬間」', value: 'D' }
            ]
        },
        {
            id: 'Q2',
            question: '當這股氣味與肌膚融合時，你希望它散發的是什麼樣感受？',
            options: [
                { label: '安靜而保有邊界：不過度熱情，帶點清冷與疏離感，只讓懂得人靠近。', value: 'A' },
                { label: '充滿張力與生命力：打破沉悶，帶有反差感，讓人無法忽視的存在。', value: 'B' },
                { label: '溫潤而包容：沒有攻擊性，像一個安全的避風港，能承載所有的情緒。', value: 'C' },
                { label: '深邃且難以捉摸：充滿未說出口的潛台詞，需要時間慢慢一層層剝開。', value: 'D' }
            ]
        },
        {
            id: 'Q3',
            question: '如果這瓶香水是一本小說，你認為哪一句話最適合印在扉頁呢?',
            options: [
                { label: '「在極致的克制與秩序中，往往藏著最深沉的熱愛。」', value: 'A' },
                { label: '「平靜的水面下，是旁人看不見的暗湧。」', value: 'B' },
                { label: '「那些沒有說出口的，都在空氣裡了。」', value: 'C' },
                { label: '「故事從最精彩的半途開始，沒有起點，也沒有終點。」', value: 'D' }
            ]
        },
        {
            id: 'Q4',
            question: '閉上眼睛想像，讓香味帶領你前往一個世界，在這世界中，讓你最有感觸的「質地」是什麼呢？',
            options: [
                { label: '冰涼的拋光石材，或是雨後乾淨微冷的空氣。', value: 'A', tags: ['醛香', '白麝香'] },
                { label: '陽光曬過的棉麻布料，帶著體溫的柔軟。', value: 'B', tags: ['香草', '琥珀'] },
                { label: '帶有顆粒感的粗糙羊皮紙，或是乾燥的木柴。', value: 'C', tags: ['廣藿香', '雪松'] },
                { label: '揉碎的綠色枝葉，與剛拂過果園的微風。', value: 'D', tags: ['無花果', '柑橘'] }
            ]
        },
        {
            id: 'Q5',
            question: '這瓶香水中，你最「不可或缺」的核心靈魂是什麼？',
            options: [
                { label: '茶香與木質的沉穩（伯爵茶、檀香、雪松）', value: 'A', tags: ['木質', '茶香'] },
                { label: '花朵與果實的靈動（玫瑰、鈴蘭、無花果、柑橘）', value: 'B', tags: ['花香', '果香'] },
                { label: '辛香與皮革的微醺（粉紅胡椒、莎草、麂皮）', value: 'C', tags: ['辛香', '皮革'] },
                { label: '乾淨皂香與草本的純粹（薰衣草、薄荷、白麝香）', value: 'D', tags: ['草本', '皂香'] }
            ]
        },
        {
            id: 'Q6',
            question: '最後，為了確保劇本的完美，有什麼氣味元素是你希望「絕對不要出現」的？(可多選)',
            multiple: true,
            options: [
                { label: '過於甜膩的糖果/香草味', value: 'A' },
                { label: '濃烈的白花香（如茉莉、晚香玉）', value: 'B' },
                { label: '帶有侵略性的辛香料味', value: 'C' },
                { label: '潮濕的泥土或苔蘚味', value: 'D' },
                { label: '毫無禁忌，請給我驚喜', value: 'E', exclusive: true } 
            ]
        }
    ],

    // 支線題庫
    branches: {
        'A': [ // 支線 A：內在庇護所
            {
                id: 'A1',
                question: '下方的敘述中，你認為哪一個瞬間最能讓你感到絕對的「愜意」與放鬆？',
                options: [
                    { label: '午後的一場大雨後，空氣充滿濕度，青草與土壤的氣味圍繞。', value: '1' },
                    { label: '早晨的陽光透過亞麻窗簾，灑落在剛洗淨的純白床單上，帶著微溫的觸感。', value: '2' },
                    { label: '夜晚點起一盞暖黃閱讀燈，窩在絲絨沙發裡翻閱舊書，手邊是一杯冒著熱氣的茶。', value: '3' },
                    { label: '獨自漫步在清晨還帶著薄霧的灰藍色海灘，迎面吹來帶有鹽分與冷空氣的微風。', value: '4' }
                ]
            },
            {
                id: 'A2',
                question: '當置身於人群中時，別人在第一時間感受到的你，最接近以下哪一種輪廓？',
                options: [
                    { label: '「打磨光滑的冷調大理石」', value: '1' },
                    { label: '「透著微光的亞麻織物」', value: '2' },
                    { label: '「帶有解構剪裁的深色層次」', value: '3' },
                    { label: '「折射著光線的流動稜鏡」', value: '4' }
                ]
            },
            {
                id: 'A3',
                question: '如果這瓶香水化作一句低語，那會是下列哪一句？',
                options: [
                    { label: '「世界再喧囂，我也能成為自己的避難所。」', value: '1' },
                    { label: '「你不必總是那麼堅強，允許自己被溫柔地接住吧。」', value: '2' },
                    { label: '「無論好壞，所有的經歷都是為了迎來下一次的破曉。」', value: '3' },
                    { label: '「就讓心裡保留一片下雨的空間，陰影裡也有它的美意。」', value: '4' }
                ]
            }
        ],
        'B': [
           {
                id: 'B1',
                question: '當你步入一個陌生的空間，你希望空氣中率先為你傳遞出什麼樣的隱形訊息？',
                options: [
                    { label: '我沒有攻擊性，你可以安心降落。', value: '1' },
                    { label: '我清楚自己的方向，且擁有不容侵犯的界線。', value: '2' },
                    { label: '我是一個謎團，等待懂得的人來翻閱。', value: '3' },
                    { label: '這世界很好玩，而我無所畏懼。', value: '4' }
                ]
            },
            {
                id: 'B2',
                question: '為了成為理想的自己，你最想褪去、或者正在克服的舊習慣是什麼？',
                options: [
                    { label: '「總是習慣先迎合他人、照顧別人的情緒，卻忘了為自己設立底線。」', value: '1' },
                    { label: '「容易在眾多選項中反覆猶豫、過度準備，渴望擁有更果決的行動力。」', value: '2' },
                    { label: '「害怕展露真實情緒與脆弱，總是習慣把心藏得很深、顯得過於冷靜。」', value: '3' },
                    { label: '「對『完美』的執念太深，不允許自己有任何失誤，身心總是處於緊繃狀態。」', value: '4' },
                    { label: '「腦海裡的聲音太吵雜，總是過度思慮，難以安靜地活在當下。」', value: '5' },
                    { label: '「腳步沉重，依然頻頻回頭看著某個過去的遺憾，難以真正走向未來。」', value: '6' },
                    { label: '「在日復一日的規律與妥協中感到麻木，遺失了對生活的熱情與好奇心。」', value: '7' }
                ]
            },
            {
                id: 'B3',
                question: '未來是一張尚未完全攤開的地圖。迎接即將來臨的下一個篇章，下列哪一句話最能帶給你力量？',
                options: [
                    { label: '「如果沒有路，就自己劈開一條；如果規則不適用，那就由我來改寫劇本。」', value: '1' },
                    { label: '「任憑時間在此緩步，沉澱出無可撼動的安定。」', value: '2' },
                    { label: '「丟掉所有多餘的行囊，越是純粹透明，越能裝下無限可能。」', value: '3' },
                    { label: '「無論日月更迭，依然選擇用溫柔去愛、去相信。」', value: '4' },
                    { label: '「不預設終點，也不強求答案，我願成為一陣隨遇而安的風。」', value: '5' },
                    { label: '「所有的裂痕，都是為了讓光能照進來，終將迎來破曉。」', value: '6' }
                ]
            }
        ], 
        'C': [
            {
                id: 'C1',
                question: '當他在人群中出現，或當你閉上眼想起他時，下面哪一種描述最符合他帶給你的樣貌呢？',
                options: [
                    { label: '早晨帶著涼意的霧氣，安靜、清冷，不輕易隨波逐流。', value: '1' },
                    { label: '午後穿透亞麻窗簾的光，溫和、柔軟，讓人忍不住想靠近。', value: '2' },
                    { label: '像燃燒著木柴的微火，沉穩、可靠，有一種深邃的安定感。', value: '3' },
                    { label: '像傍晚變幻莫測的天色，充滿生命力、靈動且難以捉摸。', value: '4' }
                ]
            },
            {
                id: 'C2',
                question: '在你眼中，他藏在表象之下，最真實（或只有你懂）的特質是什麼？',
                options: [
                    { label: '看似堅強獨立，其實內心極度柔軟，渴望被溫柔接住。', value: '1' },
                    { label: '看似隨和好相處，其實內心有著極高的標準與不妥協的底線。', value: '2' },
                    { label: '看似理智冷靜，但靈魂深處藏著對自由與冒險的浪漫渴望。', value: '3' },
                    { label: '看似充滿防備、像隻刺蝟，但其實對世界有著最細膩的共情。', value: '4' }
                ]
            },
            {
                id: 'C3',
                question: '這瓶香水交到他手上的那一刻，你最希望氣味替你傳達哪一句話？',
                options: [
                    { label: '「世界很吵，但願你能一直保有你靈魂裡的安靜與清澈。」', value: '1' },
                    { label: '「我知道你的刺是為了保護自己，但在我面前，你可以不用那麼堅強。」', value: '2' },
                    { label: '「這是不被任何人定義的你，也是我最欣賞的你。」', value: '3' },
                    { label: '「我們的故事還在繼續，這只是其中一個美好的分號。」', value: '4' }
                ]
            }
        ], 
        'D': [
            {
                id: 'D1',
                question: '如果這段記憶是一張照片，它罩著什麼樣的光線與濾鏡？',
                options: [
                    { label: '帶著灰藍調的清晨，空氣微冷，一切尚未甦醒。', value: '1' },
                    { label: '飽滿的暖橘色夕陽，有一種熱烈卻即將消逝的悵然。', value: '2' },
                    { label: '昏暗空間裡的一束微光，聚焦在某個安靜的物件上。', value: '3' },
                    { label: '低飽和的灰綠色調，萬物被雨水洗刷過，帶著濕潤的重量。', value: '4' },
                    { label: '穿透樹冠的斑駁光影，罩著一層柔軟的藕粉色濾鏡，如夢似幻。', value: '5' },
                    { label: '稍微過曝的純白光線，乾淨得毫無雜質，帶著一絲眩目。', value: '6' },
                    { label: '泛黃的復古色調，邊緣微糊，卻保留了當時的溫度。', value: '7' },
                    { label: '褪去色彩的深藍色午夜，只有冷調的月光或霓虹勾勒出輪廓。', value: '8' }
                ]
            },
            {
                id: 'D2',
                question: '當畫面逐漸淡出，這段記憶留在你腦海中的背景音是什麼？',
                options: [
                    { label: '筆尖劃過紙張的沙沙聲，或書頁翻動的微小聲響。', value: '1' },
                    { label: '窗外樹葉被風吹動的摩挲聲，帶著某種遼闊與釋然。', value: '2' },
                    { label: '某個人低聲的呢喃，或是兩人之間連心跳都能聽見的寂靜。', value: '3' },
                    { label: '雨滴規律打在窗玻璃上的悶響，將世界與你安穩地隔絕開來。', value: '4' },
                    { label: '萬物被大雪覆蓋時那種絕對的靜謐，連一根針掉落都能聽見。', value: '5' },
                    { label: '柴火燃燒到最後的細微劈啪聲，或是燭芯即將熄滅的微光。', value: '6' },
                    { label: '身體翻動時，棉麻或絲絨布料互相摩擦的輕柔簌簌聲。', value: '7' },
                    { label: '隔著厚重玻璃，城市遠方極其微弱的車流低頻嗡鳴。', value: '8' }
                ]
            },
            {
                id: 'D3',
                question: '若以文學的視角來看，這個瞬間屬於故事的哪一個篇章？',
                options: [
                    { label: '沒有前因後果，直接從最深刻的那一秒切入。', value: '1' },
                    { label: '那是所有喧囂落下後，留下的最後一句未完的對白。', value: '2' },
                    { label: '其實什麼都沒發生，但心裡知道，一切都不一樣了。', value: '3' }
                ]
            }
        ]
    }
};

let currentQuizSession = {
    customerPhone: '',
    answers: {},       
    calculatedResult: null 
};

/* =======================================================
   2. 基礎導覽邏輯 (Navigation)
   ======================================================= */
function switchTab(tabId) {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => section.style.display = 'none');
    
    // 切換導覽列按鈕顏色
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
        tier: '微風草本 Seedling', points: 0, annualSpend: 0, orders: [], reservations: []
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
   5. 分頁二：專屬調香工作台 (多選排他問卷引擎)
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

    // 分流邏輯：如果是 Q1，載入對應支線
    if (currentQ.id === 'Q1') {
        const branchChoice = selectedOptionValues[0];
        const branchQuestions = scentQuizData.branches[branchChoice];
        if (branchQuestions && branchQuestions.length > 0) {
            quizQueue = quizQueue.concat(branchQuestions);
        }
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < quizQueue.length) {
        renderQuestion();
    } else {
        finishQuiz(); 
    }
}

function finishQuiz() {
    document.getElementById('quizContainer').style.display = 'none';
    const resultBox = document.getElementById('quizResult');
    resultBox.style.display = 'block';

    resultBox.innerHTML = `
        <h4 style="color: var(--lavender-primary); margin-top:0;">✨ 系統分析完成</h4>
        <p style="color: var(--text-dark); margin-bottom: 5px;">根據顧客的潛意識偏好，系統推薦以下基調：</p>
        <select class="form-group" style="margin-top: 10px; width: 100%; padding: 0.8rem; border-color: var(--lavender-primary); font-weight: bold;">
            <option>冷調木質與茶 (The Intellectual Woods) - 契合度 98%</option>
            <option>海洋礦物與晨露 (The Mineral Horizon) - 契合度 85%</option>
            <option>純淨皂香與柔白麝香 (The Second Skin) - 契合度 72%</option>
        </select>
        <p style="font-size: 0.85rem; color: #888; margin-top: 15px;">
            (後台偵測紀錄：Q1選了 ${currentQuizSession.answers['Q1']} 支線，Q6排除了 ${currentQuizSession.answers['Q6']})
        </p>
    `;

    document.getElementById('postQuizSteps').style.display = 'block';
}
