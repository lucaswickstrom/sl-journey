import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({}),

	devices: defineTable({
		userId: v.id("users"),
		deviceId: v.string(),
		name: v.string(),
	})
		.index("by_user", ["userId"])
		.index("by_device_id", ["deviceId"]),

	tickets: defineTable({
		id: v.string(),
		appToken: v.string(),
		name: v.string(),
	}).index("by_ticket_id", ["id"]),

	ticketUsages: defineTable({
		ticketId: v.id("tickets"),
		deviceId: v.string(),
		location: v.object({
			lat: v.number(),
			lng: v.number(),
		}),
	})
		.index("by_ticket", ["ticketId"])
		.index("by_device", ["deviceId"]),

	geofences: defineTable({
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
	}).index("by_user", ["userId"]),

	pinnedTrips: defineTable({
		userId: v.id("users"),
		lineNumber: v.string(),
		fromStation: v.string(),
		toStation: v.string(),
		order: v.number(),
	}).index("by_user", ["userId"]),
});
