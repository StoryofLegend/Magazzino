const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  
  mode: "production",

  // Punto di ingresso del progetto
  entry: "./Magazzino.js",

  // Configuriamo il file di output (nome del file e della cartella)
  output: {
    filename: "bundle.js", 
    path: path.resolve(__dirname, "dist"), 
  },

  // Aggiungiamo il target per specificare che lavoriamo con un app Node
  target: "node", 

  // Configuriamo i moduli
  module: {
    rules: [
      {
        test: /\.js$/, 
        exclude: /node_modules/, 
        use: {
          loader: "babel-loader", // Usiamo Babel per trasformare il codice da ES6+ a ES5
          options: {
            presets: ["@babel/preset-env"], 
          },
        },
      },
    ],
  },
  // Plugin per copiare file statici nella cartella dist
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "Login.json", to: "Login.json" }, // Copia Login.json nella cartella dist
        { from: "Magazzino.json", to: "Magazzino.json" }, // Copia Magazzino.json nella cartella dist
      ],
    }),
  ],

  
  optimization: {
    minimize: true, // Abilita la minificazione del codice
  },

  
  resolve: {
    extensions: [".js"], // Risolviamo tutti i file con queste estensioni
  },

 
  devtool: "source-map", // Genera una mappa per il debug del codice
};
