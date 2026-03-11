const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\9da78aa6-f3f7-4db8-b369-4b908848b7c7';

const sissPath = path.join(brainDir, 'media__1773170309550.png');
const guarPath = path.join(brainDir, 'media__1773170309564.jpg');

const sissB64 = fs.readFileSync(sissPath).toString('base64');
const guarB64 = fs.readFileSync(guarPath).toString('base64');

const out = `
export const SISS_LOGO = 'data:image/png;base64,' + '${sissB64}';
export const GUAR_LOGO = 'data:image/jpeg;base64,' + '${guarB64}';
`;

fs.writeFileSync('d:\\ESUS\\Ferramenta de Análise\\lib\\logos.ts', out);
console.log('Logos gerados com sucesso!');
