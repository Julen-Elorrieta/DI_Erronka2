# ElorAdmin - Fitxategien Dokumentazio Osoa

## 📋 Aurkibidea
1. [Proiektuaren Egitura](#proiektuaren-egitura)
2. [Konfigurazio Fitxategiak](#konfigurazio-fitxategiak)
3. [Aplikazioaren Muina (Core)](#aplikazioaren-muina-core)
4. [Ezaugarriak (Features)](#ezaugarriak-features)
5. [Partekatutako Osagaiak (Shared)](#partekatutako-osagaiak-shared)
6. [Inguruneak (Environments)](#inguruneak-environments)

---

## 🏗️ Proiektuaren Egitura

```
DI_Erronka2/
├── src/                          # Iturburu kodea
│   ├── app/                      # Aplikazioaren logika nagusia
│   │   ├── core/                 # Funtzionalitate zeharkakoak
│   │   ├── features/             # Ezaugarri moduluak
│   │   ├── shared/               # Partekatutako osagaiak
│   │   ├── app.config.ts         # Aplikazioaren konfigurazio nagusia
│   │   ├── app.routes.ts         # Nabigazio bideak
│   │   └── app.ts                # Erro osagaia
│   ├── environments/             # Ingurune konfigurazioak
│   ├── index.html                # HTML nagusia
│   ├── main.ts                   # Aplikazioaren sarrera puntua
│   └── styles.css                # Estilo globalak
├── public/                       # Baliabide estatikoak
│   └── assets/                   # Irudiak, i18n fitxategiak
├── angular.json                  # Angular konfigurazioa
├── package.json                  # Mendekotasunak
└── tsconfig.json                 # TypeScript konfigurazioa
```

---

## ⚙️ Konfigurazio Fitxategiak

### `angular.json`
Angular CLI-aren konfigurazio fitxategi nagusia:
- **Eginkizunak**: build, serve, test komandoen konfigurazioa
- **Presupuestoak**: Bundle tamainaren mugak (1.5MB warning, 2MB error)
- **Optimizazioak**: Produkzioko build-erako ezarpenak
- **Assets**: Fitxategi estatikoen kokapena

### `package.json`
NPM paketeak eta script-ak kudeatzen ditu:
- **Dependentziak**:
  - `@angular/core` v20: Framework nagusia
  - `@angular/material` v20: UI osagaiak
  - `@ngx-translate/core` v17: Internazionalizazioa (i18n)
  - `mapbox-gl` v3: Mapak bistaratzeko
- **Scripts**:
  - `ng serve`: Garapen zerbitzaria
  - `ng build`: Produkziorako build-a
  - `ng test`: Unit testak

### `tsconfig.json`
TypeScript konpiladorea konfiguratzeko fitxategia:
- **target**: ES2022 (JavaScript bertsio modernoa)
- **module**: ES2022 (modulu sistema)
- **strict**: true (tipo egiaztapen estriktuak)
- **experimentalDecorators**: true (Angular dekoratzaileak)

### `tsconfig.app.json`
Aplikazioaren TypeScript konfigurazioa:
- Aplikazio fitxategiak konpilatzeko ezarpenak
- Test fitxategiak kanpoan uzten ditu

### `tsconfig.spec.json`
Test fitxategien TypeScript konfigurazioa:
- Test unitarioak konpilatzeko ezarpenak
- Jasmine tipoak inkluitzen ditu

---

## 🎯 Aplikazioaren Muina (Core)

### Aplikazio Nagusiak

#### `src/main.ts`
Aplikazioaren **sarrera puntua**:
- Angular aplikazioa abiarazten du
- `bootstrapApplication()` deitzen du erro osagaiarekin
- Aplikazioaren konfigurazioa (`app.config.ts`) kargatu eta aplikatzen du

#### `src/app/app.ts`
**Erro osagaia** (Root Component):
- Aplikazio osoaren edukiontzia
- `<router-outlet>` erabiliz orri desberdinetan nabigatzeko aukera ematen du
- Standalone osagaia da (modulurik gabe)

#### `src/app/app.config.ts`
**Aplikazioaren konfigurazio nagusia**:
- **Providers** guztiak definitzen ditu (zerbitzuak, interceptors, guards...)
- **Router** konfigurazioa
- **i18n** konfigurazioa (TranslateModule)
- **HTTP Client** aktibatzen du
- **Angular Material** animazioak
- **Interceptors** erregistratzen ditu (auth, error, loading)
- **Hizkuntza lehenetsia**: euskera ('eu')

#### `src/app/app.routes.ts`
**Nabigazio bideak** (Routing):
```typescript
Bideak:
/ → Birbideratzea /login-era
/login → Saioa hasteko orria
/dashboard → Panel nagusia (AUTH behar du)
/users → Erabiltzaileak kudeatzea (ADMIN/GOD rolak)
/meetings → Bileren kudeaketa (autentifikatuta)
/schedule → Ordutegia (TEACHER/STUDENT rolak)
/profile → Erabiltzaile profila (autentifikatuta)
```

**Guards aplikatzen ditu**:
- `authGuard`: Autentifikazioa egiaztatu
- `roleGuard`: Rol baimenak egiaztatu

---

## 🔐 Core - Guards (Babesak)

### `core/guards/auth.guard.ts`
**Autentifikazio babesa**:
- **Eginkizuna**: Erabiltzailea autentifikatuta dagoen egiaztatu
- **Funtzionamendua**:
  1. `AuthService.currentUser()` egoera kontsultatzen du
  2. Erabiltzailea badago → baimena ematen du
  3. Ez badago → `/login`-era birbideratzen du
- **Erabiltzen duten bideak**: /dashboard, /users, /meetings, /schedule, /profile

### `core/guards/role.guard.ts`
**Rol babesa**:
- **Eginkizuna**: Erabiltzaileak rol egokia duen egiaztatu
- **Funtzionamendua**:
  1. Bideak behar duen rola irakurtzen du (`data.roles`)
  2. Uneko erabiltzailearen rola konparatzen du
  3. Rola bat badator → baimena ematen du
  4. Ez badator → `/dashboard`-era birbideratzen du eta abisua erakusten du
- **Erabiltzen duten bideak**: /users (ADMIN/GOD), /schedule (TEACHER/STUDENT)

---

## 🌐 Core - Interceptors

### `core/interceptors/auth.interceptor.ts`
**Autentifikazio interceptor-a**:
- **Eginkizuna**: HTTP eskaera guztiei autentifikazio header-ak gehitu
- **Funtzionamendua**:
  1. Bide publikoak (login, assets, i18n) salbu egiten ditu
  2. Erabiltzailea autentifikatuta badago:
     - `Authorization: Bearer {username}` header-a gehitzen du
     - `X-User-Role: {role}` header-a gehitzen du
  3. Eskaera bidaliko du
- **Erabilera**: API eskaeretan erabiltzailea identifikatzeko

### `core/interceptors/error.interceptor.ts`
**Erroreen kudeaketa interceptor-a**:
- **Eginkizuna**: HTTP erroreak harrapatu eta kudeatu
- **Funtzionamendua**:
  - **401 (Unauthorized)**: Saioa itxi eta login-era birbideratu
  - **403 (Forbidden)**: Baimen faltaren mezua
  - **404 (Not Found)**: Baliabidea ez aurkitua mezua
  - **500 (Server Error)**: Zerbitzari errorea mezua
  - Erroreak kontsolan logeatzen ditu `[ERROREA]` etiketarekin
- **Hobetu beharrekoak**: Toast/Snackbar jakinarazpenak gehitu

### `core/interceptors/loading.interceptor.ts`
**Karga egoera interceptor-a**:
- **Eginkizuna**: HTTP eskaerak noiz hasten eta amaitzen den detektatu
- **Funtzionamendua**:
  1. Eskaera hasi aurretik: Karga spinner-a erakutsi
  2. Erantzuna jasotakoan (edo errorea): Karga spinner-a ezkutatu
- **Hobetu beharrekoak**: Event emitter bat gehitu osagai globaletik kontsumitzeko

---

## 📦 Core - Models (Ereduak)

### `core/models/user.model.ts`
**Erabiltzaile eredua**:
```typescript
UserRole enum: GOD, ADMIN, TEACHER, STUDENT

User interface:
- id, username, email, name, surname, role, photo
- Ikasleentzako eremuak: cycle, course, isDual, group
```

### `core/models/meeting.model.ts`
**Bilera eredua**:
```typescript
MeetingStatus enum: PENDING, ACCEPTED, CANCELLED, CONFLICT

Meeting interface:
- id, title, topic, date, hour (1-6), classroom, status
- location: center, address, latitude, longitude
- participants: teacherId, studentId
```

### `core/models/schedule.model.ts`
**Ordutegia eredua**:
```typescript
ScheduleSlot interface:
- day (0-4: Astelehena-Ostirala)
- hour (1-6)
- type: CLASS, TUTORIA, GUARDIA, MEETING, EMPTY
- subject, cycle, course, meetingId

Schedule interface:
- userId
- slots: ScheduleSlot[]
```

### `core/models/center.model.ts`
**Ikastetxe eredua**:
```typescript
EducationalCenter interface:
- id, code, name, dtituc (titulartasuna), dterr (lurraldea), dmunic (udalerria)
- address, postalCode, phone, email
- coordinates: latitude, longitude

CenterFilter interface:
- Ikastetxeak iragazteko irizpideak
```

---

## 🔧 Core - Services (Zerbitzuak)

### `core/services/auth.service.ts`
**Autentifikazio zerbitzua**:
- **Erantzukizuna**: Erabiltzaileen autentifikazioa kudeatu
- **Signal egoera**: `currentUser()` - uneko erabiltzailea
- **Metodoak**:
  - `login(username, password)`: Saioa hasi
    - Pasahitza RSA enkriptatzen du `CryptoUtil` erabiliz
    - Mock moduan edo API bidez autentifikatzen du
    - Erabiltzailea localStorage-n gordetzen du
  - `logout()`: Saioa itxi eta datuak garbitu
  - `initializeAuth()`: Aplikazioa abiaraztean saioa berreskuratu
- **Mock datuak**: 4 erabiltzaile (god, admin, teacher, student)

### `core/services/users.service.ts`
**Erabiltzaileen kudeaketa zerbitzua**:
- **Erantzukizuna**: CRUD eragiketak erabiltzaileekin
- **Metodoak**:
  - `getUsers()`: Erabiltzaile guztiak eskuratu
  - `getUserById(id)`: Erabiltzaile bat id bidez
  - `createUser(user)`: Erabiltzaile berria sortu
  - `updateUser(id, user)`: Erabiltzailea eguneratu
  - `deleteUser(id)`: Erabiltzailea ezabatu
  - `getStats()`: Estatistikak (ikasle/irakasle kopurua)
- **Mock datuak**: 7 erabiltzaile (admin, irakasleak, ikasleak)

### `core/services/meetings.service.ts`
**Bileren kudeaketa zerbitzua**:
- **Erantzukizuna**: Bileren CRUD eragiketak
- **Metodoak**:
  - `getMeetings()`: Bilera guztiak
  - `getMeetingById(id)`: Bilera bat id bidez
  - `getUserMeetings(userId)`: Erabiltzaile baten bilerak
  - `getTodayMeetings()`: Gaurko bilerak
  - `createMeeting(meeting)`: Bilera berria
  - `updateMeeting(id, meeting)`: Bilera eguneratu
  - `deleteMeeting(id)`: Bilera ezabatu
  - `checkConflicts(userId, date, hour)`: Gatazka egiaztatu
- **Mock datuak**: 3 bilera

### `core/services/schedule.service.ts`
**Ordutegien kudeaketa zerbitzua**:
- **Erantzukizuna**: Erabiltzaileen ordutegia kudeatu
- **Metodoak**:
  - `getUserSchedule(userId)`: Erabiltzaile baten ordutegia
  - `updateSchedule(schedule)`: Ordutegia eguneratu
  - `getSlot(schedule, day, hour)`: Slot zehatz bat lortu
- **Mock datuak**: Irakasleak eta ikasleek ordutegi ezberdinak
- **Irakaitzak**: Interfazeen Garapena, Atzera Zerbitzuak, etab.

### `core/services/centers.service.ts`
**Ikastetxeen zerbitzua**:
- **Erantzukizuna**: Euskal Herriko ikastetxeak kudeatu
- **Metodoak**:
  - `getAllCenters()`: Ikastetxe guztiak
  - `getCenterById(id)`: Ikastetxe bat id bidez
  - `filterCenters(filter)`: Iragazkiak aplikatu (titulartasuna, lurraldea, udalerria)
  - `getTitularidades()`: Titulartasun motak
  - `getTerritorios()`: Lurraldeek
  - `getMunicipios(territorio?)`: Udaleriak (aukeran lurralde bateko)
- **Mock datuak**: 15 ikastetxe Euskal Herrian (koordinatuak barne)

### `core/services/language.service.ts`
**Hizkuntzen kudeaketa zerbitzua**:
- **Erantzukizuna**: Interfaze hizkuntza aldatu
- **Signal egoera**: `currentLanguage()` - uneko hizkuntza
- **Hizkuntzak**: Euskera (eu), Gaztelania (es), Ingelesa (en)
- **Metodoak**:
  - `setLanguage(lang)`: Hizkuntza aldatu
  - `getCurrentLanguage()`: Uneko hizkuntza eskuratu
  - `getAvailableLanguages()`: Hizkuntza erabilgarriak
- **Lehenetsia**: Euskera ('eu')
- **Persistentzia**: localStorage-n gordetzen du

---

## 🛠️ Core - Utils (Utilitate Funtzioak)

### `core/utils/crypto.util.ts`
**Kriptografia utilitate funtzioak**:
- **Erantzukizuna**: RSA enkriptazioa Web Crypto API erabiliz
- **Funtzio nagusia**: `encryptWithPublicKey(publicKey, data)`
  1. PEM formatuko gako publikoa inportatzen du
  2. Datuak ArrayBuffer bihurtzen ditu
  3. RSA-OAEP algoritmoarekin enkriptatzen ditu
  4. Emaitza Base64 kate gisa itzultzen du
- **Erabilera**: Pasahitzak bidaltzeko babestuta

---

## 🎨 Features (Ezaugarriak)

### `features/auth/` - Autentifikazioa

#### `login.component.ts`
**Saioa hasteko osagaia**:
- **Formularioa**: username eta password eremuak (Reactive Forms)
- **Balioztapenak**: Eremu biak derrigorrezkoak
- **Funtzionamendua**:
  1. Formularioa bidaltzean `AuthService.login()` deitzen du
  2. Arrakasta badu → `/dashboard`-era birbideratzen du
  3. Huts egiten badu → errore mezua erakusten du
- **Template**: `login.component.html` (Material Design)
- **Estiloak**: `login.component.css`

---

### `features/dashboard/` - Panel Nagusia

#### `dashboard.component.ts`
**Dashboard osagaia**:
- **Erantzukizuna**: Aplikazioaren hasiera orria
- **Signal egoerak**:
  - `totalStudents`: Ikasle kopurua
  - `totalTeachers`: Irakasle kopurua
  - `todayMeetings`: Gaurko bilera kopurua
- **Computed**: `isAdminRole` - GOD edo ADMIN rola duen egiaztatu
- **Datuak kargatzen ditu**:
  - `UsersService.getStats()`: Erabiltzaile estatistikak
  - `MeetingsService.getTodayMeetings()`: Gaurko bilerak
- **Txartelak erakusten ditu**: Zenbaki garrantzitsuak

---

### `features/users/` - Erabiltzaileen Kudeaketa

#### `users.component.ts`
**Erabiltzaileen zerrenda eta kudeaketa**:
- **Signal egoerak**:
  - `users`: Erabiltzaile guztiak
  - `filteredUsers`: Iragazitako erabiltzaileak
  - `loading`: Karga egoera
- **Iragazkiak**:
  - Rol bidez (GOD, ADMIN, TEACHER, STUDENT)
  - Bilaketa (izena, abizena, email)
- **Orrialdekatzea**: 10 erabiltzaile orrialdeko
- **Ekintzak** (rol baimenen arabera):
  - **Sortu**: GOD/ADMIN-ek bakarrik
  - **Editatu**: GOD-ek guztiak, ADMIN-ek irakasleak eta ikasleak
  - **Ezabatu**: GOD-ek guztiak (bere burua ez), ADMIN-ek irakasleak eta ikasleak
- **Material Table**: Taula ikusgarria argazkiekin

#### `user-form-dialog.component.ts`
**Erabiltzailea sortu/editatzeko dialogoa**:
- **Formulario dinamikoa**:
  - Eremu orokorrak: username, name, surname, email, role
  - Ikasleentzako eremuak (STUDENT rola hautatzean): cycle, group, isDual
- **Balioztapenak**:
  - Email formatua egiaztatu
  - Eremu guztiak derrigorrezkoak
- **Dialog emaitza**: Erabiltzaile berria/eguneratua itzultzen du

---

### `features/meetings/` - Bileren Kudeaketa

#### `meetings.component.ts`
**Ikastetxe eta bileren kudeaketa**:
- **Bi tab nagusi**:
  1. **Ikastetxeak**: Euskal Herriko ikastetxeak mapa eta taularekin
  2. **Nire Bilerak**: Erabiltzailearen bilerak

- **Signal egoerak**:
  - `centers`: Ikastetxeen zerrenda
  - `meetings`: Bileren zerrenda
  - `activeTab`: Fitxa aktiboa (0=ikastetxeak, 1=bilerak)

- **Iragazkiak** (ikastetxeentzat):
  - Titulartasuna (Publikoa, Itundua, Pribatua)
  - Lurraldea (Araba, Bizkaia, Gipuzkoa)
  - Udalerria (lurraldearen arabera)

- **Mapbox mapa**:
  - Ikastetxeak markatzaileekin erakusten ditu
  - Klik egitean popup-a erakusten du
  - Ikastetxe batean fokua jarri dezake

- **Ekintzak**:
  - Ikastetxearen xehetasunak ikusi
  - Mapan ikusi
  - Bilera sortu ikastetxe batean

#### `meeting-form-dialog.component.ts`
**Bilera berria sortzeko dialogoa**:
- **Formulario eremuak**:
  - title: Bileraren izenburua
  - topic: Bileraren gaia
  - date: Data
  - hour: Ordua (1-6)
  - classroom: Gela (aukerakoa)
- **Ikastetxe aukeratua**: Dialog-ari pasa zaion ikastetxea erakusten du
- **Emaitza**: Meeting objektua itzultzen du PENDING egoerarekin

#### `center-detail-dialog.component.ts`
**Ikastetxearen xehetasun dialogoa**:
- **Erakusten duena**:
  - Kodea, titulartasuna, lurraldea, udalerria
  - Helbidea, posta kodea
  - Telefonoa eta email-a (baditu)
  - Koordenatuak
  - Google Maps esteka
- **Material Design**: Ikonoak eta diseinu atsegina

---

### `features/schedule/` - Ordutegia

#### `schedule.component.ts`
**Erabiltzailearen ordutegia**:
- **Signal egoera**: `schedule` - erabiltzailearen ordutegia
- **Datuak**: `ScheduleService.getUserSchedule()` deitzen du
- **Egitura**:
  - Zutabeak: Astelehena - Ostirala
  - Errenkadak: 1-6 orduak (08:00-14:30)
- **Slot motak** (koloreekin):
  - `CLASS`: Klase arrunta (urdina)
  - `TUTORIA`: Tutoretza (berdea)
  - `GUARDIA`: Zaintza (horia)
  - `MEETING`: Bilera (gorria)
  - `EMPTY`: Hutsik (grisa)
- **Legenda**: Kolore bakoitzaren esanahia

---

### `features/profile/` - Profila

#### `profile.component.ts`
**Erabiltzaile profila**:
- **3 tab nagusi**:
  1. **Datu Pertsonalak**: Profil informazioa eta editatzeko aukera
  2. **Ordutegia**: Erabiltzailearen ordutegi laburpena
  3. **Bilerak**: Erabiltzailearen bileren zerrenda

- **Signal egoerak**:
  - `user`: Uneko erabiltzailea
  - `editing`: Editatzen ari den
  - `schedule`: Ordutegia
  - `meetings`: Bilerak

- **Editatzeko modua**:
  - Formularioa aktibatu/desaktibatu
  - Aldaketak gorde `UsersService.updateUser()` erabiliz

- **Ikasleentzako informazio gehigarria**:
  - Zikloa, taldea, DUAL modalitatea

---

## 🔄 Shared (Partekatutako Osagaiak)

### `shared/components/layout.component.ts`
**Aplikazioaren diseinu orokorra**:
- **Egitura**:
  - **Sidenav** (alboko menua): Nabigazio estekak
  - **Toolbar** (goiko barra): Hizkuntza hautatzailea eta erabiltzaile menua
  - **Content** (edukia): `<router-outlet>` orri bakoitzeko

- **Menu dinamikoa**: Erabiltzailearen rolaren arabera
  - GOD/ADMIN: Hasiera, Erabiltzaileak, Bilerak, Profila
  - TEACHER: Hasiera, Bilerak, Ordutegia, Ikasleak, Profila
  - STUDENT: Hasiera, Bilerak, Ordutegia, Profila

- **Hizkuntza hautatzailea**:
  - EU (Euskera), ES (Gaztelania), EN (Ingelesa)
  - Uneko hizkuntza markatu ✓

- **Erabiltzaile menua**:
  - Erabiltzailearen izena eta rola
  - Profila ikusi
  - Saioa itxi

### `shared/components/confirm-dialog.component.ts`
**Baieztapen dialogoa**:
- **Erabilera**: Ezabaketa ekintzak baieztatzeko
- **Parametroak**: title, message, confirmText, cancelText
- **Emaitza**: true (baieztatu) edo false (ezeztatu)

---

## 🌍 Environments (Inguruneak)

### `environments/environment.ts`
**Produkzio ingurunea**:
```typescript
production: true
apiUrl: 'http://10.5.104.100:3000/api'
database: { host: '10.5.104.100', name: 'elordb' }
mapbox: { accessToken: 'YOUR_MAPBOX_TOKEN_HERE' }
```

### `environments/environment.development.ts`
**Garapen ingurunea**:
```typescript
production: false
apiUrl: 'http://10.5.104.100:3000/api'
database: { host: '10.5.104.100', name: 'elordb' }
enableMockData: false  // true jarri mock datuak erabiltzeko
enableDebugLogs: true
```

---

## 🌐 Internazionalizazioa (i18n)

### `public/assets/i18n/eu.json`
**Euskerazko itzulpenak**:
- Aplikazio osoko testu guztiak euskeraz
- Egitura hierarkikoa: APP, MENU, USER, ROLE, MEETING, SCHEDULE, etab.

### `public/assets/i18n/es.json`
**Gaztelaniazko itzulpenak**:
- Testu guztiak gaztelaniaz

### `public/assets/i18n/en.json`
**Ingelesezko itzulpenak**:
- Testu guztiak ingelesez

**Erabileraren adibidea**:
```html
{{ 'USER.NAME' | translate }}  → "Izena" (eu) / "Nombre" (es) / "Name" (en)
```

---

## 🎨 Estiloak

### `src/styles.css`
**Estilo globalak**:
- Angular Material tema lehenetsia
- CSS aldagaiak (koloreak, tarteak)
- Reset eta normalizazio estiloak
- Utilitate klaseak
- Responsive diseinua

### Osagai estiloak
Osagai bakoitzak bere CSS fitxategia du:
- `*.component.css`: Osagaia bakarrerako estiluak
- Scoped estiluak (Angular-ek isolatzen ditu)

---

## 🔒 Segurtasuna

### Enkriptazioa
- **RSA enkriptazioa**: Pasahitzak bidaltzeko
- **Web Crypto API**: Nabigatzailearen API natiboa erabiltzen du
- **Gako publikoa**: PEM formatuan

### Autentifikazioa
- **JWT Token**: (oraingoz mock, inplementatu behar da)
- **LocalStorage**: Saioa persistitzeko
- **Guards**: Bide babestuak
- **Interceptors**: HTTP eskaera guztiak babestuak

### Autorizazioa
- **Rol sistema**: GOD, ADMIN, TEACHER, STUDENT
- **Rol hierarkia**: GOD > ADMIN > TEACHER > STUDENT
- **Ekintza baimenekin**: Bakoitzak bere baimenekin

---

## 📊 Datu Fluxua

### 1. Erabiltzailea saioa hasten du
```
LoginComponent → AuthService.login()
→ CryptoUtil.encryptWithPublicKey() (pasahitza enkriptatu)
→ API/Mock autentifikazioa
→ localStorage.setItem('currentUser')
→ currentUser signal eguneratu
→ Router.navigate('/dashboard')
```

### 2. Datu bat eskuratzea
```
Component → Service.getData()
→ HTTP Request (authInterceptor gehitzen du header-ak)
→ loadingInterceptor aktibatzen du spinner-a
→ API/Mock emaitza
→ errorInterceptor erroreak kudeatu
→ Component Signal eguneratu
→ View eguneratzen da automatikoki
```

### 3. Datu bat gordetzea
```
Component → Dialog-a ireki
→ Formularioa bete
→ Dialog.close(data)
→ Component → Service.saveData(data)
→ HTTP Request
→ Emaitza jaso
→ Zerrenda eguneratu
```

---

## 🚀 Exekutatzeko Komandoak

```bash
# Dependentziak instalatu
npm install

# Garapen zerbitzaria (http://localhost:4200)
npm start
# edo
ng serve

# Produkziorako build-a
npm run build
# edo
ng build

# Test unitarioak
npm test
# edo
ng test
```

---

## 📝 Oharrak Garrantzitsuak

### Mock vs API
- **Mock modua**: `environment.enableMockData = true` jarri
- **API modua**: `environment.enableMockData = false` jarri
- Mock moduak localStorage erabiltzen du

### Standalone Components
- Aplikazio osoa Standalone Components erabiltzen ditu
- Ez dago NgModule-ik
- Import guztiak osagai bakoitzean zuzenean

### Signals
- Angular Signals erabiltzen dira egoera kudeaketarako
- RxJS Observable-ek baino errazagoak
- Change Detection automatikoa

### Material Design
- Angular Material 20 erabiltzen da
- Osagai guztiak Material Design-ekoak dira
- Tema pertsonalizatua estiloak bidez

---

## 🔄 Hobetu Beharrekoak

1. **Backend Integrazioa**: Benetako API inplementatu
2. **JWT Tokens**: Token sistema sendoagoa
3. **File Upload**: Argazkiak kargatzeko sistema
4. **Real-time Updates**: WebSocket konexioak
5. **PWA**: Progressive Web App bihurtu
6. **Tests**: Unit eta E2E test gehiago
7. **Performance**: Lazy loading hobetu
8. **Accessibility**: A11y hobekuntzak

---

**Dokumentu hau:** ElorAdmin aplikazioaren fitxategi guztien azalpena
**Data:** 2026-01-14
**Bertsioa:** 1.0
**Hizkuntza:** Euskera
