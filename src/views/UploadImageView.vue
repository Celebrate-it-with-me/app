<script setup>
import {FwbButton, FwbFileInput} from "flowbite-vue";
import {ref, watch} from "vue";
import {CWM_API} from "@/services/axios";
import {useRoute} from "vue-router";
import {useNotification} from "@kyvg/vue3-notification";

const selectedImages = ref([]);
const imageSource = ref([]);
const invalidFiles = ref([]);
const route = useRoute();
const uploading = ref(false);
const { notify } = useNotification();

const name = ref(route.params.name);

watch(selectedImages, (newValue) => {
  previewImages(newValue)
})

const previewImages = (newValue) => {
  if (newValue && newValue.length) {
    if (newValue.length > 5) {
      newValue.length = 5;
      showNotification(
          "You can select up to 5 images at a time. Additional images have been removed.",
          'Notice',
          'warning'
      );
    }

    for(let i = 0; i < newValue.length; i++) {
      let file = newValue[i];
      let fileName = file.name;
      if (!file.type.match('image.*')) {
        invalidFiles.value.push(fileName);
        selectedImages.value.splice(i, 1);
        continue;
      }
      let reader = new FileReader();

      reader.onload = (e) => {
        imageSource.value.push({
          src: e.target.result,
          name: fileName
        });
      }
      reader.readAsDataURL(file);
    }
  } else {
    imageSource.value = [];
    invalidFiles.value = [];
  }
}

const showNotification = (message, title, type) => {
  notify({
    title: title,
    text: message,
    type: type
  })
}

const deleteImage = (index) => {
  imageSource.value.splice(index, 1);
  selectedImages.value.splice(index, 1);
}

const uploadImages = async () => {
  if (selectedImages.value.length > 5) {
    showNotification(
        "You can upload up to 5 images at a time.",
        'Error',
        'error'
    );
    return;
  }

  let formData = new FormData();

  selectedImages.value.forEach((image, index) => {
    formData.append(
      'images[]',
      selectedImages.value[index],
      image.name
    );
  });

  try {
    uploading.value = true;
    let response = await CWM_API.post(`gallery/upload-images/${name.value}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
    );

    selectedImages.value = [];
    imageSource.value = [];
    invalidFiles.value = [];

    showNotification(
        "All images have been uploaded successfully!",
      'Success',
      'success'
    );

    console.log('Image upload successfully', response.data);
  } catch (error) {
    console.error('Upload error: ', error);
  } finally {
    uploading.value = false;
  }

}
</script>

<template>
  <main class="images-main">
    <div class="upload-container">
      <div class="upload">
        <label for="" class="upload-label">
          Upload up to 5 Images at a time.
        </label>
        <fwb-file-input
            v-model="selectedImages"
            size="sm"
            browse-label="testing label"
            placeholder="test"
            class="dark"
            multiple
        />

        <div
          v-if="imageSource.length"
          class="show-thumbnails"
        >
          <div
            class="thumbnail"
            v-for="(image, index) in imageSource"
            :key="index"
          >
            <div class="image-container">
              <img :src="image.src" alt="Image preview...">
            </div>
            <p>{{ image.name }}</p>
            <p @click="deleteImage(index)">X</p>
          </div>
        </div>
        <div
          v-if="invalidFiles.length"
        >
          <h3 class="error-message">There is some invalid files</h3>
          <small>
            Notice: The invalid files will not be uploaded!
          </small>
        </div>

        <fwb-button
          size="sm"
          gradient="red-yellow"
          v-if="selectedImages.length"
          :loading="uploading"
          @click="uploadImages()"
        >
          Upload Images
        </fwb-button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.upload-label {
  color: white;
}

.images-main {
  background: url("../../public/images/bg1.jpg") no-repeat -250px center;
  background-size: cover;
}

.error-message {
  color: rgba(187, 13, 0, 0.82);
}

.image-container {
  width: 25%;
  height: auto;
}

.show-thumbnails {
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 10px;
  width: 100%;
  border: solid 1px #a9b2c9;
  border-radius: 4px;
}

.thumbnail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  margin-bottom: 5px;
  border-radius: 2px;
  border: solid 1px #a9b2c9;
  padding: 8px;
}

.upload-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload {
  width: 65%;
}
</style>
