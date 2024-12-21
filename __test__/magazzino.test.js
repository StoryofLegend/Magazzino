const fs = require('fs');
jest.mock('fs'); // Mocka 'fs'

const {
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
} = require('../Magazzino'); // Assicurati che il percorso sia corretto

// Mock dei dati JSON
const mockMagazzinoData = {
    Categoria: [
        { id_categoria: 1, nome_categoria: "Monitor" },
        { id_categoria: 2, nome_categoria: "TV" }
    ],
    Prodotto: [
        { id_prodotto: 1, id_categoria: 1, nome_prodotto: "LG 34WN650", prezzo: 385.875 },
        { id_prodotto: 2, id_categoria: 2, nome_prodotto: "Samsung TV", prezzo: 440 }
    ]
};


const mockLoginData = {
    users: [
        { username: "kristian", password: "123456" },
        { username: "lorenzo", password: "qwerty" }
    ]
};


fs.readFileSync.mockImplementation((file) => {
    if (file === "Magazzino.json") return JSON.stringify(mockMagazzinoData);
    if (file === "Login.json") return JSON.stringify(mockLoginData);
    throw new Error(`File not found: ${file}`);
});

// Mock della scrittura dei file
fs.writeFileSync.mockImplementation((file, data) => {
    if (file === "Magazzino.json") {
        const parsedData = JSON.parse(data);
        
        // Aggiorna i dati mockati
        mockMagazzinoData.Prodotto = parsedData.Prodotto;
        mockMagazzinoData.Categoria = parsedData.Categoria;
    }
});


// Prima di ogni test, carica i dati mockati
beforeEach(() => {
    caricaMagazzino(); // Richiama la funzione che carica i dati
});

// Test per controlloLogin
describe("controlloLogin", () => {
    it("autentica un utente valido", () => {
        // Verifica che un utente con credenziali corrette venga autenticato
        expect(controlloLogin("kristian", "123456")).toBe(true);
    });

    it("rifiuta un utente con credenziali errate", () => {
        // Verifica che l'accesso venga negato per password errata
        expect(controlloLogin("kristian", "wrongpassword")).toBe(false);
    });

    it("rifiuta un utente non esistente", () => {
        // Verifica che l'accesso venga negato per utente inesistente
        expect(controlloLogin("nonexistent", "123456")).toBe(false);
    });
});


// Test per trovaIDCategoria
describe("trovaIDCategoria", () => {
    it("trova l'ID della categoria esistente", () => {
        // Controlla che il nome della categoria restituisca il giusto ID
        expect(trovaIDCategoria("Monitor")).toBe(1);
    });

    it("restituisce undefined per una categoria inesistente", () => {
        // Verifica che una categoria non trovata restituisca undefined
        expect(trovaIDCategoria("Inesistente")).toBeUndefined();
    });
});


// Test per stampaProdotti
describe("stampaProdotti", () => {
    it("stampa i prodotti della categoria esistente", () => {
        // Mock del metodo console.log per verificare l'output
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();
        stampaProdotti(1); // Categoria con ID 1
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("LG 34WN650"));
        consoleSpy.mockRestore(); // Ripristina console.log
    });

    it("avvisa quando la categoria non esiste", () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();
        stampaProdotti(999); // Categoria non esistente
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Questa categoria non esiste"));
        consoleSpy.mockRestore();
    });
});



// Test per cercaProdotto
describe("cercaProdotto", () => {
    it("trova le informazioni di un prodotto esistente", () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();
        cercaProdotto("LG 34WN650"); // Nome prodotto esistente
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("LG 34WN650"));
        consoleSpy.mockRestore();
    });

    it("avvisa quando il prodotto non esiste", () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();
        cercaProdotto("NonEsiste"); // Nome prodotto inesistente
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Questo prodotto non esiste"));
        consoleSpy.mockRestore();
    });
});

// Test per nomiCategoria
describe("nomiCategoria", () => {
    it("restituisce tutti i nomi delle categorie ordinate", () => {
        expect(nomiCategoria()).toEqual(["Monitor", "TV"]);
    });
});

// Test per nomiProdotti
describe("nomiProdotti", () => {
    it("restituisce tutti i nomi dei prodotti ordinati", () => {
        expect(nomiProdotti()).toEqual(["LG 34WN650", "Samsung TV"]);
    });
});

// Test per cambioPrezzo
describe("cambioPrezzo", () => {
    it("cambia il prezzo dei prodotti", () => {
        cambioPrezzo(1, 10); // Incremento del 10% sui prodotti della categoria con ID 1

        // Verifica che il prezzo del primo prodotto sia stato aggiornato
        expect(mockMagazzinoData.Prodotto[0].prezzo).toBeCloseTo(424.4625, 2); // Nuovo prezzo calcolato

        // Verifica che il file sia stato aggiornato (chiamato fs.writeFileSync)
        expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it("non modifica prodotti per una categoria inesistente", () => {
        // Spia console.log per verificare che venga stampato il messaggio di errore
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();

        cambioPrezzo(999, 10); // Categoria non esistente

        // Verifica che sia stato stampato "Questa categoria non esiste"
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Questa categoria non esiste"));

        // Ripristina il comportamento originale di console.log
        consoleSpy.mockRestore();
    });
});

// Test per cancellaProdotto
describe("cancellaProdotto", () => {
    it("cancella un prodotto esistente", () => {
        
        cancellaProdotto("LG 34WN650"); // Nome prodotto da cancellare
        //let lung = mockLoginData.length-1
        expect(mockMagazzinoData.Prodotto).toHaveLength(1); // Verifica che il prodotto sia stato rimosso
    });

    it("non cancella un prodotto inesistente", () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();
        cancellaProdotto("NonEsiste"); // Nome prodotto inesistente
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Questo prodotto non esiste"));
        //expect(mockMagazzinoData.Prodotto).toHaveLength(1);        
    });
});

// Test per cancellaCategoria
describe("cancellaCategoria", () => {
    it("cancella una categoria e i prodotti collegati", () => {
        cancellaCategoria(1); // ID categoria da cancellare
        expect(mockMagazzinoData.Categoria).toHaveLength(1); // Verifica che la categoria sia stata rimossa
        expect(mockMagazzinoData.Prodotto).toHaveLength(1); // Verifica che i prodotti associati siano stati rimossi
    });

    it("non cancella nulla per una categoria inesistente", () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();
        cancellaCategoria(999); // ID categoria inesistente
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Questa categoria non esiste"));
    });
});

// Test per aggiungiProdotto
describe("aggiungiProdotto", () => {

    it("non aggiunge un prodotto duplicato", () => {
        aggiungiProdotto({ id_prodotto: 1, id_categoria: 1, nome_prodotto: "LG 34WN650", prezzo: 385.875 });
        expect(mockMagazzinoData.Prodotto).toHaveLength(2); // Nessuna modifica alla lunghezza
    });

    it("aggiunge un nuovo prodotto valido", () => {
        aggiungiProdotto({ id_prodotto: 35, id_categoria: 12, nome_prodotto: "NuovoProdotto", prezzo: 300 });
        expect(mockMagazzinoData.Prodotto).toHaveLength(3); // Verifica che il prodotto sia stato aggiunto
        expect(mockMagazzinoData.Prodotto[2].nome_prodotto).toBe("NuovoProdotto");
    });
});



// Test per aggiungiCategoria
describe("aggiungiCategoria", () => {
    it("non aggiunge una categoria duplicata", () => {
        aggiungiCategoria({ id_categoria: 1, nome_categoria: "Monitor" });
        expect(mockMagazzinoData.Categoria).toHaveLength(2);
    });

    it("aggiunge una nuova categoria valida", () => {
        aggiungiCategoria({ id_categoria: 3, nome_categoria: "NuovaCategoria" });
        expect(mockMagazzinoData.Categoria).toHaveLength(3);
    });

    
});



