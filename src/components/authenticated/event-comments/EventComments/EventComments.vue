<script setup>
import { computed, reactive, ref } from 'vue'
import { useEventCommentsStore } from '@/stores/useEventCommentsStore'

const comments = reactive([
  { id: 1, author: 'Test User', message: '¡This is an example comment' },
])
const newComment = ref({
  author: '',
  message: '',
})

const commentStore = useEventCommentsStore()


const bgColorComputed = computed(() => {
  return { backgroundColor: commentStore.config.backgroundColor }
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
    message: newComment.value.message,
  })

  // Reset form
  newComment.value.author = ''
  newComment.value.message = ''
}
</script>

<template>
  <section
    class="w-full h-screen flex flex-col p-6 overflow-hidden"
    :style="bgColorComputed"
  >
    <!-- Title -->
    <div class="comment-header text-center pb-4 flex-shrink-0">
      <h2 class="text-6xl font-gvibes font-bold text-gray-800">{{ commentStore.config.title }}</h2>
      <p class="text-lg text-gray-600 mt-2">
        {{ commentStore.config.subTitle }}
      </p>
    </div>

    <!-- Scrollable Content Section -->
    <div
      class="flex-grow overflow-y-auto flex flex-col gap-6"
    >
      <!-- Leave a Comment Form -->
      <form
        class="comment-form w-full max-w-2xl bg-white shadow p-6 rounded-lg flex flex-col gap-4 mx-auto"
        @submit.prevent="addComment"
      >
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
        <h3 class="text-4xl font-bold text-gray-800 mb-6">{{ commentStore.config.commentsTitle }}</h3>
        <div class="comments-list flex flex-col gap-4">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item p-4 border border-gray-200 bg-white shadow rounded-lg"
          >
            <p class="text-sm font-extralight">{{ comment.author }}</p>
            <p class="text-gray-600">{{ comment.message }}</p>
          </div>
        </div>
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
  transition: transform 0.2s, box-shadow 0.2s;
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
