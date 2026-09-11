# Yhteenveto — Harmsun siemenet -migraatio (2026-09-10)

## Sovellus (siemenhallinta)

**Valmis ja testattu paikallisesti:**
- Supabase → oma Express-backend UpCloud-Postgresilla (JWT-auth, moni-käyttäjätuki, käyttäjäkohtaisesti rajatut CRUD-reitit)
- Kuvat SFTP:n yli rajoitetulle UpCloud-käyttäjälle (`siemen-images`, chroot, ei shell-pääsyä)
- Uusi kukkasipulit-ominaisuus: omat "Siemenet"/"Sipulit"-välilehdet, kategoriat ja alakategoriat itse lisättäviä/poistettavia molemmille tyypeille, Istutukset-välilehden tyyppisuodatin
- Alkuperäinen Supabase-projekti oli jo kadonnut etukäteen → uusi kanta lähti tyhjänä, ei datamigraatiota

**Jäljellä ennen tuotantoa:**
1. Kahden oikean käyttäjän luonti (sähköpostit + väliaikaissalasanat annettava erikseen)
2. Loppujen näkymien kunnollinen testaus (muokkaus/poisto, Hoitoloki, Kalenteri, Tilastot)
3. Testidatan siivous (`uitest@example.com`-tili)
4. Vasta sitten: branchin `upcloud-migration` merge masteriin, `siemen-api` Renderiin, Netlifyn `VITE_API_URL`-päivitys, tuotantotestaus

**Git**: kaikki koodi committoitu ja pushattu GitHubiin branchille `upcloud-migration` (Harmsu/siemenhallinta). Master koskematon sisällöltään.

## Git-identiteetti-insidentti (korjattu)

Tällä koneella git ei ollut koskaan asetettu käyttämään henkilökohtaista sähköpostia, joten se päätteli automaattisesti työnantajan verkkotunnuksen (`vivicta.com`). Tämä näkyi useissa committeissa kolmessa eri repossa. Korjattu:

| Repo | Tilanne |
|---|---|
| **siemenhallinta** | Täysin korjattu ja pushattu (molemmat branchit) |
| **HIFF** | Täysin korjattu ja pushattu (kaikki 19 committia) |
| **uintiharjoittelu** | `vivicta.com` korjattu ja pushattu. Yksi vanha `tietoevry.com`-commit korjattu paikallisesti, pushi vielä tekemättä (säästetään build-minuutteja, tehdään seuraavan oikean deployn yhteydessä) |

Globaali git-asetus (`user.email = sanna.kuusela@iki.fi`) on korjattu pysyvästi tälle koneelle.

## Muistiin tallennettu (Claude Code -automuisti)

- `C:\Users\SannaKuusela\.claude\projects\C--Users-SannaKuusela\memory\project_siemenhallinta.md`
- `C:\Users\SannaKuusela\.claude\projects\C--Users-SannaKuusela\memory\feedback_git_identity_never_work_email.md`
