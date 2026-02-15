import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
	args: {
		ticketId: v.id("tickets"),
		deviceId: v.string(),
		location: v.object({
			lat: v.number(),
			lng: v.number(),
		}),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("ticketUsages", {
			ticketId: args.ticketId,
			deviceId: args.deviceId,
			location: args.location,
		});
	},
});

export const listByTicket = query({
	args: { ticketId: v.id("tickets") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("ticketUsages")
			.withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
			.order("desc")
			.collect();
	},
});

export const listByDevice = query({
	args: { deviceId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("ticketUsages")
			.withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
			.order("desc")
			.collect();
	},
});

export const getRecentByTicket = query({
	args: {
		ticketId: v.id("tickets"),
		sinceMs: v.number(),
	},
	handler: async (ctx, args) => {
		const cutoff = Date.now() - args.sinceMs;
		const usages = await ctx.db
			.query("ticketUsages")
			.withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
			.order("desc")
			.collect();

		return usages.filter((usage) => usage._creationTime > cutoff);
	},
});
