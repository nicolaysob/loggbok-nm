Dette er et internt loggbok- og rapportsystem for et norsk vaktmesterfirma med to eiere og noen få ansatte.

Stack: Next.js App Router, TypeScript, Prisma, PostgreSQL, Tailwind. Deployes på Vercel.

Regler:
- Hele grensesnittet skal være på norsk. Norske datoformater. kr som valuta.
- Kode og variabelnavn på engelsk, kommentarer på norsk der de forklarer noe.
- Mobil først. Hovedbrukeren står ute på et anlegg med hansker og regn. Store trykkflater, minimalt med skriving.
- Hold komponenter små nok til å leses i én skjerm.
- Ikke bygg funksjonalitet jeg ikke har bedt om. Foreslå gjerne, men ikke implementer på eget initiativ.
- Ett steg om gangen. Vis meg planen før du skriver mange filer.

Datamodell — regler som ikke kan uttrykkes i Prisma-schemaet:
- `LogEntry.hours` er nullable i databasen, men arbeidslogg (`WORK_LOG`) krever timer. Dette håndheves i applikasjonslaget. Kommentarbok (`COMMENT_BOOK`) kan ha `hours = null`.
- Bruk alltid `prisma migrate`, aldri `prisma db push`. CHECK-constrainten som sikrer at et `Photo` henger på nøyaktig én forelder (`logEntryId` eller `issueId`) finnes bare i migrasjonsfilene, ikke i schemaet. `db push` synker direkte fra schemaet og vil stille droppe den.

@AGENTS.md
