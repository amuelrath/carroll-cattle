import { app, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createMainWindow } from './core/main-window'
import { createContext } from './trpc/context'
import { appRouter } from './trpc'
import { createIPCHandler } from 'trpc-electron/main'
import { seedIfEmpty } from './db/seed-if-empty'
import { runMigrations } from './db'

log.initialize()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Initialize DB and seed.
  await runMigrations()
  await seedIfEmpty()

  console.log(app.getPath('userData'))

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const mainWindow = createMainWindow()

  // Register tRPC router
  createIPCHandler({ createContext, router: appRouter, windows: [mainWindow] })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
