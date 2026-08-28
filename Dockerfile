FROM node:20-alpine

# Instala dependências do sistema e ferramentas de compilação necessárias
# libc6-compat: essencial para rodar binários feitos para glibc (caso o sqlite3 reclame)
# g++, make, python3: necessários para compilar módulos C++ durante o npm install
RUN apk add --no-cache \
    ca-certificates \
    git \
    python3 \
    make \
    g++ \
    libc6-compat

# Define o diretório de trabalho
WORKDIR /code

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY ./src ./src

# Expõe a porta
EXPOSE 3000

# Comando padrão para produção (npm start)
CMD ["npm", "start"]
