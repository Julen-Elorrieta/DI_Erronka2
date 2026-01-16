const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.get('/meetings', (req, res) => {
    const type = req.query.type;
    const jsonPath = path.join(__dirname, 'ikastetxeak.json');
    let jsonData;
    try {
        jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (err) {
        return res.status(500).json({ error: 'Error reading local JSON file' });
    }
    const data = jsonData.CENTROS;
    if (type === 'filters') {
        const titularidades = [...new Set(data.map(r => r.DTITUC))];
        const territorios = [...new Set(data.map(r => r.DTERRC))];
        res.json({ titularidades, territorios });
    } else if (type === 'municipios') {
        const territorio = req.query.territorio;
        let municipios = data.map(r => r.DMUNIC);
        if (territorio) {
            municipios = data.filter(r => r.DTERRC === territorio).map(r => r.DMUNIC);
        }
        res.json([...new Set(municipios)]);
    } else if (type === 'meetings') {
        // Aquí deberías conectar con la base de datos si lo necesitas
        res.json([]); // Devuelve vacío por defecto
    } else {
        let filteredData = data;
        if (req.query.titularidad) filteredData = filteredData.filter(r => r.DTITUC === req.query.titularidad);
        if (req.query.territorio) filteredData = filteredData.filter(r => r.DTERRC === req.query.territorio);
        if (req.query.municipio) filteredData = filteredData.filter(r => r.DMUNIC === req.query.municipio);
        res.json({ "CENTROS": filteredData });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});