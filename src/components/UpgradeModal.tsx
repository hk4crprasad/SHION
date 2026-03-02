'use client';

import { Fragment, useState } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Crown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof window.Razorpay !== 'undefined') return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const UpgradeModal = ({
  isOpen,
  setIsOpen,
  onSuccess,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  onSuccess?: () => void;
}) => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/subscription/create', { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to create subscription');
        setLoading(false);
        return;
      }
      const { subscriptionId, keyId, userEmail, userName } = await res.json();
      const rzp = new window.Razorpay({
        key: keyId,
        subscription_id: subscriptionId,
        name: 'Shion AI',
        description: 'Premium Plan',
        prefill: { email: userEmail, name: userName },
        theme: { color: '#0ea5e9' },
        handler: () => {
          toast.success('Premium activated!');
          setIsOpen(false);
          onSuccess?.();
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-sm transform rounded-2xl bg-light-secondary dark:bg-dark-secondary border border-light-200 dark:border-dark-200 p-6 text-left shadow-xl transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <Crown size={18} className="text-amber-500" />
                  <DialogTitle className="text-base font-semibold dark:text-white text-black">
                    Upgrade to Premium
                  </DialogTitle>
                </div>
                <p className="text-sm dark:text-white/70 text-black/70 mb-5">
                  Unlock <span className="text-black dark:text-white font-medium">Deep Research</span> mode and <span className="text-black dark:text-white font-medium">GPT 5.2</span> models.
                </p>
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-black/50 dark:text-white/50 hover:text-black/70 dark:hover:text-white/70 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-sm font-medium text-[#24A0ED] hover:text-[#24A0ED]/80 disabled:opacity-50 transition duration-200"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                    {loading ? 'Opening...' : 'Subscribe'}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default UpgradeModal;

