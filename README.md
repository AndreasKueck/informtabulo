# Ret-apo "Radio, televido kaj pli" kaj Android-apo "Pri radio"

Tio chi estas la Guglo-Apoj-Skripto-pakajho por la supre menciitaj apoj.

Temas pri simpla [informtabulo pri radio, televido kaj pli](https://script.google.com/a/~/macros/s/AKfycbxtEV2wARkUP-eM7a4s4pKAEDzLpL5kH6RcejkGD6Y_Mo6pttkMJWeY89KUbJyQzDe-Vw/exec). Uzantoj povas kontribui per afishoj kaj komentoj.

## Tampermonkey-skripto por Esperanta interfaco de diskutoj ("Discussions")

La deponejo ankau disponigas Tampermonkey-skripton, kiu tradukas multajn anglajn interfacajn tekstojn de la [diskutpagharо](https://github.com/AndreasKueck/informtabulo/discussions) kaj ghiaj subpaghoj en Esperanton.

### Funkcioj

- Tradukas navigadajn elementojn, butonojn, menuojn, helptekstojn kaj lokokupilojn de enigkampoj.
- Prilaboras ankau poste shargitajn interfacajn elementojn kaj la internan navigadon de GitHub sen plena paghoreshargo.
- Celas lasi netushitaj la titolojn kaj enhavojn de diskutoj, komentojn, kodon kaj tekstojn enigitajn de uzantoj.
- Aldonas faldeblan kaj shoveblan lingvan helpilon kun tradukoj de tekstoj, kiujn la automata tradukado eble ne rekonas.
- Klarigas la serchajn operatorojn `is:` kaj `category:`, kiuj devas resti anglalingvaj en serchdemandoj.

### Instalado

1. Instalu la retumilan etendajhon [Tampermonkey](https://www.tampermonkey.net/).
2. Malfermu la skriptodosieron kun la finajho `.user.js` en chi tiu deponejo.
3. Alklaku la butonon **Raw** por malfermi la krudan dosierenhavon.
4. Konfirmu la instaladon en Tampermonkey.
5. Malfermu au reshargu la [diskutpagharon](https://github.com/AndreasKueck/informtabulo/discussions).

Se la instalilo ne malfermighas automate, kreu novan skripton en Tampermonkey, anstatauigu la ekzemplan enhavon per la tuta skriptokodo kaj konservu ghin.

### Uzado de la lingva helpilo

La helpilo komence aperas malsupre dekstre. Alklaku ghian titolon por faldi au malfaldi ghin.

Per la shovilo super la titolo vi povas movi la helpilon per muso au fingro, por ke ghi ne kovru gravan paghoenhavon. Vi povas ankau fokusi la shovilon per la taboklavo kaj movi ghin per la sagoklavoj. Kun premita `Shift` la movoj estas pli grandaj.

Post plena paghoreshargo la helpilo denove aperas en sia komenca pozicio.

### Privateco kaj amplekso

La skripto funkcias loke en via retumilo. Ghi ne entenas pasvortojn au alirjhetonojn kaj mem ne sendas datumojn al eksteraj tradukservoj.

La tradukoj kaj la helpilo estas aktivaj nur en la diskutpagharо de `AndreasKueck/informtabulo`. Ili ne shanghas la enhavon konservitan che GitHub nek la interfacon por aliaj uzantoj.

### Limigoj kaj kontribuoj

La tradukado bazighas sur vortaro kaj elektitaj tekstaj shablonoj. Ghi ne estas kompleta traduko de GitHub. Iuj tekstoj povas resti anglalingvaj, ekzemple se GitHub dividas ilin inter pluraj HTML-elementoj.

Shanghoj de la GitHub-interfaco povas necesigi adaptadon de la skripto. Mankantajn tradukojn oni povas aldoni en la sekcio `DICTIONARY`; pliajn klarigojn oni povas aldoni al la lingva helpilo.

Bonvenas proponoj, korektoj kaj problemraportoj en la [diskutoj](https://github.com/AndreasKueck/informtabulo/discussions).
## Permesilo ("License")

Chi tiu projekto estas publikigita sub la [MIT-permesilo](./LICENSE).

Vi estas libera uzi, modifi kaj distribui chi tiun projekton, se vi konservas la kopirajtan avizon.
