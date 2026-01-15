# Redativo Reviewer

Web frontend for reviewers to evaluate essays and provide detailed feedback based on ENEM competency framework.

## Overview

Redativo Reviewer is a Next.js application that enables qualified reviewers to:
- Browse active themes with pending essays
- Claim essays for review
- Score essays on 5 ENEM competencies (0-200 points each)
- Provide detailed textual feedback
- Track review history

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Forms**: React Hook Form + Zod validation
- **State Management**: React hooks
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- Docker and Docker Compose (for containerized development)
- Access to redativo-api backend

## Getting Started

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Local development
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production:
```bash
# Production backend
NEXT_PUBLIC_API_URL=https://redativo-dev.herokuapp.com
```

### Local Development (Node)

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at http://localhost:3000

### Local Development (Docker)

```bash
# Start the container
docker-compose up

# Or run in detached mode
docker-compose up -d
```

The application will be available at http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
redativo-reviewer/
├── app/                    # Next.js App Router pages
│   ├── home/              # Home page
│   ├── login/             # Login page
│   ├── logout/            # Logout page
│   ├── profile/           # User profile
│   ├── themes/            # Theme and essay review pages
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature-specific components
├── lib/                   # Utility functions and API client
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── public/               # Static assets
└── misc/                 # Docker and deployment configs
```

## Key Features

### Authentication
- Username/password login
- JWT token-based authentication
- Secure token storage

### Essay Review Workflow
1. Browse themes with pending essays
2. Claim an essay for review
3. Score on 5 competencies:
   - Written Portuguese language mastery
   - Theme understanding and application
   - Selection and organization of arguments
   - Demonstration of linguistic knowledge
   - Intervention proposal
4. Provide detailed feedback
5. Submit completed review

### User Interface
- Clean, modern design with shadcn/ui components
- Responsive layout for desktop and tablet
- Dark mode support (via next-themes)
- Toast notifications for user feedback

## API Integration

The frontend communicates with the redativo-api backend through REST endpoints:

- `POST /api/v1/auth/login/` - User authentication
- `GET /api/v1/reviewer/themes/` - List themes with pending essays
- `GET /api/v1/reviewer/themes/{theme_id}/essays/` - List essays for a theme
- `POST /api/v1/reviewer/themes/{theme_id}/essays/{essay_id}/reviews/` - Start a review
- `POST /api/v1/reviewer/themes/{theme_id}/essays/{essay_id}/reviews/{id}/finish/` - Submit review
- `GET /api/v1/reviewer/my-reviews/` - List reviewer's reviews

## Docker Deployment

### Local Development

The included `docker-compose.yml` configures the application for local development:

```yaml
services:
  frontend:
    container_name: redativo-reviewer
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production Deployment

The application is configured for Heroku container deployment via GitHub Actions:

1. Push to `main` branch triggers deployment
2. Production Dockerfile builds optimized Next.js app
3. Environment variables set via Heroku config vars

Required Heroku environment variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL (production: `https://redativo-dev.herokuapp.com`)

## Development Guidelines

### Code Style
- Follow Next.js App Router conventions
- Use TypeScript for type safety
- Prefer functional components with hooks
- Use Tailwind CSS utility classes for styling

### Component Structure
- Keep components small and focused
- Extract reusable UI components to `components/ui/`
- Use proper TypeScript types for props
- Handle loading and error states

### API Calls
- Centralize API client logic in `lib/`
- Handle authentication tokens properly
- Show loading states during requests
- Display user-friendly error messages

## Contributing

1. Create feature branches from `main`
2. Follow existing code style and conventions
3. Test changes locally with Docker
4. Ensure ESLint passes before commit
5. Submit pull requests with clear descriptions

## Related Repositories

- [redativo-api](https://github.com/7ws/redativo-api) - Django REST API backend
- [redativo-writer](https://github.com/7ws/redativo-writer) - Flutter mobile app for writers
- [redativo-docs](https://github.com/7ws/redativo-docs) - Platform documentation

## License

Proprietary - D7 Project
