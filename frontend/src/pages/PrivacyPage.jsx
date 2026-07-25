import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white-bg font-body flex flex-col justify-between">
      <div>
        <AppNavbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-black mb-6">
            Privacy Policy
          </h1>
          <div className="prose prose-sm sm:prose-base text-paragraph max-w-none">
            <p className="mb-4">
              At CleanReport, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.
            </p>
            <h2 className="text-xl font-bold text-black mt-8 mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              We collect information you provide directly to us, such as when you create an account, submit a report, or communicate with us. This may include your name, email address, location data, and photos you upload.
            </p>
            <h2 className="text-xl font-bold text-black mt-8 mb-4">2. How We Use Information</h2>
            <p className="mb-4">
              We use the information we collect to provide, maintain, and improve our services, communicate with you, and facilitate the resolution of environmental issues you report.
            </p>
            <h2 className="text-xl font-bold text-black mt-8 mb-4">3. Data Sharing</h2>
            <p className="mb-4">
              We may share your reports (including location and photos) with relevant municipal authorities or partner organizations responsible for waste management. We do not sell your personal data to third parties.
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
