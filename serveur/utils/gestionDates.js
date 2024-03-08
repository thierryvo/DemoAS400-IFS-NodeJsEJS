// ==========================================================================================================
// DEMO_USER  (AS400 CRUD avec EJS) NodeJS Express                                      http://localhost:3000
// ==========================================================================================================
// dossier: /home/tvo/demo-user
// fichier: serveur/utils/gestionDates.js                                                                                               
// ==========================================================================================================
// FONCTIONS DE GESTION DES DATES
// ===============================================================================================
// Boolean isDate(win)      : tester si la saisie utilisateur (win en alpha) est bien une date.
// Boolean isDateIso8(win)  : tester si la saisie utilisateur (win en alpha) est bien une date iso aaaammjj.
// maDate  cvtDate(win, fmt): conversion de date, du format saisie vers le format fmt (fmt = 'aaaammjj')
// -----------------------------------------------------------------------------------------------
//
//
// ========================================
// isDate: test si c'est une date saisie ?
// ========================================
exports.isDate = function (win) {
    // renvoie un boolean
    // true si c'est une date
    // false sinon    
    // déterminer le format que le user à bien voulu saisir
    const longueur = win.length;    
    switch (longueur) {
        case 6:
            // format attendu jjmmaa            
            // la position de début  c'est celle du tableau  qui commence à zéro  -- comme en C   Arf !!  pos - 1
            // et la longueur c'est une position de fin
            const jj = win.substring(1-1, 2);
            const mm = win.substring(3-1, 4);
            const aa = win.substring(5-1, 6);
            const aaaa = "20"+aa;
            if ((isJourValide(jj, mm, aaaa)==true) && (isMoisValide(mm)==true) && (isAnneeValide(aa)==true)) {
                return true;
            } else {
                return false;
            }                         
        case 8:
            if ( (win.substring(3-1, 3)=='/') && (win.substring(6-1, 6)=='/') ) {
                // format attendu: __/__/__
                const jj = win.substring(1-1, 2);
                const mm = win.substring(4-1, 5);
                const aa = win.substring(7-1, 8);
                const aaaa = "20"+aa;
                if ((isJourValide(jj, mm, aaaa)==true) && (isMoisValide(mm)==true) && (isAnneeValide(aa)==true)) {
                    return true;
                } else {
                    return false;
                }  
            } else {
                // format attendu: jjmmaaaa
                const jj = win.substring(1-1, 2);
                const mm = win.substring(3-1, 4);
                const aaaa = win.substring(5-1, 8);
                if ((isJourValide(jj, mm, aaaa)==true) && (isMoisValide(mm)==true) && (isAnnee4aValide(aaaa)==true)) {
                    return true;
                } else {
                    return false;
                }
            }
            break;
        case 10:        
            // la position de début  c'est celle du tableau  qui commence à zéro  -- comme en C   Arf !!  pos - 1
            // et la longueur c'est une position de fin
            if ( (win.substring(3-1, 3)=='/') && (win.substring(6-1, 6)=='/') ) {
                // format attendu: __/__/____
                const jj = win.substring(1-1, 2);
                const mm = win.substring(4-1, 5);
                const aaaa = win.substring(7-1, 10);                
                if ((isJourValide(jj, mm, aaaa)==true) && (isMoisValide(mm)==true) && (isAnnee4aValide(aaaa)==true)) {
                    return true;
                } else {
                    return false;
                } 
            } else {
                // SINON autres tests
                if ( (win.substring(3-1, 3)=='-') && (win.substring(6-1, 6)=='-') ) {            
                    // autre format attendu: __-__-____
                    const jj = win.substring(1-1, 2);
                    const mm = win.substring(4-1, 5);
                    const aaaa = win.substring(7-1, 10);
                    if ((isJourValide(jj)==true) && (isMoisValide(mm)==true) && (isAnnee4aValide(aaaa)==true)) {
                        return true;
                    } else {
                        return false;
                    } 
                } else {
                    // KO
                    return false;
                }
            }
            break;
        default:
            return false;  
    }
    return false;
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

exports.cvtDate = function (win, fmt) {
    // renvoie une date au format fmt demandée:
    // SI fmt = 'aaaammjj' renvoie la date sousz ce format: 'aaaammjj'
    let uneDate = "";
    if ((win!="") && (fmt!="")) {
        // déterminer le format que le user à bien voulu saisir
        const longueur = win.length;        
        switch (longueur) {
            case 6:
                // format en ENTREE jjmmaa
                // format en sortie souhaité:
                if (fmt=="aaaammjj") {
                    // format en sortie souhaité: 'aaaammjj'
                    // cvt = convertion de jjmmaa vers aaaammjj
                    const siecle="20";
                    const jj = win.substring(1-1, 2);
                    const mm = win.substring(3-1, 4);
                    const aa = win.substring(5-1, 6);
                    const ww = siecle+aa+mm+jj;
                    uneDate = ww;
                    return uneDate;
                }                                       
            case 8:
                if ( (win.substring(3-1, 3)=='/') && (win.substring(6-1, 6)=='/') ) {
                    // format en ENTREE: __/__/__
                    // format en sortie souhaité:
                    if (fmt=="aaaammjj") {
                        // format en sortie souhaité: 'aaaammjj'
                        // cvt = convertion de jj/mm/aa vers aaaammjj                        
                        const jj = win.substring(1-1, 2);
                        const mm = win.substring(4-1, 5);
                        const aa = win.substring(7-1, 8);
                        const aaaa = "20"+aa;
                        const ww = aaaa+mm+jj;
                        uneDate = ww;
                        return uneDate;
                    }                      
                } else {
                    // format en ENTREE: jjmmaaaa
                    // format en sortie souhaité:
                    if (fmt=="aaaammjj") {
                        // format en sortie souhaité: 'aaaammjj'
                        // cvt = convertion de jjmmaaaa vers aaaammjj
                        const jj = win.substring(1-1, 2);
                        const mm = win.substring(3-1, 4);
                        const aaaa = win.substring(5-1, 8);                        
                        const ww = aaaa+mm+jj;
                        uneDate = ww;
                        return uneDate;
                    }       
                }
                break;
            case 10:
                if ( (win.substring(3-1, 3)=='/') && (win.substring(6-1, 6)=='/') ) {
                    // format en ENTREE: __/__/____
                    // format en sortie souhaité:
                    if (fmt=="aaaammjj") {
                        // format en sortie souhaité: 'aaaammjj'
                        // cvt = convertion de jj/mm/aaaa vers aaaammjj
                        const jj = win.substring(1-1, 2);
                        const mm = win.substring(4-1, 5);
                        const aaaa = win.substring(7-1, 10);                       
                        const ww = aaaa+mm+jj;
                        uneDate = ww;
                        return uneDate;
                    }
                } else {
                    // SINON autres tests
                    if ( (win.substring(3-1, 3)=='-') && (win.substring(6-1, 6)=='-') ) {            
                        // autre format en ENTREE: __-__-____
                        // format en sortie souhaité:
                        if (fmt=="aaaammjj") {
                            // format en sortie souhaité: 'aaaammjj'
                            // cvt = convertion de jj-mm-aaaa vers aaaammjj
                            const jj = win.substring(1-1, 2);
                            const mm = win.substring(4-1, 5);
                            const aaaa = win.substring(7-1, 10);                    
                            const ww = aaaa+mm+jj;
                            uneDate = ww;
                            return uneDate;
                        }         
                    } else {
                        // KO
                        return uneDate;
                    }
                }
                break;
            default:
                return uneDate;  
        }
        return uneDate;
    } else {
        return uneDate;
    }
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
// =======================================
// isJourValide: 01 à 31 ou 30 ou 28 ou 29
// =======================================
isJourValide = function (jour, mois, annee) {
    // Selection 31, 30, 28, 29
    const aaaa = annee;
    if ((mois==1) || (mois==3) ||(mois==5) ||(mois==7) ||(mois==8) ||(mois==10) ||(mois==12)) {
        // mois à 31 jours        
        if ( (jour>=1) && (jour<=31) ) {            
            return true;            
        } else {
            return false;            
        } 
    } else if ((mois==4) ||(mois==6) ||(mois==9) ||(mois==11)) {
        // mois à 30 jours
        if ( (jour>=1) && (jour<=30) ) {
            return true;            
        } else {
            return false;            
        }
    } else if (mois==2) {
        // mois de février
        // 28 ou 29 jours
        if ((annee=2024) || 
            (annee=2028) ||
            (annee=2032) ||
            (annee=2036) ||
            (annee=2040) ||
            (annee=2044) ||
            (annee=2048) ||
            (annee=2052) ||
            (annee=2056) ||
            (annee=2060) ||
            (annee=2064) ||
            (annee=2068) ||
            (annee=2072) ||
            (annee=2076) ||
            (annee=2080) ||
            (annee=2084) ||
            (annee=2088) ||
            (annee=2092) ||
            (annee=2096) ||
            (annee=2100) ||
            (annee=2104) ) {
            // bisextile
            // 29 jours
            if ( (jour>=1) && (jour<=29) ) {
                return true;                
            } else {
                return false;                
            }                 
        } else {
            // NON bisextile
            // 28 jours
            if ( (jour>=1) && (jour<=28) ) {
                return true;                    
            } else {
                return false;                    
            }                 
        }//finsi 28 ou 29 jours
    }//finsi sinonsi mois
}