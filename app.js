let incomes = JSON.parse(localStorage.getItem('user_incomes')) || [];
let expenses = JSON.parse(localStorage.getItem('user_expenses')) || [];

document.addEventListener('DOMContentLoaded', () => {
    renderAll();
});

function saveData() {
    localStorage.setItem('user_incomes', JSON.stringify(incomes));
    localStorage.setItem('user_expenses', JSON.stringify(expenses));
    renderAll();
}

function clearAllData() {
    if (confirm("هل أنت تأكد من رغبتك في حذف جميع البيانات وإعادة الضبط؟")) {
        incomes = [];
        expenses = [];
        saveData();
    }
}

// التبديل بين الأقسام
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('active', 'bg-indigo-600', 'text-white');
        el.classList.add('text-slate-300');
    });

    document.getElementById(tabId).classList.remove('hidden');
    const activeBtn = document.getElementById('btn' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
    activeBtn.classList.add('active');
}

// إضافة إيراد
function addIncome() {
    const source = document.getElementById('incomeSource').value || 'دخل إضافي';
    const amount = parseFloat(document.getElementById('incomeAmount').value);

    if (isNaN(amount) || amount <= 0) return;

    incomes.push({ id: Date.now(), source, amount });
    document.getElementById('incomeSource').value = '';
    document.getElementById('incomeAmount').value = '';
    saveData();
}

function removeIncome(id) {
    incomes = incomes.filter(i => i.id !== id);
    saveData();
}

// إضافة مصروف
function addExpense() {
    const type = document.getElementById('expenseType').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);

    if (isNaN(amount) || amount <= 0) return;

    expenses.push({ id: Date.now(), type, amount });
    document.getElementById('expenseAmount').value = '';
    saveData();
}

function removeExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    saveData();
}

// إعادة رسم القوائم والحسابات
function renderAll() {
    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const remaining = totalIncome - totalExpenses;

    document.getElementById('totalIncomeHeader').innerText = totalIncome.toFixed(2);
    document.getElementById('totalExpensesHeader').innerText = totalExpenses.toFixed(2);
    document.getElementById('remainingHeader').innerText = remaining.toFixed(2);

    // قائمة الدخل
    const incomeList = document.getElementById('incomeList');
    if (incomes.length === 0) {
        incomeList.innerHTML = '<p class="text-slate-500 text-xs py-2">لا توجد إيرادات مسجلة.</p>';
    } else {
        incomeList.innerHTML = incomes.map(i => `
            <div class="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-700/60 text-white text-sm">
                <span>${i.source}</span>
                <div class="flex items-center gap-3">
                    <span class="font-bold text-emerald-400">${i.amount.toFixed(2)}</span>
                    <button onclick="removeIncome(${i.id})" class="text-red-400 hover:text-red-300"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
        `).join('');
    }

    // قائمة المصاريف
    const expenseList = document.getElementById('expenseList');
    if (expenses.length === 0) {
        expenseList.innerHTML = '<p class="text-slate-500 text-xs py-2">لا توجد مصروفات مسجلة.</p>';
    } else {
        expenseList.innerHTML = expenses.map(e => `
            <div class="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-700/60 text-white text-sm">
                <span>${e.type}</span>
                <div class="flex items-center gap-3">
                    <span class="font-bold text-rose-400">${e.amount.toFixed(2)}</span>
                    <button onclick="removeExpense(${e.id})" class="text-red-400 hover:text-red-300"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
        `).join('');
    }
}

// استدعاء Gemini AI
async function askGemini() {
    const aiResponseDiv = document.getElementById('aiResponse');
    const aiBtn = document.getElementById('aiBtn');

    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const remaining = totalIncome - totalExpenses;

    if (totalIncome <= 0) {
        alert("يرجى إضافة إيراد أو راتب شهري أولاً!");
        return;
    }

    const incomeDetails = incomes.map(i => `${i.source}: ${i.amount}`).join(', ');
    const expenseDetails = expenses.map(e => `${e.type}: ${e.amount}`).join(', ');

    const prompt = `
بصفتك مستشاراً مالياً وخبيراً في التخطيط الاستثماري، حلل الوضع المالي التالي واصنع خطة عملية مزمنة ومحددة بخطوات متسلسلة:
- إجمالي الدخل الشهري: ${totalIncome} (التفاصيل: [${incomeDetails}])
- إجمالي المصاريف الثابتة: ${totalExpenses} (التفاصيل: [${expenseDetails}])
- الصافي المتبقي: ${remaining}

المطلوب:
صغ خطة مالية إستراتيجية واضحة ومقسّمة حسب الفترات الزمنية التالية:
1. **المرحلة العاجلة (الشهر 1 - الشهر 3):** خطوات إجرائية فورية (سواء لسد العجز أو لبناء صندوق الطوارئ).
2. **المرحلة المتوسطة (الشهر 3 - الشهر 12):** خطوات الاستقرار المالي وبدء الادخار المستهدف.
3. **المرحلة طويلة الأجل (من السنتين إلى 5 سنوات):** استراتيجية نمو الثروة والاستثمار التراكمي.

قم بصياغة الإجابة باستخدام تنسيق Markdown ممتاز مع استخدام العناوين والنقاط المباشرة.
`;

    aiBtn.disabled = true;
    aiBtn.innerText = "جاري التحليل...";
    aiResponseDiv.innerHTML = '<div class="text-center py-4"><i class="fa-solid fa-spinner fa-spin text-purple-600 text-2xl"></i><p class="text-xs text-slate-500 mt-2">جاري بناء الخطة المالية المزمنة...</p></div>';

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();

        if (response.ok && data.candidates && data.candidates[0].content.parts[0].text) {
            aiResponseDiv.innerHTML = marked.parse(data.candidates[0].content.parts[0].text);
        } else {
            aiResponseDiv.innerHTML = `<span class="text-red-500 font-bold">${data.error || 'فشل توليد التقرير'}</span>`;
        }
    } catch (err) {
        aiResponseDiv.innerHTML = '<span class="text-red-500 font-bold">حدث خطأ في الاتصال بالسيرفر.</span>';
    } finally {
        aiBtn.disabled = false;
        aiBtn.innerText = "توليد خطة مالية مزمنة";
    }
}

// دالة تصدير PDF
function exportToPDF() {
    const element = document.getElementById('aiResponseContainer');
    const opt = {
        margin:       0.5,
        filename:     'الخطة_المالية_الشخصية.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

// دالة تصدير Excel (CSV)
function exportToExcel() {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "النوع,البيان / المصدر,المبلغ\n";

    incomes.forEach(i => {
        csvContent += `إيراد,${i.source},${i.amount}\n`;
    });
    expenses.forEach(e => {
        csvContent += `مصروف,${e.type},${e.amount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "الميزانية_الشخصية.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// دالة تصدير Word
function exportToWord() {
    const content = document.getElementById('aiResponseContainer').innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
        "xmlns:w='urn:schemas-microsoft-com:office:word' "+
        "xmlns='http://www.w3.org/TR/REC-html40'>"+
        "<head><meta charset='utf-8'><title>الخطة المالية</title></head><body dir='rtl'>";
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'الخطة_المالية_الشخصية.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
}
