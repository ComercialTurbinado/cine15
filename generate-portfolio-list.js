const fs = require('fs');
const path = require('path');

// Caminho da pasta de portfólio
const portfolioDir = path.join(__dirname, 'portifolio');
const outputFile = path.join(__dirname, 'portfolio-videos.json');

// Função para listar arquivos de vídeo
function listVideoFiles(dir) {
    const files = [];
    
    try {
        if (!fs.existsSync(dir)) {
            console.log(`⚠️  Pasta ${dir} não existe. Criando pasta...`);
            fs.mkdirSync(dir, { recursive: true });
            return files;
        }
        
        const fileList = fs.readdirSync(dir);
        
        fileList.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isFile()) {
                // Verificar se é um arquivo de vídeo
                const ext = path.extname(file).toLowerCase();
                const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
                
                if (videoExtensions.includes(ext)) {
                    files.push({
                        id: `video${files.length + 1}`,
                        filename: file,
                        path: `portifolio/${file}`,
                        name: path.basename(file, ext),
                        extension: ext
                    });
                }
            }
        });
        
        // Ordenar por nome do arquivo
        files.sort((a, b) => a.filename.localeCompare(b.filename));
        
        // Reindexar IDs após ordenação
        files.forEach((file, index) => {
            file.id = `video${index + 1}`;
        });
        
    } catch (error) {
        console.error('❌ Erro ao ler pasta:', error);
    }
    
    return files;
}

// Listar vídeos
const videos = listVideoFiles(portfolioDir);

// Criar objeto com estrutura para o front-end
const portfolioData = {
    videos: videos,
    count: videos.length,
    lastUpdated: new Date().toISOString()
};

// Salvar JSON
try {
    fs.writeFileSync(outputFile, JSON.stringify(portfolioData, null, 2), 'utf8');
    console.log(`✅ ${videos.length} vídeo(s) encontrado(s) na pasta portifolio/`);
    console.log(`✅ Arquivo ${outputFile} criado com sucesso!`);
    
    if (videos.length > 0) {
        console.log('\n📹 Vídeos encontrados:');
        videos.forEach(video => {
            console.log(`   - ${video.id}: ${video.filename}`);
        });
    } else {
        console.log('\n⚠️  Nenhum vídeo encontrado na pasta portifolio/');
        console.log('   Adicione arquivos .mp4, .webm, .ogg, .mov, .avi ou .mkv na pasta.');
    }
} catch (error) {
    console.error('❌ Erro ao salvar arquivo JSON:', error);
    process.exit(1);
}

