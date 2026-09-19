import { ENTREPRENEUR_SCHEMES } from '../data/entrepreneurSchemes.js';
import { SCHOLARSHIPS } from '../data/scholarships.js';

function norm(value) { return String(value || '').toLowerCase().trim(); }
function joinList(items = [], max = 5) { return items.slice(0, max).join(', '); }

function detectLanguage(message, requested = 'en') {
  const text = String(message || '');
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/\b(kya|kaise|mujhe|mera|meri|hum|aap|apna|chahiye|karna|karo|batao|bata|paisa|kitna|kaun|kaha|kyu|hai|hain|nahi|nhi|wala|wali|documents?|apply)\b/i.test(text)) return 'hinglish';
  return ['hi', 'hinglish', 'en'].includes(requested) ? requested : 'en';
}

function guideSteps(lang, title = 'this opportunity', portal = 'the official portal') {
  if (lang === 'hi') return `${title} के लिए ${portal} पर सामान्य प्रक्रिया: 1) नया registration या login करें, 2) Aadhaar/mobile/email verification और profile details पूरा करें, 3) सही scheme/scholarship चुनकर eligibility फिर check करें, 4) portal पर मांगे गए documents upload करें, 5) bank/institute/business details verify करें, 6) form preview करके declaration स्वीकार करें, 7) submit के बाद application/reference number और acknowledgement save करें, 8) dashboard पर status track करें। Portal screens बदल सकते हैं, इसलिए current official instructions को priority दें।`;
  if (lang === 'hinglish') return `${title} ke liye ${portal} par normal process: 1) register/login karo, 2) Aadhaar/mobile/email verification aur profile details complete karo, 3) correct scheme/scholarship select karke eligibility re-check karo, 4) portal ke required documents upload karo, 5) bank/institute/business details verify karo, 6) form preview karke declaration accept karo, 7) submit ke baad application/reference number aur acknowledgement save karo, 8) dashboard se status track karo. Portal screens change ho sakte hain, isliye current official instructions ko priority do.`;
  return `For ${title} on ${portal}: 1) register or sign in, 2) complete Aadhaar/mobile/email verification and profile details, 3) select the correct scheme or scholarship and re-check eligibility, 4) upload the documents requested by the portal, 5) verify bank/institution/business details, 6) preview the form and accept the declaration, 7) submit and save the application/reference number and acknowledgement, 8) track status from the portal dashboard. Government portal screens can change, so follow the current official instructions first.`;
}

function findOpportunity(q) {
  const all = [
    ...ENTREPRENEUR_SCHEMES.map((x) => ({ ...x, kind: 'scheme' })),
    ...SCHOLARSHIPS.map((x) => ({ ...x, kind: 'scholarship' })),
  ];
  return all.find((item) => {
    const names = [item.id, item.name, item.shortName].filter(Boolean).map(norm);
    return names.some((name) => name.length > 3 && (q.includes(name) || name.split(/\s+/).filter((w) => w.length > 4).some((w) => q.includes(w))));
  });
}

function opportunityReply(item, lang, asksApply, asksDocs = false) {
  const docs = joinList(item.documents || [], 6);
  const benefits = joinList(item.benefits || [], 3);
  const provider = item.provider || item.ministry || item.portalName || 'Government of India';
  if (asksDocs) {
    if (lang === 'hi') return `${item.shortName || item.name} के लिए उपलब्ध Udaan data में documents: ${docs || 'official portal की checklist देखें'}। Final checklist और validity requirements official portal पर verify करें।`;
    if (lang === 'hinglish') return `${item.shortName || item.name} ke liye Udaan data me documents: ${docs || 'official portal ki checklist dekho'}. Final checklist aur validity requirements official portal par verify karo.`;
    return `For ${item.shortName || item.name}, Udaan currently lists: ${docs || 'check the official portal checklist'}. Verify the final checklist and document-validity requirements on the official portal.`;
  }
  if (asksApply) return guideSteps(lang, item.shortName || item.name, item.portalName || provider);
  if (lang === 'hi') return `${item.shortName || item.name}: ${item.description || item.tagline || ''} ${item.amountLabel ? `सहायता/राशि: ${item.amountLabel}. ` : ''}${benefits ? `मुख्य लाभ: ${benefits}. ` : ''}${docs ? `आम documents: ${docs}. ` : ''}Final eligibility और current rules official portal पर verify करें।`;
  if (lang === 'hinglish') return `${item.shortName || item.name}: ${item.description || item.tagline || ''} ${item.amountLabel ? `Support/amount: ${item.amountLabel}. ` : ''}${benefits ? `Main benefits: ${benefits}. ` : ''}${docs ? `Common documents: ${docs}. ` : ''}Final eligibility aur latest rules official portal par verify karo.`;
  return `${item.shortName || item.name}: ${item.description || item.tagline || ''} ${item.amountLabel ? `Support/amount: ${item.amountLabel}. ` : ''}${benefits ? `Key benefits: ${benefits}. ` : ''}${docs ? `Common documents: ${docs}. ` : ''}Verify final eligibility and current rules on the official portal.`;
}

function fallbackReply(message, requestedLanguage = 'en', portalGuide = null) {
  const q = norm(message);
  const lang = detectLanguage(message, requestedLanguage);
  const asksDocs = /document|dastavez|दस्तावेज|certificate|proof/.test(q);
  const asksSteps = /step|apply|kaise|कैसे|process|form|portal|registration|register|submission|submit/.test(q);

  if (portalGuide && asksSteps) return guideSteps(lang, portalGuide.title || 'this opportunity', portalGuide.portalName || 'the official portal');

  const found = findOpportunity(q);
  if (found) return opportunityReply(found, lang, asksSteps, asksDocs);

  if (/how.*(use|work)|website|udaan.*(use|work)|start|begin|kaha.*se|कहाँ.*से/.test(q)) {
    if (lang === 'hi') return 'Udaan use करने के लिए: 1) Student Scholarship Match या Business Loan Match चुनें, 2) अपनी सही profile details भरें, 3) ranked results और eligibility reasons देखें, 4) documents checklist पढ़ें, 5) “Official Portal + Udaan Guide” से सरकारी portal खोलें, 6) Udaan AI से हर application step पूछते रहें, 7) login होने पर matched/saved opportunities और history account में देखें।';
    if (lang === 'hinglish') return 'Udaan use karne ke liye: 1) Student Scholarship Match ya Business Loan Match choose karo, 2) correct profile details fill karo, 3) ranked results + eligibility reasons dekho, 4) documents checklist check karo, 5) “Official Portal + Udaan Guide” se govt portal kholo, 6) har application step Udaan AI se pucho, 7) login ke baad saved opportunities aur history account me dekho.';
    return 'To use Udaan: 1) choose Student Scholarship Match or Business Loan Match, 2) enter accurate profile details, 3) review ranked results and eligibility reasons, 4) check the document list, 5) open the government site using “Official Portal + Udaan Guide”, 6) ask Udaan AI about each application step, 7) when signed in, review saved opportunities and history in your account.';
  }

  if (/document|dastavez|दस्तावेज/.test(q)) {
    if (lang === 'hi') return 'Exact documents scheme पर depend करते हैं। आम तौर पर Aadhaar, PAN (business cases), income certificate, category/disability certificate (यदि लागू हो), bank details, marksheet/admission proof (students), या business/project proof मांगे जा सकते हैं। Udaan के matched result card में specific checklist देखें और final list official portal से verify करें।';
    if (lang === 'hinglish') return 'Exact documents scheme par depend karte hain. Usually Aadhaar, PAN (business cases), income certificate, category/disability certificate if applicable, bank details, marksheet/admission proof for students, ya business/project proof lag sakte hain. Udaan matched result card me specific checklist dekho aur final list official portal se verify karo.';
    return 'Exact documents depend on the scheme. Commonly requested items include Aadhaar, PAN for business cases, income certificate, category/disability certificate if applicable, bank details, marksheets/admission proof for students, or business/project proof. Check the specific Udaan result card and verify the final list on the official portal.';
  }

  if (/eligible|eligibility|पात्र|qualify/.test(q)) {
    if (lang === 'hi') return 'Eligibility check करने का best तरीका Udaan का matching form है। Student के लिए education level, category, gender, family income और marks; entrepreneur के लिए category, business stage, sector, location और funding need जैसे factors use होते हैं। Match result guidance है—final eligibility official portal तय करता है।';
    if (lang === 'hinglish') return 'Eligibility check karne ka best way Udaan matching form hai. Student ke liye education level, category, gender, family income aur marks; entrepreneur ke liye category, business stage, sector, location aur funding need jaise factors use hote hain. Match result guidance hai—final eligibility official portal decide karta hai.';
    return 'The best way to check eligibility is to run the Udaan matching form. Student matching uses factors such as education level, category, gender, family income and marks; entrepreneur matching uses category, business stage, sector, location and funding need. Udaan provides guidance—final eligibility is decided by the official portal/authority.';
  }

  if (/emi|interest|kist|किस्त/.test(q)) {
    if (lang === 'hi') return 'EMI estimate के लिए Udaan का EMI Calculator खोलें और loan amount, annual interest rate और tenure डालें। यह planning estimate है; actual EMI और interest lender/bank sanction के अनुसार बदल सकते हैं।';
    if (lang === 'hinglish') return 'EMI estimate ke liye Udaan EMI Calculator me loan amount, annual interest rate aur tenure enter karo. Ye planning estimate hai; actual EMI aur rate lender/bank sanction ke hisaab se change ho sakte hain.';
    return 'Use the Udaan EMI Calculator with the loan amount, annual interest rate and tenure. It is a planning estimate; the actual EMI and rate can differ based on the lender/bank sanction.';
  }

  if (/scholarship|student|college|school|padhai|छात्र/.test(q)) {
    if (lang === 'hi') return 'Student Scholarship Match चलाइए। Udaan education level, category, gender, family income और marks के आधार पर available scholarships rank करता है। Result में benefits, documents और official portal link मिलेगा।';
    if (lang === 'hinglish') return 'Student Scholarship Match chalao. Udaan education level, category, gender, family income aur marks ke basis par scholarships rank karta hai. Result me benefits, documents aur official portal link milega.';
    return 'Run Student Scholarship Match. Udaan ranks scholarships using education level, category, gender, family income and marks, then shows benefits, documents and the official portal link.';
  }

  if (/loan|business|entrepreneur|mudra|pmegp|stand.?up|msme|व्यवसाय|लोन/.test(q)) {
    if (lang === 'hi') return 'Business Loan Match चलाइए। Udaan आपकी category, business stage, sector, location और funding need के अनुसार MUDRA, PMEGP, Stand-Up India और अन्य schemes compare करता है। Final approval bank/official authority पर depend करता है।';
    if (lang === 'hinglish') return 'Business Loan Match chalao. Udaan category, business stage, sector, location aur funding need ke hisaab se MUDRA, PMEGP, Stand-Up India aur other schemes compare karta hai. Final approval bank/official authority par depend karta hai.';
    return 'Run Business Loan Match. Udaan compares MUDRA, PMEGP, Stand-Up India and other schemes based on category, business stage, sector, location and funding need. Final approval depends on the bank/official authority.';
  }

  if (/hello|hi|hey|namaste|नमस्ते/.test(q)) {
    if (lang === 'hi') return 'नमस्ते! आप student scholarship, business loan, eligibility, documents, EMI या application process—किस बारे में मदद चाहते हैं?';
    if (lang === 'hinglish') return 'Namaste! Student scholarship, business loan, eligibility, documents, EMI ya application process—kis cheez me help chahiye?';
    return 'Hi! What would you like help with—student scholarships, business loans, eligibility, documents, EMI, or the application process?';
  }

  if (lang === 'hi') return 'मैं Udaan पर schemes, scholarships, eligibility, documents, EMI, matching results और official portal application steps में मदद कर सकता हूँ। Scheme/scholarship का नाम या अपना goal बताइए।';
  if (lang === 'hinglish') return 'Main Udaan par schemes, scholarships, eligibility, documents, EMI, matching results aur official portal application steps me help kar sakta hoon. Scheme/scholarship ka naam ya apna goal batao.';
  return 'I can help with Udaan schemes, scholarships, eligibility, documents, EMI, matching results and official portal application steps. Tell me the opportunity name or what you want to achieve.';
}

async function geminiReply(message, language, portalGuide) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const languageInstruction = language === 'hi' ? 'Reply in natural Hindi (Devanagari).' : language === 'hinglish' ? 'Reply in friendly Hinglish using Latin script.' : 'Reply in clear English.';
  const guideContext = portalGuide ? `The user has opened the official portal for: ${portalGuide.title}; portal: ${portalGuide.portalName}; URL: ${portalGuide.url}. You cannot see or control that external website. Guide using general step-by-step instructions and tell the user to follow current on-screen portal instructions if they differ.` : 'The user is inside the Udaan website. Help them understand and use Udaan features as well as Indian government scheme/scholarship application basics.';
  const prompt = `You are Udaan AI, a concise, friendly assistant for Indian government business schemes and student scholarships. ${languageInstruction} Never claim guaranteed approval. Never claim you can see an external government portal screen. Do not invent current deadlines or changed eligibility rules; ask the user to verify them on the official portal. Explain next actions in numbered steps when useful. ${guideContext}\nUser: ${String(message).slice(0, 2500)}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 500 } })
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim() || null;
}

export async function assistantChat(req, res, next) {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });
    const language = detectLanguage(message, req.body?.language);
    const portalGuide = req.body?.portalGuide || null;
    let reply = null; let usedGemini = false;
    try { reply = await geminiReply(message, language, portalGuide); usedGemini = Boolean(reply); } catch { reply = null; }
    if (!reply) reply = fallbackReply(message, language, portalGuide);
    res.json({ success: true, reply, language, source: usedGemini ? 'assistant' : 'fallback' });
  } catch (err) { next(err); }
}
