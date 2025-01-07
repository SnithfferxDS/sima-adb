import type { APIRoute } from "astro";
import { db, eq, Person, User } from "astro:db";
import { generateUserId, hashPassword } from "../../../lib/auth.ts";
import { API_URL } from "@Configs/constants.ts";


export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.json();
        const nameSplit = formData.name.split(" ");
        const lastNameSplit = formData.lastname.split(" ");
        if (formData.password !== formData.confirmPassword) {
            return new Response(JSON.stringify({ error: "Passwords do not match" }), { status: 400 });
        } else {
            const existingUser = await db.select().from(User).where(eq(User.email, formData.email)).get();
            if (existingUser) {
                return new Response(JSON.stringify({ error: "Email already exists" }), { status: 400 });
            }

            const hashedPassword = await hashPassword(formData.password);
            const userId = generateUserId();

            const person = await db.insert(Person).values({
                first_name: nameSplit[0],
                second_name: nameSplit[1] ?? '',
                third_name: nameSplit[2] ?? '',
                first_last_name: lastNameSplit[0],
                second_last_name: lastNameSplit[1] ?? '',
                third_last_name: lastNameSplit[2] ?? '',
                email: formData.email,
                phone: formData.phone || '',
            }).returning();
            if (person !== undefined) {
                const user = await db.insert(User).values({
                    id: userId,
                    name: formData.user ?? `${nameSplit[0]}${lastNameSplit[0]}`,
                    email: formData.email,
                    password: hashedPassword,
                    phone: formData.phone || '',
                    person: person[0].id,
                    level: 1,
                    email_verified: false,
                });
                const dsUser = await fetch(`${API_URL}/api/auth/register/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.user ?? `${nameSplit[0]}${lastNameSplit[0]}`,
                        email: formData.email,
                        password: formData.password,
                    }),
                });

                if (!dsUser.ok) {
                    return new Response(JSON.stringify({ success: true, user }), { status: 201 });
                }
            }
        }
        return new Response(JSON.stringify({ error: "Something went wrong, please try again later" }), { status: 500 });
    } catch (error) {
        console.error('Error creating User:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to create User' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}