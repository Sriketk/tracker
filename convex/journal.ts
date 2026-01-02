import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Validator for JSONContent from TipTap/Novel editor
 * JSONContent is a recursive structure, so we validate it as a flexible object
 * that matches the TipTap JSON format
 */
const jsonContentValidator = v.union(
  v.object({
    type: v.string(),
    content: v.optional(v.array(v.any())), // Recursive: array of JSONContent
    attrs: v.optional(v.any()), // Flexible attributes object
    marks: v.optional(v.array(v.any())), // Array of mark objects
    text: v.optional(v.string()), // Text content for text nodes
  }),
  v.null(),
);

// Get journal entry for a specific date
export const get = query({
  args: {
    dateKey: v.string(),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("journalEntries")
      .withIndex("by_date", (q) => q.eq("dateKey", args.dateKey))
      .first();
    
    return entry;
  },
});

// Get journal entries for a date range
export const getByDateRange = query({
  args: {
    startDate: v.string(), // YYYY-MM-DD format
    endDate: v.string(), // YYYY-MM-DD format
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("journalEntries")
      .withIndex("by_date")
      .collect();
    
    // Filter entries within the date range
    const filteredEntries = entries.filter((entry) => {
      return entry.dateKey >= args.startDate && entry.dateKey <= args.endDate;
    });
    
    // Return a map of dateKey -> entry for easy lookup
    const entriesMap: Record<string, { dateKey: string; updatedAt: number }> = {};
    filteredEntries.forEach((entry) => {
      entriesMap[entry.dateKey] = {
        dateKey: entry.dateKey,
        updatedAt: entry.updatedAt,
      };
    });
    
    return entriesMap;
  },
});

// Save or update journal entry
export const save = mutation({
  args: {
    dateKey: v.string(),
    content: jsonContentValidator,
  },
  handler: async (ctx, args) => {
    // Check if entry exists
    const existing = await ctx.db
      .query("journalEntries")
      .withIndex("by_date", (q) => q.eq("dateKey", args.dateKey))
      .first();

    if (existing) {
      // Update existing entry
      await ctx.db.patch(existing._id, {
        content: args.content,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Create new entry
      const id = await ctx.db.insert("journalEntries", {
        dateKey: args.dateKey,
        content: args.content,
        updatedAt: Date.now(),
      });
      return id;
    }
  },
});

