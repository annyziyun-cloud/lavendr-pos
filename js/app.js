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

// 模擬的會員資料庫
const memberDatabase = {
    '0900000000': {
        name: '醬寶寶',
        tier: '薰衣草花田 Lavender (VIP)',
        points: 2500,
        icon: '💜',
        note: '喜歡木質調，上次購買了客製化香水。'
    },
    '0911111111': {
        name: 'Anny',
        tier: '晨露花香 Dewdrop',
        points: 850,
        icon: '💧',
        note: '偏好微甜白花香，今日預約一對一調香。'
    }
};

// 查詢會員邏輯
function searchMember() {
    const phoneInput = document.getElementById('phoneSearch').value;
    const resultBox = document.getElementById('memberResult');
    const tierInfo = document.getElementById('tierInfo');

    if (phoneInput === '') {
        alert('請輸入顧客電話！');
        return;
    }

    // 檢查是否在資料庫中
    const member = memberDatabase[phoneInput];

    if (member) {
        // 找到會員，渲染專屬結果畫面
        resultBox.innerHTML = `
            <div>
                <h3 style="margin:0 0 10px 0;">${member.icon} 歡迎回來，${member.name}</h3>
                <p style="margin:5px 0; color:#ccc;">會員等級：${member.tier}</p>
                <p style="margin:5px 0; color:#ccc;">目前點數：${member.points} 點</p>
                <p style="margin:15px 0 0 0; font-size:0.9rem; color:var(--lavender-primary);">📝 顧客備註：${member.note}</p>
            </div>
            <button class="btn-primary" onclick="alert('已為 ${member.name} 安排入座諮詢！')">接待入座</button>
        `;
        resultBox.style.display = 'flex';
        tierInfo.style.display = 'none'; // 隱藏原本的等級說明
    } else {
        // 找不到會員，顯示新客登記
        resultBox.innerHTML = `
            <div>
                <h3 style="margin:0 0 10px 0;">🌱 查無此會員</h3>
                <p style="margin:5px 0; color:#ccc;">電話 ${phoneInput} 尚未註冊。</p>
            </div>
            <button class="btn-primary" style="background:#565554; border:1px solid #fff;">+ 建立新客檔案</button>
        `;
        resultBox.style.display = 'flex';
        tierInfo.style.display = 'block'; // 保留等級說明讓店員參考
    }
}
