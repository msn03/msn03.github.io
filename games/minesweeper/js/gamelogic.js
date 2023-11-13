var winSound = document.getElementById("soundWin"); 
var gameOverSound = document.getElementById("soundBoom"); 

function playWinSound() { 
    winSound.play(); 
}
function playGameOverSound() { 
    gameOverSound.play(); 
}

var testMode = false; //Turn this variable to true to see where the ss are

var grid = document.getElementById("grid");
var firstClick = true;
var gameEnded = false;
var lives = 3;
var seconds = 0;
var mines = 0;
var appendSeconds = document.getElementById("seconds")
var appendMines = document.getElementById("mines")
var appendLives = document.getElementById("lives")
var Interval; 

var gridWidth;
var gridHeight;
var minesToPlant;

generateGrid();

function generateGrid() {
    getDifficulty();
    var comboLives = document.getElementById("livesSelect");
    lives = comboLives.options[comboLives.selectedIndex].text;
    grid.innerHTML="";
    grid.className="";
    firstClick = true;
    gameEnded = false;
    mines = "000";
    seconds = "000";
    clearInterval(Interval);
    appendLives.innerHTML = lives;
    appendSeconds.innerHTML = seconds;

    for (var i=0; i<gridHeight; i++) {
        row = grid.insertRow(i);
        for (var j=0; j<gridWidth; j++) {
            cell = row.insertCell(j);

            cell.onclick = function() 
            { 
                clickCell(this); 
            };
            cell.oncontextmenu = function ()
            {
                addFlag(this);
                return false;     // cancel default menu
            };

            var mine = document.createAttribute("data-mine");
            var flag = document.createAttribute("data-flag");
            var open = document.createAttribute("data-open");         
            mine.value = "false";
            flag.value = "false";
            open.value = "false";                 
            cell.setAttributeNode(mine);
            cell.setAttributeNode(flag);
            cell.setAttributeNode(open);
        }
    }
    addMines();
}

function addMines() {
    //Add mines randomly
    var i=0;
    while (i<minesToPlant) {
        var row = Math.floor(Math.random() * gridHeight);
        var col = Math.floor(Math.random() * gridWidth);
        var cell = grid.rows[row].cells[col];
        if (cell.getAttribute("data-mine")=="false")
        {
            cell.setAttribute("data-mine","true");
            i++;
            mines++;
        }
        if (testMode) cell.innerHTML="X";
    }
countMines(mines);
}

function replaceMine(mineCell) {
    //Replace mine if it's first click
    firstClick=false;
    var n=0;
    var m=0;

    var minesToReplace=0;
    var cellRow = mineCell.parentNode.rowIndex;
    var cellCol = mineCell.cellIndex;

    for (var i=Math.max(cellRow-1,0); i<=Math.min(cellRow+1,gridHeight-1); i++) 
    {
        for(var j=Math.max(cellCol-1,0); j<=Math.min(cellCol+1,gridWidth-1); j++) 
        {
            if (grid.rows[i].cells[j].getAttribute("data-mine")=="true") minesToReplace++;
        }
    }
    if(minesToReplace>0)
    {
        // alert(minesToReplace+" mines to replace; m="+m);
        for (var i=Math.max(cellRow-1,0); i<=Math.min(cellRow+1,gridHeight-1); i++) 
        {
            for(var j=Math.max(cellCol-1,0); j<=Math.min(cellCol+1,gridWidth-1); j++) 
            {
                grid.rows[i].cells[j].setAttribute("data-mine","true");
            }
        }
        while (m<minesToReplace) 
        {
            // alert("m="+m);
            var row = Math.floor(Math.random() * gridHeight);
            var col = Math.floor(Math.random() * gridWidth);
            var cell = grid.rows[row].cells[col];
            if (cell.getAttribute("data-mine")=="false")
            {
                cell.setAttribute("data-mine","true");
                m++;
            }
        }
    }

    if (minesToReplace>0) 
    { 
        //Reveal all adjacent cells as they do not have a mine
        for (var i=Math.max(cellRow-1,0); i<=Math.min(cellRow+1,gridHeight-1); i++) 
        {
            for(var j=Math.max(cellCol-1,0); j<=Math.min(cellCol+1,gridWidth-1); j++) 
            {
                grid.rows[i].cells[j].setAttribute("data-mine","false");
            }
        }
        for (var i=Math.max(cellRow-1,0); i<=Math.min(cellRow+1,gridHeight-1); i++) 
        {
            for(var j=Math.max(cellCol-1,0); j<=Math.min(cellCol+1,gridWidth-1); j++) 
            {
                clickCell(grid.rows[i].cells[j]);
            }
        }
    }
    mineCell.setAttribute("data-mine","false");
}

function checkLevelCompletion() {
    var levelComplete = true;
    for (var i=0; i<gridHeight; i++) {
        for(var j=0; j<gridWidth; j++) {
            if ((grid.rows[i].cells[j].getAttribute("data-mine")=="false") && (grid.rows[i].cells[j].innerHTML=="")) levelComplete=false;
        }
    }
    if (levelComplete && gameEnded==false) {
        gameEnded=true;
        mines=0;
        countMines(mines);
        revealMines(1);
        //alert("You Win! Time spent: "+seconds);
        winNotification();
    }
}

function revealMines(x) {
    clearInterval(Interval);
    gameEnded=true;
    //Highlight all mines in red
    for (var i=0; i<gridHeight; i++) {
        for(var j=0; j<gridWidth; j++) {
            var cell = grid.rows[i].cells[j];
            if (cell.getAttribute("data-mine")=="true") 
            {
                if (x==1)
                {
                    playWinSound();
                    if (cell.getAttribute("data-open")!="true") {
                        cell.className="mine-win";
                    }
                }
                else
                {
                    playGameOverSound();
                    if (cell.getAttribute("data-open")!="true") {
                        cell.className="mine-lose";
                    }
                    grid.className="gameOver";
                }
                if (cell.getAttribute("data-flag")!="true") {
                    cell.innerHTML="<i class='fa-solid fa-land-mine-on fa-xs'></i>";
                }
            }
        }
    }
}

function addFlag(cell) {
    if (gameEnded==false) {
        if (cell.getAttribute("data-open")=="false")
        {
            if (cell.getAttribute("data-flag")=="false")
            {
                if (mines>0)
                {
                    cell.setAttribute("data-flag","true");
                    cell.innerHTML="<i class='fa-solid fa-flag fa-xs'></i>";
                    mines--;
                    countMines(mines);
                }
            }
            else if (cell.getAttribute("data-flag")=="true")
            {
                cell.setAttribute("data-flag","false");
                cell.innerHTML=" ";
                mines++;
                countMines(mines);
            }
        }
    }
}

function chord(cell) {
    var flagCount=0;
    var cellRow = cell.parentNode.rowIndex;
    var cellCol = cell.cellIndex;
    for (var i=Math.max(cellRow-1,0); i<=Math.min(cellRow+1,gridHeight-1); i++) 
    {
        for(var j=Math.max(cellCol-1,0); j<=Math.min(cellCol+1,gridWidth-1); j++) 
        {
            if (grid.rows[i].cells[j].getAttribute("data-flag")=="true") flagCount++;
        }
    }
    if(flagCount==cell.innerHTML) {
        //alert(flagCount+" flags found around, " + cell.innerHTML+" mines found around. chord will be performed");
        for (var i=Math.max(cellRow-1,0); i<=Math.min(cellRow+1,gridHeight-1); i++) 
        {
            for (var i=Math.max(cellRow-1,0); i<=Math.min(cellRow+1,gridHeight-1); i++) 
                    {
                        for(var j=Math.max(cellCol-1,0); j<=Math.min(cellCol+1,gridWidth-1); j++) 
                        {
                        //Recursive Call
                        if(grid.rows[i].cells[j].getAttribute("data-open")=="false")
                        clickCell(grid.rows[i].cells[j]);
                        }
                    } 
        }
    }
    else{}
        //alert(flagCount+" flags found around, " + cell.innerHTML+" mines found around. chord cannot be performed");
    

}

function clickCell(cell) 
{
    //check if the game is NOT ended
    if (gameEnded==false) 
    {
        //check if cell DOESN'T have a flag
        if (cell.getAttribute("data-flag")=="false") 
        {
            //call first click function
            if (firstClick==true)
            {
                replaceMine(cell);
                clearInterval(Interval);
                Interval = setInterval(startTimer, 1000);
            }
            //check if cell HAVE a mine
            if (cell.getAttribute("data-mine")=="true") 
            {
                lives--;
                appendLives.innerHTML = lives;

                if(lives>0){
                    playGameOverSound();
                    cell.className="mine-triggered";
                    cell.setAttribute("data-open","true");
                    cell.setAttribute("data-flag","true");
                    cell.innerHTML="<i class='fa-solid fa-land-mine-on fa-xs'></i>";
                }
                else {
                    revealMines(0);
                    cell.className="mine-triggered";
                    loseNotification();
                    //alert("Game Over");
                }
                
            } 
            //check if cell is NOT opened yet
            else if (cell.getAttribute("data-open")=="false")
            {
                cell.setAttribute("data-open","true");
                cell.className="clicked";
                //Count and display the number of adjacent mines
                var mineCount=0;
                var cellRow = cell.parentNode.rowIndex;
                var cellCol = cell.cellIndex;
                //alert(cellRow + " " + cellCol);
                for (var i=Math.max(cellRow-1,0); i<=Math.min(cellRow+1,gridHeight-1); i++) 
                {
                    for(var j=Math.max(cellCol-1,0); j<=Math.min(cellCol+1,gridWidth-1); j++) 
                    {
                        if (grid.rows[i].cells[j].getAttribute("data-mine")=="true") mineCount++;
                    }
                }
                cell.innerHTML=mineCount;
                if (mineCount==0) 
                { 
                    //Reveal all adjacent cells as they do not have a mine
                    for (var i=Math.max(cellRow-1,0); i<=Math.min(cellRow+1,gridHeight-1); i++) 
                    {
                        for(var j=Math.max(cellCol-1,0); j<=Math.min(cellCol+1,gridWidth-1); j++) 
                        {
                        //Recursive Call
                        if (grid.rows[i].cells[j].innerHTML=="") clickCell(grid.rows[i].cells[j]);
                        }
                    } 
                }
            }
            else if (cell.getAttribute("data-open")=="true" && cell.innerHTML!=' ' && firstClick==false)
            {
                chord(cell);
            }
            setMineNumber(cell, mineCount);
            checkLevelCompletion();
        }
    }
}

function setMineNumber(cell, mineCount) {
    switch (mineCount) {
        case 0: cell.innerHTML=" ";           break;
        case 1: cell.style.color = '#3399ff'; break;
        case 2: cell.style.color = '#66ff99'; break;
        case 3: cell.style.color = '#ff6666'; break;
        case 4: cell.style.color = '#0033cc'; break;
        case 5: cell.style.color = '#cc0066'; break;
        case 6: cell.style.color = '#33cccc'; break;
        case 7: cell.style.color = '#cccccc'; break;
        case 8: cell.style.color = '#cc33ff'; break;
        }
}

function displayCustomPar(i) {
    var x = document.getElementById("customParameters");
    if (i === 1) 
    {
        x.style.display = "block";
    } else 
    {
        x.style.display = "none";
    }
}

function getDifficulty() {
    var difficulty = document.getElementsByName('difficulty');
    if (difficulty[0].checked)
    {
        gridWidth=9;
        gridHeight=9;
        minesToPlant=10;
    }
    if (difficulty[1].checked)
    {
        gridWidth=16;
        gridHeight=16;
        minesToPlant=40;
    }
    if (difficulty[2].checked)
    {
        gridWidth=30;
        gridHeight=16;
        minesToPlant=99;
    }
    if (difficulty[3].checked)
    {
        gridWidth=document.getElementById("gWidth").value;
        gridHeight=document.getElementById("gHeight").value;
        minesToPlant=document.getElementById("gMines").value;
        if (gridWidth<8) 
        {
            gridWidth=8;
            document.getElementById("gWidth").value=8;
        }
        if (gridWidth>40) 
        {
            gridWidth=40;
            document.getElementById("gWidth").value=40;
        }
        if (gridHeight<8) 
        {
            gridHeight=8;
            document.getElementById("gHeight").value=8;
        }
        if (gridHeight>40) 
        {
            gridHeight=40;
            document.getElementById("gHeight").value=40;
        }
        if (minesToPlant<10) 
        {
            minesToPlant=10;
            document.getElementById("gMines").value=10;
        }
        var ratio=minesToPlant/(gridWidth*gridHeight);
        if(ratio>0.7)
        {
            minesToPlant=Math.floor(gridWidth*gridHeight*0.7);
            document.getElementById("gMines").value=Math.floor(gridWidth*gridHeight*0.7);
            alert("Too many mines! Number of mines will be reduced to max. possible for this area - "+Math.floor(gridWidth*gridHeight*0.7));
        }
    }
}

function syncRadio(index)
{
    switch (index)
    {
        case 0: document.getElementById("easy").checked = true;   break;
        case 1: document.getElementById("medium").checked = true; break;
        case 2: document.getElementById("hard").checked = true;   break;
        case 3: document.getElementById("custom").checked = true; break;
    }
}
function syncSelect(id)
{
    switch (id)
    {
        case "Easy":    document.getElementById("difficultySelect").selectedIndex = 0;  break;
        case "Medium":  document.getElementById("difficultySelect").selectedIndex = 1;  break;
        case "Hard":    document.getElementById("difficultySelect").selectedIndex = 2;  break;
        case "Custom":  document.getElementById("difficultySelect").selectedIndex = 3;  break;
    }
}

function startTimer () 
{
    seconds++; 
    if (seconds<1000) 
    {
        if(seconds==0)
        {
            appendSeconds.innerHTML = "000";
        } else if(seconds<10)
        {
            appendSeconds.innerHTML = "00"+seconds;
        } else if(seconds<100)
        {
            appendSeconds.innerHTML = "0"+seconds;
        } else 
        {
            appendSeconds.innerHTML = seconds;
        }
    }
}

function countMines(mines) 
{
    if (mines<1000) 
    {
        if(mines==0)
        {
            appendMines.innerHTML = "000";
        } else if(mines<10)
        {
            appendMines.innerHTML = "00"+mines;
        } 
        else if(mines<100)
        {
            appendMines.innerHTML = "0"+mines;
        } 
        else 
        {
            appendMines.innerHTML = mines;
        }
    }
}

function difficultyNotification() 
{
    // Get the snackbar DIV
    var x = document.getElementById("msgDifficulty");
    // Add the "show" class to DIV
    x.className = x.className+" show";
    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}
function winNotification() 
{
    // Get the snackbar DIV
    var y = document.getElementById("msgWin");
    document.getElementById("timeSpent").innerHTML =seconds;
    // Add the "show" class to DIV
    y.className = y.className+" show win";
    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ y.className = y.className.replace("show", ""); }, 3000);
}
function loseNotification() 
{
    // Get the snackbar DIV
    var z = document.getElementById("msgLose");
    // Add the "show" class to DIV
    z.className = z.className+" show lose";
    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ z.className = z.className.replace("show", ""); }, 3000);
}
