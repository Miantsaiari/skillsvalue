const axios = require('axios');
require('dotenv').config();

async function test() {
  const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
    model: "mistralai/mistral-small-3.2-24b-instruct:free",
    messages: [{ role: 'user', content: 'Quel est le rôle de useEffect en React ? Réponds brièvement.' }]
  }, {
    headers: {
      'Authorization': `Bearer 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`,
      'Content-Type': 'application/json'
    }
  });

  console.log(res.data.choices[0].message.content);
}

test();
