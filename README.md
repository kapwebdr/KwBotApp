# AI Tools ChatBot

Une application React Native multiplateforme intégrant différents outils d'IA dans une interface de chat unifiée.

## Fonctionnalités

### Outils disponibles
- **Chat** : Conversation avec différents modèles de langage
- **Images** :
  - Génération d'images à partir de texte
  - Analyse d'images
  - Amélioration d'images existantes
- **Texte** :
  - Extraction de texte (OCR)
  - Traduction multilingue
- **Audio** :
  - Synthèse vocale (Text-to-Speech)
  - Reconnaissance vocale pour les entrées

### Caractéristiques
- Interface de chat unifiée pour tous les outils
- Gestion des conversations avec historique
- Support du streaming pour les réponses en temps réel
- Thèmes personnalisables (clair, sombre, tamisé, océan, forêt)
- Adaptation responsive (desktop/mobile)
- Support multiplateforme (web, iOS, Android)
- Monitoring système intégré (CPU, RAM, GPU)

## Prérequis

- Node.js (v16 ou supérieur)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Pour iOS : XCode et CocoaPods
- Pour Android : Android Studio et SDK

## Installation

```bash
# Cloner le repository
git clone https://github.com/kapwebdr/KwBotApp.git
cd KwBotApp

# Installer les dépendances
yarn install
# ou
npm install
```

## Configuration

1. Créer un fichier `.env` à la racine du projet :
```env
BASE_API_URL=http://votre-api-url
```

2. Configurer les modèles et endpoints dans `src/types.ts` selon votre backend

## Développement

### Web
```bash
# Démarrer en mode web
yarn web
# ou
expo start --web
```

### iOS
```bash
# Installer les pods
cd ios && pod install && cd ..

# Démarrer en mode iOS
yarn ios
# ou
expo start --ios
```

### Android
```bash
# Démarrer en mode Android
yarn android
# ou
expo start --android
```

### Mode développement universel
```bash
# Démarrer Expo avec choix de la plateforme
yarn start
# ou
expo start
```

## Build de production

### Web
```bash
# Build web
yarn build:web
# ou
expo build:web
```

### iOS
```bash
# Build iOS
yarn build:ios
# ou
expo build:ios
```

### Android
```bash
# Build Android
yarn build:android
# ou
expo build:android
```

## Architecture

- `/src/components` : Composants React Native
- `/src/contexts` : Contextes React (thème, conversations, outils)
- `/src/services` : Services (API, stockage)
- `/src/styles` : Styles et thèmes
- `/src/hooks` : Hooks personnalisés

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## License

Apache License 2.0

Copyright 2024 Kapweb

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## Contact

**Kapweb**  
Damien RICHARD  
Site web : [http://www.kapweb.com](http://www.kapweb.com)  
GitHub : [https://github.com/kapwebdr](https://github.com/kapwebdr)
