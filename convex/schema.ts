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
});

