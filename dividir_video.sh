#!/bin/bash

# Script para dividir vídeo em chunks de ~400KB
# Uso: ./dividir_video.sh video_original.mp4

if [ -z "$1" ]; then
    echo "Uso: ./dividir_video.sh <arquivo_video.mp4>"
    exit 1
fi

VIDEO_INPUT="$1"
OUTPUT_DIR="video"
TARGET_CHUNK_SIZE_KB=400

# Criar diretório de saída se não existir
mkdir -p "$OUTPUT_DIR"

# Limpar chunks antigos
rm -f "$OUTPUT_DIR"/video_chunk_*.mp4

# Verificar se ffmpeg está instalado
if ! command -v ffmpeg &> /dev/null; then
    echo "Erro: ffmpeg não está instalado."
    echo "Instale com: brew install ffmpeg (macOS) ou apt-get install ffmpeg (Linux)"
    exit 1
fi

# Obter informações do vídeo
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$VIDEO_INPUT")
VIDEO_SIZE=$(ffprobe -v error -show_entries format=size -of default=noprint_wrappers=1:nokey=1 "$VIDEO_INPUT")
VIDEO_SIZE_KB=$((VIDEO_SIZE / 1024))

# Calcular número ideal de chunks baseado no tamanho
TOTAL_CHUNKS=$(( (VIDEO_SIZE_KB + TARGET_CHUNK_SIZE_KB - 1) / TARGET_CHUNK_SIZE_KB ))

# Garantir mínimo de 1 segundo por chunk e máximo de 10 chunks
MIN_DURATION_PER_CHUNK=1.0
MAX_CHUNKS=10

if [ $TOTAL_CHUNKS -gt $MAX_CHUNKS ]; then
    TOTAL_CHUNKS=$MAX_CHUNKS
fi

# Verificar se a duração por chunk seria muito pequena
CHUNK_DURATION=$(echo "scale=2; $DURATION / $TOTAL_CHUNKS" | bc)
if (( $(echo "$CHUNK_DURATION < $MIN_DURATION_PER_CHUNK" | bc -l) )); then
    # Ajustar número de chunks para garantir mínimo de 1 segundo
    TOTAL_CHUNKS=$(echo "scale=0; $DURATION / $MIN_DURATION_PER_CHUNK" | bc)
    if [ $TOTAL_CHUNKS -lt 1 ]; then
        TOTAL_CHUNKS=1
    fi
    if [ $TOTAL_CHUNKS -gt $MAX_CHUNKS ]; then
        TOTAL_CHUNKS=$MAX_CHUNKS
    fi
    CHUNK_DURATION=$(echo "scale=2; $DURATION / $TOTAL_CHUNKS" | bc)
fi

echo "Vídeo original: $VIDEO_INPUT"
echo "Tamanho total: ${VIDEO_SIZE_KB}KB"
echo "Duração total: ${DURATION}s"
echo "Chunks a criar: $TOTAL_CHUNKS"
echo "Duração por chunk: ~${CHUNK_DURATION}s"
echo ""
echo "Dividindo vídeo (isso pode demorar alguns minutos)..."
echo ""

# Dividir vídeo em chunks
for i in $(seq 1 $TOTAL_CHUNKS); do
    # Calcular tempo de início
    START_TIME=$(echo "scale=2; ($i - 1) * $CHUNK_DURATION" | bc)
    
    echo "[$i/$TOTAL_CHUNKS] Processando (início: ${START_TIME}s)..."
    
    # Para o último chunk, usar o restante do vídeo
    if [ $i -eq $TOTAL_CHUNKS ]; then
        ffmpeg -i "$VIDEO_INPUT" \
            -ss "$START_TIME" \
            -c:v libx264 \
            -preset medium \
            -crf 28 \
            -c:a aac \
            -b:a 128k \
            -movflags +faststart \
            -avoid_negative_ts make_zero \
            "$OUTPUT_DIR/video_chunk_${i}.mp4" \
            -y -loglevel error -stats > /dev/null 2>&1
    else
        ffmpeg -i "$VIDEO_INPUT" \
            -ss "$START_TIME" \
            -t "$CHUNK_DURATION" \
            -c:v libx264 \
            -preset medium \
            -crf 28 \
            -c:a aac \
            -b:a 128k \
            -movflags +faststart \
            -avoid_negative_ts make_zero \
            "$OUTPUT_DIR/video_chunk_${i}.mp4" \
            -y -loglevel error -stats > /dev/null 2>&1
    fi
    
    # Verificar se o arquivo foi criado e tem conteúdo
    if [ -f "$OUTPUT_DIR/video_chunk_${i}.mp4" ]; then
        SIZE=$(stat -f%z "$OUTPUT_DIR/video_chunk_${i}.mp4" 2>/dev/null || stat -c%s "$OUTPUT_DIR/video_chunk_${i}.mp4" 2>/dev/null)
        SIZE_KB=$((SIZE / 1024))
        
        if [ $SIZE -gt 1000 ]; then
            echo "  ✓ Chunk $i: ${SIZE_KB}KB"
        else
            echo "  ⚠ Chunk $i muito pequeno (${SIZE_KB}KB)"
        fi
    else
        echo "  ✗ Erro ao criar chunk $i"
    fi
done

echo ""
echo "✅ Processo concluído!"
echo ""
echo "Resumo dos chunks criados:"
ls -lh "$OUTPUT_DIR"/video_chunk_*.mp4 2>/dev/null | awk '{printf "  %s: %s\n", $9, $5}'
