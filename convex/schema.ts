import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Validator for JSONContent from TipTap/Novel editor
 * JSONContent is a recursive structure representing the editor's document structure
 */
const jsonContentValidator = v.union(
  v.object({
    type: v.optional(v.string()), // Optional: node type (e.g., 'doc', 'paragraph', 'heading')
    content: v.optional(v.array(v.any())), // Recursive: array of JSONContent
    attrs: v.optional(v.any()), // Flexible attributes object
    marks: v.optional(v.array(v.any())), // Array of mark objects
    text: v.optional(v.string()), // Text content for text nodes
  }),
  v.null(),
);

export default defineSchema({
  journalEntries: defineTable({
    dateKey: v.string(), // YYYY-MM-DD format
    content: jsonContentValidator, // JSONContent from Novel
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

