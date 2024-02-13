import { createI18n } from 'vue-i18n'

const messages = {
    en: {
        accessCodePlaceholder: 'Enter your access code',
        accessCodeSendButton: 'Submit',
        celebration: 'Quinces\' Celebration',
        celebrationDate: 'Friday, August 2, 2024',
        celebrationHours: '6:20 pm',
        ceremony: 'Ceremony and Reception',
        ceremonyPlace: 'Royal Palace Ballrooms',
        guestTable: {
            name: 'Name',
            confirm: 'Confirm',
            confirmOptionYes: 'yes',
            confirmOptionNo: 'No',
            button: 'Submit',
        },
        rsvpModal: {
            text: `If you are sure of your selection please confirm,
                   if not please close this dialog and
                   fix your selection and then click in confirm.`,
            acceptButton: 'Submit',
            cancelButton: 'Cancel'
        },
        invalidAccessCode: 'Invalid Access Code',
        serverErrorAccessCode: 'Access code already used, please contact us if you need to change your selection'
    },

    es: {
        accessCodePlaceholder: 'Entre su codigo de acceso',
        accessCodeSendButton: 'Enviar',
        celebration: 'Quinces\' Celebration',
        celebrationDate: 'Viernes, 2 de agosto de 2024',
        celebrationHours: '6:20 pm',
        ceremony: 'Ceremonia y Recepcion',
        ceremonyPlace: 'Royal Palace Ballrooms',
        guestTable: {
            name: 'Nombre',
            confirm: 'Confirmar',
            confirmOptionYes: 'si',
            confirmOptionNo: 'No',
            button: 'Enviar'
        },
        rsvpModal: {
            text: `Si esta seguro de su seleccion, presione
                   confirmar, sino cierre esta ventana, y 
                   arregle su seleccion`,
            acceptButton: 'Enviar',
            cancelButton: 'Cancelar'
        },
        invalidAccessCode: 'Codigo de Acceso invalido',
        serverErrorAccessCode: 'Ya este codigo se uso, por favor contactenos si necesita cambiar su seleccion'
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
