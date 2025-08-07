// 台電官方文件（113年4月1日實施）的電費級距資料
const summerTiers = [
    { limit: 120, rate: 1.68 },
    { limit: 330, rate: 2.45 },
    { limit: 500, rate: 3.70 },
    { limit: 700, rate: 5.04 },
    { limit: 1000, rate: 6.24 },
    { limit: Infinity, rate: 8.46 },
];

const nonSummerTiers = [
    { limit: 120, rate: 1.68 },
    { limit: 330, rate: 2.16 },
    { limit: 500, rate: 3.03 },
    { limit: 700, rate: 4.14 },
    { limit: 1000, rate: 4.85 },
    { limit: Infinity, rate: 6.63 },
];

/**
 * 根據用電度數和月份計算電費（非時間電價）。
 * @param {number} kilowattHours - 用電度數。
 * @param {boolean} isSummer - 是否為夏季。
 * @returns {number} 總電費。
 */
function calculateElectricityBill(kilowattHours, isSummer) {
    let totalBill = 0;
    let remainingKilowattHours = kilowattHours;
    let tiers = isSummer ? summerTiers : nonSummerTiers;
    let previousLimit = 0;

    for (const tier of tiers) {
        if (remainingKilowattHours <= 0) {
            break;
        }

        const tierConsumption = Math.min(remainingKilowattHours, tier.limit - previousLimit);
        
        totalBill += tierConsumption * tier.rate;
        
        remainingKilowattHours -= tierConsumption;
        previousLimit = tier.limit;
    }
    
    return totalBill;
}

/**
 * 處理網頁上的計算按鈕點擊事件。
 */
function calculate() {
    const currentReadingInput = document.getElementById('current-reading');
    const previousReadingInput = document.getElementById('previous-reading');
    const isSummerSelect = document.getElementById('is-summer');
    const totalBillElement = document.getElementById('total-bill');
    const noteElement = document.getElementById('calculation-note');

    const currentReading = parseFloat(currentReadingInput.value);
    const previousReading = parseFloat(previousReadingInput.value);
    const isSummer = isSummerSelect.value === 'true';

    // 輸入驗證
    if (isNaN(currentReading) || isNaN(previousReading) || currentReading < 0 || previousReading < 0) {
        totalBillElement.textContent = '請輸入有效的電表度數！';
        noteElement.textContent = '';
        return;
    }

    if (currentReading <= previousReading) {
        totalBillElement.textContent = '當前度數必須大於前一期度數！';
        noteElement.textContent = '';
        return;
    }

    const kilowattHours = currentReading - previousReading;

    const totalBill = calculateElectricityBill(kilowattHours, isSummer);
    
    totalBillElement.textContent = `${totalBill.toFixed(2)} 元`;
    
    // 增加計算備註
    const tierName = isSummer ? "夏季" : "非夏季";
    const tiers = isSummer ? summerTiers : nonSummerTiers;
    let calculationDetails = `電表讀數：${previousReading.toFixed(1)} → ${currentReading.toFixed(1)} 度\n`;
    calculationDetails += `本期用電量：${kilowattHours.toFixed(2)} 度，採用 ${tierName} 電價計算：\n\n`;
    let remaining = kilowattHours;
    let prevLimit = 0;

    for (const tier of tiers) {
        if (remaining <= 0) {
            break;
        }
        const consumption = Math.min(remaining, tier.limit - prevLimit);
        const start = prevLimit + 1;
        const end = tier.limit;
        const rangeText = end === Infinity ? `${start}度以上` : `${start}~${end}度`;

        calculationDetails += `  - ${rangeText}：${consumption.toFixed(2)} 度 x ${tier.rate.toFixed(2)} 元/度 = ${(consumption * tier.rate).toFixed(2)} 元\n`;
        
        remaining -= consumption;
        prevLimit = tier.limit;
    }
    noteElement.textContent = calculationDetails;
    
    // 添加結果顯示動畫
    const resultBox = document.getElementById('result-box');
    const calculationDetailsElement = document.querySelector('.calculation-details');
    
    resultBox.style.opacity = '0';
    resultBox.style.transform = 'translateY(20px)';
    calculationDetailsElement.style.opacity = '0';
    calculationDetailsElement.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        resultBox.style.transition = 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
        resultBox.style.opacity = '1';
        resultBox.style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
        calculationDetailsElement.style.transition = 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
        calculationDetailsElement.style.opacity = '1';
        calculationDetailsElement.style.transform = 'translateY(0)';
    }, 300);
}

// 測試計算功能
function testCalculation() {
    console.log('測試電費計算功能...');
    
    // 測試案例 1: 非夏季 450 度
    const test1 = calculateElectricityBill(450, false);
    console.log('測試 1 - 非夏季 450 度:', test1.toFixed(2), '元');
    
    // 測試案例 2: 夏季 450 度  
    const test2 = calculateElectricityBill(450, true);
    console.log('測試 2 - 夏季 450 度:', test2.toFixed(2), '元');
    
    // 測試案例 3: 非夏季 100 度
    const test3 = calculateElectricityBill(100, false);
    console.log('測試 3 - 非夏季 100 度:', test3.toFixed(2), '元');
    
    console.log('計算功能測試完成');
}

// 添加輸入動畫效果
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"], select');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.style.transform = 'scale(1.02)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
        
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
    
    // 為按鈕添加點擊效果
    const button = document.querySelector('button');
    button.addEventListener('click', function() {
        this.style.transform = 'translateY(-1px) scale(0.98)';
        setTimeout(() => {
            this.style.transform = 'translateY(-3px) scale(1)';
        }, 100);
    });
    
    // 執行測試
    testCalculation();
});