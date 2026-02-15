import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const register = mutation({
	args: {
		deviceId: v.string(),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		// Check if device already exists
		const existing = await ctx.db
			.query("devices")
			.withIndex("by_device_id", (q) => q.eq("deviceId", args.deviceId))
			.unique();

		if (existing) {
			return { userId: existing.userId, deviceId: existing._id };
		}

		// Create new user for this device
		const userId = await ctx.db.insert("users", {});

		// Create device
		const deviceDocId = await ctx.db.insert("devices", {
			userId,
			deviceId: args.deviceId,
			name: args.name,
		});

		return { userId, deviceId: deviceDocId };
	},
});

export const getByDeviceId = query({
	args: { deviceId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("devices")
			.withIndex("by_device_id", (q) => q.eq("deviceId", args.deviceId))
			.unique();
	},
});

export const listByUser = query({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("devices")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.collect();
	},
});

export const updateName = mutation({
	args: {
		id: v.id("devices"),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, { name: args.name });
	},
});
