#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import readline from 'readline';

function isJSX(file) {
  return path.extname(file).toLowerCase() === '.jsx';
}


//////////////////////////////////////////
// Couleurs ANSI et helpers d'affichage //
//////////////////////////////////////////
function enableColors() {
  try { if (!process.env.FORCE_COLOR) process.env.FORCE_COLOR = '1'; } catch {}
  return true;
}
const COLORS_ENABLED = enableColors();
const c = COLORS_ENABLED ? {
  r: '\x1b[0m', b: '\x1b[1m', d: '\x1b[2m',
  fg: {
    red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m', white: '\x1b[37m'
  }
} : { r: '', b: '', d: '', fg: { red: '', green: '', yellow: '', blue: '', magenta: '', cyan: '', white: '' } };
const logInfo = (m) => console.log(`${c.fg.blue}ℹ${c.r} ${m}`);
const logOk = (m) => console.log(`${c.fg.green}✔${c.r} ${m}`);
const logWarn = (m) => console.log(`${c.fg.yellow}⚠${c.r} ${m}`);
const logErr = (m) => console.error(`${c.fg.red}✖${c.r} ${m}`);
const title = (t) => console.log(`\n${c.b}${c.fg.magenta}› ${t}${c.r}`);
function box(lines){
  const width = Math.max(...lines.map(l => l.length));
  const top = `\n${c.fg.yellow}┌${'─'.repeat(width + 2)}┐${c.r}`;
  const bottom = `${c.fg.yellow}└${'─'.repeat(width + 2)}┘${c.r}`;
  const body = lines.map(l => `${c.fg.yellow}│${c.r} ${l.padEnd(width, ' ')} ${c.fg.yellow}│${c.r}`).join('\n');
  console.log(`${top}\n${body}\n${bottom}`);
}

//////////////////////////////////////////////
// Vérification Installation Babel + Terser //
//////////////////////////////////////////////

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(`${c.b}${c.fg.cyan}?${c.r} ${q} `, a => r((a||'').trim())));
const askYesNo = async (q) => {
  const a = (await ask(`${q} ${c.d}(oui/non)${c.r}`)).toLowerCase();
  return a === 'oui' || a === 'o' || a === 'y' || a === 'yes';
};
const execPromise = (cmd) => new Promise((res, rej) => exec(cmd, { windowsHide:true }, (e, so, se) => e ? rej(new Error(se || e.message)) : res(so)));

function ensureDir(dir){ fs.mkdirSync(dir, { recursive: true }); }

async function ensureBabelInstalled(){
  const ok = await askYesNo('As-tu déjà installé Babel (via npm) ?');
  if (ok) return;
  title('Installation');
  logInfo('Installation de Babel (preset-env, preset-react, core, cli)...');
  await execPromise('npm i -D @babel/core @babel/cli @babel/preset-env @babel/preset-react');
}

async function ensureTerserInstalled(){
  const ok = await askYesNo('As-tu déjà installé Terser (via npm) ?');
  if (ok) return;
  title('Installation');
  logInfo('Installation de Terser...');
  await execPromise('npm i -D terser');
}

//////////////////////////////////////////
// Fonction Transpilation Fichiers JSX  //
//////////////////////////////////////////

async function transpileStep(){
  const doTranspile = await askYesNo('Veux-tu transpiler un fichier JSX en JS ?');
  if (!doTranspile) return '';

  let inJsx = await ask('Chemin du fichier source JSX (ex: src/App.jsx). Laisse vide pour <base>.jsx :');
  if (!inJsx) {
    const base = await ask('Nom de base (ex: app) :');
    if (!base) throw new Error('Aucun nom de base fourni.');
    inJsx = `${base}.jsx`;
    console.log(`Fichier source présumé → ${inJsx}`);
  }
  if (!fs.existsSync(path.resolve(process.cwd(), inJsx))) {
    throw new Error(`Fichier source introuvable: ${inJsx}`);
  }

  let outJs = await ask('Chemin du fichier de sortie JS (ex: dist/app.js). Faites "Entrée" pour créer un emplacement par défaut :');
  if (!outJs) {
    const base = path.basename(inJsx).replace(/\.[^/.]+$/, '');
    const outDir = path.resolve(process.cwd(), 'Transpiled');
    ensureDir(outDir);
    outJs = path.join(outDir, `${base}_transpiled.js`);
    console.log(`Sortie par défaut → ${outJs}`);
  } else {
    if (!outJs.toLowerCase().endsWith('.js')) {
      outJs += '.js';
      console.log(`Extension .js ajoutée automatiquement → ${outJs}`);
    }
    ensureDir(path.dirname(path.resolve(process.cwd(), outJs)));
  }

  // --- Bloc Babel ---
  let cmdBabel = '';
  if (isJSX(inJsx)) {
    cmdBabel = `npx babel "${inJsx}" --out-file "${outJs}" --presets=@babel/preset-react,@babel/preset-env --no-babelrc`;
  }

  if (cmdBabel) {
    title('Transpilation');
    logInfo(`Transpilation: ${inJsx} → ${outJs}`);
    await execPromise(cmdBabel);
    logOk(`Transpilation terminée → ${outJs}`);
  } else {
    logInfo(`Le fichier n'est pas un JSX, pas besoin de transpilation → ${outJs}`);
  }

  return outJs;
}


////////////////////////////////////////////
// Fonction d'obfuscation des fichiers JS //
////////////////////////////////////////////

async function obfuscateStep(defaultInput){
  const doObfuscate = await askYesNo('Veux-tu obfusquer un fichier JS ?');
  if (!doObfuscate) return false;

  let inFile = await ask(`Chemin du fichier d'entrée à obfusquer (ex: ${defaultInput || 'dist/app.js'}) :`);
  if (!inFile) {
    if (defaultInput) {
      inFile = defaultInput;
      console.log(`Aucun chemin saisi. Utilisation de la sortie précédente: ${inFile}`);
    } else {
      throw new Error("Aucun fichier d'entrée fourni.");
    }
  }
  if (!fs.existsSync(path.resolve(process.cwd(), inFile))) {
    throw new Error(`Fichier introuvable: ${inFile}`);
  }

  let outMin = await ask('Chemin du fichier de sortie (ex: dist/app.min.js). Faites "Entrée" pour créer un emplacement par défaut :');
  if (!outMin) {
    const base = path.basename(inFile).replace(/\.[^/.]+$/, '');
    const outDir = path.resolve(process.cwd(), 'Obfusquer');
    ensureDir(outDir);
    outMin = path.join(outDir, `${base}_obfusced.min.js`);
    console.log(`Sortie par défaut → ${outMin}`);
  } else {
    if (!/\.js$/i.test(outMin)) {
      outMin += '.min.js';
      console.log(`Extension .min.js ajoutée automatiquement → ${outMin}`);
    }
    ensureDir(path.dirname(path.resolve(process.cwd(), outMin)));
  }

  // ✅ CONFIGURATION TERSER CORRIGÉE - Ne casse plus le code async/await + DOM préservé
  const cmdTerser = `npx terser "${inFile}" --compress arrows=false,collapse_vars=false,hoist_funs=false,inline=false,reduce_funcs=false,reduce_vars=false,toplevel=false --mangle reserved=[document,window,addEventListener,removeEventListener,getElementById,querySelector,querySelectorAll,createElement,localStorage,sessionStorage,fetch,submitOrderToServer,loadOrderData,API_URL,encryptData,decryptData],keep_classnames=true,keep_fnames=true,safari10=true --format comments=false,safari10=true,webkit=true --output "${outMin}"`;

  title('Obfuscation');
  logInfo(`Obfuscation en cours: ${inFile} → ${outMin}`);
  logWarn(`Configuration: Mode sécurisé (async/await préservé)`);
  
  try {
    await execPromise(cmdTerser);
    logOk(`Obfuscation terminée → ${outMin}`);
    
    // ✅ Vérification post-obfuscation
    const originalSize = fs.statSync(path.resolve(process.cwd(), inFile)).size;
    const minifiedSize = fs.statSync(path.resolve(process.cwd(), outMin)).size;
    const reduction = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
    logInfo(`Taille: ${originalSize} → ${minifiedSize} octets (-${reduction}%)`);
    
  } catch (error) {
    logErr(`Erreur lors de l'obfuscation: ${error.message}`);
    logWarn(`Le fichier original est intact: ${inFile}`);
    throw error;
  }
  
  return true;
}

/////////////////////////////////////
// Mode batch pour plusieurs fichiers //
/////////////////////////////////////

async function batchObfuscateStep(){
  const doBatch = await askYesNo('Veux-tu obfusquer plusieurs fichiers en batch ?');
  if (!doBatch) return false;

  const dirPath = await ask('Chemin du dossier contenant les fichiers JS (ex: src/js/Site) :');
  if (!dirPath) {
    logWarn('Aucun chemin fourni, mode batch annulé.');
    return false;
  }

  const resolvedDir = path.resolve(process.cwd(), dirPath);
  
  if (!fs.existsSync(resolvedDir)) {
    logErr(`Dossier introuvable: ${resolvedDir}`);
    return false;
  }

  // Lire tous les fichiers .js du dossier
  const files = fs.readdirSync(resolvedDir)
    .filter(file => file.endsWith('.js') && !file.endsWith('.min.js'))
    .map(file => path.join(resolvedDir, file));
  
  if (files.length === 0) {
    logWarn(`Aucun fichier JS trouvé dans: ${dirPath}`);
    return false;
  }

  logInfo(`${files.length} fichier(s) trouvé(s)`);
  const outDir = path.resolve(process.cwd(), 'Crypted/Site');
  ensureDir(outDir);

  for (const file of files) {
    const base = path.basename(file).replace(/\.js$/, '');
    const outMin = path.join(outDir, `${base}.min.js`);
    
    const cmdTerser = `npx terser "${inFile}" --module --compress arrows=false,collapse_vars=false,hoist_funs=false,inline=false,reduce_funcs=false,reduce_vars=false,toplevel=false --mangle reserved=[document,window,addEventListener,removeEventListener,getElementById,querySelector,querySelectorAll,createElement,localStorage,sessionStorage,fetch,submitOrderToServer,loadOrderData,API_URL,encryptData,decryptData],keep_classnames=true,keep_fnames=true,safari10=true --format comments=false --output "${outMin}"`;

    title(`Traitement: ${path.basename(file)}`);
    try {
      await execPromise(cmdTerser);
      logOk(`${path.basename(file)} → ${path.basename(outMin)}`);
    } catch (error) {
      logErr(`Erreur avec ${path.basename(file)}: ${error.message}`);
    }
  }

  logOk(`Batch terminé: ${files.length} fichiers traités`);
  return true;
}

/////////////////////////////
// Remerciements + Boucle  //
/////////////////////////////

async function main(){
  box([
    c.b + c.fg.magenta + 'TransFuscator v2.0 – made by evannn' + c.r,
    '',
    c.fg.cyan + 'Transpile JSX → JS (Babel)' + c.r,
    c.fg.yellow + 'Obfuscation JS → MIN.JS (Terser)' + c.r,
  ]);
  
  try {
    await ensureBabelInstalled();
    await ensureTerserInstalled();

    // Option: Mode batch ou fichier par fichier
    const useBatch = await askYesNo('Veux-tu utiliser le mode batch (plusieurs fichiers) ?');
    
    if (useBatch) {
      await batchObfuscateStep();
    } else {
      const jsOut = await transpileStep();
      let keep = await obfuscateStep(jsOut);
      
      while (keep) {
        const again = await askYesNo('Veux-tu continuer d\'obfusquer des fichiers ?');
        if (!again) break;
        keep = await obfuscateStep('');
      }
    }

    box([
      'Terminé !',
      'Merci d\'avoir utilisé TransFuscator',
      '',
      c.fg.cyan + '💡 Astuce: Teste tes fichiers après obfuscation' + c.r
    ]);
    
  } catch (e) {
    logErr(e.message || String(e));
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

main();