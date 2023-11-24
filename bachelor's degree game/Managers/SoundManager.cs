using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;
using UnityEngine.UI;

public static class SoundManager
{
    public enum Sound {
        Cheese,
        Teleport,
        Slow,
        Speed,
        Ambient
    }

    private static Dictionary<Sound, float> soundTimerDictionary;
    private static GameObject oneShotGameObject;
    private static AudioSource oneShotAudioSource;
    private static GameObject ambientSoundGameObject;
    private static AudioSource ambientSoundAudioSource;
    private static bool debugLog = true;


    public static void Initialize()
    {
        soundTimerDictionary = new Dictionary<Sound, float>();
        // soundTimerDictionary[Sound.Cheese] = 0f; //this is to set a sound last time it was played
    }

    public static void StopOneShotSound()
    {
        if (oneShotGameObject) oneShotAudioSource.Stop();
    }

    public static void PlayAmbientSound()
    {
        if (ambientSoundGameObject == null)
        {
            ambientSoundGameObject = new GameObject("Ambient Sound");
            ambientSoundAudioSource = ambientSoundGameObject.AddComponent<AudioSource>();
            ambientSoundAudioSource.clip = GetAudioClip(Sound.Ambient);
            ambientSoundAudioSource.maxDistance = 100f;
            ambientSoundAudioSource.loop = true;
            ambientSoundAudioSource.volume = 0.3f;
            ambientSoundAudioSource.Play();
        } else {
            if (!ambientSoundAudioSource.isPlaying) 
            {
                ambientSoundAudioSource.PlayOneShot(GetAudioClip(Sound.Ambient));
                if (debugLog) Debug.Log("[SoundManager]: Started playing Ambient Sound!");
            }
        }
    }

    public static void PlaySound(Sound sound, Vector3 position, float volume)
    {
        if (CanPlaySound(sound)) {
            GameObject soundGameObject = new GameObject("Sound");
            soundGameObject.transform.position = position;
            AudioSource audioSource = soundGameObject.AddComponent<AudioSource>();
            audioSource.clip = GetAudioClip(sound);
            audioSource.minDistance = 0f;
            audioSource.maxDistance = 100f;
            audioSource.spatialBlend = 1f;
            audioSource.rolloffMode = AudioRolloffMode.Linear; 
            audioSource.dopplerLevel = 0f;
            audioSource.volume = volume;
            audioSource.outputAudioMixerGroup = GameAssets.i.mainMixer.FindMatchingGroups("sfx")[0];
            audioSource.Play();
            if (debugLog) Debug.Log($"[SoundManager]: Started playing \"{sound}\" Sound (SPV)!");

            Object.Destroy(soundGameObject, audioSource.clip.length);
        }
    }

    public static void PlaySound(Sound sound, float volume)
    {
        if (CanPlaySound(sound)) {
            if (oneShotGameObject == null) {
                oneShotGameObject = new GameObject("One Shot Sound");
                oneShotAudioSource = oneShotGameObject.AddComponent<AudioSource>();
            }
            if (debugLog) Debug.Log($"[SoundManager]: Started playing \"{sound}\" Sound (SV)!");
            oneShotAudioSource.volume = volume;
            oneShotAudioSource.outputAudioMixerGroup = GameAssets.i.mainMixer.FindMatchingGroups("sfx")[0];
            oneShotAudioSource.PlayOneShot(GetAudioClip(sound));
        }
    }

    public static void PlaySound(Sound sound)
    {
        if (CanPlaySound(sound)) {
            if (oneShotGameObject == null) {
                oneShotGameObject = new GameObject("One Shot Sound");
                oneShotAudioSource = oneShotGameObject.AddComponent<AudioSource>();
            }
            if (debugLog) Debug.Log($"[SoundManager]: Started playing \"{sound}\" Sound!");
            oneShotAudioSource.outputAudioMixerGroup = GameAssets.i.mainMixer.FindMatchingGroups("sfx")[0];
            oneShotAudioSource.PlayOneShot(GetAudioClip(sound));
        }
    }

    private static bool CanPlaySound(Sound sound)
    {
        switch (sound) {
            default:
                return true;
            case Sound.Teleport: // this is to make a sound not play 1000 times per second (every frame)
                if (soundTimerDictionary.ContainsKey(sound)) {
                    float lastTimePlayed = soundTimerDictionary[sound];
                    float playerSoundTimerMax = .05f;
                    if (lastTimePlayed + playerSoundTimerMax < Time.time) {
                        soundTimerDictionary[sound] = Time.time;
                        return true;
                    } else return false;
                } else return true;
                // break;
        }
    }

    private static AudioClip GetAudioClip(Sound sound)
    {
        foreach (GameAssets.SoundAudioClip soundAudioClip in GameAssets.i.soundAudioClipArray)
        {
            if (soundAudioClip.sound == sound)
                return soundAudioClip.audioClip;
        }
        Debug.Log($"[Sound Manager]: Error!!! Sound {sound} was not found!");
        return null;
    }

    public static void AddButtonSounds(this Button buttinUI)// keyword "this" allows us to "extend" this method
    //to the Button class from unity without touching it
    {
        // buttinUI.onClick = SoundManager.PlaySound(Sound.Cheese);
        // to do later this
    }

}