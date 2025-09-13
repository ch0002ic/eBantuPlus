<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# eBantu+ Project Instructions

This is the eBantu+ legal aid application for the SMU LIT Hackathon 2025, developed by Team HashBill.

## Project Overview
- **Purpose**: AI-powered legal automation tool for LAB (Legal Aid Bureau) to automate nafkah iddah and mutaah formula updates
- **Technology**: Next.js 14 with TypeScript, optimized for Vercel deployment
- **Target**: Syariah Court case analysis and automated formula recalibration

## Development Guidelines
- Use Next.js App Router pattern
- Implement TypeScript for type safety
- Follow Vercel deployment best practices
- Integrate OpenAI API for legal text extraction
- Use Prisma ORM for database operations
- Implement proper error handling and validation

## Project Structure
- `/app` - Next.js App Router pages and API routes
- `/components` - Reusable UI components
- `/lib` - Utility functions and configurations
- `/prisma` - Database schema and migrations
- `/types` - TypeScript type definitions

## Key Features to Implement
1. Document upload and processing
2. AI-powered text extraction
3. Human validation dashboard
4. Formula recalibration engine
5. eBantu integration API

## Deployment Target
- Vercel platform with serverless functions
- PostgreSQL database (Vercel Postgres)
- File storage (Vercel Blob)
- Environment variables for API keys

## Legal Domain Context
- Focus on Syariah Court cases
- Extract nafkah iddah and mutaah amounts
- Filter consent orders and outliers
- Maintain audit trails for legal compliance

## Progress Checklist

- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements
- [x] Scaffold the Project
- [x] Customize the Project
- [x] Install Required Extensions
- [x] Compile the Project
- [x] Create and Run Task
- [x] Launch the Project
- [x] Ensure Documentation is Complete