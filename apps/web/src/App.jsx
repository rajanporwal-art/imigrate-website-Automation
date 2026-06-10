
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';

// Catches any render error and shows it on screen instead of a blank page
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', background: '#fff', color: '#b00' }}>
          <h2>⚠️ Site Error — Please share this with support</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#f8f8f8', padding: '20px', borderRadius: '8px', color: '#333' }}>
            {this.state.error && this.state.error.toString()}
            {'\n\n'}
            {this.state.error && this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
import ScrollToTop from './components/ScrollToTop.jsx';
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import AustraliaMigrationPage from './pages/AustraliaMigrationPage.jsx';
import CanadaMigrationPage from './pages/CanadaMigrationPage.jsx';
import AustraliaVisasPage from './pages/AustraliaVisasPage.jsx';
import CanadaVisasPage from './pages/CanadaVisasPage.jsx';
import AssessmentPage from './pages/AssessmentPage.jsx';
import SuccessStoriesPage from './pages/SuccessStoriesPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import BlogPage from './pages/BlogPage.jsx';
import BlogPostPage from './pages/BlogPostPage.jsx';
import FAQPage from './pages/FAQPage.jsx';
import BookAppointmentPage from './pages/BookAppointmentPage.jsx';
import FormRenderer from './pages/FormRenderer.jsx';
import C11Page from './pages/C11Page.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import { Toaster } from '@/components/ui/sonner';
import { SiteContentProvider } from '@/lib/siteContent.jsx';
import SeoOverride from '@/components/SeoOverride.jsx';
import HubSpotTracking from '@/components/HubSpotTracking.jsx';
import { LeadFormProvider } from '@/components/LeadFormModal.jsx';

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Page not found</p>
        <a
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md hover:shadow-lg rounded-lg font-semibold transition-all duration-200"
        >
          Back to home
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
    <SiteContentProvider>
    <HubSpotTracking />
    <LeadFormProvider>
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/australia-migration" element={<AustraliaMigrationPage />} />
        <Route path="/canada-immigration" element={<CanadaMigrationPage />} />
        <Route path="/australia-visas" element={<AustraliaVisasPage />} />
        <Route path="/canada-visas" element={<CanadaVisasPage />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/success-stories" element={<SuccessStoriesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/book-appointment" element={<BookAppointmentPage />} />
        <Route path="/c11-entrepreneur-work-permit" element={<C11Page />} />
        <Route path="/form/:slug" element={<FormRenderer />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <SeoOverride />
      <Toaster />
    </Router>
    </LeadFormProvider>
    </SiteContentProvider>
    </ErrorBoundary>
  );
}

export default App;
