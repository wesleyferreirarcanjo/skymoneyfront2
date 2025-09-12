# Docker Setup para SkyMoney Front 2

Este documento explica como usar o Docker para executar a aplicação React em produção.

## Pré-requisitos

- Docker instalado na máquina
- Docker Compose (opcional, mas recomendado)

## Como usar

### Opção 1: Usando Docker diretamente

1. **Construir a imagem:**
   ```bash
   docker build -t skymoneyfront2 .
   ```

2. **Executar o container:**
   ```bash
   docker run -p 3000:80 skymoneyfront2
   ```

3. **Acessar a aplicação:**
   Abra o navegador em `http://localhost:3000`

### Opção 2: Usando Docker Compose (Recomendado)

1. **Subir a aplicação:**
   ```bash
   docker-compose up --build
   ```

2. **Executar em background:**
   ```bash
   docker-compose up -d --build
   ```

3. **Parar a aplicação:**
   ```bash
   docker-compose down
   ```

## Estrutura do Docker

### Dockerfile
- **Multi-stage build**: Otimiza o tamanho da imagem final
- **Stage 1 (builder)**: Instala dependências e faz o build da aplicação
- **Stage 2 (production)**: Usa Nginx Alpine para servir os arquivos estáticos

### Recursos
- **Porta**: A aplicação roda na porta 80 dentro do container, mapeada para 3000 no host
- **Nginx**: Servidor web leve e eficiente para arquivos estáticos
- **Healthcheck**: Verificação automática de saúde do container (opcional)

## Otimizações

- `.dockerignore`: Exclui arquivos desnecessários do contexto de build
- **Multi-stage**: Reduz significativamente o tamanho da imagem final
- **Alpine Linux**: Base leve para menor footprint

## Troubleshooting

### Container não inicia
Verifique se a porta 3000 está livre:
```bash
docker-compose ps
docker-compose logs
```

### Build falha
Certifique-se de que todas as dependências estão corretas no `package.json`:
```bash
docker build --no-cache -t skymoneyfront2 .
```

### Aplicação não carrega
Verifique os logs do container:
```bash
docker-compose logs skymoneyfront2
```
