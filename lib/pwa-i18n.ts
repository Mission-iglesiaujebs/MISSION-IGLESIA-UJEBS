// Textos de la app instalable (aparte para no tocar los diccionarios grandes)
export type PwaText = { install: string; title: string; desc: string; ios: string; android: string; installed: string; close: string };

const T: Record<string, PwaText> = {
  es: {
    install: "Instalar app", title: "Instala la app de la iglesia",
    desc: "Tenla en tu celular como una aplicación: abre más rápido, a pantalla completa y con su propio ícono.",
    ios: "En iPhone: abre esta página en Safari, toca el botón Compartir (□↑) y elige «Agregar a pantalla de inicio».",
    android: "En Android: toca «Instalar app». Si no aparece, abre el menú ⋮ de Chrome y elige «Instalar aplicación».",
    installed: "✓ La app ya está instalada en este dispositivo.", close: "Cerrar",
  },
  fr: {
    install: "Installer l'app", title: "Installez l'app de l'église",
    desc: "Ayez-la sur votre téléphone comme une application : plus rapide, en plein écran et avec sa propre icône.",
    ios: "Sur iPhone : ouvrez cette page dans Safari, touchez Partager (□↑) puis « Sur l'écran d'accueil ».",
    android: "Sur Android : touchez « Installer l'app ». Sinon, ouvrez le menu ⋮ de Chrome et choisissez « Installer l'application ».",
    installed: "✓ L'app est déjà installée sur cet appareil.", close: "Fermer",
  },
  ht: {
    install: "Enstale app la", title: "Enstale app legliz la",
    desc: "Mete l sou telefòn ou tankou yon aplikasyon: li louvri pi vit, sou tout ekran an, ak pwòp ikòn li.",
    ios: "Sou iPhone: louvri paj sa a nan Safari, peze bouton Pataje (□↑) epi chwazi « Ajoute sou ekran akèy ».",
    android: "Sou Android: peze « Enstale app la ». Si li pa parèt, louvri meni ⋮ Chrome la epi chwazi « Enstale aplikasyon ».",
    installed: "✓ App la deja enstale sou aparèy sa a.", close: "Fèmen",
  },
  en: {
    install: "Install app", title: "Install the church app",
    desc: "Keep it on your phone like an app: faster, full screen and with its own icon.",
    ios: "On iPhone: open this page in Safari, tap Share (□↑) and choose “Add to Home Screen”.",
    android: "On Android: tap “Install app”. If it doesn't appear, open Chrome's ⋮ menu and choose “Install app”.",
    installed: "✓ The app is already installed on this device.", close: "Close",
  },
  pt: {
    install: "Instalar app", title: "Instale o app da igreja",
    desc: "Tenha no seu celular como um aplicativo: abre mais rápido, em tela cheia e com ícone próprio.",
    ios: "No iPhone: abra esta página no Safari, toque em Compartilhar (□↑) e escolha «Adicionar à Tela de Início».",
    android: "No Android: toque em «Instalar app». Se não aparecer, abra o menu ⋮ do Chrome e escolha «Instalar aplicativo».",
    installed: "✓ O app já está instalado neste dispositivo.", close: "Fechar",
  },
};

export const getPwaText = (lang: string): PwaText => T[lang] ?? T.es;
