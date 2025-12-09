#!/usr/bin/env node

// =============================================
// SCRIPT DE VÉRIFICATION DE SÉCURITÉ - MythicMarket
// =============================================
// Ce script vérifie la sécurité des fichiers sensibles

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// On importe la configuration centralisée pour éviter toute divergence
import { SECURITY_CONFIG, validateVersionSecure, validateRedirectUrl } from './security-config.js';

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
    cyan: '\x1b[36m'
};

// Fonction pour vérifier un fichier (lecture + dispatch vers la vérification dédiée)
function checkFile(filePath) {
    const fullPath = path.join(__dirname, '..', '..', '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
        return { status: 'error', message: 'File not found' };
    }
    
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Vérifications spécifiques selon le fichier
        if (filePath.includes('versionService.js')) {
            return checkVersionService(content);
        } else if (filePath.includes('VersionUpdater.html')) {
            return checkVersionUpdater(content);
        } else if (filePath.includes('updater.js')) {
            return checkUpdater(content);
        }
        
        return { status: 'ok', message: 'File checked successfully' };
    } catch (error) {
        return { status: 'error', message: `Error reading file: ${error.message}` };
    }
}

// Vérifier versionService.js: s'assure que la constante est bien définie,
// qu'il n'y a pas d'exécution dynamique de code, et que le format est valide
function checkVersionService(content) {
    const issues = [];
    
    // Vérifier que APP_VERSION est bien défini
    if (!content.includes('export const APP_VERSION')) {
        issues.push('APP_VERSION constant not found');
    }
    
    // Vérifier qu'il n'y a pas d'évaluation de code
    if (content.includes('eval(') || content.includes('Function(')) {
        issues.push('Dangerous code evaluation detected');
    }
    
    // Vérifier le format de la version
    const versionMatch = content.match(/export const APP_VERSION = "([^"]*)"/);
    if (versionMatch) {
        const version = versionMatch[1];
        const validation = validateVersionSecure(version);
        if (!validation.valid) {
            issues.push(`Invalid version format: ${validation.reason}`);
        }
    }
    
    return issues.length === 0 
        ? { status: 'ok', message: 'VersionService is secure' }
        : { status: 'warning', message: `Issues found: ${issues.join(', ')}` };
}

// Vérifier VersionUpdater.html (ou pages de splash): vérifie les URLs de
// redirection et des patterns risqués dans des innerHTML dynamiques
function checkVersionUpdater(content) {
    const issues = [];
    
    // Vérifier les redirections
    const redirectMatches = content.match(/window\.location\.href\s*=\s*["']([^"']+)["']/g);
    if (redirectMatches) {
        redirectMatches.forEach(match => {
            const url = match.match(/["']([^"']+)["']/)[1];
            const validation = validateRedirectUrl(url);
            if (!validation.valid) {
                issues.push(`Unsafe redirect URL: ${url}`);
            }
        });
    }
    
    // Vérifier qu'il n'y a pas d'injection de code
    if (content.includes('innerHTML') && content.includes('${')) {
        issues.push('Potential code injection in innerHTML');
    }
    
    return issues.length === 0 
        ? { status: 'ok', message: 'VersionUpdater is secure' }
        : { status: 'warning', message: `Issues found: ${issues.join(', ')}` };
}

// Vérifier updater.js: s'assure que la validation est bien référencée et
// qu'il n'y a pas d'exécution dynamique risquée
function checkUpdater(content) {
    const issues = [];
    
    // Vérifier la validation des versions
    if (!content.includes('validateVersion')) {
        issues.push('Version validation function not found');
    }
    
    // Vérifier qu'il n'y a pas d'exécution de code utilisateur
    if (content.includes('eval(') || content.includes('Function(')) {
        issues.push('Dangerous code execution detected');
    }
    
    return issues.length === 0 
        ? { status: 'ok', message: 'Updater is secure' }
        : { status: 'warning', message: `Issues found: ${issues.join(', ')}` };
}

// Fonction principale
async function main() {
    console.log(`${colors.cyan}${colors.bright}🔒 VÉRIFICATION DE SÉCURITÉ - MYTHIC MARKET${colors.reset}`);
    console.log(`${colors.cyan}==============================================${colors.reset}\n`);
    
    let totalFiles = 0;
    let secureFiles = 0;
    let warningFiles = 0;
    let errorFiles = 0;
    
    // Vérifier tous les fichiers sensibles déclarés dans la config
    for (const file of SECURITY_CONFIG.SENSITIVE_FILES) {
        totalFiles++;
        console.log(`${colors.blue}🔍 Vérification de ${file}...${colors.reset}`);
        
        const result = checkFile(file);
        
        switch (result.status) {
            case 'ok':
                console.log(`${colors.green}✅ ${result.message}${colors.reset}`);
                secureFiles++;
                break;
            case 'warning':
                console.log(`${colors.yellow}⚠️  ${result.message}${colors.reset}`);
                warningFiles++;
                break;
            case 'error':
                console.log(`${colors.red}❌ ${result.message}${colors.reset}`);
                errorFiles++;
                break;
        }
        console.log('');
    }
    
    // Résumé des résultats en console
    console.log(`${colors.cyan}📊 RÉSUMÉ DE LA VÉRIFICATION${colors.reset}`);
    console.log(`${colors.cyan}============================${colors.reset}`);
    console.log(`${colors.green}✅ Fichiers sécurisés: ${secureFiles}/${totalFiles}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Fichiers avec avertissements: ${warningFiles}/${totalFiles}${colors.reset}`);
    console.log(`${colors.red}❌ Fichiers avec erreurs: ${errorFiles}/${totalFiles}${colors.reset}`);
    
    if (errorFiles === 0 && warningFiles === 0) {
        console.log(`\n${colors.green}${colors.bright}🎉 Tous les fichiers sont sécurisés !${colors.reset}`);
        process.exit(0);
    } else {
        console.log(`\n${colors.yellow}⚠️  Des améliorations de sécurité sont recommandées.${colors.reset}`);
        process.exit(1);
    }
}

// Lancer la vérification
main().catch(error => {
    console.error(`${colors.red}❌ Erreur lors de la vérification: ${error.message}${colors.reset}`);
    process.exit(1);
});


