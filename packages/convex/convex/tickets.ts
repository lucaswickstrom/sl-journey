import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("tickets").collect();
	},
});

export const getById = query({
	args: { id: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("tickets")
			.withIndex("by_id", (q) => q.eq("id", args.id))
			.unique();
	},
});

export const get = query({
	args: { id: v.id("tickets") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});
