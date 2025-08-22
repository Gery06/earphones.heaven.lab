# 8D Audio Processor Application

## Overview

This is a full-stack web application for processing audio files with 8D spatial audio effects. The application allows users to upload audio files, analyze them for BPM detection, apply customizable 8D audio effects with manual or automatic speed control, and export the processed audio. Built with React on the frontend and Express.js on the backend, it uses modern web audio APIs for real-time audio processing and visualization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming and dark mode support
- **State Management**: React hooks with custom hooks for audio management (`useAudio`) and toast notifications (`useToast`)
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Audio Processing**: Web Audio API integration with custom audio processors and 8D spatial effects

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Build System**: ESBuild for production bundling with tsx for development
- **Storage**: Abstracted storage interface with in-memory implementation and database schema ready for PostgreSQL
- **Development Server**: Vite middleware integration for hot module replacement in development

### Data Storage Solutions
- **Database Schema**: Drizzle ORM with PostgreSQL support configured for user management
- **In-Memory Storage**: Fallback storage implementation using Map-based storage for development
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **File Processing**: Client-side audio file handling with Web Audio API

### Authentication and Authorization
- **Session-based Authentication**: Prepared infrastructure with user schema including username/password fields
- **Storage Interface**: Abstracted user management methods (getUser, getUserByUsername, createUser)
- **Security**: Password hashing and validation schema using Zod

### External Dependencies
- **Database**: Neon Database (serverless PostgreSQL) configured via DATABASE_URL environment variable
- **Audio Processing**: Web Audio API with AudioContext for real-time audio manipulation
- **UI Framework**: Radix UI primitives for accessible component foundation
- **Font Loading**: Google Fonts integration (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **Development Tools**: Replit-specific plugins for error overlay and development banner
- **Form Handling**: React Hook Form with Hookform resolvers for validation
- **Date Utilities**: date-fns for time formatting in audio player
- **Styling**: PostCSS with Autoprefixer for cross-browser CSS compatibility