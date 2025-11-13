# Real Estate Portfolio Management

A centralized property data repository for retail investors managing multiple properties. Built with Claude Code.

## Overview

This application serves as a comprehensive property information management system designed for retail real estate investors who need to track multiple properties across different portfolios. Store property details, documents, notes, and transaction history in one organized platform with collaboration capabilities.

## Core Features

### Property Data Management

- **Comprehensive property storage**: Address, ownership details, physical characteristics, valuation data
- **User-managed fields**: Purchase/sale dates and prices, financing details (mortgage amount, lender, rate, maturity), insurance provider, management company, maintenance history
- **Inline editing**: Quick updates to property information directly from the property view
- **Flexible tagging system**: Custom tags for categorizing and organizing properties

### Document Management

- **Full document lifecycle**: Upload, organize, search, preview, and delete property documents
- **10 document types**: Invoice, Receipt, Work Order, Insurance Policy, Tax Document, Lease Agreement, Inspection Report, Property Photo, Floor Plan, Other
- **Rich metadata**: Document title, description, tags, and document date for easy filtering
- **File support**: PDF, PNG, JPG up to 10MB per file
- **Supabase Storage integration**: Secure document storage with signed URL previews

### Portfolio Organization

- **Multi-portfolio support**: Organize properties into separate portfolios for different investment strategies
- **Collaboration system**: Share portfolios with team members via email invitations
- **Role-based permissions**: Owner (full control), Editor (CRUD properties), Viewer (read-only access)
- **Last-used portfolio tracking**: Automatically remembers your most recently accessed portfolio

### Property Visualization

- **Three view modes**: Table view (sortable columns), Card view (compact display), Map view (interactive Mapbox visualization)
- **Full-text search**: Search across property addresses, owners, and user notes
- **Responsive design**: Optimized for desktop and mobile devices
- **Dark mode support**: System-aware theme with manual override

### Authentication & Security

- **Supabase Auth**: Email/password authentication with secure session management
- **Row Level Security (RLS)**: Database-level multi-tenant isolation ensuring users only access their portfolios
- **Protected routes**: Middleware-based authentication for all dashboard pages

## Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui component library
- **State Management**: React Query v5 for server state
- **Form Handling**: React Hook Form with Zod validation
- **Animations**: Framer Motion

### Backend

- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for document uploads
- **API Routes**: Next.js API routes for server-side operations

### External Services

- **Maps**: Mapbox GL JS for interactive property maps
- **Email**: Resend API for portfolio invitation emails

## Architecture

### Database Schema

- **properties**: Core property data with user-managed fields
- **property_documents**: Document metadata linked to properties
- **portfolios**: Portfolio definitions with ownership tracking
- **portfolio_memberships**: User access control with role-based permissions
- **portfolio_invitations**: Email invitation system for portfolio sharing
- **user_education_progress**: Lesson completion tracking (for education features)

### Multi-Tenancy

Row Level Security (RLS) policies enforce strict data isolation:

- Users can only access portfolios they own or have been granted access to
- Properties are filtered by portfolio membership automatically at the database level
- Document uploads are scoped to portfolio_id/property_id paths

## Installation

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Mapbox account (for map features)

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd CRE-Claude
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables (see Environment Variables section below)

4. Run database migrations:

```bash
# Connect to your Supabase project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

5. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Mapbox (for map view)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token

# Google Places API (for address search during property upload)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your-google-places-key

# Email (for portfolio invitations)
RESEND_API_KEY=your-resend-api-key

# Optional: Regrid API (legacy feature, not required)
REGRID_API_TOKEN=your-regrid-token
```

### Supabase Setup

1. Create a new Supabase project
2. Copy the project URL and anon key from Settings > API
3. Generate a service role key from Settings > API (keep this secret)
4. Create a storage bucket named `property-documents` with public access disabled
5. Apply the database migrations from `supabase/migrations/`

### Edge Function Secrets

For portfolio invitation emails to work, add the Resend API key to your Supabase Edge Function:

1. Navigate to Edge Functions > send-portfolio-invitation > Settings
2. Add secret: `RESEND_API_KEY` = your Resend API key

## Development Commands

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint with Next.js configuration
```

## Deprecated Features

### Regrid API Integration

The application originally included automatic property data enrichment via the Regrid API. This feature has been deprecated and is no longer a core part of the application:

- **Status**: Legacy code preserved but not actively maintained
- **Impact**: Properties can still store Regrid data fields for backward compatibility
- **Recommendation**: Use manual data entry for new properties

Database fields related to Regrid (`regrid_id`, `regrid_updated_at`, `property_data`) remain in the schema but are no longer automatically populated.

## Roadmap

### Near-Term Features

**Income & Expense Transaction Tracking**

- Track rental income across 8 categories (rent, parking, storage, late fees, utilities, pet rent, amenities, other)
- Log property expenses across 14 categories (maintenance, taxes, insurance, utilities, HOA, management, etc.)
- Support for recurring transactions (monthly, quarterly, annual)
- Associate transactions with specific units in multi-unit properties
- _Status_: Database schema and UI components exist, pending full integration

**Unit-Level Management**

- Track individual units within multi-unit properties
- Associate income and expenses at the unit level
- Unit-specific details (bedroom count, square footage, tenant information)
- _Status_: Schema defined, components built, needs integration testing

**Recurring Maintenance Scheduling**

- Schedule recurring maintenance tasks (HVAC service, landscaping, inspections)
- Automated reminders and notification system
- Track completion and costs
- _Status_: Planned

### AI Vision (Long-Term)

The ultimate goal is to build an AI-powered property assistant that understands your entire portfolio:

**Natural Language Queries**

- "When did I buy that property on Main Street?"
- "Show me all properties purchased in 2023"
- "Which properties have the highest maintenance costs?"

**Document Intelligence**

- "Find the tax bill for 123 Main St"
- "Do we have documents for the insurance policy expiring this month?"
- "Show me all invoices from Johnson Plumbing"

**Contextual Portfolio Assistant**

- "Who's the insurance provider for my LA properties?"
- "What's my total exposure in San Francisco?"
- "Which properties need roof maintenance this year?"

**Portfolio Insights**

- Automated analysis of portfolio performance
- Proactive recommendations based on market data and property history
- Risk assessment and diversification suggestions
- Predictive maintenance scheduling based on property age and history

**Technical Approach**

- LLM integration (Claude API or OpenAI) with retrieval-augmented generation (RAG)
- Vector embeddings for document search and semantic queries
- Structured data extraction from property documents
- Fine-tuned models on real estate terminology and investment concepts

_Status_: Research phase

## Contributing

This is a personal project, but suggestions and feedback are welcome. Please open an issue to discuss potential changes.

**Built with [Claude Code](https://claude.ai/code)** - Anthropic's AI-powered development tool
