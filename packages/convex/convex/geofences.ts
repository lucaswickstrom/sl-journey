import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
	args: {
		userId: v.id("users"),
		name: v.string(),
		points: v.array(
			v.object({
				lat: v.number(),
				lng: v.number(),
			}),
		),
		radius: v.number(),
		destinations: v.array(
			v.object({
				stationId: v.string(),
				stationName: v.string(),
			}),
		),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("geofences", {
			userId: args.userId,
			name: args.name,
			points: args.points,
			radius: args.radius,
			destinations: args.destinations,
		});
	},
});

export const listByUser = query({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("geofences")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.collect();
	},
});

export const update = mutation({
	args: {
		id: v.id("geofences"),
		name: v.optional(v.string()),
		points: v.optional(
			v.array(
				v.object({
					lat: v.number(),
					lng: v.number(),
				}),
			),
		),
		radius: v.optional(v.number()),
		destinations: v.optional(
			v.array(
				v.object({
					stationId: v.string(),
					stationName: v.string(),
				}),
			),
		),
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
	args: { id: v.id("geofences") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	},
});
