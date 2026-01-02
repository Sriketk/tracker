import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  journalEntries: defineTable({
    dateKey: v.string(), // YYYY-MM-DD format
    content: v.any(), // JSONContent from Novel
    updatedAt: v.number(), // timestamp
  })
    .index("by_date", ["dateKey"]),
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(), // YYYY-MM-DD format
    startTime: v.string(), // HH:MM format
    endTime: v.optional(v.string()), // HH:MM format
    location: v.optional(v.string()),
    color: v.string(),
    isRepeating: v.optional(v.boolean()),
    repeatingType: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"))),
    createdAt: v.number(), // timestamp
    updatedAt: v.number(), // timestamp
  })
    .index("by_date", ["date"]),
});

