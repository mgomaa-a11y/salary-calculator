export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'مفتاح GEMINI_API_KEY غير مضاف في إعدادات Vercel.' });
    }

    const models = [
        'gemini-3.6-flash',
        'gemini-2.5-flash',
        'gemini-2.0-flash'
    ];

    let debugDetails = [];

    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{ text: prompt }]
                    }]
                })
            });

            const data = await response.json();

            if (response.ok && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                return res.status(200).json(data);
            } 
            
            if (data.error) {
                debugDetails.push(`[${model}]: ${data.error.message}`);
            }
        } catch (err) {
            debugDetails.push(`[${model} Exception]: ${err.message}`);
        }
    }

    return res.status(500).json({ 
        error: `تعذر الاتصال بـ Gemini API. التفاصيل: ${debugDetails.join(' | ')}` 
    });
}
