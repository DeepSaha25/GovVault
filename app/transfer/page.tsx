'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { stellar } from '@/lib/stellar';
import { Button } from '@/components/ui/Button';
import { FiArrowRight, FiCheckCircle, FiAlertCircle, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function TransferPage() {
  const { publicKey, isConnected, balance, refreshBalance } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !publicKey) {
      toast.error('Please connect your wallet first.');
      return;
    }

    if (!recipient || !amount) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    try {
      setLoading(true);
      setTxStatus('idle');
      setTxHash('');
      setErrorMsg('');

      const res = await stellar.sendXlmTransaction(publicKey, recipient, amount);

      setTxStatus('success');
      setTxHash(res.hash);
      toast.success('Transaction submitted successfully!');
      
      // Clear inputs
      setRecipient('');
      setAmount('');
      
      // Refresh balance
      await refreshBalance();
    } catch (err: unknown) {
      setTxStatus('error');
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:py-20 animate-fade-in">
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-1">Direct XLM Testnet Transfer</h2>
        <p className="text-xs text-zinc-400 mb-6">
          Send XLM directly on the Stellar testnet using your connected wallet.
        </p>

        {!isConnected ? (
          <div className="text-center py-8">
            <FiAlertCircle className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-400">
              Please connect your wallet using the button in the top right to start transfers.
            </p>
          </div>
        ) : (
          <form onSubmit={handleTransfer} className="space-y-4">
            {/* Sender Display */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Sender Account
              </label>
              <div className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 flex items-center justify-between text-sm text-zinc-300 font-mono">
                <span>{stellar.formatAddress(publicKey, 6, 6)}</span>
                <span className="text-zinc-500 font-sans text-xs">Balance: {balance} XLM</span>
              </div>
            </div>

            {/* Recipient Input */}
            <div>
              <label htmlFor="recipient" className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Recipient Stellar Address
              </label>
              <input
                id="recipient"
                type="text"
                placeholder="G..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={loading}
                className="field-input font-mono"
                required
              />
            </div>

            {/* Amount Input */}
            <div>
              <label htmlFor="amount" className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Amount (XLM)
              </label>
              <input
                id="amount"
                type="number"
                step="0.0000001"
                min="0.0000001"
                placeholder="10.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                className="field-input"
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={loading}
              className="w-full h-11 flex justify-center items-center gap-2"
            >
              Send Transaction <FiArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* Transaction Feedback */}
        {txStatus === 'success' && txHash && (
          <div className="mt-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 animate-slide-up">
            <div className="flex items-start gap-3">
              <FiCheckCircle className="mt-0.5 h-5 w-5 text-emerald-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-white">Payment Successful!</h4>
                <p className="mt-1 text-xs text-zinc-400">
                  Your payment has been successfully recorded on the Stellar Testnet.
                </p>
                <a
                  href={stellar.getExplorerLink(txHash, 'tx')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  View on Explorer <FiExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {txStatus === 'error' && errorMsg && (
          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 animate-slide-up">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="mt-0.5 h-5 w-5 text-red-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-white">Transaction Failed</h4>
                <p className="mt-1 text-xs text-red-300">{errorMsg}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
