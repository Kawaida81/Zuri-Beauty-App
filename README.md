# Zuri Beauty Dashboard

A modern admin dashboard for Zuri Beauty, built with Next.js and TypeScript.

## Features

- Modern UI with responsive design
- Real-time sales analytics
- Worker management system
- Inventory control
- Client communication
- Booking management

## Tech Stack

- Next.js 14
- TypeScript
- Styled Components
- Chart.js
- Supabase
- FontAwesome Icons

## Getting Started

1. Clone the repository:
\`\`\`bash
git clone [repository-url]
cd zuri-beauty-dashboard
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a \`.env.local\` file in the root directory and add your environment variables:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

\`\`\`
src/
  ├── app/              # Next.js app directory
  ├── components/       # React components
  │   ├── layouts/     # Layout components
  │   ├── navigation/  # Navigation components
  │   └── ui/          # UI components
  ├── lib/             # Utility functions and configurations
  ├── store/           # State management
  ├── styles/          # Global styles
  └── types/           # TypeScript type definitions
\`\`\`

## Development

- Run tests: \`npm test\`
- Build for production: \`npm run build\`
- Start production server: \`npm start\`
- Lint code: \`npm run lint\`

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is private and confidential. 