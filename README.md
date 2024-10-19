A simple Next.JS website allow user to upload PDF files, and chat with the content of the PDF files.

Feature | Tech Stack
- Subscription with Stripe | Stripe API
- Database | NeonDB + DrizzleORM (Previously local login with SQLite(Prisma) + Drizzle ORM + Lucia- migrated to NeonDB as Vercel not support SQLite)
- Auth (including Google OAuth) | Lucia
- Chat with PDF files | OpenAI + Pinecone 
- Storage | AWS S3
- Layout | Next.js + Tailwindcss + Sonner (toaster)

What's missing:
- Better UI/UX (i.e. /chat/dashboard)
- Middleware for authentication
- Upgrade with Real ChatGPT API (Developed by local LLM model - LM Studio)


Check demo.env for local environment variables.