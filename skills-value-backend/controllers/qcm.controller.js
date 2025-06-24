const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Génère un QCM depuis une question + sa réponse
async function generateQCM(question, answer) {
  const prompt = `
Génère un QCM avec 4 options à partir de cette question technique.
Inclue une seule bonne réponse basée sur la réponse fournie. Formate la réponse en JSON strict :

Question : ${question}
Réponse correcte : ${answer}

Format :
{
  "question": "...",
  "options": ["...","...","...","..."],
  "correctAnswer": "..."
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // modèle gratuit
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    const jsonStr = content.match(/{[\s\S]*}/)?.[0];
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("❌ Erreur OpenAI :", err.message);
    return null;
  }
}

module.exports = { generateQCM };
