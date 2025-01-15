import type { APIRoute } from "astro";
import { authenticateUser, comparePasswords, generateUserId, generateSignature, saveApiToken } from "../../../lib/auth";
import { createSession, setSessionCookie } from '../../../lib/session';
import { API_URL } from "@Configs/constants";

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.json();
        const email = formData.terms;
        const userName = formData.terms;
        const password = formData.password;

        if (!email || !userName || !password) {
            return new Response(JSON.stringify({ error: 'Email and password are required' }), { status: 400 });
        } else {
            const user = await authenticateUser(email, userName, password);
            if (!user) {
                return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 400 });
            } else {
                const isValidPassword = await comparePasswords(password, user.password);
                if (!isValidPassword) {
                    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 400 });
                } else {
                    // Generate signature
                    const signature = await generateSignature(user.name);
                    // Create session
                    const sessionToken = await createSession({
                        id: user.id,
                        level: user.level,
                        signature: signature
                    });
                    const cookie = setSessionCookie(sessionToken);
                    // Login user on API
                    const apiToken = await fetch(`${API_URL}/auth/login`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            name: userName,
                            email: email,
                            password: password
                        }),
                    }).then(res => res.json());
                    if (!apiToken) throw new Error("Failed to login user on API");
                    const token = apiToken.token;
                    saveApiToken(user.id, token);
                    return new Response(
                        JSON.stringify({ success: true, cookie }),
                        {
                            status: 201,
                            headers: {
                                'content-type': 'application/json',
                                'set-cookie': cookie
                            },
                        });
                }
            }
        }
        //return new Response(JSON.stringify({error: "Something went wrong, please try again later"}),{status:500});
    } catch (e) {
        console.error("Error: ", e);
        return new Response(
            JSON.stringify({ error: 'An error occurred during login' }),
            { status: 400, statusText: "Invalid email or password", headers: { "content-type": "application/json" } });
    }
}
