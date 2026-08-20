export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. التحقق من وجود المفتاح في بيئة Vercel
    if (!apiKey) {
        return res.status(500).json({ error: 'مفتاح GEMINI_API_KEY غير مضاف في إعدادات Vercel Environment Variables.' });
    }

    // 2. تجربة النماذج المعتمدة والمتاحة لعام 2026
    const models = [
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro'
    ];

    let debugDetails = [];

    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: prompt }]
                        }
                    ]
                })
            });

            const data = await response.json();

            // في حال نجاح الاستجابة
            if (response.ok && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                return res.status(200).json(data);
            } 
            
            // تسجيل الخطأ للمساعدة في التتبع
            if (data.error) {
                debugDetails.push(`[${model}]: ${data.error.message}`);
            }
        } catch (err) {
            debugDetails.push(`[${model} Exception]: ${err.message}`);
        }
    }

    // 3. إرجاع سبب الفشل التفصيلي من جوجل لتحديد المشكلة بدقة
    return res.status(500).json({ 
        error: `تعذر الاتصال بـ Gemini API. التفاصيل: ${debugDetails.join(' | ')}` 
    });
}
