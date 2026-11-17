# Warranty Reminder – Never Miss Your Warranty!

Android app (React Native + Expo + TypeScript + Expo Router).
No login, no internet needed. Everything is saved on the phone.

- Save product details, photo and purchase bill (PDF/JPG/PNG)
- Live countdown timer (days / hours / minutes / seconds) to warranty and guarantee expiry
- Phone notifications 30 / 15 / 7 / 3 days before and on expiry day (customizable, no duplicates)
- Dashboard, search, filter, sort, expired list, reports, light/dark mode

## Build the APK on GitHub (no coding, no Expo account, no secrets)
1. Upload all these files to a GitHub repository
2. Create the file `.github/workflows/build-apk.yml` (GitHub: Add file -> Create new file, type the full path as the name)
3. Actions -> **Build Android APK** -> Run workflow (15-25 minutes)
4. Open the finished run -> Artifacts -> `warranty-reminder-apk` -> download, unzip, install the APK

## Run locally
```
npm install --legacy-peer-deps
npx expo install --fix
npx expo start
```
Notifications need a real build (APK); they are limited in Expo Go.

## Structure
```
app/         screens (Expo Router): dashboard, products, add, reports, settings,
             product/[id], edit/[id], reminders, expired, notifications
src/
  components/  UI, ProductForm, ProductCard, ProductImage, Countdown
  lib/         dates, format, files, notifications
  store/       settings (theme + reminders), products (saved on phone)
```
