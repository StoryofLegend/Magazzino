const inquirer = require('inquirer');
const fs = require('fs');

const colors = require('colors');
const {
    caricaMagazzino,
    login,
    cli,
    aggiungiProdotto,
    cancellaProdotto,
    nomiProdotti,
    nomiCategoria
} = require('../Magazzino'); // Percorso del file da testare

jest.mock('fs'); // Mocka 'fs'
jest.mock('inquirer'); // Mock di inquirer

// Mock dei dati JSON
const mockMagazzinoData = {
    Categoria: [
        { id_categoria: 1, nome_categoria: "Monitor" },
        { id_categoria: 2, nome_categoria: "Smartphone" }
    ],
    Prodotto: [
        { id_prodotto: 1, id_categoria: 1, nome_prodotto: "LG Monitor", prezzo: 200 },
        { id_prodotto: 2, id_categoria: 2, nome_prodotto: "iPhone", prezzo: 800 }
    ]
};


const mockLoginData = {
    users: [
        { username: "kristian", password: "123456" },
        { username: "admin", password: "password" }
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



beforeEach(() => {

    // Carica sempre il magazzino prima di ogni test
    caricaMagazzino();
});


afterEach(() => {
    jest.restoreAllMocks(); // Ripristina i mock dopo ogni test
});


describe('Scenario di login e visualizzazione prodotti di una categoria', () => {
    

    test('Tentativo di accesso con credenziali corrette e visualizzazione dei prodotti di una categoria', async () => {
        // Mock delle risposte dell'utente
        inquirer.prompt = jest.fn()
            .mockResolvedValueOnce({ username: 'admin', password: 'password' })
            .mockResolvedValueOnce({ magazzino: "Stampa i prodotti di una certa categoria" }) // Prima operazione CLI
            .mockResolvedValueOnce({ categoria: 'Monitor' }) // Scelta della categoria
            .mockResolvedValueOnce({ continuare: 'n' }); // Fine operazioni
    
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
        await login(); // Esegui il flusso della CLI
    
        // Aspetta un tick del ciclo eventi per assicurarti che tutte le chiamate asincrone siano completate
        await new Promise(process.nextTick);
    
        // Verifica che le chiamate siano registrate correttamente
        const calls = consoleSpy.mock.calls.map(call => call[0]); // Estrai i messaggi
        
        
    expect(calls[0]).toBe(colors.green("Autenticazione effettuata correttamente\n"));
    expect(calls[1]).toBe(colors.blue(
        "\nId prodotto: 1" +
        "\nNome prodotto: LG Monitor" +
        "\nPrezzo: 200"
    ));
});


    test('Tentativo di accesso con credenziali errate e visualizzazione dei prodotti di una categoria', async () => {
        inquirer.prompt = jest.fn()
            .mockResolvedValueOnce({ username: 'nomeInventato', password: 'passwordSbagliata' })
            .mockResolvedValueOnce({ magazzino: "Stampa i prodotti di una certa categoria" }) // Prima operazione CLI
            .mockResolvedValueOnce({ categoria: 'Monitor' }) // Scelta della categoria
            .mockResolvedValueOnce({ continuare: 'n' }); // Fine operazioni
    
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
        await login(); // Esegui il flusso della CLI
    
        // Aspetta un tick del ciclo eventi per assicurarti che tutte le chiamate asincrone siano completate
        await new Promise(process.nextTick);
    
        // Verifica che le chiamate siano registrate correttamente
        const calls = consoleSpy.mock.calls.map(call => call[0]); // Estrai i messaggi

        expect(calls[0]).toBe(colors.red("\nUsername o password errati\n"));
    });
    
    

});   

describe('Scenari di aggiunta e cancellazione prodotti', () => {

    test('Scenario di aggiunta prodotto da CLI', async () => {
        inquirer.prompt = jest.fn()
            .mockResolvedValueOnce({ magazzino: 'Aggiungi un nuovo prodotto' }) // Prima operazione CLI
            .mockResolvedValueOnce({ id_prodotto: '99', id_categoria: '2',
                 nome_prodotto: 'ProdottoProva', prezzo: '23'}) // Scelta della categoria
            .mockResolvedValueOnce({ continuare: 'n' }); // Fine operazioni

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

            await cli(); // Esegui il flusso della CLI
    
            // Aspetta un tick del ciclo eventi per assicurarti che tutte le chiamate asincrone siano completate
            await new Promise(process.nextTick);

        expect(mockMagazzinoData.Prodotto).toHaveLength(3); // Verifica che il prodotto sia stato aggiunto
        expect(mockMagazzinoData.Prodotto[2].nome_prodotto).toBe("ProdottoProva");
    })


    test('Scenario di cancellazione prodotto da CLI', async () => {
        inquirer.prompt = jest.fn()
            .mockResolvedValueOnce({ magazzino: 'Cancella un prodotto' }) // Prima operazione CLI
            .mockResolvedValueOnce({ prodotto: 'ProdottoProva'}) // Scelta della categoria
            .mockResolvedValueOnce({ continuare: 'n' }); // Fine operazioni

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

            await cli(); // Esegui il flusso della CLI
    
            // Aspetta un tick del ciclo eventi per assicurarti che tutte le chiamate asincrone siano completate
            await new Promise(process.nextTick);

        expect(mockMagazzinoData.Prodotto).toHaveLength(2); // Verifica che il prodotto sia stato aggiunto
        
        // Verifica che il prodotto cancellato non sia più nell'elenco
        const prodottoTrovato = mockMagazzinoData.Prodotto.find(prod => prod.nome_prodotto === 'ProdottoProva');
        expect(prodottoTrovato).toBeUndefined(); // Il prodotto non deve essere trovato
    })


    test('Scenario di aggiunta e cancellazione dello stesso prodotto da CLI', async () => {
        // Mock delle risposte dell'utente per l'aggiunta del prodotto
        inquirer.prompt = jest.fn()
            .mockResolvedValueOnce({ magazzino: 'Aggiungi un nuovo prodotto' }) // Prima operazione CLI: Aggiungi prodotto
            .mockResolvedValueOnce({ id_prodotto: '99', id_categoria: '2', nome_prodotto: 'ProdottoProva', prezzo: '23' }) // Dettagli del nuovo prodotto
            .mockResolvedValueOnce({ continuare: 'y' }) // Continuare con l'aggiunta
            .mockResolvedValueOnce({ magazzino: 'Cancella un prodotto' }) // Seconda operazione CLI: Cancella prodotto
            .mockResolvedValueOnce({ prodotto: 'ProdottoProva' }) // Nome del prodotto da cancellare
            .mockResolvedValueOnce({ continuare: 'n' }); // Fine operazioni
    
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
        
        await cli();

         // Aspetta un tick del ciclo eventi per assicurarti che tutte le chiamate asincrone siano completate
         await new Promise(process.nextTick);

         const calls = consoleSpy.mock.calls.map(call => call[0]); // Estrai i messaggi
         expect(calls[0]).toBe("Prodotto aggiunto correttamente");

         expect(mockMagazzinoData.Prodotto).toHaveLength(2); // Verifica che il prodotto sia stato aggiunto
        
         // Verifica che il prodotto cancellato non sia più nell'elenco
         const prodottoTrovato = mockMagazzinoData.Prodotto.find(prod => prod.nome_prodotto === 'ProdottoProva');
         expect(prodottoTrovato).toBeUndefined(); // Il prodotto non deve essere trovato

})

})


describe('Scenari di aggiunta e cancellazione categorie e prodotti associati', () => {

    test('Scenario di aggiunta categoria con prodotti da CLI', async () => {
        inquirer.prompt = jest.fn()
            .mockResolvedValueOnce({ magazzino: 'Aggiungi una nuova categoria' }) // Prima operazione CLI
            .mockResolvedValueOnce({ id_categoria: '99', nome_categoria: 'CategoriaProva'}) // Scelta della categoria
            .mockResolvedValueOnce({ continuare: 'y' }) // Fine operazioni
            .mockResolvedValueOnce({ magazzino: 'Aggiungi un nuovo prodotto' }) // Prima operazione CLI: Aggiungi prodotto
            .mockResolvedValueOnce({ id_prodotto: '99', id_categoria: '99', nome_prodotto: 'ProdottoProva1', prezzo: '23' }) // Dettagli del nuovo prodotto
            .mockResolvedValueOnce({ continuare: 'y' }) // Continuare con l'aggiunta
            .mockResolvedValueOnce({ magazzino: 'Aggiungi un nuovo prodotto' }) // Prima operazione CLI: Aggiungi prodotto
            .mockResolvedValueOnce({ id_prodotto: '100', id_categoria: '99', nome_prodotto: 'ProdottoProva2', prezzo: '46' }) // Dettagli del nuovo prodotto
            .mockResolvedValueOnce({ continuare: 'n' }); // Continuare con l'aggiunta
   

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
        
        await cli();

        // Aspetta un tick del ciclo eventi per assicurarti che tutte le chiamate asincrone siano completate
        await new Promise(process.nextTick);


        expect(mockMagazzinoData.Categoria).toHaveLength(3);
        expect(mockMagazzinoData.Categoria[2].nome_categoria).toBe("CategoriaProva");

        expect(mockMagazzinoData.Prodotto).toHaveLength(4); // Verifica che il prodotto sia stato aggiunto
        expect(mockMagazzinoData.Prodotto[2].nome_prodotto).toBe("ProdottoProva1");
        expect(mockMagazzinoData.Prodotto[3].nome_prodotto).toBe("ProdottoProva2");
     })


     test('Scenario di cancellazione categoria e prodotti associati da CLI', async () => {
        inquirer.prompt = jest.fn()
            .mockResolvedValueOnce({ magazzino: 'Cancella una categoria e tutti i' +
                ' prodotti collegati' }) // Prima operazione CLI
            .mockResolvedValueOnce({ categoria: 'CategoriaProva'}) // Scelta della categoria
            .mockResolvedValueOnce({ continuare: 'n' }); // Fine operazioni


            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
        
            await cli();

            // Aspetta un tick del ciclo eventi per assicurarti che tutte le chiamate asincrone siano completate
            await new Promise(process.nextTick);

            expect(mockMagazzinoData.Categoria).toHaveLength(2);
            const categoriaTrovata = mockMagazzinoData.Categoria.find(cat => cat.nome_categoria === 'CategoriaProva');
            expect(categoriaTrovata).toBeUndefined();

            expect(mockMagazzinoData.Prodotto).toHaveLength(2);
            const prodottoTrovato1 = mockMagazzinoData.Prodotto.find(prod => prod.nome_prodotto === 'ProdottoProva1');
            expect(prodottoTrovato1).toBeUndefined(); // Il prodotto non deve essere trovato
            const prodottoTrovato2 = mockMagazzinoData.Prodotto.find(prod => prod.nome_prodotto === 'ProdottoProva2');
            expect(prodottoTrovato2).toBeUndefined(); // Il prodotto non deve essere trovato

     })
})


describe('Scenari di login e visualizzazione di un prodotto', () => {
    test('Scenari di login e visualizzazione di un prodotto ESISTENTE', async () => {
        inquirer.prompt = jest.fn()
        .mockResolvedValueOnce({ username: 'admin', password: 'password' })
        .mockResolvedValueOnce({ magazzino: 'Cerca le informazioni di un prodotto' }) // Prima operazione CLI
        .mockResolvedValueOnce({ prodotto: 'LG Monitor'}) // Scelta della categoria
        .mockResolvedValueOnce({ continuare: 'n' }); // Fine operazioni

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
        
        await login();

        // Aspetta un tick del ciclo eventi per assicurarti che tutte le chiamate asincrone siano completate
        await new Promise(process.nextTick);

        // Verifica che le chiamate siano registrate correttamente
        const calls = consoleSpy.mock.calls.map(call => call[0]); // Estrai i messaggi
        
        
        expect(calls[0]).toBe(colors.green("Autenticazione effettuata correttamente\n"));
        expect(calls[1]).toBe(colors.blue("\nId prodotto: " + "1" +
            "\nId categoria: " + "1" +
            "\nNome prodotto: " + "LG Monitor" +
            "\nPrezzo: " + "200"))
})

test('Scenari di login e visualizzazione di un prodotto NON ESISTENTE', async () => {
    inquirer.prompt = jest.fn()
    .mockResolvedValueOnce({ username: 'admin', password: 'password' })
    .mockResolvedValueOnce({ magazzino: 'Cerca le informazioni di un prodotto' }) // Prima operazione CLI
    .mockResolvedValueOnce({ prodotto: 'ProdottoInventato'}) // Scelta della categoria
    .mockResolvedValueOnce({ continuare: 'n' }); // Fine operazioni

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
        
        await login();

        // Aspetta un tick del ciclo eventi per assicurarti che tutte le chiamate asincrone siano completate
        await new Promise(process.nextTick);

        // Verifica che le chiamate siano registrate correttamente
        const calls = consoleSpy.mock.calls.map(call => call[0]); // Estrai i messaggi

        expect(calls[0]).toBe(colors.green("Autenticazione effettuata correttamente\n"));
        expect(calls[1]).toBe(colors.red("Questo prodotto non esiste"));
})
})


describe('Scenari di login e cambio prezzo a dei prodotti', () => {

    test('Scenario di login e cambio prezzo di una categoria ESISTENTE', async () => {
        inquirer.prompt = jest.fn()
    .mockResolvedValueOnce({ username: 'admin', password: 'password' })
    .mockResolvedValueOnce({ magazzino: 'Cambia il prezzo dei prodotti di una ' +
                'certa categoria' }) // Prima operazione CLI
    .mockResolvedValueOnce({ categoria: 'Monitor', percentuale : "10" }) // Scelta della categoria
    .mockResolvedValueOnce({ continuare: 'n' }); // Fine operazioni

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
        
        await login();

        // Aspetta un tick del ciclo eventi per assicurarti che tutte le chiamate asincrone siano completate
        await new Promise(process.nextTick);

        // Verifica che le chiamate siano registrate correttamente
        const calls = consoleSpy.mock.calls.map(call => call[0]); // Estrai i messaggi
        expect(calls[0]).toBe(colors.green("Autenticazione effettuata correttamente\n"));

        expect(mockMagazzinoData.Prodotto[0].prezzo).toBeCloseTo(220, 2);
})

test('Scenario di login e cambio prezzo di una categoria NON ESISTENTE', async () => {
    inquirer.prompt = jest.fn()
.mockResolvedValueOnce({ username: 'admin', password: 'password' })
.mockResolvedValueOnce({ magazzino: 'Cambia il prezzo dei prodotti di una ' +
            'certa categoria' }) // Prima operazione CLI
.mockResolvedValueOnce({ categoria: 'CategoriaInventata', percentuale : "10" }) // Scelta della categoria
.mockResolvedValueOnce({ continuare: 'n' }); // Fine operazioni

const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    
    await login();

    // Aspetta un tick del ciclo eventi per assicurarti che tutte le chiamate asincrone siano completate
    await new Promise(process.nextTick);

    // Verifica che le chiamate siano registrate correttamente
    const calls = consoleSpy.mock.calls.map(call => call[0]); // Estrai i messaggi
    expect(calls[0]).toBe(colors.green("Autenticazione effettuata correttamente\n"));
    expect(calls[1]).toBe(colors.red("Questa categoria non esiste"));
})

})

