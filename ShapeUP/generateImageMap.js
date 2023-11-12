const fs = require('fs');
const path = require('path');

const exercisesDir = './assets/exercises';
const outputFilePath = 'imageMap.js';

const escapeApostrophes = (str) => str.replace(/'/g, "\\'");

const exerciseImageMap = {};

fs.readdirSync(exercisesDir).forEach(exerciseDir => {
  const exerciseImagesDir = path.join(exercisesDir, exerciseDir, 'images');
  if (fs.existsSync(exerciseImagesDir)) {
    exerciseImageMap[exerciseDir] = fs.readdirSync(exerciseImagesDir)
      .filter(fileName => /\.(jpg|jpeg|png)$/.test(fileName)) // filter image files
      .map(fileName => `require('${escapeApostrophes(path.join('../..', exerciseImagesDir, fileName))}')`);
  }
});

const fileContent = `export const imageMap = ${JSON.stringify(exerciseImageMap, null, 2)
  .replace(/"require\(([^)]+)\)"/g, 'require($1)')};\n`;

fs.writeFileSync(outputFilePath, fileContent);