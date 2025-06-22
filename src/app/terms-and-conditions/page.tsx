import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-2">NéMai – Terms and Conditions</h1>
      <p className="text-sm text-gray-500 mb-6">
        <strong>Effective Date:</strong> [Insert Launch Date]
      </p>

      <p className="mb-6">
        Welcome to NéMai! By using our website and services, you agree to the following terms. Please read them carefully.
      </p>

      <hr className="my-6 border-gray-300" />

      <Section title="1. Overview">
        NéMai is an online platform that connects clients with nail artists for beauty and nail services. We offer appointment booking, portfolio browsing, payment facilitation, and more.
      </Section>

      <Section title="2. User Accounts">
        <ul className="list-disc ml-6 space-y-1">
          <li>All users must provide accurate, up-to-date information.</li>
          <li>You are responsible for maintaining confidentiality of your account credentials.</li>
          <li>NéMai reserves the right to suspend or delete accounts violating our policies.</li>
        </ul>
      </Section>

      <Section title="3. Booking & Cancellation">
        <Subsection title="For Clients:">
          <ul className="list-disc ml-6 space-y-1">
            <li>Bookings can be made through the platform with selected artists.</li>
            <li>Cancellations must be done at least 24 hours prior to the appointment to avoid penalties.</li>
            <li>No-shows or last-minute cancellations may lead to partial or full charge.</li>
          </ul>
        </Subsection>
        <Subsection title="For Nail Artists:">
          <ul className="list-disc ml-6 space-y-1">
            <li>Must honor confirmed bookings unless in emergencies.</li>
            <li>Late cancellations or consistent unavailability may result in account review or suspension.</li>
          </ul>
        </Subsection>
      </Section>

      <Section title="4. Payments">
        <ul className="list-disc ml-6 space-y-1">
          <li>All transactions should be completed through the NéMai platform.</li>
          <li>NéMai may charge a small platform fee per transaction in future.</li>
          <li>Artists will receive payments after deducting service/processing fees (if applicable).</li>
        </ul>
      </Section>

      <Section title="5. Artist Responsibilities">
        <ul className="list-disc ml-6 space-y-1">
          <li>Maintain accurate service listings, availability, and pricing.</li>
          <li>Ensure hygiene, professionalism, and safe practices during services.</li>
          <li>Avoid direct dealings with clients outside the platform to ensure security for both parties.</li>
        </ul>
      </Section>

      <Section title="6. Client Responsibilities">
        <ul className="list-disc ml-6 space-y-1">
          <li>Provide accurate contact and booking information.</li>
          <li>Show up on time for appointments.</li>
          <li>Treat artists with respect and professionalism.</li>
        </ul>
      </Section>

      <Section title="7. Dispute Resolution">
        <ul className="list-disc ml-6 space-y-1">
          <li>In case of disputes (e.g., missed appointments, quality concerns), users can report NéMai via call or mail.</li>
          <li>NéMai will mediate and may request evidence (screenshots, photos, chats).</li>
          <li>Final decisions rest with the NéMai admin team after fair review.</li>
        </ul>
      </Section>

      <Section title="8. Prohibited Activities">
        <ul className="list-disc ml-6 space-y-1">
          <li>Sharing offensive, inappropriate, or illegal content.</li>
          <li>Spamming, misrepresentation, or misuse of the platform.</li>
          <li>Bypassing NéMai to book or communicate outside to avoid fees.</li>
        </ul>
      </Section>

      <Section title="9. Content & Intellectual Property">
        <ul className="list-disc ml-6 space-y-1">
          <li>Images, logos, and content on the site are protected.</li>
          <li>Artists can upload portfolio content but must ensure originality or usage rights.</li>
          <li>NéMai may use shared content for marketing.</li>
        </ul>
      </Section>

      <Section title="10. Termination">
        NéMai may terminate accounts violating these terms or engaging in fraudulent behavior.
      </Section>

      <Section title="11. Modifications">
        <ul className="list-disc ml-6 space-y-1">
          <li>NéMai reserves the right to modify these terms at any time.</li>
          <li>Users will be notified of significant changes via email or app notifications.</li>
        </ul>
      </Section>

      <Section title="12. Contact">
        <p>Have questions or concerns?</p>
        <p>📩 <strong>Email:</strong> <a href="mailto:nemaiplatform@gmail.com" className="text-blue-600 underline">nemaiplatform@gmail.com</a></p>
        <p>📞 <strong>Call:</strong> 9909166092</p>
      </Section>

      <p className="mt-10 font-semibold">✅ By using NéMai, you agree to abide by these Terms & Conditions.</p>
    </div>
  );
};

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <div className="text-gray-700">{children}</div>
  </div>
);

const Subsection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mt-4 mb-4">
    <h3 className="text-lg font-medium mb-1">{title}</h3>
    <div>{children}</div>
  </div>
);

export default TermsAndConditions;
