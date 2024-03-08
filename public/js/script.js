// javascript pour les PAGES
//
//
//Fonction servant à: valider le mot de passe
// https://waytolearnx.com/2019/09/validation-du-mot-de-passe-en-javascript.html
function validatepasse() {
    var msgp=''; 
    var str = document.getElementById("PASSE").value;
    if (str.match( /[0-9]/g) && 
            str.match( /[A-Z]/g) && 
            str.match(/[a-z]/g) && 
            str.match( /[^a-zA-Z\d]/g) &&
            str.length >= 10) 
        msgp = "<p style='color:green'>Mot de passe fort.</p>"; 
    else 
        msgp = "<p style='color:red'>Mot de passe faible.</p>"; 

    // Averir su caratère d'échappement
    for (let indice in str) {        
        if(str[indice] === '\\'){ msgp = "<p style='color:red'>Caractère interdit antislashh.</p>"; }
        if(str[indice] === '^'){ msgp = "<p style='color:red'>Caractère interdit chapeau chinois, sans son caractère en dessous.</p>"; }
        if(str[indice] === '\''){ msgp = "<p style='color:red'>Caractère interdit simple côte.</p>"; }
        if(str[indice] === '"'){ msgp = "<p style='color:red'>Caractère interdit double côte.</p>"; }
        if(str[indice] === '`'){ msgp = "<p style='color:red'>Caractère interdit baltique AltGr 7.</p>"; }
    }

    document.getElementById("msgp").innerHTML= msgp; 
}
// -------------------------------------------

// ===========================================
// Validation du FORMULAIRE d'Authentification
// ===========================================
function validateFormAuthentification() { 
    // https://www.webrankinfo.com/forum/t/comment-stoper-un-submit-en-javascript.102686/        
    var msgp2='';
    var str = document.getElementById("PASSE").value; 
    //
    // Bloquer sur les contrôles côté client
    if(str.length < 3){
        msgp2="Votre PASSE est trop court, taille minimum 3";
        return document.getElementById("msgp2").innerHTML= msgp2;
    }
    if(str.length > 20){
        msgp2="Votre PASSE est trop long, taille maximum 20";
        return document.getElementById("msgp2").innerHTML= msgp2;
    }    

    // Bloquer sur caratères d'échappement
    for (let indice in str) {        
        if(str[indice] === '\\'){ msgp2 = "<p style='color:red'>Caractère interdit antislashh.</p>"; }
        if(str[indice] === '^'){ msgp2 = "<p style='color:red'>Caractère interdit chapeau chinois, sans son caractère en dessous.</p>"; }
        if(str[indice] === '\''){ msgp2 = "<p style='color:red'>Caractère interdit simple côte.</p>"; }
        if(str[indice] === '"'){ msgp2 = "<p style='color:red'>Caractère interdit double côte.</p>"; }
        if(str[indice] === '`'){ msgp2 = "<p style='color:red'>Caractère interdit baltique AltGr 7.</p>"; }
    }
    //
    // OK
    if(msgp2 === ''){ 
        // le submit se passe ici
        document.formAuthentification.submit(); 
    } else{ 
        // KO:
        // pas de subbmit + message bloquant
        msgp2="login impossible corriger les erreurs blocantes, ou retour Homepage";
        document.getElementById("msgp2").innerHTML= msgp2; 
    }
}
// -------------------------------------------

// ===========================================
// Validation du FORMULAIRE ADD USER
// ===========================================
function validateFormAddUser() { 
    var msgp2='';
    var str = document.getElementById("PASSE").value; 
    //
    // Bloquer sur les contrôles côté client
    if(str.length < 3){
        msgp2="Votre PASSE est trop court, taille minimum 3";
        return document.getElementById("msgp2").innerHTML= msgp2;
    }
    if(str.length > 20){
        msgp2="Votre PASSE est trop long, taille maximum 20";
        return document.getElementById("msgp2").innerHTML= msgp2;
    }    

    // Bloquer sur caratères d'échappement
    for (let indice in str) {        
        if(str[indice] === '\\'){ msgp2 = "<p style='color:red'>Caractère interdit antislashh.</p>"; }
        if(str[indice] === '^'){ msgp2 = "<p style='color:red'>Caractère interdit chapeau chinois, sans son caractère en dessous.</p>"; }
        if(str[indice] === '\''){ msgp2 = "<p style='color:red'>Caractère interdit simple côte.</p>"; }
        if(str[indice] === '"'){ msgp2 = "<p style='color:red'>Caractère interdit double côte.</p>"; }
        if(str[indice] === '`'){ msgp2 = "<p style='color:red'>Caractère interdit baltique AltGr 7.</p>"; }
    }
    //
    // OK
    if(msgp2 === ''){ 
        // le submit se passe ici
        document.formAddUser.submit(); 
    } else{ 
        // KO:
        // pas de subbmit + message bloquant
        msgp2="Ajout User impossible corriger les erreurs blocantes, ou retour Homepage";
        document.getElementById("msgp2").innerHTML= msgp2; 
    }
}
// -------------------------------------------


// ===========================================
// Validation du FORMULAIRE EDIT USER
// ===========================================
function validateFormEditUser() { 
    var msgp2='';
    var str = document.getElementById("PASSE").value; 
    //
    // Bloquer sur les contrôles côté client
    if(str.length < 3){
        msgp2="Votre PASSE est trop court, taille minimum 3";
        return document.getElementById("msgp2").innerHTML= msgp2;
    }
    if(str.length > 20){
        msgp2="Votre PASSE est trop long, taille maximum 20";
        return document.getElementById("msgp2").innerHTML= msgp2;
    }    

    // Bloquer sur caratères d'échappement
    for (let indice in str) {        
        if(str[indice] === '\\'){ msgp2 = "<p style='color:red'>Caractère interdit antislashh.</p>"; }
        if(str[indice] === '^'){ msgp2 = "<p style='color:red'>Caractère interdit chapeau chinois, sans son caractère en dessous.</p>"; }
        if(str[indice] === '\''){ msgp2 = "<p style='color:red'>Caractère interdit simple côte.</p>"; }
        if(str[indice] === '"'){ msgp2 = "<p style='color:red'>Caractère interdit double côte.</p>"; }
        if(str[indice] === '`'){ msgp2 = "<p style='color:red'>Caractère interdit baltique AltGr 7.</p>"; }
    }
    //
    // OK
    if(msgp2 === ''){ 
        // le submit se passe ici
        document.formEditUser.submit(); 
    } else{ 
        // KO:
        // pas de subbmit + message bloquant
        msgp2="Edit User impossible corriger les erreurs blocantes, ou retour Homepage";
        document.getElementById("msgp2").innerHTML= msgp2; 
    }
}
// -------------------------------------------