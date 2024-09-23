const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const axios = require("axios");

// Axios configuration with base URL for the API
const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
});

const app = express();
app.use(express.json()); // Para procesar cuerpos JSON
app.use(express.urlencoded({ extended: true })); // Para cuerpos URL-encoded

const port = 3000;

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-one",
    }),
    puppeteer: {
        args: ["--no-sandbox"],
        headless: true,
    },
});

// WPP-WEB JS (handling QR code)
client.on("qr", (qr) => {
    console.log("Generando QR");
    qrcode.generate(qr, { small: true });
});

// When the client is ready
client.on("ready", () => {
    console.log("Cliente listo!");
});

// Handling incoming messages
client.on("message", async (msg) => {
    if (msg.body.toLowerCase().includes("pedido:")) {
        try {
            await api.post("/wpp", {
                body: msg.body.split("pedido:")[1].trim(),
                phone_number: msg.from.split("@")[0],
            });
        } catch (error) {
            console.error("ERROR PROCESANDO EL MENSAJE", error);
        }
    }
});

// Express API setup
app.listen(port, () => {
    console.log("Server Listening on PORT:", port);
});

app.post("/send-message", async (req, res) => {
    try {
        const phone_number = req.body.phone_number;
        const message = req.body.message;

        const phone_number_formatted = phone_number + "@c.us";

        await client.sendMessage(phone_number_formatted, message);
        res.status(200).send("Mensaje enviado correctamente");
    } catch (error) {
        console.error("Error al enviar el mensaje:", error);
        res.status(500).send("Error al enviar el mensaje");
    }
});

client.initialize();
