
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyConsultationButton from '@/components/StickyConsultationButton.jsx';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop';

const CATEGORIES = [
  'All',
  'Canada Immigration',
  'Australia Immigration',
  'Work Permits',
  'Permanent Residency',
  'Business Immigration',
  'Skilled Migration',
  'Immigration News',
  'Visa Updates',
  'Success Stories',
  'Immigration Tips',
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch (_) { return dateStr; }
}

/* ──────────────────────────────────────────────────────────
   Featured Gallery Header — shows the 3 newest posts
────────────────────────────────────────────────────────── */
function FeaturedGallery({ posts }) {
  if (posts.length === 0) return null;
  const [hero, ...rest] = posts.slice(0, 3);

  return (
    <section className="section-spacing bg-muted border-b border-border">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="gold-rule" />
          <span className="text-accent font-semibold text-sm uppercase tracking-widest">
            Featured Articles
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hero card — spans 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <Link
              to={`/blog/${hero.slug}`}
              className="group relative block overflow-hidden rounded-2xl shadow-xl h-full min-h-[340px] md:min-h-[420px]"
            >
              <img
                src={hero.featuredImage || FALLBACK_IMG}
                alt={hero.imageAlt || hero.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-transparent" />
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest bg-accent text-accent-foreground rounded-full px-3 py-1 mb-3">
                  {hero.category}
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-white leading-snug mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                  {hero.title}
                </h2>
                <p className="text-sm text-white/80 line-clamp-2 mb-4 hidden sm:block">
                  {hero.excerpt}
                </p>
                <div className="flex items-center gap-4 text-white/70 text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {formatDate(hero.publishedDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {hero.readTime} min read
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Side cards — 2 stacked */}
          <div className="flex flex-col gap-6">
            {rest.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * (i + 1) }}
                className="flex-1"
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl shadow-lg h-full min-h-[180px]"
                >
                  <img
                    src={post.featuredImage || FALLBACK_IMG}
                    alt={post.imageAlt || post.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
                  <div className="relative mt-auto p-5">
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest bg-accent text-accent-foreground rounded-full px-2.5 py-0.5 mb-2">
                      {post.category}
                    </span>
                    <h3 className="text-sm md:text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-3 text-white/70 text-xs mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDate(post.publishedDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {post.readTime} min
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Main BlogPage
────────────────────────────────────────────────────────── */
function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/blog.json?_=' + Date.now(), { cache: 'no-store' });
        const data = await res.json();
        const today = new Date().toISOString().slice(0, 10);
        const visible = (data.posts || [])
          .filter((p) => !p.draft && (!p.publishedDate || p.publishedDate <= today))
          .sort((a, b) => (b.publishedDate || '').localeCompare(a.publishedDate || ''));
        setPosts(visible);
      } catch (err) {
        console.error('Error loading blog posts:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      (post.title || '').toLowerCase().includes(q) ||
      (post.excerpt || '').toLowerCase().includes(q);
    const matchCat = selectedCategory === 'All' || post.category === selectedCategory;
    return matchSearch && matchCat;
  });

  /* Posts that appear in the gallery should NOT be shown again in the grid
     when no filter/search is active */
  const galleryPosts = !searchQuery && selectedCategory === 'All' ? posts.slice(0, 3) : [];
  const gallerySlugs = new Set(galleryPosts.map((p) => p.slug));
  const gridPosts =
    !searchQuery && selectedCategory === 'All'
      ? filteredPosts.filter((p) => !gallerySlugs.has(p.slug))
      : filteredPosts;

  return (
    <>
      <Helmet>
        <title>Immigration Blog &amp; Insights — iMigrate Migration Solutions</title>
        <meta
          name="description"
          content="Expert immigration guides, visa news and success stories for Australia and Canada — from Malaysia, Singapore, India and Vietnam to your new home."
        />
        <meta
          name="keywords"
          content="immigration blog, Australia visa news, Canada immigration guide, Express Entry, skilled migration, C11 work permit, study permit"
        />
        <link rel="canonical" href="https://www.imigratesolution.com/blog" />
        <meta property="og:title" content="Immigration Blog & Insights — iMigrate Migration Solutions" />
        <meta property="og:description" content="Expert immigration guides, visa news and success stories for Australia and Canada — from Malaysia, Singapore, India and Vietnam to your new home." />
        <meta property="og:url" content="https://www.imigratesolution.com/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.imigratesolution.com/images/imigrate-logo.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.imigratesolution.com/" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.imigratesolution.com/blog" }
          ]
        })}</script>
      </Helmet>

      <Header />
      <StickyConsultationButton />

      <main className="bg-background min-h-screen">
        {/* ── Page Hero ─────────────────────────────────── */}
        <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&auto=format&fit=crop"
              alt="Immigration insights and blog"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-primary/80" />
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="gold-rule mb-5" />
              <h1 className="heading-display mb-4">Immigration Insights</h1>
              <p className="text-xl opacity-90">
                Expert guides, visa updates and success stories for your journey to Australia and Canada.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Featured Gallery ──────────────────────────── */}
        {!loading && <FeaturedGallery posts={galleryPosts} />}
        {loading && (
          <section className="section-spacing bg-muted">
            <div className="container-custom">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
                <div className="flex flex-col gap-6">
                  <Skeleton className="flex-1 h-44 rounded-2xl" />
                  <Skeleton className="flex-1 h-44 rounded-2xl" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── All Articles grid + sidebar ───────────────── */}
        <section className="section-spacing">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Mobile filters */}
                <div className="mb-8 lg:hidden space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search articles…"
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex overflow-x-auto pb-2 gap-2">
                    {CATEGORIES.map((cat) => (
                      <Button
                        key={cat}
                        variant={selectedCategory === cat ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(cat)}
                        className="whitespace-nowrap"
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Section heading when showing all */}
                {!searchQuery && selectedCategory === 'All' && !loading && gridPosts.length > 0 && (
                  <div className="flex items-center gap-3 mb-8">
                    <BookOpen className="h-5 w-5 text-accent" />
                    <h2 className="text-2xl font-semibold text-primary">All Articles</h2>
                  </div>
                )}

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-4">
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : gridPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {gridPosts.map((post, idx) => (
                      <motion.article
                        key={post.slug}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.04 }}
                        className="group flex flex-col h-full"
                      >
                        <Link
                          to={`/blog/${post.slug}`}
                          className="block overflow-hidden rounded-2xl mb-4 bg-muted"
                        >
                          <img
                            src={post.featuredImage || FALLBACK_IMG}
                            alt={post.imageAlt || post.title}
                            className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => { e.target.src = FALLBACK_IMG; }}
                          />
                        </Link>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="text-primary font-medium">{post.category}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {formatDate(post.publishedDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {post.readTime} min
                          </span>
                        </div>
                        <Link to={`/blog/${post.slug}`} className="flex-grow">
                          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                          {post.excerpt}
                        </p>
                        <Link
                          to={`/blog/${post.slug}`}
                          className="inline-flex items-center text-primary text-sm font-medium hover:underline mt-auto"
                        >
                          Read article <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </motion.article>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold mb-2">No articles found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or selecting a different category.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="hidden lg:block space-y-8">
                {/* Search */}
                <Card className="border-border shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Search</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search articles…"
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Categories */}
                <Card className="border-border shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Categories</h3>
                    <ul className="space-y-1">
                      {CATEGORIES.map((cat) => (
                        <li key={cat}>
                          <button
                            onClick={() => setSelectedCategory(cat)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedCategory === cat
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            {cat}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* CTA */}
                <Card className="bg-secondary text-secondary-foreground border-none shadow-lg overflow-hidden">
                  <div className="h-2 bg-accent" />
                  <CardContent className="p-6 text-center">
                    <h3 className="font-bold text-xl mb-2">Need Expert Advice?</h3>
                    <p className="text-sm opacity-90 mb-6">
                      Book a free consultation and get personalised immigration guidance for Australia or Canada.
                    </p>
                    <Button
                      asChild
                      className="w-full bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md hover:shadow-lg"
                    >
                      <Link to="/assessment">Book Free Consultation</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent posts */}
                {posts.length > 3 && (
                  <Card className="border-border shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4">Recent Articles</h3>
                      <ul className="space-y-4">
                        {posts.slice(0, 5).map((post) => (
                          <li key={post.slug}>
                            <Link
                              to={`/blog/${post.slug}`}
                              className="flex gap-3 group"
                            >
                              <img
                                src={post.featuredImage || FALLBACK_IMG}
                                alt={post.title}
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                loading="lazy"
                                onError={(e) => { e.target.src = FALLBACK_IMG; }}
                              />
                              <div>
                                <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                                  {post.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDate(post.publishedDate)}
                                </p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default BlogPage;
