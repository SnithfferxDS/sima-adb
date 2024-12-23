import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const server = {
    addToCart: defineAction({
        input: z.object({ productId: z.string() }),
        handler: async (input, context) => {
            const cart = await context.session.get("cart");
            cart.push(input.productId);
            await context.session.set("cart", cart);
            return cart;
        },
    }),
};