import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate an upload URL for file storage
 * This is used by the client to upload files directly to Convex storage
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get a URL for accessing a stored file
 * Returns a temporary URL that can be used to display the image
 */
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Store file metadata (optional - useful for tracking uploaded files)
 * Can be used to associate files with journal entries or other records
 */
export const saveFileMetadata = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.optional(v.string()),
    fileType: v.string(),
    dateKey: v.optional(v.string()), // Optional: associate with a journal entry
  },
  handler: async (ctx, args) => {
    // For now, we just return the storage ID
    // In the future, we could store metadata in a separate table
    return args.storageId;
  },
});
