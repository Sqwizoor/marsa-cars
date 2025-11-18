# 🏁 Car Parts Forum System

A comprehensive, modern forum system built for the Marsa Cars marketplace, designed specifically for car enthusiasts and parts specialists to discuss, share knowledge, and connect.

## 🎯 Features

### Core Forum Functionality
- **Categories & Subforums**: Organized by automotive topics (Engine, Suspension, Brakes, etc.)
- **Thread Management**: Create, edit, delete threads with rich content
- **Nested Replies**: Multi-level comment system with reply threading
- **Advanced Search**: Search across threads and posts with keyword matching
- **Tags System**: Categorize threads with custom tags for better discovery

### User Engagement
- **Reaction System**: 7 types of reactions (Like, Helpful, Thanks, Informative, Funny, Agree, Disagree)
- **Bookmarks**: Save threads for later with personal notes
- **User Profiles**: Dedicated forum profiles showing activity, stats, and badges
- **Reputation System**: Earn reputation points through helpful contributions
- **Badge System**: Achievement badges (Newbie, Member, Veteran, Expert, etc.)

### Forum Statistics
- **User Stats**: Track posts, threads, reputation, helpful count
- **Thread Stats**: Views, reply count, last activity tracking
- **Trending Threads**: Algorithm-based trending content discovery
- **Activity Tracking**: Last active timestamps, engagement metrics

### Moderation & Safety
- **Content Reporting**: Report inappropriate threads and posts
- **Thread Controls**: Pin, lock, feature threads
- **Moderator Roles**: Category-specific moderator permissions
- **Report Management**: Pending reports dashboard for moderators

### Modern UI/UX
- **Responsive Design**: Mobile-first, works on all devices
- **Real-time Feel**: Optimistic updates and smooth interactions
- **Rich Formatting**: Clean typography and content display
- **Visual Hierarchy**: Color-coded categories, status badges
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation

## 📁 Project Structure

```
src/
├── app/
│   ├── (store)/
│   │   └── forum/
│   │       ├── page.tsx                    # Forum homepage
│   │       ├── new/page.tsx                # Create thread
│   │       ├── [category]/page.tsx         # Category view
│   │       ├── thread/[slug]/page.tsx      # Thread detail
│   │       └── user/[id]/page.tsx          # User profile
│   └── api/
│       └── forum/
│           ├── threads/route.ts            # Thread CRUD
│           ├── posts/route.ts              # Post CRUD
│           ├── reactions/route.ts          # Reactions
│           ├── bookmarks/route.ts          # Bookmarks
│           └── search/route.ts             # Search
├── components/
│   └── store/
│       └── forum/
│           ├── category-card.tsx           # Category display
│           ├── thread-card.tsx             # Thread list item
│           ├── post-card.tsx               # Post/reply card
│           ├── reaction-buttons.tsx        # Reaction UI
│           ├── create-thread-form.tsx      # Thread creation
│           └── reply-form.tsx              # Reply form
├── queries/
│   └── forum.ts                            # Server actions & DB queries
└── prisma/
    └── schema.prisma                       # Database models
```

## 🗄️ Database Schema

### Main Models

- **ForumCategory**: Top-level forum categories (Engine, Suspension, etc.)
- **ForumSubforum**: Sub-categories within main categories
- **ForumThread**: Discussion threads with title, content, status
- **ForumPost**: Replies to threads (supports nested replies)
- **ForumReaction**: User reactions to posts (7 types)
- **ForumBookmark**: User-saved threads with notes
- **ForumReport**: Content moderation reports
- **ForumModerator**: Moderator roles and permissions
- **ForumBadge**: User achievement badges
- **ForumUserStats**: Aggregated user statistics

### Key Enums

```typescript
ThreadStatus: OPEN | CLOSED | PINNED | LOCKED
PostStatus: ACTIVE | EDITED | DELETED | HIDDEN
ReactionType: LIKE | HELPFUL | THANKS | INFORMATIVE | FUNNY | AGREE | DISAGREE
BadgeType: NEWBIE | MEMBER | VETERAN | EXPERT | LEGEND | MODERATOR | CONTRIBUTOR
ReportReason: SPAM | HARASSMENT | INAPPROPRIATE | OFF_TOPIC | DUPLICATE
```

## 🚀 Setup & Installation

### 1. Database Migration

The forum tables are created via Prisma migrations:

```bash
npx prisma migrate dev --name add_comprehensive_forum_system
```

### 2. Seed Forum Categories

Populate initial categories and subforums:

```bash
npx tsx seed-forum.ts
```

This creates 10 main categories:
- Engine & Performance (3 subforums)
- Suspension & Handling (2 subforums)
- Brakes & Wheels (2 subforums)
- Exhaust & Intake (2 subforums)
- Electrical & Electronics (2 subforums)
- Exterior & Aerodynamics (2 subforums)
- Interior & Comfort (2 subforums)
- Maintenance & DIY (2 subforums)
- General Discussion (2 subforums)
- Marketplace Discussions (2 subforums)

### 3. Generate Prisma Client

```bash
npx prisma generate
```

## 🎨 UI Components

### CategoryCard
Displays forum categories with:
- Icon and color theming
- Thread/post counts
- Subforum listings
- Quick navigation

### ThreadCard
Shows thread information:
- Title, excerpt, tags
- Author, timestamps
- View/reply counts
- Status badges (pinned, locked)
- Last reply info

### PostCard
Rich post display with:
- Author sidebar (avatar, stats, badges)
- Post content with formatting
- Reaction buttons
- Edit/delete actions (for authors)
- Nested reply threading

### ReactionButtons
Interactive reaction system:
- 7 reaction types with icons
- Real-time count updates
- Visual feedback
- Color-coded reactions

### CreateThreadForm
Comprehensive thread creation:
- Title input with character limit
- Category/subforum selection
- Rich text content area
- Tag management
- Form validation

### ReplyForm
Simple reply interface:
- User avatar display
- Textarea for content
- Post/cancel actions
- Character validation

## 🔧 API Endpoints

### Threads
- `GET /api/forum/threads` - List threads (with filters)
- `POST /api/forum/threads` - Create thread
- `PATCH /api/forum/threads/[id]` - Update thread
- `DELETE /api/forum/threads/[id]` - Delete thread

### Posts
- `GET /api/forum/posts` - Get thread posts
- `POST /api/forum/posts` - Create post/reply
- `PATCH /api/forum/posts/[id]` - Edit post
- `DELETE /api/forum/posts/[id]` - Delete post

### Interactions
- `POST /api/forum/reactions` - Toggle reaction
- `POST /api/forum/bookmarks` - Toggle bookmark
- `GET /api/forum/search` - Search forum

## 📊 Query Functions

All query functions are in `src/queries/forum.ts`:

### Thread Queries
- `getThreads()` - Paginated thread listing with filters
- `getThreadBySlug()` - Single thread with metadata
- `createThread()` - Create new thread
- `updateThread()` - Edit thread
- `deleteThread()` - Remove thread

### Post Queries
- `getPosts()` - Paginated posts for a thread
- `createPost()` - Add reply
- `updatePost()` - Edit post
- `deletePost()` - Remove post

### User Queries
- `getUserForumStats()` - Get user statistics
- `getUserForumActivity()` - Recent threads/posts
- `checkAndAwardBadges()` - Badge system logic

### Utility Queries
- `toggleReaction()` - Add/remove reactions
- `toggleBookmark()` - Save/unsave threads
- `searchForum()` - Search functionality
- `getTrendingThreads()` - Trending content
- `getForumStats()` - Overall forum statistics

## 🎖️ Badge System

Automatic badge awards based on activity:

- **Newbie**: First post
- **Member**: 10+ posts
- **Veteran**: 100+ posts
- **Helper**: 50+ helpful reactions
- **Expert**: 1000+ reputation
- **Contributor**: Active participation
- **Legend**: Top-tier contributor

## 🔐 Permissions

### Regular Users
- Create threads and posts
- React to content
- Bookmark threads
- Edit own content
- Report inappropriate content

### Moderators
- Pin/unpin threads
- Lock/unlock threads
- Feature threads
- Review reports
- Moderate specific categories

### Admins
- Full moderation access
- Assign moderators
- Delete any content
- Access moderation dashboard

## 🎨 Design Inspiration

The forum design draws inspiration from established automotive forums like:
- RennList (Porsche community)
- Modern forum UX patterns
- Clean, card-based layouts
- Mobile-first responsive design

## 📱 Mobile Optimization

- Responsive grid layouts
- Touch-friendly buttons
- Optimized images
- Condensed post cards
- Sticky navigation
- Pull-to-refresh ready

## 🔮 Future Enhancements

### Planned Features
- [ ] Private messaging between users
- [ ] Thread subscriptions/notifications
- [ ] Advanced search with filters
- [ ] Image/video attachments
- [ ] Polls in threads
- [ ] Thread merging/splitting
- [ ] User ignore/block lists
- [ ] Forum analytics dashboard
- [ ] Email notifications
- [ ] RSS feeds per category
- [ ] Markdown editor
- [ ] Code syntax highlighting
- [ ] Thread templates
- [ ] Sticky notes for moderators

### Technical Improvements
- [ ] Elasticsearch integration
- [ ] Real-time updates (WebSocket)
- [ ] Infinite scroll pagination
- [ ] Image compression/CDN
- [ ] Rate limiting
- [ ] Spam detection AI
- [ ] SEO optimization
- [ ] Performance monitoring

## 🎯 Best Practices

### Content Guidelines
1. Be respectful and courteous
2. Stay on topic
3. Use descriptive titles
4. Search before posting
5. Provide details (car model, year, part numbers)
6. Share photos when relevant
7. Mark solved threads

### Moderation Guidelines
1. Review reports promptly
2. Explain moderation actions
3. Give warnings before bans
4. Be consistent and fair
5. Document major decisions

## 📈 Performance

- Optimized database queries with indexes
- Pagination for large result sets
- React Server Components for SSR
- Suspense boundaries for loading states
- Incremental Static Regeneration
- Image optimization with Next.js

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **UI**: Tailwind CSS + shadcn/ui
- **State**: React Server Components
- **API**: Next.js Route Handlers
- **Deployment**: Vercel-ready

## 📝 License

Part of the Marsa Cars marketplace platform.

---

**Built with ❤️ for the car enthusiast community**
