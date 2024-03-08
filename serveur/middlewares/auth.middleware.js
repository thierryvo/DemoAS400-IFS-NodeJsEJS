// ==========================================================================================================
// DEMO_USER  (AS400 CRUD avec EJS) NodeJS Express                                      http://localhost:3000
// ==========================================================================================================
// dossier: C:\WORK\NODEJS\DEMO-SEQ
// fichier: serveur/middlewares/auth.midlleware.js   
// ==========================================================================================================
// import des modules necessaire
// const User = require("../models/user");
const dba = require('idb-pconnector');
// AS400 **
// ========== CONNEXION IBMi =============
const dbaConnection = new dba.Connection().connect();
const BIBDU400 = process.env.AS400_BIB;                                         // 'TVO'
const { IN, NUMERIC, CHAR } = require('idb-pconnector');

//
// Authentificatioin et mot de passe
const jwt = require('jsonwebtoken');

// GLOBAL
const urlprefixe_appli = process.env.URL_PREFIXE_APPLI;
const urlprefixe_user  = process.env.URL_PREFIXE_USER;
const urlIndex = urlprefixe_appli + urlprefixe_user     + '/'               // "/demo-seq/user/"

// checkUser: tester si l'utilisateur est bien connecté
module.exports.checkUser = async (req, res, next) => {
    // 1: Vérifier la présence du token (dans les cookies / ou header)
    // 2: Décoder le token sous try-catch
    // 3: Vérifier l'utilisateur présent dans le token, il doit être peésent en base
    // 4: ok on stock le user, le token, + next
    //
    // 1:
    const authToken = req.cookies.jwt
    //  c......log('token du get:'+authToken)
    if (authToken === null) {
        // ERREUR Absence de token !

        res.locals.user = null;
        const message = "ERREUR d'authentification: Merci de vous connecter!";
        return res.status(401).json({status: "KO", message: message}) // 401 utilisateur non authentifié
    }
    // 2:
    const phraseSecrète = process.env.JWT_SECRET; //'foo'
    let decodeToken = undefined;
    try {
        decodeToken = await jwt.verify(authToken, phraseSecrète);
    } catch (error) {
        // KO
        const message = "ERREUR d'authentification: Merci de vous connecter!";
        res.locals.user = null;
        res.cookie('jwt', '', {maxAge: 1});
        return res.status(401).json({status: "KO", message: message}) // 401 utilisateur non authentifié
    }
    if (decodeToken===undefined) {
        // KO, le client FRONT est déjà informé de l'ERREUR, voir ci-dessus
        res.locals.user = null;
        const message = "ERREUR d'authentification: Merci de vous connecter!";
        return res.status(401).json({status: "KO", message: message}) // 401 utilisateur non authentifié
    } 
    // 3:
    let dbStatement; 
    dbStatement = dbaConnection.getStatement();
    const oUser = await dbStatement.exec("SELECT EMAIL, PASSE, UID FROM " + BIBDU400 + ".USER1 WHERE UID = " + decodeToken.UID);      
    if (oUser === null) {
        // KO
        res.locals.user = null;
        const message = "ERREUR d'authentification: Merci de vous connecter!";
        return res.status(401).json({status: "KO", message: message}) // 401 utilisateur non authentifié
    }
    //
    // ok on stock le user, le token
    // on done l'authentification à la requête en cours: next()
    res.locals.user = oUser
    next();
}

// exigerAuthentification: c'est ce qui va BLOQUER les routes à  protéger lorque le user n'est pas connecté
module.exports.exigerAuthentification = async (req, res, next) => {
    //
    // Forcer ouser à BLANC === Déconnecté
    const maxAge = 3 * 24 * 60 * 60 * 1000; // 4320000
    res.cookie('oconnexion', '', { httpOnly: true, maxAge: maxAge });
    //
    // 1: Vérifier la présence du token (dans les cookies / ou header)
    // 2: Décoder le token sous try-catch
    // 3: Vérifier l'utilisateur présent dans le token, il doit être présent en base
    // 4: ok on stock le user, le token, + next
        // 1:        
        const authToken = req.cookies.jwt;
        if ((authToken === null) || (authToken === undefined)) {            
            // ERREUR Absence de token
            // ERREUR + redirection    
            res.locals.user = null;
            const message = "ERREUR d'authentification: Merci de vous connecter!";
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
            const message = "ERREUR d'authentification: Merci de vous connecter!";
            res.locals.user = null;
            res.cookie('jwt', '', {maxAge: 1});
            await req.flash("info", message);
            return res.redirect(urlIndex);
        }
        if (decodeToken===undefined) {
            // KO, le client (ejs) est déjà informé de l'ERREUR, voir ci-dessus
            // ERREUR + redirection        
            res.locals.user = null;
            const message = "ERREUR d'authentification: Merci de vous connecter!";
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
            const message = "ERREUR d'authentification: Merci de vous connecter!";
            await req.flash("info", message);        
            return res.redirect(urlIndex);
        }
        //
        // NEXT:
        // ok on stock le user, le token dans un objet de connexion
        // on done l'authentification à la requête en cours: next()
        const oUser = tabUser[0];
        res.locals.user = oUser;
        const oConnexion = {
            id: oUser.UID,
            nom: oUser.NOM,
            prenom: oUser.PRENOM,
            token: authToken                  
        }
        res.cookie('oconnexion', oConnexion, { httpOnly: true, maxAge: maxAge });
        next();
}