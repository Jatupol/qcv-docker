// ===================================
// client/src/pages/BlankPage.tsx
// Coming Soon / Under Development Page

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  RocketLaunchIcon,
  ClockIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const BlankPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Icon with Animation */}
        <div className="mb-8 animate-bounce-slow">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-2xl opacity-50 animate-pulse"></div>
            <div className="relative w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl transform transition-transform hover:scale-110">
              <WrenchScrewdriverIcon className="w-16 h-16 text-white animate-wiggle" />
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center space-x-2 mb-4 px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
            <ClockIcon className="w-5 h-5 text-purple-600 animate-spin-slow" />
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Under Development</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
            Coming Soon
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 mb-6 font-medium">
            We're working hard to bring you something amazing!
          </p>

          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            This feature is currently under active development. Our team is crafting an exceptional experience for you.
            Stay tuned for updates!
          </p>
        </div>

        {/* Features Coming Soon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <RocketLaunchIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Innovative Features</h3>
            <p className="text-sm text-gray-600">Cutting-edge functionality designed for excellence</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animation-delay-200">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Lightning Fast</h3>
            <p className="text-sm text-gray-600">Optimized performance for seamless experience</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animation-delay-400">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Quality Assured</h3>
            <p className="text-sm text-gray-600">Thoroughly tested for reliability and precision</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 hover:from-purple-700 hover:to-pink-700"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="group flex items-center space-x-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border-2 border-purple-200 hover:border-purple-400"
          >
            <HomeIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Go to Dashboard</span>
          </Link>
        </div>

        {/* Progress Indicator */}
        <div className="mt-12 max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Development Progress</span>
              <span className="text-sm font-bold text-purple-600">In Progress</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full animate-progress-bar relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-shimmer"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Our team is actively building this feature</p>
          </div>
        </div>
      </div>

      {/* Custom Animations CSS */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .animate-wiggle {
          animation: wiggle 2s infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
        @keyframes progress-bar {
          0% { width: 0%; }
          100% { width: 75%; }
        }
        .animate-progress-bar {
          animation: progress-bar 2s ease-out forwards;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default BlankPage;