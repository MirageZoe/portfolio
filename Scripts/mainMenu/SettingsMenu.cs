using System.Linq;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class SettingsMenu : MonoBehaviour
{
    #region Settings
    public TMP_Dropdown resolutionDropdown;
    Resolution[] resolutions;
    Resolution[] rawResolutions;
    public int highestRefreshRate = 60;

    private void Start() {
        // rawResolutions = Screen.resolutions;
        // foreach (var res in rawResolutions)
        //     if (res.refreshRate > highestRefreshRate)
        //     {
        //         Debug.Log($"Found highest refresh of this monitor: ");
        //         highestRefreshRate = res.refreshRate;
        //     }
        // resolutions = Screen.resolutions.Where(resolution => resolution.refreshRate == highestRefreshRate).ToArray();
        resolutions = Screen.resolutions;
        resolutionDropdown.ClearOptions();

        List<string> options = new List<string>();

        int currentResolutionIndex = 0;

        for (int i = 0; i < resolutions.Length; i++)
        {
            string option = resolutions[i].width + " x " + resolutions[i].height +"@"+resolutions[i].refreshRate;
            options.Add(option);

            if (resolutions[i].width == Screen.currentResolution.width &&
                resolutions[i].height == Screen.currentResolution.height)
                currentResolutionIndex = i;
        }

        resolutionDropdown.AddOptions(options);
        resolutionDropdown.value = currentResolutionIndex;
        resolutionDropdown.RefreshShownValue();
    }

    #endregion

        public void SetFullscreen(bool isFullscreen)
    {
        Screen.fullScreen = isFullscreen;
    }

    public void SetMainVolume(float volume)
    {
        if (volume <= 0) volume = 0.001f;
        GameAssets.i.mainMixer.SetFloat("main", Mathf.Log10(volume) * 20);
        GameManager.instance.mainVolume = volume;
    }

    public void SetMusicVolume(float volume)
    {
        if (volume <= 0) volume = 0.001f;
        Debug.Log($"what I get \"{volume}\" vs what it's processed \"{Mathf.Log10(volume) * 20}\"");
        GameAssets.i.mainMixer.SetFloat("music", Mathf.Log10(volume) * 20);
        GameManager.instance.musicVolume = volume;
    }
    
    public void SetSFXVolume(float volume)
    {
        if (volume <= 0) volume = 0.001f;
        GameAssets.i.mainMixer.SetFloat("sfx", Mathf.Log10(volume) * 20);
        GameManager.instance.sfxVolume = volume;
    }
    
    public void SetResolution(int resolutionIndex)
    {
        Resolution resolution = resolutions[resolutionIndex];
        Screen.SetResolution(resolution.width, resolution.height, Screen.fullScreen);
    }

    public void RefreshDropDown(Slider slider)
    {
        if (slider.name == "MasterVolume") slider.value = GameManager.instance.mainVolume;
        if (slider.name == "MusicVolume") slider.value = GameManager.instance.musicVolume;
        if (slider.name == "SFXVolume") slider.value = GameManager.instance.sfxVolume;
        // Debug.Log($"{gameObject.name}");
    }

    public void SetDebugDotState(bool state)
    {
        GameManager.instance.SetDebugAIDots(state);
    }

}
