import type { APIRoute } from "astro";
import { API_URL } from "@Configs/constants";
import { db, Person, User } from "astro:db";
import { generateUserId, hashPassword } from "@Lib/auth";

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        // get user from API
        const dsUser = await fetch(`${API_URL}/api/user/migrate?term=${data.userName}`)
            .then((res) => res.json());
        const hashedPassword = await hashPassword(data.password);
        if (dsUser.length > 0) {
            let userName = "", userLastName = "";
            const userPersonName = dsUser[0].name.split(" ");
            if (userPersonName.length == 1) {
                userName = userPersonName[0];
            } else if (userPersonName.length == 2) {
                userName = userPersonName[0];
                userLastName = userPersonName[1];
            } else if (userPersonName.length == 3) {
                userName = userPersonName[0];
                userLastName = userPersonName[1] + " " + userPersonName[2];
            } else if (userPersonName.length == 4) {
                userName = userPersonName[0] + " " + userPersonName[1];
                userLastName = userPersonName[2] + " " + userPersonName[3];
            } else {
                userName = userPersonName[0] + " " + userPersonName[1];
                userLastName = userPersonName[2] + " " + userPersonName[3];
            }
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
            if (person !== undefined) {
                const user = await db.insert(User).values({
                    id: generateUserId(),
                    name: dsUser[0].usuario,
                    email: dsUser[0].email,
                    password: hashedPassword,
                    person_id: person[0].id,
                    phone: dsUser[0].phone || '',
                    level: dsUser[0].idNivel,
                    email_verified: false,
                }).returning();
                if (user !== undefined) {
                    const dsapiUser = await fetch(`${API_URL}/api/auth/register/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            name: dsUser[0].usuario,
                            email: dsUser[0].email,
                            password: hashedPassword,
                        }),
                    });
                    return new Response(JSON.stringify({ success: true }), {
                        status: 201,
                        headers: {}
                    });
                }
            }
        }
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