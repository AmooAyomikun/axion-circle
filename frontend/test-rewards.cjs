

async function test() {
  const loginRes = await fetch('https://cleanreport-api.onrender.com/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testagent89@example.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.accessToken;

  const res = await fetch('https://cleanreport-api.onrender.com/api/v1/rewards', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
