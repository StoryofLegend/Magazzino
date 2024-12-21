/**
 * @file Magazzino CLI Application Documentation
 *
 * Questa applicazione consente la gestione di un magazzino tramite una CLI (Command Line Interface). 
 * L'utente può interagire con il magazzino per eseguire operazioni come:
 *
 * - Stampa i prodotti di una determinata categoria
 * - Cambia il prezzo dei prodotti di una determinata categoria
 * - Cerca le informazioni di un prodotto
 * - Cancella un prodotto
 * - Cancella una categoria e tutti i prodotti collegati
 * - Aggiungi un nuovo prodotto
 * - Aggiungi una nuova categoria
 *
 * Le operazioni sono eseguite tramite una serie di prompt interattivi utilizzando la libreria `inquirer`. 
 * La gestione dei dati del magazzino e delle credenziali di login avviene tramite due file JSON:
 *
 * - `Magazzino.json`: contiene le informazioni sui prodotti e le categorie.
 * - `Login.json`: contiene le credenziali degli utenti (username e password).
 *
 * La logica di gestione dei dati del magazzino è implementata in funzioni che permettono di:
 * - Caricare i dati dal file JSON.
 * - Eseguire operazioni sui dati come l'aggiunta, la rimozione e la modifica di prodotti e categorie.
 *
 * **Utilizzo:**
 *
 * L'utente deve fornire le proprie credenziali di accesso tramite la funzione di login.
 * Successivamente, può scegliere una delle operazioni disponibili nel menu CLI.
 *
 * **Requisiti:**
 *
 * - Node.js
 * - npm (o yarn) per la gestione delle dipendenze
 * - Le dipendenze principali: `colors`, `inquirer`, `fs`.
 *
 * **Funzionamento:**
 *
 * - Il programma carica i dati dal file `Magazzino.json` all'avvio.
 * - L'autenticazione avviene tramite il controllo delle credenziali nel file `Login.json`.
 * - Le operazioni vengono eseguite tramite prompt interattivi.
 *
 * **Esportazione delle funzioni principali:**
 *
 * - `caricaMagazzino`: carica i dati del magazzino dal file JSON.
 * - `controlloLogin`: verifica le credenziali dell'utente.
 * - `trovaIDCategoria`, `stampaProdotti`, `cambioPrezzo`, `cercaProdotto`, `cancellaProdotto`, `cancellaCategoria`, `aggiungiProdotto`, `aggiungiCategoria`: funzioni per la gestione e la modifica dei dati nel magazzino.
 * - `nomiCategoria`, `nomiProdotti`: funzioni per ottenere le categorie e i prodotti presenti nel magazzino.
 */

// Pacchetti
var colors = require('colors');
// Pacchetto utilizzato per la CLI
var inquirer = require('inquirer');

const fs = require('fs');

let magazzino; // Variabile per caricare i dati del magazzino





/**
 * Carica i dati del magazzino dal file `Magazzino.json`.
 * Questa funzione legge il file JSON, lo analizza e restituisce i dati del magazzino come oggetto JavaScript.
 * 
 * @function
 * @returns {Object} Restituisce l'oggetto `magazzino` che contiene i dati dei prodotti e delle categorie.
 */

function caricaMagazzino() {
    const contents = fs.readFileSync("Magazzino.json");
    magazzino = JSON.parse(contents);
    return magazzino;
}




// Esporta tutte le funzioni più la nuova funzione per caricare i dati
module.exports = {
    login,
    cli,
    caricaMagazzino,
    controlloLogin,
    trovaIDCategoria,
    stampaProdotti,
    cambioPrezzo,
    cercaProdotto,
    cancellaProdotto,
    cancellaCategoria,
    aggiungiProdotto,
    aggiungiCategoria,
    nomiCategoria,
    nomiProdotti
};


if (require.main === module) {
    caricaMagazzino();
    login();
}


/**
 * Esegue il processo di login dell'utente tramite un prompt interattivo.
 * L'utente viene invitato a inserire un nome utente e una password.
 * Una volta inseriti i dati, viene effettuato il controllo delle credenziali.
 * Se le credenziali sono corrette, l'utente viene autenticato e viene avviata la CLI. 
 * In caso contrario, l'utente viene avvisato del fallimento e il processo di login viene ripetuto.
 *
 * @function
 * @returns {void} Non restituisce valori. La funzione gestisce il flusso di autenticazione.
 */

function login() {
    inquirer
        .prompt([{
                name: 'username',
                message: 'Username:',
            },
            {
                type: 'password',
                name: 'password',
                message: 'Password:',
                mask: '*'
            },
        ])
        .then(answers => {
            var check = controlloLogin(answers.username, answers.password);
            if (check) {
                console.log(colors.green("Autenticazione effettuata correttamente\n"));
                cli();
            } else {
                console.log(colors.red("\nUsername o password errati\n"));
                if (require.main === module) {
                login();
                }
                
            }
        });
}


/**
 * Verifica se le credenziali di login (username e password) corrispondono a quelle memorizzate nel file `Login.json`.
 * La funzione legge il file `Login.json`, analizza il contenuto e confronta i dati di login con quelli forniti dall'utente.
 * Se c'è una corrispondenza, la funzione restituisce `true`, altrimenti `false`.
 *
 * @param {string} username - Il nome utente inserito dall'utente per il login.
 * @param {string} password - La password inserita dall'utente per il login.
 * @returns {boolean} `true` se le credenziali corrispondono a un utente esistente, `false` altrimenti.
 */

function controlloLogin(username, password) {
    var content = fs.readFileSync("Login.json");
    var auth = JSON.parse(content);
    // Controllo se l'username e la password corrispondono
    return auth['users'].some(utente => utente.username == username &&
        utente.password == password)
};


/**
 * Funzione che gestisce l'interfaccia a riga di comando (CLI) dell'applicazione Magazzino.
 * La funzione presenta all'utente un menu con diverse operazioni che possono essere eseguite sui prodotti e categorie del magazzino.
 * Dopo che l'utente seleziona un'operazione, vengono richiesti ulteriori input per completare l'azione scelta.
 * 
 * Le operazioni disponibili sono:
 * - Stampa i prodotti di una certa categoria
 * - Cambia il prezzo dei prodotti di una certa categoria
 * - Cerca le informazioni di un prodotto
 * - Cancella un prodotto
 * - Cancella una categoria e tutti i prodotti collegati
 * - Aggiungi un nuovo prodotto
 * - Aggiungi una nuova categoria
 * - Logout
 * 
 * La funzione utilizza la libreria `inquirer` per gestire i prompt interattivi dell'utente e eseguire le azioni corrispondenti.
 *
 * Ogni operazione invoca una funzione appropriata, come `stampaProdotti`, `cambioPrezzo`, `cercaProdotto`, ecc., e poi richiede all'utente se desidera continuare con altre operazioni.
 * 
 * @returns {void} Non restituisce valori, ma esegue azioni basate sulle scelte dell'utente.
 */

function cli() {
    // CLI
    inquirer
        .prompt([{
            type: 'list',
            pageSize: 9,
            name: 'magazzino',
            // Il messaggio che verrò stampato
            message: 'Quale operazione vuoi eseguire?',
            // Tutte le opzioni
            choices: ['Stampa i prodotti di una certa categoria',
                'Cambia il prezzo dei prodotti di una certa categoria',
                'Cerca le informazioni di un prodotto',
                'Cancella un prodotto',
                'Cancella una categoria e tutti i prodotti collegati',
                'Aggiungi un nuovo prodotto',
                'Aggiungi una nuova categoria',
                new inquirer.Separator(),
                'Logout',
            ],
        }, ])
        // Quando l'utente risponde entra qua
        .then(answers => {
            // Controllo per vedere cosa ha selezionato
            if (answers.magazzino == 'Stampa i prodotti di una certa categoria') {

                var categorie = nomiCategoria();

                // L'utente ora dovrà fare altre scelte
                inquirer
                    .prompt([{
                        type: 'list',
                        pageSize: categorie.length,
                        name: 'categoria',
                        message: 'Seleziona la categoria:',
                        // Tutte le opzioni
                        choices: categorie
                    }, ])
                    .then(answers => {
                        // Una volta che l'utente avrà dato la risposta
                        // vado a richiamare le funzioni

                        // L'utente scriverà il nome della categoria, 
                        // quindi ho bisogno dell'id
                        var idCategoria = trovaIDCategoria(answers.categoria);
                        stampaProdotti(idCategoria);
                        continuare();
                    });

            } else if (answers.magazzino == 'Cambia il prezzo dei prodotti di una ' +
                'certa categoria') {
                var categorie2 = nomiCategoria();

                inquirer
                    .prompt([{
                            type: 'list',
                            pageSize: categorie2.length,
                            name: 'categoria',
                            message: 'Seleziona la categoria:',
                            choices: categorie2
                        },
                        {
                            name: 'percentuale',
                            message: 'Inserisci la percentuale:',
                        },
                    ])
                    .then(answers => {
                        var idCategoria = trovaIDCategoria(answers.categoria);
                        cambioPrezzo(idCategoria, answers.percentuale);
                        continuare();
                    });

            } else if (answers.magazzino == 'Cerca le informazioni di un prodotto') {
                var prodotti = nomiProdotti();
                inquirer
                    .prompt([{
                        type: 'list',
                        pageSize: prodotti.length,
                        name: 'prodotto',
                        message: 'Inserisci il nome del prodotto:',
                        choices: prodotti
                    }, ])
                    .then(answers => {
                        cercaProdotto(answers.prodotto);
                        continuare();
                    });
            } else if (answers.magazzino == 'Cancella un prodotto') {
                var prodotti2 = nomiProdotti();
                inquirer
                    .prompt([{
                        type: 'list',
                        pageSize: prodotti2.length,
                        name: 'prodotto',
                        message: 'Inserisci il nome del prodotto da cancellare:',
                        choices: prodotti2

                    }, ])
                    .then(answers => {
                        cancellaProdotto(answers.prodotto);
                        continuare();
                    });

            } else if (answers.magazzino == 'Cancella una categoria e tutti i' +
                ' prodotti collegati') {
                var categorie3 = nomiCategoria();
                inquirer
                    .prompt([{
                        type: 'list',
                        pageSize: categorie3.length,
                        name: 'categoria',
                        message: 'Inserisci il nome della categoria da cancellare:',
                        choices: categorie3

                    }, ])
                    .then(answers => {
                        var idCategoria = trovaIDCategoria(answers.categoria);
                        cancellaCategoria(idCategoria);
                        continuare();
                    });

            } else if (answers.magazzino == 'Aggiungi un nuovo prodotto') {
                // * 6
                inquirer
                    .prompt([{
                            name: 'id_prodotto',
                            message: 'Inserisci id del prodotto:',
                        },
                        {
                            name: 'id_categoria',
                            message: 'Inserisci id della categoria:',
                        },
                        {
                            name: 'nome_prodotto',
                            message: 'Inserisci il nome del prodotto:',
                        },
                        {
                            name: 'prezzo',
                            message: 'Inserisci il prezzo del prodotto:',
                        },
                    ])
                    .then(answers => {
                        var prodotto = {
                            "id_prodotto": parseInt(answers.id_prodotto),
                            "id_categoria": parseInt(answers.id_categoria),
                            "nome_prodotto": answers.nome_prodotto,
                            "prezzo": parseFloat(answers.prezzo)
                        }
                        aggiungiProdotto(prodotto);
                        continuare();
                    });

            } else if (answers.magazzino == 'Aggiungi una nuova categoria') {
                // * 7
                inquirer
                    .prompt([{
                            name: 'id_categoria',
                            message: 'Inserisci id della categoria:',
                        },
                        {
                            name: 'nome_categoria',
                            message: 'Inserisci il nome della categoria:',
                        },
                    ])
                    .then(answers => {
                        var categoria = {
                            "id_categoria": parseInt(answers.id_categoria),
                            "nome_categoria": answers.nome_categoria
                        }
                        aggiungiCategoria(categoria);
                        continuare();
                    });
            } else if (answers.magazzino == 'Logout') {
                login();
            }
              else {
                  console.log("Operazione invalida");
              }
        });
}

function continuare() {
    inquirer
        .prompt([{
            name: 'continuare',
            message: 'Vuoi continuare a eseguire operazioni?',
            default: 'y/N'
        }, ])
        .then(answers => {
            if (answers.continuare.toLowerCase() == 'y')
                cli();
        });
}



/**
 * Trova l'ID di una categoria nel magazzino in base al nome della categoria.
 * L'utente inserisce il nome della categoria e la funzione restituisce l'ID corrispondente.
 * 
 * @param {string} categoria - Il nome della categoria da cercare.
 * @returns {number|undefined} L'ID della categoria trovata, oppure `undefined` se la categoria non esiste.
 */

function trovaIDCategoria(categoria) {
    // Prima trovo l'id della categoria, 
    // perchè l'utente inserirà il nome e non l'id 
    var idCategoria;

    magazzino['Categoria'].forEach(categoriaProdotto => {
        if (categoriaProdotto.nome_categoria.toLowerCase() == categoria.toLowerCase())
        // Prendo l'id della categoria
            idCategoria = categoriaProdotto.id_categoria;
    });
    return idCategoria;
}



/**
 * Stampa i dettagli dei prodotti associati a una determinata categoria nel magazzino.
 * La funzione verifica se la categoria esiste e, in caso affermativo, stampa le informazioni
 * relative a tutti i prodotti appartenenti a quella categoria.
 * Se la categoria non esiste, viene stampato un messaggio di errore.
 *
 * @param {number} idCategoria - L'ID della categoria per la quale si desidera visualizzare i prodotti.
 * @returns {void} Non restituisce alcun valore, ma stampa le informazioni dei prodotti o un messaggio di errore.
 */

function stampaProdotti(idCategoria) {
    // Controlla se la categoria esiste
    const categoria = magazzino['Categoria'].find(c => c.id_categoria === idCategoria);

    if (!categoria) {
        // Se la categoria non esiste, stampa il messaggio
        console.log(colors.red("Questa categoria non esiste"));
        return; // Esci dalla funzione se la categoria non esiste
    }

    // Se la categoria esiste, stampa i prodotti associati
    magazzino['Prodotto'].forEach(prodotto => {
        if (prodotto.id_categoria === idCategoria) {
            // Stampa le informazioni dei prodotti
            console.log(colors.blue("\nId prodotto: " + prodotto.id_prodotto +
                "\nNome prodotto: " + prodotto.nome_prodotto +
                "\nPrezzo: " + prodotto.prezzo));
        }
    });
}




/**
 * Modifica il prezzo di tutti i prodotti appartenenti a una determinata categoria,
 * applicando una percentuale di aumento o diminuzione.
 * La funzione verifica prima se la categoria esiste. Se la categoria non esiste, viene
 * stampato un messaggio di errore. Se la categoria esiste, i prezzi dei prodotti vengono aggiornati.
 *
 * @param {number} idCategoria - L'ID della categoria i cui prodotti devono essere modificati.
 * @param {number} percentuale - La percentuale di modifica del prezzo da applicare ai prodotti.
 * @returns {void} Non restituisce alcun valore, ma modifica i prezzi dei prodotti e aggiorna il file JSON.
 */

function cambioPrezzo(idCategoria, percentuale) {
    // Verifica se la categoria esiste nel magazzino
    const categoria = magazzino['Categoria'].find(c => c.id_categoria === idCategoria);

    if (!categoria) {
        // Se la categoria non esiste, stampa il messaggio e ritorna subito
        console.log(colors.red("Questa categoria non esiste"));
        return; // Esci dalla funzione senza modificare i prezzi
    }

    // Se la categoria esiste, applica la modifica ai prezzi
    magazzino['Prodotto'].forEach(prodotto => {
        if (prodotto.id_categoria === idCategoria) {
            // Stampa le informazioni del prodotto che si sta modificando
            console.log(colors.yellow("\nSto cambiando il prezzo di: " +
                prodotto.nome_prodotto + " prezzo inziale: " + prodotto.prezzo));

            // Modifica il prezzo
            prodotto.prezzo += (prodotto.prezzo / 100) * percentuale;

            console.log(colors.green("Prezzo modificato: " + prodotto.prezzo));

            // Riscrivi il JSON con le modifiche
            fs.writeFileSync('Magazzino.json', JSON.stringify(magazzino, null, 4));
        }
    });
}



/**
 * Cerca un prodotto nel magazzino e stampa le informazioni relative a quel prodotto.
 * La ricerca viene effettuata confrontando il nome del prodotto (ignorando maiuscole e minuscole).
 * Se il prodotto esiste, vengono stampate le informazioni relative a ID, categoria, nome e prezzo.
 * In caso contrario, viene stampato un messaggio di errore.
 *
 * @param {string} prodotto - Il nome del prodotto da cercare nel magazzino.
 * @returns {void} Non restituisce alcun valore, ma stampa le informazioni del prodotto o un messaggio di errore.
 */

function cercaProdotto(prodotto) {
    // Per controllare se il prodotto esiste
    var countProd = false;
    magazzino['Prodotto'].forEach(product => {
        if (product.nome_prodotto.toLowerCase() == prodotto.toLowerCase()) {
            // Ho trovato il prodotto,stampo le sue informazioni
            console.log(colors.blue("\nId prodotto: " + product.id_prodotto +
                "\nId categoria: " + product.id_categoria +
                "\nNome prodotto: " + product.nome_prodotto +
                "\nPrezzo: " + product.prezzo));

            countProd = true;
        }
    });
    if (!countProd)
        console.log(colors.red("Questo prodotto non esiste"));
}



/**
 * Cancella un prodotto dal magazzino in base al nome fornito.
 * La funzione cerca il prodotto nel magazzino e, se lo trova, lo rimuove dalla lista dei prodotti.
 * Dopo aver rimosso il prodotto, aggiorna il file JSON `Magazzino.json`.
 * Se il prodotto non viene trovato, viene stampato un messaggio di errore.
 *
 * @param {string} prodotto - Il nome del prodotto da cancellare.
 * @returns {void} Non restituisce alcun valore, ma cancella il prodotto e aggiorna il file JSON o stampa un messaggio di errore.
 */

function cancellaProdotto(prodotto) {
    // Cerco l'index del prodotto
    var i = magazzino['Prodotto'].findIndex(product =>
        product.nome_prodotto.toLowerCase() == prodotto.toLowerCase());
    // Se esiste lo cancello
    if (i != -1) {
        console.log(colors.red("Sto cancellando il prodotto.."));
        // Cancello il prodotto
        magazzino['Prodotto'].splice(i, 1);
        fs.writeFileSync('Magazzino.json', JSON.stringify(magazzino, null, 4));
    } else
        console.log(colors.red("Questo prodotto non esiste"));
}



/**
 * Cancella una categoria e tutti i prodotti ad essa associati nel magazzino.
 * La funzione verifica prima se la categoria esiste nel magazzino. Se la categoria è trovata,
 * vengono rimossi i prodotti associati a essa e successivamente la categoria stessa.
 * Alla fine, il file JSON `Magazzino.json` viene aggiornato.
 * Se la categoria non esiste, viene stampato un messaggio di errore.
 *
 * @param {number} idCategoria - L'ID della categoria da cancellare.
 * @returns {void} Non restituisce alcun valore, ma cancella la categoria e i prodotti associati e aggiorna il file JSON.
 */

function cancellaCategoria(idCategoria) {
    if (idCategoria != null) {
        // Trov l'index della categoria per poterla cancellare
        var i = magazzino['Categoria'].findIndex(category =>
            category.id_categoria == idCategoria);

        console.log(colors.red("Sto cancellando la categoria.."));

        if(i != -1) {
            // Cancello la categoria
            magazzino['Categoria'].splice(i, 1);
            console.log(colors.red("Sto cancellando i prodotti.."));

            // Trovo i prodotti di quella categoria
            magazzino['Prodotto'].forEach(() => {
                var index = magazzino['Prodotto'].findIndex(product =>
                    product.id_categoria == idCategoria);

                if (index != -1)
                // Cancello i prodotti di quella categoria
                    magazzino['Prodotto'].splice(index, 1);
            });
            // Modifico il JSON
            fs.writeFileSync('Magazzino.json', JSON.stringify(magazzino, null, 4));
        }
        else{
            console.log(colors.red("Questa categoria non esiste"));
        }
        
    } else
        console.log(colors.red("Questa categoria non esiste"));
}



/**
 * Aggiunge un nuovo prodotto al magazzino se non è già presente.
 * La funzione controlla che il nome o l'ID del prodotto da aggiungere non siano già esistenti.
 * Se il prodotto è nuovo, lo aggiunge alla lista e aggiorna il file JSON `Magazzino.json`.
 * Se il prodotto esiste già, stampa un messaggio di errore.
 *
 * @param {Object} prodotto - L'oggetto che rappresenta il prodotto da aggiungere.
 * @param {number} prodotto.id_prodotto - L'ID univoco del prodotto.
 * @param {number} prodotto.id_categoria - L'ID della categoria a cui appartiene il prodotto.
 * @param {string} prodotto.nome_prodotto - Il nome del prodotto.
 * @param {number} prodotto.prezzo - Il prezzo del prodotto.
 * @returns {void} Non restituisce alcun valore, ma modifica il magazzino e aggiorna il file JSON.
 */

function aggiungiProdotto(prodotto) {
    // Controllo che l'utente non aggiunga un prodotto già esistente
    var check = magazzino['Prodotto'].find(product =>
        product.nome_prodotto == prodotto.nome_prodotto ||
        product.id_prodotto == prodotto.id_prodotto);
    // Se non esiste
    if (check == null) {
        magazzino['Prodotto'].push(prodotto);
        fs.writeFileSync('Magazzino.json', JSON.stringify(magazzino, null, 4));
        console.log("Prodotto aggiunto correttamente")
    } else {
        console.log(colors.red("Questo prodotto esiste"));
    }
}


/**
 * Aggiunge una nuova categoria al magazzino se non è già presente.
 * La funzione controlla che il nome o l'ID della categoria da aggiungere non siano già esistenti.
 * Se la categoria è nuova, la aggiunge alla lista e aggiorna il file JSON `Magazzino.json`.
 * Se la categoria esiste già, stampa un messaggio di errore.
 *
 * @param {Object} categoria - L'oggetto che rappresenta la categoria da aggiungere.
 * @param {number} categoria.id_categoria - L'ID univoco della categoria.
 * @param {string} categoria.nome_categoria - Il nome della categoria.
 * @returns {void} Non restituisce alcun valore, ma modifica il magazzino e aggiorna il file JSON.
 */

function aggiungiCategoria(categoria) {
    var check = magazzino['Categoria'].find(category =>
        category.nome_categoria == categoria.nome_categoria ||
        category.id_categoria == categoria.id_categoria);

    if (check == null) {
        magazzino['Categoria'].push(categoria);
        fs.writeFileSync('Magazzino.json', JSON.stringify(magazzino, null, 4));

    } else {
        console.log(colors.red("Questa categoria non esiste"));
    }
}


/**
 * Restituisce un array contenente i nomi di tutte le categorie presenti nel magazzino.
 * I nomi delle categorie vengono ordinati alfabeticamente.
 *
 * @returns {string[]} Un array di stringhe con i nomi delle categorie ordinati.
 */

function nomiCategoria() {
    var nomi = [];
    magazzino['Categoria'].forEach(nome => {
        nomi.push(nome.nome_categoria);
    });
    return nomi.sort()
}


/**
 * Restituisce un array contenente i nomi di tutti i prodotti presenti nel magazzino.
 * I nomi dei prodotti vengono ordinati alfabeticamente.
 *
 * @returns {string[]} Un array di stringhe con i nomi dei prodotti ordinati.
 */

function nomiProdotti() {
    var nomi = [];
    magazzino['Prodotto'].forEach(nome => {
        nomi.push(nome.nome_prodotto);
    });
    return nomi.sort()
}