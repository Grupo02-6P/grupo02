import fetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';

const baseUrl = 'http://127.0.0.1:8000/api/auth'; // altere se necessário

// CookieJar simples
const jar = new CookieJar();

// Função auxiliar para manter cookies manualmente
async function fetchWithCookies(url, options = {}) {
    options.headers = options.headers || {};

    // adiciona cookies do jar no request
    const cookieString = await jar.getCookieString(url);
    if (cookieString) options.headers['cookie'] = cookieString;

    const response = await fetch(url, options);

    // armazena cookies recebidos
    const setCookie = response.headers.raw()['set-cookie'];
    if (setCookie) {
        for (const c of setCookie) {
            await jar.setCookie(c, url);
        }
    }

    return response;
}

// Função para pegar CSRF token
async function getCsrfToken() {
    const response = await fetchWithCookies(`${baseUrl}/csrf/`);
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data.csrfToken;
    } else {
        const text = await response.text();
        console.log('❌ Não foi possível obter CSRF (recebido HTML):', text);
        throw new Error('Falha ao obter CSRF token');
    }
}

// Função de login
async function login(username, password) {
    const csrfToken = await getCsrfToken();
    const response = await fetchWithCookies(`${baseUrl}/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        console.log('✅ Login realizado com sucesso!');
    } else {
        const text = await response.text();
        console.log('❌ Falha no login:', text);
    }
    return response.ok;
}

// Função para testar POST protegido
async function testSecretPost(message) {
    const csrfToken = await getCsrfToken();
    const response = await fetchWithCookies(`${baseUrl}/secret-post/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ message })
    });

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    console.log('Status:', response.status, 'Resposta:', data);
}

// ---------- Fluxo de testes ----------
(async () => {
    console.log('1️⃣ Tentando POST sem login...');
    await testSecretPost('Teste sem login');

    console.log('2️⃣ Realizando login...');
    const success = await login('root', 'root'); // ajuste o usuário/senha
    if (!success) return;

    console.log('3️⃣ Tentando POST após login...');
    await testSecretPost('Teste após login');
})();
