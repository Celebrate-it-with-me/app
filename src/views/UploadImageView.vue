<script setup>
import {FwbButton, FwbFileInput} from "flowbite-vue";
import {ref, watch} from "vue";
import {CWM_API} from "@/services/axios";
import {useRoute, useRouter} from "vue-router";
import {useNotification} from "@kyvg/vue3-notification";

const selectedImages = ref([]);
const imageSource = ref([]);
const invalidFiles = ref([]);
const route = useRoute();
const router = useRouter();
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

const goBack = () => {
  router.push(`/images/${name.value}`);
}

const viewGallery = () => {
  router.push(`/view-gallery/${name.value}`);
}
</script>

<template>
  <main class="images-main">
    <div class="upload-container">
      <div class="centering-wrapper">
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
          class="image-button"
          v-if="selectedImages.length"
          :loading="uploading"
          @click="uploadImages()"
        >
          Upload Images
        </fwb-button>
      </div>
      </div>
      <div class="go-back">
        <fwb-button
          size="sm"
          class="image-button"
          @click="goBack()"
        >
          Go Back
        </fwb-button>
        <fwb-button
          class="image-button ml-2"
          size="sm"
          @click="viewGallery()"
        >
          View Gallery
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
  background: url("../../public/images/bg4.webp") no-repeat center;
  background-size: cover;

  @media(max-width: 600px) {
    background: url("../../public/images/bg4.webp") no-repeat -360px center;
    background-size: cover;
  }
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
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  flex-wrap: wrap;
}

.centering-wrapper {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.upload {
  width: 75%;
  max-height: calc(100vh - 70px);
  overflow: auto;
}

.go-back {
  align-self: center;
  margin-top: auto;
  margin-bottom: 10px;
  height: 60px;
}

.image-button{
  background: url("../../public/images/img.png");
  width: 125px;
  height: 50px;
  border: none;
}
</style>
