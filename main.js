const ContainerFormat = ["mp4", "avi", "webm"]
const VideoCodec = ["copy", "libx264", "utvideo", "libvpx", "libvpx-vp9", "libaom-av1"]
const AudioCodec = ["copy", "aac", "libmp3lame", "pcm_s16le", "vorbis", "opus"]


window.onload = function () {
    addEvent();
    setOption();
}

// イベント登録
function addEvent() {
    const inputButton = document.getElementById("inputButton");
    inputButton.addEventListener("change", inputFilenames, false);

    const generateButton = document.getElementById("generateButton");
    generateButton.addEventListener("click", generateCommand, false);

    const containerSelect = document.getElementById("container");
    containerSelect.addEventListener("change", setOutFileNames, false);

    const copyCommandButton = document.getElementById("copyCommandButton");
    copyCommandButton.addEventListener("click", copyClipboard, false);
}

// selectにoptionを追加
function setOption() {
    const container = document.getElementById("container");
    for (let i = 0; i < ContainerFormat.length; i++) {
        const co = document.createElement("option");        // container option
        co.setAttribute("value", ContainerFormat[i]);
        co.innerHTML = ContainerFormat[i];
        container.appendChild(co);
    }

    const vcodec = document.getElementById("vcodec");
    for (let i = 0; i < VideoCodec.length; i++) {
        const vo = document.createElement("option");        // videocodec option
        vo.setAttribute("value", VideoCodec[i]);
        vo.innerHTML = VideoCodec[i];
        vcodec.appendChild(vo);
    }

    const acodec = document.getElementById("acodec");
    for (let i = 0; i < AudioCodec.length; i++) {
        const ao = document.createElement("option");        // audiocodec option
        ao.setAttribute("value", AudioCodec[i]);
        ao.innerHTML = AudioCodec[i];
        acodec.appendChild(ao);
    }
}

// ファイル入力
function inputFilenames() {
    const fileList = this.files;
    const fileTable = document.getElementById("fileTable");

    // 前に入力したファイルを削除
    const tdrows = fileTable.rows.length - 1;
    for (let i = 0; i < tdrows; i++) {
        fileTable.deleteRow(-1);
    }

    // 入力ファイルと出力ファイルを表示
    for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
        const file = fileList[i];
        const row = fileTable.insertRow(-1);
        row.setAttribute("class", "inputFiles");
        const inCell = row.insertCell(0);
        const outCell = row.insertCell(1);
        const inFile = document.createElement("input");
        const outFile = document.createElement("input");
        inFile.setAttribute("class", "inFileName");
        outFile.setAttribute("class", "outFileName");
        inFile.value = file.name;
        outFile.value = file.name;

        // 気合でファイル名の末尾に"-out"をつける
        // やってること
        // 1. ピリオドで分割、最後の文字列が拡張子、それを取得
        // 2. 拡張子の文字数+1を末尾から消す
        // 3. "-out"をつけて、拡張子をまたつける
        // 後の処理で消したいときがあるので、最後に拡張子をまたつけている
        // slice(0, -0) を回避したいため
        const extentionStr = getLast(outFile.value.split("."));
        const removeExtentionName = outFile.value.slice(0, -(extentionStr.length + 1));
        outFile.value = removeExtentionName + "-out." + extentionStr;

        inCell.appendChild(inFile);
        outCell.appendChild(outFile);
    }
    setOutFileNames();
}

// コンテナが変更されたときに出力ファイル名を変更
function setOutFileNames() {
    const outFileNames = document.getElementsByClassName("outFileName");
    const container = document.getElementById("container");
    for (let i = 0; i < outFileNames.length; i++) {
        const extentionLen = getLast(outFileNames[i].value.split(".")).length;
        const removeExtentionName = outFileNames[i].value.slice(0, -extentionLen);
        outFileNames[i].value = removeExtentionName + container.value;
    }
}

// コマンド生成
function generateCommand() {
    const outCommandArea = document.getElementById("outCommandArea");
    outCommandArea.value = "";

    const len = document.getElementsByClassName("inputFiles").length;
    const inFileNames = document.getElementsByClassName("inFileName");
    const outFileNames = document.getElementsByClassName("outFileName");
    const framerate = document.getElementById("framerate").value;
    const isCfr = document.getElementById("iscfr").checked;
    const vcodec = document.getElementById("vcodec").value;
    const acodec = document.getElementById("acodec").value;
    const addtionalOption = document.getElementById("addtionalOption").value;

    for (let i = 0; i < len; i++) {
        // 入力ファイル名
        outCommandArea.value += "ffmpeg -i ";
        outCommandArea.value += '"' + inFileNames[i].value + '" ';

        // フレームレート
        outCommandArea.value += "-r " + String(framerate) + " ";

        // 固定フレームレート化
        if (isCfr) {
            outCommandArea.value += "-vsync cfr -af aresample=async=1 ";
        }

        // 動画コーデック
        outCommandArea.value += "-vcodec " + vcodec + " ";

        // 音声コーデック
        outCommandArea.value += "-acodec " + acodec + " ";

        // 任意オプション
        outCommandArea.value += addtionalOption + " ";

        // 出力ファイル名
        outCommandArea.value += '"' + outFileNames[i].value + '" ';

        // コマンド連結
        outCommandArea.value += "& ";
    }

    // 何もしない処理
    outCommandArea.value += "rem";
}

function copyClipboard() {
    const commands = document.getElementById("outCommandArea");
    commands.select();
    document.execCommand("Copy");
}

function getLast(array){
    return array[array.length - 1];
}
