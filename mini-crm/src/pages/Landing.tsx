import React from "react";
import VitrineNav from "../components/ui/VitrineNav";
import CallToActionBtn from "../components/ui/CallToActionBtn";
import DashboardImage from "../assets/laptop.jpeg";

// Icônes simulées
const CheckIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="#A78BFA" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);
const ArrowRightIcon = () => (
  <svg
    className="w-5 h-5 ml-2"
    fill="none"
    stroke="#A78BFA"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M14 5l7 7m0 0l-7 7m7-7H3"
    ></path>
  </svg>
);

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen relative bg-gradient-to-b from-purple-100 via-purple-200 to-purple-300 overflow-hidden">
      {/* Formes abstraites en background */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-green-200 rounded-full opacity-30 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-[700px] h-[700px] bg-purple-300 rounded-full opacity-20 blur-3xl pointer-events-none"></div>

      {/* Navigation */}
      <VitrineNav />

      {/* Section Héro */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Bloc Texte / CTA */}
          <div className="space-y-6">
            <div
              className="inline-flex items-center text-sm font-medium"
              style={{ color: "#A78BFA", backgroundColor: "#EDE5FF" }}
            >
              <CheckIcon />
              CRM Simple et Efficace
            </div>

            <h1 className="text-6xl font-extrabold text-gray-900 leading-tight">
              Gérez vos clients en toute{" "}
              <span className="text-purple-700">simplicité</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-lg">
              Le Mini CRM conçu spécialement pour les commerçants. Suivez vos
              clients, planifiez vos relances et boostez votre activité.
            </p>

            <div className="flex items-center space-x-4 pt-4">
              <CallToActionBtn
                label="Démarrer gratuitement"
                icon={<ArrowRightIcon />}
                onClick={() => console.log("Démarrer l'essai")}
                href="/signup"
                variant="primary" // Assurez-vous que le bouton utilise violet si défini dans CallToActionBtn
              />
            </div>

            {/* Chiffres Clés */}
            <div className="flex space-x-12 pt-8">
              <div>
                <p className="text-4xl font-bold text-gray-900">500+</p>
                <p className="text-gray-500">Commerçants actifs</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-gray-900">98%</p>
                <p className="text-gray-500">Satisfaction client</p>
              </div>
            </div>
          </div>

          {/* Bloc Image / Laptop */}
          <div className="relative flex justify-center p-8">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-1 overflow-hidden w-full max-w-lg mx-auto transform rotate-1">
              <div className="bg-gray-900 rounded-lg p-2">
                <img
                  src={DashboardImage}
                  alt="Capture d'écran du tableau de bord Mini CRM"
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="absolute inset-x-0 bottom-[-1rem] h-4 bg-gray-700 rounded-b-xl shadow-inner z-[-1]"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="mt-auto"
        style={{ backgroundColor: "#A78BFA", color: "#FFFFFF" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-3 gap-8">
          {/* Colonne 1 : Logo + description */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Apex CRM</h3>
            <p>
              Le Mini CRM pour les commerçants qui veulent suivre facilement
              leurs clients et booster leur activité.
            </p>
          </div>

          {/* Colonne 3 : Contact */}
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Contact</h4>
            <p>
              Email:{" "}
              <a href="mailto:support@apexcrm.com" className="hover:opacity-80">
                support@apexcrm.com
              </a>
            </p>
            <p>
              Téléphone:{" "}
              <a href="tel:+261123456789" className="hover:opacity-80">
                +261 12 345 6789
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-purple-300 mt-8 pt-6 text-center text-sm">
          &copy; {new Date().getFullYear()} Apex CRM. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
