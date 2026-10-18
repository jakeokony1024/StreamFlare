const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'auth-test-secret-that-is-at-least-32-characters-long';
const app = require('../index');
const User = require('../models/User');

test('login keeps the JWT in an HttpOnly session cookie and exposes no credentials', async (t) => {
    const originalFindOne = User.findOne;
    const originalFindById = User.findById;
    const user = {
        _id: 'test-user-id',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        password: '$2b$10$test-hash-that-must-never-be-returned',
        matchPassword: async (password) => password === 'correct-horse-battery',
    };

    User.findOne = async () => user;
    User.findById = () => ({
        select: async () => ({
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
        }),
    });

    const server = app.listen(0, '127.0.0.1');
    t.after(() => {
        User.findOne = originalFindOne;
        User.findById = originalFindById;
        server.close();
    });

    await new Promise((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
    });
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const loginResponse = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: 'correct-horse-battery' }),
    });

    assert.equal(loginResponse.status, 200);
    const loginBody = await loginResponse.json();
    assert.deepEqual(loginBody, {
        user: { id: user._id, first_name: user.first_name, last_name: user.last_name, email: user.email },
    });
    assert.equal(JSON.stringify(loginBody).includes('correct-horse-battery'), false);
    assert.equal(JSON.stringify(loginBody).includes(user.password), false);
    assert.equal(Object.hasOwn(loginBody, 'token'), false);

    const setCookie = loginResponse.headers.get('set-cookie');
    assert.ok(setCookie, 'login should set a session cookie');
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /SameSite=Lax/i);
    assert.match(setCookie, /Path=\//i);
    const cookie = setCookie.split(';', 1)[0];
    assert.match(cookie, /^streamflare_session=.+/);

    const sessionResponse = await fetch(`${baseUrl}/auth/me`, {
        headers: { cookie },
    });
    assert.equal(sessionResponse.status, 200);
    const sessionBody = await sessionResponse.json();
    assert.deepEqual(sessionBody, loginBody);
    assert.equal(JSON.stringify(sessionBody).includes(user.password), false);
});
