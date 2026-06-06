
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Calendar, Clock, User, ArrowLeft, Linkedin, Facebook, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyConsultationButton from '@/components/StickyConsultationButton.jsx';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { mdToHtml } from '@/lib/markdown.js';
import CTABanner from '@/components/CTABanner.jsx';

function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch('/blog.json?_=' + Date.now(), { cache: 'no-store' });
        const data = await res.json();
        const all = data.posts || [];
        const currentPost = all.find((p) => p.slug === slug);

        if (!currentPost) {
          navigate('/blog');
          return;
        }

        setPost(currentPost);

        const related = all
          .filter((p) => p.slug !== currentPost.slug && p.category === currentPost.category && !p.draft)
          .slice(0, 3);
        setRelatedPosts(related);

      } catch (error) {
        console.error('Error loading post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    window.scrollTo(0, 0);
  }, [slug, navigate]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-12 container-custom max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-3/4 mb-8" />
          <Skeleton className="h-[400px] w-full rounded-2xl mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) return null;

  const shareUrl = window.location.href;
  const metaTitle = post.metaTitle || `${post.title} | iMigrate Solutions`;
  const metaDescription = post.metaDescription || post.excerpt || '';
  const canonical = post.canonicalUrl || `https://imigratesolution.com/blog/${post.slug}`;
  const ogImage = post.featuredImage && post.featuredImage.startsWith('http')
    ? post.featuredImage
    : `https://imigratesolution.com${post.featuredImage || '/images/imigrate-logo.jpg'}`;

  // Article structured data for rich results.
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: metaDescription,
    image: ogImage,
    author: { '@type': 'Organization', name: post.author || 'iMigrate Solutions' },
    publisher: {
      '@type': 'Organization',
      name: 'iMigrate Solutions',
      logo: { '@type': 'ImageObject', url: 'https://imigratesolution.com/images/imigrate-logo.jpg' },
    },
    datePublished: post.publishedDate,
    dateModified: post.updatedDate || post.publishedDate,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  };

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        {post.tags && post.tags.length > 0 && (
          <meta name="keywords" content={post.tags.join(', ')} />
        )}
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <Header />
      <StickyConsultationButton />

      <main className="bg-background min-h-screen pb-24">
        <article>
          {/* Article Header */}
          <header className="pt-16 pb-12 container-custom max-w-4xl">
            <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
            </Link>
            
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-balance">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                {post.author || 'iMigrate Team'}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(post.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              {post.readTime && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {post.readTime} min read
                </div>
              )}
            </div>
          </header>

          {/* Featured Image */}
          <div className="container-custom max-w-5xl mb-16">
            <img
              src={post.featuredImage || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop'}
              alt={post.imageAlt || post.title}
              className="w-full h-[400px] md:h-[500px] object-cover rounded-3xl shadow-lg"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop';
              }}
            />
          </div>

          {/* Article Content & Sidebar */}
          <div className="container-custom max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Social Share (Desktop Sidebar) */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-32 flex flex-col space-y-4">
                  <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${post.title}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a href={`https://wa.me/?text=${post.title} ${shareUrl}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-8 prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80">
                <div dangerouslySetInnerHTML={{ __html: mdToHtml(post.content) }} />

                {/* In-article lead-generation CTA */}
                <div className="not-prose my-12">
                  <CTABanner
                    heading="Ready to start your immigration journey?"
                    subheading="Get a free eligibility assessment or book a consultation with an experienced immigration consultant."
                  />
                </div>

                {/* Related service pages */}
                <div className="not-prose mt-8 rounded-2xl border border-border bg-muted/40 p-6">
                  <h3 className="text-lg font-semibold mb-3 text-primary">Explore related services</h3>
                  <div className="flex flex-wrap gap-3">
                    <Link to="/australia-migration" className="px-4 py-2 rounded-full bg-card border border-border text-sm font-medium hover:border-accent hover:text-primary transition-colors">🇦🇺 Australia Migration</Link>
                    <Link to="/canada-immigration" className="px-4 py-2 rounded-full bg-card border border-border text-sm font-medium hover:border-accent hover:text-primary transition-colors">🇨🇦 Canada Immigration</Link>
                    <Link to="/assessment" className="px-4 py-2 rounded-full bg-card border border-border text-sm font-medium hover:border-accent hover:text-primary transition-colors">Free Eligibility Check</Link>
                    <Link to="/faq" className="px-4 py-2 rounded-full bg-card border border-border text-sm font-medium hover:border-accent hover:text-primary transition-colors">Immigration FAQs</Link>
                  </div>
                </div>

                {/* Mobile Social Share */}
                <div className="mt-12 pt-8 border-t border-border lg:hidden">
                  <h3 className="text-lg font-semibold mb-4">Share this article</h3>
                  <div className="flex space-x-4">
                    <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${post.title}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Facebook className="h-4 w-4" />
                    </a>
                    <a href={`https://wa.me/?text=${post.title} ${shareUrl}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="lg:col-span-3 space-y-8">
                <div className="bg-secondary text-secondary-foreground p-6 rounded-2xl shadow-lg">
                  <h3 className="font-semibold text-xl mb-3">Ready to apply?</h3>
                  <p className="text-sm opacity-90 mb-6">
                    Get expert guidance tailored to your specific situation.
                  </p>
                  <Button asChild className="w-full bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md hover:shadow-lg">
                    <Link to="/book-appointment">Book Free Consultation</Link>
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-border bg-muted/30">
            <div className="container-custom">
              <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((related) => (
                  <Link key={related.slug} to={`/blog/${related.slug}`} className="group block">
                    <div className="overflow-hidden rounded-xl mb-4">
                      <img
                        src={related.featuredImage || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop'}
                        alt={related.title}
                        loading="lazy"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop'; }}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {related.title}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> {new Date(related.publishedDate).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

export default BlogPostPage;
