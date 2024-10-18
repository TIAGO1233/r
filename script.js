// Importar funciones necesarias de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD_6Oz9XGJwWrgZNz9DAxKER6dfusJ9pFg",
    authDomain: "proyectoreunio.firebaseapp.com",
    projectId: "proyectoreunio",
    storageBucket: "proyectoreunio.appspot.com",
    messagingSenderId: "211200487490",
    appId: "1:211200487490:web:fcec5b1f8cbf305225fddb",
    measurementId: "G-VTGYBLGK2P"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const meetingForm = document.getElementById('meetingForm');
const meetingList = document.getElementById('meetingList').querySelector('tbody');

// Manejar el envío del formulario
meetingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const location = document.getElementById('location').value;
    const description = document.getElementById('description').value;

    if (!date || !time || !location || !description) {
        alert('Por favor, completa todos los campos requeridos.');
        return;
    }

    const meeting = {
        date,
        time,
        location,
        description,
        fileName: document.getElementById('fileUpload').files[0] ? document.getElementById('fileUpload').files[0].name : 'No se subió archivo'
    };

    // Agregar reunión a Firestore
    try {
        await addDoc(collection(db, 'meetings'), meeting);
        renderMeetings();
    } catch (error) {
        console.error("Error agregando documento: ", error);
    }

    meetingForm.reset();
});

// Renderizar las reuniones
async function renderMeetings() {
    meetingList.innerHTML = '';
    try {
        const querySnapshot = await getDocs(collection(db, 'meetings'));
        const meetings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        meetings.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

        meetings.forEach(meeting => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${meeting.date}</td>
                <td>${meeting.time}</td>
                <td>${meeting.location}</td>
                <td>${meeting.description}</td>
                <td>${meeting.fileName}</td>
                <td>
                    <button onclick="editMeeting('${meeting.id}')">Editar</button>
                    <button onclick="deleteMeeting('${meeting.id}')">Eliminar</button>
                </td>
            `;
            meetingList.appendChild(row);
        });
    } catch (error) {
        console.error("Error al obtener documentos: ", error);
    }
}

// Función para eliminar una reunión
async function deleteMeeting(id) {
    await deleteDoc(doc(db, 'meetings', id));
    renderMeetings();
}

// Cargar reuniones al inicio
renderMeetings();
