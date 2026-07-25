import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white-bg font-body flex flex-col justify-between">
      <div>
        <AppNavbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-black mb-6">
            Cookie Policy
          </h1>
          <div className="prose prose-sm sm:prose-base text-paragraph max-w-none">
            <p className="mb-4">
              This Cookie Policy explains how CleanReport uses cookies and similar technologies to recognize you when you visit our platform.
            </p>
            <h2 className="text-xl font-bold text-black mt-8 mb-4">1. What are cookies?</h2>
            <p className="mb-4">
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used in order to make websites work, or work more efficiently, as well as to provide reporting information.
            </p>
            <h2 className="text-xl font-bold text-black mt-8 mb-4">2. Why do we use cookies?</h2>
            <p className="mb-4">
              We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our platform to operate (such as maintaining your login session), and we refer to these as "essential" or "strictly necessary" cookies.
            </p>
            <h2 className="text-xl font-bold text-black mt-8 mb-4">3. Managing cookies</h2>
            <p className="mb-4">
              You have the right to decide whether to accept or reject non-essential cookies. You can set or amend your web browser controls to accept or refuse cookies.
            </p>
            <p className="mt-12 text-sm text-black-placeholder">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
