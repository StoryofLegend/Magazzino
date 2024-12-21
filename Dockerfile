# Usa un'immagine base Node.js
FROM node:latest

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file generati nella directory dist
COPY dist/ /app/ 

# Espone la porta 3000
EXPOSE 3000

# Comando di avvio 
CMD ["node", "bundle.js"]