# RRise Project Audit & Documentation

## 1. Project Overview

**Project Name:** RRise  
**Version:** 0.1.0  
**Purpose:** Premium personal development workspace  
**Core Mission:** Bridge the gap between knowing what to do and actually doing it  
**Main User Journey:** Landing page → Features → Sign in → Dashboard (habits, tasks, spending, chat)  
**Product Positioning:** AI-powered personal growth companion with evolving mascot, habit tracking, goal management, and financial tracking

---

## 2. Tech Stack Analysis

### Core Framework
- **Next.js:** 16.2.9 (App Router)
- **React:** 19.2.4
- **TypeScript:** v5

### Styling & UI
- **Tailwind CSS:** v4 (PostCSS)
- **Framer Motion:** 12.40.0 (Animations)
- **Lucide React:** 1.18.0 (Icons)
- **Custom Fonts:** Monument Extended, Clash Display, Inter, Space Grotesk

### Data & State
- **State Management:** React Context (ThemeContext)
- **No Database:** Currently using mock data
- **No Authentication:** Currently no auth system

### Additional Libraries
- **clsx:** 2.1.1 (Conditional classes)
- **tailwind-merge:** 3.6.0 (Tailwind class merging)
- **lottie-react:** 2.4.1 (Lottie animations)
- **recharts:** 3.8.1 (Charts)

### Development
- **ESLint:** v9
- **Node:** v20
- **Deployment:** Not specified (likely Vercel)

---

## 3. Folder Structure

```
rrise/
├─ public/
│  ├─ images/          # Static images (logos, assets)
│  ├─ lottie/          # Lottie animation files
│  ├─ mascots/         # Mascot assets
│  └─ sounds/          # Audio files
├─ src/
│  ├─ app/             # Next.js App Router pages
│  │  ├─ about/        # About page
│  │  ├─ app/          # Main application (dashboard)
│  │  │  ├─ chat/      # AI chat interface
│  │  │  ├─ dashboard/ # Main dashboard
│  │  │  ├─ habits/    # Habit tracking
│  │  │  ├─ history/   # User history
│  │  │  ├─ loop/      # Loop feature
│  │  │  ├─ settings/  # User settings
│  │  │  ├─ spending/  # Finance tracking
│  │  │  └─ tasks/     # Task management
│  │  ├─ contact/      # Contact page
│  │  ├─ features/     # Features showcase
│  │  ├─ pricing/      # Pricing page
│  │  ├─ privacy/      # Privacy policy
│  │  ├─ terms/        # Terms of service
│  │  ├─ layout.tsx    # Root layout
│  │  ├─ page.tsx      # Landing page
│  │  └─ globals.css   # Global styles
│  ├─ components/
│  │  ├─ layout/       # Layout components
│  │  │  ├─ Header.tsx # Navigation header
│  │  │  └─ AppLayout.tsx # App layout wrapper
│  │  ├─ mascot/       # Mascot components
│  │  │  ├─ Mascot.tsx # Base mascot
│  │  │  └─ ParrotMascotChat.tsx # Chat mascot
│  │  └─ ui/           # Reusable UI components
│  │     ├─ AnimatedButton.tsx # Premium animated button
│  │     ├─ Button.tsx # Base button
│  │     ├─ Card.tsx   # Base card
│  │     ├─ GlassCard.tsx # Glassmorphic card
│  │     ├─ GradientBackground.tsx # Animated background
│  │     ├─ LottieAnimation.tsx # Lottie wrapper
│  │     └─ ProgressBar.tsx # Progress indicator
│  ├─ contexts/
│  │  └─ ThemeContext.tsx # Theme management
│  ├─ data/
│  │  └─ mock/         # Mock data
│  │     ├─ habits.ts  # Habit mock data
│  │     ├─ spending.ts # Finance mock data
│  │     ├─ tasks.ts   # Task mock data
│  │     ├─ templates.ts # Template data
│  │     └─ user.ts    # User mock data
│  └─ lib/
│     ├─ audioManager.ts # Audio management
│     └─ utils.ts      # Utility functions
├─ docs/               # Documentation (this file)
├─ package.json
├─ tsconfig.json
├─ next.config.ts
├─ postcss.config.mjs
└─ eslint.config.mjs
```

### Folder Explanations

**app/** - Next.js App Router structure containing all pages and routes  
**components/layout/** - Shared layout components (Header, AppLayout)  
**components/mascot/** - Mascot-related components for the AI companion  
**components/ui/** - Reusable UI components (buttons, cards, backgrounds)  
**contexts/** - React Context providers (theme management)  
**data/mock/** - Mock data for development (no real database yet)  
**lib/** - Utility functions and helpers (audio manager, utils)  
**public/** - Static assets (images, animations, sounds)

---

## 4. Component Architecture

### Reusable Components

#### GradientBackground
**Purpose:** Animated gradient mesh background with floating blobs and particles  
**Props:** None  
**Dependencies:** Framer Motion  
**Usage:** Landing page background  
**Features:** Animated mesh, floating blobs, noise texture, particle effects

#### GlassCard
**Purpose:** Premium glassmorphic card with 3D depth and hover effects  
**Props:** children, className, hover (boolean), glow (boolean)  
**Dependencies:** Framer Motion, cn utility  
**Usage:** Feature cards, hero mockup, CTAs  
**Features:** Hover lift, shimmer effect, inner glow, layered depth

#### AnimatedButton
**Purpose:** Premium animated button with pill shape and micro-interactions  
**Props:** children, variant (primary/secondary/glass), size (sm/md/lg), className, href, disabled, onClick  
**Dependencies:** Framer Motion, cn utility  
**Usage:** CTAs throughout the app  
**Features:** Shine effect, glow on hover, scale animations

#### Header
**Purpose:** Navigation header with glassmorphic styling  
**Props:** None (uses usePathname hook)  
**Dependencies:** Framer Motion, ThemeContext, Lucide icons  
**Usage:** All pages  
**Features:** Active pill state, theme toggle, mobile menu, glass backdrop

#### AppLayout
**Purpose:** Layout wrapper for the main application  
**Props:** children  
**Dependencies:** Header  
**Usage:** App routes (/app/*)  
**Features:** Provides consistent layout for dashboard

### Layout System
- Root layout in `app/layout.tsx` with ThemeProvider
- App-specific layout in `app/app/layout.tsx` with AppLayout
- Header component included in both layouts

### Card System
- Base Card component (minimal)
- GlassCard component (premium, glassmorphic)
- Used for feature cards, mockups, CTAs

### Button System
- Base Button component (standard)
- AnimatedButton component (premium, animated)
- Variants: primary, secondary, glass
- Sizes: sm, md, lg

### Navigation System
- Header component with active state
- Mobile menu with AnimatePresence
- Uses usePathname for active route detection

### Animation System
- Framer Motion for all animations
- Scroll-triggered animations with whileInView
- Hover animations (scale, lift, glow)
- Background animations (floating, pulsing)

---

## 5. Design System Audit

### Color Palette

**Dark Mode (Default)**
- Background: #020408
- Foreground: #f0f6ff
- Primary: #00ff87 (Green)
- Secondary: #00e5ff (Cyan)
- Muted: rgba(255, 255, 255, 0.05)
- Border: rgba(255, 255, 255, 0.08)

**Light Mode**
- Background: #f8fafc
- Foreground: #0a1628
- Primary: #00b85a (Darker green)
- Secondary: #0099cc (Darker cyan)
- Muted: rgba(0, 0, 0, 0.04)
- Border: rgba(0, 0, 0, 0.1)

### Typography

**Font Families**
- Monument Extended: Display headings, wordmarks
- Clash Display: Headings, subheadings
- Inter: Body text, UI elements
- Space Grotesk: Monospace, technical text

**Font Sizes**
- Hero: 7xl → 9xl → 10rem (responsive)
- Section headings: 4xl → 5xl
- Card headings: xl → 2xl
- Body: base → lg

### Border Radius System
- Base radius: 1.25rem
- Buttons: full (pill)
- Cards: 3xl (rounded-3xl)
- Small elements: xl

### Shadows
- Glow effects: Custom CSS variables
- Primary glow: 0 0 40px rgba(0, 255, 135, 0.35)
- Secondary glow: 0 0 40px rgba(0, 229, 255, 0.35)
- Combined glow: Multi-layered glow effect

### Spacing Scale
- Standard Tailwind spacing (4px base)
- Section spacing: mt-32, mb-20
- Card padding: p-8 → p-12
- Button padding: px-8 py-3.5

### Glassmorphism Implementation
- Background: rgba(255, 255, 255, 0.03-0.05)
- Backdrop blur: 20-24px
- Border: 1px solid rgba(255, 255, 255, 0.08-0.15)
- Inner glow: Gradient overlays
- Enhanced variant with inset shadows

### Animation Patterns
- Fade-up: opacity 0→1, y 30→0
- Stagger: delay based on index
- Float: translateY animation
- Pulse: opacity animation
- Shimmer: background-position animation
- Hover: scale 1→1.05, y 0→-2

### Responsive Strategy
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Grid: grid-cols-1 → md:grid-cols-3
- Typography: Responsive font sizes
- Padding: Responsive spacing

---

## 6. Animation Audit

### Framer Motion Usage
- **motion.div:** Primary animation component
- **motion.button:** Button animations
- **motion.a:** Link animations
- **AnimatePresence:** Mobile menu transitions
- **layoutId:** Active pill state animation

### Scroll Animations
- **whileInView:** Trigger animations on scroll
- **viewport:** { once: true, margin: "-100px" }
- **initial/whileInView pattern:** opacity 0→1, y 30→0

### Hover Interactions
- **whileHover:** scale 1.05, y -2, rotate effects
- **whileTap:** scale 0.95-0.97
- **Hover groups:** Glow effects, shimmer

### Background Animations
- **Gradient mesh:** Animated position, scale
- **Floating blobs:** x/y movement, scale changes
- **Particles:** y movement, opacity fade
- **Duration:** 18-22s, infinite repeat

### Floating Effects
- **float-animation:** 6s ease-in-out infinite
- **float-animation-delayed:** 8s with 2s delay
- **Range:** translateY 0→-20px

### Transition Systems
- **Spring:** type: "spring", bounce: 0.2, duration: 0.6
- **Ease-out:** duration: 0.6-0.8
- **Linear:** particle movement
- **Custom:** shimmer, pulse, float

---

## 7. Styling Architecture

### Tailwind Configuration
- **Version:** v4 (inline @theme)
- **Custom colors:** Defined in CSS variables
- **Custom fonts:** Monument, Clash, Inter, Space
- **No tailwind.config.json:** Using inline theme

### Global Styles
- **Location:** src/app/globals.css
- **Font imports:** CDN fonts (Monument, Clash, Inter, Space)
- **CSS variables:** Theme colors, glows, surfaces
- **Utility classes:** glass, gradient-text, glow effects

### CSS Modules
- **Not used:** All styling via Tailwind + global CSS
- **Component styles:** Inline Tailwind classes

### Utility Classes
- **glass:** Basic glassmorphism
- **glass-enhanced:** Premium glass with inset shadows
- **gradient-text:** Text gradient
- **glow-green/blue/both:** Box shadow glows
- **float-animation:** Floating effect
- **shimmer-effect:** Shimmer on hover

### Theme Implementation
- **ThemeContext:** React Context for theme state
- **CSS variables:** --background, --foreground, etc.
- **Dark mode:** Default (class-based)
- **Light mode:** .light class
- **Toggle:** Sun/Moon icon in Header

### Dark Mode Implementation
- **Default:** Dark mode active
- **Class-based:** .dark class on html/body
- **CSS variables:** Swapped per theme
- **Background images:** Radial gradients per theme

---

## 8. Page Structure

### Landing Page Hierarchy
1. **Header** - Navigation with glass backdrop
2. **Hero Section**
   - Badge (Early Access)
   - Wordmark (RRise with typing effect)
   - Tagline (Rise. Build. Become.)
   - Subline (Description)
   - CTA Buttons (Start for free, See how it works)
   - Hero Mockup Card (Logo + description)
3. **Features Section**
   - Section heading
   - 3 feature cards (Goals, Analytics, Habits)
4. **Bottom CTA Section** (TO BE REMOVED)

### Section Order
- Hero → Features → (Bottom CTA - remove)

### Navigation Mapping
- / → Landing page
- /features → Features showcase
- /about → About page
- /pricing → Pricing page
- /contact → Contact page
- /app → Main application
- /app/* → App sub-routes

### CTA Flow
- Primary CTAs: /app (Sign in/Start for free)
- Secondary CTAs: /features (Learn more)
- Conversion: Landing → App → Dashboard

### Conversion Flow
1. Landing page (hero CTAs)
2. Features page (detailed info)
3. Sign in button → App
4. Dashboard (main application)

---

## 9. Assets Audit

### Images
- **Location:** public/images/
- **Logo.png:** Main RRise logo
- **RRISE NEW LOGO.png:** Updated logo for header
- Usage: Header, hero mockup

### Logos
- **Logo.png:** Hero section mockup
- **RRISE NEW LOGO.png:** Header navigation

### SVGs
- **Location:** public/
- **file.svg, globe.svg, next.svg, vercel.svg, window.svg:** Default Next.js assets
- **Lucide React:** Icon library (used in components)

### Fonts
- **Monument Extended:** CDN (fonts.cdnfonts.com)
- **Clash Display:** Fontshare API
- **Inter:** Google Fonts
- **Space Grotesk:** Google Fonts

### Icons
- **Lucide React:** Primary icon library
- **Usage:** Header (Menu, X, Sun, Moon), Contact page

### Background Assets
- **No external images:** All backgrounds generated via CSS
- **GradientBackground component:** Animated mesh, blobs, particles
- **CSS gradients:** Radial gradients in globals.css

### Lottie Animations
- **Location:** public/lottie/
- **Usage:** LottieAnimation component
- **Purpose:** Mascot animations, feature demos

### Sounds
- **Location:** public/sounds/
- **Usage:** audioManager.ts
- **Purpose:** UI sounds, notifications

---

## 10. Performance Audit

### Bundle Observations
- **Next.js 16:** Modern, optimized
- **React 19:** Latest version
- **Framer Motion:** 12.40.0 (large library, but necessary)
- **No code splitting:** All components loaded initially
- **No lazy loading:** Images, components loaded eagerly

### Large Assets
- **Lottie animations:** Can be large
- **Font files:** CDN-loaded (not bundled)
- **No image optimization:** Using standard img tags

### Animation Costs
- **Framer Motion:** CPU-intensive on scroll
- **Background animations:** Continuous GPU usage
- **Particle system:** 20+ animated elements
- **Recommendation:** Consider reducing particle count

### Optimization Opportunities
- **Image optimization:** Use Next.js Image component
- **Code splitting:** Lazy load non-critical components
- **Animation throttling:** Reduce background animation complexity
- **Font subsetting:** Only load needed font weights

### Lazy Loading Opportunities
- **Feature cards:** Could be lazy loaded
- **Bottom CTA:** Could be lazy loaded
- **Lottie animations:** Load on demand
- **Non-critical components:** Defer loading

---

## 11. Developer Notes

### Important Things Future Developers Should Know

#### Design Philosophy
- **Premium aesthetic:** Glassmorphism, soft gradients, elegant motion
- **Minimal but dynamic:** Clean design with subtle animations
- **3D depth:** Layered cards, perspective, hover lift
- **Dreamy atmosphere:** Soft colors, blur effects, floating elements

#### Architectural Patterns
- **App Router:** Next.js 16 App Router (not Pages Router)
- **Client components:** "use client" directive for interactivity
- **Theme system:** CSS variables + React Context
- **No database:** Currently using mock data
- **No authentication:** No auth system implemented yet

#### Existing Conventions
- **Component naming:** PascalCase for components
- **File naming:** PascalCase for component files
- **Class ordering:** Tailwind classes (responsive first)
- **Animation timing:** Slow, luxurious (0.6-0.8s)
- **Color usage:** Primary (green) for CTAs, Secondary (cyan) for accents

#### Areas to Avoid Modifying
- **Theme system:** CSS variables in globals.css
- **Font imports:** CDN links in globals.css
- **Layout structure:** Root layout and app layout
- **Core components:** Header, AppLayout (used everywhere)

#### Potential Improvement Opportunities
- **Add authentication:** Implement user auth system
- **Add database:** Replace mock data with real database
- **Image optimization:** Use Next.js Image component
- **Code splitting:** Implement lazy loading
- **Performance:** Reduce animation complexity
- **Accessibility:** Add ARIA labels, keyboard navigation
- **Testing:** Add unit tests, E2E tests
- **Error handling:** Add error boundaries, loading states

---

## 12. Future AI Context Section

### AI HANDOFF CONTEXT

#### Project Structure Understanding
This is a Next.js 16 App Router project with a premium glassmorphic design system. The project uses:
- **App Router:** File-based routing in src/app/
- **Client components:** "use client" for interactivity
- **Theme system:** CSS variables + React Context
- **Mock data:** No real database yet
- **No authentication:** No auth system

#### Design Decision Rationale
- **Glassmorphism:** Premium, modern aesthetic with blur effects
- **Soft animations:** Slow, luxurious motion (0.6-0.8s)
- **3D depth:** Layered cards with hover lift and perspective
- **Color scheme:** Green (primary) + Cyan (secondary) on dark background
- **Typography:** Monument (display), Clash (headings), Inter (body)
- **Responsive:** Mobile-first with Tailwind breakpoints

#### Future AI Development Guidelines
When continuing development, maintain these patterns:

**Component Structure:**
- Keep components in appropriate folders (layout, ui, mascot)
- Use "use client" directive for interactive components
- Follow existing naming conventions (PascalCase)
- Use Framer Motion for animations (consistent timing)

**Styling Approach:**
- Use Tailwind CSS for styling
- Leverage existing utility classes (glass, gradient-text, glow)
- Maintain color scheme (primary green, secondary cyan)
- Keep animations slow and elegant (0.6-0.8s duration)

**Design System:**
- Preserve glassmorphism aesthetic
- Maintain 3D depth with hover effects
- Keep spacing consistent (section mt-32, card p-8)
- Use rounded-3xl for cards, full for buttons

**Architecture:**
- Use App Router for new pages
- Keep mock data in src/data/mock/
- Use ThemeContext for theme management
- Maintain responsive patterns (mobile-first)

**Patterns to Maintain:**
- Glassmorphic cards with backdrop-blur
- Animated backgrounds with floating elements
- Premium buttons with shine effects
- Staggered scroll animations
- Active pill state in navigation

**Areas for Expansion:**
- Add authentication system
- Implement real database
- Add more app features (chat, analytics)
- Improve performance (lazy loading, image optimization)
- Add testing suite
- Improve accessibility

#### Critical Constraints
- **Do not change theme system:** CSS variables in globals.css
- **Do not change font imports:** CDN links in globals.css
- **Do not break layout structure:** Root layout and app layout
- **Maintain premium aesthetic:** Keep glassmorphism, soft animations
- **Preserve color scheme:** Primary green, secondary cyan
- **Keep animations elegant:** Slow timing, smooth easing

#### Code Quality Standards
- Use TypeScript for type safety
- Follow existing component patterns
- Maintain consistent naming conventions
- Write clean, readable code
- Add comments for complex logic
- Keep components focused and reusable

#### Testing Before Deployment
- Test all navigation links
- Verify responsive design (mobile, tablet, desktop)
- Check animations are smooth
- Ensure theme toggle works
- Verify all CTAs function correctly
- Test in both light and dark modes

---

**Document Version:** 1.0  
**Last Updated:** 2025-06-15  
**Project Status:** Development (v0.1.0)  
**Next Major Milestone:** Add authentication and real database
