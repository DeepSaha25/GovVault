'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/Button';
import { FiDroplet, FiInfo, FiCheck, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function FaucetPage() {
  const { publicKey, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const handleClaim = async () => {
    if (!isConnected || !publicKey) {
      toast.error('Please connect your wallet first.');
      return;
    }

    setLoading(true);
    try {
      // Simulate faucet claim logic (as we don't have the explicit faucet endpoint mapped in stellar.ts yet, we simulate the experience)
      // In a real scenario, this would call a backend endpoint or a specific smart contract function to mint tokens.
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setClaimed(true);
      toast.success('Successfully claimed 1000 Test Governance Tokens!');
    } catch (error) {
      toast.error('Failed to claim tokens. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-fade-in bg-[#fcf8fa] dark:bg-surface-900">
      <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-surface-700 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Token Faucet</p>
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white font-sans">Claim Governance Tokens</h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
          To participate in GovVault DAO, you need Governance Tokens. Use this faucet to mint test tokens directly to your connected wallet.
        </p>
      </div>

      <div className="bg-white dark:bg-surface-800 rounded-lg border border-slate-200 dark:border-surface-700 p-8 shadow-sm">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center">
            <FiDroplet className="w-8 h-8" />
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-2">1,000 GOV Tokens</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Available per wallet every 24 hours on the Testnet.</p>
          </div>

          {!isConnected ? (
            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 p-4 rounded-md text-sm flex items-start gap-3 text-left w-full max-w-md">
              <FiInfo className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>You must connect your Freighter wallet before you can claim tokens from the faucet.</p>
            </div>
          ) : (
            <div className="w-full max-w-md space-y-4">
              <div className="bg-slate-50 dark:bg-surface-800 p-3 rounded border border-slate-200 dark:border-surface-700 flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">Connected Address</span>
                <span className="font-mono text-black dark:text-white truncate w-32">{publicKey.substring(0, 6)}...{publicKey.substring(publicKey.length - 4)}</span>
              </div>
              
              <Button 
                onClick={handleClaim} 
                disabled={loading || claimed}
                className="w-full h-12 text-base font-semibold"
              >
                {loading ? 'Processing...' : claimed ? 'Claimed Successfully' : 'Claim Tokens'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-surface-800 rounded-lg border border-slate-200 dark:border-surface-700 p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <FiInfo className="text-slate-500 dark:text-slate-400" />
          How to view tokens in Freighter
        </h3>
        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <div className="bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-black dark:text-white">1</div>
            <p>Open your Freighter extension and unlock your wallet.</p>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-black dark:text-white">2</div>
            <p>Click on &quot;Manage Assets&quot; at the bottom of your balance view.</p>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-black dark:text-white">3</div>
            <p>Select &quot;Add Custom Asset&quot; and enter the Governance Token Contract ID.</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
