#!/usr/bin/env node

// =============================================
// SCRIPT DE MISE À JOUR DE VERSION - MythicMarket
// =============================================
// Ce script permet de mettre à jour la version de l'application
// Usage: node src/js/scripts/updater.js ou npm run updater

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
// On réutilise la validation centralisée pour éviter la duplication
import { validateVersionSecure, sanitizeVersion } from './security-config.js';

// Obtenir __dirname en modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Couleurs pour la console
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Interface de lecture ligne par ligne
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Fonction pour poser une question
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

// compare semver-ish (très simple): retourne -1/0/1
function cmp(a, b) {
  const as = String(a).split('.').map(Number);
  const bs = String(b).split('.').map(Number);
  const len = Math.max(as.length, bs.length);
  for (let i = 0; i < len; i++) {
    const av = as[i] || 0;
    const bv = bs[i] || 0;
    if (av < bv) return -1;
    if (av > bv) return 1;
  }
  return 0;
}

// Gérer l'historique des versions (JSON lisible à la racine du projet)
function recordVersionHistory(previousVersion, newVersion) {
    try {
        const historyPath = path.join(__dirname, '..', '..', '..', 'version-history.json');
        let history = [];
        if (fs.existsSync(historyPath)) {
            try {
                history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
                if (!Array.isArray(history)) history = [];
            } catch {
                history = [];
            }
        }

        const timestamp = new Date().toISOString();
        // Éviter les doublons consécutifs
        const last = history[history.length - 1];
        if (!last || last.version !== newVersion) {
            history.push({ version: newVersion, previous: previousVersion, date: timestamp });
        }

        fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf8');

        // Afficher un récapitulatif
        console.log(`\n${colors.magenta}${colors.bright}🗂 Historique des versions (${history.length})${colors.reset}`);
        history.forEach((entry, idx) => {
            const n = String(idx + 1).padStart(2, '0');
            console.log(` ${n}. ${colors.bright}${entry.version}${colors.reset}  (${entry.date})${entry.previous ? `  ← ${entry.previous}` : ''}`);
        });
    } catch (e) {
        console.log(`${colors.yellow}⚠️  Avertissement: Impossible d'écrire l'historique des versions: ${e.message}${colors.reset}`);
    }
}

// Fonction pour mettre à jour le fichier versionService.js
function updateVersionService(newVersion) {
    const filePath = path.join(__dirname, '..', '..', 'services', 'versionService.js');
    
    try {
        // Vérifier que le fichier existe
        if (!fs.existsSync(filePath)) {
            console.log(`${colors.red}❌ Erreur: Fichier versionService.js non trouvé${colors.reset}`);
            return false;
        }
        
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Vérifier que le contenu contient bien la structure attendue
        if (!content.includes('export const APP_VERSION')) {
            console.log(`${colors.red}❌ Erreur: Structure de fichier invalide${colors.reset}`);
            return false;
        }
        
        // Remplacer la version dans le fichier avec échappement
        const versionRegex = /export const APP_VERSION = "[^"]*";/;
        const escapedVersion = newVersion.replace(/"/g, '\\"'); // Échapper les guillemets
        const newVersionLine = `export const APP_VERSION = "${escapedVersion}";`;
        
        if (versionRegex.test(content)) {
            content = content.replace(versionRegex, newVersionLine);
            
            // Vérifier que le remplacement a bien eu lieu
            if (!content.includes(`"${escapedVersion}"`)) {
                console.log(`${colors.red}❌ Erreur: Échec du remplacement de version${colors.reset}`);
                return false;
            }
            
            // Écrire le fichier mis à jour
            fs.writeFileSync(filePath, content, 'utf8');
            
            console.log(`${colors.green}✅ Version mise à jour avec succès dans versionService.js${colors.reset}`);
            return true;
        } else {
            console.log(`${colors.red}❌ Erreur: Format de version non trouvé dans le fichier${colors.reset}`);
            return false;
        }
    } catch (error) {
        console.log(`${colors.red}❌ Erreur lors de la mise à jour du fichier: ${error.message}${colors.reset}`);
        return false;
    }
}

// Fonction pour mettre à jour le package.json
function updatePackageJson(newVersion) {
    const filePath = path.join(__dirname, '..', '..', '..', 'package.json');
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const packageJson = JSON.parse(content);
        
        // Mettre à jour la version dans package.json
        packageJson.version = newVersion;
        
        // Écrire le fichier mis à jour
        fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2), 'utf8');
        
        console.log(`${colors.green}✅ Version mise à jour dans package.json${colors.reset}`);
        return true;
    } catch (error) {
        console.log(`${colors.yellow}⚠️  Avertissement: Impossible de mettre à jour package.json: ${error.message}${colors.reset}`);
        return false;
    }
}

// Fonction pour mettre à jour le VersionUpdater.html
function updateVersionUpdater(newVersion) {
    const filePath = path.join(__dirname, '..', '..', '..', 'Maintenance', 'VersionUpdater.html');
    
    try {
        // Vérifier que le fichier existe
        if (!fs.existsSync(filePath)) {
            console.log(`${colors.red}❌ Erreur: Fichier VersionUpdater.html non trouvé${colors.reset}`);
            return false;
        }
        
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Vérifier que le contenu contient bien la structure attendue
        if (!content.includes('const APP_VERSION =')) {
            console.log(`${colors.red}❌ Erreur: Structure de fichier invalide${colors.reset}`);
            return false;
        }
        
        // Remplacer la version dans le fichier avec échappement
        const versionRegex = /const APP_VERSION = "[^"]*";/;
        const escapedVersion = newVersion.replace(/"/g, '\\"'); // Échapper les guillemets
        const newVersionLine = `const APP_VERSION = "${escapedVersion}";`;
        
        if (versionRegex.test(content)) {
            content = content.replace(versionRegex, newVersionLine);
            
            // Vérifier que le remplacement a bien eu lieu
            if (!content.includes(`"${escapedVersion}"`)) {
                console.log(`${colors.red}❌ Erreur: Échec du remplacement de version${colors.reset}`);
                return false;
            }
            
            // Écrire le fichier mis à jour
            fs.writeFileSync(filePath, content, 'utf8');
            
            console.log(`${colors.green}✅ Version mise à jour dans VersionUpdater.html${colors.reset}`);
            return true;
        } else {
            console.log(`${colors.red}❌ Erreur: Format de version non trouvé dans le fichier${colors.reset}`);
            return false;
        }
    } catch (error) {
        console.log(`${colors.red}❌ Erreur lors de la mise à jour du fichier: ${error.message}${colors.reset}`);
        return false;
    }
}

// Fonction principale
async function main() {
    console.log(`${colors.cyan}${colors.bright}🚀 MYTHIC MARKET - SCRIPT DE MISE À JOUR DE VERSION${colors.reset}`);
    console.log(`${colors.cyan}================================================${colors.reset}\n`);
    
    try {
        // Support du mode non interactif via --version=xxx et --allow-downgrade
        const args = process.argv.slice(2);
        const versionArg = args.find(a => a.startsWith('--version='));
        const allowDowngrade = args.includes('--allow-downgrade');

        // Demander la nouvelle version si non fournie
        const inputVersion = versionArg ? versionArg.split('=')[1] : await askQuestion(`${colors.yellow}📝 Entrez la nouvelle version (max 10 caractères, lettres, chiffres et points): ${colors.reset}`);
        const newVersion = sanitizeVersion(inputVersion);
        
        // Valider la version
        const validation = validateVersionSecure(newVersion);
        if (!validation.valid) {
            console.log(`${colors.red}❌ Version invalide! Utilisez uniquement des lettres, chiffres et points (max 10 caractères)${colors.reset}`);
            console.log(`${colors.yellow}Exemples valides: 1.0.1, v2.1, beta3, rc1.2${colors.reset}`);
            process.exit(1);
        }
        
        // Lire la version actuelle pour comparaison
        let currentVersion = "1.0.0";
        try {
            const versionServicePath = path.join(__dirname, '..', '..', 'services', 'versionService.js');
            if (fs.existsSync(versionServicePath)) {
                const content = fs.readFileSync(versionServicePath, 'utf8');
                const versionMatch = content.match(/export const APP_VERSION = "([^"]*)"/);
                if (versionMatch) {
                    currentVersion = versionMatch[1];
                }
            }
        } catch (error) {
            console.log(`${colors.yellow}⚠️  Impossible de lire la version actuelle${colors.reset}`);
        }

        // Afficher la version actuelle
        console.log(`${colors.cyan}📊 Version actuelle: ${colors.bright}${currentVersion}${colors.reset}`);
        console.log(`${colors.cyan}📊 Nouvelle version: ${colors.bright}${newVersion}${colors.reset}`);
        
        // Vérifier si c'est une mise à jour ou un downgrade
        if (currentVersion === newVersion) {
            console.log(`${colors.yellow}⚠️  Attention: La version est identique à la version actuelle${colors.reset}`);
        } else {
            console.log(`${colors.blue}🔄 Mise à jour de la version: ${colors.bright}${currentVersion}${colors.reset} → ${colors.bright}${newVersion}${colors.reset}`);
        }
        console.log('');

        // Empêche les downgrades non intentionnels: demander confirmation si aucun flag
        const cmpRes = cmp(newVersion, currentVersion);
        if (cmpRes < 0 && !allowDowngrade) {
            console.log(`${colors.yellow}⚠️  Downgrade détecté (${newVersion} < ${currentVersion}).${colors.reset}`);
            const confirm = (await askQuestion(`${colors.bright}Voulez-vous forcer le downgrade ? (oui/non): ${colors.reset}`)).toLowerCase();
            if (confirm !== 'oui' && confirm !== 'o' && confirm !== 'yes' && confirm !== 'y') {
                console.log(`${colors.red}❌ Opération annulée par l'utilisateur.${colors.reset}`);
                process.exit(1);
            }
        }
        
        // Mettre à jour les fichiers
        const versionServiceUpdated = updateVersionService(newVersion);
        const packageJsonUpdated = updatePackageJson(newVersion);
        const versionUpdaterUpdated = updateVersionUpdater(newVersion);
        
        if (versionServiceUpdated) {
            console.log(`\n${colors.green}${colors.bright}🎉 Mise à jour terminée avec succès!${colors.reset}`);
            console.log(`${colors.cyan}📦 Nouvelle version: ${colors.bright}${newVersion}${colors.reset}`);
            console.log(`${colors.cyan}🔧 Fichiers mis à jour:${colors.reset}`);
            console.log(`   - src/services/versionService.js`);
            if (packageJsonUpdated) {
                console.log(`   - package.json`);
            }
            if (versionUpdaterUpdated) {
                console.log(`   - Maintenance/VersionUpdater.html`);
            }
            // Écrire et afficher l'historique
            recordVersionHistory(currentVersion, newVersion);
            console.log(`\n${colors.yellow}💡 N'oubliez pas de commiter et pousser vos changements!${colors.reset}`);
        } else {
            console.log(`\n${colors.red}❌ Échec de la mise à jour${colors.reset}`);
            process.exit(1);
        }
        
    } catch (error) {
        console.log(`${colors.red}❌ Erreur: ${error.message}${colors.reset}`);
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Lancer le script
main();


