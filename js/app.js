// 分頁切換功能
function switchTab(tabId) {
    // 將所有分頁隱藏
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // 顯示被點擊的分頁
    const activeSection = document.getElementById(tabId);
    if (activeSection) {
        activeSection.style.display = 'block';
    }
}

// --- 模擬會員資料庫 ---
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
        coupons: ['生日 8 折券', '免費一對一調香券 x 1']
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
        coupons: ['滿2000折200券']
    }
};

let currentViewedMemberPhone = '';

// --- 介面切換邏輯 ---
function hideAllMemberSections() {
    document.getElementById('memberResult').style.display = 'none';
    document.getElementById('tierInfo').style.display = 'none';
    document.getElementById('registrationForm').style.display = 'none';
}

// 查詢會員
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

// 顯示註冊表單
function showRegistrationForm(prefillPhone = '') {
    hideAllMemberSections();
    document.getElementById('regPhone').value = prefillPhone;
    document.getElementById('registrationForm').style.display = 'block';
}

function cancelRegistration() {
    hideAllMemberSections();
    document.getElementById('tierInfo').style.display = 'block';
}

// 提交註冊表單
function submitRegistration(event) {
    event.preventDefault(); // 防止網頁重整
    
    const phone = document.getElementById('regPhone').value;
    const name = document.getElementById('regName').value;
    const gender = document.getElementById('regGender').value;
    const birthday = document.getElementById('regBirthday').value;
    const idNum = document.getElementById('regId').value;

    if(memberDatabase[phone]) {
        alert('此電話已註冊過會員！');
        return;
    }

    // 建立新檔案
    memberDatabase[phone] = {
        name: name,
        phone: phone,
        gender: gender,
        birthday: birthday,
        idNumber: idNum,
        tier: '微風草本 Seedling',
        points: 0,
        annualSpend: 0,
        coupons: ['新客入會禮：手工植萃香皂兌換券']
    };

    alert('新客檔案建立成功！');
    document.getElementById('phoneSearch').value = phone;
    searchMember(); // 直接顯示剛建立的會員資料
}

// --- 渲染會員資料卡 ---
function renderProfileCard(member) {
    const resultBox = document.getElementById('memberResult');
    resultBox.innerHTML = `
        <div class="profile-header">
            <div>
                <h3 style="margin:0; font-size: 1.8rem;">${member.name}</h3>
                <p style="margin: 5px 0 0; color: var(--lavender-primary);">${member.tier}</p>
            </div>
            <div class="profile-actions">
                <button class="btn-primary" onclick="showPromotions()">🎁 優惠好禮</button>
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
    `;
}

// --- 按鈕功能：優惠好禮 ---
function showPromotions() {
    const member = memberDatabase[currentViewedMemberPhone];
    if (member.coupons.length > 0) {
        let list = member.coupons.map(c => `✦ ${c}`).join('\n');
        alert(`【可用優惠券】\n${list}\n\n(點擊確認後可由 POS 結帳台套用)`);
    } else {
        alert('目前尚無可兌換的優惠券。');
    }
}

// --- 按鈕功能：帳戶設定 ---
function renderAccountSettings() {
    const member = memberDatabase[currentViewedMemberPhone];
    const resultBox = document.getElementById('memberResult');
    
    // 將方塊內容切換為表單模式
    resultBox.innerHTML = `
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
    `;
}

function saveAccountSettings() {
    const newPhone = document.getElementById('editPhone').value;
    const oldPhone = currentViewedMemberPhone;
    
    if (newPhone !== oldPhone) {
        // 更新資料庫的 key
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
