// ==========================================================================================================
// DEMO_USER  (CRUD avec EJS layout) NodeJS Express                                     http://localhost:3000
// ==========================================================================================================
// dossier: C:\WORK\NODEJS\DEMO_USER
// fichier: serveur/models/user.js                           AS400 IBMi: TVO/QRPGLESRC(UCRTUSER) => TVO.USER1
// ==========================================================================================================
// import des modules nécessaires
//
//
// rien à faire: ne pas brancher dans app.js
//
//
//
// la connection au 400 se fait par SQL dans le contrôleur
// Il faudre CREER au préalable le fichier sur AS400 IBMi series à l'aide d'un create table, via un SQLRPGLE: 
//
// PROGRAMME: TVO/QRPGLESRC(UCRTUSER) 
// =================================
// Création de la table                                                  
// exec sql                                                                 
// CREATE TABLE TVO/USER1 (                                                 
//     NOM       FOR COLUMN UNOM    CHAR (60) NOT NULL WITH DEFAULT '',     
//     PRENOM    FOR COLUMN UPRENOM CHAR (60) NOT NULL WITH DEFAULT '',     
//     PSEUDO    FOR COLUMN UPSEUDO CHAR (60) NOT NULL WITH DEFAULT '',   
//     EMAIL     FOR COLUMN UMAIL   CHAR (60) NOT NULL WITH DEFAULT '',     
//     PASSE     FOR COLUMN UPASSE  CHAR (60) NOT NULL WITH DEFAULT '',     
//     TELEPHONE FOR COLUMN UTEL    CHAR (15)    DEFAULT '',                
//     DETAIL    FOR COLUMN UDET    CHAR (200)   DEFAULT '',                
//     SALAIRE   FOR COLUMN USAL    DEC (11, 2)  DEFAULT 0,                 
//     DATE_CRT  FOR COLUMN UDCRT   CHAR (08)    DEFAULT '',                
//     DATE_UPD  FOR COLUMN UDUPD   CHAR (08)    DEFAULT '',                
//     DATE_CREATION FOR COLUMN ULCRT  CHAR (10) DEFAULT '',                
//     DATE_MODIFICA FOR COLUMN ULUPD  CHAR (10) DEFAULT '',                
//     USER_CRT      FOR COLUMN UUSERC CHAR (10) DEFAULT '',                
//     USER_UPD      FOR COLUMN UUSERU CHAR (10) DEFAULT '',                
//     UID INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY                    
//     (START WITH 1 INCREMENT BY 1, NO CACHE )                             
//     PRIMARY KEY           
//     )                                                            
// RCDFMT USERF;                                                
// // Update description de la SQL Table                        
// exec sql                                                     
//    LABEL on TABLE TVO/USER1 is 'USER1 liste de users';       
// // Update colonne Heading        
// exec sql                              
//    LABEL on COLUMN TVO/USER1 (        
//       NOM       IS 'Nom',             
//       PRENOM    IS 'Prenom',          
//       PSEUDO    IS 'Pseudo',          
//       EMAIL     IS 'eMail',           
//       PASSE     IS 'Passe',           
//       TELEPHONE IS 'Tel.',            
//       DETAIL    IS 'Détail',          
//       SALAIRE   IS 'Salaire',         
//       DATE_CRT      IS 'D CRT 8A',    
//       DATE_UPD      IS 'D UPT 8A',    
//       DATE_CREATION IS 'D CRT 10A',   
//       DATE_MODIFICA IS 'D UPT 10A',   
//       USER_CRT      IS 'USER CREAT',  
//       USER_UPD      IS 'USER UPDAT',  
//       UID           IS 'UID  PK'      
// );                                                                                                               
// // Update colonne Texte                     
// exec sql                                    
//    LABEL on COLUMN TVO/USER1 (              
//       NOM           TEXT IS 'Nom',          
//       PRENOM        TEXT IS 'Prenom',       
//       PSEUDO        TEXT IS 'Pseudo',       
//       EMAIL         TEXT IS 'eMail',        
//       PASSE         TEXT IS 'Passe',        
//       TELEPHONE     TEXT IS 'Tel.',         
//       DETAIL        TEXT IS 'Détail',       
//       SALAIRE       TEXT IS 'Salaire',      
//       DATE_CRT      TEXT IS 'D CRT 8A',     
//       DATE_UPD      TEXT IS 'D UPT 8A',     
//       DATE_CREATION TEXT IS 'D CRT 10A',    
//       DATE_MODIFICA TEXT IS 'D UPT 10A',    
//       USER_CRT      TEXT IS 'USER CREAT',   
//       USER_UPD      TEXT IS 'USER UPDAT',   
//       UID           TEXT IS 'UID  PK'       
// );                                          
// //               
// // FIN           
// *INLR = '1';     
// RETURN;          
// end-free         



// clé unique: email & pseudo


// https://www.db2tutorial.com/db2-index/db2-unique-index/          
// =======================================================          
// email unique                                                     
// exec sql                                                            
//    CREATE UNIQUE INDEX ix_uni_email                                 
//           ON     USER1(EMAIL);                                      
// pseuso unique                                                    
// exec sql                                                            
//    CREATE UNIQUE INDEX ix_uni_pseudo                                
//           ON     USER1(PSEUDO);                                     
//                                                                  
// clé unique multi colonnes                                        
// =========================                                        
// nom, prenom unique                                               
//                    exec sql                                      
//                       CREATE UNIQUE INDEX ix_uni_netp            
//                              ON     USER1(NOM, PRENOM);          
//                                                                  


// Db2 CREATE INDEX ---  pour recherche sur NOM, PRENOM, PSEUDO                                           
// https://www.db2tutorial.com/db2-index/db2-create-index/    
// =======================================================    
// Recherche, nom, prenom, pseudo                             
// exec sql                                                      
//    CREATE INDEX ix_recherche                                  
//           ON     USER1(NOM, PRENOM, PSEUDO);                  
//                                                            
// FIN                                                        
// *INLR = '1';                                                  
// RETURN;                                                       
// end-free                                                      
//  ===FinDuSource===============================================
