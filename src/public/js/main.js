// Código del Cliente

const socket = io(); // Creamos una instancia de socket.io desde el lado del cliente ahora

let user; // Creamos una variable para guardar al usuario

const chatBox = document.getElementById("chatBox");
const usersQuantitySpan = document.getElementById("usersQuantity");
const messagesContainer = document.querySelector(".container-messages");

const promptUsername = () => { // Solicita el nombre de usuario
    Swal.fire({
        title: "Identificate",
        text: "Ingresa un usuario para identificarte en el chat",
        input: "text",
        inputValidator: (value) => {
            return !value && "Necesitas escribir un nombre para continuar.";
        },
        allowOutsideClick: false,
        allowEscapeKey: false
    }).then(result => {
        result.value && socket.emit("checkUser", result.value.toUpperCase());
    });
};

promptUsername();

socket.on("userExists", () => {
    Swal.fire({
        icon: "error",
        title: "Nombre de usuario existente",
        text: "Por favor, elige otro nombre de usuario.",
        allowOutsideClick: false,
        allowEscapeKey: false
    }).then(() => {
        promptUsername();
    });
});

socket.on("userAccepted", (username) => {
    user = username;
});

//Mensaje a enviar
chatBox.addEventListener("keyup", (event) => {
    if(event.key === "Enter") {
        if(chatBox.value.trim().length > 0) {
            socket.emit("message", {user: user, message: chatBox.value});
            chatBox.value = "";
        }
    }
})

//Listener de mensajes
socket.on("messagesLogs", data => {
    let messages = "";

    data.forEach( message => {
        const isCurrentUser = message.user === user;
        const isServerMessage = message.user === "SERVIDOR";
        const welcomeUser = message.message.includes(" conectado"); // Dejo un espacio para diferenciar de la subcadena 'desconectado'
        const goodbyeUser = message.message.includes("desconectado");
        
        messages +=
        `
        <div ${ isServerMessage && welcomeUser ? 'class="server-message welcome-message"' : 
                isServerMessage && goodbyeUser ? 'class="server-message goodbye-message"' :
                isCurrentUser ? 'class="own-message"' : 'class="others-message"'}>
            
            <h3>${message.user}</h3>
            <p>${message.message}</p>
        </div>
        `;
    })

    messagesContainer.innerHTML = messages;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
})

// Listener de cantidad de usuarios
socket.on("usersQuantity", quantity => {
    usersQuantitySpan.textContent = quantity;
});

//Mostrar Log de Mensajes
socket.on("messagesLogs", (messages) => {
    if (messages.length > 0) {
        document.querySelector('.container-messages').style.display = 'block';
    } 
    else {
        document.querySelector('.container-messages').style.display = 'none';
    }
});
