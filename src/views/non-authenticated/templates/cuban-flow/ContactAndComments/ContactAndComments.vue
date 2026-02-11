<script setup>
import { reactive, ref } from 'vue'

const comments = reactive([
  { id: 1, author: 'Maria Gonzalez', message: '¡Felicidades! Estoy emocionada por la fiesta.' },
  {
    id: 2,
    author: 'Juan Ramirez',
    message:
      'Será un día muy especial. ¡Nos vemos pronto! lorem, Será un día muy especial. ¡Nos vemos pronto! lorem, Será un día muy especial. ¡Nos vemos pronto! lorem'
  },
  { id: 3, author: 'Peter Ramirez', message: 'Será un día muy especial. ¡Nos vemos pronto!' },
  { id: 4, author: 'Peter Ramirez', message: 'Será un día muy especial. ¡Nos vemos pronto!' },
  { id: 5, author: 'Peter Ramirez', message: 'Será un día muy especial. ¡Nos vemos pronto!' },
  { id: 6, author: 'Peter Ramirez', message: 'Será un día muy especial. ¡Nos vemos pronto!' }
])
const newComment = ref({
  author: '',
  message: ''
})

// Function to add a new comment
const addComment = () => {
  if (!newComment.value.author || !newComment.value.message) {
    alert('Por favor, completa ambos campos antes de enviar.')
    return
  }

  comments.push({
    id: comments.length + 1,
    author: newComment.value.author,
    message: newComment.value.message
  })

  // Reset form
  newComment.value.author = ''
  newComment.value.message = ''
}
</script>

<template>
  <section class="guest-comments w-full h-screen flex flex-col bg-gray-100 p-6 overflow-hidden">
    <!-- Title -->
    <div class="comment-header text-center pb-4 flex-shrink-0">
      <h2 class="text-6xl font-gvibes font-bold text-gray-800">Deja tu Comentario</h2>
      <p class="text-lg text-gray-600 mt-2">Comparte tus emociones y deseos aquí 🎉</p>
    </div>

    <!-- Scrollable Content Section -->
    <div class="flex-grow overflow-y-auto flex flex-col gap-6">
      <!-- Leave a Comment Form -->
      <form
        class="comment-form w-full max-w-2xl bg-white shadow p-6 rounded-lg flex flex-col gap-4 mx-auto"
        @submit.prevent="addComment"
      >
        <!-- Author Input -->
        <input
          v-model="newComment.author"
          type="text"
          placeholder="Tu nombre"
          class="p-3 border border-gray-300 rounded-lg focus:ring focus:ring-pink-300"
        />
        <!-- Comment Input -->
        <textarea
          v-model="newComment.message"
          rows="2"
          placeholder="Escribe tu comentario aquí..."
          class="p-3 border border-gray-300 rounded-lg focus:ring focus:ring-pink-300 resize-none"
        ></textarea>
        <!-- Submit Button -->
        <button
          type="submit"
          class="bg-pink-500 text-white p-3 rounded-lg font-bold hover:bg-pink-600 transition"
        >
          Enviar Comentario
        </button>
      </form>

      <!-- Display Comments -->
      <div class="previous-comments w-full max-w-3xl mx-auto">
        <h3 class="text-4xl font-bold text-gray-800 mb-6">Comentarios Anteriores</h3>
        <div class="comments-list flex flex-col gap-4">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item p-4 border border-gray-200 bg-white shadow rounded-lg"
          >
            <p class="text-lg font-bold">{{ comment.author }}</p>
            <p class="text-gray-600">{{ comment.message }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- WhatsApp Links -->
    <div class="whatsapp-links mt-6 flex-shrink-0">
      <p class="text-lg font-medium text-gray-800 mb-4 text-center">
        También puedes dejar un mensaje en WhatsApp:
      </p>
      <div class="flex justify-center gap-4">
        <!-- Quinceañera WhatsApp -->
        <a
          href="https://wa.me/5211234567890"
          target="_blank"
          class="bg-green-500 text-white px-6 py-3 rounded-lg flex gap-2 items-center hover:bg-green-600 transition"
        >
          🌸 Quinceañera
        </a>
        <!-- Organizer WhatsApp -->
        <a
          href="https://wa.me/5210987654321"
          target="_blank"
          class="bg-blue-500 text-white px-6 py-3 rounded-lg flex gap-2 items-center hover:bg-blue-600 transition"
        >
          📋 Organizador
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.guest-comments {
  background-color: #fffbe7;
}

.comment-form {
  margin-bottom: 2rem;
}

.comment-item {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.comment-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.whatsapp-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

/* Custom Scrollbar Styles */
.flex-grow {
  /* Apply smooth scrolling for a better experience */
  scroll-behavior: smooth;
}

/* Scrollbar Styling */
.flex-grow::-webkit-scrollbar {
  width: 8px; /* Set scrollbar width */
}

.flex-grow::-webkit-scrollbar-track {
  background: #e5e5e5; /* Light gray background for the track */
  border-radius: 8px; /* Rounded corners for the track */
}

.flex-grow::-webkit-scrollbar-thumb {
  background: #f1b1d1; /* Pink color for the scrollbar thumb */
  border-radius: 8px; /* Round the scrollbar's thumb */
}

.flex-grow::-webkit-scrollbar-thumb:hover {
  background: #db2777; /* Slightly darker pink on hover */
}

.flex-grow::-webkit-scrollbar-thumb:active {
  background: #be185d; /* Even darker pink when active (dragging) */
}
</style>
