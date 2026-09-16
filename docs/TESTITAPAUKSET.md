# Harmsun Puutarhapäiväkirja - Testitapaukset

## 1. Kirjautuminen

### T1.1 Onnistunut kirjautuminen
**Esiehdot:** Käyttäjätunnus on luotu `server/scripts/create-user.js`-skriptillä
**Vaiheet:**
1. Avaa sovellus selaimessa
2. Syötä oikea sähköposti
3. Syötä oikea salasana
4. Klikkaa "Kirjaudu"

**Odotettu tulos:** Käyttäjä ohjataan pääsovellukseen, yläpalkin välilehdet näkyvät

### T1.2 Epäonnistunut kirjautuminen - väärä salasana
**Esiehdot:** -
**Vaiheet:**
1. Avaa sovellus selaimessa
2. Syötä oikea sähköposti
3. Syötä väärä salasana
4. Klikkaa "Kirjaudu"

**Odotettu tulos:** Virheilmoitus näytetään, käyttäjää ei kirjata sisään

### T1.3 Uloskirjautuminen
**Esiehdot:** Käyttäjä on kirjautunut sisään
**Vaiheet:**
1. Klikkaa "Kirjaudu ulos" -nappia yläpalkista

**Odotettu tulos:** Käyttäjä ohjataan kirjautumissivulle

### T1.4 Salasanan vaihto
**Esiehdot:** Käyttäjä on kirjautunut sisään
**Vaiheet:**
1. Avaa "Asetukset"-välilehti
2. Klikkaa "Vaihda salasana"
3. Syötä nykyinen salasana ja uusi salasana (väh. 8 merkkiä)
4. Tallenna

**Odotettu tulos:** Salasana vaihtuu, uudella salasanalla voi kirjautua sisään uudelleen; vanha salasana ei enää toimi

---

## 2. Siemenet

### T2.1 Uuden siemenen lisääminen
**Esiehdot:** Käyttäjä on kirjautunut sisään, "Siemenet"-välilehti auki
**Vaiheet:**
1. Klikkaa "+ Lisää siemen"
2. Täytä pakolliset kentät:
   - Nimi: "Tomaatti"
   - Kategoria: "Vihannekset"
   - Istutus alkaa: "Maaliskuu", Istutus päättyy: "Huhtikuu"
3. Klikkaa "Lisää"

**Odotettu tulos:** Siemen näkyy listassa, lomake sulkeutuu, näytetään-laskuri (esim. "Näytetään 5 / 5 siementä") kasvaa yhdellä

### T2.2 Siemenen lisääminen kuvan kanssa
**Esiehdot:** Käyttäjä on kirjautunut sisään
**Vaiheet:**
1. Avaa siemenen lisäyslomake
2. Täytä pakolliset kentät
3. Klikkaa "Valitse kuva", valitse kuvatiedosto
4. Klikkaa "Lisää"

**Odotettu tulos:** Siemen näkyy listassa kuvan kanssa; kuva on pakattu/pienennetty ennen tallennusta

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
2. Vahvista poisto sovelluksen omassa vahvistusikkunassa

**Odotettu tulos:** Siemen poistuu listasta ja näytetään-laskuri pienenee vastaavasti. Testaa myös kotinäytölle asennettuna PWA:na (ks. T8.2) — vahvistusikkunan pitää näkyä ja toimia myös siinä tilassa.

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

**Odotettu tulos:** Vain hakua vastaavat siemenet näkyvät, näytetään-laskurin osoittajaluku (esim. "3 / 33") muuttuu, nimittäjä pysyy ennallaan

### T2.7 Siementen suodatus kategorian mukaan
**Esiehdot:** Listassa on siemeniä eri kategorioissa
**Vaiheet:**
1. Klikkaa "Vihannekset"-nappia

**Odotettu tulos:** Vain vihannekset näkyvät, kategoriarivillä näkyy nyt vain valittu kategoria + "Kaikki"-nappi paluuta varten

### T2.8 Siementen suodatus alakategorian mukaan
**Esiehdot:** Listassa on siemeniä eri alakategorioissa
**Vaiheet:**
1. Klikkaa "Vihannekset"
2. Klikkaa "Tomaatti" alakategoriana

**Odotettu tulos:** Vain tomaatit näkyvät

### T2.9 Uuden kategorian/alakategorian lisääminen ja poistaminen
**Esiehdot:** Käyttäjä on kirjautunut sisään
**Vaiheet:**
1. Avaa siemenen lisäyslomake
2. Klikkaa kategorian vieressä olevaa + -nappia, kirjoita uusi kategoria (esim. "Palkokasvit"), lisää
3. Valitse tämä uusi kategoria, lisää sen alle uusi alakategoria
4. Poista lopuksi juuri lisätty alakategoria/kategoria (jos ei ole käytössä millään siemenellä)

**Odotettu tulos:** Uusi kategoria/alakategoria toimii heti valinnaisena, näkyy jatkossa valikoissa; poisto onnistuu vain jos kategoria/alakategoria ei ole käytössä yhdelläkään siemenellä (muuten virheilmoitus)

---

## 3. Sipulit

Sipulit-välilehti toimii samalla logiikalla kuin Siemenet, mutta omalla, erillisellä datallaan ja kategorialistallaan (sipulityypit, esim. Tulppaani/Lilja/Narsissi/Hyasintti/Helmililja, käyttäjän muokattavissa samaan tapaan kuin siementen kategoriat).

### T3.1 Uuden sipulin lisääminen istutussyvyydellä
**Esiehdot:** "Sipulit"-välilehti auki
**Vaiheet:**
1. Klikkaa "+ Lisää sipuli"
2. Täytä nimi, valitse sipulityyppi (esim. "Tulppaani"), täytä istutussyvyys (cm) ja istutusaika
3. Klikkaa "Lisää"

**Odotettu tulos:** Sipuli näkyy Sipulit-listassa, EI näy Siemenet-listassa eikä Siemenet-välilehden kategoriasuodattimessa

### T3.2 Sipulien ja siementen erillisyys istutuslomakkeessa
**Esiehdot:** Listassa on sekä siemeniä että sipuleita
**Vaiheet:**
1. Avaa "Istutukset"-välilehti, klikkaa "+ Lisää istutus"
2. Avaa siemen/sipuli-pudotusvalikko

**Odotettu tulos:** Valikko on jaettu selkeästi "Siemenet"- ja "Sipulit"-ryhmiin (ei sekaisin yhtenä listana)

---

## 4. Istutuspaikat

### T4.1 Uuden istutuspaikan lisääminen
**Esiehdot:** Käyttäjä on kirjautunut sisään
**Vaiheet:**
1. Avaa "Paikat"-välilehti
2. Klikkaa "+ Lisää paikka"
3. Täytä kentät: Nimi "Kasvihuone", Kuvaus "Lämmitetty kasvihuone", Valoisuus "Aurinkoinen"
4. Klikkaa "Lisää"

**Odotettu tulos:** Paikka näkyy listassa

### T4.2 Istutuspaikan muokkaaminen
**Esiehdot:** Listassa on vähintään yksi paikka
**Vaiheet:**
1. Klikkaa paikan kynä-ikonia, muuta kuvausta, tallenna

**Odotettu tulos:** Muutettu kuvaus näkyy kortissa

### T4.3 Istutuspaikan poistaminen
**Esiehdot:** Listassa on vähintään yksi paikka
**Vaiheet:**
1. Klikkaa paikan roskakori-ikonia, vahvista poisto

**Odotettu tulos:** Paikka poistuu listasta

---

## 5. Istutukset

### T5.1 Uuden istutuksen lisääminen
**Esiehdot:** Siemeniä/sipuleita ja paikkoja on lisätty
**Vaiheet:**
1. Avaa "Istutukset"-välilehti, klikkaa "+ Lisää istutus"
2. Valitse siemen tai sipuli (ks. T3.2), valitse paikka, valitse päivämäärä, syötä määrä
3. Klikkaa "Lisää"

**Odotettu tulos:** Istutus näkyy listassa alkuperäisellä määrällä

### T5.2 Pikalistutus siemenkortista
**Esiehdot:** Siemeniä/sipuleita ja paikkoja on lisätty
**Vaiheet:**
1. Avaa "Siemenet"- tai "Sipulit"-välilehti
2. Valitse kortin "Istutuspaikka..." -valikosta paikka

**Odotettu tulos:** Istutus luodaan suoraan valitulle siemenelle/sipulille

### T5.3 Istutuksen tilan muuttaminen
**Esiehdot:** Istutuksia on lisätty
**Vaiheet:**
1. Klikkaa istutuksen kynä-ikonia
2. Muuta tila "Esikasvatuksessa" → "Istutettu maahan"
3. Klikkaa "Tallenna"

**Odotettu tulos:** Uusi tila näkyy istutuskortissa

### T5.4 Hävikin kirjaaminen (jäljellä oleva määrä)
**Esiehdot:** Istutus, jolla on määrä > 0
**Vaiheet:**
1. Muokkaa istutusta, pienennä "Jäljellä"-kenttää alkuperäistä määrää pienemmäksi
2. Syötä hävikin syy (esim. "tuholaisia")
3. Tallenna

**Odotettu tulos:** Kortissa näkyy "X/Y kpl jäljellä", hävikin syy näkyy kortissa, hoitolokiin syntyy automaattinen hävikki-merkintä

### T5.5 Istutuksen kopiointi ensi vuodelle
**Esiehdot:** Istutus on olemassa
**Vaiheet:**
1. Klikkaa istutuskortin kopiointi-ikonia ("Kopioi ensi vuodelle")

**Odotettu tulos:** Uusi istutus luodaan samalla siemenellä/paikalla, päivämäärä siirretty vuodella eteenpäin

### T5.6 Istutuksen poistaminen
**Esiehdot:** Istutuksia on lisätty
**Vaiheet:**
1. Klikkaa istutuksen roskakori-ikonia, vahvista poisto

**Odotettu tulos:** Istutus, sen hoitomerkinnät ja liitekuvat poistuvat

### T5.7 Istutuslistan suodatus tyypin mukaan
**Esiehdot:** Istutuksia sekä siemenistä että sipuleista
**Vaiheet:**
1. Valitse istutuslistan Kaikki/Siemenet/Sipulit-suodatin

**Odotettu tulos:** Lista suodattuu valitun tyypin mukaan

---

## 6. Istutuskuvat

### T6.1 Kuvan lisääminen istutukseen
**Esiehdot:** Istutus on olemassa
**Vaiheet:**
1. Avaa istutuskortin "Kuvia istutuksesta" -osio
2. Klikkaa "Lisää kuva", valitse kuvatiedosto

**Odotettu tulos:** Kuva latautuu, näkyy pikkukuvana galleriassa päivämäärällä (ei vielä kuvatekstiä); istutuslistan peruslataus ei hidastu (kuvia ei ladata ennen kuin osio avataan)

### T6.2 Kuvatekstin ja päivämäärän muokkaus
**Esiehdot:** Istutuksella on vähintään yksi kuva
**Vaiheet:**
1. Klikkaa pikkukuvaa, avautuu esikatselu
2. Kirjoita kuvateksti, muuta tarvittaessa päivämäärää
3. Klikkaa pois kentästä (tallentuu automaattisesti)

**Odotettu tulos:** Kuvateksti näkyy jatkossa suoraan pikkukuvan alla (ei vain esikatselussa); jos kuvateksti tyhjennetään, pikkukuvan alla näkyy taas kuvauspäivämäärä

### T6.3 Kuvan poistaminen
**Esiehdot:** Istutuksella on vähintään yksi kuva
**Vaiheet:**
1. Avaa kuvan esikatselu, klikkaa "Poista kuva", vahvista

**Odotettu tulos:** Kuva poistuu galleriasta; kuva ei ole enää haettavissa palvelimelta (tiedosto on oikeasti poistettu, ei vain tietokantarivi)

### T6.4 Istutuskuvat eivät sekoitu otsikkokuvaan
**Esiehdot:** Siemenellä/sipulilla on otsikkokuva, siihen liittyvällä istutuksella liitekuvia
**Vaiheet:**
1. Vertaa siemenkortin otsikkokuvaa ja istutuskortin "Kuvia istutuksesta" -galleriaa

**Odotettu tulos:** Nämä ovat selkeästi eri kuvia/eri paikoissa, toisen muuttaminen ei vaikuta toiseen

---

## 7. Hoitoloki

### T7.1 Hoitomerkinnän lisääminen
**Esiehdot:** Istutuksia on lisätty
**Vaiheet:**
1. Avaa istutuskortin hoitoloki-osio, klikkaa "+ Merkintä"
2. Valitse päivämäärä, valitse tyyppi (esim. "Kastelu"), lisää

**Odotettu tulos:** Merkintä näkyy hoitolokissa

### T7.2 Hoitomerkinnän poistaminen
**Esiehdot:** Hoitomerkintöjä on lisätty
**Vaiheet:**
1. Klikkaa merkinnän roskakori-ikonia

**Odotettu tulos:** Merkintä poistuu listasta

---

## 8. Kalenteri

### T8.1 Kalenterinäkymän avaaminen
**Esiehdot:** Istutuksia on lisätty
**Vaiheet:**
1. Klikkaa "Kalenteri"-välilehteä

**Odotettu tulos:** Kalenteri näkyy, istutukset/kylvöajat merkitty päiviin

### T8.2 Päivän valitseminen ja istutuksen lisääminen kalenterista
**Esiehdot:** Siemeniä/sipuleita ja paikkoja on lisätty
**Vaiheet:**
1. Klikkaa päivää kalenterissa, tarkista sivupalkin tapahtumat
2. Klikkaa "+ Istutus", täytä tiedot, lisää

**Odotettu tulos:** Päivän tapahtumat näkyvät, istutus luodaan valitulle päivälle

### T8.3 Kuukauden vaihtaminen
**Vaiheet:**
1. Klikkaa ">" -nappia kalenterin yläpuolella

**Odotettu tulos:** Seuraava kuukausi näkyy

---

## 9. Tilastot

### T9.1 Yhteenveto ja laajennettavat listat
**Esiehdot:** Istutuksia eri tiloissa
**Vaiheet:**
1. Avaa "Tilastot"-välilehti
2. Klikkaa "Istutuksia yhteensä" -korttia

**Odotettu tulos:** Kortti laajenee ja näyttää listan kaikista istutuksista; onnistumisprosentti näkyy jos korjattuja/epäonnistuneita on

### T9.2 Kategoria-, paikka- ja vuositilastot
**Vaiheet:**
1. Selaa Tilastot-sivun kategoria-, paikka- ja vuositauluja, klikkaa rivejä auki

**Odotettu tulos:** Taulukot ryhmittelevät istutukset oikein, rivit laajenevat listaksi

### T9.3 Istuttamattomat siemenet
**Esiehdot:** Osa siemenistä/sipuleista ei ole istutettu kuluvana vuonna
**Vaiheet:**
1. Tarkista Tilastot-sivun "Istuttamattomat siemenet"-osio

**Odotettu tulos:** Listassa näkyvät vain ne, joita ei ole istutettu kuluvana vuonna

---

## 10. Asetukset

### T10.1 CSV-vienti
**Esiehdot:** Siemeniä/sipuleita on lisätty
**Vaiheet:**
1. Avaa "Asetukset"-välilehti
2. Klikkaa "Vie CSV" (Siemenet- tai Sipulit-osiosta)

**Odotettu tulos:** CSV-tiedosto latautuu, sisältää kaikki kyseisen tyypin rivit

### T10.2 CSV-tuonti
**Esiehdot:** Vientitesti (T10.1) tehty
**Vaiheet:**
1. Klikkaa "Tuo CSV", valitse äsken viety tiedosto

**Odotettu tulos:** Ilmoitus tuoduista riveistä näytetään; tuodut rivit näkyvät oikeassa Siemenet/Sipulit-välilehdessä

### T10.3 CSV-tuonnin duplikaattisuodatus
**Esiehdot:** Sama CSV-tiedosto on jo tuotu kertaalleen (T10.2)
**Vaiheet:**
1. Tuo sama CSV-tiedosto uudelleen

**Odotettu tulos:** Ilmoituksessa näkyy, että kaikki (tai osa) rivit ohitettiin duplikaatteina ("Ohitettu N kpl, koska samanlainen oli jo listalla"); listaan ei synny kaksoiskappaleita

### T10.4 Oletusvälilehden valinta
**Vaiheet:**
1. Asetuksista valitse oletusvälilehdeksi "Sipulit"
2. Kirjaudu ulos ja takaisin sisään (tai lataa sivu uudelleen)

**Odotettu tulos:** Sovellus avautuu Sipulit-välilehdelle oletuksena; asetus säilyy selaimen/laitteen `localStorage`issa

---

## 11. Responsiivisuus

### T11.1 Mobiililaite pystyasennossa (esim. 375px, 390px, 414px leveys)
**Vaiheet:**
1. Avaa sovellus puhelimessa (tai selaimen mobiiliemulaatiolla) pystyasennossa
2. Tarkista että kaikki yläpalkin välilehdet ovat käytettävissä (tarvittaessa vierittämällä tabiriviä vaakasuunnassa)
3. Yritä vierittää koko sivua vaakasuunnassa

**Odotettu tulos:** Yläpalkin tabit näkyvät/ovat saavutettavissa myös pystyasennossa (ei tarvitse kääntää puhelinta vaakatasoon); koko sivu EI pääse vierimään vaakasuunnassa, ei jää valkoista tyhjää tilaa reunaan

### T11.2 Mobiililaite vaakatasossa
**Vaiheet:**
1. Käännä puhelin vaakatasoon, testaa peruskäyttö

**Odotettu tulos:** Sovellus toimii ja näkyy oikein

### T11.3 Tabletti
**Vaiheet:**
1. Avaa sovellus tabletin selaimessa, testaa peruskäyttö

**Odotettu tulos:** Sovellus toimii ja näkyy oikein

### T11.4 Työpöytä
**Vaiheet:**
1. Avaa sovellus tietokoneen selaimessa, testaa peruskäyttö

**Odotettu tulos:** Sovellus toimii ja näkyy oikein

---

## 12. PWA

### T12.1 Asennus iPhoneen
**Esiehdot:** Sovellus on julkaistu
**Vaiheet:**
1. Avaa sovellus Safarilla
2. Napauta jakamis-ikonia, valitse "Lisää Koti-valikkoon", napauta "Lisää"

**Odotettu tulos:** Kuvake ilmestyy kotinäytölle

### T12.2 Sovelluksen avaaminen kotinäytöltä ja poistotoiminnot standalone-tilassa
**Esiehdot:** Sovellus on asennettu kotinäytölle
**Vaiheet:**
1. Napauta sovelluksen kuvaketta kotinäytöllä
2. Sovelluksen pitäisi avautua ilman selaimen osoitepalkkia
3. Testaa jonkin rivin poisto (esim. siemen) tässä tilassa — ks. T2.4

**Odotettu tulos:** Sovellus avautuu standalone-tilassa; poisto toimii ja vahvistusikkuna näkyy normaalisti (aiemmin natiivi `window.confirm()` ei näyttänyt mitään standalone-tilassa, minkä takia poisto ei koskaan käynnistynyt — tämä on korjattu, syytä testata nimenomaan tässä tilassa muutosten jälkeen)

---

## 13. Datan synkronointi

### T13.1 Data näkyy eri laitteilla
**Esiehdot:** Data on lisätty yhdellä laitteella
**Vaiheet:**
1. Lisää siemen laitteella A
2. Avaa sovellus laitteella B, kirjaudu samalla tilillä sisään

**Odotettu tulos:** Lisätty siemen näkyy laitteella B

### T13.2 Käyttäjien datan eristys
**Esiehdot:** Kaksi eri käyttäjätiliä
**Vaiheet:**
1. Lisää siemen käyttäjätilillä A
2. Kirjaudu ulos, kirjaudu sisään käyttäjätilillä B

**Odotettu tulos:** Käyttäjä B ei näe käyttäjän A dataa, ja päinvastoin

---

## 14. Virhetilanteet

### T14.1 Verkkoyhteyskatko
**Esiehdot:** Käyttäjä on kirjautunut sisään
**Vaiheet:**
1. Katkaise verkkoyhteys
2. Yritä lisätä siemen

**Odotettu tulos:** Virheilmoitus näytetään, sovellus ei kaadu

### T14.2 Istunnon vanheneminen
**Vaiheet:**
1. Kirjaudu sisään
2. Odota istunnon (JWT:n) vanhenemista, tai tyhjennä selaimen `localStorage`
3. Yritä käyttää sovellusta

**Odotettu tulos:** Käyttäjä ohjataan kirjautumissivulle

### T14.3 Backendin hetkellinen tietokantayhteyskatko
**Esiehdot:** Backend on käynnissä, testataan vain kehitysympäristössä (esim. SSH-tunneli katkaistaan hetkeksi)
**Vaiheet:**
1. Katkaise backendin tietokantayhteys hetkeksi (esim. sulje SSH-tunneli)
2. Yritä tehdä pyyntö sovelluksesta samaan aikaan
3. Palauta yhteys

**Odotettu tulos:** Yksittäinen pyyntö epäonnistuu virheellä, mutta koko backend-prosessi EI kaadu — seuraavat pyynnöt yhteyden palauduttua toimivat normaalisti
