class AudioManager
{
    constructor(audioSrc)
    {
        this.audioElement=new Audio(audioSrc);
    }
     playSound()
    {
         this.audioElement.play();
    }
    setVolume(volume)
    {
        this.audioElement.volume=volume;
    }
}
export default AudioManager;