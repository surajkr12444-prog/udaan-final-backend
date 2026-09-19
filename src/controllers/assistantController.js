function fallbackReply(message, language = 'en', portalGuide = null) {
  const q = String(message || '').toLowerCase();
  const hi = language === 'hi';
  const hinglish = language === 'hinglish';
  const steps = /step|apply|kaise|कैसे|process|form|portal|document|दस्तावेज/.test(q);

  if (portalGuide && steps) {
    const title = portalGuide.title || 'this opportunity';
    const portal = portalGuide.portalName || 'the official portal';
    if (hi) return `${title} के लिए ${portal} पर सामान्य प्रक्रिया: 1) लॉगिन/रजिस्टर करें, 2) प्रोफ़ाइल व पहचान विवरण पूरा करें, 3) योजना/छात्रवृत्ति चुनकर पात्रता फिर जाँचें, 4) मांगे गए दस्तावेज़ अपलोड करें, 5) बैंक/संस्थान विवरण सत्यापित करें, 6) फॉर्म की समीक्षा करके declaration स्वीकार करें, 7) submit के बाद application/reference number सेव करें। पोर्टल का UI बदल सकता है, इसलिए वर्तमान on-screen instructions को प्राथमिकता दें।`;
    if (hinglish) return `${title} ke liye ${portal} par normal process: 1) login/register karo, 2) profile + identity details complete karo, 3) scheme/scholarship select karke eligibility re-check karo, 4) required documents upload karo, 5) bank/institute details verify karo, 6) form review karke declaration accept karo, 7) submit ke baad application/reference number save karo. Portal UI change ho sakta hai, isliye current on-screen instructions ko priority do.`;
    return `For ${title} on ${portal}: 1) sign in or register, 2) complete identity/profile details, 3) select the scheme and re-check eligibility, 4) upload the requested documents, 5) verify bank/institution details, 6) review the form and accept the declaration, 7) submit and save the application/reference number. Government portal screens can change, so follow the current on-screen instructions first.`;
  }
  if (/scholarship|student|college|school|padhai|छात्र/.test(q)) return hi ? 'Student Match चलाइए। मैं scholarship eligibility, required documents और official portal apply steps समझा सकता हूँ।' : hinglish ? 'Student Match chalao. Main scholarship eligibility, required documents aur official portal apply steps guide kar sakta hoon.' : 'Run Student Match. I can explain scholarship eligibility, required documents, and official portal application steps.';
  if (/loan|business|mudra|pmegp|entrepreneur/.test(q)) return hi ? 'Business Match चलाइए। मैं MUDRA, PMEGP, Stand-Up India जैसी योजनाओं की eligibility, documents और application steps समझा सकता हूँ।' : hinglish ? 'Business Match chalao. Main MUDRA, PMEGP, Stand-Up India ki eligibility, documents aur apply steps samjha sakta hoon.' : 'Run Business Match. I can explain eligibility, documents, and application steps for MUDRA, PMEGP, Stand-Up India and similar schemes.';
  return hi ? 'मैं योजनाओं, छात्रवृत्तियों, eligibility, documents, EMI और official portal steps में मदद कर सकता हूँ। अपना सवाल थोड़ा detail में पूछें।' : hinglish ? 'Main schemes, scholarships, eligibility, documents, EMI aur official portal steps me help kar sakta hoon. Apna question thoda detail me pucho.' : 'I can help with schemes, scholarships, eligibility, documents, EMI, and official portal steps. Ask me what you want to do next.';
}

async function geminiReply(message, language, portalGuide) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const languageInstruction = language === 'hi' ? 'Reply in natural Hindi (Devanagari).' : language === 'hinglish' ? 'Reply in friendly Hinglish using Latin script.' : 'Reply in clear English.';
  const guideContext = portalGuide ? `The user has opened the official portal for: ${portalGuide.title}; portal: ${portalGuide.portalName}; URL: ${portalGuide.url}. You cannot see or control that external website. Guide using general step-by-step instructions and tell the user to follow current on-screen portal instructions if they differ.` : '';
  const prompt = `You are Udaan AI, a concise assistant for Indian government business schemes and student scholarships. ${languageInstruction} Never claim you can see the user's external government portal screen. Do not invent approval guarantees, deadlines or eligibility. Encourage the user to verify current official portal instructions. ${guideContext}\nUser: ${String(message).slice(0, 2500)}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.35, maxOutputTokens: 450 } })
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim() || null;
}

export async function assistantChat(req, res, next) {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });
    const language = ['hi', 'hinglish', 'en'].includes(req.body?.language) ? req.body.language : 'en';
    const portalGuide = req.body?.portalGuide || null;
    let reply = null;
    try { reply = await geminiReply(message, language, portalGuide); } catch { reply = null; }
    if (!reply) reply = fallbackReply(message, language, portalGuide);
    res.json({ success: true, reply, source: process.env.GEMINI_API_KEY && reply ? 'assistant' : 'fallback' });
  } catch (err) { next(err); }
}
