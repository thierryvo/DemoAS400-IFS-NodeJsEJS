// ==========================================================================================================
// DEMO_USER  (AS400 CRUD avec EJS) NodeJS Express                                      http://localhost:3000
// ==========================================================================================================
// dossier: /home/tvo/demo-user
// fichier: serveur/utils/gestionCaracteres.js                                                                                               
// ==========================================================================================================
// FONCTIONS DE GESTION DES Caracteres
// ===============================================================================================
// string encodageDeThierry(win) : win est encodé vers un string résultat
// string DECODAGEDeThierry(win) : win est décod" vers un string résultat
// -----------------------------------------------------------------------------------------------
//
// GLOBAL
const tabCaracteres = [
 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 
 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
 'é', 'è', 'ë', 'ê', 'ô', 'ö', 'ñ', 'à', 'ä', 'â', 'î', 'ï', 'ù', 'û', 'ü', 'ÿ', 'ç', '&', '(', '-', '_', ')', '=', '^', '¨', 
 '$', '£', '%', '*', 'µ', '<', '>', ',', '?', ';', '.', ':', '/', '!', '§', '#', '{', '[', '|', '`', '@', ']', '}', '\ ',
 '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
//
// encodage --------------------------------------------------------------------------------------------------------------------------
exports.encodageDeThierry = function (win) {
    // const     wwin      = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZéèëêôöñàäâî';
    // resultat, wencodage = 'éèëêôöñàäâîïùûüÿç&(-_)=^¨$£%*µ<>,?;.:/!§#{[|`@]} 0123456789abcd'
    //
    // TEST
    // let win = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZéè';
    // let wencodage = encodageDeThierry(win);
    // console.log('resultat, wencodage='+wencodage);
    // let wledecodage = decodageDeThierry(wencodage);
    // console.log('resultat, wledecodage='+wledecodage);
    
    // win = 'bonjour';
    // wencodage = encodageDeThierry(win);
    // console.log('resultat, wencodage='+wencodage);
    // wledecodage = decodageDeThierry(wencodage);
    // console.log('resultat, wledecodage='+wledecodage);
  
    // win = 'Xfileswhishbone__##@==01';
    // wencodage = encodageDeThierry(win);
    // console.log('resultat, wencodage='+wencodage);
    // wledecodage = decodageDeThierry(wencodage);
    // console.log('resultat, wledecodage='+wledecodage);
    //
    //
    //
    const tabCarIn = win.split('');
    let   tabCar2 = [];
    const avance = 52;
    //
    // BOUCLE sur chaque caratères: tabCarIn
    let longueur = win.length
    for(let pas = 0; pas < longueur; pas++ ){
        // 
        // trouver l'indice de chaque caractères
        const car = tabCarIn[pas];
        const pos = tabCaracteres.indexOf(car); // -1       -1 si NON Trouvé
        if(pos === -1){ console.log('-----NON Trouvé----- car='+car); }
        //
        // remplacer par le cartère 52 positions plus loins  (BORNE LIMLITE suppérieur 112 - si 113 alors: 0) 
        let pos2 = 0;
        if(pos<=58){ pos2 = pos + avance; }       
        if(pos>58){ pos2 = pos + avance - 111; }   
        //
        // remplacement
        tabCar2[pas] = tabCaracteres[pos2];    
    }
    // RETOUR:
    const wjoindre = tabCar2.join('');
    return wjoindre;
}
//
// decodage --------------------------------------------------------------------------------------------------------------------------
// enlever '\'  et '^'
exports.decodageDeThierry = function (win) {
    // const     wwin      = 'éèëêôöñàäâîïùûüÿç&(-_)=^¨$£%*µ<>,?;.:/!§#{[|`@]} 0123456789abcd'
    // resultat, wdecodage = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZéèëêôöñàäâî';
    const tabCarIn = win.split('');
    let   tabCar2 = [];
    const recule = 52;
    //
    // BOUCLE sur chaque caratères: tabCarIn
    let longueur = win.length
    for(let pas = 0; pas < longueur; pas++ ){
        // 
        // trouver l'indice de chaque caractères
        const car = tabCarIn[pas];
        const pos = tabCaracteres.indexOf(car); // -1       -1 si NON Trouvé
        if(pos === -1){ console.log('-----NON Trouvé----- car='+car); }
        //
        // remplacer par le cartère 52 positions moins loins  (BORNE LIMLITE inférieur 0  -> si -1 alors: 112) 
        let pos2 = 0;
        if(pos>51){ pos2 = pos - recule; }
        if(pos<=51){ pos2 = pos - recule + 111; }
        //
        // remplacement
        tabCar2[pas] = tabCaracteres[pos2];    
    }
    // RETOUR:
    const wjoindre = tabCar2.join('');
    return wjoindre;
}
//
//
exports.testCaracteres = function () {
    console.log('--------------test-------------------------------------------------------');
    // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String/split
    console.log('Découpage d une chaine en tableau de caratères : string.split()----------');
    const string1 = 'bonjour toi';
    const tabCar = string1.split('');
    console.log('contenu de string1='+string1);
    console.log('apres un string1.split(),  contenu de tabCar=');
    console.log(tabCar);
    console.log('--------------test--------------------------------------------------------');    
    console.log('Recherche un élement (le premier) dans un tableau---array.find()----------');
    // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/find
    const tableau1 = [5, 10, 15, 20, 25, 30, 35];
    const sValeur = tableau1.find((element) => element > 10); // renvoir le premier, soit: 15
    console.log(sValeur);
    console.log('--------------test-------------------------------------------------------------------');    
    console.log('Recherche l Index d un élement (le premier) dans un tableau---array.findIndex()------');
    // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
    const array1 = [5, 12, 8, 130, 44];
    let isLargeNumber = (element) => element > 13;
    const lindex = array1.findIndex(isLargeNumber);         // devrait être 130  donc son index: 3
    console.log('lindex=');
    console.log(lindex);

    console.log('isLargeNumber=');
    console.log(isLargeNumber.toString());  // (element) => element > 13   
        // Expected output: 3

    console.log('recherche de la posisiotn de 44 -- array1.findIndex(isLargeNumber); ')
    isLargeNumber = (element) => element = 44;
    const laposition = array1.findIndex(isLargeNumber);         // devrait être 4
    console.log(laposition);


    console.log('--------------test-------------------------------------------------------------------');    
    // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
    // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
    // avec exemple interactif
    console.log("Recherche l indice d une valeur    tabAnimeaux.indexOf('cheval')--------------------");
    const tabAnimeaux = ['Cheval', 'cheval', 'tortue', 'chien', 'chat', 'cheval'];
    const positionDuCheval = tabAnimeaux.indexOf('cheval'); // 1
    const positionDuChevalApartirdeQuatre = tabAnimeaux.indexOf('cheval', 4); // 5
    const positionDeGiraffe = tabAnimeaux.indexOf('giraffe'); // -1       -1 si NON Trouvé

    console.log("avectabAnimeaux[] =  'Cheval', 'cheval', 'tortue', 'chien', 'chat', 'cheval'  .   ");
    console.log('le tableaux commence à zéro')
    console.log('positionDuCheval='+positionDuCheval); // 1
    console.log('positionDuChevalApartirdeQuatre='+positionDuChevalApartirdeQuatre); // 5
    console.log('positionDeGiraffe='+positionDeGiraffe); // -1


    console.log('--------------test-------------------------------------------------------------------');    
    // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/join
    // avec exemple interactif
    console.log("joindre les éléments d'un tableau .join('') tabCar.join('')-------------------");
    const tabCarac = ['a', 'b', 'c', 'd', 'e', 'f'];
    const wjoindre = tabCarac.join(''); // abcdef

    console.log("tabCar[]= 'a', 'b', 'c', 'd', 'e', 'f'   .  wjoindre = tabcar.join('')    ");
    console.log('wjoindre='+wjoindre); // abcdef

    console.log('--------------test-------------------------------------------------------');
}


// ==================================================
// isDateIso8: test si c'est une date iso 8a aaaammjj
// ==================================================
exports.isDateIso8 = function (win) {
    // renvoie un boolean
    // true si c'est une date iso aaaammjj
    // false sinon    
    // déterminer le format que le user à bien voulu saisir
    const longueur = win.length;    
    switch (longueur) {                        
        case 8:
            if ( (win.substring(3-1, 3)=='/') && (win.substring(6-1, 6)=='/') ) {
                // format: __/__/__ not iso
                return false;
            } else {
                // format attendu: aaaammjj
                const aaaa = win.substring(1-1, 4);
                const mm = win.substring(5-1, 6);                
                const jj = win.substring(7-1, 8);                                
                if ((isJourValide(jj, mm, aaaa)==true) && (isMoisValide(mm)==true) && (isAnnee4aValide(aaaa)==true)) {
                    return true;
                } else {
                    return false;
                }
            }
            break;
        default:
            return false;  
    }
    return false;
}




// ==================================== local ====================================
// ====================================
// isAnneeValide: 00 à 99
// ====================================
isAnneeValide = function (annee) {
    if ( (annee>=0) && (annee<=99) ) {
        return true;
    } else {
        return false;
    }
}
// ====================================
// isAnneeValide: 1900 à 2199
// ====================================
isAnnee4aValide = function (annee) {
    if ( (annee>=1900) && (annee<=2199) ) {
        return true;
    } else {
        return false;
    }
}
// ====================================
// isMoisValide: 01 à 12
// ====================================
isMoisValide = function (mois) {
    if ( (mois>=1) && (mois<=12) ) {
        return true;
    } else {
        return false;
    }
}
