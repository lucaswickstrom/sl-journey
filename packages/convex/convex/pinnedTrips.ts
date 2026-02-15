import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
	args: {
		userId: v.id("users"),
		lineNumber: v.string(),
		fromStation: v.string(),
		toStation: v.string(),
		order: v.number(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("pinnedTrips", {
			userId: args.userId,
			lineNumber: args.lineNumber,
			fromStation: args.fromStation,
			toStation: args.toStation,
			order: args.order,
		});
	},
});

export const listByUser = query({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("pinnedTrips")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.collect();
	},
});

export const update = mutation({
	args: {
		id: v.id("pinnedTrips"),
		lineNumber: v.optional(v.string()),
		fromStation: v.optional(v.string()),
		toStation: v.optional(v.string()),
		order: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args;
		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([, v]) => v !== undefined),
		);
		await ctx.db.patch(id, filteredUpdates);
	},
});

export const remove = mutation({
	args: { id: v.id("pinnedTrips") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	},
});

export const reorder = mutation({
	args: {
		userId: v.id("users"),
		orderedIds: v.array(v.id("pinnedTrips")),
	},
	handler: async (ctx, args) => {
		for (let i = 0; i < args.orderedIds.length; i++) {
			await ctx.db.patch(args.orderedIds[i], { order: i });
		}
	},
});
