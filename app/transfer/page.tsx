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
  
  // Local state for tracking recent transfers locally in browser
  const [recentTransfers, setRecentTransfers] = useState<{ recipient: string; amount: string; hash: string; timestamp: number }[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gv_transfers');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

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

      // Save to local transfers list
      const newTransfer = {
        recipient,
        amount,
        hash: res.hash,
        timestamp: Date.now()
      };
      const updated = [newTransfer, ...recentTransfers].slice(0, 5);
      setRecentTransfers(updated);
      localStorage.setItem('gv_transfers', JSON.stringify(updated));

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
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16 space-y-8 animate-fade-in bg-[#fcf8fa] dark:bg-surface-900 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-surface-700 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Direct Payment</p>
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white font-sans">XLM Direct Transfer</h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
          Send XLM directly to any recipient on the Stellar Testnet using Freighter or other connected wallets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Transfer Form */}
        <div className="lg:col-span-7 bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 p-6 rounded shadow-sm">
          {!isConnected ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-surface-700 rounded bg-slate-50 dark:bg-surface-800">
              <FiAlertCircle className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <h3 className="text-sm font-bold text-black dark:text-white">Wallet Connection Required</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Please connect your wallet using the button in the header to start direct transfers.
              </p>
            </div>
          ) : (
            <form onSubmit={handleTransfer} className="space-y-6">
              {/* Sender Display */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5">
                  Sender Account
                </label>
                <div className="h-12 w-full rounded border border-slate-200 dark:border-surface-700 bg-slate-50 dark:bg-surface-900 px-4 flex items-center justify-between text-xs text-slate-700 dark:text-slate-200 font-mono">
                  <span>{stellar.formatAddress(publicKey, 6, 6)}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-sans font-semibold">Balance: {balance} XLM</span>
                </div>
              </div>

              {/* Recipient Input */}
              <div>
                <label htmlFor="recipient" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5">
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
                <label htmlFor="amount" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5">
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
                className="w-full h-12 flex justify-center items-center gap-2 uppercase tracking-wider text-xs font-semibold"
              >
                Send Transaction <FiArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          {/* Transaction Feedback */}
          {txStatus === 'success' && txHash && (
            <div className="mt-6 rounded border border-emerald-250 bg-emerald-50 dark:bg-emerald-950/20 p-4 animate-slide-up">
              <div className="flex items-start gap-3">
                <FiCheckCircle className="mt-0.5 h-5 w-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Payment Successful!</h4>
                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                    Your payment has been successfully recorded on the Stellar Testnet.
                  </p>
                  <a
                    href={stellar.getExplorerLink(txHash, 'tx')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 hover:underline font-semibold"
                  >
                    View on Explorer <FiExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {txStatus === 'error' && errorMsg && (
            <div className="mt-6 rounded border border-rose-250 bg-rose-50 dark:bg-rose-950/20 p-4 animate-slide-up">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="mt-0.5 h-5 w-5 text-rose-600 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-rose-800 dark:text-rose-350">Transaction Failed</h4>
                  <p className="mt-1 text-xs text-rose-700 dark:text-rose-400">{errorMsg}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Recent Local Transfers */}
        <div className="lg:col-span-5 bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 p-6 rounded shadow-sm flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-surface-700 pb-2">
              Recent Transfers
            </h3>
            {recentTransfers.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">No transfers initiated from this browser yet.</p>
            ) : (
              <div className="space-y-4">
                {recentTransfers.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs border-b border-slate-50 dark:border-surface-750 pb-3 last:border-b-0">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        To: {stellar.formatAddress(item.recipient, 5, 5)}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-bold text-black dark:text-white">{item.amount} XLM</span>
                      <a
                        href={stellar.getExplorerLink(item.hash, 'tx')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-[10px] text-blue-500 hover:underline"
                      >
                        View Tx &rarr;
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-surface-900 border border-slate-200 dark:border-surface-700 p-4 rounded text-[11px] text-slate-500 leading-relaxed mt-4">
            Direct transfers bypass the GovVault governance logic. Use this for quick testnet wallet refuels or standard token testing.
          </div>
        </div>
      </div>
    </div>
  );
}
