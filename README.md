# InDoorNav Admin Panel 🗺️

Webowy panel administracyjny do tworzenia i edycji map nawigacji wewnątrzbudynkowej. Aplikacja pozwala na wizualne projektowanie ścieżek z wykorzystaniem markerów **ArUco**, kalibrację mapy względem rzeczywistych wymiarów (metry) i kierunków świata (kompas) oraz przypisywanie koordynatów GPS.

Gotowe mapy w postaci grafu (Adjacency List) mogą być pobierane jako pliki `.json` lub zapisywane bezpośrednio w chmurze (Supabase).

## 🛠 Technologie

- **[React 18](https://react.dev/)** + **[Vite](https://vitejs.dev/)** (Szybkie środowisko deweloperskie)
- **[React Flow (@xyflow/react)](https://reactflow.dev/)** (Silnik do rysowania grafów i węzłów)
- **[Tailwind CSS v4](https://tailwindcss.com/)** (Stylowanie interfejsu)
- **[Supabase](https://supabase.com/)** (Baza danych PostgreSQL i system autoryzacji)
- **[React Router](https://reactrouter.com/)** (Routing i ochrona podstron)
- **[Lucide React](https://lucide.dev/)** (Ikony)

---

## 📋 Wymagania wstępne (Co musisz mieć zainstalowane)

Aby uruchomić ten projekt na swoim komputerze, potrzebujesz:

1. **[Node.js](https://nodejs.org/en/)** (zalecana wersja LTS, np. 18.x lub 20.x). Instalacja Node.js automatycznie instaluje menedżer pakietów **npm**.
2. **[Git](https://git-scm.com/)** (do pobrania repozytorium i zarządzania wersjami).
3. Darmowe konto na **[Supabase](https://supabase.com/)** (jako nasza baza danych).

---

## 🚀 Instalacja i uruchomienie krok po kroku

### 1. Pobranie projektu i instalacja zależności
Otwórz terminal (wiersz poleceń) i wykonaj poniższe komendy:

```bash
# Sklonuj repozytorium na swój komputer
git clone <LINK_DO_TWOJEGO_REPOZYTORIUM_GITHUB>

# Przejdź do folderu projektu
cd indoor-nav-admin

# Zainstaluj wszystkie wymagane biblioteki
npm install
(Komenda npm install automatycznie pobierze React Flow, Tailwind, Supabase, React Router i resztę paczek wymienionych w pliku package.json).

2. Konfiguracja zmiennych środowiskowych (.env)
W głównym folderze projektu (obok pliku package.json) stwórz plik o nazwie .env i wklej do niego klucze swojego projektu z panelu Supabase:

Фрагмент кода
VITE_SUPABASE_URL=[https://twoj-identyfikator-projektu.supabase.co](https://twoj-identyfikator-projektu.supabase.co)
VITE_SUPABASE_ANON_KEY=twoj_dlugi_klucz_anon_public
Ważne: Plik .env jest ignorowany przez Gita (zapisane w .gitignore), dzięki czemu Twoje klucze są bezpieczne i nie trafią do publicznego repozytorium.

3. Konfiguracja Bazy Danych (Supabase)
Aby aplikacja mogła zapisywać mapy, musisz stworzyć tabelę w swojej bazie.
Wejdź do panelu Supabase, otwórz SQL Editor, wklej i uruchom (Run) poniższy skrypt:

SQL
create table public.indoor_maps (
  id uuid default gen_random_uuid() primary key,
  building_name text not null,
  floor_level integer not null default 1,
  latitude double precision not null,
  longitude double precision not null,
  geofence_radius_meters numeric not null default 50,
  graph_data jsonb not null,
  updated_at timestamp with time zone default now()
);

-- Odblokowanie dostępu do tabeli (wyłączenie ścisłego RLS na potrzeby prototypu)
alter table public.indoor_maps disable row level security;
4. Uruchomienie aplikacji (Tryb deweloperski)
Gdy wszystko jest gotowe, wpisz w terminalu:

Bash
npm run dev
Aplikacja uruchomi się pod adresem: http://localhost:5173/.
Przy pierwszym wejściu zostaniesz przekierowany na stronę logowania (/login), gdzie możesz zarejestrować swoje konto administratora.

📦 Publikacja (Deploy na GitHub Pages)
Projekt jest przygotowany do darmowego hostowania na GitHub Pages (wykorzystuje HashRouter).

Aby opublikować aplikację w internecie, po prostu wpisz:

Bash
npm run deploy
Skrypt automatycznie zbuduje aplikację i wyśle ją na osobną gałąź gh-pages na Twoim repozytorium. Pamiętaj, aby w ustawieniach repozytorium na GitHubie (Settings -> Pages) włączyć publikację z gałęzi gh-pages.

📂 Struktura głównych plików
src/components/editor/ — Główny moduł edytora, definicje węzłów ArUco, linii korytarzy, siatki i panel kalibracji.

src/components/auth/ — Strona logowania i moduł chroniący dostęp (ProtectedRoute).

src/utils/ — Logika przeliczania pixeli na metry, kątów (azymutu) i serializacji grafu do JSON.

src/api/supabaseClient.ts — Połączenie z bazą danych chmurową.


### Co to daje?
Dzięki takiemu plikowi README, ktokolwiek (w tym promotor/nauczyciel oceniający projekt) wejdzie na Twojego GitHuba, od razu będzie wiedział, po co jest ta aplikacja, jakie technologie zostały w niej użyte i jakimi komendami w terminalu można ją uruchomić!