# 🎲 Board Game Remix

**Discover, create, and share innovative board game remixes!**

Board Game Remix is a Next.js web application that allows users to discover, create, and share creative board game modifications. Users can combine multiple games, add custom rules, and share their creations with the community.

![Board Game Remix](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

---

## 🚀 **Live Demo**

**Production URL:** [Coming Soon - Ready for Deployment]

**Development:** `npm run dev` → http://localhost:3000

---

## ✨ **Features**

### **🎯 Core Functionality**
- **Create Remixes**: Design custom board game modifications with multiple games
- **Browse & Discover**: Advanced filtering by games, hashtags, difficulty, and duration
- **Setup Images**: Upload and manage setup photos with descriptions and ordering
- **Video Tutorials**: Embed YouTube videos for detailed remix instructions
- **Voting System**: Community-driven rating with upvote/downvote functionality

### **🔐 Authentication & User Management**
- **Secure Authentication**: Email/password registration and login via Supabase
- **Password Reset**: Complete forgot password flow with email verification
- **User Profiles**: Customizable profiles with username and avatar
- **Session Management**: Persistent authentication with proper security

### **🎨 User Experience**
- **Mobile-First Design**: Fully responsive design optimized for all devices
- **Dark Theme**: Consistent dark theme throughout the application
- **Real-time Search**: Instant search results with autocomplete
- **Drag & Drop**: Intuitive image upload with visual feedback
- **Smart Suggestions**: Hashtag suggestions with duplicate prevention

### **🔗 Integrations**
- **BoardGameGeek API**: Legal integration for game data and images
- **Cloudinary**: Secure image storage and management
- **Google reCAPTCHA**: Bot protection for forms
- **SEO Optimization**: Complete meta tags, structured data, and sitemap

---

## 🛠️ **Technology Stack**

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Component library
- **React Hook Form** - Form management
- **Zustand** - State management

### **Backend**
- **Supabase** - Database, authentication, and real-time features
- **PostgreSQL** - Relational database
- **Row Level Security (RLS)** - Data security policies

### **External Services**
- **Cloudinary** - Image storage and optimization
- **BoardGameGeek API** - Game data and images
- **Google reCAPTCHA** - Bot protection
- **Vercel** - Hosting and deployment

---

## 📦 **Installation**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Supabase account
- Cloudinary account
- Google reCAPTCHA account

### **1. Clone Repository**
```bash
git clone https://github.com/jhrhologix/boardgameRemix.git
cd boardgameRemix
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
nano .env.local
```

### **4. Required Environment Variables**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Configuration
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# reCAPTCHA Configuration (Optional for development)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# BGG API Configuration
BGG_API_BASE_URL=https://boardgamegeek.com/xmlapi2
```

### **5. Database Setup**
```bash
# Run Supabase migrations
npx supabase db push

# Or manually run the SQL files in supabase/migrations/
```

### **6. Start Development Server**
```bash
npm run dev
```

Visit http://localhost:3000 to see the application.

---

## 🗃️ **Database Schema**

### **Core Tables**
- **remixes** - Main remix data with metadata
- **games** - BoardGameGeek game information
- **remix_games** - Many-to-many relationship for games in remixes
- **hashtags** - Tag system for categorization
- **remix_hashtags** - Many-to-many relationship for hashtags
- **profiles** - User profile information
- **favorites** - User favorite remixes
- **user_votes** - Voting system tracking

### **Security**
- **Row Level Security (RLS)** enabled on all tables
- **Authenticated users** can create/edit their own content
- **Public read access** for published remixes
- **Vote protection** prevents duplicate voting

---

## 🚀 **Deployment**

### **Production Deployment Checklist**
See [PRODUCTION-CHECKLIST.md](./PRODUCTION-CHECKLIST.md) for detailed deployment steps.

### **Quick Deployment**
1. **Update environment variables** for production
2. **Configure Supabase** with production URLs
3. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

### **Environment Configuration**
- Update Supabase URLs from localhost to production
- Enable reCAPTCHA with real site keys
- Configure custom domain in Vercel
- Set up monitoring and error tracking

---

## 📁 **Project Structure**

```
boardgameRemix/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── bgg-image/           # BGG image proxy
│   │   ├── upload-setup-image/  # Image upload handler
│   │   └── remix-images/        # Image fetching
│   ├── auth/                    # Authentication pages
│   ├── remixes/                 # Remix pages
│   └── (other pages)/
├── components/                   # React components
│   ├── auth/                    # Authentication components
│   ├── setup-image-upload.tsx   # Image upload component
│   └── (other components)/
├── lib/                         # Utility libraries
│   ├── cloudinary.ts           # Cloudinary integration
│   ├── bgg-api.ts             # BGG API utilities
│   └── seo.ts                 # SEO utilities
├── hooks/                       # Custom React hooks
├── supabase/                    # Database migrations
└── public/                      # Static assets
```

---

## 🔧 **Development**

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### **Code Quality**
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Husky** for git hooks (if configured)

### **Testing**
```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 📚 **Documentation**

### **Technical Documentation**
- [**DEVELOPMENT-SUMMARY.md**](./DEVELOPMENT-SUMMARY.md) - Complete development overview
- [**PRODUCTION-CONFIGURATION.md**](./PRODUCTION-CONFIGURATION.md) - Production setup guide
- [**PRODUCTION-CHECKLIST.md**](./PRODUCTION-CHECKLIST.md) - Deployment checklist
- [**BGG-API-COMPLIANCE.md**](./BGG-API-COMPLIANCE.md) - BGG API compliance guide
- [**REMAINING-TASKS.md**](./REMAINING-TASKS.md) - Future development tasks

### **API Documentation**
- **BGG Image Proxy**: `/api/bgg-image` - Legal BGG image fetching
- **Setup Images**: `/api/upload-setup-image` - Image upload management
- **Remix Images**: `/api/remix-images` - Fetch remix setup images

---

## 🤝 **Contributing**

### **Development Guidelines**
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### **Code Standards**
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write comprehensive comments
- Add proper error handling
- Test all functionality

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **BoardGameGeek** for the comprehensive game database and API
- **Supabase** for the excellent backend-as-a-service platform
- **Vercel** for seamless deployment and hosting
- **Cloudinary** for reliable image management
- **Next.js Team** for the amazing React framework

---

## 📞 **Support**

### **Documentation**
- Check the [documentation files](./) for detailed guides
- Review [PRODUCTION-CONFIGURATION.md](./PRODUCTION-CONFIGURATION.md) for setup issues

### **Issues**
- **Bug Reports**: Open an issue with detailed reproduction steps
- **Feature Requests**: Open an issue with clear description and use case
- **Security Issues**: Contact directly (do not open public issues)

### **Community**
- **Discord**: [Coming Soon]
- **Reddit**: [Coming Soon]
- **Twitter**: [Coming Soon]

---

## 🎯 **Roadmap**

### **Version 1.1 (Planned)**
- [ ] Comments system for remixes
- [ ] User following and activity feeds
- [ ] Advanced search with Elasticsearch
- [ ] Mobile app (React Native)

### **Version 1.2 (Future)**
- [ ] Tournament organization features
- [ ] AI-powered remix recommendations
- [ ] 3D model support for game components
- [ ] Advanced analytics dashboard

---

**Last Updated**: $(date)  
**Version**: 1.0.0  
**Status**: ✅ **Production Ready**

---

<div align="center">

**🎲 Happy Remixing! 🎲**

*Create amazing board game experiences and share them with the world!*

</div>
