import { Audio } from 'expo-av';

/**
 * Requests iOS microphone permission.
 * @returns true if the user granted access, false otherwise.
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  const { granted } = await Audio.requestPermissionsAsync();
  return granted;
}

/**
 * Configures the iOS audio session and starts a high-quality .m4a recording.
 * @returns The active Recording instance (pass to stopRecording when done).
 */
export async function startRecording(): Promise<Audio.Recording> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY,
  );

  return recording;
}

/**
 * Stops an active recording and returns the local cache URI of the .m4a file.
 * @param recording - The Recording instance returned by startRecording.
 * @returns The local file URI (e.g. file:///var/mobile/.../recording.m4a).
 */
export async function stopRecording(recording: Audio.Recording): Promise<string> {
  await recording.stopAndUnloadAsync();

  const uri = recording.getURI();
  if (!uri) {
    throw new Error('Recording URI is null — file was not written to cache.');
  }

  return uri;
}
