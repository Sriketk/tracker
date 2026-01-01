import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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

// Save or update journal entry
export const save = mutation({
  args: {
    dateKey: v.string(),
    content: v.any(),
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

