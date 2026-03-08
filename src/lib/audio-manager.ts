'use client'

class AudioManager {
  private ctx: AudioContext | null = null
  private heartbeatOsc: OscillatorNode | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  playTick() {
    this.initCtx()
    if (!this.ctx) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(440, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05)

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start()
    osc.stop(this.ctx.currentTime + 0.1)
  }

  playElimination() {
    this.initCtx()
    if (!this.ctx) return

    const noise = this.ctx.createBufferSource()
    const bufferSize = this.ctx.sampleRate * 0.1
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    noise.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(
      10,
      this.ctx.currentTime + 0.1,
    )

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(1.2, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)

    noise.start()
  }

  playVictory() {
    this.initCtx()
    if (!this.ctx) return

    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = this.ctx!.createOscillator()
      const gain = this.ctx!.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(2.5, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
      osc.connect(gain)
      gain.connect(this.ctx!.destination)
      osc.start(startTime)
      osc.stop(startTime + duration)
    }

    const start = this.ctx.currentTime
    // C Major Arpeggio
    playNote(261.63, start, 0.2) // C4
    playNote(329.63, start + 0.2, 0.2) // E4
    playNote(392.0, start + 0.4, 0.2) // G4
    playNote(523.25, start + 0.6, 1.0) // C5
  }

  startHeartbeat(bpm: number) {
    this.initCtx()
    if (!this.ctx) return
    this.stopHeartbeat()

    const interval = 60000 / bpm
    this.heartbeatInterval = setInterval(() => {
      this.playHeartbeatSound()
      setTimeout(() => this.playHeartbeatSound(0.8), 200)
    }, interval)
  }

  private playHeartbeatSound(volFactor = 1) {
    if (!this.ctx) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(60, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.2)
    gain.gain.setValueAtTime(1.5 * volFactor, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.2)
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }
}

export const audioManager = new AudioManager()
