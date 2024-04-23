const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');    
const swaggerDocument = require('./swagger.json');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use(cors())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
;


const dadosPath = path.join(__dirname, 'dados.json');

app.get('/api/imagens', (req, res) => {
    fs.readFile(dadosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo dados.json:', err);
            res.status(500).send('Erro interno do servidor.');
            return;
        }
        const jsonData = JSON.parse(data);
        res.json(jsonData.images);
    });
});

app.post('/api/adicionar-imagem', (req, res) => {
    const { titulo, descricao, url } = req.body;

    fs.readFile(dadosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo dados.json:', err);
            res.status(500).send('Erro interno do servidor.');
            return;
        }

        const jsonData = JSON.parse(data);
        const newId = jsonData.images.length + 1;

        const newImage = {
            id: newId,
            titulo: titulo,
            descricao: descricao,
            url: url
        };

        jsonData.images.push(newImage);

        const updatedData = JSON.stringify(jsonData, null, 2);

        fs.writeFile(dadosPath, updatedData, (err) => {
            if (err) {
                console.error('Erro ao salvar dados no arquivo dados.json:', err);
                res.status(500).send('Erro interno do servidor.');
                return;
            }

            res.json(newImage);
        });
    });
});

app.delete('/api/excluir-imagem/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile(dadosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo dados.json:', err);
            res.status(500).send('Erro interno do servidor.');
            return;
        }

        const jsonData = JSON.parse(data);
        const updatedImages = jsonData.images.filter(image => image.id !== parseInt(id));

        const updatedData = {
            images: updatedImages
        };

        fs.writeFile(dadosPath, JSON.stringify(updatedData, null, 2), (err) => {
            if (err) {
                console.error('Erro ao salvar dados no arquivo dados.json:', err);
                res.status(500).send('Erro interno do servidor.');
                return;
            }

            res.status(200).send('Imagem excluída com sucesso.');
        });
    });
});

app.put('/api/editar-imagem/:id', (req, res) => {
    const id = req.params.id;
    const { titulo, descricao } = req.body;

    fs.readFile(dadosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo dados.json:', err);
            res.status(500).send('Erro interno do servidor.');
            return;
        }

        const jsonData = JSON.parse(data);

        const imageIndex = jsonData.images.findIndex(image => image.id === parseInt(id));
        if (imageIndex === -1) {
            res.status(404).send('Imagem não encontrada.');
            return;
        }

        jsonData.images[imageIndex].titulo = titulo;
        jsonData.images[imageIndex].descricao = descricao;

        const updatedData = JSON.stringify(jsonData, null, 2);

        fs.writeFile(dadosPath, updatedData, (err) => {
            if (err) {
                console.error('Erro ao salvar dados no arquivo dados.json:', err);
                res.status(500).send('Erro interno do servidor.');
                return;
            }

            res.json(jsonData.images[imageIndex]);
        });
    });
});


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});