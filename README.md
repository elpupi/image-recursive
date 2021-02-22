# **Image Recursive** Proof Of Concept

**TL;DR**  Implémentation d'une image récursive comme on le retrouve dans les partages d'écrans

Défi de mon frère @milvi :+1: :sparkles: :camel: :tada: :rocket: :metal: :octocat:

Pour lancer le programme sur Chrome:

```bash
npm run start:chrome
```
ou sur Firefox:

```bash
npm run start:firefox
```

## Contexte

Quand on partage son écran et qu'on regarde sa propre vidéo, on constate une récursivité infini tel qu'on le
retrouve avec 2 miroirs face à face.

Evidemment, si 2 personnes partagent leurs écrans mutuellement, et qu'ils visionnent ce partage, ils verront une
récursion alternée entre les 2 écrans.


## Objectif

Implémenter ce phénomène dans un canvas suivant la consigne suivante:

1. Importation d'une image

2. Chargement de l'image dans un canvas

3. Sélectionner une zône sur le canvas

4. Effectuer la récursion dans la sélection

5. Répéter l'opération si l'image ou la sélection de la zône est mise à jour

_____

### Contrainte

Respecter un délai maximal (impossible :flushed: :smirk: :smile:) de 1h.

_____

Fait avec :heart:
