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
    const kilowattHoursInput = document.getElementById('kilowatt-hours');
    const isSummerSelect = document.getElementById('is-summer');
    const totalBillElement = document.getElementById('total-bill');
    const noteElement = document.getElementById('calculation-note');

    const kilowattHours = parseFloat(kilowattHoursInput.value);
    const isSummer = isSummerSelect.value === 'true';

    // 輸入驗證
    if (isNaN(kilowattHours) || kilowattHours < 0) {
        totalBillElement.textContent = '請輸入有效的用電度數！';
        noteElement.textContent = '';
        return;
    }

    const totalBill = calculateElectricityBill(kilowattHours, isSummer);
    
    totalBillElement.textContent = `${totalBill.toFixed(2)} 元`;
    
    // 增加計算備註
    const tierName = isSummer ? "夏季" : "非夏季";
    const tiers = isSummer ? summerTiers : nonSummerTiers;
    let calculationDetails = `您輸入了 ${kilowattHours.toFixed(2)} 度，採用 ${tierName} 電價計算：\n`;
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
}