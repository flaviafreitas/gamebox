import * as Sharing from 'expo-sharing';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

/** Captura a view referenciada como PNG e abre o menu de compartilhar (Instagram → Stories). */
export async function shareViewToStory(ref: RefObject<View | null>): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Compartilhamento não está disponível neste dispositivo.');
  }
  const uri = await captureRef(ref, { format: 'png', quality: 1 });
  await Sharing.shareAsync(uri, {
    mimeType: 'image/png',
    dialogTitle: 'Compartilhar nos stories',
  });
}
