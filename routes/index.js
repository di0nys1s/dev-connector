const routes = require('express').Router();

routes.get('/', (req, res) => {
  return res.sendFile(__rootDir + `\\pages\\index.html`);
});

routes.get('/pages/:file', (req, res) => {
  return res.sendFile(__rootDir + `\\pages\\${req.params.file}.html`);
});

routes.post('/pages/contact', (req, res) => {
  let contactForm = req.body;

  return res.sendFile(__rootDir + `\\pages\\contact_done.html`);
});

function getFilesInDirectory(filePath) {

  let files = [];
  try {
    //get html files path
    const path = require('path');
    const fs = require('fs');

    files = fs.readdirSync(filePath);

  } catch (error) {
    console.log(`Error occurred in getFilesInDirectory(). Error was - `, error); 
  }

  return files;
}

routes.get('/api/get-html-files', (req, res) => {
 
  //get html files path
  const path = require('path');
  const fs = require('fs');

  const filePath = __rootDir + `\\pages\\`;
  //let files = fs.readdirSync(filePath);
  let files = getFilesInDirectory(filePath);

  res.send(files);

});

module.exports = routes;