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


To do:
- Aktuell würden alle Gruppen geladen werden. Das ist quatsch, es dürfen nur die Gruppen geladen werden, in der man Teilnehmer ist.
- Vieles mehr :D
