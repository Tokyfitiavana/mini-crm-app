import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import CallToActionBtn from "./CallToActionBtn";
import Logo from "../Logo";

const VitrineNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#A78BFA] shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo principal */}
          <NavLink to="/" className="flex-shrink-0 flex items-center">
            <Logo className="h-8 w-auto" />
          </NavLink>

          {/* Liens Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `px-4 py-2 font-medium transition duration-150 ${
                  isActive
                    ? "text-white"
                    : "text-white hover:text-gray-200"
                }`
              }
            >
              Se connecter
            </NavLink>

            <CallToActionBtn
              label="Essai gratuit"
              href="/signup"
              className="px-4 py-2"
              variant="secondary" // ou primary selon ton choix
            />
          </div>

          {/* Bouton Menu Mobile */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-200 hover:bg-[#977afc] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="md:hidden bg-[#A78BFA] shadow-inner">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium transition duration-150 ${
                  isActive
                    ? "text-white"
                    : "text-white hover:text-gray-200 hover:bg-[#977afc]"
                }`
              }
              onClick={() => setIsOpen(false)} // fermer menu après clic
            >
              Se connecter
            </NavLink>

            <div className="px-3 py-2">
              <CallToActionBtn
                label="Essai gratuit"
                href="/signup"
                className="w-full"
                variant="secondary"
                onClick={() => setIsOpen(false)} // fermer menu après clic
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default VitrineNav;
