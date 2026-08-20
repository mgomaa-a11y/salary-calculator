let expenses = [];

function addExpense() {
    const typeSelect = document.getElementById('expenseType');
    const amountInput = document.getElementById('expenseAmount');
    
    const type = typeSelect.value;
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) return;

    expenses.push({ id: Date.now(), type, amount });
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
            <h3 class="font-bold text-lg mb-2"><i class="fa-solid fa-triangle-exclamation text-red-500 ml-1"></i> تنبيه العجز المالي</h3>
            <p class="text-sm">المصروفات الثابتة تزيد عن الدخل بمقدار <strong>${Math.abs(remaining).toFixed(2)}</strong>. يُنصح بمراجعة البنود لتقليل التكاليف بأسرع وقت.</p>
        `;
    } else {
        statusBox.className = "p-5 rounded-2xl shadow-md text-center bg-emerald-50 text-emerald-600 border border-emerald-100";
        savingStatus.innerText = "فائض ممتاز";

        const invest = (remaining * 0.40).toFixed(2);
        const flex = (remaining * 0.60).toFixed(2);

        recDiv.className = "p-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 text-emerald-950 space-y-2";
        recDiv.innerHTML = `
            <h3 class="font-bold text-lg mb-2"><i class="fa-solid fa-chart-line text-emerald-600 ml-1"></i> توزيع الفائض المقترح</h3>
            <p class="text-sm">يوجد فائض بقيمة <strong>${remaining.toFixed(2)}</strong>. التوزيع المالي المقترح:</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div class="bg-white p-3 rounded-xl border border-emerald-100 text-sm"><strong>📈 ادخار واستثمار (40%):</strong> ${invest}</div>
                <div class="bg-white p-3 rounded-xl border border-emerald-100 text-sm"><strong>🛍️ مصاريف شخصية (60%):</strong> ${flex}</div>
            </div>
        `;
    }
}

async function askGemini() {
    const aiResponseDiv = document.getElementById('aiResponse');
    const aiBtn = document.getElementById('aiBtn');

    const income = parseFloat(document.getElementById('income').value) || 0;
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const expenseDetails = expenses.map(e => `${e.type}: ${e.amount}`).join(', ');

    if (income <= 0) {
        alert("يرجى إدخال الراتب أولاً!");
        return;
    }

    const prompt = `أنا مستشار مالي. الراتب: ${income}، إجمالي المصاريف الثابتة: ${totalExpenses}. التفاصيل: [${expenseDetails}]. قدم تحليل مالي مختصر جداً في 3 نقاط باللغة العربية.`;

    aiBtn.disabled = true;
    aiBtn.innerText = "جاري التحليل...";
    aiResponseDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-purple-600"></i> جاري الاتصال بالذكاء الاصطناعي...';

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();

        if (response.ok && data.candidates && data.candidates[0].content.parts[0].text) {
            aiResponseDiv.innerText = data.candidates[0].content.parts[0].text;
        } else {
            const errorMsg = data.error || "خطأ غير معروف، تأكد من GEMINI_API_KEY على Vercel";
            aiResponseDiv.innerHTML = `<span class="text-red-500 font-bold">${errorMsg}</span>`;
        }
    } catch (err) {
        aiResponseDiv.innerHTML = '<span class="text-red-500 font-bold">تعذر الاتصال بالخادم. حاول مرة أخرى.</span>';
    } finally {
        aiBtn.disabled = false;
        aiBtn.innerText = "توليد تحليل ذكي";
    }
}
