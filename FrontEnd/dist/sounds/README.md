# Sound Files for Notification System

This directory contains sound files used for audio notifications in the Quality Control application.

## Required Sound Files

The following sound files are required for the notification system to work properly:

| File Name | Type | Duration | Usage | Volume |
|-----------|------|----------|-------|--------|
| `success.mp3` | Success | 0.8-1.0s | Form submission success, operations completed | 0.5 |
| `error.mp3` | Error | 0.8s | Validation errors, API failures | 0.6 |
| `warning.mp3` | Warning | 0.6s | Warning messages, cautions | 0.5 |
| `info.mp3` | Info | 0.5s | Informational messages | 0.4 |
| `delete.mp3` | Delete | 0.8s | Record deletion confirmation | 0.5 |
| `save.mp3` | Save | 1.0s | Data saved successfully | 0.5 |
| `select.mp3` | Select | 0.5s | Selection confirmations | 0.4 |
| `important.mp3` | Important | 1.5s | Critical operations (SIV generation) | 0.6 |

## Sound Characteristics

### Success Sound
- **Tone**: Cheerful, positive
- **Suggested**: Bright chime or bell tone
- **Usage**: Form submissions, data saved, operations completed

### Error Sound
- **Tone**: Alert, attention-grabbing but not harsh
- **Suggested**: Short beep or alert tone
- **Usage**: Validation failures, API errors, system errors

### Warning Sound
- **Tone**: Medium alert, cautionary
- **Suggested**: Moderate beep or notification sound
- **Usage**: Warning messages, operation cautions

### Info Sound
- **Tone**: Soft, neutral
- **Suggested**: Gentle notification sound
- **Usage**: Informational messages, status updates

### Delete Sound
- **Tone**: Confirmation, brief
- **Suggested**: Click or confirmation sound
- **Usage**: Record deletions, removals

### Save Sound
- **Tone**: Satisfying, completion
- **Suggested**: Chime or success tone
- **Usage**: Data saved, records updated

### Select Sound
- **Tone**: Light, quick
- **Suggested**: Short click or ding
- **Usage**: Selection confirmations, modal actions

### Important Sound
- **Tone**: Prominent, significant
- **Suggested**: Multi-note chime or fanfare
- **Usage**: Critical operations (SIV generation, major milestones)

## Adding Sound Files

### Option 1: Download Free Sounds
You can download free notification sounds from:
- [Mixkit](https://mixkit.co/free-sound-effects/notification/)
- [Freesound](https://freesound.org/)
- [Zapsplat](https://www.zapsplat.com/sound-effect-category/notification-sounds/)

### Option 2: Generate Sounds
Use online tools to generate notification sounds:
- [BeepBox](https://www.beepbox.co/) - Create custom beeps
- [Bfxr](https://www.bfxr.net/) - Game sound effects generator

### Option 3: Use System Sounds
Convert system notification sounds from your OS to MP3 format.

## File Format Requirements

- **Format**: MP3 (for best browser compatibility)
- **Sample Rate**: 44.1kHz recommended
- **Bit Rate**: 128kbps minimum
- **Channels**: Mono or Stereo
- **Size**: Keep files small (<100KB each) for fast loading

## Testing Sounds

After adding sound files, test them by:

1. **Volume Test**: Ensure sounds are not too loud or too quiet
2. **Duration Test**: Sounds should be brief and non-intrusive
3. **Browser Test**: Test in Chrome, Firefox, Edge
4. **Mobile Test**: Test on mobile devices if applicable

## Sound Controls

Users can control sounds through:
- **Volume**: Adjust master volume (0-100%)
- **Mute**: Temporarily mute all sounds
- **Enable/Disable**: Turn sound system on/off
- Settings are persisted in browser localStorage

## Fallback Behavior

If sound files are missing or fail to load:
- Notifications will still display normally
- No error will be shown to users
- Console warnings will be logged for debugging

## License and Attribution

Ensure all sound files used are properly licensed for commercial use if applicable.
Add attribution information here if required by the sound license.
