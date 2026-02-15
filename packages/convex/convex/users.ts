import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.insert("users", {});
	},
});

export const get = query({
	args: { id: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});
