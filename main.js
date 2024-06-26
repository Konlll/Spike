const generateButton = document.querySelector("#generate");
const events = document.querySelector("#events");
const placeCharacterButton = document.querySelector("#place-character");
const startButton = document.querySelector("#start");
const table = document.querySelector("#table");
const deathsUl = document.querySelector("#deaths");
let numberOfCharacters = 0;
let tableRows = 0;
let tableCols = 0;
let characters = [];
let whiteBackList = {};

const removeDuplicates = (array) => {
  const uniqueObjects = {};
  const uniqueArray = [];

  array?.forEach(obj => {
      const objKey = JSON.stringify(obj);
      if (!uniqueObjects[objKey]) {
          uniqueObjects[objKey] = true;
          uniqueArray.push(obj);
      }
  });

  return uniqueArray;
}

const collectNeighborhoodCells = (currentRow, currentCol) => {
  let cells = [];
  cells.push(
    document.querySelector(`#row-${currentRow - 1}-col-${currentCol}`)
  );
  cells.push(
    document.querySelector(`#row-${parseInt(currentRow) + 1}-col-${currentCol}`)
  );
  cells.push(
    document.querySelector(`#row-${currentRow}-col-${parseInt(currentCol) + 1}`)
  );
  cells.push(
    document.querySelector(`#row-${currentRow}-col-${currentCol - 1}`)
  );
  cells.push(
    document.querySelector(
      `#row-${parseInt(currentRow) + 1}-col-${currentCol - 1}`
    )
  );
  cells.push(
    document.querySelector(
      `#row-${currentRow - 1}-col-${parseInt(currentCol) + 1}`
    )
  );
  cells.push(
    document.querySelector(
      `#row-${parseInt(currentRow) + 1}-col-${parseInt(currentCol) + 1}`
    )
  );
  cells.push(
    document.querySelector(`#row-${currentRow - 1}-col-${currentCol - 1}`)
  );

  return cells;
};

const addToWhiteBlackList = (cell, type) => {
  const cellRow = cell.getAttribute("data-row");
  const cellCol = cell.getAttribute("data-col");

  let cells = collectNeighborhoodCells(cellRow, cellCol);

  for (let currentCell in cells) {
    if (cells[currentCell] === null) {
      continue;
    } else if (cells[currentCell].hasChildNodes()) {
      if (cells[currentCell].firstChild.classList.contains("character")) {
        let currentId = cells[currentCell].firstChild.id.slice(10);
        if (!!currentId) {
          whiteBackList[cells[currentCell].firstChild.id.slice(10)].push({
            type,
            className: cell.id,
          });
          whiteBackList[cells[currentCell]] = removeDuplicates(whiteBackList[cells[currentCell]])
        }
      }
    }
  }
};

const collectWhiteBlackList = (cell, currentCharacterId) => {
  const cellRow = cell.getAttribute("data-row");
  const cellCol = cell.getAttribute("data-col");
  let cells = collectNeighborhoodCells(cellRow, cellCol);

  for (let currentCell in cells) {
    if (cells[currentCell] === null) {
      continue;
    } else {
      if(cells[currentCell].hasChildNodes()){
        if(cells[currentCell].firstChild.classList.contains("character")){
          whiteBackList[currentCharacterId].push(...whiteBackList[parseInt(cells[currentCell].firstChild.innerText)])
          whiteBackList[parseInt(cells[currentCell].firstChild.innerText)].push(...whiteBackList[currentCharacterId])
          whiteBackList[parseInt(cells[currentCell].firstChild.innerText)] = removeDuplicates(whiteBackList[parseInt(cells[currentCell].firstChild.innerText)])
          whiteBackList[currentCharacterId] = removeDuplicates(whiteBackList[currentCharacterId])
          // console.log(currentCharacterId + ". bábu blacklist-je a csere után:")
          // console.log(whiteBackList[currentCharacterId])
          // console.log(cells[currentCell].firstChild.innerText + ". bábu blacklist-je a csere után:")
          // console.log(whiteBackList[parseInt(cells[currentCell].firstChild.innerText)])
          // console.log()
        }
      }
    }
  }
};

const getAvaliableCells = (currentRow, currentCol) => {
  let cells = collectNeighborhoodCells(currentRow, currentCol);

  for (let cell in cells) {
    if (cells[cell] === null) {
      cells.splice(cell, 1);
    } else if (!cells[cell].hasChildNodes()) {
      continue;
    } else if (cells[cell].firstChild.classList.contains("character")) {
      cells.splice(cell, 1);
    }
  }

  return cells;
};

const getRandomCell = () => {
  let randomRow = Math.floor(Math.random() * tableRows);
  let randomCol = Math.floor(Math.random() * tableCols);
  let randomCell = document.querySelector(`#row-${randomRow}-col-${randomCol}`);
  while (randomCell.hasChildNodes()) {
    randomRow = Math.floor(Math.random() * tableRows);
    randomCol = Math.floor(Math.random() * tableCols);
    randomCell = document.querySelector(`#row-${randomRow}-col-${randomCol}`);
  }
  return randomCell;
};

const generateTable = () => {
  table.innerHTML = "";
  for (let i = 0; i < tableRows; i++) {
    const row = document.createElement("div");
    row.classList.add("row");
    for (let j = 0; j < tableCols; j++) {
      const col = document.createElement("div");
      col.classList.add("col");
      col.id = `row-${i}-col-${j}`;
      col.setAttribute("data-row", i);
      col.setAttribute("data-col", j);
      row.appendChild(col);
    }
    table.appendChild(row);
  }
};

const placeSpikes = (numberOfSpikes) => {
  for (let i = 0; i < numberOfSpikes; i++) {
    let randomCell = getRandomCell();
    const div = document.createElement("div");
    div.classList.add("spike");
    randomCell.appendChild(div);
  }
};

const start = () => {
  // console.clear()
  if (characters.length === 0) {
    alert("Legalább 1 bábút helyezzen fel!");
    return;
  }

  characters.forEach((character, index) => {
    if (character.state !== "dead") {
      const availableCells = getAvaliableCells(
        character.currentRow,
        character.currentCol
      )
        .filter((cell) => cell !== null)
        .filter((cell) => !cell.firstChild?.classList.contains("character"))
        .filter(
          (cell) =>
            !whiteBackList[character.id].some(
              (listcell) =>
                listcell.type === "spike" && listcell.className === cell.id
            )
        );

      document.querySelector(`#${character.className}`).innerHTML = "";
      if (availableCells.length !== 0) {
        const randomAvailableCell =
          availableCells[Math.floor(Math.random() * availableCells.length)];
        if (randomAvailableCell.hasChildNodes()) {
          if (randomAvailableCell.firstChild.classList.contains("spike")) {
            characters[index].state = "dead";
            const li = document.createElement("li");
            li.innerHTML = `A(z) ${character.id}. bábú meghalt, mert aknába lépett.`;
            deathsUl.appendChild(li);
            addToWhiteBlackList(randomAvailableCell, "spike");
          }
        } else {
          const div = document.createElement("div");
          div.classList.add("character");
          div.id = `character-${character.id}`;
          div.innerText = character.id;
          randomAvailableCell.appendChild(div);
          characters[index] = {
            ...characters[index],
            className: randomAvailableCell.id,
            currentRow: randomAvailableCell.getAttribute("data-row"),
            currentCol: randomAvailableCell.getAttribute("data-col"),
          };
          collectWhiteBlackList(randomAvailableCell, character.id);
          //addToWhiteBlackList(randomAvailableCell, "notSpike");
        }
      } else {
        characters[index].state = "dead";
        const li = document.createElement("li");
        li.innerHTML = `A(z) ${character.id}. bábú meghalt, mert nem tudott hova lépni.`;
        deathsUl.appendChild(li);
      }
    }
  });
};

const showCharacterInfo = (character) => {
  let id = character.id.charAt(character.id.length - 1)
  document.querySelector(".info").classList.add("shown")
  document.querySelector("#character-number").innerText = id
}

generateButton.addEventListener("click", () => {
  events.style.display = "block";
  tableRows = document.querySelector("#table-row").value;
  tableCols = document.querySelector("#table-col").value;
  let numberOfSpikes = Math.round(tableCols * tableRows * 0.1);
  generateTable(tableRows, tableCols);
  placeSpikes(numberOfSpikes);
});

placeCharacterButton.addEventListener("click", () => {
  const randomCell = getRandomCell();
  const div = document.createElement("div");
  div.classList.add("character");
  div.id = `character-${++numberOfCharacters}`;
  div.innerText = numberOfCharacters;
  div.onmouseover = () => showCharacterInfo(div)
  div.onmouseleave = () => document.querySelector(".info").classList.remove("shown")
  randomCell.appendChild(div);
  characters = [
    ...characters,
    {
      id: numberOfCharacters,
      className: randomCell.id,
      currentRow: randomCell.getAttribute("data-row"),
      currentCol: randomCell.getAttribute("data-col"),
      state: "alive",
    },
  ];
  whiteBackList[`${numberOfCharacters}`] = [];
});

startButton.addEventListener("click", () => start());
