function calculateFinance() {
    const income = parseFloat(document.getElementById('income').value);
    const expenses = parseFloat(document.getElementById('expenses').value);
    const resultsDiv = document.getElementById('results');

    if (isNaN(income) || isNaN(expenses) || income <= 0) {
        alert("يرجى إدخال أرقام صحيحة للراتب والمصروفات");
        return;
    }

    const remaining = income - expenses;
    const remainingAmountElem = document.getElementById('remainingAmount');
    const savingStatusElem = document.getElementById('savingStatus');
    const flexExpensesElem = document.getElementById('flexExpenses');
    const investmentElem = document.getElementById('investmentAmount');
    const adviceElem = document.getElementById('advice');

    remainingAmountElem.innerText = remaining.toFixed(2);
    resultsDiv.classList.remove('hidden');

    if (remaining <= 0) {
        savingStatusElem.innerText = "غير ممكن (عجز مالي)";
        savingStatusElem.className = "text-xl font-bold text-red-600";
        flexExpensesElem.innerText = "0";
        investmentElem.innerText = "0";
        adviceElem.className = "p-4 rounded-lg text-sm mt-4 bg-red-100 text-red-800";
        adviceElem.innerText = "مصروفاتك الثابتة تتجاوز دخل أو تساويه! يجب مراجعة المصاريف الثابتة وتقليل الأقساط أو الاشتراطات غير الضرورية فوراً.";
    } else {
        savingStatusElem.innerText = "ممكن ممتاز";
        savingStatusElem.className = "text-xl font-bold text-green-600";

        // تقسيم المتبقي: 60% مصاريف متغيرة/شخصية، 40% ادخار واستثمار طويل الأجل
        const flex = remaining * 0.60;
        const invest = remaining * 0.40;

        flexExpensesElem.innerText = flex.toFixed(2);
        investmentElem.innerText = invest.toFixed(2);

        // النصائح الاستثمارية
        adviceElem.className = "p-4 rounded-lg text-sm mt-4 bg-blue-100 text-blue-900";
        adviceElem.innerHTML = `
            <strong>خطة التوفير والاستثمار الاستراتيجية:</strong><br>
            1. <strong>صندوق الطوارئ:</strong> وجه مبالغ الاستثمار أولاً لبناء "صندوق طوارئ" يعادل مصاريف 3 إلى 6 أشهر.<br>
            2. <strong>الاستثمار طويل الأجل:</strong> بعد بناء الصندوق، قم بضخ المبلغ المخصص للاستثمار (${invest.toFixed(2)}) شهرياً في صناديق المؤشرات مثل (S&P 500) أو الصناديق الاستثمارية المرخصة لتحقيق عائد تراكمي على المدى البعيد.
        `;
    }
}