const API_URL = 'http://localhost:3000';
const EMAIL = 'test-ratelimit@example.com';
const PASSWORD = 'wrongpassword123';

async function testLoginRateLimit() {
  console.log('开始测试登录限频 (连续请求 6 次，预期第 6 次返回 429 或限频错误)...\n');
  
  for (let i = 1; i <= 6; i++) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    
    let result;
    try {
      result = await res.json();
    } catch (e) {
      result = await res.text();
    }

    if (res.status === 429) {
      console.log(`✅ 第 ${i} 次请求: ` + '限频触发生效！Status: 429', result);
    } else {
      console.log(`第 ${i} 次请求: ` + `Status ${res.status}`, result);
    }
  }
}

testLoginRateLimit()
  .then(() => console.log('\n测试完成'))
  .catch(console.error);
