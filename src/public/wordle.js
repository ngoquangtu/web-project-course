    // const myPoint = require('../public/data/point.js');
    // const Data = require('../public/data/data.js');
    // const User = require('../public/userDTB.js');
    // const AudioManager = require('../public/sound/audioManager.js');

    import myPoint from '../data/point.js';
    import Data from '../data/data.js';
    // import User from '../public/userDTB.js';
    import AudioManager from '../sound/audioManager.js';

const dataInstance = new Data();
const myPointInstance=new myPoint();
const winSound=new AudioManager('../sound/Bonus.wav');
const loseSound= new AudioManager('../sound/GameOver.wav');

const state = {
    secretWord: '',
    meaningWords:'',
    grid: Array(6).fill().map(() => Array(5).fill('')),
    currentRow: 0,
    currentCol: 0,
    isWinner:false,
    isOver:false,
};
let gameEnded = false;
/// vẽ 1 lưới grid 
function drawGrid(container) {
    const grid = document.createElement('div');
    grid.className = 'grid';
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            drawBox(grid, i, j);
        }
    }
    container.appendChild(grid);
}
// cập nhật Grid liên tục 
function updateGrid() {
    for (let i = 0; i < state.grid.length; i++) {
        for (let j = 0; j < state.grid[i].length; j++) {
            const box = document.getElementById(`box${i}${j}`);
            box.textContent = state.grid[i][j];
        }
    }
}
// vẽ các hộp chứa chữ
function drawBox(container, row, col, letter = '') {
    const box = document.createElement('div');
    box.className = 'box';
    box.id = `box${row}${col}`;
    box.textContent = letter;
    container.appendChild(box);
    return box;
}

// hàm lấy sự kiện từ bàn phím
function keyboardEvent() {
    document.body.onkeydown = (e) => {
        const key = e.key;
        if (gameEnded) return;
        if (key === 'Enter') {
            if (state.currentCol === 5) {
                const word = getCurrentWord();
                if (isWordValid(word)) {
                    // Change color of the word
                    changeColorWord(word);
                    // Move to the next row
                    state.currentRow++;
                    state.currentCol = 0;
                } else {
                    const textValid = document.getElementById("textValid");
                    textValid.textContent = 'Từ không hợp lệ, vui lòng thử lại!';
                }
            }
        }
        if (key === 'Backspace') {
            removeLetter();
        }
        if (isLetter(key)) {
            addLetter(key);
        }
        updateGrid();
    };
}

// lấy chữ cái hiện tại 
function getCurrentWord() {
    return state.grid[state.currentRow].join(''); //Join characters in the row into a single word
}
// kiểm tra xem nếu là chữ cái thì thêm,là số thì không
function isLetter(key) {
    return key.length === 1 && key.match(/[a-z]/i);
}
// kiểm tra xem từ vừa nhập có trong bộ từ điển không ?

function isWordValid(word) {
    return dataInstance.validWords.includes(word);
}

// đổi màu chữ, có thêm phần hiệu ứng 
function changeColorWord(guess) {
    const row = state.currentRow;
    const animation_duration = 500;
    for (let i = 0; i < 5; i++) {
        const box = document.getElementById(`box${row}${i}`);
        const letter = box.textContent; 
        const numOfOccurrencesSecret = getNumOfOccurrencesInWord(
            state.secretWord,
            letter
          );
          const numOfOccurrencesGuess = getNumOfOccurrencesInWord(guess, letter);
          const letterPosition = getPositionOfOccurrence(guess, letter, i);
        setTimeout(()=>{
            if(numOfOccurrencesGuess>numOfOccurrencesSecret &&
                letterPosition > numOfOccurrencesSecret)
                {
                    box.classList.add('empty');
                }
            else {
                    if (letter === state.secretWord[i]) {
                      box.classList.add('right');
                    } else if (state.secretWord.includes(letter)) {
                      box.classList.add('wrong');
                    } else {
                      box.classList.add('empty');
                    }
                  }
                }, ((i + 1) * animation_duration) / 2);
            
                box.classList.add('animated');
                box.style.animationDelay = `${(i * animation_duration) / 2}ms`;
        }
     state.isWinner = state.secretWord === guess;
     state.isOver = state.currentRow === 5 && !state.isWinner;
    
    if (state.isWinner) {
        alert('Bạn đã chiến thắng!');
        winSound.playSound();
        textValid.textContent=state.meaningWords;
        showNewGameButton();
        myPointInstance.addPoint();
        myPointInstance.loadPoint();

        gameEnded=true;
    }
    if (state.isOver) {
        showNewGameButton();
        loseSound.playSound();
        myPointInstance.loadPoint();
        myPointInstance.setPoint(0);
        alert('Bạn đã thua!');
    }
}
function removeLetter() {
    if (state.currentCol === 0) return;
    state.grid[state.currentRow][state.currentCol - 1] = '';
    state.currentCol--;
}

function addLetter(key) {
    if (state.currentCol === 5 ) return;
    state.grid[state.currentRow][state.currentCol] = key;
    state.currentCol++;
}

function getPositionOfOccurrence(word, letter, position) {
    let result = 0;
    for (let i = 0; i <= position; i++) {
      if (word[i] === letter) {
        result++;
      }
    }
    return result;
  }
  function getNumOfOccurrencesInWord(word, letter) {
    let result = 0;
    for (let i = 0; i < word.length; i++) {
      if (word[i] === letter) {
        result++;
      }
    }
    return result;
  }

  function NewGame() {
    gameEnded=false;
    textValid.textContent= ' ';
    state.isWinner=false;
    state.isOver=false;
    const NewGameBtn = document.getElementById("NewGameBtn");
    NewGameBtn.style.display = "none"; // Ẩn nút New Game
    dataInstance.loadData().then(() => {
        let randomIndex=Math.floor(Math.random() * dataInstance.solutions.length);
        state.secretWord = dataInstance.solutions[randomIndex];
        state.meaningWords=dataInstance.meaningWords[randomIndex];
        console.log("Từ được đoán: ", state.secretWord); 
      });
    // Đặt lại trạng thái của bảng
    state.secretWord = '';
    state.currentRow = 0;
    state.currentCol = 0;
    state.grid = Array(6).fill().map(() => Array(5).fill(''));

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < state.grid[i].length; j++) {
            const box = document.getElementById(`box${i}${j}`);
            box.textContent = "";
            box.classList.remove('right', 'wrong', 'empty', 'animated');
            box.classList.add('default');
        }
    }
  }
  function showNewGameButton() {
    const NewGameBtn = document.getElementById("NewGameBtn");
    NewGameBtn.style.display = "block"; 
}

function startgame() {
    const game = document.getElementById("game");
    const btn = document.getElementById("submit");
    dataInstance.loadData().then(() => {
        let randomIndex = Math.floor(Math.random() * dataInstance.solutions.length);

        state.secretWord = dataInstance.solutions[randomIndex];
        state.meaningWords=dataInstance.meaningWords[randomIndex];
        console.log("Từ được đoán: ", state.secretWord); 
      });
    myPointInstance.setPoint(0); 
    
    const NewGameBtn=document.getElementById("NewGameBtn");
    NewGameBtn.addEventListener("click", NewGame);
    drawGrid(game);
    keyboardEvent();
}
startgame();