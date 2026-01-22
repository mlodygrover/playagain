export default function RegulaminPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 px-6 pb-20 max-w-4xl mx-auto font-sans leading-relaxed">
      <h1 className="text-3xl font-black uppercase mb-8 border-b border-zinc-800 pb-4 text-blue-600">
        Regulamin świadczenia usług drogą elektroniczną
      </h1>

      <section className="mb-8">
        <h2 className="text-xl font-bold uppercase mb-4 text-zinc-300 italic">// § 1. Dane Sprzedawcy</h2>
        <p className="text-zinc-400 mb-2">Właścicielem i administratorem portalu playagain.store jest:</p>
        <div className="bg-zinc-900/50 p-4 border border-zinc-800 rounded">
          <p className="font-bold text-white">Jan Wiczyński</p>
          <p className="text-zinc-400">Działalność nierejestrowana</p>
          <p className="text-zinc-400">Adres: [TU WPISZ SWÓJ ADRES ZAMIESZKANIA, POZNAŃ]</p>
          <p className="text-zinc-400">Kontakt: kontakt@playagain.com | info@ketelman.com</p>
        </div>
        <p className="text-zinc-500 text-xs mt-4 italic">
          * PlayAgain jest częścią ekosystemu technologicznego Ketelman Holding.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold uppercase mb-4 text-zinc-300 italic">// § 2. Rodzaje i zakres usług</h2>
        <p className="text-zinc-400 mb-2">Usługodawca świadczy drogą elektroniczną następujące usługi:</p>
        <ul className="list-disc pl-6 text-zinc-400 space-y-2">
          <li><strong>Konfigurator PC 3D:</strong> narzędzie do samodzielnego składania zestawów komputerowych.</li>
          <li><strong>Sklep Internetowy:</strong> sprzedaż gotowych zestawów PC oraz komponentów (refurbished).</li>
          <li><strong>Obsługa Konta:</strong> zarządzanie danymi i historią zamówień przez klienta.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold uppercase mb-4 text-zinc-300 italic">// § 3. Warunki świadczenia i wymagania techniczne</h2>
        <ul className="list-disc pl-6 text-zinc-400 space-y-2">
          <li>Wymagania techniczne: dostęp do Internetu, przeglądarka z obsługą JS i Cookies (zalecany Chrome/Firefox), aktywne konto e-mail.</li>
          <li><strong>Zakaz treści bezprawnych:</strong> Użytkownik ma zakaz dostarczania treści o charakterze bezprawnym, wulgarnym lub naruszającym dobra osób trzecich.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold uppercase mb-4 text-zinc-300 italic">// § 4. Reklamacje</h2>
        <p className="text-zinc-400">
          Wszelkie reklamacje dotyczące działania serwisu należy kierować na adres: <strong>kontakt@playagain.com</strong>. 
          Rozpatrzenie reklamacji następuje w terminie 14 dni roboczych.
        </p>
      </section>
    </div>
  );
}