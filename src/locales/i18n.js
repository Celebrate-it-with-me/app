import { createI18n } from 'vue-i18n'

const messages = {
    en: {
        confirmationMessage: `The confirmation page will be available in two weeks and The deadline to confirm is July 2,24. Thank you`,
        accessCodePlaceholder: 'Enter your access code',
        accessCodeSendButton: 'Submit',
        celebration: 'Quinces\' Celebration',
        celebrationDate: 'Friday, August 2, 2024',
        celebrationHours: '6:30 pm',
        ceremonyPlace: 'Royal Palace Ballrooms',
        ceremonyAddress1: '1550 W 84 st, Suite 73',
        ceremonyAddress2: 'Hialeah FL, 33014',
        guestTable: {
            name: 'Name',
            confirm: 'Confirm',
            confirmOptionYes: 'yes',
            confirmOptionNo: 'No',
            button: 'Next',
        },
        rsvpModal: {
            text: `If you are sure of your selection please confirm,
                   if not please close this dialog and
                   fix your selection and then click in confirm.`,
            nextButton: 'Next',
            acceptButton: 'Confirm',
            cancelButton: 'Cancel',
            backButton: 'Back'
        },
        invalidAccessCode: 'Invalid Access Code',
        serverErrorAccessCode: 'Access code already used, please contact us if you need to change your selection',
        thanksMessage: 'Thanks for your confirmation!',
        reservedMessage1: 'We have reserved',
        reservedMessage2: 'seats in your honor',
        colorReservation: 'Colors Gold and Champagne are reserved for our Quinceañera.'
    },

    es: {
        confirmationMessage: `La pagina de confirmación estará disponible en dos semanas y la fecha limite para confirmar es Julio2,24. Gracias`,
        accessCodePlaceholder: 'Codigo de acceso',
        accessCodeSendButton: 'Enviar',
        celebration: 'Quinces\' Celebration',
        celebrationDate: 'Viernes, Agosto 2, 2024',
        celebrationHours: '6:30 pm',
        ceremonyPlace: 'Royal Palace Ballrooms',
        ceremonyAddress1: '1550 W 84 st, Suite 73',
        ceremonyAddress2: 'Hialeah FL, 33014',
        guestTable: {
            name: 'Nombre',
            confirm: 'Confirmar',
            confirmOptionYes: 'si',
            confirmOptionNo: 'No',
            button: 'Siguiente'
        },
        rsvpModal: {
            text: `Si esta seguro de su seleccion, presione
                   confirmar, sino cierre esta ventana, y 
                   arregle su seleccion`,
            nextButton: 'Siguiente',
            acceptButton: 'Enviar',
            cancelButton: 'Cancelar',
            backButton: 'Previo'
        },
        invalidAccessCode: 'Codigo de Acceso invalido',
        serverErrorAccessCode: 'Ya este codigo se uso, por favor contactenos si necesita cambiar su seleccion',
        thanksMessage: 'Gracias por su confirmacion!',
        reservedMessage1: 'Hemos reservado',
        reservedMessage2: 'sillas en tu honor',
        colorReservation: 'El color dorado y champagne esta reservado para la quiceañera.'
    }
}

const defaultLocale = localStorage.getItem('selectedLocale');

const i18n = createI18n({
    legacy: false,
    locale: defaultLocale ?? 'en',
    fallbackLocale: 'en',
    messages
})

export default i18n
