import type { APIRoute } from "astro";
import { API_URL } from "@Configs/constants";
import { db, Person, User } from "astro:db";
import { generateUserId, hashPassword } from "@Lib/auth";
import { sendRegisterNotification } from "@Actions/email/AuthRegisterNotification";

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        // get user from API
        const dsUser = await fetch(`${API_URL}/users/migrate?terms=${data.userName}`)
            .then((res) => res.json());
        const hashedPassword = await hashPassword(data.password);
        if (dsUser.length > 0) {
            const userPersonName = dsUser[0].name.split(" ");
            const person = await db.insert(Person).values({
                first_name: userPersonName[0],
                second_name: userPersonName[1] ?? '',
                third_name: '',
                first_last_name: userPersonName[2],
                second_last_name: userPersonName[3] ?? '',
                third_last_name: '',
                email: dsUser[0].email,
                phone: dsUser[0].phone || '',
            }).returning();
            if (person) {
                console.log(person[0].id);
                const user = await db.insert(User).values({
                    id: generateUserId(),
                    name: dsUser[0].usuario,
                    email: dsUser[0].email,
                    password: hashedPassword,
                    phone: dsUser[0].phone || '',
                    person: person[0].id,
                    level: dsUser[0].idNivel,
                    email_verified: false,
                }).returning();
                if (user) {
                    const dsapiUser = await fetch(`${API_URL}/auth/register/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            name: dsUser[0].usuario,
                            email: dsUser[0].email,
                            password: data.password,
                        }),
                    });
                    sendRegisterNotification({
                        email: dsUser[0].email,
                        username: dsUser[0].usuario,
                        activationLink: dsapiUser.url
                    })
                } else {
                    throw new Error('Failed to create user');
                }
            } else {
                throw new Error('Failed to create Person');
            }
        } else {
            throw new Error('Failed to retrieve user from DSIN');
        }
        return new Response(JSON.stringify({ success: true }), {
            status: 201,
            headers: {}
        });
    } catch (error) {
        console.log(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: {}
        });
    } finally {
    }
};