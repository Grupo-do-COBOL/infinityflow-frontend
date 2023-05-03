# Usa uma imagem base do Node.js
FROM node:14-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos do projeto para o contêiner
COPY . .

# Instala as dependências do projeto
RUN npm install --production

# Expõe a porta em que o aplicativo será executado
EXPOSE 3070

CMD ["node", "/app/server.js"]

