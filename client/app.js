// super simple spa; pick files and time slices
// aint got no time to dl libs
const host = 'http://localhost:27015';

const session = {};

const highlightConfig = {
    root: null,
    output: null,
    cuts: []
};

const ajax = (method, url, body, done) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = () => done(xhr.status, xhr.responseText);
    xhr.send(body);
};

const getFilesForDir = (dir, done) => {
    ajax('GET', `${host}?root=${encodeURIComponent(dir)}`, null, (status, res) => {
        if (status !== 200) return done(`Non 200 response ${status}, ${res}`);
        return done(null, JSON.parse(res));
    });
};

const makeHighlight = (done) => {
    ajax('POST', host, JSON.stringify(highlightConfig), (status, res) => {
        if (status !== 204) return alert(`something fucked up: ${res}`);
        alert('done');
    });
};

const renderTimeline = () => {
    const timelineDiv = document.getElementById('timeline');
    if (highlightConfig.cuts.length === 0) return timelineDiv.innerHTML = 'No slices.';

    timelineDiv.innerHTML = highlightConfig.cuts.map((cut, i) => `
        <div id="cut-${i}">
            <a href="javscript://" onclick="removeCut(${i})" style="margin-right: 20px; color: #f00">X</a>
            ${cut.start} to ${cut.end} -- ${cut.file}
        </div>
    `).join('');
};

const toggleShowAddFile = i => {
    const ele = document.getElementById(`add-file-${i}`);
    ele.style.display = ele.style.display === 'block' ? 'none' : 'block';
};

const addCut = i => {
    const start = document.getElementById(`add-file-${i}-start`).value;
    const end = document.getElementById(`add-file-${i}-end`).value;
    const file = session.files[i];

    highlightConfig.cuts.push({file, start, end});

    renderTimeline();
    toggleShowAddFile(i);
};

const removeCut = i => {
    highlightConfig.cuts.splice(i, 1);
    renderTimeline();
};

const autoOutput = () => {
    const dir = document.getElementById('root-path-input').value + '/highlight-output.mp4';
    document.getElementById('output-path-input').value = dir;
    setOutput();
};

const setOutput = () => {
    highlightConfig.output = document.getElementById('output-path-input').value;
};

const init = () => {
    const dir = document.getElementById('root-path-input').value;
    highlightConfig.root = dir;

    getFilesForDir(dir, (err, files) => {
        session.files = files;

        const filesDiv = document.getElementById('available-files');
        filesDiv.innerHTML = files.map((file, i) => `
            <div id="list-file-${i}" class="list-file">
                <span onclick="toggleShowAddFile(${i})">${file}</span>
                <div id="add-file-${i}" class="add-file" style="display:none" onclick="(e => e.stopPropagation())(event)">
                    From <input id="add-file-${i}-start" size="4" type="text" value="00:00:00" /> to <input id="add-file-${i}-end" size="4" type="text" value="00:00:00" />
                    <a href="javascript://" onclick="addCut(${i})">Add >></a>
                </div>
            </div>
        `).join('');
    });
};
