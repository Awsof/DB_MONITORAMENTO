import express from 'express';

const app = express();
app.use(express.text({ type: '*/*', limit: '10mb' }));

app.post('/proxy', async (req, res) => {
  try {
    const targetUrl = req.headers['x-target-url'];
    const soapAction = req.headers['x-soap-action'];

    if (!targetUrl) {
      return res.status(400).send('Missing x-target-url');
    }

    const headers = {
      'Content-Type': 'text/xml; charset=utf-8',
      'Accept': 'text/xml, application/xml'
    };

    if (soapAction) {
      headers['SOAPAction'] = `"${soapAction}"`;
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: req.body
    });

    const text = await response.text();
    res.status(response.status).send(text);

  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => console.log('Proxy rodando na porta 3000'));
