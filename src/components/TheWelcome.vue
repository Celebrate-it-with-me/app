<script setup>
import 'add-to-calendar-button';
import {ref} from "vue";

const selectedLanguage = ref('ES')
const title = ref('Save the Date')
const subTitle = ref('Vanessa\'s')
const celebration = ref('Quince Celebration')
const date = ref('August 2, 2024')
const formalInvitation = ref('Formal Invitation to Follow')

const changeLanguage = () => {
  if (selectedLanguage.value === 'EN' ) {
    selectedLanguage.value = 'ES'
  } else {
    selectedLanguage.value = 'EN'
  }

  changeLang()
}

const changeLang = () => {
  switch (selectedLanguage.value) {
    case('EN'):
      changeToEs()
      break
    default:
      changeToEn()
      break
  }
}

const changeToEs = () => {
  title.value = 'Reserva la fecha'
  subTitle.value = 'Vanessa'
  celebration.value = 'Celebracion de Quince'
  date.value = '2 de agosto de 2024'
  formalInvitation.value = 'Proximamente recibira la invitacion formal'
}

const changeToEn = () => {
  title.value = 'Save the Date'
  subTitle.value = 'Vanessa\'s'
  celebration.value = 'Quince Celebration'
  date.value = 'August 2, 2024'
  formalInvitation.value = 'Formal Invitation to Follow'
}

</script>

<template>
  <div class="home-container">
    <div class="translate-page">
      <p @click="changeLanguage()">{{ selectedLanguage }}</p>
    </div>
    <div class="welcome-container">
      <div class="save-texts">
        <h1 class="save-title glow">{{ title }}</h1>

        <h1 class="save-sub glow">{{ subTitle }}</h1>

        <h1 class="save-name glow">{{ celebration }}</h1>
      </div>


      <div class="save-calendar">
        <p class="save-date">{{ date }}</p>

        <p class="save-date">{{ formalInvitation }}</p>
        <add-to-calendar-button
            name="Vanessa's Quince Celebration"
            options="'Apple','Google', 'iCal', 'Microsoft365', 'MicrosoftTeams', 'Outlook.com', 'Yahoo'"
            location="Miami, FL"
            startDate="2024-08-02"
            endDate="2024-08-02"
            startTime="18:00"
            endTime="23:59"
            timeZone="America/New_York"
            listStyle="dropup-static"
            :label="(selectedLanguage === 'ES') ? 'Add to calendar' : 'Adicionar al calendario'"
        >
        </add-to-calendar-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  background-image: url("../assets/images/background.jpg");
  background-position: center;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  transition:
      color 0.5s,
      background-color 0.5s;
}

.translate-page {
  display: flex;
  justify-content: end;
  cursor: pointer;
}

.save-title {
  font-family: "Beauty sans",sans-serif;
  font-size: 3em;
}

.save-sub {
  font-family: "Beauty sans",sans-serif;
  font-size: 2em;
}

.welcome-container {
  height: 97vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.save-date {
  font-family: "Lora sans",sans-serif;
  font-size: 1.3em;
  font-weight: lighter;
  text-align: center;
}

.save-name {
  font-family: "Beauty sans", sans-serif;
  font-size: 2em;
}


.save-texts {
  text-align: center;
}

.save-local p {
  text-align: center;
}

.save-calendar {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
