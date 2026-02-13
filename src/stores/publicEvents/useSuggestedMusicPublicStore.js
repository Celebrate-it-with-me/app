import { defineStore } from 'pinia'
import SuggestedMusicPublicService from '@/services/PublicEvents/SuggestedMusicPublicService'
import { useSuggestedMusicStore } from '@/stores/useSuggestedMusicStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

export const useSuggestedMusicPublicStore = defineStore('suggestedMusicPublic', {
  state: () => ({
    availableVotes: 0,
    companionsCount: 0,
    totalVotes: 0,
    votesUsed: 0,
    userVotes: {} // { songId: 'up' | 'down' | null }
  }),
  actions: {
    async getAvailableVotes(eventId, accessCode) {
      if (!accessCode) return

      try {
        const response = await SuggestedMusicPublicService.getAvailableVotes(eventId, accessCode)
        const { data, status } = response

        if (status === 200) {
          this.availableVotes = data.data?.availableVotes || 0
          this.companionsCount = data.data?.companionsCount || 0
          this.totalVotes = data.data?.totalVotes || 0
          this.votesUsed = data.data?.votesUsed || 0
        }
      } catch (e) {
        console.log('Oops something went wrong!', e)
      }
    },

    async getUserVote(eventId, songId, accessCode) {
      if (!accessCode) return

      try {
        const response = await SuggestedMusicPublicService.getUserVote(eventId, songId, accessCode)
        if (response.status === 200) {
          this.userVotes[songId] = response.data.data?.voteType || null
        }
      } catch (e) {
        console.log('Error fetching user vote', e)
      }
    },

    async makeVote({ eventId, accessCode, songId, direction }) {
      if (!accessCode) return

      const notificationStore = useNotificationStore()
      const previousVote = this.userVotes[songId] || null

      // Check if user has available votes for a new vote
      if (!previousVote && this.availableVotes <= 0) {
        notificationStore.addNotification({
          type: 'warning',
          message: 'No tienes votos disponibles'
        })
        return
      }

      try {
        const response = await SuggestedMusicPublicService.vote(
          eventId,
          songId,
          accessCode,
          direction
        )

        if (response.status === 200) {
          const { action, vote, votesRemaining } = response.data.data
          const newVoteType = vote?.voteType || null

          this.availableVotes = votesRemaining
          this.userVotes[songId] = newVoteType

          // Update aggregated counts in songsStore
          const songsStore = useSuggestedMusicStore()
          const song = songsStore.selectedSongs.find(s => s.id === songId)

          if (song) {
            if (!song.votes) {
              song.votes = { up: 0, down: 0, score: 0 }
            }

            // action: 'created'|'updated'|'removed'
            if (action === 'created') {
              if (newVoteType === 'up') song.votes.up++
              if (newVoteType === 'down') song.votes.down++
              notificationStore.addNotification({
                message: '¡Voto registrado con éxito!'
              })
            } else if (action === 'removed') {
              if (previousVote === 'up') song.votes.up--
              if (previousVote === 'down') song.votes.down--
              notificationStore.addNotification({
                message: 'Voto eliminado'
              })
            } else if (action === 'updated') {
              if (previousVote === 'up') song.votes.up--
              if (previousVote === 'down') song.votes.down--

              if (newVoteType === 'up') song.votes.up++
              if (newVoteType === 'down') song.votes.down++
              notificationStore.addNotification({
                message: 'Voto actualizado'
              })
            }

            // Update score
            song.votes.score = (song.votes.up || 0) - (song.votes.down || 0)
          }
        }
      } catch (e) {
        console.log('Error making vote', e)
        notificationStore.addNotification({
          type: 'error',
          message: 'Error al procesar el voto'
        })
      }
    }
  },
  getters: {
    hasAvailableVotes() {
      return this.availableVotes > 0
    }
  }
})
