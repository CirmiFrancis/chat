// Código del Server

// Importación de Módulos
const express = require("express");
const exphbs = require("express-handlebars");
const socket = require("socket.io");

const app = express(); // Crea una instancia de la aplicación Express
const PUERTO = 8080;

// Middlewares
app.use(express.static("./src/public")); // Cuando el servidor recibe una solicitud para un recurso estático, Express buscará en esta carpeta y servirá el archivo correspondiente si lo encuentra
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Configuramos Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views"); // Establece la ubicación de las vistas (plantillas) de la aplicación

// Rutas
app.get("/", (req, res) => {
    res.render("index");
})

// Listen
const httpServer =  app.listen(PUERTO, () => {
    console.log(`Escuchando en el Puerto: ${PUERTO}`);
})

// Socket.io
const io = new socket.Server(httpServer); // Crea una instancia de la aplicación Socket.io

let messages = []; // Array de mensajes
let usersConnected = {}; // Usuarios conectados
let usersQuantity = 0; // Cantidad de usuarios

io.on("connection", (socket) => {
    socket.on("checkUser", (userName) => {
        if (Object.values(usersConnected).includes(userName)) {
            socket.emit("userExists");
        } 
        else {
            socket.emit("userAccepted", userName);
            usersConnected[socket.id] = userName;
            
            usersQuantity += 1;
            console.log("Nuevo usuario conectado:", userName);

            const welcomeMessage = { user: 'SERVIDOR', message: `El usuario <u>${userName}</u> se ha conectado.` };
            messages.push(welcomeMessage);

            io.emit("usersQuantity", usersQuantity);
            io.emit("messagesLogs", messages);
        }
    });

    socket.on('disconnect', () => {
        const userName = usersConnected[socket.id];
        if (userName) {
            usersQuantity -= 1;
            console.log("Usuario desconectado:", userName);

            const goodbyeMessage = { user: 'SERVIDOR', message: `El usuario <u>${userName}</u> se ha desconectado.` };
            messages.push(goodbyeMessage);

            delete usersConnected[socket.id];

            io.emit("usersQuantity", usersQuantity);
            io.emit("messagesLogs", messages);
        }
    });

    socket.on("message", data => { 
        messages.push(data);
        io.emit("messagesLogs", messages);
    });
})