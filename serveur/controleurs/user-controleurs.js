// ==========================================================================================================
// DEMO_USER  (AS400 CRUD avec EJS) NodeJS Express                                      http://localhost:3000
// ==========================================================================================================
// dossier: /home/tvo/demo-user
// fichier: serveur/controleurs/user-controleurs.js                                                                                               
// ==========================================================================================================
// import des modules necessaire
// const User = require("../models/user");
const dba = require('idb-pconnector');
// AS400 **
// ========== CONNEXION IBMi =============
const dbaConnection = new dba.Connection().connect();
const BIBDU400 = process.env.AS400_BIB;                                         // 'TVO'
const { IN, NUMERIC, CHAR } = require('idb-pconnector');

// Authentificatioin et mot de passe
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {cvtDate} = require('../utils/gestionDates');
const {testCaracteres, encodageDeThierry, decodageDeThierry} = require('../utils/gestionCaractères');
const {validationAddUser, validationUpdateUser, validationAuthUser} = require('../utils/user-validations');

// GLOBAL:
require('dotenv').config({path: './serveur/config/.env'})
const urlprefixe_appli = process.env.URL_PREFIXE_APPLI;
const urlprefixe_user  = process.env.URL_PREFIXE_USER;
const urlIndex = urlprefixe_appli + urlprefixe_user     + "/"                   // "/demo-user/user/"
const urlRecherche = urlprefixe_appli + urlprefixe_user + "/user-recherche"     // "/demo-user/user/user-recherche"
const urlabout = urlprefixe_appli + urlprefixe_user     + "/about"              // "/demo-user/user/about"

const urlconnexion = urlprefixe_appli + urlprefixe_user       + '/auth'         // "/demo-seq/user/auth"
const urldeconnexion = urlprefixe_appli + urlprefixe_user     + '/deco'         // "/demo-seq/user/deco"

// -----------------------------------------------------------------------------------------------------------
// -----------------------------------FORMULAIRE ejs Authentification  + POST --------------------------------
/*****************************************/
// GET  soumettreAuthFormulaire
exports.soumettreAuthFormulaire = async (req, res) => {
  const tabDesErreurs = req.flash('infoErreur');
  const tabDesDonnees = req.flash('infoDonnees');
  const tabDesZones = req.flash('tabDesZonesEnErreur');
  const urlActionAuth = urlprefixe_appli + urlprefixe_user + '/auth'               //  "/demo-user/user/auth" 
  const adrrip = 
        req.headers['cf-connecting-ip'] ||  
        req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress || '';

  // AFFICHAGE DU FORMULAIRE DE SAISIE d'un USER
  // RENDRE la PAGE: user/auth   --> qui va POSTER '/demo-user/user/auth'
  //
  // CHARGER les zones au cas où: on viens d'un redirect sur  erreur
  // PREMIER passage à BLANC
  let EMAIL = '';
  let PASSE = '';
  const IPADRR = adrrip;
  // AUTRES passages après redirect sur erreur (il faut conserver les données du body)
  if(tabDesDonnees != ''){
    EMAIL = tabDesDonnees[0].EMAIL;
    PASSE = tabDesDonnees[0].PASSE;
  }
  const oConnexionUser = {
    EMAIL: EMAIL,
    PASSE: PASSE,
    IPADRR: IPADRR
  }
  // PAGE
  const oTemplateData = {
    titre: "CONEXION USER",
    description: "Demo SQL AS400 avec ejs layout et idb-pconnector table users",
    urlIndex: urlIndex,
    urlabout: urlabout,
    urlRecherche: urlRecherche,
    urlActionAuth: urlActionAuth,
    tabDesErreurs: tabDesErreurs,
    tabDesZones: tabDesZones,
    r_user: oConnexionUser
  }
  //
  // RENDRE le Formulaire: de AUTHENTIFGICATION d'un user
  res.status(200).render("user/auth", oTemplateData);
};  

/*****************************************/
// POST  authUser
exports.authUser = async (req, res) => {
  // CONTROLE: le corps de la demande doit être au format { email: 'email', passe: 'passe' }
  // récupérre les données + valider avec joi
  const {body} = req;
  const {EMAIL, PASSE, IPADRR} = req.body;
  const {tabDesZones, message} = await validationAuthUser(body);
  if(message != ""){
    // ERREUR + redirection
    await req.flash("infoErreur", message);
    await req.flash("tabDesZonesEnErreur", tabDesZones);
    await req.flash('infoDonnees', { 
      EMAIL: EMAIL,
      PASSE: PASSE
    });
    return res.redirect(urlconnexion);
  }
  //
  // DATA OK:
  try {
    // GENERER le token d authentification--------------------------------------------
    require('dotenv').config({path: '../config/.env'})
    // RECHERCHE du user par son email: il existe Obligatoirement car déjà contrôlé avant)
    let dbStatement; 
    dbStatement = dbaConnection.getStatement();
    const tabUser = await dbStatement.exec("SELECT NOM, PRENOM, EMAIL, UID FROM " + BIBDU400 + ".USER1 WHERE EMAIL = '" + EMAIL +"'");
    const oUser = tabUser[0];
    const phraseSecrète = process.env.JWT_SECRET; //'foo'
    const duree = process.env.JWT_DUREE; // 4 hour
    const token = jwt.sign({                       
            id: oUser.UID,
            NOM: oUser.NOM,
            PRENOM: oUser.PRENOM,
            PSEUDO: oUser.PSEUDO,
            EMAIL: oUser.EMAIL,      
            phraseSecrète: phraseSecrète,
    }, phraseSecrète, { expiresIn: duree });
    // AJOUTER le token d authentification à: Utilisateur en train de se connecter (moi)
    // this.tabTokens.push({ token })
    // SAUVEGARDER ce token (Objet de connexion )--------------------------------------
    const oConnexion = {
            id: oUser.UID,
            nom: oUser.NOM,
            prenom: oUser.PRENOM,
            token: token                  
    }
    //
    // SAUVEGARDE: de l'Objet de connexion
    //             - oconnexion dans les cookies      
    //             - oconnexion dans le fichier AS400 tvo.user3
    // -
    const maxAge = 3 * 24 * 60 * 60 * 1000; // 4320000
    res.cookie('jwt', oConnexion.token, { httpOnly: true, maxAge: maxAge });
    res.cookie('oconnexion', oConnexion, { httpOnly: true, maxAge: maxAge });
    // -
    const monTimeStamp = new Date().toLocaleString("fr");       // jj/mm/aaaa hh:mm:ss
    const maDate = monTimeStamp.substring(1-1, 10);             // jj/mm/aaaa
    const monHeure = monTimeStamp.substring(12-1, 19);          // hh:mm:ss
    const bddDate = cvtDate(maDate, "aaaammjj");                // fmt saisie vers aaaammjj  
    //
    const DATE_CON = bddDate;      // aaaammjj
    const DATE_CONNEXION = maDate  // jj/mm/aaaa
    const HEURE_CON = monHeure;    // hhmmss

    dbStatement = dbaConnection.getStatement();
    await dbStatement.prepare(
      "SELECT TOKEN FROM FINAL TABLE(INSERT INTO " + BIBDU400 + 
      ".USER3(TOKEN, UID, NOM, PRENOM, DATE_CON, DATE_CONNEXION, HEURE_CON, ADRESSE)" +
      " VALUES(?, ?, ?, ?, ?, ?, ?, ?)) with NONE");
    await dbStatement.bind([
      [oConnexion.token,  IN, CHAR],
      [oConnexion.id,     IN, NUMERIC],
      [oConnexion.nom,    IN, CHAR],
      [oConnexion.prenom, IN, CHAR],
      [DATE_CON,          IN, CHAR],
      [DATE_CONNEXION,    IN, CHAR],
      [HEURE_CON,         IN, CHAR],
      [IPADRR,            IN, CHAR]
    ]);
    await dbStatement.execute();
    //const newtoken = await dbStatement.execute();         avec commit / rolllback
    //const newtoken = await dbStatement.fetch();
    //await dbStatement.commit();
    //
    //    
    // FAIT: redirection sur index, avec message d'information
    await req.flash("info", "Le user (" + oUser.NOM +", " + oUser.PRENOM + ") a bien été connecté.");
    res.redirect(urlIndex);
    //_______________________________________________________________________________________________
  } catch (error) {      
    // ERREUR CATCH: Message console + return brut pour l'instant
    const message = "ERREUR en catch User - (user-controleur.js) - authUser() - " + 
                    " authentification - " + 
                    " erreur en catch interne au serveur, error =(" + error.message + ").";                  
    console.log(message);
    await req.flash("infoErreur", message);
    return res.redirect(urlconnexion);            
  }
};

/*****************************************/
// POST  logout
exports.logoutUser = async (req, res) => {
  // 1: Vérifier la présence du token (dans les cookies / ou header)
  // 2: Décoder le token sous try-catch
  // 3: Vérifier l'utilisateur présent dans le token, il doit être présent en base
  // 4: Supprimer le token dans user3
  // 5: supprimer le token jwt dans les cookies & le oconnexion

  // 1:        
  const authToken = req.cookies.jwt;
  if ((authToken === null) || (authToken === undefined)) {            
      // ERREUR Absence de token
      // ERREUR + redirection
      console.log('etape 1 : authtoken est null ou undefined  (il n existe pas)-----');

      res.locals.user = null;
      const message = "ERREUR de deconnexion!";
      await req.flash("info", message);        
      return res.redirect(urlIndex);
  }
  // 2:
  const phraseSecrète = process.env.JWT_SECRET; //'foo'
  let decodeToken = undefined;
  try {
      decodeToken = await jwt.verify(authToken, phraseSecrète);
  } catch (error) {
      // KO
      // ERREUR + redirection
      const message = "ERREUR de deconnexion!";
      res.locals.user = null;
      res.cookie('jwt', '', {maxAge: 1});
      await req.flash("info", message);
      return res.redirect(urlIndex);
  }
  if (decodeToken===undefined) {
      // KO, le client (ejs) est déjà informé de l'ERREUR, voir ci-dessus
      // ERREUR + redirection        
      res.locals.user = null;
      const message = "ERREUR de deconnexion!";
      await req.flash("info", message);        
      return res.redirect(urlIndex);
  } 
        
  // 3:
  let dbStatement; 
  dbStatement = dbaConnection.getStatement();
  const tabUser = await dbStatement.exec("SELECT EMAIL, PASSE, UID FROM " + BIBDU400 + ".USER1 WHERE UID = " + decodeToken.id);
  if (tabUser && tabUser.length === 0) {
      // if (oUser === null) {
      // KO
      res.locals.user = null;
      const message = "ERREUR de deconnexion!";
      await req.flash("info", message);        
      return res.redirect(urlIndex);
  }
  //
  const oUser = tabUser[0];
  const oConnexion = {
      id: oUser.UID,
      nom: oUser.NOM,
      prenom: oUser.PRENOM,
      token: authToken                  
  }

  console.log('objet de connexion,  oConnexion=');
  console.log(oConnexion);
  //
  // RECHERCHE et suppression du token
  // delete sans commit (with NONE)
  try {
    dbStatement = dbaConnection.getStatement();
    await dbStatement.exec(
      "DELETE FROM " + BIBDU400 + ".USER3" + 
      " WHERE TOKEN = '" + oConnexion.token + "'" +
      " with NONE"
    );
    // DECONNEXION  = Forcer les deux données dans les cookies à BLANC === Déconnecté
    // * oconnexion = Objet de connexion
    // * jwt        = Token jwt  
    const maxAge = 3 * 24 * 60 * 60 * 1000; // 4320000
    res.cookie('oconnexion', '', { httpOnly: true, maxAge: maxAge });
    res.cookie('jwt', '', { httpOnly: true, maxAge: maxAge });
    //
    //    
    // FAIT: redirection sur index, avec message d'information
    await req.flash("info", "Le user (" + oUser.NOM +", " + oUser.PRENOM + ") a bien été déconnecté.");
    res.redirect(urlIndex);
    // ___________________________________________________________________________________________
  } catch (error) {
    //
    // ERREUR CATCH: Message console + return brut pour l'instant
    const message = "ERREUR en catch User - (user-controleur.js) - logoutUser() - " + 
                    " logout - " + 
                    " erreur en catch interne au serveur, error =(" + error.message + ").";                  
    console.log(message);
    await req.flash("infoErreur", message);
    return res.redirect(urlconnexion);     
  }
}
// -----------------------------------------------------------------------------------------------------------





// -----------------------------------FORMULAIRE ejs + POST --------------------------------------------------
/*****************************************/
// GET  soumettreAddFormulaire
exports.soumettreAddFormulaire = async (req, res) => {
  const tabDesErreurs = req.flash('infoErreur');
  const tabDesDonnees = req.flash('infoDonnees');
  const tabDesZones = req.flash('tabDesZonesEnErreur');
  const urlActionAdd = urlprefixe_appli + urlprefixe_user + '/add'               //  "/demo-user/user/add" 
  // AFFICHAGE DU FORMULAIRE DE SAISIE d'un USER
  // RENDRE la PAGE: user/add   --> qui va POSTER '/demo-user/user/add'
  let oUser = null;
  let derniereMAJour = '';
  if(tabDesDonnees.length === 0){ 
    // PREMIER PASSAGE: en création on est à blanc
    const unUser = {
      NOM: '',
      PRENOM: '',
      PSEUDO: '',
      TELEPHONE: '',
      EMAIL: '',
      PASSE: '',
      DETAIL: ''
    }
    oUser = unUser;
  }
  if(tabDesDonnees.length != 0){ 
    // AUTRES PASSAGES: Après redirection en erreur on rechage depuis le body
    const monTimeStamp = new Date().toLocaleString("fr");  // jj/mm/aaaa hh:mm:ss
    derniereMAJour = monTimeStamp.substring(1-1, 10);      // jj/mm/aaaa
    oUser = tabDesDonnees[0];
  }
  //
  const oTemplateData = {
    titre: "AJOUT USER",
    description: "Demo SQL AS400 avec ejs layout et idb-pconnector table users",
    tabDesErreurs: tabDesErreurs,
    urlIndex: urlIndex,
    urlabout: urlabout,
    urlRecherche: urlRecherche,
    urlActionAdd: urlActionAdd,
    tabDesZones: tabDesZones,
    r_user: oUser
  }
  //
  // RENDRE le Formulaire: de SAISIE d'un user
  res.status(200).render("user/add", oTemplateData);
};
/*****************************************/
// POST  addUser
exports.addUser = async (req, res) => {
  const urlActionAdd = urlprefixe_appli + urlprefixe_user + '/add'               //  "/demo-user/user/add" 
  const body = req.body;
  const {NOM, PRENOM, PSEUDO, TELEPHONE, EMAIL, PASSE, DETAIL, UID} = req.body;
  //
  // CONTROLE: 
  // le corps de la demande doit être au format { NOM: 'nom', PRENOM: 'prénom', .... }
  // + cohérence des données...
  const {tabDesZones, message} = await validationAddUser(body);
  if(message != ""){
    // ERREUR + redirection + Transmission des données déjà saisie  
    await req.flash("infoErreur", message);
    await req.flash("tabDesZonesEnErreur", tabDesZones);
    await req.flash('infoDonnees', {
      NOM: NOM,
      PRENOM: PRENOM,
      PSEUDO: PSEUDO,
      TELEPHONE: TELEPHONE,      
      EMAIL: EMAIL, 
      PASSE: PASSE,
      DETAIL: DETAIL,
      UID: UID
    });    
    return res.redirect(urlActionAdd);
  }
  //
  // DATA OK:
  const monTimeStamp = new Date().toLocaleString("fr");       // jj/mm/aaaa hh:mm:ss
  const maDate = monTimeStamp.substring(1-1, 10);             // jj/mm/aaaa
  const monHeure = monTimeStamp.substring(12-1, 19);          // hh:mm:ss
  const bddDate = cvtDate(maDate, "aaaammjj");                // fmt saisie vers aaaammjj  
  //
  const DATE_CRT = bddDate;     // aaaammjj
  const DATE_CREATION = maDate  // jj/mm/aaaa
  const USER_CRT = PSEUDO;
  try {
    // CRYPTAGE OBLIGATOIRE du mot de passe: dans deux fichiers, user1 & user2 
    const oHash = await bcrypt.hash(PASSE, 8);
    const oHash2 = encodageDeThierry(PASSE);
    if(oHash === null){
      console.log('')
      console.log("addUser, ERREUR: dans le cryptag edu mo de passe")
      return res.send({message: "addUser, ERREUR: dans le cryptag edu mo de passe"});
    }
    //
    const unUser = {
      nom: NOM,
      prenom: PRENOM,
      pseudo: PSEUDO,
      telephone: TELEPHONE,
      email: EMAIL,
      passe: oHash,
      detail: DETAIL
    }
    const unPasse = {
      passe: oHash,
      passe2: oHash2
    }
    // IBMi
    // insert avec: prepare + bind + execute + commit, car, il y a des paramètres
    let dbStatement;
    dbStatement = dbaConnection.getStatement();
    await dbStatement.prepare(
      "SELECT UID FROM FINAL TABLE(INSERT INTO " + BIBDU400 + 
      ".USER1(NOM, PRENOM, PSEUDO, TELEPHONE, EMAIL, PASSE, DETAIL, DATE_CRT, DATE_CREATION, USER_CRT)" +
      " VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)) with NONE");
    await dbStatement.bind([
      [unUser.nom,       IN, CHAR],
      [unUser.prenom,    IN, CHAR],
      [unUser.pseudo,    IN, CHAR],
      [unUser.telephone, IN, CHAR],
      [unUser.email,     IN, CHAR],
      [unUser.passe,     IN, CHAR],
      [unUser.detail,    IN, CHAR],
      [DATE_CRT,      IN, CHAR],
      [DATE_CREATION, IN, CHAR],
      [USER_CRT,      IN, CHAR]
    ]);
    await dbStatement.execute();
    //const newId = await dbStatement.execute();         avec commit / rolllback
    //const newId = await dbStatement.fetch();
    //await dbStatement.commit();
    //
    //
    dbStatement = dbaConnection.getStatement();
    await dbStatement.prepare(
      "SELECT PASSE FROM FINAL TABLE(INSERT INTO " + BIBDU400 + 
      ".USER2(PASSE, PASSE2)" +
      " VALUES(?, ?)) with NONE");
    await dbStatement.bind([
      [unPasse.passe,     IN, CHAR],
      [unPasse.passe2,    IN, CHAR]
    ]);
    await dbStatement.execute();
    //const newId = await dbStatement.execute();         avec commit / rolllback
    //const newId = await dbStatement.fetch();
    //await dbStatement.commit();
    //
    // FAIT: redirection sur index, avec message d'information
    await req.flash("info", "Le user (" + NOM +", " + PRENOM + ") a bien été créé.");
    res.redirect(urlIndex);
  // ____________________________________________________________________________________________________
  } catch (error) {
    // ERREUR
    // ERREUR CATCH: Message console + return brut pour l'instant
    const message = "ERREUR en catch User - (user-controleur.js) - addUser() - " + 
                    " ajout - " + 
                    " erreur en catch interne au serveur, error =(" + error.message + ").";     
    console.log(message);
    await req.flash("infoErreur", message);
    res.redirect(urlIndex);
  }
};
// -----------------------------------------------------------------------------------------------------------



// -----------------------------------------------------------------------------------------------------------
// -----------------------------------FORMULAIRE ejs + PUT ---------------------------------------------------
/*****************************************/
// GET  soumettreUpdateFormulaire: FORMULAIRE edit User
exports.soumettreUpdateFormulaire = async (req, res) => {
  const tabDesErreurs = req.flash('infoErreur');
  const tabDesDonnees = req.flash('infoDonnees');
  const tabDesZones = req.flash('tabDesZonesEnErreur');
  const urlActionEdit = urlprefixe_appli + urlprefixe_user       + "/edit/"       // "/demo-user/user/edit/"    // + ID
  const urlActionDelete = urlprefixe_appli + urlprefixe_user     + "/edit/"       // "/demo-user/user/edit/"    // + ID  
  // AFFICHAGE DU FORMULAIRE DE MODIFICATION d'un USER
  // RENDRE la PAGE: user/edit   --> qui va POSTER '/demo-user/user/edit/' + UID
  // https://testdemogitbook.gitbook.io/restify/new-tutorial-2-rest-apis-and-the-ibm-i  
  const id = req.params.id;
  let oUser = null;   // User base de donnée
  let unUser = null;  // User particulier pour le Formulaire
  let oPasse = null;  // Gestion mot de passe avec les tables user1 & user2
  
  let derniereMAJour = '';
  try {
    // ---Premier-passage-tvo.user1-----------------------------------------------------------------------------------------
    if(tabDesDonnees.length === 0){ 
      // PREMIER PASSAGE: on charge depuis la BDD AS400
      //
      // IBMi ( " with NONE"  sans commit )
      let dbStatement; 
      dbStatement = dbaConnection.getStatement();
      const tabUser = await dbStatement.exec(
        "SELECT NOM, PRENOM, PSEUDO, TELEPHONE, EMAIL, PASSE, DETAIL, DATE_CREATION, DATE_MODIFICA, UID FROM " + BIBDU400 +
        ".USER1 WHERE UID = " + id
      );
      if (!tabUser || tabUser.length === 0) {
        // MESSAGE: user NON trouvé, avec redirection à l'index
        await req.flash("info", "Le user avec id (" + id + ") n'existe pas!!!");
        return res.redirect(urlIndex);
      }
      //
      // passe { Crypté, en clair }
      dbStatement = dbaConnection.getStatement();
      const tabPasse = await dbStatement.exec(
        "SELECT PASSE, PASSE2 FROM " + BIBDU400 +
        ".USER2 WHERE PASSE = '" + tabUser[0].PASSE +"'"
      );
      if (!tabPasse || tabPasse.length === 0) {
        // MESSAGE: user NON trouvé, avec redirection à l'index
        await req.flash("info", "Le user avec id (" + id + ") n'existe pas!!!");
        return res.redirect(urlIndex);
      }
      //
      // retour:
      oUser = tabUser[0];
      oPasse = tabPasse[0];
      let dm = oUser.DATE_MODIFICA;
      if(dm === null){ dm = ""; }  
      derniereMAJour = (dm.trim() === "") ? oUser.DATE_CREATION : oUser.DATE_MODIFICA;
      const sDecode = decodageDeThierry(oPasse.PASSE2);
      unUser = {
        NOM: oUser.NOM,
        PRENOM: oUser.PRENOM,
        PSEUDO: oUser.PSEUDO,
        TELEPHONE: oUser.TELEPHONE,      
        EMAIL: oUser.EMAIL, 
        PASSE: sDecode,
        DETAIL: oUser.DETAIL,
        UID: oUser.UID,
        UIDPASSE: oUser.PASSE
      }
    }    
    // ---Apres-un-redirect-(erreur de data)--------------------------------------------------------------------------------
    if(tabDesDonnees.length != 0){ 
      // AUTRES PASSAGES: Après redirection en erreur on rechage depuis le body
      const monTimeStamp = new Date().toLocaleString("fr");       // jj/mm/aaaa hh:mm:ss
      derniereMAJour = monTimeStamp.substring(1-1, 10);             // jj/mm/aaaa
      unUser = tabDesDonnees[0];
    }
    // OK:
    const oTemplateData = {
      titre: "Modifier les données USER",
      description: "Demo SQL AS400 avec ejs layout et idb-pconnector table users",
      urlIndex: urlIndex,
      urlabout: urlabout,
      urlRecherche: urlRecherche,
      urlActionEdit: urlActionEdit,    
      urlActionDelete: urlActionDelete,
      derniereMAJour: derniereMAJour, 
      tabDesErreurs: tabDesErreurs,
      tabDesZones: tabDesZones,
      r_user: unUser
    }
    //
    // RENDRE le Formulaire: de SAISIE d'un user
    res.status(200).render("user/edit", oTemplateData);
    // ____________________________________________________________________________________________________
  } catch (error) {
    // ERREUR CATCH: Message console + return brut pour l'instant
    console.error("ERREUR catch User soumettreUpdateFormulaire, error=" + error);
    return res.send({message: "User soumettreUpdateFormulaire, ERREUR catch: Erreur interne au serveur, error=", error: error.message});    
  }
};  
/*****************************************/
// PUT  updateOne: User
exports.updateOne = async (req, res) => {
  // METTE A JOUR un utilisateur avec UID= id
  const urlActionEdit = urlprefixe_appli + urlprefixe_user       + "/edit/"       // "/demo-user/user/edit/"    // + ID
  const id = req.params.id;
  const {NOM, PRENOM, PSEUDO, TELEPHONE, EMAIL, PASSE, DETAIL, UID, UIDPASSE} = req.body;
  // CONTROLE: 
  // le corps de la demande doit être au format { NOM: 'nom', PRENOM: 'prénom', ... }
  // + cohérence des donnéées (doublons)
  const body = req.body;
  const {tabDesZones, message}  = await validationUpdateUser(body);
  if(message != ""){
    // ERREUR + conservation des zones SAISIE (en modification) par l'utilisateur + redirection
    await req.flash("infoErreur", message);
    await req.flash("tabDesZonesEnErreur", tabDesZones);
    await req.flash('infoDonnees', {
      NOM: NOM,
      PRENOM: PRENOM,
      PSEUDO: PSEUDO,
      TELEPHONE: TELEPHONE,      
      EMAIL: EMAIL, 
      PASSE: PASSE,
      DETAIL: DETAIL,
      UID: UID,
      UIDPASSE: UIDPASSE
    });
    return res.redirect(urlActionEdit+id);
  }
  //
  // IBMi    
  const monTimeStamp = new Date().toLocaleString("fr");       // jj/mm/aaaa hh:mm:ss
  const maDate = monTimeStamp.substring(1-1, 10);             // jj/mm/aaaa
  const monHeure = monTimeStamp.substring(12-1, 19);          // hh:mm:ss
  const bddDate = cvtDate(maDate, "aaaammjj");                // fmt saisie vers aaaammjj
  //
  const DATE_UPD = bddDate;     // aaaammjj
  const DATE_MODIFICA = maDate; // jj/mm/aaaa
  const USER_UPD = PSEUDO.substring(1-1, 10);
  try {
    //
    // CRYPTAGE OBLIGATOIRE du mot de passe:
    const oHash = await bcrypt.hash(PASSE, 8);
    const oHash2 = encodageDeThierry(PASSE);
    if(oHash === null){
      console.log('')
      console.log("addUser, ERREUR: dans le cryptag edu mo de passe")
      return res.send({message: "addUser, ERREUR: dans le cryptag edu mo de passe"});
    }
    const unUser = {
      nom: NOM,
      prenom: PRENOM,
      pseudo: PSEUDO,
      telephone: TELEPHONE,
      email: EMAIL,
      passe: oHash,
      detail: DETAIL
    }
    // CONTROLE: on commence par LIRE le user sur: id, pour vérifier si existe
    // IBMi ( " with NONE"  sans commit )
    let dbStatement; 
    dbStatement = dbaConnection.getStatement();
    const oTabUnUser = await dbStatement.exec("SELECT NOM, PRENOM, UID FROM " + BIBDU400 + ".USER1 WHERE UID = " + id);
    if (!oTabUnUser || oTabUnUser.length === 0) {
      // MESSAGE: user NON trouvé, avec redirection à l'index
      await req.flash("info", "Le user avec id (" + id + ") n'existe pas!!!");
      return res.redirect(urlIndex);
    }
    // OK: update sans commit (with NONE)
    dbStatement = dbaConnection.getStatement();
    await dbStatement.exec(
      "UPDATE " + BIBDU400 + ".USER1" +
      " SET NOM='" + unUser.nom + "'" +
      " ,   PRENOM='" + unUser.prenom + "'" +                      
      " ,   PSEUDO='" + unUser.pseudo + "'" +
      " ,   TELEPHONE='" + unUser.telephone + "'" +
      " ,   EMAIL='" + unUser.email + "'" +
      " ,   PASSE='" + unUser.passe + "'" +
      " ,   DETAIL='" + unUser.detail + "'" +
      " ,   DATE_UPD='" + DATE_UPD.trim() + "'" +
      " ,   DATE_MODIFICA='" + DATE_MODIFICA.trim() + "'" +
      " ,   USER_UPD='" + USER_UPD.trim() + "'" +
      " WHERE UID = " + id +
      " with NONE"
    );

    
    console.log('ixiiiiiiiiiiiiiiii, oHash2=');
    console.log(oHash2);

    dbStatement = dbaConnection.getStatement();
    await dbStatement.exec(
      "UPDATE " + BIBDU400 + ".USER2" +
      " SET PASSE='" + unUser.passe + "'" +                  
      " ,   PASSE2='" + oHash2 + "'" +                    
      " WHERE PASSE = '" + UIDPASSE + "'" +
      " with NONE"
    );
    //
    // FAIT: redirection sur index, avec message d'information
    await req.flash("info", "Le user (" + oTabUnUser[0].NOM +", " + oTabUnUser[0].PRENOM + 
                    "), identifié ID=(" + id + ") a bien été modifié.");
    res.redirect(urlIndex);
    // ____________________________________________________________________________________________________
  } catch (error) {
    // ERREUR CATCH: Message console + return brut pour l'instant
    const monMessage = "ERREUR Catch - User updateOne - Erreur interne au serveur, error=" + error.message;
    console.log(monMessage);
    await req.flash("infoErreur", message);
    res.redirect(urlIndex);
    
  }
};
// -----------------------------------------------------------------------------------------------------------





/*****************************************/
// GET  homepage 
exports.homepage = async (req, res) => {
  // récupération des messages flash ()
  const tabMessages = await req.flash("info");
  const tabMenuDynamique = [
    {nom: 'lientest1', urlmenu: urlprefixe_appli + urlprefixe_user +'/lientest1'},
    {nom: 'lientest2', urlmenu: urlprefixe_appli + urlprefixe_user +'/lientest2'},
    {nom: 'lienarticle', urlmenu: urlprefixe_appli + urlprefixe_user +'/lienarticle'}
  ];
  // connexion  
  const oObjetDeConnexion = req.cookies.oconnexion; // objet de connexion || BLANC
  // url
  const urlSoumettreAddUser = urlprefixe_appli + urlprefixe_user + "/add"         // "/demo-user/user/add"
  const urlActionView = urlprefixe_appli + urlprefixe_user       + "/view/"       // "/demo-user/user/view/"    // + ID
  const urlActionEdit = urlprefixe_appli + urlprefixe_user       + "/edit/"       // "/demo-user/user/edit/"    // + ID
  const urlActionDelete = urlprefixe_appli + urlprefixe_user     + "/edit/"       // "/demo-user/user/edit/"    // + ID    
  // PAGINATION html
  // PAGES: 12 lignes par pages
  let perPage = 12;    // 12 ou 2 pour tester
  let page = req.query.page || 1;
  try {
    // IBMi
    // compter le Nombre d'ENREG.
    let dbStatement; 
    dbStatement = dbaConnection.getStatement();
    const tabxxxx = await dbStatement.exec("SELECT COUNT(*) AS NOMBRE FROM " + BIBDU400 + ".USER1");
    const count = tabxxxx[0].NOMBRE;

    // récupération des users / par PAGES  { LIMIT n OFFSET m }
    const n = perPage;
    const m = perPage * page - perPage;
    dbStatement = dbaConnection.getStatement();
    const tabUsers = await dbStatement.exec(
      "SELECT NOM, PRENOM, PSEUDO, EMAIL, UID FROM " + BIBDU400 + 
      ".USER1" +
      " LIMIT " + n + " OFFSET " + m);
    //
    let urlConn = null;
    let urlDeconn = null;
    let tabMenu = null;
    if((oObjetDeConnexion === undefined) || (oObjetDeConnexion === null) || (oObjetDeConnexion === '')){
      // Non connecté:
      urlConn = urlconnexion;
    } else {
      // Connecté:
      urlDeconn = urldeconnexion;
      tabMenu = tabMenuDynamique;
    }                                            
    //
    // RENDRE la PAGE: index.ejs
    const oTemplateData = {
      titre: "Accueil Dashboard",
      description: "Demo SQL AS400 avec ejs layout et idb-pconnector table users",
      current: page,
      pages: Math.ceil(count / perPage),
      urlIndex: urlIndex,
      urlabout: urlabout,
      urlRecherche: urlRecherche,
      urlconnexion: urlConn,
      urldeconnexion: urlDeconn,      
      urlSoumettreAddUser: urlSoumettreAddUser,
      urlActionView: urlActionView,
      urlActionEdit: urlActionEdit,
      urlActionDelete: urlActionDelete,
      tabMessages: tabMessages,
      tabMenuDynamique: tabMenu,
      tabUsers: tabUsers
    }
    res.status(200).render("index", oTemplateData);    
  } catch (error) {
    // ERREUR CATCH: Message console + return brut pour l'instant
    console.error("ERREUR catch homepage User , error=" + error);
    return res.send({message: "User homepage, ERREUR catch: Erreur interne au serveur, error=", error: error.message});
  }
};

/*****************************************/
// GET  getOne  : get One user
exports.getOne = async (req, res) => {
  // AFFICHER un utilisateur avec UID= id
  // https://testdemogitbook.gitbook.io/restify/new-tutorial-2-rest-apis-and-the-ibm-i
  const id = req.params.id;
  try {
    // IBMi ( " with NONE"  sans commit )
    let dbStatement; 
    dbStatement = dbaConnection.getStatement();
    const oTabUnUser = await dbStatement.exec("SELECT NOM, PRENOM, PSEUDO, TELEPHONE, EMAIL, PASSE, DETAIL, DATE_CREATION, DATE_MODIFICA, UID FROM " + BIBDU400 + ".USER1 WHERE UID = " + id);
    if (!oTabUnUser || oTabUnUser.length === 0) {
      // MESSAGE: user NON trouvé, avec redirection à l'index
      await req.flash("info", "Le user avec id (" + id + ") n'existe pas!!!");
      return res.redirect(urlIndex);
    }
    // OK: AFFICHER le user
    // RENDRE la PAGE: user/view
    const derniereMAJour = (oTabUnUser[0].DATE_MODIFICA.trim() === "") ? oTabUnUser[0].DATE_CREATION : oTabUnUser[0].DATE_MODIFICA;
    const oTemplateData = {
      titre: "Afficher les données user",
      description: "Demo SQL AS400 avec ejs layout et idb-pconnector table users",
      urlIndex: urlIndex,
      urlabout: urlabout,
      urlRecherche: urlRecherche,
      derniereMAJour: derniereMAJour,
      r_user: oTabUnUser[0]
    }
    res.status(200).render("user/view", oTemplateData);
  } catch (error) {
    // ERREUR CATCH: Message console + return brut pour l'instant
    console.error("ERREUR catch User getOne, error=" + error);
    return res.send({message: "User getOne, ERREUR catch: Erreur interne au serveur, error=", error: error.message});
  }
};

/*****************************************/
// DELETE  deleteOne: user
exports.deleteOne = async (req, res) => {
  // SUPPRIMER un utilisateur avec UID= id
  // https://testdemogitbook.gitbook.io/restify/new-tutorial-2-rest-apis-and-the-ibm-i
  const id = req.params.id;
  try {
    // CONTROLE: on comence par LIRE le user sur: id, pour vérifier si existe
    // IBMi ( " with NONE"  sans commit )
    let dbStatement; 
    dbStatement = dbaConnection.getStatement();
    const tabUser = await dbStatement.exec("SELECT NOM, PRENOM, PASSE, UID FROM " + BIBDU400 + ".USER1 WHERE UID = " + id);
    if (!tabUser || tabUser.length === 0) {
      // MESSAGE: user NON trouvé, avec redirection à l'index
      await req.flash("info", "Le user avec id (" + id + ") n'existe pas!!!");
      return res.redirect(urlIndex);
    }
    // OK: delete sans commit (with NONE)
    dbStatement = dbaConnection.getStatement();
    await dbStatement.exec(
      "DELETE FROM " + BIBDU400 + ".USER1" + 
      " WHERE UID = " + id +
      " with NONE"
    );
    dbStatement = dbaConnection.getStatement();
    await dbStatement.exec(
      "DELETE FROM " + BIBDU400 + ".USER2" + 
      " WHERE PASSE = '" + tabUser[0].PASSE + "'" +
      " with NONE"
    );    
    //
    // FAIT: redirection sur index, avec message d'information
    await req.flash("info", "Le user (" + tabUser[0].NOM +", " + tabUser[0].PRENOM + ") a bien été supprimé.");
    res.redirect(urlIndex);
  } catch (error) {
    // ERREUR CATCH: Message console + return brut pour l'instant
    console.error("ERREUR catch deleteUser, error=" + error);
    return res.send({message: "deleteUser, ERREUR catch: Erreur interne au serveur, error=", error: error.message});
  }
};

/*****************************************/
// POST  recherche users
exports.rechercheUsers = async (req, res) => {
  const urlSoumettreAddUser = urlprefixe_appli + urlprefixe_user + "/add"         // "/demo-user/user/add"
  const urlActionView = urlprefixe_appli + urlprefixe_user       + "/view/"       // "/demo-user/user/view/"    // + ID
  const urlActionEdit = urlprefixe_appli + urlprefixe_user       + "/edit/"       // "/demo-user/user/edit/"    // + ID
  const urlActionDelete = urlprefixe_appli + urlprefixe_user     + "/edit/"       // "/demo-user/user/edit/"    // + ID     
  //
  const {rechercheTerme} = req.body;
  const w1 = rechercheTerme.replace(/[^a-zA-Z0-9 ]/g, "");
  const wRechercheTerme = w1.toUpperCase().trim();
  try {
    // Recherche: du terme avec des like % sur: NOM, PRENOM, PSEUDO...
    // IBMi
    dbStatement = dbaConnection.getStatement();
        const tabDeUsers = await dbStatement.exec("SELECT NOM, PRENOM, PSEUDO, TELEPHONE, UID FROM " + BIBDU400 + 
                                                  ".USER1" + 
                                                  " WHERE UPPER(NOM)    like '" + wRechercheTerme + "%'" +
                                                  "    OR UPPER(PRENOM) like '" + wRechercheTerme + "%'" +                                                  
                                                  "    OR UPPER(PSEUDO) like '" + wRechercheTerme + "%'");
    //
    // RENDRE la PAGE: resultat-recherche-users
    const oTemplateData = {
      titre: "Résultat recherche Users",
      description: "Demo SQL AS400 avec ejs layout et idb-pconnector table users",
      urlIndex: urlIndex,
      urlabout: urlabout,
      urlRecherche: urlRecherche,
      urlSoumettreAddUser: urlSoumettreAddUser,
      urlActionView: urlActionView,
      urlActionEdit: urlActionEdit,
      urlActionDelete: urlActionDelete,
      tabDeUsers: tabDeUsers
    }
    res.status(200).render("resultat-recherche-users", oTemplateData); 
  } catch (error) {
    // ERREUR CATCH: Message console + return brut pour l'instant
    console.error("ERREUR catch rechercheUsers User , error=" + error);
    return res.send({message: "User rechercheUsers, ERREUR catch: Erreur interne au serveur, error=", error: error.message});
  }
};

/*****************************************/
// GET  about
exports.about = async (req, res) => {
  // AFFICHER un about
  // https://www.youtube.com/watch?v=PAm_QcN6Ffs&t=6343s 
  try {
    //
    // RENDRE la PAGE: about
    const oTemplateData = {
      titre: "About",
      description: "Demo SQL AS400 avec ejs layout et idb-pconnector table users",
      urlIndex: urlIndex,
      urlabout: urlabout,
      urlRecherche: urlRecherche,
    }
    res.status(200).render("about", oTemplateData);

  } catch (error) {
    // ERREUR CATCH: Message console + return brut pour l'instant
    console.error("ERREUR catch User about, error=" + error);
    return res.send({message: "User about, ERREUR catch: Erreur interne au serveur, error=", error: error.message});
  }
};



/*****************************************/
// GET  test1
exports.lientest1 = async (req, res) => {
  try {
    //
    // RENDRE la PAGE: about
    const oTemplateData = {
      titre: "test 1",
      description: "Demo AS400 IFS",
      urlIndex: urlIndex,
      urlabout: urlabout,
      urlRecherche: urlRecherche,
    }
    res.status(200).render("test1", oTemplateData);
  } catch (error) {
    console.log(error);
  }
};

/*****************************************/
// GET  test2
exports.lientest2 = async (req, res) => {
  try {
    //
    // RENDRE la PAGE: about
    const oTemplateData = {
      titre: "test 2",
      description: "Demo AS400 IFS",
      urlIndex: urlIndex,
      urlabout: urlabout,
      urlRecherche: urlRecherche,
    }
    res.status(200).render("test2", oTemplateData);
  } catch (error) {
    console.log(error);
  }
};

/*****************************************/
// GET  lienarticle
exports.lienarticle = async (req, res) => {
  // récupération des messages flash ()
  const tabMessages = await req.flash("info"); 
  // PAGINATION html
  // PAGES: 12 lignes par pages
  let perPage = 18;    // 18 ou 2 pour tester
  let page = req.query.page || 1;
  try {
    // IBMi
    // compter le Nombre d'ENREG.
    // * article en stock, A6B9A8<>''
    // * articles actif  , A6BBSS='A'
    // * gestion lot     , FNRTSS='O'
    const envFUTUR = 'NADFILABO';
    let dbStatement; 
    dbStatement = dbaConnection.getStatement();
    const tabxxxx = await dbStatement.exec("SELECT COUNT(*) AS NOMBRE" + 
    " FROM " + envFUTUR + ".NAFJREP as a" +
    " INNER JOIN " + envFUTUR + ".NAA6REP as b" +
    " ON a.FJAUA8 = b.A6B9A8" +
    " INNER JOIN " + envFUTUR + ".NAFNREP as c" +
    " ON a.FJAUA8 = c.FNAUA8" +
    " WHERE A6B9A8<>''" + 
    "   AND A6BBSS='A'" +
    "   AND FNRTSS='O'");
    
    
    const count = tabxxxx[0].NOMBRE;

    // récupération des articles / par PAGES  { LIMIT n OFFSET m }
    // * article en stock, A6B9A8<>''
    // * articles actif  , A6BBSS='A'
    // * gestion lot     , FNRTSS='O'
    const n = perPage;
    const m = perPage * page - perPage;
    dbStatement = dbaConnection.getStatement();
    const tabArticles = await dbStatement.exec(
      "SELECT A6AUA8 as article_A6AUA8, A6B9A8 as article_ref_stock_A6B9A8, A6BBSS as actif," + 
      " '|' as sep, " +
      " FJAUA8 as article_de_stock, FJICA8 as lot," +
      " c.FNRTSS AS gestionlot" +
      " FROM " + envFUTUR + ".NAFJREP as a" +
      " INNER JOIN " + envFUTUR + ".NAA6REP as b" +
      " ON a.FJAUA8 = b.A6B9A8" +
      " INNER JOIN " + envFUTUR + ".NAFNREP as c" +
      " ON a.FJAUA8 = c.FNAUA8" +
      " WHERE A6B9A8<>''" +
      "   AND A6BBSS='A'" +
      "   AND FNRTSS='O'" +
      " LIMIT " + n + " OFFSET " + m);


      console.log('contenu du tableau');
      console.log(count);
      console.log(tabArticles);
    //                                          
    //
    // RENDRE la PAGE: index.ejs
    const oTemplateData = {
      titre: "Gestion des articles",
      description: "Demo SQL AS400 avec ejs layout et idb-pconnector table users",
      current: page,
      pages: Math.ceil(count / perPage),
      urlIndex: urlIndex,
      urlabout: urlabout,
      urlRecherche: urlRecherche,
      tabMessages: tabMessages,
      tabArticles: tabArticles,
      r_count: count
    }
    res.status(200).render("lienarticle", oTemplateData);    
  } catch (error) {
    // ERREUR CATCH: Message console + return brut pour l'instant
    console.error("ERREUR catch lienartice, error=" + error);
    return res.send({message: "User lienarticle, ERREUR catch: Erreur interne au serveur, error=", error: error.message});
  }
};