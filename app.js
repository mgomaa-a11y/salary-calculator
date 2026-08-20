let expenses = [];

function addExpense() {
    const typeSelect = document.getElementById('expenseType');
    const amountInput = document.getElementById('expenseAmount');
    
    const type = typeSelect.value;
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) return;

    const newExpense = { id: Date.now(), type, amount };
    expenses.push(newExpense);
    amountInput.value = '';
    renderExpenses();
}

function removeExpense(id) {
    expenses = expenses.filter(item => item.id !== id);
    renderExpenses();
}

function renderExpenses() {
    const listElem = document.getElementById('expenseList');
    if (expenses.length === 0) {
        listElem.innerHTML = '<p class="text-sm text-slate-400 text-center py-4" id="emptyMsg">لم تقم بإضافة أي مصاريف حتى الآن</p>';
        return;
    }

    listElem.innerHTML = expenses.map(item => `
        <div class="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm animate__animated animate__fadeIn">
            <span class="text-sm font-semibold text-slate-700">${item.type}</span>
            <div class="flex items-center gap-3">
                <span class="font-bold text-slate-800">${item.amount.toFixed(2)}</span>
                <button onclick="removeExpense(${item.id})" class="text-red-400 hover:text-red-600 transition"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        </div>
    `).join('');
}

function calculateFinance() {
    const income = parseFloat(document.getElementById('income').value);
    const resultsDiv = document.getElementById('results');

    if (isNaN(income) || income <= 0) {
        alert("يرجى إدخال الراتب بشكل صحيح");
        return;
    }

    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const remaining = income - totalExpenses;

    document.getElementById('totalExpensesText').innerText = totalExpenses.toFixed(2);
    document.getElementById('remainingAmount').innerText = Math.abs(remaining).toFixed(2);
    resultsDiv.classList.remove('hidden');

    const statusBox = document.getElementById('statusBox');
    const savingStatus = document.getElementById('savingStatus');
    const recDiv = document.getElementById('recommendations');

    if (remaining < 0) {
        statusBox.className = "p-5 rounded-2xl shadow-md text-center bg-red-50 text-red-600 border border-red-100";
        savingStatus.innerText = "عجز مالي";
        
        recDiv.className = "p-6 rounded-2xl border border-red-200 bg-red-50/50 text-red-950 space-y-2";
        recDiv.innerHTML = `
            <h3 class="font-bold text-lg mb-2"><i class="fa-solid fa-triangle-exclamation text-red-500 ml-1"></i> خطة معالجة العجز المالي</h3>
            <p class="text-sm">مصروفاتك تتجاوز دخلك بمقدار <strong>${Math.abs(remaining).toFixed(2)}</strong>.</p>
            <ul class="list-disc list-inside text-sm space-y-1 pt-2">
                <li>قلص المصاريف الثانوية فوراً وركز على الأساسيات فقط.</li>
                <li>تواصل لإعادة جدولة القروض والالتزامات الثابتة إن أمكن.</li>
            </ul>
        `;
    } else {
        statusBox.className = "p-5 rounded-2xl shadow-md text-center bg-emerald-50 text-emerald-600 border border-emerald-100";
        savingStatus.innerText = "فائض ممتاز";

        const invest = (remaining * 0.40).toFixed(2);
        const flex = (remaining * 0.60).toFixed(2);

        recDiv.className = "p-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 text-emerald-950 space-y-2";
        recDiv.innerHTML = `
            <h3 class="font-bold text-lg mb-2"><i class="fa-solid fa-chart-line text-emerald-600 ml-1"></i> خطة التوزيع الاستثماري</h3>
            <p class="text-sm">لديك فائض بقيمة <strong>${remaining.toFixed(2)}</strong>. التوزيع الموصى به:</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div class="bg-white p-3 rounded-xl border border-emerald-100 text-sm"><strong>📈 ادخار/استثمار (40%):</strong> ${invest}</div>
                <div class="bg-white p-3 rounded-xl border border-emerald-100 text-sm"><strong>🛍️ مصاريف متغيرة (60%):</strong> ${flex}</div>
            </div>
        `;
    }
}

// الربط مع Gemini API
async function askGemini() {
    const apiKey = document.getElementById('apiKey').value;
    const aiResponseDiv = document.getElementById('aiResponse');
    const aiBtn = document.getElementById('aiBtn');

    if (!apiKey) {
        alert("يرجى إدخال مفتاح Gemini API أولاً للاستفادة من التحليل الذكي.");
        return;
    }

    const income = parseFloat(document.getElementById('income').value) || 0;
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const expenseDetails = expenses.map(e => `${e.type}: ${e.amount}`).join(', ');

    const prompt = `أنا مستشار مالي. الراتب: ${income}، المصاريف الثابتة الإجمالية: ${totalExpenses}. التفاصيل: [${expenseDetails}]. قدم تحليل مالي مختصر وعملي جداً في 3 نقاط باللغة العربية (كيفية إدارة الوضع أو تحسين الاستثمار).`;

    aiBtn.disabled = true;
    aiBtn.innerText = "جاري التحليل...";
    aiResponseDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-purple-600"></i> يتم التواصل مع Gemini...';

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            aiResponseDiv.innerText = data.candidates[0].content.parts[0].text;
        } else {
            aiResponseDiv.innerText = "حدث خطأ في استجابة الذكاء الاصطناعي، يرجى التأكد من صحة الـ API Key.";
        }
    } catch (err) {
        aiResponseDiv.innerText = "تعذر الاتصال بـ Gemini API. تأكد من إدخال مفتاح صحيح ومن الاتصال بالإنترنت.";
    } finally {
        aiBtn.disabled = false;
        aiBtn.innerText = "توليد تحليل ذكي";
    }
}
