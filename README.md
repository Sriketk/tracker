# Tracker - Notion × Calendar App

A calendar app with Notion-like markdown editing. Click on any date to open a rich markdown editor for that day.

## Tech Stack

- **Next.js 16** - React framework
- **Convex** - Real-time backend
- **Bun** - Package manager & runtime
- **shadcn/ui** - UI components
- **TypeScript** - Type safety

## Getting Started

1. Install dependencies:
   ```bash
   bun install
   ```

2. Set up Convex:
   ```bash
   bunx convex dev
   ```

3. Run the dev server:
   ```bash
   bun run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

- `app/` - Next.js App Router pages
- `components/ui/` - shadcn/ui components
- `convex/` - Backend functions and queries
- `lib/` - Utility functions

## Development

- `bun run dev` - Start dev server
- `bun run build` - Build for production
- `bunx convex dev` - Run Convex backend
