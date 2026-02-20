import { defineStore } from 'pinia'
import EventCommentsService from '@/modules/comments/services/EventCommentsService'
import { useUserStore } from '@/stores/useUserStore'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

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
    setEventComments(eventComments) {
      console.log('Checking comments object', eventComments)
      this.eventComments = eventComments.data || []

      this.pageSelected = eventComments?.meta?.current_page ?? 1
      this.perPage = eventComments?.meta?.per_page ?? 10
      this.totalPages = eventComments?.meta?.last_page ?? 1
    },

    async updateStatus({ commentId, status }) {
      const user = useUserStore()
      const response = await EventCommentsService.updateStatus({
        eventId: user.activeEvent,
        commentId,
        status
      })
      if (response.status === 200) {
        const c = this.eventComments.find(x => x.id === commentId)
        if (c) c.status = status
      }
    },

    async addComment({ eventId, userId, origin }) {
      return EventCommentsService.addComment({ eventId, userId, origin, ...this.currentComment })
    },

    async loadComments() {
      const userStore = useUserStore()

      return EventCommentsService.loadComments({
        eventId: userStore.activeEvent
      })
    },

    async loadPublicComments(eventId) {
      return EventCommentsService.loadPublicComments({
        eventId
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

    async toggleCommentPin(commentId) {
      const eventStore = useEventsStore()
      const response = await EventCommentsService.toggleCommentPin({
        eventId: eventStore.activeEvent.id,
        commentId: commentId
      })

      console.log(response)
    },

    async toggleCommentFavorite(commentId) {
      const eventStore = useEventsStore()
      const response = await EventCommentsService.toggleCommentFavorite({
        eventId: eventStore.activeEvent.id,
        commentId: commentId
      })

      console.log(response)
    },

    async loadCommentsPaginated() {
      const userStore = useUserStore()

      const response = await EventCommentsService.loadCommentsPaginated({
        eventId: userStore.activeEvent,
        currentPage: this.pageSelected,
        perPage: this.perPage,
        search: this.searchValue
      })

      if (response.status === 200) {
        if (this.pageSelected === 1) {
          this.eventComments = response.data?.data || []
        } else {
          this.eventComments = [...this.eventComments, ...(response.data?.data || [])]
        }
        this.pageSelected = response.data.meta?.current_page || 1
        this.totalPages = response.data.meta?.last_page || 1

        return true
      } else {
        console.error('Error loading new comments:', response.status, response.statusText)
      }
      return false
    },

    async loadNextPage() {
      if (this.pageSelected < this.totalPages) {
        this.pageSelected++
        return await this.loadCommentsPaginated()
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

    async addNewCommentPublic(eventId, accessCode, comment) {
      return EventCommentsService.addNewCommentPublic({
        eventId,
        accessCode,
        comment
      })
    },

    async loadMoreComments(eventId, page) {
      return EventCommentsService.loadMoreComments(eventId, page)
    },

    async loadMoreCommentsPublic(eventId, page) {
      return EventCommentsService.loadMoreCommentsPublic(eventId, page)
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
