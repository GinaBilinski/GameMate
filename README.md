Gina 21.2.2025
- Events werden jetzt **nach Datum** sortiert 
- Vergangene Events werden nicht mehr in geplanten Events angezeigt
- Gruppenübersicht zeigt jetzt Gruppen **nach nächstem Event** sortiert
- Gruppen mit Mitglieder erstellen 
- Events erstellen

-----------------------------------------

Gina / 17.02.2025
# Navigation.tsx, home.tsx
Ich habe eine Drawer-Navigation eingefügt (Seitenmenü mit Hamburger-Icon) 

# Authentication.tsx, Settings.tsx
Beide Unterseiten erstellt 

-----------------------------------------
Nico / 13.02.2025
# HomeScreen, CreateGroupScreen und GroupOverview basics
Es kann jetzt eine Gruppe erstellt werden und es werden automatisch alle Gruppen aus der Firestore Database gezogen und angezeigt.
Hierfür habe ich GroupTile.tsx in components erstellt. Diese Tiles sind klickbar und leiten einen an die Gruppenübersicht weiter :)

# Navigation.tsx erstellt
Ich habe die Navigation aus der app.tsx ausgelagert.

-----------------------------------------
Gina / 12.02.2025
# Firebase Einrichtung für das Projekt
1. Ich muss dich in Firebase mit deiner Gmail als Owner hinzufügen.
2. Du musst eine .env Datei im Root-Ordner deines Projekts erstellen.
3. Die Firebase-Schlüssel findest du in Firebase → Projekteinstellungen
        FIREBASE_API_KEY=XXXXXXXXXXXXXXXXXXXX
        FIREBASE_AUTH_DOMAIN=XXXXXXXXXXXXXXXXXXXX
        FIREBASE_PROJECT_ID=XXXXXXXXXXXXXXXXXXXX
        FIREBASE_STORAGE_BUCKET=XXXXXXXXXXXXXXXXXXXX
        FIREBASE_MESSAGING_SENDER_ID=XXXXXXXXXXXX
        FIREBASE_APP_ID=1:XXXXXXXXXXXX:web:XXXXXXXXXXXX
        FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
4. "npm install react-native-dotenv" ausführen --> Bibliothek ermöglicht Umgebungsvariablen aus einer .env-Datei in deinem React-Native-Projekt zu nutzen
- gina

-----------------------------------------
Nico / 10.02.2025
# authStore.ts
Login und logout Logik

# eventStore.ts
Speichert alle Events in der App. Events gehören zu einer Gruppe und enthalten Informationen wie Host, Datum, Teilnehmer, Spiele und Essen.
Hier würden vermutlich auch die Funktionen für Abstimmungen und abwechselnde Gastgeber eingepflegt werden.

Firestore speichert die Events, während Zustand den schnellen Zugriff im Frontend ermöglicht.
# groupStore.ts
Speichert alle Gruppen, die erstellt wurden. Eine Gruppe hat aktuell Mitglieder und Events
Hier würde vermutlich auch die Chat Logic implementiert werden.

Gruppen werden in Firestore verwaltet und in Zustand für schnelle Abfragen zwischengespeichert.
# userStore.ts
Speichert alle Benutzer. Verknüpft Benutzer mit Gruppen und Events über IDs (nicht über Types um doppelte Daten zu vermeiden, ist effizienter).

# firebaseConfig.ts
Enthält die Firebase-Konfiguration für Authentifizierung und Firestore. Ist noch nicht eingerichtet.
