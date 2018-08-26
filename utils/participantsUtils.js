module.exports = {
  getRemainingPriceFromParticipation: (max, participants) => {
      const participationSum = participants.map(participant => participant.participant_price).reduce((a, b) => a + b, 0)
      return max - participationSum  
  }
}