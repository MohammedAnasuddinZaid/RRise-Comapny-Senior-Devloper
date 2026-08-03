# RRise Project Memory

## Theme System Implementation

### Overview
The RRise application now supports 4 themes: Default, Sky, Diva, and Manga. The theme system is built using React Context and CSS variables for smooth transitions and performance optimization.

### Theme Types
1. **Default** - Dark neon theme (original design)
   - Colors: Dark background with green/blue neon accents
   - Fonts: Clash Display (headings), Inter (body)
   - Effects: Glassmorphism, neon glows, smooth animations

2. **Sky** - Blue & white cloudy theme
   - Colors: Light blue background with white semi-transparent cards
   - Fonts: Jim Nightshade (headings), Yellowtail (body)
   - Effects: Cloudy gradients, softer borders, smooth rounded corners

3. **Diva💅🏼** - Pink & light pinkish white theme
   - Colors: Pink background with grainy texture
   - Fonts: Updock (headings), Send Flowers (body)
   - Effects: Grainy texture overlay, smoother borders, pink glows

4. **Manga** - Black & white glow theme
   - Colors: Black background with white glow effects
   - Fonts: Shadows Into Light (headings), Short Stack (body)
   - Effects: Extra white glow around cards, high contrast

### Implementation Details

#### Theme Context (`src/contexts/ThemeContext.tsx`)
- Manages theme state with localStorage persistence
- Provides `theme` and `setTheme` to consuming components
- Supports: 'default' | 'sky' | 'diva' | 'manga'

#### CSS Variables (`src/app/globals.css`)
Each theme defines CSS variables for:
- Colors: background, foreground, card, primary, secondary, muted, accent, border
- Effects: glow-green, glow-blue, glow-both, surface, surface-hover, surface-border
- Typography: font-heading, font-body
- Radius: border-radius values

#### Theme Selector Component (`src/components/ui/ThemeSelector.tsx`)
- Dropdown component for theme selection
- Displays current theme with icon and name
- Shows all available themes with descriptions
- Consistent design across all pages

#### Integration Points
- **Header** (`src/components/layout/Header.tsx`) - Theme selector in navigation
- **Dashboard** (`src/app/app/dashboard/page.tsx`) - Theme selector in dashboard header
- **Settings** (`src/app/app/settings/page.tsx`) - Theme selector in settings panel

### Performance Optimizations

#### Mobile Optimizations
- Reduced backdrop-filter blur from 20px to 12px on mobile
- Disabled noise texture overlay on mobile
- Disabled shimmer effects on mobile
- Reduced animation complexity on mobile

#### Low-End Device Support
- Respects `prefers-reduced-motion` media query
- Disables all transitions and animations for users who prefer reduced motion
- CSS transitions are 0.3s for smooth theme switching

#### Font Loading
- Google Fonts loaded via CSS @import
- All fonts loaded once and cached
- Fallback fonts defined for each theme

### Design Consistency

#### Typography
- Headings use `var(--font-heading)` 
- Body text uses `var(--font-body)`
- Font classes available: .font-monument, .font-clash, .font-inter, .font-space, .font-jim, .font-yellowtail, .font-updock, .font-sendflowers, .font-shadows, .font-shortstack

#### Color System
- All colors use CSS variables for theme consistency
- Primary/secondary colors adapt to each theme
- Muted colors for secondary text
- Border colors for consistent borders

#### Effects
- Glassmorphism: `.glass`, `.glass-enhanced`
- Glows: `.glow-green`, `.glow-blue`, `.glow-both`
- Text gradients: `.gradient-text`

### Backend Integration

#### Admin Panel Settings
The admin panel can manage Stripe-related settings via `system_settings` table:
- `stripe_pro_price` - Pro plan Stripe price ID
- `stripe_ultra_price` - Ultra plan Stripe price ID  
- `stripe_webhook_secret` - Stripe webhook signing secret

Backend systems (checkout API, webhook handler) fetch from database first, then fallback to environment variables.

### Payment Flow

#### Checkout API (`src/app/api/checkout/route.ts`)
- Uses server-side Supabase client with cookie authentication
- Fetches price IDs from `system_settings` table
- Creates Stripe checkout session with proper error handling
- Falls back to environment variables if database values not set

#### Webhook Handler (`src/app/api/webhooks/stripe/route.ts`)
- Verifies webhook signature from `system_settings` or environment
- Maps Stripe price IDs to plans using database settings
- Updates user plans in Supabase profiles table
- Handles subscription events: created, updated, deleted

### Mobile Landing Page Optimization

#### Animation Optimizations
- Mobile viewport detection with 768px breakpoint
- Reduced animation durations by ~40% on mobile
- Removed staggered delays on mobile
- Simplified GradientBackground on mobile (fewer particles, hidden effects)
- Disabled grain texture and shimmer in GlassCard on mobile

#### Performance Techniques
- Conditional rendering based on device type
- Reduced typing animation delay on mobile
- Optimized component re-renders
- Maintained visual design while improving performance

### Important Files

#### Theme System
- `src/contexts/ThemeContext.tsx` - Theme state management
- `src/components/ui/ThemeSelector.tsx` - Theme selection dropdown
- `src/app/globals.css` - Theme CSS variables and styles

#### Integration
- `src/components/layout/Header.tsx` - Navigation with theme selector
- `src/app/app/dashboard/page.tsx` - Dashboard with theme selector
- `src/app/app/settings/page.tsx` - Settings with theme selector

#### Backend
- `src/app/api/checkout/route.ts` - Stripe checkout with database settings
- `src/app/api/webhooks/stripe/route.ts` - Stripe webhook with database settings

#### Optimized Components
- `src/components/ui/GradientBackground.tsx` - Mobile-optimized background
- `src/components/ui/GlassCard.tsx` - Mobile-optimized glass cards
- `src/app/page.tsx` - Mobile-optimized landing page

### Development Notes

#### Adding New Themes
1. Add theme type to ThemeContext
2. Define CSS variables in globals.css
3. Add Google Fonts if needed
4. Add theme to ThemeSelector options
5. Test across all pages and components

#### Testing Checklist
- [ ] Theme switching works smoothly
- [ ] All pages display correctly in each theme
- [ ] Mobile performance is acceptable
- [ ] Text is readable in all themes
- [ ] Animations don't cause lag
- [ ] Low-end device optimizations work
- [ ] Payment flow works with database settings
- [ ] Webhook handler uses database settings

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for webhooks)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (fallback)
- `STRIPE_PRICE_PRO` - Pro plan price ID (fallback)
- `STRIPE_PRICE_ULTRA` - Ultra plan price ID (fallback)
- `NEXT_PUBLIC_APP_URL` - Application URL for redirects

### Database Tables
- `profiles` - User profiles with plan and stripe_customer_id
- `system_settings` - Dynamic settings (prices, webhook secret)
- `api_keys` - User API keys for AI services

### Future Enhancements
- Consider adding theme-specific animations
- Add theme preview in selector
- Implement theme persistence in user profile
- Add custom theme builder
- Consider dark/light variants for each theme
