export default function RegulaminPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-32 px-6 pb-20 max-w-4xl mx-auto font-sans leading-relaxed">
            <h1 className="text-3xl font-black uppercase mb-8 border-b border-zinc-800 pb-4 text-blue-600">
                Regulamin i Polityka Prywatności
            </h1>

            {/* --- SEKCJE REGULAMINU --- */}

            <section className="mb-8">
                <h2 className="text-xl font-bold uppercase mb-4 text-zinc-300 italic">// § 1. Dane Sprzedawcy</h2>
                <p className="text-zinc-400 mb-2">Właścicielem i administratorem portalu playagain.store jest:</p>
                <div className="bg-zinc-900/50 p-4 border border-zinc-800 rounded">
                    <p className="font-bold text-white">Jan Wiczyński</p>
                    <p className="text-zinc-400">Działalność nierejestrowana</p>
                    <p className="text-zinc-400">Adres: Sofoklesa 32, Poznań</p>
                    <p className="text-zinc-400">Kontakt: wiczynski@ketelman.com</p>
                </div>
                <p className="text-zinc-500 text-xs mt-4 italic">
                    PlayAgain jest częścią ekosystemu technologicznego Ketelman Holding and Engineering.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold uppercase mb-4 text-zinc-300 italic">// § 2. Rodzaje i zakres usług</h2>
                <p className="text-zinc-400 mb-2">Usługodawca świadczy drogą elektroniczną następujące usługi:</p>
                <ul className="list-disc pl-6 text-zinc-400 space-y-2">
                    <li><strong>Cel usługi:</strong> Celem usługi jest umożliwienie usługobiorcy zaprojektowania jednostki komputerowej, lub zakupu skonfigurowanej, korzystając z technologicznego wsparcia autorów systemu.</li>
                    <li><strong>Konfigurator PC :</strong> narzędzie do samodzielnego składania zestawów komputerowych.</li>
                    <li><strong>Sklep Internetowy:</strong> sprzedaż gotowych zestawów PC oraz komponentów.</li>
                    <li><strong>Obsługa Konta:</strong> zarządzanie danymi i historią zamówień przez klienta.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold uppercase mb-4 text-zinc-300 italic">// § 3. Realizacja zamówień i Weryfikacja Techniczna</h2>
                <ul className="list-disc pl-6 text-zinc-400 space-y-2">
                    <li><strong>Termin realizacji:</strong> Usługodawca zobowiązuje się do wysłania zamówienia w terminie do 14 dni roboczych od momentu potwierdzenia przyjęcia zamówienia do realizacji.</li>
                    <li><strong>Weryfikacja techniczna:</strong> Każda konfiguracja stworzona przez Usługobiorcę w Konfiguratorze  jest weryfikowana przez Usługodawcę pod kątem kompatybilności fizycznej i technicznej przed przystąpieniem do montażu.</li>
                    <li><strong>Problemy z realizacją:</strong> W przypadku wykrycia błędów uniemożliwiających montaż, trudności z dostępnością komponentów lub innych problemów technicznych, Usługodawca niezwłocznie poinformuje o tym Usługobiorcę.</li>
                    <li><strong>Opcje korygujące:</strong> W sytuacji opisanej powyżej, Usługobiorca ma prawo do:
                        <ul className="list-[circle] pl-6 mt-2 space-y-1">
                            <li>Zaakceptowania zaproponowanej przez Usługodawcę korekty zamówienia (np. wymiana podzespołu na inny o zbliżonych parametrach),</li>
                            <li>Anulowania zamówienia i otrzymania pełnego zwrotu wpłaconych środków.</li>
                        </ul>
                    </li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold uppercase mb-4 text-zinc-300 italic">// § 4. Warunki świadczenia i wymagania techniczne</h2>
                <ul className="list-disc pl-6 text-zinc-400 space-y-2">
                    <li>Wymagania techniczne: dostęp do Internetu, przeglądarka z obsługą JS i Cookies (zalecana przeglądarka Google Chrome, na której została przeprowadzona większość testów jakościowych), aktywne konto e-mail.</li>
                    <li><strong>Zakaz treści bezprawnych:</strong> Użytkownik ma zakaz dostarczania treści o charakterze bezprawnym, wulgarnym lub naruszającym dobra osób trzecich.</li>
                    <li><strong>Niedozwolone użycie:</strong> Zabronione jest użytkowanie strony w celach niezgodnych z tym opisanym w punkcie <strong>Cel usługi.</strong></li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold uppercase mb-4 text-zinc-300 italic">// § 5. Reklamacje, Zwroty i Rozstrzyganie Sporów</h2>
                <p className="text-zinc-400 mb-4">
                    Wszelkie reklamacje dotyczące działania serwisu należy kierować na adres: <strong>kontakt@playagain.com</strong>.
                    Rozpatrzenie reklamacji następuje w ciągu 48 godzin.
                </p>
                <ul className="list-disc pl-6 text-zinc-400 space-y-2 mb-4">
                    <li><strong>Prawo do zwrotu:</strong> Zgodnie z ustawą o prawach konsumenta, Usługobiorca będący konsumentem ma prawo do odstąpienia od umowy bez podania przyczyny w przeciągu <strong>14 dni</strong> od dnia wejścia w posiadanie towaru.</li>
                    <li><strong>Koszty zwrotu:</strong> W przypadku odstąpienia od umowy, bezpośredni <strong>koszt odesłania towaru</strong> do Usługodawcy ponosi Usługobiorca.</li>
                    <li><strong>Pozasądowe rozwiązywanie sporów:</strong> Usługobiorca będący konsumentem ma prawo skorzystać z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń, m.in. poprzez platformę ODR (http://ec.europa.eu/consumers/odr) lub u właściwego Rzecznika Konsumentów.</li>
                    <li><strong>Wyłączenia:</strong> Prawo do odstąpienia od umowy nie przysługuje w odniesieniu do umów, w których przedmiotem świadczenia jest towar nieprefabrykowany, wyprodukowany według specyfikacji Usługobiorcy (zestawy personalizowane w konfiguratorze  o unikalnej charakterystyce).</li>
                    <li><strong>Rękojmia:</strong> Sprzedawca odpowiada wobec konsumenta za brak zgodności towaru z umową na zasadach określonych w Kodeksie Cywilnym oraz Ustawie o prawach konsumenta.</li>
                </ul>
            </section>



            {/* --- SEKCJE POLITYKI PRYWATNOŚCI (RODO) --- */}

            <section className="mb-8 border-t border-zinc-800 pt-12">
                <h2 className="text-xl font-bold uppercase mb-4 text-blue-500 italic">// § 6. Ochrona Danych Osobowych (RODO)</h2>
                <p className="text-zinc-400 mb-4">
                    Administratorem danych osobowych jest Jan Wiczyński (Dane Sprzedawcy wskazane w § 1). Przetwarzanie danych odbywa się zgodnie z rozporządzeniem RODO.
                </p>
                <ul className="list-disc pl-6 text-zinc-400 space-y-2">
                    <li><strong>Cele przetwarzania:</strong> Dane są przetwarzane wyłącznie w celu realizacji zamówień, obsługi konta użytkownika, procesu reklamacji oraz komunikacji technicznej związanej z usługami portalu.</li>
                    <li><strong>Zakres danych:</strong> Przetwarzamy dane niezbędne do realizacji wysyłki i kontaktu: imię, nazwisko, adres e-mail, numer telefonu oraz adres zamieszkania/dostawy.</li>
                    <li><strong>Podstawa prawna:</strong> Przetwarzanie jest niezbędne do wykonania umowy, której stroną jest Usługobiorca (Art. 6 ust. 1 lit. b RODO).</li>
                    <li><strong>Prawa Użytkownika:</strong> Każdy Usługobiorca ma prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania oraz prawo do przenoszenia danych.</li>
                    <li><strong>Usuwanie danych:</strong> Aby usunąć dane osobowe z bazy należy zwrócić się do administratora strony pod adres mailowy podany w §1.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold uppercase mb-4 text-blue-500 italic">// § 7. Pliki Cookies i Bezpieczeństwo</h2>
                <p className="text-zinc-400 mb-4">
                    Strona playagain.store wykorzystuje technologię Cookies oraz Local Storage jedynie w celach technicznych, umożliwiających dokonanie transakcji.
                </p>
                <ul className="list-disc pl-6 text-zinc-400 space-y-2">
                    <li><strong>Funkcjonalność:</strong> Mechanizmy te służą do utrzymania sesji logowania, zapamiętywania zawartości koszyka oraz zapisywania postępów w Konfiguratorze PC .</li>
                    <li><strong>Odmowa:</strong> Usługobiorca może w każdej chwili wyłączyć obsługę plików cookies w ustawieniach swojej przeglądarki, jednak może to uniemożliwić korzystanie z kluczowych funkcji serwisu - koszyk oraz logowanie.</li>
                    <li><strong>Zabezpieczenia:</strong> Administrator dokłada wszelkich starań, aby chronić dane przed nieuprawnionym dostępem, stosując się do zasad sztuki cyberbezpieczeństwa.</li>
                </ul>
            </section>

            {/* --- SEKCJA KONTAKT --- */}
            {/* --- SEKCJA DOKUMENTÓW SPRZEDAŻY --- */}

            <section className="mb-8">
                <h2 className="text-xl font-bold uppercase mb-4 text-zinc-300 italic">// § 8. Dokumentowanie Sprzedaży</h2>
                <p className="text-zinc-400">
                    Ze względu na prowadzenie działalności nierejestrowanej (zgodnie z Art. 5 ustawy Prawo przedsiębiorców), Usługodawca <strong>nie jest płatnikiem podatku VAT</strong>.
                </p>
                <ul className="list-disc pl-6 text-zinc-400 space-y-2 mt-2">
                    <li>Na dzień dzisiejszy <strong>nie ma możliwości wystawienia faktury VAT</strong>.</li>
                    <li>Do każdego zamówienia wystawiany jest imienny <strong>rachunek</strong> (uproszczony dokument sprzedaży), przesyłany drogą elektroniczną lub dołączany do przesyłki.</li>
                </ul>
            </section>
            <section className="mb-8 border-t border-zinc-800 pt-12">
                <h2 className="text-xl font-bold uppercase mb-4 text-zinc-300 italic">// § 9. Kontakt</h2>
                <p className="text-zinc-400 mb-4">
                    W sprawach związanych z funkcjonowaniem serwisu, realizacją zamówień lub ochroną danych osobowych, prosimy o kontakt poprzez poniższe kanały:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-900/30 p-4 border border-zinc-800 rounded-lg">
                        <p className="text-xs font-mono text-blue-500 uppercase mb-1">E-mail (Wsparcie i Zamówienia)</p>
                        <p className="text-white font-bold">kontakt@playagain.com</p>
                    </div>
                    <div className="bg-zinc-900/30 p-4 border border-zinc-800 rounded-lg">
                        <p className="text-xs font-mono text-blue-500 uppercase mb-1">E-mail (Administracja)</p>
                        <p className="text-white font-bold">wiczynski@ketelman.com</p>
                    </div>
                    <div className="bg-zinc-900/30 p-4 border border-zinc-800 rounded-lg md:col-span-2">
                        <p className="text-xs font-mono text-blue-500 uppercase mb-1">Adres korespondencyjny</p>
                        <p className="text-white font-bold">Sofoklesa 32, 60-461 Poznań</p>
                    </div>
                </div>
            </section>

            <footer className="text-zinc-600 text-[10px] font-mono uppercase mt-20 text-center">
                Ostatnia aktualizacja: 22.01.2026 | PlayAgain Store
            </footer>
        </div>
    );
}