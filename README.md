A simple Next.JS website allow user to upload PDF files, and chat with the content of the PDF files.

Feature | Tech Stack
- Subscription with Stripe | Stripe API
- Database | NeonDB + DrizzleORM (Previously local login with SQLite(Prisma) + Drizzle ORM + Lucia- migrated to NeonDB as Vercel not support SQLite)
- Auth (including Google OAuth) | Lucia
- Chat with PDF files | OpenAI + Pinecone 
- Storage | AWS S3
- Layout | Next.js + Tailwindcss + Sonner (toaster)
- AI/embedding : ChatGPT API / (Support LM Studio)

What's missing:
- Better UI/UX 
- Better routing (i.e. /chat/dashboard)
- Middleware for authentication


Check demo.env for local environment variables.

Big credit to [@Elliott-Chong] (https://github.com/Elliott-Chong) for his excellent tutorial!
ChatPDF:
https://www.youtube.com/watch?v=bZFedu-0emE
Auth (Google Auth)
https://www.youtube.com/watch?v=t-JJgTRf3Ms&t=5685s
(Lucia+Drizzle+NeonDB)
https://github.com/muradbu/lucia-drizzle-neon-example
