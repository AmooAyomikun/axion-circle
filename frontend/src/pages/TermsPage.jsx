import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white-bg font-body flex flex-col justify-between">
      <div>
        <AppNavbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-black mb-6">
            Terms of Service
          </h1>
          <div className="prose prose-sm sm:prose-base text-paragraph max-w-none">
            <p className="mb-4">
              Welcome to CleanReport. By accessing or using our platform, you agree to be bound by these Terms of Service.
            </p>
            <h2 className="text-xl font-bold text-black mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By registering an account and using the CleanReport services, you accept and agree to these terms. If you do not agree, please do not use the service.
            </p>
            <h2 className="text-xl font-bold text-black mt-8 mb-4">2. User Conduct</h2>
            <p className="mb-4">
              You agree to use the platform only for lawful purposes. You are responsible for ensuring that the reports and content you submit are accurate and do not violate any local laws or regulations.
            </p>
            <h2 className="text-xl font-bold text-black mt-8 mb-4">3. Account Responsibilities</h2>
            <p className="mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
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
