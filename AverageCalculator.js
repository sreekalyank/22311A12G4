const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const WINDOW_SIZE = 10;
const QUALIFIED_IDS = ['p', 'f', 'e', 'r'];

const windowStates = {
  p: [],
  f: [],
  e: [],
  r: []
};

async function fetchNumbers(numberid) {
  const endpoints = {
    p: 'http://20.244.56.144/evaluation-service/primes',
    f: 'http://20.244.56.144/evaluation-service/fibo',
    e: 'http://20.244.56.144/evaluation-service/even',
    r: 'http://20.244.56.144/evaluation-service/rand'
  };

  try {
    const response = await axios.get(endpoints[numberid], {
      timeout: 500,
      headers: {
        'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MzI3MTQwLCJpYXQiOjE3NDgzMjY4NDAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6Ijg4NWU5ZjAyLTY4OGUtNGIzMy04NzYwLTk2OGM1YTRmZWU4MCIsInN1YiI6IjIyMzExYTEyZzRAaXQuc3JlZW5pZGhpLmVkdS5pbiJ9LCJlbWFpbCI6IjIyMzExYTEyZzRAaXQuc3JlZW5pZGhpLmVkdS5pbiIsIm5hbWUiOiJrb3RhIHNyZWUga2FseWFuIiwicm9sbE5vIjoiMjIzMTFhMTJnNCIsImFjY2Vzc0NvZGUiOiJQQ3FBVUsiLCJjbGllbnRJRCI6Ijg4NWU5ZjAyLTY4OGUtNGIzMy04NzYwLTk2OGM1YTRmZWU4MCIsImNsaWVudFNlY3JldCI6InFkRXlzUVlRcmpYTkd3cFAifQ.n5j_ILeEAhRShc9uvZCAHj64ctziC36kRp363-9Jfwg" 
   } });
    return response.data.numbers || [];
  } catch (err) {
    console.error('Fetch error:', err.message);
    return [];
  }
}

app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;

  if (!QUALIFIED_IDS.includes(numberid)) {
    return res.status(400).json({ error: 'Invalid numberid' });
  }

  const prevState = [...windowStates[numberid]];
  const numbers = await fetchNumbers(numberid);
  const uniqueNewNumbers = numbers.filter(num => !windowStates[numberid].includes(num));

  windowStates[numberid].push(...uniqueNewNumbers);

  while (windowStates[numberid].length > WINDOW_SIZE) {
    windowStates[numberid].shift();
  }

  const currState = [...windowStates[numberid]];
  const avg = currState.length === 0
    ? 0
    : parseFloat((currState.reduce((a, b) => a + b, 0) / currState.length).toFixed(2));

  res.json({
    windowPrevState: prevState,
    windowCurrState: currState,
    numbers: numbers,
    avg: avg
  });
});

app.listen(PORT, () => {
  console.log(`Average Calculator microservice running on port ${PORT}`);
});
