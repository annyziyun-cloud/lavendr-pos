/* =======================================================
   1. 全域資料庫與狀態管理 (Global State)
   ======================================================= */
// 模擬會員資料庫 (所有分頁共用此資料)
let memberDatabase = {
    '0900000000': {
        name: '醬寶寶',
        phone: '0900000000',
        gender: '男',
        birthday: '1998-05-20',
        idNumber: 'A123456789',
        tier: '薰衣草花田 Lavender',
        points: 2500,
        annualSpend: 15800,
        orders: [
            { id: 'ORD-001', item: '客製化香水 (木質調)', status: '待取貨' }
        ],
        reservations: [
            { date: '2026-10-10 14:00', type: '一對一調香諮詢' }
        ]
    },
    '0911111111': {
        name: 'Anny',
        phone: '0911111111',
        gender: '女',
        birthday: '2003-11-26',
        idNumber: 'F223344556',
        tier: '晨露花香 Dewdrop',
        points: 850,
        annualSpend: 3200,
        orders: [
            { id: 'ORD-002', item: '薰衣草保濕潔手露', status: '待取貨' },
            { id: 'ORD-003', item: '晨露花香香氛蠟燭', status: '已領取' }
        ],
        reservations: []
    }
};

// 記住店員「現在正在服務哪一位客人」，切換分頁時才能連動
let currentViewedMemberPhone = '';

/* =======================================================
   2. 基礎導覽邏輯 (Navigation)
   ======================================================= */
// 分頁切換功能
function switchTab(tabId) {
    // 隱藏所有分頁
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // 顯示被點擊的分頁
    const activeSection = document.getElementById(tabId);
    if (activeSection) {
        activeSection.style.display = 'block';
    }

    // 當切換回分頁一時，如果已經有正在服務的客人，自動更新畫面確保資料最新
    if (tabId === 'tab-member' && currentViewedMemberPhone !== '') {
        const member = memberDatabase[currentViewedMemberPhone];
        if(member) {
            renderProfileCard(member);
            document.getElementById('memberResult').style.display = 'block';
        }
    }
}

/* =======================================================
   3. 分頁一：會員接待與註冊邏輯
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
        currentViewedMemberPhone = phoneInput; // 綁定當前服務客人的電話
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

    if(memberDatabase[phone]) {
        alert('此電話已註冊過會員！');
        return;
    }

    // 建立乾淨的新會員預設格式
    memberDatabase[phone] = {
        name: name,
        phone: phone,
        gender: gender,
        birthday: birthday,
        idNumber: idNum,
        tier: '微風草本 Seedling',
        points: 0,
        annualSpend: 0,
        orders: [],
        reservations: []
    };

    alert('新客檔案建立成功！');
    document.getElementById('phoneSearch').value = phone;
    searchMember(); 
}

/* =======================================================
   4. 分頁一：會員資料卡片渲染與操作
   ======================================================= */
function renderProfileCard(member) {
    const resultBox = document.getElementById('memberResult');
    
    // 動態判斷近期預約
    let reservationHtml = '';
    if (member.reservations && member.reservations.length > 0) {
        const res = member.reservations[0]; 
        reservationHtml = `<div class="reservation-box active-res">📅 近期預約：${res.date}｜${res.type}</div>`;
    } else {
        reservationHtml = `<div class="reservation-box empty-res">📅 近期無預約</div>`;
    }

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
                <div class="info-item">
                    <span class="info-label">聯絡電話</span>
                    <span class="info-value">${member.phone}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">目前點數</span>
                    <span class="info-value" style="color: var(--accent-gold);">${member.points} pts</span>
                </div>
                <div class="info-item">
                    <span class="info-label">年度消費累積</span>
                    <span class="info-value">NT$ ${member.annualSpend.toLocaleString()}</span>
                </div>
            </div>
            
            <div class="profile-footer">
                ${reservationHtml}
            </div>
        </div>
    `;
}

/* =======================================================
   5. 待取貨單與帳戶設定功能
   ======================================================= */
function renderOrders() {
    const member = memberDatabase[currentViewedMemberPhone];
    const resultBox = document.getElementById('memberResult');

    let ordersHtml = '';
    if (!member.orders || member.orders.length === 0) {
        ordersHtml = `<p style="color:var(--text-muted); text-align:center; padding: 2rem 0;">目前無任何購物紀錄或待取貨單。</p>`;
    } else {
        ordersHtml = `<ul class="order-list">`;
        member.orders.forEach((order, index) => {
            if (order.status === '待取貨') {
                ordersHtml += `
                    <li class="order-item">
                        <div class="order-info">
                            <span>📦 ${order.item}</span>
                            <span class="badge badge-pending">${order.status}</span>
                        </div>
                        <button class="btn-small" onclick="updateOrderStatus(${index})">設為已領取</button>
                    </li>`;
            } else {
                ordersHtml += `
                    <li class="order-item completed">
                        <div class="order-info">
                            <span>✅ ${order.item}</span>
                            <span class="badge badge-completed">${order.status}</span>
                        </div>
                    </li>`;
            }
        });
        ordersHtml += `</ul>`;
    }

    resultBox.innerHTML = `
        <div style="width: 100%;">
            <div class="profile-header" style="border-bottom:none;">
                <h3 style="margin:0;">🛍️ 訂單與待取貨管理</h3>
            </div>
            <div class="form-body" style="padding: 0;">
                ${ordersHtml}
                <div class="form-actions">
                    <button class="btn-primary" onclick="searchMember()">返回會員資料</button>
                </div>
            </div>
        </div>
    `;
}

function updateOrderStatus(orderIndex) {
    const member = memberDatabase[currentViewedMemberPhone];
    member.orders[orderIndex].status = '已領取';
    renderOrders(); 
}

function renderAccountSettings() {
    const member = memberDatabase[currentViewedMemberPhone];
    const resultBox = document.getElementById('memberResult');
    
    resultBox.innerHTML = `
        <div style="width: 100%;">
            <div class="profile-header" style="border-bottom:none;">
                <h3 style="margin:0;">⚙️ 調整會員資料</h3>
            </div>
            <div class="form-body" style="padding: 0;">
                <div class="form-group">
                    <label>聯絡電話 (可修改)</label>
                    <input type="tel" id="editPhone" value="${member.phone}">
                </div>
                <div style="display:flex; gap:15px;">
                    <div class="form-group" style="flex:1;">
                        <label>生日 (不可修改)</label>
                        <input type="text" value="${member.birthday}" readonly>
                    </div>
                    <div class="form-group" style="flex:1;">
                        <label>身分證/護照 (不可修改)</label>
                        <input type="text" value="${member.idNumber}" readonly>
                    </div>
                </div>
                <div class="form-actions" style="justify-content: space-between;">
                    <button class="btn-danger" onclick="deleteAccount()">註銷帳號</button>
                    <div>
                        <button class="btn-text" onclick="searchMember()">返回</button>
                        <button class="btn-primary" onclick="saveAccountSettings()">儲存變更</button>
                    </div>
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
    alert('資料更新成功！');
    searchMember();
}

function deleteAccount() {
    const confirmDelete = confirm('確定要註銷此帳號嗎？此動作無法復原！');
    if (confirmDelete) {
        delete memberDatabase[currentViewedMemberPhone];
        alert('帳號已註銷。');
        document.getElementById('phoneSearch').value = '';
        currentViewedMemberPhone = '';
        hideAllMemberSections();
        document.getElementById('tierInfo').style.display = 'block';
    }
}

/* =======================================================
   6. 分頁二：專屬調香 - 預約矩陣系統
   ======================================================= */
// 定義 6 個預約時段
const TIME_SLOTS = ["10:00-11:00", "11:30-12:30", "14:00-15:00", "15:30-16:30", "17:00-18:00", "18:30-19:30"];
// 每日模擬日期 (實務上會動態抓取今天開始的一週)
const DEMO_DATES = ['2026-10-10', '2026-10-11', '2026-10-12'];
let currentSelectedDate = '2026-10-10';

// 預約排程資料庫 (關聯到客人的電話)
let scheduleDatabase = {
    '2026-10-10': {
        '14:00-15:00': ['0900000000'] // 醬寶寶已預約
    }
};

// 初始化分頁二的畫面 (可以在網頁載入或點擊分頁時呼叫)
function initBookingDashboard() {
    renderDateSelector();
    renderDailySchedule(currentSelectedDate);
}
// 為了確保一載入就準備好，將其綁在 window.onload
window.addEventListener('DOMContentLoaded', initBookingDashboard);

// 渲染頂部日期按鈕
function renderDateSelector() {
    const container = document.getElementById('dateSelector');
    container.innerHTML = '';
    DEMO_DATES.forEach(date => {
        const btn = document.createElement('button');
        btn.className = `date-btn ${date === currentSelectedDate ? 'active' : ''}`;
        btn.textContent = date;
        btn.onclick = () => {
            currentSelectedDate = date;
            renderDateSelector(); // 更新 active 狀態
            renderDailySchedule(date);
        };
        container.appendChild(btn);
    });
}

// 渲染選定日期的 6 個時段方塊
function renderDailySchedule(date) {
    const container = document.getElementById('dailySchedule');
    container.innerHTML = '';
    const dayData = scheduleDatabase[date] || {};

    TIME_SLOTS.forEach(slot => {
        const bookedPhones = dayData[slot] || [];
        const currentCount = bookedPhones.length;
        const maxCapacity = 2;

        let slotHtml = `
            <div class="time-slot-card">
                <div class="slot-header">
                    <span class="slot-time">${slot}</span>
                    <span class="slot-capacity">${currentCount} / ${maxCapacity} 人</span>
                </div>
                <div class="booked-list">
        `;

        // 渲染已預約的客人名單
        bookedPhones.forEach(phone => {
            const member = memberDatabase[phone];
            if (member) {
                // 點擊已預約客人，開啟該客人的「調香工作台」
                slotHtml += `
                    <div class="booked-customer" onclick="openWorkbench('${phone}', '${date}', '${slot}')">
                        <span>👤 ${member.name}</span>
                        <span style="color:#888; font-size:0.85rem;">${phone}</span>
                    </div>
                `;
            }
        });

        // 若人數未滿 2 人，顯示新增預約按鈕
        if (currentCount < maxCapacity) {
            slotHtml += `
                <button class="empty-slot-btn" onclick="addBooking('${date}', '${slot}')">
                    + 新增該時段預約
                </button>
            `;
        }

        slotHtml += `</div></div>`;
        container.innerHTML += slotHtml;
    });
}

// 新增預約邏輯
function addBooking(date, slot) {
    const phoneInput = prompt(`請輸入欲預約 【${date} ${slot}】 的顧客電話：\n(如需攜伴製作兩瓶，請使用同行者的電話分開預約此時段)`);
    
    if (!phoneInput) return; // 按取消

    // 檢查是否為會員
    if (!memberDatabase[phoneInput]) {
        alert('查無此會員！請先至「1. 會員接待」建立新客檔案。');
        // 自動切換到分頁一並帶入號碼
        switchTab('tab-member');
        document.getElementById('phoneSearch').value = phoneInput;
        searchMember();
        return;
    }

    // 確保排程庫結構存在
    if (!scheduleDatabase[date]) scheduleDatabase[date] = {};
    if (!scheduleDatabase[date][slot]) scheduleDatabase[date][slot] = [];

    // 檢查客人是否已經在此時段
    if (scheduleDatabase[date][slot].includes(phoneInput)) {
        alert('此顧客已預約該時段，一個名字僅能製作一瓶。若需攜伴製作，請以同行者電話預約。');
        return;
    }

    // 將客人加入預約矩陣
    scheduleDatabase[date][slot].push(phoneInput);
    
    // 同步將預約資訊寫入該會員的個人資料庫 (連動分頁一的近期預約顯示)
    memberDatabase[phoneInput].reservations.unshift({
        date: `${date} ${slot}`,
        type: '一對一調香訂製'
    });

    alert(`預約成功！已將 ${memberDatabase[phoneInput].name} 排入 ${slot} 時段。`);
    renderDailySchedule(date); // 重新渲染畫面
}

/* =======================================================
   7. 分頁二：專屬調香工作台邏輯
   ======================================================= */
function openWorkbench(phone, date, slot) {
    const member = memberDatabase[phone];
    
    // 隱藏排程表，顯示工作台
    document.getElementById('bookingDashboard').style.display = 'none';
    document.getElementById('workbenchView').style.display = 'block';

    // 帶入該客人的資訊
    document.getElementById('wbCustomerName').textContent = `調香處方箋 - 👤 ${member.name}`;
    document.getElementById('wbCustomerPhone').textContent = `時段：${date} ${slot} ｜ 電話：${member.phone}`;
}

function closeWorkbench() {
    // 隱藏工作台，顯示回排程表
    document.getElementById('workbenchView').style.display = 'none';
    document.getElementById('bookingDashboard').style.display = 'block';
}
