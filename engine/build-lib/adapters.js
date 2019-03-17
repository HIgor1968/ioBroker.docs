const request = require('request');
const fs = require('fs');
const path = require('path');
const utils = require('./utils');
const consts = require('./consts');

const ADAPTERS_DIR = path.normalize(__dirname + '/../../docs/LANG/adapterref/').replace(/\\/g, '/');

const ADAPTER_TYPES = {

};
const urlsCache = {};

function fixImages(lang, adapter, body, link) {
    const badges = {};
    const doDownload = [];
    const prefix = `${lang}/adapterref/iobroker.${adapter}/`;

    // replace all images like "mediaDir/blabla.png" with "LN/adapterref/iobroker.adapterName/mediaDir/blabla.png"
    let images = body.match(/!\[[^\]]*]\([^)]*\)/g);
    if (images) {

        images.forEach(image => {
            const m = image.match(/!\[([^\]]*)]\(([^)]*)\)/);
            if (m && m.length === 3) {
                let alt = m[1];
                let link = m[2];
                if (!link.toLowerCase().match(/^https?:\/\//)) {
                    doDownload.indexOf(link) === -1 && doDownload.push(link);
                    body = body.replace(image, `![${alt}](${prefix + link})`);
                } else if (
                    link.indexOf('shields.io') !== -1 ||
                    link.indexOf('herokuapp.com') !== -1 ||
                    link.indexOf('appveyor.com') !== -1 ||
                    link.indexOf('travis-ci.org') !== -1 ||
                    link.indexOf('iobroker.live') !== -1 ||
                    link.indexOf('nodei.co') !== -1) {
                    badges[alt] = link;
                    body = body.replace(image, '--delete--');
                }
            }
        });
    }

    // replace all images like "<img src="src/img/rooms/006-double-bed.svg" height="48" />" with "<img src="LN/adapterref/iobroker.adapterName/src/img/rooms/006-double-bed.svg" height="48" />"
    images = body.match(/<img [^>]+>/g);
    if (images) {
        images.forEach(image => {
            const m = image.match(/src="([^"]*)"/);
            if (m && m.length === 2) {
                let link = m[1];
                if (!link.toLowerCase().match(/^https?:\/\//)) {
                    let newImage = image.replace(link, prefix + link);
                    doDownload.indexOf(link) === -1 && doDownload.push(link);
                    body = body.replace(image, newImage);
                }
            }
        });
    }

    //[](https://www.npmjs.com/package/iobroker.admin)
    const lines = body.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].indexOf('--delete--') !== -1) {
            lines.splice(i, 1);
        }
    }
    body = lines.join('\n').trim();

    return {body, badges, doDownload};
}

function getAuthor(data) {
    return data && typeof data === 'object' ? `${data.name} <${data.email}>` : data || '';
}

function prepareAdapterReadme(lang, repo, data) {
    return new Promise(resolve => {
        let text = data.body;
        let downloaded = data.downloaded;
        let link = data.link;

        let {header, body} = utils.extractHeader(text);

        header.adapter = true;
        header.license = repo.license;
        header.authors = repo.authors ? repo.authors.map(item => getAuthor(item)).join(', ') : getAuthor(repo.author);
        header.description = repo.desc ? (repo.desc[lang] || repo.desc.en || repo.desc) : '';
        header.title = repo.titleLang ? repo.titleLang[lang] || repo.title : repo.title;
        header.keywords = repo.keywords ? repo.keywords.join(', ') : '';
        header.readme = repo.readme;
        header.mode = repo.mode;
        header.materialize = repo.materialize || false;
        header.compact = repo.compact || false;
        header.version = repo.version;

        const result = fixImages(lang, repo.name, body);

        body = result.body;
        Object.keys(result.badges).forEach(name => {
            header['BADGE-' + name] = result.badges[name];
        });

        const lines = body.split('\n');

        // remove logo and header
        if (lines.length && lines[0].trim().startsWith('![')) {
            header.logo = lines[0].replace(/^!\[[^\]]*]\(|\)$/g, '');
            lines.shift();
        }

        // remove empty lines at start
        while(lines.length && !lines[0].trim()) {
            lines.shift();
        }

        // remove title
        if (lines.length && lines[0].trim().startsWith('# ')) {
            lines.shift();
        }

        // remove empty lines at start
        while(lines.length && !lines[0].trim()) {
            lines.shift();
        }
        // remove =======
        if (lines.length && lines[0].trim().startsWith('=======')) {
            lines.shift();
        }

        // remove empty lines at start
        while(lines.length && !lines[0].trim()) {
            lines.shift();
        }

        let readme = repo.readme || repo.meta.replace('io-package.json', 'README.md');
        readme = readme.replace('README.md', '');

        // download readme
        const github = readme
            .replace('github.com', 'raw.githubusercontent.com')
            .replace('/blob/master/', '/master/');

        const localDirName = consts.FRONT_END_DIR + lang + '/adapterref/iobroker.' + repo.name + '/';

        // check that all images are exists
        const promises = result.doDownload.map(link =>
            new Promise(resolve1 => {
                link = link.split('?')[0];
                link = link.split(' ')[0];
                const parts = data.link.split('/');
                parts.pop();
                const relative = parts.join('/') + '/';

                if (!fs.existsSync(localDirName + link)) {
                    request(relative + link, {encoding: null}, (err, status, body) => {
                        err && console.error('Cannot download ' + relative + link + ': ' + err);
                        body && utils.writeSafe(localDirName + link, body);
                        resolve1()
                    });
                } else {
                    resolve1();
                }
            }));

        Promise.all(promises).then(() => {
            resolve({body: utils.addHeader(lines.join('\n'), header), name: data.link.replace(data.relative, '')});
        });
    });
}

function getIcon(url, checkFile) {
    if (url) {
        if (checkFile && fs.existsSync(checkFile)) {
            return Promise.resolve(fs.readFileSync(checkFile));
        } else {
            return getUrl(url, true);
        }
    } else {
        return Promise.resolve();
    }
}

function getUrl(url, binary) {
    if (urlsCache[url]) {
        return urlsCache[url];
    }
    urlsCache[url] = new Promise(resolve => {
        console.log('Requested ' + url);
        request(url, {encoding: null}, (err, state, file) => {
            err && console.error('Cannot download ' + url + ': ' + err);
            if (state.statusCode !== 200) {
                console.error('Cannot download ' + url + ': ' + state.statusCode);
                resolve();
            } else {
                resolve(binary ? file : file.toString());
            }
        });
    });
    return urlsCache[url];
}

function getReadme(lang, dirName, repo, adapter) {
    return new Promise(resolve => {
        if (fs.existsSync(dirName + '/README.md')) {
            let body = fs.readFileSync(dirName + '/README.md').toString();
            utils.createDir(consts.FRONT_END_DIR + lang + '/adapterref/iobroker.' + adapter);
            utils.copyDir(dirName, consts.FRONT_END_DIR + lang + '/adapterref/iobroker.' + adapter + '/');
            resolve([{body, downloaded: false}]);
        } else {
            if (!repo.readme) {
                repo.readme = repo.meta.replace('io-package.json', 'README.md');
            }

            // download readme
            const readme = repo.readme
                .replace('github.com', 'raw.githubusercontent.com')
                .replace('/blob/master/', '/master/');

            let links = [];

            if (repo.docs && repo.docs[lang]) {
                if (repo.docs[lang] instanceof Array) {
                    links = repo.docs[lang].map(link => readme.replace('/README.md', '/' + link));
                } else {
                    links.push(readme.replace('/README.md', '/' + repo.docs[lang]));
                }
            } else {
                links.push(readme);
            }

            const promises = links.map(link =>
                getUrl(link).then(body =>
                    {return {body, downloaded: true, link}}));

            return Promise.all(promises)
                .then(results => {
                    let relative = results[0].link.split('/');
                    relative.pop();
                    relative = relative.join('/') + '/';
                    results.forEach(item => item.relative = relative);
                    results[0].link = relative + 'README.md';

                    /*const {body, header} = utils.extractHeader(main.body);
                    repo.docs[lang].shift();
                    repo.docs[lang].forEach((file, i) => {
                        repo.docs[lang][i] = consts.LANGUAGES[0] + '/adapterref/iobroker.' + adapter + '/' + file;
                        utils.writeSafe(consts.FRONT_END_DIR + consts.LANGUAGES[0] + '/adapterref/iobroker.' + adapter + '/' + file, results[i]);
                    });
                    header.chapters = repo.docs[lang].join(', ');*/

                    // store all other files
                    resolve(results);
                });
        }
    });
}

function processAdapterLang(adapter, repo, lang, content) {
    const dirName = ADAPTERS_DIR.replace('/LANG/', '/' + lang + '/') + 'iobroker.' + adapter;

    let iconName = repo.extIcon && repo.extIcon.split('/').pop();

    // download logo
    return getIcon(repo.extIcon, consts.FRONT_END_DIR + consts.LANGUAGES[0] + '/adapterref/iobroker.' + adapter + '/' + iconName)
        .then(icon => {
            if (icon) {
                utils.writeSafe(consts.FRONT_END_DIR + lang + '/adapterref/iobroker.' + adapter + '/' + iconName, icon);
            } else if (adapter !== 'js-controller') {
                console.error('ADAPTER has no icon: ' + adapter);
            }

            content.pages[repo.type] = content.pages[repo.type] || {title: ADAPTER_TYPES[repo.type] || {en: repo.type}, pages: {}};

            content.pages[repo.type].pages[adapter] = {
                title: {en: adapter},
                content: 'adapterref/iobroker.' + adapter + '/README.md'
            };

            if (iconName) {
                content.pages[repo.type].pages[adapter].icon = 'adapterref/iobroker.' + adapter + '/' + iconName;
            }

            getReadme(lang, dirName, repo, adapter)
                .then(results => {
                    if (results.length > 1) {
                        const chapters = {pages: {}};
                        results.forEach((item, i) => {
                            if (!i) return;
                            const name = lang + '/adapterref/iobroker.' + adapter + '/' + item.link.replace(item.relative, '');
                            const title = utils.getTitle(item.body);
                            chapters.pages[name] = {title: {[lang]: title}, content: name};
                        });
                        const {body, header} = utils.extractHeader(results[0].body);
                        header.chapters = JSON.stringify(chapters);
                        results[0].body = utils.addHeader(body, header);
                    }

                    return Promise.all(results.map(result =>
                        prepareAdapterReadme(lang, repo, result)
                            .then(result =>
                                utils.writeSafe(consts.FRONT_END_DIR + lang + '/adapterref/iobroker.' + adapter + '/' + result.name, result.body))))
                });
        });
}

function processAdapter(adapter, repo, content) {
    // Check if the documentation exists
    const promises = consts.LANGUAGES.map(lang => processAdapterLang(adapter, repo, lang, content));

    return Promise.all(promises);
}


function buildAdapterContent() {
    return new Promise(resolve => {
        const content = {pages: {}};
        // get latest repo
        request('http://iobroker.live/sources-dist-latest.json', (err, state, body) => {
            const repo = JSON.parse(body);
            const promises = Object.keys(repo).filter(a => a !== 'js-controller' && a === 'admin').map(adapter =>
                processAdapter(adapter, repo[adapter], content));

            utils.queuePromises(promises, () => {
                fs.writeFileSync(consts.FRONT_END_DIR + 'adapters.json', JSON.stringify(content, null, 2));
                resolve(content);
            })
        });
    });
}

/*buildAdapterContent().then(content => {
    console.log(JSON.stringify(content));
});
*/

module.exports = {
    buildAdapterContent
};