let expenses = [];

function addExpense() {
    const typeSelect = document.getElementById('expenseType');
    const amountInput = document.getElementById('expenseAmount');
    
    const type = typeSelect.value;
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        alert("يرجى إدخال قيمة صحيحة للمصروف");
        return;
    }

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
        listElem.innerHTML = '<li class="text-sm text-gray-500 text-center py-2" id="emptyMsg">لم يتم إضافة مصاريف بعد</li>';
        return;
    }

    listElem.innerHTML = expenses.map(item => `
        <li class="flex justify-between items-center bg-white p-2 px-3 rounded border text-sm">
            <span><strong>${item.type}:</strong> ${item.amount.toFixed(2)}</span>
            <button onclick="removeExpense(${item.id})" class="text-red-500 hover:text-red-700 font-bold">حذف</button>
        </li>
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
        // حالة العجز المالي
        statusBox.className = "p-4 rounded-lg text-center bg-red-100";
        savingStatus.innerText = "عجز مالي";
        savingStatus.className = "text-lg font-bold text-red-600";

        const deficit = Math.abs(remaining);
        recDiv.className = "p-5 rounded-lg border border-red-200 bg-red-50 text-red-900 space-y-3";
        recDiv.innerHTML = `
            <h3 class="font-bold text-base border-b border-red-200 pb-2">خطوات عملية لسد العجز المالي (${deficit.toFixed(2)}):</h3>
            <ul class="list-disc list-inside space-y-2 text-sm">
                <li><strong>مراجعة بند السكن والأقساط:</strong> إذا كانت تكلفة السكن أو القروض تتجاوز 40% من دخل الدخل، يجب البحث عن إعادة جدولة القروض أو تقليل تكلفة السكن.</li>
                <li><strong>إلغاء الاشتراكات غير الضرورية:</strong> إيقاف أي خدمات مدفوعة مؤقتاً لحين ضبط الميزانية.</li>
                <li><strong>الحد من المصاريف المتغيرة:</strong> تطبيق قاعدة التقشف المؤقت على الغذاء الخارجي والترفيه حتى يغطي الدخل كافة المصاريف.</li>
                <li><strong>زيادة الدخل:</strong> البحث عن مصدر دخل إضافي جزئي أو بيع أصول/أغراض غير مستخدمة لتغطية الفجوة.</li>
            </ul>
        `;
    } else {
        // حالة الفائض المالي
        statusBox.className = "p-4 rounded-lg text-center bg-green-100";
        savingStatus.innerText = "فائض ممتاز";
        savingStatus.className = "text-lg font-bold text-green-600";

        const emergencyFund = (totalExpenses * 3).toFixed(2);
        const investAmount = (remaining * 0.50).toFixed(2);
        const flexAmount = (remaining * 0.50).toFixed(2);

        recDiv.className = "p-5 rounded-lg border border-green-200 bg-green-50 text-green-900 space-y-3";
        recDiv.innerHTML = `
            <h3 class="font-bold text-base border-b border-green-200 pb-2">خطة استغلال الفائض المالي (${remaining.toFixed(2)}):</h3>
            <div class="space-y-3 text-sm">
                <p><strong>1. بناء صندوق الطوارئ أولاً:</strong> يجب تأمين مبلغ <strong>${emergencyFund}</strong> (يعادل مصاريف 3 أشهر). ادخر كامل الفائض حتى تنتهي من بناء هذا الصندوق لحمايتك من أي أزمات.</p>
                <p><strong>2. تقسيم الفائض بعد صندوق الطوارئ:</strong></p>
                <ul class="list-disc list-inside space-y-1 pr-4">
                    <li><strong>50% للاستثمار طويل الأجل (${investAmount}):</strong> ضخ هذا المبلغ شهرياً في صناديق المؤشرات مثل (S&P 500)، الأسهم ذات العوائد، أو الصناديق الاستثمارية المرخصة للاستفادة من الفائدة المركبة على المدى البعيد.</li>
                    <li><strong>50% للمصاريف الشخصية والرفاهية (${flexAmount}):</strong> تُخصص للمتعة، السفر، والتسوق لضمان الاستمرارية بدون حرمان.</li>
                </ul>
            </div>
        `;
    }
}
