---
description: Promeut develop vers main (prod loustudio.fr) — résumé + confirmation unique + CI verte + pnpm test + PR squash + healthcheck Vercel
---

# /promote-to-prod — Promeut develop vers main (loustudio.fr)

## Règle absolue

- **Confirmation UNIQUE au début**, après avoir montré le résumé.
- **CI GitHub Actions** sur develop doit être verte.
- **pnpm test + typecheck locaux** avant le merge. Si un seul échoue → STOP.
- **Jamais** de « tu veux forcer ? ».

## Pré-conditions (échec → STOP)

1. Branche courante = `develop` : `git rev-parse --abbrev-ref HEAD` doit valoir `develop`
2. Working tree clean : `git status --porcelain` vide
3. develop à jour avec origin : `git fetch origin && git rev-list --left-right --count @{u}...HEAD` doit valoir `0 0`

Si l'utilisateur n'est pas sur develop, **ne switche pas pour lui**. Dis-lui de switcher puis relancer.

## Étape 1 — résumé + confirmation unique

Affiche dans cet ordre :

- **Commits depuis le dernier merge sur main** : `git log main..develop --oneline`
- **Nombre de commits** : `git rev-list --count main..develop`
- **Fichiers modifiés (résumé)** : `git diff --stat main..develop`

Puis demande **UNE SEULE FOIS** :

> OK de promouvoir develop en prod (loustudio.fr) ? (oui/non)

Si la réponse n'est pas un oui clair → STOP.

## Étape 2 — check CI GitHub Actions (auto)

```bash
gh run list --branch develop --limit 1 --json conclusion,url,databaseId,headSha
```

Si `conclusion != "success"` → STOP. Affiche l'URL et :

> CI rouge sur develop. Corrige et relance /promote-to-prod.

## Étape 3 — tests locaux (auto)

```bash
pnpm typecheck
pnpm test
```

Si un seul test échoue ou typecheck rouge → STOP. Affiche la sortie.

## Étape 4 — création + merge auto de la PR

Sans re-demander :

1. **Construire le résumé des commits** :
   ```bash
   git log main..develop --pretty="- %s" > /tmp/promote_pr_body.md
   ```
2. **Créer la PR** :
   ```bash
   gh pr create --base main --head develop \
     --title "release: dev → prod $(date +%Y-%m-%d)" \
     --body-file /tmp/promote_pr_body.md
   ```
3. **Auto-merge squash quand la CI passe** (`develop` est permanente, pas de `--delete-branch`) :
   ```bash
   gh pr merge --squash --auto
   ```
4. **Sync local** :
   ```bash
   git checkout main && git pull origin main
   git checkout develop
   ```

## Étape 5 — healthcheck Vercel prod

Affiche :

- ✅ Lien PR mergée : `gh pr view <pr-number> --json url -q .url`
- ⏳ Vercel build prod en cours (~1-2 min) — postera dans les checks
- 🩺 Healthcheck : `https://loustudio.fr/fr`

Poller (max 3 min) :

```bash
for i in {1..18}; do
  if curl -sSf -o /dev/null -w "%{http_code}\n" "https://loustudio.fr/fr" | grep -q "^2"; then
    echo "✅ Prod healthcheck OK"
    break
  fi
  sleep 10
done
```

Si OK :

> Prod déployée ✅. loustudio.fr répond. Vérifie le rendu visuel sur l'iPhone de Lou.

Si KO après 3 min :

> ⚠️ Healthcheck KO après 3 min. Vérifier les logs Vercel.
> Si la prod est cassée, revert le dernier commit sur main et re-pousse.

## Comportements interdits

- ❌ Pas de confirmation supplémentaire après le GO initial.
- ❌ Pas de skip CI ou tests locaux.
- ❌ Pas de force-merge sur erreur.
- ❌ État inattendu (PR existe, conflit, push refusé) → STOP et décris.
