import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all events
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").collect();
  },
});

// Get events for a specific date
export const getByDate = query({
  args: {
    date: v.string(), // YYYY-MM-DD format
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
  },
});

// Get a single event by ID
export const get = query({
  args: {
    id: v.id("events"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new event
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(), // YYYY-MM-DD format
    startTime: v.string(), // HH:MM format
    endTime: v.optional(v.string()), // HH:MM format
    location: v.optional(v.string()),
    color: v.string(),
    isRepeating: v.optional(v.boolean()),
    repeatingType: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("events", {
      title: args.title,
      description: args.description,
      date: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location,
      color: args.color,
      isRepeating: args.isRepeating ?? false,
      repeatingType: args.repeatingType,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

// Update an existing event
export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.string()), // YYYY-MM-DD format
    startTime: v.optional(v.string()), // HH:MM format
    endTime: v.optional(v.string()), // HH:MM format
    location: v.optional(v.string()),
    color: v.optional(v.string()),
    isRepeating: v.optional(v.boolean()),
    repeatingType: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Event not found");
    }
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return id;
  },
});

// Delete an event
export const remove = mutation({
  args: {
    id: v.id("events"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

