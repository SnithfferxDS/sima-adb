import type { APIRoute} from "astro";
import {db, eq, or, Person, User} from "astro:db";
import {authenticateUser, comparePasswords, generateUserId, hashPassword} from "../../../lib/auth";
import { createSession, setSessionCookie, generateCsrfToken, setCsrfCookie } from '../../../lib/session';

export const POST: APIRoute = async ({ request })=>{
    try {
        const formData = await request.json();
        const email = formData.terms;
        const userName= formData.terms;
        const password = formData.password;

        if (!email || !userName || !password) {
            return new Response(JSON.stringify({ error: 'Email and password are required'}), { status: 400 });
        } else {
            const user = await authenticateUser(email,userName,password);
            if (!user) {
                return new Response(JSON.stringify({ error:'Invalid email or password'}), { status: 400 });
            } else {
                const isValidPassword = await comparePasswords(password, user.password);
                if (!isValidPassword) {
                    return new Response(JSON.stringify({ error: 'Invalid email or password'}), { status: 400 });
                } else {
                    // Create session
                    const sessionToken = await createSession({
                        userId: user.id,
                        email: user.email,
                        name: user.name
                    });
                    const cookie = setSessionCookie(sessionToken);
                    return new Response(
                        JSON.stringify({success: true, cookie}),
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
        console.error("Error: ",e);
        return new Response(
            JSON.stringify({error:'An error occurred during login'}),
            { status: 400, statusText: "Invalid email or password", headers: { "content-type": "application/json" } });
    }
}
