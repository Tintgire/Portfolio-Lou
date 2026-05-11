---
description: Merge la branche feat/* courante vers develop (tests obligatoires, confirmation unique, nettoyage auto)
---

# /merge-feature — Merge la feature courante vers develop (loustudio.fr)

## Règle absolue

- **Confirmation UNIQUE au début**, après avoir montré le résumé. Pas d'autre question à l'utilisateur.
- **Tests vitest + typecheck obligatoires** avant le merge. Si **UN SEUL** test échoue ou si typecheck rouge → STOP. Pas de « tu veux forcer ? ».
- **Nettoyage auto** de la feature branch (remote + local) après le merge.

## Pré-conditions à vérifier (échec → STOP net)

1. Working tree clean : `git status --porcelain` doit être vide
2. Branche courante = `feat/*` : `git rev-parse --abbrev-ref HEAD` doit matcher `feat/*`
3. Branche pushée et à jour avec origin : `git rev-list --left-right --count @{u}...HEAD` doit être `0 0`
4. Une PR existe vers `develop` ; sinon, propose à l'utilisateur de la créer :
   ```bash
   gh pr create --base develop --draft --fill
   ```

## Étape 1 — résumé + confirmation unique

Affiche dans cet ordre :

- **Branche courante** : `git rev-parse --abbrev-ref HEAD`
- **Commits depuis develop** : `git log develop..HEAD --oneline`
- **Fichiers modifiés (résumé)** : `git diff --stat develop..HEAD`
- **Lien de la PR** : `gh pr view --json url -q .url`

Puis demande **UNE SEULE FOIS** :

> OK de merger cette feature vers develop ? (oui/non)

Si la réponse n'est pas un oui clair → STOP.

## Étape 2 — tests obligatoires (auto si GO)

```bash
pnpm typecheck
pnpm test
```

- Si typecheck rouge ou si **un seul** test vitest échoue → STOP, affiche la sortie. **Ne propose pas de skip.**
- Note : les E2E Playwright (~2 min build + start) tournent sur la CI, pas en local. La CI les bloque côté GitHub avant que la PR puisse merger.

## Étape 3 — merge + nettoyage (auto si vert)

Dans l'ordre, sans re-demander :

1. **Merge squash + suppression remote** :
   ```bash
   gh pr merge --squash --delete-branch
   ```
2. **Sync local sur develop** :
   ```bash
   git checkout develop
   git pull origin develop
   ```
3. **Suppression locale de la feature branch** (capture le nom avant le checkout) :
   ```bash
   git branch -d <nom-feat-branch>
   ```

## Étape 4 — récap final

Affiche :

- ✅ Lien vers le commit de merge sur develop : `gh browse <sha-du-merge>`
- ⏳ Vercel preview en cours de déploiement (~1 min) — Vercel postera automatiquement le lien dans les checks de la PR
- 💬 Message :
  > Feature mergée sur develop. Vercel rebuild le preview. Quand tu es prêt à pousser en prod : `/promote-to-prod`.

## Comportements interdits

- ❌ Pas de confirmation supplémentaire après le GO initial.
- ❌ Pas de force-merge si tests rouge.
- ❌ Pas de skip pytest/typecheck même si diff trivial.
- ❌ Conflit de merge ou état inattendu → STOP et décris.
