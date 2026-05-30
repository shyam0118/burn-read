import { Lock } from 'lucide-react';

export default function PrivacyBanner() {
  return (
    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm">
      <Lock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
      <p className="text-emerald-200 text-xs sm:text-sm leading-relaxed">
        <strong>Your chat never leaves your device.</strong>{' '}
        Everything is processed in your browser. Only anonymized stats are sent
        to the AI for roasting.
      </p>
    </div>
  );
}
