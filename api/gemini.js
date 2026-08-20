export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY غير مضاف في Vercel' });
    }

    // القائمة المعتمدة للنماذج المتاحة
    const models = ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-1.5-flash', 'gemini-1.5-pro'];

    for (const model of models) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            const data = await response.json();

            // إذا نجح الطلب نرجع النتيجة مباشرة
            if (response.ok && data.candidates) {
                return res.status(200).json(data);
            }
        } catch (err) {
            // في حال فشل النموذج الحالي ننتقل للنموذج التالي في القائمة
            continue;
        }
    }

    // إذا فشلت جميع المحاولات
    return res.status(500).json({ error: 'فشل الاتصال بجميع نماذج Gemini المتاحة. تأكد من إعدادات المفتاح.' });
}
