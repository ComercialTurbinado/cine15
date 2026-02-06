# Sistema de Carregamento Sequencial de Vídeo

Este sistema carrega um vídeo de 4MB dividido em 10 chunks de aproximadamente 400KB cada, carregando-os sequencialmente para não sobrecarregar o sistema.

## Como usar

### 1. Preparar o vídeo

Primeiro, você precisa dividir seu vídeo em chunks. Há duas opções:

#### Opção A: Usar o script fornecido (recomendado)

```bash
# Dar permissão de execução
chmod +x dividir_video.sh

# Executar o script
./dividir_video.sh seu_video.mp4
```

O script criará uma pasta `video/` com os arquivos:
- `video_chunk_1.mp4`
- `video_chunk_2.mp4`
- ...
- `video_chunk_10.mp4`

#### Opção B: Dividir manualmente com ffmpeg

Se preferir dividir manualmente ou ajustar os parâmetros:

```bash
# Criar diretório
mkdir -p video

# Dividir em 10 partes iguais
# Substitua DURACAO_TOTAL pela duração total do seu vídeo em segundos
DURACAO_TOTAL=30  # exemplo: 30 segundos
CHUNK_DURATION=$((DURACAO_TOTAL / 10))

for i in {1..10}; do
    START=$(( (i - 1) * CHUNK_DURATION ))
    ffmpeg -i seu_video.mp4 \
        -ss $START \
        -t $CHUNK_DURATION \
        -c copy \
        video/video_chunk_${i}.mp4
done
```

### 2. Estrutura de arquivos

Certifique-se de que a estrutura está assim:

```
cine15/
├── index.html
├── script.js
├── styles.css
└── video/
    ├── video_chunk_1.mp4
    ├── video_chunk_2.mp4
    ├── video_chunk_3.mp4
    ...
    └── video_chunk_10.mp4
```

### 3. Configuração no código

No arquivo `script.js`, você pode ajustar os parâmetros:

```javascript
const videoLoader = new VideoChunkLoader(
    heroVideo,
    'video',        // Caminho base dos chunks (ajuste se necessário)
    10,             // Total de chunks
    400             // Tamanho aproximado de cada chunk em KB
);
```

### 4. Otimização do vídeo (opcional)

Se os chunks estiverem muito grandes, você pode otimizar o vídeo antes de dividir:

```bash
# Reduzir qualidade/bitrate para diminuir o tamanho
ffmpeg -i video_original.mp4 \
    -c:v libx264 \
    -crf 28 \
    -preset medium \
    -c:a aac \
    -b:a 128k \
    video_otimizado.mp4

# Depois dividir o vídeo otimizado
./dividir_video.sh video_otimizado.mp4
```

## Como funciona

1. **Carregamento sequencial**: O sistema carrega um chunk por vez, começando pelo primeiro
2. **MediaSource API**: Usa a API nativa do navegador para concatenar os chunks em um único stream
3. **Fallback**: Se a MediaSource API não for suportada, tenta carregar um vídeo completo como fallback
4. **Performance**: Cada chunk é carregado apenas quando o anterior termina, evitando sobrecarga

## Compatibilidade

- ✅ Chrome/Edge (versões recentes)
- ✅ Firefox (versões recentes)
- ✅ Safari (versões recentes)
- ⚠️ Navegadores antigos podem usar o método alternativo

## Troubleshooting

### Vídeo não aparece
- Verifique se os arquivos estão no diretório correto
- Abra o console do navegador (F12) para ver erros
- Verifique se o caminho no código está correto

### Chunks muito grandes
- Otimize o vídeo antes de dividir (veja seção acima)
- Ajuste o `crf` (valores maiores = menor qualidade = arquivo menor)

### Erro de CORS
- Se estiver testando localmente, use um servidor local:
  ```bash
  # Python
  python -m http.server 8000
  
  # Node.js
  npx http-server
  ```

## Notas importantes

- Os chunks devem estar no mesmo codec e formato
- O vídeo será reproduzido em loop automático
- O vídeo tem opacidade reduzida (30%) para não interferir no texto
- O vídeo está configurado como `muted` e `autoplay` para melhor compatibilidade

