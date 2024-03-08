// ==========================================================================================================
// DEMO_USER  (AS400 CRUD avec EJS) NodeJS Express                                      http://localhost:3000
// ==========================================================================================================
// dossier: /home/tvo/demo-user
// fichier: serveur/utils/user-validation.js                                                                                               
// ==========================================================================================================
// import des modules necessaire
// const User = require("../models/user");
const dba = require('idb-pconnector');
const { IN, NUMERIC, CHAR } = require('idb-pconnector');
//
// GLOBAL:
// AS400 **
// ========== CONNEXION IBMi =============
const dbaConnection = new dba.Connection().connect();
const BIBDU400 = process.env.AS400_BIB;                                         // 'TVO'
//
// mot de passe
const bcrypt = require('bcryptjs');
//
//
/*****************************************/
// validation: Auth User
exports.validationAuthUser = async function (theBody) {
    let tabDesZones = ['N','N'];
    // 1:
    // CONTROLE: le corps de la demande doit être au format: { email: 'email', passe: 'passe' }
    if (!theBody.hasOwnProperty('EMAIL') ||
        !theBody.hasOwnProperty('PASSE')) {
            // ERREUR: il manque des zones dans le body
            const message = "Votre demande n'a pas été formatée correctement." +
                            " Passer dans le body: EMAIL, PASSE";
            return {tabDesZones, message};
    }
    //
    // controle des tailles
    const min = 3;
    let max = 60;
    let longueur = 0;
    //
    // email
    longueur = theBody.EMAIL.trim().length;
    if(longueur < min ){
        const message = "Votre EMAIL est trop court, taille minimum (" + min + ")."
        tabDesZones[0]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre EMAIL est trop long, taille maximum (" + max + ")."
        tabDesZones[0]='O';
        return {tabDesZones, message};
    }
    // passe
    max = 20;
    longueur = theBody.PASSE.trim().length;
    if(longueur < min ){
        const message = "Votre PASSE est trop court, taille minimum (" + min + ")."
        tabDesZones[1]='O';                                                
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre PASSE est trop long, taille maximum (" + max + ")."
        tabDesZones[1]='O';                                                
        return {tabDesZones, message};
    }
    if (!isPasseValide(theBody.PASSE.trim())){
        const message = "Votre PASSE est invalide, il contien un caractère d'échappement \\ ou ^."
        tabDesZones[1]='O';                                                
        return {tabDesZones, message};
    }
    //
    // try catch acces fichier
    try {        
        // 2: 
        // retrouver le user en base de données (par son email unique) 
        // ==> pour savoir si mot de passe est correct
        let dbStatement; 
        dbStatement = dbaConnection.getStatement();
        const tabUser = await dbStatement.exec("SELECT EMAIL, PASSE, UID FROM " + BIBDU400 + ".USER1 WHERE EMAIL = '" + theBody.EMAIL +"'");
        if (tabUser && tabUser.length === 0) {
            const message = "cet user n'existe pas pour cet email ("+theBody.EMAIL+")."   
            tabDesZones[0]='O';             
            return {tabDesZones, message};
        }
        // 3:                
        // CONTROLE des mots de passe, ils doivent être identique
        const mdpRecu = theBody.PASSE;
        const mdpBasededonnee = tabUser[0].PASSE;
        const resultat = await bcrypt.compare(mdpRecu, mdpBasededonnee);
        if(resultat === false){            
            const message = "cet user n'existe pas pour cet email/passe ("+theBody.EMAIL+" / "+theBody.PASSE+")."    
            tabDesZones[1]='O';            
            return {tabDesZones, message};
        }
        //
        //
        // OK: retour d'un message vide        
        const message = "";
        return {tabDesZones, message};
    } catch (error) {
        //
        const message2 = "ERREUR en catch User - (user-validation.js) validationAuthUser() - " + 
        " authentification - " + 
        " erreur en catch interne au serveur, error =(" + error.message + ")."     
        console.log(message2);
        
        const message = "erreur catch, cet user n'existe pas pour cet email/passe ("+theBody.EMAIL+" / "+theBody.PASSE+")."  
        return {tabDesZones, message};   
    }
}
//
//
/*****************************************/
// validation: Add USer
exports.validationAddUser = async function (theBody) {    
    let tabDesZones = ['N','N','N','N','N','N','N'];
    // CONTROLE: le corps de la demande doit être au format:
    //           { NOM: 'nom', PRENOM: 'prénom', PSEUDO: 'pseudo', TELEPHONE: 'telephone', EMAIL: 'email', PASSE: 'passe', DETAIL: 'detail'  }
    if (!theBody.hasOwnProperty('NOM') || 
        !theBody.hasOwnProperty('PRENOM') ||
        !theBody.hasOwnProperty('PSEUDO') ||
        !theBody.hasOwnProperty('TELEPHONE') ||
        !theBody.hasOwnProperty('EMAIL') ||
        !theBody.hasOwnProperty('PASSE') ||
        !theBody.hasOwnProperty('DETAIL')) {
            // ERREUR: il manque des zones dans le body
            const message = "Votre demande n'a pas été formatée correctement." + 
                            " Passer dans le body: NOM, PRENOM, PSEUDO, TELEPHONE, EMAIL, PASSE, DETAIL" + 
                            " (en majuscule pour le 400)";            
            return {tabDesZones, message};
    } 
    //
    // contrôle des tailles
    const min = 3;
    let max = 60;
    let longueur = 0;
    //
    // nom
    longueur = theBody.NOM.trim().length;
    if(longueur < min ){
        const message = "Votre NOM est trop court, taille minimum (" + min + ")."
        tabDesZones[0]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre NOM est trop long, taille maximum (" + max + ")."
        tabDesZones[0]='O';
        return {tabDesZones, message};
    }
    //
    // prenom
    longueur = theBody.PRENOM.trim().length;
    if(longueur < min ){
        const message = "Votre PRENOM est trop court, taille minimum (" + min + ")."
        tabDesZones[1]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre PRENOM est trop long, taille maximum (" + max + ")."
        tabDesZones[1]='O';
        return {tabDesZones, message};
    }
    //
    // pseudo
    longueur = theBody.PSEUDO.trim().length;
    if(longueur < min ){
        const message = "Votre PSEUDO est trop court, taille minimum (" + min + ")."
        tabDesZones[2]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre PSEUDO est trop long, taille maximum (" + max + ")."
        tabDesZones[2]='O';
        return {tabDesZones, message};
    }
    //
    // téléphone   
    max = 15;    
    longueur = theBody.TELEPHONE.trim().length;
    if(longueur < min ){
        const message = "Votre TELEPHONE est trop court, taille minimum (" + min + ")."
        tabDesZones[3]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre TELEPHONE est trop long, taille maximum (" + max + ")."
        tabDesZones[3]='O';
        return {tabDesZones, message};
    }            
    //
    // email
    max = 60; 
    longueur = theBody.EMAIL.trim().length;
    if(longueur < min ){
        const message = "Votre EMAIL est trop court, taille minimum (" + min + ")."
        tabDesZones[4]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre EMAIL est trop long, taille maximum (" + max + ")."
        tabDesZones[4]='O';
        return {tabDesZones, message};
    }
    //
    // passe
    max = 20; 
    longueur = theBody.PASSE.trim().length;
    if(longueur < min ){
        const message = "Votre PASSE est trop court, taille minimum (" + min + ")."
        tabDesZones[5]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre PASSE est trop long, taille maximum (" + max + ")."
        tabDesZones[5]='O';
        return {tabDesZones, message};
    }
    //
    // détail   
    max = 200;
    longueur = theBody.DETAIL.trim().length;
    if(longueur < min ){
        const message = "Votre DETAIL est trop court, taille minimum (" + min + ")."
        tabDesZones[6]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre DETAIL est trop long, taille maximum (" + max + ")."
        tabDesZones[6]='O';
        return {tabDesZones, message};
    }    
    //    
    // AUTRES CONTROLES BASE DE DONNES ET COHERANCES BDD
    // =================================================
    // try catch accès fichiers (tables) IBMi AS400 UDB-DB2    
    try {            
        // Cohérence email: l'email doit être unique, il faut rechercher si cette email n'Existe pas déjà
        // si Existe c'est une erreur
        let dbStatement; 
        dbStatement = dbaConnection.getStatement();
        const tabUser1 = await dbStatement.exec("SELECT EMAIL, UID FROM " + BIBDU400 + ".USER1 WHERE EMAIL = '" + theBody.EMAIL +"'");
        if (tabUser1 && tabUser1.length != 0) {
            // if(oUser1 != null){
            // MESSAGE: 
            const message = "GENERATION d'une Clé en double, cet email (" + theBody.EMAIL + 
                            ") existe déjà pour un autre user avec id (" + tabUser1[0].UID + ").";            
            tabDesZones[4]='O';             
            return {tabDesZones, message}; 
        }                         
        //                
        // Cohérence pseudo: le pseudo doit être unique, il faut rechercher si ce pseudo n'Existe pas déjà
        // si Existe c'est une erreur
        dbStatement = dbaConnection.getStatement();
        const tabUser2 = await dbStatement.exec("SELECT PSEUDO, UID FROM " + BIBDU400 + ".USER1 WHERE PSEUDO = '" + theBody.PSEUDO +"'");
        if (tabUser2 && tabUser2.length != 0) {
            // if(oUser2 != null){
            // MESSAGE: 
            const message = "GENERATION d'une Clé en double, ce pseudo (" + theBody.PSEUDO + 
                            ") existe déjà pour un autre user avec id (" + tabUser2[0].UID + ").";
            tabDesZones[2]='O';             
            return {tabDesZones, message};    
        }
        //
        // OK: pas d'erreur
        // retour d'un message vide + tabDesZones (en erreur) à N
        const message = "";
        return {tabDesZones, message};                   
    } catch (error) {                  
        // MESSAGE catch:                        
        const message = "ERREUR en catch User - (user-validation.js) validationAddUser() - " + 
        " ajout - " + 
        " erreur en catch interne au serveur, error =(" + error.message + ")."                                                   
        return {tabDesZones, message};         
    }    
}

/*****************************************/
// validation: Update User
exports.validationUpdateUser = async function (theBody) {
    let tabDesZones = ['N','N','N','N','N','N','N'];
    // https://testdemogitbook.gitbook.io/restify/new-tutorial-2-rest-apis-and-the-ibm-i
    // CONTROLE: le corps de la demande doit être au format:
    //           { NOM: 'nom', PRENOM: 'prénom', PSEUDO: 'pseudo', TELEPHONE: 'telephone', EMAIL: 'email', PASSE: 'passe', DETAIL: 'detail'  }
    if (!theBody.hasOwnProperty('NOM') || 
        !theBody.hasOwnProperty('PRENOM') ||
        !theBody.hasOwnProperty('PSEUDO') ||
        !theBody.hasOwnProperty('TELEPHONE') ||
        !theBody.hasOwnProperty('EMAIL') ||
        !theBody.hasOwnProperty('PASSE') ||
        !theBody.hasOwnProperty('DETAIL')) {
            // ERREUR: il manque des zones dans le body
            const message = "Votre demande n'a pas été formatée correctement." + 
                            " Passer dans le body: NOM, PRENOM, PSEUDO, TELEPHONE, EMAIL, PASSE, DETAIL";            
            return {tabDesZones, message};
    }
    //
    // contrôle des tailles
    const min = 3;
    let max = 60;
    let longueur = 0;
    //
    // nom
    longueur = theBody.NOM.trim().length;
    if(longueur < min ){
        const message = "Votre NOM est trop court, taille minimum (" + min + ")."
        tabDesZones[0]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre NOM est trop long, taille maximum (" + max + ")."
        tabDesZones[0]='O';
        return {tabDesZones, message};
    }
    //
    // prenom
    longueur = theBody.PRENOM.trim().length;
    if(longueur < min ){
        const message = "Votre PRENOM est trop court, taille minimum (" + min + ")."
        tabDesZones[1]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre PRENOM est trop long, taille maximum (" + max + ")."
        tabDesZones[1]='O';
        return {tabDesZones, message};
    }
    //
    // pseudo
    longueur = theBody.PSEUDO.trim().length;
    if(longueur < min ){
        const message = "Votre PSEUDO est trop court, taille minimum (" + min + ")."
        tabDesZones[2]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre PSEUDO est trop long, taille maximum (" + max + ")."
        tabDesZones[2]='O';
        return {tabDesZones, message};
    }
    //
    // téléphone   
    max = 15;    
    longueur = theBody.TELEPHONE.trim().length;
    if(longueur < min ){
        const message = "Votre TELEPHONE est trop court, taille minimum (" + min + ")."
        tabDesZones[3]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre TELEPHONE est trop long, taille maximum (" + max + ")."
        tabDesZones[3]='O';
        return {tabDesZones, message};
    }  
    //
    // email
    max = 60; 
    longueur = theBody.EMAIL.trim().length;
    if(longueur < min ){
        const message = "Votre EMAIL est trop court, taille minimum (" + min + ")."
        tabDesZones[4]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre EMAIL est trop long, taille maximum (" + max + ")."
        tabDesZones[4]='O';
        return {tabDesZones, message};
    }
    //
    // passe
    max= 20;
    longueur = theBody.PASSE.trim().length;
    if(longueur < min ){
        const message = "Votre PASSE est trop court, taille minimum (" + min + ")."
        tabDesZones[5]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre PASSE est trop long, taille maximum (" + max + ")."
        tabDesZones[5]='O';
        return {tabDesZones, message};
    }
    //
    // détail   
    max = 200;
    longueur = theBody.DETAIL.trim().length;
    if(longueur < min ){
        const message = "Votre DETAIL est trop court, taille minimum (" + min + ")."
        tabDesZones[6]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre DETAIL est trop long, taille maximum (" + max + ")."
        tabDesZones[6]='O';
        return {tabDesZones, message};
    }    
    //    
    // AUTRES CONTROLES BASE DE DONNES ET COHERANCES BDD
    // =================================================
    // try catch accès fichiers (tables) IBMi AS400 UDB-DB2
    try {        
        // Cohérence email: la modification email ne doit pas tomber sur l'email d'un autre id déjà existant
        // si Existe c'est une erreur
        let dbStatement; 
        dbStatement = dbaConnection.getStatement();
        const tabUser1 = await dbStatement.exec("SELECT EMAIL, UID FROM " + BIBDU400 + ".USER1 WHERE EMAIL = '" + theBody.EMAIL +"'");
        if (tabUser1 && tabUser1.length != 0) {   
            // if(oUser1 != null)             
            // SI email trouvé sur un autre id alors: c'est une erreur
            if(tabUser1[0].EMAIL.trim() === theBody.EMAIL.trim() & tabUser1[0].UID != theBody.UID ){                    
                // KO
                // MESSAGE: 
                const message = "Cohérence de Clé, cet email (" + theBody.EMAIL +
                                ") existe déjà pour un autre user différent avec id (" + tabUser1[0].UID + ").";                        
                tabDesZones[4]='O';             
                return {tabDesZones, message};                       
            }
        }
        //                
        // Cohérence pseudo: la modification pseudo ne doit pas tomber sur le pseudo d'un autre id déjà existant
        // si Existe c'est une erreur
        dbStatement = dbaConnection.getStatement();
        const tabUser2 = await dbStatement.exec("SELECT PSEUDO, UID FROM " + BIBDU400 + ".USER1 WHERE PSEUDO = '" + theBody.PSEUDO +"'");
        if (tabUser2 && tabUser2.length != 0) {  
            // if(oUser2 != null)                  
            // SI pseudo trouvé sur un autre id alors: c'est une erreur                        
            if(tabUser2[0].PSEUDO.trim() === theBody.PSEUDO.trim() & tabUser2[0].UID != theBody.UID ){                    
                // KO
                // MESSAGE: 
                const message = "Cohérence de Clé, ce pseudo (" + theBody.PSEUDO +
                                ") existe déjà pour un autre user différent avec id (" + tabUser2[0].UID + ").";
                tabDesZones[2]='O';             
                return {tabDesZones, message};                          
            }
        } 
        //
        // OK: pas d'erreur
        // retour d'un message vide + tabDesZones (en erreur) à N
        const message = "";
        return {tabDesZones, message};                       
    } catch (error) {
        // MESSAGE catch:                        
        const message = "ERREUR en catch User - (user-validation.js) validationUpdateUser() - " + 
        " modification - " + 
        " erreur en catch interne au serveur, error =(" + error.message + ")."                                                   
        return {tabDesZones, message};         
    }    
}

/*****************************************/
// validation: formatage Data Update USer
exports.formatageDataUpdateUser = function (unUser) {
    // OK:
    // TAILLE DES ZONES:
    // =================
    let max = 0;
    let longueur = 0;
    let tabMsgVar = [];
    //

    longueur = unUser.nom.trim().length;
    max = 60;
    if(longueur>max){ 
        unUser.nom = unUser.nom.substring(1-1, max); 
        tabMsgVar.push('contenu de la variable NOM trop long - NOM a été tronqué à '+max);        
    }

    longueur = unUser.prenom.trim().length;
    max = 60;
    if(longueur>max){ 
        unUser.prenom = unUser.prenom.substring(1-1, max); 
        tabMsgVar.push('contenu de la variable PRENOM trop long - PRENOM a été tronqué à '+max);
    }

    longueur = unUser.pseudo.trim().length;
    max = 60;
    if(longueur>max){ 
        unUser.pseudo = unUser.pseudo.substring(1-1, max); 
        tabMsgVar.push('contenu de la variable PSEUDO trop long - PSEUDO a été tronqué à '+max);
    }    

    longueur = unUser.email.trim().length;
    max = 60;
    if(longueur>max){ 
        unUser.email = unUser.email.substring(1-1, max); 
        tabMsgVar.push('contenu de la variable EMAIL trop long - EMAIL a été tronqué à '+max);
    }      

    longueur = unUser.passe.trim().length;
    max = 60;
    if(longueur>max){ 
        unUser.passe = unUser.passe.substring(1-1, max); 
        tabMsgVar.push('contenu de la variable PASSE trop long - PASSE a été tronqué à '+max);
    }     

    longueur = unUser.telephone.trim().length;
    max = 15;
    if(longueur>max){ 
        unUser.telephone = unUser.telephone.substring(1-1, max); 
        tabMsgVar.push('contenu de la variable TELEPHONE trop long - TELEPHONE a été tronqué à '+max);
    }      

    longueur = unUser.detail.trim().length;
    max = 200;
    if(longueur>max){ 
        unUser.detail = unUser.detail.substring(1-1, max); 
        tabMsgVar.push('contenu de la variable DETAIL trop long - DETAIL a été tronqué à '+max);
    }

    //
    // RETOUR:
    return tabMsgVar;
}

// ==================================== local ====================================
// ==============================================
// isPasseValide: Rejet de certains caractères
// ==============================================
isPasseValide = function (win) {
    const tabCarIn = win.split('');
    //
    // BOUCLE sur chaque caratères: tabCarIn
    let longueur = win.length
    for(let pas = 0; pas < longueur; pas++ ){
        // 
        // test caractère par caractère
        if(tabCarIn[pas] === '\\'){ return false; } // Rejet du caractère d'échapement '\'
        if(tabCarIn[pas] === '^'){ return false; }  // Rejet du chapeau chinois sans ça lettre ('ê'  est autorisé )
        //
        // suivant
    }
    // RETOUR: OK    
    return true;
}


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