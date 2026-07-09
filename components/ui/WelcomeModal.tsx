'use client';

import React, { useState, useEffect } from 'react';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has seen the welcome modal before
    const hasSeenWelcome = localStorage.getItem('govvault_has_seen_welcome');
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('govvault_has_seen_welcome', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Welcome to GovVault! 🏛️
        </h2>
        
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <p>
            GovVault is a decentralized governance platform built on Stellar Soroban, designed to prevent whale dominance using <strong>Quadratic Voting</strong>.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How Quadratic Voting Works:</h3>
            <p className="text-sm">
              Instead of 1 Token = 1 Vote, we use <strong>Cost = Votes²</strong>.
            </p>
            <ul className="list-disc ml-5 mt-2 text-sm space-y-1">
              <li>1 Vote costs 1 Token</li>
              <li>2 Votes cost 4 Tokens</li>
              <li>5 Votes cost 25 Tokens</li>
            </ul>
            <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
              This mathematical curve makes it exponentially expensive for wealthy individuals to buy elections, ensuring fair community consensus.
            </p>
          </div>

          <p className="text-sm border-l-4 border-indigo-500 pl-3">
            <strong>Getting Started:</strong> Connect your Freighter wallet and make sure you are on the Stellar Testnet. You can request Testnet XLM from the faucet in the sidebar to start voting on proposals!
          </p>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            I Understand, Let&apos;s Go!
          </button>
        </div>
      </div>
    </div>
  );
}
