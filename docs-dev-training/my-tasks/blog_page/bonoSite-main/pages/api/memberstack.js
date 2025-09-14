import axios from 'axios';

export default async function handler(req, res) {
  try {
    const memberstackRes = await axios({
      method: req.method,
      url: `https://client.memberstack.com/member/create-billing-portal-session`,
      headers: req.headers,
      data: req.body,
    });

    return res.status(200).json(memberstackRes.data);
  } catch (error) {
    return res.status(500).json({ error: 'Error contacting Memberstack API' });
  }
}