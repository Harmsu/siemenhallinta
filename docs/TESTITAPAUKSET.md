# Harmsun siemenet - Testitapaukset

## 1. Kirjautuminen

### T1.1 Onnistunut kirjautuminen
**Esiehdot:** Käyttäjätunnus on luotu Supabaseen
**Vaiheet:**
1. Avaa sovellus selaimessa
2. Syötä oikea sähköposti
3. Syötä oikea salasana
4. Klikkaa "Kirjaudu"

**Odotettu tulos:** Käyttäjä ohjataan pääsovellukseen, navigaatiopalkki näkyy

### T1.2 Epäonnistunut kirjautuminen - väärä salasana
**Esiehdot:** -
**Vaiheet:**
1. Avaa sovellus selaimessa
2. Syötä oikea sähköposti
3. Syötä väärä salasana
4. Klikkaa "Kirjaudu"

**Odotettu tulos:** Virheilmoitus "Virheellinen sähköposti tai salasana"

### T1.3 Uloskirjautuminen
**Esiehdot:** Käyttäjä on kirjautunut sisään
**Vaiheet:**
1. Klikkaa "Kirjaudu ulos" -nappia oikeassa yläkulmassa

**Odotettu tulos:** Käyttäjä ohjataan kirjautumissivulle

---

## 2. Siemenet

### T2.1 Uuden siemenen lisääminen
**Esiehdot:** Käyttäjä on kirjautunut sisään
**Vaiheet:**
1. Avaa "Siemenet"-välilehti
2. Klikkaa "+ Lisää siemen"
3. Täytä pakolliset kentät:
   - Nimi: "Tomaatti"
   - Kategoria: "Vihannekset"
   - Istutus alkaa: "Maaliskuu"
   - Istutus päättyy: "Huhtikuu"
4. Klikkaa "Lisää"

**Odotettu tulos:** Siemen näkyy listassa, lomake sulkeutuu

### T2.2 Siemenen lisääminen kuvan kanssa
**Esiehdot:** Käyttäjä on kirjautunut sisään
**Vaiheet:**
1. Avaa siemenen lisäyslomake
2. Täytä pakolliset kentät
3. Klikkaa "Valitse kuva"
4. Valitse kuvatiedosto
5. Klikkaa "Lisää"

**Odotettu tulos:** Siemen näkyy listassa kuvan kanssa

### T2.3 Siemenen muokkaaminen
**Esiehdot:** Listassa on vähintään yksi siemen
**Vaiheet:**
1. Klikkaa siemenkortin kynä-ikonia
2. Muuta siemenen nimeä
3. Klikkaa "Tallenna"

**Odotettu tulos:** Muutettu nimi näkyy kortissa

### T2.4 Siemenen poistaminen
**Esiehdot:** Listassa on vähintään yksi siemen
**Vaiheet:**
1. Klikkaa siemenkortin roskakori-ikonia
2. Vahvista poisto

**Odotettu tulos:** Siemen poistuu listasta

### T2.5 Siemenen kopiointi
**Esiehdot:** Listassa on vähintään yksi siemen
**Vaiheet:**
1. Klikkaa siemenkortin kopioi-ikonia
2. Muuta lajikkeen nimeä
3. Klikkaa "Lisää"

**Odotettu tulos:** Uusi siemen samalla nimellä mutta eri lajikkeella

### T2.6 Siementen haku
**Esiehdot:** Listassa on useita siemeniä
**Vaiheet:**
1. Kirjoita hakukenttään siemenen nimi
2. Tarkista tulokset

**Odotettu tulos:** Vain hakua vastaavat siemenet näkyvät

### T2.7 Siementen suodatus kategorian mukaan
**Esiehdot:** Listassa on siemeniä eri kategorioissa
**Vaiheet:**
1. Klikkaa "Vihannekset"-nappia
2. Tarkista tulokset

**Odotettu tulos:** Vain vihannekset näkyvät

### T2.8 Siementen suodatus alakategorian mukaan
**Esiehdot:** Listassa on siemeniä eri alakategorioissa
**Vaiheet:**
1. Klikkaa "Vihannekset"
2. Klikkaa "Tomaatti" alakategoriana

**Odotettu tulos:** Vain tomaatit näkyvät

### T2.9 Uuden alakategorian lisääminen
**Esiehdot:** Käyttäjä on kirjautunut sisään
**Vaiheet:**
1. Avaa siemenen lisäyslomake
2. Valitse kategoria "Vihannekset"
3. Klikkaa alakategorian vieressä olevaa + -nappia
4. Kirjoita "Sipuli"
5. Klikkaa "Lisää"

**Odotettu tulos:** "Sipuli" valittuna alakategoriana, näkyy jatkossa valikossa

---

## 3. Istutuspaikat

### T3.1 Uuden istutuspaikan lisääminen
**Esiehdot:** Käyttäjä on kirjautunut sisään
**Vaiheet:**
1. Avaa "Paikat"-välilehti
2. Klikkaa "+ Lisää paikka"
3. Täytä kentät:
   - Nimi: "Kasvihuone"
   - Kuvaus: "Lämmitetty kasvihuone"
   - Valoisuus: "Aurinkoinen"
4. Klikkaa "Lisää"

**Odotettu tulos:** Paikka näkyy listassa

### T3.2 Istutuspaikan muokkaaminen
**Esiehdot:** Listassa on vähintään yksi paikka
**Vaiheet:**
1. Klikkaa paikan kynä-ikonia
2. Muuta kuvausta
3. Klikkaa "Tallenna"

**Odotettu tulos:** Muutettu kuvaus näkyy kortissa

### T3.3 Istutuspaikan poistaminen
**Esiehdot:** Listassa on vähintään yksi paikka
**Vaiheet:**
1. Klikkaa paikan roskakori-ikonia
2. Vahvista poisto

**Odotettu tulos:** Paikka poistuu listasta

---

## 4. Istutukset

### T4.1 Uuden istutuksen lisääminen
**Esiehdot:** Siemeniä ja paikkoja on lisätty
**Vaiheet:**
1. Avaa "Istutukset"-välilehti
2. Klikkaa "+ Lisää istutus"
3. Valitse siemen
4. Valitse paikka
5. Valitse päivämäärä
6. Klikkaa "Lisää"

**Odotettu tulos:** Istutus näkyy listassa

### T4.2 Pikalistutus siemenkortista
**Esiehdot:** Siemeniä ja paikkoja on lisätty
**Vaiheet:**
1. Avaa "Siemenet"-välilehti
2. Valitse siemenkortin "Istutuspaikka..." -valikosta paikka

**Odotettu tulos:** Istutus luodaan, käyttäjä ohjataan "Istutukset"-välilehdelle

### T4.3 Istutuksen tilan muuttaminen
**Esiehdot:** Istutuksia on lisätty
**Vaiheet:**
1. Klikkaa istutuksen kynä-ikonia
2. Muuta tila "Esikasvatuksessa" → "Istutettu maahan"
3. Klikkaa "Tallenna"

**Odotettu tulos:** Uusi tila näkyy istutuskortissa

### T4.4 Istutuksen poistaminen
**Esiehdot:** Istutuksia on lisätty
**Vaiheet:**
1. Klikkaa istutuksen roskakori-ikonia
2. Vahvista poisto

**Odotettu tulos:** Istutus ja sen hoitomerkinnät poistuvat

---

## 5. Hoitoloki

### T5.1 Hoitomerkinnän lisääminen
**Esiehdot:** Istutuksia on lisätty
**Vaiheet:**
1. Avaa istutuskortin hoitoloki-osio
2. Klikkaa "+ Merkintä"
3. Valitse päivämäärä
4. Valitse tyyppi: "Kastelu"
5. Klikkaa "Lisää"

**Odotettu tulos:** Merkintä näkyy hoitolokissa

### T5.2 Hoitomerkinnän poistaminen
**Esiehdot:** Hoitomerkintöjä on lisätty
**Vaiheet:**
1. Klikkaa merkinnän roskakori-ikonia

**Odotettu tulos:** Merkintä poistuu listasta

---

## 6. Kalenteri

### T6.1 Kalenterinäkymän avaaminen
**Esiehdot:** Istutuksia on lisätty
**Vaiheet:**
1. Klikkaa "Kalenteri"-välilehteä

**Odotettu tulos:** Kalenteri näkyy, istutukset merkitty päiviin

### T6.2 Päivän valitseminen
**Esiehdot:** Istutuksia on lisätty
**Vaiheet:**
1. Klikkaa päivää kalenterissa

**Odotettu tulos:** Päivän tapahtumat näkyvät sivupalkissa

### T6.3 Istutuksen lisääminen kalenterista
**Esiehdot:** Siemeniä ja paikkoja on lisätty
**Vaiheet:**
1. Klikkaa päivää kalenterissa
2. Klikkaa "+ Istutus"
3. Täytä tiedot
4. Klikkaa "Lisää"

**Odotettu tulos:** Istutus luodaan valitulle päivälle

### T6.4 Kuukauden vaihtaminen
**Esiehdot:** -
**Vaiheet:**
1. Klikkaa ">" -nappia kalenterin yläpuolella

**Odotettu tulos:** Seuraava kuukausi näkyy

---

## 7. Responsiivisuus

### T7.1 Mobiililaite (puhelin)
**Esiehdot:** -
**Vaiheet:**
1. Avaa sovellus puhelimen selaimessa
2. Testaa kaikki toiminnot

**Odotettu tulos:** Sovellus toimii ja näkyy oikein

### T7.2 Tabletti
**Esiehdot:** -
**Vaiheet:**
1. Avaa sovellus tabletin selaimessa
2. Testaa kaikki toiminnot

**Odotettu tulos:** Sovellus toimii ja näkyy oikein

### T7.3 Työpöytä
**Esiehdot:** -
**Vaiheet:**
1. Avaa sovellus tietokoneen selaimessa
2. Testaa kaikki toiminnot

**Odotettu tulos:** Sovellus toimii ja näkyy oikein

---

## 8. PWA

### T8.1 Asennus iPhoneen
**Esiehdot:** Sovellus on julkaistu
**Vaiheet:**
1. Avaa sovellus Safarilla
2. Napauta jakamis-ikonia
3. Valitse "Lisää Koti-valikkoon"
4. Napauta "Lisää"

**Odotettu tulos:** Kuvake ilmestyy kotinäytölle

### T8.2 Sovelluksen avaaminen kotinäytöltä
**Esiehdot:** Sovellus on asennettu kotinäytölle
**Vaiheet:**
1. Napauta sovelluksen kuvaketta kotinäytöllä

**Odotettu tulos:** Sovellus avautuu ilman selaimen osoitepalkkia

---

## 9. Datan synkronointi

### T9.1 Data näkyy eri laitteilla
**Esiehdot:** Data on lisätty yhdellä laitteella
**Vaiheet:**
1. Lisää siemen laitteella A
2. Avaa sovellus laitteella B
3. Kirjaudu sisään

**Odotettu tulos:** Lisätty siemen näkyy laitteella B

---

## 10. Virhetilanteet

### T10.1 Verkkoyhteyskatko
**Esiehdot:** Käyttäjä on kirjautunut sisään
**Vaiheet:**
1. Katkaise verkkoyhteys
2. Yritä lisätä siemen

**Odotettu tulos:** Virheilmoitus näytetään

### T10.2 Istunnon vanheneminen
**Esiehdot:** -
**Vaiheet:**
1. Kirjaudu sisään
2. Odota istunnon vanhenemista (tai tyhjennä selaimen tallennus)
3. Yritä käyttää sovellusta

**Odotettu tulos:** Käyttäjä ohjataan kirjautumissivulle
