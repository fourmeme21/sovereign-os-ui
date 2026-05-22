import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { isDesktop } from './platform'

export async function checkForUpdates(silent = true) {
  if (!isDesktop()) return

  try {
    const update = await check()

    if (!update?.available) {
      if (!silent) console.log('Uygulama güncel.')
      return
    }

    const confirmed = window.confirm(
      `Yeni sürüm mevcut: ${update.version}\n\nŞimdi güncellensin mi?`
    )

    if (!confirmed) return

    await update.downloadAndInstall()
    await relaunch()

  } catch (err) {
    if (!silent) console.error('Güncelleme kontrolü başarısız:', err)
  }
}
