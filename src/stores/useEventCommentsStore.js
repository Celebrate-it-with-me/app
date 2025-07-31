import { defineStore } from 'pinia'
import EventCommentsService from '../services/EventCommentsService'
import { useUserStore } from '@/stores/useUserStore'

export const useEventCommentsStore = defineStore('eventCommentsStore', {
  state: () => ({
    eventComments: [],
    currentComment: {
      id: null,
      comment: null,
      author: null
    },
    pageSelected: 1,
    perPage: 10,
    searchValue: '',
    totalPages: 1,
    mode: 'create'
  }),
  actions: {
    async addComment({ eventId, userId, origin }) {
      return EventCommentsService.addComment({ eventId, userId, origin, ...this.currentComment })
    },

    async loadComments() {
      const userStore = useUserStore()

      return EventCommentsService.loadComments({
        eventId: userStore.activeEvent
      })
    },

    async loadNewComments() {
      const userStore = useUserStore()

      const response = await EventCommentsService.loadNewComments({
        eventId: userStore.activeEvent,
        currentPage: this.pageSelected,
        perPage: this.perPage,
        search: this.searchValue
      })

      if (response.status === 200) {
        this.eventComments = response.data?.data || []
        this.pageSelected = response.data.meta?.current_page || 1
        this.totalPages = response.data.meta?.last_page || 1

        return true
      } else {
        console.error('Error loading new comments:', response.status, response.statusText)
      }
      return false
    },

    async addNewComment(comment) {
      const userStore = useUserStore()

      return EventCommentsService.addNewComment({
        eventId: userStore.activeEvent,
        comment
      })
    },

    async loadMoreComments(eventId, page) {
      return EventCommentsService.loadMoreComments(eventId, page)
    },

    async toggleCommentVisibility(commentId) {
      const userStore = useUserStore()

      return EventCommentsService.toggleCommentVisibility({
        eventId: userStore.activeEvent,
        commentId
      })
    },

    async deleteComment(commentId) {
      const userStore = useUserStore()

      return EventCommentsService.deleteComment({
        eventId: userStore.activeEvent,
        commentId
      })
    }
  },
  getters: {
    hasComments() {
      return this.eventComments.length > 0
    }
  }
})
