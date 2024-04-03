const socket = io(); // Creamos una instancia de socket.io desde el lado del cliente ahora

let user; // Creamos una variable para guardar al usuario

const chatBox = document.getElementById("chatBox");

//Sweetalert2
Swal.fire({
    title: "Identificate",
    text: "Ingresa un usuario para identificarte en el chat",
    input: "text",
    inputValidator: (value) => {
        return !value && "Necesitas escribir un nombre para continuar";
    },
    allowOutsideClick: false,
}).then( result => {
    user = result.value.toUpperCase();
})

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
    const log = document.getElementById("messagesLogs");
    let messages = "";

    data.forEach( message => {
        messages = messages + `<p> <b>${message.user}</b> dice: ${message.message} </p>`
    })
    log.innerHTML = messages;
})

//Mostrar Log de Mensajes
socket.on("messagesLogs", (messages) => {
    if (messages.length > 0) {
        document.querySelector('.container-messages').style.display = 'block';
    } 
    else {
        document.querySelector('.container-messages').style.display = 'none';
    }
});