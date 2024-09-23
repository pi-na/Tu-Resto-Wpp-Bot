const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');

// Axios configuration with base URL for the API
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000'
});

const app = express();
app.use(express.json());  // Para procesar cuerpos JSON
app.use(express.urlencoded({ extended: true }));  // Para cuerpos URL-encoded

const port = 3000;

// WhatsApp Web client setup with LocalAuth
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'client-one' // Puedes tener diferentes clientes usando IDs diferentes
    })
});

// WPP-WEB JS (handling QR code)
client.on('qr', qr => {
    console.log("Generando QR");
    qrcode.generate(qr, { small: true });
});

// When the client is ready
client.on('ready', () => {
    console.log('Cliente listo!');
    setupAutoMessage(); // Llamada a tu función de auto mensajes
});

// Handling incoming messages
client.on('message', async msg => {
    if(msg.body.includes('pedido:')) {
        try {
            await api.post('/wpp', {
                body: msg.body.split('pedido:')[1].trim(), // Extrae el mensaje
                phone_number: msg.from.split('@')[0] // Extrae el número del mensaje
            });
        } catch (error) {
            console.error('ERROR PROCESANDO EL MENSAJE', error);
        }
    }
});

// Express API setup
app.listen(port, () => {
    console.log("Server Listening on PORT:", port);
});

// Endpoint for sending messages (aún no implementado)
app.post('/send_message', (req, res) => {
    console.log('Enviando con mensaje:', req.body);

    // Accede directamente a los valores del cuerpo
    const phone_number = req.body.phone_number;
    const body = req.body.message;

    // Asegúrate de que los datos existan antes de enviar el mensaje
    client.sendMessage(phone_number + '@c.us', body);
    res.status(200).send('Mensaje enviado correctamente');
});

// Initialize the WhatsApp client
client.initialize();
