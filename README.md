# UniBoard

UniBoard to wieloplatformowy projekt demonstracyjny typu SaaS do zarządzania projektami i przepływami pracy. Monorepo pozwala na przełączanie się pomiędzy wariantami backendu (.NET/Java) oraz frontendem (React/Angular), pokazując dobre praktyki architektoniczne, testowe i DevOps.

## Obecny status

- [ ] Inicjalizacja backendu (.NET / Java)
- [ ] Warstwy domenowe i aplikacyjne
- [ ] Konfiguracja infrastruktury (PostgreSQL, Redis, kolejki)
- [ ] Frontend (React/Angular)
- [ ] CI/CD oraz infrastruktura jako kod
- [ ] Do uzgodnienia: wspólny styl commitów i komentarzy w zespole

## Backend (.NET) – uwierzytelnianie

- `POST /api/auth/register` – rejestruje użytkownika, pierwszy z nich otrzymuje rolę Admin.
- `POST /api/auth/login` – zwraca parę tokenów (JWT + refresh).
- `POST /api/auth/refresh` – wydaje nowe tokeny po podaniu ważnego refresh tokenu.
- Endpointy projektów i zadań wymagają autoryzacji JWT; operacje usuwania są ograniczone do roli Admin.

## Uruchomienie (lokalnie)

Instrukcje pojawią się wraz z rozbudową projektu. Docelowo `docker compose -f docker-compose.dev.yml up --build` uruchomi pełne środowisko deweloperskie.
